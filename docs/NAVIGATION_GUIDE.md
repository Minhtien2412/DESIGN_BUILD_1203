# Navigation System Guide

## Overview
The App Design & Build navigation system provides an intelligent, multi-layered approach to organizing and accessing 378 screens across 9 categories and 52 modules.

---

## Architecture

### 1. Category-Based Organization
The app organizes features into **9 main categories**, each with a unique color and icon:

| Category | Description | Icon | Color |
|----------|-------------|------|-------|
| Kế hoạch Kinh doanh | Business planning and strategy | `document-text` | `#FF6B6B` |
| Thiết kế Kiến trúc | Architecture and design | `construct` | `#4ECDC4` |
| Dự toán & Chi phí | Budget and cost estimation | `calculator` | `#FFD93D` |
| Quản lý Thi công | Construction management | `hammer` | `#6BCF7F` |
| Vật liệu & Thiết bị | Materials and equipment | `cube` | `#A78BFA` |
| Pháp lý & Giấy phép | Legal and licensing | `document-lock` | `#F472B6` |
| Quản lý Dự án | Project management | `briefcase` | `#FFA500` |
| Tiện ích | Utilities and tools | `apps` | `#60A5FA` |
| Khác | Miscellaneous features | `ellipsis-horizontal` | `#94A3B8` |

### 2. Module Structure
Each category contains multiple **modules** (functional units):
- Total modules: **52**
- Average modules per category: **5-7**
- Each module represents a specific feature or screen group

### 3. Navigation Components

#### CategoryGrid
- **Location**: Home screen
- **Purpose**: Visual grid display of all categories
- **Features**:
  - 2-column responsive grid
  - Gradient backgrounds
  - Module count badges
  - Press animation with scale effect
  - Navigation to category detail pages

#### CategoryCard
- **Props**: `id`, `label`, `description`, `icon`, `color`, `gradient`, `moduleCount`
- **Interactions**: 
  - Press → Navigate to `/categories/:id`
  - Animated scale feedback
- **Analytics**: Tracks category clicks

#### GlobalSearchBar
- **Location**: Home screen (below header)
- **Purpose**: Quick access to search
- **Interaction**: Press → Navigate to `/search`
- **Analytics**: Tracks search navigation

#### QuickActions
- **Location**: Home screen (below search bar)
- **Purpose**: Shortcuts to frequently used features
- **Features**:
  - Horizontal scrollable list
  - Icon + label cards
  - Quick navigation to specific modules

#### RecentlyViewed
- **Location**: Home screen
- **Purpose**: Shows last 5 visited screens
- **Storage**: AsyncStorage with timestamps
- **Features**:
  - Auto-updates on navigation
  - Swipeable horizontal list
  - Direct navigation to recent screens

#### AppDrawer
- **Trigger**: Menu button (top-left) or swipe from left
- **Features**:
  - **Header**: Gradient background with user info
  - **Favorites**: Star-marked categories (AsyncStorage)
  - **Recent Screens**: Last 5 visited (with timestamp)
  - **All Categories**: Complete list with navigation
  - **Animations**: Slide-in from left + fade overlay
- **Analytics**: Tracks drawer opens, favorites add/remove, navigation

#### Breadcrumbs
- **Location**: Category detail pages
- **Purpose**: Show navigation hierarchy
- **Format**: `Home > Category > Module`
- **Interaction**: Clickable path segments

#### ContextFAB (Floating Action Button)
- **Location**: Category/module screens
- **Purpose**: Context-aware quick actions
- **Position**: Bottom-right corner
- **Features**:
  - Different actions based on current screen
  - Expandable menu on long press
  - Animated appearance

---

## Navigation Patterns

### 1. Home-Based Navigation
```
Home Screen
├── CategoryGrid → /categories/:categoryId
├── GlobalSearchBar → /search
├── QuickActions → /modules/:moduleId
├── RecentlyViewed → (various routes)
└── AppDrawer → /categories/:categoryId
```

### 2. Search Navigation
```
/search
├── Enter query → Filter results
├── Select category filter → Filter by category
└── Tap result → /modules/:moduleId
```

### 3. Category Navigation
```
/categories/:categoryId
├── View modules list
├── Breadcrumbs (Home > Category)
├── Module cards → /modules/:moduleId
└── ContextFAB → Quick actions
```

### 4. Deep Linking
```
appdesignbuild://
├── categories/:categoryId
├── modules/:moduleId
└── search?q=query
```

---

## Usage Examples

### Example 1: Category Navigation
```tsx
import { router } from 'expo-router';

// Navigate to category
router.push(`/categories/${categoryId}`);
```

### Example 2: Search with Pre-filled Query
```tsx
import { router } from 'expo-router';

// Navigate to search with query
router.push(`/search?q=thiết kế`);
```

