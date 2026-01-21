# Staff Registration Security + Email Verification + Contacts Feature

## ✅ Hoàn thành

### 1. **Staff Secret Key Protection** 🔐
- Role **STAFF (Nhân viên)** yêu cầu mã bảo mật: `Nhaxinh@123`
- UI tự động hiện input password khi chọn role Nhân viên
- Icon checkmark/X để validate realtime
- Error message: "Bạn không có quyền đăng ký tài khoản Nhân viên"

### 2. **Email Verification Schema** ✉️
Database ready cho email verification (implement service later):
- `emailVerified` (boolean)
- `emailVerificationCode` (6 digits)
- `emailVerificationExpires` (timestamp)

### 3. **Contacts/Friends Management** 👥
Database schema sẵn sàng:
- Table `contacts` với status: PENDING, ACCEPTED, BLOCKED
- Quan hệ User → Contacts (userId, friendId)
- Indexes cho performance

---

## 📦 Deploy Package

File **`deploy-roles.zip`** (183MB) đã upload lên VPS `/tmp/`

Includes:
- ✅ `dist/` - Backend build mới
- ✅ `add_new_roles.sql` - 8 roles
- ✅ `add_email_verification.sql` - Email verification fields
- ✅ `add_contacts_table.sql` - Contacts table

---

## 🚀 Deployment Commands (VPS)

```bash
ssh root@103.200.20.100

# 1. Extract & backup
cd /root/baotienweb-api
pm2 stop baotienweb-api
tar -czf backup-$(date +%Y%m%d).tar.gz dist/ prisma/

# 2. Copy new dist
cd /tmp
unzip -o deploy-roles.zip -d /root/baotienweb-api-new
cp -r /root/baotienweb-api-new/dist/* /root/baotienweb-api/dist/
cp /root/baotienweb-api-new/*.sql /root/baotienweb-api/

# 3. Run migrations (THEO THỨ TỰ!)
cd /root/baotienweb-api
psql -U postgres -d postgres -f add_new_roles.sql
psql -U postgres -d postgres -f add_email_verification.sql
psql -U postgres -d postgres -f add_contacts_table.sql

# 4. Verify & restart
psql -U postgres -d postgres -c "SELECT enum_range(NULL::\"Role\");"
pm2 restart baotienweb-api
pm2 logs baotienweb-api --lines 20
```

---

## 🧪 Test Cases

### Frontend Test - Staff Registration

| Scenario | Steps | Expected |
|----------|-------|----------|
| **Valid staff key** | 1. Chọn "Nhân viên"<br>2. Nhập `Nhaxinh@123`<br>3. Submit | ✅ Green checkmark<br>✅ Registration success |
| **Invalid staff key** | 1. Chọn "Nhân viên"<br>2. Nhập `wrongkey`<br>3. Submit | ❌ Red X icon<br>❌ Error: "Mã bảo mật không đúng..." |
| **Other roles** | 1. Chọn "Khách hàng", "Nhà thầu", etc.<br>2. Submit | ✅ No staff key input<br>✅ Normal registration |

### Backend Test - Database Schema

```sql
-- Verify roles
SELECT enum_range(NULL::"Role");
-- Expected: {CLIENT,ENGINEER,ADMIN,CONTRACTOR,ARCHITECT,DESIGNER,SUPPLIER,STAFF}

-- Verify User columns
\d users
-- Expected: emailVerified, emailVerificationCode, emailVerificationExpires, phone, location

-- Verify Contacts table
\d contacts
-- Expected: id, userId, friendId, status, createdAt, updatedAt
```

---

## 📋 Next Steps (Implement Later)

### 1. Backend Staff Secret Validation
```typescript
// src/auth/auth.controller.ts
@Post('register')
async register(@Body() dto: RegisterDto) {
  if (dto.role === 'STAFF' && dto.staffSecretKey !== process.env.STAFF_SECRET_KEY) {
    throw new ForbiddenException('Không có quyền đăng ký tài khoản Nhân viên');
  }
  return this.authService.register(dto);
}
```

### 2. Email Verification Service
```typescript
// POST /auth/send-verification-email
// POST /auth/verify-email
// Use NodeMailer or SendGrid
```

### 3. Contacts API
```typescript
// GET /contacts - List friends
// POST /contacts/search?q=email@example.com - Search users
// POST /contacts/add/:userId - Send friend request
// PUT /contacts/:id/accept - Accept request
// DELETE /contacts/:id - Remove friend
```

---

## 📁 Files Modified

### Frontend
| File | Changes |
|------|---------|
| `app/(auth)/auth-3d-flip.tsx` | + staffSecretKey state<br>+ Staff secret input UI<br>+ Validation on submit |

### Backend
| File | Changes |
|------|---------|
| `prisma/schema.prisma` | + Contact model<br>+ ContactStatus enum<br>+ Email verification fields<br>+ User relations |
| `add_new_roles.sql` | SQL migration for 8 roles |
| `add_email_verification.sql` | SQL migration for email fields |
| `add_contacts_table.sql` | SQL migration for contacts |

---

## 🔒 Security Notes

1. **Staff Secret**: Currently hardcoded `Nhaxinh@123`
   - Move to `.env` as `STAFF_SECRET_KEY` in production
   - Rotate key periodically

2. **Email Verification**: Schema ready, needs:
   - SMTP service configuration
   - 6-digit OTP generation
   - Expiry time: 10 minutes recommended

3. **Contacts Privacy**:
   - Only show phone/email to accepted friends
   - Implement block feature
   - Add rate limiting for search API

---

## 📚 Documentation

- **Full Guide**: [COMPLETE_MIGRATION_GUIDE.md](COMPLETE_MIGRATION_GUIDE.md)
- **Previous**: [DEPLOY_ROLES_GUIDE.md](DEPLOY_ROLES_GUIDE.md)

---

**Status**: ✅ Frontend complete, ✅ Schema ready, ⏳ Deploy pending

