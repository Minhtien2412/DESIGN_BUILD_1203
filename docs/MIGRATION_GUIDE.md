# Component Migration Guide

## Overview
This guide documents the systematic migration of 50+ duplicate list/card screens to use Universal Components and Shared Layouts.

**Goal**: Reduce component count from 317 → 200 (-37%) while maintaining 100% feature parity.

## Migration Status

### Completed ✅
- `app/safety/ppe/index.tsx` → `index.migrated.tsx` (738 → 546 lines, -26%)

### In Progress 🔄
- Safety module screens (4 remaining)
- Shopping module screens (5 screens)
- Weather module screens (2 screens)

### Pending ⏳
- Form screens (Task 21)
- Detail screens (Task 21)

## Migration Patterns

### Pattern 1: List Screen with Stats + Filters
**Characteristics**:
- Stats header (2-4 metrics)
- Filter tabs or chips
- FlatList with custom cards
- Pull-to-refresh
- Empty state
- Modal for create/edit

**Example Screens**:
- `app/safety/ppe/index.tsx` ✅
- `app/safety/ppe/distributions.tsx`
- `app/safety/training/sessions.tsx`
- `app/weather/stoppages.tsx`
- `app/videos/index.tsx`

**Migration Steps**:
1. Replace Stack.Screen + custom header with `ModuleLayout`
2. Move stats into `subtitle` prop (format as string)
3. Keep filter tabs as custom component (screen-specific logic)
4. Replace FlatList with `UniversalList<T>` config approach
5. Replace custom card with `UniversalCard` (variant: `info` or `compact`)
6. Remove custom RefreshControl, EmptyState, keyExtractor
7. Verify all props map correctly (onRefresh, emptyIcon, emptyMessage, emptyAction)

**Before → After Example**:
```tsx
// Before (738 lines)
<View>
  <Stack.Screen options={{ title: 'PPE', headerRight: ... }} />
  <View style={styles.statsHeader}>
    <StatCard label="Total" value={items.length} />
    <StatCard label="Good" value={goodCount} />
    <StatCard label="Needs Replacement" value={needsCount} />
  </View>
  <FlatList
    data={items}
    renderItem={({ item }) => <PPECard item={item} />}
    RefreshControl={<RefreshControl refreshing={...} onRefresh={...} />}
    ListEmptyComponent={<EmptyState />}
    keyExtractor={...}
  />
</View>

// After (546 lines)
<ModuleLayout
  title="Quản lý PPE"
  subtitle={`${items.length} thiết bị • ${goodCount} tốt • ${needsCount} cần thay`}
  headerRight={<AddButton />}
  scrollable={false}
  padding={false}
>
  <FilterTabs />
  <UniversalList<PPEItem>
    config={{
      data: items,
      keyExtractor: (item) => item.id,
      renderItem: (item) => <UniversalCard variant="info" {...} />,
      onRefresh: refetch,
      emptyIcon: 'shield-checkmark',
      emptyMessage: 'Chưa có dữ liệu',
      emptyAction: { label: 'Thêm mới', onPress: ... },
    }}
  />
</ModuleLayout>
```

### Pattern 2: Simple List Screen (No Filters)
**Characteristics**:
- Title + optional subtitle
- FlatList with cards
- Pull-to-refresh
- Empty state
- No complex filtering

**Example Screens**:
- `app/timeline/index.tsx`
- `app/videos/index.tsx` (if no filters)
- `app/shopping/products-catalog.tsx` (basic mode)

**Migration Steps**:
1. Use `ModuleLayout` with just title/subtitle
2. Replace FlatList with `UniversalList<T>`
3. Use `UniversalCard` variant: `compact` or `image`
4. Set `searchable: true` if needed
5. Remove all custom styling

**Before → After Example**:
```tsx
// Before
<FlatList
  data={items}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={...}>
      <View style={styles.card}>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  )}
/>

// After
<UniversalList<Product>
  config={{
    data: items,
    keyExtractor: (item) => item.id,
    renderItem: (item) => (
      <UniversalCard
        variant="image"
        image={item.image}
        title={item.name}
        description={item.price}
        onPress={...}
      />
    ),
    searchable: true,
    searchPlaceholder: 'Tìm sản phẩm...',
  }}
/>
```

### Pattern 3: List with Tabs
**Characteristics**:
- Tab navigation (2-4 tabs)
- Different data per tab
- FlatList per tab content
- Shared styling

**Example Screens**:
- `app/communications/index.tsx` (Messages/Calls tabs)
- `app/punch-list/index.tsx` (All/Open/Closed tabs)

