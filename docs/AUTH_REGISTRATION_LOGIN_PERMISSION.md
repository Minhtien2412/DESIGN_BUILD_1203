# AUTH REGISTRATION LOGIN & ROLE PERMISSION CONTROL
# Hệ Thống Đăng Ký, Đăng Nhập và Kiểm Soát Quyền Hoàn Chỉnh

## 🎯 Overview - Tổng Quan

Hệ thống xác thực và phân quyền đầy đủ cho marketplace xây dựng/nội thất:

✅ **Đăng ký (Registration)** với lựa chọn 8 vai trò marketplace  
✅ **Đăng nhập (Login)** qua Email/Password + Google/Facebook OAuth  
✅ **8 vai trò** với permissions riêng biệt  
✅ **Permission Guards** bảo vệ UI components  
✅ **Protected Screens** với role-based access control  
✅ **Seller/Company Dashboard** với phân quyền chi tiết  

---

## 📝 1. ĐĂNG KÝ (REGISTRATION)

### File: [app/(auth)/register.tsx](./app/(auth)/register.tsx)

### ✨ Features

#### 1.1 Basic Registration Form
- ✅ Email/Password với validation
- ✅ Floating labels animated
- ✅ Real-time error checking
- ✅ Glass morphism UI design

#### 1.2 **Marketplace Role Selector** (NEW)

```tsx
// State
const [userType, setUserType] = useState<UserType>('buyer');
const [showRoleSelector, setShowRoleSelector] = useState(false);

// UI Button - Click để mở selector
<Pressable onPress={() => setShowRoleSelector(true)}>
  <Text>Loại tài khoản: {userType}</Text>
  <Ionicons name="chevron-down" />
</Pressable>

// Full Role Selector
{showRoleSelector && (
  <RoleSelector
    selectedRole={userType}
    onRoleSelect={(role) => {
      setUserType(role);
      setShowRoleSelector(false);
    }}
    excludeRoles={['admin']} // Admin không cho tự đăng ký
  />
)}
```

#### 1.3 Registration Flow

```
User mở Register screen
    ↓
Điền: Name, Email, Password
    ↓
Click "Chọn vai trò" → RoleSelector hiện ra
    ↓
Chọn vai trò (buyer/seller/company/contractor/architect/designer/supplier)
    ↓
Click "Tạo tài khoản"
    ↓
Call: signUp(email, password, name, legacyRole, userType)
    ↓
Backend tạo user với userType
    ↓
Auto-login → Navigate to /(tabs)
```

#### 1.4 Code Implementation

```tsx
const handleRegister = async () => {
  // Validation
  if (!name.trim() || !email.trim() || !password.trim() || !userType) {
    Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin và chọn vai trò');
    return;
  }

  setLoading(true);
  try {
    // Pass userType to backend
    await signUp(email, password, name, role, userType);
    router.replace('/(tabs)');
  } catch (error: any) {
    Alert.alert('Lỗi đăng ký', error.message);
  } finally {
    setLoading(false);
  }
};
```

### 1.5 Social Login Options

```tsx
// Google OAuth (Authorization Code Flow)
await signInWithGoogleCode(authCode);

// Google OAuth (Implicit Flow)
await signInWithGoogleToken(idToken);

// Facebook
await signInWithFacebook();
```

---

## 🔑 2. ĐĂNG NHẬP (LOGIN)

### File: [app/(auth)/login.tsx](./app/(auth)/login.tsx)

### 2.1 Login Methods

#### Email/Password
```tsx
await signIn(email, password);
```

#### Google OAuth
```tsx
// Method 1: Authorization Code Flow (Recommended)
const googleAuth = useGoogleOAuth({
  flow: 'auth-code',
  onSuccess: async ({ code }) => {
    await signInWithGoogleCode(code);
    router.replace('/(tabs)');
  }
});

// Method 2: Implicit Flow
const googleAuth = useGoogleOAuth({
  flow: 'implicit',
  onSuccess: async ({ idToken }) => {
    await signInWithGoogleToken(idToken);
    router.replace('/(tabs)');
  }
});
```

#### Facebook
```tsx
await signInWithFacebook();
```

### 2.2 Login Flow

```
User nhập email + password
    ↓
Submit → signIn(email, password)
    ↓
Backend verify credentials
    ↓
Return: { accessToken, refreshToken, user: { userType, ... } }
    ↓
AuthContext updates state
    ↓
hasMarketplacePermission() ready
    ↓
Navigate to /(tabs)
```

