import { Module } from "@nestjs/common";
import { ConversationStateEvaluator } from "./conversation-state.evaluator";

@Module({
  providers: [ConversationStateEvaluator],
  exports: [ConversationStateEvaluator],
})
export class PolicyModule {}
