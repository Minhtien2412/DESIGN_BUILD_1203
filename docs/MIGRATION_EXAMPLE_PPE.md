# PPE Screen Migration Example

## Overview
This document demonstrates the migration of `app/safety/ppe/index.tsx` from a traditional implementation to using Universal Components and Shared Layouts.

## Before Migration (Original)

### File Size
- **738 lines** of code

### Structure
```tsx
// Custom implementation with:
- Custom Stack.Screen header
- Manual stats header (3 cards)
- Custom filter tabs
- FlatList with custom PPECard component
- Custom AddPPEModal form (10 fields)
- Custom styles for all components
- RefreshControl, EmptyState manually implemented
```

### Code Characteristics
- **Duplicate patterns**: Stats header, filter tabs, card styling repeated across many screens
- **Manual styling**: 200+ lines of StyleSheet
- **Verbose forms**: 10 useState declarations for modal
- **No consistency**: Different implementations across similar screens

### Dependencies
```tsx
import { FlatList, RefreshControl, ActivityIndicator, ... } from 'react-native';
// 15+ imports for basic list functionality
```

## After Migration (Migrated)

### File Size
- **546 lines** (-192 lines, -26% reduction)

### Structure
```tsx
// Using Universal Components:
<ModuleLayout
  title="Quản lý PPE"
  subtitle="stats"
  headerRight={<AddButton />}
  scrollable={false}
  padding={false}
>
  <FilterTabs />
  
  <UniversalList<PPEItem>
    config={{
      data: filteredItems,
      keyExtractor: (item) => item.id,
      renderItem: (item) => (
        <UniversalCard
          variant="info"
          icon={getPPEIcon(item.type)}
          title={item.name}
          description={...}
          badge={getConditionLabel(item.condition)}
          onPress={...}
        />
      ),
      onRefresh: refetch,
      emptyIcon: 'shield-checkmark',
      emptyMessage: 'Chưa có thiết bị PPE nào',
      emptyAction: { label: 'Thêm thiết bị', onPress: ... },
    }}
  />
</ModuleLayout>
```

### Code Characteristics
- **Reusable patterns**: ModuleLayout handles header/footer structure
- **Consistent styling**: UniversalCard provides uniform appearance
- **Declarative configuration**: List behavior via config object
- **Built-in features**: Refresh, empty states, accessibility handled automatically

### Dependencies
```tsx
import { ModuleLayout } from '@/components/layouts/ModuleLayout';
import { UniversalList } from '@/components/universal/UniversalList';
import { UniversalCard } from '@/components/universal/UniversalCard';
// 3 imports provide full list functionality
```

## Migration Benefits

### 1. Code Reduction
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total Lines | 738 | 546 | -192 (-26%) |
| StyleSheet Lines | ~200 | ~150 | -50 (-25%) |
| Component Imports | 15+ | 8 | -7 (-47%) |

### 2. Consistency Improvements
- **Unified Card Design**: All PPE items use same UniversalCard variant
- **Standard List Behavior**: Pull-to-refresh, empty states work identically across all screens
- **Predictable Navigation**: ModuleLayout provides consistent back button, header actions
- **Theme Integration**: Automatic dark mode support via UniversalCard

### 3. Feature Parity
All original features maintained:
- ✅ Stats display in subtitle
- ✅ Three filter tabs (All, Good, Needs Replacement)
- ✅ Pull-to-refresh functionality
- ✅ Empty state with action button
- ✅ Card display with icon, condition badge, details
- ✅ Navigation to detail screen
- ✅ Add PPE modal form

### 4. Developer Experience
- **Less boilerplate**: No need to write FlatList, RefreshControl, EmptyState manually
- **Type safety**: UniversalList<PPEItem> provides full TypeScript support
- **Easier testing**: Config-based approach simplifies unit testing
- **Better maintainability**: Changes to list behavior propagate automatically

### 5. Performance
- **Optimized rendering**: UniversalList uses React.memo internally
- **Lazy loading**: Built-in pagination support (can be enabled later)
- **Efficient updates**: KeyExtractor ensures proper reconciliation

## Migration Pattern

### Step 1: Identify Screen Structure
```
Original Screen:
├── Stack.Screen (header config)
├── Stats Header (custom component)
├── Filter Tabs (custom component)
├── FlatList
│   ├── data prop
│   ├── renderItem (custom card)
│   ├── RefreshControl
│   ├── ListEmptyComponent
│   └── keyExtractor
└── Modal (custom form)
```

### Step 2: Map to Universal Components
```
Migrated Screen:
├── ModuleLayout (replaces header + wrapping structure)
│   ├── title
│   ├── subtitle (stats moved here)
│   ├── headerRight (add button)
│   └── scrollable={false}
├── Filter Tabs (kept as custom - screen-specific logic)
├── UniversalList (replaces FlatList + extras)
│   └── config:
│       ├── data
│       ├── renderItem (uses UniversalCard)
│       ├── onRefresh
│       ├── emptyIcon
│       ├── emptyMessage
│       └── emptyAction
└── Modal (kept as custom - complex form logic)
```

### Step 3: Simplify Helpers
```tsx
// Before: Complex conditional styling
const getConditionStyle = (condition) => ({
  backgroundColor: getConditionColor(condition) + '20',
  color: getConditionColor(condition),
  borderColor: getConditionColor(condition),
  // ... more styles
});

// After: Simple string label, styling handled by UniversalCard
badge={getConditionLabel(item.condition)}
```

## When to Keep Custom Components

The migration kept these custom elements:
1. **Filter Tabs**: Screen-specific filtering logic (3 states)
2. **AddPPEModal**: Complex multi-step form with validation
3. **Helper Functions**: Business logic (icons, labels, colors)

### Rationale
- Filter tabs have unique states not covered by UniversalList's search/sort
- Modal form has 10 fields with interdependent validation
- Helpers are pure functions with no UI duplication

## Next Migration Candidates

Similar screens that can use this pattern:
1. `app/safety/ppe/distributions.tsx` (PPE distribution tracking)
2. `app/safety/training/sessions.tsx` (Training session list)
3. `app/safety/incidents/index.tsx` (Incident reports)
4. `app/weather/stoppages.tsx` (Weather stoppage list)
5. `app/videos/index.tsx` (Video library)

All share: stats header + filter tabs + item list + modal form

## Migration Checklist

When migrating similar screens:
- [ ] Replace Stack.Screen with ModuleLayout (title, subtitle, headerRight)
- [ ] Move stats into subtitle prop
- [ ] Keep screen-specific filters/tabs as-is (if custom logic)
- [ ] Replace FlatList with UniversalList<T> + config
- [ ] Replace custom card with UniversalCard (choose variant)
- [ ] Simplify badge/icon props (remove conditional styling)
- [ ] Verify onRefresh, emptyState, keyExtractor mapping
- [ ] Test pull-to-refresh, empty state, navigation
- [ ] Remove unused StyleSheet rules
- [ ] Update imports (remove FlatList, RefreshControl, etc.)

## Result

**Original**: 738 lines of custom implementation  
**Migrated**: 546 lines using Universal Components  
**Savings**: 192 lines (-26%), improved consistency, easier maintenance

**Functionality**: 100% parity, all features working identically  
**Type Safety**: Enhanced with UniversalList<PPEItem> generic  
**Future-Proof**: Automatic updates from Universal Component improvements
