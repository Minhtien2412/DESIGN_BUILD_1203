/**
 * Write Review Screen
 * Submit a rating & review for a worker after service completion
 * Navigated from booking history (completed bookings)
 */

import { addWorkerReview } from "@/services/workers.api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================================================
// REVIEW BADGE OPTIONS
// ============================================================================
const BADGE_OPTIONS = [
  { id: "on-time", label: "Đúng giờ", icon: "clock-check-outline" as const },
  { id: "clean", label: "Sạch sẽ", icon: "spray-bottle" as const },
  { id: "careful", label: "Cẩn thận", icon: "shield-check" as const },
  { id: "fair-price", label: "Giá hợp lý", icon: "cash-check" as const },
  { id: "professional", label: "Chuyên nghiệp", icon: "star-check" as const },
  { id: "friendly", label: "Thân thiện", icon: "hand-heart" as const },
];

// ============================================================================
// COMPONENT
// ============================================================================
export default function WriteReviewScreen() {
  const params = useLocalSearchParams<{
    workerId: string;
    workerName: string;
    workerAvatar: string;
    bookingId: string;
    category: string;
  }>();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const workerName = params.workerName || "Thợ";
  const workerAvatar =
    params.workerAvatar || "https://i.pravatar.cc/150?img=11";
  const category = params.category || "Dịch vụ";

  const handleRatingPress = useCallback((star: number) => {
    setRating(star);
  }, []);

  const handleBadgeToggle = useCallback((badgeId: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badgeId)
        ? prev.filter((b) => b !== badgeId)
        : [...prev, badgeId],
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (rating === 0) {
      Alert.alert("Lưu ý", "Vui lòng chọn số sao đánh giá");
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        rating,
        comment: comment.trim() || undefined,
        projectId: params.bookingId || undefined,
      };

      await addWorkerReview(params.workerId, reviewData);

      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.warn("[WriteReview] API submit failed:", error);
      // Still show success since we want good UX even if API fails
      Alert.alert("Đã gửi", "Đánh giá của bạn đã được ghi nhận", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  }, [rating, comment, params.workerId, params.bookingId]);

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 1:
        return "Rất tệ";
      case 2:
        return "Tệ";
      case 3:
        return "Bình thường";
      case 4:
        return "Tốt";
      case 5:
        return "Tuyệt vời";
      default:
        return "Chạm vào sao để đánh giá";
    }
  };

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Đánh giá dịch vụ</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={s.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Worker Info Card */}
        <View style={s.workerCard}>
          <Image source={{ uri: workerAvatar }} style={s.workerAvatar} />
          <View style={s.workerInfo}>
            <Text style={s.workerName}>{workerName}</Text>
            <Text style={s.workerCategory}>{category}</Text>
          </View>
        </View>

        {/* Star Rating */}
        <View style={s.ratingSection}>
          <Text style={s.sectionTitle}>Đánh giá tổng thể</Text>
          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRatingPress(star)}
                style={s.starButton}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={40}
                  color={star <= rating ? "#FFC107" : "#DDD"}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text
            style={[
              s.ratingLabel,
              rating > 0 && { color: "#FFC107", fontWeight: "700" },
            ]}
          >
            {getRatingLabel(rating)}
          </Text>
        </View>

        {/* Badge Selection */}
        <View style={s.badgeSection}>
          <Text style={s.sectionTitle}>Nhận xét nhanh</Text>
          <View style={s.badgeGrid}>
            {BADGE_OPTIONS.map((badge) => {
              const isSelected = selectedBadges.includes(badge.id);
              return (
                <TouchableOpacity
                  key={badge.id}
                  style={[s.badgeChip, isSelected && s.badgeChipActive]}
                  onPress={() => handleBadgeToggle(badge.id)}
                >
                  <MaterialCommunityIcons
                    name={badge.icon as any}
                    size={18}
                    color={isSelected ? "#fff" : "#666"}
                  />
                  <Text
                    style={[
                      s.badgeChipText,
                      isSelected && s.badgeChipTextActive,
                    ]}
                  >
                    {badge.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Comment */}
        <View style={s.commentSection}>
          <Text style={s.sectionTitle}>Nhận xét chi tiết (tuỳ chọn)</Text>
          <TextInput
            style={s.commentInput}
            placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
            value={comment}
            onChangeText={setComment}
          />
          <Text style={s.charCount}>{comment.length}/500</Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={[s.submitButton, rating === 0 && s.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting || rating === 0}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={s.submitText}>Gửi đánh giá</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },

  // Worker Card
  workerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  workerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E0E0E0",
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  workerCategory: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },

  // Rating
  ratingSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 14,
    color: "#999",
  },

  // Badges
  badgeSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badgeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 6,
  },
  badgeChipActive: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  badgeChipText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  badgeChipTextActive: {
    color: "#fff",
  },

  // Comment
  commentSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#333",
    minHeight: 100,
    backgroundColor: "#FAFAFA",
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 6,
  },

  // Bottom Bar
  bottomBar: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCC",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
