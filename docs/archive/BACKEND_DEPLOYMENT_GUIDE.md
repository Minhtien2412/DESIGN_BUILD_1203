# Backend API Deployment Guide
**Ngày:** 13/12/2025  
**Server:** baotienweb.cloud (103.200.20.100)  
**Mục tiêu:** Deploy 11 API modules còn thiếu

---

## 📋 Missing APIs Cần Deploy

| # | Module | Endpoint | Priority | Frontend Cần |
|---|--------|----------|----------|--------------|
| 1 | **Timeline** | `/timeline` | 🔴 HIGH | app/(tabs)/timeline.tsx |
| 2 | **Payment** | `/payments` | 🔴 HIGH | app/checkout.tsx |
| 3 | **Budget** | `/budgets` | 🔴 HIGH | Budget tracking |
| 4 | **Fleet** | `/fleet` | 🟡 MEDIUM | Fleet management |
| 5 | **Video** | `/videos` | 🟡 MEDIUM | app/(tabs)/videos.tsx |
| 6 | **Livestream** | `/livestreams` | 🟡 MEDIUM | app/live/index.tsx |
| 7 | **Comments** | `/comments` | 🟡 MEDIUM | Product reviews |
| 8 | **Communications** | `/communications` | 🟢 LOW | Internal comms |
| 9 | **AI** | `/ai/chat` | 🟢 LOW | AI assistant |
| 10 | **Equipment** | `/equipment` | 🟢 LOW | Equipment mgmt |
| 11 | **QC** | `/qc-inspections` | 🟢 LOW | Quality control |

---

## 🔐 SSH Connection

### Step 1: Connect to Server
```powershell
# From Windows PowerShell
ssh root@103.200.20.100
# Enter password when prompted
```

### Step 2: Navigate to Project
```bash
cd /root/baotienweb-api
pwd  # Should show: /root/baotienweb-api
ls -la  # List files
```

### Step 3: Check Current Status
```bash
# Check running process
pm2 list
pm2 describe baotienweb-api

# Check logs
pm2 logs baotienweb-api --lines 50

# Check modules
ls -la src/
```

---

## 📂 Expected Backend Structure

Dựa vào frontend services, backend cần có structure:

```
/root/baotienweb-api/
├── src/
│   ├── modules/
│   │   ├── auth/           ✅ (already exists)
│   │   ├── projects/       ✅ (already exists)
│   │   ├── tasks/          ✅ (already exists)
│   │   ├── notifications/  ✅ (already exists)
│   │   ├── messages/       ✅ (already exists)
│   │   ├── services/       ✅ (already exists)
│   │   ├── users/          ✅ (already exists)
│   │   │
│   │   ├── timeline/       ❌ (NEED TO CREATE/ENABLE)
│   │   ├── payments/       ❌ (NEED TO CREATE/ENABLE)
│   │   ├── budget/         ❌ (NEED TO CREATE/ENABLE)
│   │   ├── fleet/          ❌ (NEED TO CREATE/ENABLE)
│   │   ├── videos/         ❌ (NEED TO CREATE/ENABLE)
│   │   ├── livestream/     ❌ (NEED TO CREATE/ENABLE)
│   │   ├── comments/       ❌ (NEED TO CREATE/ENABLE)
│   │   ├── communications/ ❌ (NEED TO CREATE/ENABLE)
│   │   ├── ai/             ❌ (NEED TO CREATE/ENABLE)
│   │   ├── equipment/      ❌ (NEED TO CREATE/ENABLE)
│   │   └── qc/             ❌ (NEED TO CREATE/ENABLE)
│   │
│   ├── app.module.ts       (Need to import new modules)
│   └── main.ts
│
├── .env
├── package.json
└── prisma/schema.prisma  (or TypeORM entities)
```

---

## 🛠️ Deployment Steps

### Phase 1: Investigation (5 minutes)

```bash
# 1. Check if modules exist but disabled
ls -la src/modules/

# 2. Check app.module.ts
cat src/app.module.ts | grep -E 'import|@Module'

# 3. Check package.json for scripts
cat package.json | grep -A5 '"scripts"'

# 4. Check .env configuration
cat .env | head -20

# 5. Check database tables
# If using Prisma
npx prisma studio --browser none  # View schema
cat prisma/schema.prisma | grep "model"

# If using TypeORM
find src/ -name "*.entity.ts" | head -20
```

---

### Phase 2: Create Missing Modules (Priority Order)

#### Module 1: Timeline API (HIGHEST PRIORITY)

**Frontend expects:**
```typescript
// GET /timeline
// GET /timeline/:projectId
// POST /timeline (create entry)
```

