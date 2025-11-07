# 🗺️ APP SITEMAP & ROUTING STRUCTURE

## 📱 BOTTOM TAB NAVIGATION
```
/(tabs)/
  ├─ index.tsx             → Trang chủ (Home)
  ├─ projects.tsx          → Dự án (Projects/Shop)
  ├─ notifications.tsx     → Thông báo
  └─ profile.tsx           → Hồ sơ cá nhân
```

---

## 🏠 TRANG CHỦ - HOME MODULES

### 1️⃣ DỊCH VỤ (Services) - 11 items
| ID | Tên | Route | Status |
|----|-----|-------|--------|
| 1 | Thiết kế nhà | `/projects/design-portfolio` | ✅ Exists |
| 2 | Thiết kế nội thất | `/projects/design-portfolio?category=interior` | ✅ Exists |
| 3 | Tra cứu xây dựng | `/utilities/construction-lookup` | ❌ Need Create |
| 4 | Xin phép | `/utilities/permit-application` | ❌ Need Create |
| 5 | Hồ sơ mẫu | `/utilities/sample-documents` | ❌ Need Create |
| 6 | Lỗ ban | `/utilities/feng-shui` | ❌ Need Create |
| 7 | Bảng mẫu | `/utilities/sample-boards` | ❌ Need Create |
| 8 | Tư vấn chất lượng | `/utilities/quality-consultation` | ❌ Need Create |
| 9 | Công ty xây dựng | `/projects/find-contractors?type=construction` | ✅ Exists |
| 10 | Công ty nội thất | `/projects/find-contractors?type=interior` | ✅ Exists |
| 11 | Giám sát chất lượng | `/utilities/quality-supervision` | ❌ Need Create |

### 2️⃣ TIỆN ÍCH XÂY DỰNG (Construction Utilities) - 8 items
| ID | Tên | Route | Status |
|----|-----|-------|--------|
| 1 | Ép cọc | `/utilities/pile-driving` | ❌ Need Create |
| 2 | Đào đất | `/utilities/excavation` | ❌ Need Create |
| 3 | Vật liệu | `/utilities/materials` | ❌ Need Create |
| 4 | Nhân công | `/utilities/labor` | ❌ Need Create |
| 5 | Thợ xây | `/utilities/masons` | ❌ Need Create |
| 6 | Thợ coffa | `/utilities/formwork-workers` | ❌ Need Create |
| 7 | Thợ điện nước | `/utilities/mep-workers` | ❌ Need Create |
| 8 | Bê tông | `/utilities/concrete` | ❌ Need Create |

### 3️⃣ TIỆN ÍCH HOÀN THIỆN (Finishing Utilities) - 8 items
| ID | Tên | Route | Status |
|----|-----|-------|--------|
| 1 | Thợ lát gạch | `/utilities/tile-workers` | ❌ Need Create |
| 2 | Thợ thạch cao | `/utilities/drywall-workers` | ❌ Need Create |
| 3 | Thợ sơn | `/utilities/painters` | ❌ Need Create |
| 4 | Thợ đá | `/utilities/stone-workers` | ❌ Need Create |
| 5 | Thợ làm cửa | `/utilities/door-workers` | ❌ Need Create |
| 6 | Thợ lan can | `/utilities/railing-workers` | ❌ Need Create |
| 7 | Thợ công | `/utilities/ironworkers` | ❌ Need Create |
| 8 | Thợ camera | `/utilities/camera-installers` | ❌ Need Create |

### 4️⃣ MUA SẮM TRANG THIẾT BỊ (Equipment Shopping) - 8 items
| ID | Tên | Route | Status |
|----|-----|-------|--------|
| 1 | Thiết bị bếp | `/shopping/kitchen-equipment` | ❌ Need Create |
| 2 | Thiết bị vệ sinh | `/shopping/sanitary-equipment` | ❌ Need Create |
| 3 | Điện | `/shopping/electrical` | ❌ Need Create |
| 4 | Nước | `/shopping/plumbing` | ❌ Need Create |
| 5 | PCCC | `/shopping/fire-safety` | ❌ Need Create |
| 6 | Bàn ăn | `/shopping/dining-tables` | ❌ Need Create |
| 7 | Bàn học | `/shopping/study-desks` | ❌ Need Create |
| 8 | Sofa | `/shopping/sofas` | ❌ Need Create |

### 5️⃣ THƯ VIỆN (Library) - 7 items
| ID | Tên | Route | Status |
|----|-----|-------|--------|
| 1 | Văn phòng | `/projects/architecture-portfolio?type=office` | ✅ Exists |
| 2 | Nhà phố | `/projects/architecture-portfolio?type=townhouse` | ✅ Exists |
| 3 | Biệt thự | `/projects/architecture-portfolio?type=villa` | ✅ Exists |
| 4 | Biệt thự cổ điển | `/projects/architecture-portfolio?type=classic-villa` | ✅ Exists |
| 5 | Khách sạn | `/projects/architecture-portfolio?type=hotel` | ✅ Exists |
| 6 | Nhà xưởng | `/projects/architecture-portfolio?type=factory` | ✅ Exists |
| 7 | Căn hộ dịch vụ | `/projects/architecture-portfolio?type=serviced-apartment` | ✅ Exists |

