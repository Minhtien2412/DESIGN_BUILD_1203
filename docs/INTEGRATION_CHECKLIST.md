# 📋 BACKEND INTEGRATION CHECKLIST - Chi Tiết Thực Hiện

**Ngày tạo:** 25/11/2025  
**Dựa trên:** Server Production 103.200.20.100  
**Trạng thái BE:** ✅ 140+ endpoints deployed

---

## 🎯 TÓM TẮT TỔNG QUAN

### Đã Có Sẵn Trên Backend (140+ endpoints)
1. ✅ Authentication & Authorization (JWT + 2FA) - 10+ endpoints
2. ✅ Project Management - 20+ endpoints  
3. ✅ Timeline Builder (Gantt) - 15+ endpoints
4. ✅ QA/QC Module - 20+ endpoints
5. ✅ AI Construction Assistant (GPT-4 Vision) - 10+ endpoints
6. ✅ Contract Management - 15+ endpoints
7. ✅ Products Management - 6 endpoints ⭐ NEW
8. ✅ Chat & Real-time (WebSocket) - 10+ endpoints
9. ✅ Video Calls (WebRTC) - 8+ endpoints
10. ✅ Dashboard & Analytics - 15+ endpoints
11. ✅ Payment Gateway (MoMo, VNPay, Stripe) - 10+ endpoints

### Đã Tích Hợp Trong Mobile App
- ✅ Products Module (6 endpoints) - types, services, hooks
- ✅ Two-Factor Auth (7 endpoints) - types, services
- ✅ Projects Basic (16 endpoints) - types, services
- ✅ WebSocket Context - setup but not fully integrated

### Còn Thiếu Hoàn Toàn
- 🔴 AI Assistant UI & Integration (0/10 endpoints)
- 🔴 QC/QA System UI & Integration (0/20 endpoints)
- 🔴 Contract Management UI & Integration (0/15 endpoints)
- 🔴 Timeline Builder UI & Integration (0/15 endpoints)
- 🔴 Video Call UI & Integration (0/8 endpoints)
- 🔴 Payment Gateway UI & Integration (0/10 endpoints)
- 🔴 Dashboard Analytics UI (0/15 endpoints)
- 🔴 Real-time Chat Full Integration (partial)

---

## 📊 PHASE 1: ĐÃ HOÀN THÀNH ✅

### 1.1 Products Management Module
**Files Created:**
- [x] `types/products.ts` (110 lines)
- [x] `services/products.ts` (140 lines)
- [x] `hooks/useProducts.ts` (240 lines)

**Backend Endpoints Integrated (6/6):**
- [x] GET /products/my-products
- [x] POST /products
- [x] GET /products/:id
- [x] PUT /products/:id
- [x] DELETE /products/:id
- [x] POST /products/:id/moderate

**Status:** ✅ Backend integration complete, UI screens needed

---

### 1.2 Two-Factor Authentication
**Files Created:**
- [x] `types/two-factor.ts` (50 lines)
- [x] `services/two-factor.ts` (85 lines)

**Backend Endpoints Integrated (7/7):**
- [x] POST /auth/2fa/enable
- [x] POST /auth/2fa/verify
- [x] POST /auth/2fa/verify-login
- [x] POST /auth/2fa/disable
- [x] POST /auth/2fa/regenerate-backup-codes
- [x] GET /auth/2fa/status
- [x] POST /auth/2fa/verify-backup-code

**Status:** ✅ Backend integration complete, UI wizard needed

---

### 1.3 Projects Management (Basic)
**Files Created:**
- [x] `types/projects.ts` (280 lines)
- [x] `services/projects.ts` (305 lines)

**Backend Endpoints Integrated (16/20):**
- [x] GET /projects (with filters)
- [x] POST /projects
- [x] GET /projects/:id
- [x] PUT /projects/:id
- [x] DELETE /projects/:id
- [x] GET /projects/:id/team
- [x] POST /projects/:id/team
- [x] DELETE /projects/:id/team/:userId
- [x] GET /tasks (with filters)
- [x] POST /projects/:id/tasks
- [x] GET /tasks/:id
- [x] PUT /tasks/:id
- [x] DELETE /tasks/:id
- [x] GET /projects/:id/comments
- [x] POST /projects/:id/comments
- [x] POST /tasks/:id/comments

**Missing Endpoints:**
- [ ] GET /projects/:id/statistics
- [ ] GET /projects/:id/timeline
- [ ] POST /projects/:id/files
- [ ] GET /projects/:id/activities

**Status:** ✅ Core integration done, need full feature integration

---

### 1.4 Configuration
- [x] Updated `config/env.ts` to production server
- [x] API_BASE_URL: http://103.200.20.100:3000
- [x] API_PREFIX: /api/v1

**Status:** ✅ Complete

---

## 🚀 PHASE 2: CẦN THỰC HIỆN NGAY (CRITICAL)

### 2.1 AI Construction Assistant Module 🤖

**Backend Available (10 endpoints):**
```
✅ POST /ai/analyze-progress      - Phân tích ảnh tiến độ (GPT-4 Vision)
✅ POST /ai/generate-report       - Tạo báo cáo tự động
✅ POST /ai/chat                  - Chat với AI assistant
✅ GET  /ai/chat/:projectId/history - Lịch sử chat
✅ POST /ai/detect-errors         - Phát hiện lỗi từ ảnh
✅ POST /ai/estimate-materials    - Ước tính vật liệu từ ảnh
✅ POST /ai/check-quality         - Kiểm tra chất lượng
✅ GET  /ai/reports/:projectId    - Lấy danh sách báo cáo
✅ GET  /ai/reports/:id           - Chi tiết báo cáo
✅ POST /ai/analyze-drawing       - Phân tích bản vẽ
```

