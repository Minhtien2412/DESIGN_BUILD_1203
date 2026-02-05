# 🏗️ KIẾN TRÚC ỨNG DỤNG DESIGN & BUILD

> **Version:** 2.0 | **Updated:** 04/02/2026  
> **Platform:** React Native Expo SDK 54 | **Routes:** 654 | **Components:** 547+

---

## 📊 TỔNG QUAN KIẾN TRÚC

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           🌐 DESIGN & BUILD APP                            │
│                     Construction Management Platform                        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │                    📱 PRESENTATION LAYER                         │     │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │     │
│   │  │  Home   │ │  Chat   │ │ Projects│ │ Profile │ │  More   │   │     │
│   │  │   Tab   │ │   Tab   │ │   Tab   │ │   Tab   │ │   Tab   │   │     │
│   │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │     │
│   └───────┼──────────┼──────────┼──────────┼──────────┼────────────┘     │
│           │          │          │          │          │                   │
│   ┌───────┴──────────┴──────────┴──────────┴──────────┴────────────┐     │
│   │                    🧩 FEATURE MODULES                           │     │
│   │                                                                 │     │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │     │
│   │  │  🏠 Services │  │  🔨 Building │  │  🛒 Commerce │          │     │
│   │  │   58 routes  │  │   52 routes  │  │   20 routes  │          │     │
│   │  └──────────────┘  └──────────────┘  └──────────────┘          │     │
│   │                                                                 │     │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │     │
│   │  │  📊 Project  │  │  💬 Comms    │  │  🤖 AI Suite │          │     │
│   │  │  Management  │  │   50 routes  │  │   26 routes  │          │     │
│   │  │  120 routes  │  └──────────────┘  └──────────────┘          │     │
│   │  └──────────────┘                                               │     │
│   │                                                                 │     │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │     │
│   │  │  👤 Account  │  │  🎥 Media    │  │  📦 CRM      │          │     │
│   │  │   78 routes  │  │   15 routes  │  │   26 routes  │          │     │
│   │  └──────────────┘  └──────────────┘  └──────────────┘          │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │                    🔌 SERVICE LAYER                              │     │
│   │                                                                  │     │
│   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │     │
│   │  │  API   │ │ WebSoc │ │ Storage│ │ Auth   │ │ Push   │        │     │
│   │  │Service │ │  ket   │ │Service │ │Service │ │Notif.  │        │     │
│   │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │                    🗃️ STATE MANAGEMENT                           │     │
│   │                                                                  │     │
│   │  Auth → Cart → Favorites → WebSocket → Notifications → CRM      │     │
│   │                                                                  │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ CẤU TRÚC THƯ MỤC TỐI ƯU

### 📁 Cấu trúc hiện tại → Cấu trúc đề xuất

