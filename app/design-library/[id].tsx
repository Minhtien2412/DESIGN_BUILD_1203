/**
 * Design Template Detail Screen
 * Chi tiết mẫu thiết kế biệt thự/nhà phố
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.65;

// Mock design templates data
const DESIGN_TEMPLATES = [
  {
    id: "1",
    name: "Mẫu thiết kế biệt thự tân cổ điển 3 tầng",
    type: "villa",
    style: "Tân cổ điển",
    location: "Phú Mỹ Hưng - Quận 7, Thành Phố Hồ Chí Minh",
    address: "Đường D9, Khu Dân Cư Phú Mỹ, Quận 7, Thành Phố Hồ Chí Minh",
    rating: 4.9,
    reviews: 139,
    images: [
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    dimensions: {
      width: 10,
      length: 20,
      floors: 3,
      area: 350,
    },
    rooms: {
      bedroom: 4,
      bathroom: 4,
      livingRoom: 1,
      kitchen: 1,
    },
    description:
      "Biệt thự 3 tầng được thiết kế theo phong cách tân cổ điển sang trọng, nổi bật với hệ thống vòm cửa, cột trụ và ban công tinh tế. Không gian sống mang lại cảm giác sang trọng, đẳng cấp, hòa quyện giữa nét cổ điển và hiện đại.",
    features: [
      "Hồ bơi riêng",
      "Sân vườn rộng rãi",
      "Garage 2 xe",
      "Phòng gym",
      "Smart home",
    ],
    price: 15000000000,
    designFee: 150000000,
    architect: "KTS. Nguyễn Văn An",
    isFavorite: false,
  },
  {
    id: "2",
    name: "Nhà phố hiện đại 4 tầng",
    type: "townhouse",
    style: "Hiện đại",
    location: "Quận 2, TP.HCM",
    address: "Đường Nguyễn Thị Định, Quận 2, TP.HCM",
    rating: 4.7,
    reviews: 89,
    images: [
      "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    dimensions: {
      width: 5,
      length: 15,
      floors: 4,
      area: 180,
    },
    rooms: {
      bedroom: 3,
      bathroom: 3,
      livingRoom: 1,
      kitchen: 1,
    },
    description:
      "Nhà phố thiết kế hiện đại với mặt tiền kính lớn, tối ưu ánh sáng tự nhiên. Bố cục hợp lý cho gia đình 4-5 người.",
    features: ["Ban công rộng", "Sân thượng BBQ", "Garage 1 xe", "Smart home"],
    price: 8500000000,
    designFee: 85000000,
    architect: "KTS. Trần Minh Hùng",
    isFavorite: true,
  },
];

// Room info component
const RoomInfo = ({
  icon,
  count,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  label: string;
}) => (
  <View style={styles.roomItem}>
    <View style={styles.roomIconContainer}>
      <Ionicons name={icon} size={24} color={MODERN_COLORS.textSecondary} />
    </View>
    <Text style={styles.roomCount}>
      {count} {label}
    </Text>
  </View>
);

export default function DesignTemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  // Find design template
  const template =
    DESIGN_TEMPLATES.find((t) => t.id === id) || DESIGN_TEMPLATES[0];

  const [isFavorite, setIsFavorite] = useState(template.isFavorite);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleBack = useCallback(() => router.back(), []);

  const handleFavorite = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFavorite((prev) => !prev);
  }, []);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `${template.name}\n${template.location}\n\nXem chi tiết tại ứng dụng BaoTienWeb`,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  }, [template]);

  const handleViewFloorPlan = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/design-library/floor-plan/${id}` as any);
  }, [id]);

  const handleContactArchitect = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/consultation/architect?designId=${id}` as any);
  }, [id]);

  const handleRequestQuote = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/design-library/quote-request/${id}` as any);
  }, [id]);

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    }
    return `${(price / 1000000).toFixed(0)} triệu`;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <FlatList
            data={template.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
              );
              setSelectedImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />

          {/* Top Actions */}
          <View style={[styles.topActions, { top: insets.top + 8 }]}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleBack}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleFavorite}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#ef4444" : "#fff"}
              />
            </TouchableOpacity>
          </View>

          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {template.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === selectedImageIndex && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{template.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={MODERN_COLORS.textSecondary}
              />
              <Text style={styles.locationText}>{template.location}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.ratingText}>{template.rating}</Text>
              <Text style={styles.reviewsText}>
                ({template.reviews} Đánh giá)
              </Text>
            </View>
          </View>

          {/* Room Info */}
          <View style={styles.roomsSection}>
            <RoomInfo
              icon="bed-outline"
              count={template.rooms.bedroom}
              label="Phòng ngủ"
            />
            <RoomInfo
              icon="water-outline"
              count={template.rooms.bathroom}
              label="Phòng tắm"
            />
            <RoomInfo
              icon="tv-outline"
              count={template.rooms.livingRoom}
              label="Phòng khách"
            />
            <RoomInfo
              icon="restaurant-outline"
              count={template.rooms.kitchen}
              label="Phòng bếp"
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{template.description}</Text>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vị trí</Text>
            <Text style={styles.addressText}>{template.address}</Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiện ích</Text>
            <View style={styles.featuresGrid}>
              {template.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={MODERN_COLORS.primary}
                  />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Architect */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kiến trúc sư</Text>
            <TouchableOpacity
              style={styles.architectCard}
              onPress={handleContactArchitect}
            >
              <View style={styles.architectAvatar}>
                <Ionicons
                  name="person"
                  size={24}
                  color={MODERN_COLORS.primary}
                />
              </View>
              <View style={styles.architectInfo}>
                <Text style={styles.architectName}>{template.architect}</Text>
                <Text style={styles.architectRole}>Kiến trúc sư chính</Text>
              </View>
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={MODERN_COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 140 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.dimensionCard}>
          <Text style={styles.dimensionTitle}>
            {template.dimensions.width}mx{template.dimensions.length}m,{" "}
            {template.dimensions.floors} Tầng
          </Text>
          <Text style={styles.dimensionSubtitle}>
            Diện tích sử dụng: {template.dimensions.area}m²
          </Text>
          <Text style={styles.dimensionHint}>
            Tối ưu công năng và không gian
          </Text>
        </View>
        <TouchableOpacity
          style={styles.viewPlanBtn}
          onPress={handleViewFloorPlan}
        >
          <LinearGradient
            colors={["#22c55e", "#16a34a"]}
            style={styles.viewPlanGradient}
          >
            <Text style={styles.viewPlanText}>Xem Mặt</Text>
            <Text style={styles.viewPlanText}>Bằng Dự Án</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  topActions: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  indicatorActive: {
    backgroundColor: "#fff",
    width: 24,
  },
  content: {
    paddingTop: MODERN_SPACING.md,
  },
  titleSection: {
    paddingHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: 8,
    lineHeight: 30,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
    flex: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  reviewsText: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },

  // Rooms Section
  roomsSection: {
    flexDirection: "row",
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    paddingVertical: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  roomItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  roomIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  roomCount: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
  },

  // Section
  section: {
    paddingHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.sm,
  },
  description: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    lineHeight: 22,
  },
  addressText: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    lineHeight: 22,
  },

  // Features
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 6,
    borderRadius: MODERN_RADIUS.md,
  },
  featureText: {
    fontSize: 13,
    color: MODERN_COLORS.text,
  },

  // Architect Card
  architectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    ...MODERN_SHADOWS.sm,
  },
  architectAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MODERN_COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: MODERN_SPACING.md,
  },
  architectInfo: {
    flex: 1,
  },
  architectName: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  architectRole: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.md,
    ...MODERN_SHADOWS.lg,
  },
  dimensionCard: {
    flex: 1,
    backgroundColor: "#e8f5e9",
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
  },
  dimensionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#22c55e",
  },
  dimensionSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    marginTop: 2,
  },
  dimensionHint: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  viewPlanBtn: {
    borderRadius: MODERN_RADIUS.md,
    overflow: "hidden",
  },
  viewPlanGradient: {
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md,
    alignItems: "center",
  },
  viewPlanText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
});
