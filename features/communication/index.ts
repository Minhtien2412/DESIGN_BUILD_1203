/**
 * Communication Services & Hooks Index
 * Central export for all real-time communication functionality
 *
 * @created 19/01/2026
 */

// Services - using default exports
export { default as chatSocketService } from "@/services/communication/chatSocket.service";
export type { ChatMessage } from "@/services/communication/chatSocket.service";

export { default as callSocketService } from "@/services/communication/callSocket.service";
export type {
    CallAnsweredEvent,
    CallEndedEvent, CallSession,
    IncomingCallEvent
} from "@/services/communication/callSocket.service";

// Hooks
export { useRealtimeChat } from "@/hooks/useRealtimeChat";
export { useVoiceCall, type CallState } from "@/hooks/useVoiceCall";

// Context
export {
    CommunicationHubProvider,
    useCommunicationHub,
    type CommunicationType,
    type IncomingCall,
    type OnlineStatus,
    type UnreadCounts
} from "@/context/CommunicationHubContext";
export type { TypingIndicator as TypingIndicatorType } from "@/context/CommunicationHubContext";

// Components
export { ConnectionStatusBanner } from "@/components/chat/ConnectionStatusBanner";
export { TypingIndicator } from "@/components/chat/TypingIndicator";