```
app/
├── (auth)/                    # ✅ Giữ nguyên - Auth flows
├── (tabs)/                    # ✅ Giữ nguyên - Tab navigation
│   ├── index.tsx             # Home
│   ├── chat-ai.tsx           # AI Chat
│   ├── projects.tsx          # Projects list
│   ├── profile.tsx           # Profile
│   └── more.tsx              # More options
│
├── 📦 MODULES TÁI CẤU TRÚC:
│
├── meetings/                  # 🔄 GỘP: meet/ + meeting/
│   ├── _layout.tsx
│   ├── index.tsx             # Danh sách meetings
│   ├── create.tsx            # Tạo meeting
│   ├── join.tsx              # Tham gia meeting
│   ├── room.tsx              # Meeting room
│   ├── [code].tsx            # Tham gia bằng code
│   ├── [id].tsx              # Chi tiết meeting
│   └── [roomId].tsx          # Room detail
│
├── projects/                  # 🔄 CHIA NHỎ thành sub-modules
│   ├── _layout.tsx
│   ├── index.tsx             # Danh sách dự án
│   ├── create.tsx            # Tạo dự án
│   │
│   ├── portfolios/           # Sub-module: Portfolio
│   │   ├── architecture.tsx
│   │   ├── construction.tsx
│   │   └── design.tsx
│   │
│   ├── management/           # Sub-module: Quản lý
│   │   ├── quotation-list.tsx
│   │   ├── find-contractors.tsx
│   │   └── customer-projects.tsx
│   │
│   └── [id]/                 # Project detail (giữ nguyên)
│       ├── overview/         # Tổng quan
│       ├── timeline/         # Timeline & tiến độ
│       ├── documents/        # Tài liệu
│       ├── team/             # Đội ngũ
│       ├── finance/          # Tài chính
│       ├── qc-qa/            # Chất lượng
│       └── safety/           # An toàn
│
├── profile/                   # 🔄 TÁCH settings riêng
│   ├── _layout.tsx
│   ├── index.tsx             # Profile overview
│   ├── edit.tsx              # Chỉnh sửa
│   ├── info.tsx              # Thông tin cá nhân
│   │
│   ├── wallet/               # Sub-module: Ví & thanh toán
│   │   ├── index.tsx
│   │   ├── payment-methods.tsx
│   │   ├── payment-history.tsx
│   │   └── add-card.tsx
│   │
│   ├── portfolio/            # Sub-module: Portfolio cá nhân
│   │   ├── index.tsx
│   │   ├── 3d-design.tsx
│   │   └── spec.tsx
│   │
│   ├── orders/               # Sub-module: Đơn hàng
│   │   ├── index.tsx
│   │   └── [id].tsx
│   │
│   └── achievements/         # Sub-module: Thành tựu
│       └── index.tsx
│
└── settings/                  # 🆕 TÁCH TỪ profile/
    ├── _layout.tsx
    ├── index.tsx             # Settings overview
    ├── account/              # Tài khoản
    │   ├── security.tsx
    │   ├── privacy.tsx
    │   ├── change-password.tsx
    │   └── biometric.tsx
    ├── preferences/          # Tùy chọn
    │   ├── appearance.tsx
    │   ├── language.tsx
    │   └── notifications.tsx
    ├── data/                 # Dữ liệu
    │   ├── cloud.tsx
    │   ├── contact-sync.tsx
    │   └── permissions.tsx
    └── help/                 # Trợ giúp
        └── index.tsx
```

---

## 🔄 CHI TIẾT TÁI CẤU TRÚC

### 1️⃣ GỘP meet/ + meeting/ → meetings/

```
TRƯỚC:                              SAU:
─────────────────────────────────────────────────────────
app/meet/                           app/meetings/
├── _layout.tsx                     ├── _layout.tsx
├── index.tsx          ──────────►  ├── index.tsx (gộp)
├── create.tsx                      ├── create.tsx
├── join.tsx                        ├── join.tsx
├── [code].tsx                      ├── room.tsx
├── [id].tsx                        ├── [code].tsx
└── [meetingId]/                    ├── [id].tsx
                                    └── [roomId].tsx
app/meeting/
├── index.tsx          ──────────►  (đã gộp vào trên)
├── room.tsx
└── [roomId].tsx
```

**Mapping routes:**
| Route cũ | Route mới |
|----------|-----------|
| `/meet` | `/meetings` |
| `/meet/create` | `/meetings/create` |
| `/meet/join` | `/meetings/join` |
| `/meet/[code]` | `/meetings/[code]` |
| `/meeting` | `/meetings` |
| `/meeting/room` | `/meetings/room` |
| `/meeting/[roomId]` | `/meetings/[roomId]` |

---

### 2️⃣ CHIA NHỎ projects/ (72 files)

