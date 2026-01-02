# 📱 APP ROUTER ARCHITECTURE & DEVELOPMENT PLAN
> Cập nhật: January 2, 2026

---

## 📊 TỔNG QUAN HỆ THỐNG

### Thống kê nhanh
| Metric | Số lượng |
|--------|----------|
| **Tổng số Routes** | ~200+ |
| **Main Modules** | 15 |
| **Sub-modules** | 45+ |
| **Tab Screens** | 5 (active) |
| **Backend APIs** | 24 modules |

---

## 🗺️ SƠ ĐỒ ROUTER HOÀN CHỈNH

```
📱 APP ROOT (_layout.tsx)
│
├── 🔐 (auth)/ ─────────────────────── AUTHENTICATION
│   ├── login.tsx                     # Đăng nhập
│   ├── login-shopee.tsx              # UI Shopee style
│   ├── login-perfex.tsx              # Perfex CRM login
│   ├── register.tsx                  # Đăng ký
│   ├── register-shopee.tsx           # UI Shopee style
│   ├── forgot-password.tsx           # Quên mật khẩu
│   └── reset-password.tsx            # Đặt lại mật khẩu
│
├── 🏠 (tabs)/ ─────────────────────── BOTTOM TABS (5 tabs hiển thị)
│   ├── index.tsx                     # 🏠 Trang chủ (Tab 1)
│   ├── home-construction.tsx         # 🏗️ Home XD (Tab 2)
│   ├── projects.tsx                  # 📁 Dự án (Tab 3)
│   ├── live.tsx                      # 📺 Live (Tab 4)
│   ├── profile.tsx                   # 👤 Cá nhân (Tab 5)
│   │
│   ├── [HIDDEN TABS]
│   │   ├── menu.tsx                  # Tiện ích (ẩn)
│   │   ├── notifications.tsx         # Thông báo (header)
│   │   ├── contacts.tsx              # Liên hệ
│   │   └── call-test.tsx             # Test call
│   │
│   └── [BACKUP FILES] ⚠️
│       ├── index.old.tsx
│       ├── index-flatlist.tsx
│       └── notifications.tsx.backup
│
├── 📁 projects/ ───────────────────── QUẢN LÝ DỰ ÁN
│   ├── index.tsx                     # Danh sách dự án
│   ├── create.tsx                    # Tạo dự án mới
│   ├── [id].tsx                      # Chi tiết dự án
│   ├── [id]/                         # Sub-routes
│   │   ├── tasks/                    # Công việc
│   │   ├── timeline/                 # Timeline
│   │   └── documents/                # Tài liệu
│   ├── timeline-mindmap.tsx          # Mind map timeline
│   ├── quotation-list.tsx            # Danh sách báo giá
│   ├── customer-projects.tsx         # Dự án khách hàng
│   └── architecture/                 # Portfolio kiến trúc
│
├── 🏗️ construction/ ──────────────── THI CÔNG XÂY DỰNG
│   ├── index.tsx                     # Tổng quan
│   ├── progress.tsx                  # Tiến độ
│   ├── progress-tracking.tsx         # Theo dõi tiến độ
│   ├── progress-board.tsx            # Kanban board
│   ├── booking.tsx                   # Đặt lịch
│   ├── tracking.tsx                  # GPS tracking
│   ├── map/                          # Bản đồ công trình
│   │   └── map-view.tsx
│   ├── payment-progress.tsx          # Tiến độ thanh toán
│   └── utilities.tsx                 # Tiện ích xây dựng
│
├── 📅 timeline/ ───────────────────── GANTT CHART & PHASES
│   ├── index.tsx                     # Timeline view
│   ├── phases.tsx                    # Danh sách giai đoạn
│   ├── create-phase.tsx              # Tạo phase
│   ├── edit-phase.tsx                # Sửa phase
│   ├── create-task.tsx               # Tạo task
│   ├── critical-path.tsx             # Đường găng
│   ├── dependencies.tsx              # Phụ thuộc
│   ├── phase/[id].tsx                # Chi tiết phase
│   └── task/[id].tsx                 # Chi tiết task
│
├── 🛒 shopping/ ───────────────────── E-COMMERCE (Shopee-style)
│   ├── index.tsx                     # Trang chủ shopping
│   ├── cart.tsx                      # Giỏ hàng
│   ├── flash-sale.tsx                # Flash sale
│   ├── compare.tsx                   # So sánh sản phẩm
│   ├── products-catalog.tsx          # Catalog sản phẩm
│   ├── product/[id].tsx              # Chi tiết SP
│   ├── [category].tsx                # Danh mục
│   │
│   └── [CATEGORIES]
│       ├── vat-lieu-xay.tsx          # Vật liệu xây dựng
│       ├── gach-men.tsx              # Gạch men
│       ├── son.tsx                   # Sơn
│       ├── dien.tsx                  # Thiết bị điện
│       ├── nuoc.tsx                  # Thiết bị nước
│       ├── noi-that.tsx              # Nội thất
│       ├── thiet-bi-bep.tsx          # Thiết bị bếp
│       ├── thiet-bi-ve-sinh.tsx      # Thiết bị vệ sinh
│       ├── dieu-hoa.tsx              # Điều hòa
│       └── pccc.tsx                  # PCCC
│
├── 💼 services/ ───────────────────── DỊCH VỤ XÂY DỰNG
│   ├── index.tsx                     # Danh sách dịch vụ
│   ├── marketplace.tsx               # Sàn dịch vụ
│   ├── house-design.tsx              # Thiết kế nhà
│   ├── interior-design.tsx           # Thiết kế nội thất
│   ├── construction-company.tsx      # Công ty xây dựng
│   ├── construction-lookup.tsx       # Tra cứu nhà thầu
│   ├── quality-supervision.tsx       # Giám sát chất lượng
│   ├── quality-consulting.tsx        # Tư vấn QC
│   ├── feng-shui.tsx                 # Phong thủy
│   ├── permit.tsx                    # Giấy phép XD
│   ├── design-calculator.tsx         # Tính toán thiết kế
│   ├── color-chart.tsx               # Bảng màu
│   ├── materials-catalog.tsx         # Catalog vật liệu
│   └── ai-assistant/                 # AI hỗ trợ
│
├── 📝 contracts/ ──────────────────── HỢP ĐỒNG & BÁO GIÁ
│   ├── index.tsx                     # Danh sách hợp đồng
│   ├── create.tsx                    # Tạo hợp đồng
│   └── [id]/                         # Chi tiết hợp đồng
│
├── 🤖 ai/ ─────────────────────────── AI FEATURES
│   ├── index.tsx                     # AI Dashboard
│   ├── assistant.tsx                 # AI Assistant
│   ├── chatbot.tsx                   # Chatbot
│   ├── cost-estimator.tsx            # Dự toán chi phí
│   ├── material-check.tsx            # Kiểm tra vật liệu
│   ├── photo-analysis.tsx            # Phân tích ảnh
│   ├── progress-prediction.tsx       # Dự đoán tiến độ
│   └── generate-report.tsx           # Tạo báo cáo AI
│
├── 📺 live/ ───────────────────────── LIVESTREAM
│   ├── index.tsx                     # Danh sách streams
│   ├── create.tsx                    # Tạo stream mới
│   └── [id].tsx                      # Xem stream
│
├── 💬 messages/ ───────────────────── CHAT & MESSAGING
│   ├── index.tsx                     # Danh sách chat
│   ├── [userId].tsx                  # Chat với user
│   └── chat/                         # Chat rooms
│
├── 📞 call/ ───────────────────────── VIDEO/VOICE CALL
│   ├── active.tsx                    # Cuộc gọi đang diễn ra
│   ├── history.tsx                   # Lịch sử cuộc gọi
│   └── [userId].tsx                  # Gọi user
│
├── 👤 profile/ ────────────────────── HỒ SƠ CÁ NHÂN
│   ├── info.tsx                      # Thông tin cá nhân
│   ├── edit.tsx                      # Chỉnh sửa
│   ├── settings.tsx                  # Cài đặt
│   ├── security.tsx                  # Bảo mật
│   ├── privacy.tsx                   # Quyền riêng tư
│   ├── payment.tsx                   # Thanh toán
│   ├── payment-history.tsx           # Lịch sử TT
│   ├── payment-methods.tsx           # Phương thức TT
│   ├── addresses.tsx                 # Địa chỉ
│   ├── favorites.tsx                 # Yêu thích
│   ├── orders.tsx                    # Đơn hàng
│   ├── rewards.tsx                   # Phần thưởng
│   ├── vouchers.tsx                  # Voucher
│   ├── reviews.tsx                   # Đánh giá
│   ├── portfolio.tsx                 # Portfolio
│   ├── my-products.tsx               # Sản phẩm của tôi
│   ├── cloud.tsx                     # Cloud storage
│   └── [userId].tsx                  # Profile người khác
│
├── 🛡️ admin/ ──────────────────────── QUẢN TRỊ HỆ THỐNG
│   ├── index.tsx                     # Admin dashboard
│   ├── dashboard.tsx                 # Dashboard tổng quan
│   ├── dashboard-rbac.tsx            # RBAC Dashboard
│   ├── products.tsx                  # Quản lý SP
│   ├── products/                     # Sub-routes SP
│   ├── services/                     # Quản lý DV
│   ├── staff/                        # Nhân viên
│   ├── roles/                        # Vai trò
│   ├── permissions.tsx               # Phân quyền
│   ├── departments/                  # Phòng ban
│   ├── utilities/                    # Tiện ích
│   ├── moderation.tsx                # Kiểm duyệt
│   ├── activity-log.tsx              # Nhật ký
│   └── settings.tsx                  # Cài đặt
│
├── 📊 dashboard/ ──────────────────── DASHBOARDS (BY ROLE)
│   ├── index.tsx                     # Chọn dashboard
│   ├── admin.tsx                     # Dashboard Admin
│   ├── admin-enhanced.tsx            # Admin nâng cao
│   ├── engineer.tsx                  # Dashboard Kỹ sư
│   ├── engineer-enhanced.tsx         # Kỹ sư nâng cao
│   ├── client.tsx                    # Dashboard Khách hàng
│   └── client-enhanced.tsx           # Khách hàng nâng cao
│
├── 📋 crm/ ────────────────────────── PERFEX CRM INTEGRATION
│   ├── index.tsx                     # CRM Home
│   ├── customers.tsx                 # Khách hàng
│   ├── projects.tsx                  # Dự án CRM
│   ├── admin.tsx                     # Admin CRM
│   └── settings.tsx                  # Cài đặt CRM
│
├── 🔍 quality-assurance/ ──────────── KIỂM SOÁT CHẤT LƯỢNG
│   ├── index.tsx                     # QC Dashboard
│   ├── [id].tsx                      # Chi tiết inspection
│   └── inspections/                  # Danh sách kiểm tra
│
├── 🚛 fleet/ ──────────────────────── QUẢN LÝ PHƯƠNG TIỆN
│   ├── index.tsx                     # Fleet dashboard
│   └── [id].tsx                      # Chi tiết xe
│
├── 🦺 safety/ ─────────────────────── AN TOÀN LAO ĐỘNG
│   ├── index.tsx                     # Safety dashboard
│   ├── incidents/                    # Sự cố
│   ├── ppe/                          # Bảo hộ
│   └── training/                     # Đào tạo
│
├── 📄 documents/ ──────────────────── QUẢN LÝ TÀI LIỆU
│   ├── index.tsx                     # Document list
│   ├── folders.tsx                   # Thư mục
│   ├── create-folder.tsx             # Tạo thư mục
│   ├── document-detail.tsx           # Chi tiết
│   ├── versions.tsx                  # Phiên bản
│   ├── share.tsx                     # Chia sẻ
│   └── comments.tsx                  # Bình luận
│
├── 📈 reports/ ────────────────────── BÁO CÁO & KPI
│   ├── index.tsx                     # Báo cáo
│   └── kpi.tsx                       # KPI metrics
│
├── 🌐 social/ ─────────────────────── MẠNG XÃ HỘI
│   ├── index.tsx                     # Feed
│   ├── post/                         # Chi tiết bài viết
│   └── profile/                      # Profile xã hội
│
├── 🎬 videos/ ─────────────────────── VIDEO CONTENT
│   └── index.tsx                     # Video gallery
│
├── 🛍️ seller/ ─────────────────────── SELLER CENTER
│   ├── dashboard.tsx                 # Seller dashboard
│   ├── add-product.tsx               # Thêm sản phẩm
│   └── edit-product.tsx              # Sửa sản phẩm
│
├── 🔔 notifications/ ──────────────── THÔNG BÁO
│   └── index.tsx                     # Notification center
│
└── [OTHER MODULES]
    ├── cart.tsx                      # Giỏ hàng global
    ├── checkout.tsx                  # Thanh toán
    ├── search.tsx                    # Tìm kiếm
    ├── intro/                        # Giới thiệu
    ├── demo/                         # Demo screens
    ├── meet/                         # Meeting
    ├── equipment/                    # Thiết bị
    ├── inventory/                    # Kho
    ├── labor/                        # Nhân công
    ├── weather/                      # Thời tiết
    └── ... (30+ other routes)
```

