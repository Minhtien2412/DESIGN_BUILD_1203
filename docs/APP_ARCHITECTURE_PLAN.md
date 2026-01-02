# App Architecture & Integration Plan
**Date:** November 25, 2025  
**Purpose:** Kế hoạch tích hợp backend modules vào app với UX/UI hiện đại và mạch lạc

---

## 📊 Current App Structure Analysis

### Existing Folders (26 sections)
```
app/
├── (auth)/              ✅ Authentication screens
├── (tabs)/              ✅ Main navigation (Home, Projects, Notifications, Profile)
├── admin/               🟡 Admin features (needs backend integration)
├── call/                🔴 Video call (needs WebRTC integration)
├── checkout/            ✅ Shopping checkout flow
├── communications/      🟡 Chat/messaging (needs WebSocket)
├── construction/        ✅ Construction utilities
├── dashboard/           🟡 Analytics (needs backend)
├── demo/                ⚪ Demo screens
├── finishing/           ✅ Finishing materials
├── food/                ⚪ Food services
├── intro/               ✅ Onboarding
├── legal/               ✅ Terms & policies
├── live/                🔴 Live streaming (needs implementation)
├── materials/           ✅ Building materials catalog
├── messages/            ✅ Chat UI (needs WebSocket backend)
├── product/             ✅ Product details
├── profile/             ✅ User profile & settings
├── projects/            🟡 Projects (needs full backend integration)
├── search/              ✅ Search functionality
├── services/            ✅ Service catalog
├── shopping/            ✅ Shopping features
├── stories/             ✅ Social stories
├── utilities/           ✅ Construction calculators
└── videos/              ✅ Video gallery
```

**Legend:**
- ✅ Fully functional UI
- 🟡 Needs backend integration
- 🔴 Needs implementation
- ⚪ Optional/Demo

---

## 🎯 Backend Modules Mapping

### Phase 1: ✅ COMPLETED
| Module | Backend Endpoints | Frontend Integration | Status |
|--------|-------------------|----------------------|--------|
| **Products** | 6 endpoints | `types/products.ts`, `services/products.ts`, `hooks/useProducts.ts` | ✅ Complete |
| **2FA** | 7 endpoints | `types/two-factor.ts`, `services/two-factor.ts` | ✅ Complete |
| **Projects** | 16 endpoints | `types/projects.ts`, `services/projects.ts` | ✅ Complete |

**Total Phase 1:** 29 endpoints integrated

---

## 🚀 Phase 2: HIGH PRIORITY MODULES

### 1. AI Assistant Module 🤖
**Backend Endpoints:** 10+
**Integration Location:** `app/services/ai-assistant/` (NEW)

#### Backend Capabilities:
- GPT-4 Vision analysis of construction photos
- Automated progress reports
- Error detection in images
- Material estimation from photos
- Chat with AI for construction advice

#### Implementation Plan:
```typescript
// Create new files
types/ai.ts
services/ai.ts
hooks/useAI.ts

// New screens
app/services/ai-assistant/
├── index.tsx              // Main AI chat interface
├── photo-analysis.tsx     // Upload & analyze construction photos
├── progress-report.tsx    // View AI-generated reports
└── history.tsx            // Chat history
```

#### UX Flow:
```
Projects Screen → Project Detail → AI Analysis Button
                                  ↓
                           Photo Upload Modal
                                  ↓
                           GPT-4 Vision Analysis
                                  ↓
                    Results: Progress %, Issues, Recommendations
                                  ↓
                           Generate PDF Report
```

#### Features:
- 📸 Camera integration for instant photo analysis
- 💬 Natural language chat with AI
- 📊 Progress percentage estimation
- ⚠️ Quality issue detection
- 📄 Automated report generation
- 🔍 Material recognition from images

---

### 2. QC/QA Inspection System 📋
**Backend Endpoints:** 17 endpoints
**Integration Location:** `app/projects/qc-qa/` (NEW)

#### Backend Capabilities:
- 5 Inspection Models:
  1. Foundation Checklist
  2. Structural Checklist
  3. MEP (Mechanical, Electrical, Plumbing) Checklist
  4. Finishing Checklist
  5. Landscape Checklist
