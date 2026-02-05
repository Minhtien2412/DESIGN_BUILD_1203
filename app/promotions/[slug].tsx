/**
 * Dynamic Promotion Page - Chi tiết khuyến mãi
 * Route: /promotions/:slug (deal-1k, sale-88, tet-deal, etc.)
 */

import { Ionicons } from "@expo/vector-icons";
import { Href, router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/useThemeColor";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PromotionConfig {
  title: string;
  subtitle: string;
  banner: string;
  color: string;
  endDate: string;
  description: string;
  products: PromotionProduct[];
}

interface PromotionProduct {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  sold: number;
  stock: number;
}

const PROMOTIONS_DATA: Record<string, PromotionConfig> = {
  "deal-1k": {
    title: "Deal Đồng Giá 1K",
    subtitle: "Săn deal sốc mỗi ngày",
    banner: "https://picsum.photos/800/400?random=10",
    color: "#FF5722",
    endDate: "2024-12-31",
    description:
      "Chương trình khuyến mãi đặc biệt với các sản phẩm chỉ từ 1.000đ. Số lượng có hạn, nhanh tay kẻo lỡ!",
    products: [
      {
        id: "p1",
        name: "Đinh thép 5cm (10 cái)",
        image: "https://picsum.photos/200/200?random=20",
        originalPrice: 15000,
        salePrice: 1000,
        discount: 93,
        sold: 5420,
        stock: 100,
      },
      {
        id: "p2",
        name: "Băng keo cách điện",
        image: "https://picsum.photos/200/200?random=21",
        originalPrice: 12000,
        salePrice: 1000,
        discount: 92,
        sold: 3280,
        stock: 50,
      },
      {
        id: "p3",
        name: "Ốc vít inox (20 cái)",
        image: "https://picsum.photos/200/200?random=22",
        originalPrice: 25000,
        salePrice: 1000,
        discount: 96,
        sold: 8910,
        stock: 30,
      },
    ],
  },
  "sale-88": {
    title: "Sale 8.8 Siêu Sốc",
    subtitle: "Giảm đến 88% - Freeship toàn quốc",
    banner: "https://picsum.photos/800/400?random=11",
    color: "#E91E63",
    endDate: "2024-08-08",
    description:
      "Ngày hội mua sắm lớn nhất năm với hàng ngàn deal hấp dẫn. Giảm giá lên đến 88% + Freeship không giới hạn!",
    products: [
      {
        id: "p4",
        name: "Máy khoan cầm tay mini",
        image: "https://picsum.photos/200/200?random=23",
        originalPrice: 850000,
        salePrice: 399000,
        discount: 53,
        sold: 1250,
        stock: 80,
      },
      {
        id: "p5",
        name: "Bộ dụng cụ sửa chữa 45 món",
        image: "https://picsum.photos/200/200?random=24",
        originalPrice: 450000,
        salePrice: 189000,
        discount: 58,
        sold: 2340,
        stock: 120,
      },
      {
        id: "p6",
        name: "Thước đo laser 50m",
        image: "https://picsum.photos/200/200?random=25",
        originalPrice: 1200000,
        salePrice: 499000,
        discount: 58,
        sold: 890,
        stock: 45,
      },
    ],
  },
  "tet-deal": {
    title: "Deal Tết Giáp Thìn",
    subtitle: "Rước lộc đầu năm - Giảm khủng",
    banner: "https://picsum.photos/800/400?random=12",
    color: "#D32F2F",
    endDate: "2025-02-15",
    description:
      "Chào năm mới với ngàn ưu đãi. Mua sắm thoải mái, đón Tết sum vầy với deal hot giảm đến 70%!",
    products: [
      {
        id: "p7",
        name: "Sơn nội thất cao cấp 18L",
        image: "https://picsum.photos/200/200?random=26",
        originalPrice: 1800000,
        salePrice: 990000,
        discount: 45,
        sold: 560,
        stock: 200,
      },
      {
        id: "p8",
        name: "Gạch ốp lát 60x60 (m²)",
        image: "https://picsum.photos/200/200?random=27",
        originalPrice: 350000,
        salePrice: 199000,
        discount: 43,
        sold: 1890,
        stock: 500,
      },
      {
        id: "p9",
        name: "Đèn LED âm trần 12W",
        image: "https://picsum.photos/200/200?random=28",
        originalPrice: 95000,
        salePrice: 45000,
        discount: 53,
        sold: 4560,
        stock: 300,
      },
    ],
  },
};

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

