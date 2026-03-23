import { Module } from "@nestjs/common";
import { OpenClawModule } from "../openclaw/openclaw.module";
import { PolicyModule } from "../policy/policy.module";
import { DetectorService } from "./detector.service";
import { ModerationController } from "./moderation.controller";
import { ModerationService } from "./moderation.service";

@Module({
  imports: [PolicyModule, OpenClawModule],
  controllers: [ModerationController],
  providers: [ModerationService, DetectorService],
  exports: [ModerationService, DetectorService],
})
export class ModerationModule {}
