# Hướng dẫn Chi tiết - Tính năng Dự án

## 📋 Tổng quan

Hệ thống Quản lý Dự án đã được nâng cấp toàn diện với:
- **15 dự án mẫu** thực tế với đầy đủ thông tin
- **Hệ thống hướng dẫn** tích hợp trong ứng dụng
- **Giao diện hiện đại** với gradient, card và animation
- **Bộ lọc nâng cao** theo nhiều tiêu chí
- **Thống kê trực quan** về tiến độ, ngân sách, công việc

---

## 🎯 Tính năng Mới

### 1. Dữ liệu Mẫu (Mock Data)

**File:** `data/mock-projects.ts`

Cung cấp 15 dự án mẫu bao gồm:

#### Loại dự án:
- **Nhà ở (Residential):** 3 dự án
  - Biệt thự Vinhomes Central Park (8.5 tỷ VND)
  - Nhà phố 4 tầng Gò Vấp (4.5 tỷ VND)
  - Khu biệt thự Bella Vista (280 tỷ VND)

- **Thương mại (Commercial):** 4 dự án
  - Trung tâm thương mại Pearl Plaza (125 tỷ VND)
  - Khách sạn Seaside Resort (185 tỷ VND)
  - Showroom Xe Luxury Motors (18 tỷ VND)
  - Nhà máy sản xuất GreenTech (42 tỷ VND)

- **Cảnh quan (Landscape):** 2 dự án
  - Công viên Thảo Điền (28 tỷ VND)
  - Sân vườn Biệt thự Riviera (1.2 tỷ VND)

- **Nội thất (Interior):** 4 dự án
  - Văn phòng Tech Startup Hub (3.2 tỷ VND)
  - Nhà hàng The Garden Kitchen (2.5 tỷ VND)
  - Penthouse Vinhomes Golden River (6.8 tỷ VND)
  - Quán Cà phê Moonlight Corner (980 triệu VND)

- **Cải tạo (Renovation):** 2 dự án
  - Căn hộ Masteri Thảo Điền (1.8 tỷ VND)
  - Nhà cổ Phố Cổ Hà Nội (3.8 tỷ VND)

#### Trạng thái:
- **Đang thực hiện (Active):** 8 dự án
- **Hoàn thành (Completed):** 4 dự án
- **Lên kế hoạch (Planning):** 2 dự án
- **Tạm dừng (Paused):** 1 dự án

#### Thông tin đầy đủ:
- Tên, mô tả chi tiết
- Loại, trạng thái, tiến độ %
- Vị trí địa lý
- Ngân sách
- Thông tin khách hàng (tên, SĐT, email)
- Đội ngũ thực hiện (2-8 người)
- Ngày bắt đầu/kết thúc
- Hình ảnh minh họa
- Tài liệu đính kèm
- Ngày tạo/cập nhật

### 2. Hệ thống Hướng dẫn

#### a) ProjectGuide Component

**File:** `components/projects/ProjectGuide.tsx`

Modal toàn màn hình với 6 phần hướng dẫn:

1. **Bắt đầu với Dự án**
   - Tạo dự án mới
   - Chọn loại phù hợp
   - Thêm thành viên
   - Đặt mốc thời gian

2. **Quản lý Tiến độ**
   - Tạo công việc
   - Cập nhật tiến độ
   - Theo dõi cảnh báo
   - Timeline dự án

3. **Quản lý Ngân sách**
   - Thiết lập ngân sách
   - Ghi nhận chi tiêu
   - Theo dõi chi tiêu
   - Báo cáo tài chính

4. **Tài liệu & Hình ảnh**
   - Upload tài liệu
   - Thư viện hình ảnh
   - Phân loại
   - Chia sẻ an toàn

5. **Giao tiếp & Báo cáo**
   - Nhóm chat
   - Thông báo quan trọng
   - Báo cáo tiến độ
   - Họp online

6. **Mẹo Nâng cao**
   - Sao chép dự án
   - Lưu trữ
   - Bộ lọc thông minh
   - Xuất dữ liệu
   - Dự án ưu tiên
   - Dashboard tùy chỉnh

**Tính năng:**
- Accordion mở/đóng từng phần
- Icon gradient cho mỗi phần
- Nút hành động trực tiếp
- Card mẹo nhanh
- Card hỗ trợ với hotline/email

#### b) QuickGuideCard Component