function ProductCard({
  product,
  color,
}: {
  product: PromotionProduct;
  color: string;
}) {
  const stockPercent =
    ((product.stock - (product.sold % product.stock)) / product.stock) * 100;

  return (
    <Pressable
      style={styles.productCard}
      onPress={() => router.push(`/product/${product.id}` as Href)}
    >
      <Image source={{ uri: product.image }} style={styles.productImage} />

      <View style={[styles.discountBadge, { backgroundColor: color }]}>
        <ThemedText style={styles.discountText}>
          -{product.discount}%
        </ThemedText>
      </View>

      <View style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={2}>
          {product.name}
        </ThemedText>

        <View style={styles.priceRow}>
          <ThemedText style={[styles.salePrice, { color }]}>
            {formatPrice(product.salePrice)}
          </ThemedText>
          <ThemedText style={styles.originalPrice}>
            {formatPrice(product.originalPrice)}
          </ThemedText>
        </View>

        <View style={styles.stockBar}>
          <View
            style={[
              styles.stockFill,
              { width: `${100 - stockPercent}%`, backgroundColor: color },
            ]}
          />
          <ThemedText style={styles.soldText}>Đã bán {product.sold}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

export default function PromotionDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const backgroundColor = useThemeColor({}, "background");

  const promotion =
    PROMOTIONS_DATA[slug || "deal-1k"] || PROMOTIONS_DATA["deal-1k"];

  const timeLeft = useMemo(() => {
    const end = new Date(promotion.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    };
  }, [promotion.endDate]);

  return (
    <>
      <Stack.Screen
        options={{
          title: promotion.title,
          headerStyle: { backgroundColor: promotion.color },
          headerTintColor: "#FFFFFF",
          headerRight: () => (
            <Pressable style={styles.headerButton}>
              <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />

      <ScrollView style={[styles.container, { backgroundColor }]}>
        {/* Banner */}
        <Image source={{ uri: promotion.banner }} style={styles.banner} />

        {/* Countdown */}
        <View
          style={[
            styles.countdownContainer,
            { backgroundColor: promotion.color },
          ]}
        >
          <View style={styles.countdownHeader}>
            <Ionicons name="time-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.countdownLabel}>Kết thúc sau:</ThemedText>
          </View>
          <View style={styles.countdownTimer}>
            <View style={styles.timeBox}>
              <ThemedText style={styles.timeNumber}>{timeLeft.days}</ThemedText>
              <ThemedText style={styles.timeLabel}>Ngày</ThemedText>
            </View>
            <ThemedText style={styles.timeSeparator}>:</ThemedText>
            <View style={styles.timeBox}>
              <ThemedText style={styles.timeNumber}>
                {timeLeft.hours}
              </ThemedText>
              <ThemedText style={styles.timeLabel}>Giờ</ThemedText>
            </View>
            <ThemedText style={styles.timeSeparator}>:</ThemedText>
            <View style={styles.timeBox}>
              <ThemedText style={styles.timeNumber}>
                {timeLeft.minutes}
              </ThemedText>
              <ThemedText style={styles.timeLabel}>Phút</ThemedText>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <ThemedText style={styles.subtitle}>{promotion.subtitle}</ThemedText>
          <ThemedText style={styles.description}>
            {promotion.description}
          </ThemedText>
        </View>

        {/* Products */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Sản phẩm khuyến mãi
            </ThemedText>
            <Pressable onPress={() => router.push("/shop" as Href)}>
              <ThemedText style={[styles.viewAll, { color: promotion.color }]}>
                Xem tất cả
              </ThemedText>
            </Pressable>
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={promotion.products}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productList}
            renderItem={({ item }) => (
              <ProductCard product={item} color={promotion.color} />
            )}
          />
        </View>

        {/* More Promotions */}
        <View style={styles.moreSection}>
          <ThemedText style={styles.sectionTitle}>Chương trình khác</ThemedText>
          <View style={styles.otherPromotions}>
            {Object.entries(PROMOTIONS_DATA)
              .filter(([key]) => key !== slug)
              .map(([key, promo]) => (
                <Pressable
                  key={key}
                  style={styles.otherPromoCard}
                  onPress={() => router.push(`/promotions/${key}` as Href)}
                >
                  <Image
                    source={{ uri: promo.banner }}
                    style={styles.otherPromoBanner}
                  />
                  <View
                    style={[
                      styles.otherPromoOverlay,
                      { backgroundColor: promo.color + "CC" },
                    ]}
                  >
                    <ThemedText style={styles.otherPromoTitle}>
                      {promo.title}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  banner: {
    width: SCREEN_WIDTH,
    height: 200,
    backgroundColor: "#E0E0E0",
  },
  countdownContainer: {
    padding: 16,
  },
  countdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  countdownLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  countdownTimer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  timeBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 60,
  },
  timeNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
  },
  timeLabel: {
    fontSize: 10,
    color: "#757575",
    marginTop: 2,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  descriptionSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: "#F5F5F5",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 22,
  },
  productsSection: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderBottomWidth: 8,
    borderBottomColor: "#F5F5F5",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
  },
  viewAll: {
    fontSize: 13,
    fontWeight: "500",
  },
  productList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    width: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  productImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#F5F5F5",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    color: "#212121",
    marginBottom: 8,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  salePrice: {
    fontSize: 15,
    fontWeight: "700",
  },
  originalPrice: {
    fontSize: 11,
    color: "#999999",
    textDecorationLine: "line-through",
  },
  stockBar: {
    height: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
  },
  stockFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  soldText: {
    fontSize: 10,
    color: "#666666",
    textAlign: "center",
    fontWeight: "500",
  },
  moreSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  otherPromotions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  otherPromoCard: {
    flex: 1,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
  },
  otherPromoBanner: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E0E0E0",
  },
  otherPromoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  otherPromoTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bottomSpacer: {
    height: 40,
  },
});
