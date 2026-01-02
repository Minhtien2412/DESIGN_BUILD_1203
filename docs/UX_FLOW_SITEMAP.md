# UX/UI Flow & Sitemap Diagram
**Visual Guide for App Navigation & User Journeys**

---

## 🗺️ Complete App Sitemap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APP ROOT NAVIGATION                               │
└─────────────────────────────────────────────────────────────────────────────┘

ROOT
 │
 ├─── (auth) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Authentication Flow
 │     ├── login.tsx
 │     ├── register.tsx
 │     ├── forgot-password.tsx
 │     └── 2fa-setup.tsx ⭐ NEW (QR code + TOTP verification)
 │
 ├─── (tabs) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Main App (Bottom Navigation)
 │     │
 │     ├── index.tsx ━━━━━━━━━━━━━━━━━━━━━━━━━━ 🏠 HOME TAB
 │     │    └── Dashboard, Featured Projects, Quick Actions
 │     │
 │     ├── projects/ ━━━━━━━━━━━━━━━━━━━━━━━━━ 📋 PROJECTS TAB
 │     │    ├── index.tsx (Projects List)
 │     │    ├── [id].tsx (Project Detail)
 │     │    │    ├── Overview
 │     │    │    ├── Tasks Tab
 │     │    │    ├── Team Tab
 │     │    │    ├── QC/QA Tab ⭐ NEW
 │     │    │    ├── Contracts Tab ⭐ NEW
 │     │    │    ├── AI Analysis Tab ⭐ NEW
 │     │    │    ├── Files Tab
 │     │    │    └── Chat Tab
 │     │    └── create.tsx (Create Project)
 │     │
 │     ├── notifications/ ━━━━━━━━━━━━━━━━━━━━ 🔔 NOTIFICATIONS TAB
 │     │    └── Real-time updates, AI insights, QC alerts
 │     │
 │     └── profile/ ━━━━━━━━━━━━━━━━━━━━━━━━━ 👤 PROFILE TAB
 │          ├── index.tsx (Profile Home)
 │          ├── edit.tsx
 │          ├── security.tsx (Enhanced with 2FA management) ⭐
 │          ├── my-products.tsx (Vendor Dashboard) ⭐
 │          ├── orders.tsx
 │          ├── payment-history.tsx
 │          ├── favorites.tsx
 │          └── settings.tsx
 │
 ├─── admin/ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 👨‍💼 ADMIN PORTAL
 │     ├── dashboard.tsx
 │     ├── products-moderation.tsx ⭐ NEW (Approve/Reject products)
 │     ├── users-management.tsx
 │     ├── qc-reports.tsx ⭐ NEW (Quality control overview)
 │     └── analytics.tsx
 │
 ├─── projects/ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🏗️ PROJECT MODULES
 │     │
 │     ├── [id]/ ━━━━━━━━━━━━━━━━━━━━━━━━━━━ Project Detail Routes
 │     │    ├── index.tsx (Main view)
 │     │    ├── tasks.tsx (Tasks management)
 │     │    ├── team.tsx (Team members)
 │     │    │
 │     │    ├── qc-qa/ ⭐ NEW ━━━━━━━━━━━━━━━ QC/QA Module
 │     │    │    ├── index.tsx (QC Dashboard)
 │     │    │    ├── checklist/
 │     │    │    │    ├── foundation.tsx
 │     │    │    │    ├── structure.tsx
 │     │    │    │    ├── mep.tsx
 │     │    │    │    ├── finishing.tsx
 │     │    │    │    └── landscape.tsx
 │     │    │    ├── defects/
 │     │    │    │    ├── list.tsx
 │     │    │    │    ├── create.tsx
 │     │    │    │    └── [defectId].tsx
 │     │    │    └── reports/
 │     │    │         ├── compliance.tsx
 │     │    │         └── quality-metrics.tsx
 │     │    │
 │     │    ├── contracts/ ⭐ NEW ━━━━━━━━━━━ Contract Management
 │     │    │    ├── index.tsx (Contracts list)
 │     │    │    ├── create.tsx (From template)
 │     │    │    ├── [contractId]/
 │     │    │    │    ├── index.tsx (Contract detail)
 │     │    │    │    ├── edit.tsx
 │     │    │    │    ├── sign.tsx (E-signature)
 │     │    │    │    └── milestones.tsx (Payment tracking)
 │     │    │    └── templates/
 │     │    │         └── index.tsx (Template library)
 │     │    │
 │     │    └── ai-analysis/ ⭐ NEW ━━━━━━━━━ AI Assistant
 │     │         ├── index.tsx (Upload & analyze)
 │     │         ├── results.tsx (Analysis results)
 │     │         ├── chat.tsx (AI chat interface)
 │     │         └── history.tsx (Past analyses)
 │     │
 │     ├── create.tsx (Project creation wizard)
 │     ├── library.tsx (Project templates)
 │     └── find-contractors.tsx
 │
 ├─── shopping/ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🛒 SHOPPING & PRODUCTS
 │     ├── products-catalog.tsx ⭐ (Enhanced with backend)
 │     ├── [category].tsx
 │     ├── cart.tsx
 │     ├── checkout/
 │     │    ├── index.tsx
 │     │    ├── shipping.tsx
 │     │    ├── payment.tsx (Payment gateway integration) ⭐
 │     │    └── success.tsx
 │     └── compare.tsx
 │
 ├─── services/ ━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🛠️ SERVICES
 │     ├── index.tsx (Services catalog)
 │     ├── ai-assistant/ ⭐ NEW ━━━━━━━━━━━━ AI Services
 │     │    ├── index.tsx (AI chat home)
 │     │    ├── photo-analysis.tsx (Photo upload & analyze)
 │     │    ├── progress-report.tsx (View reports)
 │     │    └── history.tsx (Chat history)
 │     ├── quality-consulting.tsx (QC/QA services)
 │     ├── interior-design.tsx
 │     └── house-design.tsx
 │
 ├─── messages/ ━━━━━━━━━━━━━━━━━━━━━━━━━━━ 💬 MESSAGING
 │     ├── index.tsx (Conversations list) ⭐ (WebSocket)
 │     └── [userId].tsx (Chat screen) ⭐ (Real-time)
 │
 ├─── communications/ ━━━━━━━━━━━━━━━━━━━━━ 📞 COMMUNICATIONS
 │     └── Real-time chat & notifications
 │
 ├─── call/ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 📹 VIDEO CALL
 │     └── WebRTC integration ⭐ (Future)
 │
 ├─── dashboard/ ━━━━━━━━━━━━━━━━━━━━━━━━━━ 📊 ANALYTICS
 │     └── Real-time metrics & insights
 │
 ├─── materials/ ━━━━━━━━━━━━━━━━━━━━━━━━━━ 🧱 MATERIALS CATALOG
 │     └── Building materials database
 │
 ├─── utilities/ ━━━━━━━━━━━━━━━━━━━━━━━━━━ 🧮 CONSTRUCTION TOOLS
 │     ├── cost-estimator.tsx
 │     ├── schedule.tsx
 │     ├── be-tong.tsx (Concrete calculator)
 │     └── ... (more calculators)
 │
 ├─── search/ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🔍 SEARCH
 │     └── Global search (projects, products, services)
 │
 ├─── product/ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 📦 PRODUCT DETAIL
 │     └── [id].tsx
 │
 ├─── construction/ ━━━━━━━━━━━━━━━━━━━━━━━ 🏗️ CONSTRUCTION
 │     └── Construction-specific features
 │
 ├─── finishing/ ━━━━━━━━━━━━━━━━━━━━━━━━━━ 🎨 FINISHING
 │     └── Finishing materials & services
 │
 ├─── videos/ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🎥 VIDEO GALLERY
 │     ├── index.tsx
 │     └── [category].tsx
 │
 ├─── stories/ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 📸 SOCIAL STORIES
 │     └── [userId].tsx
 │
 ├─── legal/ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 📄 LEGAL
 │     ├── terms.tsx
 │     └── privacy.tsx
 │
 └─── intro/ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 👋 ONBOARDING
       └── First-time user guide

