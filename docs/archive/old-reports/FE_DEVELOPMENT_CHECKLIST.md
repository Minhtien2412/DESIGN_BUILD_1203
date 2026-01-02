# 📋 Frontend Development Checklist - Trước Khi Deploy VPS

**Mục tiêu:** Hoàn thiện tất cả features, test đầy đủ trên **local backend** trước khi backup và deploy lên VPS production.

---

## 🎯 Chiến Lược Development

### Phase 1️⃣: Setup Local Backend (Môi trường mô phỏng VPS)
- [ ] **Task 1.1**: Chạy NestJS backend trên `localhost:3000`
  - `cd BE-baotienweb.cloud`
  - `npm install`
  - `npm run start:dev`
  - Verify: http://localhost:3000/api/v1/health

- [ ] **Task 1.2**: Configure Frontend để dùng local API
  - File: `services/api.ts`
  - Update: `const API_BASE_URL = 'http://localhost:3000/api/v1'`
  - Comment out production URL

- [ ] **Task 1.3**: Test Database Connection
  - PostgreSQL running on `localhost:5432`
  - Database: `postgres`
  - Run migrations: `npx prisma migrate dev`
  - Seed data: `npx prisma db seed` (nếu có)

---

## Phase 2️⃣: Hoàn Thiện Features Còn Thiếu

### 🔐 **Authentication & User Management**

#### ✅ Task 2.1: Signup với Role & Phone
**Files cần sửa:**
- `app/(auth)/auth-3d-flip.tsx` (line 151)
- `BE-baotienweb.cloud/src/auth/auth.service.ts`

**Yêu cầu:**
- [ ] Thêm dropdown chọn role (User, Contractor, Admin)
- [ ] Thêm input phone number với validation
- [ ] Update `signUp()` API call gửi `{ email, password, role, phone }`
- [ ] Backend lưu role + phone vào database
- [ ] Test: Đăng ký → Login → Verify profile có đúng role/phone

**Code snippet:**
```tsx
// app/(auth)/auth-3d-flip.tsx
const [role, setRole] = useState<'user' | 'contractor' | 'admin'>('user');
const [phone, setPhone] = useState('');

// In signUp function:
await signUp(email, password, role, phone);
```

---

### 🛍️ **E-commerce Features**

#### ✅ Task 2.2: Product Analytics & Management
**Files:**
- `app/profile/my-products.tsx` (lines 91-92, 152, 169, 185, 192)
- `app/admin/products.tsx` (lines 105-106, 191, 205, 236)

**Sub-tasks:**
- [ ] **2.2.1**: Create backend API `GET /products/:id/analytics`
  - Return: `{ sold: number, rating: number, views: number }`
  - Integrate vào `my-products.tsx` line 91-92

- [ ] **2.2.2**: Create backend API `PUT /products/:id`
  - Edit product (name, price, description, images)
  - Create screen: `app/profile/edit-product/[id].tsx`

- [ ] **2.2.3**: Create backend API `DELETE /products/:id`
  - Soft delete (status = 'deleted')
  - Add confirmation dialog

- [ ] **2.2.4**: Create backend API `PATCH /products/:id/approve`
  - Admin approval workflow
  - Change status: 'pending' → 'approved'

- [ ] **2.2.5**: Create backend API `PATCH /products/:id/reject`
  - Admin rejection with reason
  - Change status: 'pending' → 'rejected'

**Test Cases:**
- [ ] Create product → View in my-products → Edit → Delete
- [ ] Admin approve product → Product visible in catalog
- [ ] Admin reject product → Seller notified

---

#### ✅ Task 2.3: Product Create Screen
**File:** NEW - `app/profile/create-product.tsx`

**Requirements:**
- [ ] Form fields: name, description, price, category, images
- [ ] Image picker (multiple images)
- [ ] Category dropdown
- [ ] Price input with VND format
- [ ] Submit → `POST /api/v1/products`
- [ ] Success → Navigate to my-products

---

#### ✅ Task 2.4: Favorites Persistence
**Files:**
- `app/(tabs)/modern-home.tsx` (line 77)
- Backend: Create `favorites` module

