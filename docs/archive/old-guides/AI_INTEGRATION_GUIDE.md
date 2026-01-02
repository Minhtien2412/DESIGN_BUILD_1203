# AI Module Integration - Complete Guide

## 📋 Overview

Hệ thống AI được tích hợp hoàn toàn với backend AI module để cung cấp các chức năng thông minh cho quản lý dự án xây dựng.

## 🏗️ Architecture

```
Frontend (Expo)          Backend (NestJS)
├── services/            ├── src/ai/
│   └── aiService.ts     │   ├── ai.controller.ts (13 endpoints)
│                        │   └── ai.service.ts
├── app/ai/              
│   ├── index.tsx        → Chat với AI assistant
│   ├── photo-analysis   → Phân tích ảnh công trình
│   ├── generate-report  → Tạo báo cáo tự động
│   └── material-check   → Kiểm tra chất lượng vật liệu
```

## 🚀 Features Implemented

### 1. **AI Service Layer** (`services/aiService.ts`)
Complete TypeScript client với 18 methods:

**Construction Analysis:**
- `analyzeConstructionSite()` - Phân tích toàn bộ công trình
- `monitorProject()` - Giám sát thời gian thực
- `getAnalysisHistory()` - Lịch sử phân tích
- `deleteAnalysis()` - Xóa phân tích

**Progress Tracking:**
- `analyzeProgress()` - Phân tích tiến độ từ ảnh
- `getProgressAnalyses()` - Lịch sử tiến độ

**Report Generation:**
- `generateProgressReport()` - Tạo báo cáo (daily/weekly/monthly)
- `getReports()` - Lấy danh sách báo cáo
- `generateDailyReport()` - Báo cáo ngày
- `getDailyReports()` - Danh sách báo cáo ngày
- `generateWeeklyReport()` - Báo cáo tuần
- `getWeeklyReports()` - Danh sách báo cáo tuần

**AI Chat:**
- `chatWithAI()` - Chat với trợ lý AI
- `getChatHistory()` - Lịch sử chat

**Material Quality:**
- `checkMaterials()` - Kiểm tra chất lượng vật liệu
- `getMaterialReports()` - Báo cáo vật liệu

### 2. **AI Chat Interface** (`app/ai/index.tsx`)
Chat assistant với quick actions:
- 💬 Chat bubble UI (user + assistant messages)
- 🎯 4 Quick action cards:
  1. **Photo Analysis** (📸) - Upload & analyze images
  2. **Generate Report** (📄) - Auto progress reports
  3. **Material Check** (🧱) - Quality inspection
  4. **Progress Prediction** (📊) - Time estimation
- ⚡ Real-time typing indicator
- 🔄 Message history

### 3. **Photo Analysis** (`app/ai/photo-analysis.tsx`)
AI-powered image analysis:
- 📷 Camera capture
- 🖼️ Gallery selection
- 📤 Multiple image upload
- 🤖 AI analysis với:
  - Completion percentage (progress bar)
  - Quality assessment (Tốt/Trung bình/Kém)
  - Estimated days to complete
  - Issues detected (warnings)
  - Recommendations (improvements)
- 💾 Save/Share reports

### 4. **Report Generation** (`app/ai/generate-report.tsx`)
Tạo báo cáo tự động:
- 📅 Report type selector (Daily/Weekly/Monthly)
- 🤖 AI-generated reports với:
  - Progress overview (% completion)
  - Summary text
  - Highlights (điểm nổi bật)
  - Issues (vấn đề)
  - Next steps (bước tiếp theo)
  - Recommendations (khuyến nghị)
- 📥 Download PDF
- 📤 Share reports

### 5. **Material Check** (`app/ai/material-check.tsx`)
Kiểm tra chất lượng vật liệu:
- 📸 Upload material photo
- 🔍 AI analysis:
  - Material type identification
  - Quality rating (Xuất sắc/Tốt/Trung bình/Kém)
  - Compliance status (Đạt chuẩn/Cần kiểm tra)
  - Issues detected
  - Recommendations
- 💾 Save/Share reports

## 📱 User Journey

```
Homepage → AI Hub (badge "NEW")
   ↓
AI Chat (index.tsx)
   ├─→ Quick Action 1: Photo Analysis
   ├─→ Quick Action 2: Generate Report
   ├─→ Quick Action 3: Material Check
   └─→ Quick Action 4: Progress Prediction (coming soon)
```

## 🔌 Backend API Endpoints

Base URL: `YOUR_API_URL/api/v1/ai/`

### Analysis Endpoints:
```typescript
POST /analyze                    // Phân tích công trình
GET  /analyses                   // Lịch sử phân tích
DELETE /analyses/:id             // Xóa phân tích
```

### Monitoring Endpoints:
```typescript
POST /monitor/:projectId         // Giám sát dự án
```

### Report Endpoints:
```typescript
POST /report                     // Tạo báo cáo tiến độ
GET  /reports                    // Lấy báo cáo
```

### Progress Analysis:
```typescript
POST /progress/analyze           // Phân tích tiến độ từ ảnh
GET  /progress/analyses          // Lịch sử phân tích tiến độ
```

### Daily/Weekly Reports:
```typescript
POST /reports/daily              // Tạo báo cáo ngày
GET  /reports/daily              // Lấy báo cáo ngày
POST /reports/weekly             // Tạo báo cáo tuần
GET  /reports/weekly             // Lấy báo cáo tuần
```

### Chat:
```typescript
POST /chat                       // Chat với AI
GET  /chat/history               // Lịch sử chat
```

