/**
 * Design Library by Type - Danh sách mẫu thiết kế theo loại công trình
 * ====================================================================
 * Route: /design-library/type/[type]
 * Ví dụ: /design-library/type/villa, /design-library/type/townhouse
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
import { useCallback, useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DESIGN_CATEGORIES } from "../index";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// Mock data cho các mẫu thiết kế
const MOCK_DESIGNS: Record<string, DesignItem[]> = {
  office: [
    {
      id: "office-1",
      name: "Văn phòng hiện đại 200m²",
      type: "office",
      style: "Hiện đại",
      location: "Quận 1, TP.HCM",
      rating: 4.8,
      reviews: 45,
      image:
        "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 200,
      price: 150000000,
      isFeatured: true,
    },
    {
      id: "office-2",
      name: "Văn phòng startup",
      type: "office",
      style: "Industrial",
      location: "Quận 2, TP.HCM",
      rating: 4.6,
      reviews: 32,
      image:
        "https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 150,
      price: 100000000,
      isFeatured: false,
    },
  ],
  townhouse: [
    {
      id: "townhouse-1",
      name: "Nhà phố hiện đại 4 tầng",
      type: "townhouse",
      style: "Hiện đại",
      location: "Quận 7, TP.HCM",
      rating: 4.9,
      reviews: 89,
      image:
        "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 180,
      price: 8500000000,
      isFeatured: true,
    },
    {
      id: "townhouse-2",
      name: "Nhà phố tân cổ điển 3 tầng",
      type: "townhouse",
      style: "Tân cổ điển",
      location: "Bình Thạnh, TP.HCM",
      rating: 4.7,
      reviews: 56,
      image:
        "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 150,
      price: 6500000000,
      isFeatured: false,
    },
    {
      id: "townhouse-3",
      name: "Nhà phố mặt tiền 5 tầng",
      type: "townhouse",
      style: "Hiện đại",
      location: "Quận 3, TP.HCM",
      rating: 4.8,
      reviews: 78,
      image:
        "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 250,
      price: 12000000000,
      isFeatured: true,
    },
  ],
  villa: [
    {
      id: "villa-1",
      name: "Biệt thự tân cổ điển 3 tầng",
      type: "villa",
      style: "Tân cổ điển",
      location: "Phú Mỹ Hưng, Q7",
      rating: 4.9,
      reviews: 139,
      image:
        "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 350,
      price: 15000000000,
      isFeatured: true,
    },
    {
      id: "villa-2",
      name: "Biệt thự vườn hiện đại",
      type: "villa",
      style: "Hiện đại",
      location: "Thảo Điền, Q2",
      rating: 4.8,
      reviews: 98,
      image:
        "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 450,
      price: 25000000000,
      isFeatured: true,
    },
    {
      id: "villa-3",
      name: "Biệt thự mini 2 tầng",
      type: "villa",
      style: "Hiện đại tối giản",
      location: "Nhà Bè, TP.HCM",
      rating: 4.6,
      reviews: 67,
      image:
        "https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 200,
      price: 8000000000,
      isFeatured: false,
    },
  ],
  "classic-villa": [
    {
      id: "classic-1",
      name: "Biệt thự Pháp cổ điển",
      type: "classic-villa",
      style: "Pháp cổ điển",
      location: "Quận 2, TP.HCM",
      rating: 4.9,
      reviews: 87,
      image:
        "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 500,
      price: 35000000000,
      isFeatured: true,
    },
    {
      id: "classic-2",
      name: "Biệt thự Châu Âu",
      type: "classic-villa",
      style: "Châu Âu",
      location: "Phú Mỹ Hưng, Q7",
      rating: 4.8,
      reviews: 65,
      image:
        "https://images.pexels.com/photos/209296/pexels-photo-209296.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 600,
      price: 45000000000,
      isFeatured: true,
    },
  ],
  hotel: [
    {
      id: "hotel-1",
      name: "Khách sạn boutique 4 sao",
      type: "hotel",
      style: "Hiện đại",
      location: "Quận 1, TP.HCM",
      rating: 4.7,
      reviews: 123,
      image:
        "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 2000,
      price: 50000000000,
      isFeatured: true,
    },
  ],
  factory: [
    {
      id: "factory-1",
      name: "Nhà xưởng sản xuất 5000m²",
      type: "factory",
      style: "Công nghiệp",
      location: "Bình Dương",
      rating: 4.5,
      reviews: 34,
      image:
        "https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 5000,
      price: 25000000000,
      isFeatured: true,
    },
  ],
  apartment: [
    {
      id: "apt-1",
      name: "Căn hộ dịch vụ cao cấp",
      type: "apartment",
      style: "Hiện đại",
      location: "Quận 1, TP.HCM",
      rating: 4.8,
      reviews: 156,
      image:
        "https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 80,
      price: 5000000000,
      isFeatured: true,
    },
  ],
  restaurant: [
    {
      id: "rest-1",
      name: "Nhà hàng sang trọng",
      type: "restaurant",
      style: "Hiện đại",
      location: "Quận 1, TP.HCM",
      rating: 4.9,
      reviews: 234,
      image:
        "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 300,
      price: 8000000000,
      isFeatured: true,
    },
  ],
  cafe: [
    {
      id: "cafe-1",
      name: "Quán cafe sân vườn",
      type: "cafe",
      style: "Nhiệt đới",
      location: "Quận 2, TP.HCM",
      rating: 4.8,
      reviews: 189,
      image:
        "https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 200,
      price: 3000000000,
      isFeatured: true,
    },
  ],
  spa: [
    {
      id: "spa-1",
      name: "Spa & Wellness Center",
      type: "spa",
      style: "Zen",
      location: "Quận 3, TP.HCM",
      rating: 4.9,
      reviews: 167,
      image:
        "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 400,
      price: 6000000000,
      isFeatured: true,
    },
  ],
  gym: [
    {
      id: "gym-1",
      name: "Phòng gym hiện đại",
      type: "gym",
      style: "Industrial",
      location: "Quận 1, TP.HCM",
      rating: 4.7,
      reviews: 98,
      image:
        "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 500,
      price: 4000000000,
      isFeatured: true,
    },
  ],
  school: [
    {
      id: "school-1",
      name: "Trường mầm non quốc tế",
      type: "school",
      style: "Hiện đại",
      location: "Quận 7, TP.HCM",
      rating: 4.9,
      reviews: 145,
      image:
        "https://images.pexels.com/photos/256395/pexels-photo-256395.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 2000,
      price: 30000000000,
      isFeatured: true,
    },
  ],
  hospital: [
    {
      id: "hospital-1",
      name: "Phòng khám đa khoa",
      type: "hospital",
      style: "Hiện đại",
      location: "Quận 10, TP.HCM",
      rating: 4.8,
      reviews: 78,
      image:
        "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 1000,
      price: 15000000000,
      isFeatured: true,
    },
  ],
  showroom: [
    {
      id: "showroom-1",
      name: "Showroom ô tô cao cấp",
      type: "showroom",
      style: "Hiện đại",
      location: "Quận 7, TP.HCM",
      rating: 4.8,
      reviews: 89,
      image:
        "https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=400",
      area: 1500,
      price: 20000000000,
      isFeatured: true,
    },
  ],
};

interface DesignItem {
  id: string;
  name: string;
  type: string;
  style: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  area: number;
  price: number;
  isFeatured: boolean;
}

export default function DesignLibraryByTypeScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Tìm thông tin category
  const category = useMemo(
    () => DESIGN_CATEGORIES.find((c) => c.id === type),
    [type],
  );

  // Lấy danh sách designs theo type
  const designs = useMemo(() => {
    const items = MOCK_DESIGNS[type || ""] || [];
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.style.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query),
    );
  }, [type, searchQuery]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleDesignPress = useCallback((designId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/design-library/${designId}` as any);
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    }
    return `${(price / 1000000).toFixed(0)} triệu`;
  };

  const renderDesignCard = ({ item }: { item: DesignItem }) => (
    <TouchableOpacity
      style={styles.designCard}
      onPress={() => handleDesignPress(item.id)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.designImage}
        resizeMode="cover"
      />
      {item.isFeatured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>Nổi bật</Text>
        </View>
      )}
      <View style={styles.designInfo}>
        <Text style={styles.designName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.designLocation} numberOfLines={1}>
          <Ionicons name="location-outline" size={12} color="#666" />{" "}
          {item.location}
        </Text>
        <View style={styles.designStats}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews})</Text>
          </View>
          <Text style={styles.areaText}>{item.area}m²</Text>
        </View>
        <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#CCC" />
        <Text style={styles.errorText}>Danh mục không tồn tại</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: category.label,
          headerStyle: { backgroundColor: category.color },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
        }}
      />

      {/* Header Banner */}
      <LinearGradient
        colors={category.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBanner}
      >
        <View style={styles.headerIconContainer}>
          <Ionicons name={category.icon} size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.headerTitle}>{category.label}</Text>
        <Text style={styles.headerSubtitle}>{designs.length} mẫu thiết kế</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm mẫu thiết kế..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Design List */}
      <FlatList
        data={designs}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        renderItem={renderDesignCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có mẫu thiết kế</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  headerBanner: {
    padding: MODERN_SPACING.lg,
    alignItems: "center",
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: MODERN_SPACING.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  searchContainer: {
    padding: MODERN_SPACING.md,
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surfaceHover,
    borderRadius: MODERN_RADIUS.md,
    paddingHorizontal: MODERN_SPACING.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: MODERN_SPACING.sm,
    fontSize: 16,
    color: MODERN_COLORS.textPrimary,
  },
  listContent: {
    padding: MODERN_SPACING.md,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  designCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: MODERN_RADIUS.lg,
    marginBottom: MODERN_SPACING.md,
    overflow: "hidden",
    ...MODERN_SHADOWS.sm,
  },
  designImage: {
    width: "100%",
    height: CARD_WIDTH * 0.8,
  },
  featuredBadge: {
    position: "absolute",
    top: MODERN_SPACING.sm,
    left: MODERN_SPACING.sm,
    backgroundColor: "#FF6B00",
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.sm,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  designInfo: {
    padding: MODERN_SPACING.sm,
  },
  designName: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: 4,
  },
  designLocation: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 8,
  },
  designStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginLeft: 2,
  },
  areaText: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D9488",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.background,
  },
  errorText: {
    fontSize: 18,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.lg,
  },
  backButton: {
    backgroundColor: "#0D9488",
    paddingHorizontal: MODERN_SPACING.xl,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