---

## 👥 3. 8 VAI TRÒ MARKETPLACE

### Role Configuration: [constants/roles.ts](./constants/roles.ts)

| # | Role | Tên Tiếng Việt | Icon | Color | Verification |
|---|------|---------------|------|-------|--------------|
| 1 | buyer | Khách Hàng | person-outline | #3B82F6 | ❌ |
| 2 | seller | Người Bán Cá Nhân | hammer-outline | #10B981 | ✅ |
| 3 | company | Công Ty | business-outline | #8B5CF6 | ✅ |
| 4 | contractor | Nhà Thầu | construct-outline | #F59E0B | ✅ |
| 5 | architect | Kiến Trúc Sư | shapes-outline | #EC4899 | ✅ |
| 6 | designer | Nhà Thiết Kế | color-palette-outline | #EF4444 | ✅ |
| 7 | supplier | Nhà Cung Cấp | cube-outline | #06B6D4 | ✅ |
| 8 | admin | Quản Trị Viên | shield-checkmark-outline | #DC2626 | ❌ |

### 3.1 Buyer (Khách Hàng)

**Capabilities:**
- Tìm kiếm sản phẩm/dịch vụ
- Liên hệ với người bán
- Đặt hàng và thanh toán
- Đánh giá và review
- Chat với seller
- Lưu sản phẩm yêu thích

**Permissions:**
```typescript
['product.view', 'product.search', 'cart.manage', 'order.create', 
 'order.view_own', 'review.create', 'chat.send', 'wishlist.manage']
```

### 3.2 Seller (Người Bán Cá Nhân)

**Capabilities:**
- Đăng sản phẩm/dịch vụ
- Quản lý đơn hàng
- Chat với khách hàng
- Upload portfolio
- Nhận thanh toán
- Quản lý lịch làm việc
- Xem thống kê bán hàng

**Permissions:**
```typescript
['product.create', 'product.edit_own', 'product.delete_own',
 'order.view_own', 'order.update_status', 'chat.respond',
 'portfolio.manage', 'calendar.manage', 'analytics.view_own']
```

**Verification Requirements:**
- CMND/CCCD (mặt trước + sau)
- Chứng chỉ nghề (nếu có)
- Portfolio (tối thiểu 3 dự án)

### 3.3 Company (Công Ty)

**Capabilities:**
- Đăng dự án showcase
- Quản lý nhiều sản phẩm
- Quản lý team nhân viên
- Tạo báo giá chi tiết
- Marketing và quảng cáo
- Phân tích dữ liệu kinh doanh
- API integration

**Permissions:**
```typescript
['product.create', 'product.edit_own', 'project.create', 'project.manage',
 'team.manage', 'quote.create', 'order.manage', 'analytics.advanced',
 'marketing.manage', 'api.access']
```

**Verification Requirements:**
- Giấy phép kinh doanh
- Mã số thuế
- Chứng chỉ ISO (nếu có)
- Portfolio công ty

### 3.4 Contractor (Nhà Thầu)

**Capabilities:**
- Nhận thầu dự án lớn
- Quản lý thầu phụ
- Lập kế hoạch thi công
- Quản lý nguyên vật liệu
- Quản lý chi phí
- Giám sát chất lượng

**Permissions:**
```typescript
['project.bid', 'project.manage_awarded', 'subcontractor.manage',
 'material.order', 'schedule.manage', 'budget.manage',
 'progress.report', 'quality.inspect']
```

### 3.5 Architect (Kiến Trúc Sư)

**Capabilities:**
- Thiết kế kiến trúc 2D/3D
- Tư vấn giải pháp
- Lập hồ sơ thiết kế
- Xin phép xây dựng
- Giám sát thi công

**Permissions:**
```typescript
['design.create', 'design.2d_3d', 'design.export',
 'consultation.provide', 'permit.file', 'supervision.conduct',
 'inspection.perform', 'certification.display']
```

### 3.6 Designer (Nhà Thiết Kế)

**Capabilities:**
- Thiết kế nội thất 3D
- Tư vấn phong cách
- Render hình ảnh
- Chọn lựa vật liệu
- Shopping list nội thất

**Permissions:**
```typescript
['interior.design', 'render.3d', 'moodboard.create',
 'material.recommend', 'color.consult', 'space.plan',
 'shopping.list', 'supervision.interior']
```

