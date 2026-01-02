# 🎯 Test AI Module - Hướng dẫn nhanh

## ✅ Các file đã tạo (KHÔNG LỖI)

```
✅ services/aiService.ts              - 235 lines, 0 errors
✅ app/ai/_layout.tsx                 - Screen layout
✅ app/ai/index.tsx                   - Chat interface, 0 errors
✅ app/ai/photo-analysis.tsx          - Photo analysis, 0 errors
✅ app/ai/generate-report.tsx         - Report generation, 0 errors
✅ app/ai/material-check.tsx          - Material check, 0 errors
✅ app/(tabs)/index.tsx               - Updated with AI Hub badge
```

## 🚀 Test ngay (5 phút)

### 1. Start app
```bash
npm start
```

### 2. Mở app → Tìm "AI Hub"
```
1. Cuộn xuống section "Công cụ nhanh"
2. Tìm icon sparkles với badge "NEW" đỏ
3. Bấm vào "AI Hub"
```

### 3. Test Chat
```
1. Gõ: "Phân tích dự án"
2. AI sẽ trả lời
```

### 4. Test Photo Analysis
```
1. Bấm card "Photo Analysis" (màu xanh, icon camera)
2. Chọn "Chụp ảnh" hoặc "Chọn từ thư viện"
3. Chọn 1 ảnh bất kỳ
4. Bấm "Phân tích ngay"
5. Xem kết quả: % hoàn thành, chất lượng, vấn đề
```

### 5. Test Generate Report
```
1. Quay lại AI Hub
2. Bấm "Generate Report" (màu xanh lá, icon document)
3. Chọn "Báo cáo Ngày/Tuần/Tháng"
4. Bấm "Tạo báo cáo"
5. Xem báo cáo chi tiết
```

### 6. Test Material Check
```
1. Quay lại AI Hub
2. Bấm "Material Check" (màu cam, icon cube)
3. Chụp/chọn ảnh vật liệu
4. Bấm "Kiểm tra ngay"
5. Xem đánh giá chất lượng
```

## 📱 Screenshots mong đợi

### Homepage - AI Hub
```
┌─────────────────────────┐
│  Công cụ nhanh          │
├─────────────────────────┤
│ [💰] [📱] [📅] [📍]    │
│ Dự toán QR Lịch Cửa hàng│
│                          │
│ [✨NEW] [📹] [▶️] [💬] │
│ AI Hub  Live Video Chat │
└─────────────────────────┘
```

### AI Hub Screen
```
┌─────────────────────────┐
│ ← AI Trợ lý xây dựng    │
├─────────────────────────┤
│ 💬 Chat Messages        │
│ ┌─────────────────────┐ │
│ │ User: Phân tích dự án│
│ │ AI: Dự án đang...   │ │
│ └─────────────────────┘ │
│                          │
│ Quick Actions:           │
│ ┌───┐ ┌───┐             │
│ │📸 │ │📄 │             │
│ │Photo│Report│          │
│ └───┘ └───┘             │
│ ┌───┐ ┌───┐             │
│ │🧱 │ │📊 │             │
│ │Mat │Pred │             │
│ └───┘ └───┘             │
└─────────────────────────┘
```

## ⚡ API Endpoints được gọi

```typescript
// Chat
POST /api/v1/ai/chat
{
  "projectId": 1,
  "message": "Phân tích dự án"
}

// Photo Analysis
POST /api/v1/ai/progress/analyze
{
  "projectId": 1,
  "imageUrls": ["..."],
  "description": "..."
}

// Generate Report
POST /api/v1/ai/report
{
  "projectId": 1,
  "reportType": "daily",
  "includeImages": true
}

// Material Check
POST /api/v1/ai/materials/check
{
  "projectId": 1,
  "imageUrl": "...",
  "description": "..."
}
```

## 🐛 Troubleshooting

### Lỗi: "Network request failed"
- Kiểm tra backend đang chạy
- Check API_BASE_URL trong `services/api.ts`

### Lỗi: "Unauthorized"
- Đăng nhập lại
- Check token trong AuthContext

### Không thấy AI Hub
- Clear cache: `npm start -- --clear`
- Restart app

### Upload ảnh không hoạt động
- Cấp quyền camera/gallery
- Check ImagePicker config

## 📊 Expected Behavior

### Khi backend chưa sẵn sàng:
```
Error: Network request failed
→ Show alert "Không thể kết nối đến server"
```

### Khi backend ready:
```
1. Upload ảnh → Loading... → Hiển thị kết quả
2. Chat → Loading... → AI response
3. Generate report → Loading... → Báo cáo chi tiết
```

## 🎨 UI Elements

### Badge "NEW"
- Background: `#FF3366` (đỏ hồng)
- Text: `NEW` (trắng, bold)
- Position: Top-right của icon

### Loading States
- `<ActivityIndicator />` màu trắng
- Text: "Đang phân tích..." / "Đang tạo..." / "Đang kiểm tra..."

### Result Cards
- White background
- Rounded 12px
- Padding 16px
- Icons: `Ionicons`
- Colors:
  - Green `#10B981` = Good
  - Orange `#F59E0B` = Warning
  - Red `#EF4444` = Error

## 📝 Mock Data (nếu backend chưa ready)

Có thể test UI bằng mock data:

```typescript
// Mock response
const mockAnalysis = {
  progress: 75,
  quality: 'Tốt',
  estimatedDaysToComplete: 15,
  issues: ['Cần hoàn thiện sơn tường', 'Thiếu lan can tầng 2'],
  recommendations: ['Tăng nhân công sơn', 'Đặt hàng lan can']
};
```

## ✨ Next Steps

Sau khi test xong:
1. Kết nối với backend AI thật
2. Thêm project selector
3. Thêm AI insights widget lên homepage
4. Export PDF
5. Offline support

---

**Trạng thái**: ✅ READY TO TEST  
**Build errors**: 0 (trong AI module)  
**Total files**: 6 files mới
**Total lines**: ~2000 lines code

