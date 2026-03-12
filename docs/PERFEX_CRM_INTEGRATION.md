# Hướng dẫn tích hợp Perfex CRM

## Tổng quan

App đã được tích hợp với Perfex CRM để quản lý:
- **Customers** - Khách hàng
- **Projects** - Dự án xây dựng
- **Tasks** - Công việc
- **Invoices** - Hóa đơn
- **Estimates** - Báo giá
- **Leads** - Khách hàng tiềm năng

---

## 📋 Bước 1: Cấu hình Perfex CRM

### 1.1 Bật API trong Perfex CRM

1. Đăng nhập Admin Perfex CRM
2. Vào **Setup > Settings > API**
3. Bật **Enable API**
4. Tạo API Key mới
5. Copy API Key

### 1.2 Tạo Staff Account (nếu chưa có)

1. Vào **Setup > Staff**
2. Tạo account mới hoặc dùng account hiện có
3. Đảm bảo account có đủ quyền truy cập các module cần thiết

---

## 📋 Bước 2: Cấu hình trong App

### 2.1 Cập nhật file .env

```bash
# Thêm các biến sau vào .env hoặc .env.local

PERFEX_CRM_URL=https://your-perfex-domain.com
PERFEX_API_TOKEN=your-api-token-here
```

### 2.2 Kiểm tra config/env.ts

```typescript
// File config/env.ts đã được cập nhật với:
export const ENV_CONFIG = {
  // ... các config khác
  PERFEX_CRM_URL: process.env.PERFEX_CRM_URL || '',
  PERFEX_API_TOKEN: process.env.PERFEX_API_TOKEN || '',
};
```

---

## 📋 Bước 3: Sử dụng trong App

### 3.1 Import và sử dụng service

```typescript
import PerfexCRM from '@/services/perfexCRM';

// Kiểm tra kết nối
const result = await PerfexCRM.testConnection();
console.log('Connected:', result.connected);

// Lấy danh sách customers
const customers = await PerfexCRM.Customers.getAll();

// Lấy danh sách projects
const projects = await PerfexCRM.Projects.getAll();
```

### 3.2 Sử dụng React Hooks

```tsx
import { 
  usePerfexConnection,
  usePerfexCustomers,
  usePerfexProjects,
  usePerfexTasks,
} from '@/hooks/usePerfexCRM';

function MyComponent() {
  // Kiểm tra kết nối
  const { connected, loading: connectionLoading } = usePerfexConnection();
  
  // Customers
  const { 
    customers, 
    loading, 
    createCustomer, 
    updateCustomer 
  } = usePerfexCustomers();
  
  // Projects
  const { 
    projects, 
    updateProgress 
  } = usePerfexProjects({ clientid: '123' });
  
  // Tasks
  const { 
    tasks, 
    createTask, 
    markComplete 
  } = usePerfexTasks({ rel_type: 'project', rel_id: '1' });
  
  return (
    <View>
      {connected ? (
        <Text>✓ Connected to Perfex CRM</Text>
      ) : (
        <Text>✗ Not connected</Text>
      )}
      
      {customers.map(customer => (
        <Text key={customer.userid}>{customer.company}</Text>
      ))}
    </View>
  );
}
```

---

## 📋 Bước 4: Sync Data giữa App và Perfex

### 4.1 Sync Users → Customers

```typescript
import PerfexCRM from '@/services/perfexCRM';

// Sync một user
await PerfexCRM.Sync.syncUserToCustomer({
  id: 'user-123',
  email: 'user@example.com',
  name: 'Nguyễn Văn A',
  phone: '0901234567',
  address: '123 Đường ABC, Quận 1',
});

// Sync nhiều users
const users = [
  { id: '1', email: 'user1@example.com', name: 'User 1' },
  { id: '2', email: 'user2@example.com', name: 'User 2' },
];
const results = await PerfexCRM.Sync.syncAllUsers(users);
console.log('Success:', results.success);
console.log('Failed:', results.failed);
```

### 4.2 Sync Projects

```typescript
await PerfexCRM.Sync.syncProjectToCustomer({
  id: 'project-123',
  name: 'Xây dựng Villa ABC',
  description: 'Dự án xây dựng villa cao cấp',
  clientId: 'customer-id-in-perfex',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  progress: 35,
  status: 'active',
});
```

### 4.3 Sử dụng Sync Hook

```tsx
import { usePerfexSync } from '@/hooks/usePerfexCRM';

function SyncScreen() {
  const { syncing, lastSync, results, syncUsers, syncProjects } = usePerfexSync();
  
  const handleSync = async () => {
    // Lấy users từ database local
    const users = await getLocalUsers();
    
    // Sync lên Perfex
    await syncUsers(users);
  };
  
  return (
    <View>
      <Button 
        title={syncing ? 'Đang sync...' : 'Sync Users'} 
        onPress={handleSync}
        disabled={syncing}
      />
      {lastSync && <Text>Last sync: {lastSync.toLocaleString()}</Text>}
      {results && (
        <Text>
          Success: {results.success} | Failed: {results.failed}
        </Text>
      )}
    </View>
  );
}
```

---

## 📋 Bước 5: Webhooks (Nâng cao)

### 5.1 Cấu hình Webhook trong Perfex

