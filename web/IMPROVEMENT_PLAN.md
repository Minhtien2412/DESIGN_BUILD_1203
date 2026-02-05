# 📋 KẾ HOẠCH CẢI THIỆN HỆ THỐNG - CHI TIẾT

**Ngày lập:** 20/01/2026  
**Dựa trên:** SYSTEM_EVALUATION_REPORT.md  
**Điểm hiện tại:** 7.85/10  
**Mục tiêu:** 9.0/10

---

## 📊 TỔNG QUAN KẾ HOẠCH

| Phase | Tên                     | Thời gian | Ưu tiên       | Mục tiêu  |
| ----- | ----------------------- | --------- | ------------- | --------- |
| 1     | Testing & Stabilization | 1-2 tuần  | 🔴 Cao        | +0.5 điểm |
| 2     | Performance & Caching   | 2-3 tuần  | 🔴 Cao        | +0.3 điểm |
| 3     | Security Enhancement    | 2-3 tuần  | 🟡 Trung bình | +0.2 điểm |
| 4     | DevOps & CI/CD          | 1-2 tuần  | 🟡 Trung bình | +0.1 điểm |
| 5     | Scale & Infrastructure  | 3-4 tuần  | 🟢 Thấp       | +0.1 điểm |

---

## 🔴 PHASE 1: TESTING & STABILIZATION (1-2 tuần)

**Mục tiêu:** Tăng test coverage từ 20% → 60%, fix tất cả warnings

### 1.1 Unit Tests - Frontend

#### Context Tests

- [ ] `__tests__/context/AuthContext.test.tsx`
  - [ ] Test login flow
  - [ ] Test logout flow
  - [ ] Test token refresh
  - [ ] Test guest mode
- [ ] `__tests__/context/CartContext.test.tsx`
  - [ ] Test addToCart
  - [ ] Test removeFromCart
  - [ ] Test updateQuantity
  - [ ] Test clearCart
  - [ ] Test persistence

- [ ] `__tests__/context/FavoritesContext.test.tsx`
  - [ ] Test addFavorite
  - [ ] Test removeFavorite
  - [ ] Test persistence

#### Service Tests

- [ ] `__tests__/services/api.test.ts`
  - [ ] Test apiFetch with success
  - [ ] Test apiFetch with error
  - [ ] Test retry logic
  - [ ] Test token refresh on 401

- [ ] `__tests__/services/authApi.test.ts`
  - [ ] Test login API
  - [ ] Test register API
  - [ ] Test refresh token API

- [ ] `__tests__/services/productsApi.test.ts`
  - [ ] Test getProducts
  - [ ] Test getProductById
  - [ ] Test searchProducts

#### Component Tests

- [ ] `__tests__/components/ui/Button.test.tsx`
- [ ] `__tests__/components/ui/Input.test.tsx`
- [ ] `__tests__/components/ui/Card.test.tsx`
- [ ] `__tests__/components/ProductCard.test.tsx`
- [ ] `__tests__/components/CartItem.test.tsx`

### 1.2 Unit Tests - Backend

- [ ] `src/auth/auth.service.spec.ts`
  - [ ] Test login
  - [ ] Test register
  - [ ] Test validateToken
  - [ ] Test refreshToken

- [ ] `src/users/users.service.spec.ts`
  - [ ] Test findAll
  - [ ] Test findOne
  - [ ] Test create
  - [ ] Test update
  - [ ] Test delete

- [ ] `src/products/products.service.spec.ts`
  - [ ] Test CRUD operations
  - [ ] Test search
  - [ ] Test pagination

- [ ] `src/conversations/conversations.service.spec.ts`
  - [ ] Test create conversation
  - [ ] Test get conversations
  - [ ] Test add participant

### 1.3 TypeScript Fixes

```bash
# Chạy để tìm tất cả errors
npx tsc --noEmit 2>&1 | tee typescript-errors.txt
```

- [ ] Fix implicit any types
- [ ] Fix null/undefined issues
- [ ] Fix unused variables
- [ ] Fix type mismatches
- [ ] Update deprecated APIs

### 1.4 ESLint Fixes

```bash
# Chạy để tìm tất cả warnings
npm run lint 2>&1 | tee eslint-errors.txt
```

- [ ] Fix unused imports
- [ ] Fix console.log statements
- [ ] Fix any type usage
- [ ] Fix naming conventions

### 1.5 Deliverables

| Item               | Target | Current |
| ------------------ | ------ | ------- |
| Unit Test Coverage | 60%    | 20%     |
| TypeScript Errors  | 0      | ~50     |
| ESLint Warnings    | <20    | ~100    |

---

## 🔴 PHASE 2: PERFORMANCE & CACHING (2-3 tuần)

**Mục tiêu:** Giảm bundle size 30%, API response <200ms

