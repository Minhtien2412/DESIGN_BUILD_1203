# 📋 TODO - KẾ HOẠCH HOÀN THIỆN APP XÂY DỰNG

> **Bắt đầu:** 25/12/2024  
> **Mục tiêu:** Hoàn thiện 100% giao diện + Backend deploy  
> **Ưu tiên:** Auth → Core Features → Enhancement → Deploy

---

## 🎯 PHASE 1: AUTHENTICATION (Ưu tiên cao nhất)

### 1.1 Đăng nhập/Đăng ký - Frontend
- [ ] **Login Screen Enhancement**
  - [ ] Cập nhật UI giống Shopee style
  - [ ] Thêm social login buttons (Google, Facebook, Apple)
  - [ ] Thêm remember me checkbox
  - [ ] Loading state khi đang xác thực
  - [ ] Error handling với toast message
  
- [ ] **Register Screen Enhancement**
  - [ ] Multi-step registration form
  - [ ] Phone number verification (OTP)
  - [ ] Email verification
  - [ ] Password strength indicator
  - [ ] Terms & Conditions checkbox
  
- [ ] **Forgot/Reset Password**
  - [ ] Verify email/phone flow
  - [ ] OTP verification screen
  - [ ] New password form với validation

### 1.2 Đăng nhập/Đăng ký - Backend Integration
- [ ] **Auth API Connection**
  - [ ] Connect POST /auth/login
  - [ ] Connect POST /auth/register
  - [ ] Connect POST /auth/refresh-token
  - [ ] Connect POST /auth/logout
  - [ ] Connect POST /auth/verify-otp
  - [ ] Connect POST /auth/resend-otp
  
- [ ] **Token Management**
  - [ ] Lưu access token vào SecureStore
  - [ ] Lưu refresh token vào SecureStore
  - [ ] Auto refresh token khi expired
  - [ ] Clear tokens on logout

### 1.3 Auth Context Enhancement
- [ ] Cập nhật AuthContext với full user info
- [ ] Thêm isAuthenticated state
- [ ] Thêm userRole state (user/employee/admin)
- [ ] Protected routes based on role
- [ ] Redirect logic after login

---

## 🎯 PHASE 2: CORE FEATURES

### 2.1 Profile Module (`/profile`)
- [ ] **/profile/edit** - Chỉnh sửa hồ sơ
  - [ ] Avatar upload
  - [ ] Form thông tin cá nhân
  - [ ] Validation
  - [ ] API connection
  
- [ ] **/profile/settings** - Cài đặt
  - [ ] Theme toggle (dark/light)
  - [ ] Language switch
  - [ ] Notification preferences
  - [ ] Privacy settings
  
- [ ] **/profile/orders** - Đơn hàng của tôi
  - [ ] Order list với filter
  - [ ] Order detail
  - [ ] Order tracking
  - [ ] Cancel order
  
- [ ] **/profile/favorites** - Yêu thích
  - [ ] List sản phẩm yêu thích
  - [ ] List thợ yêu thích
  - [ ] Remove from favorites
  
- [ ] **/profile/addresses** - Địa chỉ
  - [ ] Address list
  - [ ] Add new address
  - [ ] Edit/Delete address
  - [ ] Set default address
  
- [ ] **/profile/payment** - Thanh toán
  - [ ] Payment methods list
  - [ ] Add bank card
  - [ ] Add e-wallet
  - [ ] Remove payment method

### 2.2 Finishing Module Enhancement
- [ ] **/finishing/lam-cua** - Dùng CategoryWorkerList shared UI
- [ ] **/finishing/lan-can** - Dùng CategoryWorkerList shared UI
- [ ] **/finishing/camera** - Cập nhật với shared UI
- [ ] **/finishing/tho-tong-hop** - Cập nhật với shared UI
- [ ] **/finishing/project-detail/[id]** - Tạo mới trang chi tiết dự án
- [ ] Bổ sung data workers cho tất cả categories

