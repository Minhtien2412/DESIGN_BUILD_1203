import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DetectorService } from "../moderation/detector.service";
import { OpenClawAdapter } from "../openclaw/openclaw.adapter";

@Controller("internal/v1/health")
export class HealthController {
  constructor(
    private readonly config: ConfigService,
    private readonly detector: DetectorService,
    private readonly openClaw: OpenClawAdapter,
  ) {}

  @Get("live")
  live() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  @Get("ready")
  ready() {
    const hasToken = !!this.config.get<string>("AI_INTERNAL_TOKEN");
    const detectorReady = this.detector.getRuleCount() > 0;
    const allReady = hasToken && detectorReady;

    return {
      status: allReady ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage().heapUsed,
      checks: {
        serviceToken: hasToken,
        detectorRules: detectorReady,
        openClaw: this.openClaw.isConnected,
      },
    };
  }

  @Get("deps")
  async deps() {
    const openClawReady = await this.openClaw.isReady();

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      dependencies: {
        openclaw: {
          status: openClawReady ? "connected" : "disconnected",
          connected: this.openClaw.isConnected,
        },
      },
    };
  }
}
