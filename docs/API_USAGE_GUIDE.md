# 🚀 Quick Start Guide - Sử Dụng Perfex CRM API

**Date:** January 7, 2026  
**Status:** ✅ Ready to Use

---

## 📦 Đã Tạo Xong

### 1. ✅ Service Layer
**File:** `services/perfexAPI.ts`
- 17 modules API
- 90+ endpoints
- Type-safe với TypeScript
- Error handling

### 2. ✅ Hooks Layer
**File:** `hooks/usePerfexAPI.ts`
- Base hook `useAPI`
- 10 specialized hooks
- Loading & error states
- CRUD operations

### 3. ✅ Type Definitions
**File:** `types/perfex.ts` (đã có sẵn)
- 17 entity interfaces
- Complete type coverage

---

## 🎯 Cách Sử Dụng

### Option 1: Sử Dụng Hooks (Recommended)

#### Example 1: Customers List Screen

```typescript
import { useCustomers } from '@/hooks/usePerfexAPI';

function CustomersScreen() {
  const {
    customers,
    stats,
    loading,
    error,
    refresh,
    search,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers();

  // Display loading
  if (loading) {
    return <ActivityIndicator />;
  }

  // Display error
  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View>
      {/* Stats */}
      <StatsBar>
        <Stat label="Total" value={stats.total} />
        <Stat label="Active" value={stats.active} />
      </StatsBar>

      {/* Search */}
      <SearchInput onSearch={search} />

      {/* List */}
      <FlatList
        data={customers}
        renderItem={({ item }) => <CustomerCard customer={item} />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      />
    </View>
  );
}
```

#### Example 2: Create New Customer

```typescript
import { useCustomers } from '@/hooks/usePerfexAPI';
import { Alert } from 'react-native';

function CustomerForm() {
  const { createCustomer } = useCustomers();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      
      const newCustomer = await createCustomer({
        company: formData.company,
        phonenumber: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        active: '1',
      });

      Alert.alert('Thành công', 'Đã tạo khách hàng mới');
      router.push(`/crm/customer/${newCustomer.userid}`);
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} submitting={submitting} />
  );
}
```

#### Example 3: Update Customer

```typescript
import { useCustomer } from '@/hooks/usePerfexAPI';

function CustomerDetailScreen({ customerId }) {
  const { customer, loading, error, refresh } = useCustomer(customerId);
  const { updateCustomer } = useCustomers({ autoFetch: false });

  const handleUpdate = async (data) => {
    try {
      await updateCustomer(customerId, data);
      Alert.alert('Thành công', 'Đã cập nhật khách hàng');
      refresh();
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    }
  };

  if (loading) return <Loader />;
  if (!customer) return <NotFound />;

  return (
    <ScrollView>
      <CustomerInfo customer={customer} />
      <Button onPress={() => setShowEditModal(true)}>
        Edit Customer
      </Button>
    </ScrollView>
  );
}
```

#### Example 4: Delete Customer

```typescript
const handleDelete = async (customerId: string) => {
  Alert.alert(
    'Xác nhận xóa',
    'Bạn có chắc muốn xóa khách hàng này?',
    [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCustomer(customerId);
            Alert.alert('Thành công', 'Đã xóa khách hàng');
            router.back();
          } catch (err) {
            Alert.alert('Lỗi', err.message);
          }
        },
      },
    ]
  );
};
```

---

### Option 2: Direct API Calls (Advanced)

#### Example: Direct Service Usage

```typescript
import { perfexAPI } from '@/services/perfexAPI';

async function fetchCustomers() {
  try {
    const customers = await perfexAPI.customers.list();
    console.log('Customers:', customers);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function searchCustomers(query: string) {
  try {
    const results = await perfexAPI.customers.search(query);
    console.log('Search results:', results);
  } catch (error) {
    console.error('Search error:', error);
  }
}

async function createCustomer() {
  try {
    const customer = await perfexAPI.customers.create({
      company: 'New Company Ltd.',
      phonenumber: '0123456789',
      email: 'contact@newcompany.com',
      active: '1',
    });
    console.log('Created:', customer);
  } catch (error) {
    console.error('Create error:', error);
  }
}
```

