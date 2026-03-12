# Cấu trúc 7 Tầng Trang Chủ - Shopee/Grab Style

## 📋 Tổng quan

Trang chủ được thiết kế theo mô hình **7 LAYERS (7 Tầng)** giống Shopee/Grab với cấu trúc phân cấp rõ ràng, mapping toàn bộ **300+ routes** từ `constants/app-routes.ts`.

### Tổng số Routes: 300+ routes
- Main Services: 8 routes
- Construction Services: 8 routes  
- Management Tools: 8 routes
- Finishing Works: 8 routes
- Professional Services: 4 routes
- Quick Tools: 8 routes
- Shopping Categories: 4 routes
- **Total routes được map: 48 direct links + 250+ indirect via sitemap**

---

## 🏗️ Kiến trúc 7 Tầng

### **LAYER 1: Main Services** (Dịch vụ chính)
**Mục đích:** Top priority features - Các tính năng quan trọng nhất

**UI Design:**
- Grid 4 cột (4x2 = 8 items)
- Card với icon emoji và background màu pastel
- Kích thước: 56x56px icon

**Routes:**
1. 🏠 Thiết kế nhà → `/services/house-design`
2. 🏗️ Thi công XD → `/construction/progress`
3. 📁 Dự án của tôi → `/(tabs)/projects`
4. 📊 Tiến độ → `/construction/tracking`
5. 🧱 Vật liệu → `/materials/index`
6. 👷 Nhân công → `/labor/index`
7. 💰 Báo giá → `/utilities/quote-request`
8. 🗺️ Sitemap → `/utilities/sitemap` (Truy cập 300+ routes)

**Style highlights:**
- Background colors: Unique per service
- Border radius: 12px
- Emoji size: 28pt

---

### **LAYER 2: Construction Services** (Dịch vụ thi công)
**Mục đích:** Price-based services - Dịch vụ có giá cả

**UI Design:**
- Grid 4 cột (4x2 = 8 items)
- Card với icon, label, price tag
- Add button (+) ở góc phải
- Subtitle: "Miễn phí tư vấn - Giảm 20% gói combo"

**Routes:**
1. ⚡ Ép cọc → `/utilities/ep-coc` (15.000đ)
2. 🚜 Đào đất → `/utilities/dao-dat` (12.000đ)
3. 🏗️ Bê tông → `/utilities/be-tong` (18.000đ)
4. 📦 Vật liệu XD → `/utilities/vat-lieu` (10.000đ)
5. 👷‍♂️ Thợ xây → `/utilities/tho-xay` (25.000đ)
6. ⚡ Thợ điện → `/utilities/tho-dien-nuoc` (22.000đ)
7. 🔨 Cốp pha → `/utilities/tho-coffa` (20.000đ)
8. 👥 Thiết kế team → `/utilities/design-team` (30.000đ)

**Features:**
- Price display
- Quick add to cart
- Combo discount banner

---

### **LAYER 3: Management Tools** (Công cụ quản lý)
**Mục đích:** Professional tools for project managers

**UI Design:**
- Grid 4 cột (4x2 = 8 items)
- Icon Ionicons với background màu nhẹ
- Icon size: 24px
- Compact label

**Routes:**
1. git-network-outline Timeline → `/timeline/index`
2. cash-outline Ngân sách → `/budget/index`
3. checkmark-circle-outline QC/QA → `/quality-assurance/index`
4. shield-outline An toàn → `/safety/index`
5. folder-outline Tài liệu → `/documents/folders`
6. document-text-outline Báo cáo → `/reports/index`
7. help-circle-outline RFI → `/rfi/index`
8. document-attach-outline Submittal → `/submittal/index`

**Colors:**
- Timeline: #6C5CE7
- Budget: #00B894
- QC/QA: #FDCB6E
- Safety: #E17055
- Documents: #0984E3
- Reports: #A29BFE
- RFI: #FD79A8
- Submittal: #FDCB6E

---

### **LAYER 4: Finishing Works** (Hoàn thiện nội thất)
**Mục đích:** Interior finishing services with badges

**UI Design:**
- Horizontal scroll
- Card 100x100px
- Badges: HOT (red), NEW (green)
- Icon background: #f5f5f5

