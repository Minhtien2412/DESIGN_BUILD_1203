# 🗺️ UI/Navigation Sitemap - Ứng dụng Xây dựng & Thương mại điện tử

> **Cập nhật:** Tháng 1/2025  
> **Tổng số màn hình:** 150+ trang  
> **Framework:** Expo Router (SDK 54) + React Native + TypeScript

---

## 📊 Tổng quan Kiến trúc Navigation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ROOT LAYOUT (_layout.tsx)                          │
│                    ┌─────────────────────────────────────┐                      │
│                    │  AuthProvider → CartProvider → Stack │                      │
│                    └─────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
            ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
            │  (auth)       │   │  (tabs)       │   │  Other Routes │
            │  - sign-in    │   │  - index      │   │  - cart       │
            │  - sign-up    │   │  - profile    │   │  - checkout   │
            │  - forgot-pwd │   │  - projects   │   │  - product/   │
            └───────────────┘   │  - notifs     │   │  - admin/     │
                                └───────────────┘   │  - ai/        │
                                                    │  - ...        │
                                                    └───────────────┘
```

---

## 🏠 Tab Navigation (Bottom Tab Bar)

| Tab | Route | Icon | Màn hình chính |
|-----|-------|------|----------------|
| 🏠 **Trang chủ** | `(tabs)/index` | home | Dashboard xây dựng |
| 📋 **Dự án** | `(tabs)/projects` | briefcase | Danh sách dự án |
| 🔔 **Thông báo** | `(tabs)/notifications` | notifications | Timeline thông báo |
| 👤 **Hồ sơ** | `(tabs)/profile` | person | Thông tin cá nhân |

### Hidden Tabs (không hiển thị trên tab bar)
- `(tabs)/activity.tsx` - Hoạt động người dùng
- `(tabs)/call-test.tsx` - Test cuộc gọi
- `(tabs)/contacts.tsx` - Danh bạ
- `(tabs)/live.tsx` - Live streaming
- `(tabs)/menu.tsx` - Menu chính
- `(tabs)/modern-home.tsx` - Trang chủ style mới

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    AUTHENTICATION                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌──────────────┐     ┌──────────────┐                │
│   │   Sign In    │────▶│   Home (/)   │                │
│   │  (auth)/     │     └──────────────┘                │
│   │  sign-in     │                                     │
│   └──────────────┘                                     │
│         │                                               │
│         ▼                                               │
│   ┌──────────────┐     ┌──────────────┐                │
│   │   Sign Up    │────▶│   Intro /    │                │
│   │  (auth)/     │     │   Onboarding │                │
│   │  sign-up     │     └──────────────┘                │
│   └──────────────┘                                     │
│         │                                               │
│         ▼                                               │
│   ┌──────────────┐                                     │
│   │ Forgot Pass  │                                     │
│   │  (auth)/     │                                     │
│   │  forgot-pwd  │                                     │
│   └──────────────┘                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛒 E-Commerce Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SHOPPING / E-COMMERCE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐ │
│  │  Categories │───▶│  Products   │───▶│    Cart     │───▶│ Checkout │ │
│  │ categories/ │    │  product/   │    │  /cart      │    │ checkout/│ │
│  └─────────────┘    │  [id].tsx   │    └─────────────┘    │ payment  │ │
│                     └─────────────┘                       └──────────┘ │
│                                                                         │
│  📂 /categories/                                                        │
│     ├── index.tsx         (Tất cả danh mục)                            │
│     └── [id].tsx          (Chi tiết danh mục)                          │
│                                                                         │
│  📂 /product/                                                           │
│     └── [id].tsx          (Chi tiết sản phẩm)                          │
│                                                                         │
│  📂 /shopping/                                                          │
│     ├── index.tsx         (Trang mua sắm chính)                        │
│     ├── brands.tsx        (Thương hiệu)                                │
│     ├── deals.tsx         (Khuyến mãi)                                 │
│     └── flash-sale.tsx    (Flash sale)                                 │
│                                                                         │
│  📂 /checkout/                                                          │
│     ├── index.tsx         (Xác nhận đơn hàng)                          │
│     └── payment.tsx ✅    (Thanh toán)                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Construction Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CONSTRUCTION MANAGEMENT                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📂 /construction/                                                      │
│     ├── index.tsx              (Dashboard xây dựng)                    │
│     ├── activities.tsx         (Hoạt động công trình)                  │
│     ├── progress.tsx           (Tiến độ công trình)                    │
│     ├── issues.tsx             (Vấn đề phát sinh)                      │
│     └── [id]/                  (Chi tiết dự án)                        │
│         ├── overview.tsx                                               │
│         ├── schedule.tsx                                               │
│         └── team.tsx                                                   │
│                                                                         │
│  📂 /daily-report/                                                      │
│     ├── index.tsx              (Danh sách báo cáo)                     │
│     ├── create.tsx             (Tạo báo cáo mới)                       │
│     └── [id].tsx               (Chi tiết báo cáo)                      │
│                                                                         │
│  📂 /punch-list/                                                        │
│     ├── index.tsx              (Danh sách punch)                       │
│     └── create.tsx             (Tạo punch item)                        │
│                                                                         │
│  📂 /inspection/                                                        │
│     ├── index.tsx              (Danh sách kiểm tra)                    │
│     ├── checklist.tsx          (Checklist)                             │
│     └── create.tsx             (Tạo kiểm tra mới)                      │
│                                                                         │
│  📂 /quality-assurance/                                                 │
│     ├── index.tsx              (Dashboard QA)                          │
│     ├── tests.tsx              (Kết quả test)                          │
│     └── standards.tsx          (Tiêu chuẩn)                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Project Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PROJECT MANAGEMENT                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📂 /projects/                                                          │
│     ├── index.tsx              (Danh sách dự án)                       │
│     ├── create.tsx             (Tạo dự án mới)                         │
│     ├── archived.tsx           (Dự án lưu trữ)                         │
│     └── [id]/                  (Chi tiết dự án)                        │
│         ├── index.tsx                                                  │
│         ├── details.tsx                                                │
│         ├── team.tsx                                                   │
│         ├── timeline.tsx                                               │
│         └── documents.tsx                                              │
│                                                                         │
│  📂 /timeline/                                                          │
│     ├── index.tsx              (Gantt chart)                           │
│     └── milestones.tsx         (Mốc quan trọng)                        │
│                                                                         │
│  📂 /meeting-minutes/                                                   │
│     ├── index.tsx              (Danh sách biên bản)                    │
│     └── create.tsx             (Tạo biên bản)                          │
│                                                                         │
│  📂 /resource-planning/                                                 │
│     ├── index.tsx              (Kế hoạch nguồn lực)                    │
│     ├── calendar.tsx           (Lịch)                                  │
│     └── allocation.tsx         (Phân bổ)                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💰 Financial Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FINANCIAL MANAGEMENT                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📂 /budget/                                                            │
│     ├── index.tsx              (Dashboard ngân sách)                   │
│     ├── budgets.tsx ✅         (Quản lý ngân sách)                     │
│     ├── estimates.tsx ✅       (Dự toán)                               │
│     ├── reports.tsx ✅         (Báo cáo tài chính)                     │
│     └── compare.tsx            (So sánh ngân sách)                     │
│                                                                         │
│  📂 /procurement/                                                       │
│     ├── index.tsx              (Dashboard mua sắm)                     │
│     ├── create.tsx ✅          (Tạo yêu cầu mua sắm)                   │
│     ├── orders.tsx             (Đơn hàng)                              │
│     ├── requests.tsx           (Yêu cầu)                               │
│     └── vendors/                                                        │
│         ├── index.tsx          (Danh sách NCC)                         │
│         ├── create.tsx ✅      (Thêm NCC mới)                          │
│         └── [id].tsx           (Chi tiết NCC)                          │
│                                                                         │
│  📂 /contracts/                                                         │
│     ├── index.tsx              (Danh sách hợp đồng)                    │
│     ├── create.tsx             (Tạo hợp đồng)                          │
│     └── [id].tsx               (Chi tiết hợp đồng)                     │
│                                                                         │
│  📂 /change-order/                                                      │
│     ├── index.tsx              (Danh sách CO)                          │
│     └── create.tsx             (Tạo CO)                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Assistant

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI ASSISTANT                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📂 /ai/                                                                │
│     ├── index.tsx              (Chat AI chính)                         │
│     ├── photo-analysis.tsx     (Phân tích ảnh)                         │
│     ├── generate-report.tsx    (Tạo báo cáo AI)                        │
│     ├── material-check.tsx     (Kiểm tra vật liệu)                     │
│     ├── progress-prediction.tsx ✅ (Dự đoán tiến độ)                   │
│     └── settings.tsx           (Cài đặt AI)                            │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │                    AI Features Flow                          │       │
│  │                                                              │       │
│  │   ┌──────────┐    ┌──────────┐    ┌──────────┐             │       │
│  │   │  Upload  │───▶│  AI      │───▶│  Results │             │       │
│  │   │  Photo   │    │  Process │    │  Display │             │       │
│  │   └──────────┘    └──────────┘    └──────────┘             │       │
│  │                                                              │       │
│  │   ┌──────────┐    ┌──────────┐    ┌──────────┐             │       │
│  │   │  Select  │───▶│  AI      │───▶│ Prediction│             │       │
│  │   │  Project │    │  Analyze │    │   Chart   │             │       │
│  │   └──────────┘    └──────────┘    └──────────┘             │       │
│  │                                                              │       │
│  └─────────────────────────────────────────────────────────────┘       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Safety & Compliance

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SAFETY & COMPLIANCE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📂 /safety/                                                            │
│     ├── index.tsx              (Dashboard an toàn)                     │
│     ├── checklist.tsx          (Checklist an toàn)                     │
│     ├── training.tsx           (Đào tạo)                               │
│     ├── equipment.tsx          (Thiết bị bảo hộ)                       │
│     └── incidents/                                                      │
│         ├── index.tsx          (Danh sách sự cố)                       │
│         ├── create.tsx ✅      (Báo cáo sự cố)                         │
│         └── [id].tsx           (Chi tiết sự cố)                        │
│                                                                         │
│  📂 /environmental/                                                     │
│     ├── index.tsx              (Dashboard môi trường)                  │
│     ├── permits.tsx            (Giấy phép)                             │
│     └── monitoring.tsx         (Giám sát)                              │
│                                                                         │
│  📂 /legal/                                                             │
│     ├── index.tsx              (Dashboard pháp lý)                     │
│     ├── compliance.tsx         (Tuân thủ)                              │
│     └── documents.tsx          (Tài liệu pháp lý)                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 👤 User Profile & Settings

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      USER PROFILE & SETTINGS                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📂 /profile/                                                           │
│     ├── index.tsx              (Hồ sơ cá nhân)                         │
│     ├── edit.tsx               (Chỉnh sửa hồ sơ)                       │
│     ├── settings.tsx           (Cài đặt)                               │
│     │                                                                   │
│     ├── addresses/                                                      │
│     │   ├── index.tsx          (Danh sách địa chỉ)                     │
│     │   ├── new.tsx ✅         (Thêm địa chỉ)                          │
│     │   └── [id].tsx           (Sửa địa chỉ)                           │
│     │                                                                   │
│     ├── payment/                                                        │
│     │   ├── index.tsx          (Phương thức TT)                        │
│     │   ├── add-card.tsx ✅    (Thêm thẻ)                              │
│     │   ├── add-bank.tsx ✅    (Liên kết ngân hàng)                    │
│     │   └── add-wallet.tsx ✅  (Liên kết ví)                           │
│     │                                                                   │
│     └── orders/                                                         │
│         ├── index.tsx          (Lịch sử đơn hàng)                      │
│         └── [id].tsx           (Chi tiết đơn hàng)                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Admin Panel

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ADMIN PANEL                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📂 /admin/                                                             │
│     ├── index.tsx              (Dashboard Admin)                       │
│     ├── users.tsx              (Quản lý người dùng)                    │
│     ├── roles.tsx              (Phân quyền)                            │
│     ├── activity-log.tsx ✅    (Log hoạt động)                         │
│     ├── settings.tsx           (Cài đặt hệ thống)                      │
│     │                                                                   │
│     └── reports/                                                        │
│         ├── index.tsx          (Báo cáo tổng hợp)                      │
│         ├── users.tsx          (Báo cáo người dùng)                    │
│         └── system.tsx         (Báo cáo hệ thống)                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Social & Communication

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SOCIAL & COMMUNICATION                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📂 /messages/                                                          │
│     ├── index.tsx              (Danh sách chat)                        │
│     ├── [id].tsx               (Chi tiết chat)                         │
│     └── new.tsx                (Tin nhắn mới)                          │
│                                                                         │
│  📂 /social/                                                            │
│     ├── index.tsx              (Feed xã hội)                           │
│     ├── profile.tsx            (Profile xã hội)                        │
│     └── connections.tsx        (Kết nối)                               │
│                                                                         │
│  📂 /call/                                                              │
│     ├── index.tsx              (Danh sách cuộc gọi)                    │
│     ├── video.tsx              (Video call)                            │
│     └── voice.tsx              (Voice call)                            │
│                                                                         │
│  📂 /tiktok/                                                            │
│     ├── index.tsx              (Feed video ngắn)                       │
│     ├── live.tsx ✅            (Live streaming)                        │
│     ├── create.tsx             (Tạo video)                             │
│     └── [id].tsx               (Chi tiết video)                        │
│                                                                         │
│  📂 /stories/                                                           │
│     ├── index.tsx              (Xem stories)                           │
│     └── create.tsx             (Tạo story)                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Document Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     DOCUMENT MANAGEMENT                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📂 /documents/                                                         │
│     ├── index.tsx              (Thư viện tài liệu)                     │
│     ├── upload.tsx             (Upload file)                           │
│     └── [id].tsx               (Xem tài liệu)                          │
│                                                                         │
│  📂 /document-control/                                                  │
│     ├── index.tsx              (Dashboard kiểm soát)                   │
│     ├── versions.tsx           (Quản lý phiên bản)                     │
│     └── approval.tsx           (Phê duyệt)                             │
│                                                                         │
│  📂 /submittal/                                                         │
│     ├── index.tsx              (Danh sách submittal)                   │
│     ├── create.tsx             (Tạo submittal)                         │
│     └── [id].tsx               (Chi tiết)                              │
│                                                                         │
│  📂 /rfi/                                                               │
│     ├── index.tsx              (Danh sách RFI)                         │
│     ├── create.tsx             (Tạo RFI)                               │
│     └── [id].tsx               (Chi tiết RFI)                          │
│                                                                         │
│  📂 /as-built/                                                          │
│     ├── index.tsx              (Bản vẽ hoàn công)                      │
│     └── upload.tsx             (Upload bản vẽ)                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Change Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CHANGE MANAGEMENT                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📂 /change-management/                                                 │
│     ├── index.tsx              (Dashboard thay đổi)                    │
│     ├── create.tsx ✅          (Tạo yêu cầu thay đổi)                  │
│     ├── pending.tsx            (Chờ duyệt)                             │
│     ├── approved.tsx           (Đã duyệt)                              │
│     └── [id].tsx               (Chi tiết)                              │
│                                                                         │
│  📂 /risk/                                                              │
│     ├── index.tsx              (Dashboard rủi ro)                      │
│     ├── register.tsx           (Sổ rủi ro)                             │
│     └── matrix.tsx             (Ma trận rủi ro)                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📈 Reports & Analytics

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     REPORTS & ANALYTICS                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📂 /reports/                                                           │
│     ├── index.tsx              (Dashboard báo cáo)                     │
│     ├── daily.tsx              (Báo cáo hàng ngày)                     │
│     ├── weekly.tsx             (Báo cáo tuần)                          │
│     ├── monthly.tsx            (Báo cáo tháng)                         │
│     └── custom.tsx             (Báo cáo tùy chỉnh)                     │
│                                                                         │
│  📂 /dashboard/                                                         │
│     ├── index.tsx              (Dashboard chính)                       │
│     ├── construction.tsx       (Dashboard xây dựng)                    │
│     ├── finance.tsx            (Dashboard tài chính)                   │
│     └── safety.tsx             (Dashboard an toàn)                     │
│                                                                         │
│  📄 /analytics.tsx              (Phân tích dữ liệu)                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏭 Equipment & Materials

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    EQUIPMENT & MATERIALS                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📂 /equipment/                                                         │
│     ├── index.tsx              (Danh sách thiết bị)                    │
│     ├── maintenance.tsx        (Bảo trì)                               │
│     └── [id].tsx               (Chi tiết thiết bị)                     │
│                                                                         │
│  📂 /materials/                                                         │
│     ├── index.tsx              (Quản lý vật liệu)                      │
│     ├── inventory.tsx          (Tồn kho)                               │
│     └── orders.tsx             (Đơn đặt hàng)                          │
│                                                                         │
│  📂 /inventory/                                                         │
│     ├── index.tsx              (Dashboard kho)                         │
│     ├── stock.tsx              (Tồn kho)                               │
│     └── movement.tsx           (Xuất nhập)                             │
│                                                                         │
│  📂 /fleet/                                                             │
│     ├── index.tsx              (Quản lý xe)                            │
│     ├── tracking.tsx           (Theo dõi GPS)                          │
│     └── maintenance.tsx        (Bảo dưỡng)                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏢 Commissioning & Handover

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   COMMISSIONING & HANDOVER                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📂 /commissioning/                                                     │
│     ├── index.tsx              (Dashboard nghiệm thu)                  │
│     ├── checklist.tsx          (Checklist nghiệm thu)                  │
│     └── schedule.tsx           (Lịch nghiệm thu)                       │
│                                                                         │
│  📂 /warranty/                                                          │
│     ├── index.tsx              (Quản lý bảo hành)                      │
│     ├── claims.tsx             (Yêu cầu bảo hành)                      │
│     └── [id].tsx               (Chi tiết)                              │
│                                                                         │
│  📂 /om-manuals/                                                        │
│     ├── index.tsx              (Sổ tay O&M)                            │
│     └── [id].tsx               (Chi tiết)                              │
│                                                                         │
│  📂 /finishing/                                                         │
│     ├── index.tsx              (Công tác hoàn thiện)                   │
│     └── checklist.tsx          (Checklist)                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Utility Screens

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       UTILITY SCREENS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📄 /search.tsx                 (Tìm kiếm toàn cục)                     │
│  📄 /cart.tsx                   (Giỏ hàng)                              │
│  📄 /health-check.tsx           (Kiểm tra sức khỏe hệ thống)           │
│  📄 /file-upload.tsx            (Upload file)                          │
│  📄 /quote-request.tsx          (Yêu cầu báo giá)                       │
│  📄 /scheduled-tasks.tsx        (Công việc đã lên lịch)                 │
│  📄 /progress-tracking.tsx      (Theo dõi tiến độ)                      │
│  📄 /construction-progress.tsx  (Tiến độ xây dựng)                      │
│                                                                         │
│  📂 /weather/                                                           │
│     └── index.tsx              (Dự báo thời tiết)                      │
│                                                                         │
│  📂 /utilities/                                                         │
│     ├── index.tsx              (Tiện ích)                              │
│     └── calculator.tsx         (Máy tính)                              │
│                                                                         │
│  📂 /intro/                                                             │
│     └── index.tsx              (Giới thiệu/Onboarding)                 │
│                                                                         │
│  📂 /sitemap/                                                           │
│     └── index.tsx              (Sitemap)                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Danh sách trang đã tạo mới

| # | Route | Mô tả | Trạng thái |
|---|-------|-------|------------|
| 1 | `/ai/progress-prediction` | Dự đoán tiến độ AI | ✅ Đã tạo |
| 2 | `/budget/budgets` | Quản lý ngân sách | ✅ Đã tạo |
| 3 | `/budget/estimates` | Dự toán | ✅ Đã tạo |
| 4 | `/budget/reports` | Báo cáo tài chính | ✅ Đã tạo |
| 5 | `/procurement/create` | Tạo yêu cầu mua sắm | ✅ Đã tạo |
| 6 | `/procurement/vendors/create` | Thêm nhà cung cấp | ✅ Đã tạo |
| 7 | `/change-management/create` | Tạo yêu cầu thay đổi | ✅ Đã tạo |
| 8 | `/admin/activity-log` | Log hoạt động hệ thống | ✅ Đã tạo |
| 9 | `/profile/addresses/new` | Thêm địa chỉ mới | ✅ Đã tạo |
| 10 | `/tiktok/live` | Live streaming | ✅ Đã tạo |
| 11 | `/checkout/payment` | Thanh toán | ✅ Đã tạo |
| 12 | `/safety/incidents/create` | Báo cáo sự cố an toàn | ✅ Đã tạo |
| 13 | `/profile/payment/add-card` | Thêm thẻ thanh toán | ✅ Đã tạo |
| 14 | `/profile/payment/add-bank` | Liên kết ngân hàng | ✅ Đã tạo |
| 15 | `/profile/payment/add-wallet` | Liên kết ví điện tử | ✅ Đã tạo |

---

## 🔗 Navigation Patterns

### 1. Stack Navigation
```typescript
// Điều hướng đến trang khác
router.push('/product/123');
router.push('/ai/progress-prediction');

