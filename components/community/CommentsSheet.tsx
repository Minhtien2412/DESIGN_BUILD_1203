/**
 * CommentsSheet - Bottom Sheet for Comments & Reviews
 * ====================================================
 *
 * Facebook/TikTok style bottom sheet for viewing and posting comments.
 * Features:
 * - Hierarchical nested replies (reply to reply of reply)
 * - Comments linked to contentId for database storage
 * - Views/likes tracking per content
 * - Collapsible reply threads
 * - Visual indentation for reply levels
 * - Rating/Stars (optional for reviews)
 *
 * Database Structure Ready:
 * - contentId: links comments to specific post/video/product
 * - parentId: enables tree structure for nested replies
 * - level: tracks nesting depth for UI indentation
 * - views/likes: engagement metrics
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 * @updated 2026-01-22 - Added hierarchical nested replies
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, {
    createContext,
    memo,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    Layout,
    SlideInDown,
    SlideOutDown,
    runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_NESTING_LEVEL = 4; // Maximum depth for visual indentation
const INDENT_WIDTH = 32; // Pixels to indent per level

// ============================================
// Types - Database Ready Structure
// ============================================
export interface CommentAuthor {
  id: string;
  name: string;
  avatar?: string;
  isVerified?: boolean;
  badge?: "top_contributor" | "expert" | "staff"; // Special badges
}

export interface Comment {
  id: string;
  /** Links comment to specific content (post/video/product) */
  contentId: string;
  /** Parent comment ID for nested replies - null for root comments */
  parentId: string | null;
  /** Nesting level (0 = root, 1 = reply, 2 = reply to reply, etc.) */
  level: number;
  author: CommentAuthor;
  content: string;
  createdAt: string;
  updatedAt?: string;
  /** Number of likes on this comment */
  likes: number;
  isLiked?: boolean;
  /** Rating 1-5 stars (for reviews only) */
  rating?: number;
  /** Direct replies to this comment */
  replies?: Comment[];
  /** Total count of all nested replies */
  replyCount?: number;
  /** Is this comment expanded to show replies */
  isExpanded?: boolean;
  /** Parent comment author name (for "replying to X" display) */
  replyToAuthor?: string;
  /** Views count (for analytics) */
  views?: number;
  /** Is this comment pinned */
  isPinned?: boolean;
  /** Is this the author of the original content */
  isContentAuthor?: boolean;
}

/** Content engagement stats stored in database */
export interface ContentEngagement {
  contentId: string;
  contentType: "video" | "post" | "product" | "news";
  totalComments: number;
  totalViews: number;
  totalLikes: number;
  averageRating?: number;
  ratingCount?: number;
}

export interface CommentsSheetOptions {
  /** Content ID (video, post, product) - Required for database linking */
  contentId: string;
  /** Content type */
  contentType: "video" | "post" | "product" | "news";
  /** Title shown in header */
  title?: string;
  /** Whether to show rating stars (for reviews) */
  showRating?: boolean;
  /** Placeholder text for input */
  placeholder?: string;
  /** Content engagement stats */
  engagement?: ContentEngagement;
  /** Callback when a comment is posted */
  onCommentPost?: (comment: {
    content: string;
    parentId: string | null;
    rating?: number;
  }) => void;
  /** Callback when a comment is liked */
  onCommentLike?: (commentId: string) => void;
  /** Callback to load more replies for a comment */
  onLoadReplies?: (commentId: string) => Promise<Comment[]>;
}

interface CommentsSheetContextType {
  open: (options: CommentsSheetOptions) => void;
  close: () => void;
  isOpen: boolean;
}

interface ReplyingTo {
  commentId: string;
  authorName: string;
  level: number;
}

// ============================================
// Context
// ============================================
const CommentsSheetContext = createContext<CommentsSheetContextType | null>(
  null,
);

// Noop fallback when provider is not available
const noopCommentsSheet: CommentsSheetContextType = {
  open: () => console.warn("[CommentsSheet] Provider not available"),
  close: () => {},
  isOpen: false,
};

export const useCommentsSheet = (): CommentsSheetContextType => {
  const context = useContext(CommentsSheetContext);
  // Return noop fallback instead of throwing to prevent crashes during hydration
  if (!context) {
    if (__DEV__) {
      console.warn(
        "[CommentsSheet] useCommentsSheet called outside of CommentsSheetProvider",
      );
    }
    return noopCommentsSheet;
  }
  return context;
};

