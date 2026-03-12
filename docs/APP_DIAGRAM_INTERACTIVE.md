# 🎯 SƠ ĐỒ APP DESIGN & BUILD - INTERACTIVE DIAGRAM

> **Version:** 2.1 | **Last Updated:** 04/02/2026  
> **Total Routes:** 653 | **Components:** 547+

---

## 🏗️ KIẾN TRÚC TỔNG THỂ

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                        🌟 DESIGN & BUILD APP 🌟                           ║
║                   Nền tảng Quản lý Xây dựng & Thiết kế                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────── 📱 CLIENT APP ───────────────────────┐         ║
║  │                                                              │         ║
║  │    ┌──────────────────────────────────────────────────┐     │         ║
║  │    │              🔝 TAB NAVIGATION                    │     │         ║
║  │    │                                                   │     │         ║
║  │    │  ╭────╮  ╭────╮  ╭────╮  ╭────╮  ╭────╮         │     │         ║
║  │    │  │ 🏠 │  │ 💬 │  │ 📊 │  │ 👤 │  │ ⚙️ │         │     │         ║
║  │    │  │Home│  │Chat│  │Proj│  │Prof│  │More│         │     │         ║
║  │    │  ╰────╯  ╰────╯  ╰────╯  ╰────╯  ╰────╯         │     │         ║
║  │    │                                                   │     │         ║
║  │    └──────────────────────────────────────────────────┘     │         ║
║  │                            │                                 │         ║
║  │    ┌───────────────────────┼───────────────────────────┐    │         ║
║  │    │                       ▼                            │    │         ║
║  │    │    ╔═══════════════════════════════════════╗      │    │         ║
║  │    │    ║        🧩 FEATURE MODULES             ║      │    │         ║
║  │    │    ╠═══════════════════════════════════════╣      │    │         ║
║  │    │    ║                                       ║      │    │         ║
║  │    │    ║  ┌─────────┐ ┌─────────┐ ┌─────────┐ ║      │    │         ║
║  │    │    ║  │Services │ │Building │ │Commerce │ ║      │    │         ║
║  │    │    ║  │  58     │ │   52    │ │   20    │ ║      │    │         ║
║  │    │    ║  └─────────┘ └─────────┘ └─────────┘ ║      │    │         ║
║  │    │    ║                                       ║      │    │         ║
║  │    │    ║  ┌─────────┐ ┌─────────┐ ┌─────────┐ ║      │    │         ║
║  │    │    ║  │Projects │ │  Comms  │ │   AI    │ ║      │    │         ║
║  │    │    ║  │  62     │ │   50    │ │   26    │ ║      │    │         ║
║  │    │    ║  └─────────┘ └─────────┘ └─────────┘ ║      │    │         ║
║  │    │    ║                                       ║      │    │         ║
║  │    │    ║  ┌─────────┐ ┌─────────┐ ┌─────────┐ ║      │    │         ║
║  │    │    ║  │ Account │ │  Media  │ │Meetings │ ║      │    │         ║
║  │    │    ║  │   66    │ │   15    │ │    8    │ ║      │    │         ║
║  │    │    ║  └─────────┘ └─────────┘ └─────────┘ ║      │    │         ║
║  │    │    ║                                       ║      │    │         ║
║  │    │    ╚═══════════════════════════════════════╝      │    │         ║
║  │    │                                                    │    │         ║
║  │    └────────────────────────────────────────────────────┘    │         ║
║  │                                                              │         ║
║  └──────────────────────────────────────────────────────────────┘         ║
║                                    │                                      ║
║  ┌─────────────────────────────────┼─────────────────────────────────┐   ║
║  │                                 ▼                                  │   ║
║  │    ╔═══════════════════════════════════════════════════════╗     │   ║
║  │    ║               🔌 SERVICE LAYER                         ║     │   ║
║  │    ╠═══════════════════════════════════════════════════════╣     │   ║
║  │    ║                                                        ║     │   ║
║  │    ║  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         ║     │   ║
║  │    ║  │  API   │ │WebSock │ │Storage │ │  Push  │         ║     │   ║
║  │    ║  │Fetch   │ │  et    │ │Service │ │ Notif  │         ║     │   ║
║  │    ║  └────────┘ └────────┘ └────────┘ └────────┘         ║     │   ║
║  │    ║                                                        ║     │   ║
║  │    ╚═══════════════════════════════════════════════════════╝     │   ║
║  │                                                                   │   ║
║  └───────────────────────────────────────────────────────────────────┘   ║
║                                    │                                      ║
╠════════════════════════════════════╪══════════════════════════════════════╣
║                                    │                                      ║
║  ┌─────────────────────────────────┼─────────────────────────────────┐   ║
║  │                                 ▼                                  │   ║
║  │    ╔═══════════════════════════════════════════════════════╗     │   ║
║  │    ║               🌐 BACKEND SERVER                        ║     │   ║
║  │    ║               baotienweb.cloud                         ║     │   ║
║  │    ╠═══════════════════════════════════════════════════════╣     │   ║
║  │    ║                                                        ║     │   ║
║  │    ║  Fastify + PostgreSQL + Redis + WebSocket             ║     │   ║
║  │    ║                                                        ║     │   ║
║  │    ║  /api/v1/auth    → Authentication & JWT               ║     │   ║
║  │    ║  /api/v1/users   → User management                    ║     │   ║
║  │    ║  /api/v1/projects → Project CRUD                      ║     │   ║
║  │    ║  /api/v1/chat    → Real-time messaging                ║     │   ║
║  │    ║  /api/v1/meetings → Video conferencing                ║     │   ║
║  │    ║                                                        ║     │   ║
║  │    ╚═══════════════════════════════════════════════════════╝     │   ║
║  │                                                                   │   ║
║  └───────────────────────────────────────────────────────────────────┘   ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🗂️ CẤU TRÚC THƯ MỤC SAU TÁI CẤU TRÚC