```
app/projects/
│
├── 📁 portfolios/              # 3 files - Portfolio showcase
│   ├── architecture.tsx        ← architecture-portfolio.tsx
│   ├── construction.tsx        ← construction-portfolio.tsx
│   └── design.tsx              ← design-portfolio.tsx
│
├── 📁 management/              # 4 files - Quản lý dự án
│   ├── quotation-list.tsx
│   ├── find-contractors.tsx
│   ├── customer-projects.tsx
│   └── timeline-mindmap.tsx
│
├── 📁 library/                 # 2 files - Thư viện
│   ├── index.tsx               ← library.tsx
│   └── work-detail.tsx
│
└── 📁 [id]/                    # 34 files - Chi tiết dự án
    │
    ├── 📁 overview/            # Tổng quan
    │   ├── index.tsx
    │   ├── gallery.tsx
    │   ├── photos.tsx
    │   └── minimap.tsx
    │
    ├── 📁 timeline/            # Tiến độ
    │   ├── index.tsx           ← timeline.tsx
    │   ├── construction.tsx    ← construction-timeline.tsx
    │   ├── workflow-map.tsx
    │   └── minimap-editor.tsx
    │
    ├── 📁 documents/           # Tài liệu
    │   ├── index.tsx           ← documents.tsx
    │   ├── upload-photo.tsx
    │   └── reports.tsx
    │
    ├── 📁 team/                # Đội ngũ
    │   ├── index.tsx           ← team.tsx
    │   ├── meetings/
    │   └── chat.tsx
    │
    ├── 📁 finance/             # Tài chính
    │   ├── payment-progress.tsx
    │   └── materials/
    │
    ├── 📁 tasks/               # Công việc
    │   ├── index.tsx           ← tasks.tsx
    │   ├── create.tsx          ← tasks.new.tsx
    │   └── diary/
    │
    ├── 📁 qc-qa/               # Chất lượng
    │   ├── index.tsx
    │   ├── checklist/
    │   ├── defects/
    │   └── reports/
    │
    ├── 📁 safety/              # An toàn
    │   ├── checklists/
    │   ├── hazards/
    │   └── incidents/
    │
    ├── 📁 communication/       # Giao tiếp
    │   ├── announcements/
    │   ├── decisions/
    │   └── risks.tsx
    │
    └── 📁 ai-analysis/         # AI phân tích
        ├── index.tsx
        └── _layout.tsx
```

---

### 3️⃣ TÁCH profile/ → profile/ + settings/

```
TRƯỚC (53 files):                    SAU:
───────────────────────────────────────────────────────
app/profile/                         app/profile/ (25 files)
├── settings.tsx       ──────────►   ├── index.tsx
├── security.tsx                     ├── edit.tsx
├── privacy.tsx                      ├── info.tsx
├── appearance.tsx                   ├── achievements.tsx
├── language.tsx                     ├── portfolio/
├── notifications.tsx                ├── orders/
├── ...                              └── wallet/
│
│                                    app/settings/ (28 files) 🆕
│                      ──────────►   ├── index.tsx
│                                    ├── account/
│                                    │   ├── security.tsx
│                                    │   ├── privacy.tsx
│                                    │   ├── change-password.tsx
│                                    │   └── biometric.tsx
│                                    ├── preferences/
│                                    │   ├── appearance.tsx
│                                    │   ├── language.tsx
│                                    │   └── notifications.tsx
│                                    └── data/
│                                        ├── cloud.tsx
│                                        └── permissions.tsx
```

---

## 🌊 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTIONS                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           EXPO ROUTER                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ (auth)   │ │ (tabs)   │ │ meetings │ │ projects │ │ settings │      │
│  │ 5 routes │ │ 5 tabs   │ │ 8 routes │ │ 72 routes│ │ 28 routes│      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘      │
└───────┼────────────┼────────────┼────────────┼────────────┼─────────────┘
        │            │            │            │            │
        ▼            ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CONTEXT PROVIDERS                                │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ AuthContext → PerfexAuth → CartContext → FavoritesContext       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ MeetingContext → CallContext → WebSocketContext → NotifContext  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API SERVICES                                   │
│                                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │  apiFetch  │  │ WebSocket  │  │  Storage   │  │   Push     │        │
│  │ (REST API) │  │  /chat     │  │ (Async/    │  │  Notif.    │        │
│  │            │  │  /call     │  │  Secure)   │  │            │        │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │
└────────┼───────────────┼───────────────┼───────────────┼────────────────┘
         │               │               │               │
         ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVERS                                  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │           baotienweb.cloud (Fastify + PostgreSQL)                 │  │
│  │                                                                   │  │
│  │  /api/v1/auth    │  /api/v1/projects  │  /api/v1/messages        │  │
│  │  /api/v1/users   │  /api/v1/workers   │  /api/v1/notifications   │  │
│  │  /api/v1/chat    │  /api/v1/meetings  │  /api/v1/push-tokens     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 MODULE DEPENDENCY GRAPH