Legend:
━━━━ Section Divider
⭐ NEW or Enhanced with Backend Integration
```

---

## 🎯 User Journey Maps

### Journey 1: Project Owner - Complete Construction Project

```
┌───────────────────────────────────────────────────────────────────┐
│                   PROJECT OWNER JOURNEY                           │
└───────────────────────────────────────────────────────────────────┘

START: User needs to build a house

Step 1: ONBOARDING & AUTHENTICATION
┌─────────────────────────────────────┐
│ intro/ → Register → 2FA Setup       │
│ Touch ID: ✓ QR Code: ✓              │
└──────────┬──────────────────────────┘
           │
           ▼
Step 2: CREATE PROJECT
┌─────────────────────────────────────┐
│ (tabs)/index → Create Project       │
│ Fill: Name, Location, Budget        │
│ Upload: Site photos, Plans          │
└──────────┬──────────────────────────┘
           │
           ▼
Step 3: HIRE CONTRACTOR & SIGN CONTRACT
┌─────────────────────────────────────┐
│ projects/[id]/contracts/create      │
│ Select: Template                    │
│ Add: Payment milestones             │
│ E-Sign: Both parties                │
└──────────┬──────────────────────────┘
           │
           ▼
Step 4: BUILD TEAM
┌─────────────────────────────────────┐
│ projects/[id]/team                  │
│ Add: Contractor, Architect, QC      │
│ Assign: Roles & Permissions         │
└──────────┬──────────────────────────┘
           │
           ▼
