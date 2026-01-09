# 🚀 CRM Module - Quick Start Guide

## ✅ Tình Trạng Hiện Tại

Dự án đã có **SẴN** cấu trúc CRM hoàn chỉnh! Tất cả màn hình đã được tạo trong thư mục `app/crm/`.

---

## 📂 Cấu Trúc Đã Có

```
app/crm/
├── _layout.tsx              # Stack layout
├── index.tsx                # CRM Dashboard (Main hub)
│
├── customers.tsx            # ✅ Khách hàng
├── leads.tsx                # ✅ Khách tiềm năng
├── contacts.tsx             # (Cần tạo nếu chưa có)
│
├── invoices.tsx             # ✅ Hóa đơn
├── sales.tsx                # ✅ Bán hàng
├── contracts.tsx            # ✅ Hợp đồng
├── expenses.tsx             # ✅ Chi phí
│
├── projects.tsx             # ✅ Dự án
├── project-detail.tsx       # ✅ Chi tiết dự án
├── project-management.tsx   # ✅ Quản lý dự án
├── tasks.tsx                # ✅ Nhiệm vụ
├── milestones.tsx           # ✅ Milestones
│
├── tickets.tsx              # ✅ Yêu cầu hỗ trợ
├── staff.tsx                # ✅ Nhân viên
├── discussions.tsx          # ✅ Thảo luận
├── notes.tsx                # ✅ Ghi chú
├── files.tsx                # ✅ Files
│
├── activity.tsx             # ✅ Hoạt động
├── time-tracking.tsx        # ✅ Theo dõi thời gian
├── reports.tsx              # ✅ Báo cáo
├── gantt-chart.tsx          # ✅ Gantt chart
├── mind-map.tsx             # ✅ Mind map
├── admin.tsx                # ✅ Admin
└── settings.tsx             # ✅ Cài đặt
```

---

## 🎯 Cách Tích Hợp API

### Bước 1: Kiểm Tra Files Quan Trọng

Đã tạo sẵn:
- ✅ `types/perfex.ts` - TypeScript interfaces đầy đủ
- ✅ `services/perfexService.ts` - Service layer có sẵn (cần update)
- ✅ `hooks/usePerfex.ts` - Custom hooks (cần tạo hoặc update)
- ✅ `docs/CRM_API_PERMISSIONS_GUIDE.md` - Tài liệu hướng dẫn đầy đủ

### Bước 2: Update Service Layer

File `services/perfexService.ts` đã tồn tại nhưng cần bổ sung các API methods theo document mới:

```typescript
// services/perfexService.ts - Cần update

// Thêm các API methods:
export const perfexService = {
  customers: customersApi,      // Get, Search, Create, Update, Delete
  contacts: contactsApi,         // Get, Search, Create, Update, Delete
  invoices: invoicesApi,         // Get, Search, Create, Update, Delete
  products: productsApi,         // Get List, Search
  leads: leadsApi,               // Get, Search, Create, Update, Delete
  projects: projectsApi,         // Get, Search, Create, Update, Delete
  milestones: milestonesApi,     // Get, Search, Create, Update, Delete
  staffs: staffsApi,             // Get, Search, Create, Update, Delete
  tasks: tasksApi,               // Get, Search, Create, Update, Delete
  tickets: ticketsApi,           // Get, Search, Create, Update, Delete
  contracts: contractsApi,       // Get List, Create, Delete
  creditNotes: creditNotesApi,   // Get, Search, Create, Update, Delete
  estimates: estimatesApi,       // Get, Search, Create, Update, Delete
  expenses: expensesApi,         // Get, Search, Create, Update, Delete
  payments: paymentsApi,         // Get List, Search, Create, Update, Delete
};
```

### Bước 3: Tạo/Update Custom Hooks

Tạo file `hooks/usePerfexCRM.ts` với các hooks:

```typescript
// hooks/usePerfexCRM.ts

export function useCustomers() {
  // Sử dụng perfexService.customers
}

export function useInvoices() {
  // Sử dụng perfexService.invoices
}

export function useProjects() {
  // Sử dụng perfexService.projects
}

// ... các hooks khác
```

### Bước 4: Update Các Màn Hình

#### Ví dụ: `app/crm/customers.tsx`

**Trước (giả lập data):**
```typescript
const [customers, setCustomers] = useState([/* mock data */]);
```

**Sau (sử dụng API thật):**
```typescript
import { useCustomers } from '@/hooks/usePerfexCRM';

export default function CustomersScreen() {
  const { data: customers, loading, error, search, create, update, remove } = useCustomers();

  if (loading) return <Loader />;
  if (error) return <ErrorView message={error} />;

  return (
    <Container>
      <SearchBar onSearch={search} />
      
      <FlatList
        data={customers}
        renderItem={({ item }) => (
          <CustomerCard 
            customer={item}
            onPress={() => router.push(`/crm/customers/${item.id}`)}
          />
        )}
      />
      
      <FAB onPress={() => router.push('/crm/customers/form')} />
    </Container>
  );
}
```