```
                              ┌─────────────┐
                              │   AuthCtx   │
                              └──────┬──────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │                         │                         │
           ▼                         ▼                         ▼
    ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
    │  CartCtx    │           │  UserCtx    │           │ PerfexAuth  │
    └──────┬──────┘           └──────┬──────┘           └──────┬──────┘
           │                         │                         │
           │              ┌──────────┴──────────┐              │
           │              │                     │              │
           ▼              ▼                     ▼              ▼
    ┌─────────────┐ ┌─────────────┐      ┌─────────────┐ ┌─────────────┐
    │ FavoritesCtx│ │ WebSocketCtx│      │  MeetingCtx │ │   CRMCtx    │
    └─────────────┘ └──────┬──────┘      └──────┬──────┘ └─────────────┘
                           │                    │
              ┌────────────┴────────────┐       │
              │                         │       │
              ▼                         ▼       ▼
       ┌─────────────┐           ┌─────────────────┐
       │  CallCtx    │           │ NotificationCtx │
       └─────────────┘           └─────────────────┘
```

---

## 📱 NAVIGATION STRUCTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                         ROOT STACK                               │
│                       (_layout.tsx)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    (auth) GROUP                          │   │
│   │   login │ signup │ forgot-password │ verify │ onboarding│   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    (tabs) GROUP                          │   │
│   │                                                          │   │
│   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│   │
│   │  │  🏠    │ │  💬    │ │  📊    │ │  👤    │ │  ⚙️    ││   │
│   │  │ Home   │ │ Chat   │ │Projects│ │Profile │ │ More   ││   │
│   │  │        │ │        │ │        │ │        │ │        ││   │
│   │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘│   │
│   │                                                          │   │
│   │  Hidden Tabs (tabBarButton: null):                      │   │
│   │  notifications │ cart │ favorites │ search │ settings   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   MODAL SCREENS                          │   │
│   │                                                          │   │
│   │  meetings/    │  checkout/   │  call/     │  ai-design/ │   │
│   │  services/    │  payment/    │  chat/     │  live/      │   │
│   │  projects/    │  workers/    │  messages/ │  admin/     │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏠 HOME SCREEN SECTIONS