**File:** `components/projects/QuickGuideCard.tsx`

Card hướng dẫn nhanh hiển thị trên màn hình chính khi:
- Chưa có dự án nào
- Danh sách rỗng sau lọc

**Tính năng:**
- Gradient background với decorative circles
- Icon bulb nổi bật
- 2 nút hành động:
  - "Tạo dự án" → Chuyển đến màn hình tạo
  - "Hướng dẫn" → Mở modal guide
- 3 chip tính năng chính

### 3. Cải tiến Giao diện

#### a) Header Gradient
- LinearGradient #667eea → #764ba2
- Hiển thị số lượng dự án
- Nút tạo mới với gradient
- Thanh tìm kiếm hiện đại
- Bộ lọc compact

#### b) Stats Cards
3 card thống kê với gradient:
- **Ngân sách:** Tỷ lệ % đã chi/tổng
- **Công việc:** Tỷ lệ % hoàn thành
- **Tiến độ TB:** Trung bình tiến độ các dự án

#### c) Payment & Progress Section
2 card tổng quan:
- **Thanh toán:** Tổng/đã chi/còn lại + progress bar
- **Tiến độ chung:** Top 3 dự án với progress bar

#### d) Project Cards
Card dự án được thiết kế lại với:
- Gradient status indicator ở đầu card
- Status badge hiện đại với dot
- Meta cards grid (loại, khách, ngân sách)
- Progress section với gradient fill
- Footer với ngày tháng và action buttons
- Stats grid mini (ngân sách %, công việc, thành viên, tài liệu)

#### e) Active Filters Chips
- Hiển thị filters đang áp dụng
- Gradient background cho mỗi chip
- Nút X để xóa nhanh
- Scroll ngang nếu nhiều filters

#### f) Floating Help Button
- Button tròn gradient màu cam
- Icon help-circle
- Position cố định góc dưới phải
- Shadow hiệu ứng nổi
- Chỉ hiện khi có dự án

### 4. Bộ lọc Nâng cao

**Filters có sẵn:**
- Trạng thái: All / Của tôi / Active / Completed / Planning / Paused
- Loại: All / Residential / Commercial / Landscape / Interior / Renovation
- Sắp xếp: Newest / Budget / Progress
- Ngân sách: Min-Max (VND)
- Ngày tháng: From-To (YYYY-MM-DD)

**Lưu trữ:**
- Tất cả filters được lưu vào SecureStore
- Tự động khôi phục khi mở lại app
- Debounce search 300ms

### 5. Tích hợp Mock/API

**Logic thông minh:**
```typescript
// Tự động sử dụng mock data nếu:
// 1. User bật useMockData
// 2. API trả về empty và không đang loading
const projects = useMemo(() => {
  if (useMockData || (apiProjects.length === 0 && !loading)) {
    return MOCK_PROJECTS;
  }
  return apiProjects;
}, [apiProjects, loading, useMockData]);
```

---

## 🚀 Sử dụng

### Xem Dự án Mẫu

Mặc định hệ thống sẽ hiển thị 15 dự án mẫu nếu API chưa có dữ liệu.

### Mở Hướng dẫn

**Cách 1:** Nhấn nút "Hướng dẫn" trên QuickGuideCard (khi chưa có dự án)

**Cách 2:** Nhấn nút help (?) floating ở góc dưới phải (khi đã có dự án)

**Cách 3:** Từ code:
```typescript
setShowGuide(true);
```

### Tạo Dự án Mới

1. Nhấn nút "+" ở header
2. Hoặc nhấn "Tạo dự án" trên QuickGuideCard
3. Hoặc nhấn "Tạo ngay" trong phần hướng dẫn "Bắt đầu với Dự án"

### Lọc Dự án

1. Nhấn nút "Bộ lọc" ở header
2. Chọn Trạng thái / Loại / Sắp xếp
3. Nhấn "Áp dụng"
4. Xóa nhanh bằng cách nhấn X trên chip filter hoặc "Xóa lọc"

### Tìm kiếm

Gõ từ khóa vào thanh search. Hệ thống tìm trong:
- Tên dự án
- Mô tả
- Địa điểm
- Tên khách hàng

---

## 📁 Cấu trúc File