---

## 📊 All Available Hooks

### 1. **useCustomers**
```typescript
const {
  customers,           // Customer[]
  stats,              // { total, active, inactive }
  loading,            // boolean
  error,              // string | null
  refresh,            // () => Promise<void>
  search,             // (query: string) => Promise<void>
  createCustomer,     // (data: Partial<Customer>) => Promise<Customer>
  updateCustomer,     // (id: string, data: Partial<Customer>) => Promise<Customer>
  deleteCustomer,     // (id: string) => Promise<void>
} = useCustomers();
```

### 2. **useInvoices**
```typescript
const {
  invoices,           // Invoice[]
  stats,              // { total, unpaid, paid, overdue, totalAmount, totalPaid, totalDue }
  loading,
  error,
  refresh,
  search,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = useInvoices();
```

### 3. **useProjects**
```typescript
const {
  projects,           // Project[]
  stats,              // { total, notStarted, inProgress, onHold, cancelled, finished, totalValue }
  loading,
  error,
  refresh,
  search,
  createProject,
  updateProject,
  deleteProject,
} = useProjects();
```

### 4. **useTasks**
```typescript
const {
  tasks,              // Task[]
  stats,              // { total, notStarted, inProgress, testing, awaitingFeedback, completed }
  loading,
  error,
  refresh,
  search,
  createTask,
  updateTask,
  deleteTask,
} = useTasks();
```

### 5. **useLeads**
```typescript
const {
  leads,              // Lead[]
  stats,              // { total, converted, notConverted }
  loading,
  error,
  refresh,
  search,
  createLead,
  updateLead,
  deleteLead,
} = useLeads();
```

### 6. **useTickets**
```typescript
const {
  tickets,            // Ticket[]
  stats,              // { total, open, inProgress, answered, onHold, closed }
  loading,
  error,
  refresh,
  search,
  createTicket,
  updateTicket,
  deleteTicket,
} = useTickets();
```

### 7. **useEstimates**
```typescript
const {
  estimates,          // Estimate[]
  stats,              // { total, draft, sent, declined, accepted, expired }
  loading,
  error,
  refresh,
  search,
  createEstimate,
  updateEstimate,
  deleteEstimate,
} = useEstimates();
```

### 8. **useExpenses**
```typescript
const {
  expenses,           // Expense[]
  stats,              // { total, billable, nonBillable, totalAmount }
  loading,
  error,
  refresh,
  search,
  createExpense,
  updateExpense,
  deleteExpense,
} = useExpenses();
```

### 9. **useContacts**
```typescript
const {
  contacts,           // Contact[]
  loading,
  error,
  refresh,
  search,
  createContact,
  updateContact,
  deleteContact,
} = useContacts();
```

### 10. **useProducts** (Read-only)
```typescript
const {
  products,           // Product[]
  loading,
  error,
  refresh,
  search,
} = useProducts();
```

---

## 🎨 Hook Options

All hooks accept optional configuration:

```typescript
// Don't auto-fetch on mount
const { customers } = useCustomers({ autoFetch: false });

// Provide initial data
const { invoices } = useInvoices({ initialData: cachedInvoices });
```

---

## 🔍 Single Item Hooks

For detail screens, use single-item hooks:

### **useCustomer(id)**
```typescript
const { customer, loading, error, refresh } = useCustomer('123');
```

### **useInvoice(id)**
```typescript
const { invoice, loading, error, refresh } = useInvoice('456');
```

### **useProject(id)**
```typescript
const { project, loading, error, refresh } = useProject('789');
```

### **useTask(id)**
```typescript
const { task, loading, error, refresh } = useTask('101');
```

---

## 🧪 Testing API

### Test với PowerShell:

