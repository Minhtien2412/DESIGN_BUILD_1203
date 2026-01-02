# KẾ HOẠCH TRIỂN KHAI CHI TIẾT - MISSING SCREENS
**Ngày:** 18/12/2025  
**Trạng thái:** Trang chủ hoàn thành - Thiếu 40+ screens con

---

## 📊 PHÂN TÍCH HIỆN TRẠNG

### ✅ ĐÃ CÓ (15 screens hoàn chỉnh)
1. `/checkout` - CheckoutScreen ✅
2. `/cart` - CartScreen ✅
3. `/shopping/products-from-backend` - ProductsFromBackendScreen ✅
4. `/shopping/product-detail` - ProductDetailScreen ✅
5. `/services/marketplace` - ServicesMarketplaceScreen ✅
6. `/services/company-detail` - CompanyDetailScreen ✅
7. `/inventory/index` - InventoryDashboardScreen ✅
8. `/inventory/materials` - MaterialsScreen ✅
9. `/daily-report/index` - DailyReportsScreen ✅
10. `/daily-report/[id]` - DailyReportDetailsScreen ✅
11. `/change-order/index` - ChangeOrdersScreen ✅
12. `/submittal/[id]` - SubmittalDetailsScreen ✅
13. `/warranty/index` - WarrantyListScreen ✅
14. `/utilities/be-tong` - BeTongScreen ✅ (có API integration)
15. `/(tabs)/live` - LiveListScreen ✅

### ❌ THIẾU (33 screens ưu tiên cao)

#### **TIER 1 - CRITICAL (10 screens - Làm tuần này)**
1. `/services/house-design` - Thiết kế nhà ❌
2. `/services/interior-design` - Thiết kế nội thất ❌
3. `/construction/progress` - Thi công XD ❌
4. `/construction/tracking` - Tiến độ thi công ❌
5. `/utilities/quote-request` - Yêu cầu báo giá ❌
6. `/utilities/ep-coc` - Ép cọc ❌
7. `/utilities/dao-dat` - Đào đất ❌
8. `/utilities/vat-lieu` - Vật liệu XD ❌
9. `/utilities/tho-xay` - Thợ xây ❌
10. `/utilities/tho-dien-nuoc` - Thợ điện nước ❌

#### **TIER 2 - HIGH (12 screens - Làm tuần sau)**
11. `/timeline/index` - Timeline quản lý ❌
12. `/budget/index` - Ngân sách ❌
13. `/quality-assurance/index` - QC/QA ❌
14. `/safety/index` - An toàn lao động ❌
15. `/documents/folders` - Tài liệu ❌
16. `/reports/index` - Báo cáo ❌
17. `/rfi/index` - RFI (Request for Information) ❌
18. `/submittal/index` - Submittal list ❌
19. `/finishing/lat-gach` - Lát gạch ❌
20. `/finishing/son` - Sơn tường ❌
21. `/finishing/thach-cao` - Thạch cao ❌
22. `/finishing/camera` - Camera an ninh ❌

#### **TIER 3 - MEDIUM (11 screens - Làm 2 tuần sau)**
23. `/utilities/tho-coffa` - Thợ cốp pha ❌
24. `/utilities/design-team` - Thiết kế team ❌
25. `/finishing/da` - Đá tự nhiên ❌
26. `/finishing/lam-cua` - Làm cửa ❌
27. `/finishing/lan-can` - Lan can ❌
28. `/finishing/tho-tong-hop` - Thợ tổng hợp ❌
29. `/services/construction-company` - Công ty thi công ❌
30. `/services/quality-supervision` - Giám sát chất lượng ❌
31. `/services/feng-shui` - Phong thủy ❌
32. `/utilities/cost-estimator` - Dự toán ❌
33. `/utilities/schedule` - Lịch trình ❌

---

## 🎯 CHIẾN LƯỢC REUSABLE COMPONENTS