Step 5: TRACK CONSTRUCTION PROGRESS
┌─────────────────────────────────────┐
│ projects/[id]/ai-analysis           │
│ Upload: Daily progress photos       │
│ AI Analysis: 45% complete ✓         │
│ Issues: None detected ✓             │
└──────────┬──────────────────────────┘
           │
           ▼
Step 6: QUALITY INSPECTIONS
┌─────────────────────────────────────┐
│ projects/[id]/qc-qa                 │
│ Foundation Check: ✓ PASS            │
│ Structure Check: ✓ PASS             │
│ MEP Check: ⚠️ 2 issues              │
│   → Create Defect Report            │
│   → Assign to Contractor            │
└──────────┬──────────────────────────┘
           │
           ▼
Step 7: MILESTONE PAYMENTS
┌─────────────────────────────────────┐
│ projects/[id]/contracts/milestones  │
│ Foundation: ✓ Paid                  │
│ Structure: ✓ Paid                   │
│ Finishing: → Due Nov 30             │
│   → Pay via VNPay                   │
└──────────┬──────────────────────────┘
           │
           ▼
Step 8: COMMUNICATE WITH TEAM
┌─────────────────────────────────────┐
│ messages/[contractorId]             │
│ Real-time: Chat with contractor     │
│ Share: Photos, Documents            │
│ Notifications: ✓ Instant            │
└──────────┬──────────────────────────┘
           │
           ▼
Step 9: FINAL ACCEPTANCE
┌─────────────────────────────────────┐
│ projects/[id]/qc-qa/reports         │
│ Final Inspection: ✓ ALL PASS        │
│ Generate: Compliance PDF            │
│ Project Status: → COMPLETED         │
└──────────┬──────────────────────────┘
           │
           ▼
END: House completed! ✅
```

---

### Journey 2: Vendor - Sell Construction Products

```
┌───────────────────────────────────────────────────────────────────┐
│                     VENDOR JOURNEY                                │
└───────────────────────────────────────────────────────────────────┘

START: Vendor wants to sell cement

Step 1: REGISTER AS VENDOR
┌─────────────────────────────────────┐
│ (auth)/register                     │
│ Select: Vendor account type         │
│ Upload: Business license            │
│ 2FA: ✓ Setup                        │
└──────────┬──────────────────────────┘
           │
           ▼
Step 2: CREATE PRODUCT LISTING
┌─────────────────────────────────────┐
│ profile/my-products → Add New       │
│ Fill:                               │
│  - Name: Xi măng PCB40              │
│  - Category: MATERIAL               │
│  - Price: 85,000 VND/bag            │
│  - Stock: 1000 bags                 │
│  - Upload: 5 photos                 │
│ Status: DRAFT                       │
└──────────┬──────────────────────────┘
           │
           ▼
Step 3: SUBMIT FOR APPROVAL
┌─────────────────────────────────────┐
│ profile/my-products/[id]            │
│ Review info → Submit                │
│ Status: DRAFT → PENDING             │
│ Notification: "Under review"        │
└──────────┬──────────────────────────┘
           │
           ▼