**Routes:**
1. grid-outline Lát gạch → `/finishing/lat-gach` [HOT]
2. color-fill-outline Sơn tường → `/finishing/son` [NEW]
3. diamond-outline Đá tự nhiên → `/finishing/da`
4. square-outline Thạch cao → `/finishing/thach-cao` [HOT]
5. enter-outline Làm cửa → `/finishing/lam-cua`
6. reorder-four-outline Lan can → `/finishing/lan-can`
7. camera-outline Camera → `/finishing/camera` [NEW]
8. people-outline Thợ tổng hợp → `/finishing/tho-tong-hop`

**Badge system:**
- HOT: #ff4444 background
- NEW: #00c853 background
- Font size: 10px, bold

---

### **LAYER 5: Professional Services** (Dịch vụ chuyên nghiệp)
**Mục đích:** Expert consultants with ratings

**UI Design:**
- Vertical card list
- Image 80x80px + Info panel
- Rating stars: 4.8 ⭐ (120+ reviews)
- Horizontal layout

**Routes:**
1. 🛏️ Thiết kế nội thất → `/services/interior-design`
   - "Chuyên nghiệp, hiện đại"
2. 🏢 Kiến trúc sư → `/services/construction-company`
   - "Tư vấn miễn phí"
3. 👁️ Giám sát CL → `/services/quality-supervision`
   - "Chuyên gia đầu ngành"
4. 🧭 Phong thủy → `/services/feng-shui`
   - "Tư vấn chuyên sâu"

**Features:**
- Professional images
- Rating system
- Quick access chevron
- Description text

---

### **LAYER 6: Quick Tools** (Công cụ nhanh)
**Mục đích:** Utility shortcuts

**UI Design:**
- Compact grid 4 cột (4x2 = 8 items)
- Icon 24px + Small label 10px
- Minimal padding

**Routes:**
1. calculator-outline Dự toán → `/utilities/cost-estimator`
2. qr-code-outline QR Code → `/utilities/my-qr-code`
3. calendar-outline Lịch trình → `/utilities/schedule`
4. location-outline Cửa hàng → `/utilities/store-locator`
5. sparkles-outline AI Trợ lý → `/services/ai-assistant/index`
6. videocam-outline Live Stream → `/(tabs)/live`
7. play-circle-outline Video XD → `/videos/index`
8. chatbubbles-outline Tin nhắn → `/messages/index`

**Purpose:**
- Fast access to utilities
- No description needed
- Single tap action

---

### **LAYER 7: Shopping Categories** (Danh mục mua sắm)
**Mục đích:** E-commerce product categories

**UI Design:**
- Row layout (4 items)
- Circular icon 60px
- Emoji icons
- Label below

**Routes:**
1. 🏗️ Vật liệu XD → `/shopping/index?cat=construction`
2. ⚡ Thiết bị điện → `/shopping/index?cat=electrical`
3. 🛋️ Nội thất → `/shopping/index?cat=furniture`
4. 🎨 Sơn & Màu → `/shopping/index?cat=paint`

**Integration:**
- Links to shopping module
- Category filtering
- Product listing

---

## 🎯 Special Features

### **AI Assistant Banner**
```
✨ Trợ lý AI xây dựng
Tư vấn miễn phí 24/7, phân tích ảnh công trình
→ /services/ai-assistant/index
```
- Full width banner
- Primary color background
- Prominent placement after Layer 1

### **User Welcome Header**
```
Xin chào, [User Name] ⭐ 1,250 points
```
- Personalized greeting
- Points system display
- Reward badge link → `/profile/rewards`

### **Bottom Action Bar**
Two CTAs:
1. **Primary:** "Tạo dự án mới" → `/projects/create`
2. **Secondary:** "Livestream" → `/live/create`

### **Products from Backend (Layer 8)**
- Integrated ProductsList component
- Limit: 12 products
- Full backend integration
- Category: Shopping

---

## 📊 Route Mapping Summary

### Direct Mapped Routes (48)
- Layer 1: 8 routes
- Layer 2: 8 routes
- Layer 3: 8 routes
- Layer 4: 8 routes
- Layer 5: 4 routes
- Layer 6: 8 routes
- Layer 7: 4 routes