- Defect tracking
- Quality metrics
- Compliance verification

#### Implementation Plan:
```typescript
// Create new files
types/qc-qa.ts
services/qc-qa.ts
hooks/useQCInspection.ts

// New screens
app/projects/qc-qa/
├── index.tsx                // QC dashboard for project
├── checklist/
│   ├── foundation.tsx       // Foundation inspection
│   ├── structure.tsx        // Structural inspection
│   ├── mep.tsx              // MEP inspection
│   ├── finishing.tsx        // Finishing inspection
│   └── landscape.tsx        // Landscape inspection
├── defects/
│   ├── list.tsx             // Defects list
│   ├── create.tsx           // Report new defect
│   └── [id].tsx             // Defect detail
└── reports/
    ├── compliance.tsx       // Compliance report
    └── quality-metrics.tsx  // Quality metrics dashboard
```

#### UX Flow:
```
Project Detail → QC/QA Tab → Select Inspection Type
                                    ↓
                           Checklist Form (dynamic)
                                    ↓
                    Pass/Fail/NA for each item + Photos
                                    ↓
                           Submit Inspection
                                    ↓
                    Generate Compliance Report
```

#### Features:
- ✅ Digital checklists with photo attachments
- 📊 Real-time quality metrics
- ⚠️ Defect tracking with severity levels
- 📸 Photo evidence for each checkpoint
- 📈 Historical trend analysis
- 🔔 Notifications for critical issues

---

### 3. Contract Management 📝
**Backend Endpoints:** 15+ endpoints
**Integration Location:** `app/projects/contracts/` (NEW)

#### Backend Capabilities:
- Contract lifecycle management
- E-signature integration
- Payment milestones
- Terms & conditions management
- Contract templates
- Document versioning

#### Implementation Plan:
```typescript
// Create new files
types/contracts.ts
services/contracts.ts
hooks/useContracts.ts

// New screens
app/projects/contracts/
├── index.tsx              // Contracts list for project
├── create.tsx             // Create contract from template
├── [id]/
│   ├── index.tsx          // Contract detail
│   ├── edit.tsx           // Edit contract
│   ├── sign.tsx           // E-signature screen
│   └── milestones.tsx     // Payment milestones
└── templates/
    └── index.tsx          // Contract templates library
```

#### UX Flow:
```
Project Detail → Contracts Tab → Create New Contract
                                        ↓
                              Select Template
                                        ↓
                              Fill Contract Details
                                        ↓
                              Add Payment Milestones
                                        ↓
                              Send for E-Signature
                                        ↓
                              Track Signature Status
                                        ↓
                              Contract Active
```

#### Features:
- ✍️ E-signature with SignatureCapture component
- 💰 Payment milestone tracking
- 📄 PDF contract generation
- 🔔 Notifications for signature requests
- 📊 Contract status dashboard
- 🔄 Version control for amendments

---

## 🌐 Phase 3: CROSS-CUTTING FEATURES

### 4. Real-time Communication 🔴
**Technology:** Socket.io WebSockets
**Integration Location:** Multiple screens

#### Implementation Plan:
```typescript
// Already exists
context/WebSocketContext.tsx  // ✅ Already created

// Enhance existing screens
app/messages/[userId].tsx     // Add real-time chat
app/projects/[id].tsx         // Add real-time updates
app/dashboard/               // Add live metrics
```

#### Features to Add:
- 💬 Real-time chat messages
- 🔔 Instant push notifications
- 👥 User presence indicators (online/offline)
- 📊 Live project updates
- ✅ Real-time task status changes
- 📸 Live photo sharing

#### WebSocket Events:
```typescript
// Emit
'message:send'
'project:update'
'task:status:change'
'user:online'

// Listen
'message:received'
'project:updated'
'notification:new'
'user:presence'
```

---

### 5. File Upload System 📤
**Integration Location:** Multiple modules