### **Template 1: ServiceDetailTemplate** (Cho 15 screens)
**Sử dụng cho:**
- house-design, interior-design
- construction-company, quality-supervision, feng-shui
- lat-gach, son, da, thach-cao, lam-cua, lan-can, camera, tho-tong-hop
- cost-estimator, schedule, design-team

**Tính năng:**
```typescript
interface ServiceDetailTemplateProps {
  serviceId: string;
  serviceName: string;
  serviceType: 'design' | 'construction' | 'finishing' | 'consulting';
  apiEndpoint: string; // BE integration
  features: string[];
  priceRange?: string;
  rating?: number;
  reviews?: number;
  images: string[];
}
```

**UI Components:**
- Hero image slider
- Service description
- Price & rating
- Features list
- Customer reviews
- Gallery
- CTA buttons (Request quote / Book now)
- Related services

**API Integration:**
```typescript
GET /api/v1/services/:id
POST /api/v1/services/:id/request-quote
GET /api/v1/services/:id/reviews
```

---

### **Template 2: PriceQuoteTemplate** (Cho 8 screens)
**Sử dụng cho:**
- ep-coc, dao-dat, vat-lieu, tho-xay, tho-dien-nuoc, tho-coffa
- quote-request
- be-tong (đã có - refactor)

**Tính năng:**
```typescript
interface PriceQuoteTemplateProps {
  serviceType: string;
  basePrice: number;
  priceUnit: string; // 'đ/m³', 'đ/ngày', 'đ/m²'
  calculator?: boolean; // Enable price calculator
  bookingEnabled?: boolean;
}
```

**UI Components:**
- Price calculator
- Quantity input
- Unit selector
- Estimated total
- Service details
- Booking form
- Payment options

**API Integration:**
```typescript
POST /api/v1/quotes/calculate
POST /api/v1/quotes/submit
GET /api/v1/services/pricing
```

---

### **Template 3: ProgressTrackingTemplate** (Cho 5 screens)
**Sử dụng cho:**
- construction/progress
- construction/tracking
- timeline/index
- budget/index
- quality-assurance/index

**Tính năng:**
```typescript
interface ProgressTrackingTemplateProps {
  projectId: string;
  trackingType: 'progress' | 'timeline' | 'budget' | 'quality';
  milestones: Milestone[];
  currentStatus: number; // 0-100%
}
```

**UI Components:**
- Progress bar (animated)
- Timeline view
- Milestone cards
- Status badges
- Photo upload
- Comment threads
- Budget vs Actual chart

**API Integration:**
```typescript
GET /api/v1/projects/:id/progress
POST /api/v1/projects/:id/progress/update
GET /api/v1/projects/:id/milestones
PATCH /api/v1/projects/:id/milestones/:milestoneId
```

---

### **Template 4: DocumentManagementTemplate** (Cho 4 screens)
**Sử dụng cho:**
- documents/folders
- reports/index
- rfi/index
- submittal/index (list view)

**Tính năng:**
```typescript
interface DocumentManagementTemplateProps {
  documentType: 'folder' | 'report' | 'rfi' | 'submittal';
  allowUpload: boolean;
  allowDownload: boolean;
  requireApproval?: boolean;
}
```

**UI Components:**
- Folder tree view
- Document list
- Search & filter
- Upload button
- Preview modal
- Download button
- Approval workflow
- Version history

**API Integration:**
```typescript
GET /api/v1/documents/:type
POST /api/v1/documents/:type/upload
GET /api/v1/documents/:id/download
PATCH /api/v1/documents/:id/approve
```

---

### **Template 5: SafetyDashboardTemplate** (Cho 1 screen)
**Sử dụng cho:**
- safety/index

**Tính năng:**
```typescript
interface SafetyDashboardTemplateProps {
  projectId: string;
  incidentStats: IncidentStats;
  safetyScore: number;
  inspections: Inspection[];
}
```

**UI Components:**
- Safety score gauge
- Incident statistics
- Recent incidents list
- Safety checklist
- Inspection schedule
- PPE inventory
- Emergency contacts

