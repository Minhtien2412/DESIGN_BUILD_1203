/**
 * Communication Services Index
 * Export all real-time communication services
 *
 * @created 19/01/2026
 */

// Chat Socket Service
export { default as chatSocketService } from "./chatSocket.service";
export type {
    ChatMessage,
    ChatUser,
    MessageAttachment,
    MessageReaction
} from "./chatSocket.service";

// Call Socket Service
export { default as callSocketService } from "./callSocket.service";
export type {
    CallAnsweredEvent,
    CallEndedEvent, CallSession, CallStatus, CallType, CallUser, IncomingCallEvent
} from "./callSocket.service";

// Meeting Socket Service
export { default as meetingSocketService } from "./meetingSocket.service";
export type {
    LiveKitCredentials,
    MeetingChatMessage,
    MeetingParticipant,
    MeetingRoom,
    MeetingSettings
} from "./meetingSocket.service";

// Livestream Socket Service
export { default as livestreamSocketService } from "./livestreamSocket.service";
export type {
    LivestreamComment,
    LivestreamGift,
    LivestreamInfo,
    LivestreamPoll,
    LivestreamViewer,
    StreamCredentials
} from "./livestreamSocket.service";