**Cần Tạo:**

#### A. Types & Services
```typescript
// types/ai.ts
- [ ] AIAnalysisRequest interface
- [ ] AIAnalysisResponse interface
- [ ] AIChatMessage interface
- [ ] AIReport interface
- [ ] AIErrorDetection interface
- [ ] MaterialEstimate interface

// services/ai.ts
- [ ] analyzeProgressPhoto(projectId, imageBase64)
- [ ] generateReport(projectId, type, dateRange)
- [ ] sendChatMessage(projectId, message)
- [ ] getChatHistory(projectId)
- [ ] detectErrors(imageBase64)
- [ ] estimateMaterials(imageBase64)
- [ ] checkQuality(imageBase64)
- [ ] getReports(projectId)
- [ ] getReportById(id)
- [ ] analyzeDrawing(imageBase64)

// hooks/useAI.ts
- [ ] useAIAnalysis(projectId)
- [ ] useAIChat(projectId)
- [ ] useAIReports(projectId)
```

#### B. UI Screens
```
app/services/ai-assistant/
- [ ] index.tsx                    // Main AI chat interface
- [ ] photo-analysis.tsx           // Upload & analyze photos
- [ ] progress-report.tsx          // View AI-generated reports
- [ ] history.tsx                  // Chat & analysis history
- [ ] error-detection.tsx          // Error detection results
- [ ] material-estimation.tsx      // Material estimates

app/projects/[id]/ai-analysis/
- [ ] index.tsx                    // AI tab in project detail
- [ ] analyze.tsx                  // Quick photo analysis
- [ ] reports.tsx                  // Project AI reports
```

#### C. Components
```
components/ai/
- [ ] AIChatBubble.tsx             // Chat message bubble
- [ ] PhotoAnalysisCard.tsx        // Analysis result card
- [ ] ProgressEstimator.tsx        // Progress percentage display
- [ ] AIInsightCard.tsx            // AI insight/recommendation
- [ ] ErrorDetectionList.tsx       // Detected errors list
- [ ] MaterialEstimateTable.tsx    // Material quantities table
- [ ] ReportPreview.tsx            // Report preview before download
```

**Priority:** 🔴 CRITICAL - Week 1-2

**Estimated Effort:** 40 hours
- Types & Services: 8h
- UI Screens: 20h
- Components: 8h
- Testing & Integration: 4h

---

### 2.2 QC/QA Inspection System Module 📋

**Backend Available (20 endpoints):**
```
# Checklists (5 types)
✅ GET  /qc/checklists              - List all checklists
✅ POST /qc/checklists              - Create checklist
✅ GET  /qc/checklists/:id          - Get checklist
✅ PUT  /qc/checklists/:id          - Update checklist
✅ DELETE /qc/checklists/:id        - Delete checklist

# Checklist Types
✅ GET  /qc/checklists/templates/foundation
✅ GET  /qc/checklists/templates/structure
✅ GET  /qc/checklists/templates/mep
✅ GET  /qc/checklists/templates/finishing
✅ GET  /qc/checklists/templates/landscape

# Inspections
✅ POST /qc/inspections             - Submit inspection
✅ GET  /qc/inspections/:projectId  - Project inspections
✅ GET  /qc/inspections/:id         - Inspection detail

# Defects
✅ POST /qc/defects                 - Report defect
✅ GET  /qc/defects/:projectId      - Project defects
✅ GET  /qc/defects/:id             - Defect detail
✅ PUT  /qc/defects/:id/status      - Update defect status
✅ POST /qc/defects/:id/comment     - Add comment to defect

# Reports
✅ GET  /qc/reports/compliance/:projectId
✅ GET  /qc/reports/quality-metrics/:projectId
```

**Cần Tạo:**

#### A. Types & Services
```typescript
// types/qc-qa.ts
- [ ] ChecklistType enum (Foundation, Structure, MEP, Finishing, Landscape)
- [ ] ChecklistItem interface
- [ ] Checklist interface
- [ ] Inspection interface
- [ ] Defect interface
- [ ] DefectStatus enum (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- [ ] DefectSeverity enum (LOW, MEDIUM, HIGH, CRITICAL)
- [ ] ComplianceReport interface
- [ ] QualityMetrics interface

// services/qc-qa.ts
- [ ] getChecklists(projectId?)
- [ ] createChecklist(data)
- [ ] getChecklistById(id)
- [ ] updateChecklist(id, data)
- [ ] deleteChecklist(id)
- [ ] getChecklistTemplate(type)
- [ ] submitInspection(data)
- [ ] getProjectInspections(projectId)
- [ ] getInspectionById(id)
- [ ] reportDefect(data)
- [ ] getProjectDefects(projectId)
- [ ] getDefectById(id)
- [ ] updateDefectStatus(id, status)
- [ ] addDefectComment(id, comment)
- [ ] getComplianceReport(projectId)
- [ ] getQualityMetrics(projectId)

// hooks/useQC.ts
- [ ] useChecklists(projectId)
- [ ] useInspections(projectId)
- [ ] useDefects(projectId)
- [ ] useQCReports(projectId)
```

#### B. UI Screens
```
app/projects/[id]/qc-qa/
- [ ] index.tsx                    // QC dashboard for project
- [ ] checklist/
     - [ ] foundation.tsx          // Foundation inspection
     - [ ] structure.tsx           // Structural inspection
     - [ ] mep.tsx                 // MEP inspection
     - [ ] finishing.tsx           // Finishing inspection
     - [ ] landscape.tsx           // Landscape inspection
- [ ] defects/
     - [ ] list.tsx                // Defects list
     - [ ] create.tsx              // Report new defect
     - [ ] [id].tsx                // Defect detail
- [ ] reports/
     - [ ] compliance.tsx          // Compliance report
     - [ ] quality-metrics.tsx     // Quality metrics dashboard
```

