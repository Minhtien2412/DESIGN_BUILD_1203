# 🔒 Security Best Practices - Database Access

## ✅ ĐÚNG: Kiến trúc 3 tầng an toàn

```
┌─────────────────────────────────────────────────────────────┐
│  MOBILE APP (React Native)                                  │
│  • KHÔNG có database credentials                            │
│  • KHÔNG import mysql2, pg, prisma                          │
│  • CHỈ dùng apiFetch()                                      │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS + JWT Token
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND API (Node.js/Fastify)                              │
│  • Xác thực JWT token                                       │
│  • Validate input (SQL injection protection)               │
│  • Rate limiting (DDoS protection)                          │
│  • Audit logging                                            │
│  • Business logic                                           │
└────────────────┬────────────────────────────────────────────┘
                 │ Internal network
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL/MySQL)                                │
│  • Chỉ cho phép backend connect                             │
│  • Port 5432/3306 KHÔNG expose ra internet                 │
│  • Row-level security                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## ❌ SAI: Direct Database Access

### CÁC LỖI THƯỜNG GẶP

#### 1. Import trực tiếp Prisma/TypeORM
```typescript
// ❌ NGUY HIỂM - Có thể reverse engineering để lấy DATABASE_URL
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const users = await prisma.user.findMany();
```

#### 2. Hardcode connection string
```typescript
// ❌ CỰC KỲ NGUY HIỂM - Credentials lộ trong APK
const pool = mysql.createPool({
  host: 'api.thietkeresort.com.vn',
  user: 'admin',
  password: 'secret123',
  database: 'production_db'
});
```

#### 3. Environment variables trong mobile app
```typescript
// ❌ VÔ DỤNG - .env được bundle vào APK, dễ đọc
DATABASE_URL=postgresql://user:pass@host:5432/db
```

---

## ✅ ĐÚNG: Sử dụng Backend API

### App Code
```typescript
// ✅ AN TOÀN - Chỉ gọi API
import { apiFetch } from '@/services/api';

// List projects
const projects = await apiFetch<Project[]>('/api/projects');

// Get one project
const project = await apiFetch<Project>(`/api/projects/${id}`);

// Create project (với JWT token tự động)
const newProject = await apiFetch<Project>('/api/projects', {
  method: 'POST',
  data: { title, description, owner_id }
});
```

### Backend Code (Node.js)
```typescript
// ✅ Backend mới được phép connect DB
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

app.get('/api/projects', authenticate, async (req, res) => {
  // Validate user permission
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
  // Apply filters based on role
  const where = req.user.role === 'admin' 
    ? {} 
    : { owner_id: req.user.id };
  
  const projects = await prisma.project.findMany({ where });
  
  // Audit log
  await logActivity('projects.list', req.user.id);
  
  res.json({ success: true, data: projects });
});
```

---

## 🛡️ Tại sao Backend bắt buộc?

### 1. **Bảo mật Credentials**
- APK file có thể reverse engineering bằng `apktool`, `jadx`
- Mọi string trong code đều đọc được → DATABASE_URL sẽ lộ
- Backend chạy trên server → credentials an toàn

### 2. **Authentication & Authorization**
```typescript
// Backend kiểm tra quyền
if (req.user.role !== 'admin' && project.owner_id !== req.user.id) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### 3. **Validation & Sanitization**
```typescript
// Backend validate input
const schema = z.object({
  title: z.string().min(1).max(200),
  budget: z.number().positive(),
});

const validated = schema.parse(req.body); // Throw nếu invalid
```

### 4. **Rate Limiting**
```typescript
// Chặn spam/DDoS
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100 // 100 requests/IP
}));
```

### 5. **Audit Trail**
```typescript
// Log mọi hành động quan trọng
await prisma.auditLog.create({
  data: {
    user_id: req.user.id,
    action: 'project.delete',
    resource_id: projectId,
    ip: req.ip,
    timestamp: new Date()
  }
});
```

### 6. **Business Logic tập trung**
```typescript
// Tính toán phức tạp chỉ cần viết 1 lần
function calculateProjectCost(project) {
  let total = project.budget;
  total += project.budget * 0.1; // VAT 10%
  total += project.workers * 5000000; // Labor cost
  return total;
}
```

---

## 📋 Checklist Bảo mật

### Mobile App
- [ ] **KHÔNG** import `prisma`, `mysql2`, `pg`, `typeorm`
- [ ] **KHÔNG** có `DATABASE_URL` trong `.env`
- [ ] **TẤT CẢ** data queries đi qua `apiFetch()`
- [ ] Mọi request đều gửi JWT token trong header
- [ ] Xử lý graceful khi backend offline (cache, fallback)

### Backend
- [ ] **CHỈ** backend mới connect database
- [ ] Validate **MỌI** input từ client
- [ ] Implement rate limiting
- [ ] Log sensitive operations
- [ ] Use environment variables cho credentials
- [ ] Enable CORS chỉ cho app domain
- [ ] HTTPS bắt buộc (không HTTP)

### Database
- [ ] Port 5432/3306 **KHÔNG** mở ra internet
- [ ] Chỉ allow connection từ backend IP
- [ ] Enable SSL/TLS connections
- [ ] Regular backups (automated)
- [ ] Row-level security policies
- [ ] Monitor slow queries

### Infrastructure
- [ ] Firewall rules: chỉ backend → DB
- [ ] VPN/Private network cho DB
- [ ] Secrets trong vault (AWS Secrets Manager, HashiCorp Vault)
- [ ] Rotate credentials định kỳ
- [ ] Monitor failed login attempts
- [ ] Auto-scaling cho traffic spikes

---

## 🔧 Files trong project này

### ✅ An toàn
- `services/api.ts` - apiFetch wrapper
- `services/databaseManager.ts` - GỌI API, không connect trực tiếp
- `context/AuthContext.tsx` - JWT auth flow
- `hooks/useVideos.ts` - Fetch từ `/api/videos`

### ⚠️  Cần review
- `services/databaseConfig.ts` - CHỈ dùng cho backend, XÓA khỏi mobile build
- `components/SmartProjectList.tsx` - Đang dùng enhancedProjectApiService (kiểm tra xem có gọi API đúng không)

### ❌ KHÔNG dùng trong mobile app
- `prisma/schema.prisma` - Chỉ cho backend
- Bất kỳ file nào import `mysql2`, `pg`

---

## 🚀 Migration Plan

Nếu hiện tại có code direct DB access:

### Bước 1: Tạo backend endpoint
```typescript
// backend/routes/projects.ts
router.get('/projects', authenticate, async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { owner_id: req.user.id }
  });
  res.json({ success: true, data: projects });
});
```

### Bước 2: Thay thế trong app
```typescript
// ❌ Trước
import { db } from './database';
const projects = await db.project.findMany();

// ✅ Sau
import { apiFetch } from './api';
const { data } = await apiFetch('/api/projects');
const projects = data;
```

### Bước 3: Xóa dependencies
```bash
npm uninstall prisma @prisma/client mysql2 pg
```

### Bước 4: Test
- [ ] App vẫn load data đúng
- [ ] Không còn direct DB calls
- [ ] Audit logs hoạt động

---

## 📚 Tài liệu tham khảo

- [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- [React Native Security Best Practices](https://reactnative.dev/docs/security)
- [JWT Authentication Flow](https://jwt.io/introduction)

---

## 📞 Support

Nếu gặp vấn đề migration hoặc cần review security:
1. Tạo issue trên GitHub repo
2. Tag với `security` label
3. Attach code snippet cần review

**Nguyên tắc vàng: Khi nghi ngờ → GỌI API, đừng connect trực tiếp!**
