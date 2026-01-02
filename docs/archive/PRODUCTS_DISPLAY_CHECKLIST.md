# ✅ Checklist: Kiểm tra giao diện sản phẩm

## 📋 Các bước kiểm tra

### 1. Backend đang chạy ✓
```bash
# Trên VPS, chạy:
curl https://baotienweb.cloud/api/v1/products

# Kết quả mong đợi:
# { "products": [...], "total": X, ... }
```

**Status:** ✅ Backend online (PM2 process 15366)

---

### 2. Component ProductsList

#### Test trong code:
```tsx
import { ProductsList } from '@/components/products/ProductsList';

// Trong component:
<ProductsList limit={6} showHeader={true} />
```

**Checklist:**
- [ ] Component render không lỗi
- [ ] Hiển thị loading spinner ban đầu
- [ ] Sau vài giây, hiển thị sản phẩm
- [ ] Product cards hiển thị đầy đủ:
  - [ ] Hình ảnh (hoặc placeholder)
  - [ ] Badge danh mục
  - [ ] Tên sản phẩm
  - [ ] Giá VND format đúng
  - [ ] Đơn vị (/cái, /kg, etc.)
- [ ] Pull-to-refresh hoạt động
- [ ] Tap vào sản phẩm navigate đến detail

---

### 3. Màn hình Products From Backend

#### Navigate:
```tsx
router.push('/shopping/products-from-backend');
```

**Checklist:**
- [ ] Màn hình mở được
- [ ] Header hiển thị "Sản phẩm từ Backend"
- [ ] Search bar hoạt động:
  - [ ] Gõ từ khóa → Filter results
  - [ ] Icon X xóa search query
- [ ] Category filter:
  - [ ] 5 pills: Tất cả, Vật liệu, Công cụ, Thiết bị, Dịch vụ
  - [ ] Tap pill → Highlight & filter
  - [ ] Tap "Tất cả" → Reset filter
- [ ] Sort options:
  - [ ] 3 buttons: Mới nhất, Giá, Tên A-Z
  - [ ] Tap button → Highlight & sort
  - [ ] Arrow button toggle asc/desc
- [ ] Results counter hiển thị đúng
- [ ] Grid 2 cột
- [ ] Pull-to-refresh
- [ ] Scroll xuống cuối → Load more
- [ ] Footer loader khi load more

---

### 4. Home Screen Integration

#### Mở Home screen:
```tsx
// app/(tabs)/index.tsx
```

**Checklist:**
- [ ] Section "Sản phẩm" hiển thị
- [ ] Icon storefront + title
- [ ] 10 sản phẩm hiển thị (hoặc ít hơn nếu backend có ít)
- [ ] Button "Xem tất cả" ở góc phải
- [ ] Tap "Xem tất cả" → Navigate to full screen
- [ ] Pull-to-refresh cập nhật section

---

### 5. Quick Actions

**Checklist:**
- [ ] Scroll Home screen đến "Truy cập nhanh"
- [ ] Nút "Sản phẩm" hiển thị (icon 🛒 màu cam)
- [ ] Vị trí: Đầu tiên trong danh sách
- [ ] Tap nút → Navigate to products screen

---

### 6. Error Handling

#### Test các trường hợp lỗi:

**A. Không có sản phẩm:**
- [ ] Filter category không có data
- [ ] Hiển thị icon cube outline
- [ ] Text "Không tìm thấy sản phẩm"
- [ ] Subtitle hướng dẫn

**B. API lỗi (tắt backend để test):**
- [ ] Hiển thị icon alert
- [ ] Text "Lỗi tải dữ liệu"
- [ ] Nút "Thử lại" hiển thị
- [ ] Tap "Thử lại" → Retry fetch

**C. Network timeout:**
- [ ] Loading spinner
- [ ] Sau timeout → Error state
- [ ] Console.error log chi tiết

---

### 7. Performance

**Checklist:**
- [ ] Scroll mượt mà (60fps)
- [ ] Images load nhanh
- [ ] Infinite scroll không lag
- [ ] Pull-to-refresh responsive
- [ ] No memory leaks (check dev tools)

---

### 8. API Filters Test

#### Test từng filter:

**Category:**
- [ ] Filter "Vật liệu" → Chỉ show MATERIAL
- [ ] Filter "Công cụ" → Chỉ show TOOL
- [ ] Filter "Thiết bị" → Chỉ show EQUIPMENT
- [ ] Filter "Dịch vụ" → Chỉ show SERVICE
- [ ] "Tất cả" → Show all

