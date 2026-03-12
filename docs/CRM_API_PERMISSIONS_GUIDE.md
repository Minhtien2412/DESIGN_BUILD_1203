# 📋 Hướng Dẫn Tận Dụng API Permissions trong App

## 🎯 Tổng Quan

Tài liệu này hướng dẫn cách tận dụng toàn bộ quyền hạn API hiện tại của Perfex CRM để xây dựng các tính năng trong mobile app.

---

## 📊 Ma Trận Quyền Hạn & Màn Hình Tương Ứng

### 1. **KHÁCH HÀNG (Customers)**
**Quyền:** Get, Search, Create, Update, Delete

#### Màn hình đề xuất:
- **Danh sách khách hàng** (`app/crm/customers/index.tsx`)
  - Hiển thị danh sách với search bar
  - Filter theo trạng thái (Active/Inactive)
  - Card view với: Company name, Contact, Phone
  
- **Chi tiết khách hàng** (`app/crm/customers/[id].tsx`)
  - Thông tin đầy đủ: Company, Address, VAT, Phone
  - Danh sách liên hệ (Contacts)
  - Lịch sử hóa đơn
  - Dự án liên quan
  
- **Tạo/Sửa khách hàng** (`app/crm/customers/form.tsx`)
  - Form đầy đủ các fields: Company, VAT, Address, Phone
  - Validation theo yêu cầu API

#### Hook sử dụng:
```typescript
import { useCustomers, useCustomer } from '@/hooks/usePerfex';

// Danh sách
const { data, loading, search, create, update, remove } = useCustomers();

// Chi tiết
const { data: customer } = useCustomer(customerId);
```

---

### 2. **LIÊN HỆ (Contacts)**
**Quyền:** Get, Search, Create, Update, Delete

#### Màn hình đề xuất:
- **Danh sách contacts** (`app/crm/contacts/index.tsx`)
  - List view với avatar, name, email, phone
  - Search by name/email
  - Filter by customer
  
- **Chi tiết contact** (`app/crm/contacts/[id].tsx`)
  - Profile card: Avatar, Name, Title, Email, Phone
  - Customer liên quan
  - Lịch sử tương tác
  
- **Tạo/Sửa contact** (`app/crm/contacts/form.tsx`)
  - Firstname, Lastname, Email, Phone, Title
  - Chọn customer (dropdown từ API)

#### Hook sử dụng:
```typescript
import { useContacts } from '@/hooks/usePerfex';

const { data: contacts, search, create, update } = useContacts();
```

---

### 3. **HÓA ĐƠN (Invoices)**
**Quyền:** Get, Search, Create, Update, Delete

#### Màn hình đề xuất:
- **Danh sách hóa đơn** (`app/crm/invoices/index.tsx`)
  - Card view: Invoice number, Customer, Amount, Status
  - Status badges: Unpaid (red), Paid (green), Overdue (orange)
  - Filter: Status, Year, Customer
  - Sort by: Date, Amount
  
- **Chi tiết hóa đơn** (`app/crm/invoices/[id].tsx`)
  - Header: Invoice #, Date, Due date
  - Customer info
  - Items list (products/services)
  - Payment history
  - Action buttons: Send, Mark as Paid, Download PDF
  
- **Tạo hóa đơn** (`app/crm/invoices/create.tsx`)
  - Select customer
  - Add line items (from Products API)
  - Set dates, terms, notes
  - Calculate totals with tax

#### Hook sử dụng:
```typescript
import { useInvoices, useInvoice } from '@/hooks/usePerfex';

const { data: invoices, search } = useInvoices({ status: '1' }); // Unpaid
const { data: invoice } = useInvoice(invoiceId);
```

#### Component UI:
```typescript
// components/crm/InvoiceCard.tsx
<InvoiceCard 
  invoice={invoice}
  onPress={() => router.push(`/crm/invoices/${invoice.id}`)}
/>
```

---

### 4. **SẢN PHẨM (Products)**
**Quyền:** Get List, Search (Read-only)

#### Màn hình đề xuất:
- **Catalog sản phẩm** (`app/crm/products/index.tsx`)
  - Grid/List view
  - Search by name/description
  - Display: Name, Price, Unit
  - Use case: Chọn sản phẩm khi tạo invoice/estimate
  
- **Chi tiết sản phẩm** (`app/crm/products/[id].tsx`)
  - Full description
  - Pricing info
  - Tax rates
  - Related invoices/estimates

#### Hook sử dụng:
```typescript
import { useProducts } from '@/hooks/usePerfex';

const { data: products, search } = useProducts();
```