Step 4: ADMIN MODERATION (Admin Side)
┌─────────────────────────────────────┐
│ admin/products-moderation           │
│ Admin reviews product               │
│ Check: Quality, pricing, info       │
│ Decision: APPROVE ✓                 │
│ Reason: "Meets standards"           │
└──────────┬──────────────────────────┘
           │
           ▼
Step 5: PRODUCT GOES LIVE
┌─────────────────────────────────────┐
│ Status: PENDING → APPROVED          │
│ Notification: "Product approved!"   │
│ Visible in: shopping/products       │
└──────────┬──────────────────────────┘
           │
           ▼
Step 6: RECEIVE ORDERS
┌─────────────────────────────────────┐
│ profile/orders                      │
│ New Order #12345                    │
│  - Customer: Nguyễn Văn A           │
│  - Quantity: 50 bags                │
│  - Total: 4,250,000 VND             │
│ Status: NEW                         │
└──────────┬──────────────────────────┘
           │
           ▼
Step 7: FULFILL ORDER
┌─────────────────────────────────────┐
│ profile/orders/12345                │
│ Prepare shipment                    │
│ Upload: Delivery photos             │
│ Mark: SHIPPED                       │
│ Track: Delivery status              │
└──────────┬──────────────────────────┘
           │
           ▼
Step 8: RECEIVE PAYMENT
┌─────────────────────────────────────┐
│ profile/payment-history             │
│ Order #12345: COMPLETED             │
│ Payment: 4,250,000 VND ✓            │
│ Transfer to: Bank account           │
└──────────┬──────────────────────────┘
           │
           ▼
END: Product sold successfully! 💰
```

---

### Journey 3: QC Inspector - Quality Control

```
┌───────────────────────────────────────────────────────────────────┐
│                  QC INSPECTOR JOURNEY                             │
└───────────────────────────────────────────────────────────────────┘

START: Assigned to inspect construction site

Step 1: ACCESS PROJECT
┌─────────────────────────────────────┐
│ (tabs)/projects → Select project    │
│ Project: Biệt thự Phú Quốc          │
│ Role: QC Inspector                  │
└──────────┬──────────────────────────┘
           │
           ▼
Step 2: NAVIGATE TO QC MODULE
┌─────────────────────────────────────┐
│ projects/[id]/qc-qa                 │
│ View: Inspection dashboard          │
│ Pending: Foundation inspection      │
└──────────┬──────────────────────────┘
           │
           ▼
Step 3: START FOUNDATION INSPECTION
┌─────────────────────────────────────┐
│ qc-qa/checklist/foundation          │
│ Checklist (20 items):               │
│  ☑ Excavation depth correct         │
│  ☑ Soil compaction adequate         │
│  ☑ Rebar placement per spec         │
│  ☐ Concrete strength test           │
│     → Take photo of test results    │
│     → Upload: 3 photos              │
│  ☑ Foundation level verified        │
│  ...                                │
└──────────┬──────────────────────────┘
           │
           ▼
Step 4: DETECT ISSUE
┌─────────────────────────────────────┐
│ Item 15: ❌ FAIL                    │
│ Issue: Concrete crack detected      │
│ Severity: HIGH                      │
│ → Create Defect Report              │
└──────────┬──────────────────────────┘
           │
           ▼
Step 5: FILE DEFECT REPORT
┌─────────────────────────────────────┐
│ qc-qa/defects/create                │
│ Title: Foundation crack - Grid A3   │
│ Description: 5cm crack in slab      │
│ Upload: 4 photos of crack           │
│ Assign to: Contractor               │
│ Priority: HIGH                      │
│ Due: Fix within 48h                 │
└──────────┬──────────────────────────┘
           │
           ▼
Step 6: AI ASSISTANCE (Optional)
┌─────────────────────────────────────┐
│ projects/[id]/ai-analysis           │
│ Upload: Crack photo                 │
│ AI Analysis:                        │
│  - Severity: HIGH (4.2cm width)     │
│  - Type: Structural crack           │
│  - Recommendation: Epoxy injection  │
│  - Estimated cost: 5,000,000 VND    │
└──────────┬──────────────────────────┘
           │
           ▼
