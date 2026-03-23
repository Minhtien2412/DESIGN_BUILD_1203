/**
 * Moderation Service
 * ==================
 *
 * Core moderation pipeline for AI Brain (VPS2).
 * 3-layer pipeline:
 * 1. Hard rules / fast path (DetectorService + ConversationStateEvaluator)
 * 2. Semantic analysis via OpenClaw (when ambiguous, riskScore 25-60)
 * 3. Policy aggregation / final decision
 */

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenClawAdapter } from "../openclaw/openclaw.adapter";
import { ConversationStateEvaluator } from "../policy/conversation-state.evaluator";
import { DetectorService } from "./detector.service";
import {
    ModerationAction,
    ModerationDecision,
    ModerationRequest,
    ModerationResponse,
    RuleHit,
    RuleLabel,
    RuleSeverity,
} from "./types";

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private readonly policyVersion: string;

  constructor(
    private readonly detectorService: DetectorService,
    private readonly stateEvaluator: ConversationStateEvaluator,
    private readonly openClawAdapter: OpenClawAdapter,
    private readonly configService: ConfigService,
  ) {
    this.policyVersion = this.configService.get<string>(
      "AI_POLICY_VERSION",
      "ts-v2",
    );
  }

  async moderate(request: ModerationRequest): Promise<ModerationResponse> {
    const start = Date.now();

    // ═══════════════════════════════════════════
    // Layer 1: Hard rules / fast path
    // ═══════════════════════════════════════════

    // 1a. Deterministic detection (regex + heuristics)
    const baseHits = this.detectorService.detect(request);

    // 1b. Flood / spam detection using conversation context
    const floodHits = this.detectorService.detectFlood(request);

    // 1c. Conversation state policy evaluation
    const stateHits = this.stateEvaluator.evaluate(request, baseHits);

    // Aggregate all layer-1 hits
    const allHits = [...baseHits, ...floodHits, ...stateHits];

    // Calculate initial risk score
    let riskScore = Math.min(
      100,
      allHits.reduce((sum, h) => sum + h.riskDelta, 0),
    );
    // Ensure non-negative
    riskScore = Math.max(0, riskScore);

    // ═══════════════════════════════════════════
    // Layer 2: Semantic analysis (OpenClaw)
    // Only when ambiguous (risk 25-60) and OpenClaw is ready
    // ═══════════════════════════════════════════

    if (
      riskScore >= 25 &&
      riskScore <= 60 &&
      this.openClawAdapter.isConnected
    ) {
      try {
        const semanticResult = await this.openClawAdapter.analyzeMessage({
          message: request.message,
          context: request.recentContext?.map((m) => m.content),
          locale: request.metadata?.locale,
        });

        // Incorporate semantic risk factors
        if (semanticResult.sentiment === "hostile") {
          allHits.push({
            ruleId: "SEMANTIC_HOSTILE_SENTIMENT",
            label: RuleLabel.ABUSE_TOXIC,
            severity: RuleSeverity.MEDIUM,
            riskDelta: 20,
            matchedEvidence: `sentiment=${semanticResult.sentiment}`,
            recommendedAction: ModerationAction.QUEUE_HUMAN_REVIEW,
            explanation: "Hostile sentiment detected via semantic analysis",
          });
          riskScore = Math.min(100, riskScore + 20);
        }

        if (semanticResult.sentiment === "negative" && riskScore >= 40) {
          allHits.push({
            ruleId: "SEMANTIC_NEGATIVE_CONTEXT",
            label: RuleLabel.SUSPICIOUS_NEGOTIATION,
            severity: RuleSeverity.LOW,
            riskDelta: 10,
            matchedEvidence: `sentiment=${semanticResult.sentiment}, confidence=${semanticResult.confidenceScore}`,
            recommendedAction: ModerationAction.NONE,
            explanation: "Negative sentiment with elevated risk",
          });
          riskScore = Math.min(100, riskScore + 10);
        }
      } catch (error) {
        this.logger.warn(
          `OpenClaw analysis failed for [${request.traceId}]: ${error instanceof Error ? error.message : String(error)}`,
        );
        // Continue with layer-1 results only
      }
    }

    // ═══════════════════════════════════════════
    // Layer 3: Policy aggregation / final decision
    // ═══════════════════════════════════════════

    const decision = this.decide(riskScore, allHits);
    const action = this.mapAction(decision);

    // Redaction (if applicable)
    const redactedText =
      decision === ModerationDecision.ALLOW_WITH_REDACTION
        ? this.detectorService.redact(request.message, allHits)
        : undefined;

    // Review required?
    const reviewRequired =
      decision === ModerationDecision.ESCALATE_REVIEW ||
      (decision === ModerationDecision.SOFT_BLOCK && riskScore >= 60);

    // Collect unique labels
    const labels = [...new Set(allHits.map((h) => h.label))];

    // Build safe user notice
    const safeUserNotice = this.buildUserNotice(decision, allHits);

    const latencyMs = Date.now() - start;

    this.logger.log(
      `Moderation [${request.traceId}] decision=${decision} risk=${riskScore} ` +
        `labels=[${labels.join(",")}] rules=${allHits.map((h) => h.ruleId).join(",")} ` +
        `state=${request.conversationState ?? "unknown"} role=${request.senderRole ?? "unknown"} ` +
        `latency=${latencyMs}ms`,
    );

    return {
      traceId: request.traceId,
      decision,
      action,
      riskScore,
      labels,
      safeUserNotice,
      normalizedContent: request.message.trim(),
      redactedText,
      reasons: allHits.map((h) => ({
        ruleId: h.ruleId,
        label: h.label,
        severity: h.severity,
        riskDelta: h.riskDelta,
        matchedEvidence: h.matchedEvidence,
        recommendedAction: h.recommendedAction,
        explanation: h.explanation,
      })),
      reviewRequired,
      matchedRuleIds: allHits.map((h) => h.ruleId),
      policyVersion: this.policyVersion,
      latencyMs,
      usedFallback: false,
    };
  }

  private decide(riskScore: number, hits: RuleHit[]): ModerationDecision {
    const labels = hits.map((h) => h.label);
    const hasCritical = hits.some((h) => h.severity === RuleSeverity.CRITICAL);

    // Hard block: critical severity or very high risk
    if (hasCritical || riskScore >= 85) {
      return ModerationDecision.BLOCK;
    }

    // Block: explicit off-platform + elevated risk
    if (labels.includes(RuleLabel.OFF_PLATFORM_CONTACT) && riskScore >= 45) {
      return ModerationDecision.BLOCK;
    }

    // Block: payment bypass with evidence
    if (labels.includes(RuleLabel.PAYMENT_BYPASS) && riskScore >= 40) {
      return ModerationDecision.BLOCK;
    }

    // Escalate: ambiguous but risky
    if (riskScore >= 60) {
      return ModerationDecision.ESCALATE_REVIEW;
    }

    // Redact: PII detected but message still useful
    const hasPII = labels.some((l) =>
      [RuleLabel.PII_LEAK, RuleLabel.OFF_PLATFORM_CONTACT].includes(l),
    );
    if (hasPII && riskScore >= 25 && riskScore < 60) {
      return ModerationDecision.ALLOW_WITH_REDACTION;
    }

    // Soft block: suspicious but not conclusive
    if (riskScore >= 40) {
      return ModerationDecision.SOFT_BLOCK;
    }

    // Allow: safe content
    return ModerationDecision.ALLOW;
  }

  private mapAction(decision: ModerationDecision): ModerationAction {
    switch (decision) {
      case ModerationDecision.ALLOW:
        return ModerationAction.NONE;
      case ModerationDecision.ALLOW_WITH_REDACTION:
        return ModerationAction.NOTIFY_USER_REDACTED;
      case ModerationDecision.SOFT_BLOCK:
        return ModerationAction.ASK_USER_EDIT;
      case ModerationDecision.BLOCK:
        return ModerationAction.REJECT_MESSAGE;
      case ModerationDecision.ESCALATE_REVIEW:
        return ModerationAction.QUEUE_HUMAN_REVIEW;
    }
  }

  private buildUserNotice(
    decision: ModerationDecision,
    hits: RuleHit[],
  ): string | undefined {
    switch (decision) {
      case ModerationDecision.ALLOW:
        return undefined;
      case ModerationDecision.ALLOW_WITH_REDACTION:
        return "Một số thông tin nhạy cảm trong tin nhắn đã được ẩn để bảo vệ quyền riêng tư.";
      case ModerationDecision.SOFT_BLOCK: {
        const hasAbuse = hits.some((h) => h.label === RuleLabel.ABUSE_TOXIC);
        return hasAbuse
          ? "Tin nhắn chứa nội dung không phù hợp. Vui lòng chỉnh sửa trước khi gửi."
          : "Tin nhắn của bạn cần được xem xét. Vui lòng chỉnh sửa hoặc liên hệ hỗ trợ.";
      }
      case ModerationDecision.BLOCK:
        return "Tin nhắn vi phạm chính sách nền tảng và không thể gửi.";
      case ModerationDecision.ESCALATE_REVIEW:
        return "Tin nhắn đang chờ kiểm duyệt. Bạn sẽ được thông báo khi hoàn tất.";
    }
  }
}
