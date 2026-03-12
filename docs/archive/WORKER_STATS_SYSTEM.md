# Worker Statistics System Documentation

## Tổng quan
Hệ thống hiển thị **số lượng thợ thực tế** đã đăng ký công việc theo từng loại nghề và địa điểm làm việc trên màn hình Home.

---

## Kiến trúc

### 1. **Types** (`types/worker-stats.ts`)
```typescript
enum WorkerType {
  // Construction (8 types)
  EP_COC, DAO_DAT, VAT_LIEU, NHAN_CONG,
  THO_XAY, THO_COFFA, THO_DIEN_NUOC, BE_TONG,
  
  // Finishing (8 types)
  THO_LAT_GACH, THO_THACH_CAO, THO_SON, THO_DA,
  THO_LAM_CUA, THO_LAN_CAN, THO_CONG, THO_CAMERA
}

interface WorkerLocationStats {
  location: string;      // "Sài Gòn", "Hà Nội", etc.
  count: number;         // Số lượng thợ
  status: 'available' | 'almost-done' | 'busy';
}
```

### 2. **Service** (`services/worker-stats.ts`)
- **`getWorkerStats()`**: Fetch số liệu từ API
- **`registerWorker()`**: Đăng ký thợ mới
- **`getMockWorkerStats()`**: Dữ liệu giả cho development

### 3. **Hook** (`hooks/useWorkerStats.ts`)
```typescript
const { stats, loading, refresh } = useWorkerStats(
  autoRefresh = false,  // Tự động refresh
  intervalMs = 300000   // Mỗi 5 phút
);
```

### 4. **Home Screen Integration** (`app/(tabs)/index.tsx`)
```typescript
// Fetch worker stats
const { stats: workerStats, refresh: refreshWorkerStats } = useWorkerStats(true, 300000);

// Build live utilities with real-time counts
const CONSTRUCTION_UTILITIES_LIVE = useMemo(() => {
  return CONSTRUCTION_UTILITIES.map(util => {
    const workerType = WORKER_TYPE_MAP[util.id];
    const stats = workerStats.stats.find(s => s.workerType === workerType);
    return { ...util, count: stats.locations[0].count };
  });
}, [workerStats]);
```

---

## Luồng dữ liệu

```
1. Worker đăng ký công việc
   ↓
2. Backend lưu vào database với:
   - workerType (EP_COC, THO_XAY, etc.)
   - location (Sài Gòn, Hà Nội, etc.)
   - isAvailable (true/false)
   ↓
3. API endpoint `/api/workers/stats` tổng hợp:
   - Đếm số thợ theo type + location
   - Tính status dựa trên availability
   ↓
4. Home screen fetch mỗi 5 phút
   ↓
5. Hiển thị số liệu realtime
```

---

## Worker Type Mapping

### Construction Utilities (IDs 1-8):
| ID | Tên         | WorkerType      |
|----|-------------|-----------------|
| 1  | Ép cọc      | EP_COC          |
| 2  | Đào đất     | DAO_DAT         |
| 3  | Vật liệu    | VAT_LIEU        |
| 4  | Nhân công   | NHAN_CONG       |
| 5  | Thợ xây     | THO_XAY         |
| 6  | Thợ coffa   | THO_COFFA       |
| 7  | Thợ điện nước | THO_DIEN_NUOC |
| 8  | Bê tông     | BE_TONG         |

### Finishing Utilities (IDs 101-108):
| ID  | Tên              | WorkerType       |
|-----|------------------|------------------|
| 101 | Thợ lát gạch     | THO_LAT_GACH     |
| 102 | Thợ thạch cao    | THO_THACH_CAO    |
| 103 | Thợ sơn          | THO_SON          |
| 104 | Thợ đá           | THO_DA           |
| 105 | Thợ làm cửa      | THO_LAM_CUA      |
| 106 | Thợ lan can      | THO_LAN_CAN      |
| 107 | Thợ công         | THO_CONG         |
| 108 | Thợ camera       | THO_CAMERA       |

---

## Status Logic

Backend tính toán status dựa trên **tỷ lệ available**:

```typescript
const availableRatio = availableWorkers / totalWorkers;

if (availableRatio >= 0.7) return 'available';      // ≥70% rảnh
if (availableRatio >= 0.3) return 'almost-done';    // 30-70% rảnh
return 'busy';                                       // <30% rảnh
```

### Status Colors:
- 🟢 **available**: `rgba(16, 185, 129, 0.15)` (green)
- 🟡 **almost-done**: `rgba(245, 158, 11, 0.15)` (amber)
- 🔴 **busy**: `rgba(239, 68, 68, 0.15)` (red)

---