---

### 5. **KHÁCH TIỀM NĂNG (Leads)**
**Quyền:** Get, Search, Create, Update, Delete

#### Màn hình đề xuất:
- **Danh sách leads** (`app/crm/leads/index.tsx`)
  - Kanban board view (by status)
  - Card: Name, Company, Email, Phone
  - Status pipeline: New → Contacted → Qualified → Lost/Won
  - Filter: Status, Source, Assigned to
  
- **Chi tiết lead** (`app/crm/leads/[id].tsx`)
  - Contact info
  - Lead value
  - Status history
  - Notes timeline
  - Convert to Customer button
  
- **Tạo/Sửa lead** (`app/crm/leads/form.tsx`)
  - Name, Company, Email, Phone
  - Lead source, Status
  - Assign to staff member
  - Lead value

#### Hook sử dụng:
```typescript
import { useLeads } from '@/hooks/usePerfex';

const { data: leads, create, update } = useLeads();
```

---

### 6. **DỰ ÁN (Projects)**
**Quyền:** Get, Search, Create, Update, Delete

#### Màn hình đề xuất:
- **Dashboard dự án** (`app/crm/projects/index.tsx`)
  - Grid view: Project cards
  - Status badges: Not Started, In Progress, On Hold, Completed
  - Filter: Status, Customer
  - Sort: Deadline, Created date
  
- **Chi tiết dự án** (`app/crm/projects/[id].tsx`)
  - Header: Name, Customer, Status, Progress bar
  - Tabs:
    - **Overview:** Description, Dates, Billing info
    - **Tasks:** Task list (from Tasks API)
    - **Milestones:** Timeline view
    - **Invoices:** Project invoices
    - **Files:** Document list
  - Action buttons: Add Task, Add Milestone
  
- **Tạo/Sửa dự án** (`app/crm/projects/form.tsx`)
  - Name, Description
  - Select customer
  - Billing type: Fixed rate / Project hours / Task hours
  - Start date, Deadline
  - Project cost

#### Hook sử dụng:
```typescript
import { useProjects, useProject } from '@/hooks/usePerfex';

const { data: projects } = useProjects({ status: '2' }); // In Progress
const { data: project } = useProject(projectId);
```

---

### 7. **NHIỆM VỤ (Tasks) / PHÂN CÔNG**
**Quyền:** Get, Search, Create, Update, Delete

#### Màn hình đề xuất:
- **Danh sách task** (`app/crm/tasks/index.tsx`)
  - List/Kanban view
  - Group by: Status, Priority, Project
  - Card: Task name, Due date, Priority badge, Assigned to
  - Filter: Status, Priority, Related to (Project/Invoice/etc)
  
- **Chi tiết task** (`app/crm/tasks/[id].tsx`)
  - Task info: Name, Description, Priority
  - Dates: Start, Due, Finished
  - Assignment: Assigned to, Added by
  - Related entity (Project, Invoice, etc)
  - Time tracking: Logged hours
  - Comments/Activity feed
  
- **Tạo/Sửa task** (`app/crm/tasks/form.tsx`)
  - Name, Description
  - Priority: Low, Medium, High, Urgent
  - Dates: Start, Due
  - Relate to: Project, Invoice, Customer, etc
  - Assign to staff
  - Billable checkbox
  - Hourly rate

#### Hook sử dụng:
```typescript
import { useTasks } from '@/hooks/usePerfex';

// Tasks của một project
const { data: tasks } = useTasks({ 
  rel_type: 'project', 
  rel_id: projectId 
});
```

---

### 8. **YÊU CẦU (Tickets)**
**Quyền:** Get, Search, Create, Update, Delete

#### Màn hình đề xuất:
- **Danh sách tickets** (`app/crm/tickets/index.tsx`)
  - List view with filters
  - Card: Subject, Status, Priority, Customer
  - Status badges: Open, In Progress, Answered, Closed
  - Priority badges: Low, Medium, High, Urgent
  - Filter: Status, Priority, Department, Assigned to
  
- **Chi tiết ticket** (`app/crm/tickets/[id].tsx`)
  - Header: Subject, Ticket #, Status, Priority
  - Customer info
  - Message thread (initial + replies)
  - Reply editor
  - Attachments
  - Assign/Transfer buttons
  - Close ticket button
  
- **Tạo ticket** (`app/crm/tickets/create.tsx`)
  - Select customer
  - Subject, Message
  - Priority, Department
  - Attachments (optional)