#### Implementation Plan:
```typescript
// Create new files
services/upload.ts
hooks/useFileUpload.ts

// Features
- Image upload for products
- Photo upload for QC inspections
- Document upload for contracts
- Multiple file selection
- Upload progress tracking
- Image compression
- File validation
```

#### UX Components:
```typescript
components/upload/
├── ImagePicker.tsx          // Camera + Gallery picker
├── FilePicker.tsx           // Document picker
├── UploadProgress.tsx       // Progress bar
└── FilePreview.tsx          // Preview before upload
```

---

### 6. Payment Gateway Integration 💳
**Providers:** Stripe, VNPay, MoMo
**Integration Location:** `app/checkout/` & `app/projects/contracts/`

#### Implementation Plan:
```typescript
types/payments.ts
services/payments.ts
hooks/usePayment.ts

// New screens
app/checkout/payment-gateway.tsx
app/projects/contracts/payment-milestone.tsx
```

#### Payment Flows:
1. **Shopping Cart Payment:**
   ```
   Cart → Checkout → Select Payment → Redirect to Gateway → Callback → Success
   ```

2. **Contract Milestone Payment:**
   ```
   Contract → Milestone Due → Payment Request → Select Method → Pay → Update Status
   ```

---

## 🗺️ UX/UI Flow Diagram (Main User Journeys)

### Journey 1: Construction Project Management
```
┌─────────────────────────────────────────────────────────────────┐
│                        PROJECT LIFECYCLE                        │
└─────────────────────────────────────────────────────────────────┘

1. CREATE PROJECT
   (tabs) Home → Create Project Button → Fill Form → Submit
                                                       ↓
2. PROJECT PLANNING                                 Project Created
   Project Detail → Add Team Members → Create Tasks → Set Milestones
                                                       ↓
3. CONTRACT SIGNING                              Add Contract
   Contracts Tab → Create from Template → E-Sign → Payment Milestones
                                                       ↓
4. CONSTRUCTION PHASE                          Project IN_PROGRESS
   - Daily Progress Photos → AI Analysis → Progress %
   - QC Inspections → Checklists → Pass/Fail
   - Team Chat → Real-time Updates
   - Task Management → Status Changes
                                                       ↓
5. QUALITY CONTROL                            Inspection Phase
   QC/QA Tab → Select Checklist Type → Fill Form → Submit
   Defects Tab → Report Issues → Assign → Track Resolution
                                                       ↓
6. COMPLETION                                   Final Inspection
   Final QC Check → Client Approval → Contract Payment → COMPLETED
```

---

### Journey 2: Vendor Product Management
```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCT VENDOR WORKFLOW                     │
└─────────────────────────────────────────────────────────────────┘

1. VENDOR ONBOARDING
   Register → Verify Email → 2FA Setup → Profile Complete
                                            ↓
2. ADD PRODUCTS                         Vendor Dashboard
   Profile → My Products → Add New → Fill Details → Upload Photos
                                            ↓
3. MODERATION                              DRAFT → Submit
   Admin Review → Approve/Reject → APPROVED
                                            ↓
4. PRODUCT LIVE                         Catalog Visible
   Buyers Browse → Add to Cart → Purchase → Order
                                            ↓
5. ORDER FULFILLMENT                    Vendor Notified
   View Orders → Prepare Shipment → Mark Shipped → Completed
```

---

### Journey 3: AI-Assisted Construction Analysis
```
┌─────────────────────────────────────────────────────────────────┐
│                  AI VISION ANALYSIS WORKFLOW                    │
└─────────────────────────────────────────────────────────────────┘

1. CAPTURE PROGRESS
   Project Detail → Progress Tab → Take Photo / Upload
                                            ↓
2. AI ANALYSIS                          GPT-4 Vision
   Photo Upload → API Processing → Analyze Image
                                            ↓
3. RESULTS                              Analysis Complete
   - Progress Percentage: 65%
   - Issues Detected: 2 defects
   - Material Status: On track
   - Recommendations: Fix foundation cracks
                                            ↓
4. ACTION                               Review Results
   - Create Defect Report (auto-fill from AI)
   - Update Project Progress
   - Generate PDF Report
   - Share with Team
```

