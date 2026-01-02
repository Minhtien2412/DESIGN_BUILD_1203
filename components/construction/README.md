# Construction Components - Quick Reference

**Thư viện component cho quản lý dự án xây dựng**

---

## 🎯 Import

```typescript
import {
  StatusBadge,
  MetricCard,
  ProgressCard,
  TimelineItem,
  PhotoGrid,
  DocumentCard,
  ChecklistItem,
  BarChart,
  LineChart,
  DonutChart,
} from '@/components/construction';
```

---

## 📦 Components

### 1. StatusBadge

Hiển thị trạng thái với màu sắc semantic.

```typescript
<StatusBadge 
  label="Hoàn thành" 
  variant="success"    // success | warning | error | info | neutral
  icon="checkmark-circle" 
  size="medium"        // small | medium | large
/>
```

**Colors:**
- `success`: Green (Hoàn thành, Đạt, OK)
- `warning`: Orange (Chờ xử lý, Cảnh báo)
- `error`: Red (Lỗi, Không đạt, Quá hạn)
- `info`: Blue (Thông tin, Mới)
- `neutral`: Gray (Mặc định, N/A)

---

### 2. MetricCard

Card hiển thị KPI với gradient & trend indicator.

```typescript
<MetricCard
  icon="speedometer"
  label="Tiến độ"
  value="75%"
  subtitle="Đúng kế hoạch"
  trend="up"              // up | down | neutral
  trendValue="+5%"
  gradientColors={['#10b981', '#059669']}  // Optional
/>
```

**Preset Gradients:**
- `blue`: Default
- `green`: Success metrics
- `orange`: Warning metrics  
- `purple`: Special metrics
- `red`: Error metrics

---

### 3. ProgressCard

Card tiến độ với progress bar.

```typescript
<ProgressCard
  title="Đổ bê tông tầng 3"
  progress={75}           // 0-100
  subtitle="Khu A"
  icon="construct"
  showPercentage={true}
/>
```

**Auto Colors:**
- 0-25%: Red
- 25-50%: Orange
- 50-80%: Blue
- 80-100%: Green

---

### 4. TimelineItem

Item cho timeline/activity feed.

```typescript
<TimelineItem
  title="Hoàn thành cột tầng 2"
  description="40 công nhân • 5 ảnh"
  date="15/11"
  time="14:30"
  status="completed"      // completed | current | pending | failed
  icon="checkmark-circle"
  isFirst={false}
  isLast={false}
  onPress={() => navigate()}
/>
```

**Status Colors:**
- `completed`: Green
- `current`: Blue
- `pending`: Gray
- `failed`: Red

---

### 5. PhotoGrid

Grid ảnh responsive.

```typescript
<PhotoGrid
  photos={[
    { id: '1', uri: 'https://...', caption: 'Ảnh 1' },
    { id: '2', uri: 'https://...', caption: 'Ảnh 2' },
  ]}
  onPhotoPress={(photo, index) => openGallery(index)}
  onAddPress={handleAddPhoto}
  maxPhotos={10}
  columns={3}
/>
```

---

### 6. DocumentCard

Card tài liệu với file type icons.

```typescript
<DocumentCard
  name="Bản vẽ tầng 3.pdf"
  type="pdf"              // pdf, doc, xls, ppt, jpg, png, zip
  size="2.4 MB"
  date="15/11/2024"
  onPress={() => openDoc()}
  onDownload={handleDownload}
  onDelete={handleDelete}
/>
```

**Supported Types:**
- PDF: Red icon
- DOC/DOCX: Blue icon
- XLS/XLSX: Green icon
- PPT/PPTX: Orange icon
- Images: Purple icon
- ZIP/RAR: Gray icon

---

### 7. ChecklistItem

QC/QA checklist với quick status toggle.

```typescript
<ChecklistItem
  title="Kiểm tra cốt thép"
  description="Đảm bảo đúng kích thước"
  status="passed"         // pending | passed | failed | na
  onStatusChange={(status) => updateStatus(status)}
  onPress={() => openDetail()}
  notes="Đã kiểm tra"
  photos={3}
/>
```

**Status Icons:**
- `pending`: Clock (Orange)
- `passed`: Checkmark (Green)
- `failed`: X (Red)
- `na`: Minus (Gray)

---

## 📊 Charts

### BarChart

```typescript
<BarChart
  data={[
    { label: 'Vật liệu', value: 2400, color: '#3b82f6' },
    { label: 'Nhân công', value: 1800, color: '#10b981' },
    { label: 'Thiết bị', value: 1200, color: '#f59e0b' },
  ]}
  height={200}
  showValues={true}
  maxValue={3000}         // Optional: auto-scale if not provided
/>
```

---

### LineChart

```typescript
<LineChart
  data={[
    { label: 'T1', value: 15 },
    { label: 'T2', value: 28 },
    { label: 'T3', value: 42 },
    { label: 'T4', value: 55 },
  ]}
  height={200}
  lineColor="#3b82f6"
  gradientColors={['#3b82f6', '#dbeafe']}
/>
```

---

### DonutChart

```typescript
<DonutChart
  data={[
    { label: 'Hoàn thành', value: 45, color: '#10b981' },
    { label: 'Đang làm', value: 30, color: '#3b82f6' },
    { label: 'Chậm', value: 15, color: '#f59e0b' },
    { label: 'Chưa làm', value: 10, color: '#9ca3af' },
  ]}
  size={200}
  thickness={30}
  centerText="100"
  centerSubtext="công việc"
/>
```

