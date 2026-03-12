/**
 * Worker Detail Screen
 * Full worker profile with:
 * - Map showing worker location
 * - Distance from user
 * - Skills, portfolio, reviews
 * - Book CTA with map navigation
 */

import WorkerMapView from "@/components/worker/WorkerMapView";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useI18n } from "@/services/i18nService";
import {
    getWorkerById,
    getWorkerReviews,
    type Worker,
    type WorkerReview,
} from "@/services/workers.api";
import {
    estimateTravelTime,
    formatDistance,
    formatTravelTime,
    locationToLatLng,
    type LatLng,
} from "@/utils/geo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// Worker type labels
// ============================================================================

const WORKER_TYPE_LABEL_KEYS: Record<string, string> = {
  THO_XAY: "workerDetail.mason",
  THO_SON: "workerDetail.painter",
  THO_DIEN: "workerDetail.electrician",
  THO_NUOC: "workerDetail.plumber",
  THO_MOC: "workerDetail.carpenter",
  THO_HAN: "workerDetail.welder",
  THO_SAT: "workerDetail.ironWorker",
  THO_GACH: "workerDetail.tiler",
  THO_THACH_CAO: "workerDetail.drywall",
  THO_NHOM_KINH: "workerDetail.glassWorker",
  THO_CAMERA: "workerDetail.cameraIT",
  KY_SU: "workerDetail.engineer",
  GIAM_SAT: "workerDetail.supervisor",
  NHAN_CONG: "workerDetail.labor",
  EP_COC: "workerDetail.piling",
  DAO_DAT: "workerDetail.excavation",
  VAT_LIEU: "workerDetail.materials",
};

// ============================================================================
// Screen
// ============================================================================

