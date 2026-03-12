# 🚀 Quick Reference - Week 1 Implementations

## 📱 Skeleton Loading

**Import:**
```tsx
import { ProductCardSkeleton, CartItemSkeleton, ProfileHeaderSkeleton } from '@/components/ui/skeletons';
```

**Basic Usage:**
```tsx
{loading ? <ProductCardSkeleton /> : <ProductCard {...product} />}
```

**Multiple Items:**
```tsx
{loading ? (
  Array(3).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
) : (
  products.map(p => <ProductCard key={p.id} {...p} />)
)}
```

---

## 🔔 Toast Notifications

**Import:**
```tsx
import Toast from 'react-native-toast-message';
```

**Success Toast:**
```tsx
Toast.show({
  type: 'success',
  text1: 'Thành công!',
  text2: 'Đã lưu thay đổi',
  position: 'bottom',
  visibilityTime: 2000,
});
```

**Error Toast:**
```tsx
Toast.show({
  type: 'error',
  text1: 'Lỗi!',
  text2: error.message,
  position: 'bottom',
});
```

**Info Toast:**
```tsx
Toast.show({
  type: 'info',
  text1: 'Thông tin',
  text2: 'Đã xóa khỏi danh sách',
  position: 'bottom',
});
```

---

## 📭 Empty State

**Import:**
```tsx
import EmptyState from '@/components/ui/empty-state';
```

**Basic Usage:**
```tsx
<EmptyState
  title="Giỏ hàng trống"
  message="Hãy thêm sản phẩm vào giỏ hàng"
/>
```

**With Action Button:**
```tsx
<EmptyState
  variant="search"
  icon="search-outline"
  title="Không tìm thấy kết quả"
  message="Thử tìm kiếm với từ khóa khác"
  actionLabel="Xóa bộ lọc"
  onAction={() => clearFilters()}
/>
```

**Variants:**
- `default` - Gray icon (folder-open-outline)
- `search` - Blue icon (search-outline)
- `error` - Red icon (alert-circle-outline)
- `info` - Blue icon (information-circle-outline)

---

## 📜 FlatList Optimization

**Import:**
```tsx
import { FlatList, RefreshControl } from 'react-native';
```

**Basic FlatList:**
```tsx
<FlatList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  keyExtractor={item => item.id}
  ListEmptyComponent={<EmptyState title="Không có dữ liệu" />}
/>
```

**Optimized FlatList:**
```tsx
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  
  // Performance props
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={5}
  removeClippedSubviews={Platform.OS === 'android'}
  
  // Pull-to-refresh
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#2563EB"
    />
  }
  
  // Empty state
  ListEmptyComponent={<EmptyState title="Không có dữ liệu" />}
/>
```

**Memoized Item:**
```tsx
const MemoizedItem = memo<{ item: Product }>(({ item }) => (
  <ProductCard {...item} />
));

const renderItem = ({ item }: { item: Product }) => (
  <MemoizedItem item={item} />
);
```

---

## 🎨 Complete Screen Example

```tsx
import { useState, useCallback, memo } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { ProductCardSkeleton } from '@/components/ui/skeletons';
import EmptyState from '@/components/ui/empty-state';

// Memoized item component
const ProductItem = memo<{ item: Product }>(({ item }) => (
  <ProductCard {...item} />
));

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data
  const fetchProducts = useCallback(async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi tải dữ liệu',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [fetchProducts]);

  // Render item
  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ProductItem item={item} />
  ), []);

  // Key extractor
  const keyExtractor = useCallback((item: Product) => item.id, []);

  if (loading) {
    return (
      <View style={{ padding: 16 }}>
        {Array(5).fill(0).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={10}
      windowSize={5}
      removeClippedSubviews
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <EmptyState
          title="Chưa có sản phẩm"
          message="Sản phẩm sẽ xuất hiện ở đây"
        />
      }
    />
  );
}
```

---

## 🎯 Performance Checklist

✅ Use `FlatList` instead of `ScrollView` for lists  
✅ Memoize item components with `memo()`  
✅ Use `useCallback` for render functions  
✅ Add skeleton loading states  
✅ Show empty states for empty lists  
✅ Add pull-to-refresh  
✅ Use `initialNumToRender`, `windowSize`  
✅ Enable `removeClippedSubviews` on Android  
✅ Show toast notifications for actions  
✅ Keep components small (< 50 LOC)  

---

## 🔧 Common Patterns

### Loading State Pattern:
```tsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData().finally(() => setLoading(false));
}, []);
```

### Refresh Pattern:
```tsx
const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await fetchData();
  setRefreshing(false);
};
```

### Action with Toast Pattern:
```tsx
const handleDelete = async (id: string) => {
  try {
    await api.delete(id);
    Toast.show({
      type: 'success',
      text1: 'Đã xóa',
    });
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Lỗi',
      text2: error.message,
    });
  }
};
```

---

## 📦 Available Skeleton Components

1. `<Skeleton />` - Base component (custom size)
2. `<ProductCardSkeleton />` - Product cards
3. `<ProjectCardSkeleton />` - Project cards
4. `<ListItemSkeleton />` - Generic list items
5. `<CartItemSkeleton />` - Cart items
6. `<ProfileHeaderSkeleton />` - Profile header
7. `<NotificationSkeleton />` - Notifications

---

## 🎨 Theme Colors

Use `useThemeColor()` hook for theme-aware colors:

```tsx
import { useThemeColor } from '@/hooks/use-theme-color';

const textColor = useThemeColor({}, 'text');
const backgroundColor = useThemeColor({}, 'background');
```

---

## 📝 TypeScript Tips

Always type your props:
```tsx
interface ProductItemProps {
  item: Product;
  onPress?: (id: string) => void;
}

const ProductItem = memo<ProductItemProps>(({ item, onPress }) => {
  // ...
});
```

---

## 🚀 Next Steps

1. Replace current Home screen with FlatList version
2. Apply skeleton loading to Shop, Cart, Notifications
3. Add empty states to all list screens
4. Test performance on device
5. Measure FPS with React DevTools

---

**See Full Documentation:**
- `docs/QUICK_WINS_SUMMARY.md` - Complete implementation details
- `docs/PERFORMANCE_GUIDE.md` - Performance optimization strategies
- `docs/FE_QUICK_START.md` - Day-by-day implementation guide
