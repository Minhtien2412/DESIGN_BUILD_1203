/**
 * Shopee-style Demo Page
 * Preview tất cả components theo chuẩn Shopee
 */

import { Href, Stack, router } from "expo-router";
import { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";

import {
    ProductReviewCard,
    ReviewFilter,
    ReviewSummary,
} from "@/components/product/ProductReviewCard";
import { SellerProductSection } from "@/components/product/SellerProductSection";
import { SellerProfileCard } from "@/components/shopping/SellerProfileCard";
import {
    ShopeeProductCard,
    ShopeeProductGrid,
} from "@/components/shopping/ShopeeProductCard";
import { ThemedText } from "@/components/themed-text";
import { Container } from "@/components/ui/container";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Mock Data
const MOCK_SELLER = {
  id: "1",
  name: "Bùi Minh Tâm",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  isOfficial: true,
  isVerified: true,
  rating: 4.9,
  responseRate: 98,
  responseTime: "trong vài phút",
  productCount: 156,
  followerCount: 12500,
  joinDate: "2024-01-15",
  location: "TP. Hồ Chí Minh",
};

const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Xi măng PCB40 Holcim 50kg",
    price: 95000,
    originalPrice: 110000,
    discount: 14,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300",
    rating: 4.8,
    soldCount: 1250,
    isBestseller: true,
    freeShipping: true,
    seller: {
      id: "1",
      name: "Bùi Minh Tâm",
      isOfficial: true,
      location: "TP.HCM",
    },
  },
  {
    id: "2",
    name: "Gạch Block 10x20x40 cao cấp",
    price: 3200,
    image: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=300",
    rating: 4.7,
    soldCount: 890,
    isNew: true,
    seller: {
      id: "2",
      name: "Shop Vật Liệu ABC",
      location: "Hà Nội",
    },
  },
  {
    id: "3",
    name: "Thép Hòa Phát D10 (cây 11.7m)",
    price: 165000,
    originalPrice: 180000,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300",
    rating: 4.9,
    soldCount: 2100,
    voucherDiscount: "Giảm ₫10k",
    seller: {
      id: "3",
      name: "Đại Lý Thép Pro",
      isOfficial: true,
      location: "Bình Dương",
    },
  },
  {
    id: "4",
    name: "Sơn Dulux nội thất 5L màu trắng",
    price: 650000,
    originalPrice: 750000,
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300",
    rating: 4.8,
    soldCount: 678,
    isFlashSale: true,
    freeShipping: true,
    seller: {
      id: "4",
      name: "Dulux Official",
      isOfficial: true,
      location: "TP.HCM",
    },
  },
];