1. Vào **Setup > Settings > Webhooks** (hoặc module custom)
2. Thêm webhook URL: `https://your-app-api.com/webhooks/perfex`
3. Chọn events cần nhận:
   - customer.created
   - customer.updated
   - project.created
   - project.updated
   - task.completed
   - invoice.paid

### 5.2 Xử lý Webhook trong Backend App

```typescript
// BE-baotienweb.cloud/routes/webhooks.ts
import { handlePerfexWebhook } from '@/services/perfexCRM';

router.post('/webhooks/perfex', async (req, res) => {
  try {
    await handlePerfexWebhook(req.body, {
      onCustomerCreated: async (customer) => {
        // Tạo user tương ứng trong app
        await createUserFromPerfexCustomer(customer);
      },
      onCustomerUpdated: async (customer) => {
        // Cập nhật user trong app
        await updateUserFromPerfexCustomer(customer);
      },
      onProjectUpdated: async (project) => {
        // Cập nhật tiến độ dự án
        await updateProjectProgress(project);
      },
      onTaskCompleted: async (task) => {
        // Gửi notification
        await sendTaskCompletedNotification(task);
      },
      onInvoicePaid: async (invoice) => {
        // Cập nhật payment status
        await updatePaymentStatus(invoice);
      },
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
```

---

## 📋 Bước 6: Tạo Custom Module Perfex (Nâng cao)

Nếu cần tính năng nâng cao hơn, có thể tạo custom module trong Perfex CRM.

### 6.1 Cấu trúc Module

```
modules/
  thietke_resort/
    thietke_resort.php          # Main module file
    install.php                  # Installation script
    uninstall.php               # Uninstallation script
    controllers/
      Thietke_resort.php        # Main controller
      Api.php                   # API controller
    models/
      Thietke_resort_model.php  # Database model
    views/
      index.php                 # Main view
    language/
      vietnamese/
        thietke_resort_lang.php
```

### 6.2 API Controller mẫu

```php
<?php
// modules/thietke_resort/controllers/Api.php

defined('BASEPATH') or exit('No direct script access allowed');

class Api extends AdminController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('thietke_resort_model');
    }
    
    // Push project progress to external app
    public function sync_project_progress()
    {
        if (!$this->input->is_ajax_request()) {
            header('HTTP/1.0 400 Bad Request');
            echo json_encode(['error' => 'Invalid request']);
            die;
        }
        
        $project_id = $this->input->post('project_id');
        $project = $this->projects_model->get($project_id);
        
        // Call external API
        $response = $this->push_to_external_api([
            'perfex_project_id' => $project_id,
            'name' => $project->name,
            'progress' => $project->progress_from_tasks,
            'status' => $project->status,
            'updated_at' => date('Y-m-d H:i:s'),
        ]);
        
        echo json_encode($response);
    }
    
    private function push_to_external_api($data)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://baotienweb.cloud/api/v1/sync/perfex');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'X-API-Key: thietke-resort-api-key-2024',
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
}
```

---

## 📊 API Endpoints Reference

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Lấy danh sách customers |
| GET | `/api/customers/{id}` | Lấy chi tiết customer |
| POST | `/api/customers` | Tạo customer mới |
| PUT | `/api/customers/{id}` | Cập nhật customer |
| DELETE | `/api/customers/{id}` | Xóa customer |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Lấy danh sách projects |
| GET | `/api/projects/{id}` | Lấy chi tiết project |
| POST | `/api/projects` | Tạo project mới |
| PUT | `/api/projects/{id}` | Cập nhật project |
| PUT | `/api/projects/{id}/progress` | Cập nhật tiến độ |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Lấy danh sách tasks |
| POST | `/api/tasks` | Tạo task mới |
| PUT | `/api/tasks/{id}` | Cập nhật task |
| PUT | `/api/tasks/{id}/complete` | Đánh dấu hoàn thành |

### Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | Lấy danh sách invoices |
| POST | `/api/invoices/{id}/send` | Gửi invoice |
| PUT | `/api/invoices/{id}/paid` | Đánh dấu đã thanh toán |

---

## 🔧 Troubleshooting

### Lỗi kết nối

```typescript
// Kiểm tra connection
const result = await PerfexCRM.testConnection();
if (!result.connected) {
  console.error('Error:', result.message);
  // Kiểm tra:
  // 1. URL Perfex CRM có đúng không
  // 2. API Token có hợp lệ không
  // 3. API có được bật trong Perfex không
}
```

### Lỗi CORS

Nếu gặp lỗi CORS khi gọi từ web:
1. Thêm config CORS trong Perfex CRM (index.php hoặc .htaccess)
2. Hoặc sử dụng proxy từ backend

### Lỗi Authentication

```typescript
// Response 401 Unauthorized
// → Kiểm tra API Token
// → Regenerate token trong Perfex Admin

// Response 403 Forbidden
// → Kiểm tra quyền của Staff account
```

---

## 📅 Changelog

### v1.0.0 (2025-12-30)
- Initial Perfex CRM integration
- Support: Customers, Projects, Tasks, Invoices, Leads, Estimates
- React Hooks for easy usage
- Sync utilities for bidirectional data flow

---

## 📞 Support

Liên hệ team ThietKeResort nếu cần hỗ trợ:
- Email: support@thietkeresort.com
- Phone: 0901234567