---

## 📐 Navigation Architecture

### Root Navigation Structure
```
RootLayout (Stack)
├── (auth)              // Auth screens
│   ├── login
│   ├── register
│   └── 2fa-setup       // NEW: 2FA wizard
│
├── (tabs)              // Main bottom tabs
│   ├── index           // Home
│   ├── projects        // Projects
│   ├── notifications   // Notifications
│   └── profile         // Profile
│
├── admin/              // Admin portal
│   ├── dashboard
│   ├── products-moderation  // NEW: Moderate products
│   ├── users-management
│   └── analytics
│
├── projects/
│   ├── [id]            // Project detail
│   ├── [id]/tasks      // Tasks list
│   ├── [id]/team       // Team management
│   ├── [id]/qc-qa      // NEW: QC/QA module
│   ├── [id]/contracts  // NEW: Contracts module
│   ├── [id]/ai-analysis // NEW: AI analysis
│   └── create
│
├── shopping/
│   ├── products-catalog // Enhanced with backend
│   ├── [category]
│   ├── cart
│   └── checkout
│
├── services/
│   ├── ai-assistant    // NEW: AI chat interface
│   ├── quality-consulting
│   └── ...
│
├── profile/
│   ├── my-products     // Enhanced for vendors
│   ├── security        // Enhanced with 2FA
│   ├── orders
│   ├── payment-history
│   └── settings
│
└── messages/
    ├── index           // Enhanced with WebSocket
    └── [userId]        // Real-time chat
```

---

## 🔗 Module Integration Matrix

| Frontend Module | Backend Module | Status | Files to Create/Update |
|----------------|----------------|--------|------------------------|
| **Products Catalog** | Products API | ✅ Complete | Enhanced with existing services |
| **2FA Setup** | 2FA API | 🟡 Need UI | `app/(auth)/2fa-setup.tsx` |
| **Projects** | Projects API | 🟡 Need Update | Update hooks to use backend |
| **AI Assistant** | AI API | 🔴 Not Started | `types/ai.ts`, `services/ai.ts`, screens |
| **QC/QA** | QC/QA API | 🔴 Not Started | `types/qc-qa.ts`, `services/qc-qa.ts`, screens |
| **Contracts** | Contracts API | 🔴 Not Started | `types/contracts.ts`, `services/contracts.ts`, screens |
| **Chat** | WebSocket | 🟡 Partial | Enhance existing with WebSocket |
| **Payments** | Payment API | 🔴 Not Started | `types/payments.ts`, `services/payments.ts` |
| **File Upload** | Upload API | 🔴 Not Started | `services/upload.ts`, components |

---

## 🎨 Design System Enhancements

### New Components Needed

1. **AI Components**
   - `<AIChatBubble />` - Message bubble with AI avatar
   - `<PhotoAnalysisCard />` - Display analysis results
   - `<ProgressEstimator />` - Visual progress indicator from AI

2. **QC/QA Components**
   - `<ChecklistForm />` - Dynamic checklist with photo upload
   - `<DefectCard />` - Defect display with severity badge
   - `<InspectionTimeline />` - Visual inspection history

3. **Contract Components**
   - `<SignaturePad />` - E-signature canvas
   - `<MilestoneTracker />` - Payment milestone progress
   - `<ContractViewer />` - PDF contract display

4. **Real-time Components**
   - `<PresenceIndicator />` - Online/offline status dot
   - `<LiveNotification />` - Toast for real-time events
   - `<TypingIndicator />` - Show when user is typing

---

## 📊 Data Flow Diagram