**Backend scaffold:**
```bash
# If modules don't exist, create them
cd src/modules/

# Create timeline module (if NestJS)
nest g module timeline
nest g controller timeline
nest g service timeline

# Or manually create:
mkdir -p timeline
cd timeline
touch timeline.module.ts timeline.controller.ts timeline.service.ts timeline.entity.ts
```

**timeline.controller.ts** (Example):
```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';

@Controller('timeline')
export class TimelineController {
  @Get()
  async getTimeline() {
    return {
      data: [
        { id: 1, title: 'Project Started', date: '2025-01-01', type: 'milestone' },
        { id: 2, title: 'Foundation Complete', date: '2025-02-15', type: 'completion' }
      ]
    };
  }

  @Get(':projectId')
  async getProjectTimeline(@Param('projectId') projectId: number) {
    return { data: [], projectId };
  }

  @Post()
  async createTimelineEntry(@Body() dto: any) {
    return { success: true, data: dto };
  }
}
```

**timeline.module.ts**:
```typescript
import { Module } from '@nestjs/common';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';

@Module({
  controllers: [TimelineController],
  providers: [TimelineService],
})
export class TimelineModule {}
```

**Add to app.module.ts**:
```typescript
import { TimelineModule } from './modules/timeline/timeline.module';

@Module({
  imports: [
    // ... existing modules
    TimelineModule,  // ADD THIS
  ],
})
```

**Restart server:**
```bash
pm2 restart baotienweb-api
pm2 logs baotienweb-api --lines 50
```

---

#### Module 2: Payment API

**Frontend expects:**
```typescript
// POST /payments (create payment)
// GET /payments/:id (get payment status)
// POST /payments/:id/verify (verify payment)
```

**Quick implementation:**
```bash
cd src/modules/
mkdir -p payments
cd payments
```

**payments.controller.ts**:
```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  @Post()
  async createPayment(@Body() dto: any) {
    return {
      success: true,
      paymentId: Date.now(),
      redirectUrl: 'https://payment-gateway.example.com',
      method: dto.method,
      amount: dto.amount
    };
  }

  @Get(':id')
  async getPayment(@Param('id') id: string) {
    return {
      id,
      status: 'pending',
      amount: 1000000,
      method: 'momo'
    };
  }

  @Post(':id/verify')
  async verifyPayment(@Param('id') id: string) {
    return { success: true, status: 'completed' };
  }
}
```

---

#### Module 3-11: Quick Scaffold Script

**Create script: `scripts/create-modules.sh`**
```bash
#!/bin/bash
cd /root/baotienweb-api/src/modules/

MODULES=("budget" "fleet" "videos" "livestream" "comments" "communications" "ai" "equipment" "qc")

for MODULE in "${MODULES[@]}"; do
  echo "Creating $MODULE module..."
  mkdir -p $MODULE
  
  # Create basic controller
  cat > $MODULE/$MODULE.controller.ts <<EOF
import { Controller, Get } from '@nestjs/common';

@Controller('$MODULE')
export class ${MODULE^}Controller {
  @Get()
  async getAll() {
    return { data: [], module: '$MODULE' };
  }
}
EOF

  # Create basic module
  cat > $MODULE/$MODULE.module.ts <<EOF
import { Module } from '@nestjs/common';
import { ${MODULE^}Controller } from './$MODULE.controller';

@Module({
  controllers: [${MODULE^}Controller],
})
export class ${MODULE^}Module {}
EOF

  echo "✅ Created $MODULE module"
done

echo "🎉 All modules created! Now update app.module.ts"
```

**Run script:**
```bash
chmod +x scripts/create-modules.sh
./scripts/create-modules.sh
```

---

### Phase 3: Update app.module.ts

```bash
nano src/app.module.ts
```

**Add imports:**
```typescript
import { TimelineModule } from './modules/timeline/timeline.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { BudgetModule } from './modules/budget/budget.module';
import { FleetModule } from './modules/fleet/fleet.module';
import { VideosModule } from './modules/videos/videos.module';
import { LivestreamModule } from './modules/livestream/livestream.module';
import { CommentsModule } from './modules/comments/comments.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { AiModule } from './modules/ai/ai.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { QcModule } from './modules/qc/qc.module';

@Module({
  imports: [
    // Existing modules
    AuthModule,
    ProjectsModule,
    TasksModule,
    NotificationsModule,
    MessagesModule,
    ServicesModule,
    UsersModule,
    
    // NEW MODULES
    TimelineModule,
    PaymentsModule,
    BudgetModule,
    FleetModule,
    VideosModule,
    LivestreamModule,
    CommentsModule,
    CommunicationsModule,
    AiModule,
    EquipmentModule,
    QcModule,
  ],
})
```