Step 7: TRACK RESOLUTION
┌─────────────────────────────────────┐
│ qc-qa/defects/[id]                  │
│ Status: ASSIGNED → IN_PROGRESS      │
│ Contractor: Uploaded repair photos  │
│ Inspector: Review fix               │
│ Status: → RESOLVED ✓                │
└──────────┬──────────────────────────┘
           │
           ▼
Step 8: COMPLETE INSPECTION
┌─────────────────────────────────────┐
│ qc-qa/checklist/foundation          │
│ All items: ✓ PASS                   │
│ Submit inspection                   │
│ Generate: PDF report                │
│ Status: Foundation APPROVED         │
└──────────┬──────────────────────────┘
           │
           ▼
Step 9: GENERATE COMPLIANCE REPORT
┌─────────────────────────────────────┐
│ qc-qa/reports/compliance            │
│ Foundation Phase:                   │
│  - Pass rate: 95%                   │
│  - Defects: 1 (resolved)            │
│  - Compliance: ✓ MEETS STANDARDS    │
│ Download: PDF report                │
│ Share: with Project Owner           │
└──────────┬──────────────────────────┘
           │
           ▼
END: Foundation approved! Next: Structure ✅
```

---

## 🔄 System Interaction Flows

### Flow 1: Real-time Communication

```
┌─────────────────────────────────────────────────────────────────┐
│              REAL-TIME MESSAGING FLOW                           │
└─────────────────────────────────────────────────────────────────┘

User A (Project Owner)                    Backend                    User B (Contractor)
       │                                      │                              │
       ├──────── Open Chat ──────────────────>│                              │
       │         messages/[userB]              │                              │
       │                                       │                              │
       │<──── WebSocket Connected ─────────────┤                              │
       │         Socket.io                     │                              │
       │                                       │                              │
       ├──────── Type Message ────────────────>│                              │
       │         "When will foundation finish?"│                              │
       │                                       │                              │
       │                                       ├───── Push Notification ────>│
       │                                       │      "New message from..."   │
       │                                       │                              │
       │                                       │<──── User B comes online ────┤
       │                                       │      WebSocket connect       │
       │                                       │                              │
       │<──── Presence Update ─────────────────┤───── Presence Update ───────>│
       │      "User B is online"               │      "User A is online"      │
       │      🟢 Green dot                      │      🟢 Green dot            │
       │                                       │                              │
       │                                       │<──── User B typing... ───────┤
       │<──── Typing Indicator ────────────────┤                              │
       │      "User B is typing..."            │                              │
       │      💬 bubble animation              │                              │
       │                                       │                              │
       │                                       │<──── Send Reply ─────────────┤
       │<──── Message Received ────────────────┤      "Tomorrow 5pm"          │
       │      Real-time (< 500ms)              │                              │
       │      💬 New bubble appears             │                              │
       │                                       │                              │
       └───────────────────────────────────────┴──────────────────────────────┘
```

---

### Flow 2: AI Photo Analysis

```
┌─────────────────────────────────────────────────────────────────┐
│              AI CONSTRUCTION ANALYSIS FLOW                      │
└─────────────────────────────────────────────────────────────────┘

