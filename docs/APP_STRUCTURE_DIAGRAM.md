# 📱 SƠ ĐỒ CẤU TRÚC APP - DESIGN BUILD

> **Tổng quan:** App xây dựng & thiết kế theo phong cách Shopee với tính năng CRM, AI, Livestream
>
> **Tổng số Routes:** 675 screens | **Components:** 547+

---

## 🏠 KIẾN TRÚC CHÍNH

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APP_DESIGN_BUILD                                     │
│                      (Expo Router SDK 54)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      _layout.tsx (Root)                              │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │ Providers: Auth → PerfexAuth → Cart → Favorites → WebSocket  │    │    │
│  │  │ + Sentry, Analytics, OfflineIndicator, MediaViewer           │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│         ┌──────────────────────────┼──────────────────────────┐             │
│         │                          │                          │             │
│         ▼                          ▼                          ▼             │
│  ┌────────────┐            ┌────────────┐            ┌────────────┐         │
│  │  (auth)    │            │  (tabs)    │            │  Standalone │         │
│  │  11 screens│            │  23 screens│            │  641 screens│         │
│  └────────────┘            └────────────┘            └────────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📑 TAB NAVIGATION (5 tabs hiển thị)

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          BOTTOM TAB BAR                                    │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐     │
│   🏠 HOME   │  👥 SOCIAL  │  📁 DỰ ÁN  │  📺 LIVE   │  👤 PROFILE │     │
│   index     │   social    │  projects   │    live    │   profile   │     │
├─────────────┴─────────────┴─────────────┴─────────────┴─────────────┤     │
│                       Hidden Tabs (href: null)                       │     │
├──────────────────────────────────────────────────────────────────────┤     │
│ notifications, menu, news, contacts, test-crm, progress, etc.        │     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🏠 HOME SCREEN SECTIONS (Hiện tại - 11 sections)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TRANG CHỦ (index.tsx)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 1️⃣  HEADER (MainHeader)                                           │   │
│  │     Logo + Search + Cart + Notifications + Messages               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 2️⃣  SEARCH BAR                                                    │   │
│  │     🔍 "Tìm Kiếm dịch vụ, thợ, vật liệu..."                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 3️⃣  DANH MỤC DỊCH VỤ (16 items - 2 rows x 4 cols, scrollable)    │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │   │
│  │  │ 🏠 │ │ 🛋️ │ │ 🔍 │ │ 📋 │ │ 📄 │ │ 🧭 │ │ 🎨 │ │ 💬 │        │   │
│  │  │TK  │ │Nội │ │Tra │ │Xin │ │Hồ sơ│ │Lô  │ │Bảng │ │Tư  │        │   │
│  │  │nhà │ │thất│ │cứu │ │phép│ │mẫu │ │ban │ │màu │ │vấn │        │   │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘        │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │   │
│  │  │ 🏗️ │ │ 🏢 │ │ 👷 │ │ 💰 │ │ 🧱 │ │ 🤖 │ │ 👨‍🔧 │ │ ➕ │        │   │
│  │  │Cty │ │Cty │ │Giám │ │Dự  │ │Vật │ │AI  │ │Tìm │ │Xem │        │   │
│  │  │ XD │ │ NT │ │ sát│ │toán│ │liệu│ │TK  │ │ thợ│ │thêm│        │   │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 4️⃣  DESIGN LIVE (6 items - horizontal scroll)                     │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │   │
│  │  │🔴Live│ │🔴Live│ │🔴Live│ │🔴Live│ │🔴Live│ │🔴Live│          │   │
│  │  │ img  │ │ img  │ │ img  │ │ img  │ │ img  │ │ img  │          │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 5️⃣  GREEN BANNER - TIỆN ÍCH XÂY DỰNG                              │   │
│  │  ╔═══════════════════════════════════════════════════════════╗   │   │
│  │  ║  🟢 TIỆN ÍCH XÂY DỰNG                                      ║   │   │
│  │  ║  Hỗ trợ cho công ty xây dựng hoặc nhà thầu    [KHÁM PHÁ] ║   │   │
│  │  ╚═══════════════════════════════════════════════════════════╝   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 6️⃣  TIỆN ÍCH THIẾT KẾ (16 items - 2 rows x 4 cols)               │   │
│  │     Kiến trúc sư | Kỹ sư | Kết cấu | Điện | Nước | Dự toán...   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 7️⃣  TIỆN ÍCH MUA SẮM (16 items - 2 rows x 4 cols)                │   │
│  │     Thiết bị bếp | Vệ sinh | Điện | Nước | PCCC | Sofa...       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 8️⃣  THƯ VIỆN THIẾT KẾ (16 items - 2 rows x 4 cols)               │   │
│  │     Văn phòng | Nhà phố | Biệt thự | Khách sạn | Nhà xưởng...   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 9️⃣  TIỆN ÍCH XÂY DỰNG (16 items - 2 rows x 4 cols)               │   │
│  │     Ép cọc | Đào đất | Vật liệu | Thợ xây | Thợ coffa...        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 🔟  VIDEO XÂY DỰNG (8 items - horizontal scroll)                  │   │
│  │     🎬 Thợ ép cọc | Nhân công XD | Thợ đắp chỉ | Thợ tô tường.. │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 1️⃣1️⃣ TIỆN ÍCH HOÀN THIỆN (16 items - 2 rows x 4 cols)             │   │
│  │     Thợ lát gạch | Thạch cao | Sơn | Đá | Làm cửa | Camera...   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 1️⃣2️⃣ DANH MỤC NỔI BẬT (8 items - horizontal scroll)               │   │
│  │     Lát gạch | Nội quy công trình | Bảo quản | Ốp đá | Sơn...   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 1️⃣3️⃣ VIDEO THAM KHẢO (External - Pexels API)                      │   │
│  │     🎬 Video xây dựng tham khảo - Video miễn phí từ Pexels      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 PHÂN LOẠI ROUTES THEO MODULE