#### C. Components
```
components/qc/
- [ ] ChecklistForm.tsx            // Dynamic checklist form
- [ ] ChecklistItem.tsx            // Individual checklist item
- [ ] DefectCard.tsx               // Defect display card
- [ ] SeverityBadge.tsx            // Color-coded severity badge
- [ ] InspectionTimeline.tsx       // Visual inspection history
- [ ] ComplianceChart.tsx          // Compliance percentage chart
- [ ] PhotoUpload.tsx              // Multi-photo upload for evidence
- [ ] ChecklistProgress.tsx        // Progress bar for checklist completion
```

**Priority:** 🔴 CRITICAL - Week 3-4

**Estimated Effort:** 50 hours
- Types & Services: 10h
- 5 Checklist Screens: 20h
- Defect Management: 8h
- Reports & Dashboard: 8h
- Components: 4h

---

### 2.3 Contract Management Module 📝

**Backend Available (15 endpoints):**
```
# Contracts
✅ GET  /contracts                  - List contracts
✅ POST /contracts                  - Create contract
✅ GET  /contracts/:id              - Get contract
✅ PUT  /contracts/:id              - Update contract
✅ DELETE /contracts/:id            - Delete contract
✅ POST /contracts/:id/sign         - Sign contract (E-signature)
✅ GET  /contracts/:id/pdf          - Download PDF

# Templates
✅ GET  /contracts/templates        - List templates
✅ GET  /contracts/templates/:id    - Get template

# Payment Milestones
✅ GET  /contracts/:id/milestones   - List milestones
✅ POST /contracts/:id/milestones   - Add milestone
✅ PUT  /milestones/:id             - Update milestone
✅ POST /milestones/:id/pay         - Mark as paid
✅ GET  /milestones/:id/payment     - Payment details

# Versioning
✅ GET  /contracts/:id/versions     - Contract versions
```

**Cần Tạo:**

#### A. Types & Services
```typescript
// types/contracts.ts
- [ ] ContractStatus enum (DRAFT, PENDING_SIGNATURE, ACTIVE, COMPLETED, CANCELLED)
- [ ] Contract interface
- [ ] ContractTemplate interface
- [ ] PaymentMilestone interface
- [ ] MilestoneStatus enum (PENDING, PAID, OVERDUE)
- [ ] Signature interface
- [ ] ContractVersion interface

// services/contracts.ts
- [ ] getContracts(projectId?)
- [ ] createContract(data)
- [ ] getContractById(id)
- [ ] updateContract(id, data)
- [ ] deleteContract(id)
- [ ] signContract(id, signatureData)
- [ ] downloadContractPDF(id)
- [ ] getTemplates()
- [ ] getTemplateById(id)
- [ ] getMilestones(contractId)
- [ ] addMilestone(contractId, data)
- [ ] updateMilestone(id, data)
- [ ] markMilestonePaid(id, paymentData)
- [ ] getPaymentDetails(milestoneId)
- [ ] getContractVersions(id)

// hooks/useContracts.ts
- [ ] useContracts(projectId)
- [ ] useContract(id)
- [ ] useContractTemplates()
- [ ] useMilestones(contractId)
```

#### B. UI Screens
```
app/projects/[id]/contracts/
- [ ] index.tsx                    // Contracts list
- [ ] create.tsx                   // Create from template
- [ ] [contractId]/
     - [ ] index.tsx               // Contract detail
     - [ ] edit.tsx                // Edit contract
     - [ ] sign.tsx                // E-signature screen
     - [ ] milestones.tsx          // Payment milestones
- [ ] templates/
     - [ ] index.tsx               // Template library
```

#### C. Components
```
components/contracts/
- [ ] SignaturePad.tsx             // Canvas for e-signature
- [ ] ContractViewer.tsx           // PDF contract viewer
- [ ] MilestoneTracker.tsx         // Payment milestone tracker
- [ ] ContractStatusBadge.tsx      // Status indicator
- [ ] PaymentSchedule.tsx          // Payment timeline
- [ ] SignatureHistory.tsx         // Who signed when
- [ ] ContractVersionList.tsx      // Version history
```

**Priority:** 🟡 HIGH - Week 5-6

**Estimated Effort:** 40 hours
- Types & Services: 8h
- Contract CRUD Screens: 12h
- E-signature Integration: 10h
- Milestone Management: 6h
- Components: 4h

---

### 2.4 Timeline Builder (Gantt Chart) Module 📅

**Backend Available (15 endpoints):**
```
# Timeline
✅ GET  /timeline/:projectId        - Get project timeline
✅ POST /timeline/:projectId/phases - Add phase
✅ PUT  /phases/:id                 - Update phase
✅ DELETE /phases/:id               - Delete phase
✅ POST /phases/:id/tasks           - Add task to phase
✅ PUT  /tasks/:id/timeline         - Update task timeline
✅ POST /tasks/:id/dependencies     - Set dependencies
✅ GET  /timeline/:projectId/gantt  - Get Gantt data
✅ POST /timeline/:projectId/baseline - Set baseline
✅ GET  /timeline/:projectId/delays - Detect delays
✅ POST /timeline/:projectId/adjust - Auto-adjust timeline
✅ GET  /timeline/:projectId/critical-path - Critical path analysis
✅ POST /timeline/:projectId/export - Export to MS Project XML
✅ GET  /timeline/:projectId/workload - Team workload
✅ POST /timeline/:projectId/milestone - Add milestone
```

