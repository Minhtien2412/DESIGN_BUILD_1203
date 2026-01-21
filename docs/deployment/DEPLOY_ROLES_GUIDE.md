# Deploy Backend with New Roles - Manual Steps

## Tổng quan thay đổi

1. **Prisma Role enum** đã được mở rộng với các giá trị:
   - `CLIENT` (Khách hàng)
   - `ENGINEER` (Kỹ sư)
   - `CONTRACTOR` (Nhà thầu)
   - `ARCHITECT` (Kiến trúc sư)
   - `DESIGNER` (Thiết kế)
   - `SUPPLIER` (Nhà cung cấp)
   - `STAFF` (Nhân viên)
   - `ADMIN` (Quản trị viên)

2. **Frontend** đã được cập nhật để gửi role đúng khi đăng ký.

---

## Các bước deploy lên VPS

### 1. Upload file zip lên VPS

```powershell
# Từ máy local, chạy:
scp "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025\BE-baotienweb.cloud\deploy-roles.zip" root@103.200.20.100:/tmp/
```

Nhập password khi được hỏi.

### 2. SSH vào VPS và giải nén

```bash
ssh root@103.200.20.100
```

### 3. Chạy các lệnh sau trên VPS

```bash
# Di chuyển đến thư mục backend
cd /root/baotienweb-api

# Stop PM2 trước khi deploy
pm2 stop baotienweb-api

# Backup old dist
mv dist dist.bak.$(date +%Y%m%d%H%M%S)

# Giải nén file mới
cd /tmp
unzip -o deploy-roles.zip -d /root/baotienweb-api-new

# Copy files mới
cp -r /root/baotienweb-api-new/dist /root/baotienweb-api/
cp /root/baotienweb-api-new/add_new_roles.sql /root/baotienweb-api/

# Chạy migration SQL để thêm role mới
cd /root/baotienweb-api
psql -U postgres -d postgres -f add_new_roles.sql

# Restart PM2
pm2 restart baotienweb-api

# Kiểm tra logs
pm2 logs baotienweb-api --lines 20
```

### 4. Verify SQL đã chạy thành công

```bash
psql -U postgres -d postgres -c "SELECT enum_range(NULL::\"Role\");"
```

Output mong đợi:
```
{CLIENT,ENGINEER,ADMIN,CONTRACTOR,ARCHITECT,DESIGNER,SUPPLIER,STAFF}
```

---

## Files đã thay đổi

### Backend (BE-baotienweb.cloud)
- `prisma/schema.prisma` - Mở rộng Role enum
- `add_new_roles.sql` - SQL migration script

### Frontend
- `services/api/authApi.ts` - Thêm UserRole type
- `utils/auth-helpers.ts` - Cập nhật RegisterFormData với role types mới
- `hooks/useAuthForms.ts` - Default role = 'CLIENT'
- `context/AuthContext.tsx` - Gửi role trong signUp
- `app/(auth)/auth-3d-flip.tsx` - 6 role buttons với giá trị đúng

---

## Test sau deploy

1. Mở app Expo Go
2. Đăng ký tài khoản mới với từng role khác nhau
3. Kiểm tra log backend xem role có được lưu đúng không:
   ```bash
   pm2 logs baotienweb-api --lines 50
   ```
4. Test đăng nhập với tài khoản mới tạo

---

## Rollback (nếu cần)

```bash
# Trên VPS
cd /root/baotienweb-api
pm2 stop baotienweb-api
rm -rf dist
mv dist.bak.* dist
pm2 restart baotienweb-api
```
