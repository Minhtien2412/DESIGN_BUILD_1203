# API Audit - Construction Project System

## 📊 Backend API Coverage Analysis

### ✅ Available APIs (from services/api/types.ts)

#### 1. **Project Management**
- ✅ `GET /projects` - List projects with filters
- ✅ `POST /projects` - Create project
- ✅ `GET /projects/:id` - Get project details
- ✅ `PATCH /projects/:id` - Update project
- ✅ `POST /projects/:id/assign` - Assign users

**Types:**
```typescript
Project, CreateProjectData, UpdateProjectData, ProjectFilters
ProjectStatus: PLANNING | IN_PROGRESS | ON_HOLD | COMPLETED | CANCELLED
```

#### 2. **Task Management**
- ✅ `GET /tasks` - List tasks
- ✅ `POST /tasks` - Create task
- ✅ `PATCH /tasks/:id` - Update task

**Types:**
```typescript
Task, CreateTaskData, UpdateTaskData
TaskStatus: TODO | IN_PROGRESS | IN_REVIEW | COMPLETED | CANCELLED
TaskPriority: LOW | MEDIUM | HIGH | URGENT
```

#### 3. **Timeline & Phases**
- ✅ `GET /projects/:id/timeline` - Get project timeline
- ✅ `POST /phases` - Create phase
- ✅ `PATCH /phases/:id` - Update phase
- ✅ `POST /phases/:id/tasks` - Add phase tasks

**Types:**
```typescript
ProjectTimeline, Phase, Milestone, PhaseTask
PhaseStatus: NOT_STARTED | IN_PROGRESS | COMPLETED | DELAYED
```

#### 4. **QC/QA System**
- ✅ `GET /qc/inspections` - List inspections
- ✅ `POST /qc/inspections` - Create inspection
- ✅ `PATCH /qc/inspections/:id` - Update inspection
- ✅ `GET /qc/bugs` - List bugs
- ✅ `POST /qc/bugs` - Report bug

**Types:**
```typescript
QCInspection, QCChecklist, Bug
QCStatus: PENDING | IN_PROGRESS | PASSED | FAILED | REQUIRES_REWORK
BugSeverity: LOW | MEDIUM | HIGH | CRITICAL
```

#### 5. **User & Auth**
- ✅ `POST /auth/login` - Login
- ✅ `POST /auth/register` - Register
- ✅ `POST /auth/refresh` - Refresh token
- ✅ `GET /users` - List users

**Types:**
```typescript
User, LoginCredentials, RegisterData, AuthResponse
UserRole: ADMIN | ENGINEER | CLIENT | CONTRACTOR
```

#### 6. **Dashboard**
- ✅ `GET /dashboard/admin` - Admin dashboard
- ✅ `GET /dashboard/engineer` - Engineer dashboard
- ✅ `GET /dashboard/client` - Client dashboard

**Types:**
```typescript
AdminDashboard, EngineerDashboard, ClientDashboard
ProjectProgress, ProjectUpdate, PaymentSchedule
```

---

### ❌ Missing APIs (Needed for Construction Features)

#### 1. **Construction Diary** 🔴 HIGH PRIORITY
```typescript
// Need to add:
GET    /projects/:id/diary
POST   /projects/:id/diary
GET    /projects/:id/diary/:entryId
PATCH  /projects/:id/diary/:entryId
DELETE /projects/:id/diary/:entryId

interface DiaryEntry {
  id: number;
  projectId: number;
  date: string;
  weather: 'sunny' | 'cloudy' | 'rainy' | 'storm';
  temperature?: number;
  workforce: {
    engineers: number;
    workers: number;
    contractors: number;
  };
  workProgress: string;
  incidents?: string;
  notes?: string;
  photos: string[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}
```

#### 2. **Materials & Inventory** 🔴 HIGH PRIORITY
```typescript
GET    /projects/:id/materials
POST   /projects/:id/materials
PATCH  /projects/:id/materials/:id
DELETE /projects/:id/materials/:id
POST   /projects/:id/materials/:id/transactions (nhập/xuất)

interface Material {
  id: number;
  projectId: number;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reserved: number;
  available: number;
  unitPrice: number;
  supplier?: string;
  location?: string;
  photos?: string[];
}

interface MaterialTransaction {
  id: number;
  materialId: number;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  date: string;
  createdBy: number;
}
```