### 3.7 Supplier (Nhà Cung Cấp)

**Capabilities:**
- Đăng catalog sản phẩm
- Quản lý tồn kho
- Báo giá theo số lượng
- Giao hàng và lắp đặt
- Bảo hành sản phẩm
- Bulk orders

**Permissions:**
```typescript
['catalog.manage', 'inventory.manage', 'quote.bulk',
 'delivery.manage', 'warranty.manage', 'dealer.program',
 'invoice.vat', 'stock.alert']
```

### 3.8 Admin (Quản Trị Viên)

**Capabilities:**
- Quản lý tất cả users
- Duyệt verification
- Xử lý tranh chấp
- Quản lý nội dung
- Phân tích toàn hệ thống
- Cấu hình platform

**Permissions:**
```typescript
['system.full_access'] // Bypass all checks
```

---

## 🛡️ 4. PERMISSION GUARDS

### 4.1 PermissionGuard Component

**File:** [components/auth/PermissionGuard.tsx](./components/auth/PermissionGuard.tsx)

```tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard';

// Basic usage
<PermissionGuard permission="product.create">
  <Button title="Tạo sản phẩm mới" />
</PermissionGuard>

// With fallback
<PermissionGuard 
  permission="analytics.advanced"
  fallback={<Text>Nâng cấp lên tài khoản Company để xem</Text>}
>
  <AnalyticsChart />
</PermissionGuard>
```

### 4.2 RoleGuard Component

**File:** [components/auth/RoleGuard.tsx](./components/auth/RoleGuard.tsx)

```tsx
import { RoleGuard } from '@/components/auth/RoleGuard';

// Chỉ seller và company
<RoleGuard allowedRoles={['seller', 'company']}>
  <ProductManagement />
</RoleGuard>

// Chỉ admin
<RoleGuard allowedRoles={['admin']}>
  <AdminPanel />
</RoleGuard>

// Multiple roles
<RoleGuard allowedRoles={['architect', 'designer']}>
  <DesignTools />
</RoleGuard>
```

### 4.3 ProtectedScreen Component

**File:** [components/auth/ProtectedScreen.tsx](./components/auth/ProtectedScreen.tsx)

```tsx
import { ProtectedScreen } from '@/components/auth/ProtectedScreen';

export default function SellerDashboard() {
  return (
    <ProtectedScreen
      requireAuth={true}                    // Must be logged in
      requireRoles={['seller', 'company']}  // Must be seller or company
      requirePermissions={['product.create']} // Must have permission
      requireVerified={true}                // Must be verified
    >
      <View>
        {/* Screen content */}
      </View>
    </ProtectedScreen>
  );
}
```

#### Protection Flow

```
User accesses screen
    ↓
ProtectedScreen checks:
    1. Loading? → Show loader
    2. requireAuth && !isAuthenticated? → Show "Yêu cầu đăng nhập"
    3. requireRoles && wrong role? → Show "Không có quyền truy cập"
    4. requirePermissions && missing? → Show "Thiếu quyền"
    5. requireVerified && !verified? → Show "Cần xác minh"
    ↓
All passed → Render children
```

---

## 💻 5. USAGE EXAMPLES

### 5.1 Product Card với Role-Based Actions

```tsx
// components/ui/product-card.tsx
import { useAuth } from '@/context/AuthContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { RoleBadge } from '@/components/ui/role-badge';

export function ProductCard({ product }) {
  const { user, hasMarketplacePermission } = useAuth();
  
  return (
    <View>
      {/* Product Info */}
      <Image source={product.image} />
      <Text>{product.name}</Text>
      <Text>{formatPrice(product.price)}</Text>
      
      {/* Seller Badge */}
      {product.seller?.userType && (
        <RoleBadge userType={product.seller.userType} size="small" />
      )}
      
      {/* Buyer: Add to Cart */}
      {user?.userType === 'buyer' && (
        <Button 
          title="Thêm vào giỏ" 
          onPress={() => addToCart(product)} 
        />
      )}
      
      {/* Seller: Edit Own Product */}
      <PermissionGuard permission="product.edit_own">
        {product.sellerId === user?.sellerId && (
          <Button 
            title="Sửa sản phẩm" 
            onPress={() => router.push(`/products/${product.id}/edit`)} 
          />
        )}
      </PermissionGuard>
      
      {/* Admin: Delete Any Product */}
      <PermissionGuard permission="system.full_access">
        <Button 
          title="Xóa" 
          onPress={handleDelete} 
          color="red" 
        />
      </PermissionGuard>
    </View>
  );
}
```

