# Tính năng Quản lý Tiến độ Thi công

## Tổng quan
Chức năng quản lý tiến độ thi công biệt thự với giao diện Kanban board trực quan, cho phép theo dõi và cập nhật trạng thái các hạng mục xây dựng theo thời gian thực.

## Tính năng chính

### 1. **Kanban Board - Bảng quản lý kéo thả**
- ✅ 4 giai đoạn mặc định: Khởi đầu → Kết cấu → Hoàn thiện → Bàn giao
- ✅ Kéo thả card giữa các cột để thay đổi giai đoạn
- ✅ Hiển thị tiến độ % cho từng giai đoạn
- ✅ Đếm số lượng task trong mỗi cột

### 2. **Quản lý Task (Hạng mục)**
- ✅ Thêm hạng mục mới với tên, giai đoạn, ghi chú
- ✅ Cập nhật trạng thái: Chưa bắt đầu, Đang thực hiện, Hoàn thành, Trễ tiến độ
- ✅ Chỉnh sửa chi tiết và ghi chú cho từng hạng mục
- ✅ Xóa hạng mục không cần thiết
- ✅ Chuyển task giữa các giai đoạn

### 3. **Theo dõi Tiến độ**
- ✅ Tính toán tự động % hoàn thành tổng thể
- ✅ Progress bar màu sắc theo mức độ: Đỏ (<40%), Vàng (40-80%), Xanh (>80%)
- ✅ Thống kê số task hoàn thành / tổng số
- ✅ Hiển thị card tóm tắt trên trang chủ

### 4. **Lưu trữ & Đồng bộ**
- ✅ Lưu tự động vào AsyncStorage
- ✅ Dữ liệu được giữ nguyên khi tắt app
- ✅ Pull-to-refresh để cập nhật dữ liệu

## Cấu trúc File

```
app/
  └── construction-progress.tsx          # Màn hình chính

components/ui/
  └── construction-progress-card.tsx     # Card hiển thị trên trang chủ

hooks/
  └── useConstructionProgress.ts         # Hook quản lý state và logic
```

## Cách sử dụng

### 1. Truy cập từ Trang chủ
- Chạm vào card "Tiến độ thi công biệt thự" trên trang chủ
- Hoặc điều hướng trực tiếp: `router.push('/construction-progress')`

### 2. Thêm Hạng mục mới
1. Chạm nút **+** (FAB) ở góc dưới bên phải
2. Nhập tên hạng mục (VD: "Thi công trần thạch cao")
3. Chọn giai đoạn (01 - Khởi đầu, 02 - Kết cấu, v.v.)
4. Thêm ghi chú (không bắt buộc)
5. Chạm **Thêm hạng mục**

### 3. Cập nhật Trạng thái
1. Chạm vào card task bất kỳ
2. Trong modal chi tiết, chọn trạng thái mới:
   - 🔘 Chưa bắt đầu (0%)
   - 🟡 Đang thực hiện (50%)
   - 🟢 Hoàn thành (100%)
   - 🔴 Trễ tiến độ (30%)

### 4. Chuyển Giai đoạn
- **Cách 1**: Kéo card sang cột giai đoạn khác
- **Cách 2**: Mở chi tiết task → chọn giai đoạn mới

### 5. Xóa Hạng mục
1. Chạm vào task cần xóa
2. Cuộn xuống dưới modal
3. Chạm **Xóa hạng mục** (màu đỏ)
4. Xác nhận xóa

## Tích hợp với Trang chủ

### Import Hook
```typescript
import { useConstructionProgress } from '@/hooks/useConstructionProgress';

// Trong component
const { progress, totalTasks, completedTasks, refresh } = useConstructionProgress();
```

### Sử dụng Card Component
```typescript
import { ConstructionProgressCard } from '@/components/ui/construction-progress-card';

<ConstructionProgressCard 
  projectName="Tiến độ thi công biệt thự"
  progress={progress}          // 0-100
  totalTasks={totalTasks}      // Số nguyên
  completedTasks={completedTasks}
/>
```

## Công thức Tính toán Tiến độ

### Tiến độ từng Task
```typescript
const statusProgressMap = {
  pending: 0,        // Chưa bắt đầu
  in_progress: 0.5,  // Đang làm
  done: 1,           // Hoàn thành
  late: 0.3,         // Trễ tiến độ
};
```

### Tiến độ Giai đoạn
```
stageProgress = SUM(task.progress) / số_task_trong_giai_đoạn
```

### Tiến độ Tổng thể
```
projectProgress = SUM(stageProgress) / số_giai_đoạn
```

## Dữ liệu Mặc định

