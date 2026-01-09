# Báo Cáo Đồng Bộ Dữ Liệu Perfex CRM

## Ngày cập nhật: 2025-01-07 (Lần 2)

## 1. Thông Tin Kết Nối API

```
Base URL: https://thietkeresort.com.vn/perfex_crm
API Endpoint: /api
JWT Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## 2. Dữ Liệu Thực Từ CRM

### 2.1 Customers (4 khách hàng)

| ID | Tên công ty | SĐT | Thành phố | Website |
|----|-------------|-----|-----------|---------|
| 1 | Anh Khương Q9 | 0359777108 | Hồ Chí Minh | baotienweb.cloud |
| 2 | NHÀ XINH | 0909452109 | - | nhaxinhdesign.com |
| 3 | Anh Tiến | 0342385280 | Tỉnh Bình Phước | - |
| 4 | Lê Nguyên Thảo | 0934098308 | Hồ Chí Minh | - |

### 2.2 Projects (2 dự án)

| ID | Tên dự án | Khách hàng | Giá trị | Trạng thái |
|----|-----------|------------|---------|------------|
| 1 | Nhà Anh Khương Quận 9 | Anh Khương Q9 | 15,000,000,000 VND | Chưa bắt đầu (1) |
| 2 | Biệt Thự 3 Tầng Anh Tiến Quận 7 | Anh Tiến | 10,000,000,000 VND | Đang tiến hành (2) |

### 2.3 Invoices (1 hóa đơn)

| ID | Số HĐ | Khách hàng | Tổng tiền | Trạng thái |
|----|-------|------------|-----------|------------|
| 1 | INV-000001 | Lê Nguyên Thảo | 305,000,000 VND | Chưa thanh toán (2) |

### 2.4 Contracts (1 hợp đồng) ✅ MỚI

| ID | Loại | Khách hàng | Giá trị | Ngày bắt đầu | Ngày kết thúc | Ký tên |
|----|------|------------|---------|--------------|---------------|--------|
| 1 | Ép cọc móng băng | Anh Khương Q9 | 550,000,000 VND | 2026-01-09 | 2026-01-24 | Chưa ký |

**Mô tả**: Công ty Phước Mạnh Hải - Ép cọc

### 2.5 Expenses (2 chi phí) ✅ MỚI

| ID | Loại chi phí | Khách hàng | Số tiền | Dự án | Ngày |
|----|--------------|------------|---------|-------|------|
| 1 | Tiền Nhà Lam Sơn | Anh Khương Q9 | 65,456,741 VND | Nhà Anh Khương Q9 | 2026-01-03 |
| 2 | Sắt Thép | Lê Nguyên Thảo | 305,000,000 VND | - | 2026-01-04 |

**Tổng chi phí**: 370,456,741 VND

### 2.6 API Endpoints Status (Cập nhật 2025-01-07)

| Endpoint | Status | Records | Ghi chú |
|----------|--------|---------|---------|
| `/api/customers` | ✅ 200 OK | 4 | Hoạt động tốt |
| `/api/projects` | ✅ 200 OK | 2 | Hoạt động tốt |
| `/api/invoices` | ✅ 200 OK | 1 | Hoạt động tốt |
| `/api/contracts` | ✅ 200 OK | 1 | **MỚI** - Hoạt động |
| `/api/expenses` | ✅ 200 OK | 2 | **MỚI** - Hoạt động |
| `/api/leads` | ❌ 404 | - | Không khả dụng |
| `/api/tasks` | ❌ 404 | - | Không khả dụng |
| `/api/staff` | ❌ 404 | - | Không khả dụng |
| `/api/tickets` | ❌ 404 | - | Không khả dụng |
| `/api/estimates` | ❌ 404 | - | Không khả dụng |

## 3. Files Đã Cập Nhật Mock Data

### 3.1 Services

| File | Thay đổi |
|------|----------|
| `services/perfexSync.ts` | Cập nhật MOCK_CUSTOMERS (4 KH), MOCK_PROJECTS (2 DA) |
| `hooks/useCRMInvoices.ts` | Cập nhật MOCK_INVOICES với dữ liệu thực |
| `hooks/useCRMLeads.ts` | Cập nhật MOCK_LEADS với context kinh doanh thực |
| `hooks/useCRMTasks.ts` | Cập nhật MOCK_TASKS với tasks liên quan dự án thực |

### 3.2 CRM Screens (Cập nhật 2025-01-07)

| Screen | Thay đổi |
|--------|----------|
| `app/crm/staff.tsx` | ✅ Mock staff với tên KH thực (Nhà Xinh, Lê Nguyên Thảo, Anh Khương, Anh Tiến) |
| `app/crm/contracts.tsx` | ✅ **MỚI** - Hợp đồng thực (Ép cọc móng băng - 550 triệu VND) |
| `app/crm/sales.tsx` | ✅ Invoices với INV-000001 thực |
| `app/crm/reports.tsx` | ✅ Statistics với tổng giá trị 25 tỷ |
| `app/crm/tickets.tsx` | ✅ Tickets liên quan dự án thực |
| `app/crm/discussions.tsx` | ✅ Discussions với context KH thực |
| `app/crm/files.tsx` | ✅ Files với tên file dự án thực |
| `app/crm/notes.tsx` | ✅ Notes với yêu cầu KH thực |
| `app/crm/activity.tsx` | ✅ Activity log với actions thực |
| `app/crm/mind-map.tsx` | ✅ Mind-map với cấu trúc dự án thực |
| `app/crm/expenses.tsx` | ✅ Sử dụng API hook - tự động lấy dữ liệu thực |
| `app/crm/invoices.tsx` | ✅ Sử dụng API hook - tự động lấy dữ liệu thực |

## 4. Cấu Trúc Dữ Liệu

### Customer Interface
```typescript
interface Customer {
  userid: string;
  company: string;
  phonenumber: string;
  city: string;
  address: string;
  website: string;
  datecreated: string;
  active: string; // '1' = active
}
```

### Project Interface
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: string; // '1'=Chưa bắt đầu, '2'=Đang tiến hành, '4'=Hoàn thành
  clientid: string;
  start_date: string;
  deadline: string | null;
  progress: string;
  project_cost: string;
  company: string;
  phonenumber: string;
  city: string;
}
```