---

## 🏗️ KIẾN TRÚC TINH GỌN ĐỀ XUẤT

### Module Grouping (Gộp theo chức năng)

```
📱 CORE MODULES (Chức năng chính - Giữ nguyên)
├── 🔐 Auth          → Đăng nhập/Đăng ký
├── 🏠 Home          → Trang chủ + Quick actions
├── 📁 Projects      → Quản lý dự án
├── 👤 Profile       → Hồ sơ cá nhân
└── 🔔 Notifications → Thông báo

📊 BUSINESS MODULES (Nghiệp vụ - Gộp lại)
├── 📅 Project Management (Gộp: timeline, tasks, phases)
├── 🏗️ Construction (Gộp: progress, tracking, map)
├── 📝 Contracts (Gộp: contracts, quotations, materials)
├── 🔍 Quality Control (Gộp: QC, inspections, safety)
└── 📄 Documents (Gộp: documents, reports)

🛒 COMMERCE MODULES (Thương mại - Gộp lại)
├── 🛍️ Shopping (Gộp: products, categories, cart)
├── 💼 Services (Gộp: services, marketplace)
└── 🏪 Seller (Gộp: seller, admin products)

💬 COMMUNICATION MODULES (Giao tiếp - Gộp lại)
├── 💬 Chat (Gộp: messages, chat rooms)
├── 📞 Call (Gộp: voice/video call)
├── 📺 Live (Gộp: livestream, videos)
└── 🌐 Social (Gộp: social, posts)

🤖 AI & TOOLS (Công cụ - Gộp lại)
├── 🤖 AI Assistant (Gộp: chatbot, analysis, reports)
├── 🛠️ Utilities (Gộp: calculators, tools)
└── ☁️ Cloud (Gộp: storage, backups)

🛡️ ADMIN MODULES (Quản trị - Gộp lại)
├── 📊 Dashboard (Gộp: admin/engineer/client dashboards)
├── 👥 Users (Gộp: staff, roles, permissions)
└── ⚙️ Settings (Gộp: system settings)
```

