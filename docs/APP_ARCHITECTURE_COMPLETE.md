# 🏗️ SƠ ĐỒ CẤU TRÚC HOÀN THIỆN APP XÂY DỰNG

> **Phiên bản:** 2.0  
> **Cập nhật:** 25/12/2024  
> **Trạng thái:** Đang hoàn thiện

---

## 📊 TỔNG QUAN HỆ THỐNG

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🏠 APP XÂY DỰNG THÔNG MINH                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Frontend: Expo SDK 54 + React Native + TypeScript                          │
│  Backend: NestJS + PostgreSQL @ https://baotienweb.cloud/api/v1            │
│  Routing: expo-router (file-based)                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 DANH MỤC CHA - CON (CATEGORY HIERARCHY)

### 1️⃣ DỊCH VỤ CHÍNH (`/services`)
```
📁 services/
├── 🏠 house-design          ✅ Thiết kế nhà          [DONE]
├── 🎨 interior-design       ✅ Thiết kế nội thất     [DONE]
├── 🏢 construction-company  ✅ Nhà thầu xây dựng     [DONE]
├── 👁️ quality-supervision   ✅ Giám sát chất lượng   [DONE]
├── 🧭 feng-shui             ✅ Tư vấn phong thủy     [DONE]
├── 📋 permit                ✅ Xin phép xây dựng     [DONE]
├── 🎯 quality-consulting    ✅ Tư vấn chất lượng     [DONE]
├── 📊 design-calculator     ✅ Tính toán thiết kế    [DONE]
├── 🎨 color-chart           ✅ Bảng màu              [DONE]
├── 📈 color-trends          ✅ Xu hướng màu          [DONE]
├── 📦 materials-catalog     ✅ Catalog vật liệu      [DONE]
├── 🔍 construction-lookup   ✅ Tra cứu thi công      [DONE]
├── 📄 sample-docs           ✅ Mẫu tài liệu          [DONE]
├── 🏪 marketplace           ✅ Sàn giao dịch         [DONE]
├── 🔎 detail/[id]           ✅ Chi tiết dịch vụ      [DONE]
├── 🤖 ai-assistant/         ⚠️ Trợ lý AI            [PARTIAL]
└── 🏷️ company-detail        ✅ Chi tiết công ty      [DONE]
```

### 2️⃣ CÔNG CỤ QUẢN LÝ (`/utilities` + `/dashboard`)
```
📁 utilities/
├── 💰 cost-estimator        ✅ Ước tính chi phí      [DONE]
├── 🗺️ store-locator         ✅ Tìm cửa hàng          [DONE]
├── 📱 my-qr-code            ✅ Mã QR cá nhân         [DONE]
├── 📜 history               ✅ Lịch sử               [DONE]
├── 🔧 api-diagnostics       ✅ Chẩn đoán API         [DONE]
├── 📍 sitemap               ✅ Sơ đồ web             [DONE]
├── 📊 schedule              ✅ Lịch trình            [DONE]
├── 🛡️ safe-area-demo        ✅ Demo SafeArea         [DONE]
└── 📦 [slug]                ✅ Dynamic route         [DONE]

📁 dashboard/
├── 🏠 index                 ✅ Dashboard chính       [DONE]
├── 👨‍💼 admin                 ✅ Admin view            [DONE]
├── 👨‍💼 admin-enhanced        ✅ Admin nâng cao        [DONE]
├── 👥 client                ✅ Client view           [DONE]
├── 👥 client-enhanced       ✅ Client nâng cao       [DONE]
├── 🔧 engineer              ✅ Engineer view         [DONE]
└── 🔧 engineer-enhanced     ✅ Engineer nâng cao     [DONE]
```

