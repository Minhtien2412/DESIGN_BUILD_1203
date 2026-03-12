# 🎨 HƯỚNG DẪN THIẾT KẾ VÀ PHÁT TRIỂN GIAO DIỆN

> **Mục đích:** Tài liệu hướng dẫn chi tiết cách thiết kế và phát triển giao diện mới cho từng module

---

## 📐 DESIGN SYSTEM - NORDIC MINIMALISM

### Color Palette
```typescript
const Colors = {
  // Primary
  primary: '#4AA14A',        // Green - Main accent
  primaryLight: '#6BC56B',   // Light green
  primaryDark: '#3A8A3A',    // Dark green
  
  // Neutrals
  background: '#FFFFFF',     // White background
  surface: '#F8F8F8',        // Light gray surface
  border: '#F0F0F0',         // Very light border
  
  // Text
  text: '#1A1A1A',          // Near black
  textMuted: '#808080',     // Gray
  textLight: '#B0B0B0',     // Light gray
  
  // Status
  success: '#4AA14A',       // Green
  warning: '#FFB300',       // Amber
  error: '#E53935',         // Red
  info: '#2196F3',          // Blue
  
  // Backgrounds
  successBg: '#E8F5E9',
  warningBg: '#FFF8E1',
  errorBg: '#FFEBEE',
  infoBg: '#E3F2FD',
};
```

### Typography Scale
```typescript
const Typography = {
  // Headings
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  h5: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  
  // Body
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodySmall: { fontSize: 12, fontWeight: '400', lineHeight: 18 },
  
  // Special
  button: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  overline: { fontSize: 10, fontWeight: '600', lineHeight: 14, letterSpacing: 1 },
};
```

### Spacing System
```typescript
const Spacing = {
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem
  md: 12,   // 0.75rem
  lg: 16,   // 1rem
  xl: 24,   // 1.5rem
  xxl: 32,  // 2rem
  xxxl: 48, // 3rem
};
```

### Border Radius
```typescript
const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
```

### Elevation (Shadows)
```typescript
const Elevation = {
  0: { shadowOpacity: 0 },
  1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
};
```

---

## 🎯 COMPONENT GUIDELINES

### 1. Button Component
```typescript
// ✅ Good Example
<Button 
  variant="primary"     // primary | secondary | outline | ghost
  size="medium"         // small | medium | large
  loading={isLoading}
  disabled={isDisabled}
  onPress={handlePress}
>
  Xác nhận
</Button>

// Variants:
- primary: Nền xanh #4AA14A, text trắng
- secondary: Nền #F8F8F8, text #1A1A1A
- outline: Border xanh, text xanh
- ghost: Transparent, text xanh
```

### 2. Card Component
```typescript
// ✅ Good Example
<Card 
  elevation={2}
  padding="md"          // sm | md | lg
  borderRadius="md"
>
  <Card.Header>
    <Text style={styles.cardTitle}>Tiêu đề</Text>
  </Card.Header>
  <Card.Body>
    <Text style={styles.cardContent}>Nội dung</Text>
  </Card.Body>
  <Card.Footer>
    <Button>Hành động</Button>
  </Card.Footer>
</Card>

// Styling:
- Background: #F8F8F8
- Border: #F0F0F0
- Padding: 12-16px
- Border radius: 8-12px
- Elevation: 2
```

### 3. Input Component
```typescript
// ✅ Good Example
<Input
  label="Tên dự án"
  placeholder="Nhập tên dự án..."
  value={value}
  onChangeText={setValue}
  error={error}
  leftIcon={<Ionicons name="folder" size={20} />}
  required
/>

// Styling:
- Height: 48px
- Border: 1px solid #F0F0F0
- Border radius: 8px
- Padding: 12px 16px
- Focus border: #4AA14A
- Error border: #E53935
```

