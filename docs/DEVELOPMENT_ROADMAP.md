# 🚀 DEVELOPMENT ROADMAP - App Modernization Plan

> **Ngày cập nhật:** 03/02/2026  
> **Phiên bản:** 2.0  
> **Trạng thái:** TypeScript 0 errors ✅ | Tests 733 passed ✅ | ESLint 0 errors ✅

---

## 📊 TỔNG QUAN TÌNH TRẠNG HIỆN TẠI

### ✅ Đã Hoàn Thành (03/02/2026)

- [x] **TypeScript:** 0 errors (giảm từ ~70 errors)
- [x] **ESLint:** 0 errors (giảm từ 30 errors)
- [x] **Jest Tests:** 32 suites, 733 tests passing
- [x] Hệ thống TikTok-style video (feed, comments, likes, shares)
- [x] Backend NestJS trên server (baotienweb.cloud) đang hoạt động
- [x] Auth system (đăng nhập/đăng ký, Google OAuth)
- [x] Cart Context với AsyncStorage
- [x] OpenAI API Key đã cấu hình
- [x] **Mới:** Hook `useRealProducts` - kết nối API thật với caching
- [x] **Mới:** Service `orders.service.ts` - quản lý đơn hàng
- [x] **Mới:** Service `cart.service.ts` - sync giỏ hàng với server
- [x] **Mới:** Script `seed-products.ts` - seed 25+ sản phẩm thật

### 🔧 Đang Phát Triển (Priority: HIGH)

- [ ] **Products API:** Hiển thị sản phẩm thật từ database
- [ ] **Shopping Pages:** Cập nhật dùng `useRealProducts`
- [ ] **Cart Sync:** Đồng bộ giỏ hàng với backend API
- [ ] **Checkout Flow:** VNPay/MoMo integration

### 📋 Sắp Triển Khai

- [ ] **Livestream UI:** TikTok-style vertical feed
- [ ] **Social Feed:** Facebook-style timeline
- [ ] **AI Integration:** OpenAI assistant

---

## 🎯 PHASE 1: PRODUCTS REAL DATA (Tuần 1-2) ⬅️ ĐANG THỰC HIỆN

### 1.1 Files Đã Tạo/Cập Nhật

| File                                          | Status     | Mô tả                                         |
| --------------------------------------------- | ---------- | --------------------------------------------- |
| `hooks/useRealProducts.ts`                    | ✅ Mới     | Hook kết nối API với caching, infinite scroll |
| `services/api/products.service.ts`            | ✅ Updated | Retry logic, error handling cải tiến          |
| `services/api/orders.service.ts`              | ✅ Mới     | CRUD orders, payment integration              |
| `services/api/cart.service.ts`                | ✅ Mới     | Sync cart với backend                         |
| `BE-baotienweb.cloud/prisma/seed-products.ts` | ✅ Mới     | Seed 25+ products thật                        |

### 1.2 Cách Test API Products

```bash
# 1. Start Backend
cd BE-baotienweb.cloud
npm run start:dev

# 2. Seed products (nếu chưa có)
npx ts-node prisma/seed-products.ts

# 3. Test API
curl http://localhost:3000/products
curl http://localhost:3000/products?category=HOME
curl http://localhost:3000/products?limit=10&page=1
```

### 1.3 Cách Sử Dụng Hook Mới

```typescript
// Trong component
import { useRealProducts, useFlashSaleProducts } from "@/hooks/useRealProducts";

// Lấy tất cả products với filters
const { products, loading, loadMore, refresh } = useRealProducts({
  filters: { category: "HOME" },
  pageSize: 20,
});

// Flash sale products
const { products: flashSale } = useFlashSaleProducts(10);

// Products theo seller
const { products: sellerProducts } = useSellerProducts("seller-123");

// Search products
const { products: searchResults } = useProductSearch("xi măng");
```

### 1.4 Shopping Pages Cần Update