### Complete System Architecture
```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React Native)                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │  Screens │──>│  Hooks   │──>│ Services │──>│   API    │    │
│  └──────────┘   └──────────┘   └──────────┘   └────┬─────┘    │
│                                                      │          │
│  ┌──────────────────────────────────────────────────┼─────┐    │
│  │              State Management (Context)          │     │    │
│  │  - Auth  - Cart  - Chat  - Notifications        │     │    │
│  └──────────────────────────────────────────────────┘     │    │
│                                                            │    │
└────────────────────────────────────────────────────────────┼────┘
                                                             │
                                                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND API (NestJS)                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  REST API (http://103.200.20.100:3000/api/v1)                  │
│  ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  Projects  │ │ Products │ │    AI    │ │  QC/QA   │        │
│  │  16 EP     │ │  6 EP    │ │  10 EP   │ │  17 EP   │        │
│  └────────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                                  │
│  ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Contracts  │ │   Auth   │ │ Payments │ │  Upload  │        │
│  │  15 EP     │ │  7 EP    │ │  8 EP    │ │  3 EP    │        │
│  └────────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                                  │
│  WebSocket (Socket.io)                                          │
│  ┌────────────┐ ┌──────────┐ ┌──────────┐                     │
│  │    Chat    │ │  Notify  │ │   Live   │                     │
│  └────────────┘ └──────────┘ └──────────┘                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (PostgreSQL + Redis)               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PostgreSQL 14+ (via Prisma ORM)                                │
│  - Users, Projects, Products, Tasks, Contracts, etc.            │
│                                                                  │
│  Redis 6+ (Cache + Session)                                     │
│  - Session storage                                               │
│  - Real-time presence                                            │
│  - Cache layer                                                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚦 Implementation Priority

### Week 1-2: AI Assistant (HIGH PRIORITY)
- [ ] Create types/ai.ts
- [ ] Create services/ai.ts
- [ ] Create hooks/useAI.ts
- [ ] Build AI chat interface
- [ ] Photo analysis screen
- [ ] Progress report generator

### Week 3-4: QC/QA System (HIGH PRIORITY)
- [ ] Create types/qc-qa.ts
- [ ] Create services/qc-qa.ts
- [ ] Build 5 inspection checklists
- [ ] Defect tracking system
- [ ] Compliance reports

### Week 5-6: Contract Management (MEDIUM PRIORITY)
- [ ] Create types/contracts.ts
- [ ] Create services/contracts.ts
- [ ] E-signature integration
- [ ] Payment milestones
- [ ] Contract templates

### Week 7-8: Real-time Features (MEDIUM PRIORITY)
- [ ] Enhance WebSocket integration
- [ ] Real-time chat
- [ ] Live notifications
- [ ] Presence indicators

### Week 9-10: Product UI + 2FA UI (MEDIUM PRIORITY)
- [ ] Products catalog screens
- [ ] Admin moderation panel
- [ ] 2FA setup wizard
- [ ] Security settings

### Week 11-12: Payments + File Upload (LOW PRIORITY)
- [ ] Payment gateway integration
- [ ] File upload service
- [ ] Upload progress UI
- [ ] Payment history

---

## 📈 Success Metrics

**By End of Phase 2:**
- 70+ backend endpoints integrated
- 15+ new screens created
- 5 major modules complete
- Real-time features live
- AI analysis functional
- QC/QA system operational

**User Experience Goals:**
- ⚡ Fast: < 2s screen load time
- 🎯 Intuitive: Max 3 taps to key features
- 📱 Responsive: Works offline with sync
- 🔔 Real-time: Instant notifications
- 🤖 Smart: AI-powered insights

---

## 🔐 Security Considerations

1. **Authentication:**
   - ✅ JWT tokens with refresh
   - ✅ 2FA for sensitive operations
   - 🔄 Session management
   - 🔄 Biometric login

2. **Data Protection:**
   - 🔄 Encrypted storage (SecureStore)
   - 🔄 HTTPS only
   - 🔄 Input validation
   - 🔄 SQL injection prevention

3. **Authorization:**
   - 🔄 Role-based access control
   - 🔄 Permission checks per screen
   - 🔄 Resource ownership validation

---

## 📝 Next Actions

1. **Review and Approve This Plan** ✅
2. **Start with AI Assistant Module** (Week 1-2)
3. **Create Detailed UX Mockups** for new screens
4. **Setup Development Timeline** with milestones
5. **Begin Implementation** following priority order

---

**Document Owner:** Development Team  
**Last Updated:** November 25, 2025  
**Next Review:** After Week 2 (AI Assistant completion)
