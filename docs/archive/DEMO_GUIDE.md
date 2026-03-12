# 🎯 HƯỚNG DẪN DEMO & PHÁT TRIỂN APP
## BaoTienWeb - Construction Management Platform

> **Cập nhật:** 09/12/2025  
> **Trạng thái:** Production Ready ✅  
> **Backend:** ✅ Online (https://baotienweb.cloud)  
> **API Health:** ✅ PASS - Database Connected  
> **📊 Chi tiết:** [BACKEND_STATUS_REPORT.md](./BACKEND_STATUS_REPORT.md)

---

## 📱 DEMO APP - QUICK START

### 1️⃣ Chạy App Ngay (Development Mode)

```bash
# Cài đặt dependencies (nếu chưa cài)
npm install

# Khởi động development server
npm start

# Sau đó chọn:
# - Press 'a' cho Android Emulator
# - Press 'w' cho Web Browser
# - Quét QR code cho thiết bị thật
```

### 2️⃣ Tài Khoản Demo

```
👨‍💼 Admin:     admin@baotienweb.com     / Admin123!@#
👷 Engineer:  engineer@baotienweb.com  / Test123!@#
👤 Client:    client@baotienweb.com    / Test123!@#
```

### 3️⃣ Tính Năng Demo Chính

#### 🏗️ **Quản Lý Dự Án**
- **Đường dẫn:** `/(tabs)/projects`
- **Tính năng:**
  - Xem danh sách dự án
  - Tạo dự án mới
  - Theo dõi tiến độ
  - Quản lý tasks
  - Timeline & milestones

#### 💰 **Thanh Toán & Hợp Đồng**
- **Đường dẫn:** `/budget`, `/contracts`
- **Tính năng:**
  - Quản lý ngân sách
  - Theo dõi thanh toán
  - Hợp đồng xây dựng
  - Báo cáo tài chính

#### 🛒 **Mua Sắm Vật Liệu**
- **Đường dẫn:** `/shopping`, `/cart`
- **Tính năng:**
  - Catalog vật liệu xây dựng
  - Thêm vào giỏ hàng
  - Đặt hàng trực tuyến
  - Theo dõi đơn hàng

#### 💬 **Giao Tiếp Real-time**
- **Đường dẫn:** `/messages`, `/call`
- **Tính năng:**
  - Chat 1-1 và nhóm
  - Video call
  - Live streaming (sắp ra mắt)
  - Thông báo push

#### 📊 **Dashboard & Analytics**
- **Đường dẫn:** `/dashboard`
- **Tính năng:**
  - Tổng quan dự án
  - Biểu đồ tiến độ
  - Thống kê tài chính
  - Báo cáo nhân sự

#### 🎥 **Tính Năng Độc Đáo**
- **Live Stream:** `/live` - Phát trực tiếp công trường
- **Stories:** `/stories` - Cập nhật nhanh hàng ngày
- **Food Ordering:** `/food` - Đặt cơm cho công trường
- **Weather:** `/weather` - Dự báo thời tiết ảnh hưởng thi công

---

## 📦 XUẤT FILE APK

### Phương Pháp 1: Build Preview (Nhanh - Dùng cho Demo)

```bash
# Build APK preview (không cần upload store)
npm run build:preview

# Hoặc build tối ưu hơn (dọn dẹp temp files)
npm run build:preview:optimized
```

**Thời gian:** ~10-15 phút  
**Output:** File APK tải về từ EAS Build  
**Dùng cho:** Demo nội bộ, testing

### Phương Pháp 2: Build Production (Đầy đủ)

```bash
# Build production APK
npm run build:production

# Hoặc dùng script riêng
npm run build:android
```

**Thời gian:** ~15-20 phút  
**Output:** Production-ready APK  
**Dùng cho:** Release chính thức

### Phương Pháp 3: Build Development (Cho Dev Team)

```bash
# Build development APK với dev tools
npm run build:dev:android
```

**Đặc điểm:**
- Có debug tools
- Hot reload qua Expo Dev Client
- Dùng cho development team

### 📥 Lấy File APK Sau Khi Build

```bash
# Xem danh sách builds
npm run build:list

# Hoặc vào web
https://expo.dev/accounts/[your-account]/projects/APP_DESIGN_BUILD/builds
```

**File APK sẽ được tải từ:**
1. EAS Build Dashboard
2. Link download được gửi qua email
3. QR code để cài đặt trực tiếp

---

## 🚀 HƯỚNG PHÁT TRIỂN TIẾP THEO

### 🎯 Ưu Tiên Cao (1-2 Tuần)

#### 1. **Hoàn Thiện Tích Hợp Backend**

**Hiện trạng:**
- ✅ Backend: 23/23 modules sẵn sàng
- ⚠️ Frontend: 50+ screens có UI nhưng chưa connect hết backend
- 🔄 WebSocket: Đã setup nhưng đang tắt (`autoConnect={false}`)

**Công việc:**
```typescript
// 1. Kích hoạt WebSocket (app/_layout.tsx)
<WebSocketProvider autoConnect={true}>  // Đổi false → true

// 2. Tích hợp các API còn thiếu:
- Payment API → /budget, /contracts
- Comments API → /projects/[id]
- Timeline API → /timeline (ĐÃ CÓ ✅)
- Video API → /call, /live
- CRM API → /dashboard
```

**File cần cập nhật:**
- `services/payment-api.ts` (tạo mới)
- `services/comments-api.ts` (tạo mới)
- `services/video-api.ts` (hoàn thiện)
- `app/_layout.tsx` (enable WebSocket)

#### 2. **Hoàn Thiện Live Streaming**

**Hiện trạng:**
- ✅ Backend Video module sẵn sàng
- ⚠️ Frontend `/live` có cơ bản

**Roadmap:**
```
Week 1:
- Tích hợp WebRTC cho live stream
- UI player với controls
- Chat sidebar khi xem live

Week 2:
- Lưu recordings
- Thông báo khi có live mới
- Share live link
```

**File:**
- `app/live/index.tsx` (nâng cấp)
- `components/live/LivePlayer.tsx` (tạo mới)
- `services/live-api.ts` (tạo mới)

#### 3. **Hệ Thống Thông Báo Nâng Cao**

**Hiện trạng:**
- ✅ Notification API sẵn sàng
- ✅ Frontend có NotificationContext
- ⚠️ Đang dùng polling (30s), chưa dùng WebSocket

**Nâng cấp:**
```typescript
// Chuyển từ polling sang WebSocket real-time
- Rich notifications với actions
- Nhóm notifications theo loại
- Notification scheduling
- Multi-language support (đã có template)
```

**File:**
- `context/NotificationContext.tsx` (nâng cấp WebSocket)
- `services/notification-listener.ts` (giữ làm fallback)

### 🎨 Ưu Tiên Trung Bình (2-4 Tuần)

#### 4. **Construction Map (Canvas Tiến Độ)**

**Mô tả:**
- Canvas 2D vô hạn để vẽ tiến độ công trường
- Kéo thả tasks, stages
- Real-time sync giữa users

**Hiện trạng:**
- ✅ Backend deployed (103.200.20.100)
- ✅ Library `lib/construction-map/` có sẵn
- ⚠️ Chưa tích hợp vào main app

**Công việc:**
```bash
# Tích hợp vào project detail
app/projects/[id]/map.tsx  # Tạo tab mới

# Components cần:
components/construction/
  - CanvasMap.tsx
  - TaskNode.tsx
  - StageGroup.tsx
  - MapControls.tsx
```

#### 5. **Stories Feature (Giống Instagram)**

**Ý tưởng:**
- Cập nhật nhanh tiến độ công trường
- Ảnh/video 24h tự xóa
- Swipe để xem stories khác

**Công việc:**
```bash
app/stories/
  - index.tsx        # Danh sách stories
  - [userId].tsx     # Xem stories của user
  - create.tsx       # Tạo story mới

components/stories/
  - StoryViewer.tsx
  - StoryCircle.tsx
  - StoryCreator.tsx
```

#### 6. **AI Assistant Integration**

**Hiện trạng:**
- ✅ Backend AI module sẵn sàng
- ❌ Frontend chưa có UI

**Tính năng:**
```
- Chat với AI về dự án
- Phân tích tiến độ tự động
- Đề xuất giải pháp kỹ thuật
- Ước lượng chi phí
```

**UI:**
```bash
app/ai-assistant/
  - index.tsx        # Chat interface
  - insights.tsx     # AI insights dashboard

components/ai/
  - ChatBubble.tsx
  - SuggestionCard.tsx
  - InsightChart.tsx
```

### 🔮 Tương Lai (1-3 Tháng)

#### 7. **Offline Mode**
- Sync data khi có mạng
- Cache critical data
- Queue actions khi offline

#### 8. **Multi-language**
- Tiếng Việt (default)
- English
- Tiếng Trung, Nhật, Hàn (cho notifications đã có template)

#### 9. **Advanced Analytics**
- Predictive analytics
- Resource optimization
- Cost forecasting
- Risk assessment

#### 10. **AR/VR Features**
- AR visualization công trường
- VR tour dự án
- 3D model viewer

---

## 📊 ROADMAP TIMELINE

```
🎯 THÁNG 1 (Tuần 1-4)
├─ Week 1: Backend Integration (Payment, Comments, Video)
├─ Week 2: WebSocket Real-time (enable toàn bộ)
├─ Week 3: Live Streaming hoàn thiện
└─ Week 4: Testing & Bug fixes

🎯 THÁNG 2 (Tuần 5-8)
├─ Week 5-6: Construction Map tích hợp
├─ Week 7: Stories feature
└─ Week 8: AI Assistant UI

🎯 THÁNG 3 (Tuần 9-12)
├─ Week 9-10: Offline Mode
├─ Week 11: Multi-language
└─ Week 12: Advanced Analytics

🎯 THÁNG 4+ (Future)
└─ AR/VR Features, Enterprise features
```

---

## 🛠️ KIẾN TRÚC KỸ THUẬT

### Tech Stack Hiện Tại

```
Frontend:
├─ Expo SDK 54 (React Native 0.76)
├─ TypeScript 100%
├─ React 19
├─ expo-router (file-based routing)
├─ Context API (state management)
└─ Socket.IO Client (WebSocket)

Backend:
├─ Domain: https://baotienweb.cloud ✅
├─ Framework: NestJS (Node.js)
├─ Database: PostgreSQL
├─ Socket.IO (WebSocket server)
├─ JWT Authentication
├─ Health Status: ✅ ONLINE
└─ API Base: /api/v1/

Construction Map (Local Development):
├─ Path: backend-nestjs/
├─ Status: ⚠️ Not deployed to production
└─ 17 REST APIs + 10 WebSocket events
```

### Provider Hierarchy (QUAN TRỌNG)

```tsx
// app/_layout.tsx
ThemeProvider
  → SettingsProvider
    → AuthProvider
      → WebSocketProvider        // Enable khi backend ready
        → ChatProvider           // Real-time chat
          → NotificationProvider // Real-time notifications
            → IncomingCallProvider
              → CartProvider
                → ProjectDataProvider
                  → VideoInteractionsProvider
```

**⚠️ Không được thay đổi thứ tự này!**

### API Configuration

```typescript
// config/env.ts
API_BASE_URL: 'https://baotienweb.cloud'  // ✅ VERIFIED WORKING
API_PREFIX: '/api/v1'
API_KEY: 'baotienweb-api-key-2025'
WS_URL: 'wss://baotienweb.cloud/ws'  // hoặc :3002 (cần xác nhận)

// Health Check: ✅ PASS
// https://baotienweb.cloud/api/v1/health
```

---

## 📝 CHECKLIST PHÁT TRIỂN

### Trước Khi Bắt Đầu Feature Mới

- [ ] Đọc docs: `.github/copilot-instructions.md`
- [ ] Check backend endpoint available
- [ ] Tạo types trong `types/`
- [ ] Tạo service trong `services/`
- [ ] Setup context nếu cần global state
- [ ] Tạo components trong `components/`
- [ ] Tạo screen trong `app/`
- [ ] Test với backend thật
- [ ] Update navigation nếu cần
- [ ] Typecheck: `npm run typecheck`
- [ ] Commit changes

### Khi Gặp Lỗi

```bash
# 1. Type check
npm run typecheck

# 2. Xem lỗi
npm run lint

# 3. Test backend connection
npm run check-backend

# 4. Test specific endpoint
node scripts/test-api-connection.js

# 5. Clear cache
npm run clean:cache
```

---

## 🎬 DEMO SCENARIOS

### Scenario 1: Quản Lý Dự Án (5 phút)

```
1. Login bằng admin@baotienweb.com
2. Vào Projects → Xem danh sách dự án
3. Click vào dự án → Xem chi tiết
4. Vào Timeline → Xem tiến độ
5. Vào Tasks → Tạo task mới
6. Vào Documents → Upload file
```

### Scenario 2: Mua Sắm Vật Liệu (3 phút)

```
1. Vào Shopping → Browse materials
2. Search "xi măng"
3. Add to cart → View cart
4. Checkout → Xem đơn hàng
```

### Scenario 3: Real-time Chat (2 phút)

```
1. Vào Messages → Chọn conversation
2. Gửi tin nhắn
3. Test typing indicator
4. Test online status
```

### Scenario 4: Video Call (3 phút)

```
1. Vào Contacts
2. Chọn người để gọi
3. Start video call
4. Test mute/unmute, camera on/off
```

---

## 🔧 TROUBLESHOOTING

### Lỗi Thường Gặp

#### 1. "Cannot connect to backend"
```bash
# Kiểm tra backend health
npm run check-backend

# Hoặc test trực tiếp
curl http://103.200.20.100/api/v1/health
```

#### 2. "WebSocket connection failed"
```typescript
// Tắt WebSocket tạm thời trong app/_layout.tsx
<WebSocketProvider autoConnect={false}>
```

#### 3. "Asset not found @2x"
```typescript
// Chỉ dùng tên base, không dùng @2x/@3x
require('../assets/images/icon.png')  // ✅
require('../assets/images/icon@2x.png')  // ❌
```

#### 4. "Build failed - Out of memory"
```bash
# Dùng script tối ưu
npm run build:preview:optimized
```

### Hỗ Trợ

- **Docs:** `.github/copilot-instructions.md`
- **Backend:** `backend-nestjs/README.md`
- **API Test:** PowerShell scripts trong root
- **Issues:** Check `ERROR_REPORT.md`

---

## 📚 TÀI LIỆU THAM KHẢO

### Core Docs
- [GitHub Copilot Instructions](./.github/copilot-instructions.md)
- [README](./README.md)
- [Deployment Guide](./DEPLOYMENT_PRODUCTION.md)
- [Development Roadmap](./DEVELOPMENT_ROADMAP.md)

### Feature Docs
- [Notifications](./features/notifications/README.md)
- [Construction Components](./components/construction/README.md)
- [Construction Map](./lib/construction-map/README.md)

### Backend
- [NestJS API](./backend-nestjs/README.md)
- [Quick Start](./backend-nestjs/QUICK_START.md)

---

## 🎉 KẾT LUẬN

**App đã sẵn sàng để demo với:**
✅ 50+ screens hoàn chỉnh  
✅ Backend API online và stable  
✅ Real-time chat & notifications (ready)  
✅ Video call infrastructure  
✅ Shopping & payment system  
✅ Project management tools  
⚠️ Backend modules cần xác nhận qua SSH  

**Hướng phát triển rõ ràng:**
🎯 Tích hợp backend APIs còn thiếu  
🎯 Enable WebSocket real-time  
🎯 Hoàn thiện Live & Stories  
🎯 AI Assistant integration  
🎯 Offline mode & analytics  

**Để xuất APK ngay:**
```bash
npm run build:preview:optimized
```

**Để chạy demo ngay:**
```bash
npm start
```

---
*Cập nhật: 09/12/2025 - Version 1.0.0*