```
app/
│
├── 📁 (auth)/                 # Authentication flows
│   ├── login.tsx
│   ├── signup.tsx
│   ├── forgot-password.tsx
│   └── verify.tsx
│
├── 📁 (tabs)/                 # Main tab navigation
│   ├── index.tsx             # 🏠 Home - 13 sections
│   ├── chat-ai.tsx           # 💬 AI Chat
│   ├── projects.tsx          # 📊 Projects list
│   ├── profile.tsx           # 👤 Profile
│   └── more.tsx              # ⚙️ More options
│
├── 📁 meetings/               # 🆕 GỘP từ meet/ + meeting/
│   ├── _layout.tsx           # 8 routes total
│   ├── index.tsx             # Danh sách cuộc họp
│   ├── create.tsx            # Tạo cuộc họp
│   ├── join.tsx              # Tham gia bằng link/mã
│   ├── room.tsx              # Phòng họp video
│   ├── [code].tsx            # Tham gia bằng mã
│   ├── [id].tsx              # Chi tiết cuộc họp
│   └── [roomId].tsx          # Video room
│
├── 📁 settings/               # 🆕 TÁCH từ profile/
│   ├── _layout.tsx           # 14 routes total
│   ├── index.tsx             # Tổng quan cài đặt
│   ├── 📁 account/           # Tài khoản
│   │   ├── security.tsx
│   │   ├── privacy.tsx
│   │   ├── change-password.tsx
│   │   └── biometric.tsx
│   ├── 📁 preferences/       # Tùy chọn
│   │   ├── appearance.tsx
│   │   ├── language.tsx
│   │   └── notifications.tsx
│   ├── 📁 data/              # Dữ liệu
│   │   ├── cloud.tsx
│   │   ├── permissions.tsx
│   │   └── contact-sync.tsx
│   └── 📁 help/
│       └── index.tsx
│
├── 📁 projects/               # 🔄 CHIA NHỎ thành sub-modules
│   ├── _layout.tsx           # 62 routes total (giảm từ 72)
│   ├── index.tsx             # Danh sách dự án
│   ├── create.tsx            # Tạo dự án
│   │
│   ├── 📁 portfolios/        # 🆕 Sub-module: Portfolio
│   │   ├── architecture.tsx  # Portfolio kiến trúc
│   │   ├── construction.tsx  # Portfolio xây dựng
│   │   └── design.tsx        # Portfolio thiết kế
│   │
│   ├── 📁 management/        # 🆕 Sub-module: Quản lý
│   │   ├── index.tsx         # Quản lý dự án
│   │   ├── quotation-list.tsx
│   │   ├── find-contractors.tsx
│   │   ├── customer-projects.tsx
│   │   └── timeline-mindmap.tsx
│   │
│   ├── 📁 library/           # 🆕 Sub-module: Thư viện
│   │   ├── index.tsx
│   │   └── work-detail.tsx
│   │
│   └── 📁 [id]/              # Chi tiết dự án (34 routes)
│       ├── overview/
│       ├── timeline/
│       ├── documents/
│       ├── team/
│       ├── finance/
│       ├── qc-qa/
│       └── safety/
│
├── 📁 profile/                # 🔄 ĐÃ TÁCH settings
│   ├── _layout.tsx           # 40 routes (giảm từ 53)
│   ├── index.tsx
│   ├── edit.tsx
│   ├── wallet/               # Ví & thanh toán
│   ├── portfolio/            # Portfolio cá nhân
│   └── orders/               # Đơn hàng
│
└── ... (các module khác giữ nguyên)
```