---

## 📋 Checklist Tích Hợp

### Phase 1: Foundation ✅
- [x] Tạo types (`types/perfex.ts`) ✅
- [x] Document API permissions (`docs/CRM_API_PERMISSIONS_GUIDE.md`) ✅
- [ ] Update `services/perfexService.ts` với đầy đủ API methods
- [ ] Tạo/Update `hooks/usePerfexCRM.ts`
- [ ] Test API connection với Perfex CRM

### Phase 2: Core Screens (Priority 1)
- [ ] **Customers** (`app/crm/customers.tsx`)
  - [ ] List view với search
  - [ ] Detail view (cần tạo `customers/[id].tsx`)
  - [ ] Create/Edit form (cần tạo `customers/form.tsx`)
  - [ ] Integrate API: Get, Search, Create, Update, Delete

- [ ] **Invoices** (`app/crm/invoices.tsx`)
  - [ ] List với filter (status, year)
  - [ ] Detail view (cần tạo)
  - [ ] Create invoice (cần tạo)
  - [ ] Integrate API: Get, Search, Create, Update, Delete

- [ ] **Projects** (`app/crm/projects.tsx` + `app/crm/project-detail.tsx`)
  - [ ] List view
  - [ ] Detail đã có sẵn
  - [ ] Integrate API: Get, Search, Create, Update, Delete
  - [ ] Link với Tasks, Milestones

- [ ] **Tasks** (`app/crm/tasks.tsx`)
  - [ ] List/Kanban view
  - [ ] Detail view
  - [ ] Create/Edit form
  - [ ] Integrate API: Get, Search, Create, Update, Delete

### Phase 3: Financial Screens (Priority 2)
- [ ] **Expenses** (`app/crm/expenses.tsx`)
- [ ] **Payments** (cần tạo `app/crm/payments.tsx`)
- [ ] **Estimates** (cần tạo `app/crm/estimates.tsx`)
- [ ] **Credit Notes** (cần tạo `app/crm/credit-notes.tsx`)

### Phase 4: Support & Others (Priority 3)
- [ ] **Tickets** (`app/crm/tickets.tsx`)
- [ ] **Leads** (`app/crm/leads.tsx`)
- [ ] **Contracts** (`app/crm/contracts.tsx`)
- [ ] **Staff** (`app/crm/staff.tsx`)
- [ ] **Contacts** (cần tạo `app/crm/contacts.tsx`)
- [ ] **Products** (cần tạo `app/crm/products.tsx`)

### Phase 5: Dashboard & Navigation
- [ ] Update `app/crm/index.tsx` - CRM Dashboard
- [ ] Add CRM to bottom tabs hoặc drawer
- [ ] Implement search functionality across modules
- [ ] Add quick actions (FAB buttons)

---

## 🔧 Code Templates

### Template 1: List Screen với API

```typescript
// app/crm/[entity]/index.tsx
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Loader } from '@/components/ui/loader';
import { SearchBar } from '@/components/crm/SearchBar';
import { EntityCard } from '@/components/crm/EntityCard';
import { FAB } from '@/components/ui/fab';
import { useEntity } from '@/hooks/usePerfexCRM';

export default function EntityListScreen() {
  const { data: entities, loading, error, search, refresh } = useEntity();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    search(query);
  };

  if (loading) return <Loader />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  return (
    <Container>
      <Section>
        <SearchBar
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </Section>

      <FlatList
        data={entities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EntityCard
            entity={item}
            onPress={() => router.push(`/crm/entity/${item.id}`)}
          />
        )}
        refreshing={loading}
        onRefresh={refresh}
      />

      <FAB
        icon="add"
        onPress={() => router.push('/crm/entity/form')}
      />
    </Container>
  );
}
```

### Template 2: Detail Screen với API

```typescript
// app/crm/[entity]/[id].tsx
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Loader } from '@/components/ui/loader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/button';
import { useEntity } from '@/hooks/usePerfexCRM';

export default function EntityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: entity, loading, error, refresh } = useEntity(id);

  if (loading) return <Loader />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;
  if (!entity) return <NotFoundView />;

  return (
    <Container>
      <ScrollView>
        <Section>
          <ThemedText type="title">{entity.name}</ThemedText>
          <ThemedText type="default">{entity.description}</ThemedText>
        </Section>

        {/* Entity-specific details */}
        <Section>
          {/* ... */}
        </Section>

        <Section>
          <Button
            title="Chỉnh sửa"
            onPress={() => router.push(`/crm/entity/form?id=${id}`)}
          />
        </Section>
      </ScrollView>
    </Container>
  );
}
```

### Template 3: Form Screen với API