### 4. List Component
```typescript
// ✅ Good Example
<FlatList
  data={items}
  renderItem={({ item }) => (
    <ListItem 
      onPress={() => handlePress(item)}
      leftIcon={<Ionicons name={item.icon} size={24} />}
      rightIcon={<Ionicons name="chevron-forward" size={20} />}
    >
      <ListItem.Content>
        <ListItem.Title>{item.title}</ListItem.Title>
        <ListItem.Subtitle>{item.subtitle}</ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  )}
  ItemSeparatorComponent={() => <Divider />}
/>

// Styling:
- Item height: 64-72px
- Padding: 12px 16px
- Border bottom: 1px solid #F0F0F0
```

---

## 📱 SCREEN TEMPLATES

### Template 1: List Screen
```typescript
// Example: Projects List, Messages List, etc.

import { SafeScrollView } from '@/components/ui/safe-area';
import { SearchBar } from '@/components/ui/search-bar';
import { FilterBar } from '@/components/ui/filter-bar';

export default function ListScreen() {
  return (
    <SafeScrollView hasTabBar>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Danh sách dự án</Text>
        <TouchableOpacity onPress={handleAdd}>
          <Ionicons name="add-circle" size={28} color="#4AA14A" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <SearchBar 
        placeholder="Tìm kiếm..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filters */}
      <FilterBar
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* List */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl />}
        ListEmptyComponent={<EmptyState />}
      />

      {/* FAB (Floating Action Button) */}
      <FAB 
        icon="add"
        onPress={handleAdd}
        position="bottom-right"
      />
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});
```

### Template 2: Detail Screen
```typescript
// Example: Project Detail, Product Detail, etc.

export default function DetailScreen() {
  return (
    <SafeScrollView>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Image source={image} style={styles.heroImage} />
        <LinearGradient style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </LinearGradient>
      </View>

      {/* Stats/Quick Info */}
      <View style={styles.statsRow}>
        <StatCard icon="calendar" value="30 ngày" label="Thời gian" />
        <StatCard icon="people" value="12" label="Thành viên" />
        <StatCard icon="wallet" value="2.5B" label="Ngân sách" />
      </View>

      {/* Tabs */}
      <TabView
        tabs={['Tổng quan', 'Timeline', 'Team', 'Tài liệu']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button variant="outline" onPress={handleEdit}>
          Chỉnh sửa
        </Button>
        <Button variant="primary" onPress={handleSave}>
          Lưu thay đổi
        </Button>
      </View>
    </SafeScrollView>
  );
}
```

### Template 3: Form Screen
```typescript
// Example: Create Project, Add Task, etc.

export default function FormScreen() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  return (
    <SafeScrollView>
      <View style={styles.form}>
        {/* Section Header */}
        <SectionHeader title="Thông tin cơ bản" />

        {/* Form Fields */}
        <Input
          label="Tên dự án"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          error={errors.name}
          required
        />

        <Input
          label="Mô tả"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
        />

        <DatePicker
          label="Ngày bắt đầu"
          value={formData.startDate}
          onChange={(date) => setFormData({ ...formData, startDate: date })}
        />

        <Select
          label="Trạng thái"
          value={formData.status}
          options={statusOptions}
          onChange={(value) => setFormData({ ...formData, status: value })}
        />

        {/* Section 2 */}
        <SectionHeader title="Chi tiết" />

        {/* More fields... */}

        {/* Actions */}
        <View style={styles.actions}>
          <Button variant="outline" onPress={handleCancel}>
            Hủy
          </Button>
          <Button variant="primary" onPress={handleSubmit} loading={isLoading}>
            Tạo dự án
          </Button>
        </View>
      </View>
    </SafeScrollView>
  );
}
```

