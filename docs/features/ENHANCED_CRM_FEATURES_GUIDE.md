# Enhanced Perfex CRM Features - Complete Documentation

## 📋 Overview

This document details the comprehensive Perfex CRM features added to the app, including full project management capabilities, time tracking, milestones, expenses, and complete CRUD operations.

---

## 🚀 New Features Added

### 1. **Enhanced Services Layer** (`services/perfexService.ts`)

Comprehensive API wrapper with 50+ methods covering all Perfex CRM operations:

#### Project Management
- `getProjects()` - List all projects with filters
- `getProject(id)` - Get detailed project information
- `createProject(data)` - Create new project
- `updateProject(id, data)` - Update project details
- `deleteProject(id)` - Delete project
- `addProjectMember(projectId, staffId, role)` - Add team member
- `removeProjectMember(projectId, staffId)` - Remove team member
- `getProjectActivity(projectId)` - Get activity logs

#### Task Management
- `getTasks(filters)` - List tasks with filters
- `getTask(id)` - Get task details
- `createTask(data)` - Create new task
- `updateTask(id, data)` - Update task
- `deleteTask(id)` - Delete task
- `assignTask(taskId, staffId)` - Assign to staff
- `addTaskComment(taskId, comment)` - Add comment
- `updateTaskStatus(taskId, status)` - Change status
- `addTaskChecklistItem(taskId, item)` - Add checklist item
- `toggleChecklistItem(taskId, itemId)` - Toggle completion

#### Time Tracking
- `logTime(data)` - Log time entry
- `getTimeEntries(projectId)` - Get all time entries
- `updateTimeEntry(id, data)` - Update time entry
- `deleteTimeEntry(id)` - Delete time entry
- `getProjectTotalHours(projectId)` - Get total hours

#### Milestones
- `getMilestones(projectId)` - List milestones
- `createMilestone(data)` - Create milestone
- `updateMilestone(id, data)` - Update milestone
- `deleteMilestone(id)` - Delete milestone
- `markMilestoneComplete(id)` - Mark as complete

#### Expenses
- `getExpenses(projectId)` - List expenses
- `createExpense(data)` - Create expense
- `updateExpense(id, data)` - Update expense
- `deleteExpense(id)` - Delete expense

#### Invoices
- `getInvoices(filters)` - List invoices
- `getInvoice(id)` - Get invoice details
- `createInvoice(data)` - Create invoice
- `updateInvoice(id, data)` - Update invoice
- `deleteInvoice(id)` - Delete invoice
- `sendInvoiceToCustomer(id)` - Send invoice email
- `recordPayment(invoiceId, data)` - Record payment
- `markInvoiceSent(id)` - Mark as sent

#### Estimates
- `getEstimates(filters)` - List estimates
- `createEstimate(data)` - Create estimate
- `updateEstimate(id, data)` - Update estimate
- `sendEstimateToCustomer(id)` - Send estimate
- `convertEstimateToInvoice(id)` - Convert to invoice
- `markEstimateAccepted(id)` - Mark as accepted
- `markEstimateDeclined(id)` - Mark as declined

#### Customers
- `getCustomers(filters)` - List customers
- `getCustomer(id)` - Get customer details
- `createCustomer(data)` - Create customer
- `updateCustomer(id, data)` - Update customer
- `getCustomerContacts(id)` - Get contacts

#### Tickets
- `getTickets(filters)` - List tickets
- `getTicket(id)` - Get ticket details
- `createTicket(data)` - Create ticket
- `updateTicket(id, data)` - Update ticket
- `replyToTicket(id, message)` - Add reply
- `assignTicket(id, staffId)` - Assign ticket
- `changeTicketStatus(id, status)` - Change status
- `changeTicketPriority(id, priority)` - Change priority

#### Notes & Files
- `getNotes(relId, relType)` - Get notes
- `createNote(data)` - Create note
- `updateNote(id, data)` - Update note
- `deleteNote(id)` - Delete note
- `getProjectFiles(projectId)` - Get files
- `uploadFile(data)` - Upload file
- `deleteFile(id)` - Delete file

#### Dashboard & Reports
- `getDashboardStats()` - Get dashboard statistics
- `getRecentActivity(limit)` - Get activity log
- `getStaffMembers()` - Get team list

---

### 2. **React Hooks** (`hooks/usePerfex.ts`)

Seven specialized hooks with consistent patterns:

#### useProjects()
```typescript
const {
  loading,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = useProjects();
```

