/**
 * CommentSection Component
 * Comments with reactions and replies
 *
 * @author AI Assistant
 * @date 23/12/2025
 */

import { useAuth } from "@/context/AuthContext";
import { useSocial } from "@/context/SocialContext";
import { Comment, REACTION_EMOJIS } from "@/types/social";
import { formatTimeAgo } from "@/utils/format";
import {
    errorNotification,
    lightImpact,
    successNotification,
} from "@/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CommentSectionProps {
  postId: string;
  initialCommentsCount: number;
}

interface CommentItemProps {
  comment: Comment;
  onReply: (comment: Comment) => void;
  level?: number;
}

// Comment Item Component
const CommentItem = memo(function CommentItemComponent({
  comment,
  onReply,
  level = 0,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [isLiked, setIsLiked] = useState(!!comment.myReaction);

  const handleLike = useCallback(() => {
    lightImpact();
    setIsLiked(!isLiked);
    // TODO: Call API to like comment
  }, [isLiked]);

  const handleReply = useCallback(() => {
    lightImpact();
    onReply(comment);
  }, [comment, onReply]);

  const toggleReplies = useCallback(() => {
    setShowReplies(!showReplies);
  }, [showReplies]);

  return (
    <View style={[styles.commentItem, { marginLeft: level * 40 }]}>
      <Image
        source={{
          uri:
            comment.author.avatar ||
            "https://ui-avatars.com/api/?name=User&size=32&background=4CAF50&color=fff",
        }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <Text style={styles.commentAuthor}>{comment.author.displayName}</Text>
          <Text style={styles.commentText}>{comment.content}</Text>
        </View>

        {/* Comment Actions */}
        <View style={styles.commentActions}>
          <Text style={styles.commentTime}>
            {formatTimeAgo(comment.createdAt)}
          </Text>

          <TouchableOpacity onPress={handleLike}>
            <Text
              style={[
                styles.commentAction,
                isLiked && styles.commentActionActive,
              ]}
            >
              Thích
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleReply}>
            <Text style={styles.commentAction}>Trả lời</Text>
          </TouchableOpacity>

          {comment.reactionsCount > 0 && (
            <View style={styles.commentReactions}>
              <Text style={styles.reactionEmoji}>
                {REACTION_EMOJIS[comment.reactions.topReactions[0] || "like"]}
              </Text>
              <Text style={styles.reactionCount}>{comment.reactionsCount}</Text>
            </View>
          )}
        </View>

        {/* Replies */}
        {comment.repliesCount > 0 && !showReplies && (
          <TouchableOpacity
            onPress={toggleReplies}
            style={styles.viewRepliesButton}
          >
            <Ionicons name="return-down-forward" size={14} color="#65676B" />
            <Text style={styles.viewRepliesText}>
              Xem {comment.repliesCount} phản hồi
            </Text>
          </TouchableOpacity>
        )}

        {showReplies && comment.replies && (
          <View style={styles.repliesContainer}>
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                level={level + 1}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
});

// Main Component
function CommentSectionComponent({
  postId,
  initialCommentsCount,
}: CommentSectionProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { loadComments, addComment, state } = useSocial();

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [isSending, setIsSending] = useState(false);

  const comments = state.comments[postId] || [];
  const isLoading = state.isLoading && comments.length === 0;

  // Load comments on mount
  useEffect(() => {
    loadComments(postId);
  }, [postId, loadComments]);

  // Handle reply
  const handleReply = useCallback((comment: Comment) => {
    setReplyingTo(comment);
  }, []);

  // Cancel reply
  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Send comment
  const handleSend = useCallback(async () => {
    const text = commentText.trim();
    if (!text || isSending) return;

    setIsSending(true);
    lightImpact();

    try {
      await addComment(postId, text, replyingTo?.id);
      setCommentText("");
      setReplyingTo(null);
      successNotification();
    } catch (error) {
      errorNotification();
    } finally {
      setIsSending(false);
    }
  }, [commentText, isSending, postId, replyingTo, addComment]);

  // Render comment
  const renderComment = useCallback(
    ({ item }: { item: Comment }) => (
      <CommentItem comment={item} onReply={handleReply} />
    ),
    [handleReply],
  );

  // Key extractor
  const keyExtractor = useCallback((item: Comment) => item.id, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      {/* Comments List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1877F2" />
        </View>
      ) : comments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
          <Text style={styles.emptySubtext}>
            Hãy là người đầu tiên bình luận!
          </Text>
        </View>
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.commentsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Reply indicator */}
      {replyingTo && (
        <View style={styles.replyingContainer}>
          <Text style={styles.replyingText}>
            Đang trả lời{" "}
            <Text style={styles.replyingName}>
              {replyingTo.author.displayName}
            </Text>
          </Text>
          <TouchableOpacity onPress={cancelReply}>
            <Ionicons name="close" size={20} color="#65676B" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input */}
      <View
        style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}
      >
        <Image
          source={{
            uri:
              user?.avatar ||
              "https://ui-avatars.com/api/?name=Me&size=32&background=FF6B35&color=fff",
          }}
          style={styles.inputAvatar}
        />
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={
              replyingTo
                ? `Trả lời ${replyingTo.author.displayName}...`
                : "Viết bình luận..."
            }
            placeholderTextColor="#65676B"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={1000}
          />
          <View style={styles.inputActions}>
            <TouchableOpacity>
              <Ionicons name="camera-outline" size={22} color="#65676B" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="happy-outline" size={22} color="#65676B" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.sendButton,
            !commentText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!commentText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#1877F2" />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={commentText.trim() ? "#1877F2" : "#BCC0C4"}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#050505",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#65676B",
    marginTop: 4,
  },
  commentsList: {
    padding: 12,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: "#F0F2F5",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: "#050505",
  },
  commentText: {
    fontSize: 15,
    color: "#050505",
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingLeft: 12,
    gap: 12,
  },
  commentTime: {
    fontSize: 12,
    color: "#65676B",
  },
  commentAction: {
    fontSize: 12,
    fontWeight: "600",
    color: "#65676B",
  },
  commentActionActive: {
    color: "#1877F2",
  },
  commentReactions: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 11,
    color: "#65676B",
    marginLeft: 2,
  },
  viewRepliesButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingLeft: 12,
    gap: 6,
  },
  viewRepliesText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#65676B",
  },
  repliesContainer: {
    marginTop: 8,
  },
  replyingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F0F2F5",
    borderTopWidth: 1,
    borderTopColor: "#E4E6EB",
  },
  replyingText: {
    fontSize: 13,
    color: "#65676B",
  },
  replyingName: {
    fontWeight: "600",
    color: "#050505",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E4E6EB",
    backgroundColor: "#FFFFFF",
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F0F2F5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#050505",
    maxHeight: 100,
    paddingVertical: 0,
  },
  inputActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  sendButton: {
    padding: 8,
    marginLeft: 4,
    marginBottom: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export const CommentSection = memo(CommentSectionComponent);
export default CommentSection;