### 5.2 Seller Dashboard (Example Screen)

**File:** [app/seller/dashboard.tsx](./app/seller/dashboard.tsx)

```tsx
export default function SellerDashboardScreen() {
  const { user } = useAuth();
  
  return (
    <ProtectedScreen
      requireAuth={true}
      requireRoles={['seller', 'company', 'contractor', 'supplier']}
      requirePermissions={['product.create']}
    >
      <ScrollView>
        {/* Header with Role Badge */}
        <View>
          <Text>Xin chào, {user?.name}</Text>
          {user?.userType && <RoleBadge userType={user.userType} />}
        </View>

        {/* Stats */}
        <View>
          <StatCard title="Sản phẩm" value="24" icon="cube" />
          <StatCard title="Đơn hàng" value="12" icon="cart" />
          <StatCard title="Đánh giá" value="4.8" icon="star" />
        </View>

        {/* Actions - Permission-based */}
        
        {/* All sellers can create products */}
        <PermissionGuard permission="product.create">
          <ActionButton 
            title="Tạo sản phẩm mới"
            icon="add-circle"
            onPress={() => router.push('/products/create')}
          />
        </PermissionGuard>

        {/* Only companies have advanced analytics */}
        <PermissionGuard permission="analytics.advanced">
          <ActionButton 
            title="Phân tích nâng cao"
            icon="analytics"
            onPress={() => router.push('/analytics')}
          />
        </PermissionGuard>

        {/* Only companies can manage team */}
        <PermissionGuard permission="team.manage">
          <ActionButton 
            title="Quản lý nhân viên"
            icon="people"
            onPress={() => router.push('/team')}
          />
        </PermissionGuard>
      </ScrollView>
    </ProtectedScreen>
  );
}
```

### 5.3 Conditional Navigation

```tsx
function DashboardButton() {
  const { user } = useAuth();
  const router = useRouter();
  
  const handlePress = () => {
    switch (user?.userType) {
      case 'buyer':
        router.push('/(tabs)/profile');
        break;
      case 'seller':
      case 'company':
        router.push('/seller/dashboard');
        break;
      case 'admin':
        router.push('/admin/dashboard');
        break;
      default:
        router.push('/(tabs)');
    }
  };
  
  return <Button title="Mở Dashboard" onPress={handlePress} />;
}
```

### 5.4 Switch Role Feature

```tsx
import { useAuth } from '@/context/AuthContext';

function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const handleSwitch = async () => {
    setLoading(true);
    try {
      await switchRole('seller'); // Switch to seller
      Alert.alert('Thành công', 'Đã chuyển sang tài khoản người bán');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chuyển vai trò');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View>
      <Text>Vai trò hiện tại: {user?.userType}</Text>
      <Button 
        title="Trở thành người bán" 
        onPress={handleSwitch}
        disabled={loading}
      />
    </View>
  );
}
```

---

## 🔐 6. SECURITY & BEST PRACTICES

### 6.1 Frontend Guards (UI Only)

⚠️ **Important**: Permission guards chỉ ẩn UI, KHÔNG phải security boundary.

```tsx
// This HIDES button, but doesn't prevent API call
<PermissionGuard permission="product.delete">
  <Button title="Xóa" onPress={deleteProduct} />
</PermissionGuard>
```

### 6.2 Backend Validation (REQUIRED)

✅ **Backend MUST validate every action:**

```typescript
// Backend API - DELETE /products/:id
app.delete('/api/products/:id', authenticate, async (req, res) => {
  const user = req.user;
  const product = await Product.findById(req.params.id);
  
  // 1. Check ownership
  if (product.sellerId !== user.sellerId && user.userType !== 'admin') {
    return res.status(403).json({ error: 'Not your product' });
  }
  
  // 2. Check permission
  if (!hasPermission(user.userType, 'product.delete_own')) {
    return res.status(403).json({ error: 'No permission' });
  }
  
  // 3. Execute action
  await product.delete();
  res.json({ success: true });
});
```

### 6.3 Permission Check Flow

```
Frontend Request
    ↓
UI Guard (optional) - Hides button if no permission
    ↓
API Call
    ↓
Backend Middleware - Verify JWT token
    ↓
Backend Permission Check - Verify user has permission
    ↓
Execute Action
    ↓
Return Response
```