### 2.1 Frontend Performance

#### Bundle Size Optimization

- [ ] Analyze bundle với `npx expo-bundle-analyzer`
- [ ] Remove unused dependencies
- [ ] Implement dynamic imports
- [ ] Code splitting by routes

```javascript
// Lazy loading screens
const ProductDetail = React.lazy(() => import("./screens/ProductDetail"));
```

#### Image Optimization

- [ ] Convert large images to WebP
- [ ] Implement progressive loading
- [ ] Add image caching layer

#### Render Optimization

- [ ] Audit React.memo usage
- [ ] Optimize FlatList renderItem
- [ ] Add virtualization for long lists
- [ ] Reduce re-renders with useMemo

### 2.2 Backend Caching - Redis

#### Setup Redis

```bash
# VPS installation
sudo apt install redis-server
sudo systemctl enable redis-server
```

- [ ] Install Redis on VPS
- [ ] Configure Redis connection in NestJS
- [ ] Create cache module

```typescript
// src/cache/cache.module.ts
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: "localhost",
      port: 6379,
      ttl: 300, // 5 minutes
    }),
  ],
})
export class RedisCacheModule {}
```

#### Implement Caching

- [ ] Cache products list (5 min TTL)
- [ ] Cache user profiles (10 min TTL)
- [ ] Cache categories (1 hour TTL)
- [ ] Cache API responses (customizable)

```typescript
// Usage example
@UseInterceptors(CacheInterceptor)
@CacheTTL(300)
@Get('products')
async getProducts() {
  return this.productsService.findAll();
}
```

### 2.3 Database Optimization

- [ ] Add missing indexes
- [ ] Optimize slow queries
- [ ] Implement connection pooling
- [ ] Add query caching

```sql
-- Add indexes for common queries
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_messages_conversation ON conversation_messages(conversation_id, created_at);
```

### 2.4 API Response Optimization

- [ ] Implement pagination everywhere
- [ ] Add response compression (gzip)
- [ ] Reduce payload size
- [ ] Implement field selection

```typescript
// Field selection
GET /api/v1/products?fields=id,name,price,thumbnail
```

### 2.5 Deliverables

| Item           | Target | Current |
| -------------- | ------ | ------- |
| Bundle Size    | <35MB  | ~50MB   |
| API Response   | <200ms | ~300ms  |
| Cold Start     | <2.5s  | ~3.5s   |
| Redis Hit Rate | >70%   | 0%      |

---

## 🟡 PHASE 3: SECURITY ENHANCEMENT (2-3 tuần)

**Mục tiêu:** Tăng điểm bảo mật từ 8/10 → 9/10

### 3.1 Two-Factor Authentication (2FA)

#### Backend Implementation

```typescript
// src/auth/2fa/two-factor.service.ts
@Injectable()
export class TwoFactorService {
  async generateSecret(userId: number) {}
  async verifyToken(userId: number, token: string) {}
  async enable2FA(userId: number) {}
  async disable2FA(userId: number) {}
}
```

- [ ] Install speakeasy package
- [ ] Create 2FA module
- [ ] Add QR code generation
- [ ] Implement backup codes
- [ ] Update login flow

#### Frontend Implementation

- [ ] Create 2FA setup screen
- [ ] Create OTP input component
- [ ] Add QR scanner
- [ ] Store 2FA status

### 3.2 Biometric Authentication

```typescript
// services/biometricAuthService.ts
import * as LocalAuthentication from "expo-local-authentication";

export async function authenticateWithBiometric() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (hasHardware && isEnrolled) {
    return LocalAuthentication.authenticateAsync({
      promptMessage: "Xác thực bằng vân tay/FaceID",
      fallbackLabel: "Sử dụng mật khẩu",
    });
  }
}
```

- [ ] Check device support
- [ ] Implement biometric login
- [ ] Add biometric settings
- [ ] Fallback to PIN/password

### 3.3 Role-Based Access Control (RBAC)

#### Database Schema

```prisma
model Role {
  id          Int          @id @default(autoincrement())
  name        String       @unique
  permissions Permission[]
  users       User[]
}

model Permission {
  id     Int    @id @default(autoincrement())
  name   String @unique
  roles  Role[]
}
```

- [ ] Create roles table
- [ ] Create permissions table
- [ ] Implement role assignment
- [ ] Create Guards for routes

```typescript
// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler()
    );
    const user = context.switchToHttp().getRequest().user;
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
```

### 3.4 Audit Logging

```typescript
// src/audit/audit.service.ts
@Injectable()
export class AuditService {
  async log(action: string, userId: number, details: any) {
    await this.prisma.auditLog.create({
      data: {
        action,
        userId,
        details: JSON.stringify(details),
        ipAddress: this.request.ip,
        userAgent: this.request.headers["user-agent"],
        timestamp: new Date(),
      },
    });
  }
}
```