export default function WorkerDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { location: userLocation } = useUserLocation({ autoStart: true });
  const { t } = useI18n();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<WorkerReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch worker data
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [workerRes, reviewsRes] = await Promise.all([
          getWorkerById(id),
          getWorkerReviews(id),
        ]);
        if (!cancelled) {
          if (workerRes) setWorker(workerRes);
          if (reviewsRes?.data) setReviews(reviewsRes.data);
        }
      } catch {
        // Mock fallback
        if (!cancelled) {
          setWorker({
            id: id || "1",
            name: "Nguyễn Văn An",
            phone: "0901234567",
            workerType: "THO_DIEN" as any,
            location: "Quận 7",
            experience: 8,
            skills: ["Lắp điện", "Sửa AC", "Camera"],
            hasEquipment: true,
            dailyRate: 350000,
            avatar: "https://i.pravatar.cc/150?img=11",
            bio: "Thợ điện chuyên nghiệp với 8 năm kinh nghiệm. Chuyên lắp đặt, sửa chữa hệ thống điện dân dụng và công nghiệp.",
            rating: 4.8,
            reviewCount: 156,
            completedJobs: 423,
            status: "APPROVED" as any,
            verified: true,
            featured: true,
            availability: "available" as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Worker location on map
  const workerLatLng = useMemo((): LatLng => {
    if (!worker) return { latitude: 10.7769, longitude: 106.7009 };
    return locationToLatLng(worker.location);
  }, [worker]);

  const distance = useMemo(() => {
    if (!userLocation || !workerLatLng) return 0;
    const { haversineDistance } = require("@/utils/geo");
    return haversineDistance(userLocation, workerLatLng);
  }, [userLocation, workerLatLng]);

  const travelTime = useMemo(() => estimateTravelTime(distance), [distance]);

  const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

  const handleBook = useCallback(() => {
    if (!worker) return;
    router.push({
      pathname: "/service-booking/confirm-booking",
      params: {
        workerId: worker.id,
        workerName: worker.name,
        workerAvatar: worker.avatar || "",
        workerRating: String(worker.rating),
        workerDistance: String(distance.toFixed(1)),
        workerETA: String(travelTime),
        workerDailyRate: String(worker.dailyRate),
        workerPhone: worker.phone || "",
        workerType: worker.workerType,
        workerLocation: worker.location,
        category: "",
        customerLat: String(userLocation?.latitude || 0),
        customerLng: String(userLocation?.longitude || 0),
        customerAddress: "",
      },
    } as any);
  }, [worker, distance, travelTime, userLocation]);

  const handleCall = useCallback(() => {
    if (worker?.phone) Linking.openURL(`tel:${worker.phone}`);
  }, [worker]);

  const handleChat = useCallback(() => {
    router.push(`/messages/${id}` as any);
  }, [id]);

  if (loading) {
    return (
      <View
        style={[s.container, s.loadingContainer, { paddingTop: insets.top }]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (!worker) {
    return (
      <View
        style={[s.container, s.loadingContainer, { paddingTop: insets.top }]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: "#999" }}>{t("workerDetail.notFound")}</Text>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t("workerDetail.workerProfile")}</Text>
        <TouchableOpacity style={s.shareBtn}>
          <Ionicons name="share-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* ─── PROFILE CARD ─── */}
        <View style={s.profileCard}>
          <Image
            source={{
              uri:
                worker.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=FF6B00&color=fff`,
            }}
            style={s.avatar}
          />
          <View style={s.profileInfo}>
            <View style={s.nameRow}>
              <Text style={s.name}>{worker.name}</Text>
              {worker.verified && (
                <Ionicons name="shield-checkmark" size={18} color="#1976D2" />
              )}
            </View>
            <Text style={s.workerType}>
              {WORKER_TYPE_LABEL_KEYS[worker.workerType]
                ? t(WORKER_TYPE_LABEL_KEYS[worker.workerType])
                : worker.workerType}
            </Text>
            <View style={s.statsRow}>
              <View style={s.statItem}>
                <Ionicons name="star" size={14} color="#FFC107" />
                <Text style={s.statText}>{worker.rating.toFixed(1)}</Text>
              </View>
              <View style={s.statItem}>
                <Ionicons name="briefcase-outline" size={14} color="#666" />
                <Text style={s.statText}>
                  {t("workerDetail.completedOrders").replace(
                    "{n}",
                    String(worker.completedJobs),
                  )}
                </Text>
              </View>
              <View style={s.statItem}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={s.statText}>
                  {t("workerDetail.yearsExp").replace(
                    "{n}",
                    String(worker.experience),
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── MAP - DISTANCE ─── */}
        {userLocation && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>
              <Ionicons name="location" size={15} color="#FF6B00" />{" "}
              {t("workerDetail.locationDistance")}
            </Text>
            <WorkerMapView
              userLocation={userLocation}
              workers={[]}
              workerMovingLocation={workerLatLng}
              height={180}
              interactive={false}
              showUserMarker
            />
            <View style={s.distanceBar}>
              <View style={s.distItem}>
                <Ionicons name="navigate-outline" size={16} color="#FF6B00" />
                <Text style={s.distValue}>{formatDistance(distance)}</Text>
              </View>
              <View style={s.distItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={s.distValue}>~{formatTravelTime(travelTime)}</Text>
              </View>
              <View style={s.distItem}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={s.distValue}>{worker.location}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ─── BIO ─── */}
        {worker.bio && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{t("workerDetail.about")}</Text>
            <Text style={s.bioText}>{worker.bio}</Text>
          </View>
        )}

        {/* ─── SKILLS ─── */}
        {worker.skills.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{t("workerDetail.skills")}</Text>
            <View style={s.skillsWrap}>
              {worker.skills.map((skill: string, idx: number) => (
                <View key={idx} style={s.skillChip}>
                  <Text style={s.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ─── PRICING ─── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t("workerDetail.pricing")}</Text>
          <View style={s.priceCard}>
            <View style={s.priceItem}>
              <Text style={s.priceLabel}>{t("workerDetail.perDay")}</Text>
              <Text style={s.priceValue}>{formatPrice(worker.dailyRate)}</Text>
            </View>
            {worker.hasEquipment && (
              <View style={s.equipBadge}>
                <MaterialCommunityIcons
                  name="toolbox"
                  size={14}
                  color="#4CAF50"
                />
                <Text style={s.equipText}>
                  {t("workerDetail.hasEquipment")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ─── REVIEWS ─── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              {t("workerDetail.reviews").replace(
                "{count}",
                String(worker.reviewCount),
              )}
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/service-booking/worker-review",
                  params: {
                    id: worker.id,
                    name: worker.name,
                    avatar: worker.avatar || "",
                    rating: String(worker.rating),
                    reviewCount: String(worker.reviewCount),
                  },
                } as any)
              }
            >
              <Text style={s.seeAll}>{t("workerDetail.seeAll")}</Text>
            </TouchableOpacity>
          </View>
          {reviews.length > 0 ? (
            reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={s.reviewItem}>
                <View style={s.reviewHeader}>
                  <Text style={s.reviewerName}>
                    {review.userName || t("workerDetail.customer")}
                  </Text>
                  <View style={s.reviewStars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < review.rating ? "star" : "star-outline"}
                        size={12}
                        color="#FFC107"
                      />
                    ))}
                  </View>
                </View>
                {review.comment && (
                  <Text style={s.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={s.noReviews}>{t("workerDetail.noReviews")}</Text>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── BOTTOM CTA ─── */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={s.bottomLeft}>
          <Text style={s.bottomPrice}>
            {formatPrice(worker.dailyRate)}
            {t("workerDetail.perDayShort")}
          </Text>
          <View style={s.bottomDist}>
            <Ionicons name="location" size={12} color="#FF6B00" />
            <Text style={s.bottomDistText}>
              {formatDistance(distance)} • ~{formatTravelTime(travelTime)}
            </Text>
          </View>
        </View>

        <View style={s.bottomBtns}>
          <TouchableOpacity style={s.contactBtnSmall} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity style={s.contactBtnSmall} onPress={handleChat}>
            <Ionicons name="chatbubble" size={20} color="#FF6B00" />
          </TouchableOpacity>
          <TouchableOpacity style={s.bookBtnMain} onPress={handleBook}>
            <LinearGradient
              colors={["#FF6B00", "#FF8F00"]}
              style={s.bookBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={s.bookBtnText}>{t("workerDetail.bookWorker")}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  loadingContainer: { justifyContent: "center", alignItems: "center" },
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
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A1A" },
  shareBtn: { padding: 4 },
  scrollContent: { paddingBottom: 20 },

  // Profile card
  profileCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F0F0F0",
    marginRight: 14,
  },
  profileInfo: { flex: 1, justifyContent: "center" },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: { fontSize: 18, fontWeight: "800", color: "#1A1A1A" },
  workerType: {
    fontSize: 13,
    color: "#FF6B00",
    fontWeight: "600",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 6,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: { fontSize: 12, color: "#666", fontWeight: "500" },

  // Sections
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  seeAll: {
    fontSize: 13,
    color: "#FF6B00",
    fontWeight: "600",
  },

  // Distance
  distanceBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 10,
  },
  distItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },

  // Bio
  bioText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  // Skills
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6B00",
  },

  // Pricing
  priceCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 14,
  },
  priceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: { fontSize: 14, color: "#666" },
  priceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FF6B00",
  },
  equipBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  equipText: { fontSize: 12, color: "#4CAF50", fontWeight: "600" },

  // Reviews
  reviewItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewerName: { fontSize: 13, fontWeight: "600", color: "#333" },
  reviewStars: { flexDirection: "row", gap: 1 },
  reviewComment: { fontSize: 13, color: "#666", lineHeight: 18 },
  noReviews: { fontSize: 13, color: "#999", fontStyle: "italic" },

  // Bottom bar
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomLeft: {},
  bottomPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FF6B00",
  },
  bottomDist: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  bottomDistText: { fontSize: 11, color: "#888" },
  bottomBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactBtnSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  bookBtnMain: {
    borderRadius: 12,
    overflow: "hidden",
  },
  bookBtnGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  bookBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },
});
