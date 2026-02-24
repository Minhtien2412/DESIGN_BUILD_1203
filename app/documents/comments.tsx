/**
 * Document Comments Screen
 * Threaded comments with annotations support
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useDocumentComments } from '@/hooks/useDocument';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Comment {
  id: string;
  content: string;
  author: { id: string; name: string; avatar?: string };
  pageNumber?: number;
  createdAt: string;
  replies?: Comment[];
}

export default function DocumentCommentsScreen() {
  const params = useLocalSearchParams<{ projectId: string; documentId: string }>();
  const { projectId = '1', documentId = '1' } = params;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const { comments, loading, addComment, deleteComment } = useDocumentComments(projectId, documentId);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState<number | undefined>();
  const [posting, setPosting] = useState(false);

  const handlePostComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      setPosting(true);
      await addComment({
        documentId,
        content: newComment.trim(),
        parentCommentId: replyingTo || undefined,
        pageNumber,
      });
      setNewComment('');
      setReplyingTo(null);
      setPageNumber(undefined);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đăng bình luận');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa bình luận này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(commentId);
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa bình luận');
            }
          },
        },
      ]
    );
  };

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo(commentId);
    setNewComment(`@${authorName} `);
  };

  const formatDate = (date: string): string => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return d.toLocaleDateString('vi-VN');
  };

  const renderComment = (comment: Comment, level: number = 0) => {
    const isReply = level > 0;
    
    return (
      <View key={comment.id} style={[styles.commentContainer, isReply && styles.replyContainer]}>
        <View style={styles.commentHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={isReply ? 32 : 40} color="#0D9488" />
          </View>
          <View style={styles.commentInfo}>
            <View style={styles.authorRow}>
              <Text style={[styles.authorName, { color: textColor }]}>
                {comment.author.name}
              </Text>
              {comment.pageNumber && (
                <View style={styles.pageNumberBadge}>
                  <Ionicons name="document-text-outline" size={12} color="#666" />
                  <Text style={styles.pageNumberText}>Trang {comment.pageNumber}</Text>
                </View>
              )}
            </View>
            <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
          </View>
        </View>

        <Text style={[styles.commentContent, { color: textColor }]}>
          {comment.content}
        </Text>

        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleReply(comment.id, comment.author.name)}
          >
            <Ionicons name="arrow-undo-outline" size={16} color="#666" />
            <Text style={styles.actionText}>Trả lời</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteComment(comment.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#000000" />
            <Text style={[styles.actionText, { color: '#000000' }]}>Xóa</Text>
          </TouchableOpacity>
        </View>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map((reply) => renderComment(reply, level + 1))}
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
      <Text style={styles.emptyHint}>Hãy là người đầu tiên bình luận</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: `Bình luận (${comments?.length || 0})` }} />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Comments List */}
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderComment(item)}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
        />

        {/* Input Section */}
        <View style={[styles.inputContainer, { borderColor }]}>
          {replyingTo && (
            <View style={styles.replyingToContainer}>
              <Ionicons name="arrow-undo-outline" size={16} color="#0D9488" />
              <Text style={styles.replyingToText}>Đang trả lời...</Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Viết bình luận..."
              placeholderTextColor="#999"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newComment.trim() || posting) && styles.sendButtonDisabled,
              ]}
              onPress={handlePostComment}
              disabled={!newComment.trim() || posting}
            >
              <Ionicons
                name="send"
                size={20}
                color={newComment.trim() && !posting ? '#fff' : '#ccc'}
              />
            </TouchableOpacity>
          </View>

          {/* Optional: Page Number Input */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                Alert.prompt(
                  'Số trang',
                  'Nhập số trang để đánh dấu vị trí:',
                  (text) => {
                    const page = parseInt(text);
                    if (!isNaN(page) && page > 0) {
                      setPageNumber(page);
                    }
                  },
                  'plain-text',
                  '',
                  'number-pad'
                );
              }}
            >
              <Ionicons name="document-text-outline" size={18} color="#666" />
              {pageNumber && (
                <Text style={styles.optionText}>Trang {pageNumber}</Text>
              )}
            </TouchableOpacity>
            {pageNumber && (
              <TouchableOpacity onPress={() => setPageNumber(undefined)}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  commentContainer: {
    marginBottom: 20,
  },
  replyContainer: {
    marginLeft: 40,
    marginTop: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  avatarContainer: {
    marginRight: 12,
  },
  commentInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
  },
  pageNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pageNumberText: {
    fontSize: 11,
    color: '#666',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: '#666',
  },
  repliesContainer: {
    marginTop: 12,
  },
  inputContainer: {
    borderTopWidth: 1,
    backgroundColor: '#fff',
    padding: 12,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    flex: 1,
    fontSize: 13,
    color: '#0D9488',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
  },
  optionText: {
    fontSize: 12,
    color: '#666',
  },
});
