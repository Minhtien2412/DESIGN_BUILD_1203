# SƠ ĐỒ HỆ THỐNG THEO DÕI HÀNH VI NGƯỜI DÙNG

## 📊 TỔNG QUAN KIẾN TRÚC

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERACTIONS                           │
│  (Scroll, Tap, Swipe, Search, Filter, Navigate...)             │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT HOOKS LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │useUserBehavior│  │useItemVisibility│  │useScreenTime│         │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│              USER BEHAVIOR TRACKER (Singleton)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ - Track Events                                            │   │
│  │ - Manage Session                                          │   │
│  │ - Analytics Processing                                    │   │
│  │ - Pattern Detection                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT STORAGE                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  In-Memory   │  │Local Storage │  │  Analytics   │          │
│  │    Events    │  │   (Cache)    │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 CÁC LOẠI HÀNH VI ĐƯỢC THEO DÕI

### 1. **Navigation Actions** (Điều hướng)
```
TAB_SWITCH      → Chuyển tab
SCREEN_VIEW     → Xem màn hình
SCROLL          → Cuộn trang
SWIPE           → Vuốt
```

### 2. **Interaction Actions** (Tương tác)
```
BUTTON_PRESS    → Nhấn nút
SEARCH          → Tìm kiếm
FILTER          → Lọc
SORT            → Sắp xếp
```

### 3. **Content Actions** (Nội dung)
```
ITEM_VIEW       → Xem item (impression)
ITEM_CLICK      → Click vào item
EXPAND          → Mở rộng
COLLAPSE        → Thu gọn
```

### 4. **Form Actions** (Biểu mẫu)
```
INPUT_FOCUS     → Focus vào input
INPUT_BLUR      → Blur khỏi input
FORM_SUBMIT     → Gửi form
```

---

## 📱 LUỒNG HOẠT ĐỘNG CHI TIẾT

### A. Khi người dùng mở app

```
1. App Start
   ↓
2. Initialize UserBehaviorTracker
   ↓
3. Create New Session
   ├─ Generate SessionID
   ├─ Record Start Time
   └─ Initialize Counters
   ↓
4. Track SCREEN_VIEW event
   ├─ Screen: "ProjectsScreen"
   ├─ Timestamp
   └─ Previous Screen (if any)
```

### B. Khi người dùng cuộn trang

```
1. User Scrolls
   ↓
2. FlatList onScroll Event
   ↓
3. handleScroll (throttled 500ms)
   ↓
4. Track SCROLL event
   ├─ Scroll Position
   ├─ Scroll Direction (up/down)
   ├─ Scroll Percentage
   ├─ Scroll Distance
   └─ Update Total Scroll Distance
```

### C. Khi người dùng tìm kiếm

```
1. User Types in Search
   ↓
2. onChangeText Event
   ↓
3. handleSearch
   ↓
4. Track SEARCH event
   ├─ Query String
   ├─ Query Length
   ├─ Results Count
   └─ Timestamp
```

### D. Khi người dùng click vào project

```
1. User Taps Project Card
   ↓
2. handleProjectPress
   ↓
3. handleItemClick
   ↓
4. Track ITEM_CLICK event
   ├─ Item ID
   ├─ Item Type: "project"
   ├─ Position in List
   └─ Timestamp
   ↓
5. Navigate to Detail Screen
   ↓
6. Track SCREEN_VIEW event
   ├─ Screen: "ProjectDetailScreen"
   └─ Previous Screen: "ProjectsScreen"
```

### E. Khi người dùng chuyển tab

```
1. User Swipes or Taps Tab
   ↓
2. handleTabSwitch
   ↓
3. Track TAB_SWITCH event
   ├─ From Tab
   ├─ To Tab
   ├─ Method (tap/swipe)
   ├─ Session Duration
   └─ Increment Tab Switch Counter
```

---

## 🔄 VÒNG ĐỜI SESSION

```
┌──────────────┐
│ Session Start│
└──────┬───────┘
       │
       ├─ User Actions ──┐
       │                 │
       ├─ Track Events   │
       │                 │
       ├─ Update Stats   │◄─── Loop
       │                 │
       ├─ Calculate      │
       │   Analytics     │
       │                 │
       └─────────────────┘
       │
       ▼
┌──────────────┐
│ Session End  │
│ - Export Data│
│ - Send to    │
│   Analytics  │
└──────────────┘
```

---

## 📈 DỮ LIỆU ĐƯỢC THU THẬP

### Event Structure
```typescript
{
  id: "event_1234567890_abc123",
  action: "ITEM_CLICK",
  timestamp: 1700000000000,
  screen: "ProjectsScreen",
  metadata: {
    itemId: "project-001",
    itemType: "project",
    position: 3,
    ...
  }
}
```

### Session Structure
```typescript
{
  sessionId: "session_1234567890_xyz789",
  startTime: 1700000000000,
  endTime: 1700001000000,
  events: [...], // All events
  totalScrollDistance: 5000,
  tabSwitches: 12,
  interactions: 45
}
```

### Analytics Output
```typescript
{
  duration: 60000, // ms
  totalEvents: 45,
  tabSwitches: 12,
  totalScrollDistance: 5000,
  interactions: 45,
  topActions: [
    { action: "SCROLL", count: 15 },
    { action: "ITEM_CLICK", count: 8 },
    { action: "SEARCH", count: 5 },
    ...
  ]
}
```