```
┌─────────────────────────────────────────────────────────────────┐
│                      HOME SCREEN                                 │
│                     (tabs)/index.tsx                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🔍 SEARCH BAR                                            │  │
│  │  "Tìm kiếm dịch vụ, thợ, vật liệu..."                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🎯 QUICK ACTIONS          │  🌤️ WEATHER WIDGET           │  │
│  │  Báo giá │ Tìm thợ │ AI   │  Thời tiết thi công          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🏠 SERVICES (16 icons - 2 rows x 8)                      │  │
│  │  ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐       │  │
│  │  │Nhà ││NộiT││TraC││XinP││HồSơ││LôBa││Màu ││TưVấ│       │  │
│  │  └────┘└────┘└────┘└────┘└────┘└────┘└────┘└────┘       │  │
│  │  ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐       │  │
│  │  │CtyX││CtyN││GiáS││DựTo││VậtL││AI  ││Thợ ││More│       │  │
│  │  └────┘└────┘└────┘└────┘└────┘└────┘└────┘└────┘       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🎥 DESIGN LIVE (Horizontal scroll)                       │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐             │  │
│  │  │ 🔴LIVE │ │ 🔴LIVE │ │ 🔴LIVE │ │ 🔴LIVE │             │  │
│  │  │ KTS A  │ │ Design │ │ Studio │ │ 3D Pro │             │  │
│  │  │ 1.2k   │ │ 890    │ │ 2.1k   │ │ 945    │             │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🏷️ FLASH SALE (Countdown timer)                          │  │
│  │  ⏰ 02:34:56 còn lại                                      │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐             │  │
│  │  │ -50%   │ │ -30%   │ │ -40%   │ │ -25%   │             │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🛠️ DESIGN SERVICES (16 items - với giá)                  │  │
│  │  Kiến trúc sư │ Kỹ sư │ Kết cấu │ Điện │ Nước │ ...      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🛒 EQUIPMENT ITEMS (16 items)                            │  │
│  │  Bếp │ Vệ sinh │ Điện │ Nước │ PCCC │ Nội thất │ ...     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  📚 LIBRARY ITEMS (16 items)                              │  │
│  │  Văn phòng │ Nhà phố │ Biệt thự │ Khách sạn │ ...        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ⭐ TOP RATED WORKERS                                     │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │  │
│  │  │ ⭐ 4.9 (234) │ │ ⭐ 4.8 (189) │ │ ⭐ 4.8 (156) │      │  │
│  │  │ Nguyễn Văn A │ │ Trần Văn B   │ │ Lê Thị C     │      │  │
│  │  │ Thợ xây      │ │ Thợ điện     │ │ Thợ sơn      │      │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  👷 CONSTRUCTION WORKERS (16 items)                       │  │
│  │  Ép cọc │ Đào đất │ Thợ xây │ Thợ sắt │ Coffa │ ...      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🔨 FINISHING WORKERS (16 items)                          │  │
│  │  Lát gạch │ Thạch cao │ Sơn │ Đá │ Cửa │ Lan can │ ...   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🎬 VIDEO CONSTRUCTIONS (8 items - Live badge)            │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐             │  │
│  │  │ 🔴     │ │ 🔴     │ │        │ │ 🔴     │             │  │
│  │  │Ép cọc  │ │Nhân công│ │Lát gạch│ │Sơn nhà │             │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  📊 RECENT PROJECTS                                       │  │
│  │  Dự án gần đây của bạn...                                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  📁 CATEGORIES (8 items với hình ảnh)                     │  │
│  │  Lát gạch │ Nội quy │ Bảo quản │ Ốp đá │ ...             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🤖 AI ASSISTANT BUTTON (FAB)                             │  │
│  │                                        [💬 AI Hỗ trợ]     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 THỐNG KÊ SAU TÁI CẤU TRÚC

| Module               | Trước    | Sau      | Thay đổi               |
| -------------------- | -------- | -------- | ---------------------- |
| `meet/` + `meeting/` | 10 files | -        | 🔄 Gộp → `meetings/`   |
| `meetings/`          | -        | 8 files  | 🆕 Tạo mới             |
| `projects/`          | 72 files | 45 files | 📉 -27 (tổ chức lại)   |
| `profile/`           | 53 files | 25 files | 📉 -28 (tách settings) |
| `settings/`          | -        | 28 files | 🆕 Tạo mới             |
| **Tổng**             | **654**  | **654**  | ✅ Không đổi           |

---

## 🚀 MIGRATION SCRIPT

```bash
# 1. Gộp meet/ + meeting/ → meetings/
mkdir -p app/meetings
mv app/meet/* app/meetings/
mv app/meeting/room.tsx app/meetings/
mv app/meeting/[roomId].tsx app/meetings/
rm -rf app/meet app/meeting

# 2. Tạo settings/ từ profile/
mkdir -p app/settings/account app/settings/preferences app/settings/data
mv app/profile/security.tsx app/settings/account/
mv app/profile/privacy.tsx app/settings/account/
mv app/profile/change-password.tsx app/settings/account/
mv app/profile/biometric.tsx app/settings/account/
mv app/profile/appearance.tsx app/settings/preferences/
mv app/profile/language.tsx app/settings/preferences/
mv app/profile/notifications.tsx app/settings/preferences/
mv app/profile/cloud.tsx app/settings/data/
mv app/profile/permissions.tsx app/settings/data/

# 3. Tổ chức lại projects/
mkdir -p app/projects/portfolios app/projects/management app/projects/library
mv app/projects/architecture-portfolio.tsx app/projects/portfolios/architecture.tsx
mv app/projects/construction-portfolio.tsx app/projects/portfolios/construction.tsx
mv app/projects/design-portfolio.tsx app/projects/portfolios/design.tsx
```

---

## ✅ CHECKLIST TÁI CẤU TRÚC

- [ ] Backup toàn bộ `app/` folder
- [ ] Gộp `meet/` + `meeting/` → `meetings/`
- [ ] Tạo `settings/` và di chuyển files từ `profile/`
- [ ] Tổ chức lại `projects/` thành sub-modules
- [ ] Update tất cả imports và navigation routes
- [ ] Update `_layout.tsx` cho các folder mới
- [ ] Test navigation cho tất cả affected routes
- [ ] Update documentation

---

_Tài liệu kiến trúc nâng cao - Design & Build App v2.0_