### Materials:
```typescript
POST /materials/check            // Kiểm tra vật liệu
GET  /materials/reports          // Báo cáo vật liệu
```

## 💡 Usage Examples

### 1. Chat with AI
```typescript
import { aiService } from '@/services/aiService';

const response = await aiService.chatWithAI({
  projectId: 1,
  message: 'Dự án hiện tại đang tiến độ như thế nào?',
});

console.log(response.message); // AI response
```

### 2. Analyze Progress from Photos
```typescript
const analysis = await aiService.analyzeProgress({
  projectId: 1,
  imageUrls: ['https://example.com/progress1.jpg'],
  description: 'Phân tích tiến độ tháng 12',
});

console.log(analysis.progress); // 75%
console.log(analysis.issues);   // ['Cần hoàn thiện sơn tường']
```

### 3. Generate Progress Report
```typescript
const report = await aiService.generateProgressReport({
  projectId: 1,
  reportType: 'weekly',
  includeImages: true,
});

console.log(report.summary);
console.log(report.highlights);
console.log(report.nextSteps);
```

### 4. Check Material Quality
```typescript
const result = await aiService.checkMaterials({
  projectId: 1,
  imageUrl: 'https://example.com/material.jpg',
  description: 'Kiểm tra chất lượng gạch lát nền',
});

console.log(result.quality);      // "Tốt"
console.log(result.isCompliant);  // true
console.log(result.recommendations);
```

## 🎨 UI Components

### Quick Action Card
```tsx
<TouchableOpacity style={styles.quickActionCard}>
  <View style={[styles.quickActionIcon, { backgroundColor: '#EFF6FF' }]}>
    <Ionicons name="camera" size={32} color="#3B82F6" />
  </View>
  <Text style={styles.quickActionTitle}>Photo Analysis</Text>
  <Text style={styles.quickActionDesc}>Upload & analyze images</Text>
</TouchableOpacity>
```

### Progress Bar
```tsx
<View style={styles.progressBar}>
  <View style={[styles.progressFill, { width: `${progress}%` }]} />
</View>
<Text>{progress}%</Text>
```

### Result Card
```tsx
<View style={styles.card}>
  <View style={styles.cardHeader}>
    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
    <Text style={styles.cardTitle}>Quality Assessment</Text>
  </View>
  <Text style={styles.cardValue}>{result.quality}</Text>
</View>
```

## 🔐 Authentication

Tất cả API calls tự động sử dụng auth token từ `AuthContext`:

```typescript
// services/aiService.ts
private async request<T>(path: string, options?: RequestInit): Promise<T> {
  return apiFetch(path, options); // apiFetch handles auth automatically
}
```

## 📊 Data Flow

```
User Action (Upload Photo)
    ↓
Component State (setSelectedImage)
    ↓
AI Service Call (aiService.analyzeProgress)
    ↓
apiFetch (with auth token)
    ↓
Backend AI Module (ai.controller.ts)
    ↓
AI Service Logic (ai.service.ts)
    ↓
Response back to Frontend
    ↓
Update UI (setResult)
```

## 🚧 Coming Soon

- [ ] **Progress Prediction Screen** - Dự đoán thời gian hoàn thành
- [ ] **Report Viewer** - Xem lịch sử báo cáo
- [ ] **Project Selector** - Chọn dự án để phân tích
- [ ] **AI Insights Widget** - Hiển thị insights trên homepage
- [ ] **Notification System** - Thông báo khi AI hoàn thành phân tích
- [ ] **Export PDF** - Xuất báo cáo ra PDF
- [ ] **Offline Support** - Cache kết quả, queue requests khi offline
- [ ] **Voice Input** - Nói chuyện với AI assistant
- [ ] **Image Annotation** - Đánh dấu vấn đề trên ảnh

## 🧪 Testing

### Manual Testing:
1. **Chat Test**:
   - Open AI Hub → Chat with AI
   - Send message: "Dự án tôi đang như thế nào?"
   - Verify AI response

2. **Photo Analysis Test**:
   - Open AI Hub → Photo Analysis
   - Upload construction site photo
   - Verify progress percentage, issues, recommendations

3. **Report Generation Test**:
   - Open AI Hub → Generate Report
   - Select "Daily Report"
   - Verify summary, highlights, next steps

4. **Material Check Test**:
   - Open AI Hub → Material Check
   - Upload material photo
   - Verify quality rating, compliance status

## 🐛 Known Issues

1. **Hardcoded projectId**: Currently using `projectId: 1` - need project selector
2. **No error retry**: Failed requests don't have retry mechanism
3. **No caching**: All requests hit API every time
4. **No loading skeleton**: Shows ActivityIndicator instead of skeleton UI

## 🔧 Configuration

Update API URL in `services/api.ts`:
```typescript
const API_BASE_URL = 'YOUR_BACKEND_URL/api/v1';
```

## 📝 Notes

- All AI screens follow the same pattern: Upload/Input → Process → Display Results
- UI uses modern card-based design with color-coded badges
- Error handling via try/catch with user-friendly alerts
- All text in Vietnamese for user-facing content
- TypeScript strict mode enabled - zero `any` types

## 📚 References

- Backend AI Controller: `BE-baotienweb.cloud/src/ai/ai.controller.ts`
- AI Service Implementation: `BE-baotienweb.cloud/src/ai/ai.service.ts`
- Frontend AI Service: `services/aiService.ts`
- Design System: `components/ui/` + `constants/theme.ts`

---

**Last Updated**: December 2024  
**Status**: ✅ Core features complete, additional features in roadmap
