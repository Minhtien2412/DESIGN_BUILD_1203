/**
 * Worker Detail Screen — Step 5 of booking flow
 * Full worker profile with stats, reviews, chat and book buttons
 */

import { Ionicons } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const MOCK_REVIEWS = [
  {
    id: "r1",
    name: "Anh Minh",
    rating: 5,
    comment: "Thợ làm rất nhanh, sạch sẽ, giá cả hợp lý. Sẽ book lại!",
    time: "2 ngày trước",
  },
  {
    id: "r2",
    name: "Chị Lan",
    rating: 5,
    comment: "Tận tâm, đúng giờ, tay nghề cao. Rất hài lòng!",
    time: "1 tuần trước",
  },
  {
    id: "r3",
    name: "Anh Hùng",
    rating: 4,
    comment: "Làm tốt, đến đúng hẹn. Giá hơi cao hơn dự kiến.",
    time: "2 tuần trước",
  },
];

export default function WorkerDetailScreen() {
  const p = useLocalSearchParams<{
    serviceId: string;
    serviceName: string;
    address: string;
    district: string;
    city: string;
    note: string;
    date: string;
    time: string;
    workerId: string;
    workerName: string;
    workerRating: string;
    workerReviews: string;
    workerJobs: string;
    workerDistance: string;
    workerArrival: string;
    workerPrice: string;
    workerVerified: string;
    workerExp: string;
    workerSpecialty: string;
  }>();

  const verified = p.workerVerified === "true";
  const price = parseInt(p.workerPrice || "0", 10);

  const onBook = useCallback(() => {
    router.push({
      pathname: "/booking/confirm",
      params: {
        serviceId: p.serviceId,
        serviceName: p.serviceName,
        address: p.address,
        district: p.district,
        city: p.city,
        note: p.note,
        date: p.date,
        time: p.time,
        workerId: p.workerId,
        workerName: p.workerName,
        workerPrice: p.workerPrice,
        workerRating: p.workerRating,
        workerSpecialty: p.workerSpecialty,
        workerDistance: p.workerDistance,
        workerArrival: p.workerArrival,
      },
    } as Href);
  }, [p]);

  const onChat = useCallback(() => {
    router.push(
      `/chat/${p.workerId || "worker"}?name=${encodeURIComponent(p.workerName || "")}` as Href,
    );
  }, [p.workerId, p.workerName]);

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.workerName || "T")}&background=0D9488&color=fff&size=128`;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Thông tin thợ</Text>
        <TouchableOpacity style={s.backBtn}>
          <Ionicons name="share-outline" size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Profile card */}
        <View style={s.profileCard}>
          <View style={s.avatarSection}>
            <Image source={{ uri: avatarUrl }} style={s.avatar} />
            <View style={s.onlineDot} />
          </View>
          <Text style={s.name}>{p.workerName}</Text>
          <View style={s.specialtyRow}>
            <Text style={s.specialty}>{p.workerSpecialty}</Text>
            {verified && (
              <View style={s.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#fff" />
                <Text style={s.verifiedText}>Đã xác minh</Text>
              </View>
            )}
          </View>

          {/* Stats row */}
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statValue}>{p.workerRating}</Text>
              <View style={s.starsRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons
                    key={i}
                    name={
                      i < Math.floor(parseFloat(p.workerRating || "0"))
                        ? "star"
                        : "star-outline"
                    }
                    size={12}
                    color="#F59E0B"
                  />
                ))}
              </View>
              <Text style={s.statLabel}>{p.workerReviews} đánh giá</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>{p.workerJobs}</Text>
              <Text style={s.statLabel}>Việc đã làm</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>{p.workerExp} năm</Text>
              <Text style={s.statLabel}>Kinh nghiệm</Text>
            </View>
          </View>
        </View>

        {/* Quick info */}
        <View style={s.quickInfo}>
          <View style={s.infoItem}>
            <View style={s.infoIcon}>
              <Ionicons name="navigate-outline" size={18} color="#0D9488" />
            </View>
            <View>
              <Text style={s.infoLabel}>Khoảng cách</Text>
              <Text style={s.infoValue}>{p.workerDistance}</Text>
            </View>
          </View>
          <View style={s.infoItem}>
            <View style={s.infoIcon}>
              <Ionicons name="time-outline" size={18} color="#0D9488" />
            </View>
            <View>
              <Text style={s.infoLabel}>Đến trong</Text>
              <Text style={s.infoValue}>~{p.workerArrival}</Text>
            </View>
          </View>
          <View style={s.infoItem}>
            <View style={s.infoIcon}>
              <Ionicons name="cash-outline" size={18} color="#FF6B35" />
            </View>
            <View>
              <Text style={s.infoLabel}>Giá/giờ</Text>
              <Text style={[s.infoValue, { color: "#FF6B35" }]}>
                {(price / 1000).toFixed(0)}K
              </Text>
            </View>
          </View>
        </View>

        {/* Skills */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Kỹ năng chuyên môn</Text>
          <View style={s.skillsRow}>
            {[p.workerSpecialty, "Sửa chữa", "Bảo trì", "Lắp đặt"].map(
              (skill, i) => (
                <View key={i} style={s.skillChip}>
                  <Ionicons name="checkmark-circle" size={14} color="#0D9488" />
                  <Text style={s.skillText}>{skill}</Text>
                </View>
              ),
            )}
          </View>
        </View>

        {/* About */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Giới thiệu</Text>
          <Text style={s.aboutText}>
            Với {p.workerExp} năm kinh nghiệm trong lĩnh vực{" "}
            {(p.workerSpecialty || "").toLowerCase()}, tôi cam kết mang đến dịch
            vụ chất lượng cao với giá cả hợp lý. Luôn đúng giờ, tận tâm và chịu
            trách nhiệm với công việc.
          </Text>
        </View>

        {/* Reviews */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>Đánh giá từ khách hàng</Text>
            <TouchableOpacity>
              <Text style={s.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {MOCK_REVIEWS.map((review) => (
            <View key={review.id} style={s.reviewCard}>
              <View style={s.reviewHeader}>
                <View style={s.reviewAvatar}>
                  <Text style={s.reviewAvatarText}>
                    {review.name.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.reviewName}>{review.name}</Text>
                  <View style={s.reviewStars}>
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Ionicons key={i} name="star" size={10} color="#F59E0B" />
                    ))}
                  </View>
                </View>
                <Text style={s.reviewTime}>{review.time}</Text>
              </View>
              <Text style={s.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.bottomCta}>
        <TouchableOpacity
          style={s.chatBtn}
          onPress={onChat}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#0D9488" />
          <Text style={s.chatBtnText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.bookBtn}
          onPress={onBook}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={s.bookBtnText}>Book ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1F2937" },

  // Profile
  profileCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarSection: { position: "relative", marginBottom: 12 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E5E7EB",
  },
  onlineDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10B981",
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: { fontSize: 20, fontWeight: "800", color: "#1F2937" },
  specialtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  specialty: { fontSize: 14, color: "#6B7280" },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#0D9488",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedText: { fontSize: 10, fontWeight: "600", color: "#fff" },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#1F2937" },
  starsRow: { flexDirection: "row", gap: 1, marginTop: 2 },
  statLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: "#E5E7EB" },

  // Quick info
  quickInfo: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#fff",
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  infoItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: { fontSize: 10, color: "#9CA3AF" },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 1,
  },

  // Sections
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 10,
  },
  seeAll: { fontSize: 12, fontWeight: "600", color: "#0D9488" },

  // Skills
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F0FDFA",
  },
  skillText: { fontSize: 12, fontWeight: "500", color: "#0F766E" },

  // About
  aboutText: { fontSize: 13, color: "#4B5563", lineHeight: 20 },

  // Reviews
  reviewCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: { fontSize: 13, fontWeight: "700", color: "#6B7280" },
  reviewName: { fontSize: 13, fontWeight: "600", color: "#1F2937" },
  reviewStars: { flexDirection: "row", gap: 1, marginTop: 2 },
  reviewTime: { fontSize: 10, color: "#9CA3AF" },
  reviewComment: { fontSize: 12, color: "#4B5563", lineHeight: 18 },

  // Bottom CTA
  bottomCta: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 14,
    gap: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#0D9488",
    gap: 6,
  },
  chatBtnText: { fontSize: 15, fontWeight: "700", color: "#0D9488" },
  bookBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#0D9488",
    gap: 6,
  },
  bookBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
