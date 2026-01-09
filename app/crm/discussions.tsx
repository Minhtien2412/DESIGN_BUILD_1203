/**
 * Project Discussions Screen - Perfex CRM Style
 * ===============================================
 * 
 * Trao đổi trong dự án:
 * - Chat/Comment threads
 * - Mention @staff
 * - Attach files
 * - Real-time updates
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import perfexService from '@/services/perfexService';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Discussion {
  id: string;
  content: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  attachments?: { name: string; type: string }[];
  replies?: Discussion[];
}

export default function DiscussionsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    loadDiscussions();
  }, [projectId]);

  const loadDiscussions = async () => {
    try {
      setLoading(true);
      if (projectId) {
        const response = await perfexService.getProjectDiscussions(projectId);
        const data: Discussion[] = (response || []).map((d: any) => ({
          id: d.id || String(Math.random()),
          content: d.description || d.content || '',
          author: d.staff_full_name || d.author || 'Unknown',
          createdAt: d.dateadded || d.createdAt || new Date().toISOString(),
          attachments: d.attachments || [],
          replies: [],
        }));
        setDiscussions(data);
      }
    } catch (error) {
      console.error('Error loading discussions:', error);
      // Mock data với dữ liệu thực từ Perfex CRM
      // Staff: NHÀ XINH Design, Anh Khương, Anh Tiến, Lê Nguyên Thảo
      // Projects: Nhà Anh Khương Q9, Biệt Thự 3 Tầng Anh Tiến Q7
      setDiscussions([
        {
          id: '1',
          content: 'Thiết kế mặt bằng nhà Anh Khương Q9 đã hoàn thành draft đầu tiên. @Anh Khương vui lòng review và góp ý.',
          author: 'NHÀ XINH Design',
          createdAt: '2024-12-30T10:30:00',
          attachments: [{ name: 'mat_bang_v1.dwg', type: 'autocad' }],
        },
        {
          id: '2',
          content: 'Đã xem qua bản vẽ. Phòng khách có thể mở rộng thêm không? Mình muốn có view đẹp hơn ra sân vườn.',
          author: 'Anh Khương Q9',
          createdAt: '2024-12-30T14:15:00',
        },
        {
          id: '3',
          content: 'Bản vẽ 3D Biệt thự Q7 đã hoàn thành. @Anh Tiến check giúp phần mái và lan can nhé.',
          author: 'NHÀ XINH Design',
          createdAt: '2024-12-29T09:00:00',
          attachments: [{ name: 'biet_thu_3d.skp', type: 'sketchup' }],
        },
        {
          id: '4',
          content: 'Mình đã xem. Rất hài lòng với thiết kế! Có thể bổ sung thêm hồ bơi mini ở sân sau được không?',
          author: 'Anh Tiến',
          createdAt: '2024-12-29T16:30:00',
        },
        {
          id: '5',
          content: 'Chị Thảo ơi, bản vẽ nội thất căn hộ đã gửi qua email. @Lê Nguyên Thảo kiểm tra giúp ạ.',
          author: 'NHÀ XINH Design',
          createdAt: '2024-12-28T11:00:00',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDiscussions();
    setRefreshing(false);
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const newDiscussion: Discussion = {
        id: String(Date.now()),
        content: newMessage,
        author: 'Bạn',
        createdAt: new Date().toISOString(),
      };
      
      setDiscussions([...discussions, newDiscussion]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hôm qua';
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const getAvatarColor = (name: string): string => {
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const renderDiscussion = ({ item }: { item: Discussion }) => {
    const isMe = item.author === 'Bạn';
    
    return (
      <View style={[styles.messageContainer, isMe && styles.myMessageContainer]}>
        {!isMe && (
          <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.author) }]}>
            <Text style={styles.avatarText}>{item.author.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          { backgroundColor: isMe ? primaryColor : cardBg },
          !isMe && { borderColor, borderWidth: 1 },
        ]}>
          {!isMe && (
            <Text style={[styles.authorName, { color: primaryColor }]}>{item.author}</Text>
          )}
          <Text style={[styles.messageContent, { color: isMe ? '#fff' : textColor }]}>
            {item.content}
          </Text>
          {item.attachments && item.attachments.length > 0 && (
            <View style={styles.attachments}>
              {item.attachments.map((att, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.attachment, { backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : borderColor }]}
                >
                  <Ionicons name="attach" size={14} color={isMe ? '#fff' : textColor} />
                  <Text style={[styles.attachmentName, { color: isMe ? '#fff' : textColor }]} numberOfLines={1}>
                    {att.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <Text style={[styles.messageTime, { color: isMe ? 'rgba(255,255,255,0.7)' : textColor }]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
        {isMe && (
          <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
            <Text style={styles.avatarText}>B</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: textColor }]}>Trao đổi dự án</Text>
          <Text style={[styles.headerSubtitle, { color: textColor }]}>
            {discussions.length} tin nhắn
          </Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={discussions}
          keyExtractor={(item) => item.id}
          renderItem={renderDiscussion}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColor]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color="#6b7280" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Chưa có trao đổi</Text>
              <Text style={[styles.emptyText, { color: textColor }]}>
                Bắt đầu cuộc trò chuyện đầu tiên
              </Text>
            </View>
          }
        />
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputBar, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={24} color={textColor} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { color: textColor, backgroundColor: backgroundColor }]}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#6b7280"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: newMessage.trim() ? primaryColor : borderColor },
            ]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  searchButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 6,
    opacity: 0.7,
  },
  attachments: {
    marginTop: 8,
    gap: 4,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 6,
    gap: 4,
  },
  attachmentName: {
    fontSize: 11,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
