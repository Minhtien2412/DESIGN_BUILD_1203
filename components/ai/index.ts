/**
 * AI Components - Barrel Exports
 *
 * @author AI Assistant
 * @date 23/12/2025
 * @updated 19/01/2026
 */

// Original exports
export { ChatBot, default as ChatBotDefault } from "./ChatBot";

// AI Command Center & Search
export { default as AICommandCenter } from "./AICommandCenter";
export {
    AIMiniCard, default as AISearchBar,
    FloatingAIButton
} from "./AISearchBar";

// Re-export types from service
export type {
    AICategory, AIFeature, AIRouterContext, AIRouterResult
} from "@/services/aiRouterService";

// Re-export service
export { aiRouterService } from "@/services/aiRouterService";

// Re-export hooks
export {
    closeGlobalAICommandCenter, openGlobalAICommandCenter, setGlobalAICommandCenter, useAICommandCenter
} from "@/hooks/useAICommandCenter";

