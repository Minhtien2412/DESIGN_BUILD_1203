# 🏠 Module Bảo Trì Nhà - Home Maintenance Services

## Tổng quan

Module này cung cấp dịch vụ bảo trì nhà với AI Chat Support sử dụng Google Gemini.

## 📁 Cấu trúc Files

```
services/api/
├── homeMaintenanceApi.ts    # API cho categories, workers, bookings
└── geminiService.ts         # AI Chat với Google Gemini

components/home-maintenance/
├── ServiceCategoryItem.tsx  # UI item danh mục dịch vụ
├── ServiceWorkerItem.tsx    # UI item thợ (card/list/compact)
├── SupportChat.tsx          # Modal AI Chat
└── index.ts                 # Exports

app/services/home-maintenance/
├── index.tsx                # Màn hình chính
├── worker/[id].tsx          # Chi tiết thợ
└── category/[id].tsx        # Danh sách thợ theo danh mục
```

## 🎯 Tính năng

### 1. **Danh mục dịch vụ**
- ⚡ Sửa điện (Electrical)
- 🚰 Sửa nước (Plumbing)  
- 📹 Lắp camera (Camera Installation)
- 📶 Sửa WiFi (WiFi)
- ❄️ Điều hòa (AC Service)
- 🔧 Sửa chữa chung (General Repair)
- 🛡️ Bảo vệ an ninh (Security)
- 🏠 Dọn dẹp nhà (House Cleaning)
- 🌿 Chăm sóc cây (Garden Care)

### 2. **Thợ dịch vụ**
- Hồ sơ chi tiết với rating, reviews
- Phạm vi giá dịch vụ
- Các dịch vụ cung cấp
- Liên hệ trực tiếp (gọi/nhắn tin)
- Đặt lịch online

### 3. **AI Support Chat** 🤖
- Hỗ trợ qua Google Gemini AI
- Tư vấn dịch vụ phù hợp
- Giải đáp thắc mắc 24/7
- Gợi ý nhanh (Quick Suggestions)

## 🔧 Cấu hình

### Gemini API Key

Thêm vào `.env` hoặc `app.config.ts`:

```bash
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**Lưu ý:** Nếu không có API key, app sẽ sử dụng mock responses.

### Lấy Gemini API Key
1. Truy cập [Google AI Studio](https://makersuite.google.com/)
2. Tạo API Key mới
3. Copy và paste vào file `.env`

## 🚀 Sử dụng

### Truy cập module từ Home Screen
- Nhấn vào **"Bảo trì nhà"** hoặc **"Sửa điện nước"** trong phần Dịch vụ

### Navigation Routes
```typescript
// Trang chính
router.push('/services/home-maintenance')

// Chi tiết worker  
router.push('/services/home-maintenance/worker/worker-1')

// Danh sách theo category
router.push('/services/home-maintenance/category/electrical')
```

## 📱 Screenshots

### Main Screen
- Hero banner với gradient
- Stats: Thợ online, Đánh giá, Đặt lịch hôm nay
- Grid 9 danh mục dịch vụ
- Featured workers horizontal scroll
- Quick actions: Hotline, Booking, History, Support
- Floating AI Chat button

### Worker Detail
- Avatar và thông tin cơ bản
- Rating stars và số đánh giá
- Stats: Kinh nghiệm, Hoàn thành, Rating
- Danh sách dịch vụ
- Reviews từ khách hàng
- Nút Gọi / Nhắn tin / Đặt lịch

### AI Chat Modal
- Slide-in animation
- Message bubbles (user/AI)
- Quick suggestion buttons
- Typing indicator
- Auto-scroll to latest

## 🔗 API Endpoints (Mock Data)

```typescript
// Categories
homeMaintenanceApi.getCategories()

// Workers
homeMaintenanceApi.getWorkers(categoryId?)
homeMaintenanceApi.getWorkerById(id)

// Bookings
homeMaintenanceApi.createBooking(data)
homeMaintenanceApi.getMyBookings()
```

## 📝 Types

```typescript
interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  isHot?: boolean;
}

interface ServiceWorker {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  experience: string;
  completedJobs: number;
  priceRange: string;
  phone?: string;
  bio?: string;
  services: string[];
  reviews: WorkerReview[];
}

interface ServiceBooking {
  id: string;
  workerId: string;
  categoryId: string;
  date: string;
  time: string;
  address: string;
  note?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}
```

## ⚠️ Lưu ý

1. **GEMINI_API_KEY** cần được thiết lập để AI Chat hoạt động với responses thực
2. Hiện tại sử dụng **mock data** - cần integrate với backend thực
3. Router routes cần được khai báo trong Expo Router để type-safe

## 🔮 Roadmap

- [ ] Integrate real backend API
- [ ] Payment integration (VNPay, MoMo)
- [ ] Push notifications cho booking
- [ ] Worker rating & review system
- [ ] Location-based worker search
- [ ] Booking history & re-book
- [ ] Loyalty points system

---

*Created: 2025-06-06*