---

## 📊 THỐNG KÊ TÁI CẤU TRÚC

### So sánh TRƯỚC vs SAU:

| Module      | Trước    | Sau      | Thay đổi | Ghi chú                 |
| ----------- | -------- | -------- | -------- | ----------------------- |
| `meet/`     | 7 files  | ❌       | -7       | Xóa → gộp meetings/     |
| `meeting/`  | 3 files  | ❌       | -3       | Xóa → gộp meetings/     |
| `meetings/` | ❌       | 8 files  | +8       | 🆕 Module mới           |
| `profile/`  | 53 files | 40 files | -13      | Tách settings           |
| `settings/` | ❌       | 14 files | +14      | 🆕 Module mới           |
| `projects/` | 72 files | 62 files | -10      | Tổ chức lại sub-modules |
| **TỔNG**    | 654      | 653      | -1       | ✅ Tối ưu hơn           |

---

## 🔄 ROUTE MAPPING

### meetings/ (Gộp từ meet/ + meeting/)

```
OLD ROUTES                    →    NEW ROUTES
────────────────────────────────────────────────────────
/meet                         →    /meetings
/meet/create                  →    /meetings/create
/meet/join                    →    /meetings/join
/meet/[code]                  →    /meetings/[code]
/meet/[id]                    →    /meetings/[id]
/meeting                      →    /meetings
/meeting/room                 →    /meetings/room
/meeting/[roomId]             →    /meetings/[roomId]
```

### settings/ (Tách từ profile/)

```
OLD ROUTES                    →    NEW ROUTES
────────────────────────────────────────────────────────
/profile/settings             →    /settings
/profile/security             →    /settings/account/security
/profile/privacy              →    /settings/account/privacy
/profile/change-password      →    /settings/account/change-password
/profile/biometric            →    /settings/account/biometric
/profile/appearance           →    /settings/preferences/appearance
/profile/language             →    /settings/preferences/language
/profile/notifications        →    /settings/preferences/notifications
/profile/cloud                →    /settings/data/cloud
/profile/permissions          →    /settings/data/permissions
/profile/contact-sync         →    /settings/data/contact-sync
/profile/help                 →    /settings/help
```

### projects/ Sub-modules