### 3️⃣ DỊCH VỤ THI CÔNG (`/construction` + `/finishing`)
```
📁 construction/
├── 📍 map/                  ✅ Bản đồ công trình     [DONE]
├── 📍 map-view              ✅ Xem bản đồ            [DONE]
├── 📅 booking               ✅ Đặt lịch              [DONE]
├── 🎨 designer              ✅ Thiết kế              [DONE]
├── 📊 progress              ✅ Tiến độ               [DONE]
├── 📊 progress-board        ✅ Bảng tiến độ          [DONE]
├── 📊 progress-tracking     ✅ Theo dõi tiến độ      [DONE]
├── 🏛️ villa-progress        ✅ Tiến độ biệt thự      [DONE]
├── 💳 payment-progress      ✅ Tiến độ thanh toán    [DONE]
├── 🔍 tracking              ✅ Theo dõi              [DONE]
├── 🏗️ utilities             ✅ Tiện ích              [DONE]
└── 📅 concrete-schedule-map ✅ Lịch đổ bê tông       [DONE]

📁 finishing/ (Hoàn thiện nội thất)
├── 🏠 index                 ✅ Danh mục hoàn thiện   [DONE]
├── 🪑 noi-that              ✅ Nội thất              [DONE - shared UI]
├── 🧱 lat-gach-new          ✅ Lát gạch              [DONE - shared UI]
├── 🎨 son-new               ✅ Sơn                   [DONE - shared UI]
├── 📦 thach-cao-new         ✅ Thạch cao             [DONE - shared UI]
├── 🚪 lam-cua               ⚠️ Làm cửa              [EXISTS - need shared UI]
├── 🚧 lan-can               ⚠️ Lan can              [EXISTS - need shared UI]
├── 💎 op-da                 ✅ Ốp đá                 [DONE - shared UI]
├── ⚡ dien-nuoc             ✅ Điện nước             [DONE - shared UI]
├── 📷 camera                ⚠️ Camera               [EXISTS - need update]
├── 🔧 tho-tong-hop          ⚠️ Thợ tổng hợp         [EXISTS - need update]
├── 👤 worker-profile-new/   ✅ Profile thợ          [DONE - shared]
└── 📁 project-detail/       ⚠️ Chi tiết dự án       [NEED CREATE]
```

### 4️⃣ NHÂN CÔNG (`/utilities` + `/labor`)
```
📁 utilities/ (Workers)
├── 👷 tho-xay               ✅ Thợ xây               [DONE]
├── ⚡ tho-dien-nuoc         ✅ Thợ điện nước         [DONE]
├── 🪵 tho-coffa             ✅ Thợ cốt pha           [DONE]
├── 🎨 design-team           ✅ Đội thiết kế          [DONE]
├── 📦 team-detail           ✅ Chi tiết team         [DONE]
├── 🔨 ep-coc                ✅ Ép cọc                [DONE]
├── ⛏️ dao-dat               ✅ Đào đất               [DONE]
├── 🏗️ be-tong               ✅ Bê tông               [DONE]
├── 🧱 vat-lieu              ✅ Vật liệu              [DONE]
├── 🏗️ construction          ✅ Thi công              [DONE]
└── 👥 nhan-cong             ✅ Nhân công             [DONE]

📁 labor/
└── 📋 index                 ✅ Danh sách nhân công   [DONE]
```

### 5️⃣ MUA SẮM THIẾT BỊ (`/shopping`)
```
📁 shopping/
├── 🏠 index                 ✅ Trang chủ shopping    [DONE]
├── 📦 products-catalog      ✅ Catalog sản phẩm      [DONE]
├── 🌐 products-from-backend ✅ SP từ backend         [DONE]
├── 🛒 cart                  ✅ Giỏ hàng              [DONE]
├── ⚡ flash-sale            ✅ Flash sale            [DONE]
├── 🔄 compare               ✅ So sánh               [DONE]
├── 🎁 new-customer-offer    ✅ Ưu đãi khách mới      [DONE]
├── 🔌 dien                  ✅ Thiết bị điện         [DONE]
├── 🚿 nuoc                  ✅ Thiết bị nước         [DONE]
├── 🧱 gach-men              ✅ Gạch men              [DONE]
├── 🎨 son                   ✅ Sơn                   [DONE]
├── 🛋️ noi-that              ✅ Nội thất              [DONE]
├── 🛋️ sofa                  ✅ Sofa                  [DONE]
├── 📚 ban-hoc               ✅ Bàn học               [DONE]
├── 🍽️ ban-an                ✅ Bàn ăn                [DONE]
├── 🚪 cua                   ✅ Cửa                   [DONE]
├── 🍳 thiet-bi-bep          ✅ Thiết bị bếp          [DONE]
├── 🚽 thiet-bi-ve-sinh      ✅ Thiết bị vệ sinh      [DONE]
├── 🧱 vat-lieu-xay          ✅ Vật liệu xây          [DONE]
├── ❄️ dieu-hoa              ✅ Điều hòa              [DONE]
├── 🔥 pccc                  ✅ PCCC                  [DONE]
├── 📦 equipment             ✅ Thiết bị              [DONE]
├── 📦 equipment-enhanced    ✅ Thiết bị nâng cao     [DONE]
├── 📦 materials-enhanced    ✅ Vật liệu nâng cao     [DONE]
├── 📁 product/              ⚠️ Product folder       [CHECK]
├── 📄 product-detail        ✅ Chi tiết SP           [DONE]
└── 📂 [category]            ✅ Dynamic category      [DONE]
```