**Migration Steps**:
1. Keep tab structure (react-native-tab-view or custom)
2. For each tab content: replace FlatList with `UniversalList<T>`
3. Use same `UniversalCard` variant across tabs for consistency
4. Extract shared config to avoid duplication

**Before → After Example**:
```tsx
// Before
<TabView
  navigationState={...}
  renderScene={({ route }) => {
    if (route.key === 'messages') {
      return <FlatList data={messages} renderItem={MessageCard} />;
    }
    return <FlatList data={calls} renderItem={CallCard} />;
  }}
/>

// After
<TabView
  navigationState={...}
  renderScene={({ route }) => {
    const config = route.key === 'messages'
      ? { data: messages, renderItem: (item) => <UniversalCard variant="info" {...} /> }
      : { data: calls, renderItem: (item) => <UniversalCard variant="compact" {...} /> };
    
    return <UniversalList<Message | Call> config={{ ...baseConfig, ...config }} />;
  }}
/>
```

### Pattern 4: Grid Layout
**Characteristics**:
- FlatList with `numColumns={2}` or `numColumns={3}`
- Image-heavy cards
- Shopping/gallery screens

**Example Screens**:
- `app/shopping/[category].tsx`
- `app/shopping/materials-enhanced.tsx`

**Migration Steps**:
1. Use `UniversalList<T>` with `numColumns` in config
2. Use `UniversalCard` variant: `image` or `product`
3. Set `columnWrapperStyle` if custom spacing needed

**Before → After Example**:
```tsx
// Before
<FlatList
  data={products}
  numColumns={2}
  renderItem={({ item }) => <ProductCard item={item} />}
  columnWrapperStyle={styles.row}
/>

// After
<UniversalList<Product>
  config={{
    data: products,
    numColumns: 2,
    keyExtractor: (item) => item.id,
    renderItem: (item) => (
      <UniversalCard
        variant="product"
        image={item.image}
        title={item.name}
        price={item.price}
        badge={item.discount ? '−' + item.discount + '%' : undefined}
        onPress={...}
      />
    ),
    columnWrapperStyle: { gap: 16 },
  }}
/>
```

## UniversalCard Variant Selection

| Variant | Use Case | Features | Example Screens |
|---------|----------|----------|-----------------|
| `default` | Basic info card | Icon, title, description | Settings, About |
| `info` | Detailed items | Icon, title, desc, badge, date | PPE, Training, Incidents |
| `compact` | Dense lists | Small icon, single line | Notifications, Timeline |
| `image` | Media items | Image, title, description | Products, Videos |
| `product` | Shopping | Image, title, price, badge | Shopping catalog |

**Selection Criteria**:
- Use `info` when showing status badges (condition, priority, status)
- Use `compact` for activity feeds, notifications, logs
- Use `image` for content with hero images (videos, articles)
- Use `product` for e-commerce items (price display, discounts)
- Use `default` for simple navigation/settings items

## ModuleLayout Configuration

### Props Mapping
| Original Pattern | ModuleLayout Prop | Notes |
|-----------------|------------------|-------|
| Stack.Screen title | `title` | Required |
| Header stats/count | `subtitle` | Format as string |
| headerRight button | `headerRight` | Pass ReactNode |
| ScrollView wrapper | `scrollable={true}` | Default true |
| SafeAreaView | `safeArea={true}` | Default true |
| Content padding | `padding={true}` | Default true, use `false` for full-width lists |
| Footer buttons | `footerActions` | Array of action objects |

### When to Set `padding={false}`
Use when content needs full width:
- UniversalList (has internal padding)
- Tabs (TabView handles padding)
- Maps, images (edge-to-edge display)

### When to Set `scrollable={false}`
Use when content manages own scrolling:
- FlatList/UniversalList (has internal scrolling)
- TabView (each tab scrolls)
- Complex layouts with nested ScrollViews

## Migration Workflow

### Phase 1: Prepare (5 min)
1. Read entire file (all lines) to understand structure
2. Identify pattern type (see above)
3. List custom components (keep or replace?)
4. Note unique business logic (preserve)
5. Check types/interfaces used