**Cần Tạo:**

#### A. Types & Services
```typescript
// types/timeline.ts
- [ ] TimelinePhase interface
- [ ] TimelineTask interface
- [ ] TaskDependency interface
- [ ] DependencyType enum (FINISH_TO_START, START_TO_START, etc.)
- [ ] GanttData interface
- [ ] CriticalPath interface
- [ ] TeamWorkload interface
- [ ] Milestone interface

// services/timeline.ts
- [ ] getProjectTimeline(projectId)
- [ ] addPhase(projectId, data)
- [ ] updatePhase(id, data)
- [ ] deletePhase(id)
- [ ] addTaskToPhase(phaseId, data)
- [ ] updateTaskTimeline(taskId, data)
- [ ] setTaskDependencies(taskId, dependencies)
- [ ] getGanttData(projectId)
- [ ] setBaseline(projectId)
- [ ] detectDelays(projectId)
- [ ] autoAdjustTimeline(projectId)
- [ ] getCriticalPath(projectId)
- [ ] exportToMSProject(projectId)
- [ ] getTeamWorkload(projectId)
- [ ] addMilestone(projectId, data)

// hooks/useTimeline.ts
- [ ] useTimeline(projectId)
- [ ] useGanttChart(projectId)
- [ ] useCriticalPath(projectId)
```

#### B. UI Screens
```
app/projects/[id]/timeline/
- [ ] index.tsx                    // Timeline overview
- [ ] gantt.tsx                    // Gantt chart view
- [ ] critical-path.tsx            // Critical path analysis
- [ ] workload.tsx                 // Team workload distribution
- [ ] milestones.tsx               // Project milestones
```

#### C. Components
```
components/timeline/
- [ ] GanttChart.tsx               // Main Gantt chart (library: react-gantt-chart)
- [ ] PhaseRow.tsx                 // Timeline phase row
- [ ] TaskBar.tsx                  // Task bar in Gantt
- [ ] DependencyLine.tsx           // Task dependency arrows
- [ ] TimelineControls.tsx         // Zoom, filter controls
- [ ] CriticalPathHighlight.tsx    // Highlight critical tasks
- [ ] MilestoneMarker.tsx          // Milestone indicators
- [ ] WorkloadChart.tsx            // Team capacity chart
```

**Priority:** 🟡 HIGH - Week 7-8

**Estimated Effort:** 45 hours
- Types & Services: 8h
- Gantt Chart Integration: 20h (complex library)
- Timeline Management: 8h
- Critical Path & Analytics: 5h
- Components: 4h

---

## 🌐 PHASE 3: CROSS-CUTTING FEATURES

### 3.1 Real-time Communication Enhancement 💬

**Backend Available:**
```
✅ WebSocket (Socket.io) server running
✅ Chat rooms
✅ Online presence
✅ Real-time notifications
✅ File sharing
```

**Current Status:**
- [x] WebSocketContext created
- [x] Basic connection logic
- [ ] Full integration in screens
- [ ] Real-time event handling
- [ ] Presence indicators
- [ ] Live notifications

**Cần Hoàn Thiện:**

#### A. Enhance WebSocket Context
```typescript
// context/WebSocketContext.tsx
- [ ] Add typing indicators
- [ ] Add read receipts
- [ ] Add online/offline detection
- [ ] Add reconnection with exponential backoff
- [ ] Add message queuing for offline mode
```

#### B. Update Existing Screens
```
app/messages/
- [ ] index.tsx
     - [ ] Add real-time message updates
     - [ ] Add online status indicators
     - [ ] Add unread count badges
     
- [ ] [userId].tsx
     - [ ] Add typing indicator
     - [ ] Add read receipts
     - [ ] Add real-time message delivery
     - [ ] Add file upload progress

app/projects/[id]/
- [ ] Add real-time task updates
- [ ] Add real-time team notifications
- [ ] Add live progress updates
```

#### C. Components
```
components/realtime/
- [ ] PresenceIndicator.tsx        // Online/offline dot
- [ ] TypingIndicator.tsx          // "User is typing..."
- [ ] LiveNotification.tsx         // Toast notifications
- [ ] UnreadBadge.tsx              // Unread count badge
- [ ] MessageStatus.tsx            // Sent/delivered/read status
```

**Priority:** 🟡 MEDIUM - Week 9-10

**Estimated Effort:** 25 hours

---

### 3.2 File Upload System 📤

**Backend Available:**
```
✅ POST /upload/image               - Upload single image
✅ POST /upload/images              - Upload multiple images
✅ POST /upload/document            - Upload document
✅ DELETE /upload/:fileId           - Delete file
```

**Cần Tạo:**

```typescript
// services/upload.ts
- [ ] uploadImage(file, options?)
- [ ] uploadMultipleImages(files, onProgress?)
- [ ] uploadDocument(file, type)
- [ ] deleteFile(fileId)
- [ ] compressImage(file, quality)
- [ ] validateFile(file, constraints)

// hooks/useFileUpload.ts
- [ ] useImageUpload()
- [ ] useDocumentUpload()
- [ ] useUploadProgress()

// components/upload/
- [ ] ImagePicker.tsx              // Camera + Gallery
- [ ] FilePicker.tsx               // Document picker
- [ ] UploadProgress.tsx           // Progress bar
- [ ] FilePreview.tsx              // Preview before upload
- [ ] ImageCompressor.tsx          // Compress before upload
```

**Priority:** 🟢 MEDIUM - Week 11

**Estimated Effort:** 15 hours

---

### 3.3 Payment Gateway Integration 💳

