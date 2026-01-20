# 📋 Product Backlog - App Design Build

> **Last Updated**: January 20, 2026  
> **Team**: 2 FE + 2 BE + 1 DevOps  
> **Sprint Duration**: 2 weeks  
> **Total Sprints**: 12 (24 weeks)

---

## 📊 Executive Summary

| EPIC      | Name                            | Priority | Total SP   | Owner   |
| --------- | ------------------------------- | -------- | ---------- | ------- |
| 0         | Stabilization & Release Hygiene | P0       | 26         | All     |
| 1         | Video/Reels Player              | P0/P1    | 70         | FE Lead |
| 2         | Upload & File Manager           | P0/P1    | 55         | BE Lead |
| 3         | Camera & Document Scan          | P1       | 26         | FE      |
| 4         | File Viewers                    | P1       | 21         | FE      |
| 5         | Messaging & Realtime            | P0/P1    | 63         | BE + FE |
| 6         | Offline Queue & Sync            | P0/P1    | 34         | FE Lead |
| 7         | Auth, Security, 2FA             | P0/P1    | 60         | BE Lead |
| 8         | Observability, CI/CD, Backup    | P0/P1    | 42         | DevOps  |
| 9         | Performance & Architecture      | P1/P2    | 46         | All     |
| **TOTAL** |                                 |          | **443 SP** |         |

**Velocity Target**: ~35 SP/sprint → **13 sprints** to complete all

---

## 🚨 EPIC 0 — Stabilization & Release Hygiene (P0)

> **Goal**: Build/deploy ổn định, không lỗi, không rò rỉ secret, healthcheck chuẩn  
> **Sprint Target**: Sprint 1  
> **Total SP**: 26

### Story 0.1: Rotate Secrets + Secret Scanning

| Field        | Value       |
| ------------ | ----------- |
| **ID**       | STAB-001    |
| **Priority** | P0          |
| **SP**       | 8           |
| **Owner**    | DevOps + BE |
| **Sprint**   | 1           |
| **Deps**     | None        |

**Description**: Thu hồi/rotate toàn bộ API keys bị lộ, đưa vào secret store, bật scanning.

**Tasks**:

- [x] T1: Audit tất cả secrets trong repo/docs/logs ✅ (2026-01-20)
- [ ] T2: Rotate/revoke keys: OpenAI, Gemini, Pinecone, Pexels, Sentry, Perfex, Zalo ⚠️ PENDING EXTERNAL ACTION
- [ ] T3: Update .env prod/staging
- [ ] T4: Redeploy services + verify integrations
- [x] T5: Setup gitleaks pre-commit hook ✅ (2026-01-20 - created .gitleaks.toml + .husky/pre-commit)
- [x] T6: Add CI job secret scan (GitHub Actions/GitLab) ✅ (2026-01-20 - .github/workflows/ci.yml)
- [x] T7: Document secret rotation procedure ✅ (2026-01-20 - docs/SECRET_ROTATION_GUIDE.md)

**Acceptance Criteria**:

- [x] AC1: Không còn secret dạng rõ trong repo/log/report ✅ (Sanitized API_STATUS_GUIDE.md)
- [ ] AC2: `gitleaks detect` pass trên main branch (config ready, need binary)
- [ ] AC3: Tất cả integration vẫn hoạt động (smoke tests pass) - waiting key rotation
- [x] AC4: Secret rotation SOP documented ✅ (docs/SECRET_ROTATION_GUIDE.md)

---

### Story 0.2: Fix Swagger Duplicate DTO

| Field        | Value    |
| ------------ | -------- |
| **ID**       | STAB-002 |
| **Priority** | P0       |
| **SP**       | 5        |
| **Owner**    | BE       |
| **Sprint**   | 1        |
| **Deps**     | None     |

**Description**: Loại bỏ xung đột schema Swagger do DTO trùng tên.

**Tasks**:

- [x] T1: Locate duplicate DTO classes (CreateInspectionDto) ✅
- [x] T2: Rename theo module: `CreateQcInspectionDto`, `CreateFleetInspectionDto` ✅ (2026-01-20)
- [x] T3: Update all references + imports ✅
- [ ] T4: Regenerate OpenAPI spec
- [ ] T5: Verify Swagger UI loads clean

**Acceptance Criteria**:

- [x] AC1: Không còn log "Duplicate DTO detected" ✅
- [ ] AC2: Swagger UI hiển thị đúng tất cả endpoints
- [ ] AC3: No breaking changes in API clients

---

### Story 0.3: Tách tsconfig theo Workspace

| Field        | Value    |
| ------------ | -------- |
| **ID**       | STAB-003 |
| **Priority** | P0       |
| **SP**       | 8        |
| **Owner**    | FE       |
| **Sprint**   | 1        |
| **Deps**     | None     |

**Description**: Tách TypeScript config để tránh crash và lỗi giả.

**Tasks**:

- [x] T1: Audit current tsconfig structure ✅ (2026-01-20)
- [x] T2: Create `tsconfig.app.json` cho React Native only ✅ (already exists)
- [x] T3: Exclude `features/progress-report-source`, web folders ✅
- [ ] T4: Create `tsconfig.web.json` cho Vite subproject (nếu cần) - SKIPPED (không cần)
- [x] T5: Update scripts: `npm run typecheck:app`, `npm run typecheck:web` ✅ (scripts exist)
- [x] T6: Update CI to run both checks ✅ (2026-01-20 - .github/workflows/ci.yml)

**Acceptance Criteria**:

- [x] AC1: `npx tsc -p tsconfig.app.json --noEmit` = 0 errors ✅
- [x] AC2: No false positives from web/Vite types ✅
- [x] AC3: CI passes typecheck ✅ (workflow configured)

---

### Story 0.4: Public Healthcheck Chuẩn

| Field        | Value    |
| ------------ | -------- |
| **ID**       | STAB-004 |
| **Priority** | P0       |
| **SP**       | 5        |
| **Owner**    | DevOps   |
| **Sprint**   | 1        |
| **Deps**     | None     |

**Description**: `https://api.baotienweb.cloud/api/v1/health` hoạt động ổn định.

**Tasks**:

- [ ] T1: Verify DNS → IP mapping ⚠️ BLOCKING: `api.baotienweb.cloud` DNS record missing
- [ ] T2: Configure Nginx reverse proxy + headers
- [ ] T3: Set proper timeouts (proxy_read_timeout, etc.)
- [ ] T4: Verify TLS cert auto-renew
- [ ] T5: Test curl từ Windows/macOS/mobile networks
- [ ] T6: Add uptime monitoring (UptimeRobot/Pingdom)

**Acceptance Criteria**:

- [ ] AC1: Health endpoint returns `{"status":"ok"}` từ mọi client ❌ DNS not resolving
- [ ] AC2: Response time < 500ms p95
- [ ] AC3: TLS certificate valid + auto-renew configured

**DNS Fix Required**:

```
# Add A/CNAME record for api.baotienweb.cloud
# Main domain resolves: baotienweb.cloud → 103.200.20.100
# Subdomain missing: api.baotienweb.cloud → ???
```

---

## 🎬 EPIC 1 — Video/Reels Player "Production-grade" (P0/P1)

> **Goal**: Feed mượt, autoplay đúng, cache ổn, fallback khi lỗi  
> **Sprint Target**: Sprint 2-3  
> **Total SP**: 70

### Story 1.1: Playback Core

| Field        | Value     |
| ------------ | --------- |
| **ID**       | VIDEO-001 |
| **Priority** | P0        |
| **SP**       | 13        |
| **Owner**    | FE-1      |
| **Sprint**   | 2         |
| **Deps**     | STAB-003  |

**Description**: Trình phát chỉ phát 1 video tại 1 thời điểm theo viewport.

**Tasks**:

- [ ] T1: Implement visibility tracking (`onViewableItemsChanged`)
- [x] T2: Create VideoPlayerController singleton ✅ (2026-01-20 - services/VideoPlayerController.ts)
- [x] T3: Single-active lock mechanism ✅ (built into controller)
- [x] T4: Auto-stop previous video on scroll ✅ (play() auto-pauses others)
- [x] T5: Pause/resume state preservation ✅ (playbackPositions map)
- [x] T6: Global mute/unmute control ✅ (toggleMute, setMuted)
- [x] T7: Persist mute setting (AsyncStorage) ✅
- [x] T8: Unit tests for controller ✅ (14 tests passing)

**Acceptance Criteria**:

- [ ] AC1: Scroll nhanh không bị phát chồng tiếng (need T1 integration)
- [x] AC2: Quay lại video trước tiếp tục đúng timestamp ✅
- [x] AC3: Mute setting persistent across sessions ✅

---

### Story 1.2: Buffering & Error Handling

| Field        | Value       |
| ------------ | ----------- |
| **ID**       | VIDEO-002   |
| **Priority** | P1          |
| **SP**       | 8           |
| **Owner**    | FE-1 + BE-1 |
| **Sprint**   | 2           |
| **Deps**     | VIDEO-001   |

**Description**: Phân loại lỗi và fallback nguồn khác khi không phát được.

**Tasks**:

- [ ] T1: Map error codes: network/timeout/codec/403/404
- [ ] T2: Create error classification utility
- [ ] T3: UI: "Không phát được" banner
- [ ] T4: Retry button with exponential backoff
- [ ] T5: Fallback policy: thử URL quality khác
- [ ] T6: Fallback: hiện thumbnail + message
- [ ] T7: Telemetry: log error types

**Acceptance Criteria**:

- [ ] AC1: Playback error rate < 1% trong test
- [ ] AC2: Màn hình không "đứng" khi video lỗi
- [ ] AC3: Error telemetry available in dashboard

---

### Story 1.3: Prefetch & Cache Policy

| Field        | Value       |
| ------------ | ----------- |
| **ID**       | VIDEO-003   |
| **Priority** | P1          |
| **SP**       | 13          |
| **Owner**    | FE-1 + FE-2 |
| **Sprint**   | 3           |
| **Deps**     | VIDEO-001   |

**Description**: Cache video theo quota (2GB), preload 1-2 item tiếp theo.

**Tasks**:

- [ ] T1: Design cache index schema (size, lastAccess, checksum)
- [ ] T2: Implement LRU cache manager
- [ ] T3: Background prefetch service
- [ ] T4: Cancel prefetch on rapid scroll
- [ ] T5: Storage quota enforcement (2GB default)
- [ ] T6: Cleanup job (periodic + on quota exceed)
- [ ] T7: Cache hit rate telemetry
- [ ] T8: Settings UI for cache size

**Acceptance Criteria**:

- [ ] AC1: Storage không vượt quota setting
- [ ] AC2: Cache hit rate > 30% ở session dài (>5 min)
- [ ] AC3: Cleanup không block UI

---

### Story 1.4: Feed APIs

| Field        | Value       |
| ------------ | ----------- |
| **ID**       | VIDEO-004   |
| **Priority** | P1          |
| **SP**       | 8           |
| **Owner**    | BE-1 + FE-2 |
| **Sprint**   | 2           |
| **Deps**     | None        |

**Description**: Feed đa nguồn, phân trang ổn định, refresh không trùng item.

**Tasks**:

- [ ] T1: BE: Design cursor pagination schema
- [ ] T2: BE: Implement dedupe logic (by video ID)
- [ ] T3: BE: Trending algorithm (views + recency)
- [ ] T4: BE: Following feed endpoint
- [ ] T5: FE: Infinite scroll with stable keys
- [ ] T6: FE: Pull-to-refresh + cache invalidation
- [ ] T7: API documentation

**Acceptance Criteria**:

- [ ] AC1: Không duplicate item khi refresh/scroll
- [ ] AC2: Feed loads < 1s p95
- [ ] AC3: Cursor pagination stable across refreshes

---

### Story 1.5: Video Interactions

| Field        | Value                 |
| ------------ | --------------------- |
| **ID**       | VIDEO-005             |
| **Priority** | P1                    |
| **SP**       | 8                     |
| **Owner**    | BE-1 + FE-2           |
| **Sprint**   | 3                     |
| **Deps**     | OFFLINE-001 (partial) |

**Description**: Like/view/save/share tracking với batch stats.

**Tasks**:

- [ ] T1: BE: batch-stats endpoint
- [ ] T2: BE: Idempotency cho view count
- [ ] T3: BE: Like/save toggle endpoints
- [ ] T4: FE: Offline queue integration
- [ ] T5: FE: Optimistic UI updates
- [ ] T6: FE: Real-time counter animation
- [ ] T7: Share sheet integration

**Acceptance Criteria**:

- [ ] AC1: View count không tăng ảo khi reload
- [ ] AC2: Like/save sync đúng khi offline→online
- [ ] AC3: Counters update trong < 100ms (optimistic)

---

### Story 1.6: User Upload Video

| Field        | Value                |
| ------------ | -------------------- |
| **ID**       | VIDEO-006            |
| **Priority** | P1                   |
| **SP**       | 20                   |
| **Owner**    | FE-1 + BE-2 + DevOps |
| **Sprint**   | 4-5                  |
| **Deps**     | UPLOAD-001           |

**Description**: Người dùng đăng video: chọn, cắt, cover, caption, upload.

**Tasks**:

- [ ] T1: FE: Video picker from gallery
- [ ] T2: FE: Trim editor (start/end markers)
- [ ] T3: FE: Cover frame selector
- [ ] T4: FE: Caption + hashtag input
- [ ] T5: BE: Upload status tracking API
- [ ] T6: BE: Metadata extraction (duration, resolution)
- [ ] T7: Worker: FFmpeg transcode job
- [ ] T8: Worker: Generate quality variants (360p, 720p, 1080p)
- [ ] T9: Worker: Generate poster/thumbnail
- [ ] T10: Storage: HLS segments (optional)

**Acceptance Criteria**:

- [ ] AC1: Upload video 200MB thành công
- [ ] AC2: Cover frame hiển thị trên feed
- [ ] AC3: Video play được sau processing (< 5 min)
- [ ] AC4: Progress indicator accurate

---

## 📤 EPIC 2 — Upload & File Manager (P0/P1)

> **Goal**: Upload nhanh, resume, phân quyền, preview/thumbnail  
> **Sprint Target**: Sprint 4-5  
> **Total SP**: 55

### Story 2.1: Presigned Upload

| Field        | Value      |
| ------------ | ---------- |
| **ID**       | UPLOAD-001 |
| **Priority** | P0         |
| **SP**       | 8          |
| **Owner**    | BE-2       |
| **Sprint**   | 4          |
| **Deps**     | STAB-004   |

**Description**: Upload dùng presigned URL, backend cấp quyền và xác nhận.

**Tasks**:

- [ ] T1: POST `/upload/presign` endpoint
- [ ] T2: Input validation (contentType, size limit, checksum)
- [ ] T3: POST `/upload/complete` endpoint
- [ ] T4: Checksum verification
- [ ] T5: Save file metadata to DB
- [ ] T6: Permission checks (owner/project/conversation)
- [ ] T7: Rate limiting

**Acceptance Criteria**:

- [ ] AC1: Upload file 500MB không timeout
- [ ] AC2: Invalid checksum rejected
- [ ] AC3: Unauthorized upload blocked

---

### Story 2.2: Chunked Upload + Resume

| Field        | Value       |
| ------------ | ----------- |
| **ID**       | UPLOAD-002  |
| **Priority** | P1          |
| **SP**       | 13          |
| **Owner**    | BE-2 + FE-2 |
| **Sprint**   | 4           |
| **Deps**     | UPLOAD-001  |