#### 3. **Equipment Management** 🟡 MEDIUM PRIORITY
```typescript
GET    /projects/:id/equipment
POST   /projects/:id/equipment
PATCH  /projects/:id/equipment/:id
POST   /projects/:id/equipment/:id/bookings

interface Equipment {
  id: number;
  projectId: number;
  name: string;
  type: string;
  status: 'available' | 'in-use' | 'maintenance' | 'broken';
  assignedTo?: number;
  maintenanceSchedule?: string;
  lastMaintenance?: string;
  location?: string;
}
```

#### 4. **Safety Management** 🔴 HIGH PRIORITY
```typescript
GET    /projects/:id/safety/incidents
POST   /projects/:id/safety/incidents
GET    /projects/:id/safety/checklists
POST   /projects/:id/safety/checklists

interface SafetyIncident {
  id: number;
  projectId: number;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'injury' | 'near-miss' | 'property-damage' | 'environmental';
  description: string;
  location: string;
  dateOccurred: string;
  reportedBy: number;
  witnesses?: string[];
  photos: string[];
  actionsTaken?: string;
  status: 'reported' | 'investigating' | 'resolved';
}
```

#### 5. **Documents Management** 🟡 MEDIUM PRIORITY
```typescript
GET    /projects/:id/documents
POST   /projects/:id/documents
PATCH  /projects/:id/documents/:id
DELETE /projects/:id/documents/:id
POST   /projects/:id/documents/:id/versions

interface Document {
  id: number;
  projectId: number;
  name: string;
  type: 'contract' | 'design' | 'permit' | 'report' | 'invoice' | 'other';
  folder?: string;
  version: number;
  url: string;
  size: number;
  mimeType: string;
  tags: string[];
  uploadedBy: number;
  uploadedAt: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'rejected';
}
```

#### 6. **Reports & Analytics** 🟡 MEDIUM PRIORITY
```typescript
GET /projects/:id/reports/progress
GET /projects/:id/reports/budget
GET /projects/:id/reports/qc-summary
GET /projects/:id/analytics/kpis
GET /projects/:id/analytics/trends

interface ProgressReport {
  projectId: number;
  period: { start: string; end: string };
  overallProgress: number;
  phaseProgress: Array<{
    phaseId: number;
    phaseName: string;
    progress: number;
    status: string;
  }>;
  tasksCompleted: number;
  tasksTotal: number;
  delays: Array<{
    item: string;
    daysDelayed: number;
    reason: string;
  }>;
}
```

#### 7. **Risk Management** 🟢 LOW PRIORITY
```typescript
GET    /projects/:id/risks
POST   /projects/:id/risks
PATCH  /projects/:id/risks/:id

interface Risk {
  id: number;
  projectId: number;
  title: string;
  description: string;
  category: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  riskScore: number;
  mitigationPlan?: string;
  owner?: number;
  status: 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'closed';
}
```

---

## 🔄 Frontend - Backend Alignment

### Current Gaps:

1. **Project Types Mismatch:**
   - FE uses: `planning | active | paused | completed` (hooks/useProjects.ts)
   - BE uses: `PLANNING | IN_PROGRESS | ON_HOLD | COMPLETED | CANCELLED`
   - **Action:** Normalize to BE types or create mapper

2. **Missing Construction-Specific Endpoints:**
   - Diary, Materials, Equipment, Safety → Need backend implementation
   - **Action:** Coordinate with backend team or create mock services

3. **Incomplete Type Coverage:**
   - Many components use `any` or local types
   - **Action:** Use types from services/api/types.ts consistently

---

## 📝 Recommendations

### Immediate Actions (Week 1-2):

1. ✅ **Create unified API service layer** (`services/api/construction.ts`)
2. ✅ **Build UI component library** (Task #18)
3. ✅ **Implement Construction Diary** with mock data first (Task #3)
4. ⚠️ **Request backend team** to prioritize Diary & Materials APIs

### Short-term (Month 1):

1. Build offline-first architecture for critical features
2. Implement robust error handling & retry logic
3. Add comprehensive loading & skeleton states
4. Setup analytics & crash reporting

### Long-term (Month 2-3):

1. Full backend integration when APIs ready
2. Advanced features: Analytics, Reports, Risk Management
3. Performance optimization & testing
4. Production deployment

---

## 🛠️ Integration Strategy

### Option 1: Mock-First Approach (Recommended)
- Build features with mock data matching BE schema
- Easy switch to real API when ready
- Allows parallel development

### Option 2: Backend-First Approach
- Wait for backend APIs
- Slower initial progress
- Less refactoring later

**Decision:** Use Mock-First for construction features, allowing immediate UI/UX development while backend catches up.

---

Generated: 2025-11-29