**API Integration:**
```typescript
GET /api/v1/safety/dashboard
GET /api/v1/safety/incidents
POST /api/v1/safety/incidents/report
GET /api/v1/safety/inspections
```

---

## 📅 TIMELINE CHI TIẾT - 4 TUẦN

### **TUẦN 1: BUILD TEMPLATES + TIER 1 (Dec 18-24)**

#### **Ngày 1-2 (18-19 Dec): Templates Foundation**
- [x] Tạo ServiceDetailTemplate component
- [x] Tạo PriceQuoteTemplate component
- [x] Tạo ProgressTrackingTemplate component
- [x] Tạo DocumentManagementTemplate component
- [x] Tạo SafetyDashboardTemplate component
- [x] Setup API service utilities

**Deliverable:** 5 reusable templates với TypeScript interfaces

---

#### **Ngày 3-4 (20-21 Dec): TIER 1 Screens (Part 1)**
**Services & Design (4 screens):**

1. **`/services/house-design`** (ServiceDetailTemplate)
```typescript
// app/services/house-design.tsx
export default function HouseDesignScreen() {
  return (
    <ServiceDetailTemplate
      serviceId="house-design"
      serviceName="Thiết kế nhà"
      serviceType="design"
      apiEndpoint="/services/house-design"
      features={[
        'Thiết kế 2D/3D miễn phí',
        'Tư vấn phong thủy',
        'Dự toán chi tiết',
        'Hỗ trợ xin giấy phép'
      ]}
      priceRange="5-50 triệu"
      rating={4.8}
      reviews={1234}
    />
  );
}
```

2. **`/services/interior-design`** (ServiceDetailTemplate)
```typescript
// app/services/interior-design.tsx
export default function InteriorDesignScreen() {
  return (
    <ServiceDetailTemplate
      serviceId="interior-design"
      serviceName="Thiết kế nội thất"
      serviceType="design"
      apiEndpoint="/services/interior-design"
      features={[
        'Phong cách hiện đại, tân cổ điển',
        'Thi công trọn gói',
        'Bảo hành 2 năm',
        'Đo đạc miễn phí'
      ]}
      priceRange="10-200 triệu"
    />
  );
}
```

3. **`/construction/progress`** (ProgressTrackingTemplate)
```typescript
// app/construction/progress.tsx
export default function ConstructionProgressScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  
  return (
    <ProgressTrackingTemplate
      projectId={id || 'default'}
      trackingType="progress"
      apiEndpoint="/projects/progress"
      enablePhotoUpload={true}
      enableComments={true}
    />
  );
}
```

4. **`/construction/tracking`** (ProgressTrackingTemplate)
```typescript
// app/construction/tracking.tsx
export default function TrackingScreen() {
  return (
    <ProgressTrackingTemplate
      projectId="current"
      trackingType="timeline"
      apiEndpoint="/projects/tracking"
      showMilestones={true}
    />
  );
}
```

**Backend Integration:**
```typescript
// services/construction.service.ts
export const constructionApi = {
  getProgress: (projectId: string) => 
    apiFetch(`/projects/${projectId}/progress`),
  
  updateProgress: (projectId: string, data: ProgressUpdate) =>
    apiFetch(`/projects/${projectId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  
  uploadPhoto: (projectId: string, photo: FormData) =>
    apiFetch(`/projects/${projectId}/photos`, {
      method: 'POST',
      body: photo
    })
};
```

---

#### **Ngày 5-6 (22-23 Dec): TIER 1 Screens (Part 2)**
**Utilities & Labor (6 screens):**

5. **`/utilities/quote-request`** (PriceQuoteTemplate)
```typescript
// app/utilities/quote-request.tsx
export default function QuoteRequestScreen() {
  return (
    <PriceQuoteTemplate
      serviceType="general"
      formFields={[
        { name: 'serviceType', type: 'select', required: true },
        { name: 'area', type: 'number', label: 'Diện tích (m²)' },
        { name: 'location', type: 'text', required: true },
        { name: 'timeline', type: 'date' },
        { name: 'budget', type: 'number' },
        { name: 'description', type: 'textarea' }
      ]}
      apiEndpoint="/quotes/submit"
    />
  );
}
```

6-10. **Construction Utilities** (5 screens - Same template)
```typescript
// app/utilities/ep-coc.tsx
export default function EpCocScreen() {
  return (
    <PriceQuoteTemplate
      serviceType="ep-coc"
      serviceName="Ép Cọc"
      basePrice={15000}
      priceUnit="đ/m"
      calculator={true}
      bookingEnabled={true}
      apiEndpoint="/services/ep-coc"
      description="Thi công ép cọc chuyên nghiệp, đảm bảo tiến độ"
    />
  );
}