### 6️⃣ TIỆN ÍCH THIẾT KẾ (Design Utilities) - 7 items
| ID | Tên | Route | Status |
|----|-----|-------|--------|
| 1 | Kiến trúc sư | `/utilities/architects` | ❌ Need Create |
| 2 | Kỹ sư giám sát | `/utilities/supervision-engineers` | ❌ Need Create |
| 3 | Kỹ sư kết cấu | `/utilities/structural-engineers` | ❌ Need Create |
| 4 | Kỹ sư điện | `/utilities/electrical-engineers` | ❌ Need Create |
| 5 | Kỹ sư nước | `/utilities/plumbing-engineers` | ❌ Need Create |
| 6 | Dự toán | `/utilities/cost-estimators` | ❌ Need Create |
| 7 | Nội thất | `/utilities/interior-designers` | ❌ Need Create |

### 7️⃣ VIDEO THIẾT KẾ LIVE (Design Live Videos)
- Route: Click vào video → Open Reels player modal
- Implementation: Already exists with ReelsPlayer component

### 8️⃣ VIDEO XÂY DỰNG (Construction Videos)
- Route: Click vào video → Open Reels player modal
- Implementation: Already exists with ReelsPlayer component

---

## 📂 EXISTING ROUTES

### Projects Section
```
/projects/
  ├─ create.tsx                      → Tạo dự án mới
  ├─ design-portfolio.tsx            → Portfolio thiết kế
  ├─ construction-portfolio.tsx      → Portfolio xây dựng
  ├─ architecture-portfolio.tsx      → Portfolio kiến trúc
  ├─ find-contractors.tsx            → Tìm nhà thầu
  ├─ quotation-list.tsx              → Danh sách báo giá
  ├─ [id].tsx                        → Chi tiết dự án
  ├─ [id]/construction-timeline.tsx  → Timeline xây dựng
  ├─ [id]/payment-progress.tsx       → Tiến độ thanh toán
  └─ [id]/process-detail/[processId].tsx → Chi tiết quy trình
```

### Communications
```
/communications/
  ├─ index.tsx                → Danh sách cuộc trò chuyện
  ├─ create-meeting.tsx       → Tạo cuộc họp
  └─ [id].tsx                 → Chi tiết tin nhắn
```

### Calls
```
/call/
  ├─ audio-call.tsx           → Gọi thoại
  └─ video-call.tsx           → Gọi video
```

### Messages
```
/messages/
  ├─ index.tsx                → Danh sách tin nhắn
  └─ [id].tsx                 → Chi tiết tin nhắn
```

### Profile
```
/profile/
  ├─ edit.tsx                         → Chỉnh sửa hồ sơ
  ├─ personal-verification.tsx        → Xác minh cá nhân
  ├─ contractor-verification.tsx      → Xác minh nhà thầu
  ├─ settings.tsx                     → Cài đặt
  └─ security.tsx                     → Bảo mật
```

### Utilities (Dynamic)
```
/utilities/
  └─ [slug].tsx               → Dynamic utility pages
```

### Legal
```
/legal/
  ├─ privacy.tsx              → Chính sách bảo mật
  └─ terms.tsx                → Điều khoản sử dụng
```

---

## 🎯 ROUTING STRATEGY

### 1. Service Cards (Dịch vụ)
```tsx
const SERVICE_ROUTES: Record<number, string> = {
  1: '/projects/design-portfolio',
  2: '/projects/design-portfolio?category=interior',
  3: '/utilities/construction-lookup',
  4: '/utilities/permit-application',
  5: '/utilities/sample-documents',
  6: '/utilities/feng-shui',
  7: '/utilities/sample-boards',
  8: '/utilities/quality-consultation',
  9: '/projects/find-contractors?type=construction',
  10: '/projects/find-contractors?type=interior',
  11: '/utilities/quality-supervision',
};
```

### 2. Utilities Dynamic Route
Use slug pattern: `/utilities/[slug]`
- Example: `/utilities/pile-driving`, `/utilities/architects`

### 3. Shopping Dynamic Route
Use category pattern: `/shopping/[category]`
- Example: `/shopping/kitchen-equipment`

### 4. Library → Architecture Portfolio
Use query parameters for filtering
- Example: `/projects/architecture-portfolio?type=villa`

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Connect Existing Routes ✅
- [x] Services → Design/Construction portfolios
- [x] Library → Architecture portfolio
- [x] Find contractors

### Phase 2: Create Utility Template (Priority)
- [ ] Create `/utilities/[slug].tsx` dynamic route
- [ ] Support all utility categories
- [ ] Add filters: location, price, rating

### Phase 3: Create Shopping Template
- [ ] Create `/shopping/[category].tsx` route
- [ ] Product listing with cart integration
- [ ] Equipment details and specs

### Phase 4: Specialized Utilities
- [ ] Construction lookup tool
- [ ] Permit application form
- [ ] Quality consultation booking
- [ ] Sample documents library

---

## 📋 NOTES

1. **Dynamic Routes**: Use slug/category patterns to reduce file count
2. **Query Params**: Use for filtering within same screen
3. **Modals**: Use for quick actions (video player, filters)
4. **Deep Linking**: All routes should support deep links
5. **SEO Ready**: Structure supports future web version

---

**Last Updated**: November 1, 2025
**Total Routes**: 60+ screens/utilities
**Implementation Status**: ~15% complete