**Backend Available (10 endpoints):**
```
# MoMo
✅ POST /payments/momo/create       - Create MoMo payment
✅ POST /payments/momo/callback     - MoMo callback
✅ GET  /payments/momo/status/:id   - Check status

# VNPay
✅ POST /payments/vnpay/create      - Create VNPay payment
✅ GET  /payments/vnpay/callback    - VNPay return URL
✅ POST /payments/vnpay/ipn         - VNPay IPN

# Stripe
✅ POST /payments/stripe/create     - Create Stripe payment
✅ POST /payments/stripe/webhook    - Stripe webhook
✅ GET  /payments/stripe/status/:id - Check status

# General
✅ GET  /payments/history           - Payment history
```

**Cần Tạo:**

```typescript
// types/payments.ts
- [ ] PaymentGateway enum (MOMO, VNPAY, STRIPE)
- [ ] PaymentMethod enum (QR, CARD, BANK_TRANSFER)
- [ ] PaymentStatus enum (PENDING, SUCCESS, FAILED, CANCELLED)
- [ ] PaymentRequest interface
- [ ] PaymentResponse interface
- [ ] PaymentHistory interface

// services/payments.ts
- [ ] createMoMoPayment(amount, orderId, returnUrl)
- [ ] createVNPayPayment(amount, orderId, returnUrl)
- [ ] createStripePayment(amount, orderId)
- [ ] checkPaymentStatus(paymentId)
- [ ] getPaymentHistory(filters?)

// hooks/usePayment.ts
- [ ] usePayment(gateway)
- [ ] usePaymentStatus(paymentId)
- [ ] usePaymentHistory()

// screens
app/checkout/
- [ ] payment-gateway.tsx          // Select gateway & pay
- [ ] payment-success.tsx          // Success screen
- [ ] payment-failed.tsx           // Failed screen

app/projects/[id]/contracts/
- [ ] milestone-payment.tsx        // Pay milestone

// components/payments/
- [ ] PaymentGatewaySelector.tsx   // Choose MoMo/VNPay/Stripe
- [ ] QRPayment.tsx                // Display QR for scan
- [ ] CardPayment.tsx              // Credit card form
- [ ] PaymentStatus.tsx            // Status indicator
- [ ] PaymentHistory.tsx           // History list
```

**Priority:** 🟢 MEDIUM - Week 12

**Estimated Effort:** 30 hours

---

### 3.4 Video Call Integration 📹

**Backend Available (8 endpoints):**
```
✅ POST /video/rooms                - Create room
✅ GET  /video/rooms/:id            - Get room
✅ POST /video/rooms/:id/join       - Join room (get token)
✅ POST /video/rooms/:id/leave      - Leave room
✅ GET  /video/rooms/:id/participants - List participants
✅ POST /video/rooms/:id/mute       - Mute participant
✅ POST /video/rooms/:id/kick       - Kick participant
✅ DELETE /video/rooms/:id          - Delete room
```

**Cần Tạo:**

```typescript
// types/video-call.ts
- [ ] VideoRoom interface
- [ ] Participant interface
- [ ] WebRTCConfig interface

// services/video-call.ts
- [ ] createRoom(projectId, name)
- [ ] getRoom(roomId)
- [ ] joinRoom(roomId)
- [ ] leaveRoom(roomId)
- [ ] getParticipants(roomId)
- [ ] muteParticipant(roomId, userId)
- [ ] kickParticipant(roomId, userId)
- [ ] deleteRoom(roomId)

// screens
app/call/
- [ ] index.tsx                    // Call lobby
- [ ] [roomId].tsx                 // Active call screen
- [ ] settings.tsx                 // Camera/mic settings

// components/video/
- [ ] VideoPlayer.tsx              // Remote video
- [ ] LocalVideo.tsx               // Local camera preview
- [ ] CallControls.tsx             // Mute/hang up buttons
- [ ] ParticipantGrid.tsx          // Grid layout for multiple participants
```

**Priority:** 🟢 LOW - Week 13+

**Estimated Effort:** 35 hours (WebRTC is complex)

---

## 📱 PHASE 4: UI SCREENS FOR COMPLETED MODULES

### 4.1 Products Management UI

**Backend:** ✅ Complete (6 endpoints)  
**Services:** ✅ Complete

**Cần Tạo:**

```
app/shopping/
- [ ] products-vendor-catalog.tsx  // Vendor's product management
- [ ] product-create.tsx           // Create/edit product form
- [ ] product-preview.tsx          // Preview before submit

app/admin/
- [ ] products-moderation.tsx      // Admin approval panel
     - [ ] Pending products list
     - [ ] Approve/Reject buttons
     - [ ] Moderation reason form

app/profile/
- [ ] my-products.tsx ⭐ Enhance   // Vendor dashboard
     - [ ] Add create button
     - [ ] Add status filters (DRAFT/PENDING/APPROVED)
     - [ ] Add edit/delete actions
     - [ ] Add submission workflow

components/products/
- [ ] ProductForm.tsx              // Reusable create/edit form
- [ ] ProductStatusBadge.tsx       // DRAFT/PENDING/APPROVED badge
- [ ] ProductImageGallery.tsx      // Image upload & preview
- [ ] CategorySelector.tsx         // Material/Tool/Equipment/Service
- [ ] ModerationPanel.tsx          // Admin approve/reject UI
- [ ] VendorProductCard.tsx        // Product card for vendor view
```

**Priority:** 🟡 HIGH - Week 9

**Estimated Effort:** 20 hours

---

### 4.2 Two-Factor Authentication UI

**Backend:** ✅ Complete (7 endpoints)  
**Services:** ✅ Complete

**Cần Tạo:**