## API Endpoints (Backend TODO)

### GET `/api/workers/stats`
**Response:**
```json
{
  "stats": [
    {
      "workerType": "THO_XAY",
      "totalCount": 50,
      "locations": [
        { "location": "Hà Nội", "count": 28, "status": "available" },
        { "location": "Sài Gòn", "count": 22, "status": "available" }
      ]
    }
  ],
  "lastUpdated": "2025-12-04T10:30:00Z"
}
```

### POST `/api/workers/register`
**Request:**
```json
{
  "workerType": "THO_XAY",
  "location": "Sài Gòn",
  "phoneNumber": "0901234567",
  "fullName": "Nguyễn Văn A",
  "experience": 5
}
```

**Response:**
```json
{
  "id": "worker-123",
  "userId": "user-456",
  "workerType": "THO_XAY",
  "location": "Sài Gòn",
  "isAvailable": true,
  "createdAt": "2025-12-04T10:35:00Z"
}
```

---

## Database Schema (Prisma)

```prisma
model WorkerRegistration {
  id           String      @id @default(cuid())
  userId       String
  workerType   WorkerType
  location     String
  phoneNumber  String
  fullName     String
  experience   Int         // years
  isAvailable  Boolean     @default(true)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  
  user         User        @relation(fields: [userId], references: [id])
  
  @@index([workerType, location])
  @@index([isAvailable])
}

enum WorkerType {
  EP_COC
  DAO_DAT
  VAT_LIEU
  NHAN_CONG
  THO_XAY
  THO_COFFA
  THO_DIEN_NUOC
  BE_TONG
  THO_LAT_GACH
  THO_THACH_CAO
  THO_SON
  THO_DA
  THO_LAM_CUA
  THO_LAN_CAN
  THO_CONG
  THO_CAMERA
}
```

---

## Performance Optimizations

### 1. **Client-side Caching**
- Auto-refresh mỗi 5 phút
- Pull-to-refresh manual
- useMemo để tránh re-compute

### 2. **Backend Caching**
```typescript
// Cache trong Redis 5 phút
const CACHE_KEY = 'worker-stats';
const CACHE_TTL = 300; // seconds

async function getWorkerStats() {
  const cached = await redis.get(CACHE_KEY);
  if (cached) return JSON.parse(cached);
  
  const stats = await computeStats();
  await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(stats));
  return stats;
}
```

### 3. **Database Query Optimization**
```sql
-- Optimized aggregation query
SELECT 
  workerType,
  location,
  COUNT(*) as count,
  SUM(CASE WHEN isAvailable THEN 1 ELSE 0 END) as available
FROM WorkerRegistration
WHERE isAvailable = true
GROUP BY workerType, location
ORDER BY workerType, count DESC;
```

---

## Testing

### Mock Data
```typescript
// Sử dụng mock data khi API chưa sẵn sàng
import { WorkerStatsService } from '@/services/worker-stats';

const mockStats = WorkerStatsService.getMockWorkerStats();
```

### Test Cases
1. ✅ Hiển thị số liệu khi API thành công
2. ✅ Fallback sang mock data khi API lỗi
3. ✅ Auto-refresh mỗi 5 phút
4. ✅ Pull-to-refresh hoạt động
5. ✅ Status colors đúng theo số liệu
6. ✅ Secondary location hiển thị đầy đủ

---

## Future Enhancements

### Phase 2:
- [ ] Push notifications khi có thợ mới đăng ký
- [ ] Filter theo khu vực
- [ ] Booking thợ trực tiếp từ home screen
- [ ] Rating & reviews cho thợ

### Phase 3:
- [ ] Real-time updates với WebSocket
- [ ] Geolocation-based worker sorting
- [ ] AI matching customer → worker
- [ ] In-app messaging với thợ

---

## Troubleshooting

### Số liệu không cập nhật?
1. Check network connection
2. Verify API endpoint hoạt động: `GET /api/workers/stats`
3. Check console logs: `[WorkerStatsService]`
4. Thử pull-to-refresh manual

### Performance chậm?
1. Kiểm tra database indexes
2. Enable Redis caching
3. Optimize aggregation query
4. Reduce auto-refresh frequency

---

## Tóm tắt

✅ **Đã hoàn thành**:
- Types & interfaces
- API service với fallback
- React Hook với auto-refresh
- Home screen integration
- Mock data cho development

⏳ **Backend TODO**:
- Tạo API endpoints
- Database schema & migrations
- Redis caching
- Worker registration flow

📱 **UX Features**:
- Real-time count updates (5 mins)
- Pull-to-refresh support
- Status indicators (available/busy)
- Dual location display

---

*Generated: December 4, 2025*
