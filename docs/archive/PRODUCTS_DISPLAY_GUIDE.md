# Giao diện hiển thị sản phẩm từ Backend

## 📦 Tổng quan

Đã tích hợp giao diện hiển thị sản phẩm từ backend API vào ứng dụng React Native.

## 🎯 Các thành phần đã thêm

### 1. **ProductsList Component** (`components/products/ProductsList.tsx`)

Component có thể tái sử dụng để hiển thị danh sách sản phẩm.

**Props:**
- `category?: ProductCategory` - Lọc theo danh mục (MATERIAL, TOOL, EQUIPMENT, SERVICE)
- `status?: ProductStatus` - Lọc theo trạng thái (mặc định: APPROVED)
- `limit?: number` - Số lượng sản phẩm hiển thị (mặc định: 20)
- `horizontal?: boolean` - Hiển thị dạng ngang (carousel)
- `showHeader?: boolean` - Hiển thị header với tiêu đề
- `onProductPress?: (product) => void` - Custom handler khi nhấn vào sản phẩm

**Tính năng:**
- ✅ Tự động fetch dữ liệu từ API `/api/v1/products`
- ✅ Pull-to-refresh để cập nhật
- ✅ Loading state với spinner
- ✅ Empty state khi không có sản phẩm
- ✅ Error handling với nút retry
- ✅ Hiển thị hình ảnh sản phẩm hoặc placeholder
- ✅ Badge danh mục với icon
- ✅ Badge "Hết hàng" cho sản phẩm không available
- ✅ Hiển thị giá, đơn vị, tồn kho
- ✅ Tags/nhãn sản phẩm
- ✅ Format giá VND chuẩn

**Cách sử dụng:**
```tsx
import { ProductsList } from '@/components/products/ProductsList';
import { ProductCategory } from '@/types/products';

// Hiển thị tất cả sản phẩm
<ProductsList limit={10} showHeader={true} />

// Hiển thị theo danh mục
<ProductsList 
  category={ProductCategory.MATERIAL} 
  limit={6}
  horizontal={true}
/>

// Custom handler
<ProductsList 
  onProductPress={(product) => {
    console.log('Selected:', product);
  }}
/>
```

### 2. **Products From Backend Screen** (`app/shopping/products-from-backend.tsx`)

Màn hình đầy đủ với các tính năng:

**Tính năng:**
- ✅ **Search bar** - Tìm kiếm sản phẩm theo tên
- ✅ **Category filter** - Lọc theo 4 danh mục (Pills dạng ngang)
- ✅ **Sort options** - Sắp xếp theo:
  - Mới nhất (createdAt)
  - Giá (price)
  - Tên A-Z (name)
  - Thứ tự tăng/giảm (asc/desc)
- ✅ **Results counter** - Hiển thị số lượng sản phẩm
- ✅ **Infinite scroll** - Load more khi scroll xuống cuối
- ✅ **Pull-to-refresh** - Cập nhật dữ liệu
- ✅ **2-column grid** - Hiển thị 2 cột sản phẩm
- ✅ **Pagination** - Tự động load thêm khi cần

**Route:**
```tsx
router.push('/shopping/products-from-backend');
```

### 3. **Tích hợp vào Home Screen** (`app/(tabs)/index.tsx`)

Đã thêm section hiển thị sản phẩm:

```tsx
{/* Products from Backend */}
<View style={styles.section}>
  <ProductsList 
    limit={10}
    showHeader={true}
  />
</View>
```

### 4. **Quick Action Button**

