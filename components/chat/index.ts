/**
 * Chat Components Export
 * Zalo-style messaging components with real-time support
 *
 * @updated 22/01/2026 - Added VoiceRecorder, VoiceMessagePlayer
 */

export {
    ChatListEmpty,
    default as ChatListEnhanced,
    ChatSearchHeader
} from "./ChatListEnhanced";
export {
    default as MessageBubbleEnhanced,
    TypingIndicator as MessageTypingIndicator
} from "./MessageBubbleEnhanced";

// Re-export existing components
export {
    AttachmentPicker,
    AttachmentPreview,
    type AttachmentFile
} from "./AttachmentPicker";
export { default as ChatListItem } from "./ChatListItem";
export { ChatRoom, type ChatRoomProps } from "./ChatRoom";
export { EmojiButton } from "./EmojiButton";
export { MentionInput, type MentionUser } from "./MentionInput";
export {
    default as MessageBubble,
    type MessageBubbleProps
} from "./MessageBubble";

// Real-time components
export { ConnectionStatusBanner } from "./ConnectionStatusBanner";
export { TypingIndicator } from "./TypingIndicator";

// Voice message components (MSG-005)
export { VoiceMessagePlayer } from "./VoiceMessagePlayer";
export { VoiceRecorder } from "./VoiceRecorder";

