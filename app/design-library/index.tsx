/**
 * Design Library Index - Thư viện mẫu thiết kế
 * ============================================
 * Danh sách tất cả loại công trình thiết kế
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
import { router, Stack } from "expo-router";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_SIZE = (SCREEN_WIDTH - 48) / 2;

// Các loại công trình thiết kế
export const DESIGN_CATEGORIES = [
  {
    id: "office",
    label: "Văn phòng",
    labelEn: "Office",
    icon: "business-outline" as const,
    color: "#0D9488",
    gradient: ["#0D9488", "#14B8A6"] as [string, string],
    image:
      "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=400",
    count: 45,
  },
  {
    id: "townhouse",
    label: "Nhà phố",
    labelEn: "Townhouse",
    icon: "home-outline" as const,
    color: "#333333",
    gradient: ["#333333", "#555555"] as [string, string],
    image:
      "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400",
    count: 128,
  },
  {
    id: "villa",
    label: "Biệt thự",
    labelEn: "Villa",
    icon: "home-outline" as const,
    color: "#8B4513",
    gradient: ["#8B4513", "#A0522D"] as [string, string],
    image:
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400",
    count: 89,
  },
  {
    id: "classic-villa",
    label: "Biệt thự cổ điển",
    labelEn: "Classic Villa",
    icon: "library-outline" as const,
    color: "#8B0000",
    gradient: ["#8B0000", "#A52A2A"] as [string, string],
    image:
      "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=400",
    count: 56,
  },
  {
    id: "hotel",
    label: "Khách sạn",
    labelEn: "Hotel",
    icon: "bed-outline" as const,
    color: "#4B0082",
    gradient: ["#4B0082", "#6A5ACD"] as [string, string],
    image:
      "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=400",
    count: 34,
  },
  {
    id: "factory",
    label: "Nhà xưởng",
    labelEn: "Factory",
    icon: "construct-outline" as const,
    color: "#2F4F4F",
    gradient: ["#2F4F4F", "#556B2F"] as [string, string],
    image:
      "https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=400",
    count: 23,
  },
  {
    id: "apartment",
    label: "Căn hộ DV",
    labelEn: "Service Apartment",
    icon: "business-outline" as const,
    color: "#006400",
    gradient: ["#006400", "#228B22"] as [string, string],
    image:
      "https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?auto=compress&cs=tinysrgb&w=400",
    count: 67,
  },
  {
    id: "restaurant",
    label: "Nhà hàng",
    labelEn: "Restaurant",
    icon: "restaurant-outline" as const,
    color: "#FF4500",
    gradient: ["#FF4500", "#FF6347"] as [string, string],
    image:
      "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=400",
    count: 41,
  },
  {
    id: "cafe",
    label: "Cafe",
    labelEn: "Cafe",
    icon: "cafe-outline" as const,
    color: "#8B4513",
    gradient: ["#8B4513", "#D2691E"] as [string, string],
    image:
      "https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=400",
    count: 52,
  },
  {
    id: "spa",
    label: "Spa",
    labelEn: "Spa",
    icon: "flower-outline" as const,
    color: "#DB7093",
    gradient: ["#DB7093", "#FF69B4"] as [string, string],
    image:
      "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=400",
    count: 28,
  },
  {
    id: "gym",
    label: "Gym",
    labelEn: "Gym",
    icon: "barbell-outline" as const,
    color: "#FF0000",
    gradient: ["#FF0000", "#DC143C"] as [string, string],
    image:
      "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=400",
    count: 19,
  },
  {
    id: "school",
    label: "Trường học",
    labelEn: "School",
    icon: "school-outline" as const,
    color: "#4169E1",
    gradient: ["#4169E1", "#6495ED"] as [string, string],
    image:
      "https://images.pexels.com/photos/256395/pexels-photo-256395.jpeg?auto=compress&cs=tinysrgb&w=400",
    count: 15,
  },
  {
    id: "hospital",
    label: "Bệnh viện",
    labelEn: "Hospital",
    icon: "medkit-outline" as const,
    color: "#008080",
    gradient: ["#008080", "#20B2AA"] as [string, string],
    image:
      "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=400",
    count: 12,
  },
  {
    id: "showroom",
    label: "Showroom",
    labelEn: "Showroom",
    icon: "storefront-outline" as const,
    color: "#800080",
    gradient: ["#800080", "#9932CC"] as [string, string],
    image:
      "https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=400",
    count: 31,
  },
];

export default function DesignLibraryIndexScreen() {
  const insets = useSafeAreaInsets();

  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/design-library/type/${categoryId}` as any);
  };

  const totalDesigns = DESIGN_CATEGORIES.reduce(
    (sum, cat) => sum + cat.count,
    0,
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Thư viện thiết kế",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#000000",
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={["#0D9488", "#14B8A6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Thư viện mẫu thiết kế</Text>
          <Text style={styles.heroSubtitle}>
            Khám phá {totalDesigns}+ mẫu thiết kế chất lượng cao
          </Text>
        </LinearGradient>

        {/* Categories Grid */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Danh mục công trình</Text>
          <View style={styles.categoriesGrid}>
            {DESIGN_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category.id)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.8)"]}
                  style={styles.categoryOverlay}
                >
                  <View style={styles.categoryIconContainer}>
                    <Ionicons name={category.icon} size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                  <Text style={styles.categoryCount}>{category.count} mẫu</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
  heroSection: {
    padding: MODERN_SPACING.xl,
    paddingTop: MODERN_SPACING.xxl,
    paddingBottom: MODERN_SPACING.xxl,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: MODERN_SPACING.xs,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
  categoriesSection: {
    padding: MODERN_SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.md,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: MODERN_SPACING.sm,
  },
  categoryCard: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.2,
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    ...MODERN_SHADOWS.sm,
    marginBottom: MODERN_SPACING.sm,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.xl,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: MODERN_SPACING.xs,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  categoryCount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
});