```
OLD ROUTES                        →    NEW ROUTES
────────────────────────────────────────────────────────
/projects/architecture-portfolio  →    /projects/portfolios/architecture
/projects/construction-portfolio  →    /projects/portfolios/construction
/projects/design-portfolio        →    /projects/portfolios/design
/projects/project-management      →    /projects/management
/projects/quotation-list          →    /projects/management/quotation-list
/projects/find-contractors        →    /projects/management/find-contractors
/projects/customer-projects       →    /projects/management/customer-projects
/projects/timeline-mindmap        →    /projects/management/timeline-mindmap
/projects/library                 →    /projects/library
/projects/work-detail             →    /projects/library/work-detail
```

---

## 🎯 DEPENDENCY GRAPH

```
                              ┌─────────────┐
                              │   App.tsx   │
                              │  (_layout)  │
                              └──────┬──────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
       ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
       │ AuthContext │        │ ThemeCtx    │        │ Analytics   │
       └──────┬──────┘        └─────────────┘        └─────────────┘
              │
    ┌─────────┴─────────┬──────────────┬──────────────┐
    │                   │              │              │
    ▼                   ▼              ▼              ▼
┌───────────┐    ┌───────────┐  ┌───────────┐  ┌───────────┐
│ CartCtx   │    │ FavsCtx   │  │ WSContext │  │ NotifCtx  │
└───────────┘    └───────────┘  └─────┬─────┘  └───────────┘
                                      │
                        ┌─────────────┼─────────────┐
                        │             │             │
                        ▼             ▼             ▼
                 ┌───────────┐ ┌───────────┐ ┌───────────┐
                 │ ChatCtx   │ │ CallCtx   │ │ MeetCtx   │
                 └───────────┘ └───────────┘ └───────────┘
```

---

## 🏠 HOME SCREEN SECTIONS MAP