---

## 📋 KẾ HOẠCH PHÁT TRIỂN

### PHASE 1: Cleanup & Optimization (1-2 tuần)

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1 | Xóa backup files (.backup, .old) | 🔴 High | ⬜ |
| 2 | Gộp duplicate screens (index-flatlist, etc.) | 🔴 High | ⬜ |
| 3 | Tối ưu imports & lazy loading | 🟡 Medium | ⬜ |
| 4 | Remove unused dependencies | 🟡 Medium | ⬜ |
| 5 | Cập nhật TypeScript types | 🟡 Medium | ⬜ |

**Files cần xóa:**
```
app/(tabs)/index.old.tsx
app/(tabs)/index-flatlist.tsx
app/(tabs)/index-scrollview-backup.tsx
app/(tabs)/index.backup.tsx
app/(tabs)/notifications.tsx.backup
app/timeline/index.tsx.backup
app/profile/info.backup.tsx
app/profile/payment.backup.tsx
app/profile/security.backup.tsx
app/(auth)/auth-3d-flip.tsx.backup
app/construction-old-backup/
app/construction-progress-backup.tsx
```

### PHASE 2: Route Restructure (2-3 tuần)

| # | Task | Priority |
|---|------|----------|
| 1 | Gộp Shopping routes theo category | 🔴 High |
| 2 | Gộp Profile routes vào folder | 🔴 High |
| 3 | Chuẩn hóa naming convention | 🟡 Medium |
| 4 | Tối ưu deep linking | 🟡 Medium |
| 5 | Implement route guards | 🟡 Medium |

