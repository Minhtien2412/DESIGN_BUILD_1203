# Workflow Map Component - Sơ đồ tiến độ dự án dạng tàu điện ngầm

## ✅ Đã hoàn thành

### 🎨 Component chính: `components/projects/workflow-map.tsx`

#### **WorkflowMap Component**
- **Hai chế độ hiển thị**:
  - `horizontal`: Sơ đồ ngang (giống metro map bạn gửi)
  - `vertical`: Sơ đồ dọc (timeline dọc)

#### **Workflow Phase Type**:
```typescript
type WorkflowPhase = {
  id: string;
  name: string;  // Tên giai đoạn
  status: 'completed' | 'active' | 'pending' | 'blocked';
  progress: number; // 0-100
  startDate?: string;
  endDate?: string;
  tasks?: number;
  completedTasks?: number;
}
```

---

## 🎯 Tính năng chính

### 1️⃣ **Horizontal Metro Map** (Sơ đồ ngang)

#### Station Node (Trạm):
- **Vòng tròn lớn** (56x56px) với icon trạng thái:
  - ✅ Hoàn thành: checkmark-circle (xanh lá)
  - 🔵 Đang thực hiện: radio-button-on (xanh dương)
  - ⚪ Chưa bắt đầu: radio-button-off-outline (xám)
  - ❌ Bị chặn: close-circle (đỏ)
- **Badge số thứ tự** góc phải trên (01, 02, 03...)
- **Tên giai đoạn** bên dưới (font 14px, bold khi active)

#### Progress Bar:
- Thanh tiến độ 6px height
- Hiển thị % bên cạnh
- Màu theo status (xanh lá, xanh dương, xám)

#### Task Count:
- Icon list + số công việc: "10/15 công việc"

#### Timeline:
- Icon time + ngày bắt đầu - kết thúc: "01/01 - 15/02"

#### Connection Line (Đường nối):
- Đường ngang 4px height
- Mũi tên tam giác
- Màu xanh nếu completed, xám nếu pending

#### Legend (Chú thích):
- 3 dot màu + text: "Hoàn thành", "Đang thực hiện", "Chưa bắt đầu"

---

### 2️⃣ **Vertical Timeline** (Sơ đồ dọc)

#### Timeline Column:
- Vòng tròn 48x48px bên trái
- Đường dọc 3px nối các vòng tròn
- Màu theo status

#### Content Card:
- Card trắng với border trái 3px màu xanh
- "Giai đoạn 01" label nhỏ trên cùng
- Tên giai đoạn lớn (font 16px bold)
- Progress bar ngang
- Meta: Tasks count + Date

---

## 🏗️ Integration trong Project Detail

### File: `app/projects/[id].tsx`

#### Toggle Button:
- 2 nút chuyển đổi: Horizontal ↔ Vertical
- Icon swap-horizontal và swap-vertical
- Active button màu xanh (#90b44c)

#### Workflow Section:
```tsx
<WorkflowMap 
  phases={MOCK_WORKFLOW} 
  orientation={workflowOrientation} 
/>
```

#### Mock Data:
6 giai đoạn thi công:
1. Khảo sát & Thiết kế (Hoàn thành 100%)
2. Chuẩn bị mặt bằng (Hoàn thành 100%)
3. Đổ móng & Kết cấu (Đang thực hiện 65%)
4. Xây tường & Trát (Chưa bắt đầu)
5. Lắp đặt điện nước (Chưa bắt đầu)
6. Hoàn thiện & Bàn giao (Chưa bắt đầu)

---

## 📱 UI Design

### Colors:
- **Completed**: #4CAF50 (xanh lá) - bg: #E8F5E9
- **Active**: #2196F3 (xanh dương) - bg: #E3F2FD
- **Pending**: #9E9E9E (xám) - bg: #F5F5F5
- **Blocked**: #F44336 (đỏ) - bg: #FFEBEE

### Fonts:
- Station name: 14px, bold 600
- Active name: bold 700, màu #2196F3
- Progress text: 11px, bold 700
- Tasks/timeline: 10-11px regular

### Spacing:
- Station circle: 56x56px (horizontal), 48x48px (vertical)
- Min station width: 140px, max: 160px
- Connection line: 40px width, 4px height
- Arrow: 10px border-left

### Scroll:
- Horizontal scroll khi nhiều giai đoạn
- showsHorizontalScrollIndicator={false}

---

## 🚀 Cách sử dụng

### 1. Import:
```tsx
import WorkflowMap, { WorkflowPhase } from '@/components/projects/workflow-map';
```

### 2. Define phases:
```tsx
const phases: WorkflowPhase[] = [
  {
    id: '1',
    name: 'Khảo sát & Thiết kế',
    status: 'completed',
    progress: 100,
    startDate: '2024-01-01',
    endDate: '2024-02-15',
    tasks: 12,
    completedTasks: 12,
  },
  // ... more phases
];
```

### 3. Render:
```tsx
<WorkflowMap phases={phases} orientation="horizontal" />
```

---

## 🎨 So sánh với hình bạn gửi

| Yêu cầu | Đã thực hiện |
|---------|--------------|
| Vòng tròn trạm với số | ✅ 56px circle + badge số |
| Đường nối có màu sắc | ✅ Line + arrow, màu theo status |
| Hiển thị tiến độ | ✅ Progress bar + % |
| Nhiều giai đoạn ngang | ✅ Scroll horizontal |
| Tên giai đoạn rõ ràng | ✅ Font 14px, bold active |
| Trạng thái màu sắc | ✅ 4 màu: completed, active, pending, blocked |
| Icon đại diện | ✅ Ionicons cho từng status |

---

## 🔧 TODO - Tích hợp backend

### Cần thêm vào Project API:
```typescript
interface Project {
  // ... existing fields
  workflow_phases?: WorkflowPhase[]; // ← ADD THIS
}
```

### Backend route:
```
GET /api/projects/:id/workflow
Response: { phases: WorkflowPhase[] }
```

### Hook update:
```tsx
// In useProjects.ts
export function useProjectWorkflow(projectId: string) {
  const [phases, setPhases] = useState<WorkflowPhase[]>([]);
  // ... fetch from API
}
```

---

## 📸 Screenshot highlights

### Horizontal mode:
- Trạm nối nhau theo chiều ngang
- Scroll được khi nhiều giai đoạn
- Progress bar bên dưới mỗi trạm
- Legend ở cuối

### Vertical mode:
- Timeline dọc bên trái
- Card content bên phải
- Phù hợp với màn hình hẹp
- Dễ đọc thông tin chi tiết

---

## ✨ Bonus features

### Animation suggestions (future):
- Fade in khi mount
- Progress bar animated fill
- Active station pulse effect
- Arrow sliding animation

### Interactive (future):
- Tap station → Show phase detail modal
- Swipe horizontal → Next/prev phase
- Long press → Quick actions menu

---

## 🎯 Kết luận

✅ Component workflow map hoàn chỉnh  
✅ 2 chế độ hiển thị flexible  
✅ Tích hợp vào project detail  
✅ UI giống metro map như yêu cầu  
✅ Ready cho dữ liệu thật từ backend  

Component này giúp người dùng **nhìn ngay** được tiến độ dự án theo từng giai đoạn, giống như đi trên tuyến tàu điện ngầm - biết mình đang ở đâu, đã qua đâu, còn phải đi đâu! 🚇