#### Hook sử dụng:
```typescript
import { useTickets, useTicket } from '@/hooks/usePerfex';

const { data: tickets } = useTickets({ 
  status: '1', // Open tickets
  priority: '4' // Urgent
});
const { data: ticket } = useTicket(ticketId);
```

---

### 9. **HỢP ĐỒNG (Contracts)**
**Quyền:** Get List, Create, Delete

#### Màn hình đề xuất:
- **Danh sách hợp đồng** (`app/crm/contracts/index.tsx`)
  - List view: Subject, Customer, Start date, End date
  - Status: Active, Expired
  - Action: Delete
  
- **Chi tiết hợp đồng** (`app/crm/contracts/[id].tsx`)
  - Subject, Description
  - Customer
  - Contract type
  - Dates: Start, End
  - Contract value
  - Signed status
  - View PDF
  
- **Tạo hợp đồng** (`app/crm/contracts/create.tsx`)
  - Subject, Description, Content
  - Select customer
  - Contract type
  - Dates, Value

#### Hook sử dụng:
```typescript
import { useContracts } from '@/hooks/usePerfex';

const { data: contracts, create, remove } = useContracts();
```

---

### 10. **GHI CHÚ TÍN DỤNG (Credit Notes)**
**Quyền:** Get, Search, Create, Update, Delete

#### Màn hình đề xuất:
- **Danh sách credit notes** (`app/crm/credit-notes/index.tsx`)
  - List view: Number, Customer, Amount, Status
  - Status: Open, Closed, Void
  
- **Chi tiết credit note** (`app/crm/credit-notes/[id].tsx`)
  - Number, Date
  - Customer info
  - Items list
  - Total amount
  - Applied to invoices
  
- **Tạo credit note** (`app/crm/credit-notes/create.tsx`)
  - Select customer
  - Add line items
  - Reference invoice (optional)

#### Hook sử dụng:
```typescript
import { useCreditNotes } from '@/hooks/usePerfex';

const { data: creditNotes } = useCreditNotes();
```

---

### 11. **BÁO GIÁ (Estimates/Quotes)**
**Quyền:** Get, Search, Create, Update, Delete

#### Màn hình đề xuất:
- **Danh sách báo giá** (`app/crm/estimates/index.tsx`)
  - Card view: Number, Customer, Amount, Status
  - Status: Draft, Sent, Declined, Accepted, Expired
  - Action: Convert to Invoice
  
- **Chi tiết báo giá** (`app/crm/estimates/[id].tsx`)
  - Number, Date, Expiry date
  - Customer info
  - Items list with prices
  - Total amount
  - Action buttons: Send, Convert to Invoice, Mark as Accepted
  
- **Tạo báo giá** (`app/crm/estimates/create.tsx`)
  - Select customer
  - Add line items (from Products)
  - Set expiry date
  - Terms, Notes

#### Hook sử dụng:
```typescript
import { useEstimates } from '@/hooks/usePerfex';

const { data: estimates, create, update } = useEstimates();
```

---

### 12. **CHI PHÍ (Expenses)**
**Quyền:** Get, Search, Create, Update, Delete

#### Màn hình đề xuất:
- **Danh sách chi phí** (`app/crm/expenses/index.tsx`)
  - List view: Name, Amount, Date, Category
  - Filter: Category, Billable, Project, Customer
  - Total expenses summary
  
- **Chi tiết chi phí** (`app/crm/expenses/[id].tsx`)
  - Expense name, Amount
  - Category, Date
  - Related: Customer, Project
  - Billable flag
  - Receipt image/file
  - Invoice reference (if billed)
  
- **Tạo/Sửa chi phí** (`app/crm/expenses/form.tsx`)
  - Expense name, Amount
  - Category (from Expense Categories API)
  - Date
  - Select customer/project
  - Billable checkbox
  - Payment mode
  - Note
  - Receipt upload

#### Hook sử dụng:
```typescript
import { useExpenses, useExpenseCategories } from '@/hooks/usePerfex';

const { data: expenses } = useExpenses();
const { data: categories } = useExpenseCategories();
```

---

### 13. **THANH TOÁN (Payments)**
**Quyền:** Get List, Search, Create, Update, Delete

#### Màn hình đề xuất:
- **Danh sách thanh toán** (`app/crm/payments/index.tsx`)
  - List view: Invoice #, Amount, Date, Payment mode
  - Filter: Payment mode, Date range
  - Total received summary
  
- **Chi tiết thanh toán** (`app/crm/payments/[id].tsx`)
  - Invoice reference
  - Amount, Date
  - Payment mode/method
  - Transaction ID
  - Note
  