```typescript
// app/crm/[entity]/form.tsx
import { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEntity } from '@/hooks/usePerfexCRM';

export default function EntityFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  
  const { data: entity, create, update } = useEntity(id);
  
  const [form, setForm] = useState({
    name: entity?.name || '',
    description: entity?.description || '',
    // ... other fields
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (isEdit) {
        await update(id!, form);
        Alert.alert('Success', 'Updated successfully');
      } else {
        await create(form);
        Alert.alert('Success', 'Created successfully');
      }
      
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <ScrollView>
        <Section>
          <Input
            label="Name"
            value={form.name}
            onChangeText={(name) => setForm({ ...form, name })}
          />
          
          <Input
            label="Description"
            value={form.description}
            onChangeText={(description) => setForm({ ...form, description })}
            multiline
          />
          
          {/* ... other fields */}
        </Section>

        <Section>
          <Button
            title={isEdit ? 'Cập nhật' : 'Tạo mới'}
            onPress={handleSubmit}
            loading={loading}
          />
        </Section>
      </ScrollView>
    </Container>
  );
}
```

---

## 🎨 UI Components Cần Tạo

### 1. Entity Cards
```
components/crm/
├── CustomerCard.tsx
├── InvoiceCard.tsx
├── ProjectCard.tsx
├── TaskCard.tsx
├── TicketCard.tsx
├── LeadCard.tsx
└── ExpenseCard.tsx
```

### 2. Utility Components
```
components/crm/
├── StatusBadge.tsx       # For status indicators
├── PriorityBadge.tsx     # For priority levels
├── SearchBar.tsx         # Search with filter
├── FilterPanel.tsx       # Advanced filters
├── EmptyState.tsx        # No data view
└── ErrorView.tsx         # Error handling view
```

---

## 📱 Navigation Integration

### Option 1: Add to Bottom Tabs

Update `app/(tabs)/_layout.tsx`:

```typescript
<Tabs.Screen
  name="crm"
  options={{
    title: 'CRM',
    tabBarIcon: ({ color }) => (
      <Ionicons name="briefcase" size={28} color={color} />
    ),
  }}
/>
```

Tạo `app/(tabs)/crm.tsx`:
```typescript
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';

export default function CRMTabScreen() {
  return (
    <Container>
      <Button
        title="Open CRM Dashboard"
        onPress={() => router.push('/crm')}
      />
    </Container>
  );
}
```

### Option 2: Quick Access Button

Add button trong Profile hoặc Home screen:

```typescript
<Button
  title="CRM Management"
  icon="briefcase"
  onPress={() => router.push('/crm')}
/>
```

---

## 🧪 Testing Workflow

### 1. Test API Connection
```bash
# Run test script
npm run test:perfex-api
```

### 2. Test Individual Module
1. Navigate to module: `router.push('/crm/customers')`
2. Check data loading
3. Test search functionality
4. Test create/update/delete operations

### 3. Test Error Handling
- Disconnect internet → Check error states
- Invalid data → Check validation
- API errors → Check error messages

---

## 🚀 Next Steps

### Immediate (Today):
1. ✅ Read `docs/CRM_API_PERMISSIONS_GUIDE.md` - DONE
2. Update `services/perfexService.ts` với full API methods
3. Tạo `hooks/usePerfexCRM.ts` với các custom hooks
4. Test API connection: `npm run test:perfex-api`

### Short Term (This Week):
5. Update `app/crm/customers.tsx` - integrate API
6. Create detail views: `app/crm/customers/[id].tsx`
7. Create forms: `app/crm/customers/form.tsx`
8. Test full CRUD flow

### Medium Term (Next Week):
9. Complete other priority modules (Invoices, Projects, Tasks)
10. Build UI components (Cards, Badges, etc)
11. Implement search & filter
12. Add navigation integration

---

## 📚 Resources

- **API Documentation:** `docs/CRM_API_PERMISSIONS_GUIDE.md`
- **Type Definitions:** `types/perfex.ts`
- **Service Layer:** `services/perfexService.ts`
- **Existing Screens:** `app/crm/`
- **Perfex CRM API:** `https://thietkeresort.com.vn/perfex_crm/api/`

---

## ❓ FAQs

**Q: Tại sao đã có màn hình nhưng không có data?**  
A: Màn hình hiện tại dùng mock data. Cần tích hợp API thật theo hướng dẫn trên.

**Q: Làm sao test API?**  
A: Chạy script test: `npm run test:perfex-api` hoặc dùng Postman với token từ `config/env.ts`.

**Q: Có cần tạo lại màn hình không?**  
A: KHÔNG! Chỉ cần update logic để gọi API thay vì dùng mock data.

**Q: Hook nào dùng để fetch data?**  
A: Dùng các hooks trong `hooks/usePerfexCRM.ts` như `useCustomers()`, `useInvoices()`, etc.

---

**Tác giả:** ThietKeResort Team  
**Cập nhật:** January 7, 2026  
**Version:** 1.0