### 6️⃣ VIDEO THI CÔNG (`/videos` + `/live` + `/tiktok`)
```
📁 videos/
├── 🎬 index                 ✅ Danh sách video       [DONE]
└── 📂 [category]            ✅ Video theo danh mục   [DONE]

📁 live/
├── 🔴 index                 ✅ Livestream            [DONE]
├── 📺 broadcast             ⚠️ Phát sóng            [CHECK]
└── 👀 watch                 ⚠️ Xem trực tiếp        [CHECK]

📁 tiktok/
└── 📱 (TikTok style)        ⚠️ Video ngắn           [CHECK]
```

### 7️⃣ MIỄN PHÍ TƯ VẤN (`/ai` + `/services/ai-assistant`)
```
📁 ai/
├── 🤖 index                 ✅ AI Assistant          [DONE]
├── 💬 chat                  ⚠️ Chat AI              [CHECK]
└── 🔍 analysis              ⚠️ Phân tích AI         [CHECK]

📁 services/ai-assistant/
├── 🏠 house-design          ⚠️ AI thiết kế nhà      [CHECK]
├── 🎨 interior              ⚠️ AI nội thất          [CHECK]
└── 💰 cost                  ⚠️ AI chi phí           [CHECK]
```

---

## 🔐 XÁC THỰC & TÀI KHOẢN (`/(auth)` + `/profile`)

```
📁 (auth)/
├── 🔑 login                 ✅ Đăng nhập             [DONE - NEED ENHANCE]
├── 📝 register              ✅ Đăng ký               [DONE - NEED ENHANCE]
├── 🔒 forgot-password       ✅ Quên mật khẩu         [DONE]
├── 🔄 reset-password        ✅ Đặt lại MK            [DONE]
├── 🎴 auth-3d-flip          ✅ Auth 3D Animation     [DONE]
└── 📐 _layout               ✅ Auth Layout           [DONE]

📁 profile/
├── 👤 index                 ✅ Profile chính         [DONE]
├── ✏️ edit                  ⚠️ Chỉnh sửa profile    [CHECK]
├── ⚙️ settings              ⚠️ Cài đặt              [CHECK]
├── 📦 orders                ⚠️ Đơn hàng             [CHECK]
├── ❤️ favorites             ⚠️ Yêu thích            [CHECK]
├── 📍 addresses             ⚠️ Địa chỉ              [CHECK]
├── 💳 payment               ⚠️ Phương thức TT       [CHECK]
├── 🎁 rewards               ⚠️ Điểm thưởng          [CHECK]
└── ❓ help                  ⚠️ Trợ giúp             [CHECK]
```

---

## 📱 TAB NAVIGATION (`/(tabs)`)

```
📁 (tabs)/
├── 🏠 index                 ✅ Home                  [DONE]
├── 📂 projects              ✅ Dự án                 [DONE]
├── 🔔 notifications         ✅ Thông báo             [DONE]
├── 👤 profile               ✅ Tài khoản             [DONE]
├── 🎥 live                  ✅ Livestream            [DONE]
├── 📋 menu                  ✅ Menu mở rộng          [DONE]
└── 📐 _layout               ✅ Tab Layout            [DONE]
```

---

## 🔧 QUẢN LÝ NÂNG CAO (Employee/Admin)

```
📁 quality-assurance/        ✅ Đảm bảo chất lượng   [DONE]
📁 safety/                   ✅ An toàn lao động     [DONE]
📁 inspection/               ✅ Kiểm tra             [DONE]
📁 punch-list/               ✅ Danh sách sửa chữa   [DONE]
📁 documents/                ✅ Tài liệu             [DONE]
📁 reports/                  ✅ Báo cáo              [DONE]
📁 daily-report/             ✅ Nhật ký công trình   [DONE]
📁 rfi/                      ✅ Yêu cầu thông tin    [DONE]
📁 submittal/                ✅ Hồ sơ nộp            [DONE]
📁 materials/                ✅ Quản lý vật liệu     [DONE]
📁 equipment/                ✅ Thiết bị             [DONE]
📁 inventory/                ✅ Kho hàng             [DONE]
📁 fleet/                    ✅ Phương tiện          [DONE]
📁 contracts/                ✅ Hợp đồng             [DONE]
📁 budget/                   ✅ Ngân sách            [DONE]
📁 procurement/              ✅ Mua sắm              [DONE]
📁 change-order/             ✅ Thay đổi đơn hàng    [DONE]
📁 risk/                     ✅ Quản lý rủi ro       [DONE]
📁 warranty/                 ✅ Bảo hành             [DONE]
📁 commissioning/            ✅ Nghiệm thu           [DONE]
📁 om-manuals/               ✅ Tài liệu vận hành    [DONE]
📁 meeting-minutes/          ✅ Biên bản họp         [DONE]
📁 timeline/                 ✅ Lịch trình           [DONE]
📁 environmental/            ✅ Môi trường           [DONE]
📁 change-management/        ✅ Quản lý thay đổi     [DONE]
📁 document-control/         ✅ Quản lý tài liệu     [DONE]
📁 resource-planning/        ✅ Lập kế hoạch         [DONE]
📁 as-built/                 ✅ Bản vẽ hoàn công     [DONE]
```