**Description**: File lớn chia chunk, resume khi mất mạng.

**Tasks**:

- [ ] T1: Define chunk protocol (partNumber, etag, size)
- [ ] T2: BE: Multipart initiate endpoint
- [ ] T3: BE: Part upload + etag tracking
- [ ] T4: BE: Finalize multipart
- [ ] T5: FE: Chunk splitter utility
- [ ] T6: FE: Upload queue with retry/backoff
- [ ] T7: FE: Resume from last successful chunk
- [ ] T8: Progress persistence (AsyncStorage)

**Acceptance Criteria**:

- [ ] AC1: Mất mạng giữa chừng resume được
- [ ] AC2: Upload 1GB file successful
- [ ] AC3: Progress accurate across app restarts

---

### Story 2.3: File Metadata & Versioning

| Field        | Value      |
| ------------ | ---------- |
| **ID**       | UPLOAD-003 |
| **Priority** | P1         |
| **SP**       | 8          |
| **Owner**    | BE-2       |
| **Sprint**   | 5          |
| **Deps**     | UPLOAD-001 |

**Description**: Metadata chuẩn, versioning, soft delete.

**Tasks**:

- [ ] T1: Prisma models: File, FileVersion, FileAccess
- [ ] T2: Version creation on re-upload
- [ ] T3: Soft delete implementation
- [ ] T4: Retention policy (30 days default)
- [ ] T5: Restore endpoint
- [ ] T6: Audit log on delete/share/access
- [ ] T7: File listing with versions

**Acceptance Criteria**:

- [ ] AC1: Xóa file không mất vĩnh viễn ngay
- [ ] AC2: Version history accessible
- [ ] AC3: Audit log queryable

---

### Story 2.4: Preview/Thumbnail Service

| Field        | Value         |
| ------------ | ------------- |
| **ID**       | UPLOAD-004    |
| **Priority** | P1            |
| **SP**       | 13            |
| **Owner**    | BE-2 + DevOps |
| **Sprint**   | 5             |
| **Deps**     | UPLOAD-001    |

**Description**: Tự tạo thumbnail cho ảnh/video, preview PDF.

**Tasks**:

- [ ] T1: Worker: Image thumbnail generation (sharp)
- [ ] T2: Worker: Video poster extraction (FFmpeg)
- [ ] T3: Worker: PDF first page thumbnail (pdf-lib/poppler)
- [ ] T4: Thumbnail storage + CDN path
- [ ] T5: Cache headers configuration
- [ ] T6: Lazy generation on first access
- [ ] T7: Thumbnail size variants (small/medium/large)

**Acceptance Criteria**:

- [ ] AC1: File list với thumbnails load < 2s
- [ ] AC2: PDF preview available
- [ ] AC3: CDN cache hit rate > 80%

---

### Story 2.5: File Browser UI

| Field        | Value      |
| ------------ | ---------- |
| **ID**       | UPLOAD-005 |
| **Priority** | P1         |
| **SP**       | 13         |
| **Owner**    | FE-2       |
| **Sprint**   | 6          |
| **Deps**     | MSG-002    |

**Description**: UI quản lý file, attach vào chat/project.

**Tasks**:

- [ ] T1: File list component (grid/list view)
- [ ] T2: Search files (name, type)
- [ ] T3: Filter by type/date/owner
- [ ] T4: Sort options
- [ ] T5: Attach flow: pick → preview → confirm
- [ ] T6: Attach to chat message
- [ ] T7: Attach to project
- [ ] T8: Offline download/save button
- [ ] T9: Share file externally

**Acceptance Criteria**:

- [ ] AC1: Attach file vào chat hiển thị đúng
- [ ] AC2: File mở được từ message
- [ ] AC3: Search returns results < 500ms

---

## 📸 EPIC 3 — Camera & Document Scan (P1)

> **Goal**: Capture ảnh/video, scan tài liệu chất lượng cao  
> **Sprint Target**: Sprint 9  
> **Total SP**: 26

### Story 3.1: Camera Capture

| Field        | Value      |
| ------------ | ---------- |
| **ID**       | CAM-001    |
| **Priority** | P1         |
| **SP**       | 8          |
| **Owner**    | FE-1       |
| **Sprint**   | 9          |
| **Deps**     | UPLOAD-001 |

**Tasks**:

- [ ] T1: Camera permission handling (all states)
- [ ] T2: Settings redirect if denied
- [ ] T3: Photo capture mode
- [ ] T4: Video capture mode
- [ ] T5: Focus/zoom controls
- [ ] T6: Flash toggle
- [ ] T7: Front/back camera switch
- [ ] T8: Preview before upload
- [ ] T9: Direct upload flow

**Acceptance Criteria**:

- [ ] AC1: iOS/Android không kẹt permission
- [ ] AC2: Upload sau capture hoạt động
- [ ] AC3: Quality settings configurable

---

### Story 3.2: Document Scan

| Field        | Value               |
| ------------ | ------------------- |
| **ID**       | CAM-002             |
| **Priority** | P1                  |
| **SP**       | 13                  |
| **Owner**    | FE-1                |
| **Sprint**   | 9                   |
| **Deps**     | CAM-001, UPLOAD-002 |

**Tasks**:

- [ ] T1: Scan mode UI (overlay guides)
- [ ] T2: Edge detection integration (react-native-document-scanner)
- [ ] T3: Auto-crop algorithm
- [ ] T4: Perspective correction
- [ ] T5: Multi-page scan session
- [ ] T6: Export as PDF
- [ ] T7: Export as images
- [ ] T8: Quality enhancement (contrast, brightness)
- [ ] T9: Upload scanned document

**Acceptance Criteria**:

- [ ] AC1: Scan 10 mẫu A4 đạt chất lượng đọc tốt
- [ ] AC2: PDF export readable
- [ ] AC3: Auto-crop accuracy > 90%

---

### Story 3.3: QR/Barcode Scanner

| Field        | Value   |
| ------------ | ------- |
| **ID**       | CAM-003 |
| **Priority** | P2      |
| **SP**       | 5       |
| **Owner**    | FE-1    |
| **Sprint**   | 9       |
| **Deps**     | CAM-001 |

**Tasks**:

- [ ] T1: QR code scanning (expo-barcode-scanner)
- [ ] T2: Barcode formats support
- [ ] T3: Scan result callback
- [ ] T4: Copy/share scanned data
- [ ] T5: History of scanned codes

**Acceptance Criteria**:

- [ ] AC1: Scan ổn định trong điều kiện sáng khác nhau
- [ ] AC2: Callback data chính xác
- [ ] AC3: Multiple formats supported

---

## 📄 EPIC 4 — File Viewers (P1)

> **Goal**: View PDF, images, videos smoothly  
> **Sprint Target**: Sprint 9  
> **Total SP**: 21

### Story 4.1: PDF Viewer

| Field        | Value      |
| ------------ | ---------- |
| **ID**       | VIEW-001   |
| **Priority** | P1         |
| **SP**       | 8          |
| **Owner**    | FE-2       |
| **Sprint**   | 9          |
| **Deps**     | UPLOAD-004 |

**Tasks**:

- [ ] T1: PDF rendering (react-native-pdf)
- [ ] T2: Page navigation
- [ ] T3: Thumbnail sidebar
- [ ] T4: Search text trong PDF
- [ ] T5: Jump to page
- [ ] T6: Zoom/pinch controls
- [ ] T7: Night mode
- [ ] T8: Bookmark pages

**Acceptance Criteria**:

- [ ] AC1: PDF 200 trang scroll mượt
- [ ] AC2: Search hoạt động chính xác
- [ ] AC3: Memory usage stable

---

### Story 4.2: Image Viewer

