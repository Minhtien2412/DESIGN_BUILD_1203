/**
 * ProductReviewCard - Shopee-style Review Component
 * Hiển thị đánh giá sản phẩm với hình ảnh, rating stars
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

// ===================== TYPES =====================
export interface ReviewImage {
  id: string;
  uri: string;
  thumbnail?: string;
}

export interface ReviewAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface ProductReview {
  id: string;
  author: ReviewAuthor;
  rating: number;
  content: string;
  images?: ReviewImage[];
  variant?: string; // e.g., "Màu: Đỏ, Size: L"
  createdAt: string;
  likes?: number;
  sellerReply?: {
    content: string;
    createdAt: string;
  };
}

interface ProductReviewCardProps {
  review: ProductReview;
  onLike?: (reviewId: string) => void;
  onImagePress?: (images: ReviewImage[], index: number) => void;
}

// ===================== HELPERS =====================
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return date.toLocaleDateString("vi-VN");
}

// ===================== COMPONENTS =====================

// Star Rating Display
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={
            star <= rating
              ? "star"
              : star - 0.5 <= rating
                ? "star-half"
                : "star-outline"
          }
          size={size}
          color="#FFAA00"
        />
      ))}
    </View>
  );
}

// Image Gallery
function ReviewImageGallery({
  images,
  onImagePress,
}: {
  images: ReviewImage[];
  onImagePress?: (images: ReviewImage[], index: number) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.imageGallery}
      contentContainerStyle={styles.imageGalleryContent}
    >
      {images.map((image, index) => (
        <Pressable key={image.id} onPress={() => onImagePress?.(images, index)}>
          <Image
            source={{ uri: image.thumbnail || image.uri }}
            style={styles.reviewImage}
            contentFit="cover"
          />
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ===================== MAIN COMPONENT =====================
export function ProductReviewCard({
  review,
  onLike,
  onImagePress,
}: ProductReviewCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(review.id);
  };

  const shouldTruncate = review.content.length > 200;
  const displayContent =
    shouldTruncate && !expanded
      ? review.content.substring(0, 200) + "..."
      : review.content;

  return (
    <View style={styles.container}>
      {/* Author Row */}
      <View style={styles.authorRow}>
        {review.author.avatar ? (
          <Image
            source={{ uri: review.author.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={16} color="#888888" />
          </View>
        )}

        <View style={styles.authorInfo}>
          <ThemedText style={styles.authorName}>
            {review.author.name}
          </ThemedText>
          <StarRating rating={review.rating} />
        </View>

        <ThemedText style={styles.dateText}>
          {formatDate(review.createdAt)}
        </ThemedText>
      </View>

      {/* Variant */}
      {review.variant && (
        <View style={styles.variantRow}>
          <ThemedText style={styles.variantText}>
            Phân loại: {review.variant}
          </ThemedText>
        </View>
      )}

      {/* Content */}
      <View style={styles.contentWrapper}>
        <ThemedText style={styles.content}>{displayContent}</ThemedText>
        {shouldTruncate && (
          <Pressable onPress={() => setExpanded(!expanded)}>
            <ThemedText style={styles.readMore}>
              {expanded ? "Thu gọn" : "Xem thêm"}
            </ThemedText>
          </Pressable>
        )}
      </View>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <ReviewImageGallery
          images={review.images}
          onImagePress={onImagePress}
        />
      )}

      {/* Seller Reply */}
      {review.sellerReply && (
        <View style={styles.sellerReply}>
          <View style={styles.replyHeader}>
            <Ionicons name="storefront" size={12} color="#EE4D2D" />
            <ThemedText style={styles.replyLabel}>
              Phản hồi của người bán
            </ThemedText>
          </View>
          <ThemedText style={styles.replyContent}>
            {review.sellerReply.content}
          </ThemedText>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <Pressable style={styles.likeButton} onPress={handleLike}>
          <Ionicons
            name={isLiked ? "thumbs-up" : "thumbs-up-outline"}
            size={16}
            color={isLiked ? "#EE4D2D" : "#888888"}
          />
          <ThemedText style={[styles.likeText, isLiked && styles.likedText]}>
            Hữu ích{" "}
            {(review.likes || 0) + (isLiked ? 1 : 0) > 0 &&
              `(${(review.likes || 0) + (isLiked ? 1 : 0)})`}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

// ===================== REVIEW SUMMARY =====================
interface ReviewSummaryProps {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number }; // e.g., { 5: 100, 4: 50, ... }
  withPhotos?: number;
}

export function ReviewSummary({
  totalReviews,
  averageRating,
  ratingDistribution,
  withPhotos,
}: ReviewSummaryProps) {
  const maxCount = Math.max(...Object.values(ratingDistribution));

  return (
    <View style={styles.summaryContainer}>
      {/* Left Side - Average */}
      <View style={styles.summaryLeft}>
        <View style={styles.averageRow}>
          <ThemedText style={styles.averageValue}>
            {averageRating.toFixed(1)}
          </ThemedText>
          <ThemedText style={styles.averageMax}>/5</ThemedText>
        </View>
        <StarRating rating={averageRating} size={18} />
        <ThemedText style={styles.totalReviews}>
          ({totalReviews.toLocaleString("vi-VN")} đánh giá)
        </ThemedText>
      </View>

      {/* Right Side - Distribution */}
      <View style={styles.summaryRight}>
        {[5, 4, 3, 2, 1].map((star) => (
          <View key={star} style={styles.distributionRow}>
            <ThemedText style={styles.distributionStar}>{star}</ThemedText>
            <Ionicons name="star" size={10} color="#FFAA00" />
            <View style={styles.distributionBarBg}>
              <View
                style={[
                  styles.distributionBarFill,
                  {
                    width: `${maxCount > 0 ? ((ratingDistribution[star] || 0) / maxCount) * 100 : 0}%`,
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.distributionCount}>
              {ratingDistribution[star] || 0}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

// ===================== REVIEW FILTER =====================
type FilterOption =
  | "all"
  | "with-photos"
  | "with-comments"
  | "5-star"
  | "4-star"
  | "3-star"
  | "2-star"
  | "1-star";

interface ReviewFilterProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  counts?: {
    all?: number;
    withPhotos?: number;
    withComments?: number;
    [key: string]: number | undefined;
  };
}

export function ReviewFilter({
  activeFilter,
  onFilterChange,
  counts,
}: ReviewFilterProps) {
  const filters: { key: FilterOption; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "with-photos", label: "Có hình ảnh" },
    { key: "with-comments", label: "Có bình luận" },
    { key: "5-star", label: "5 sao" },
    { key: "4-star", label: "4 sao" },
    { key: "3-star", label: "3 sao" },
    { key: "2-star", label: "2 sao" },
    { key: "1-star", label: "1 sao" },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {filters.map((filter) => {
        const count = counts?.[filter.key];
        return (
          <Pressable
            key={filter.key}
            style={[
              styles.filterChip,
              activeFilter === filter.key && styles.filterChipActive,
            ]}
            onPress={() => onFilterChange(filter.key)}
          >
            <ThemedText
              style={[
                styles.filterChipText,
                activeFilter === filter.key && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
              {count !== undefined && ` (${count})`}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
  // Review Card
  container: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  authorInfo: {
    flex: 1,
    gap: 2,
  },
  authorName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#222222",
  },
  starRow: {
    flexDirection: "row",
    gap: 1,
  },
  dateText: {
    fontSize: 11,
    color: "#999999",
  },
  variantRow: {
    paddingLeft: 46,
  },
  variantText: {
    fontSize: 12,
    color: "#888888",
  },
  contentWrapper: {
    gap: 4,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333333",
  },
  readMore: {
    fontSize: 13,
    color: "#EE4D2D",
    fontWeight: "500",
  },

  // Images
  imageGallery: {
    marginTop: 4,
  },
  imageGalleryContent: {
    gap: 8,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },

  // Seller Reply
  sellerReply: {
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#EE4D2D",
    gap: 6,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EE4D2D",
  },
  replyContent: {
    fontSize: 13,
    lineHeight: 18,
    color: "#333333",
  },

  // Actions
  actionsRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
  },
  likeText: {
    fontSize: 12,
    color: "#888888",
  },
  likedText: {
    color: "#EE4D2D",
  },

  // Summary
  summaryContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF8F5",
    padding: 16,
    borderRadius: 8,
    gap: 20,
  },
  summaryLeft: {
    alignItems: "center",
    gap: 6,
  },
  averageRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  averageValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#EE4D2D",
  },
  averageMax: {
    fontSize: 18,
    color: "#EE4D2D",
  },
  totalReviews: {
    fontSize: 12,
    color: "#888888",
  },
  summaryRight: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distributionStar: {
    width: 12,
    fontSize: 11,
    color: "#666666",
    textAlign: "right",
  },
  distributionBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#E8E8E8",
    borderRadius: 4,
    overflow: "hidden",
  },
  distributionBarFill: {
    height: "100%",
    backgroundColor: "#FFAA00",
    borderRadius: 4,
  },
  distributionCount: {
    width: 35,
    fontSize: 10,
    color: "#888888",
    textAlign: "right",
  },

  // Filter
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#FFF0EE",
    borderWidth: 1,
    borderColor: "#EE4D2D",
  },
  filterChipText: {
    fontSize: 12,
    color: "#666666",
  },
  filterChipTextActive: {
    color: "#EE4D2D",
    fontWeight: "600",
  },
});

export default ProductReviewCard;
