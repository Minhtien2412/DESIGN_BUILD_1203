/**
 * OpenClaw Adapter
 * ================
 *
 * Abstraction layer for the OpenClaw semantic analysis engine.
 * OpenClaw runs on localhost:18789 behind PM2 and provides:
 * - Semantic message analysis (intent, sentiment, risk)
 * - Conversation risk scoring
 *
 * Falls back to neutral mock results when OpenClaw is unavailable.
 */

import { HttpService } from "@nestjs/axios";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom, timeout } from "rxjs";

export interface SemanticAnalysisRequest {
  message: string;
  context?: string[];
  locale?: string;
}

export interface SemanticAnalysisResult {
  intent: string;
  sentiment: "positive" | "neutral" | "negative" | "hostile";
  riskFactors: string[];
  confidenceScore: number;
  suggestedLabels: string[];
}

export interface ConversationRiskRequest {
  messages: Array<{ role: string; content: string }>;
  conversationState?: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationRiskResult {
  overallRisk: number;
  riskFactors: string[];
  escalationRecommended: boolean;
  summary: string;
}

@Injectable()
export class OpenClawAdapter implements OnModuleInit {
  private readonly logger = new Logger(OpenClawAdapter.name);
  private baseUrl!: string;
  private token!: string;
  private connected = false;
  private readonly timeoutMs = 5000;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  onModuleInit() {
    this.baseUrl = this.configService.get<string>(
      "OPENCLAW_BASE_URL",
      "http://127.0.0.1:18789",
    );
    this.token = this.configService.get<string>("OPENCLAW_GATEWAY_TOKEN", "");
    this.logger.log(`OpenClaw adapter initialized — baseUrl=${this.baseUrl}`);

    // Probe connectivity on boot (non-blocking)
    this.probeHealth().catch(() => {});
  }

  /**
   * Probe OpenClaw gateway health.
   * Sets internal connected flag and returns status.
   */
  async isReady(): Promise<boolean> {
    return this.probeHealth();
  }

  /**
   * Analyze a single message for semantic intent, sentiment, and risk.
   * Layer 2 of the moderation pipeline — only called when deterministic
   * rules are ambiguous (riskScore between 25-60).
   */
  async analyzeMessage(
    request: SemanticAnalysisRequest,
  ): Promise<SemanticAnalysisResult> {
    if (!this.connected) {
      return this.mockAnalysis(request);
    }

    try {
      const response: { data: SemanticAnalysisResult } = (await firstValueFrom(
        this.httpService
          .post<SemanticAnalysisResult>(
            `${this.baseUrl}/api/v1/analyze/message`,
            request,
            { headers: this.buildHeaders(), timeout: this.timeoutMs },
          )
          .pipe(timeout(this.timeoutMs)),
      )) as any;

      return response.data;
    } catch (error) {
      this.logger.warn(
        `OpenClaw analyzeMessage exception: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return this.mockAnalysis(request);
  }

  /**
   * Analyze full conversation context for risk patterns.
   * Used for escalation decisions and conversation-level trust scoring.
   */
  async analyzeConversationRisk(
    request: ConversationRiskRequest,
  ): Promise<ConversationRiskResult> {
    if (!this.connected) {
      return this.mockConversationRisk(request);
    }

    try {
      const response: { data: ConversationRiskResult } = (await firstValueFrom(
        this.httpService
          .post<ConversationRiskResult>(
            `${this.baseUrl}/api/v1/analyze/conversation-risk`,
            request,
            { headers: this.buildHeaders(), timeout: this.timeoutMs },
          )
          .pipe(timeout(this.timeoutMs)),
      )) as any;

      return response.data;
    } catch (error) {
      this.logger.warn(
        `OpenClaw analyzeConversationRisk exception: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return this.mockConversationRisk(request);
  }

  /**
   * Whether the adapter is connected and ready.
   */
  get isConnected(): boolean {
    return this.connected;
  }

  // ──────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────

  private async probeHealth(): Promise<boolean> {
    try {
      const response: { data: { status: string } } = (await firstValueFrom(
        this.httpService
          .get<{ status: string }>(`${this.baseUrl}/health`, {
            headers: this.buildHeaders(),
            timeout: 3000,
          })
          .pipe(timeout(3000)),
      )) as any;

      this.connected = !!response.data;
      if (this.connected) {
        this.logger.log("OpenClaw gateway connected");
      }
      return this.connected;
    } catch {
      this.connected = false;
      this.logger.debug("OpenClaw gateway not reachable");
      return false;
    }
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private mockAnalysis(
    request: SemanticAnalysisRequest,
  ): SemanticAnalysisResult {
    this.logger.debug(
      `OpenClaw analyzeMessage (fallback) — message length=${request.message.length}`,
    );
    return {
      intent: "general_communication",
      sentiment: "neutral",
      riskFactors: [],
      confidenceScore: 0.5,
      suggestedLabels: [],
    };
  }

  private mockConversationRisk(
    request: ConversationRiskRequest,
  ): ConversationRiskResult {
    this.logger.debug(
      `OpenClaw analyzeConversationRisk (fallback) — ${request.messages.length} messages`,
    );
    return {
      overallRisk: 0,
      riskFactors: [],
      escalationRecommended: false,
      summary: "No semantic risk detected (OpenClaw unavailable)",
    };
  }
}
