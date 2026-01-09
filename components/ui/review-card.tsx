import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RatingStars } from './rating-stars';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  helpful: number;
  verified: boolean;
}

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
}

export function ReviewCard({ review, onHelpful, onReport }: ReviewCardProps) {
  const timeAgo = (date: string) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffMs = now.getTime() - reviewDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  return (
    <View style={styles.card}>
      {/* User Info */}
      <View style={styles.header}>
        <Image
          source={{ uri: review.userAvatar || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{review.userName}</Text>
            {review.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#0066CC" />
                <Text style={styles.verifiedText}>Đã mua</Text>
              </View>
            )}
          </View>
          <View style={styles.ratingRow}>
            <RatingStars rating={review.rating} size={14} />
            <Text style={styles.date}>{timeAgo(review.createdAt)}</Text>
          </View>
        </View>
      </View>

      {/* Comment */}
      <Text style={styles.comment}>{review.comment}</Text>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <View style={styles.imagesRow}>
          {review.images.slice(0, 3).map((img, index) => (
            <Image key={index} source={{ uri: img }} style={styles.reviewImage} />
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onHelpful?.(review.id)}
        >
          <Ionicons name="thumbs-up-outline" size={16} color="#666" />
          <Text style={styles.actionText}>Hữu ích ({review.helpful})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onReport?.(review.id)}
        >
          <Ionicons name="flag-outline" size={16} color="#666" />
          <Text style={styles.actionText}>Báo cáo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: '#0066CC',
    marginLeft: 2,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  comment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    color: '#666',
  },
});