Mobile App                         Backend API                    OpenAI GPT-4 Vision
    │                                   │                                │
    ├──── Take Photo ─────────────────>│                                │
    │     Camera / Gallery              │                                │
    │     📸 progress-photo.jpg         │                                │
    │                                   │                                │
    ├──── Upload to AI Analysis ──────>│                                │
    │     POST /ai/analyze              │                                │
    │     {                             │                                │
    │       projectId: 123,             │                                │
    │       image: base64...            │                                │
    │     }                             │                                │
    │                                   │                                │
    │<──── Upload Progress ─────────────┤                                │
    │      ▓▓▓▓▓░░░░░ 50%              │                                │
    │                                   │                                │
    │                                   ├──── Send to GPT-4 Vision ────>│
    │                                   │     {                          │
    │                                   │       model: "gpt-4-vision",   │
    │                                   │       messages: [{             │
    │                                   │         role: "user",          │
    │                                   │         content: "Analyze..."  │
    │                                   │       }]                       │
    │                                   │     }                          │
    │                                   │                                │
    │                                   │<──── AI Processing ────────────┤
    │                                   │      (3-5 seconds)             │
    │                                   │                                │
    │                                   │<──── Analysis Results ─────────┤
    │                                   │      {                         │
    │                                   │        progress: 65%,          │
    │                                   │        quality: "Good",        │
    │                                   │        issues: [               │
    │                                   │          "Minor crack..."      │
    │                                   │        ],                      │
    │                                   │        recommendations: [...]  │
    │                                   │      }                         │
    │                                   │                                │
    │<──── Display Results ─────────────┤                                │
    │      ┌─────────────────────────┐  │                                │
    │      │ 📊 Analysis Complete    │  │                                │
    │      │                         │  │                                │
    │      │ Progress: 65% ✓         │  │                                │
    │      │ Quality: Good           │  │                                │
    │      │                         │  │                                │
    │      │ ⚠️ Issues Detected:     │  │                                │
    │      │  • Minor crack at A3    │  │                                │
    │      │                         │  │                                │
    │      │ 💡 Recommendations:     │  │                                │
    │      │  • Fix crack before...  │  │                                │
    │      │                         │  │                                │
    │      │ [Download PDF Report]   │  │                                │
    │      │ [Create Defect Report]  │  │                                │
    │      └─────────────────────────┘  │                                │
    │                                   │                                │
    ├──── Optional: Create Defect ────>│                                │
    │     Auto-fill from AI insights    │                                │
    │                                   │                                │
    ├──── Optional: Generate PDF ─────>│                                │
    │     Include AI analysis           │                                │
    │                                   │                                │
    └───────────────────────────────────┴────────────────────────────────┘
```

---

### Flow 3: Contract E-Signature

```
┌─────────────────────────────────────────────────────────────────┐
│              CONTRACT E-SIGNATURE FLOW                          │
└─────────────────────────────────────────────────────────────────┘

Project Owner                      Backend                      Contractor
      │                               │                              │
      ├──── Create Contract ─────────>│                              │
      │     From template              │                              │
      │     Add terms & milestones     │                              │
      │                                │                              │
      ├──── Send for Signature ───────>│                              │
      │     Invite: contractor@email   │                              │
      │                                │                              │
      │                                ├──── Email Notification ────>│
      │                                │      "Contract ready to sign"│
      │                                │                              │
      │                                │<──── Open Contract ──────────┤
      │                                │      Click email link        │
      │                                │                              │
      │                                │      ┌────────────────────┐  │
      │                                │      │ Contract Viewer    │  │
      │                                │      │                    │  │
      │                                │      │ Review Terms       │  │
      │                                │      │ Payment: 100M VND  │  │
      │                                │      │ Milestones: 4      │  │
      │                                │      │                    │  │
      │                                │      │ [Sign Contract]    │  │
      │                                │      └────────────────────┘  │
      │                                │                              │
      │                                │<──── Draw Signature ──────────┤
      │                                │      ✍️ Signature Pad        │
      │                                │      Canvas component        │
      │                                │                              │
      │                                │<──── Submit Signature ────────┤
      │                                │      POST /contracts/sign    │
      │                                │                              │
      │<──── Notification ─────────────┤                              │
      │      "Contract signed by       │                              │
      │       contractor" ✓            │                              │
      │                                │                              │
      ├──── Owner Signs Too ──────────>│                              │
      │     ✍️ E-signature              │                              │
      │                                │                              │
      │                                ├──── Both Signed ────────────>│
      │                                │      "Contract executed" ✓   │
      │                                │                              │
      │<──── Contract Active ──────────┤──── Contract Active ────────>│
      │      Status: ACTIVE            │      Status: ACTIVE          │
      │      Download PDF ✓            │      Download PDF ✓          │
      │                                │                              │
      └────────────────────────────────┴──────────────────────────────┘
