# Timeline API Module - Deployment Guide

## ✅ Module đã tạo hoàn chỉnh

### Cấu trúc module:
```
backend-nestjs/src/timeline/
├── timeline.module.ts           # Module definition
├── timeline.controller.ts       # REST API endpoints
├── timeline.service.ts          # Business logic
├── entities/
│   ├── phase.entity.ts         # Phase model
│   ├── phase-task.entity.ts    # PhaseTask model
│   └── timeline-notification.entity.ts
└── dto/
    ├── create-phase.dto.ts
    ├── update-phase.dto.ts
    ├── update-progress.dto.ts
    ├── create-phase-task.dto.ts
    ├── update-phase-task.dto.ts
    └── reorder-phases.dto.ts
```

## 📋 API Endpoints Implemented

### Project Timeline
- `GET /timeline/projects/:projectId` - Get project timeline (Gantt Chart)
- `GET /timeline/projects/:projectId/check-delayed` - Check delayed phases
- `GET /timeline/projects/:projectId/notifications` - Get notifications

### Phases Management
- `POST /timeline/phases` - Create new phase
- `GET /timeline/phases/:id` - Get phase by ID
- `PATCH /timeline/phases/:id` - Update phase
- `DELETE /timeline/phases/:id` - Delete phase
- `PATCH /timeline/phases/reorder?projectId=X` - Reorder phases
- `PATCH /timeline/phases/:id/progress` - Update progress

### Phase Tasks
- `POST /timeline/phases/:phaseId/tasks` - Create task
- `PATCH /timeline/tasks/:id` - Update task
- `DELETE /timeline/tasks/:id` - Delete task

### Notifications
- `PATCH /timeline/notifications/:id/read` - Mark as read

## 🚀 Deployment Steps

### 1. Install Dependencies (if needed)
```bash
cd backend-nestjs
npm install
```

### 2. Database Migration
TypeORM sẽ tự động tạo tables khi start app (nếu `synchronize: true`).

Hoặc tạo migration manually:
```bash
npm run typeorm migration:generate -- -n CreateTimelineTables
npm run typeorm migration:run
```

**Tables được tạo:**
- `phases` - Các phase/milestone của project
- `phase_tasks` - Tasks trong mỗi phase
- `timeline_notifications` - Thông báo timeline

### 3. Build Project
```bash
npm run build
```

### 4. Deploy to Server

#### Option A: Deploy locally
```bash
npm run start:prod
```

#### Option B: Deploy to baotienweb.cloud
```bash
# SSH to server
ssh root@baotienweb.cloud

# Navigate to project
cd /var/www/baotienweb-api

# Pull latest code (nếu dùng Git)
git pull origin main

# Or upload files via SCP
scp -r src/timeline root@baotienweb.cloud:/var/www/baotienweb-api/src/

# Install dependencies
npm install

# Build
npm run build

# Restart PM2
pm2 restart baotienweb-api
pm2 save

# Check logs
pm2 logs baotienweb-api
```

### 5. Verify Deployment

Test endpoint:
```bash
curl https://baotienweb.cloud/api/v1/timeline/projects/1
```

Expected: JSON response hoặc empty array (nếu chưa có data)

## 🧪 Testing với Postman

### 1. Create Phase
```http
POST https://baotienweb.cloud/api/v1/timeline/phases
Content-Type: application/json

{
  "projectId": 1,
  "name": "Foundation Work",
  "description": "Laying foundation for building",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-02-01T00:00:00Z",
  "color": "#4AA14A",
  "icon": "hammer"
}
```

### 2. Get Project Timeline
```http
GET https://baotienweb.cloud/api/v1/timeline/projects/1
```

### 3. Update Progress
```http
PATCH https://baotienweb.cloud/api/v1/timeline/phases/1/progress
Content-Type: application/json

{
  "progress": 45,
  "note": "Concrete pouring completed"
}
```

### 4. Create Phase Task
```http
POST https://baotienweb.cloud/api/v1/timeline/phases/1/tasks
Content-Type: application/json

{
  "name": "Excavation",
  "description": "Dig foundation holes",
  "assignedTo": 5,
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-15T00:00:00Z"
}
```

## 📊 Database Schema

### phases table
```sql
CREATE TABLE phases (
  id SERIAL PRIMARY KEY,
  projectId INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'ON_HOLD'),
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP NOT NULL,
  progress DECIMAL(5,2) DEFAULT 0,
  color VARCHAR(7),
  icon VARCHAR(50),
  "order" INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  INDEX idx_project_order (projectId, "order")
);
```

### phase_tasks table
```sql
CREATE TABLE phase_tasks (
  id SERIAL PRIMARY KEY,
  phaseId INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'),
  assignedTo INTEGER,
  startDate TIMESTAMP,
  endDate TIMESTAMP,
  progress DECIMAL(5,2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (phaseId) REFERENCES phases(id) ON DELETE CASCADE,
  INDEX idx_phase (phaseId)
);
```

### timeline_notifications table
```sql
CREATE TABLE timeline_notifications (
  id SERIAL PRIMARY KEY,
  projectId INTEGER NOT NULL,
  phaseId INTEGER,
  type ENUM('PROGRESS_UPDATE', 'PHASE_DELAYED', 'PHASE_COMPLETED', 'MILESTONE_REACHED'),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW(),
  INDEX idx_project_created (projectId, createdAt)
);
```

## 🔍 Troubleshooting

### Error: Cannot find module '@nestjs/typeorm'
```bash
npm install @nestjs/typeorm typeorm pg
```

### Error: Table doesn't exist
Đảm bảo `synchronize: true` trong `app.module.ts` hoặc chạy migration.

### Error: 404 Not Found
- Kiểm tra app.module.ts đã import TimelineModule
- Restart server: `pm2 restart baotienweb-api`
- Check logs: `pm2 logs baotienweb-api`

## ✅ Verification Checklist

- [ ] Module imported trong app.module.ts
- [ ] Database tables created
- [ ] Server restarted
- [ ] Endpoints responding (not 404)
- [ ] Can create phase
- [ ] Can get timeline
- [ ] Can update progress
- [ ] Frontend timeline-api.ts không còn 404

## 🔗 Frontend Integration

Frontend service đã sẵn sàng tại `services/timeline-api.ts`.

Sau khi deploy backend, frontend sẽ tự động connect:
```typescript
// Frontend code - no changes needed
import { getProjectTimeline } from '@/services/timeline-api';

const timeline = await getProjectTimeline(projectId);
// Now returns actual data instead of 404!
```

## 📝 Next Steps

1. ✅ Task 1 Complete: Timeline API deployed
2. ⏭️ Task 9: Create Timeline Screen UI (Frontend)
3. 🔜 Add photo upload to timeline (Task 2 - File Upload)

---

**Deployed:** [Date]  
**Status:** ✅ Ready for production  
**Backend URL:** https://baotienweb.cloud/api/v1/timeline
