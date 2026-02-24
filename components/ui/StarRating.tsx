/**
 * Star Rating Component - Shopee Style
 * 5-star rating system with display and input modes
 */

import type { RatingSummary } from "@/types/profile";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

// ============================================================================
// Star Rating Display
// ============================================================================

interface StarRatingDisplayProps {
  score: number; // 0-5 (can be decimal like 4.9)
  size?: number;
  showScore?: boolean;
  showCount?: boolean;
  count?: number;
  color?: string;
  style?: object;
}

export function StarRatingDisplay({
  score,
  size = 14,
  showScore = true,
  showCount = false,
  count = 0,
  color = "#FFB800",
  style,
}: StarRatingDisplayProps) {
  const fullStars = Math.floor(score);
  const hasHalfStar = score - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={[styles.ratingContainer, style]}>
      <View style={styles.starsRow}>
        {/* Full stars */}
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <Ionicons key={`full-${i}`} name="star" size={size} color={color} />
          ))}

        {/* Half star */}
        {hasHalfStar && <Ionicons name="star-half" size={size} color={color} />}

        {/* Empty stars */}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <Ionicons
              key={`empty-${i}`}
              name="star-outline"
              size={size}
              color={color}
            />
          ))}
      </View>

      {showScore && (
        <Text style={[styles.scoreText, { color: "#1A1A1A", marginLeft: 4 }]}>
          {score.toFixed(1)}
        </Text>
      )}

      {showCount && count > 0 && (
        <Text style={styles.countText}>({count})</Text>
      )}
    </View>
  );
}

// ============================================================================
// Star Rating Input
// ============================================================================

interface StarRatingInputProps {
  value: number;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
  size?: number;
  color?: string;
  disabled?: boolean;
}