---

## 📞 GIAO TIẾP & LIÊN LẠC

```
📁 messages/                 ✅ Tin nhắn             [DONE]
📁 call/                     ✅ Gọi điện/video       [DONE]
📁 meet/                     ✅ Họp online           [DONE]
📁 communication/            ✅ Liên lạc chung       [DONE]
📁 communications/           ⚠️ (Duplicate?)        [CHECK]
📁 social/                   ⚠️ Mạng xã hội         [CHECK]
📁 stories/                  ⚠️ Stories             [CHECK]
```

---

## 📈 THỐNG KÊ ROUTE

| Nhóm | Số route | Trạng thái |
|------|----------|------------|
| User | ~45 | ✅ 90% Done |
| Employee | ~40 | ✅ 85% Done |
| Admin | ~10 | ✅ 80% Done |
| **Tổng** | **~95** | **~85%** |

---

## ⚠️ CÁC ROUTE CẦN HOÀN THIỆN

### 🔴 Ưu tiên cao (Auth & Core)
1. `/(auth)/login` - Cần connect backend auth
2. `/(auth)/register` - Cần connect backend auth
3. `/profile/edit` - Cần UI hoàn thiện
4. `/profile/settings` - Cần UI hoàn thiện

### 🟡 Ưu tiên trung bình (Features)
1. `/finishing/lam-cua` - Cần dùng shared UI
2. `/finishing/lan-can` - Cần dùng shared UI
3. `/finishing/camera` - Cần cập nhật
4. `/finishing/project-detail/[id]` - Cần tạo mới
5. `/ai/chat` - Cần hoàn thiện AI
6. `/live/broadcast` - Cần kiểm tra

### 🟢 Ưu tiên thấp (Enhancement)
1. Các route `/profile/*` - UI enhancement
2. `/videos/*` - Thêm content
3. `/social/*` - Social features

---

## 🎨 SHARED COMPONENTS ĐÃ TẠO

| Component | Vị trí | Mô tả |
|-----------|--------|-------|
| `CategoryWorkerList` | `/components/finishing/` | List thợ theo category |
| `ContractorInfoCard` | `/components/ui/` | Card thông tin nhà thầu |
| `WorkerCard` | Trong CategoryWorkerList | Card thợ đơn lẻ |
| `BookingModal` | Trong CategoryWorkerList | Modal đặt lịch |

---

## 📂 DATA FILES

| File | Vị trí | Mô tả |
|------|--------|-------|
| `finishing-workers.ts` | `/data/` | Dữ liệu thợ hoàn thiện |
| `products.ts` | `/data/` | Dữ liệu sản phẩm |
| `sitemap-tree.ts` | `/constants/` | Cấu trúc sitemap |

---

## 🔗 BACKEND API ENDPOINTS

```
Base URL: https://baotienweb.cloud/api/v1
API Key: thietke-resort-api-key-2024

Endpoints:
├── /auth/login          POST  - Đăng nhập
├── /auth/register       POST  - Đăng ký
├── /auth/refresh        POST  - Refresh token
├── /users               CRUD  - Quản lý user
├── /products            CRUD  - Sản phẩm
├── /categories          CRUD  - Danh mục
├── /orders              CRUD  - Đơn hàng
├── /cart                CRUD  - Giỏ hàng
├── /construction        CRUD  - Thi công
├── /workers             CRUD  - Thợ
├── /projects            CRUD  - Dự án
├── /messages            CRUD  - Tin nhắn
├── /notifications       CRUD  - Thông báo
├── /meetings            CRUD  - Cuộc họp
└── /files               CRUD  - Upload files
```

---

*Tài liệu này được cập nhật tự động từ phân tích cấu trúc app.*
