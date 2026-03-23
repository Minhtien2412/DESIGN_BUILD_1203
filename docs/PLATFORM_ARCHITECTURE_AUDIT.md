# BaoTienWeb Platform — Comprehensive Architecture Audit

**Date:** 2025-06-14
**Platform:** BaoTienWeb — Shopee-style Commerce + Construction/CRM
**Stack:** NestJS 10 (76 modules) + Expo SDK 54 React Native + PostgreSQL + Redis + Docker
**Scope:** 15-dimension audit across auth, RBAC, projects, tasks, QC, contracts, payments, files, communication, dashboards, AI, notifications, API design, and production safety

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [P0 — Critical Issues (Fix This Week)](#2-p0--critical-issues)
3. [P1 — Important Improvements (Next 2 Sprints)](#3-p1--important-improvements)
4. [Detailed 15-Area Audit](#4-detailed-15-area-audit)
5. [FE-BE Contract Standardization](#5-fe-be-contract-standardization)
6. [RBAC Matrix Proposal](#6-rbac-matrix-proposal)
7. [Backend Refactor Strategy](#7-backend-refactor-strategy)
8. [Production Hardening Checklist](#8-production-hardening-checklist)
9. [Sprint Roadmap (5 Sprints)](#9-sprint-roadmap)
10. [Immediate Action List — This Week](#10-immediate-action-list)

---

## 1. EXECUTIVE SUMMARY

### Platform Maturity: **6.5/10 — Strong Foundation, Production Gaps**

BaoTienWeb is a surprisingly mature mono-repo platform with **152 Prisma models**, **76 NestJS modules**, **6 WebSocket gateways**, and a full Expo React Native mobile client. The platform spans two major domains:

- **E-Commerce** (products, orders, payments, shipping, cart, marketplace)
- **Construction Management** (projects, tasks, QC, contracts, budget, safety, timeline, materials, daily reports, commissioning, change management)

**What's Working Well:**

- ✅ Standardized API response envelope (`ApiResponse<T>`) with transform interceptor
- ✅ Comprehensive auth: JWT + refresh token rotation with device sessions, token family tracking, reuse attack detection
- ✅ 9-role RBAC with 35+ granular permissions and hierarchy levels
- ✅ 6 real-time WebSocket gateways (chat, calls, progress, notifications, conversations, reels)
- ✅ Multi-provider file upload (Local/S3/Cloudinary) with thumbnails and versioning
- ✅ Request correlation IDs for distributed tracing
- ✅ Vietnamese localization in error messages
- ✅ Secure Docker image (non-root user, multi-stage, tini init, healthcheck)
- ✅ Well-structured Prisma schema with 152 models, proper indexes, and unique constraints

**What Needs Urgent Attention:**

- 🔴 **4 modules have auth guards disabled/commented out** (timeline, contract, materials, safety)
- 🔴 **Safety module uses in-memory Maps** — all data lost on restart
- 🔴 **CORS set to `*` in production** — allows any origin
- 🔴 **Static API key** (`thietke-resort-api-key-2024`) shared across all clients
- 🔴 **Orders module**: missing coupon logic, VNPay/MoMo stubs, no payment signature verification
- 🟡 **Mixed ID types** (Int vs UUID) across models — complicates distributed scaling
- 🟡 **No database migration strategy** — `prisma db push` used instead of versioned migrations
- 🟡 **Disk at 94%** on production VPS — needs capacity planning

### Risk Matrix

| Risk Level         | Count | Impact                                     |
| ------------------ | ----- | ------------------------------------------ |
| 🔴 P0 Critical     | 7     | Data loss, security breach, payment fraud  |
| 🟡 P1 Important    | 12    | Feature gaps, scalability, maintainability |
| 🟢 P2 Nice-to-have | 8     | Polish, DX improvements, optimization      |

---

## 2. P0 — CRITICAL ISSUES

### P0-1: Safety Module — In-Memory Storage (DATA LOSS)

**Impact:** All safety audits, incidents, PPE records, and training data lost on every restart
**Location:** `src/safety/safety.service.ts`
**Root Cause:** Service uses `Map<number, T>` instead of Prisma models
**Fix:** Create Prisma models for SafetyAudit, SafetyIncident, PPEDistribution, SafetyTraining. Migrate data patterns from in-memory Maps to database CRUD.
**Effort:** 2-3 days

### P0-2: Unguarded Endpoints — 4 Modules Missing Authentication

| Module        | File                        | Status                                   |
| ------------- | --------------------------- | ---------------------------------------- |
| **Timeline**  | `timeline.controller.ts:26` | `@UseGuards(JwtAuthGuard)` commented out |
| **Contract**  | `contract.controller.ts:30` | `@UseGuards(JwtAuthGuard)` commented out |
| **Materials** | `materials.controller.ts`   | No guard applied at all                  |
| **Safety**    | `safety.controller.ts`      | No guard applied at all                  |

**Impact:** Anyone with the API key can read/write project timelines, contracts, materials, and safety records without authentication. In a multi-client environment, this is a data breach vector.
**Fix:** Uncomment/add `@UseGuards(JwtAuthGuard)` on all four controllers. Add `@Roles()` where write operations need role restrictions.
**Effort:** 30 minutes

### P0-3: CORS Wildcard in Production

**Location:** `src/main.ts` — `app.enableCors({ origin: '*' })`
**Impact:** Allows any website to make authenticated API requests on behalf of logged-in users (CSRF-adjacent risk). Malicious sites can exfiltrate data, modify resources, or trigger payments.
**Fix:** Restrict to known origins:

```typescript
app.enableCors({
  origin: [
    "https://baotienweb.cloud",
    "https://admin.baotienweb.cloud",
    /^exp:\/\//, // Expo dev client
  ],
  credentials: true,
});
```

**Effort:** 15 minutes

### P0-4: Payment Gateway Stubs Without Signature Verification

**Location:** `src/orders/orders.service.ts` lines 401, 428, 440-441
**Impact:** VNPay and MoMo payment endpoints exist but don't verify return signatures. An attacker can forge payment callbacks to mark orders as paid without actual payment.
**Fix:** Implement HMAC-SHA256/SHA512 signature verification for VNPay IPN callbacks and MoMo webhook verification per their respective docs.
**Effort:** 2-3 days

### P0-5: Static API Key — No Client Isolation

**Current:** Single `API_KEY = "thietke-resort-api-key-2024"` for all clients
**Impact:** If leaked (common in mobile app reverse engineering), ALL API access is compromised with no way to revoke per-client.
**Fix (Short-term):** Rotate key immediately. Add per-client API key support via database lookup.
**Fix (Long-term):** Replace static API key with OAuth2 client credentials flow or signed JWTs for client identification.
**Effort:** Short-term 1 day, long-term 1 week

### P0-6: No Database Migration Versioning

**Current:** `prisma db push` used for schema changes — no migration history
**Impact:** Schema drift between environments. Impossible to rollback. No audit trail of what changed.
**Fix:** Switch to `prisma migrate dev` for development, `prisma migrate deploy` for production. Generate baseline migration from current schema.
**Effort:** 1 day for baseline, ongoing discipline

### P0-7: Production Disk at 94%

**Current:** 3.2GB free on VPS (103.200.20.100), Docker image is 1.77GB
**Impact:** One large log burst or upload spike = out of disk → all services crash
**Fix:** (a) Add log rotation for PM2 (`pm2 install pm2-logrotate`, max 50MB per file), (b) move uploads to S3/Cloudinary to reduce local storage, (c) archive old Docker images, (d) plan upgrade to larger disk.
**Effort:** 2 hours (rotation), 1 day (S3 upload migration)

---

## 3. P1 — IMPORTANT IMPROVEMENTS

### P1-1: Order Module Incomplete — 4 TODOs

| TODO                  | Location                    | Impact                          |
| --------------------- | --------------------------- | ------------------------------- |
| Coupon discount logic | `orders.service.ts:89`      | Checkout discount field ignored |
| VNPay integration     | `orders.service.ts:401`     | Payment method unusable         |
| MoMo integration      | `orders.service.ts:428`     | Payment method unusable         |
| Payment verification  | `orders.service.ts:440-441` | Can't confirm payment status    |

### P1-2: Contract Module — No Version History

Contracts can be updated but there's no history tracking. In construction, contract amendments must be auditable. Need a `ContractVersion` model with `versionNumber`, `changedBy`, `changeReason`, `snapshot` (JSON of the full contract at that point).

### P1-3: Dashboard CRM Integration Disabled

`src/dashboard/dashboard.service.ts:10` — CRM stats commented out because CRM uses a separate Prisma client. Need to unify database connections or add explicit cross-client query support.

### P1-4: Mixed ID Types — Int vs UUID

- 124 models use `Int @default(autoincrement())`
- ~28 models use `String @default(uuid())`

This creates JOIN complexity and blocks future sharding. Plan: New models use UUID. Existing models: add `uuid` secondary column in next migration wave.

### P1-5: Decimal Precision Inconsistency

Financial fields use three different precisions:

- `@db.Decimal(15, 2)` — most fields ✅
- `@db.Decimal(12, 2)` — Product.price
- `@db.Decimal(10, 2)` — Material.unitPrice

Standardize all monetary fields to `Decimal(15, 2)` for VND compatibility (1 USD ≈ 25,000 VND, large values common).

### P1-6: No Rate Limiting Per-Endpoint

Global throttle (100 req/60s) is too generous for sensitive endpoints. Add per-endpoint limits:

- `/auth/login` → 5/minute (brute force protection)
- `/auth/otp/send` → 3/minute (SMS cost protection)
- `/payment/*` → 10/minute (fraud prevention)
- File upload → 20/minute

### P1-7: No Structured Logging / Observability

No ELK/Loki stack, no APM, no structured JSON logging to stdout. In production, debugging requires SSH + manual log grep. Need:

- Winston/Pino with JSON format
- Correlation ID propagation to all log lines
- Health check dashboard (beyond `/api/v1/health`)

### P1-8: Frontend Type Gaps

- `User.avatar` referenced but not returned by backend
- `OrderStatus` enum missing `CONFIRMED`/`PROCESSING` states
- Frontend uses `type ID = string` while backend returns Int

### P1-9: QC Module — Endpoints Unguarded

QC controller has 20+ endpoints but none have `@UseGuards()`. While less critical than timeline/contracts (QC data is less exploitable), it should still require authentication.

### P1-10: No Audit Trail for Critical Operations

No global `AuditLog` table tracking WHO did WHAT, WHEN, on WHICH resource. Only `ManagedFileAuditLog` exists for files. Construction platforms need comprehensive audit logging for:

- Contract signing/amendments
- Payment approvals/refunds
- User role changes
- Project status transitions

### P1-11: WebSocket Authentication Gap

WebSocket gateways verify JWT on connection but don't re-verify on each message. If a token expires mid-session, the connection stays alive. Need periodic token validation or heartbeat-based re-auth.

### P1-12: Missing Orphan Model Relations

`VideoCacheConfig`, `VideoCacheLog`, and `Estimation` models have no foreign key relations — potential data orphans with no automated cleanup.

---

## 4. DETAILED 15-AREA AUDIT

### 4.1 Authentication

| Aspect               | Status | Details                                                 |
| -------------------- | ------ | ------------------------------------------------------- |
| Login methods        | ✅     | Email/password, Google OAuth, OTP, Social auth          |
| Token strategy       | ✅     | JWT access (15min) + refresh (30d) with device sessions |
| Token rotation       | ✅     | Family-based rotation with reuse attack detection       |
| Refresh security     | ✅     | bcrypt-hashed refresh tokens in DB                      |
| 2FA/TOTP             | ✅     | Setup/verify/disable flow with speakeasy                |
| Session management   | ✅     | Device-aware sessions (IP, user-agent, platform)        |
| Logout               | ✅     | Single device + logout-all (revokes all sessions)       |
| Password reset       | ✅     | OTP-based verification                                  |
| Rate limiting (auth) | ⚠️     | Only global throttle, need per-endpoint                 |
| Face verification    | ✅     | `requireFaceVerification` flag in login response        |

**Grade: A-** — Comprehensive auth system, only missing per-endpoint rate limits.

### 4.2 RBAC & Authorization

| Aspect                 | Status | Details                                              |
| ---------------------- | ------ | ---------------------------------------------------- |
| Role definitions       | ✅     | 9 roles: CLIENT(10) → SUPER_ADMIN(100)               |
| Permission granularity | ✅     | 35+ permissions (user:_, project:_, task:\*, etc.)   |
| Guards                 | ✅     | RolesGuard, PermissionsGuard, OptionalAuthGuard      |
| Decorators             | ✅     | `@Roles()`, `@RequirePermissions()`, `@Public()`     |
| Hierarchy enforcement  | ✅     | Level-based (higher level implies lower permissions) |
| Multi-tenant isolation | ❌     | No tenant/organization scoping — all data global     |
| Row-level security     | ⚠️     | Some services check ownership, not enforced globally |

**Grade: B+** — Strong role/permission model but missing multi-tenant isolation critical for enterprise clients.

### 4.3 Projects

| Aspect                | Status | Details                                           |
| --------------------- | ------ | ------------------------------------------------- |
| CRUD                  | ✅     | Full create/read/update/delete                    |
| Member assignment     | ✅     | Client + Engineer assignment with role validation |
| Status workflow       | ✅     | PLANNING → IN_PROGRESS → COMPLETED                |
| Timeline/Activity log | ✅     | Chronological event tracking                      |
| Progress metrics      | ✅     | Task/budget/timeline percentage calculation       |
| DTOs                  | ✅     | class-validator decorators on all DTOs            |
| Guards                | ✅     | JwtAuthGuard on all 9 routes                      |

**Grade: A** — Production-ready project management module.

### 4.4 Tasks

| Aspect            | Status | Details                           |
| ----------------- | ------ | --------------------------------- |
| CRUD              | ✅     | Full with PUT/PATCH compatibility |
| Status workflow   | ✅     | TODO → IN_PROGRESS → DONE         |
| Assignment        | ✅     | assigneeId with FE alias support  |
| Comments/Files    | ✅     | Relations loaded on detail        |
| Progress tracking | ✅     | Percentage-based progress         |
| Dependencies      | ❌     | No task dependency/blocker system |
| Subtask hierarchy | ⚠️     | Flat — no nested subtask depth    |

**Grade: B+** — Functional but missing dependency management for complex construction schedules.

### 4.5 Quality Control (QC)

| Aspect         | Status | Details                                                |
| -------------- | ------ | ------------------------------------------------------ |
| Categories     | ✅     | Full CRUD                                              |
| Checklists     | ✅     | Templates + project-specific                           |
| Inspections    | ✅     | Create/update/complete workflow                        |
| Bug tracking   | ✅     | Report + resolve + severity/status enums               |
| Guards         | ❌     | **No auth guards on any endpoint**                     |
| Photo evidence | ⚠️     | Framework exists, no mandatory photo upload            |
| Approval chain | ❌     | No multi-level approval (e.g., inspector → PM → owner) |

**Grade: B-** — Rich QC model but critically unguarded.

### 4.6 Contracts

| Aspect             | Status | Details                                           |
| ------------------ | ------ | ------------------------------------------------- |
| Material catalog   | ✅     | CRUD with categories                              |
| Quotations         | ✅     | Auto-calculation (subtotal, tax, discount, total) |
| Quotation workflow | ✅     | Send → approve/reject                             |
| Contract creation  | ✅     | From quotation + signing                          |
| Dual signature     | ✅     | Client sign + company sign                        |
| Payment schedule   | ✅     | CRUD for milestones                               |
| Guards             | ❌     | **Auth guards commented out**                     |
| Version history    | ❌     | No amendment/versioning                           |
| Templates          | ✅     | ContractTemplate model exists                     |

**Grade: C+** — Impressive scope but auth-disabled is a showstopper.

### 4.7 Payments

| Aspect             | Status | Details                                   |
| ------------------ | ------ | ----------------------------------------- |
| Stripe             | ✅     | Intents, subscriptions, refunds, webhooks |
| VNPay              | ⚠️     | Init stub, no signature verification      |
| MoMo               | ⚠️     | Init stub, no signature verification      |
| Payment history    | ✅     | Full history with filtering               |
| Marketplace escrow | ✅     | Separate module with full escrow workflow |
| ACB bank transfer  | ❌     | Stub only                                 |
| Reconciliation     | ❌     | No payment reconciliation system          |

**Grade: B-** — Stripe excellent, Vietnamese gateways incomplete.

### 4.8 Files & Uploads

| Aspect              | Status | Details                             |
| ------------------- | ------ | ----------------------------------- |
| Multi-provider      | ✅     | LOCAL, S3, Cloudinary               |
| Single/multi upload | ✅     | Single + batch (up to 10)           |
| Thumbnails          | ✅     | Auto-generation                     |
| File versioning     | ✅     | ManagedFileVersion model            |
| File audit log      | ✅     | ManagedFileAuditLog                 |
| Presigned URLs      | ✅     | For direct client upload            |
| Guards              | ✅     | JwtAuthGuard on upload/delete       |
| Max file size       | ⚠️     | Not explicitly configured in Multer |
| Virus scanning      | ❌     | No malware detection                |

**Grade: A-** — Robust file management, missing malware scanning.

### 4.9 Communication

| Aspect              | Status | Details                                 |
| ------------------- | ------ | --------------------------------------- |
| Chat rooms          | ✅     | Project-scoped, real-time via Socket.IO |
| 1-1 conversations   | ✅     | Direct messaging with reactions         |
| Group conversations | ✅     | Multi-participant                       |
| Read receipts       | ✅     | Per-user tracking                       |
| Typing indicators   | ✅     | Real-time via WebSocket                 |
| Message search      | ✅     | Full-text search endpoint               |
| Attachments         | ✅     | Image/file support                      |
| Video/audio calls   | ✅     | LiveKit WebRTC integration              |
| Announcements       | ✅     | System-wide with priority/expiry        |
| Email               | ✅     | SMTP via Nodemailer                     |

**Grade: A** — Comprehensive real-time communication stack.

### 4.10 Dashboards

| Aspect             | Status | Details                                |
| ------------------ | ------ | -------------------------------------- |
| Role-based routing | ✅     | Auto-route by user role                |
| Admin dashboard    | ✅     | Revenue, projects, QC, HR metrics      |
| Engineer dashboard | ✅     | Today's tasks, active projects         |
| Client dashboard   | ✅     | Project progress, documents            |
| Master dashboard   | ✅     | All-module aggregated stats            |
| Real-time updates  | ❌     | No WebSocket push for dashboard data   |
| CRM stats          | ❌     | Disabled due to separate Prisma client |

**Grade: B+** — Good static dashboards, no real-time refresh.

### 4.11 AI Integration

| Aspect               | Status | Details                            |
| -------------------- | ------ | ---------------------------------- |
| AI analysis          | ✅     | AIAnalysis, AIReport models        |
| Chat history         | ✅     | AIChatHistory model                |
| Progress analysis    | ✅     | AIProgressAnalysis model           |
| Daily/weekly reports | ✅     | AI-generated report models         |
| Image analysis       | ✅     | `analyzeImageLabels()` in frontend |
| OpenAI integration   | ✅     | GPT-4 via `OPENAI_API_KEY`         |
| Speech module        | ✅     | `src/speech/` module exists        |

**Grade: B+** — AI infrastructure present, need to verify service completeness.

### 4.12 Notifications

| Aspect                 | Status | Details                                |
| ---------------------- | ------ | -------------------------------------- |
| In-app notifications   | ✅     | WebSocket + REST                       |
| Push notifications     | ✅     | Expo push API                          |
| Device registration    | ✅     | iOS/Android/Web tokens                 |
| Preferences            | ✅     | Push/email/system toggles, quiet hours |
| Broadcast              | ✅     | Admin → all users                      |
| Unread count           | ✅     | Badge endpoint                         |
| Email notifications    | ⚠️     | SMTP configured but templates basic    |
| Notification templates | ❌     | No parameterized template model        |

**Grade: B+** — Full notification pipeline, missing templating system.

### 4.13 Construction-Specific Modules

| Module                    | Endpoints                 | Guards     | Persistence  | Grade         |
| ------------------------- | ------------------------- | ---------- | ------------ | ------------- |
| **Construction Progress** | 20+                       | ✅ JwtAuth | ✅ Prisma    | A             |
| **Budget**                | 20+                       | ✅ JwtAuth | ✅ Prisma    | A             |
| **Timeline**              | 16                        | ❌ None    | ✅ Prisma    | C (unguarded) |
| **Safety**                | 20+                       | ❌ None    | ❌ In-memory | F (data loss) |
| **Materials**             | 12                        | ❌ None    | ✅ Prisma    | C (unguarded) |
| **Daily Reports**         | Via construction-progress | ✅ JwtAuth | ✅ Prisma    | B+            |
| **Commissioning**         | Full CRUD                 | varies     | ✅ Prisma    | B             |
| **Change Management**     | Full CRUD                 | varies     | ✅ Prisma    | B             |

### 4.14 API Design & Consistency

| Aspect            | Status | Details                                                                                             |
| ----------------- | ------ | --------------------------------------------------------------------------------------------------- |
| Response envelope | ✅     | `ApiResponse<T>` with TransformInterceptor (global)                                                 |
| Error format      | ✅     | Structured with code, message, requestId                                                            |
| Versioning        | ✅     | URI: `/api/v1/`                                                                                     |
| Pagination        | ✅     | Standard page/limit/total meta                                                                      |
| Input validation  | ✅     | class-validator with whitelist + transform                                                          |
| Swagger/OpenAPI   | ✅     | Available at `/api/docs`                                                                            |
| Request tracing   | ✅     | RequestIdMiddleware with correlation IDs                                                            |
| Consistent naming | ⚠️     | Most RESTful, some inconsistencies (e.g., `/construction-progress/projects/:id` vs `/projects/:id`) |

**Grade: A-** — Well-standardized API design with minor naming inconsistencies.

### 4.15 Production Safety & Infrastructure

| Aspect            | Status | Details                                         |
| ----------------- | ------ | ----------------------------------------------- |
| Docker security   | ✅     | Non-root, multi-stage, tini, healthcheck        |
| SSL/TLS           | ✅     | Let's Encrypt, TLS 1.2/1.3                      |
| Helmet headers    | ✅     | Enabled in main.ts                              |
| Rate limiting     | ⚠️     | Global only (100/60s)                           |
| CI/CD             | ✅     | GitHub Actions: lint, test, secret scan, deploy |
| Secret scanning   | ✅     | Gitleaks in CI pipeline                         |
| Monitoring        | ❌     | No APM, no metrics, no alerting                 |
| Backup strategy   | ❌     | No automated DB backups                         |
| Log management    | ❌     | No structured logging, no rotation              |
| Disaster recovery | ❌     | No documented DR plan                           |
| Load testing      | ❌     | No performance baseline                         |

**Grade: C** — Secure base configuration but minimal production operations maturity.

---

## 5. FE-BE CONTRACT STANDARDIZATION

### 5.1 Current State

The frontend (`services/api.ts`) and backend share a well-defined contract through:

- Consistent base URL handling with auto-prefix normalization
- API key injection on every request
- JWT refresh token rotation with concurrent request queuing
- Standard error response parsing (`ApiError` with status, code, requestId)

### 5.2 Identified Mismatches

| #   | Area             | Frontend Expects                    | Backend Provides               | Fix Location                        |
| --- | ---------------- | ----------------------------------- | ------------------------------ | ----------------------------------- |
| 1   | User.avatar      | `avatarUrl` field                   | Not returned by `/auth/me`     | Backend: add to profile response    |
| 2   | User.permissions | Permission array                    | Not in response                | Backend: include in `/auth/me`      |
| 3   | OrderStatus      | PENDING/PAID/SHIPPED/COMPLETED      | Missing CONFIRMED/PROCESSING   | Align enum in both                  |
| 4   | ID type          | `string` everywhere                 | `Int` in most models           | Backend: serialize BigInt to string |
| 5   | Product filters  | `category,search,minPrice,maxPrice` | Verify backend query support   | Backend: ensure all params handled  |
| 6   | Shipping zones   | `GET /shipping/zones`               | Endpoint existence unconfirmed | Verify or create                    |

### 5.3 Proposed Standard API Contract

```typescript
// Every API response MUST follow this shape:
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string; // Machine-readable: USER_NOT_FOUND, VALIDATION_ERROR
    message: string; // Human-readable (Vietnamese)
    details?: unknown; // Validation details array
    requestId: string; // Correlation ID for logs
  };
}

// Pagination query params (standard across all list endpoints):
interface PaginationQuery {
  page?: number; // default: 1
  limit?: number; // default: 20, max: 100
  sortBy?: string; // field name
  sortOrder?: "asc" | "desc";
}

// All IDs in responses MUST be serialized as strings
// All monetary values MUST use Decimal(15,2) → returned as string "1234567.89"
// All dates MUST be ISO 8601: "2025-06-14T07:30:00.000Z"
```

### 5.4 WebSocket Contract

| Namespace        | Auth | Events (Server → Client)                                                            | Events (Client → Server)                                                |
| ---------------- | ---- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `/chat`          | JWT  | `message`, `typing`, `room_members`, `messageEdited`, `messageDeleted`              | `send_message`, `typing`, `join_room`, `leave_room`                     |
| `/call`          | JWT  | `call_initiated`, `call_answered`, `call_ended`, `ice_candidate`, `offer`, `answer` | `start_call`, `accept_call`, `reject_call`, `end_call`, `ice_candidate` |
| `/progress`      | JWT  | `task_updated`, `milestone_completed`, `status_changed`                             | `subscribe_project`                                                     |
| `/notifications` | JWT  | `notification`, `badge_update`                                                      | `mark_read`                                                             |

---

## 6. RBAC MATRIX PROPOSAL

### 6.1 Current Role Hierarchy

```
SUPER_ADMIN (100) ─── Full platform control
    └── ADMIN (90) ─── Organizational admin
        └── STAFF (80) ─── Internal staff
            ├── CONTRACTOR (70) ─── Construction contractor
            ├── ENGINEER (60) ─── Project engineer
            ├── ARCHITECT (50) ─── Design architect
            ├── DESIGNER (40) ─── Interior designer
            └── SUPPLIER (30) ─── Material supplier
                └── CLIENT (10) ─── End customer
```

### 6.2 Permission Matrix (Recommended)

| Permission          | CLIENT      | SUPPLIER | DESIGNER | ARCHITECT | ENGINEER | CONTRACTOR | STAFF | ADMIN | SUPER_ADMIN |
| ------------------- | ----------- | -------- | -------- | --------- | -------- | ---------- | ----- | ----- | ----------- |
| **user:read_own**   | ✅          | ✅       | ✅       | ✅        | ✅       | ✅         | ✅    | ✅    | ✅          |
| **user:update_own** | ✅          | ✅       | ✅       | ✅        | ✅       | ✅         | ✅    | ✅    | ✅          |
| **user:manage_all** | ❌          | ❌       | ❌       | ❌        | ❌       | ❌         | ❌    | ✅    | ✅          |
| **project:read**    | Own         | ❌       | Assigned | Assigned  | Assigned | Assigned   | All   | All   | All         |
| **project:create**  | ❌          | ❌       | ❌       | ✅        | ✅       | ❌         | ✅    | ✅    | ✅          |
| **project:update**  | ❌          | ❌       | Assigned | Assigned  | Assigned | ❌         | All   | All   | All         |
| **project:delete**  | ❌          | ❌       | ❌       | ❌        | ❌       | ❌         | ❌    | ✅    | ✅          |
| **task:read**       | Own project | ❌       | Assigned | Assigned  | Assigned | Assigned   | All   | All   | All         |
| **task:create**     | ❌          | ❌       | ✅       | ✅        | ✅       | ✅         | ✅    | ✅    | ✅          |
| **task:assign**     | ❌          | ❌       | ❌       | ❌        | ✅       | ✅         | ✅    | ✅    | ✅          |
| **qc:inspect**      | ❌          | ❌       | ❌       | ❌        | ✅       | ✅         | ✅    | ✅    | ✅          |
| **qc:approve**      | ❌          | ❌       | ❌       | ✅        | ✅       | ❌         | ✅    | ✅    | ✅          |
| **contract:read**   | Own         | ❌       | Own      | Own       | Own      | Own        | All   | All   | All         |
| **contract:create** | ❌          | ❌       | ❌       | ❌        | ❌       | ❌         | ✅    | ✅    | ✅          |
| **contract:sign**   | ✅          | ❌       | ❌       | ❌        | ❌       | ❌         | ❌    | ✅    | ✅          |
| **payment:view**    | Own         | Own      | ❌       | ❌        | ❌       | ❌         | All   | All   | All         |
| **payment:process** | ❌          | ❌       | ❌       | ❌        | ❌       | ❌         | ✅    | ✅    | ✅          |
| **payment:refund**  | ❌          | ❌       | ❌       | ❌        | ❌       | ❌         | ❌    | ✅    | ✅          |
| **budget:read**     | Own project | ❌       | Assigned | Assigned  | Assigned | Assigned   | All   | All   | All         |
| **budget:approve**  | ❌          | ❌       | ❌       | ❌        | ❌       | ❌         | ✅    | ✅    | ✅          |
| **product:create**  | ❌          | ✅       | ❌       | ❌        | ❌       | ❌         | ✅    | ✅    | ✅          |
| **product:approve** | ❌          | ❌       | ❌       | ❌        | ❌       | ❌         | ❌    | ✅    | ✅          |
| **chat:send**       | ✅          | ✅       | ✅       | ✅        | ✅       | ✅         | ✅    | ✅    | ✅          |
| **file:upload**     | ✅          | ✅       | ✅       | ✅        | ✅       | ✅         | ✅    | ✅    | ✅          |
| **file:delete_any** | ❌          | ❌       | ❌       | ❌        | ❌       | ❌         | ❌    | ✅    | ✅          |
| **safety:read**     | Own project | ❌       | ❌       | ❌        | ✅       | ✅         | All   | All   | All         |
| **safety:create**   | ❌          | ❌       | ❌       | ❌        | ✅       | ✅         | ✅    | ✅    | ✅          |
| **admin:dashboard** | ❌          | ❌       | ❌       | ❌        | ❌       | ❌         | ✅    | ✅    | ✅          |
| **admin:system**    | ❌          | ❌       | ❌       | ❌        | ❌       | ❌         | ❌    | ❌    | ✅          |

### 6.3 Missing: Multi-Tenant Scoping

For enterprise deployment, add:

```prisma
model Organization {
  id        Int    @id @default(autoincrement())
  name      String
  slug      String @unique
  members   OrganizationMember[]
  projects  Project[]
}

model OrganizationMember {
  id             Int          @id @default(autoincrement())
  organizationId Int
  userId         Int
  role           Role
  organization   Organization @relation(fields: [organizationId], references: [id])
  user           User         @relation(fields: [userId], references: [id])
  @@unique([organizationId, userId])
}
```

Then scope all queries with `WHERE organizationId = ?` via a global Prisma middleware or service mixin.

---

## 7. BACKEND REFACTOR STRATEGY

### 7.1 Phase 1 — Security Fixes (Week 1)

1. **Enable auth guards** on timeline, contract, materials, safety, QC controllers
2. **Restrict CORS** to known origins
3. **Rotate API key** and add per-client key support
4. **Add rate limits** to auth and payment endpoints

### 7.2 Phase 2 — Data Integrity (Weeks 2-3)

1. **Safety module**: Replace in-memory Maps with Prisma models
2. **Migration baseline**: Generate first `prisma migrate` from current schema
3. **Standardize Decimal precision** to `(15, 2)` across all monetary fields
4. **Add row-level ownership checks** to services missing them

### 7.3 Phase 3 — Payment Completion (Weeks 3-4)

1. **VNPay**: Implement full IPN callback with HMAC-SHA512 verification
2. **MoMo**: Implement webhook with RSA signature verification
3. **Coupon system**: Build DiscountCode model + coupon application logic in orders
4. **Payment reconciliation**: Cron job to verify pending payments

### 7.4 Phase 4 — Observability (Weeks 4-5)

1. **Structured logging**: Replace console.log with Pino/Winston JSON logger
2. **Correlation ID propagation**: Ensure all log lines include `requestId`
3. **Health check expansion**: Add DB, Redis, S3 health checks
4. **Add prometheus metrics** endpoint for basic observability

### 7.5 Phase 5 — Multi-Tenant Architecture (Weeks 6-8)

1. **Organization model**: Create org-scoped data isolation
2. **Row-level security**: Prisma middleware for automatic org filtering
3. **Admin panel**: Organization management CRUD
4. **Contract versioning**: Add `ContractVersion` model with amendment tracking

---

## 8. PRODUCTION HARDENING CHECKLIST

### Infrastructure

- [ ] **Disk capacity**: Upgrade VPS or offload uploads to S3/Cloudinary
- [ ] **Automated backups**: pg_dump cron job (daily to S3, 30-day retention)
- [ ] **Log rotation**: PM2 logrotate (50MB max, 10 files)
- [ ] **Docker image cleanup**: Prune unused images weekly
- [ ] **SSL cert renewal**: Certbot auto-renewal cron verified
- [ ] **Redis persistence**: Enable AOF for session/cache durability

### Security

- [ ] **CORS restriction**: Whitelist only production domains
- [ ] **API key rotation**: New key + per-client support
- [ ] **Auth guards**: Enable on timeline, contract, materials, safety, QC
- [ ] **Rate limiting**: Per-endpoint limits for auth, payment, upload
- [ ] **Helmet CSP**: Configure Content-Security-Policy headers
- [ ] **File upload size**: Set Multer `maxFileSize` (10MB default, 100MB for video)
- [ ] **SQL injection**: Prisma ORM handles this ✅ (no raw queries detected)
- [ ] **XSS protection**: SanitizePipe exists ✅ but verify it's applied globally

### Application

- [ ] **Safety module persistence**: Migrate to Prisma
- [ ] **Payment signature verification**: VNPay HMAC + MoMo RSA
- [ ] **Global audit logging**: AuditLog model for critical operations
- [ ] **Error alerting**: Sentry or similar for backend exceptions
- [ ] **Graceful shutdown**: Ensure NestJS `enableShutdownHooks()` is called
- [ ] **Database connection pooling**: Verify Prisma pool settings for production load

### Monitoring

- [ ] **Uptime monitor**: External ping to `/api/v1/health`
- [ ] **DB metrics**: Connection pool usage, query duration p95
- [ ] **Disk alerts**: Alert at 90% disk usage
- [ ] **Memory alerts**: Alert at 80% RAM usage
- [ ] **Error rate alerts**: Alert if 5xx rate exceeds 1%

---

## 9. SPRINT ROADMAP (5 Sprints × 2 Weeks)

### Sprint 1: Security & Stability (Week 1-2)

**Theme:** "Stop the bleeding"

| #   | Task                                           | Priority | Effort |
| --- | ---------------------------------------------- | -------- | ------ |
| 1   | Enable auth guards on 5 unguarded modules      | P0       | 2h     |
| 2   | Restrict CORS to production domains            | P0       | 30min  |
| 3   | Safety module: in-memory → Prisma migration    | P0       | 3d     |
| 4   | Database migration baseline (`prisma migrate`) | P0       | 1d     |
| 5   | PM2 log rotation + disk monitoring             | P0       | 2h     |
| 6   | Per-endpoint rate limiting (auth, payment)     | P1       | 1d     |
| 7   | Automated daily pg_dump backups to S3          | P1       | 4h     |

**Exit Criteria:** All endpoints authenticated, safety data persisted, schema migration in version control.

### Sprint 2: Payment & Orders Completion (Week 3-4)

**Theme:** "Money flows correctly"

| #   | Task                                                      | Priority | Effort |
| --- | --------------------------------------------------------- | -------- | ------ |
| 1   | VNPay full integration + IPN signature verification       | P0       | 3d     |
| 2   | MoMo full integration + webhook verification              | P0       | 3d     |
| 3   | Coupon/discount system (DiscountCode model + order logic) | P1       | 2d     |
| 4   | Payment reconciliation cron job                           | P1       | 1d     |
| 5   | Contract versioning (ContractVersion model)               | P1       | 2d     |
| 6   | Standardize Decimal(15,2) across all monetary fields      | P1       | 4h     |

**Exit Criteria:** All 3 Vietnamese payment gateways operational with signature verification. Coupon discounts working.

### Sprint 3: Observability & FE-BE Alignment (Week 5-6)

**Theme:** "See what's happening"

| #   | Task                                                           | Priority | Effort |
| --- | -------------------------------------------------------------- | -------- | ------ |
| 1   | Structured JSON logging (Pino/Winston)                         | P1       | 2d     |
| 2   | Sentry integration (backend + frontend)                        | P1       | 1d     |
| 3   | Health check expansion (DB, Redis, S3)                         | P1       | 4h     |
| 4   | Fix FE-BE type mismatches (User.avatar, OrderStatus, ID types) | P1       | 2d     |
| 5   | WebSocket namespace alignment verification                     | P1       | 4h     |
| 6   | Frontend API service audit (match all paths to controllers)    | P1       | 1d     |
| 7   | Notification template system                                   | P2       | 2d     |

**Exit Criteria:** Production errors visible in Sentry. All FE screens making correct API calls with matching types.

### Sprint 4: RBAC Hardening & Audit Trail (Week 7-8)

**Theme:** "Who did what, when"

| #   | Task                                               | Priority | Effort |
| --- | -------------------------------------------------- | -------- | ------ |
| 1   | Global AuditLog model + interceptor                | P1       | 3d     |
| 2   | Row-level security enforcement across all services | P1       | 3d     |
| 3   | Multi-tenant Organization model (Phase 1: schema)  | P1       | 2d     |
| 4   | Task dependency system (blockers, predecessors)    | P1       | 2d     |
| 5   | QC multi-level approval chain                      | P2       | 2d     |

**Exit Criteria:** All critical operations audited. Users can only access their own organization's data.

### Sprint 5: Scale & Performance (Week 9-10)

**Theme:** "Ready for load"

| #   | Task                                       | Priority | Effort |
| --- | ------------------------------------------ | -------- | ------ |
| 1   | Load testing baseline (k6 or Artillery)    | P1       | 2d     |
| 2   | Redis caching for dashboard queries        | P1       | 2d     |
| 3   | Database query optimization (N+1, indexes) | P1       | 2d     |
| 4   | CDN setup for static assets / uploads      | P2       | 1d     |
| 5   | WebSocket periodic token re-validation     | P1       | 1d     |
| 6   | Prometheus metrics endpoint                | P2       | 1d     |
| 7   | Disaster recovery documentation + drill    | P2       | 1d     |

**Exit Criteria:** Performance baseline documented. Dashboard queries cached. DR plan tested.

---

## 10. IMMEDIATE ACTION LIST — THIS WEEK

### Day 1 (Monday): Security Quick Wins

```bash
# 1. Enable auth guards — 5 files, 5 line changes
# timeline.controller.ts line 26: Uncomment @UseGuards(JwtAuthGuard)
# contract.controller.ts line 30: Uncomment @UseGuards(JwtAuthGuard)
# materials.controller.ts: Add @UseGuards(JwtAuthGuard) at class level
# safety.controller.ts: Add @UseGuards(JwtAuthGuard) at class level
# qc.controller.ts: Add @UseGuards(JwtAuthGuard) at class level

# 2. Fix CORS in main.ts
# Replace origin: '*' with origin: ['https://baotienweb.cloud', /^exp:\/\//]

# 3. Rotate API key
# Generate new key, update .env on VPS, update app config
```

### Day 2 (Tuesday): Safety Module Migration

1. Create Prisma models: `SafetyAudit`, `SafetyIncident`, `PPEDistribution`, `SafetyTraining`, `SafetyFinding`, `TrainingAttendance`
2. Run `prisma migrate dev --name add-safety-models`
3. Rewrite `safety.service.ts` to use Prisma instead of Maps
4. Seed test data
5. Test all 20+ endpoints

### Day 3 (Wednesday): Database & Logs

1. Generate baseline migration: `prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource --script > baseline.sql`
2. Set up PM2 logrotate: `pm2 install pm2-logrotate; pm2 set pm2-logrotate:max_size 50M; pm2 set pm2-logrotate:retain 10`
3. Set up daily pg_dump backup script
4. Verify disk drops below 90%

### Day 4-5 (Thursday-Friday): Payment Stubs

1. Review VNPay API documentation
2. Implement VNPay IPN callback with `VNPAY_HASH_SECRET` HMAC-SHA512 verification
3. Review MoMo API documentation
4. Implement MoMo webhook with signature verification
5. Test both payment flows end-to-end

---

_End of audit. This document should be treated as a living artifact — update section statuses as issues are resolved._