- **Record payment** (`app/crm/payments/create.tsx`)
  - Select invoice
  - Amount
  - Payment mode (from Payment Modes API)
  - Date, Transaction ID
  - Note

#### Hook sử dụng:
```typescript
import { usePayments, usePaymentModes } from '@/hooks/usePerfex';

const { data: payments, create } = usePayments();
const { data: paymentModes } = usePaymentModes();
```

---

## 🗂️ Cấu Trúc Thư Mục Đề Xuất

```
app/
├── (tabs)/
│   ├── index.tsx          # Home (Dashboard tổng quan)
│   ├── projects.tsx       # Projects tab (giữ nguyên)
│   └── crm.tsx           # CRM Hub (NEW - Main entry)
│
├── crm/                  # CRM Module (NEW)
│   ├── _layout.tsx       # Stack layout
│   ├── index.tsx         # CRM Dashboard với tất cả modules
│   │
│   ├── customers/
│   │   ├── index.tsx     # Danh sách
│   │   ├── [id].tsx      # Chi tiết
│   │   └── form.tsx      # Tạo/Sửa
│   │
│   ├── contacts/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── form.tsx
│   │
│   ├── invoices/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── create.tsx
│   │
│   ├── products/
│   │   ├── index.tsx
│   │   └── [id].tsx
│   │
│   ├── leads/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── form.tsx
│   │
│   ├── projects/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── form.tsx
│   │
│   ├── tasks/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── form.tsx
│   │
│   ├── tickets/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── create.tsx
│   │
│   ├── contracts/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── create.tsx
│   │
│   ├── credit-notes/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── create.tsx
│   │
│   ├── estimates/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── create.tsx
│   │
│   ├── expenses/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── form.tsx
│   │
│   └── payments/
│       ├── index.tsx
│       ├── [id].tsx
│       └── create.tsx
│
components/
└── crm/                  # CRM UI Components (NEW)
    ├── CustomerCard.tsx
    ├── InvoiceCard.tsx
    ├── ProjectCard.tsx
    ├── TaskCard.tsx
    ├── TicketCard.tsx
    ├── LeadCard.tsx
    ├── ExpenseCard.tsx
    ├── StatusBadge.tsx
    ├── PriorityBadge.tsx
    ├── SearchBar.tsx
    └── FilterPanel.tsx
```

---

## 🎨 UI Components Cần Tạo

### 1. **Status Badge**
```typescript
// components/crm/StatusBadge.tsx
type StatusType = 'invoice' | 'project' | 'task' | 'ticket' | 'lead';

<StatusBadge 
  type="invoice" 
  status="paid" 
  // Auto color: paid=green, unpaid=red, etc
/>
```

### 2. **Priority Badge**
```typescript
// components/crm/PriorityBadge.tsx
<PriorityBadge 
  priority="urgent" 
  // Auto color: urgent=red, high=orange, medium=yellow, low=gray
/>
```

### 3. **Entity Cards**
```typescript
// components/crm/InvoiceCard.tsx
<InvoiceCard 
  invoice={invoice}
  onPress={() => router.push(`/crm/invoices/${invoice.id}`)}
/>

// components/crm/ProjectCard.tsx
<ProjectCard 
  project={project}
  showProgress={true}
/>

// components/crm/TaskCard.tsx
<TaskCard 
  task={task}
  showAssignee={true}
/>
```

### 4. **CRM Dashboard Widget**
```typescript
// components/crm/DashboardWidget.tsx
<DashboardWidget
  title="Open Tickets"
  count={12}
  icon="ticket"
  color="blue"
  onPress={() => router.push('/crm/tickets')}
/>
```

---

## 📱 CRM Main Screen (Entry Point)

### `app/(tabs)/crm.tsx` hoặc `app/crm/index.tsx`

