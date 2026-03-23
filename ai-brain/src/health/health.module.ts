import { Module } from "@nestjs/common";
import { ModerationModule } from "../moderation/moderation.module";
import { OpenClawModule } from "../openclaw/openclaw.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [ModerationModule, OpenClawModule],
  controllers: [HealthController],
})
export class HealthModule {}
