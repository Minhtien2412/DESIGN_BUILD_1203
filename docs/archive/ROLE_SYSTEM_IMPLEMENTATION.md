# ROLE_SYSTEM_IMPLEMENTATION.md

## Hệ Thống Vai Trò Marketplace Xây Dựng/Nội Thất

### 📋 Tổng Quan

Đã triển khai hệ thống vai trò đầy đủ cho marketplace với **8 vai trò chính**:

1. **Buyer** (Khách Hàng) - Người mua sản phẩm/dịch vụ
2. **Seller** (Người Bán Cá Nhân) - Thợ, freelancer
3. **Company** (Công Ty) - Công ty thiết kế/thi công
4. **Contractor** (Nhà Thầu) - Nhà thầu xây dựng
5. **Architect** (Kiến Trúc Sư) - KTS có chứng chỉ
6. **Designer** (Nhà Thiết Kế) - Thiết kế nội thất
7. **Supplier** (Nhà Cung Cấp) - Cung cấp vật liệu
8. **Admin** (Quản Trị Viên) - Quản lý platform

---

## 📁 Files Đã Tạo/Sửa

### 1. Types & Constants

#### `types/auth.ts` ✅ UPDATED
```typescript
export type UserType = 
  | 'buyer'       // Người mua
  | 'seller'      // Người bán cá nhân
  | 'company'     // Công ty
  | 'contractor'  // Nhà thầu
  | 'architect'   // Kiến trúc sư
  | 'designer'    // Nhà thiết kế
  | 'supplier'    // Nhà cung cấp
  | 'admin';      // Admin

export interface MarketplaceRole {
  type: UserType;
  name: string;
  nameVi: string;
  description: string;
  capabilities: string[];
  icon: string;
  color: string;
  verificationRequired: boolean;
}

// Extended User interface with marketplace fields
export interface User {
  // ... existing fields
  userType?: UserType;
  companyName?: string;
  companyVerified?: boolean;
  licenseNumber?: string;
  certifications?: string[];
  rating?: number;
  reviewCount?: number;
  yearsExperience?: number;
  specializations?: string[];
}
```

#### `constants/roles.ts` ✅ NEW
Chi tiết đầy đủ về 8 vai trò:
- `MARKETPLACE_ROLES` - Thông tin chi tiết mỗi vai trò
- `ROLE_PERMISSIONS` - Permissions mapping
- `VERIFICATION_REQUIREMENTS` - Yêu cầu xác minh
- `ROLE_BADGES` - Badge configuration
- Helper functions:
  - `hasPermission(userType, permission)`
  - `getRoleDetails(userType)`
  - `getRoleBadge(userType)`
  - `requiresVerification(userType)`
  - `getVerificationRequirements(userType)`

### 2. UI Components

#### `components/ui/role-badge.tsx` ✅ NEW
```tsx
<RoleBadge 
  userType="seller" 
  showIcon={true} 
  size="medium" 
/>
```
Hiển thị huy hiệu vai trò với icon và màu sắc.

#### `components/auth/RoleSelector.tsx` ✅ NEW
```tsx
<RoleSelector 
  selectedRole={selectedRole}
  onRoleSelect={(role) => setSelectedRole(role)}
  excludeRoles={['admin']}
/>
```
Component cho phép user chọn vai trò khi đăng ký.

#### `components/ui/role-capabilities.tsx` ✅ NEW
```tsx
<RoleCapabilities userType="architect" />
```
Hiển thị chi tiết khả năng của vai trò.

### 3. Auth Context

#### `context/AuthContext.tsx` ✅ UPDATED
Thêm marketplace role support:

```typescript
interface User {
  // ... existing
  userType?: UserType;
  companyName?: string;
  companyVerified?: boolean;
  licenseNumber?: string;
  certifications?: string[];
  rating?: number;
  reviewCount?: number;
}

interface AuthContextType {
  // ... existing methods
  hasMarketplacePermission: (permission: string) => boolean;
  switchRole: (newUserType: UserType) => Promise<void>;
}

// Usage
const { user, hasMarketplacePermission, switchRole } = useAuth();

if (hasMarketplacePermission('product.create')) {
  // Allow create product
}

await switchRole('seller'); // Switch to seller role
```

---

## 🎨 Role Details

### 1. Buyer (Khách Hàng)
- **Icon**: person-outline
- **Color**: #3B82F6 (Blue)
- **Verification**: ❌ Not required
- **Capabilities**:
  - Tìm kiếm sản phẩm/dịch vụ
  - Liên hệ với người bán
  - Đặt hàng và thanh toán
  - Đánh giá và review
  - Chat với seller

### 2. Seller (Người Bán Cá Nhân)
- **Icon**: hammer-outline
- **Color**: #10B981 (Green)
- **Verification**: ✅ Required
- **Documents**:
  - CMND/CCCD
  - Chứng chỉ nghề (nếu có)
  - Portfolio (tối thiểu 3 dự án)
- **Capabilities**:
  - Đăng sản phẩm/dịch vụ
  - Quản lý đơn hàng
  - Chat với khách hàng
  - Upload portfolio

