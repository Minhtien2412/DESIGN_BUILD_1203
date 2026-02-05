/**
 * PostCard Component
 * Facebook-style post card with reactions, comments, shares
 *
 * @author AI Assistant
 * @date 23/12/2025
 */

import { useSocial } from "@/context/SocialContext";
import {
    Post,
    REACTION_COLORS,
    REACTION_EMOJIS,
    ReactionType,
} from "@/types/social";
import { formatCompactNumber, formatTimeAgo } from "@/utils/format";
import { lightImpact, mediumImpact } from "@/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { memo, useCallback, useState } from "react";
import {
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onAuthorPress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  showFullContent?: boolean;
}

function PostCardComponent({
  post,
  onPress,
  onAuthorPress,
  onCommentPress,
  onSharePress,
  showFullContent = false,
}: PostCardProps) {
  const router = useRouter();
  const { reactToPost, getPostReaction, toggleSavePost, isPostSaved } =
    useSocial();

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);

  const myReaction = getPostReaction(post.id) || post.myReaction;
  const isSaved = isPostSaved(post.id) || post.isSaved;

  // Navigate to user profile
  const handleUserPress = useCallback(() => {
    if (onAuthorPress) {
      onAuthorPress();
    } else {
      router.push(`/social/profile/${post.authorId}` as any);
    }
  }, [router, post.authorId, onAuthorPress]);

  // Navigate to post detail
  const handlePostPress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/social/post/${post.id}` as any);
    }
  }, [router, post.id, onPress]);

  // Handle reaction
  const handleReaction = useCallback(
    async (type: ReactionType | null) => {
      setShowReactionPicker(false);
      lightImpact();

      // Toggle if same reaction, otherwise set new
      const newReaction = myReaction === type ? null : type;
      await reactToPost(post.id, newReaction);
    },
    [post.id, myReaction, reactToPost],
  );

  // Quick like (tap)
  const handleQuickLike = useCallback(() => {
    if (!isLongPress) {
      handleReaction(myReaction ? null : "like");
    }
    setIsLongPress(false);
  }, [handleReaction, myReaction, isLongPress]);

  // Long press to show reaction picker
  const handleLongPress = useCallback(() => {
    setIsLongPress(true);
    mediumImpact();
    setShowReactionPicker(true);
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    lightImpact();
    await toggleSavePost(post.id);
  }, [post.id, toggleSavePost]);

  // Render top reactions
  const renderTopReactions = () => {
    if (post.reactionsCount === 0) return null;

    const topReactions = post.reactions.topReactions.slice(0, 3);

    return (
      <View style={styles.reactionsPreview}>
        <View style={styles.reactionIcons}>
          {topReactions.map((type, index) => (
            <View
              key={type}
              style={[
                styles.reactionIcon,
                { marginLeft: index > 0 ? -8 : 0, zIndex: 3 - index },
              ]}
            >
              <Text style={styles.reactionEmoji}>{REACTION_EMOJIS[type]}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.reactionsCount}>
          {formatCompactNumber(post.reactionsCount)}
        </Text>
      </View>
    );
  };

  // Render reaction picker
  const renderReactionPicker = () => {
    if (!showReactionPicker) return null;

    const reactions: ReactionType[] = [
      "like",
      "love",
      "haha",
      "wow",
      "sad",
      "angry",
    ];

    return (
      <View style={styles.reactionPicker}>
        {reactions.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.reactionPickerItem,
              myReaction === type && styles.reactionPickerItemActive,
            ]}
            onPress={() => handleReaction(type)}
          >
            <Text style={styles.reactionPickerEmoji}>
              {REACTION_EMOJIS[type]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render media
  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    const mediaCount = post.media.length;

    if (mediaCount === 1) {
      const media = post.media[0];
      return (
        <TouchableOpacity onPress={handlePostPress} activeOpacity={0.9}>
          <Image
            source={{ uri: media.url }}
            style={styles.singleImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    // Grid layout for multiple images
    return (
      <TouchableOpacity onPress={handlePostPress} activeOpacity={0.9}>
        <View style={styles.mediaGrid}>
          {post.media.slice(0, 4).map((media, index) => (
            <View
              key={media.id}
              style={[
                styles.mediaGridItem,
                mediaCount === 2 && styles.mediaGridItem2,
                mediaCount === 3 && index === 0 && styles.mediaGridItem3First,
                mediaCount >= 4 && styles.mediaGridItem4,
              ]}
            >
              <Image
                source={{ uri: media.url }}
                style={styles.gridImage}
                resizeMode="cover"
              />
              {index === 3 && mediaCount > 4 && (
                <View style={styles.moreOverlay}>
                  <Text style={styles.moreText}>+{mediaCount - 4}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  // Privacy icon
  const getPrivacyIcon = () => {
    switch (post.privacy) {
      case "public":
        return "globe-outline";
      case "friends":
        return "people-outline";
      case "only_me":
        return "lock-closed-outline";
      default:
        return "people-outline";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleUserPress} style={styles.authorInfo}>
          <Image
            source={{
              uri:
                post.author.avatar ||
                "https://ui-avatars.com/api/?name=User&size=40&background=FF6B35&color=fff",
            }}
            style={styles.avatar}
          />
          <View style={styles.authorText}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{post.author.displayName}</Text>
              {post.author.verified && (
                <Ionicons name="checkmark-circle" size={14} color="#1877F2" />
              )}
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.timeText}>
                {formatTimeAgo(post.createdAt)}
              </Text>
              <Text style={styles.dot}>·</Text>
              <Ionicons name={getPrivacyIcon()} size={12} color="#65676B" />
              {post.feeling && (
                <>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.feelingText}>{post.feeling}</Text>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#65676B" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <TouchableOpacity onPress={handlePostPress} activeOpacity={0.9}>
        <Text
          style={styles.content}
          numberOfLines={showFullContent ? undefined : 5}
        >
          {post.content}
        </Text>
      </TouchableOpacity>

      {/* Media */}
      {renderMedia()}

      {/* Engagement Stats */}
      <View style={styles.engagementStats}>
        {renderTopReactions()}
        <View style={styles.statsRight}>
          {post.commentsCount > 0 && (
            <Text style={styles.statsText}>
              {formatCompactNumber(post.commentsCount)} bình luận
            </Text>
          )}
          {post.sharesCount > 0 && (
            <Text style={styles.statsText}>
              {formatCompactNumber(post.sharesCount)} chia sẻ
            </Text>
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Action Buttons */}
      <View style={styles.actions}>
        {/* Reaction Picker Overlay */}
        {renderReactionPicker()}

        {/* Like Button */}
        <Pressable
          style={styles.actionButton}
          onPress={handleQuickLike}
          onLongPress={handleLongPress}
          delayLongPress={300}
        >
          {myReaction ? (
            <>
              <Text style={styles.actionEmoji}>
                {REACTION_EMOJIS[myReaction]}
              </Text>
              <Text
                style={[
                  styles.actionText,
                  { color: REACTION_COLORS[myReaction] },
                ]}
              >
                {myReaction === "like"
                  ? "Thích"
                  : myReaction === "love"
                    ? "Yêu thích"
                    : myReaction === "haha"
                      ? "Haha"
                      : myReaction === "wow"
                        ? "Wow"
                        : myReaction === "sad"
                          ? "Buồn"
                          : "Phẫn nộ"}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="thumbs-up-outline" size={20} color="#65676B" />
              <Text style={styles.actionText}>Thích</Text>
            </>
          )}
        </Pressable>

        {/* Comment Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onCommentPress || handlePostPress}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#65676B" />
          <Text style={styles.actionText}>Bình luận</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.actionButton} onPress={onSharePress}>
          <Ionicons name="arrow-redo-outline" size={20} color="#65676B" />
          <Text style={styles.actionText}>Chia sẻ</Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isSaved ? "#1877F2" : "#65676B"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorText: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#050505",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  timeText: {
    fontSize: 13,
    color: "#65676B",
  },
  dot: {
    fontSize: 13,
    color: "#65676B",
    marginHorizontal: 4,
  },
  feelingText: {
    fontSize: 13,
    color: "#65676B",
  },
  menuButton: {
    padding: 8,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    color: "#050505",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  singleImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  mediaGridItem: {
    width: "50%",
    aspectRatio: 1,
    padding: 1,
  },
  mediaGridItem2: {
    width: "50%",
  },
  mediaGridItem3First: {
    width: "100%",
    aspectRatio: 1.5,
  },
  mediaGridItem4: {
    width: "50%",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
  },
  engagementStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reactionsPreview: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionIcons: {
    flexDirection: "row",
  },
  reactionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionsCount: {
    fontSize: 14,
    color: "#65676B",
    marginLeft: 6,
  },
  statsRight: {
    flexDirection: "row",
    gap: 12,
  },
  statsText: {
    fontSize: 14,
    color: "#65676B",
  },
  divider: {
    height: 1,
    backgroundColor: "#E4E6EB",
    marginHorizontal: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    position: "relative",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  actionEmoji: {
    fontSize: 18,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#65676B",
  },
  saveButton: {
    padding: 10,
  },
  reactionPicker: {
    position: "absolute",
    bottom: "100%",
    left: 8,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  reactionPickerItem: {
    padding: 6,
  },
  reactionPickerItemActive: {
    transform: [{ scale: 1.2 }],
  },
  reactionPickerEmoji: {
    fontSize: 28,
  },
});

export const PostCard = memo(PostCardComponent);
export default PostCard;