// ============================================
// Helper Functions
// ============================================
function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút`;
  if (diffHours < 24) return `${diffHours} giờ`;
  if (diffDays < 7) return `${diffDays} ngày`;
  return past.toLocaleDateString("vi-VN");
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Generate hierarchical mock comments with nested replies
function generateMockComments(
  count: number,
  contentId: string,
): { comments: Comment[]; engagement: ContentEngagement } {
  const authors: CommentAuthor[] = [
    { id: "u1", name: "Nguyễn Văn A", isVerified: true, badge: "expert" },
    { id: "u2", name: "Trần Thị B", avatar: "https://i.pravatar.cc/100?img=5" },
    {
      id: "u3",
      name: "Lê Minh C",
      avatar: "https://i.pravatar.cc/100?img=12",
      badge: "top_contributor",
    },
    { id: "u4", name: "Phạm Hồng D" },
    {
      id: "u5",
      name: "Hoàng Văn E",
      avatar: "https://i.pravatar.cc/100?img=8",
      isVerified: true,
    },
    { id: "u6", name: "Vũ Thị F", avatar: "https://i.pravatar.cc/100?img=25" },
    { id: "u7", name: "Đinh Quang G", badge: "staff" },
    {
      id: "u8",
      name: "Bùi Ngọc H",
      avatar: "https://i.pravatar.cc/100?img=33",
    },
  ];

  const sampleContents = [
    "Thiết kế đẹp quá! Rất phù hợp với không gian hiện đại.",
    "Cho mình hỏi giá này có bao gồm thi công không ạ?",
    "Mình đã sử dụng dịch vụ này, rất hài lòng!",
    "Có mẫu nào khác không shop?",
    "Chất liệu gỗ này có bền không vậy?",
    "Nhìn sang trọng quá, có giao ngoại thành không shop?",
    "Video hữu ích lắm, cảm ơn bạn!",
    "Giá hơi cao nhưng chất lượng xứng đáng.",
    "Mình sẽ đặt hàng tuần sau!",
    "Có thể xem thực tế ở showroom không?",
  ];

  const replyContents = [
    "Cảm ơn bạn đã quan tâm! Giá này chưa bao gồm thi công nhé.",
    "Dạ có ạ, bạn xem thêm các mẫu khác trong album nhé!",
    "Chính xác ạ, gỗ công nghiệp cao cấp rất bền.",
    "Đồng ý với bạn! Mình cũng thấy rất hài lòng.",
    "Shop có giao ngoại thành, phí ship tính theo khoảng cách nhé.",
    "Showroom ở quận 7, bạn ghé tham quan nhé!",
    "Mình cũng nghĩ vậy, đáng đầu tư.",
    "Bạn liên hệ hotline để được tư vấn thêm nhé!",
  ];

  const nestedReplyContents = [
    "Cảm ơn bạn đã giải đáp!",
    "OK mình hiểu rồi, sẽ ghé xem.",
    "Vậy còn bảo hành thì sao?",
    "Bạn có thể share review sau khi dùng không?",
    "Mình sẽ liên hệ ngay!",
    "Có khuyến mãi gì không shop?",
    "Cảm ơn, mình sẽ cân nhắc.",
    "Rất hữu ích!",
  ];

  const comments: Comment[] = [];
  let totalLikes = 0;
  let totalRating = 0;
  let ratingCount = 0;
  let commentIdCounter = 1;

  // Generate root comments
  for (let i = 0; i < count; i++) {
    const author = authors[Math.floor(Math.random() * authors.length)];
    const rating =
      Math.random() > 0.6 ? Math.floor(Math.random() * 2) + 4 : undefined;
    const likes = Math.floor(Math.random() * 500);
    totalLikes += likes;

    if (rating) {
      totalRating += rating;
      ratingCount++;
    }

    const rootComment: Comment = {
      id: `comment-${commentIdCounter++}`,
      contentId,
      parentId: null,
      level: 0,
      author,
      content: sampleContents[i % sampleContents.length],
      createdAt: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      likes,
      isLiked: Math.random() > 0.8,
      rating,
      replies: [],
      replyCount: 0,
      isExpanded: i < 3, // First 3 comments expanded by default
      isPinned: i === 0 && Math.random() > 0.5,
      isContentAuthor: Math.random() > 0.9,
    };

    // Add first level replies (50% chance)
    if (Math.random() > 0.5) {
      const replyCountNum = Math.floor(Math.random() * 4) + 1;
      for (let j = 0; j < replyCountNum; j++) {
        const replyAuthor = authors[Math.floor(Math.random() * authors.length)];
        const replyLikes = Math.floor(Math.random() * 100);
        totalLikes += replyLikes;

        const reply: Comment = {
          id: `comment-${commentIdCounter++}`,
          contentId,
          parentId: rootComment.id,
          level: 1,
          author: replyAuthor,
          content: replyContents[j % replyContents.length],
          createdAt: new Date(
            new Date(rootComment.createdAt).getTime() +
              Math.random() * 12 * 60 * 60 * 1000,
          ).toISOString(),
          likes: replyLikes,
          isLiked: Math.random() > 0.85,
          replyToAuthor: rootComment.author.name,
          replies: [],
          replyCount: 0,
          isExpanded: j < 2,
        };

        // Add second level replies (30% chance)
        if (Math.random() > 0.7) {
          const nestedCount = Math.floor(Math.random() * 3) + 1;
          for (let k = 0; k < nestedCount; k++) {
            const nestedAuthor =
              authors[Math.floor(Math.random() * authors.length)];
            const nestedLikes = Math.floor(Math.random() * 50);
            totalLikes += nestedLikes;

            const nestedReply: Comment = {
              id: `comment-${commentIdCounter++}`,
              contentId,
              parentId: reply.id,
              level: 2,
              author: nestedAuthor,
              content: nestedReplyContents[k % nestedReplyContents.length],
              createdAt: new Date(
                new Date(reply.createdAt).getTime() +
                  Math.random() * 6 * 60 * 60 * 1000,
              ).toISOString(),
              likes: nestedLikes,
              isLiked: Math.random() > 0.9,
              replyToAuthor: reply.author.name,
              replies: [],
              replyCount: 0,
            };

            // Add third level replies (20% chance)
            if (Math.random() > 0.8) {
              const deepReplyAuthor =
                authors[Math.floor(Math.random() * authors.length)];
              const deepLikes = Math.floor(Math.random() * 20);
              totalLikes += deepLikes;

              nestedReply.replies!.push({
                id: `comment-${commentIdCounter++}`,
                contentId,
                parentId: nestedReply.id,
                level: 3,
                author: deepReplyAuthor,
                content: "Đồng ý với bạn! 👍",
                createdAt: new Date(
                  new Date(nestedReply.createdAt).getTime() +
                    Math.random() * 3 * 60 * 60 * 1000,
                ).toISOString(),
                likes: deepLikes,
                isLiked: Math.random() > 0.95,
                replyToAuthor: nestedAuthor.name,
                replies: [],
                replyCount: 0,
              });
              nestedReply.replyCount = 1;
            }

            reply.replies!.push(nestedReply);
            reply.replyCount =
              (reply.replyCount || 0) + 1 + (nestedReply.replyCount || 0);
          }
        }

        rootComment.replies!.push(reply);
        rootComment.replyCount =
          (rootComment.replyCount || 0) + 1 + (reply.replyCount || 0);
      }
    }

    comments.push(rootComment);
  }

  // Sort by pinned first, then by likes
  comments.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.likes - a.likes;
  });

  const engagement: ContentEngagement = {
    contentId,
    contentType: "post",
    totalComments: commentIdCounter - 1,
    totalViews: Math.floor(Math.random() * 50000) + 1000,
    totalLikes,
    averageRating: ratingCount > 0 ? totalRating / ratingCount : undefined,
    ratingCount: ratingCount > 0 ? ratingCount : undefined,
  };

  return { comments, engagement };
}

// ============================================
// Nested Comment Item Component
// ============================================
interface CommentItemProps {
  comment: Comment;
  showRating?: boolean;
  onLike: (commentId: string) => void;
  onReply: (replyInfo: ReplyingTo) => void;
  onToggleExpand: (commentId: string) => void;
}

const CommentItem = memo(
  ({
    comment,
    showRating,
    onLike,
    onReply,
    onToggleExpand,
  }: CommentItemProps) => {
    const [isLiked, setIsLiked] = useState(comment.isLiked ?? false);
    const [likes, setLikes] = useState(comment.likes);
    const [isExpanded, setIsExpanded] = useState(comment.isExpanded ?? false);

    const handleLike = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsLiked((prev) => !prev);
      setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
      onLike(comment.id);
    }, [comment.id, onLike, isLiked]);

    const handleReply = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onReply({
        commentId: comment.id,
        authorName: comment.author.name,
        level: comment.level,
      });
    }, [comment.id, comment.author.name, comment.level, onReply]);

    const handleToggleExpand = useCallback(() => {
      setIsExpanded((prev) => !prev);
      onToggleExpand(comment.id);
    }, [comment.id, onToggleExpand]);

    const renderStars = (rating: number) => (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={12}
            color={star <= rating ? "#FFD700" : "#CCC"}
          />
        ))}
      </View>
    );

    const getBadgeInfo = (badge?: string) => {
      switch (badge) {
        case "top_contributor":
          return { label: "Top", color: "#FF6B35", bg: "#FFF3ED" };
        case "expert":
          return { label: "Chuyên gia", color: "#1877F2", bg: "#E7F3FF" };
        case "staff":
          return { label: "NV", color: "#00A86B", bg: "#E8F5E9" };
        default:
          return null;
      }
    };

    const badgeInfo = getBadgeInfo(comment.author.badge);
    const indent = Math.min(comment.level, MAX_NESTING_LEVEL) * INDENT_WIDTH;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const totalReplies = comment.replyCount || 0;

    return (
      <Animated.View layout={Layout.springify()}>
        {/* Main Comment */}
        <View style={[styles.commentItem, { marginLeft: indent }]}>
          {/* Reply Thread Line */}
          {comment.level > 0 && (
            <View style={[styles.threadLine, { left: indent - 16 }]} />
          )}

          {/* Avatar */}
          {comment.author.avatar ? (
            <Image
              source={{ uri: comment.author.avatar }}
              style={[
                styles.commentAvatar,
                comment.level > 0 && styles.commentAvatarSmall,
              ]}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.commentAvatarPlaceholder,
                comment.level > 0 && styles.commentAvatarSmall,
              ]}
            >
              <Ionicons
                name="person"
                size={comment.level > 0 ? 14 : 18}
                color="#999"
              />
            </View>
          )}

          <View style={styles.commentContent}>
            {/* Header with author info */}
            <View style={styles.commentHeader}>
              <View style={styles.authorInfo}>
                {/* Replying to indicator */}
                {comment.replyToAuthor && (
                  <Text style={styles.replyToText}>
                    <Ionicons
                      name="return-down-forward"
                      size={12}
                      color="#65676B"
                    />{" "}
                    {comment.replyToAuthor}
                  </Text>
                )}

                <View style={styles.authorNameRow}>
                  <Text style={styles.commentAuthorName}>
                    {comment.author.name}
                  </Text>

                  {comment.author.isVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#1877F2"
                      style={{ marginLeft: 4 }}
                    />
                  )}

                  {comment.isContentAuthor && (
                    <View style={styles.authorBadge}>
                      <Text style={styles.authorBadgeText}>Tác giả</Text>
                    </View>
                  )}

                  {badgeInfo && (
                    <View
                      style={[
                        styles.userBadge,
                        { backgroundColor: badgeInfo.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.userBadgeText,
                          { color: badgeInfo.color },
                        ]}
                      >
                        {badgeInfo.label}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.commentTime}>
                {formatTimeAgo(comment.createdAt)}
              </Text>
            </View>

            {/* Pinned indicator */}
            {comment.isPinned && (
              <View style={styles.pinnedBadge}>
                <Ionicons name="pin" size={12} color="#FF6B35" />
                <Text style={styles.pinnedText}>Đã ghim</Text>
              </View>
            )}

            {/* Rating Stars */}
            {showRating && comment.rating && renderStars(comment.rating)}

            {/* Comment Text */}
            <Text style={styles.commentText}>{comment.content}</Text>

            {/* Actions */}
            <View style={styles.commentActions}>
              <TouchableOpacity
                style={styles.commentAction}
                onPress={handleLike}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={16}
                  color={isLiked ? "#FF2D55" : "#666"}
                />
                <Text
                  style={[
                    styles.commentActionText,
                    isLiked && { color: "#FF2D55" },
                  ]}
                >
                  {formatNumber(likes)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.commentAction}
                onPress={handleReply}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#666" />
                <Text style={styles.commentActionText}>Trả lời</Text>
              </TouchableOpacity>

              {/* View/Hide Replies Button */}
              {hasReplies && (
                <TouchableOpacity
                  style={styles.commentAction}
                  onPress={handleToggleExpand}
                >
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#1877F2"
                  />
                  <Text style={styles.viewRepliesText}>
                    {isExpanded
                      ? "Ẩn phản hồi"
                      : `Xem ${totalReplies} phản hồi`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Nested Replies - Recursive */}
        {hasReplies && isExpanded && (
          <Animated.View entering={FadeIn.duration(200)}>
            {comment.replies!.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                showRating={false}
                onLike={onLike}
                onReply={onReply}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </Animated.View>
        )}
      </Animated.View>
    );
  },
);

CommentItem.displayName = "CommentItem";

// ============================================
// Rating Stars Input Component
// ============================================
interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
}

const RatingInput = memo(({ value, onChange }: RatingInputProps) => {
  return (
    <View style={styles.ratingInput}>
      <Text style={styles.ratingLabel}>Đánh giá:</Text>
      <View style={styles.ratingStars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(star);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
          >
            <Ionicons
              name={star <= value ? "star" : "star-outline"}
              size={28}
              color={star <= value ? "#FFD700" : "#CCC"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

RatingInput.displayName = "RatingInput";

// ============================================
// Engagement Stats Component
// ============================================
interface EngagementStatsProps {
  engagement?: ContentEngagement;
}

const EngagementStats = memo(({ engagement }: EngagementStatsProps) => {
  if (!engagement) return null;

  return (
    <View style={styles.engagementStats}>
      <View style={styles.statItem}>
        <Ionicons name="eye-outline" size={16} color="#65676B" />
        <Text style={styles.statText}>
          {formatNumber(engagement.totalViews)} lượt xem
        </Text>
      </View>

      <View style={styles.statDivider} />

      <View style={styles.statItem}>
        <Ionicons name="heart-outline" size={16} color="#65676B" />
        <Text style={styles.statText}>
          {formatNumber(engagement.totalLikes)} lượt thích
        </Text>
      </View>

      {engagement.averageRating && (
        <>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.statText}>
              {engagement.averageRating.toFixed(1)} ({engagement.ratingCount})
            </Text>
          </View>
        </>
      )}
    </View>
  );
});

EngagementStats.displayName = "EngagementStats";

// ============================================
// Provider Component
// ============================================
export function CommentsSheetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false); // Track if modal should render (delayed unmount)
  const [options, setOptions] = useState<CommentsSheetOptions | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [engagement, setEngagement] = useState<ContentEngagement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  const open = useCallback((opts: CommentsSheetOptions) => {
    setOptions(opts);
    setShouldRender(true); // Start rendering first
    // Small delay to ensure DOM is ready before animation
    setTimeout(() => setIsVisible(true), 10);
    setIsLoading(true);
    setNewComment("");
    setRating(0);
    setReplyingTo(null);

    // Simulate loading comments from database by contentId
    setTimeout(() => {
      const { comments: mockComments, engagement: mockEngagement } =
        generateMockComments(12, opts.contentId);
      setComments(mockComments);
      setEngagement(opts.engagement || mockEngagement);
      setIsLoading(false);
    }, 500);
  }, []);

  // Called when exit animation completes
  const onExitComplete = useCallback(() => {
    setShouldRender(false);
    setOptions(null);
    setComments([]);
    setEngagement(null);
  }, []);

  const close = useCallback(() => {
    Keyboard.dismiss();
    setIsVisible(false);
    // Fallback timer in case animation callback doesn't fire
    setTimeout(onExitComplete, 350);
  }, [onExitComplete]);

  const value = useMemo(
    () => ({ open, close, isOpen: isVisible }),
    [open, close, isVisible],
  );

  const handleLike = useCallback(
    (commentId: string) => {
      options?.onCommentLike?.(commentId);
    },
    [options],
  );

  const handleReply = useCallback((replyInfo: ReplyingTo) => {
    setReplyingTo(replyInfo);
    inputRef.current?.focus();
  }, []);

  // Helper to toggle expand state recursively
  const toggleExpandRecursive = useCallback(
    (comment: Comment, targetId: string): Comment => {
      if (comment.id === targetId) {
        return { ...comment, isExpanded: !comment.isExpanded };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: comment.replies.map((reply) =>
            toggleExpandRecursive(reply, targetId),
          ),
        };
      }
      return comment;
    },
    [],
  );

  const handleToggleExpand = useCallback(
    (commentId: string) => {
      setComments((prev) =>
        prev.map((comment) => toggleExpandRecursive(comment, commentId)),
      );
    },
    [toggleExpandRecursive],
  );

  // Helper to check if a comment has descendant with target id
  const hasDescendant = useCallback(
    (comment: Comment, targetId: string): boolean => {
      if (comment.id === targetId) return true;
      if (comment.replies) {
        return comment.replies.some((r) => hasDescendant(r, targetId));
      }
      return false;
    },
    [],
  );

  // Helper to add reply recursively
  const addReplyRecursive = useCallback(
    (comment: Comment, parentId: string, newReply: Comment): Comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [newReply, ...(comment.replies || [])],
          replyCount: (comment.replyCount || 0) + 1,
          isExpanded: true,
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: comment.replies.map((reply) =>
            addReplyRecursive(reply, parentId, newReply),
          ),
          replyCount: comment.replies.some(
            (r) => r.id === parentId || hasDescendant(r, parentId),
          )
            ? (comment.replyCount || 0) + 1
            : comment.replyCount,
        };
      }
      return comment;
    },
    [hasDescendant],
  );

  const handlePostComment = useCallback(() => {
    if (!newComment.trim() || !options) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newLevel = replyingTo
      ? Math.min(replyingTo.level + 1, MAX_NESTING_LEVEL)
      : 0;

    const comment: Comment = {
      id: `new-${Date.now()}`,
      contentId: options.contentId,
      parentId: replyingTo?.commentId || null,
      level: newLevel,
      author: {
        id: "current-user",
        name: "Bạn",
        isVerified: false,
      },
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      rating: options.showRating && !replyingTo ? rating : undefined,
      replyToAuthor: replyingTo?.authorName,
      replies: [],
      replyCount: 0,
    };

    if (replyingTo) {
      // Add as nested reply
      setComments((prev) =>
        prev.map((c) => addReplyRecursive(c, replyingTo.commentId, comment)),
      );
    } else {
      // Add as root comment
      setComments((prev) => [comment, ...prev]);
    }

    // Update engagement
    setEngagement((prev) =>
      prev
        ? {
            ...prev,
            totalComments: prev.totalComments + 1,
          }
        : null,
    );

    setNewComment("");
    setRating(0);
    setReplyingTo(null);
    Keyboard.dismiss();

    options.onCommentPost?.({
      content: newComment.trim(),
      parentId: replyingTo?.commentId || null,
      rating: options.showRating && !replyingTo ? rating : undefined,
    });
  }, [newComment, rating, options, replyingTo, addReplyRecursive]);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const totalComments = engagement?.totalComments || comments.length;

  // Don't render anything if not needed
  if (!shouldRender) {
    return (
      <CommentsSheetContext.Provider value={value}>
        {children}
      </CommentsSheetContext.Provider>
    );
  }

  return (
    <CommentsSheetContext.Provider value={value}>
      {children}

      <Modal
        visible={shouldRender}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={close}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={close}>
          {isVisible && (
            <Animated.View
              style={styles.backdropInner}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
            />
          )}
        </Pressable>

        {/* Sheet */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={0}
        >
          {isVisible && (
            <Animated.View
              style={[styles.sheet, { paddingBottom: insets.bottom }]}
              entering={SlideInDown.springify().damping(20)}
              exiting={SlideOutDown.duration(200).withCallback((finished) => {
                "worklet";
                if (finished) {
                  runOnJS(onExitComplete)();
                }
              })}
            >
              {/* Handle */}
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>

              {/* Header */}
              <View style={styles.sheetHeader}>
                <View style={styles.headerLeft}>
                  <Text style={styles.sheetTitle}>
                    {options?.title || "Bình luận"}
                  </Text>
                  <Text style={styles.commentCount}>
                    {formatNumber(totalComments)} bình luận
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeSheetButton}
                  onPress={close}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Engagement Stats */}
              <EngagementStats engagement={engagement ?? undefined} />

              {/* Comments List */}
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1877F2" />
                  <Text style={styles.loadingText}>Đang tải bình luận...</Text>
                </View>
              ) : comments.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubble-outline" size={48} color="#CCC" />
                  <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
                  <Text style={styles.emptySubtext}>
                    Hãy là người đầu tiên bình luận!
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={styles.commentsScroll}
                  contentContainerStyle={styles.commentsList}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      showRating={options?.showRating}
                      onLike={handleLike}
                      onReply={handleReply}
                      onToggleExpand={handleToggleExpand}
                    />
                  ))}
                </ScrollView>
              )}

              {/* Input Area */}
              <View style={styles.inputArea}>
                {/* Rating Input (for reviews only on root comments) */}
                {options?.showRating && !replyingTo && (
                  <RatingInput value={rating} onChange={setRating} />
                )}

                {/* Reply indicator */}
                {replyingTo && (
                  <Animated.View
                    style={styles.replyIndicator}
                    entering={FadeIn.duration(150)}
                  >
                    <View style={styles.replyIndicatorContent}>
                      <Ionicons
                        name="return-down-forward"
                        size={16}
                        color="#1877F2"
                      />
                      <Text style={styles.replyText}>
                        Đang trả lời{" "}
                        <Text style={styles.replyName}>
                          {replyingTo.authorName}
                        </Text>
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={cancelReply}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close-circle" size={20} color="#666" />
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {/* Input Row */}
                <View style={styles.inputRow}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      ref={inputRef}
                      style={styles.textInput}
                      placeholder={
                        replyingTo
                          ? `Trả lời ${replyingTo.authorName}...`
                          : options?.placeholder || "Viết bình luận..."
                      }
                      placeholderTextColor="#999"
                      value={newComment}
                      onChangeText={setNewComment}
                      multiline
                      maxLength={500}
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      !newComment.trim() && styles.sendButtonDisabled,
                    ]}
                    onPress={handlePostComment}
                    disabled={!newComment.trim()}
                  >
                    <Ionicons
                      name="send"
                      size={20}
                      color={newComment.trim() ? "#1877F2" : "#CCC"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </CommentsSheetContext.Provider>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  keyboardAvoid: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1E21",
  },
  commentCount: {
    fontSize: 14,
    color: "#65676B",
    marginLeft: 8,
  },
  closeSheetButton: {
    padding: 4,
  },
  // Engagement Stats
  engagementStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: "#65676B",
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#DDD",
    marginHorizontal: 12,
  },
  // Loading & Empty states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#65676B",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#65676B",
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: "#8A8D91",
  },
  // Comments List
  commentsScroll: {
    flex: 1,
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  // Comment Item
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
    position: "relative",
  },
  threadLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#E4E6EB",
    borderRadius: 1,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  commentAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  authorInfo: {
    flex: 1,
  },
  replyToText: {
    fontSize: 11,
    color: "#65676B",
    marginBottom: 2,
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1E21",
  },
  commentTime: {
    fontSize: 12,
    color: "#8A8D91",
    marginLeft: 8,
  },
  // Badges
  authorBadge: {
    backgroundColor: "#E7F3FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  authorBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1877F2",
  },
  userBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  userBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  pinnedText: {
    fontSize: 11,
    color: "#FF6B35",
    fontWeight: "500",
  },
  // Stars
  starsRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  // Comment Text
  commentText: {
    fontSize: 14,
    color: "#1C1E21",
    lineHeight: 20,
  },
  // Actions
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 16,
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: "#65676B",
  },
  viewRepliesText: {
    fontSize: 12,
    color: "#1877F2",
    fontWeight: "500",
  },
  // Input Area
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  ratingInput: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    color: "#65676B",
    marginRight: 12,
  },
  ratingStars: {
    flexDirection: "row",
    gap: 4,
  },
  replyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E7F3FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#1877F2",
  },
  replyIndicatorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  replyText: {
    fontSize: 13,
    color: "#65676B",
  },
  replyName: {
    fontWeight: "600",
    color: "#1877F2",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 14,
    color: "#1C1E21",
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default CommentsSheetProvider;