### Indirect Routes (250+ via Sitemap)
Access via `/utilities/sitemap`:
- Auth routes: 4
- Project management: 30+
- Advanced features: 50+
- Communication: 15+
- Profile: 25+
- Services: 20+
- Legal: 5+
- Media: 5+
- Admin dashboards: 6+

**Total accessible routes: 300+**

---

## 🎨 Design System

### Colors
- Primary: `MODERN_COLORS.primary`
- Background: `#f5f5f5`
- Cards: `#fff`
- Text: `#333`
- Secondary text: `#666`
- Muted: `#999`

### Typography
- Section title: 16px, bold
- Card label: 11-14px
- Subtitle: 12px
- Price: 12px, bold

### Spacing
- Section padding: 16px
- Card margin: 6px horizontal
- Section gap: 8px vertical

### Border Radius
- Cards: 8-12px
- Buttons: 8px
- Icons: 12px
- Circular: 30px (categories)

---

## 🔄 Navigation Flow

```
Home Screen
├─ LAYER 1: Main Services (8)
│  ├─ Thiết kế nhà → Design flow
│  ├─ Thi công XD → Construction flow
│  ├─ Dự án → Project management
│  ├─ Tiến độ → Progress tracking
│  ├─ Vật liệu → Materials catalog
│  ├─ Nhân công → Labor management
│  ├─ Báo giá → Quote requests
│  └─ Sitemap → All 300+ routes
│
├─ LAYER 2: Construction Services (8)
│  └─ Utilities with pricing
│
├─ LAYER 3: Management Tools (8)
│  └─ Professional PM tools
│
├─ LAYER 4: Finishing Works (8)
│  └─ Interior services
│
├─ LAYER 5: Professional Services (4)
│  └─ Expert consultants
│
├─ LAYER 6: Quick Tools (8)
│  └─ Fast utilities
│
├─ LAYER 7: Shopping (4)
│  └─ E-commerce categories
│
└─ LAYER 8: Products Backend
   └─ ProductsList component
```

---

## ✅ Implementation Checklist

- [x] Created 7-layer architecture
- [x] Mapped 48 direct routes
- [x] Integrated sitemap for 300+ routes
- [x] Added AI banner promotion
- [x] User welcome header
- [x] Bottom action bar
- [x] Products backend integration
- [x] Pull-to-refresh
- [x] Search functionality
- [x] Points/rewards system
- [x] Professional styling
- [x] No TypeScript errors
- [ ] Test all navigation routes
- [ ] Performance optimization
- [ ] Analytics tracking

---

## 🚀 Next Steps

1. **Testing Phase**
   - Test all 48 direct routes
   - Verify sitemap navigation
   - Check responsive behavior

2. **Enhancement**
   - Add skeleton loading
   - Implement analytics
   - Add deep linking

3. **Content**
   - Replace placeholder images
   - Update service descriptions
   - Add real pricing data

---

## 📝 File Structure

```
app/(tabs)/index.tsx (853 lines)
├─ Imports (25 lines)
├─ Data Constants (110 lines)
│  ├─ MAIN_SERVICES
│  ├─ CONSTRUCTION_SERVICES
│  ├─ MANAGEMENT_TOOLS
│  ├─ FINISHING_WORKS
│  ├─ PROFESSIONAL_SERVICES
│  ├─ QUICK_TOOLS
│  └─ SHOPPING_CATEGORIES
├─ Component Logic (30 lines)
│  ├─ handleRefresh()
│  ├─ handleSearch()
│  └─ navigateTo()
├─ JSX Return (350 lines)
│  ├─ Header
│  ├─ 7 Layers sections
│  ├─ ProductsList
│  └─ Bottom actions
└─ StyleSheet (338 lines)
   ├─ Header styles
   ├─ Layer 1-7 styles
   └─ Utility styles
```

---

## 🎯 Key Achievements

✅ **Shopee/Grab-style** multi-layer architecture  
✅ **300+ routes** accessible from home  
✅ **7 distinct layers** with clear hierarchy  
✅ **Professional design** with modern UI  
✅ **Full route mapping** from app-routes.ts  
✅ **Zero TypeScript errors**  
✅ **Maintainable structure** - easy to add new services  

---

**Last updated:** December 18, 2025  
**File:** `app/(tabs)/index.tsx`  
**Lines of code:** 853  
**Total routes:** 300+