**Sub-tasks:**
- [ ] Create backend API `POST /favorites/:productId`
- [ ] Create backend API `DELETE /favorites/:productId`
- [ ] Create backend API `GET /favorites` (list user's favorites)
- [ ] Update `handleFavorite` to call API instead of only local state
- [ ] Sync favorites on app startup

---

#### ✅ Task 2.5: Stock Management (Admin)
**File:** `app/admin/products.tsx` (line 236)

**Requirements:**
- [ ] Create screen: `app/admin/stock-management/[id].tsx`
- [ ] Show current stock level
- [ ] Add stock adjustment (+/-)
- [ ] Stock history log
- [ ] Low stock alerts
- [ ] Backend API: `PATCH /products/:id/stock`

---

### 🏗️ **Construction & Project Features**

#### ✅ Task 2.6: Project Gallery & Documents
**File:** `app/projects/[id]-new.tsx` (lines 189, 196)

**Sub-tasks:**
- [ ] **2.6.1**: Photo Gallery
  - Create: `app/projects/[id]/gallery.tsx`
  - Image picker integration
  - Grid view with lightbox
  - Upload API: `POST /projects/:id/photos`
  - Delete photo: `DELETE /photos/:photoId`

- [ ] **2.6.2**: Documents Management
  - Create: `app/projects/[id]/documents.tsx`
  - Document picker (PDF, DOCX, XLSX)
  - List view with file type icons
  - Upload API: `POST /projects/:id/documents`
  - Download/view document
  - Delete document: `DELETE /documents/:docId`

**Test Cases:**
- [ ] Upload 5 photos → View gallery → Delete 1 photo
- [ ] Upload PDF contract → Download → View in app
- [ ] Team members can view but only admin can delete

---

#### ✅ Task 2.7: Team Management - Add Member
**File:** `app/projects/[id]/team.tsx` (line 224)

**Requirements:**
- [ ] Create modal: `AddTeamMemberModal.tsx`
- [ ] Search users by email/name
- [ ] Select role: Manager, Engineer, Worker, Viewer
- [ ] Backend API: `POST /projects/:id/team`
- [ ] Real-time notification to invited user
- [ ] Accept/decline invitation flow

---

#### ✅ Task 2.8: PPE Project Context
**File:** `app/safety/ppe/index.migrated.tsx` (line 36)

**Requirements:**
- [ ] Get `projectId` from route params: `useLocalSearchParams<{ projectId: string }>()`
- [ ] Pass `projectId` to all PPE API calls
- [ ] Update: `distributions.tsx` line 284 (get user from auth)
- [ ] Remove all hardcoded 'project-1' references

---

### 🧮 **Services & Utilities**

#### ✅ Task 2.9: Design Calculator - Complete Missing Tools
**File:** `app/services/design-calculator.tsx` (line 146)

**Calculators cần implement:**

**2.9.1: Concrete Calculator**
```tsx
const calculateConcrete = () => {
  const volume = (dimensions.length * dimensions.width * dimensions.height) / 1000000; // m³
  const concreteNeeded = volume * 1.05; // +5% waste
  const bags = Math.ceil(concreteNeeded * 30); // 30 bags per m³
  const cost = bags * 180000; // 180k/bag
  
  setResults({
    volume: volume.toFixed(2),
    bags,
    cost,
    unit: 'm³'
  });
};
```

**2.9.2: Rebar Calculator**
```tsx
const calculateRebar = () => {
  const area = dimensions.length * dimensions.width;
  const spacing = 0.2; // 20cm spacing
  const lengthBars = Math.ceil(dimensions.width / spacing) * dimensions.length;
  const widthBars = Math.ceil(dimensions.length / spacing) * dimensions.width;
  const totalLength = lengthBars + widthBars;
  const weight = totalLength * 0.888; // kg (10mm rebar)
  const cost = weight * 18000; // 18k/kg
  
  setResults({
    length: totalLength.toFixed(2),
    weight: weight.toFixed(2),
    cost,
    unit: 'm'
  });
};
```

**2.9.3: Wood Calculator** (Formwork)
```tsx
const calculateWood = () => {
  const area = 2 * (dimensions.length * dimensions.height + dimensions.width * dimensions.height);
  const plywood = Math.ceil(area / 2.88); // 1.2m x 2.4m sheets
  const lumber = area * 3; // 3m lumber per m² of formwork
  const cost = (plywood * 350000) + (lumber * 25000);
  
  setResults({
    plywood,
    lumber: lumber.toFixed(2),
    cost,
    unit: 'sheets'
  });
};
```

**Sub-tasks:**
- [ ] Add calculator UI for each type
- [ ] Input validation (dimensions > 0)
- [ ] Results display with material breakdown
- [ ] Save calculation history (optional)
- [ ] Remove alert stub

---

### 📱 **Privacy & Settings**

#### ✅ Task 2.10: Privacy Settings Persistence
**File:** `app/profile/privacy.tsx` (line 54)

**Requirements:**
- [ ] Create backend API: `PUT /users/me/privacy-settings`
- [ ] Save settings: `{ showOnlineStatus, shareActivity, allowMessages, dataCollection }`
- [ ] Load settings on mount: `GET /users/me/privacy-settings`
- [ ] Success toast notification
- [ ] Error handling

---

## Phase 3️⃣: Local Testing (Mô phỏng VPS)

### 🧪 Test Suite 1: Authentication Flow
- [ ] **T1.1**: Đăng ký tài khoản mới (User role, +84 phone)
- [ ] **T1.2**: Login → Verify JWT token stored
- [ ] **T1.3**: Logout → Token cleared
- [ ] **T1.4**: Forgot password → Reset email sent
- [ ] **T1.5**: Change password → Old password invalid

### 🧪 Test Suite 2: E-commerce Flow
- [ ] **T2.1**: Browse products → Filter by category
- [ ] **T2.2**: Product detail → Add to cart (qty: 3)
- [ ] **T2.3**: Cart → Update qty → Remove item → Add another
- [ ] **T2.4**: Checkout → Fill address → Submit order
- [ ] **T2.5**: Order history → View order detail
- [ ] **T2.6**: My products → Create new product → Edit → Delete
- [ ] **T2.7**: Admin → Approve pending product
- [ ] **T2.8**: Favorite product → Remove favorite → Re-add

### 🧪 Test Suite 3: Construction Management
- [ ] **T3.1**: Create new project
- [ ] **T3.2**: Add team member (Engineer role)
- [ ] **T3.3**: Upload project photos (5 images)
- [ ] **T3.4**: Upload contract document (PDF)
- [ ] **T3.5**: Create material entry → Update stock
- [ ] **T3.6**: Add equipment → Assign to project
- [ ] **T3.7**: PPE distribution → Verify project context
- [ ] **T3.8**: Timeline → Create phase → Mark complete

### 🧪 Test Suite 4: WebSocket Real-time Features
- [ ] **T4.1**: Open 2 devices → Send message → Receive instantly
- [ ] **T4.2**: Progress update → All team members see change
- [ ] **T4.3**: Notification → Bell icon updates in real-time
- [ ] **T4.4**: Disconnect WiFi → Reconnect → Messages sync

### 🧪 Test Suite 5: Design Calculators
- [ ] **T5.1**: Paint calculator (room 4x3x2.8m) → Verify results
- [ ] **T5.2**: Tiles calculator (floor 10x8m) → Verify results
- [ ] **T5.3**: Concrete calculator (foundation 5x3x0.3m) → Verify results
- [ ] **T5.4**: Rebar calculator (slab 10x10m) → Verify results
- [ ] **T5.5**: Wood calculator (formwork 5x3x2m) → Verify results

### 🧪 Test Suite 6: Privacy & Settings
- [ ] **T6.1**: Toggle privacy settings → Save → Reload app → Verify persisted
- [ ] **T6.2**: Change profile info → Update avatar → Save
- [ ] **T6.3**: Add address → Set as default → Use in checkout

---

## Phase 4️⃣: Code Quality & Performance

### ✅ Code Review Checklist
- [ ] **C1**: Remove all `console.log()` (keep `console.error()` for prod)
- [ ] **C2**: Replace all hardcoded strings with i18n keys (future-proof)
- [ ] **C3**: Add error boundaries to critical screens
- [ ] **C4**: Loading states for all async operations
- [ ] **C5**: Empty states for all lists
- [ ] **C6**: Skeleton loaders for initial data fetch

### ✅ Performance Optimization
- [ ] **P1**: Image optimization (compress, resize before upload)
- [ ] **P2**: Lazy load images in lists (FlatList optimization)
- [ ] **P3**: Memoize expensive calculations
- [ ] **P4**: Debounce search inputs
- [ ] **P5**: Pagination for large lists (products, projects)

### ✅ Security Checklist
- [ ] **S1**: No sensitive data in logs
- [ ] **S2**: All API calls use HTTPS (production)
- [ ] **S3**: JWT tokens in SecureStore (not AsyncStorage)
- [ ] **S4**: Input sanitization (prevent XSS)
- [ ] **S5**: File upload size limits (max 10MB)
- [ ] **S6**: Rate limiting on sensitive endpoints

---

## Phase 5️⃣: Database & Backend Preparation

### ✅ Database Tasks
- [ ] **DB1**: Run all migrations on local DB
- [ ] **DB2**: Create seed data for testing:
  - 20 products across categories
  - 5 projects with different statuses
  - 10 users with different roles
  - 50 messages for chat testing
- [ ] **DB3**: Backup local database: `pg_dump postgres > local_backup.sql`
- [ ] **DB4**: Test database restore: `psql postgres < local_backup.sql`

### ✅ Backend API Documentation
- [ ] **API1**: Swagger docs complete for all endpoints
- [ ] **API2**: Test all endpoints in Postman/Thunder Client
- [ ] **API3**: Document error responses (400, 401, 403, 404, 500)
- [ ] **API4**: Rate limiting configured (100 req/min per IP)
- [ ] **API5**: CORS configured for production domain

---

## Phase 6️⃣: Pre-Deployment Backup

### ✅ Backup Checklist (Critical!)

**6.1 Database Backup**
```bash
# Local PostgreSQL
pg_dump -U postgres -d postgres -F c -b -v -f "backup_$(date +%Y%m%d_%H%M%S).dump"

# VPS PostgreSQL (before deployment)
ssh root@103.200.20.100 "pg_dump -U postgres postgres > /root/backup_production_$(date +%Y%m%d).sql"
```

**6.2 Backend Code Backup**
```bash
cd BE-baotienweb.cloud
git add .
git commit -m "Pre-deployment backup - $(date)"
git push origin main

# Create release tag
git tag -a v1.0.0 -m "Production release 1.0.0"
git push origin v1.0.0
```

**6.3 Frontend Code Backup**
```bash
cd APP_DESIGN_BUILD05.12.2025
git add .
git commit -m "Pre-deployment backup - $(date)"
git push origin main

# Create release tag
git tag -a v1.0.0 -m "Production release 1.0.0"
git push origin v1.0.0
```

**6.4 Environment Files Backup**
```bash
# Backend .env (encrypted backup)
cp BE-baotienweb.cloud/.env .env.production.backup
gpg -c .env.production.backup  # Encrypt with password

# Frontend config
cp services/api.ts services/api.production.backup.ts
```

**6.5 Uploads Folder Backup** (if any user uploads exist)
```bash
cd BE-baotienweb.cloud
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

**6.6 Documentation Backup**
- [ ] Copy all `*.md` files to Google Drive
- [ ] Export Swagger docs to JSON: `http://localhost:3000/api/docs-json`
- [ ] Screenshot app flows (10-15 key screens)

---

## Phase 7️⃣: VPS Deployment

### ✅ Pre-Deployment Verification
- [ ] **V1**: Health check works: `http://localhost:3000/api/v1/health`
- [ ] **V2**: WebSocket connects: `http://localhost:3000/socket.io/`
- [ ] **V3**: Database migrations applied: `npx prisma migrate status`
- [ ] **V4**: Build succeeds: `npm run build` (0 errors)
- [ ] **V5**: All tests pass (if you have tests)

### ✅ Deployment Steps
```powershell
# 1. Navigate to backend folder
cd C:\tien\APP_DESIGN_BUILD05.12.2025\BE-baotienweb.cloud

# 2. Final build
npm run build

# 3. Run deployment script
.\deploy-quick.ps1
# Enter SSH password when prompted: 6k4BOIRDwWhsM39F2DyM

# 4. Verify deployment
curl https://baotienweb.cloud/api/v1/health
```

### ✅ Post-Deployment Verification
- [ ] **PD1**: Health check: `https://baotienweb.cloud/api/v1/health`
- [ ] **PD2**: Swagger docs: `https://baotienweb.cloud/api/docs`
- [ ] **PD3**: WebSocket test from mobile app
- [ ] **PD4**: Login from mobile app (production API)
- [ ] **PD5**: Create test project (end-to-end)
- [ ] **PD6**: Monitor PM2 logs: `pm2 logs baotienweb-api`
- [ ] **PD7**: Check database connections: `pm2 monit`

### ✅ Rollback Plan (If Deployment Fails)
```bash
# SSH into VPS
ssh root@103.200.20.100

# Stop new version
pm2 stop baotienweb-api

# Restore backup
cd /root/baotienweb-api
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz

# Restore database
psql postgres < /root/backup_production_YYYYMMDD.sql

# Restart old version
pm2 restart baotienweb-api

# Verify health
curl http://localhost:3000/api/v1/health
```

---

## Phase 8️⃣: Frontend Production Config

### ✅ Update API URLs in Frontend
**File:** `services/api.ts`

```typescript
// Development (localhost backend)
// const API_BASE_URL = 'http://localhost:3000/api/v1';
// const WS_URL = 'http://localhost:3000';

// Production (VPS backend)
const API_BASE_URL = 'https://baotienweb.cloud/api/v1';
const WS_URL = 'https://baotienweb.cloud';
```

### ✅ Build Mobile App
```bash
# Android APK
eas build --platform android --profile preview

# iOS (if needed)
eas build --platform ios --profile preview
```

---

## 📊 Progress Tracking

### Overall Completion: 0%

| Phase | Tasks | Completed | Progress |
|-------|-------|-----------|----------|
| **Phase 1: Local Setup** | 3 | 0 | ⬜⬜⬜⬜⬜ 0% |
| **Phase 2: Feature Dev** | 10 | 0 | ⬜⬜⬜⬜⬜ 0% |
| **Phase 3: Testing** | 25 | 0 | ⬜⬜⬜⬜⬜ 0% |
| **Phase 4: Quality** | 16 | 0 | ⬜⬜⬜⬜⬜ 0% |
| **Phase 5: DB Prep** | 8 | 0 | ⬜⬜⬜⬜⬜ 0% |
| **Phase 6: Backup** | 12 | 0 | ⬜⬜⬜⬜⬜ 0% |
| **Phase 7: Deploy** | 13 | 0 | ⬜⬜⬜⬜⬜ 0% |
| **Phase 8: Prod Config** | 2 | 0 | ⬜⬜⬜⬜⬜ 0% |

**Total Tasks:** 89  
**Estimated Time:** 20-25 hours  
**Critical Path:** Phase 1 → Phase 2 → Phase 3 → Phase 6 → Phase 7

---

## 🚀 Quick Start Guide

### Bắt đầu ngay hôm nay:

**Step 1: Start Backend Locally** (10 phút)
```bash
cd BE-baotienweb.cloud
npm install
npx prisma migrate dev
npm run start:dev
```

**Step 2: Configure Frontend** (5 phút)
- Mở `services/api.ts`
- Đổi API_BASE_URL thành `http://localhost:3000/api/v1`
- Save và restart Expo: `npm start`

**Step 3: Pick First Feature** (2 giờ)
Recommend bắt đầu với **Task 2.9** (Design Calculator) vì:
- Không phụ thuộc backend API mới
- Logic đơn giản, dễ test
- Immediate value cho users

**Step 4: Test Locally**
- Open mobile app
- Navigate: Services → Design Calculator
- Test all 5 calculators
- Verify results are accurate

**Step 5: Commit Progress**
```bash
git add .
git commit -m "feat: complete design calculators (concrete, rebar, wood)"
git push
```

---

## ⚠️ Common Pitfalls & Solutions

| Issue | Solution |
|-------|----------|
| **Backend không connect** | Check PostgreSQL running: `pg_isready` |
| **CORS error** | Add `http://localhost:19000` to CORS whitelist |
| **WebSocket timeout** | Increase timeout in socket config (30s → 60s) |
| **Database lock** | Stop all Prisma Studio instances |
| **Hot reload not working** | Clear Expo cache: `npx expo start -c` |
| **Image upload fails** | Check multer config, increase size limit |

---

## 📞 Support & Resources

- **Backend Docs**: BE-baotienweb.cloud/README.md
- **API Docs**: http://localhost:3000/api/docs (when running)
- **Architecture**: APP_ARCHITECTURE_COMPLETE.md (710 lines)
- **Feature Status**: FEATURE_STATUS_REPORT.md

---

**Last Updated**: December 18, 2025  
**Author**: AI Assistant  
**Status**: Ready for development 🚀
