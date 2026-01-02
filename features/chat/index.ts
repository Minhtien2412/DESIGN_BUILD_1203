// Domain barrel: chat
export { default as ChatListItem } from '@/components/chat/ChatListItem';
export { default as InputBar } from '@/components/chat/InputBar';
export { default as MessageBubble } from '@/components/chat/MessageBubble';
// Export chat service types (use explicit names to avoid conflicts)
export {
    chatService, type ChatMessage, type ChatRoom, type CreateRoomDto,
    type MessagesResponse, type RoomMember
} from '@/services/api/chat.service';
// Export messages API
export { default as messagesApi } from '@/services/api/messagesApi';