| Trang          | File                           | Task                                    |
| -------------- | ------------------------------ | --------------------------------------- |
| Trang chủ Shop | `app/(tabs)/index.tsx`         | Thay PRODUCTS mock bằng useRealProducts |
| Category       | `app/shopping/[category].tsx`  | ✅ Đã dùng getProducts()                |
| Flash Sale     | `app/shopping/flash-sale.tsx`  | ✅ Đã dùng getFlashSaleProducts()       |
| Chi tiết SP    | `app/product/[id].tsx`         | Dùng getProductById()                   |
| Tìm kiếm       | `app/search/advanced.tsx`      | Thay PRODUCTS mock                      |
| Admin Products | `app/admin/products/index.tsx` | ✅ Đã dùng productService               |

---

## 🛒 PHASE 2: CART & CHECKOUT (Tuần 3-4)

### 2.1 Cart API Endpoints (BE)

```
GET    /cart                  - Lấy giỏ hàng user
POST   /cart/items            - Thêm sản phẩm
PATCH  /cart/items/:id        - Cập nhật số lượng
DELETE /cart/items/:id        - Xóa sản phẩm
DELETE /cart                  - Xóa toàn bộ giỏ
POST   /cart/coupon           - Áp dụng mã giảm giá
POST   /cart/sync             - Sync local cart khi login
POST   /cart/validate         - Validate trước checkout
```

### 2.2 Order API Endpoints (BE)

```
POST   /orders                - Tạo đơn hàng mới
GET    /orders                - Danh sách đơn hàng
GET    /orders/:id            - Chi tiết đơn hàng
POST   /orders/:id/cancel     - Hủy đơn hàng
GET    /orders/:id/tracking   - Theo dõi vận chuyển
POST   /orders/:id/pay/vnpay  - Thanh toán VNPay
POST   /orders/:id/pay/momo   - Thanh toán MoMo
```

### 2.3 Frontend Integration Tasks

- [ ] Update `context/cart-context.tsx` để sync với API
- [ ] Tích hợp VNPay WebView trong `app/checkout/payment.tsx`
- [ ] Tạo `app/orders/index.tsx` - Danh sách đơn hàng
- [ ] Tạo `app/orders/[id].tsx` - Chi tiết đơn hàng
- [ ] Tạo `app/orders/tracking.tsx` - Theo dõi vận chuyển

---

## 📺 PHASE 3: LIVESTREAM ENHANCEMENT (Tuần 5-6)

### 3.1 Backend Livestream (Đã có)

**Endpoints:**

```
POST   /livestream            - Tạo stream mới
GET    /livestream            - Danh sách streams
GET    /livestream/:id        - Chi tiết stream
PATCH  /livestream/:id        - Update stream
POST   /livestream/:id/start  - Go live
POST   /livestream/:id/end    - End stream
POST   /livestream/:id/comments - Thêm comment
POST   /livestream/:id/reactions - Thêm reaction
```

### 3.2 Frontend Livestream Tasks

- [ ] Tạo `app/(tabs)/live.tsx` - TikTok-style vertical feed
- [ ] Tạo `components/livestream/LiveCard.tsx` - Card stream
- [ ] Tạo `components/livestream/LiveRoom.tsx` - Room xem stream
- [ ] Tạo `components/livestream/ProductPinned.tsx` - SP trong live
- [ ] Tích hợp LiveKit/Agora cho real-time video

### 3.3 Features Cần Thêm

| Feature        | Priority | Mô tả                          |
| -------------- | -------- | ------------------------------ |
| Gift System    | HIGH     | Gửi quà tặng, animation        |
| Product Pin    | HIGH     | Ghim SP trong live, "Mua ngay" |
| Chat Real-time | HIGH     | WebSocket chat                 |
| Viewer Count   | MEDIUM   | Số người xem real-time         |
| Stream Quality | LOW      | Chọn 480p/720p/1080p           |
