import { Body, Controller, Headers, Logger, Post } from "@nestjs/common";
import { ModerationService } from "./moderation.service";
import { ModerationRequest, ModerationResponse } from "./types";

@Controller("internal/v1/moderate")
export class ModerationController {
  private readonly logger = new Logger(ModerationController.name);

  constructor(private readonly moderationService: ModerationService) {}

  @Post("message")
  async moderateMessage(
    @Body() request: ModerationRequest,
    @Headers("x-trace-id") traceId?: string,
  ): Promise<ModerationResponse> {
    // Use trace from header if body doesn't have one
    if (!request.traceId && traceId) {
      request.traceId = traceId;
    }

    this.logger.log(
      `Moderate request [${request.traceId}] userId=${request.userId} thread=${request.threadId} state=${request.conversationState ?? "none"} role=${request.senderRole ?? "unknown"}`,
    );

    return this.moderationService.moderate(request);
  }
}