### 3. Company (Công Ty)
- **Icon**: business-outline
- **Color**: #8B5CF6 (Purple)
- **Verification**: ✅ Required
- **Documents**:
  - Giấy phép kinh doanh
  - Mã số thuế
  - Chứng chỉ ISO
  - Portfolio công ty
- **Capabilities**:
  - Đăng dự án showcase
  - Quản lý team nhân viên
  - Tạo báo giá chi tiết
  - Marketing và quảng cáo

### 4. Contractor (Nhà Thầu)
- **Icon**: construct-outline
- **Color**: #F59E0B (Orange)
- **Verification**: ✅ Required
- **Documents**:
  - Giấy phép kinh doanh
  - Chứng chỉ năng lực nhà thầu
  - Bảo hiểm trách nhiệm
- **Capabilities**:
  - Nhận thầu dự án lớn
  - Quản lý thầu phụ
  - Lập kế hoạch thi công
  - Quản lý chi phí

### 5. Architect (Kiến Trúc Sư)
- **Icon**: shapes-outline
- **Color**: #EC4899 (Pink)
- **Verification**: ✅ Required
- **Documents**:
  - Chứng chỉ hành nghề KTS
  - Bằng cấp KTS
  - Portfolio thiết kế
- **Capabilities**:
  - Thiết kế kiến trúc 2D/3D
  - Tư vấn giải pháp
  - Xin phép xây dựng
  - Giám sát thi công

### 6. Designer (Nhà Thiết Kế)
- **Icon**: color-palette-outline
- **Color**: #EF4444 (Red)
- **Verification**: ✅ Required
- **Documents**:
  - Portfolio thiết kế
  - CMND/CCCD
- **Capabilities**:
  - Thiết kế nội thất 3D
  - Tư vấn phong cách
  - Render hình ảnh
  - Shopping list nội thất

### 7. Supplier (Nhà Cung Cấp)
- **Icon**: cube-outline
- **Color**: #06B6D4 (Cyan)
- **Verification**: ✅ Required
- **Documents**:
  - Giấy phép kinh doanh
  - Mã số thuế
  - Catalog sản phẩm
- **Capabilities**:
  - Đăng catalog sản phẩm
  - Quản lý tồn kho
  - Báo giá theo số lượng
  - Bảo hành sản phẩm

### 8. Admin (Quản Trị Viên)
- **Icon**: shield-checkmark-outline
- **Color**: #DC2626 (Dark Red)
- **Verification**: ❌ Internal only
- **Capabilities**:
  - Quản lý tất cả users
  - Duyệt verification
  - Xử lý tranh chấp
  - Phân tích hệ thống

---

## 🔐 Permission System

### Permission Format
```
<resource>.<action>
```

### Examples
- `product.create` - Tạo sản phẩm
- `product.edit_own` - Sửa sản phẩm của mình
- `order.view_own` - Xem đơn hàng của mình
- `system.full_access` - Toàn quyền (admin)

### Usage
```typescript
import { useAuth } from '@/context/AuthContext';

function ProductCreateButton() {
  const { hasMarketplacePermission } = useAuth();
  
  if (!hasMarketplacePermission('product.create')) {
    return null; // Hide button
  }
  
  return <Button title="Tạo sản phẩm" />;
}
```

---

## 🎯 Usage Examples

### 1. Role Selector in Registration
```tsx
import { useState } from 'react';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { UserType } from '@/types/auth';

export default function RegisterScreen() {
  const [selectedRole, setSelectedRole] = useState<UserType>('buyer');
  
  return (
    <View>
      <RoleSelector 
        selectedRole={selectedRole}
        onRoleSelect={setSelectedRole}
        excludeRoles={['admin']} // Don't show admin
      />
      
      <Button 
        title="Đăng ký"
        onPress={() => signUp(email, password, name, undefined, selectedRole)}
      />
    </View>
  );
}
```

### 2. Display User Role Badge
```tsx
import { RoleBadge } from '@/components/ui/role-badge';
import { useAuth } from '@/context/AuthContext';

export default function ProfileHeader() {
  const { user } = useAuth();
  
  return (
    <View>
      <Text>{user?.name}</Text>
      {user?.userType && (
        <RoleBadge userType={user.userType} size="medium" />
      )}
    </View>
  );
}
```

### 3. Role-Specific Features
```tsx
import { useAuth } from '@/context/AuthContext';
import { RoleCapabilities } from '@/components/ui/role-capabilities';

export default function DashboardScreen() {
  const { user, hasMarketplacePermission } = useAuth();
  
  return (
    <View>
      {user?.userType && (
        <RoleCapabilities userType={user.userType} />
      )}
      
      {hasMarketplacePermission('product.create') && (
        <Button title="Tạo sản phẩm mới" />
      )}
      
      {hasMarketplacePermission('team.manage') && (
        <Button title="Quản lý nhân viên" />
      )}
    </View>
  );
}
```