#### useTasks()
```typescript
const {
  loading,
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  updateStatus,
  addComment,
  addChecklistItem,
  toggleChecklistItem,
} = useTasks();
```

#### useTimeTracking()
```typescript
const {
  loading,
  logTime,
  getTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
  getProjectTotalHours,
} = useTimeTracking();
```

#### useMilestones()
```typescript
const {
  loading,
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  markComplete,
} = useMilestones();
```

#### useExpenses()
```typescript
const {
  loading,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = useExpenses();
```

#### useInvoices()
```typescript
const {
  loading,
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  recordPayment,
} = useInvoices();
```

#### useDashboard()
```typescript
const {
  loading,
  stats,
  loadDashboard,
  getRecentActivity,
} = useDashboard();
```

---

### 3. **UI Screens**

#### Project Management (`app/crm/project-management.tsx`)
- Project list with status badges
- Create project modal with form
- Project stats dashboard
- Filter by status
- Search functionality
- Pull to refresh

**Features:**
- Total projects count
- In progress / Completed stats
- Status color coding (not_started, in_progress, on_hold, cancelled, finished)
- Empty state with CTA
- Responsive card layout

#### Time Tracking (`app/crm/time-tracking.tsx`)
- Start/stop timer for active sessions
- Manual time entry logging
- Billable vs non-billable hours
- Time entries list
- Total hours and value calculation
- Session notes

**Features:**
- Real-time timer display
- Auto-calculate hours
- Hourly rate calculation
- Session notes while running
- Filter by billable
- Currency formatting (VND)

#### Milestones (`app/crm/milestones.tsx`)
- Milestone list with completion status
- Progress bar showing % completion
- Create milestone with due date
- Mark complete functionality
- Overdue indicators
- Completion date tracking

**Features:**
- Visual progress indicator
- Overdue highlighting (red)
- Completion checkboxes
- Date picker for due dates
- Stats: X of Y completed
- Empty state CTA

#### Expenses (`app/crm/expenses.tsx`)
- Expense categories with icons
- Billable/non-billable tracking
- Invoiced status
- Total, billable, invoiced stats
- Date-based entry
- Category filtering

**Features:**
- 6 expense categories (Materials, Labor, Equipment, Travel, Meals, Other)
- Category icons (Ionicons)
- Amount input with currency
- Date picker
- Billable checkbox
- Filter chips (All, Billable, Non-billable)
- Pending expenses calculation

---

## 📊 TypeScript Types

### Core Types

```typescript
interface ProjectDetails {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  billingType: 'fixed' | 'hourly';
  status: 'not_started' | 'in_progress' | 'on_hold' | 'cancelled' | 'finished';
  startDate?: string;
  deadline?: string;
  projectCost?: number;
  projectRatePerHour?: number;
  estimatedHours?: number;
  members?: ProjectMember[];
  settings?: ProjectSettings;
}

interface PerfexTask {
  id: string;
  name: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: string;
  dueDate?: string;
  relId: string;
  relType: 'project' | 'customer';
  isAddedFromContact: boolean;
  assignedTo: string[];
  followers: string[];
  checklistItems: TaskChecklistItem[];
  tags: string[];
}

interface TimeEntry {
  id: string;
  projectId: string;
  staffId: string;
  startTime: string;
  endTime: string;
  hours: number;
  note: string;
  isBillable: boolean;
  hourlyRate?: number;
}

interface ProjectMilestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  dueDate: string;
  completedDate?: string;
  completed: boolean;
  order: number;
}

interface ProjectExpense {
  id: string;
  projectId: string;
  categoryId: string;
  amount: number;
  currency: string;
  date: string;
  note: string;
  reference?: string;
  billable: boolean;
  invoiced: boolean;
  tax?: number;
  tax2?: number;
}
```

---

## 🎨 Design Patterns

### Theming
All screens use `useThemeColor` hook for consistent theming:
- `backgroundColor` - Main background
- `textColor` - Primary text
- `primaryColor` - Brand color / CTAs
- `cardBg` - Surface color
- `borderColor` - Dividers/borders

### Modal Pattern
Consistent modal implementation:
- Bottom sheet style (slide up animation)
- Semi-transparent overlay
- Close button in header
- Form validation
- Submit button at bottom

### Empty States
All screens include empty states:
- Large icon (64px, gray)
- Descriptive text
- CTA button to create first item

### Loading States
Consistent loading patterns:
- Centered ActivityIndicator
- Full screen overlay
- Uses primary theme color