```typescript
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { DashboardWidget } from '@/components/crm/DashboardWidget';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { ThemedText } from '@/components/ThemedText';

export default function CRMDashboard() {
  return (
    <Container>
      <Section>
        <ThemedText type="title">CRM Dashboard</ThemedText>
      </Section>

      <ScrollView>
        {/* Sales & Revenue */}
        <Section>
          <ThemedText type="subtitle">Bán hàng</ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <DashboardWidget
              title="Khách hàng"
              icon="users"
              onPress={() => router.push('/crm/customers')}
            />
            <DashboardWidget
              title="Khách tiềm năng"
              icon="user-plus"
              onPress={() => router.push('/crm/leads')}
            />
            <DashboardWidget
              title="Hóa đơn"
              icon="file-text"
              onPress={() => router.push('/crm/invoices')}
            />
            <DashboardWidget
              title="Báo giá"
              icon="clipboard"
              onPress={() => router.push('/crm/estimates')}
            />
          </View>
        </Section>

        {/* Project Management */}
        <Section>
          <ThemedText type="subtitle">Dự án</ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <DashboardWidget
              title="Dự án"
              icon="briefcase"
              onPress={() => router.push('/crm/projects')}
            />
            <DashboardWidget
              title="Nhiệm vụ"
              icon="check-square"
              onPress={() => router.push('/crm/tasks')}
            />
          </View>
        </Section>

        {/* Support */}
        <Section>
          <ThemedText type="subtitle">Hỗ trợ</ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <DashboardWidget
              title="Yêu cầu"
              icon="message-circle"
              onPress={() => router.push('/crm/tickets')}
            />
          </View>
        </Section>

        {/* Finance */}
        <Section>
          <ThemedText type="subtitle">Tài chính</ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <DashboardWidget
              title="Chi phí"
              icon="dollar-sign"
              onPress={() => router.push('/crm/expenses')}
            />
            <DashboardWidget
              title="Thanh toán"
              icon="credit-card"
              onPress={() => router.push('/crm/payments')}
            />
          </View>
        </Section>
      </ScrollView>
    </Container>
  );
}
```

---

## 🔄 Quy Trình Triển Khai

### Phase 1: Foundation (Week 1)
1. ✅ Tạo types (`types/perfex.ts`)
2. ✅ Tạo service layer (`services/perfexService.ts`)
3. ✅ Tạo hooks (`hooks/usePerfex.ts`)
4. ✅ Tạo UI components cơ bản (`components/crm/`)

### Phase 2: Core Modules (Week 2-3)
5. Customers module (List, Detail, Form)
6. Invoices module (List, Detail, Create)
7. Projects module (List, Detail, Form)
8. Tasks module (List, Detail, Form)

### Phase 3: Extended Modules (Week 4)
9. Tickets module
10. Leads module
11. Expenses module
12. Payments module

### Phase 4: Additional Modules (Week 5)
13. Estimates module
14. Contacts module
15. Contracts module
16. Credit Notes module

### Phase 5: Integration & Testing (Week 6)
17. CRM Dashboard
18. Navigation integration
19. Search & Filter
20. Testing & bug fixes

---

## 📝 Example: Customers Screen

### `app/crm/customers/index.tsx`
```typescript
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { useCustomers } from '@/hooks/usePerfex';
import { CustomerCard } from '@/components/crm/CustomerCard';
import { SearchBar } from '@/components/crm/SearchBar';
import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';

export default function CustomersScreen() {
  const { data: customers, loading, search } = useCustomers();

  if (loading) return <Loader />;

  return (
    <Container>
      <SearchBar 
        placeholder="Tìm khách hàng..."
        onSearch={search}
      />

      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={() => router.push(`/crm/customers/${item.id}`)}
          />
        )}
      />
    </Container>
  );
}
```

### `components/crm/CustomerCard.tsx`
```typescript
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import type { Customer } from '@/types/perfex';

interface Props {
  customer: Customer;
  onPress: () => void;
}

export function CustomerCard({ customer, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold">{customer.company}</ThemedText>
        <StatusBadge active={customer.active === '1'} />
      </View>
      
      <View style={styles.row}>
        <Ionicons name="location" size={16} />
        <ThemedText style={styles.detail}>
          {customer.city}, {customer.country}
        </ThemedText>
      </View>
      
      <View style={styles.row}>
        <Ionicons name="call" size={16} />
        <ThemedText style={styles.detail}>
          {customer.phonenumber}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  detail: {
    fontSize: 14,
    color: '#666',
  },
});
```

---

## 🎯 Kết Luận

Với tài liệu này, bạn có thể:

1. **Hiểu rõ quyền hạn** của từng API endpoint
2. **Thiết kế màn hình** phù hợp cho từng module
3. **Sử dụng hooks** đã được xây dựng sẵn
4. **Tạo UI components** nhất quán
5. **Triển khai từng bước** theo lộ trình rõ ràng

### Bước tiếp theo:
1. Xem lại file `types/perfex.ts` và `services/perfexService.ts`
2. Tạo module đầu tiên (Customers)
3. Test với API thật
4. Mở rộng các module khác

---

**Tác giả:** ThietKeResort Team  
**Ngày tạo:** January 7, 2026  
**Phiên bản:** 1.0
