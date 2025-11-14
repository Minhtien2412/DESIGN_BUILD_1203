# ✅ CHECKLIST HOÀN THIỆN DỰ ÁN - DAILY TRACKER

📅 **Cập nhật:** 12/11/2025  
🎯 **Target:** Production-ready trong 3-4 tuần  
📊 **Tiến độ tổng thể:** **72%**

---

## 🔥 CRITICAL - Phải làm NGAY (Tuần này)

### Backend Stability
- [ ] **SSH vào VPS kiểm tra PostgreSQL**
  ```bash
  ssh root@103.200.20.100
  systemctl status postgresql
  systemctl restart postgresql
  curl https://api.thietkeresort.com.vn/health
  # Kỳ vọng: "database": "connected"
  ```
- [ ] **Verify DATABASE_URL trong backend .env**
- [ ] **Test tất cả API endpoints** (chạy `node scripts/smoke-api.js`)

### Code Quality
- [ ] **Fix TypeScript errors: 201 → 0**
  - Chạy: `npm run typecheck > ts-errors.txt`
  - Fix top 20 files có nhiều lỗi nhất
  - Fix remaining errors
  - Target: 0 errors
  
- [ ] **Remove console.log** trong production code
  ```bash
  # Find all console.log
  grep -r "console.log" app/ components/ services/
  ```

- [ ] **Add error boundaries** ở mọi route
  - Wrap root layout
  - Wrap tab screens
  - Wrap complex screens

---

## 🟠 HIGH PRIORITY - Tuần 1-2

### Testing Foundation
- [ ] **Setup Jest + React Testing Library**
  ```bash
  npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
  ```
  
- [ ] **Write 10 critical tests**
  - [ ] `components/ui/button.test.tsx`
  - [ ] `components/ui/input.test.tsx`
  - [ ] `hooks/useAuth.test.ts`
  - [ ] `services/api.test.ts`
  - [ ] `context/AuthContext.test.tsx`
  - [ ] `context/CartContext.test.tsx`
  - [ ] `utils/storage.test.ts`
  - [ ] `app/(auth)/login.test.tsx`
  - [ ] `app/cart/index.test.tsx`
  - [ ] `app/checkout/index.test.tsx`

### Error Handling
- [ ] **Loading states đầy đủ**
  - [ ] Auth screens (login, register)
  - [ ] Project create/update
  - [ ] Checkout flow
  - [ ] Profile updates
  
- [ ] **Empty states**
  - [ ] Cart empty
  - [ ] No projects
  - [ ] No notifications
  - [ ] No messages
  
- [ ] **Error states**
  - [ ] Network errors
  - [ ] Validation errors
  - [ ] API errors (4xx, 5xx)
  - [ ] Permission denied

### UI Polish
- [ ] **Add Skeleton loaders**
  - [ ] Project list
  - [ ] Product list
  - [ ] Notifications
  - [ ] Profile screen
  
- [ ] **Toast/Snackbar component**
  - Create `components/ui/toast.tsx`
  - Success, Error, Info, Warning variants
  - Auto-dismiss after 3s
  
- [ ] **Bottom Sheet component**
  - Create `components/ui/bottom-sheet.tsx`
  - Use for filters, options, confirmations

---

## 🟡 MEDIUM - Tuần 2-3

### Features Completion

#### Projects Module
- [ ] **Delete project** - wire API call
- [ ] **Filter projects** (status, type, date)
- [ ] **Sort projects** (date, budget, name)
- [ ] **Task creation** form
- [ ] **Task assignment** to users
- [ ] **Real PDF viewer** cho quotations

#### Shopping Module
- [ ] **Backend integration** for products
  - [ ] GET /api/products
  - [ ] GET /api/products/:id
  - [ ] Product images from CDN
  
- [ ] **Search products**
- [ ] **Filter by price, category**
- [ ] **Payment gateway** (VNPay/Momo)
  - [ ] VNPay SDK integration
  - [ ] Payment callback handling
  - [ ] Order confirmation
  
- [ ] **Order tracking**

#### Chat & Notifications
- [ ] **WebSocket integration**
  - [ ] Connect to wss://api.thietkeresort.com.vn/ws
  - [ ] Handle connection states
  - [ ] Auto-reconnect logic
  
- [ ] **Real-time chat**
  - [ ] Send message via WebSocket
  - [ ] Receive messages
  - [ ] Typing indicator
  - [ ] Message delivery status
  
- [ ] **Push notifications**
  - [ ] FCM setup (backend)
  - [ ] Register device token
  - [ ] Handle notification tap
  - [ ] Background notifications

#### Video Call
- [ ] **LiveKit integration**
  - [ ] Create room API
  - [ ] Join room
  - [ ] Camera/mic toggle
  - [ ] End call
  
- [ ] **Call history**
- [ ] **Contact selection**

### Performance
- [ ] **Code splitting**
  - [ ] Lazy load screens
  - [ ] Dynamic imports for heavy libs
  
- [ ] **Image optimization**
  - [ ] Compress images
  - [ ] Use expo-image
  - [ ] Implement lazy loading
  
- [ ] **Request caching**
  - [ ] Install React Query
  - [ ] Cache GET requests
  - [ ] Invalidate on mutations
  
- [ ] **Bundle analysis**
  ```bash
  npx react-native-bundle-visualizer
  ```

---

## 🟢 NICE TO HAVE - Tuần 3-4

### Advanced Features
- [ ] **Offline mode**
  - [ ] Detect network status
  - [ ] Show offline banner
  - [ ] Queue mutations
  - [ ] Sync on reconnect
  
- [ ] **Dark mode**
  - [ ] Theme provider
  - [ ] Dark color palette
  - [ ] User preference toggle
  