### Phase 2: Create Migrated File (15 min)
1. Create `index.migrated.tsx` (don't overwrite original yet)
2. Replace imports (add ModuleLayout, UniversalList, UniversalCard)
3. Refactor main screen component
4. Preserve helper functions (icons, labels, colors)
5. Keep custom modals/forms (will migrate in Task 21)
6. Simplify StyleSheet (remove duplicate rules)

### Phase 3: Verify (5 min)
1. Run `get_errors` to check TypeScript
2. Fix any type issues (generic parameters, prop mismatches)
3. Compare line counts (should be 20-30% reduction)
4. Review removed code (ensure no business logic lost)

### Phase 4: Test (10 min)
1. Start Metro bundler
2. Navigate to screen in app
3. Test pull-to-refresh
4. Test empty state (clear data temporarily)
5. Test filters/search
6. Test card tap → navigation
7. Test modal open/close
8. Verify all data displays correctly

### Phase 5: Replace Original (2 min)
1. Backup original file: `cp index.tsx index.original.tsx`
2. Move migrated file: `mv index.migrated.tsx index.tsx`
3. Delete backup after confirming app works
4. Commit changes with descriptive message

## Common Issues & Solutions

### Issue 1: UniversalCard badge not showing color
**Problem**: `badge={{ label: 'Status', color: '#FF0000' }}`  
**Cause**: `badge` prop expects string, not object  
**Solution**: Just pass label string: `badge="Status"`. UniversalCard will use theme colors.

### Issue 2: Icon name type error
**Problem**: `Type 'string' is not assignable to Ionicons name type`  
**Cause**: Dynamic icon name from helper function  
**Solution**: Cast to `any`: `icon={getPPEIcon(item.type) as any}`

### Issue 3: ModuleLayout prop not found
**Problem**: `Property 'noPadding' does not exist`  
**Cause**: Wrong prop name  
**Solution**: Use correct prop: `padding={false}` (not `noPadding`)

### Issue 4: UniversalList data not rendering
**Problem**: List shows empty state but data exists  
**Cause**: Not using `config` prop correctly  
**Solution**: Wrap all props in config object:
```tsx
<UniversalList<T>
  config={{
    data: items,
    renderItem: ...,
    keyExtractor: ...,
    // all other props
  }}
/>
```

### Issue 5: TypeScript generic error
**Problem**: `Type 'unknown' is not assignable to type 'PPEItem'`  
**Cause**: Missing generic parameter  
**Solution**: Add type parameter: `<UniversalList<PPEItem> config={{...}} />`

## Code Reduction Metrics

### PPE Screen (Completed)
- **Before**: 738 lines
- **After**: 546 lines
- **Reduction**: 192 lines (-26%)
- **Removed**: Custom FlatList wrapper, RefreshControl, EmptyState component, 50 lines of styles

### Projected Savings (50 screens)
- **Average screen**: 600 lines → 450 lines (150 line reduction)
- **Total reduction**: 50 screens × 150 lines = **7,500 lines**
- **Percentage**: -25% average code reduction
- **Component consolidation**: 50 duplicate cards → 5 UniversalCard variants

## Best Practices

### DO ✅
- Use TypeScript generics: `UniversalList<PPEItem>`
- Keep screen-specific business logic (filters, calculations)
- Preserve helper functions (icons, labels, colors)
- Test thoroughly after migration
- Document any behavior changes

### DON'T ❌
- Mix custom cards with UniversalCard (choose one)
- Remove error handling during migration
- Change business logic while migrating
- Migrate complex forms yet (wait for Task 21)
- Skip TypeScript error checking

## Next Steps

### Immediate (Task 20 continuation)
1. Migrate 4 more Safety screens
2. Migrate 5 Shopping screens
3. Migrate 2 Weather screens
4. Total: 12 screens migrated

### Future (Task 21)
1. Create FormScreen migration pattern
2. Migrate create/edit modal forms
3. Use UniversalForm for consistent field rendering
4. Use FormLayout for multi-step forms

## Reference Files

- **Example Migration**: `docs/MIGRATION_EXAMPLE_PPE.md`
- **Universal Components**: `components/universal/` folder
- **Shared Layouts**: `components/layouts/` folder
- **Component Library Docs**: `docs/COMPONENT_LIBRARY.md`

## Questions?

Common questions during migration:

**Q: What if my card has unique fields?**  
A: Use UniversalCard for consistent wrapper, but customize `description` to include all info. Format with bullet points or line breaks.

**Q: My list has complex sorting/filtering?**  
A: Keep custom filter UI, just use UniversalList for display. You control `data` prop, UniversalList handles rendering.

**Q: Should I migrate modal forms now?**  
A: No, keep existing forms for Task 20. Task 21 will migrate all forms systematically.

**Q: What about screens with multiple lists?**  
A: Use multiple `UniversalList` components, each with own config. Works great for tab-based screens.

**Q: My screen is only 200 lines, should I migrate?**  
A: Yes if it uses FlatList + custom cards. Consistency is more valuable than line count reduction.

---

*Last updated: Task 20 - PPE screen completed*
