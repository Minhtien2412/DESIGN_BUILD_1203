# 📊 BÁO CÁO KIỂM TRA API - 16/01/2026

## ✅ API HOẠT ĐỘNG TỐT (12/14 tested)

| # | API | Status | Ghi chú |
|---|-----|--------|---------|
| 1 | **Backend API** | ✅ OK | baotienweb.cloud health check passed |
| 2 | **Pexels API** | ✅ OK | 8000+ kết quả tìm kiếm |
| 3 | **GNews API** | ✅ OK | 19,792 articles |
| 4 | **Visual Crossing Weather** | ✅ OK | Dữ liệu thời tiết Hanoi |
| 5 | **ExchangeRate API** | ✅ OK | 1 USD = 26,194 VND |
| 6 | **OpenAI API** | ✅ OK | 112 models available |
| 7 | **Gemini API** | ✅ OK | 50 models available |
| 8 | **Stripe API** | ✅ OK | Test mode balance |
| 9 | **Zalo Backend** | ✅ OK | zaloApp, zns, otp configured |
| 10 | **Pinecone API** | ✅ OK | 1 index (designbuild) |
| 11 | **Mapbox API** | ✅ OK | Geocoding working |
| 12 | **GetOTP** | ✅ OK | API key hợp lệ |

---

## ⚠️ API CẦN SỬA (2)

### 1. Google Maps API - REQUEST_DENIED
**Vấn đề**: Geocoding API chưa được enable hoặc API key bị restrict

**Giải pháp**:
1. Vào [Google Cloud Console](https://console.cloud.google.com/apis/library)
2. Enable các API:
   - Geocoding API
   - Maps JavaScript API
   - Places API
3. Hoặc tạo API key mới không có restriction

**Key hiện tại**: `AIzaSyDQHkLmnci6Xf2smaszFWvk2A1qOOtg59M`

---

### 2. Perfex CRM API - 404 Not Found
**Vấn đề**: API endpoint đã thay đổi hoặc module API chưa enable

**Giải pháp**:
1. Đăng nhập Perfex CRM Admin: https://thietkeresort.com.vn/perfex_crm/admin
2. Vào Setup → Settings → Enable REST API
3. Kiểm tra endpoint đúng: `/perfex_crm/api/` (có trailing slash)
4. Regenerate API token nếu cần

**Token hiện tại**: `eyJ0eXAiOiJKV1Q...` (JWT valid)

---

## ❌ API CHƯA CẤU HÌNH (placeholders)

Các API sau đang dùng placeholder, cần đăng ký và cập nhật:

### Weather (Backup options)
- `OPENWEATHERMAP_API_KEY` - [Đăng ký miễn phí](https://openweathermap.org/api)
- `WEATHERAPI_KEY` - [Đăng ký miễn phí](https://www.weatherapi.com/)

### News (Backup options)  
- `NEWSAPI_KEY` - [Đăng ký miễn phí](https://newsapi.org/)

### Vietnam Maps
- `GOONG_API_KEY` - [Đăng ký](https://goong.io/) - Tốt cho VN

### Payment Gateways (Cần thiết cho thanh toán)
- `VNPAY_TMN_CODE` / `VNPAY_HASH_SECRET` - [Đăng ký](https://sandbox.vnpayment.vn)
- `MOMO_PARTNER_CODE` - [Đăng ký](https://developers.momo.vn)
- `ZALOPAY_APP_ID` - [Đăng ký](https://docs.zalopay.vn)

### Firebase (Push notifications)
- `FIREBASE_API_KEY` - [Console](https://console.firebase.google.com)
- `FCM_SERVER_KEY` - Cần cho push notifications

### Cloud Storage
- `CLOUDINARY_CLOUD_NAME` - [Đăng ký miễn phí](https://cloudinary.com)
- `AWS_ACCESS_KEY_ID` - [AWS Console](https://aws.amazon.com)
- `SUPABASE_URL` - [Đăng ký miễn phí](https://supabase.com)

### Email Services
- `SENDGRID_API_KEY` - [Đăng ký miễn phí](https://sendgrid.com)
- `RESEND_API_KEY` - [Đăng ký miễn phí](https://resend.com)

### Real-time Communication
- `LIVEKIT_API_KEY` - [Đăng ký](https://livekit.io)
- `AGORA_APP_ID` - [Đăng ký miễn phí](https://www.agora.io)
- `PUSHER_KEY` - [Đăng ký miễn phí](https://pusher.com)

### Search
- `ALGOLIA_APP_ID` - [Đăng ký miễn phí](https://www.algolia.com)

### Social
- `TIKTOK_CLIENT_KEY` - [Đăng ký](https://developers.tiktok.com)
- `FACEBOOK_APP_ID` - [Đăng ký](https://developers.facebook.com)

---

## 🔧 API ĐÃ CẤU HÌNH NHƯNG KHÔNG DÙNG

Các API sau đã có key nhưng app chưa implement:
- **Autodesk BIM 360** - Dùng cho 3D/BIM viewers
- **Procore** - Construction management (đã có cả Production + Sandbox)
- **StringeeX** - Vietnam SMS/Voice (backup cho GetOTP)
- **Cohere** - AI embeddings (backup cho OpenAI)
- **Anthropic Claude** - AI (chưa có key)

---

## 📋 KHUYẾN NGHỊ ƯU TIÊN

### Cần làm ngay:
1. ✅ Enable Google Maps Geocoding API
2. ✅ Kiểm tra Perfex CRM API module
3. 🔶 Đăng ký VNPay sandbox (cho thanh toán)
4. 🔶 Cấu hình Firebase (cho push notifications)

### Có thể làm sau:
5. Đăng ký Cloudinary (upload ảnh)
6. Đăng ký Goong Maps (maps VN tốt hơn)
7. Đăng ký SendGrid (email transactional)

---

## 📌 LƯU Ý QUAN TRỌNG

### Zalo OA Token
- **Status**: ⚠️ Refresh Token đã hết hạn
- **Action**: Cần lấy OA Access Token mới từ API Explorer
- **Xem**: [ZALO_TOKEN_GUIDE.md](BE-baotienweb.cloud/ZALO_TOKEN_GUIDE.md)

### API Keys Security
- Không commit `.env` lên git (đã có trong .gitignore)
- Các production keys nên để trong VPS `.env` riêng
- Test keys có prefix `sk_test_`, `sandbox`, etc.

---

*Báo cáo tạo tự động - 16/01/2026 10:45 AM*