### Giai đoạn (Stages)
1. **S1** - 01 - Khởi đầu
2. **S2** - 02 - Kết cấu
3. **S3** - 03 - Hoàn thiện
4. **S4** - 04 - Bàn giao

### Hạng mục Mẫu (Tasks)
1. Chuẩn bị mặt bằng (Hoàn thành)
2. Đào móng – ép cọc (Đang thực hiện)
3. Đổ sàn tầng 1 (Đang thực hiện)
4. Đổ sàn mái (Chưa bắt đầu)
5. Xây tường – tô trát (Chưa bắt đầu)
6. MEP, trần thạch cao (Chưa bắt đầu)
7. Hoàn thiện nội thất (Chưa bắt đầu)
8. Vệ sinh & bàn giao (Chưa bắt đầu)

## Storage Schema

```typescript
// Key: "villa_progress_state_v1"
interface StorageData {
  tasks: Array<{
    id: string;           // "T1", "T2", ...
    stageId: string;      // "S1", "S2", "S3", "S4"
    label: string;        // Tên hạng mục
    status: 'pending' | 'in_progress' | 'done' | 'late';
    notes: string;        // Ghi chú
  }>;
}
```

## UI/UX Highlights

### Màu sắc Trạng thái
- **Chưa bắt đầu**: Xám (#9e9e9e / #f0f0f0)
- **Đang thực hiện**: Vàng (#ffb300 / #fff8e1)
- **Hoàn thành**: Xanh lá (#4caf50 / #e8f5e9)
- **Trễ tiến độ**: Đỏ (#e53935 / #ffebee)

### Responsive Design
- ✅ Board cuộn ngang trên mobile
- ✅ Mỗi cột có độ rộng cố định 240px
- ✅ Task list cuộn dọc với max height
- ✅ Modal bottom sheet cho mobile UX

### Animations
- Smooth scroll khi chuyển giai đoạn
- Fade in/out cho modal
- Spring animation cho FAB button
- Progress bar fill animation

## Roadmap Tương lai

### Phase 2 - Nâng cao
- [ ] Thêm ngày bắt đầu / kết thúc cho task
- [ ] Timeline view (Gantt chart)
- [ ] Upload ảnh tiến độ thi công
- [ ] Assign task cho nhân viên
- [ ] Push notification nhắc việc
- [ ] Export báo cáo PDF

### Phase 3 - Collaboration
- [ ] Real-time sync với backend
- [ ] Multi-user collaboration
- [ ] Comment & discussion threads
- [ ] File attachments
- [ ] Activity log / History

## Troubleshooting

### Dữ liệu không lưu?
```typescript
// Kiểm tra AsyncStorage permission
import AsyncStorage from '@react-native-async-storage/async-storage';

// Test write
await AsyncStorage.setItem('test', 'value');
const result = await AsyncStorage.getItem('test');
console.log(result); // Should be 'value'
```

### Progress không cập nhật trên Home?
```typescript
// Đảm bảo gọi refresh sau khi update
const { refresh } = useConstructionProgress();

// Trong onRefresh
await Promise.all([refresh(), otherRefreshes()]);
```

### Card không hiển thị trên Home?
```typescript
// Kiểm tra import
import { ConstructionProgressCard } from '@/components/ui/construction-progress-card';
// hoặc
import { ConstructionProgressCard } from '@/components/ui';
```

## API Reference

### useConstructionProgress()
```typescript
interface UseConstructionProgressReturn {
  tasks: Task[];              // Danh sách tất cả tasks
  loading: boolean;           // Đang load từ storage
  totalTasks: number;         // Tổng số task
  completedTasks: number;     // Số task hoàn thành
  progress: number;           // % tiến độ (0-100)
  refresh: () => Promise<void>; // Refresh data
}
```

### ConstructionProgressCard Props
```typescript
interface ConstructionProgressCardProps {
  projectName?: string;    // Tên dự án
  progress?: number;       // % tiến độ (0-100)
  totalTasks?: number;     // Tổng số task
  completedTasks?: number; // Số task hoàn thành
}
```

## Best Practices

1. **Cập nhật thường xuyên**: Cập nhật trạng thái task hàng ngày để tiến độ chính xác
2. **Ghi chú chi tiết**: Thêm ghi chú cho task để team hiểu rõ yêu cầu
3. **Phân chia hợp lý**: Chia nhỏ task lớn thành nhiều task con
4. **Review định kỳ**: Review tiến độ mỗi tuần để điều chỉnh kế hoạch
5. **Backup dữ liệu**: Export/import data khi cần thiết

---

**Phiên bản**: 1.0.0  
**Ngày tạo**: 10/12/2025  
**Tác giả**: Development Team  
**License**: Proprietary
