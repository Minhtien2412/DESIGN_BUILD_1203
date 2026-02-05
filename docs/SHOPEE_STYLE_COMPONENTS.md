# Shopee-Style UI Components Guide

Tài liệu hướng dẫn sử dụng các components theo chuẩn giao diện Shopee.

## 📦 Components Đã Tạo

### 1. SellerProfileCard

**File:** `components/shopping/SellerProfileCard.tsx`

Component hiển thị thông tin seller/shop theo layout Shopee.

```tsx
import { SellerProfileCard } from '@/components/shopping/SellerProfileCard';

// Full variant (trang shop profile)
<SellerProfileCard
  seller={seller}
  variant="full"
  showStats={true}
  showActions={true}
  onChat={() => {}}
  onViewShop={() => {}}
  onFollow={() => {}}
  isFollowing={false}
/>

// Compact variant (trang product detail)
<SellerProfileCard
  seller={seller}
  variant="compact"
/>

// Mini variant (trong list)
<SellerProfileCard
  seller={seller}
  variant="mini"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| seller | Seller | required | Thông tin seller |
| variant | 'full' \| 'compact' \| 'mini' | 'full' | Kiểu hiển thị |
| showStats | boolean | true | Hiện số liệu thống kê |
| showActions | boolean | true | Hiện nút Chat/Xem Shop |
| onChat | () => void | - | Callback khi nhấn Chat |
| onViewShop | () => void | - | Callback khi nhấn Xem Shop |
| onFollow | () => void | - | Callback khi nhấn Theo dõi |
| isFollowing | boolean | false | Trạng thái đang theo dõi |

---

### 2. ShopeeProductCard

**File:** `components/shopping/ShopeeProductCard.tsx`

Product card với seller info theo style Shopee.

```tsx
import { ShopeeProductCard, ShopeeProductGrid } from '@/components/shopping/ShopeeProductCard';

// Single card
<ShopeeProductCard
  product={product}
  variant="default"
  showSeller={true}
  onPress={() => {}}
  onFavorite={(id) => {}}
  isFavorite={false}
/>

// Horizontal variant
<ShopeeProductCard
  product={product}
  variant="horizontal"
/>

// Product Grid
<ShopeeProductGrid
  products={products}
  numColumns={2}
  showSeller={true}
  onProductPress={(product) => {}}
/>
```

**Features:**

- ✅ Discount badge (-14%)
- ✅ New badge (MỚI)
- ✅ Bestseller badge (Hot)
- ✅ Flash Sale badge
- ✅ Free shipping badge
- ✅ Voucher badge
- ✅ Seller mini info (Mall + name)
- ✅ Rating stars + sold count
- ✅ Favorite button

---

### 3. SellerProductSection

**File:** `components/product/SellerProductSection.tsx`

Section hiển thị seller trong trang chi tiết sản phẩm.

```tsx
import { SellerProductSection } from "@/components/product/SellerProductSection";

<SellerProductSection
  seller={{
    id: "1",
    name: "Shop Name",
    avatar: "https://...",
    isOfficial: true,
    rating: 4.9,
    responseRate: 98,
    responseTime: "trong vài phút",
    productCount: 156,
    followerCount: 12500,
    location: "TP.HCM",
  }}
  onChatPress={() => {}}
  onViewShopPress={() => {}}
/>;
```

---

### 4. ProductReviewCard

**File:** `components/product/ProductReviewCard.tsx`

Components hiển thị đánh giá sản phẩm.

```tsx
import {
  ProductReviewCard,
  ReviewSummary,
  ReviewFilter
} from '@/components/product/ProductReviewCard';

// Review Summary
<ReviewSummary
  totalReviews={1250}
  averageRating={4.8}
  ratingDistribution={{ 5: 980, 4: 180, 3: 50, 2: 25, 1: 15 }}
  withPhotos={320}
/>

// Review Filter
<ReviewFilter
  activeFilter="all"
  onFilterChange={(filter) => {}}
  counts={{ all: 1250, withPhotos: 320, withComments: 890 }}
/>

// Review Card
<ProductReviewCard
  review={{
    id: 'r1',
    author: { id: 'u1', name: 'Nguyễn A', avatar: '...' },
    rating: 5,
    content: 'Review content...',
    variant: 'Size: L',
    createdAt: '2025-06-08T10:30:00Z',
    likes: 24,
    images: [{ id: 'img1', uri: '...' }],
    sellerReply: { content: '...', createdAt: '...' },
  }}
  onLike={(reviewId) => {}}
  onImagePress={(images, index) => {}}
/>
```

---

### 5. Shop Profile Page

**File:** `app/profile/[slug]/shop.tsx`

Trang shop profile đầy đủ với sản phẩm.

**Features:**

- Cover image + avatar với badge
- Stats (products, followers, rating, response rate)
- Follow button
- Tab filter (Tất cả, Bán chạy, Hàng mới, Khuyến mãi)
- Sort options (Phổ biến, Mới nhất, Bán chạy, Giá thấp/cao)
- Product grid

**Route:** `/profile/{sellerId}/shop`

---

## 🎨 Shopee Color Palette

```typescript
const SHOPEE_COLORS = {
  primary: "#EE4D2D", // Shopee Orange
  secondary: "#FF6D00", // Hot/Bestseller
  rating: "#FFAA00", // Stars
  success: "#00AA00", // Free ship, New
  surface: "#FFFFFF", // Cards
  background: "#F5F5F5", // Page background
  text: "#222222", // Primary text
  textMuted: "#888888", // Secondary text
  border: "#F0F0F0", // Dividers
};
```

---

## 📱 Demo Page

Xem tất cả components tại: `/demo/shopee-style`

---

## 📝 Usage Examples

### Product Detail Page

```tsx
import { SellerProductSection } from "@/components/product/SellerProductSection";
import {
  ProductReviewCard,
  ReviewSummary,
} from "@/components/product/ProductReviewCard";

export default function ProductDetail() {
  return (
    <ScrollView>
      {/* Product Info */}
      <ProductImages />
      <ProductInfo />

      {/* Seller Section */}
      <SellerProductSection seller={product.seller} />

      {/* Reviews */}
      <ReviewSummary
        totalReviews={product.reviewCount}
        averageRating={product.rating}
        ratingDistribution={product.ratingDistribution}
      />
      {reviews.map((review) => (
        <ProductReviewCard key={review.id} review={review} />
      ))}
    </ScrollView>
  );
}
```

### Shop Listing Page

```tsx
import { SellerProfileCard } from "@/components/shopping/SellerProfileCard";

export default function ShopList() {
  return (
    <FlatList
      data={sellers}
      renderItem={({ item }) => (
        <SellerProfileCard
          seller={item}
          variant="compact"
          onViewShop={() => router.push(`/profile/${item.id}/shop`)}
        />
      )}
    />
  );
}
```

### Home Page Products

```tsx
import { ShopeeProductGrid } from "@/components/shopping/ShopeeProductCard";

export default function HomePage() {
  return (
    <ShopeeProductGrid
      products={featuredProducts}
      showSeller={true}
      onProductPress={(product) => router.push(`/product/${product.id}`)}
    />
  );
}
```

---

## ✅ Checklist

- [x] SellerProfileCard (full, compact, mini variants)
- [x] ShopeeProductCard (default, horizontal variants)
- [x] ShopeeProductGrid
- [x] SellerProductSection
- [x] ProductReviewCard
- [x] ReviewSummary
- [x] ReviewFilter
- [x] Shop Profile Page
- [x] Demo Page

---

Created: 2025-06-12