**Sort:**
- [ ] "Mới nhất" → Sản phẩm mới nhất trước
- [ ] "Giá" ⬇️ → Giá cao → thấp
- [ ] "Giá" ⬆️ → Giá thấp → cao
- [ ] "Tên A-Z" ⬆️ → A → Z
- [ ] "Tên A-Z" ⬇️ → Z → A

**Search:**
- [ ] Search "xi măng" → Results match
- [ ] Search "cement" → Results match
- [ ] Search với dấu tiếng Việt
- [ ] Clear search → Reset

**Pagination:**
- [ ] Page 1: 20 items
- [ ] Scroll xuống → Load page 2
- [ ] Counter cập nhật: "150 sản phẩm"
- [ ] Đến page cuối → Không load thêm

---

### 9. UI/UX Polish

**Product Card:**
- [ ] Border radius: 12px
- [ ] Shadow: subtle
- [ ] Badge góc trên trái: category
- [ ] Badge góc trên phải: "Hết hàng" (nếu unavailable)
- [ ] Image: 160x160px
- [ ] Placeholder: Icon + màu xám nhạt
- [ ] Name: 2 lines max, ellipsis
- [ ] Description: 2 lines max, màu secondary
- [ ] Price: Bold, màu primary, VND format
- [ ] Unit: Nhỏ, màu secondary
- [ ] Stock: Icon cube + số
- [ ] Tags: 2 tags max, rounded pills

**Screen Layout:**
- [ ] Safe area insets đúng
- [ ] Header fixed top
- [ ] Search bar sticky
- [ ] Category pills scroll ngang
- [ ] Grid margins đều
- [ ] Footer padding bottom

---

### 10. Integration Test

**Flow hoàn chỉnh:**
1. [ ] Mở app → Home screen
2. [ ] Scroll xuống "Sản phẩm" section
3. [ ] Thấy 10 sản phẩm
4. [ ] Tap sản phẩm #1 → (Detail screen - chưa có)
5. [ ] Back → Home
6. [ ] Tap "Xem tất cả"
7. [ ] Màn hình full catalog mở
8. [ ] Search "cement"
9. [ ] Filter category "Vật liệu"
10. [ ] Sort "Giá" descending
11. [ ] Scroll xuống → Load more
12. [ ] Pull-to-refresh
13. [ ] Back → Home
14. [ ] Tap Quick Action "Sản phẩm"
15. [ ] Màn hình catalog mở lại

---

## 🎯 Kết quả mong đợi

### ✅ Hoạt động tốt:
- Backend API response trong <2s
- UI render mượt mà
- Filters hoạt động chính xác
- Pagination không lỗi
- Error handling graceful
- No crashes

### ❌ Lỗi cần fix:
- [ ] API timeout → Tăng timeout limit
- [ ] Images không load → Check CORS
- [ ] Scroll lag → Optimize FlatList
- [ ] Memory leak → Check useEffect cleanup

---

## 📊 Metrics

**Performance:**
- API response time: <2s
- Initial render: <1s
- Scroll FPS: 60fps
- Memory usage: <100MB

**Coverage:**
- Unit tests: TBD
- Integration tests: TBD
- E2E tests: TBD

---

## 🐛 Known Issues

1. ⚠️ **CRM module error** (non-critical)
   - Error: `Cannot find module '../../generated/prisma-crm'`
   - Impact: CRM features không hoạt động
   - Status: Backend vẫn chạy được

2. ⚠️ **Duplicate DTO warning**
   - Warning: `CreateInspectionDto` defined multiple times
   - Impact: Không ảnh hưởng functionality
   - Status: Sẽ fix trong next version

---

## ✅ Final Checklist

- [ ] Backend online & healthy
- [ ] ProductsList component works
- [ ] Full catalog screen works
- [ ] Home integration works
- [ ] Quick Action works
- [ ] All filters work
- [ ] Search works
- [ ] Sort works
- [ ] Pagination works
- [ ] Error handling works
- [ ] UI polish complete
- [ ] Performance acceptable
- [ ] Documentation complete

---

**Ngày kiểm tra:** __________  
**Người kiểm tra:** __________  
**Kết quả:** ⬜ Pass | ⬜ Fail | ⬜ Needs improvement  

**Ghi chú:**
____________________________________________
____________________________________________
____________________________________________