**Cấu trúc mới đề xuất:**
```
app/
├── (auth)/           # Authentication
├── (tabs)/           # Main tabs (5 active)
├── (stack)/          # Stack screens
│   ├── project/      # Project management
│   ├── commerce/     # Shopping + Services
│   ├── communication/ # Chat + Call + Live
│   └── admin/        # Admin functions
└── (modal)/          # Modal screens
```

### PHASE 3: Feature Enhancement (3-4 tuần)

| # | Feature | Module | Status |
|---|---------|--------|--------|
| 1 | Offline mode | Core | ⬜ |
| 2 | Push notifications | Notifications | ⬜ |
| 3 | Real-time sync | Projects | ⬜ |
| 4 | Payment integration | Commerce | ⬜ |
| 5 | AI cost estimation | AI | ⬜ |
| 6 | Video call improvements | Call | ⬜ |
| 7 | QC checklist templates | QC | ⬜ |
| 8 | Document versioning | Documents | ⬜ |

### PHASE 4: Testing & QA (1-2 tuần)

| # | Task | Priority |
|---|------|----------|
| 1 | Unit tests cho services | 🔴 High |
| 2 | Integration tests cho APIs | 🔴 High |
| 3 | E2E tests cho flows | 🟡 Medium |
| 4 | Performance testing | 🟡 Medium |
| 5 | Security audit | 🔴 High |

