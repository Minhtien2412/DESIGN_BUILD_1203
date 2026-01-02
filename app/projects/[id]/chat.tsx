/**
 * Team Chat Screen
 * Real-time team communication with channels
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

import {
    AttachmentPicker,
    AttachmentPreview,
    type AttachmentFile,
} from '@/components/chat/AttachmentPicker';
import { EmojiButton } from '@/components/chat/EmojiButton';
import { MentionInput, type MentionUser } from '@/components/chat/MentionInput';
import { useThemeColor } from '@/hooks/use-theme-color';
import communicationService from '@/services/api/communication.service';

interface Channel {
  id: string;
  name: string;
  description?: string;
  unreadCount: number;
  lastMessage?: {
    text: string;
    sender: string;
    timestamp: string;
  };
  memberCount: number;
  members?: MentionUser[];
}

interface Message {
  id: string;
  channelId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  timestamp: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  mentions?: string[];
  isRead: boolean;
}

export default function TeamChatScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [channelMembers, setChannelMembers] = useState<MentionUser[]>([]);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id);
      loadChannelMembers(selectedChannel.id);
    }
  }, [selectedChannel]);

  const loadChannels = async () => {
    setLoading(true);
    try {
      const response = await communicationService.getChannels(projectId ? parseInt(projectId) : undefined);
      
      const channelsData: Channel[] = (response.data || []).map(ch => ({
        id: ch.id.toString(),
        name: ch.name,
        description: ch.description,
        unreadCount: ch.unreadCount || 0,
        lastMessage: ch.lastMessage ? {
          text: ch.lastMessage.content,
          sender: ch.lastMessage.userName || 'Unknown',
          timestamp: ch.lastMessage.createdAt,
        } : undefined,
        memberCount: ch.memberCount,
      }));

      setChannels(channelsData);
      if (channelsData.length > 0) {
        setSelectedChannel(channelsData[0]);
      }
    } catch (error: any) {
      console.error('Load channels failed:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách kênh');
    } finally {
      setLoading(false);
    }
  };

  const loadChannelMembers = async (channelId: string) => {
    try {
      // TODO: Replace with real API call when available
      // const response = await communicationService.getChannelMembers(parseInt(channelId));
      
      // Mock members for now
      const mockMembers: MentionUser[] = [
        { id: '1', name: 'Nguyễn Văn A', role: 'Giám đốc dự án' },
        { id: '2', name: 'Trần Thị B', role: 'KTS thiết kế' },
        { id: '3', name: 'Lê Văn C', role: 'Kỹ sư kết cấu' },
        { id: '4', name: 'Phạm Thị D', role: 'Kỹ sư giám sát' },
        { id: '5', name: 'Hoàng Văn E', role: 'Trưởng công trường' },
        { id: '6', name: 'Đặng Thị F', role: 'Kế toán' },
        { id: '7', name: 'Vũ Văn G', role: 'An toàn lao động' },
        { id: '8', name: 'Mai Thị H', role: 'QA/QC' },
      ];
      
      setChannelMembers(mockMembers);
    } catch (error) {
      console.error('Load channel members failed:', error);
      setChannelMembers([]);
    }
  };

  const loadMessages = async (channelId: string) => {
    try {
      const response = await communicationService.getMessages({
        channelId: parseInt(channelId),
        limit: 50,
      });

      const messagesData: Message[] = (response.data || []).map(msg => ({
        id: msg.id.toString(),
        channelId: msg.channelId.toString(),
        sender: {
          id: msg.userId.toString(),
          name: msg.userName || 'Unknown',
          avatar: msg.userAvatar,
        },
        text: msg.content,
        timestamp: msg.createdAt,
        attachments: msg.fileUrl ? [{
          name: msg.fileName || 'File',
          url: msg.fileUrl,
          type: msg.type,
        }] : undefined,
        mentions: msg.mentions?.map(id => id.toString()) || [],
        isRead: true,
      }));

      setMessages(messagesData);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error: any) {
      console.error('Load messages failed:', error);
    }
  };

  const handleSendMessage = async () => {
    if ((!messageText.trim() && attachments.length === 0) || !selectedChannel) return;

    setSending(true);
    try {
      // TODO: Upload attachments when uploadService is ready
      // const fileUrls = [];
      // if (attachments.length > 0) {
      //   for (const attachment of attachments) {
      //     const result = await uploadService.uploadSingle(...);
      //     fileUrls.push(result.data.url);
      //   }
      // }

      const response = await communicationService.sendMessage({
        channelId: parseInt(selectedChannel.id),
        content: messageText.trim() || '(Đính kèm tệp tin)',
        type: attachments.length > 0 ? 'FILE' : 'TEXT',
        // fileUrl: fileUrls[0],
        // fileName: attachments[0]?.name,
      });

      if (!response.data) return;

      const newMessage: Message = {
        id: response.data.id.toString(),
        channelId: response.data.channelId.toString(),
        sender: {
          id: response.data.userId.toString(),
          name: response.data.userName || 'Bạn',
          avatar: response.data.userAvatar,
        },
        text: response.data.content,
        timestamp: response.data.createdAt,
        isRead: true,
      };

      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      setAttachments([]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error: any) {
      console.error('Send failed:', error);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;

    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender.id === '0';

    return (
      <View style={[styles.messageContainer, isMe && styles.messageContainerMe]}>
        {!isMe && (
          <View style={[styles.avatar, { backgroundColor: primary + '20' }]}>
            <Text style={[styles.avatarText, { color: primary }]}>
              {item.sender.name.charAt(0)}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          {!isMe && <Text style={[styles.senderName, { color: text }]}>{item.sender.name}</Text>}
          <View
            style={[
              styles.messageBubble,
              { backgroundColor: isMe ? primary : surface, borderColor: border },
              isMe && styles.messageBubbleMe,
            ]}
          >
            <Text style={[styles.messageText, { color: isMe ? '#fff' : text }]}>
              {item.text}
            </Text>
          </View>
          <Text style={[styles.messageTime, { color: textMuted }]}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: text }]}>
            {selectedChannel?.name || 'Chat'}
          </Text>
          {selectedChannel && (
            <Text style={[styles.headerSubtitle, { color: textMuted }]}>
              {selectedChannel.memberCount} thành viên
            </Text>
          )}
        </View>
        <Pressable style={styles.headerButton}>
          <Ionicons name="information-circle-outline" size={24} color={primary} />
        </Pressable>
      </View>

      {/* Channel Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.channelTabs}
      >
        {channels.map(channel => (
          <Pressable
            key={channel.id}
            style={[
              styles.channelTab,
              { borderColor: border },
              selectedChannel?.id === channel.id && {
                backgroundColor: primary,
                borderColor: primary,
              },
            ]}
            onPress={() => setSelectedChannel(channel)}
          >
            <Text
              style={[
                styles.channelTabText,
                { color: selectedChannel?.id === channel.id ? '#fff' : text },
              ]}
            >
              {channel.name}
            </Text>
            {channel.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.unreadText}>{channel.unreadCount}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <AttachmentPreview
            attachments={attachments}
            onRemove={(index) => {
              setAttachments(prev => prev.filter((_, i) => i !== index));
            }}
          />
        )}

        <View style={[styles.inputContainer, { backgroundColor: surface, borderTopColor: border }]}>
          <AttachmentPicker
            onSelect={(files) => {
              setAttachments(prev => [...prev, ...files]);
            }}
            maxFiles={5}
          />
          <MentionInput
            value={messageText}
            onChangeText={setMessageText}
            members={channelMembers}
            placeholder="Nhập tin nhắn... (@mention để tag)"
            maxLength={1000}
          />
          <EmojiButton
            onSelect={(emoji) => {
              setMessageText(prev => prev + emoji);
            }}
          />
          <Pressable
            style={[styles.sendButton, { backgroundColor: primary }]}
            onPress={handleSendMessage}
            disabled={(!messageText.trim() && attachments.length === 0) || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerButton: {
    padding: 4,
  },
  channelTabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  channelTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  channelTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  messageList: {
    padding: 16,
    gap: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  messageContainerMe: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  senderName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: '80%',
  },
  messageBubbleMe: {
    borderWidth: 0,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  attachButton: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