### Example 3: Open Drawer Programmatically
```tsx
import { useState } from 'react';

const [drawerVisible, setDrawerVisible] = useState(false);

// Open drawer
setDrawerVisible(true);

// In render:
<AppDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
```

### Example 4: Add to Favorites
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@drawer_favorites';

async function toggleFavorite(categoryId: string) {
  const stored = await AsyncStorage.getItem(FAVORITES_KEY);
  const favorites = stored ? JSON.parse(stored) : [];
  
  const newFavorites = favorites.includes(categoryId)
    ? favorites.filter((id: string) => id !== categoryId)
    : [...favorites, categoryId];
  
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
}
```

### Example 5: Track Recent Screens
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecentScreen {
  id: string;
  name: string;
  icon: string;
  route: string;
  timestamp: number;
}

async function addRecentScreen(screen: Omit<RecentScreen, 'timestamp'>) {
  const stored = await AsyncStorage.getItem('@recent_screens');
  const recent: RecentScreen[] = stored ? JSON.parse(stored) : [];
  
  // Remove if exists
  const filtered = recent.filter(r => r.id !== screen.id);
  
  // Add to front with timestamp
  const updated = [{ ...screen, timestamp: Date.now() }, ...filtered].slice(0, 5);
  
  await AsyncStorage.setItem('@recent_screens', JSON.stringify(updated));
}
```

---

## Navigation Hooks

### useSmartBackHandler
```tsx
import { useSmartBackHandler } from '@/hooks/useBackHandler';

// Handles Android back button intelligently
useSmartBackHandler();
```

### useScreenTracking (Analytics)
```tsx
import { useScreenTracking } from '@/hooks/useAnalytics';

// Auto-tracks screen views
useScreenTracking();
```

---

## Best Practices

### 1. Always Use Typed Routes
```tsx
// ❌ Avoid
router.push('/categories/1' as any);

// ✅ Prefer
const categoryRoute = (id: string) => `/categories/${id}` as const;
router.push(categoryRoute('1'));
```

### 2. Handle Navigation Errors
```tsx
try {
  router.push(`/categories/${categoryId}`);
} catch (error) {
  console.error('Navigation error:', error);
  // Show user-friendly error message
}
```

### 3. Track Navigation Events
```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

const { trackCategory, trackNavigation } = useAnalytics();

// Before navigation
trackCategory(categoryId, categoryName);
router.push(`/categories/${categoryId}`);
```

### 4. Use Breadcrumbs for Context
```tsx
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

<Breadcrumbs
  items={[
    { label: 'Home', route: '/' },
    { label: categoryName, route: `/categories/${categoryId}` },
    { label: moduleName },
  ]}
/>
```

### 5. Persist Navigation State
```tsx
// Store last visited route
await AsyncStorage.setItem('@last_route', pathname);

// Restore on app launch
const lastRoute = await AsyncStorage.getItem('@last_route');
if (lastRoute) {
  router.replace(lastRoute);
}
```

---

## Performance Considerations

1. **Lazy Loading**: Categories and modules load on-demand
2. **Memoization**: Use `useMemo` for filtered/sorted lists
3. **AsyncStorage**: Batch reads/writes when possible
4. **Animation Performance**: Use `useNativeDriver: true` for all animations
5. **List Optimization**: Use `FlatList` for large datasets with `keyExtractor`

---

## Accessibility

- **Screen Reader**: All navigation elements have `accessibilityLabel`
- **Touch Targets**: Minimum 44x44pt hit areas
- **Color Contrast**: WCAG AA compliant (4.5:1 minimum)
- **Keyboard Navigation**: Tab order follows visual hierarchy

---

## Troubleshooting

### Issue: Navigation Not Working
**Solution**: Check route format and ensure screen exists
```tsx
// Verify route
console.log('Navigating to:', `/categories/${categoryId}`);
```

### Issue: Drawer Not Opening
**Solution**: Check state management
```tsx
console.log('Drawer visible:', drawerVisible);
setDrawerVisible(true);
```

### Issue: Recent Screens Not Updating
**Solution**: Check AsyncStorage permissions and error handling
```tsx
try {
  await AsyncStorage.setItem(key, value);
} catch (error) {
  console.error('Storage error:', error);
}
```

---

## Future Enhancements

- [ ] Tab navigation for multi-step forms
- [ ] Bottom sheet navigation for modal content
- [ ] Gesture navigation (swipe back)
- [ ] Navigation animations (shared element transitions)
- [ ] Nested navigation (stack within tabs)

---

**Related Documentation**:
- [Category Reference](./CATEGORY_REFERENCE.md)
- [Deep Linking Guide](./DEEP_LINKING_GUIDE.md)
- [Component Library](./COMPONENT_LIBRARY.md)