```

---

## 📱 Screen-Level Interaction Details

### Screen: QC/QA Foundation Checklist

```
┌─────────────────────────────────────────────────────┐
│  🔙  Foundation Inspection              [?] Help    │ Header
├─────────────────────────────────────────────────────┤
│                                                     │
│  Project: Biệt thự Phú Quốc                        │ Context
│  Inspector: Nguyễn Văn A                           │
│  Date: Nov 25, 2025                                │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Progress: 12/20 items checked                     │ Progress
│  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 60%                          │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │ Checklist
│  ☑ 1. Excavation depth meets spec   📸 Photo       │ Items
│     ✓ PASS   Comment: 2.5m correct                 │ (Scrollable)
│                                                     │
│  ☑ 2. Soil compaction adequate      📸 Photo       │
│     ✓ PASS   95% compaction achieved               │
│                                                     │
│  ☑ 3. Rebar spacing correct         📸 3 Photos    │
│     ✓ PASS   Per drawing spec                      │
│                                                     │
│  ☐ 4. Concrete strength test        📸 Add Photo   │
│     ○ PASS  ● FAIL  ○ N/A                          │
│     [+] Add Comment                                │
│                                                     │
│  ☐ 5. Foundation waterproofing      📸 Add Photo   │
│     ○ PASS  ● FAIL  ○ N/A                          │
│     [+] Add Comment                                │
│                                                     │
│  ... (15 more items)                               │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │ Actions
│  [Save Draft]        [Submit Inspection]           │
│                                                     │
└─────────────────────────────────────────────────────┘

Interactions:
- Tap checkbox → Mark Pass/Fail/N/A
- Tap 📸 → Open camera or gallery
- Tap item → Expand for detailed view
- Long press → Quick mark as Pass
- Swipe left → Quick mark as Fail
- Pull down → Refresh
- [Submit] → Validation → Generate PDF
```

---

### Screen: AI Photo Analysis

```
┌─────────────────────────────────────────────────────┐
│  🔙  AI Construction Analysis          [Settings]   │ Header
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │                                               │ │ Photo
│  │          📸 Upload Construction Photo         │ │ Upload
│  │                                               │ │ Area
│  │         [Take Photo]  [Choose from Gallery]  │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Recent Analyses:                                  │ History
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 📸 Foundation - Nov 24                      │   │
│  │    Progress: 65% ✓   Issues: 1 ⚠️          │   │
│  │    [View Results]                           │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 📸 Framing - Nov 20                        │   │
│  │    Progress: 40% ✓   Issues: None          │   │
│  │    [View Results]                           │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘

After Upload → Analysis Screen:

┌─────────────────────────────────────────────────────┐
│  🔙  Analysis Results                    [Share]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │      [Uploaded Photo with Annotations]        │ │
│  │                                               │ │
│  │      🔴 Crack detected at A3                  │ │
│  │      🟢 Rebar spacing: Correct               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  📊 Overall Progress: 65%                          │
│  ▓▓▓▓▓▓░░░░░░░░ 65%                               │
│                                                     │
│  ✅ Quality Assessment: Good                       │
│                                                     │
│  ⚠️ Issues Detected (1):                           │
│  • Minor crack at grid A3 (4.2cm width)            │
│    Severity: HIGH                                  │
│    [Create Defect Report]                          │
│                                                     │
│  💡 AI Recommendations:                            │
│  • Repair crack using epoxy injection              │
│  • Monitor for expansion over 7 days               │
│  • Estimated cost: 5,000,000 VND                   │
│                                                     │
│  📄 Actions:                                        │
│  [Download PDF Report]                             │
│  [Share with Team]                                 │
│  [Add to Project Log]                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Design System Components

### Component Hierarchy for New Features