---

## 📊 7. PERMISSION MATRIX

| Permission | Buyer | Seller | Company | Contractor | Architect | Designer | Supplier | Admin |
|-----------|-------|--------|---------|------------|-----------|----------|----------|-------|
| product.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| product.create | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| product.edit_own | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| order.create | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| team.manage | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| analytics.advanced | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| design.create | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| inventory.manage | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| system.full_access | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🧪 8. TESTING CHECKLIST

### Registration Tests

```
✅ Register as Buyer → No "Create Product" button visible
✅ Register as Seller → Can access Seller Dashboard
✅ Register as Company → Can manage team, see advanced analytics
✅ Admin role → Not available in registration selector
✅ Social login → Maps to correct role
```

### Permission Tests

```typescript
// Test buyer permissions
const buyer = { userType: 'buyer' };
expect(hasMarketplacePermission('product.view')).toBe(true);
expect(hasMarketplacePermission('product.create')).toBe(false);

// Test seller permissions
const seller = { userType: 'seller' };
expect(hasMarketplacePermission('product.create')).toBe(true);
expect(hasMarketplacePermission('team.manage')).toBe(false);

// Test company permissions
const company = { userType: 'company' };
expect(hasMarketplacePermission('team.manage')).toBe(true);
expect(hasMarketplacePermission('analytics.advanced')).toBe(true);

// Test admin permissions
const admin = { userType: 'admin' };
expect(hasMarketplacePermission('system.full_access')).toBe(true);
```

### Protected Screen Tests

```
✅ Buyer accesses /seller/dashboard → Blocked with message
✅ Seller accesses /seller/dashboard → Success
✅ Unverified seller accesses verified-only page → Blocked
✅ User switches role → Permissions update immediately
```

---

## 🚀 9. FILES CREATED/UPDATED

### New Files ✨

1. **components/auth/RoleSelector.tsx** - Role selection UI for registration
2. **components/auth/PermissionGuard.tsx** - Permission-based UI guard
3. **components/auth/RoleGuard.tsx** - Role-based UI guard
4. **components/auth/ProtectedScreen.tsx** - Full screen protection
5. **components/ui/role-badge.tsx** - Display user role badge
6. **components/ui/role-capabilities.tsx** - Show role capabilities
7. **constants/roles.ts** - All role configs & permissions
8. **app/seller/dashboard.tsx** - Example protected screen
9. **AUTH_REGISTRATION_LOGIN_PERMISSION.md** - This documentation

### Updated Files 🔄

1. **types/auth.ts** - Extended UserType, added MarketplaceRole
2. **context/AuthContext.tsx** - Added hasMarketplacePermission(), switchRole()
3. **app/(auth)/register.tsx** - Added RoleSelector integration
4. **app/(auth)/login.tsx** - No changes needed (works with userType)

---

## ✅ QUICK START

### 1. Register New User

```tsx
// User opens register screen
// Fills: name, email, password
// Clicks "Chọn vai trò" → Selects "Seller"
// Clicks "Tạo tài khoản"
// → Auto-login as seller with product.create permission
```

### 2. Protect a Screen

```tsx
import { ProtectedScreen } from '@/components/auth/ProtectedScreen';

export default function MyScreen() {
  return (
    <ProtectedScreen requireRoles={['seller', 'company']}>
      <YourContent />
    </ProtectedScreen>
  );
}
```

### 3. Guard UI Element

```tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard';

<PermissionGuard permission="product.create">
  <Button title="Tạo sản phẩm" />
</PermissionGuard>
```

### 4. Check Permission in Code

```tsx
import { useAuth } from '@/context/AuthContext';

const { hasMarketplacePermission } = useAuth();

if (hasMarketplacePermission('product.create')) {
  // Show create form
}
```

---

## 📞 RELATED DOCS

- **Role System Details**: [ROLE_SYSTEM_IMPLEMENTATION.md](./ROLE_SYSTEM_IMPLEMENTATION.md)
- **Marketplace Features**: [MARKETPLACE_TRANSFORMATION.md](./MARKETPLACE_TRANSFORMATION.md)
- **Hanoi Deployment**: [HANOI_DEPLOYMENT_TODOS.md](./HANOI_DEPLOYMENT_TODOS.md)

---

**Version**: 1.0  
**Updated**: December 16, 2025  
**Status**: ✅ Complete & Production Ready