### Invoice Interface
```typescript
interface Invoice {
  id: string;
  prefix: string;
  number: string;
  clientid: string;
  date: string;
  duedate: string;
  subtotal: string;
  total_tax: string;
  total: string;
  status: string; // '1'=Đã thanh toán, '2'=Chưa thanh toán
  currency: { symbol: string; name: string; };
}
```

## 5. Status Code Mapping

### Project Status
| Code | Tên |
|------|-----|
| 1 | Chưa bắt đầu |
| 2 | Đang tiến hành |
| 3 | Tạm dừng |
| 4 | Hoàn thành |
| 5 | Đã hủy |

### Invoice Status
| Code | Tên |
|------|-----|
| 1 | Đã thanh toán |
| 2 | Chưa thanh toán |
| 6 | Quá hạn |

## 6. Tổng Giá Trị Dự Án & Tài Chính

### Doanh thu tiềm năng
- **Tổng giá trị dự án**: 25,000,000,000 VND (25 tỷ)
  - Nhà Anh Khương Q9: 15 tỷ
  - Biệt Thự Anh Tiến Q7: 10 tỷ

### Hợp đồng
- **Tổng giá trị hợp đồng**: 550,000,000 VND (550 triệu)
  - Ép cọc móng băng (Anh Khương Q9): 550 triệu

### Hóa đơn
- **Hóa đơn đã xuất**: 305,000,000 VND
- **Đã thu**: 0 VND (Invoice status: unpaid)

### Chi phí
- **Tổng chi phí**: 370,456,741 VND
  - Tiền Nhà Lam Sơn (Project 1): 65,456,741 VND
  - Sắt Thép (Công trình Q7): 305,000,000 VND

## 7. Khuyến Nghị

1. **Kích hoạt API còn lại**: Liên hệ admin CRM để bật các endpoint:
   - `/api/staff` - Quản lý nhân viên
   - `/api/tasks` - Quản lý công việc
   - `/api/leads` - Quản lý khách hàng tiềm năng
   - `/api/tickets` - Hỗ trợ khách hàng
   - `/api/estimates` - Báo giá

2. **Cập nhật Invoice Status**: Sau khi KH thanh toán, cập nhật status invoice

3. **Ký hợp đồng**: Hợp đồng "Ép cọc móng băng" chưa được ký (signed=0)

4. **Định kỳ đồng bộ**: App đã cấu hình auto-sync mỗi 5 phút

---

*Tài liệu được tạo tự động từ dữ liệu Perfex CRM API*
*Cập nhật lần cuối: 2025-01-07*