// Tương tự cho: dao-dat, vat-lieu, tho-xay, tho-dien-nuoc
```

**Backend Integration:**
```typescript
// services/quotes.service.ts
export const quotesApi = {
  submitQuote: (data: QuoteRequest) =>
    apiFetch('/quotes/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  calculatePrice: (serviceType: string, quantity: number) =>
    apiFetch(`/services/${serviceType}/calculate`, {
      method: 'POST',
      body: JSON.stringify({ quantity })
    }),
  
  getMyQuotes: () => apiFetch('/quotes/my-quotes')
};
```

---

#### **Ngày 7 (24 Dec): Testing & Optimization**
- [ ] Test all 10 TIER 1 screens
- [ ] Verify API integration
- [ ] Fix navigation issues
- [ ] Optimize performance
- [ ] Add loading states
- [ ] Error handling
- [ ] Analytics tracking

**Testing Checklist:**
```bash
# Manual testing
✓ Navigate from home to each screen
✓ Submit forms successfully
✓ API calls return correct data
✓ Loading states display
✓ Error messages show properly
✓ Back navigation works
✓ Deep linking works
```

---

### **TUẦN 2: TIER 2 SCREENS (Dec 25-31)**

#### **Ngày 1-2 (25-26 Dec): Management Tools (6 screens)**

11. **`/timeline/index`**
```typescript
export default function TimelineScreen() {
  return (
    <ProgressTrackingTemplate
      trackingType="timeline"
      apiEndpoint="/projects/timeline"
      viewMode="gantt" // Gantt chart view
    />
  );
}
```

12. **`/budget/index`**
```typescript
export default function BudgetScreen() {
  return (
    <ProgressTrackingTemplate
      trackingType="budget"
      apiEndpoint="/projects/budget"
      chartType="bar" // Budget vs Actual comparison
    />
  );
}
```

13. **`/quality-assurance/index`**
```typescript
export default function QAScreen() {
  return (
    <ProgressTrackingTemplate
      trackingType="quality"
      apiEndpoint="/projects/qa"
      enableInspections={true}
      enableDefectReporting={true}
    />
  );
}
```

14. **`/safety/index`**
```typescript
export default function SafetyScreen() {
  return (
    <SafetyDashboardTemplate
      apiEndpoint="/safety/dashboard"
      showIncidents={true}
      showInspections={true}
    />
  );
}
```

15-16. **`/documents/folders` & `/reports/index`**
```typescript
export default function DocumentsScreen() {
  return (
    <DocumentManagementTemplate
      documentType="folder"
      apiEndpoint="/documents"
      allowUpload={true}
      allowDownload={true}
    />
  );
}
```

---

#### **Ngày 3-4 (27-28 Dec): RFI & Finishing (6 screens)**

17. **`/rfi/index`** (DocumentManagementTemplate)
18. **`/submittal/index`** (DocumentManagementTemplate)
19-22. **Finishing screens** (ServiceDetailTemplate)

---

#### **Ngày 5-7 (29-31 Dec): Polish & Backend Integration**
- [ ] Connect all APIs
- [ ] Real data from backend
- [ ] Image optimization
- [ ] Caching strategy
- [ ] Offline support
- [ ] End-to-end testing

---

### **TUẦN 3: TIER 3 + ADVANCED FEATURES (Jan 1-7)**

#### **Focus:**
- Remaining 11 screens
- Advanced features (search, filters, sorting)
- User personalization
- Push notifications
- Analytics events

---

### **TUẦN 4: POLISH & DEPLOYMENT (Jan 8-14)**

#### **Focus:**
- Performance optimization
- Bug fixes
- UI/UX improvements
- Documentation
- App store submission

---

## 🛠️ BACKEND API REQUIREMENTS

### **Endpoints cần có:**

#### **Services API**
```typescript
GET    /api/v1/services                    // List all services
GET    /api/v1/services/:id                // Service detail
GET    /api/v1/services/:id/reviews        // Service reviews
POST   /api/v1/services/:id/request-quote  // Request quote
GET    /api/v1/services/:slug              // Service by slug
```

#### **Quotes API**
```typescript
POST   /api/v1/quotes/submit               // Submit quote request
GET    /api/v1/quotes/my-quotes            // User's quotes
PATCH  /api/v1/quotes/:id                  // Update quote
POST   /api/v1/services/:type/calculate    // Calculate price
```

#### **Projects API**
```typescript
GET    /api/v1/projects/:id/progress       // Project progress
PATCH  /api/v1/projects/:id/progress       // Update progress
GET    /api/v1/projects/:id/timeline       // Timeline data
GET    /api/v1/projects/:id/budget         // Budget data
GET    /api/v1/projects/:id/milestones     // Milestones
PATCH  /api/v1/projects/:id/milestones/:mid // Update milestone
POST   /api/v1/projects/:id/photos         // Upload photo
```

#### **Documents API**
```typescript
GET    /api/v1/documents/:type             // List documents
POST   /api/v1/documents/:type/upload      // Upload document
GET    /api/v1/documents/:id/download      // Download document
DELETE /api/v1/documents/:id               // Delete document
PATCH  /api/v1/documents/:id/approve       // Approve document
```

#### **Safety API**
```typescript
GET    /api/v1/safety/dashboard            // Safety dashboard
GET    /api/v1/safety/incidents            // Incident list
POST   /api/v1/safety/incidents/report     // Report incident
GET    /api/v1/safety/inspections          // Inspections
```

---

## 📊 SUCCESS METRICS

### **Week 1 Target:**
- ✅ 5 templates created
- ✅ 10 TIER 1 screens working
- ✅ API integration successful
- ✅ 0 navigation errors
- ✅ All screens responsive

### **Week 2 Target:**
- ✅ 12 TIER 2 screens working
- ✅ Real backend data
- ✅ Image loading optimized
- ✅ Error handling complete

### **Week 3 Target:**
- ✅ 11 TIER 3 screens done
- ✅ Advanced features live
- ✅ User personalization

### **Week 4 Target:**
- ✅ 100% screens complete
- ✅ Performance optimized
- ✅ Ready for production

---

## 🚀 IMMEDIATE NEXT STEPS (Today!)

### **Step 1: Tạo Template Components (2 giờ)**
```bash
mkdir -p components/templates
touch components/templates/ServiceDetailTemplate.tsx
touch components/templates/PriceQuoteTemplate.tsx
touch components/templates/ProgressTrackingTemplate.tsx
touch components/templates/DocumentManagementTemplate.tsx
touch components/templates/SafetyDashboardTemplate.tsx
```

### **Step 2: Tạo Service Utilities (1 giờ)**
```bash
mkdir -p services/api
touch services/api/construction.service.ts
touch services/api/quotes.service.ts
touch services/api/documents.service.ts
touch services/api/safety.service.ts
```

### **Step 3: Build First 4 Screens (3 giờ)**
```bash
touch app/services/house-design.tsx
touch app/services/interior-design.tsx
touch app/construction/progress.tsx
touch app/construction/tracking.tsx
```

### **Step 4: Test & Iterate (2 giờ)**
- Test navigation
- Verify API calls
- Fix bugs
- Commit code

---

**Tổng thời gian: 8 giờ (1 ngày làm việc)**  
**Output: 5 templates + 4 working screens**

**Ready to start? 🚀**