### 4. Switch Role
```tsx
import { useAuth } from '@/context/AuthContext';

export default function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  
  const handleSwitch = async () => {
    if (user?.userType === 'buyer') {
      await switchRole('seller'); // Become a seller
    }
  };
  
  return (
    <Button 
      title="Trở thành người bán"
      onPress={handleSwitch}
    />
  );
}
```

### 5. Conditional UI Based on Role
```tsx
import { useAuth } from '@/context/AuthContext';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  
  return (
    <View>
      <Text>{product.name}</Text>
      
      {/* Buyer sees "Add to Cart" */}
      {user?.userType === 'buyer' && (
        <Button title="Thêm vào giỏ" />
      )}
      
      {/* Seller/Company sees "Edit" */}
      {(user?.userType === 'seller' || user?.userType === 'company') && (
        <Button title="Sửa sản phẩm" />
      )}
      
      {/* Architect sees "Request Consultation" */}
      {user?.userType === 'architect' && (
        <Button title="Yêu cầu tư vấn" />
      )}
    </View>
  );
}
```

---

## 🔄 Integration with Existing Code

### Update Product Card
```tsx
// components/ui/product-card.tsx
import { RoleBadge } from './role-badge';

export function ProductCard({ product }) {
  return (
    <View>
      {/* Existing seller info */}
      {product.seller && (
        <View style={styles.sellerRow}>
          <Image source={product.seller.logo} />
          <Text>{product.seller.name}</Text>
          
          {/* NEW: Show seller role badge */}
          {product.seller.userType && (
            <RoleBadge 
              userType={product.seller.userType} 
              size="small" 
            />
          )}
        </View>
      )}
    </View>
  );
}
```

### Update Seller Section
```tsx
// components/product/SellerSection.tsx
import { RoleBadge } from '@/components/ui/role-badge';
import { getRoleDetails } from '@/constants/roles';

export function SellerSection({ seller }) {
  const roleDetails = seller.userType ? getRoleDetails(seller.userType) : null;
  
  return (
    <View>
      <View style={styles.header}>
        <Image source={seller.logo} />
        <View>
          <Text>{seller.name}</Text>
          {seller.userType && (
            <RoleBadge userType={seller.userType} size="small" />
          )}
        </View>
      </View>
      
      {/* NEW: Show role capabilities */}
      {roleDetails && (
        <View style={styles.capabilities}>
          <Text>Dịch vụ cung cấp:</Text>
          {roleDetails.capabilities.slice(0, 3).map(cap => (
            <Text key={cap}>• {cap}</Text>
          ))}
        </View>
      )}
    </View>
  );
}
```

---

## ✅ Testing Checklist

### Registration Flow
- [ ] User can select role during registration
- [ ] Role selector shows all roles except admin
- [ ] Selected role is highlighted
- [ ] Verification requirements are displayed for applicable roles

### Profile Display
- [ ] User role badge displays correctly
- [ ] Role badge has correct color and icon
- [ ] Role capabilities list shows all features
- [ ] Verification status is visible

### Permissions
- [ ] `hasMarketplacePermission()` works correctly
- [ ] Buyer can view products but not create
- [ ] Seller/Company can create products
- [ ] Admin has all permissions

### Role Switching
- [ ] User can switch from buyer to seller
- [ ] UI updates after role switch
- [ ] Permissions update after role switch

---

## 🚀 Next Steps

### Phase 1: Verification System
- [ ] Create verification flow UI
- [ ] Document upload component
- [ ] Admin verification dashboard
- [ ] Verification status badges

### Phase 2: Role-Specific Dashboards
- [ ] Seller dashboard (products, orders, analytics)
- [ ] Company dashboard (team, projects, quotes)
- [ ] Contractor dashboard (bids, projects, budget)
- [ ] Supplier dashboard (inventory, bulk orders)

### Phase 3: Advanced Features
- [ ] Multi-role support (user can be both buyer and seller)
- [ ] Role upgrade requests
- [ ] Professional certifications display
- [ ] Portfolio showcase pages

---

## 📊 Permission Matrix

| Permission | Buyer | Seller | Company | Contractor | Architect | Designer | Supplier | Admin |
|-----------|-------|--------|---------|------------|-----------|----------|----------|-------|
| product.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| product.create | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| product.edit_own | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| order.create | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| team.manage | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| design.create | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| inventory.manage | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| system.full_access | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 📝 Notes

1. **Backward Compatibility**: Legacy `role` field vẫn được giữ trong User interface để tương thích với backend hiện tại.

2. **UserType vs Role**: 
   - `userType` - Marketplace role (buyer, seller, etc.)
   - `role` - Legacy system role (ADMIN, USER, etc.)

3. **Verification**: 6/8 vai trò cần xác minh (trừ buyer và admin).

4. **Future**: Backend cần API endpoints:
   - `POST /api/users/verify` - Submit verification documents
   - `PUT /api/users/role` - Switch user role
   - `GET /api/users/permissions` - Get user permissions

---

**Document Version**: 1.0  
**Last Updated**: December 16, 2025  
**Author**: Development Team