### Template 4: Dashboard Screen
```typescript
// Example: Home, Project Dashboard, Analytics

export default function DashboardScreen() {
  return (
    <SafeScrollView>
      {/* Header with Stats */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Chào buổi sáng, {userName}</Text>
        <Text style={styles.date}>{currentDate}</Text>
      </View>

      {/* Quick Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <MetricCard
          title="Dự án đang thực hiện"
          value={12}
          trend="+2"
          color="#4AA14A"
        />
        <MetricCard
          title="Task hôm nay"
          value={8}
          trend="-3"
          color="#FFB300"
        />
        <MetricCard
          title="Ngân sách"
          value="85%"
          trend="+5%"
          color="#2196F3"
        />
      </ScrollView>

      {/* Charts Section */}
      <SectionHeader 
        title="Tiến độ tuần này"
        action="Xem tất cả"
        onActionPress={handleViewAll}
      />
      
      <Card>
        <LineChart
          data={chartData}
          width={SCREEN_WIDTH - 32}
          height={220}
        />
      </Card>

      {/* Recent Activity */}
      <SectionHeader title="Hoạt động gần đây" />
      
      <ActivityFeed items={recentActivity} />

      {/* Quick Actions */}
      <SectionHeader title="Thao tác nhanh" />
      
      <View style={styles.quickActions}>
        <QuickActionButton icon="add" label="Tạo dự án" onPress={handleCreate} />
        <QuickActionButton icon="camera" label="Chụp ảnh" onPress={handleCamera} />
        <QuickActionButton icon="document" label="Tài liệu" onPress={handleDocs} />
        <QuickActionButton icon="people" label="Team" onPress={handleTeam} />
      </View>
    </SafeScrollView>
  );
}
```

---

## 🎨 ANIMATION GUIDELINES

### Entrance Animations
```typescript
import { Animated } from 'react-native';

// Fade In
const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }).start();
}, []);

<Animated.View style={{ opacity: fadeAnim }}>
  {/* Content */}
</Animated.View>

// Slide In
const slideAnim = useRef(new Animated.Value(50)).current;

useEffect(() => {
  Animated.spring(slideAnim, {
    toValue: 0,
    damping: 12,
    stiffness: 100,
    useNativeDriver: true,
  }).start();
}, []);

<Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
  {/* Content */}
</Animated.View>
```

### Interaction Animations
```typescript
// Button Press
const scaleAnim = useRef(new Animated.Value(1)).current;

const handlePressIn = () => {
  Animated.spring(scaleAnim, {
    toValue: 0.95,
    useNativeDriver: true,
  }).start();
};

const handlePressOut = () => {
  Animated.spring(scaleAnim, {
    toValue: 1,
    useNativeDriver: true,
  }).start();
};

<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
  <TouchableOpacity 
    onPressIn={handlePressIn}
    onPressOut={handlePressOut}
  >
    {/* Button content */}
  </TouchableOpacity>
</Animated.View>
```

---

## 🌐 RESPONSIVE DESIGN

### Breakpoints
```typescript
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const Breakpoints = {
  small: 360,   // Small phones
  medium: 768,  // Tablets
  large: 1024,  // Large tablets/small laptops
};

const isSmallDevice = width < Breakpoints.small;
const isMediumDevice = width >= Breakpoints.small && width < Breakpoints.medium;
const isLargeDevice = width >= Breakpoints.medium;

// Usage
const styles = StyleSheet.create({
  container: {
    padding: isSmallDevice ? 12 : isMediumDevice ? 16 : 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 8 : 12,
  },
  gridItem: {
    width: isSmallDevice ? '100%' : isMediumDevice ? '48%' : '31%',
  },
});
```

---

## ♿ ACCESSIBILITY GUIDELINES

### 1. Touchable Areas
```typescript
// ✅ Good: Minimum 48x48 touch target
<TouchableOpacity 
  style={{ minWidth: 48, minHeight: 48 }}
  accessible={true}
  accessibilityLabel="Thêm dự án mới"
  accessibilityRole="button"
>
  <Ionicons name="add" size={24} />
</TouchableOpacity>

// ❌ Bad: Touch target too small
<TouchableOpacity style={{ width: 20, height: 20 }}>
  <Ionicons name="add" size={16} />
</TouchableOpacity>
```