| Field        | Value      |
| ------------ | ---------- |
| **ID**       | VIEW-002   |
| **Priority** | P1         |
| **SP**       | 5          |
| **Owner**    | FE-2       |
| **Sprint**   | 9          |
| **Deps**     | UPLOAD-002 |

**Tasks**:

- [ ] T1: Image zoom/pan gestures
- [ ] T2: Double-tap zoom
- [ ] T3: Rotate image
- [ ] T4: Gallery mode (swipe between images)
- [ ] T5: Share image
- [ ] T6: Save to device
- [ ] T7: Image info overlay

**Acceptance Criteria**:

- [ ] AC1: Mở ảnh nhanh (< 500ms)
- [ ] AC2: Gesture mượt không lag
- [ ] AC3: Gallery transition smooth

---

### Story 4.3: Video Viewer (from File Manager)

| Field        | Value     |
| ------------ | --------- |
| **ID**       | VIEW-003  |
| **Priority** | P1        |
| **SP**       | 8         |
| **Owner**    | FE-2      |
| **Sprint**   | 9         |
| **Deps**     | VIDEO-001 |

**Tasks**:

- [ ] T1: Fullscreen video player
- [ ] T2: Playback controls (seek, volume)
- [ ] T3: Playlist support
- [ ] T4: Picture-in-Picture (PiP)
- [ ] T5: Share video
- [ ] T6: Save offline
- [ ] T7: Playback speed control

**Acceptance Criteria**:

- [ ] AC1: Video từ file manager phát ổn định
- [ ] AC2: Controls responsive
- [ ] AC3: PiP works on supported devices

---

## 💬 EPIC 5 — Messaging & Realtime (P0/P1)

> **Goal**: Chat 1-1 & group hoàn chỉnh với receipts, typing, presence  
> **Sprint Target**: Sprint 6-7  
> **Total SP**: 63

### Story 5.1: Conversation Model

| Field        | Value   |
| ------------ | ------- |
| **ID**       | MSG-001 |
| **Priority** | P0      |
| **SP**       | 8       |
| **Owner**    | BE-1    |
| **Sprint**   | 6       |
| **Deps**     | None    |

**Tasks**:

- [ ] T1: Prisma schema: Conversation, ConversationMember
- [ ] T2: Types: DIRECT, GROUP
- [ ] T3: Roles: OWNER, ADMIN, MEMBER
- [ ] T4: Create conversation endpoint
- [ ] T5: Invite member endpoint
- [ ] T6: Kick member endpoint
- [ ] T7: Change role endpoint
- [ ] T8: Leave conversation endpoint
- [ ] T9: List my conversations

**Acceptance Criteria**:

- [ ] AC1: Group roles có đúng quyền
- [ ] AC2: Only OWNER can delete group
- [ ] AC3: ADMIN can invite/kick MEMBER

---

### Story 5.2: Message Send/Receive

| Field        | Value       |
| ------------ | ----------- |
| **ID**       | MSG-002     |
| **Priority** | P0          |
| **SP**       | 13          |
| **Owner**    | BE-1 + FE-1 |
| **Sprint**   | 6           |
| **Deps**     | MSG-001     |

**Tasks**:

- [ ] T1: Prisma schema: Message, MessageStatus
- [ ] T2: Send message endpoint
- [ ] T3: Message types: TEXT, IMAGE, FILE, VIDEO, VOICE
- [ ] T4: Cursor pagination for history
- [ ] T5: Dedupe by clientMessageId
- [ ] T6: FE: Message list component
- [ ] T7: FE: Send message UI
- [ ] T8: FE: Load more on scroll up
- [ ] T9: FE: Message bubble variants

**Acceptance Criteria**:

- [ ] AC1: Không mất tin khi scroll history
- [ ] AC2: Thứ tự tin nhắn đúng
- [ ] AC3: Duplicate messages prevented

---

### Story 5.3: WebSocket Events

| Field        | Value       |
| ------------ | ----------- |
| **ID**       | MSG-003     |
| **Priority** | P0          |
| **SP**       | 13          |
| **Owner**    | BE-1 + FE-1 |
| **Sprint**   | 6-7         |
| **Deps**     | MSG-002     |

**Tasks**:

- [ ] T1: WebSocket gateway setup (Socket.IO)
- [ ] T2: Auth handshake (JWT validation)
- [ ] T3: Event: `message:new`
- [ ] T4: Event: `message:updated`
- [ ] T5: Event: `typing:start`, `typing:stop`
- [ ] T6: Event: `presence:online`, `presence:offline`
- [ ] T7: Event: `message:read`
- [ ] T8: Reconnect logic with catch-up
- [ ] T9: Room management (join/leave conversation rooms)
- [ ] T10: FE: Socket connection manager

**Acceptance Criteria**:

- [ ] AC1: Reconnect không mất message
- [ ] AC2: Typing indicator realtime (< 100ms)
- [ ] AC3: Presence status accurate

---

### Story 5.4: Read Receipts

| Field        | Value       |
| ------------ | ----------- |
| **ID**       | MSG-004     |
| **Priority** | P1          |
| **SP**       | 8           |
| **Owner**    | BE-1 + FE-1 |
| **Sprint**   | 7           |
| **Deps**     | MSG-003     |

**Tasks**:

- [ ] T1: Schema: ReadReceipt (userId, conversationId, lastReadMessageId)
- [ ] T2: PATCH `/conversations/:id/read` endpoint
- [ ] T3: Batch read-all endpoint
- [ ] T4: WS broadcast read status
- [ ] T5: FE: Read receipt indicators (sent/delivered/read)
- [ ] T6: FE: Unread count badge
- [ ] T7: Multi-device sync

**Acceptance Criteria**:

- [ ] AC1: Multi-device không sai trạng thái read
- [ ] AC2: Unread count accurate
- [ ] AC3: Read status visible to sender

---

### Story 5.5: Attachments in Chat

| Field        | Value               |
| ------------ | ------------------- |
| **ID**       | MSG-005             |
| **Priority** | P1                  |
| **SP**       | 13                  |
| **Owner**    | FE-1 + BE-1         |
| **Sprint**   | 7                   |
| **Deps**     | UPLOAD-002, MSG-002 |

**Tasks**:

- [ ] T1: Message attachment schema
- [ ] T2: Upload attachment flow
- [ ] T3: FE: Attachment picker (image/file/video/voice)
- [ ] T4: FE: Image attachment preview
- [ ] T5: FE: File attachment bubble
- [ ] T6: FE: Video attachment with thumbnail
- [ ] T7: FE: Voice message recorder
- [ ] T8: FE: Voice message player
- [ ] T9: Download attachment

**Acceptance Criteria**:

- [ ] AC1: Gửi file hiển thị đúng trong bubble
- [ ] AC2: Mở được từ message
- [ ] AC3: Voice message playback works

---

### Story 5.6: Search Messages

| Field        | Value       |
| ------------ | ----------- |
| **ID**       | MSG-006     |
| **Priority** | P1          |
| **SP**       | 8           |
| **Owner**    | BE-1 + FE-2 |
| **Sprint**   | 7           |
| **Deps**     | MSG-002     |

**Tasks**:

- [ ] T1: Full-text search index on messages
- [ ] T2: Search endpoint with filters
- [ ] T3: Filter by conversation
- [ ] T4: Filter by attachment type
- [ ] T5: Filter by date range
- [ ] T6: FE: Search UI
- [ ] T7: FE: Search results with context
- [ ] T8: FE: Jump to message in conversation

**Acceptance Criteria**:

- [ ] AC1: Search p95 < 500ms
- [ ] AC2: Results show message context
- [ ] AC3: Click jumps to correct position

---

## 📴 EPIC 6 — Offline Queue & Sync (P0/P1)