---

## 🔄 Data Flow

```
User Action
    ↓
UI Component (Screen)
    ↓
React Hook (usePerfex.ts)
    ↓
Service Layer (perfexService.ts)
    ↓
HTTP Request with Bearer Token
    ↓
Perfex CRM REST API
    ↓
Response Processing
    ↓
State Update (useState)
    ↓
UI Re-render
```

---

## 🧪 Usage Examples

### Creating a Project
```typescript
import { useProjects } from '@/hooks/usePerfex';

function MyComponent() {
  const { createProject } = useProjects();
  
  const handleCreate = async () => {
    const result = await createProject({
      name: 'New Villa Project',
      description: 'Luxury resort construction',
      clientId: '123',
      billingType: 'fixed',
      status: 'not_started',
      deadline: '2025-12-31',
      projectCost: 5000000000,
    });
    
    if (result) {
      Alert.alert('Success', 'Project created!');
    }
  };
}
```

### Logging Time
```typescript
import { useTimeTracking } from '@/hooks/usePerfex';

function MyComponent() {
  const { logTime } = useTimeTracking();
  
  const handleLogTime = async () => {
    const result = await logTime({
      projectId: '456',
      startTime: '2025-01-03T08:00:00Z',
      endTime: '2025-01-03T12:00:00Z',
      hours: 4,
      note: 'Foundation work',
      isBillable: true,
      hourlyRate: 500000,
    });
  };
}
```

### Creating Milestone
```typescript
import { useMilestones } from '@/hooks/usePerfex';

function MyComponent() {
  const { createMilestone } = useMilestones();
  
  const handleCreate = async () => {
    const result = await createMilestone({
      projectId: '789',
      name: 'Foundation Complete',
      description: 'All foundation work finished',
      dueDate: '2025-02-15',
    });
  };
}
```

---

## 🗂️ File Structure

```
app/
  crm/
    project-management.tsx   # Enhanced projects screen
    time-tracking.tsx        # Time tracking with timer
    milestones.tsx          # Milestone management
    expenses.tsx            # Expense tracking
    projects.tsx            # Original CRM projects
    tasks.tsx               # Original CRM tasks
    invoices.tsx            # Existing invoices screen
    customers.tsx           # Existing customers screen
    _layout.tsx             # CRM section layout

services/
  perfexService.ts         # Enhanced API service (NEW)
  perfexSync.ts           # Original sync service
  dataSyncService.ts      # Basic data sync

hooks/
  usePerfex.ts            # Enhanced hooks (NEW)
  useCRMTasks.ts          # Existing task hooks
  useDataSync.ts          # Basic sync hooks
```

---

## 🔐 Authentication

All API calls use Bearer token authentication:

```typescript
const headers = {
  'Authorization': `Bearer ${ENV.PERFEX_API_TOKEN}`,
  'Content-Type': 'application/json',
};
```

Token is stored in environment config:
```
PERFEX_API_TOKEN=your_api_token_here
```

---

## 🌐 API Endpoints

Base URL: `https://thietkeresort.com.vn/perfex_crm`

### Projects
- GET `/api/projects` - List projects
- GET `/api/projects/{id}` - Get project
- POST `/api/projects` - Create project
- PUT `/api/projects/{id}` - Update project
- DELETE `/api/projects/{id}` - Delete project

### Tasks
- GET `/api/tasks` - List tasks
- POST `/api/tasks` - Create task
- PUT `/api/tasks/{id}` - Update task
- POST `/api/tasks/{id}/comments` - Add comment

### Time Tracking
- POST `/api/time_entries` - Log time
- GET `/api/time_entries?project_id={id}` - Get entries
- PUT `/api/time_entries/{id}` - Update entry

### Milestones
- GET `/api/projects/{id}/milestones` - List milestones
- POST `/api/milestones` - Create milestone
- PUT `/api/milestones/{id}/complete` - Mark complete

### Expenses
- GET `/api/expenses?project_id={id}` - List expenses
- POST `/api/expenses` - Create expense
- PUT `/api/expenses/{id}` - Update expense

---

## 📱 Navigation Integration

Add to your navigation structure:

```typescript
// In app/(tabs)/profile.tsx or menu
<TouchableOpacity onPress={() => router.push('/crm/project-management')}>
  <Text>Project Management</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => router.push('/crm/time-tracking')}>
  <Text>Time Tracking</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => router.push('/crm/milestones')}>
  <Text>Milestones</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => router.push('/crm/expenses')}>
  <Text>Expenses</Text>
</TouchableOpacity>
```