Đã thêm nút "Sản phẩm" vào Quick Actions với icon `storefront-outline` màu cam (#f59e0b).

## 🔌 API Integration

### Endpoint
```
GET https://baotienweb.cloud/api/v1/products
```

### Service Layer
File: `services/products.ts`

Function: `getMyProducts(filters?: FilterProductsDto)`

**Filters hỗ trợ:**
- `page: number` - Trang (mặc định: 1)
- `limit: number` - Số items/trang (mặc định: 20)
- `category: ProductCategory` - Danh mục
- `status: ProductStatus` - Trạng thái (DRAFT, PENDING, APPROVED, REJECTED)
- `minPrice: number` - Giá tối thiểu
- `maxPrice: number` - Giá tối đa
- `search: string` - Từ khóa tìm kiếm
- `isAvailable: boolean` - Còn hàng/hết hàng
- `sortBy: 'price' | 'createdAt' | 'name'` - Sắp xếp theo
- `sortOrder: 'asc' | 'desc'` - Thứ tự

**Response format:**
```typescript
{
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### Product Type
```typescript
interface Product {
  id: number;
  name: string;
  description?: string;
  category: ProductCategory; // MATERIAL | TOOL | EQUIPMENT | SERVICE
  price: number;
  unit: string; // "cái", "kg", "m2", etc.
  stock?: number;
  sku?: string;
  images?: string[];
  specifications?: Record<string, any>;
  tags?: string[];
  isAvailable: boolean;
  status: ProductStatus; // DRAFT | PENDING | APPROVED | REJECTED
  vendorId: number;
  createdAt: string;
  updatedAt: string;
}
```

## 📱 UI/UX Features

### Product Card Design
- **Image**: 160x160px với placeholder nếu không có ảnh
- **Category badge**: Góc trên bên trái với icon + label
- **Availability badge**: "Hết hàng" ở góc trên bên phải
- **Product name**: Tối đa 2 dòng, bold 14px
- **Description**: Tối đa 2 dòng, 12px
- **Price**: Lớn, bold, màu primary với format VND
- **Unit**: Nhỏ, màu secondary
- **Stock**: Icon + số lượng tồn kho
- **Tags**: Hiển thị tối đa 2 tag đầu tiên

### Category Icons
- 🧱 MATERIAL (Vật liệu): `cube`
- 🔨 TOOL (Công cụ): `hammer`
- ⚙️ EQUIPMENT (Thiết bị): `construct`
- 💼 SERVICE (Dịch vụ): `briefcase`

### Colors
- Primary: `MODERN_COLORS.primary` - Màu chính
- Background: `MODERN_COLORS.background` - Nền
- Text: `MODERN_COLORS.text` - Chữ chính
- Secondary text: `MODERN_COLORS.textSecondary` - Chữ phụ
- Error: `MODERN_COLORS.error` - Đỏ (hết hàng)

## 🚀 Testing

### 1. Test API Connection
```bash
# On VPS
curl https://baotienweb.cloud/api/v1/products
```

### 2. Test trong App
1. Mở Home screen
2. Scroll xuống section "Sản phẩm"
3. Xem danh sách sản phẩm có load không
4. Pull-to-refresh để test reload

### 3. Test Full Catalog
1. Tap vào Quick Action "Sản phẩm"
2. Hoặc tap "Xem tất cả" ở section sản phẩm
3. Test search bar
4. Test category filter
5. Test sort options
6. Test infinite scroll (scroll xuống cuối)

## 🐛 Error Handling

### Khi API lỗi
- Hiển thị icon alert + message lỗi
- Nút "Thử lại" để retry
- Console.error log chi tiết

### Khi không có sản phẩm
- Icon cube outline lớn
- Text "Chưa có sản phẩm"
- Subtitle giải thích (theo category nếu có)

### Network issues
- Loading spinner khi đang fetch
- Refresh control để pull-to-refresh
- Timeout handling trong `apiFetch`

## 📊 Performance

### Optimizations
- ✅ FlatList với `keyExtractor` và `numColumns`
- ✅ Image lazy loading
- ✅ Pagination (20 items/page)
- ✅ Pull-to-refresh debounce
- ✅ Memo-ized render items
- ✅ Infinite scroll với `onEndReached`

### Best Practices
- Sử dụng `ActivityIndicator` cho loading states
- Empty state design cho UX tốt hơn
- Error boundary với retry option
- Responsive layout (2-column grid)

## 🔄 Future Enhancements

### Có thể thêm
- [ ] Filters nâng cao (price range slider)
- [ ] Favorites/wishlist integration
- [ ] Product detail screen với full info
- [ ] Add to cart integration
- [ ] Skeleton loading states
- [ ] Image zoom/gallery
- [ ] Share product
- [ ] Reviews & ratings
- [ ] Related products
- [ ] Recently viewed tracking

## 📝 Notes

- API URL: `https://baotienweb.cloud/api/v1` (production)
- Chỉ hiển thị sản phẩm có `status: APPROVED` và `isAvailable: true`
- Backend tự động lọc theo vendor khi gọi `getMyProducts`
- Format giá sử dụng `Intl.NumberFormat` chuẩn VND
- Icons từ `@expo/vector-icons/Ionicons`
- Shadows từ `MODERN_SHADOWS` constant
- Spacing từ `MODERN_SPACING` constant

## 🎨 Design System

### Spacing
```typescript
MODERN_SPACING.xs  // 4px
MODERN_SPACING.sm  // 8px
MODERN_SPACING.md  // 16px
MODERN_SPACING.lg  // 24px
MODERN_SPACING.xl  // 32px
```

### Shadows
```typescript
MODERN_SHADOWS.xs  // Subtle
MODERN_SHADOWS.sm  // Light
MODERN_SHADOWS.md  // Medium
MODERN_SHADOWS.lg  // Strong
```

### Typography
```typescript
fontSize: 11 // Badge text
fontSize: 12 // Description, unit, stock
fontSize: 13 // Sort options
fontSize: 14 // Product name, buttons
fontSize: 16 // Price
fontSize: 18 // Section title
fontSize: 20 // Header title
```

---

**Deployment Status:** ✅ Backend deployed & running  
**Last Updated:** December 18, 2025  
**Version:** 1.0.0