```
┌────────────────────────────────────────────────────────────────┐
│                     HOME SCREEN LAYOUT                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🔍 SEARCH BAR                                 📍 Hà Nội    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────┐ ┌─────────────────────────────┐  │
│  │ ⚡ QUICK ACTIONS        │ │ 🌤️ WEATHER WIDGET           │  │
│  │ • Báo giá nhanh         │ │ • 28°C Nắng                  │  │
│  │ • Tìm thợ               │ │ • Thuận lợi thi công         │  │
│  │ • AI Hỗ trợ             │ │                              │  │
│  └─────────────────────────┘ └─────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🏠 DỊCH VỤ CHÍNH (16 icons - SwipeGrid)                   │ │
│  │ ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐        │ │
│  │ │ 🏠 ││ 🛋️ ││ 🔍 ││ 📄 ││ 📁 ││ 📏 ││ 🎨 ││ 💬 │        │ │
│  │ └────┘└────┘└────┘└────┘└────┘└────┘└────┘└────┘        │ │
│  │ ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐        │ │
│  │ │ 🏢 ││ 🏪 ││ 👁️ ││ 📊 ││ 🧱 ││ 🤖 ││ 👷 ││ ➕ │        │ │
│  │ └────┘└────┘└────┘└────┘└────┘└────┘└────┘└────┘        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🎥 LIVE STREAMING (HScroll)                               │ │
│  │ ╭────────╮ ╭────────╮ ╭────────╮ ╭────────╮              │ │
│  │ │ 🔴LIVE │ │ 🔴LIVE │ │ 🔴LIVE │ │ 🔴LIVE │              │ │
│  │ │ KTS A  │ │Designer│ │ Studio │ │ 3D Pro │              │ │
│  │ │ 1.2k ▶ │ │ 890 ▶  │ │ 2.1k ▶ │ │ 945 ▶  │              │ │
│  │ ╰────────╯ ╰────────╯ ╰────────╯ ╰────────╯              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🏷️ FLASH SALE   ⏰ 02:34:56                               │ │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │ │
│  │ │ -50% 🔥  │ │ -30%     │ │ -40%     │ │ -25%     │      │ │
│  │ │ Gạch men │ │ Sơn nhà  │ │ Đèn LED  │ │ Bồn tắm  │      │ │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ⭐ TOP WORKERS (Card scroll)                              │ │
│  │ ╭──────────────╮ ╭──────────────╮ ╭──────────────╮       │ │
│  │ │ ⭐ 4.9 (234) │ │ ⭐ 4.8 (189) │ │ ⭐ 4.8 (156) │       │ │
│  │ │ Nguyễn Văn A │ │ Trần Văn B   │ │ Lê Thị C     │       │ │
│  │ │ Thợ xây 10yr │ │ Thợ điện 8yr │ │ Thợ sơn 6yr  │       │ │
│  │ │ [Đặt lịch]   │ │ [Đặt lịch]   │ │ [Đặt lịch]   │       │ │
│  │ ╰──────────────╯ ╰──────────────╯ ╰──────────────╯       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🛠️ TIỆN ÍCH THIẾT KẾ (16 items với giá)                  │ │
│  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │ │
│  │ │📐 500k │ │⚙️ 800k │ │🏗️ 300k │ │⚡ 150k │              │ │
│  │ │KTS     │ │Kỹ sư   │ │Kết cấu │ │Điện    │              │ │
│  │ └────────┘ └────────┘ └────────┘ └────────┘              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🛒 THIẾT BỊ NỘI THẤT (16 items)                          │ │
│  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐│ │
│  │ │🍳  ││🚿  ││💡  ││🚰  ││🧯  ││🍽️  ││📚  ││🛋️  ││ │
│  │ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘│ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 📚 THƯ VIỆN MẪU NHÀ (16 loại công trình)                 │ │
│  │ 🏢 Văn phòng │ 🏠 Nhà phố │ 🏡 Biệt thự │ 🏨 Khách sạn  │ │
│  │ 🏭 Nhà xưởng │ 🏢 Căn hộ  │ 🍽️ Nhà hàng │ ☕ Cafe       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 👷 THỢ XÂY DỰNG THÔ (16 chuyên môn)                      │ │
│  │ Ép cọc │ Đào đất │ Thợ xây │ Thợ sắt │ Coffa │ ...      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🔨 THỢ HOÀN THIỆN (16 chuyên môn)                        │ │
│  │ Lát gạch │ Thạch cao │ Sơn │ Đá │ Cửa │ Lan can │ ...   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🎬 VIDEO HƯỚNG DẪN (8 videos - Live badge)               │ │
│  │ ╭────────╮ ╭────────╮ ╭────────╮ ╭────────╮              │ │
│  │ │ 🔴     │ │ 🔴     │ │        │ │ 🔴     │              │ │
│  │ │Ép cọc  │ │Nhân công│ │Lát gạch│ │Sơn nhà │              │ │
│  │ ╰────────╯ ╰────────╯ ╰────────╯ ╰────────╯              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 📊 DỰ ÁN GẦN ĐÂY                                         │ │
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │ │
│  │ │ 🏗️ 75%       │ │ 🏠 100%      │ │ 🔨 45%       │       │ │
│  │ │ Nhà phố HN   │ │ Biệt thự SG  │ │ Cafe ĐN     │       │ │
│  │ └──────────────┘ └──────────────┘ └──────────────┘       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ╭───────────────────────────────────────────────────────────╮ │
│  │ 🤖 AI ASSISTANT                                [💬 Hỏi AI]│ │
│  ╰───────────────────────────────────────────────────────────╯ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [x] Gộp `meet/` + `meeting/` → `meetings/` (8 routes)
- [x] Tách `profile/` → `profile/` + `settings/` (14 routes mới)
- [x] Chia `projects/` thành sub-modules (portfolios, management, library)
- [x] Tạo service `meeting.service.ts`
- [x] Bundle test thành công
- [x] Tạo sơ đồ kiến trúc nâng cao
- [x] Cập nhật route mapping documentation

---

_Document generated: 04/02/2026 | Design & Build App v2.1_
