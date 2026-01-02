/**
 * TikTok Comments Sheet
 * Bottom sheet for video comments with replies
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { useTikTok } from '@/context/TikTokContext';
import { TikTokComment } from '@/types/tiktok';
import { formatCompactNumber, formatTimeAgo } from '@/utils/format';
import { HapticFeedback } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.65;

interface TikTokCommentsSheetProps {
  visible: boolean;
  videoId: string;
  onClose: () => void;
}

export function TikTokCommentsSheet({
  visible,
  videoId,
  onClose,
}: TikTokCommentsSheetProps) {
  const insets = useSafeAreaInsets();
  const { state, postComment, likeComment, loadComments } = useTikTok();
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<TikTokComment | null>(null);
  const inputRef = useRef<TextInput>(null);

  const comments = state.comments[videoId] || [];
  const isLoading = state.commentsLoading[videoId] || false;

  // Sheet animation
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
      loadComments(videoId);
    } else {
      translateY.setValue(SHEET_HEIGHT);
    }
  }, [visible, videoId]);

  // Drag to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: SHEET_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handlePostComment = useCallback(async () => {
    if (!newComment.trim() || isPosting) return;

    setIsPosting(true);
    HapticFeedback.light();

    try {
      await postComment(videoId, newComment.trim());
      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsPosting(false);
    }
  }, [videoId, newComment, isPosting, postComment]);

  const handleReply = useCallback((comment: TikTokComment) => {
    setReplyingTo(comment);
    setNewComment(`@${comment.author.username} `);
    inputRef.current?.focus();
  }, []);

  const handleLikeComment = useCallback((commentId: string) => {
    HapticFeedback.light();
    likeComment(commentId);
  }, [likeComment]);

  const renderComment = useCallback(({ item }: { item: TikTokComment }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.author.avatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>
            {item.author.username}
            {item.author.verified && (
              <Ionicons name="checkmark-circle" size={12} color="#20D5EC" />
            )}
          </Text>
          <Text style={styles.commentTime}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.commentAction}
            onPress={() => handleReply(item)}
          >
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>
          {item.repliesCount > 0 && (
            <TouchableOpacity style={styles.commentAction}>
              <Text style={styles.viewReplies}>
                View {item.repliesCount} replies
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <TouchableOpacity 
        style={styles.likeButton}
        onPress={() => handleLikeComment(item.id)}
      >
        <Ionicons 
          name={item.isLiked ? 'heart' : 'heart-outline'} 
          size={18} 
          color={item.isLiked ? '#FE2C55' : '#888'} 
        />
        <Text style={[styles.likeCount, item.isLiked && styles.likedCount]}>
          {formatCompactNumber(item.likesCount)}
        </Text>
      </TouchableOpacity>
    </View>
  ), [handleLikeComment, handleReply]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.sheet,
            { 
              height: SHEET_HEIGHT + insets.bottom,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Drag Handle */}
          <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {comments.length > 0 
                ? `${formatCompactNumber(comments.length)} comments` 
                : 'Comments'
              }
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FE2C55" />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>Be the first to comment!</Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              contentContainerStyle={styles.commentsList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Reply indicator */}
          {replyingTo && (
            <View style={styles.replyIndicator}>
              <Text style={styles.replyText}>
                Replying to @{replyingTo.author.username}
              </Text>
              <TouchableOpacity onPress={() => {
                setReplyingTo(null);
                setNewComment('');
              }}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}

          {/* Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={10}
          >
            <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 16 }]}>
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Add a comment..."
                  placeholderTextColor="#888"
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!newComment.trim() || isPosting) && styles.sendButtonDisabled,
                  ]}
                  onPress={handlePostComment}
                  disabled={!newComment.trim() || isPosting}
                >
                  {isPosting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="send" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#888',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  commentAction: {
    marginRight: 16,
  },
  commentActionText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  viewReplies: {
    fontSize: 12,
    color: '#888',
  },
  likeButton: {
    alignItems: 'center',
    marginLeft: 8,
  },
  likeCount: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  likedCount: {
    color: '#FE2C55',
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  replyText: {
    fontSize: 13,
    color: '#666',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    maxHeight: 80,
    paddingVertical: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FE2C55',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default TikTokCommentsSheet;
