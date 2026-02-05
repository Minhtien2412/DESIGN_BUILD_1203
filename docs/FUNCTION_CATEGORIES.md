# 📂 PHÂN LOẠI CHỨC NĂNG THEO DANH MỤC TRANG CHỦ

> Cập nhật: 15/01/2025
> Tổng routes: 654 | Components: 547+

---

## 🏠 CẤU TRÚC DANH MỤC TRANG CHỦ

```
┌─────────────────────────────────────────────────────────────┐
│                    TRANG CHỦ (index.tsx)                    │
├─────────────────────────────────────────────────────────────┤
│  1. SERVICES (16)         - Dịch vụ chính                   │
│  2. DESIGN_LIVE (6)       - Live streaming thiết kế         │
│  3. DESIGN_SERVICES (16)  - Tiện ích thiết kế               │
│  4. EQUIPMENT_ITEMS (16)  - Thiết bị / Mua sắm              │
│  5. LIBRARY_ITEMS (16)    - Thư viện mẫu nhà                │
│  6. CONSTRUCTION (16)     - Thợ xây dựng thô                │
│  7. FINISHING (16)        - Thợ hoàn thiện                  │
│  8. VIDEO_ITEMS (8)       - Video hướng dẫn                 │
│  9. CATEGORY_ITEMS (8)    - Danh mục nổi bật                │
│ 10. ENHANCED SECTIONS     - Sections mở rộng                │
└─────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ DỊCH VỤ CHÍNH (SERVICES) - 16 mục

| STT | Icon | Tên               | Route                            | Thư mục liên quan            |
| --- | ---- | ----------------- | -------------------------------- | ---------------------------- |
| 1   | 🏠   | Thiết kế nhà      | `/services/home-design`          | `services/` (30 files)       |
| 2   | 🛋️   | Nội thất          | `/services/interior-design`      | `services/`, `finishing/`    |
| 3   | 🔍   | Tra cứu           | `/tools/lookup`                  | `tools/` (9 files)           |
| 4   | 📄   | Xin phép          | `/tools/permit-assistant`        | `tools/`                     |
| 5   | 📁   | Hồ sơ mẫu         | `/tools/sample-documents`        | `documents/` (10 files)      |
| 6   | 📏   | Lô ban            | `/tools/lo-ban`                  | `tools/`                     |
| 7   | 🎨   | Bảng màu          | `/tools/color-palette`           | `tools/`                     |
| 8   | 💬   | Tư vấn chất lượng | `/services/quality-consulting`   | `services/`, `consultation/` |
| 9   | 🏢   | Công ty XD        | `/services/construction-company` | `construction/` (17 files)   |
| 10  | 🏪   | Công ty nội thất  | `/contractor`                    | `contractor/` (1 file)       |
| 11  | 👁️   | Giám sát          | `/services/quality-supervision`  | `services/`, `inspection/`   |
| 12  | 📊   | Dự toán           | `/calculators/cost-estimate`     | `calculators/` (15 files)    |
| 13  | 🧱   | Vật liệu          | `/materials`                     | `materials/` (2 files)       |
| 14  | 🤖   | AI thiết kế       | `/ai-design`                     | `ai-design/` (6 files)       |
| 15  | 👷   | Tìm thợ           | `/workers`                       | `workers/` (1 file)          |
| 16  | ➕   | Xem thêm          | `/services`                      | `services/`                  |

### Thư mục thuộc nhóm SERVICES:

```
app/services/                 # 30 files - Các dịch vụ
app/tools/                    # 9 files - Công cụ tiện ích
app/contractor/               # 1 file - Nhà thầu
app/consultation/             # 3 files - Tư vấn
app/calculators/              # 15 files - Máy tính/Dự toán
```

---

## 2️⃣ LIVE STREAMING THIẾT KẾ (DESIGN_LIVE) - 6 mục

| STT | Tên            | Route   | Viewers |
| --- | -------------- | ------- | ------- |
| 1   | Kiến trúc sư A | `/live` | 1.2k    |
| 2   | Designer B     | `/live` | 890     |
| 3   | Nội thất Pro   | `/live` | 2.1k    |
| 4   | Studio XYZ     | `/live` | 567     |
| 5   | Home Design    | `/live` | 1.8k    |
| 6   | 3D Master      | `/live` | 945     |

### Thư mục thuộc nhóm LIVE:

```
app/live/                     # 4 files - Xem live
app/livestream/               # 2 files - Phát live
app/tiktok/                   # 5 files - TikTok style
app/stories/                  # 2 files - Stories
```

---

## 3️⃣ TIỆN ÍCH THIẾT KẾ (DESIGN_SERVICES) - 16 mục

| STT | Icon | Tên          | Giá       | Route                       | Mô tả               |
| --- | ---- | ------------ | --------- | --------------------------- | ------------------- |
| 1   | 📐   | Kiến trúc sư | 500k/m²   | `/services/architects`      | Thiết kế kiến trúc  |
| 2   | ⚙️   | Kỹ sư        | 800k      | `/services/engineers`       | Tư vấn kỹ thuật     |
| 3   | 🏗️   | Kết cấu      | 300k/m²   | `/services/structural`      | Thiết kế kết cấu    |
| 4   | ⚡   | Điện         | 150k/m²   | `/services/electrical`      | Hệ thống điện       |
| 5   | 💧   | Nước         | 200k/m²   | `/services/plumbing`        | Hệ thống nước       |
| 6   | 📊   | Dự toán      | Miễn phí  | `/services/cost-estimation` | Tính toán chi phí   |
| 7   | 🛋️   | Nội thất     | 400k/m²   | `/services/interior`        | Thiết kế nội thất   |
| 8   | 🤖   | AI           | Miễn phí  | `/ai-design`                | AI hỗ trợ           |
| 9   | 🔮   | Phong thủy   | 200k      | `/services/feng-shui`       | Tư vấn phong thủy   |
| 10  | 📄   | Xin phép     | 500k      | `/services/permit`          | Làm giấy phép       |
| 11  | 📍   | Khảo sát     | 300k      | `/services/survey`          | Khảo sát hiện trạng |
| 12  | 🏠   | 3D           | 200k/view | `/services/3d-design`       | Render 3D           |
| 13  | 📋   | Bản vẽ       | 100k      | `/services/drawings`        | Bản vẽ kỹ thuật     |
| 14  | 🔨   | Thi công     | Báo giá   | `/construction`             | Dịch vụ thi công    |
| 15  | 👁️   | Giám sát     | 300k/ngày | `/services/supervision`     | Giám sát công trình |
| 16  | ✅   | Nghiệm thu   | 500k      | `/services/acceptance`      | Nghiệm thu          |

### Thư mục thuộc nhóm DESIGN_SERVICES:

```
app/ai-design/                # 6 files - AI thiết kế
app/ai-architect/             # 9 files - AI kiến trúc sư
app/ai-analysis/              # 2 files - AI phân tích
app/ai/                       # 9 files - AI hub
app/construction/             # 17 files - Thi công
app/inspection/               # 2 files - Kiểm tra
```

---

## 4️⃣ THIẾT BỊ / MUA SẮM (EQUIPMENT_ITEMS) - 16 mục

| STT | Icon | Tên              | Route                             | Danh mục  |
| --- | ---- | ---------------- | --------------------------------- | --------- |
| 1   | 🍳   | Thiết bị bếp     | `/equipment?category=kitchen`     | Bếp       |
| 2   | 🚿   | Thiết bị vệ sinh | `/equipment?category=bathroom`    | Vệ sinh   |
| 3   | 💡   | Thiết bị điện    | `/equipment?category=electrical`  | Điện      |
| 4   | 🚰   | Thiết bị nước    | `/equipment?category=plumbing`    | Nước      |
| 5   | 🧯   | PCCC             | `/equipment?category=fire-safety` | An toàn   |
| 6   | 🍽️   | Bàn ăn           | `/shop?category=dining`           | Nội thất  |
| 7   | 📚   | Bàn học          | `/shop?category=desk`             | Nội thất  |
| 8   | 🛋️   | Sofa             | `/shop?category=sofa`             | Nội thất  |
| 9   | 🗄️   | Tủ               | `/shop?category=cabinet`          | Nội thất  |
| 10  | 🛏️   | Giường           | `/shop?category=bed`              | Nội thất  |
| 11  | 💡   | Đèn trang trí    | `/shop?category=lighting`         | Trang trí |
| 12  | 🪟   | Rèm cửa          | `/shop?category=curtain`          | Trang trí |
| 13  | ❄️   | Máy lạnh         | `/shop?category=ac`               | Điện lạnh |
| 14  | 🔥   | Nước nóng        | `/shop?category=heater`           | Điện lạnh |
| 15  | 🛁   | Bồn tắm          | `/shop?category=bathtub`          | Vệ sinh   |
| 16  | ➕   | Xem thêm         | `/shop`                           | -         |

### Thư mục thuộc nhóm EQUIPMENT/SHOPPING:

```
app/equipment/                # 2 files - Thiết bị
app/shop/                     # 1 file - Cửa hàng
app/shopping/                 # 9 files - Mua sắm
app/product/                  # 2 files - Chi tiết SP
app/cart.tsx                  # Giỏ hàng
app/checkout/                 # 1 file - Thanh toán
app/order/                    # 1 file - Đơn hàng
app/orders/                   # 1 file - Danh sách đơn
app/payment/                  # 2 files - Thanh toán
app/vouchers/                 # 1 file - Vouchers
app/flash-sale/               # 1 file - Flash sale
app/promotions/               # 1 file - Khuyến mãi
```

---

## 5️⃣ THƯ VIỆN MẪU NHÀ (LIBRARY_ITEMS) - 16 mục

| STT | Icon | Tên        | Route                    | Loại công trình |
| --- | ---- | ---------- | ------------------------ | --------------- |
| 1   | 🏢   | Văn phòng  | `/categories/office`     | Commercial      |
| 2   | 🏠   | Nhà phố    | `/categories/townhouse`  | Residential     |
| 3   | 🏡   | Biệt thự   | `/categories/villa`      | Residential     |
| 4   | 🏨   | Khách sạn  | `/categories/hotel`      | Hospitality     |
| 5   | 🏭   | Nhà xưởng  | `/categories/factory`    | Industrial      |
| 6   | 🏢   | Căn hộ     | `/categories/apartment`  | Residential     |
| 7   | 🍽️   | Nhà hàng   | `/categories/restaurant` | F&B             |
| 8   | ☕   | Cafe       | `/categories/cafe`       | F&B             |
| 9   | 💆   | Spa        | `/categories/spa`        | Service         |
| 10  | 🏋️   | Gym        | `/categories/gym`        | Service         |
| 11  | 🎓   | Trường học | `/categories/school`     | Education       |
| 12  | 🏥   | Bệnh viện  | `/categories/hospital`   | Healthcare      |
| 13  | 🏪   | Showroom   | `/categories/showroom`   | Retail          |
| 14  | 📦   | Kho        | `/categories/warehouse`  | Industrial      |
| 15  | 🏪   | Cửa hàng   | `/categories/store`      | Retail          |
| 16  | ➕   | Xem thêm   | `/design-library`        | -               |

### Thư mục thuộc nhóm LIBRARY:

```
app/categories/               # 2 files - Danh mục
app/design-library/           # 3 files - Thư viện thiết kế
app/projects/                 # 72 files - Dự án
app/documents/                # 10 files - Tài liệu
```

---

## 6️⃣ THỢ XÂY DỰNG THÔ (CONSTRUCTION_WORKERS) - 16 mục

| STT | Icon | Tên           | Giá       | Route                           | Chuyên môn |
| --- | ---- | ------------- | --------- | ------------------------------- | ---------- |
| 1   | 🔨   | Thợ ép cọc    | 50 triệu  | `/workers?specialty=ep-coc`     | Móng       |
| 2   | 🚜   | Thợ đào đất   | 30 triệu  | `/workers?specialty=dao-dat`    | Đất        |
| 3   | 🧱   | Vật liệu      | 35 triệu  | `/materials`                    | Cung cấp   |
| 4   | 👷   | Nhân công XD  | 50 triệu  | `/workers?specialty=nhan-cong`  | Nhân lực   |
| 5   | 🏗️   | Thợ xây       | 78 triệu  | `/workers?specialty=tho-xay`    | Xây tường  |
| 6   | ⚙️   | Thợ sắt       | 97 triệu  | `/workers?specialty=tho-sat`    | Thép       |
| 7   | 📐   | Thợ coffa     | 97 triệu  | `/workers?specialty=tho-coffa`  | Cốp pha    |
| 8   | 🔧   | Thợ cơ khí    | 97 triệu  | `/workers?specialty=co-khi`     | Cơ khí     |
| 9   | 🏠   | Thợ tô tường  | 100 triệu | `/workers?specialty=to-tuong`   | Hoàn thiện |
| 10  | 💡   | Thợ điện nước | 50 triệu  | `/finishing/dien-nuoc`          | MEP        |
| 11  | 🏗️   | Bê tông       | 50 triệu  | `/materials?category=be-tong`   | Vật liệu   |
| 12  | 📐   | Cốp pha       | 35 triệu  | `/workers?specialty=cop-pha`    | Cốp pha    |
| 13  | 🚜   | Máy móc       | 80 triệu  | `/equipment?category=machinery` | Thiết bị   |
| 14  | 🚚   | Vận tải       | 60 triệu  | `/fleet`                        | Logistics  |
| 15  | 👁️   | Giám sát      | 45 triệu  | `/services/quality-supervision` | Giám sát   |
| 16  | ➕   | Xem thêm      | -         | `/workers`                      | -          |

### Thư mục thuộc nhóm CONSTRUCTION:

```
app/workers/                  # 1 file - Tìm thợ
app/worker-bookings/          # 1 file - Đặt thợ
app/materials/                # 2 files - Vật liệu
app/material-compare/         # 1 file - So sánh VL
app/fleet/                    # 2 files - Vận tải
app/labor/                    # 10 files - Nhân công
app/inventory/                # 8 files - Kho
app/warehouse/                # 1 file - Nhà kho
app/procurement/              # 5 files - Mua sắm
```

---

## 7️⃣ THỢ HOÀN THIỆN (FINISHING_WORKERS) - 16 mục

| STT | Icon | Tên           | Giá       | Route                     | Chuyên môn |
| --- | ---- | ------------- | --------- | ------------------------- | ---------- |
| 1   | 🔲   | Thợ lát gạch  | 100 triệu | `/finishing/lat-gach`     | Gạch       |
| 2   | ⬜   | Thợ thạch cao | 100 triệu | `/finishing/thach-cao`    | Trần       |
| 3   | 🎨   | Thợ sơn       | 70 triệu  | `/finishing/son`          | Sơn        |
| 4   | 💎   | Thợ đá        | 70 triệu  | `/finishing/da`           | Đá         |
| 5   | 🚪   | Thợ làm cửa   | 100 triệu | `/finishing/lam-cua`      | Cửa        |
| 6   | 🏠   | Thợ lan can   | 70 triệu  | `/finishing/lan-can`      | Lan can    |
| 7   | 🚧   | Thợ cổng      | 35 triệu  | `/finishing`              | Cổng       |
| 8   | 📹   | Thợ camera    | 70 triệu  | `/finishing/camera`       | An ninh    |
| 9   | 💎   | Thợ ốp đá     | 65 triệu  | `/finishing/op-da`        | Đá         |
| 10  | ⚡   | Thợ điện      | 85 triệu  | `/finishing/dien-nuoc`    | Điện       |
| 11  | 🛋️   | Thợ nội thất  | 90 triệu  | `/finishing/noi-that`     | Nội thất   |
| 12  | 🔧   | Tổng hợp      | 50 triệu  | `/finishing/tho-tong-hop` | Đa năng    |
| 13  | 🪚   | Thợ mộc       | 75 triệu  | `/finishing`              | Gỗ         |
| 14  | 🪟   | Thợ nhôm kính | 60 triệu  | `/finishing`              | Nhôm kính  |
| 15  | 🧹   | Thợ vệ sinh   | 40 triệu  | `/finishing`              | Vệ sinh    |
| 16  | ➕   | Xem thêm      | -         | `/finishing`              | -          |

### Thư mục thuộc nhóm FINISHING:

```
app/finishing/                # 22 files - Hoàn thiện
├── lat-gach.tsx
├── thach-cao.tsx
├── son.tsx
├── da.tsx
├── lam-cua.tsx
├── lan-can.tsx
├── camera.tsx
├── op-da.tsx
├── dien-nuoc.tsx
├── noi-that.tsx
├── tho-tong-hop.tsx
└── ... (11 files khác)
```

---

## 8️⃣ VIDEO HƯỚNG DẪN (VIDEO_ITEMS) - 8 mục

| STT | Tên          | Live | Route     |
| --- | ------------ | ---- | --------- |
| 1   | Thợ ép cọc   | ✅   | `/videos` |
| 2   | Nhân công XD | ✅   | `/videos` |
| 3   | Thợ đắp chỉ  | ✅   | `/videos` |
| 4   | Thợ tô tường | ✅   | `/videos` |
| 5   | Lát gạch     | ❌   | `/videos` |
| 6   | Sơn nhà      | ✅   | `/videos` |
| 7   | Làm cửa      | ❌   | `/videos` |
| 8   | Lắp điện     | ✅   | `/videos` |

### Thư mục thuộc nhóm VIDEO:

```
app/videos/                   # 2 files - Video
app/demo-videos.tsx           # Demo videos
app/demo/                     # 9 files - Demo
```

---

## 9️⃣ DANH MỤC NỔI BẬT (CATEGORY_ITEMS) - 8 mục

| STT | Tên                | Route                    | Mô tả     |
| --- | ------------------ | ------------------------ | --------- |
| 1   | Lát gạch           | `/finishing/lat-gach`    | Hướng dẫn |
| 2   | Nội quy công trình | `/documents`             | Tài liệu  |
| 3   | Bảo quản thiết bị  | `/equipment/maintenance` | Hướng dẫn |
| 4   | Ốp đá              | `/finishing/op-da`       | Hướng dẫn |
| 5   | Sơn tường          | `/finishing/son`         | Hướng dẫn |
| 6   | Thạch cao          | `/finishing/thach-cao`   | Hướng dẫn |
| 7   | Làm cửa            | `/finishing/lam-cua`     | Hướng dẫn |
| 8   | Camera             | `/finishing/camera`      | Hướng dẫn |

---

## 🔟 CÁC CHỨC NĂNG MỞ RỘNG (ENHANCED SECTIONS)

### Thêm từ EnhancedHomeSections.tsx:

- ⚡ **QuickActionsSection** - Hành động nhanh
- 🏷️ **FlashSaleSection** - Flash sale
- ⭐ **TopRatedWorkersSection** - Thợ đánh giá cao
- 🌤️ **WeatherWidget** - Thời tiết công trình
- 🤖 **AIAssistantButton** - AI hỗ trợ
- 🎯 **PromoBannerSlider** - Banner quảng cáo
- 📊 **RecentProjectsSection** - Dự án gần đây

---

## 📊 PHÂN NHÓM THƯ MỤC ROUTES THEO DANH MỤC

### 🏠 SERVICES (Dịch vụ) - ~58 routes

```
services/        30 files  │ Dịch vụ chính
tools/           9 files   │ Công cụ tiện ích
contractor/      1 file    │ Nhà thầu
consultation/    3 files   │ Tư vấn
calculators/     15 files  │ Máy tính dự toán
```

### 🤖 AI & THIẾT KẾ - ~26 routes

```
ai/              9 files   │ AI hub
ai-design/       6 files   │ AI thiết kế
ai-architect/    9 files   │ AI kiến trúc
ai-analysis/     2 files   │ AI phân tích
```

### 🏗️ XÂY DỰNG & VẬT LIỆU - ~30 routes

```
construction/    17 files  │ Thi công
materials/       2 files   │ Vật liệu
labor/           10 files  │ Nhân công
workers/         1 file    │ Tìm thợ
```

### 🔨 HOÀN THIỆN - ~22 routes

```
finishing/       22 files  │ Hoàn thiện nhà
```

### 🛒 MUA SẮM & THANH TOÁN - ~20 routes

```
equipment/       2 files   │ Thiết bị
shop/            1 file    │ Cửa hàng
shopping/        9 files   │ Mua sắm
product/         2 files   │ Sản phẩm
checkout/        1 file    │ Thanh toán
payment/         2 files   │ Payment
order/           1 file    │ Đơn hàng
orders/          1 file    │ Danh sách đơn
vouchers/        1 file    │ Vouchers
```

### 📱 GIAO TIẾP & SOCIAL - ~50 routes

```
chat/            4 files   │ Chat
messages/        11 files  │ Tin nhắn
call/            7 files   │ Gọi điện
meet/            7 files   │ Meeting
meeting/         3 files   │ Cuộc họp
communications/  5 files   │ Liên lạc
social/          7 files   │ Mạng XH
community/       1 file    │ Cộng đồng
```

### 📊 QUẢN LÝ DỰ ÁN - ~120 routes

```
projects/        72 files  │ Dự án
dashboard/       9 files   │ Dashboard
timeline/        10 files  │ Timeline
reports/         2 files   │ Báo cáo
daily-report/    2 files   │ Báo cáo ngày
documents/       10 files  │ Tài liệu
contracts/       6 files   │ Hợp đồng
```

### 👤 TÀI KHOẢN & ADMIN - ~78 routes

```
profile/         53 files  │ Hồ sơ cá nhân
admin/           25 files  │ Quản trị
```

### 🎥 MEDIA & LIVE - ~15 routes

```
live/            4 files   │ Xem live
livestream/      2 files   │ Phát live
videos/          2 files   │ Video
tiktok/          5 files   │ TikTok
stories/         2 files   │ Stories
```

### 🏷️ KHÁC - ~80 routes

```
crm/             26 files  │ CRM
utilities/       24 files  │ Tiện ích
budget/          9 files   │ Ngân sách
safety/          9 files   │ An toàn
quality-assurance/ 4 files │ QA
analytics/       1 file    │ Analytics
settings/        1 file    │ Cài đặt
```

---

## 📈 THỐNG KÊ TỔNG HỢP

| Nhóm            | Số routes | Tỷ lệ    |
| --------------- | --------- | -------- |
| Quản lý dự án   | 120       | 18.3%    |
| Admin & Profile | 78        | 11.9%    |
| Services        | 58        | 8.9%     |
| Communication   | 50        | 7.6%     |
| Construction    | 30        | 4.6%     |
| AI & Design     | 26        | 4.0%     |
| Finishing       | 22        | 3.4%     |
| Shopping        | 20        | 3.1%     |
| Media           | 15        | 2.3%     |
| Khác            | 235       | 35.9%    |
| **Tổng**        | **654**   | **100%** |

---

## ✅ KHUYẾN NGHỊ TỔ CHỨC

### 1. Gộp các thư mục tương tự:

- `meet/` + `meeting/` → `meetings/`
- `order/` + `orders/` → `orders/`
- `communications/` + `chat/` → `messaging/`

### 2. Cân nhắc chia nhỏ:

- `projects/` (72 files) → Chia thành sub-modules
- `profile/` (53 files) → Tách settings riêng

### 3. Hoàn thiện routes thiếu:

- `/workers` - Cần thêm filter specialty
- `/videos` - Cần page chi tiết video
- `/shop` - Cần hoàn thiện category pages

---

_Tài liệu này được tạo tự động, cập nhật theo cấu trúc app._