---

### Phase 4: Rebuild & Restart

```bash
# Install dependencies (if needed)
npm install

# Build project
npm run build

# Restart PM2
pm2 restart baotienweb-api

# Check logs
pm2 logs baotienweb-api --lines 100

# Check if running
pm2 status
```

---

## 🧪 Testing Deployed APIs

### From PowerShell (Windows)

**Test Timeline:**
```powershell
Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/timeline" -Method GET
```

**Test Payments:**
```powershell
$body = @{
  orderId = 123
  amount = 1000000
  method = "momo"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/payments" -Method POST -Body $body -ContentType "application/json"
```

**Test All New Endpoints:**
```powershell
$endpoints = @(
  "timeline",
  "payments",
  "budgets",
  "fleet",
  "videos",
  "livestreams",
  "comments",
  "communications",
  "ai/chat",
  "equipment",
  "qc-inspections"
)

foreach ($endpoint in $endpoints) {
  try {
    $result = Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/$endpoint" -Method GET -ErrorAction Stop
    Write-Host "✅ $endpoint : OK" -ForegroundColor Green
  } catch {
    Write-Host "❌ $endpoint : $($_.Exception.Message)" -ForegroundColor Red
  }
}
```

---

## 🐛 Troubleshooting

### Issue 1: Module not found
```bash
# Check if module exists
ls -la src/modules/timeline/

# Check imports in app.module.ts
cat src/app.module.ts | grep Timeline

# Rebuild
npm run build
pm2 restart baotienweb-api
```

### Issue 2: Port already in use
```bash
# Check what's using port 3000
lsof -i :3000
# Or
netstat -tulpn | grep 3000

# Kill process
kill -9 <PID>
pm2 restart baotienweb-api
```

### Issue 3: Database connection error
```bash
# Check .env
cat .env | grep DATABASE

# Test database connection
psql -h localhost -U postgres -d your_database_name

# Check Prisma schema
npx prisma studio
```

### Issue 4: 404 on endpoint
```bash
# Check routes
pm2 logs baotienweb-api | grep "Mapped"

# Or add logging to main.ts
console.log('API running on http://localhost:3000/api/v1');

# Check nginx config
cat /etc/nginx/sites-enabled/baotienweb.cloud
```

---

## ✅ Post-Deployment Checklist

After deploying all modules:

- [ ] All 11 endpoints return 200 (not 404)
- [ ] PM2 shows process as "online"
- [ ] Logs show no errors (`pm2 logs`)
- [ ] Frontend can connect to new APIs
- [ ] Updated BACKEND_FRONTEND_GAP_ANALYSIS.md
- [ ] Committed code to git

---

## 📊 Expected Results

### Before Deployment
```
Working APIs: 7/18 (39%)
❌ Timeline, Payment, Budget, Fleet, Video, Livestream, Comments, Communications, AI, Equipment, QC
```

### After Deployment
```
Working APIs: 18/18 (100%) ✅
✅ All modules active
✅ Frontend can integrate
```

---

## 🚀 Quick Start Commands

**One-liner to connect and check:**
```bash
ssh root@103.200.20.100 "cd /root/baotienweb-api && ls -la src/modules/ && pm2 status"
```

**Deploy timeline module (fastest path):**
```bash
ssh root@103.200.20.100 << 'ENDSSH'
cd /root/baotienweb-api/src/modules
mkdir -p timeline
cat > timeline/timeline.controller.ts << 'EOF'
import { Controller, Get } from '@nestjs/common';
@Controller('timeline')
export class TimelineController {
  @Get()
  async getAll() {
    return { data: [] };
  }
}
EOF
cat > timeline/timeline.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { TimelineController } from './timeline.controller';
@Module({ controllers: [TimelineController] })
export class TimelineModule {}
EOF
echo "✅ Timeline module created"
ENDSSH
```

---

## 📝 Notes

1. **Quickest approach:** Create basic GET endpoints first, add full CRUD later
2. **Database:** Add Prisma models or TypeORM entities later if needed
3. **Authentication:** Add `@UseGuards(JwtAuthGuard)` to protected endpoints
4. **Validation:** Add DTOs with class-validator later
5. **Testing:** Test each endpoint after creating

**Estimated time:**
- Investigation: 5 mins
- Timeline + Payment (priority): 15 mins
- Other 9 modules (basic): 20 mins
- Testing: 10 mins
- **Total: ~50 minutes** for all 11 APIs

---

**Ready to start?** Paste your SSH password and I'll guide you through each step! 🚀