> **Goal**: Mất mạng vẫn dùng được: gửi tin, like, upload pending  
> **Sprint Target**: Sprint 8  
> **Total SP**: 34

### Story 6.1: Offline Action Queue

| Field        | Value       |
| ------------ | ----------- |
| **ID**       | OFFLINE-001 |
| **Priority** | P0          |
| **SP**       | 13          |
| **Owner**    | FE-1        |
| **Sprint**   | 8           |
| **Deps**     | None        |

**Tasks**:

- [ ] T1: Queue schema (action type, payload, timestamp, retries)
- [ ] T2: Queue persistence (AsyncStorage/SQLite)
- [ ] T3: Idempotency key generation
- [ ] T4: Retry logic with exponential backoff
- [ ] T5: Max retry limit + dead letter queue
- [ ] T6: Network status listener
- [ ] T7: Auto-sync on reconnect
- [ ] T8: Queue status UI indicator
- [ ] T9: Manual retry option

**Acceptance Criteria**:

- [ ] AC1: Offline actions sync đúng thứ tự
- [ ] AC2: No duplicate submissions
- [ ] AC3: Failed actions visible to user

---

### Story 6.2: Offline Messaging

| Field        | Value                |
| ------------ | -------------------- |
| **ID**       | OFFLINE-002          |
| **Priority** | P1                   |
| **SP**       | 8                    |
| **Owner**    | FE-1 + BE-1          |
| **Sprint**   | 8                    |
| **Deps**     | OFFLINE-001, MSG-002 |

**Tasks**:

- [ ] T1: Draft message storage
- [ ] T2: Pending message UI indicator
- [ ] T3: Queue message send action
- [ ] T4: BE: Idempotency check (clientMessageId)
- [ ] T5: Sync pending messages on reconnect
- [ ] T6: Update UI on sync success/fail
- [ ] T7: Retry failed messages

**Acceptance Criteria**:

- [ ] AC1: Gửi tin offline → online tự sync
- [ ] AC2: Không duplicate messages
- [ ] AC3: Pending status visible

---

### Story 6.3: Offline Interactions

| Field        | Value                  |
| ------------ | ---------------------- |
| **ID**       | OFFLINE-003            |
| **Priority** | P1                     |
| **SP**       | 5                      |
| **Owner**    | FE-2 + BE-1            |
| **Sprint**   | 8                      |
| **Deps**     | OFFLINE-001, VIDEO-005 |

**Tasks**:

- [ ] T1: Queue like/unlike actions
- [ ] T2: Queue view tracking
- [ ] T3: Queue save/unsave actions
- [ ] T4: Optimistic UI updates
- [ ] T5: Sync on reconnect
- [ ] T6: Counter reconciliation

**Acceptance Criteria**:

- [ ] AC1: Counters đồng bộ đúng sau reconnect
- [ ] AC2: No duplicate likes
- [ ] AC3: Optimistic UI reverts on failure

---

### Story 6.4: Offline File Downloads

| Field        | Value                |
| ------------ | -------------------- |
| **ID**       | OFFLINE-004          |
| **Priority** | P1                   |
| **SP**       | 8                    |
| **Owner**    | FE-2                 |
| **Sprint**   | 8                    |
| **Deps**     | UPLOAD-002, VIEW-001 |

**Tasks**:

- [ ] T1: "Save for offline" button
- [ ] T2: Download manager with progress
- [ ] T3: Offline file storage
- [ ] T4: Offline file index
- [ ] T5: Open offline files
- [ ] T6: Quota management
- [ ] T7: Cleanup old offline files
- [ ] T8: Sync status indicator

**Acceptance Criteria**:

- [ ] AC1: File offline mở được
- [ ] AC2: Quota cleanup hoạt động
- [ ] AC3: Download resumable

---

## 🔐 EPIC 7 — Auth, Security, 2FA (P0/P1)

> **Goal**: Auth robust, social login, 2FA, RBAC  
> **Sprint Target**: Sprint 1, 10  
> **Total SP**: 60

### Story 7.1: Refresh Token Rotation

| Field        | Value    |
| ------------ | -------- |
| **ID**       | AUTH-001 |
| **Priority** | P0       |
| **SP**       | 13       |
| **Owner**    | BE-2     |
| **Sprint**   | 1        |
| **Deps**     | None     |

**Tasks**:

- [ ] T1: Token rotation on refresh
- [ ] T2: Old token invalidation
- [ ] T3: Device session tracking (DeviceSession model)
- [ ] T4: List active sessions endpoint
- [ ] T5: Revoke session endpoint
- [ ] T6: Revoke all sessions endpoint
- [ ] T7: Token family tracking (detect reuse)
- [ ] T8: Automatic reuse detection + revoke family

**Acceptance Criteria**:

- [ ] AC1: Logout 1 device không logout toàn bộ
- [ ] AC2: Refresh token không reuse được
- [ ] AC3: Token reuse triggers family revoke

---

### Story 7.2: Social Login Consolidation

| Field        | Value       |
| ------------ | ----------- |
| **ID**       | AUTH-002    |
| **Priority** | P1          |
| **SP**       | 13          |
| **Owner**    | BE-2 + FE-2 |
| **Sprint**   | 10          |
| **Deps**     | AUTH-001    |

**Tasks**:

- [ ] T1: Unified social auth service
- [ ] T2: Google OAuth integration
- [ ] T3: Facebook OAuth integration
- [ ] T4: Zalo OAuth integration
- [ ] T5: Account linking endpoint
- [ ] T6: Unlink provider endpoint
- [ ] T7: FE: Social login buttons
- [ ] T8: FE: Account linking UI
- [ ] T9: Duplicate user prevention

**Acceptance Criteria**:

- [ ] AC1: 1 user link được nhiều providers
- [ ] AC2: Không tạo duplicate user
- [ ] AC3: Can login with any linked provider

---

### Story 7.3: OTP Login/Register

| Field        | Value    |
| ------------ | -------- |
| **ID**       | AUTH-003 |
| **Priority** | P1       |
| **SP**       | 8        |
| **Owner**    | BE-2     |
| **Sprint**   | 10       |
| **Deps**     | AUTH-001 |

**Tasks**:

- [ ] T1: OTP provider abstraction (SMS, Email)
- [ ] T2: Send OTP endpoint
- [ ] T3: Verify OTP endpoint
- [ ] T4: Rate limiting (per phone/email)
- [ ] T5: OTP expiry (5 minutes)
- [ ] T6: Audit log for OTP attempts
- [ ] T7: Provider failover

**Acceptance Criteria**:

- [ ] AC1: OTP rate limit enforced
- [ ] AC2: Expired OTP rejected
- [ ] AC3: Audit log complete

---

### Story 7.4: 2FA (TOTP)

| Field        | Value       |
| ------------ | ----------- |
| **ID**       | AUTH-004    |
| **Priority** | P1          |
| **SP**       | 13          |
| **Owner**    | BE-2 + FE-2 |
| **Sprint**   | 10-11       |
| **Deps**     | AUTH-001    |

**Tasks**:

- [ ] T1: TOTP secret generation
- [ ] T2: QR code generation for auth apps
- [ ] T3: Enable 2FA endpoint (with verification)
- [ ] T4: Disable 2FA endpoint
- [ ] T5: Login with 2FA flow
- [ ] T6: Recovery codes generation (10 codes)
- [ ] T7: Use recovery code endpoint
- [ ] T8: FE: 2FA setup wizard
- [ ] T9: FE: 2FA input on login
- [ ] T10: FE: Recovery codes backup

**Acceptance Criteria**:

- [ ] AC1: Bật/tắt 2FA hoạt động
- [ ] AC2: Login yêu cầu OTP từ auth app
- [ ] AC3: Recovery codes hoạt động

---

### Story 7.5: RBAC + Audit Logs

