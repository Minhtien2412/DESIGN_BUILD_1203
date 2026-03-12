// Domain barrel: chat
export { default as ChatListItem } from "@/components/chat/ChatListItem";
export { default as InputBar } from "@/components/chat/InputBar";
export { default as MessageBubble } from "@/components/chat/MessageBubble";
// Export canonical conversation service types
export {
    getConversations,
    getMessages,
    sendMessage, type Message as ChatMessage, type Conversation as ChatRoom, type CreateGroupConversationDto as CreateRoomDto,
    type MessageListResponse as MessagesResponse,
    type ConversationParticipant as RoomMember
} from "@/services/api/conversations.service";
// Export messages API (legacy — callers should migrate to conversations.service)
export { default as messagesApi } from "@/services/api/messagesApi";
// Export screens
export { default as GroupChatScreen } from "./GroupChatScreen";
export { default as ModernMessagesScreen } from "./ModernMessagesScreen";