export function StarRatingInput({
  value,
  onChange,
  size = 32,
  color = "#FFB800",
  disabled = false,
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const handlePress = (star: number) => {
    if (!disabled) {
      onChange(star as 1 | 2 | 3 | 4 | 5);
    }
  };

  const displayValue = hoverValue || value;

  return (
    <View style={styles.inputContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handlePress(star)}
          onPressIn={() => setHoverValue(star)}
          onPressOut={() => setHoverValue(0)}
          disabled={disabled}
          style={styles.starButton}
        >
          <Ionicons
            name={star <= displayValue ? "star" : "star-outline"}
            size={size}
            color={star <= displayValue ? color : "#D1D1D6"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ============================================================================
// Rating Summary Card (Shopee-style)
// ============================================================================

interface RatingSummaryCardProps {
  summary: RatingSummary;
  primaryColor?: string;
  onSeeAll?: () => void;
}

export function RatingSummaryCard({
  summary,
  primaryColor = "#14B8A6",
  onSeeAll,
}: RatingSummaryCardProps) {
  const totalReviews = Object.values(summary.distribution).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <View style={styles.summaryCard}>
      {/* Header */}
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Đánh giá</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={[styles.seeAllText, { color: primaryColor }]}>
              Xem tất cả
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Score overview */}
      <View style={styles.scoreOverview}>
        <View style={styles.mainScore}>
          <Text style={[styles.bigScore, { color: primaryColor }]}>
            {summary.averageScore.toFixed(1)}
          </Text>
          <Text style={styles.outOf}>/5</Text>
        </View>

        <View style={styles.starsAndCount}>
          <StarRatingDisplay
            score={summary.averageScore}
            size={18}
            showScore={false}
          />
          <Text style={styles.reviewCount}>
            {summary.totalReviews} đánh giá
          </Text>
        </View>
      </View>

      {/* Distribution bars */}
      <View style={styles.distributionContainer}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count =
            summary.distribution[star as keyof typeof summary.distribution];
          const percentage =
            totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <View key={star} style={styles.distributionRow}>
              <Text style={styles.starLabel}>{star}</Text>
              <Ionicons name="star" size={12} color="#FFB800" />
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${percentage}%`, backgroundColor: primaryColor },
                  ]}
                />
              </View>
              <Text style={styles.countLabel}>{count}</Text>
            </View>
          );
        })}
      </View>

      {/* Top Tags */}
      {summary.topTags.length > 0 && (
        <View style={styles.tagsContainer}>
          {summary.topTags.map((tag) => (
            <View
              key={tag.id}
              style={[
                styles.tag,
                { backgroundColor: tag.positive ? "#E8F5E9" : "#FFEBEE" },
              ]}
            >
              {tag.icon && (
                <Ionicons
                  name={tag.icon as any}
                  size={12}
                  color={tag.positive ? "#4CAF50" : "#F44336"}
                />
              )}
              <Text
                style={[
                  styles.tagText,
                  { color: tag.positive ? "#4CAF50" : "#F44336" },
                ]}
              >
                {tag.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Positive percentage */}
      <View style={styles.positiveRow}>
        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
        <Text style={styles.positiveText}>
          {summary.positivePercent}% đánh giá tích cực
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// Rating Item (Individual review)
// ============================================================================

interface RatingItemProps {
  rating: {
    id: string;
    score: 1 | 2 | 3 | 4 | 5;
    comment?: string;
    images?: string[];
    createdAt: string;
    isVerified: boolean;
    reply?: string;
    userName?: string;
    userAvatar?: string;
  };
  primaryColor?: string;
}

export function RatingItem({
  rating,
  primaryColor = "#14B8A6",
}: RatingItemProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <View style={styles.ratingItem}>
      <View style={styles.ratingItemHeader}>
        <View style={styles.userInfo}>
          {rating.userAvatar ? (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {rating.userName?.charAt(0) || "U"}
              </Text>
            </View>
          ) : (
            <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
              <Text style={styles.avatarText}>
                {rating.userName?.charAt(0) || "U"}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.userName}>
              {rating.userName || "Người dùng"}
            </Text>
            <View style={styles.ratingMeta}>
              <StarRatingDisplay
                score={rating.score}
                size={12}
                showScore={false}
              />
              <Text style={styles.dateText}>
                {formatDate(rating.createdAt)}
              </Text>
              {rating.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                  <Text style={styles.verifiedText}>Đã mua</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {rating.comment && (
        <Text style={styles.commentText}>{rating.comment}</Text>
      )}

      {rating.reply && (
        <View
          style={[styles.replyContainer, { borderLeftColor: primaryColor }]}
        >
          <Text style={styles.replyLabel}>Phản hồi:</Text>
          <Text style={styles.replyText}>{rating.reply}</Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Star Rating Display
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsRow: {
    flexDirection: "row",
    gap: 1,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
  countText: {
    fontSize: 12,
    color: "#757575",
    marginLeft: 4,
  },

  // Star Rating Input
  inputContainer: {
    flexDirection: "row",
    gap: 8,
  },
  starButton: {
    padding: 4,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  scoreOverview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  mainScore: {
    flexDirection: "row",
    alignItems: "baseline",
    marginRight: 16,
  },
  bigScore: {
    fontSize: 48,
    fontWeight: "700",
  },
  outOf: {
    fontSize: 18,
    color: "#757575",
  },
  starsAndCount: {
    flex: 1,
  },
  reviewCount: {
    fontSize: 14,
    color: "#757575",
    marginTop: 4,
  },

  // Distribution
  distributionContainer: {
    gap: 8,
    marginBottom: 16,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starLabel: {
    width: 12,
    fontSize: 12,
    color: "#757575",
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  countLabel: {
    width: 30,
    fontSize: 12,
    color: "#757575",
    textAlign: "right",
  },

  // Tags
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Positive
  positiveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  positiveText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "500",
  },

  // Rating Item
  ratingItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  ratingItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  ratingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: "#757575",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  verifiedText: {
    fontSize: 11,
    color: "#4CAF50",
  },
  commentText: {
    fontSize: 14,
    color: "#1A1A1A",
    lineHeight: 20,
  },
  replyContainer: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    backgroundColor: "#F9F9F9",
    paddingVertical: 8,
    paddingRight: 12,
    borderRadius: 4,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#757575",
    marginBottom: 4,
  },
  replyText: {
    fontSize: 13,
    color: "#1A1A1A",
    lineHeight: 18,
  },
});

export default StarRatingDisplay;