---

## 🎮 SỬ DỤNG TRONG COMPONENTS

### 1. Basic Usage
```typescript
// In ProjectsScreen.tsx
const {
  handleScroll,
  handleSearch,
  handleFilter,
  handleItemClick,
  handlePullRefresh,
} = useUserBehavior({
  screenName: 'ProjectsScreen',
  enableScrollTracking: true,
  enableAutoScreenView: true,
});
```

### 2. FlatList Integration
```typescript
<FlatList
  data={projects}
  onScroll={handleScroll}
  scrollEventThrottle={16}
  refreshControl={
    <RefreshControl
      onRefresh={() => {
        handlePullRefresh();
        refresh();
      }}
    />
  }
  onEndReached={() => {
    trackLoadMore(page, items.length);
    fetchMore();
  }}
/>
```

### 3. Search Integration
```typescript
<TextInput
  value={searchQuery}
  onChangeText={(text) => {
    setSearchQuery(text);
    handleSearch(text, results.length);
  }}
/>
```

### 4. Item Click Tracking
```typescript
const handleProjectPress = (project: Project) => {
  handleItemClick(project.id, 'project');
  router.push(`/projects/${project.id}`);
};
```

---

## 📊 PHÂN TÍCH & BÁO CÁO

### Real-time Analytics
```typescript
const analytics = getSessionAnalytics();
console.log({
  duration: analytics.duration, // Thời gian session
  events: analytics.totalEvents, // Tổng số events
  scrollDistance: analytics.totalScrollDistance, // Tổng khoảng cách cuộn
  tabSwitches: analytics.tabSwitches, // Số lần chuyển tab
  topActions: analytics.topActions // Top 5 hành động
});
```

### User Patterns
```typescript
const patterns = getUserPatterns();
console.log({
  avgSessionDuration: patterns.averageSessionDuration,
  mostUsedActions: patterns.mostUsedActions,
  avgScrollDistance: patterns.averageScrollDistance,
  tabSwitchFrequency: patterns.tabSwitchFrequency
});
```

### Export for External Analytics
```typescript
const sessionData = exportSessionData();
// Send to Firebase, Mixpanel, Amplitude, etc.
sendToAnalytics(sessionData);
```

---

## 🔍 USE CASES

### 1. **UX Optimization**
- Phát hiện người dùng cuộn nhiều → Tối ưu lazy loading
- Nhiều lần tìm kiếm → Cải thiện search suggestions
- Tab switch frequency cao → Redesign navigation

### 2. **Feature Usage Analysis**
- Filter usage → Biết filters nào được dùng nhiều
- Sort preferences → Default sort theo preference
- Item click rate → Redesign card layout

### 3. **Performance Monitoring**
- Scroll performance → Detect lag
- Load time tracking → Optimize initial load
- Error tracking → Fix bugs

### 4. **User Engagement**
- Session duration → Engagement metrics
- Interaction rate → Feature popularity
- Return patterns → Retention analysis

---

## 🛠️ EXTENSION POINTS

### Custom Tracking
```typescript
// Track custom business logic
trackCustomAction(UserAction.BUTTON_PRESS, {
  buttonName: 'export_pdf',
  projectId: project.id,
  userRole: user.role
});
```

### Form Tracking
```typescript
const { trackFieldFocus, trackFieldBlur, trackFormSubmit } = 
  useFormTracking('ProjectsScreen', 'create_project_form');

<TextInput
  onFocus={() => trackFieldFocus('project_name')}
  onBlur={(e) => trackFieldBlur('project_name', e.nativeEvent.text)}
/>
```

### Gesture Tracking
```typescript
const { trackSwipeGesture } = useGestureTracking('ProjectsScreen');

<PanGestureHandler
  onGestureEvent={(e) => {
    if (e.nativeEvent.velocityX > 500) {
      trackSwipeGesture('right', e.nativeEvent.velocityX);
    }
  }}
/>
```

---

## 📝 BEST PRACTICES

1. **Throttle scroll events** → Max 1 event per 500ms
2. **Debounce search** → Wait for user to finish typing
3. **Batch events** → Send to server in batches
4. **Privacy first** → No PII in tracking
5. **Performance** → Async processing
6. **Clean up** → Clear old sessions periodically

---

## 🚀 INTEGRATION ROADMAP

### Phase 1: Local Tracking ✅
- [x] Core tracker implementation
- [x] React hooks
- [x] ProjectsScreen integration

### Phase 2: Analytics Dashboard
- [ ] Real-time analytics UI
- [ ] Historical reports
- [ ] Export functionality

### Phase 3: External Services
- [ ] Firebase Analytics
- [ ] Mixpanel integration
- [ ] Custom backend

### Phase 4: Advanced Features
- [ ] Heatmaps
- [ ] Funnel analysis
- [ ] A/B testing support
- [ ] Predictive analytics

---

## 📚 FILES STRUCTURE

```
utils/
  └─ user-behavior-tracker.ts    # Core tracking logic

hooks/
  └─ useUserBehavior.ts           # React hooks

features/projects/
  └─ ProjectsScreen.tsx           # Implementation example

docs/
  └─ USER_BEHAVIOR_TRACKING.md   # This file
```

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-25  
**Maintained by:** Development Team