```
app/(auth)/
- [ ] 2fa-setup.tsx                // Onboarding wizard
     - [ ] Step 1: Intro to 2FA
     - [ ] Step 2: Show QR code
     - [ ] Step 3: Scan with Google Authenticator
     - [ ] Step 4: Verify code
     - [ ] Step 5: Save backup codes
     
- [ ] 2fa-verify.tsx               // Login 2FA verification

app/profile/
- [ ] security.tsx ⭐ Enhance      // Security settings
     - [ ] 2FA enable/disable toggle
     - [ ] Show 2FA status
     - [ ] Regenerate backup codes button
     - [ ] Download backup codes

components/auth/
- [ ] QRCodeDisplay.tsx            // Display QR from base64
- [ ] TOTPInput.tsx                // 6-digit code input
- [ ] BackupCodesDisplay.tsx       // Show backup codes list
- [ ] BackupCodesDownload.tsx      // Download as text file
- [ ] TwoFactorStatus.tsx          // Enabled/disabled indicator
```

**Priority:** 🟡 HIGH - Week 10

**Estimated Effort:** 15 hours

---

### 4.3 Dashboard & Analytics UI

**Backend Available (15 endpoints):**
```
✅ GET  /dashboard/admin            - Admin overview
✅ GET  /dashboard/client/:id       - Client dashboard
✅ GET  /dashboard/engineer/:id     - Engineer dashboard
✅ GET  /dashboard/stats/projects   - Project statistics
✅ GET  /dashboard/stats/tasks      - Task statistics
✅ GET  /dashboard/stats/qc         - QC statistics
✅ GET  /dashboard/stats/ai         - AI usage stats
✅ GET  /dashboard/stats/payments   - Payment statistics
✅ GET  /dashboard/activities       - Recent activities
✅ GET  /dashboard/notifications    - Unread notifications
✅ GET  /dashboard/charts/timeline  - Timeline chart data
✅ GET  /dashboard/charts/budget    - Budget chart data
✅ GET  /dashboard/charts/workload  - Workload distribution
✅ GET  /dashboard/reports          - Available reports
✅ POST /dashboard/reports/export   - Export report
```

**Cần Tạo:**

```
app/dashboard/
- [ ] index.tsx                    // Main dashboard (role-based)
- [ ] admin.tsx                    // Admin-specific dashboard
- [ ] projects-overview.tsx        // Projects analytics
- [ ] tasks-overview.tsx           // Tasks analytics
- [ ] qc-overview.tsx              // QC/QA analytics
- [ ] ai-usage.tsx                 // AI usage statistics
- [ ] payments-overview.tsx        // Payment analytics

components/dashboard/
- [ ] StatCard.tsx                 // KPI card
- [ ] TimelineChart.tsx            // Timeline progress chart
- [ ] BudgetChart.tsx              // Budget vs spent chart
- [ ] WorkloadChart.tsx            // Team workload distribution
- [ ] ActivityFeed.tsx             // Recent activities list
- [ ] NotificationPanel.tsx        // Notifications sidebar
- [ ] ReportExporter.tsx           // Export reports to PDF/Excel
```

**Priority:** 🟢 MEDIUM - Week 11-12

**Estimated Effort:** 35 hours

---

## 🔧 TECHNICAL DEBT & IMPROVEMENTS

### 5.1 Update Existing Hooks

```
hooks/
- [ ] useProjects.ts ⭐ Update     // Use real API instead of mock
     - [ ] Replace mock data
     - [ ] Add real pagination
     - [ ] Add real filters
     - [ ] Add error handling
     
- [ ] useAuth.ts ⭐ Enhance        // Add 2FA support
     - [ ] Handle requires2FA response
     - [ ] Add 2FA verification flow
     - [ ] Store 2FA status
     
- [ ] useNotifications.ts ⭐ Update // Real-time with WebSocket
     - [ ] Connect to WebSocket
     - [ ] Listen for new notifications
     - [ ] Update unread count
```

**Priority:** 🟡 HIGH - Week 9

**Estimated Effort:** 8 hours

---

### 5.2 Error Handling & Loading States

```
services/
- [ ] api.ts ⭐ Enhance
     - [ ] Better error messages
     - [ ] Retry logic for failed requests
     - [ ] Network status detection
     - [ ] Offline queue for mutations
     
components/
- [ ] ErrorBoundary.tsx ⭐ Enhance
     - [ ] Better error UI
     - [ ] Retry button
     - [ ] Report error to Sentry
     
- [ ] LoadingState.tsx
     - [ ] Skeleton screens for all modules
     - [ ] Loading spinners
     - [ ] Progress indicators
```

**Priority:** 🟢 MEDIUM - Continuous

**Estimated Effort:** 10 hours

---

### 5.3 Offline Support

```
utils/
- [ ] offline-queue.ts             // Queue mutations when offline
- [ ] sync-manager.ts              // Sync when back online
- [ ] cache-manager.ts             // Cache GET responses

hooks/
- [ ] useOfflineSync.ts            // Auto-sync hook
- [ ] useNetworkStatus.ts          // Detect online/offline
```

**Priority:** 🟢 LOW - Week 13+

**Estimated Effort:** 20 hours

---

## 📋 IMPLEMENTATION CHECKLIST BY WEEK

### ✅ Week 0: COMPLETED
- [x] Products types, services, hooks
- [x] 2FA types, services
- [x] Projects types, services
- [x] Configuration updates
- [x] Documentation (6,450+ lines)

---

### 🔴 Week 1-2: AI Assistant Module (40h)
**Goal:** Complete AI-powered construction analysis