### 🔐 Authentication (11 screens)

```
app/(auth)/
├── login.tsx              # Đăng nhập
├── register.tsx           # Đăng ký
├── forgot-password.tsx    # Quên mật khẩu
├── verify-email.tsx       # Xác thực email
├── reset-password.tsx     # Đặt lại mật khẩu
└── onboarding/           # Hướng dẫn sử dụng
```

### 🤖 AI & Thiết kế (26 screens)

```
app/ai/              (9)   # AI Hub chung
app/ai-design/       (6)   # AI thiết kế
app/ai-analysis/     (2)   # AI phân tích
app/ai-architect/    (9)   # AI kiến trúc
```

### 🏗️ Xây dựng & Hoàn thiện (46 screens)

```
app/construction/    (17)  # Quản lý xây dựng
app/finishing/       (22)  # Hoàn thiện
app/construction-progress/ (7) # Tiến độ
```

### 📊 Dự án & CRM (99 screens)

```
app/projects/        (73)  # Quản lý dự án
app/crm/             (26)  # CRM khách hàng
```

### 👷 Nhân sự & Lao động (11 screens)

```
app/labor/           (10)  # Quản lý nhân công
app/workers/               # Tìm thợ
app/worker-bookings/       # Đặt lịch thợ
```

### 🛒 Mua sắm & Thanh toán (15 screens)

```
app/shop/            (1)   # Cửa hàng
app/shopping/        (9)   # Mua sắm
app/payment/         (2)   # Thanh toán
app/orders/          (1)   # Đơn hàng
app/cart.tsx               # Giỏ hàng
app/checkout/        (1)   # Thanh toán
```

### 📹 Live & Video (12 screens)

```
app/live/            (5)   # Livestream
app/livestream/      (2)   # Phát trực tiếp
app/videos/          (2)   # Video
app/tiktok/          (5)   # TikTok style
```

### 💬 Giao tiếp (20 screens)

```
app/chat/            (4)   # Chat
app/messages/        (11)  # Tin nhắn
app/communications/  (5)   # Liên lạc
```

### 📋 Tài liệu & Báo cáo (14 screens)

```
app/documents/       (10)  # Tài liệu
app/reports/         (2)   # Báo cáo
app/daily-report/    (2)   # Báo cáo ngày
```

### ⚙️ Tiện ích & Công cụ (33 screens)

```
app/utilities/       (24)  # Tiện ích
app/tools/           (9)   # Công cụ
app/calculators/     (15)  # Máy tính
```

### 👤 Profile & Settings (54 screens)

```
app/profile/         (53)  # Hồ sơ cá nhân
app/settings/        (1)   # Cài đặt
```