- [ ] Create audit_logs table
- [ ] Implement logging decorator
- [ ] Log all auth events
- [ ] Log sensitive operations
- [ ] Create audit report API

### 3.5 Security Headers

```typescript
// main.ts
app.use(
  helmet({
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    dnsPrefetchControl: true,
    frameguard: true,
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: true,
    referrerPolicy: true,
    xssFilter: true,
  })
);
```

- [ ] Add Helmet middleware
- [ ] Configure CSP
- [ ] Add rate limiting per user
- [ ] Implement request signing

### 3.6 Deliverables

| Item       | Target   | Current       |
| ---------- | -------- | ------------- |
| 2FA        | Enabled  | Not available |
| Biometric  | Working  | Partial       |
| RBAC       | Complete | Basic roles   |
| Audit Logs | Full     | Basic         |

---

## 🟡 PHASE 4: DEVOPS & CI/CD (1-2 tuần)

**Mục tiêu:** Automated testing, deployment, và monitoring

### 4.1 CI/CD Pipeline - GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build app
        run: npm run build

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/baotienweb-api
            git pull
            npm install
            npx prisma migrate deploy
            npm run build
            pm2 restart baotienweb-api
```

- [ ] Create GitHub Actions workflow
- [ ] Setup secrets in GitHub
- [ ] Add test stage
- [ ] Add build stage
- [ ] Add deploy stage

### 4.2 Automated Database Backup

```bash
#!/bin/bash
# /scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgres"
DB_NAME="postgres"

# Create backup
pg_dump $DB_NAME | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/db_backup_$DATE.sql.gz" s3://baotienweb-backups/
```

- [ ] Create backup script
- [ ] Setup cron job (daily at 2 AM)
- [ ] Configure S3 storage
- [ ] Test restore process

```bash
# Crontab entry
0 2 * * * /scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
```

### 4.3 Monitoring & Alerting

#### Application Performance Monitoring (APM)

- [ ] Setup New Relic / Datadog / Elastic APM
- [ ] Configure performance thresholds
- [ ] Setup alerts for slow queries
- [ ] Monitor memory/CPU usage

#### Log Aggregation

- [ ] Setup ELK Stack or Loki
- [ ] Configure log shipping from PM2
- [ ] Create dashboards
- [ ] Setup log-based alerts

```yaml
# docker-compose.yml for ELK
version: "3"
services:
  elasticsearch:
    image: elasticsearch:8.11.0
  logstash:
    image: logstash:8.11.0
  kibana:
    image: kibana:8.11.0
```

### 4.4 Health Checks & Uptime

```typescript
// src/health/health.controller.ts
@Controller("health")
export class HealthController {
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck("database"),
      () => this.redis.pingCheck("redis"),
      () =>
        this.disk.checkStorage("storage", { path: "/", thresholdPercent: 0.9 }),
      () => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024),
    ]);
  }
}
```

- [ ] Enhance health check endpoint
- [ ] Setup uptime monitoring (UptimeRobot)
- [ ] Configure alert channels (Slack, Email)
- [ ] Create status page

### 4.5 Deliverables

| Item      | Target     | Current     |
| --------- | ---------- | ----------- |
| CI/CD     | Automated  | Manual      |
| DB Backup | Daily + S3 | None        |
| APM       | Enabled    | Sentry only |
| Uptime    | 99.9%      | Unknown     |

---

## 🟢 PHASE 5: SCALE & INFRASTRUCTURE (3-4 tuần)

**Mục tiêu:** Ready for 10x traffic growth

### 5.1 Load Balancer Setup

```nginx
# /etc/nginx/nginx.conf
upstream backend {
    least_conn;
    server 127.0.0.1:3000 weight=3;
    server 127.0.0.1:3001 weight=3;
    server 127.0.0.1:3002 weight=3;
    keepalive 32;
}