const MOCK_REVIEW = {
  id: "r1",
  author: {
    id: "u1",
    name: "Nguyễn Văn A",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  rating: 5,
  content:
    "Sản phẩm chất lượng tốt, giao hàng nhanh. Xi măng đóng bao cẩn thận, không bị ẩm. Rất hài lòng với dịch vụ. Shop tư vấn nhiệt tình, sẽ ủng hộ tiếp.",
  variant: "Loại: PCB40, Số lượng: 10 bao",
  createdAt: "2025-06-08T10:30:00Z",
  likes: 24,
  images: [
    {
      id: "img1",
      uri: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200",
    },
    {
      id: "img2",
      uri: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200",
    },
  ],
  sellerReply: {
    content:
      "Cảm ơn bạn đã tin tưởng shop ạ! Hẹn gặp lại bạn trong những đơn hàng tiếp theo nhé ❤️",
    createdAt: "2025-06-08T14:00:00Z",
  },
};

export default function ShopeeStyleDemo() {
  const [reviewFilter, setReviewFilter] = useState<any>("all");

  return (
    <>
      <Stack.Screen
        options={{
          title: "Shopee Style Demo",
          headerStyle: { backgroundColor: "#EE4D2D" },
          headerTintColor: "#FFFFFF",
        }}
      />

      <ScrollView style={styles.container}>
        {/* Section 1: Seller Profile Card */}
        <Container style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            1. Seller Profile Card
          </ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Component: SellerProfileCard
          </ThemedText>

          <SellerProfileCard
            seller={MOCK_SELLER}
            variant="full"
            onChat={() => console.log("Chat")}
            onViewShop={() => router.push("/profile/1/shop" as Href)}
          />
        </Container>

        {/* Section 1b: Compact Variant */}
        <Container style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            1b. Compact Variant
          </ThemedText>
          <SellerProfileCard seller={MOCK_SELLER} variant="compact" />
        </Container>

        {/* Section 1c: Mini Variant */}
        <Container style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            1c. Mini Variant (for lists)
          </ThemedText>
          <SellerProfileCard seller={MOCK_SELLER} variant="mini" />
        </Container>

        {/* Section 2: Seller Product Section */}
        <View style={styles.section}>
          <Container>
            <ThemedText style={styles.sectionTitle}>
              2. Seller Section in Product Detail
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Component: SellerProductSection
            </ThemedText>
          </Container>

          <SellerProductSection seller={MOCK_SELLER} />
        </View>

        {/* Section 3: Product Cards */}
        <Container style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            3. Shopee Product Cards
          </ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Component: ShopeeProductCard
          </ThemedText>
        </Container>

        <ShopeeProductGrid
          products={MOCK_PRODUCTS}
          showSeller={true}
          onProductPress={(product) => console.log("Product:", product.name)}
        />

        {/* Section 4: Horizontal Product Card */}
        <Container style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            4. Horizontal Product Card
          </ThemedText>
          <ShopeeProductCard product={MOCK_PRODUCTS[0]} variant="horizontal" />
        </Container>

        {/* Section 5: Review Summary */}
        <Container style={styles.section}>
          <ThemedText style={styles.sectionTitle}>5. Review Summary</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Component: ReviewSummary
          </ThemedText>

          <ReviewSummary
            totalReviews={1250}
            averageRating={4.8}
            ratingDistribution={{ 5: 980, 4: 180, 3: 50, 2: 25, 1: 15 }}
            withPhotos={320}
          />
        </Container>

        {/* Section 6: Review Filter */}
        <View style={styles.section}>
          <Container>
            <ThemedText style={styles.sectionTitle}>
              6. Review Filter
            </ThemedText>
          </Container>
          <ReviewFilter
            activeFilter={reviewFilter}
            onFilterChange={setReviewFilter}
            counts={{
              all: 1250,
              withPhotos: 320,
              withComments: 890,
            }}
          />
        </View>

        {/* Section 7: Review Card */}
        <View style={styles.section}>
          <Container>
            <ThemedText style={styles.sectionTitle}>
              7. Product Review Card
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Component: ProductReviewCard
            </ThemedText>
          </Container>
          <ProductReviewCard
            review={MOCK_REVIEW}
            onLike={(id) => console.log("Like:", id)}
          />
        </View>

        {/* Color Palette */}
        <Container style={[styles.section, styles.lastSection]}>
          <ThemedText style={styles.sectionTitle}>
            Shopee Color Palette
          </ThemedText>
          <View style={styles.colorGrid}>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: "#EE4D2D" }]} />
              <ThemedText style={styles.colorName}>Primary</ThemedText>
              <ThemedText style={styles.colorCode}>#EE4D2D</ThemedText>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: "#FFAA00" }]} />
              <ThemedText style={styles.colorName}>Rating</ThemedText>
              <ThemedText style={styles.colorCode}>#FFAA00</ThemedText>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: "#00AA00" }]} />
              <ThemedText style={styles.colorName}>Success</ThemedText>
              <ThemedText style={styles.colorCode}>#00AA00</ThemedText>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBox, { backgroundColor: "#FF6D00" }]} />
              <ThemedText style={styles.colorName}>Hot</ThemedText>
              <ThemedText style={styles.colorCode}>#FF6D00</ThemedText>
            </View>
          </View>
        </Container>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  section: {
    marginTop: 16,
  },
  lastSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 12,
    fontFamily: "monospace",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 8,
  },
  colorItem: {
    alignItems: "center",
    gap: 4,
  },
  colorBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333333",
  },
  colorCode: {
    fontSize: 10,
    color: "#888888",
    fontFamily: "monospace",
  },
});