**Day 1-2:** Types & Services (8h)
- [ ] Create `types/ai.ts`
- [ ] Create `services/ai.ts`
- [ ] Create `hooks/useAI.ts`
- [ ] Test all 10 endpoints

**Day 3-5:** Main Screens (12h)
- [ ] `app/services/ai-assistant/index.tsx` - Chat interface
- [ ] `app/services/ai-assistant/photo-analysis.tsx` - Upload & analyze
- [ ] `app/projects/[id]/ai-analysis/index.tsx` - Project AI tab

**Day 6-8:** Advanced Features (12h)
- [ ] Error detection screen
- [ ] Material estimation screen
- [ ] Progress reports viewer
- [ ] Chat history

**Day 9-10:** Components & Polish (8h)
- [ ] AI chat bubble component
- [ ] Photo analysis card
- [ ] Progress estimator
- [ ] Error detection list
- [ ] Testing & bug fixes

**Deliverables:**
- ✅ AI chat functional
- ✅ Photo analysis working
- ✅ AI reports generated
- ✅ Error detection active

---

### 🔴 Week 3-4: QC/QA System (50h)
**Goal:** Complete quality inspection system

**Day 1-2:** Types & Services (10h)
- [ ] Create `types/qc-qa.ts`
- [ ] Create `services/qc-qa.ts`
- [ ] Create `hooks/useQC.ts`
- [ ] Test all 20 endpoints

**Day 3-7:** Checklist Screens (20h)
- [ ] Foundation checklist (4h)
- [ ] Structure checklist (4h)
- [ ] MEP checklist (4h)
- [ ] Finishing checklist (4h)
- [ ] Landscape checklist (4h)

**Day 8-9:** Defect Management (8h)
- [ ] Defects list screen
- [ ] Create defect form
- [ ] Defect detail screen
- [ ] Defect status updates

**Day 10-11:** Reports & Dashboard (8h)
- [ ] QC dashboard overview
- [ ] Compliance report
- [ ] Quality metrics charts

**Day 12:** Components & Testing (4h)
- [ ] Checklist form component
- [ ] Defect card component
- [ ] Severity badge
- [ ] Testing

**Deliverables:**
- ✅ 5 inspection types working
- ✅ Defect tracking active
- ✅ Reports generated
- ✅ Photo evidence uploaded

---

### 🟡 Week 5-6: Contract Management (40h)
**Goal:** Complete contract & payment milestones

**Day 1-2:** Types & Services (8h)
- [ ] Create `types/contracts.ts`
- [ ] Create `services/contracts.ts`
- [ ] Create `hooks/useContracts.ts`
- [ ] Test all 15 endpoints

**Day 3-5:** CRUD Screens (12h)
- [ ] Contracts list
- [ ] Create contract from template
- [ ] Contract detail viewer
- [ ] Edit contract

**Day 6-8:** E-Signature (10h)
- [ ] Signature pad integration
- [ ] Signature workflow
- [ ] Multi-party signing
- [ ] PDF generation

**Day 9-10:** Milestones (6h)
- [ ] Payment milestones tracker
- [ ] Add/edit milestone
- [ ] Mark as paid
- [ ] Payment history

**Day 11-12:** Components & Testing (4h)
- [ ] Signature pad component
- [ ] Contract viewer
- [ ] Milestone tracker
- [ ] Testing

**Deliverables:**
- ✅ Contracts created
- ✅ E-signatures working
- ✅ Milestones tracked
- ✅ PDF downloads working

---

### 🟡 Week 7-8: Timeline Builder (45h)
**Goal:** Gantt chart & project scheduling

**Day 1-2:** Types & Services (8h)
- [ ] Create `types/timeline.ts`
- [ ] Create `services/timeline.ts`
- [ ] Create `hooks/useTimeline.ts`

**Day 3-8:** Gantt Chart Integration (20h)
- [ ] Research Gantt chart libraries
- [ ] Integrate react-gantt-chart or similar
- [ ] Timeline overview screen
- [ ] Gantt chart view
- [ ] Zoom & pan controls

**Day 9-10:** Timeline Management (8h)
- [ ] Add/edit phases
- [ ] Add/edit tasks
- [ ] Set dependencies
- [ ] Adjust timeline

**Day 11:** Analytics (5h)
- [ ] Critical path analysis
- [ ] Delay detection
- [ ] Team workload

**Day 12:** Testing (4h)
- [ ] Component testing
- [ ] Integration testing
- [ ] Bug fixes

**Deliverables:**
- ✅ Interactive Gantt chart
- ✅ Phase/task management
- ✅ Dependencies working
- ✅ Critical path shown

---

### 🟡 Week 9-10: UI Screens & Real-time (45h)
**Goal:** Products UI, 2FA UI, Real-time enhancement

**Week 9: Products & 2FA UI (20h)**
- [ ] Products vendor catalog (6h)
- [ ] Product create/edit form (6h)
- [ ] Admin moderation panel (4h)
- [ ] 2FA setup wizard (4h)

**Week 10: Real-time Enhancement (25h)**
- [ ] Enhance WebSocket context (8h)
- [ ] Update messages screens (8h)
- [ ] Add presence indicators (4h)
- [ ] Add typing indicators (3h)
- [ ] Add live notifications (2h)

**Deliverables:**
- ✅ Vendors can manage products
- ✅ Admins can moderate
- ✅ 2FA setup working
- ✅ Real-time chat active
- ✅ Online status showing

---

### 🟢 Week 11-12: File Upload & Payments (45h)
**Goal:** File uploads & payment gateways

**Week 11: File Upload (15h)**
- [ ] Upload service & hooks (5h)
- [ ] Image picker component (3h)
- [ ] Document picker (2h)
- [ ] Upload progress (2h)
- [ ] Image compression (3h)