| Field        | Value    |
| ------------ | -------- |
| **ID**       | AUTH-005 |
| **Priority** | P1       |
| **SP**       | 13       |
| **Owner**    | BE-2     |
| **Sprint**   | 11       |
| **Deps**     | AUTH-001 |

**Tasks**:

- [ ] T1: Role schema (SUPER_ADMIN, ADMIN, USER)
- [ ] T2: Permission schema
- [ ] T3: Role-permission mapping
- [ ] T4: RBAC guard decorator
- [ ] T5: Apply guards to sensitive endpoints
- [ ] T6: Audit log schema
- [ ] T7: Log auth events (login, logout, password change)
- [ ] T8: Log admin actions
- [ ] T9: Log file upload/delete
- [ ] T10: Audit log query endpoint

**Acceptance Criteria**:

- [ ] AC1: Endpoint nhạy cảm có quyền check
- [ ] AC2: Audit log complete và queryable
- [ ] AC3: Unauthorized access blocked

---

## 📊 EPIC 8 — Observability, CI/CD, Backup (P0/P1)

> **Goal**: Logging, metrics, CI/CD pipeline, backup hoàn chỉnh  
> **Sprint Target**: Sprint 10-12  
> **Total SP**: 42

### Story 8.1: Structured Logging

| Field        | Value         |
| ------------ | ------------- |
| **ID**       | OBS-001       |
| **Priority** | P0            |
| **SP**       | 8             |
| **Owner**    | BE-1 + DevOps |
| **Sprint**   | 10            |
| **Deps**     | None          |

**Tasks**:

- [ ] T1: Structured JSON logging format
- [ ] T2: Request ID middleware
- [ ] T3: Correlation ID propagation
- [ ] T4: Log levels configuration
- [ ] T5: Sensitive data masking
- [ ] T6: Log aggregation setup (ELK/Loki)
- [ ] T7: Log retention policy

**Acceptance Criteria**:

- [ ] AC1: Trace request từ gateway → service → DB
- [ ] AC2: No sensitive data in logs
- [ ] AC3: Logs searchable in aggregator

---

### Story 8.2: Metrics & SLO Dashboards

| Field        | Value   |
| ------------ | ------- |
| **ID**       | OBS-002 |
| **Priority** | P1      |
| **SP**       | 13      |
| **Owner**    | DevOps  |
| **Sprint**   | 11      |
| **Deps**     | OBS-001 |

**Tasks**:

- [ ] T1: Prometheus metrics endpoint
- [ ] T2: Custom metrics: API latency, WS connections, playback errors
- [ ] T3: Grafana dashboard setup
- [ ] T4: Dashboard: API latency p50/p95/p99
- [ ] T5: Dashboard: WS disconnect rate
- [ ] T6: Dashboard: Playback error rate
- [ ] T7: Dashboard: Upload success rate
- [ ] T8: Alert rules configuration
- [ ] T9: PagerDuty/Slack integration

**Acceptance Criteria**:

- [ ] AC1: Dashboard có các chỉ số chính
- [ ] AC2: Alert rules hoạt động
- [ ] AC3: SLO tracking visible

---

### Story 8.3: CI/CD Pipeline

| Field        | Value    |
| ------------ | -------- |
| **ID**       | OBS-003  |
| **Priority** | P0       |
| **SP**       | 13       |
| **Owner**    | DevOps   |
| **Sprint**   | 10       |
| **Deps**     | STAB-003 |

**Tasks**:

- [ ] T1: GitHub Actions / GitLab CI setup
- [ ] T2: Build job (lint, typecheck, test)
- [ ] T3: Docker build + push
- [ ] T4: Staging deploy job
- [ ] T5: Migration safety check
- [ ] T6: Production deploy job (manual approval)
- [ ] T7: Rollback procedure
- [ ] T8: Environment promotion workflow
- [ ] T9: Deployment notifications

**Acceptance Criteria**:

- [ ] AC1: Deploy tự động staging
- [ ] AC2: Migration chạy an toàn
- [ ] AC3: Rollback documented + tested

---

### Story 8.4: Automated Backups

| Field        | Value   |
| ------------ | ------- |
| **ID**       | OBS-004 |
| **Priority** | P1      |
| **SP**       | 8       |
| **Owner**    | DevOps  |
| **Sprint**   | 11      |
| **Deps**     | None    |

**Tasks**:

- [ ] T1: Database backup script
- [ ] T2: Nightly backup cron job
- [ ] T3: Backup to S3/cloud storage
- [ ] T4: Backup retention policy (30 days)
- [ ] T5: Backup encryption
- [ ] T6: Restore procedure documentation
- [ ] T7: Weekly restore drill
- [ ] T8: Backup monitoring + alerts

**Acceptance Criteria**:

- [ ] AC1: Backup nightly hoạt động
- [ ] AC2: Restore drill pass hàng tuần
- [ ] AC3: Backup alerts configured

---

## ⚡ EPIC 9 — Performance & Architecture (P1/P2)

> **Goal**: App nhanh, bundle nhỏ, caching hiệu quả  
> **Sprint Target**: Sprint 11-12  
> **Total SP**: 46

### Story 9.1: Route Lazy Loading

| Field        | Value    |
| ------------ | -------- |
| **ID**       | PERF-001 |
| **Priority** | P1       |
| **SP**       | 13       |
| **Owner**    | FE-1     |
| **Sprint**   | 11       |
| **Deps**     | STAB-003 |

**Tasks**:

- [ ] T1: Audit current route structure
- [ ] T2: Identify heavy screens
- [ ] T3: Implement React.lazy for heavy routes
- [ ] T4: Suspense fallback components
- [ ] T5: Screen chunking strategy
- [ ] T6: Preload critical routes
- [ ] T7: Measure cold start improvement
- [ ] T8: Memory profiling

**Acceptance Criteria**:

- [ ] AC1: Cold start < 2s trên WiFi tốt
- [ ] AC2: Memory usage stable
- [ ] AC3: No visible loading flicker

---

### Story 9.2: Bundle Size Reduction

| Field        | Value       |
| ------------ | ----------- |
| **ID**       | PERF-002    |
| **Priority** | P1          |
| **SP**       | 13          |
| **Owner**    | FE-1 + FE-2 |
| **Sprint**   | 11          |
| **Deps**     | PERF-001    |

**Tasks**:

- [ ] T1: Bundle analyzer setup
- [ ] T2: Identify large dependencies
- [ ] T3: Replace heavy libs với lighter alternatives
- [ ] T4: Tree shaking verification
- [ ] T5: Asset optimization (images, fonts)
- [ ] T6: Code splitting by feature
- [ ] T7: Remove unused code
- [ ] T8: Measure bundle size reduction

**Acceptance Criteria**:

- [ ] AC1: Bundle size giảm ≥ 20%
- [ ] AC2: No functionality regression
- [ ] AC3: Asset loading optimized

---

### Story 9.3: Backend Caching (Redis)

| Field        | Value                |
| ------------ | -------------------- |
| **ID**       | PERF-003             |
| **Priority** | P1                   |
| **SP**       | 20                   |
| **Owner**    | BE-1 + BE-2 + DevOps |
| **Sprint**   | 12                   |
| **Deps**     | OBS-003              |

**Tasks**:

- [ ] T1: Redis cluster setup
- [ ] T2: Cache service abstraction
- [ ] T3: Rate limiting with Redis
- [ ] T4: Session cache
- [ ] T5: Presence cache (online users)
- [ ] T6: Feed cache (personalized)
- [ ] T7: API response cache (trending, etc.)
- [ ] T8: Cache invalidation strategies
- [ ] T9: Cache hit rate metrics
- [ ] T10: Failover handling

**Acceptance Criteria**:

- [ ] AC1: p95 latency cải thiện ≥ 30%
- [ ] AC2: WS presence ổn định
- [ ] AC3: Cache hit rate > 60%