// Quay lại
router.back();

// Thay thế màn hình hiện tại
router.replace('/(tabs)');
```

### 2. Tab Navigation
```typescript
// Chuyển tab
router.push('/(tabs)/projects');
router.push('/(tabs)/notifications');
```

### 3. Modal Navigation
```typescript
// Mở modal
router.push('/cart');
router.push('/search');
```

---

## 📋 Checklist Kiểm tra Navigation

- [x] Tất cả links từ AI Quick Actions hoạt động
- [x] Checkout flow hoàn chỉnh (cart → checkout → payment)
- [x] Safety incident reporting hoạt động
- [x] Budget management screens tồn tại
- [x] Procurement workflow hoàn chỉnh
- [x] Change management flow hoạt động
- [x] Admin activity log hoạt động
- [x] Profile settings đầy đủ (addresses, payment methods)
- [x] Social features (TikTok live) hoạt động
- [ ] Deep linking configured
- [ ] Analytics tracking implemented

---

## 🎯 Tiến độ hoàn thành

```
Tổng số routes ước tính: ~150+
Routes đã tạo/kiểm tra: ~140
Routes còn thiếu đã bổ sung: 15

Tiến độ: ████████████████████░░░░ 93%
```

---

*Tài liệu được tạo tự động bởi AI Assistant*
*Cập nhật: Tháng 1/2025*
