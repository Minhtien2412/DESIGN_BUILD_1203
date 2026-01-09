# 🎯 Thiết Kế Chức Năng Chi Tiết - Perfex CRM API Integration

**Ngày tạo:** January 7, 2026  
**Dựa trên:** 17 modules API với 90+ endpoints  
**Trạng thái:** ✅ Complete Feature Design

---

## 📋 Mục Lục

1. [Overview Architecture](#overview-architecture)
2. [Module 1: Customers Management](#module-1-customers-management)
3. [Module 2: Invoices Management](#module-2-invoices-management)
4. [Module 3: Projects Management](#module-3-projects-management)
5. [Module 4: Tasks Management](#module-4-tasks-management)
6. [Module 5-17: Extended Modules](#extended-modules)
7. [Technical Specifications](#technical-specifications)
8. [Implementation Code](#implementation-code)

---

## 🏗️ Overview Architecture

### Current State Analysis

**✅ Đã có sẵn:**
- 20+ UI screens trong `app/crm/`
- Context: `PerfexFullSyncContext.tsx` (550 lines)
- Hooks: `useCRMInvoices.ts` (275 lines)
- Service: `perfexService.ts` (905 lines)
- Types: `types/perfex.ts` (700 lines)

**⚠️ Vấn đề hiện tại:**
- Screens sử dụng **mock data** hoặc **context riêng lẻ**
- Thiếu unified API architecture
- Chưa có CRUD operations đầy đủ
- Error handling chưa đồng nhất

**🎯 Giải pháp:**
Thiết kế **3-layer architecture** thống nhất:

```
┌─────────────────────────────────────────────────┐
│           UI Layer (Screens)                     │
│  app/crm/customers.tsx, invoices.tsx, etc.      │
└────────────────┬────────────────────────────────┘
                 │ uses
┌────────────────▼────────────────────────────────┐
│         Hooks Layer (State Management)           │
│  useCustomers, useInvoices, useProjects, etc.   │
│  - Loading states                                │
│  - Error handling                                │
│  - Cache management                              │
│  - Optimistic updates                            │
└────────────────┬────────────────────────────────┘
                 │ calls
┌────────────────▼────────────────────────────────┐
│         Service Layer (API Calls)                │
│  perfexService.customers.*, invoices.*, etc.    │
│  - HTTP requests                                 │
│  - Data transformation                           │
│  - Error mapping                                 │
│  - Type safety                                   │
└────────────────┬────────────────────────────────┘
                 │ requests
┌────────────────▼────────────────────────────────┐
│            Perfex CRM API                        │
│  https://thietkeresort.com.vn/perfex_crm/api    │
└──────────────────────────────────────────────────┘
```

---

## 🏢 Module 1: Customers Management

### API Permissions (6 endpoints)

```typescript
✅ GET     /customers/{id}           - Lấy chi tiết khách hàng
✅ GET     /customers/search/{query} - Tìm kiếm khách hàng
✅ POST    /customers                - Tạo khách hàng mới
✅ POST    /customers/{id}           - Cập nhật khách hàng
✅ DELETE  /customers/{id}           - Xóa khách hàng
✅ GET     /customers                - Lấy danh sách (implied)
```

### Feature Design

#### 1.1 List Screen - Danh Sách Khách Hàng

**File:** `app/crm/customers.tsx`

**Chức năng:**
- ✅ Hiển thị danh sách khách hàng với avatar, tên, địa chỉ
- ✅ Search real-time (gọi API `/customers/search/{query}`)
- ✅ Filter theo trạng thái: Active / Inactive / All
- ✅ Sort theo: Name, Date Created, Projects Count
- ✅ Pull-to-refresh
- ✅ Infinite scroll pagination
- ✅ Stats summary: Total customers, Active customers
- ✅ Quick actions: Call, Email, View Details

**UI Components:**
```typescript
// Stats Bar
<StatsBar>
  - Total: {customers.length}
  - Active: {activeCount}
  - Inactive: {inactiveCount}
</StatsBar>

// Search Bar
<SearchInput 
  placeholder="Tìm tên, SĐT, địa chỉ..."
  onSearch={(q) => handleSearch(q)} // Debounced API call
/>

// Filter Chips
<FilterChips>
  - All
  - Active
  - Inactive
</FilterChips>

// Customer Card
<CustomerCard>
  - Avatar (first letter + active indicator)
  - Company Name
  - City / Address
  - Phone Number (với quick call button)
  - Projects Count badge
  - Contact options: Call, Email
</CustomerCard>
```

**State Management:**
```typescript
const {
  customers,        // Customer[]
  loading,          // boolean
  error,            // string | null
  stats,            // { total, active, inactive }
  refresh,          // () => Promise<void>
  search,           // (query: string) => Promise<void>
  filterByStatus,   // (status: 'active' | 'inactive' | 'all') => void
  sortBy,           // (field: string, order: 'asc' | 'desc') => void
} = useCustomers();
```

#### 1.2 Detail Screen - Chi Tiết Khách Hàng

**File:** `app/crm/customer-detail.tsx` (NEW)

**Chức năng:**
- ✅ Hiển thị thông tin đầy đủ
- ✅ Tabs: Overview / Projects / Invoices / Contacts / Files
- ✅ Quick actions: Edit, Delete, Call, Email
- ✅ Activity timeline

**UI Layout:**
```typescript
<ScrollView>
  {/* Header */}
  <CustomerHeader>
    - Large Avatar
    - Company Name
    - Status Badge (Active/Inactive)
    - Action Buttons: Edit, Delete
  </CustomerHeader>

  {/* Contact Info */}
  <Section title="Thông tin liên hệ">
    - Phone: {customer.phonenumber} (clickable)
    - Email: {customer.email} (clickable)
    - Website: {customer.website}
    - Address: {customer.address}, {customer.city}
    - Country: {customer.country}
  </Section>

  {/* Tabs */}
  <Tabs>
    <Tab name="Overview">
      - Company info
      - VAT Number
      - Registration Date
      - Custom Fields
    </Tab>

    <Tab name="Projects">
      - List projects của customer này
      - Gọi getProjectsByCustomer(customerId)
    </Tab>

    <Tab name="Invoices">
      - List invoices của customer
      - Total amount, Paid, Outstanding
    </Tab>

    <Tab name="Contacts">
      - List contacts (contacts API)
    </Tab>
  </Tabs>
</ScrollView>
```

**State Management:**
```typescript
const { customer, loading, error, refresh } = useCustomer(customerId);
const { projects } = useProjectsByCustomer(customerId);
const { invoices } = useInvoicesByCustomer(customerId);
```

#### 1.3 Form Screen - Tạo/Sửa Khách Hàng

**File:** `app/crm/customer-form.tsx` (NEW)

**Chức năng:**
- ✅ Form tạo mới customer
- ✅ Form edit customer
- ✅ Validation: Company name required, email format, phone format
- ✅ Auto-save draft (AsyncStorage)

**Form Fields:**
```typescript
<Form>
  {/* Required */}
  <Input label="Tên công ty *" field="company" required />
  
  {/* Contact */}
  <Input label="Số điện thoại" field="phonenumber" type="phone" />
  <Input label="Email" field="email" type="email" />
  <Input label="Website" field="website" type="url" />
  
  {/* Address */}
  <Input label="Địa chỉ" field="address" multiline />
  <Input label="Thành phố" field="city" />
  <Picker label="Quốc gia" field="country" options={countries} />
  <Input label="Zip Code" field="zip" />
  
  {/* Business */}
  <Input label="VAT Number" field="vat" />
  <Picker label="Groups" field="groups_in" multiple />
  
  {/* Status */}
  <Switch label="Active" field="active" />
  
  {/* Actions */}
  <ButtonRow>
    <Button type="cancel" onPress={goBack} />
    <Button type="submit" onPress={handleSubmit} loading={submitting} />
  </ButtonRow>
</Form>
```

**API Integration:**
```typescript
// Create
const handleCreate = async (data: CustomerCreateInput) => {
  try {
    setSubmitting(true);
    const customer = await perfexService.customers.create(data);
    Alert.alert('Thành công', 'Đã tạo khách hàng mới');
    router.replace(`/crm/customer/${customer.id}`);
  } catch (err) {
    Alert.alert('Lỗi', err.message);
  } finally {
    setSubmitting(false);
  }
};

// Update
const handleUpdate = async (id: string, data: CustomerUpdateInput) => {
  try {
    setSubmitting(true);
    await perfexService.customers.update(id, data);
    Alert.alert('Thành công', 'Đã cập nhật khách hàng');
    refresh();
  } catch (err) {
    Alert.alert('Lỗi', err.message);
  } finally {
    setSubmitting(false);
  }
};

// Delete
const handleDelete = async (id: string) => {
  Alert.alert(
    'Xác nhận xóa',
    'Bạn có chắc muốn xóa khách hàng này?',
    [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await perfexService.customers.delete(id);
          router.back();
        },
      },
    ]
  );
};
```

---

## 💰 Module 2: Invoices Management

### API Permissions (6 endpoints)

```typescript
✅ GET     /invoices/{id}           - Lấy chi tiết hóa đơn
✅ GET     /invoices/search/{query} - Tìm kiếm hóa đơn
✅ POST    /invoices                - Tạo hóa đơn mới
✅ POST    /invoices/{id}           - Cập nhật hóa đơn
✅ DELETE  /invoices/{id}           - Xóa hóa đơn
✅ GET     /invoices                - Lấy danh sách
```

### Feature Design

#### 2.1 List Screen - Danh Sách Hóa Đơn

**File:** `app/crm/invoices.tsx` (UPDATE existing)

**Chức năng hiện tại:**
- ✅ Display invoices with status badges
- ✅ Filter by status: All, Unpaid, Paid, Overdue
- ✅ Stats summary
- ⚠️ Đang dùng mock data

**Cần update:**
```typescript
// BEFORE (mock data)
const MOCK_INVOICES = [...];

// AFTER (real API)
const {
  invoices,
  stats,
  loading,
  error,
  refresh,
  search,
  filterByStatus,
  markAsPaid,
  sendInvoice,
} = useInvoices();
```

**Enhanced Features:**
- ✅ Search invoices by number, customer name
- ✅ Filter: Draft / Sent / Unpaid / Paid / Partial / Overdue / Cancelled
- ✅ Sort: Date, Due Date, Amount, Status
- ✅ Bulk actions: Send, Mark as Paid, Delete
- ✅ Export PDF

**UI Components:**
```typescript
// Enhanced Stats Bar
<StatsBar>
  - Total Invoices: {stats.total}
  - Total Amount: {formatCurrency(stats.totalAmount)}
  - Paid: {formatCurrency(stats.totalPaid)} ({stats.paid} invoices)
  - Due: {formatCurrency(stats.totalDue)} ({stats.unpaid} invoices)
  - Overdue: {stats.overdue} invoices ⚠️
</StatsBar>

// Filter Pills
<FilterPills>
  - All ({invoices.length})
  - Unpaid ({unpaidCount}) 🔴
  - Paid ({paidCount}) ✅
  - Overdue ({overdueCount}) ⚠️
  - Draft ({draftCount}) 📝
</FilterPills>

// Invoice Card
<InvoiceCard>
  - Invoice Number (INV-000001)
  - Customer Name
  - Date & Due Date
  - Amount (large, bold)
  - Status Badge (với màu tương ứng)
  - Quick Actions: View, Send, Mark as Paid, Download PDF
</InvoiceCard>
```

#### 2.2 Detail Screen - Chi Tiết Hóa Đơn

**File:** `app/crm/invoice-detail.tsx` (NEW)

**Chức năng:**
- ✅ Hiển thị full invoice với items
- ✅ Payment history
- ✅ Actions: Send Email, Record Payment, Download PDF, Edit, Delete
- ✅ Status timeline

**UI Layout:**
```typescript
<ScrollView>
  {/* Header */}
  <InvoiceHeader>
    - Invoice Number
    - Status Badge (dynamic color)
    - Date & Due Date
    - Total Amount (highlighted)
  </InvoiceHeader>

  {/* Customer Info */}
  <Section title="Khách hàng">
    - Customer Name (link to customer detail)
    - Address
    - Phone & Email
  </Section>

  {/* Invoice Items */}
  <Section title="Chi tiết hóa đơn">
    <FlatList data={invoice.items}>
      <ItemRow>
        - Description
        - Quantity x Rate
        - Amount
      </ItemRow>
    </FlatList>
    
    <Totals>
      - Subtotal: {invoice.subtotal}
      - Tax: {invoice.tax}
      - Total: {invoice.total} (bold, large)
      - Paid: {invoice.paidAmount}
      - Due: {invoice.total - invoice.paidAmount}
    </Totals>
  </Section>

  {/* Payment History */}
  <Section title="Lịch sử thanh toán">
    <FlatList data={invoice.payments}>
      <PaymentRow>
        - Date
        - Amount
        - Payment Method
        - Note
      </PaymentRow>
    </FlatList>
  </Section>

  {/* Actions */}
  <ActionButtons>
    - Send Email (if status = draft/sent)
    - Record Payment (if status != paid)
    - Download PDF
    - Edit
    - Delete
  </ActionButtons>
</ScrollView>
```

**State Management:**
```typescript
const {
  invoice,
  payments,
  loading,
  error,
  refresh,
  recordPayment,
  sendEmail,
  downloadPDF,
  updateStatus,
} = useInvoice(invoiceId);
```

#### 2.3 Form Screen - Tạo/Sửa Hóa Đơn

**File:** `app/crm/invoice-form.tsx` (NEW)

**Chức năng:**
- ✅ Multi-step form: Customer → Items → Review
- ✅ Dynamic item rows (add/remove)
- ✅ Auto-calculate totals
- ✅ Tax calculation
- ✅ Due date calculator

**Form Steps:**

**Step 1: Customer & Dates**
```typescript
<Step1>
  <CustomerPicker 
    label="Chọn khách hàng *"
    onSelect={(customer) => setFieldValue('clientId', customer.id)}
  />
  <DatePicker label="Ngày hóa đơn" field="date" />
  <DatePicker label="Ngày đến hạn" field="dueDate" />
  <Picker label="Project (optional)" field="projectId" />
</Step1>
```

**Step 2: Invoice Items**
```typescript
<Step2>
  <ItemsList>
    {items.map((item, index) => (
      <ItemRow key={index}>
        <Input label="Mô tả" field={`items[${index}].description`} />
        <Input label="Số lượng" field={`items[${index}].quantity`} type="number" />
        <Input label="Đơn giá" field={`items[${index}].rate`} type="currency" />
        <Text>Thành tiền: {item.quantity * item.rate}</Text>
        <Button type="remove" onPress={() => removeItem(index)} />
      </ItemRow>
    ))}
  </ItemsList>
  
  <Button type="add" onPress={addNewItem}>+ Thêm dòng</Button>
  
  <TotalsPreview>
    - Subtotal: {calculateSubtotal()}
    - Tax ({taxRate}%): {calculateTax()}
    - Total: {calculateTotal()}
  </TotalsPreview>
</Step2>
```

**Step 3: Review & Submit**
```typescript
<Step3>
  <ReviewSummary>
    - Customer: {selectedCustomer.company}
    - Date: {formatDate(data.date)}
    - Due Date: {formatDate(data.dueDate)}
    - Items Count: {items.length}
    - Total: {formatCurrency(total)}
  </ReviewSummary>
  
  <Actions>
    <Checkbox label="Save as draft" field="saveAsDraft" />
    <Checkbox label="Send email to customer" field="sendEmail" />
    <Button onPress={handleSubmit} loading={submitting}>
      {isEditing ? 'Cập nhật' : 'Tạo hóa đơn'}
    </Button>
  </Actions>
</Step3>
```

**API Integration:**
```typescript
const handleSubmit = async (data: InvoiceFormData) => {
  try {
    setSubmitting(true);
    
    const payload = {
      clientid: data.clientId,
      project_id: data.projectId,
      date: data.date,
      duedate: data.dueDate,
      items: data.items.map(item => ({
        description: item.description,
        qty: item.quantity,
        rate: item.rate,
      })),
      status: data.saveAsDraft ? 6 : 1, // 6=Draft, 1=Unpaid
    };
    
    const invoice = await perfexService.invoices.create(payload);
    
    if (data.sendEmail) {
      await perfexService.invoices.sendEmail(invoice.id);
    }
    
    Alert.alert('Thành công', 'Đã tạo hóa đơn mới');
    router.replace(`/crm/invoice/${invoice.id}`);
  } catch (err) {
    Alert.alert('Lỗi', err.message);
  } finally {
    setSubmitting(false);
  }
};
```

---

## 🗂️ Module 3: Projects Management

### API Permissions (6 endpoints)

```typescript
✅ GET     /projects/{id}           - Lấy chi tiết dự án
✅ GET     /projects/search/{query} - Tìm kiếm dự án
✅ POST    /projects                - Tạo dự án mới
✅ POST    /projects/{id}           - Cập nhật dự án
✅ DELETE  /projects/{id}           - Xóa dự án
✅ GET     /projects                - Lấy danh sách
```

### Feature Design

#### 3.1 List Screen - Danh Sách Dự Án

**File:** `app/crm/projects.tsx` (UPDATE existing)

**Chức năng:**
- ✅ Display projects with progress bars
- ✅ Filter by status: Not Started / In Progress / On Hold / Cancelled / Finished
- ✅ Filter by customer
- ✅ Sort by: Name, Start Date, Deadline, Progress
- ✅ Stats: Total, Active, Completed, Total Value

**UI Components:**
```typescript
// Stats Grid
<StatsGrid>
  <Stat label="Total Projects" value={stats.total} />
  <Stat label="Active" value={stats.active} color="blue" />
  <Stat label="Completed" value={stats.completed} color="green" />
  <Stat label="Total Value" value={formatCurrency(stats.totalValue)} />
</StatsGrid>

// Filter Bar
<FilterBar>
  <StatusFilter 
    options={['all', 'not_started', 'in_progress', 'on_hold', 'finished']}
    onChange={filterByStatus}
  />
  <CustomerFilter 
    customers={customers}
    onChange={filterByCustomer}
  />
</FilterBar>

// Project Card
<ProjectCard>
  - Project Name
  - Customer Name (link)
  - Status Badge
  - Progress Bar ({project.progress}%)
  - Start Date → Deadline
  - Team Members (avatars)
  - Tasks Count: {completed}/{total}
  - Quick Actions: View, Tasks, Files
</ProjectCard>
```

**State Management:**
```typescript
const {
  projects,
  stats,
  loading,
  error,
  refresh,
  search,
  filterByStatus,
  filterByCustomer,
  sortBy,
} = useProjects();
```

#### 3.2 Detail Screen - Chi Tiết Dự Án

**File:** `app/crm/project-detail.tsx` (NEW)

**Chức năng:**
- ✅ Full project overview
- ✅ Tabs: Overview / Tasks / Milestones / Files / Team / Activity
- ✅ Progress tracking
- ✅ Time tracking summary

**UI Layout:**
```typescript
<ScrollView>
  {/* Header */}
  <ProjectHeader>
    - Project Name (editable inline)
    - Status Selector
    - Progress: {project.progress}% 
    - Progress Bar (visual)
  </ProjectHeader>

  {/* Info Cards */}
  <InfoCards>
    <Card title="Customer">
      - {customer.company} (link)
    </Card>
    <Card title="Duration">
      - Start: {formatDate(project.start_date)}
      - Deadline: {formatDate(project.deadline)}
      - Days remaining: {daysRemaining}
    </Card>
    <Card title="Team">
      - {project.members.length} members
      - Avatars
    </Card>
    <Card title="Budget">
      - Type: {project.billing_type}
      - Total Rate: {project.total_rate}
      - Hours Logged: {project.total_logged_time}
    </Card>
  </InfoCards>

  {/* Tabs */}
  <Tabs>
    <Tab name="Overview">
      - Description
      - Custom Fields
      - Recent Activity
    </Tab>

    <Tab name="Tasks">
      - Task list (gọi getTasksByProject)
      - Add new task button
      - Task stats: {completed}/{total}
    </Tab>

    <Tab name="Milestones">
      - Milestone timeline
      - Add milestone button
    </Tab>

    <Tab name="Files">
      - File list
      - Upload button
      - Download/Preview
    </Tab>

    <Tab name="Team">
      - Team member list
      - Roles
      - Add/Remove members
    </Tab>

    <Tab name="Activity">
      - Activity log
      - Filter by type
    </Tab>
  </Tabs>

  {/* Quick Actions */}
  <FAB>
    - Add Task
    - Add Milestone
    - Upload File
    - Log Time
  </FAB>
</ScrollView>
```

#### 3.3 Form Screen - Tạo/Sửa Dự Án

**File:** `app/crm/project-form.tsx` (NEW)

**Form Fields:**
```typescript
<Form>
  {/* Basic Info */}
  <Input label="Tên dự án *" field="name" required />
  <CustomerPicker label="Khách hàng *" field="clientid" required />
  <TextArea label="Mô tả" field="description" rows={5} />
  
  {/* Dates */}
  <DatePicker label="Ngày bắt đầu *" field="start_date" required />
  <DatePicker label="Deadline" field="deadline" />
  
  {/* Settings */}
  <Picker label="Billing Type" field="billing_type">
    - Fixed Rate
    - Project Hours
    - Task Hours
  </Picker>
  
  <Input label="Total Rate" field="total_rate" type="currency" />
  <Input label="Estimated Hours" field="estimated_hours" type="number" />
  
  {/* Status */}
  <Picker label="Status" field="status">
    - Not Started
    - In Progress
    - On Hold
    - Cancelled
    - Finished
  </Picker>
  
  {/* Team */}
  <StaffPicker label="Team Members" field="members" multiple />
  
  {/* Permissions */}
  <Section title="Client Permissions">
    <Switch label="View Tasks" field="settings.view_tasks" />
    <Switch label="Create Tasks" field="settings.create_tasks" />
    <Switch label="Edit Tasks" field="settings.edit_tasks" />
    <Switch label="View Files" field="settings.view_files" />
    <Switch label="View Milestones" field="settings.view_milestones" />
  </Section>
  
  <ButtonRow>
    <Button type="cancel" />
    <Button type="submit" loading={submitting} />
  </ButtonRow>
</Form>
```

---

## ✅ Module 4: Tasks Management

### API Permissions (6 endpoints)

```typescript
✅ GET     /tasks/{id}           - Lấy chi tiết task
✅ GET     /tasks/search/{query} - Tìm kiếm task
✅ POST    /tasks                - Tạo task mới
✅ POST    /tasks/{id}           - Cập nhật task
✅ DELETE  /tasks/{id}           - Xóa task
✅ GET     /tasks                - Lấy danh sách
```

### Feature Design

#### 4.1 List Screen - Danh Sách Tasks

**File:** `app/crm/tasks.tsx` (UPDATE existing)

**Chức năng:**
- ✅ Display tasks với priority colors
- ✅ Filter: Status, Priority, Assigned To, Project
- ✅ Sort: Due Date, Priority, Status
- ✅ Kanban Board view / List view toggle
- ✅ Quick status update (drag to change status)

**View Modes:**

**List View:**
```typescript
<TaskCard>
  - Priority Indicator (left bar: red/orange/yellow/green)
  - Task Name
  - Project Name (link)
  - Assigned To (avatar)
  - Due Date (với countdown hoặc overdue warning)
  - Status Badge
  - Checkbox (quick complete)
  - Tags
</TaskCard>
```

**Kanban Board View:**
```typescript
<KanbanBoard>
  <Column status="not_started" title="Not Started" color="#6B7280">
    {tasks.filter(t => t.status === 'not_started').map(task => (
      <TaskKanbanCard key={task.id} task={task} />
    ))}
  </Column>
  
  <Column status="in_progress" title="In Progress" color="#3B82F6">
    ...
  </Column>
  
  <Column status="testing" title="Testing" color="#F59E0B">
    ...
  </Column>
  
  <Column status="awaiting_feedback" title="Awaiting Feedback" color="#8B5CF6">
    ...
  </Column>
  
  <Column status="complete" title="Complete" color="#10B981">
    ...
  </Column>
</KanbanBoard>
```

**State Management:**
```typescript
const {
  tasks,
  stats,
  loading,
  error,
  viewMode, // 'list' | 'kanban'
  setViewMode,
  refresh,
  search,
  filterByStatus,
  filterByPriority,
  filterByAssignee,
  filterByProject,
  updateStatus, // For drag-and-drop
  toggleComplete,
} = useTasks();
```

#### 4.2 Detail Screen - Chi Tiết Task

**File:** `app/crm/task-detail.tsx` (NEW)

**UI Layout:**
```typescript
<ScrollView>
  {/* Header */}
  <TaskHeader>
    - Priority Badge (high/urgent: red, medium: orange, low: green)
    - Task Name (editable)
    - Checkbox (complete toggle)
  </TaskHeader>

  {/* Quick Info */}
  <QuickInfo>
    <InfoRow label="Status">
      <StatusPicker value={task.status} onChange={updateStatus} />
    </InfoRow>
    <InfoRow label="Priority">
      <PriorityPicker value={task.priority} onChange={updatePriority} />
    </InfoRow>
    <InfoRow label="Project">
      <Text>{task.relatedTo} (link)</Text>
    </InfoRow>
    <InfoRow label="Assigned To">
      <StaffAvatars staffIds={task.assignedTo} />
    </InfoRow>
    <InfoRow label="Due Date">
      <DateBadge date={task.dueDate} overdue={isOverdue} />
    </InfoRow>
  </QuickInfo>

  {/* Description */}
  <Section title="Mô tả">
    <RichText content={task.description} />
  </Section>

  {/* Time Tracking */}
  <Section title="Time Tracking">
    <TimeStats>
      - Total Logged: {formatDuration(task.totalLoggedTime)}
      - Billable: {task.billable ? 'Yes' : 'No'}
      - Hourly Rate: {task.hourlyRate}
    </TimeStats>
    <Button onPress={() => setShowTimeLog(true)}>
      + Log Time
    </Button>
    <TimeLogList logs={timeLogs} />
  </Section>

  {/* Checklist */}
  <Section title="Checklist">
    <Progress value={checklistProgress} />
    <ChecklistItems items={task.checklistItems} onToggle={toggleChecklistItem} />
    <Button onPress={addChecklistItem}>+ Add Item</Button>
  </Section>

  {/* Attachments */}
  <Section title="Files">
    <FileList files={task.attachments} />
    <Button onPress={uploadFile}>+ Upload</Button>
  </Section>

  {/* Comments */}
  <Section title="Comments">
    <CommentList comments={comments} />
    <CommentInput onSubmit={addComment} />
  </Section>
</ScrollView>
```

#### 4.3 Form Screen - Tạo/Sửa Task

**File:** `app/crm/task-form.tsx` (NEW)

**Form Fields:**
```typescript
<Form>
  <Input label="Task Name *" field="name" required />
  
  <RichTextEditor label="Description" field="description" />
  
  <ProjectPicker label="Related To *" field="relatedTo" required />
  
  <MilestonePicker label="Milestone" field="milestone" projectId={project} />
  
  <StatusPicker label="Status" field="status" />
  
  <PriorityPicker label="Priority" field="priority" />
  
  <StaffPicker label="Assign To" field="assignedTo" multiple />
  
  <DateTimePicker label="Start Date" field="startDate" />
  <DateTimePicker label="Due Date" field="dueDate" />
  
  <Switch label="Billable" field="billable" />
  {billable && (
    <Input label="Hourly Rate" field="hourlyRate" type="currency" />
  )}
  
  <Switch label="Public" field="isPublic" />
  
  <TagsInput label="Tags" field="tags" />
  
  <ButtonRow>
    <Button type="cancel" />
    <Button type="submit" loading={submitting} />
  </ButtonRow>
</Form>
```

---

## 📦 Extended Modules (5-17)

### Module 5: Leads Management

**Permissions:** Get, Search, Create, Update, Delete

**Key Features:**
- Lead pipeline (stages: Customer, Contact, Proposal, etc.)
- Lead source tracking
- Status updates
- Convert to Customer
- Activity tracking

**Screens:**
- `app/crm/leads.tsx` - List with pipeline view
- `app/crm/lead-detail.tsx` - Detail with conversion
- `app/crm/lead-form.tsx` - Create/Edit form

---

### Module 6: Milestones Management

**Permissions:** Get, Search, Create, Update, Delete

**Key Features:**
- Project milestones timeline
- Progress tracking
- Task grouping by milestone
- Completion status

**Integration:** Embedded in Project Detail screen under "Milestones" tab

---

### Module 7: Staffs Management

**Permissions:** Get, Search, Create, Update, Delete

**Key Features:**
- Staff directory
- Role management
- Department assignment
- Performance tracking
- Task assignment

**Screens:**
- `app/crm/staff.tsx` - Staff list
- `app/crm/staff-detail.tsx` - Profile & stats
- `app/crm/staff-form.tsx` - Add/Edit staff

---

### Module 8: Tickets Management

**Permissions:** Get, Search, Create, Update, Delete

**Key Features:**
- Support ticket system
- Priority & status tracking
- Assignment
- Response time tracking
- Customer satisfaction

**Screens:**
- `app/crm/tickets.tsx` - Ticket list with filters
- `app/crm/ticket-detail.tsx` - Ticket thread
- `app/crm/ticket-form.tsx` - Create ticket

---

### Module 9: Contracts Management

**Permissions:** Get List, Create, Delete (Limited)

**Key Features:**
- Contract templates
- Signature tracking
- Renewal reminders
- Contract value tracking

**Screens:**
- `app/crm/contracts.tsx` - List view
- `app/crm/contract-detail.tsx` - View & sign
- `app/crm/contract-form.tsx` - Create from template

---

### Module 10: Credit Notes Management

**Permissions:** Get, Search, Create, Update, Delete

**Key Features:**
- Credit note creation
- Apply to invoices
- Refund tracking
- Customer credit balance

**Screens:**
- `app/crm/credit-notes.tsx` - List
- `app/crm/credit-note-detail.tsx` - Detail
- `app/crm/credit-note-form.tsx` - Create/Edit

---

### Module 11: Estimates Management

**Permissions:** Get, Search, Create, Update, Delete

**Key Features:**
- Estimate creation
- Send to customer
- Accept/Decline tracking
- Convert to Invoice
- Estimate templates

**Screens:**
- `app/crm/estimates.tsx` - List
- `app/crm/estimate-detail.tsx` - View & actions
- `app/crm/estimate-form.tsx` - Create/Edit

---

### Module 12: Expenses Management

**Permissions:** Get, Search, Create, Update, Delete

**Key Features:**
- Expense tracking
- Category management
- Receipt upload
- Billable expenses
- Expense reports

**Screens:**
- `app/crm/expenses.tsx` - List with filters
- `app/crm/expense-detail.tsx` - Detail with receipt
- `app/crm/expense-form.tsx` - Add expense

---

### Module 13: Expense Categories

**Permissions:** Get (Read-only)

**Key Features:**
- Category list for expenses
- Used in Expense forms

**Integration:** Picker component in Expense Form

---

### Module 14: Payments Management

**Permissions:** Get List, Search, Create, Update, Delete

**Key Features:**
- Payment recording
- Payment method tracking
- Invoice payment linkage
- Payment reports

**Integration:** 
- Record payment in Invoice Detail
- List in `app/crm/payments.tsx`

---

### Module 15: Payment Methods

**Permissions:** Get (Read-only)

**Key Features:**
- Payment method list
- Used in Payment forms

**Integration:** Picker in Payment/Invoice forms

---

### Module 16: Products Management

**Permissions:** Get List, Search (Read-only)

**Key Features:**
- Product catalog
- Used in Invoice/Estimate items
- Price reference

**Integration:** Product picker in Invoice/Estimate forms

---

### Module 17: Contacts Management

**Permissions:** Get, Search, Create, Update, Delete

**Key Features:**
- Customer contact persons
- Multiple contacts per customer
- Primary contact designation
- Contact info (email, phone)

**Integration:** Embedded in Customer Detail under "Contacts" tab

---

## 🛠️ Technical Specifications

### 1. Service Layer Implementation

**File:** `services/perfexService.ts`

```typescript
import ENV from '@/config/env';
import type {
  Customer,
  Invoice,
  Project,
  Task,
  Lead,
  Milestone,
  Staff,
  Ticket,
  Contract,
  CreditNote,
  Estimate,
  Expense,
  ExpenseCategory,
  Payment,
  PaymentMode,
  Product,
  Contact,
} from '@/types/perfex';

const API_BASE = ENV.PERFEX_CRM_URL;
const API_TOKEN = ENV.PERFEX_API_TOKEN;

// ==================== API CLIENT ====================

class PerfexAPIClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}/api${endpoint}`;
    
    const headers = {
      'authtoken': API_TOKEN,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new PerfexAPIClient();

// ==================== CUSTOMERS API ====================

export const customersApi = {
  async list(): Promise<Customer[]> {
    return apiClient.get<Customer[]>('/customers');
  },

  async get(id: string): Promise<Customer> {
    return apiClient.get<Customer>(`/customers/${id}`);
  },

  async search(query: string): Promise<Customer[]> {
    return apiClient.get<Customer[]>(`/customers/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Customer>): Promise<Customer> {
    return apiClient.post<Customer>('/customers', data);
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    return apiClient.post<Customer>(`/customers/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/customers/${id}`);
  },
};

// ==================== INVOICES API ====================

export const invoicesApi = {
  async list(): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>('/invoices');
  },

  async get(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`/invoices/${id}`);
  },

  async search(query: string): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>(`/invoices/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Invoice>): Promise<Invoice> {
    return apiClient.post<Invoice>('/invoices', data);
  },

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    return apiClient.post<Invoice>(`/invoices/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/invoices/${id}`);
  },
};

// ==================== PROJECTS API ====================

export const projectsApi = {
  async list(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects');
  },

  async get(id: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  async search(query: string): Promise<Project[]> {
    return apiClient.get<Project[]>(`/projects/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Project>): Promise<Project> {
    return apiClient.post<Project>('/projects', data);
  },

  async update(id: string, data: Partial<Project>): Promise<Project> {
    return apiClient.post<Project>(`/projects/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}`);
  },
};

// ==================== TASKS API ====================

export const tasksApi = {
  async list(): Promise<Task[]> {
    return apiClient.get<Task[]>('/tasks');
  },

  async get(id: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${id}`);
  },

  async search(query: string): Promise<Task[]> {
    return apiClient.get<Task[]>(`/tasks/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Task>): Promise<Task> {
    return apiClient.post<Task>('/tasks', data);
  },

  async update(id: string, data: Partial<Task>): Promise<Task> {
    return apiClient.post<Task>(`/tasks/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${id}`);
  },
};

// ==================== LEADS API ====================

export const leadsApi = {
  async list(): Promise<Lead[]> {
    return apiClient.get<Lead[]>('/leads');
  },

  async get(id: string): Promise<Lead> {
    return apiClient.get<Lead>(`/leads/${id}`);
  },

  async search(query: string): Promise<Lead[]> {
    return apiClient.get<Lead[]>(`/leads/search/${encodeURIComponent(query)}`);
  },

  async create(data: Partial<Lead>): Promise<Lead> {
    return apiClient.post<Lead>('/leads', data);
  },

  async update(id: string, data: Partial<Lead>): Promise<Lead> {
    return apiClient.post<Lead>(`/leads/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/leads/${id}`);
  },
};

// ... Continue for all 17 modules ...

// ==================== PERFEX SERVICE (Main Export) ====================

export const perfexService = {
  customers: customersApi,
  invoices: invoicesApi,
  projects: projectsApi,
  tasks: tasksApi,
  leads: leadsApi,
  milestones: milestonesApi,
  staff: staffsApi,
  tickets: ticketsApi,
  contracts: contractsApi,
  creditNotes: creditNotesApi,
  estimates: estimatesApi,
  expenses: expensesApi,
  expenseCategories: expenseCategoriesApi,
  payments: paymentsApi,
  paymentModes: paymentModesApi,
  products: productsApi,
  contacts: contactsApi,
};

export default perfexService;
```

---

### 2. Hooks Layer Implementation

**File:** `hooks/usePerfexCRM.ts`

```typescript
import { useCallback, useEffect, useState } from 'react';
import { perfexService } from '@/services/perfexService';
import type { Customer, Invoice, Project, Task } from '@/types/perfex';

// ==================== BASE HOOK ====================

interface UseAPIOptions<T> {
  autoFetch?: boolean;
  initialData?: T[];
}

function useAPI<T extends { id: string }>(
  apiModule: any,
  options: UseAPIOptions<T> = {}
) {
  const { autoFetch = true, initialData = [] } = options;
  
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiModule.list();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Fetch failed');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiModule]);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      fetchData();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await apiModule.search(query);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [apiModule, fetchData]);

  const create = useCallback(async (item: Partial<T>): Promise<T> => {
    try {
      const created = await apiModule.create(item);
      setData(prev => [created, ...prev]);
      return created;
    } catch (err: any) {
      throw new Error(err.message || 'Create failed');
    }
  }, [apiModule]);

  const update = useCallback(async (id: string, item: Partial<T>): Promise<T> => {
    try {
      const updated = await apiModule.update(id, item);
      setData(prev => prev.map(i => i.id === id ? updated : i));
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Update failed');
    }
  }, [apiModule]);

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      await apiModule.delete(id);
      setData(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Delete failed');
    }
  }, [apiModule]);

  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    search,
    create,
    update,
    remove,
  };
}

// ==================== CUSTOMERS HOOK ====================

export function useCustomers() {
  const base = useAPI<Customer>(perfexService.customers);
  
  const stats = {
    total: base.data.length,
    active: base.data.filter(c => c.active === '1').length,
    inactive: base.data.filter(c => c.active === '0').length,
  };

  return {
    customers: base.data,
    ...base,
    stats,
  };
}

// ==================== INVOICES HOOK ====================

export function useInvoices() {
  const base = useAPI<Invoice>(perfexService.invoices);
  
  const stats = {
    total: base.data.length,
    unpaid: base.data.filter(i => i.status === 1 || i.status === 3).length,
    paid: base.data.filter(i => i.status === 2).length,
    overdue: base.data.filter(i => i.status === 4).length,
    totalAmount: base.data.reduce((sum, i) => sum + parseFloat(i.total), 0),
    totalPaid: base.data.reduce((sum, i) => sum + parseFloat(i.total_paid || '0'), 0),
  };

  return {
    invoices: base.data,
    ...base,
    stats,
  };
}

// ==================== PROJECTS HOOK ====================

export function useProjects() {
  const base = useAPI<Project>(perfexService.projects);
  
  const stats = {
    total: base.data.length,
    active: base.data.filter(p => p.status === 2 || p.status === 3).length,
    completed: base.data.filter(p => p.status === 4).length,
    totalValue: base.data.reduce((sum, p) => sum + parseFloat(p.project_cost || '0'), 0),
  };

  return {
    projects: base.data,
    ...base,
    stats,
  };
}

// ==================== TASKS HOOK ====================

export function useTasks() {
  const base = useAPI<Task>(perfexService.tasks);
  
  const stats = {
    total: base.data.length,
    completed: base.data.filter(t => t.status === 5).length,
    inProgress: base.data.filter(t => t.status === 2 || t.status === 3).length,
    notStarted: base.data.filter(t => t.status === 1).length,
  };

  return {
    tasks: base.data,
    ...base,
    stats,
  };
}

// ... Continue for all modules ...
```

---

## 🚀 Implementation Roadmap

### Phase 1: Service Layer (1-2 days)
- ✅ Update `services/perfexService.ts` with all 17 modules
- ✅ Test all CRUD operations via Postman/REST client
- ✅ Verify data mapping and types

### Phase 2: Hooks Layer (2-3 days)
- ✅ Complete `hooks/usePerfexCRM.ts`
- ✅ Test hooks with real API
- ✅ Add caching and error handling

### Phase 3: Priority Modules UI (1-2 weeks)
Week 1:
- Update `customers.tsx` → Real API
- Create `customer-detail.tsx`
- Create `customer-form.tsx`
- Update `invoices.tsx` → Real API
- Create `invoice-detail.tsx`
- Create `invoice-form.tsx`

Week 2:
- Update `projects.tsx` → Real API
- Create `project-detail.tsx`
- Create `project-form.tsx`
- Update `tasks.tsx` → Real API
- Create `task-detail.tsx`
- Create `task-form.tsx`

### Phase 4: Extended Modules (1 week)
- Leads, Tickets, Contracts, Estimates
- Staff, Expenses, Credit Notes, Payments
- Contacts, Milestones

### Phase 5: Testing & Polish (3-5 days)
- E2E testing
- Error handling improvements
- Performance optimization
- UI polish

**Total estimated time:** 3-4 weeks

---

## 📝 Next Steps

1. **Review this design document**
2. **Start Phase 1:** Update service layer
3. **Test API endpoints** với Postman
4. **Move to Phase 2:** Implement hooks
5. **UI Integration:** Connect screens one by one

**Bắt đầu coding ngay?** 🚀

---

**Last Updated:** January 7, 2026  
**Version:** 1.0  
**Status:** ✅ Complete Design Ready for Implementation