server {
    listen 80;
    server_name api.baotienweb.cloud;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

- [ ] Configure Nginx load balancer
- [ ] Run multiple Node.js instances
- [ ] Setup health checks for instances
- [ ] Configure session affinity for WebSocket

### 5.2 CDN Integration

- [ ] Setup CloudFlare or AWS CloudFront
- [ ] Configure static asset caching
- [ ] Enable image optimization
- [ ] Setup edge caching for API

```
CDN Configuration:
├── Static assets: 1 year cache
├── Images: 30 days cache
├── API responses: 5 min cache (selected endpoints)
└── HTML: no-cache
```

### 5.3 Database Scaling

#### Read Replicas

```
Primary (Write) ──────► Replica 1 (Read)
                  └───► Replica 2 (Read)
```

- [ ] Setup PostgreSQL read replica
- [ ] Configure Prisma for read/write splitting
- [ ] Implement connection routing

#### Connection Pooling

```typescript
// PgBouncer configuration
[databases]
postgres = host=127.0.0.1 port=5432 dbname=postgres

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 50
```

### 5.4 Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: "3"
services:
  api:
    image: baotienweb-api:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
```

- [ ] Containerize application (Docker)
- [ ] Setup container orchestration (Docker Swarm/K8s)
- [ ] Configure auto-scaling rules
- [ ] Implement graceful shutdown

### 5.5 Disaster Recovery

- [ ] Setup secondary VPS in different region
- [ ] Configure database replication
- [ ] Create failover procedures
- [ ] Document recovery steps

### 5.6 Deliverables

| Item          | Target  | Current |
| ------------- | ------- | ------- |
| Load Balancer | Active  | None    |
| CDN           | Enabled | None    |
| DB Replicas   | 1+      | 0       |
| Auto-scaling  | Enabled | Manual  |

---

## 📅 TIMELINE TỔNG HỢP

```
Week 1-2:   Phase 1 - Testing & Stabilization
Week 3-5:   Phase 2 - Performance & Caching
Week 6-8:   Phase 3 - Security Enhancement
Week 9-10:  Phase 4 - DevOps & CI/CD
Week 11-14: Phase 5 - Scale & Infrastructure
```

```
┌──────────────────────────────────────────────────────────────────┐
│                    IMPROVEMENT TIMELINE                           │
├──────────────────────────────────────────────────────────────────┤
│ Jan 20     Feb 3      Feb 17     Mar 3      Mar 17     Apr 1     │
│   │          │          │          │          │          │       │
│   ▼          ▼          ▼          ▼          ▼          ▼       │
│ ┌────────┐┌────────────┐┌────────────┐┌──────┐┌──────────────┐   │
│ │Phase 1 ││  Phase 2   ││  Phase 3   ││ P4   ││   Phase 5    │   │
│ │Testing ││Performance ││  Security  ││DevOps││    Scale     │   │
│ └────────┘└────────────┘└────────────┘└──────┘└──────────────┘   │
│                                                                   │
│ Target Score Progression:                                         │
│ 7.85 → 8.35 → 8.65 → 8.85 → 8.95 → 9.0+                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 METRICS & KPIs

### Performance KPIs

| Metric             | Current | Phase 2 Target | Final Target |
| ------------------ | ------- | -------------- | ------------ |
| API Response (p95) | 300ms   | 200ms          | 150ms        |
| Bundle Size        | 50MB    | 40MB           | 35MB         |
| Cold Start         | 3.5s    | 2.5s           | 2.0s         |
| Lighthouse Score   | 70      | 80             | 90           |

### Quality KPIs

| Metric              | Current | Phase 1 Target | Final Target |
| ------------------- | ------- | -------------- | ------------ |
| Test Coverage       | 20%     | 60%            | 80%          |
| TypeScript Errors   | 50+     | 0              | 0            |
| ESLint Warnings     | 100+    | 20             | 0            |
| Accessibility Score | 60      | 80             | 90           |

### Infrastructure KPIs

| Metric           | Current | Phase 4 Target | Final Target |
| ---------------- | ------- | -------------- | ------------ |
| Uptime           | Unknown | 99.5%          | 99.9%        |
| Deployment Time  | 30min   | 10min          | 5min         |
| Recovery Time    | N/A     | 30min          | 15min        |
| Backup Frequency | None    | Daily          | Hourly       |

---

## ✅ CHECKLIST TỔNG HỢP

### Phase 1 Checklist

- [ ] 30+ unit tests for contexts
- [ ] 20+ unit tests for services
- [ ] 15+ component tests
- [ ] 0 TypeScript errors
- [ ] <20 ESLint warnings
- [ ] 60% test coverage

### Phase 2 Checklist

- [ ] Redis installed and configured
- [ ] Caching implemented for top 10 endpoints
- [ ] Bundle size reduced 30%
- [ ] All images optimized
- [ ] Lazy loading for all routes

### Phase 3 Checklist

- [ ] 2FA working
- [ ] Biometric auth working
- [ ] RBAC implemented
- [ ] Audit logging enabled
- [ ] Security headers configured

### Phase 4 Checklist

- [ ] CI pipeline working
- [ ] CD pipeline working
- [ ] Daily backups running
- [ ] APM monitoring enabled
- [ ] Alerting configured

### Phase 5 Checklist

- [ ] Load balancer active
- [ ] CDN enabled
- [ ] Read replica setup
- [ ] Container orchestration
- [ ] DR plan documented

---

**Tài liệu được tạo:** 20/01/2026  
**Phiên bản:** 1.0.0  
**Review tiếp theo:** 03/02/2026
