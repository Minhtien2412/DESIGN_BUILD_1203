# Đề Xuất Lộ Trình: Epic 0 vs Epic 5

**Ngày**: 2026-01-21  
**Tình trạng hiện tại**: Đã hoàn thành Epic 1-4 (182 SP, 646 tests)

---

## 📊 Tổng Quan Tình Trạng

### ✅ Hoàn Thành

- **Epic 1**: Video/Reels Player (70 SP, 173 tests) ✅
- **Epic 2**: Upload & File Manager (55 SP, 75 tests - FE Complete) ✅
- **Epic 3**: Camera & Document Scan (26 SP, 153 tests - FE Complete) ✅
- **Epic 4**: File Viewers (21 SP, 245 tests) ✅

### 🟡 Đang Thực Hiện (Epic 0 - Stabilization)

- **STAB-001** (8 SP): Secret rotation ⚠️ **BLOCKED** - cần external action rotate API keys
- **STAB-002** (5 SP): Swagger fix - gần xong, cần regenerate spec
- **STAB-003** (8 SP): ✅ **COMPLETE** - tsconfig đã tách
- **STAB-004** (5 SP): ⚠️ **BLOCKED** - DNS `api.baotienweb.cloud` chưa có record
- **STAB-005** (5 SP): ❌ **NOT STARTED** - dependency audit
- **STAB-006** (5 SP): ❌ **NOT STARTED** - TypeScript strict mode

**Epic 0 Status**: 10 SP done, 16 SP pending (62% blocked by external factors)

### ❌ Chưa Bắt Đầu

- **Epic 5**: Messaging & Realtime (63 SP) - requires backend + frontend
- **Epic 6-9**: 198 SP

---

## 🔍 Backend Health Check - Kết Quả

### ✅ Positive Findings

1. **Build successful**: `npm run build` hoàn tất không lỗi
2. **Dependencies installed**: 1111 packages
3. **Health controller exists**: `/health` endpoint ready (needs testing)
4. **Main port**: 3000 (configurable via PORT env)

### ⚠️ Issues Found

1. **Security vulnerabilities**: 2 vulnerabilities
   - `diff` <4.0.4: **Low severity** - DoS vulnerability
   - `qs` <6.14.1: **High severity** - DoS via memory exhaustion
   - **Fix**: `npm audit fix` available

2. **DNS not configured**:
   - `api.baotienweb.cloud` không resolve được
   - Main domain OK: `baotienweb.cloud` → 103.200.20.100
   - Cần add A/CNAME record cho subdomain

3. **Node modules not committed**: Backend dependencies cần reinstall sau clone

---

## 🎯 Ba Lựa Chọn

### Option 1: Hoàn Thành Epic 0 (Stabilization) ⭐ **RECOMMENDED**

**Scope**: STAB-005 + STAB-006 (10 SP)

**Tasks**:

- ✅ STAB-002: Regenerate OpenAPI spec (`npm run build` - ready to test)
- 🔧 STAB-005: Run dependency audit & fix vulnerabilities (1-2 hours)
  - `npm audit fix` cho `diff` và `qs` packages
  - Test backend sau fix
  - Update lock file
- 🔧 STAB-006: Enable TypeScript strict mode (2-3 hours)
  - Update `tsconfig.json` với `strict: true`
  - Fix type errors incrementally
  - Run `npm run typecheck` to verify

**Blocked Tasks** (need external action):

- ⏸️ STAB-001: API key rotation (requires OpenAI, Gemini, Pinecone, Pexels, Sentry, Perfex, Zalo accounts)
- ⏸️ STAB-004: DNS setup (requires domain admin access)

**Pros**:

- ✅ Quick wins (10 SP trong 1-2 ngày)
- ✅ Cải thiện security & code quality ngay
- ✅ Không depend on external services
- ✅ Chuẩn bị nền tảng tốt cho Epic 5
- ✅ Backend đã có sẵn, chỉ cần testing & fixes

**Cons**:

- ❌ Không deliver user-facing features ngay
- ❌ Vẫn còn 16 SP blocked by external factors

**Estimated Time**: 1-2 sprints (2-4 weeks)

---

### Option 2: Bắt Đầu Epic 5 Messaging (Backend + Frontend)

**Scope**: MSG-001, MSG-002, MSG-003 (34 SP)

**Tasks**:

1. **MSG-001** (8 SP): Conversation Model - Backend
   - Prisma schema: Conversation, ConversationMember
   - CRUD endpoints: create, invite, kick, leave, list
   - Roles: OWNER, ADMIN, MEMBER
2. **MSG-002** (13 SP): Message Send/Receive - Backend + Frontend
   - Prisma schema: Message, MessageStatus
   - Send message endpoint với dedupe
   - FE: Message list component, send UI
   - Cursor pagination for history
3. **MSG-003** (13 SP): WebSocket Events - Backend + Frontend
   - Socket.IO gateway setup
   - Auth handshake (JWT validation)
   - Events: message:new, typing, presence, read
   - FE: Socket connection manager

**Pros**:

- ✅ Deliver core messaging feature (high user value)
- ✅ P0 priority features
- ✅ Build on completed Epic 2 (Upload) for attachments later
- ✅ Enable Epic 6 (Offline messaging) afterwards

**Cons**:

- ❌ Backend cần stabilization trước (vulnerabilities, strict mode)
- ❌ Messaging phụ thuộc vào backend health
- ❌ Lớn hơn (34 SP), mất nhiều thời gian hơn
- ❌ Nếu backend có issue, sẽ block cả messaging implementation