```
AI Module Components:
├── <AIChatBubble>
│   ├── Props: message, isUser, timestamp, avatar
│   ├── Children: Text, Image, Markdown
│   └── Styling: Gradient background, rounded corners
│
├── <PhotoAnalysisCard>
│   ├── Props: image, progress, issues, recommendations
│   ├── Children: Image, ProgressBar, IssuesList, ActionButtons
│   └── Features: Zoomable image, annotated markers
│
└── <ProgressEstimator>
    ├── Props: percentage, color, animated
    ├── Children: AnimatedCircle, Text, Icon
    └── Animation: Spring animation on mount

QC/QA Components:
├── <ChecklistForm>
│   ├── Props: items[], onSubmit, projectId
│   ├── Children: ChecklistItem[], PhotoPicker, CommentInput
│   └── Features: Auto-save draft, validation
│
├── <ChecklistItem>
│   ├── Props: item, status, onStatusChange, photos
│   ├── Children: Checkbox, PhotoGrid, CommentField
│   └── Interactions: Tap, Swipe, Long-press
│
├── <DefectCard>
│   ├── Props: defect, severity, assignee, photos
│   ├── Children: SeverityBadge, AssigneeAvatar, PhotoCarousel
│   └── Styling: Color-coded by severity
│
└── <InspectionTimeline>
    ├── Props: inspections[], projectId
    ├── Children: TimelineItem[], FilterChips
    └── Features: Vertical timeline, filter by type

Contract Components:
├── <SignaturePad>
│   ├── Props: onSave, width, height
│   ├── Children: Canvas, ClearButton, SaveButton
│   └── Features: Touch drawing, export base64/SVG
│
├── <ContractViewer>
│   ├── Props: contractId, pdfUrl, editable
│   ├── Children: PDFRenderer, ActionBar, CommentThread
│   └── Features: Zoom, scroll, highlight, annotate
│
└── <MilestoneTracker>
    ├── Props: milestones[], onPaymentClick
    ├── Children: MilestoneCard[], ProgressBar
    └── Features: Payment status, due date alerts

Real-time Components:
├── <PresenceIndicator>
│   ├── Props: userId, status (online/offline/away)
│   ├── Children: Dot, Ripple animation
│   └── Styling: Green/gray/yellow dot
│
├── <LiveNotification>
│   ├── Props: message, type, duration, action
│   ├── Children: Icon, Text, ActionButton
│   └── Animation: Slide-in from top, auto-dismiss
│
└── <TypingIndicator>
    ├── Props: userNames[]
    ├── Children: AnimatedDots, UserAvatar
    └── Animation: Bouncing dots
```

---

## 🔐 Permission & Role Matrix

```
┌──────────────┬─────────┬──────────┬──────────┬────────┬─────────┐
│   Feature    │  Admin  │  Owner   │Contractor│   QC   │ Vendor  │
├──────────────┼─────────┼──────────┼──────────┼────────┼─────────┤
│ Projects     │         │          │          │        │         │
│  - Create    │    ✓    │    ✓     │    ✗     │   ✗    │    ✗    │
│  - Edit      │    ✓    │    ✓     │    ○     │   ○    │    ✗    │
│  - Delete    │    ✓    │    ✓     │    ✗     │   ✗    │    ✗    │
│  - View      │    ✓    │    ✓     │    ✓     │   ✓    │    ✗    │
├──────────────┼─────────┼──────────┼──────────┼────────┼─────────┤
│ QC/QA        │         │          │          │        │         │
│  - Inspect   │    ✓    │    ✗     │    ✗     │   ✓    │    ✗    │
│  - Approve   │    ✓    │    ○     │    ✗     │   ✓    │    ✗    │
│  - View      │    ✓    │    ✓     │    ✓     │   ✓    │    ✗    │
├──────────────┼─────────┼──────────┼──────────┼────────┼─────────┤
│ Contracts    │         │          │          │        │         │
│  - Create    │    ✓    │    ✓     │    ✗     │   ✗    │    ✗    │
│  - Sign      │    ✗    │    ✓     │    ✓     │   ✗    │    ✗    │
│  - Edit      │    ✓    │    ✓     │    ✗     │   ✗    │    ✗    │
│  - View      │    ✓    │    ✓     │    ✓     │   ✓    │    ✗    │
├──────────────┼─────────┼──────────┼──────────┼────────┼─────────┤
│ AI Analysis  │         │          │          │        │         │
│  - Upload    │    ✓    │    ✓     │    ✓     │   ✓    │    ✗    │
│  - View      │    ✓    │    ✓     │    ✓     │   ✓    │    ✗    │
├──────────────┼─────────┼──────────┼──────────┼────────┼─────────┤
│ Products     │         │          │          │        │         │
│  - Create    │    ✗    │    ✗     │    ✗     │   ✗    │    ✓    │
│  - Moderate  │    ✓    │    ✗     │    ✗     │   ✗    │    ✗    │
│  - View      │    ✓    │    ✓     │    ✓     │   ✓    │    ✓    │
│  - Buy       │    ✗    │    ✓     │    ✓     │   ✗    │    ✗    │
└──────────────┴─────────┴──────────┴──────────┴────────┴─────────┘

Legend:
✓ = Full access
○ = Limited access (own items only)
✗ = No access
```

---

**Document Status:** Ready for Implementation  
**Created:** November 25, 2025  
**Last Updated:** November 25, 2025