---

## ✅ Testing Checklist

### Project Management
- [ ] List projects with different statuses
- [ ] Create new project with all fields
- [ ] Update project details
- [ ] Delete project
- [ ] Filter by status
- [ ] Search projects
- [ ] View project stats

### Time Tracking
- [ ] Start timer
- [ ] Stop timer and auto-log
- [ ] Manual time entry
- [ ] Toggle billable/non-billable
- [ ] View total hours
- [ ] Calculate billable value
- [ ] Add session notes

### Milestones
- [ ] Create milestone with due date
- [ ] Mark milestone complete
- [ ] View progress percentage
- [ ] Check overdue indicators
- [ ] Sort by due date
- [ ] Empty state display

### Expenses
- [ ] Select expense category
- [ ] Enter amount
- [ ] Set date
- [ ] Toggle billable
- [ ] View total expenses
- [ ] Filter by billable status
- [ ] Check invoiced status

---

## 🐛 Error Handling

All hooks follow consistent error pattern:

```typescript
try {
  const response = await apiFetch(endpoint, options);
  return response;
} catch (error) {
  console.error('Operation failed:', error);
  Alert.alert('Error', 'Failed to complete operation');
  return null;
}
```

User-facing errors always show Alert with:
- Title: "Error"
- Message: Descriptive error message
- OK button to dismiss

---

## 🎯 Next Steps

### Recommended Enhancements

1. **File Attachments**
   - Upload project documents
   - Attach receipts to expenses
   - Download files

2. **Comments & Activity**
   - Project activity timeline
   - Task comments
   - @mentions for team members

3. **Notifications**
   - Push notifications for task assignments
   - Deadline reminders
   - Milestone completion alerts

4. **Reports**
   - Time tracking reports
   - Expense reports
   - Project profitability analysis
   - Export to PDF

5. **Offline Support**
   - Cache project data
   - Offline time tracking
   - Sync when online

6. **Team Collaboration**
   - Real-time updates
   - Team member profiles
   - Workload distribution view

7. **Advanced Filtering**
   - Date range filters
   - Multi-select filters
   - Saved filter presets

8. **Custom Fields**
   - Project custom fields
   - Task custom fields
   - Expense categories customization

---

## 📚 Resources

### Documentation
- Perfex CRM API Docs: Check your Perfex installation's `/api` endpoint
- React Native: https://reactnative.dev
- Expo Router: https://docs.expo.dev/router/introduction/

### Dependencies
```json
{
  "@react-native-community/datetimepicker": "^7.6.2",
  "expo-router": "^3.5.23",
  "@expo/vector-icons": "^14.0.0"
}
```

---

## 🤝 Contributing

When adding new features:

1. Follow existing patterns in `perfexService.ts`
2. Create corresponding hooks in `usePerfex.ts`
3. Build UI screens with consistent theming
4. Include empty states and loading indicators
5. Add TypeScript types
6. Document new endpoints
7. Update this documentation

---

## 📝 Changelog

### Version 2.0 (2025-01-03)
- ✅ Added `perfexService.ts` with 50+ API methods
- ✅ Created `usePerfex.ts` with 7 specialized hooks
- ✅ Built Time Tracking screen with timer
- ✅ Built Milestones screen with progress tracking
- ✅ Built Expenses screen with category management
- ✅ Enhanced Project Management screen
- ✅ Added 30+ TypeScript interfaces
- ✅ Implemented consistent error handling
- ✅ Created comprehensive documentation

### Version 1.0 (Earlier)
- Basic CRM data reading
- Test screen for API verification
- Simple data sync service

---

## 💡 Tips & Best Practices

### Performance
- Use pagination for large lists
- Implement pull-to-refresh
- Cache frequently accessed data
- Optimize re-renders with useMemo/useCallback

### UX
- Show loading states during API calls
- Provide immediate feedback for user actions
- Use optimistic updates where appropriate
- Include confirmation dialogs for destructive actions

### Code Quality
- Follow TypeScript strict mode
- Use consistent naming conventions
- Extract reusable components
- Write self-documenting code
- Add inline comments for complex logic

---

## 📧 Support

For issues or questions:
1. Check this documentation
2. Review existing screens for patterns
3. Check Perfex CRM API documentation
4. Test API endpoints using the test-crm screen

---

**Last Updated:** 2025-01-03  
**Author:** ThietKeResort Development Team  
**Version:** 2.0