```
data/
  mock-projects.ts                    # 15 dự án mẫu + helper functions

components/projects/
  ProjectGuide.tsx                    # Modal hướng dẫn đầy đủ
  QuickGuideCard.tsx                  # Card hướng dẫn nhanh
  quick-actions.tsx                   # Menu quick actions (đã có)
  top-plus-menu.tsx                   # Menu tạo mới (đã có)

features/projects/
  ProjectsScreen.tsx                  # Màn hình chính (đã cập nhật)

hooks/
  useProjects.ts                      # Hook fetch projects (đã có)
```

---

## 🎨 Màu sắc & Gradient

### Gradients chính:
- **Purple:** `#667eea → #764ba2` (Header, Stats, Guide sections)
- **Green:** `#11998e → #38ef7d` (Stats, Guide sections)
- **Pink:** `#f093fb → #f5576c` (Stats, Guide sections)
- **Orange:** `#FF6B35 → #F7931E` (Intro banner, Help button, Filters)
- **Blue:** `#3b82f6 → #2563eb` (Filter chips)
- **Red-Orange:** `#fa709a → #fee140` (Guide sections)

### Status Colors:
- **Active:** `#007AFF` (Blue)
- **Completed:** `#34C759` (Green)
- **Planning:** `#FF9500` (Orange)
- **Paused:** `#FF3B30` (Red)

---

## 💡 Mẹo Phát triển

### Thêm Dự án Mẫu Mới

1. Mở `data/mock-projects.ts`
2. Thêm object vào `MOCK_PROJECTS` array
3. Đảm bảo có đủ các field bắt buộc:
   ```typescript
   {
     id: 'proj_XXX',
     name: 'Tên dự án',
     type: 'residential' | 'commercial' | 'landscape' | 'interior' | 'renovation',
     status: 'planning' | 'active' | 'paused' | 'completed',
     progress: 0-100,
     // ... các field khác
   }
   ```

### Thêm Phần Hướng dẫn Mới

1. Mở `components/projects/ProjectGuide.tsx`
2. Thêm object vào `GUIDE_SECTIONS`:
   ```typescript
   {
     title: 'Tiêu đề phần',
     icon: 'ionicon-name',
     color: ['#color1', '#color2'],
     steps: [
       {
         icon: 'step-icon',
         title: 'Tiêu đề bước',
         description: 'Mô tả chi tiết',
         action: () => { /* function */ },
         actionLabel: 'Nhãn nút',
       },
     ],
   }
   ```

### Tùy chỉnh QuickGuideCard

File: `components/projects/QuickGuideCard.tsx`

- Thay đổi gradient colors
- Sửa text, icon
- Thêm/bớt tip chips
- Điều chỉnh decorative circles

---

## 🐛 Xử lý Lỗi

### Dự án không hiển thị
- Kiểm tra `useMockData` state
- Verify API endpoint trả về đúng format
- Check console errors

### Hướng dẫn không mở
- Verify `showGuide` state
- Check modal props `visible` và `onClose`

### Filter không hoạt động
- Kiểm tra localStorage/SecureStore permissions
- Verify filter logic trong `displayedProjects` useMemo

---

## 📊 Thống kê Mock Data

- **Tổng dự án:** 15
- **Tổng ngân sách:** 710+ tỷ VND
- **Tiến độ trung bình:** ~58%
- **Số lượng theo loại:**
  - Residential: 3
  - Commercial: 4
  - Landscape: 2
  - Interior: 4
  - Renovation: 2
- **Số lượng theo trạng thái:**
  - Active: 8
  - Completed: 4
  - Planning: 2
  - Paused: 1

---

## 🔄 Tương lai

### Tính năng có thể thêm:
- [ ] Export dự án ra PDF/Excel
- [ ] Import dự án từ file
- [ ] Template dự án
- [ ] Sao chép dự án
- [ ] Lưu trữ/Khôi phục dự án
- [ ] Đánh dấu sao dự án ưu tiên
- [ ] Dashboard tùy chỉnh
- [ ] Video hướng dẫn tích hợp
- [ ] Chatbot AI hỗ trợ
- [ ] Gamification (badges, achievements)

---

## 📞 Hỗ trợ

Nếu cần hỗ trợ:
- Email: support@app.vn
- Hotline: 1900-xxxx
- Trong app: Mở ProjectGuide → Card "Cần hỗ trợ thêm?"

---

**Ngày cập nhật:** 2025-01-20
**Phiên bản:** 2.0.0
**Tác giả:** Development Team