```powershell
# Test customers API
node -e "
const { perfexAPI } = require('./services/perfexAPI');
perfexAPI.customers.list().then(console.log).catch(console.error);
"
```

### Test với React Native Debugger:

```typescript
// In your screen component
useEffect(() => {
  (async () => {
    try {
      const customers = await perfexAPI.customers.list();
      console.log('✅ API Test Success:', customers.length, 'customers');
    } catch (error) {
      console.error('❌ API Test Failed:', error);
    }
  })();
}, []);
```

---

## ⚠️ Error Handling

All hooks provide error states:

```typescript
const { customers, loading, error } = useCustomers();

if (error) {
  return (
    <View>
      <Text>Error: {error}</Text>
      <Button onPress={refresh}>Retry</Button>
    </View>
  );
}
```

For CRUD operations, wrap in try-catch:

```typescript
try {
  await createCustomer(data);
  Alert.alert('Success');
} catch (err) {
  Alert.alert('Error', err.message);
}
```

---

## 🔄 Migration Plan

### Phase 1: Replace Existing Hooks

#### Before:
```typescript
// Old: useCRMInvoices.ts
import { useCRMInvoices } from '@/hooks/useCRMInvoices';

const { invoices, stats } = useCRMInvoices();
```

#### After:
```typescript
// New: usePerfexAPI.ts
import { useInvoices } from '@/hooks/usePerfexAPI';

const { invoices, stats } = useInvoices();
```

### Phase 2: Update Screens

Update these screens to use new hooks:

1. ✅ **app/crm/customers.tsx**
   - Replace `usePerfexCustomers` → `useCustomers`

2. ✅ **app/crm/invoices.tsx**
   - Replace `useCRMInvoices` → `useInvoices`

3. ✅ **app/crm/projects.tsx**
   - Use `useProjects` hook

4. ✅ **app/crm/tasks.tsx**
   - Use `useTasks` hook

5. ⏳ All other CRM screens...

---

## 📂 File Structure

```
services/
├── perfexAPI.ts          ← NEW: Main API service (17 modules)
├── perfexService.ts      ← OLD: Keep for backward compatibility
└── dataSyncService.ts    ← OLD: Keep for offline sync

hooks/
├── usePerfexAPI.ts       ← NEW: Main hooks (10 hooks)
├── useCRMInvoices.ts     ← OLD: Can be deprecated
└── usePerfex.ts          ← OLD: Can be deprecated

types/
└── perfex.ts             ← NEW: Complete types (700+ lines)

app/crm/
├── customers.tsx         ← Update to use useCustomers
├── invoices.tsx          ← Update to use useInvoices
├── projects.tsx          ← Update to use useProjects
├── tasks.tsx             ← Update to use useTasks
└── ... (more screens)
```

---

## ✅ Next Steps

1. **Test API connection:**
   ```bash
   # Verify API credentials
   cat config/env.ts
   ```

2. **Update first screen:**
   - Start with `app/crm/customers.tsx`
   - Replace context with `useCustomers` hook

3. **Test & iterate:**
   - Test list, create, update, delete
   - Check error handling
   - Verify loading states

4. **Migrate remaining screens:**
   - Invoices → Projects → Tasks
   - Then extended modules

5. **Clean up old code:**
   - Remove old hooks once migration complete
   - Update imports across codebase

---

## 🎉 Summary

✅ **Service Layer:** `services/perfexAPI.ts` - 17 modules, 90+ endpoints  
✅ **Hooks Layer:** `hooks/usePerfexAPI.ts` - 10 specialized hooks  
✅ **Type Definitions:** `types/perfex.ts` - Complete type coverage  
✅ **Documentation:** This guide + FEATURE_DESIGN_COMPLETE.md  

**Ready to implement!** 🚀

---

**Questions?** Check [FEATURE_DESIGN_COMPLETE.md](./FEATURE_DESIGN_COMPLETE.md) for detailed design.

**Last Updated:** January 7, 2026