### PHASE 5: Deployment (1 tuần)

| # | Task | Priority |
|---|------|----------|
| 1 | Build Android APK | 🔴 High |
| 2 | Build iOS IPA | 🔴 High |
| 3 | Setup CI/CD | 🟡 Medium |
| 4 | Configure OTA updates | 🟡 Medium |
| 5 | Monitor & logging | 🟡 Medium |

---

## 🔗 BACKEND API MAPPING

| App Module | BE Endpoint | Status |
|------------|-------------|--------|
| Auth | `/auth/*` | ✅ Active |
| Projects | `/projects/*` | ✅ Active |
| Tasks | `/tasks/*` | ✅ Active |
| Comments | `/comments/*` | ✅ Active |
| Dashboard | `/dashboard/*` | ✅ Active |
| Timeline | `/timeline/*` | ✅ Active |
| Chat | `/chat/*` | ✅ Active |
| Call | `/call/*` | ✅ Active |
| Video | `/video/*` | ✅ Active |
| Live Streams | `/live-streams/*` | ✅ Active |
| Services | `/services/*` | ✅ Active (9 items) |
| Products | `/products/*` | ✅ Active (9 items) |
| QC | `/qc/*` | ✅ Active (6 categories) |
| Materials | `/contract/materials/*` | ✅ Active (7 items) |
| Payment | `/payment/*` | ✅ Active |
| Upload | `/upload/*` | ✅ Active |
| AI | `/ai/*` | ✅ Active |
| Notifications | `/notifications/*` | ✅ Active |
| Fleet | `/fleet/*` | ✅ Active |
| Profile | `/profile/*` | ✅ Active |
| Users | `/users/*` | ✅ Active |

---

## 🎯 PRIORITY ACTIONS

### Ngay lập tức:
1. ✅ ~~Tạo test user~~ (Done)
2. ✅ ~~Seed data cho Services, QC, Materials~~ (Done)
3. ✅ ~~Tạo commentsApi.ts~~ (Done)
4. ⬜ Xóa backup files
5. ⬜ Cập nhật testCredentials.ts với user mới

### Tuần này:
1. ⬜ Review & cleanup duplicate screens
2. ⬜ Test all auth-required endpoints
3. ⬜ Update environment configs
4. ⬜ Verify WebSocket connections

### Tháng này:
1. ⬜ Implement offline mode
2. ⬜ Complete payment integration
3. ⬜ Enhance AI features
4. ⬜ Build production APK

---

## 📌 TEST ACCOUNTS

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Test User | `apptest2026@gmail.com` | `AppTest@2026!` | CLIENT |
| Admin | `admin2026@baotienweb.cloud` | `Admin@2026!` | ADMIN |

---

*Document auto-generated on January 2, 2026*