---

## 🧩 COMPONENT LIBRARY (547+ components)

### 📦 Core UI Components

```
components/ui/
├── button.tsx           # Nút bấm
├── card.tsx             # Thẻ
├── input.tsx            # Input
├── modal.tsx            # Modal
├── badge.tsx            # Badge
├── avatar.tsx           # Avatar
├── skeleton.tsx         # Loading skeleton
├── toast-notification.tsx # Toast
└── ...150+ more
```

### 🏠 Home Components

```
components/home/
├── HeroBanner.tsx       # Banner chính
├── hero-slider.tsx      # Slider
├── SearchBar.tsx        # Thanh tìm kiếm
├── ServiceGrid.tsx      # Lưới dịch vụ
├── CategoryPills.tsx    # Pills danh mục
├── FeaturedProducts.tsx # Sản phẩm nổi bật
├── HomeMenuGrid.tsx     # Menu grid
└── UtilityGrid.tsx      # Lưới tiện ích
```

### 🔔 Notifications & Communication

```
components/notifications/    # Thông báo
components/chat/            # Chat
components/call/            # Cuộc gọi
components/meeting/         # Meeting
```

### 📊 CRM & Projects

```
components/crm/             # CRM
components/projects/        # Dự án
components/dashboard/       # Dashboard
```

---

## 🎯 SECTIONS CẦN BỔ SUNG CHO TRANG CHỦ

### ĐỀ XUẤT MỚI:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TRANG CHỦ CẢI TIẾN (ĐỀ XUẤT)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ✅ Giữ nguyên các section hiện có                                       │
│                                                                          │
│  ➕ THÊM MỚI:                                                            │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 🆕 QUICK ACTIONS (Truy cập nhanh)                                 │   │
│  │     📞 Gọi ngay | 💬 Chat | 📱 Zalo | 🎥 Video call              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 🆕 DỰ ÁN GẦN ĐÂY (Từ API)                                        │   │
│  │     Card hiển thị tiến độ dự án đang thực hiện                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 🆕 TIN TỨC XÂY DỰNG (GNews API)                                  │   │
│  │     Tin tức mới nhất về ngành xây dựng                           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 🆕 FLASH SALE (Khuyến mãi)                                       │   │
│  │     🔥 Countdown + Sản phẩm giảm giá                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 🆕 ĐÁNH GIÁ THỢ TOP (Rating)                                     │   │
│  │     ⭐⭐⭐⭐⭐ Thợ được đánh giá cao nhất                           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 🆕 WEATHER WIDGET (Thời tiết)                                    │   │
│  │     ☀️ 32°C - Phù hợp thi công ngoài trời                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 🆕 AI ASSISTANT (Chatbot)                                        │   │
│  │     🤖 "Tôi có thể giúp gì cho bạn?"                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 THỐNG KÊ

| Loại                | Số lượng |
| ------------------- | -------- |
| **Tổng Routes**     | 675      |
| **Tổng Components** | 547      |
| **Tab chính**       | 5        |
| **Tab ẩn**          | 18       |
| **Modules lớn**     | 110+     |
| **Icons (webp)**    | 50+      |

---

## 🔗 NAVIGATION FLOW

```
                           ┌──────────────┐
                           │   App Start   │
                           └──────┬───────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
              ┌─────▼─────┐               ┌─────▼─────┐
              │ Not Auth  │               │   Auth    │
              └─────┬─────┘               └─────┬─────┘
                    │                           │
              ┌─────▼─────┐               ┌─────▼─────┐
              │  (auth)   │               │  (tabs)   │
              │  screens  │               │  screens  │
              └───────────┘               └─────┬─────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    │           │               │               │           │
              ┌─────▼─────┐ ┌───▼───┐     ┌─────▼─────┐   ┌─────▼─────┐ ┌───▼───┐
              │   Home    │ │Social │     │  Projects │   │   Live    │ │Profile│
              │  index    │ │       │     │           │   │           │ │       │
              └─────┬─────┘ └───────┘     └───────────┘   └───────────┘ └───────┘
                    │
      ┌─────────────┼─────────────┐
      │             │             │
┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
│  Services │ │   Shop    │ │  Workers  │
│           │ │           │ │           │
└───────────┘ └───────────┘ └───────────┘
```

---

_Cập nhật: 4/2/2026_