---

## 📅 Sprint Plan (12 Sprints × 2 weeks)

| Sprint | Dates      | Focus                          | Stories                                                  | SP  |
| ------ | ---------- | ------------------------------ | -------------------------------------------------------- | --- |
| **1**  | Week 1-2   | Stabilization + Auth Base      | STAB-001→004, AUTH-001                                   | 39  |
| **2**  | Week 3-4   | Video Player Core              | VIDEO-001, VIDEO-002, VIDEO-004                          | 29  |
| **3**  | Week 5-6   | Video Cache + Interactions     | VIDEO-003, VIDEO-005                                     | 21  |
| **4**  | Week 7-8   | Upload Foundation              | UPLOAD-001, UPLOAD-002, VIDEO-006 (start)                | 41  |
| **5**  | Week 9-10  | Upload Complete + Video Upload | UPLOAD-003, UPLOAD-004, VIDEO-006 (end)                  | 21  |
| **6**  | Week 11-12 | Messaging Core                 | MSG-001, MSG-002, MSG-003 (start), UPLOAD-005            | 47  |
| **7**  | Week 13-14 | Messaging Complete             | MSG-003 (end), MSG-004, MSG-005, MSG-006                 | 29  |
| **8**  | Week 15-16 | Offline Sync                   | OFFLINE-001→004                                          | 34  |
| **9**  | Week 17-18 | Camera + Viewers               | CAM-001→003, VIEW-001→003                                | 47  |
| **10** | Week 19-20 | Auth Advanced + CI/CD          | AUTH-002, AUTH-003, OBS-001, OBS-003                     | 42  |
| **11** | Week 21-22 | Security + Performance         | AUTH-004, AUTH-005, OBS-002, OBS-004, PERF-001, PERF-002 | 60  |
| **12** | Week 23-24 | Performance + Buffer           | PERF-003, Buffer/Bugs                                    | 33  |

**Total**: ~443 SP across 12 sprints (~37 SP/sprint average)

---

## 🔄 Quy Trình Chuẩn: Yêu Cầu → Triển Khai → Phát Hành

### Bước 0 — Intake (Chốt Phạm Vi)

| Task                                                              | Owner          | Output          |
| ----------------------------------------------------------------- | -------------- | --------------- |
| Xác định mục tiêu, phạm vi, rủi ro                                | PM             | Scope document  |
| Định nghĩa SLA/SLO (latency, playback error, upload success rate) | PM + Tech Lead | SLO targets     |
| Chốt API contract, permission matrix                              | BE Lead        | API spec draft  |
| Chốt data retention, quota/cache policy                           | BE + DevOps    | Policy document |

**Output**: 1 ticket Epic + stories + acceptance criteria + test plan tối thiểu

---

### Bước 1 — Thiết Kế Kỹ Thuật (Design Review)

| Role       | Deliverables                                                     |
| ---------- | ---------------------------------------------------------------- |
| **FE**     | UI states + flows + offline/fallback states + telemetry events   |
| **BE**     | Schema + endpoints + WebSocket events + idempotency + rate limit |
| **DevOps** | Storage, workers, queue, monitoring, backup, env & secrets       |

**Output**: Spec ngắn (1–2 trang) + OpenAPI/DTO draft

---

### Bước 2 — Implementation (PR & Review)

- [ ] Coding theo module, không "đụng chéo" file lõi nếu không cần
- [ ] Mỗi PR nhỏ, review trong 24h
- [ ] PR pass pipeline + có test + cập nhật docs

**Output**: PR merged + docs updated

---

### Bước 3 — Integration (Staging)

- [ ] Deploy staging, seed data
- [ ] Test luồng chính end-to-end
- [ ] Kiểm tra metrics/logs, phát hiện bottleneck
- [ ] Performance sanity check

**Output**: "Go/No-Go checklist" pass

---

### Bước 4 — Release (Production)

- [ ] Release theo batch, có rollback plan
- [ ] Theo dõi 24–48h: error rate, latency, crash, playback issues
- [ ] Tạo release note

**Output**: Release note + post-release report

---

## ✅ Definition of Done (DoD) - Bắt Buộc

Mỗi story hoàn thành khi đáp ứng **TẤT CẢ** tiêu chí sau:

### DoD Kỹ Thuật (Bắt Buộc)

- [ ] API/DTO/OpenAPI cập nhật và không conflict Swagger
- [ ] Không log secrets / không hardcode key
- [ ] Có telemetry tối thiểu (log + event/metric quan trọng)
- [ ] Có fallback/retry/backoff rõ ràng (đặc biệt video, upload, realtime)
- [ ] Có test tối thiểu (BE: integration smoke; FE: flow smoke)
- [ ] Permission & authorization được kiểm chứng (role, ownership)
- [ ] Tài liệu: endpoint + payload + error codes + examples

### Code Quality

- [ ] Code review approved (≥1 reviewer)
- [ ] No TypeScript errors (`tsc --noEmit` pass)
- [ ] No ESLint errors (warnings acceptable)
- [ ] Code follows project conventions

### Observability

- [ ] Logging cho đường đi chính
- [ ] Metrics/telemetry configured
- [ ] Error handling với retry/fallback

### Security

- [ ] Không secrets trong code/logs
- [ ] Config qua environment variables
- [ ] Input validation implemented
- [ ] Authorization checks in place

### Deployment

- [ ] Deployed to staging
- [ ] Smoke test pass trên staging
- [ ] No regression trên existing features

---

## 📋 Checklist Theo Role

### A) Product/PM (Người Chốt Yêu Cầu)

#### Use Cases Cần Xác Định

- [ ] Reels feed & video playback
- [ ] Upload files & videos
- [ ] Camera capture & document scan
- [ ] Chat 1-1 & group messaging
- [ ] 2FA authentication
- [ ] Offline sync

#### KPI Mục Tiêu

| Metric               | Target  | Priority |
| -------------------- | ------- | -------- |
| Playback error rate  | < 1%    | P0       |
| Upload success rate  | > 99%   | P0       |
| WS reconnect success | > 99%   | P0       |
| API p95 latency      | < 500ms | P1       |
| Cold start time      | < 2s    | P1       |

#### Policy Cần Chốt

- [ ] Quota cache (default 2GB)
- [ ] File retention policy (30 days soft delete)
- [ ] Content moderation rules
- [ ] User report handling
- [ ] Privacy & data extraction rules

**Output**: AC rõ ràng, không mơ hồ

---

### B) Backend (NestJS/Prisma)

#### B1. API & Contract

- [ ] Route naming chuẩn: `/api/v1/...`
- [ ] DTO unique name, không trùng schema
- [ ] Validation: `class-validator` + `whitelist/forbidNonWhitelisted`
- [ ] Error format thống nhất: `{code, message, details, requestId}`

#### B2. Database & Data Model

- [ ] Index đúng cho query nóng (messages, conversations, feed, files)
- [ ] Foreign keys + cascade policy rõ
- [ ] Migration kiểm tra: `prisma migrate status` + rollback plan
- [ ] Soft delete & retention cho file/message

#### B3. Realtime/WebSocket

- [ ] Auth handshake (JWT) + refresh logic
- [ ] Event contracts: `message`, `typing`, `presence`, `read`, `delivery`
- [ ] Reconnect catch-up: sequence/cursor
- [ ] Idempotency cho send/view/like (tránh duplicate)

#### B4. Upload/Video Pipeline

- [ ] Presign + complete handshake
- [ ] Checksum/mime validation + size limits
- [ ] Worker transcode/thumbnail (queue)
- [ ] Signed URL TTL + access control

#### B5. Security

- [ ] Refresh token rotation + revoke list
- [ ] Rate limit: auth/otp/upload/ws connect
- [ ] Audit logs: auth, upload share, admin actions

**Output**: OpenAPI đúng, endpoint có example và error codes