- [ ] **Internationalization**
  - [ ] i18next setup
  - [ ] Vietnamese translations
  - [ ] English translations
  - [ ] Language switcher
  
- [ ] **Onboarding**
  - [ ] Welcome screens (3-5)
  - [ ] Feature highlights
  - [ ] Skip option
  - [ ] Don't show again

### Analytics & Monitoring
- [ ] **Analytics setup**
  - [ ] Firebase Analytics
  - [ ] Screen tracking
  - [ ] Event tracking
  - [ ] User properties
  
- [ ] **Error monitoring**
  - [ ] Sentry setup
  - [ ] Source maps upload
  - [ ] User context
  - [ ] Breadcrumbs
  
- [ ] **Performance monitoring**
  - [ ] App launch time
  - [ ] Screen render time
  - [ ] API response time
  - [ ] Memory usage

### Accessibility
- [ ] **Screen reader support**
  - [ ] Accessibility labels
  - [ ] Hints and roles
  - [ ] Focus order
  
- [ ] **Visual accessibility**
  - [ ] Color contrast check (WCAG AA)
  - [ ] Font scaling support
  - [ ] Touch target sizes
  
- [ ] **Other**
  - [ ] Haptic feedback
  - [ ] Reduce motion support

---

## 🚀 PRE-PRODUCTION CHECKLIST

### Build & Deploy
- [ ] **Development build**
  ```bash
  npm run build:dev:android
  # Test trên device thật
  ```
  
- [ ] **Production build**
  ```bash
  npm run build:production
  # APK size <50MB
  ```
  
- [ ] **App signing**
  - [ ] Generate keystore
  - [ ] Configure app signing
  - [ ] Test signed APK

### Quality Gates
- [ ] **Zero TypeScript errors** ✅
- [ ] **Unit test coverage >70%**
- [ ] **E2E tests pass** (login, checkout, project create)
- [ ] **Performance benchmarks**
  - [ ] Cold start <3s
  - [ ] FPS >55
  - [ ] Bundle size <20MB
  
- [ ] **Security audit**
  ```bash
  npm audit --production
  # Fix all HIGH/CRITICAL vulnerabilities
  ```
  
- [ ] **Accessibility audit** (basic)

### Store Preparation
- [ ] **App metadata**
  - [ ] App name, description (Vietnamese)
  - [ ] App name, description (English)
  - [ ] Keywords
  - [ ] Category
  
- [ ] **Screenshots** (Android)
  - [ ] 5 screenshots per screen size
  - [ ] Feature graphic
  - [ ] App icon
  
- [ ] **Legal**
  - [ ] Privacy policy URL
  - [ ] Terms of service URL
  - [ ] Support email
  - [ ] Website URL

---

## 📊 METRICS DASHBOARD

### Code Quality
```
TypeScript Errors:   201 / 0     ⚠️  CRITICAL
Test Coverage:       0% / 70%    ❌ NONE
Lint Warnings:       ?? / 0      ⏳ CHECK
Bundle Size:         ??MB / 50MB ⏳ PENDING
```

### Features Status
```
✅ Completed:        72%
🔶 In Progress:      15%
❌ Not Started:      13%

Core Features:       90%  ✅
Advanced Features:   30%  🔶
Testing:             0%   ❌
Performance:         30%  🔶
```

### Backend Health
```
API Server:          ✅ Running
Database:            ❌ Disconnected
WebSocket:           ⏳ Not tested
Push Notifications:  ⏳ Not configured
```

---

## 🎯 WEEKLY GOALS

### Week 1 (Hiện tại)
- [x] ~~Database connection check~~ (FOUND: disconnected)
- [ ] Fix PostgreSQL
- [ ] Fix top 50 TypeScript errors
- [ ] Add error boundaries
- [ ] Setup Jest

**Target:** Backend stable + 150 TS errors fixed

### Week 2
- [ ] Complete testing setup
- [ ] Write 10 critical tests
- [ ] Fix remaining TS errors
- [ ] Add skeleton loaders
- [ ] Implement toast component

**Target:** 0 TS errors + 10 tests passing

### Week 3
- [ ] WebSocket integration
- [ ] Push notifications
- [ ] Payment gateway
- [ ] Performance optimization
- [ ] Code splitting

**Target:** Core features 100%

### Week 4
- [ ] Production build
- [ ] Security audit
- [ ] Performance audit
- [ ] Store metadata
- [ ] Beta testing

**Target:** Production-ready

---

## ⚡ QUICK COMMANDS

### Development
```bash
# Start dev server
npm start

# Type check
npm run typecheck

# Lint
npm run lint

# Test (khi setup xong)
npm test

# Build dev
npm run build:dev:android
```

### Backend Health Check
```bash
# Smoke test
node scripts/smoke-api.js

# Check database
curl -H "X-API-Key: thietke-resort-api-key-2024" \
  https://api.thietkeresort.com.vn/health
```

### Deployment
```bash
# Preview build
npm run build:preview

# Production build
npm run build:production
```

---

## 📞 SUPPORT

**Vấn đề gấp:**
1. Database disconnected → SSH vào VPS restart PostgreSQL
2. TypeScript errors → Chạy `npm run typecheck`, fix từng file
3. Build failed → Check bundle size, exclude videos
4. App crash → Check error boundaries, logs

**Tài liệu:**
- `PROGRESS_REPORT.md` - Báo cáo chi tiết
- `docs/SECURITY_DATABASE_ACCESS.md` - Security guide
- `.github/copilot-instructions.md` - AI assistant guide

---

**🎯 Mục tiêu tuần này:** Fix backend database + Giảm TypeScript errors xuống <100

_Last updated: 12/11/2025_