**Dependencies**:

- Requires stable backend (Epic 0 completion)
- Requires Prisma migrations
- Requires WebSocket infrastructure

**Estimated Time**: 2-3 sprints (4-6 weeks)

---

### Option 3: Fix Backend Services Trước

**Scope**: Backend stability & infrastructure

**Tasks**:

1. **Security Fixes** (STAB-005)
   - Run `npm audit fix`
   - Test all endpoints sau fix
   - Verify no breaking changes
2. **Healthcheck Testing**
   - Start backend: `npm start`
   - Test `/health` endpoint locally: `http://localhost:3000/health`
   - Verify database connection
   - Test all API endpoints
3. **API Documentation**
   - Regenerate Swagger spec
   - Test Swagger UI: `http://localhost:3000/api/docs`
   - Verify no duplicate DTOs
4. **DNS Setup** (if possible)
   - Add A/CNAME record: `api.baotienweb.cloud` → server IP
   - Test public healthcheck
   - Configure Nginx reverse proxy

**Pros**:

- ✅ Ensure backend ổn định trước khi làm features mới
- ✅ Fix security vulnerabilities ngay
- ✅ API docs ready cho team
- ✅ Public healthcheck ready cho monitoring

**Cons**:

- ❌ DNS setup requires external access
- ❌ Không deliver features mới
- ❌ Overlap với Epic 0 tasks

**Estimated Time**: 1 sprint (2 weeks)

---

## 🏆 Recommendation: **Kết Hợp Pragmatic**

### Phase 1: Backend Quick Fixes (2-3 ngày) ⚡

```bash
# 1. Fix security vulnerabilities
cd BE-baotienweb.cloud
npm audit fix
npm test  # verify no breaking changes

# 2. Test backend locally
npm start
# Test: http://localhost:3000/health
# Test: http://localhost:3000/api/docs

# 3. Verify Swagger regeneration
npm run build
# Check: dist folder, OpenAPI spec
```

**Deliverables**:

- ✅ Backend có 0 high/critical vulnerabilities
- ✅ Healthcheck endpoint working
- ✅ Swagger docs clean (no duplicate DTOs)

### Phase 2: Complete Epic 0 (1 tuần) 🎯

- STAB-005: ✅ Dependency audit (done in Phase 1)
- STAB-006: Enable TypeScript strict mode
- Update PRODUCT_BACKLOG.md

**Deliverables**:

- ✅ Epic 0 đạt 26/26 SP (100% có thể complete, trừ blocked tasks)
- ✅ Code quality improved
- ✅ Backend stable & documented

### Phase 3: Start Epic 5 Messaging (2-3 tuần) 🚀

- MSG-001: Conversation Model (Backend)
- MSG-002: Message Send/Receive (Backend + Frontend)
- MSG-003: WebSocket Events (Backend + Frontend)

**Deliverables**:

- ✅ Core messaging features
- ✅ Real-time chat working
- ✅ 34 SP completed

---

## 📋 Immediate Action Plan

### Today (2026-01-21):

#### Step 1: Backend Fixes (30 phút)

```powershell
cd "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025\BE-baotienweb.cloud"

# Fix vulnerabilities
npm audit fix

# Rebuild
npm run build

# Test locally
npm start
```

#### Step 2: Verify Services (15 phút)

```powershell
# In another terminal, test endpoints:
# Health: http://localhost:3000/health
# Swagger: http://localhost:3000/api/docs
# API v1: http://localhost:3000/api/v1/

# Or use curl:
curl http://localhost:3000/health
```

#### Step 3: Choose Next Task (user decision)

Based on testing results, user decides:

- **Option A**: Continue with STAB-006 (strict mode) để hoàn thành Epic 0
- **Option B**: Start MSG-001 (conversation model) nếu backend ổn định
- **Option C**: Document issues và wait for DNS/API key rotation

---

## 🎯 Success Metrics

### Epic 0 Completion Criteria:

- [ ] 0 high/critical security vulnerabilities
- [ ] TypeScript strict mode enabled
- [ ] Backend build passes
- [ ] Health endpoint returns 200 OK
- [ ] Swagger UI loads without errors

### Epic 5 Readiness Criteria:

- [x] Epic 2 (Upload) complete ✅
- [ ] Backend stable (Epic 0 done)
- [ ] Prisma migrations working
- [ ] WebSocket infrastructure ready
- [ ] JWT auth working

---

## 💡 Recommendation Summary

**Best Path**: **Phase 1 → Phase 2 → Phase 3**

1. **Fix backend ngay** (2-3 ngày): Security fixes, testing, documentation
2. **Complete Epic 0** (1 tuần): STAB-006 strict mode
3. **Start Epic 5** (2-3 tuần): Messaging backend + frontend

**Rationale**:

- Stable foundation = fewer bugs khi làm messaging
- Quick wins (10 SP) build momentum
- Backend testing trước khi implement features mới
- P0 stabilization tasks done → P0 messaging features next

**Total Timeline**: ~4-5 tuần to have working messaging system on stable backend

---

## 🚫 What NOT to Do

❌ **Skip Epic 0**: Làm messaging trên unstable backend → more bugs, harder debugging  
❌ **Wait for DNS/API keys**: Blocked tasks là external, làm tasks khác trước  
❌ **Parallelize Epic 0 + Epic 5**: Context switching, harder to debug issues  
✅ **Do**: Sequential, test thoroughly, build stable foundation