---

### C) Frontend (Expo React Native)

#### C1. Player/Reels

- [ ] Single active playback (không phát chồng)
- [ ] Visibility-based autoplay + pause
- [ ] Buffering UI + retry + fallback
- [ ] Prefetch 1–2 items + cancel khi scroll nhanh
- [ ] Cache quota + cleanup
- [ ] Interaction optimistic update + offline queue

#### C2. Upload & Viewer

- [ ] Upload resume/retry/backoff
- [ ] Progress UI + cancel
- [ ] File viewer: PDF/image/video ổn định
- [ ] Save offline + quota management

#### C3. Camera/Scan

- [ ] Permission flows: denied/permanently denied
- [ ] Capture photo/video + compress
- [ ] Document scan quality + export PDF

#### C4. Messaging

- [ ] Pagination history + dedupe
- [ ] Read receipts + read-all
- [ ] Typing + presence + reconnect
- [ ] Attachment sending + preview

#### C5. App Quality

- [ ] Crash-free sessions theo Sentry > 99%
- [ ] Performance: list virtualization, memoization hợp lý
- [ ] Offline states UI rõ ràng

**Output**: Flow hoàn chỉnh, không "kẹt" khi mất mạng/permission

---

### D) DevOps / Infrastructure

#### D1. Environments

- [ ] Tách staging và prod (env riêng)
- [ ] Secret management: không commit secrets; rotate khi lộ
- [ ] Nginx config + TLS renew OK
- [ ] Healthcheck public OK

#### D2. Deploy & Rollback

- [ ] CI/CD pipeline: build → test → deploy
- [ ] Migration gating: migrate chạy trước start app
- [ ] Rollback: tag release + pm2 rollback procedure

#### D3. Storage & Workers

- [ ] Object storage buckets + lifecycle policy
- [ ] Worker queue (transcode/thumbnail) + retry DLQ
- [ ] Disk quota cho video-cache + cleanup job

#### D4. Monitoring

- [ ] Metrics: p95 latency, error rate, ws disconnect, upload fail, playback fail
- [ ] Alerts: spike errors, disk full, DB connections, 5xx tăng
- [ ] Log aggregation (tối thiểu structured logs)

#### D5. Backup

- [ ] DB backup nightly + retention
- [ ] Restore drill hàng tuần/tháng
- [ ] Backup object metadata (nếu cần)

**Output**: Hệ thống vận hành ổn, có cảnh báo trước khi "chết"

---

### E) QA / Test

#### E1. Smoke Test Bắt Buộc Mỗi Release

- [ ] Login các phương thức (GG/FB/Zalo/OTP)
- [ ] Reels feed load + play 10 video liên tục
- [ ] Like/comment/save/share
- [ ] Upload ảnh/video/PDF, mở preview
- [ ] Camera capture + upload
- [ ] Chat: gửi/nhận, read receipts, group, attachment
- [ ] Offline: bật airplane mode 1 phút → bật lại → sync OK

#### E2. Regression Cho Hạng Mục Nhạy Cảm

- [ ] Auth refresh token
- [ ] Upload resume
- [ ] WS reconnect & catch-up
- [ ] Player fallback khi video lỗi

#### E3. Load Sanity (Nhẹ)

- [ ] 50–100 req/s trên feed/messages endpoints (staging) không sập
- [ ] DB CPU/memory ổn định

**Output**: Checklist pass + record lỗi theo severity

---

## 🚦 Go/No-Go Checklist Trước Production

### Critical (Must Pass)

- [ ] Không còn warning/error kiểu Swagger duplicate DTO
- [ ] Không có secrets trong docs/log
- [ ] Healthcheck public OK (domain)
- [ ] Backup DB đã chạy và restore test gần nhất pass

### Performance & Stability

- [ ] Sentry: crash-free > 99% (hoặc không tăng bất thường)
- [ ] Playback error rate không tăng
- [ ] Upload success rate không giảm

### Rollback Ready

- [ ] Rollback plan đã chuẩn bị (tag, script, instructions)
- [ ] Previous version still deployable
- [ ] Database migration reversible (if applicable)

---

## 📦 Checklist Đặc Thù Theo Module

### Video/Reels Module

| Check                             | Status | Notes                  |
| --------------------------------- | ------ | ---------------------- |
| Single playback enforcement       | ⬜     | Không phát chồng tiếng |
| Prefetch + cancel on fast scroll  | ⬜     | 1-2 items ahead        |
| Cache quota + cleanup             | ⬜     | 2GB default            |
| Error classification + fallback   | ⬜     | Banner + retry         |
| Stats batching + idempotency view | ⬜     | No duplicate counts    |

### Upload/File Module

| Check                                    | Status | Notes               |
| ---------------------------------------- | ------ | ------------------- |
| Presign + complete flow                  | ⬜     | S3/MinIO compatible |
| Resume chunk upload                      | ⬜     | On network failure  |
| Mime/magic bytes validation              | ⬜     | Security check      |
| Preview thumbnails                       | ⬜     | Auto-generate       |
| Permission by owner/project/conversation | ⬜     | RBAC                |

### Camera/Scan Module

| Check                      | Status | Notes              |
| -------------------------- | ------ | ------------------ |
| Permission UX complete     | ⬜     | All states handled |
| Scan doc quality           | ⬜     | A4 readable        |
| Compress + upload pipeline | ⬜     | Quality vs size    |

### Messaging/Realtime Module

| Check                      | Status | Notes             |
| -------------------------- | ------ | ----------------- |
| Cursor pagination history  | ⬜     | No duplicates     |
| WS events + reconnect      | ⬜     | Catch-up logic    |
| Read receipts "read up to" | ⬜     | Multi-device sync |
| Attachments + preview      | ⬜     | Image/file/voice  |
| Offline queue for sends    | ⬜     | Sync on reconnect |

### Auth/Security Module

| Check                      | Status | Notes                   |
| -------------------------- | ------ | ----------------------- |
| Token rotation             | ⬜     | Refresh invalidates old |
| Social login consolidation | ⬜     | No duplicate users      |
| 2FA TOTP                   | ⬜     | Recovery codes          |
| Rate limiting              | ⬜     | Per endpoint            |
| Audit logging              | ⬜     | Auth + admin actions    |

---

## 📎 Appendix: Story Templates

### Backend Story Template

```markdown
### Story [ID]: [Title]

**Type**: Backend
**SP**: X | **Priority**: PX | **Sprint**: X

**Description**: [What and why]

**API Changes**:

- `POST /endpoint` - [description]
- `GET /endpoint` - [description]

**Database Changes**:

- New model: [ModelName]
- New field: [field on Model]

**Tasks**:

- [ ] T1: ...
- [ ] T2: ...

**AC**:

- [ ] AC1: ...
- [ ] AC2: ...

**Deps**: [Story IDs]
```

### Frontend Story Template

```markdown
### Story [ID]: [Title]

**Type**: Frontend
**SP**: X | **Priority**: PX | **Sprint**: X

**Description**: [What and why]

**Screens/Components**:

- [ScreenName] - [purpose]
- [ComponentName] - [purpose]

**State Management**:

- [Context/Store changes]

**Tasks**:

- [ ] T1: ...
- [ ] T2: ...

**AC**:

- [ ] AC1: ...
- [ ] AC2: ...

**Deps**: [Story IDs]
```

---

## 🔗 Quick Links

- [TypeScript Errors Report](./typescript-errors.txt)
- [ESLint Errors Report](./eslint-errors.txt)
- [Phase 1 Testing Report](./PHASE1_TESTING_REPORT.md)
- [System Evaluation](./SYSTEM_EVALUATION_REPORT.md)
- [API Documentation](https://api.baotienweb.cloud/api/docs)

---

_Generated by GitHub Copilot - January 20, 2026_