---

## 🎨 Design Tokens

### Colors

```typescript
// Success (Green)
const success = {
  bg: '#dcfce7',
  text: '#166534',
  border: '#22c55e',
  gradient: ['#10b981', '#059669'],
};

// Warning (Orange)
const warning = {
  bg: '#fef3c7',
  text: '#92400e',
  border: '#f59e0b',
  gradient: ['#f59e0b', '#d97706'],
};

// Error (Red)
const error = {
  bg: '#fee2e2',
  text: '#991b1b',
  border: '#ef4444',
  gradient: ['#ef4444', '#dc2626'],
};

// Info (Blue)
const info = {
  bg: '#dbeafe',
  text: '#1e40af',
  border: '#3b82f6',
  gradient: ['#3b82f6', '#2563eb'],
};

// Neutral (Gray)
const neutral = {
  bg: '#f3f4f6',
  text: '#374151',
  border: '#9ca3af',
  gradient: ['#6b7280', '#4b5563'],
};
```

### Spacing

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

### Border Radius

```typescript
const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
```

---

## 📱 Usage Examples

### Project Dashboard

```typescript
<Section>
  <ScrollView horizontal>
    <MetricCard icon="speedometer" label="Tiến độ" value="75%" trend="up" />
    <MetricCard icon="cash" label="Ngân sách" value="6.0B" trend="up" />
    <MetricCard icon="people" label="Nhân công" value="52" trend="down" />
  </ScrollView>
</Section>

<Section>
  <ProgressCard 
    title="Thi công móng" 
    progress={100} 
    icon="checkmark-circle" 
  />
  <ProgressCard 
    title="Xây tường tầng 1" 
    progress={75} 
    icon="construct" 
  />
</Section>
```

### Diary Timeline

```typescript
<Section>
  {entries.map((entry, index) => (
    <TimelineItem
      key={entry.id}
      title={formatDate(entry.date)}
      description={`${entry.workforce.total} nhân công`}
      date={entry.date}
      status={entry.hasIssues ? 'failed' : 'completed'}
      icon={getWeatherIcon(entry.weather)}
      isFirst={index === 0}
      isLast={index === entries.length - 1}
      onPress={() => router.push(`/diary/${entry.id}`)}
    />
  ))}
</Section>
```

### QC Checklist

```typescript
<Section>
  {checklist.map(item => (
    <ChecklistItem
      key={item.id}
      title={item.title}
      description={item.description}
      status={item.status}
      onStatusChange={(status) => updateChecklist(item.id, status)}
      photos={item.photoCount}
      notes={item.notes}
    />
  ))}
</Section>
```

### Reports with Charts

```typescript
<Section>
  <Text style={styles.title}>Tiến độ theo tháng</Text>
  <LineChart
    data={monthlyProgress}
    height={200}
    lineColor="#10b981"
  />
</Section>

<Section>
  <Text style={styles.title}>Phân bổ ngân sách</Text>
  <BarChart
    data={budgetBreakdown}
    height={220}
    showValues={true}
  />
</Section>

<Section>
  <Text style={styles.title}>Trạng thái công việc</Text>
  <DonutChart
    data={taskStatus}
    centerText="100"
    centerSubtext="công việc"
  />
</Section>
```

---

## 🔧 Customization

### Custom Gradient

```typescript
<MetricCard
  {...props}
  gradientColors={['#custom1', '#custom2']}
/>
```

### Custom Chart Colors

```typescript
<BarChart
  data={[
    { label: 'Item 1', value: 100, color: '#FF6B6B' },
    { label: 'Item 2', value: 200, color: '#4ECDC4' },
  ]}
/>
```

### Custom Status Badge

```typescript
// Define custom variant in component if needed
<StatusBadge 
  label="Custom" 
  variant="info"  // Use closest preset
  icon="custom-icon"
/>
```

---

## 🚀 Performance Tips

1. **Memoize Large Lists:**
```typescript
const MemoizedTimelineItem = React.memo(TimelineItem);
```

2. **Lazy Load Photos:**
```typescript
<PhotoGrid photos={photos.slice(0, visibleCount)} />
```

3. **Debounce Status Updates:**
```typescript
const debouncedUpdate = useDebouncedCallback(updateStatus, 300);
```

4. **Virtual Lists for Long Timelines:**
```typescript
<FlatList
  data={entries}
  renderItem={({ item }) => <TimelineItem {...item} />}
  keyExtractor={item => item.id}
/>
```

---

## 📚 Related Files

- **Components:** `components/construction/*.tsx`
- **Diary Service:** `services/api/diary.mock.ts`
- **Screens:** `app/projects/[id]/diary/` & `app/projects/[id]/reports.tsx`
- **Types:** `services/api/types.ts`

---

## 🐛 Troubleshooting

**Q: StatusBadge không hiển thị icon?**  
A: Kiểm tra icon name có tồn tại trong `@expo/vector-icons` Ionicons.

**Q: Chart không render?**  
A: Đảm bảo data array không rỗng và values là numbers.

**Q: PhotoGrid không responsive?**  
A: Check `columns` prop và parent container width.

**Q: MetricCard gradient không hoạt động?**  
A: Cần cài `expo-linear-gradient`: `npx expo install expo-linear-gradient`

---

**Happy Building! 🏗️**
