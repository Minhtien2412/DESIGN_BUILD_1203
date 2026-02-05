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

// Chat icons (all icons for chat UI)
export {
    AddMemberIcon,
    ArchiveIcon,
    // Attachment icons
    AttachmentIcon,
    // Navigation icons
    BackIcon,
    CameraIcon,
    // Message icons
    ChatIcon,
    default as ChatIcons,
    ChatListIcon,
    CloseIcon,
    CopyIcon,
    CustomerServiceIcon,
    DeleteIcon,
    DeliveredIcon,
    DocumentIcon,
    // Reaction icons
    EmojiIcon,
    EndCallIcon,
    ForwardIcon,
    // Group chat icons
    GroupChatIcon,
    ImageIcon,
    InfoIcon,
    LeaveGroupIcon,
    LikeIcon,
    LocationIcon,
    MicrophoneIcon,
    MissedCallIcon,
    // Action icons
    MoreOptionsIcon,
    MuteIcon,
    // Status icons
    OnlineStatusIcon,
    PinIcon,
    ReplyIcon,
    SearchIcon,
    SeenIcon,
    SendIcon,
    SupportAgentIcon,
    ThumbsUpIcon,
    VideoCallIcon,
    // Call icons
    VoiceCallIcon
} from "./ChatIcons";

// Support chat components
export {
    QuickQuestionButton,
    SupportChatList,
    SupportWidget
} from "./SupportChatList";

// Support users data
export {
    QUICK_QUESTIONS,
    SUPPORT_USERS,
    getOnlineSupportUsers,
    getSupportUserById,
    getSupportUsers,
    isSupportUser
} from "@/data/supportUsers";
export type { QuickQuestion, SupportUser } from "@/data/supportUsers";

// Chat Input Bar
export { ChatInputBar, default as ChatInputBarDefault } from "./ChatInputBar";
export type { ChatInputBarProps } from "./ChatInputBar";

// Message Status Indicator
export {
    DeliveredStatus,
    FailedStatus,
    MessageStatusIndicator,
    ReadStatus,
    SendingStatus,
    SentStatus,
    getMessageStatus
} from "./MessageStatusIndicator";
export type {
    MessageStatus,
    MessageStatusIndicatorProps
} from "./MessageStatusIndicator";

// Online Status Badge
export {
    AvatarWithStatus,
    OnlineStatusBadge,
    OnlineStatusText
} from "./OnlineStatusBadge";
export type {
    AvatarWithStatusProps,
    OnlineStatus,
    OnlineStatusBadgeProps,
    OnlineStatusTextProps
} from "./OnlineStatusBadge";

// Message Composer Toolbar (Rich input with voice, image, video)
export {
    MessageComposerToolbar,
    type AttachmentData,
    type MessageComposerToolbarProps,
    type ReplyToMessage
} from "./MessageComposerToolbar";

