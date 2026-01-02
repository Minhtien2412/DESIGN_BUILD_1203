# 🗺️ SƠ ĐỒ CẤU TRÚC HỆ THỐNG APP DESIGN BUILD

```
📱 APP DESIGN BUILD
│
├─── 🏠 HOME (Trang chủ)
│    ├── Header (Avatar + Notifications)
│    ├── Global Search Bar
│    ├── Quick Actions
│    │   ├── Tạo dự án
│    │   ├── Báo cáo tiến độ
│    │   ├── Mua sắm
│    │   └── Tin nhắn
│    ├── Category Grid (8-12 danh mục)
│    ├── Recently Viewed
│    ├── Banner/Promotions
│    └── App Drawer (Navigation Menu)
│
├─── 🏗️ PROJECTS (Quản lý dự án)
│    │
│    ├── 📋 Project List
│    │   ├── Active Projects
│    │   ├── Completed Projects
│    │   └── Archived Projects
│    │
│    └── 📊 Project Detail [/projects/[id]]
│         │
│         ├── Overview Tab
│         │   ├── Status Badge
│         │   ├── Progress Meter
│         │   ├── Cost Tracker
│         │   ├── Task Summary
│         │   └── Recent Activity
│         │
│         ├── Timeline Tab [/projects/[id]/timeline]
│         │   ├── Gantt Chart
│         │   ├── Milestones
│         │   ├── Critical Path
│         │   └── Dependencies
│         │
│         ├── Team Tab [/projects/[id]/team]
│         │   ├── Team Directory
│         │   ├── Roles & Responsibilities
│         │   ├── Contact Cards
│         │   ├── Availability
│         │   └── Performance Stats
│         │
│         ├── Budget Tab [/budget]
│         │   ├── Budget Overview
│         │   ├── Expenses [/budget/expenses]
│         │   ├── Invoices [/budget/invoices]
│         │   ├── Payment Tracking
│         │   └── Financial Reports
│         │
│         ├── Documents Tab [/projects/[id]/documents]
│         │   ├── Folders [/documents/folders]
│         │   ├── Version Control [/documents/versions]
│         │   ├── Sharing [/documents/share]
│         │   └── Comments [/documents/comments]
│         │
│         ├── Photos [/projects/[id]/photos]
│         │   ├── Gallery View
│         │   ├── Upload [/projects/[id]/upload-photo]
│         │   ├── Before/After
│         │   └── Progress Timelapse
│         │
│         ├── Chat [/projects/[id]/chat]
│         │   ├── Project Chat Room
│         │   ├── File Sharing
│         │   └── Mentions
│         │
│         ├── Meetings [/projects/[id]/meetings]
│         │   ├── Schedule Meeting
│         │   ├── Meeting List
│         │   ├── Minutes [/meeting-minutes/[id]]
│         │   └── Action Items
│         │
│         ├── Minimap [/projects/[id]/minimap]
│         │   ├── Site Map View
│         │   ├── Editor [/projects/[id]/minimap-editor]
│         │   ├── Annotations
│         │   └── 3D Model
│         │
│         ├── Tasks [/projects/[id]/tasks]
│         │   ├── Kanban Board
│         │   ├── List View
│         │   ├── Calendar View
│         │   └── Task Dependencies
│         │
│         ├── Payment Progress [/projects/[id]/payment-progress]
│         │   ├── Payment Schedule
│         │   ├── Invoices
│         │   └── Receipt Tracking
│         │
│         ├── Announcements [/projects/[id]/announcements]
│         │   ├── Create [/projects/[id]/create-announcement]
│         │   ├── View List
│         │   └── Notification Settings
│         │
│         ├── Risks [/projects/[id]/risks]
│         │   ├── Risk Register
│         │   ├── Assessment
│         │   └── Mitigation Plans
│         │
│         ├── Weather [/projects/[id]/weather]
│         │   ├── Current Weather
│         │   ├── Forecast
│         │   └── Impact Analysis
│         │
│         ├── QC/QA [/projects/[id]/qc-qa]
│         │   ├── Checklists
│         │   ├── Inspections
│         │   ├── Non-conformance
│         │   └── Approval Workflow
│         │
│         ├── AI Analysis [/projects/[id]/ai-analysis]
│         │   ├── Progress Prediction
│         │   ├── Risk Analysis
│         │   └── Recommendations
│         │
│         ├── Decisions [/projects/[id]/decisions]
│         │   ├── Decision Log
│         │   ├── Approval Workflow
│         │   └── Impact Assessment
│         │
│         ├── Diary [/projects/[id]/diary]
│         │   ├── Daily Entries
│         │   ├── Site Notes
│         │   └── Search History
│         │
│         ├── Equipment [/projects/[id]/equipment]
│         │   ├── Equipment List
│         │   ├── Usage Tracking
│         │   └── Maintenance Log
│         │
│         ├── Materials [/projects/[id]/materials]
│         │   ├── Material Inventory
│         │   ├── Delivery Tracking
│         │   └── Supplier Info
│         │
│         └── Process Detail [/projects/[id]/process-detail]
│              ├── Work Breakdown
│              ├── Method Statements
│              └── SOPs
│
├─── 💬 COMMUNICATIONS (Giao tiếp)
│    │
│    ├── 💬 Messages [/messages]
│    │   ├── Conversations List
│    │   │   ├── 1-1 Chats
│    │   │   ├── Group Chats
│    │   │   ├── Unread Count
│    │   │   └── Last Message
│    │   │
│    │   └── Chat Room [/messages/[userId]]
│    │       ├── Text Messages
│    │       ├── File Attachments
│    │       ├── Voice Messages
│    │       ├── Emoji Reactions
│    │       ├── Typing Indicator
│    │       └── Read Receipts
│    │
│    ├── 📞 Calls [/call]
│    │   ├── Call History
│    │   ├── Video Call
│    │   ├── Audio Call
│    │   └── Conference Call
│    │
│    ├── 📡 Livestream [/live]
│    │   ├── Start Broadcast
│    │   ├── Site Tours
│    │   ├── Live Q&A
│    │   └── Recording Playback
│    │
│    ├── 🏢 Communications Center [/communications]
│    │   ├── Unified Inbox
│    │   ├── Meetings [/communications/reviews]
│    │   ├── Reviews
│    │   └── Announcements
│    │
│    └── 📝 Meeting Minutes [/meeting-minutes]
│         ├── Minutes List
│         └── Detail [/meeting-minutes/[id]]
│              ├── Agenda
│              ├── Attendees
│              ├── Notes
│              ├── Action Items
│              └── Attachments
│
├─── 🛒 SHOPPING (Mua sắm & E-commerce)
│    │
│    ├── 🏪 Shopping Home [/shopping]
│    │   ├── Categories Grid
│    │   ├── Flash Sales [/shopping/flash-sale]
│    │   ├── Featured Products
│    │   └── Search Bar
│    │
│    ├── 📦 Product Detail [/shopping/product/[id]]
│    │   ├── Image Gallery
│    │   ├── Description
│    │   ├── Specifications
│    │   ├── Reviews & Ratings
│    │   ├── Related Products
│    │   └── Add to Cart
│    │
│    ├── 🛒 Cart [/cart]
│    │   ├── Cart Items
│    │   ├── Quantity Control
│    │   ├── Apply Vouchers
│    │   └── Total Calculation
│    │
│    ├── 💳 Checkout [/checkout]
│    │   ├── Shipping Address
│    │   ├── Payment Method
│    │   ├── Order Summary
│    │   └── Place Order
│    │
│    ├── 🔍 Product Compare [/shopping/compare]
│    │   ├── Side-by-side Compare
│    │   └── Specs Table
│    │
│    ├── 📋 Categories
│    │   ├── Bathroom [/shopping/phong-tam]
│    │   ├── Kitchen [/shopping/bep]
│    │   ├── Electrical [/shopping/dien]
│    │   ├── Plumbing [/shopping/nuoc]
│    │   ├── Furniture [/shopping/noi-that]
│    │   ├── Fire Safety [/shopping/pccc]
│    │   ├── Tiles [/shopping/gach-men]
│    │   ├── Paint [/shopping/son]
│    │   ├── Doors [/shopping/cua]
│    │   ├── AC [/shopping/dieu-hoa]
│    │   └── ... (15+ more)
│    │
│    └── 📦 Procurement [/procurement]
│         ├── Procurement Home
│         ├── Vendors [/procurement/vendors]
│         ├── Purchase Orders
│         └── Quote Requests
│
├─── 🏗️ CONSTRUCTION MANAGEMENT (Quản lý thi công)
│    │
│    ├── 📊 Progress Tracking [/construction/progress-tracking]
│    │   ├── Overall Progress
│    │   ├── Phase Progress
│    │   ├── Task Status
│    │   └── Gantt Chart
│    │
│    ├── 📅 Timeline [/timeline]
│    │   ├── Timeline View
│    │   ├── Phases [/timeline/phases]
│    │   ├── Create Phase [/timeline/create-phase]
│    │   ├── Create Task [/timeline/create-task]
│    │   ├── Critical Path [/timeline/critical-path]
│    │   └── Dependencies [/timeline/dependencies]
│    │
│    ├── 📝 Daily Reports [/daily-report]
│    │   ├── Report List
│    │   └── Report Detail [/daily-report/[id]]
│    │       ├── Work Completed
│    │       ├── Workers on Site
│    │       ├── Materials Received
│    │       ├── Equipment Used
│    │       └── Issues/Delays
│    │
│    ├── 🎯 Quality Assurance [/quality-assurance]
│    │   ├── QA Dashboard
│    │   ├── Checklists
│    │   ├── Inspections
│    │   └── Non-conformance
│    │
│    ├── 🔍 Inspection [/inspection]
│    │   ├── Schedule Inspection
│    │   ├── Inspection Reports
│    │   └── Defect List
│    │
│    ├── ✅ Punch List [/punch-list]
│    │   ├── Punch Items
│    │   ├── Fix Status
│    │   ├── Before/After Photos
│    │   └── Sign-off
│    │
│    ├── 📐 As-Built Drawings [/as-built]
│    │   ├── Drawing Viewer
│    │   ├── Markups
│    │   └── Version Control
│    │
│    └── 🎓 Commissioning [/commissioning]
│         ├── System Testing
│         ├── Documentation
│         └── Handover Checklist
│
├─── 📦 RESOURCES (Nguồn lực)
│    │
│    ├── 📦 Materials [/materials]
│    │   ├── Material Inventory
│    │   └── Supplier [/materials/supplier]
│    │
│    ├── 🚛 Equipment [/equipment]
│    │   ├── Equipment List
│    │   ├── Usage Tracking
│    │   └── Maintenance
│    │
│    ├── 📊 Inventory [/inventory]
│    │   ├── Stock Levels
│    │   ├── Reorder Alerts
│    │   └── Warehouse Management
│    │
│    ├── 🚗 Fleet [/fleet]
│    │   ├── Vehicle List
│    │   ├── GPS Tracking
│    │   └── Maintenance Log
│    │
│    ├── 👷 Labor [/labor]
│    │   ├── Worker List
│    │   ├── Attendance [/labor/attendance]
│    │   ├── Create Worker [/labor/create-worker]
│    │   └── Payroll
│    │
│    └── 📋 Resource Planning [/resource-planning]
│         ├── Resources [/resource-planning/resources]
│         ├── Allocation
│         └── Utilization
│
├─── 📄 DOCUMENTS (Tài liệu)
│    │
│    ├── 📁 Document Manager [/documents]
│    │   ├── Documents List
│    │   ├── Folders [/documents/folders]
│    │   ├── Create Folder [/documents/create-folder]
│    │   ├── Document Detail [/documents/document-detail]
│    │   ├── Version Control [/documents/versions]
│    │   ├── Share [/documents/share]
│    │   └── Comments [/documents/comments]
│    │
│    ├── 📋 Document Control [/document-control]
│    │   ├── Approval Workflow
│    │   ├── Revision History
│    │   └── Access Control
│    │
│    ├── 📖 O&M Manuals [/om-manuals]
│    │   ├── Manual List
│    │   ├── Equipment Manuals
│    │   └── Maintenance Guides
│    │
│    └── 📝 Submittal [/submittal]
│         ├── Submittal List
│         ├── Review Status
│         └── Approval Workflow
│
├─── 🛡️ SAFETY & COMPLIANCE (An toàn & Tuân thủ)
│    │
│    ├── 🦺 Safety [/safety]
│    │   │
│    │   ├── PPE [/safety/ppe]
│    │   │   ├── PPE Inventory
│    │   │   ├── Distributions [/safety/ppe/distributions]
│    │   │   └── Stock Tracking
│    │   │
│    │   ├── Incidents [/safety/incidents]
│    │   │   ├── Report Incident
│    │   │   ├── Incident List
│    │   │   └── Investigation
│    │   │
│    │   └── Training [/safety/training]
│    │        ├── Training Programs
│    │        ├── Sessions [/safety/training/sessions]
│    │        ├── Attendance
│    │        └── Certifications
│    │
│    ├── ⚠️ Risk [/risk]
│    │   ├── Risk Register
│    │   ├── Risk Assessment
│    │   └── Mitigation Plans
│    │
│    ├── 🌱 Environmental [/environmental]
│    │   ├── Compliance
│    │   ├── Waste Management
│    │   └── Monitoring
│    │
│    ├── ⚖️ Legal [/legal]
│    │   ├── Permits
│    │   ├── Contracts
│    │   └── Compliance
│    │
│    └── 🔧 Warranty [/warranty]
│         ├── Warranty List
│         └── Warranty Detail [/warranty/[id]]
│              ├── Item Info
│              ├── Coverage
│              ├── Claims
│              └── Documents
│
├─── 📊 REPORTS & ANALYTICS (Báo cáo & Phân tích)
│    │
│    ├── 📈 Reports [/reports]
│    │   ├── Report Builder
│    │   ├── KPI [/reports/kpi]
│    │   ├── Progress Reports
│    │   ├── Financial Reports
│    │   └── Resource Reports
│    │
│    ├── 📊 Dashboard [/dashboard]
│    │   ├── Executive Dashboard
│    │   ├── Engineer Dashboard [/dashboard/engineer-enhanced]
│    │   ├── Project Dashboard
│    │   └── Team Dashboard
│    │
│    └── ⚙️ Admin [/admin]
│         ├── User Management
│         ├── System Settings
│         ├── Permissions
│         └── Audit Logs
│
├─── 🔧 UTILITIES (Tiện ích)
│    │
│    ├── 🏠 Design Services [/utilities/design]
│    │   ├── House Design
│    │   └── Interior Design [/utilities/interior]
│    │
│    ├── 🔨 Construction Services [/utilities/construction]
│    │   ├── Concrete [/utilities/be-tong]
│    │   ├── Foundation [/utilities/ep-coc]
│    │   ├── Excavation [/utilities/dao-dat]
│    │   ├── Masonry [/utilities/tho-xay]
│    │   └── Plumbing [/utilities/tho-dien-nuoc]
│    │
│    ├── ✨ Finishing Services [/utilities/finishing]
│    │   ├── Tiling [/utilities/tho-lat-gach]
│    │   └── Carpentry [/utilities/tho-coffa]
│    │
│    ├── 📚 Library [/utilities/library]
│    │   ├── Materials Catalog
│    │   ├── Standards
│    │   └── Guidelines
│    │
│    ├── 💰 Cost Estimator [/utilities/cost-estimator]
│    │   ├── Quick Estimate
│    │   └── Detailed Breakdown
│    │
│    ├── 📅 Schedule [/utilities/schedule]
│    │   ├── Project Schedule
│    │   └── Resource Calendar
│    │
│    ├── 📍 Store Locator [/utilities/store-locator]
│    │   ├── Map View
│    │   └── Store List
│    │
│    ├── 🗺️ Sitemap [/utilities/sitemap]
│    │   └── App Structure
│    │
│    ├── 📜 History [/utilities/history]
│    │   ├── View History
│    │   └── Activity Log
│    │
│    └── 📱 QR Code [/utilities/my-qr-code]
│         └── Personal QR
│
├─── 🔍 SEARCH (Tìm kiếm)
│    │
│    ├── 🔎 Global Search [/search]
│    │   ├── Search Bar
│    │   ├── Filters
│    │   ├── Results
│    │   └── History
│    │
│    └── 📂 Categories [/categories]
│         └── Category Browser
│
├─── 🔔 NOTIFICATIONS (Thông báo)
│    │
│    └── 📬 Notifications [/(tabs)/notifications]
│         ├── Timeline View
│         ├── Filter by Type
│         ├── Mark as Read
│         └── Notification Settings
│
├─── 👤 PROFILE (Hồ sơ)
│    │
│    └── 👤 Profile [/(tabs)/profile]
│         ├── User Info
│         ├── My Products [/profile/my-products]
│         ├── Settings [/profile/settings]
│         ├── Orders
│         ├── Favorites
│         └── Logout
│
├─── 🎬 MEDIA (Đa phương tiện)
│    │
│    ├── 📹 Videos [/videos]
│    │   ├── Video Feed
│    │   ├── Short Videos
│    │   └── Tutorials
│    │
│    └── 📖 Stories [/stories]
│         ├── Stories Feed
│         └── Create Story
│
├─── 🌤️ WEATHER (Thời tiết)
│    │
│    └── ☁️ Weather [/weather]
│         ├── Current Weather
│         ├── Forecast
│         └── Stoppages [/weather/stoppages]
│
├─── 🔐 AUTHENTICATION (Xác thực)
│    │
│    └── 🔑 Auth [/(auth)]
│         ├── Login
│         ├── Register
│         ├── Forgot Password
│         └── Reset Password
│
└─── 🎯 OTHER FEATURES (Tính năng khác)
     │
     ├── 📝 RFI [/rfi]
     │   └── Request for Information
     │
     ├── 🔄 Change Management [/change-management]
     │   └── Change Orders
     │
     ├── 📊 Contracts [/contracts]
     │   └── Contract Management
     │
     ├── 🍔 Food [/food]
     │   └── Meal Ordering
     │
     ├── 🎨 Demo [/demo]
     │   └── Feature Demos
     │
     └── 🧪 Test [/test-simple]
          └── Test Screens
```

---

## 📊 THỐNG KÊ HỆ THỐNG

### Tổng quan modules:
- **11 modules chính**
- **40+ chức năng lớn**
- **200+ trang/screens**
- **100+ components**

### Phân loại theo độ ưu tiên:
```
✅ Hoàn thành: ~70% (Core features)
🚧 Đang phát triển: ~20% (Enhancements)
📋 Kế hoạch: ~10% (Advanced features)
```

### Công nghệ sử dụng:
- **Framework:** React Native (Expo SDK 54)
- **Language:** TypeScript
- **Navigation:** Expo Router
- **State:** React Context + Custom Hooks
- **UI:** React Native + Custom Components
- **Backend:** REST API (https://baotienweb.cloud/api/v1)
- **Real-time:** WebSocket (Socket.IO)
- **Theme:** Nordic Minimalism Design System

---

**Lưu ý:** Sơ đồ này thể hiện cấu trúc hiện tại của hệ thống. Để biết chi tiết về các tính năng cần phát triển, xem file `DEVELOPMENT_ROADMAP_DETAILED.md`