**Week 12: Payment Gateways (30h)**
- [ ] Payment types & services (8h)
- [ ] MoMo integration (7h)
- [ ] VNPay integration (7h)
- [ ] Stripe integration (6h)
- [ ] Testing & bug fixes (2h)

**Deliverables:**
- ✅ File uploads working
- ✅ 3 payment gateways active
- ✅ Payment status tracking
- ✅ Payment history shown

---

### 🟢 Week 13+: Dashboard, Video Call, Polish (70h)
**Goal:** Analytics dashboard & video calls

**Week 13: Dashboard (35h)**
- [ ] Dashboard types & services (6h)
- [ ] Admin dashboard (8h)
- [ ] Client dashboard (6h)
- [ ] Engineer dashboard (6h)
- [ ] Charts & analytics (9h)

**Week 14: Video Call (35h)**
- [ ] Video call types & services (5h)
- [ ] WebRTC integration (15h)
- [ ] Call screens (8h)
- [ ] Call controls (4h)
- [ ] Testing (3h)

**Week 15+: Polish & Optimization**
- [ ] Performance optimization
- [ ] Offline support
- [ ] Error handling improvements
- [ ] UI/UX refinements
- [ ] Testing & QA

**Deliverables:**
- ✅ Full analytics dashboard
- ✅ Video calls working
- ✅ App optimized
- ✅ Production ready

---

## 📊 PROGRESS TRACKING

### Overall Progress

```
Total Backend Endpoints: 140+
Integrated: 32 (23%)
Remaining: 108 (77%)

Estimated Total Effort: 565 hours
Completed: 40 hours (7%)
Remaining: 525 hours (93%)

Timeline: 15+ weeks
Current Week: Week 0 (Planning)
```

### Module Status

| Module | Endpoints | Types | Services | Hooks | Screens | Status |
|--------|-----------|-------|----------|-------|---------|--------|
| **Products** | 6/6 | ✅ | ✅ | ✅ | 🔴 0/5 | 60% |
| **2FA** | 7/7 | ✅ | ✅ | 🔴 | 🔴 0/3 | 40% |
| **Projects** | 16/20 | ✅ | ✅ | 🔴 | 🟡 Partial | 50% |
| **AI Assistant** | 0/10 | 🔴 | 🔴 | 🔴 | 🔴 0/6 | 0% |
| **QC/QA** | 0/20 | 🔴 | 🔴 | 🔴 | 🔴 0/10 | 0% |
| **Contracts** | 0/15 | 🔴 | 🔴 | 🔴 | 🔴 0/6 | 0% |
| **Timeline** | 0/15 | 🔴 | 🔴 | 🔴 | 🔴 0/5 | 0% |
| **Real-time** | Partial | 🟡 | 🟡 | 🔴 | 🔴 0/4 | 20% |
| **File Upload** | 0/4 | 🔴 | 🔴 | 🔴 | 🔴 0/4 | 0% |
| **Payments** | 0/10 | 🔴 | 🔴 | 🔴 | 🔴 0/5 | 0% |
| **Video Call** | 0/8 | 🔴 | 🔴 | 🔴 | 🔴 0/3 | 0% |
| **Dashboard** | 0/15 | 🔴 | 🔴 | 🔴 | 🔴 0/7 | 0% |

Legend:
- ✅ Complete
- 🟡 Partial
- 🔴 Not started

---

## 🎯 QUICK WIN PRIORITIES

### Can Start Immediately (Backend Ready)
1. ✅ **AI Assistant** - High impact, users want this
2. ✅ **QC/QA System** - Critical for construction projects
3. ✅ **Products UI** - Services done, just need screens
4. ✅ **2FA UI** - Services done, just need wizard

### Need Planning First
5. **Contract Management** - Complex workflows
6. **Timeline Builder** - Need Gantt library decision
7. **Payment Gateways** - Need merchant accounts setup

### Can Do Later
8. **Video Call** - Complex, lower priority
9. **Dashboard** - Nice to have
10. **File Upload** - Support feature

---

## 🚨 BLOCKERS & RISKS

### Potential Blockers
- [ ] **Gantt Chart Library:** Need to choose & test (Week 7)
- [ ] **Payment Gateway Credentials:** Need MoMo/VNPay/Stripe accounts
- [ ] **WebRTC:** Complex, may need extra time for video calls
- [ ] **AI Costs:** GPT-4 Vision API costs may be high

### Mitigation Plans
- **Gantt:** Research Week 6, have 2-3 backup libraries
- **Payments:** Set up test accounts Week 11
- **WebRTC:** Allocate buffer time, consider Agora/Twilio if needed
- **AI Costs:** Implement caching, batch processing

---

## 📞 SUPPORT & RESOURCES

### Backend Documentation
- ✅ API_GUIDE_CLIENT.md on server
- ✅ Swagger Docs: http://103.200.20.100:3000/api/docs
- ✅ Health Check: http://103.200.20.100:3000/health

### Frontend Resources
- ✅ APP_ARCHITECTURE_PLAN.md (2,800 lines)
- ✅ UX_FLOW_SITEMAP.md (3,200 lines)
- ✅ BACKEND_INTEGRATION_REPORT.md (450 lines)

### Next Steps
1. **Review this checklist** ✅
2. **Start Week 1: AI Assistant Module**
3. **Daily standup:** Track progress
4. **Weekly review:** Adjust timeline if needed

---

**Document Created:** November 25, 2025  
**Last Updated:** November 25, 2025  
**Status:** Ready for Implementation  
**Total Pages:** 50+  
**Total Checkboxes:** 400+