### 2.3 Shopping Module Enhancement
- [ ] Connect shopping với backend API
- [ ] Real-time inventory check
- [ ] Product reviews từ backend
- [ ] Wishlist sync với backend
- [ ] Order placement flow complete

### 2.4 Communication Module
- [ ] **/messages** - Real-time chat với Socket.IO
- [ ] **/call** - Video call integration
- [ ] **/meet** - Meeting room features
- [ ] Push notifications

---

## 🎯 PHASE 3: BACKEND DEPLOYMENT

### 3.1 Backend Preparation
- [ ] Review tất cả API endpoints
- [ ] Add missing endpoints
- [ ] API documentation (Swagger)
- [ ] Error handling standardization
- [ ] Rate limiting
- [ ] CORS configuration

### 3.2 Database
- [ ] Review database schema
- [ ] Add missing tables/columns
- [ ] Database migrations
- [ ] Seed data
- [ ] Backup strategy

### 3.3 VPS Deployment
- [ ] SSH access configuration
- [ ] PM2 setup for NestJS
- [ ] Nginx reverse proxy
- [ ] SSL certificate (Let's Encrypt)
- [ ] Environment variables
- [ ] Log rotation
- [ ] Monitoring (PM2 monitor)

### 3.4 CI/CD (Optional)
- [ ] GitHub Actions setup
- [ ] Auto deploy on push
- [ ] Health check endpoint
- [ ] Rollback strategy

---

## 🎯 PHASE 4: UI/UX ENHANCEMENT

### 4.1 Consistent UI Components
- [ ] Button component variants
- [ ] Input component variants
- [ ] Card component variants
- [ ] Modal component variants
- [ ] Loading states
- [ ] Empty states
- [ ] Error states

### 4.2 Animations
- [ ] Page transitions
- [ ] List item animations
- [ ] Button press feedback
- [ ] Pull-to-refresh
- [ ] Skeleton loading

### 4.3 Accessibility
- [ ] Screen reader support
- [ ] Font scaling
- [ ] Color contrast
- [ ] Touch target sizes

---

## 🎯 PHASE 5: ADVANCED FEATURES

### 5.1 AI Integration
- [ ] AI chat assistant
- [ ] AI cost estimation
- [ ] AI design suggestions
- [ ] AI contractor matching

### 5.2 Live Features
- [ ] Live streaming
- [ ] Live shopping
- [ ] Live consultation

### 5.3 Social Features
- [ ] User reviews
- [ ] Contractor portfolio
- [ ] Project showcase
- [ ] Community forum

---

## 📊 TIẾN ĐỘ THEO DÕI

| Phase | Progress | Target Date |
|-------|----------|-------------|
| Phase 1: Auth | 0% | Week 1-2 |
| Phase 2: Core | 0% | Week 2-4 |
| Phase 3: Backend | 0% | Week 4-5 |
| Phase 4: UI/UX | 0% | Week 5-6 |
| Phase 5: Advanced | 0% | Week 6+ |

---

## 🚀 HÀNH ĐỘNG TIẾP THEO

### Ngay bây giờ (Today):
1. ✅ Hoàn thành sơ đồ cấu trúc app
2. ⬜ Bắt đầu Phase 1.1 - Login Screen Enhancement
3. ⬜ Review backend auth endpoints

### Tuần này:
1. ⬜ Hoàn thành Login/Register UI
2. ⬜ Connect auth API
3. ⬜ Test auth flow end-to-end

### Tuần sau:
1. ⬜ Profile module
2. ⬜ Finishing module shared UI
3. ⬜ Shopping API integration

---

## 📝 GHI CHÚ

### VPS Access (Pending user approval):
```
Host: baotienweb.cloud
Port: 22
User: root
Password: [PENDING]
```

### Commands để deploy:
```bash
# SSH to VPS
ssh root@baotienweb.cloud

# Navigate to backend
cd /var/www/backend

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart PM2
pm2 restart all
```

### Troubleshooting:
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs

# Check nginx
systemctl status nginx

# Check PostgreSQL
systemctl status postgresql
```

---

*Cập nhật TODO này sau mỗi session làm việc*