### 2. Labels & Hints
```typescript
<TextInput
  placeholder="Nhập tên..."
  accessible={true}
  accessibilityLabel="Tên dự án"
  accessibilityHint="Nhập tên cho dự án của bạn"
/>

<Image 
  source={image}
  accessible={true}
  accessibilityLabel="Hình ảnh công trình Villa Thảo Điền"
/>
```

### 3. Color Contrast
```typescript
// ✅ Good: WCAG AA compliant (4.5:1 ratio)
const textOnWhite = '#1A1A1A';  // Contrast ratio: 15.8:1
const textOnGreen = '#FFFFFF';   // Contrast ratio: 4.6:1

// ❌ Bad: Poor contrast
const lightGrayOnWhite = '#D0D0D0';  // Contrast ratio: 1.8:1
```

---

## 📦 EXAMPLE: Building a New Feature

### Scenario: Tạo trang "Task Management" mới

#### Step 1: Plan the Structure
```
Task Management
├── List View
│   ├── All Tasks
│   ├── My Tasks
│   ├── Overdue
│   └── Completed
├── Kanban View
│   ├── To Do
│   ├── In Progress
│   └── Done
├── Calendar View
└── Task Detail
    ├── Info
    ├── Subtasks
    ├── Comments
    └── Attachments
```

#### Step 2: Create Files
```
app/
└── tasks/
    ├── index.tsx          // List view
    ├── kanban.tsx         // Kanban board
    ├── calendar.tsx       // Calendar view
    ├── [id].tsx           // Task detail
    ├── create.tsx         // Create task
    └── _layout.tsx        // Stack layout
```

#### Step 3: Design Components
```typescript
// components/tasks/TaskCard.tsx
export function TaskCard({ task, onPress }) {
  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </View>
      
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {task.description}
      </Text>
      
      <View style={styles.footer}>
        <Avatar size={24} source={task.assignee.avatar} />
        <Text style={styles.dueDate}>
          <Ionicons name="calendar" size={14} />
          {formatDate(task.dueDate)}
        </Text>
      </View>
    </Card>
  );
}
```

#### Step 4: Implement List View
```typescript
// app/tasks/index.tsx
export default function TasksScreen() {
  const { tasks, loading } = useTasks();
  const [filter, setFilter] = useState('all');

  return (
    <SafeScrollView>
      <Header title="Tasks" />
      
      <FilterBar
        filters={['all', 'my', 'overdue', 'completed']}
        active={filter}
        onChange={setFilter}
      />
      
      <FlatList
        data={filteredTasks}
        renderItem={({ item }) => (
          <TaskCard 
            task={item}
            onPress={() => router.push(`/tasks/${item.id}`)}
          />
        )}
        ListEmptyComponent={<EmptyState />}
      />
      
      <FAB icon="add" onPress={() => router.push('/tasks/create')} />
    </SafeScrollView>
  );
}
```

#### Step 5: Add Navigation
```typescript
// app/tasks/_layout.tsx
export default function TasksLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Tasks',
          headerRight: () => <ViewToggle />
        }} 
      />
      <Stack.Screen name="[id]" options={{ title: 'Task Detail' }} />
      <Stack.Screen name="create" options={{ title: 'Create Task' }} />
    </Stack>
  );
}
```

---

## ✅ CHECKLIST KHI TẠO TRANG MỚI

- [ ] Đã tuân thủ Nordic design system
- [ ] Responsive trên nhiều kích thước màn hình
- [ ] Loading states (skeleton, spinner)
- [ ] Empty states (no data)
- [ ] Error states (with retry)
- [ ] Pull-to-refresh
- [ ] Accessibility labels
- [ ] Touch targets >= 48x48
- [ ] Animations mượt mà
- [ ] TypeScript types đầy đủ
- [ ] Error handling
- [ ] Navigation hoạt động
- [ ] Back button behavior
- [ ] Tested on iOS & Android
- [ ] Performance optimized

---

**Cập nhật:** 12/12/2025
