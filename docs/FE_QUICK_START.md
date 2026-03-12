# 🚀 Quick Start - Frontend Development

**Bắt đầu phát triển FE ngay hôm nay!**

---

## 📋 Preparation (15 phút)

### 1. Kiểm tra môi trường

```bash
# Check Node.js version (cần >= 18)
node --version

# Check npm version
npm --version

# Check Expo CLI
npx expo --version

# Verify backend is running
curl https://baotienweb.cloud/api/v1/health
```

### 2. Install dependencies nếu chưa có

```bash
cd "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025"
npm install
```

### 3. Clear cache (nếu có lỗi)

```bash
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
npx expo start --clear
```

---

## 🎯 Week 1 Plan (Quick Wins)

### Day 1-2: Loading & Empty States

**Mục tiêu:** Cải thiện UX ngay lập tức với minimal effort

**Step 1: Install skeleton library (5 phút)**
```bash
npm install react-native-skeleton-content
```

**Step 2: Create skeleton components (30 phút)**

Tạo file `components/ui/skeletons.tsx`:
```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonContent from 'react-native-skeleton-content';

export function ProductCardSkeleton() {
  return (
    <SkeletonContent
      containerStyle={styles.container}
      isLoading={true}
      layout={[
        { key: 'image', width: '100%', height: 150, borderRadius: 12, marginBottom: 12 },
        { key: 'title', width: '80%', height: 16, borderRadius: 4, marginBottom: 8 },
        { key: 'price', width: '40%', height: 14, borderRadius: 4 },
      ]}
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <SkeletonContent
      containerStyle={styles.container}
      isLoading={true}
      layout={[
        { key: 'header', flexDirection: 'row', children: [
          { key: 'icon', width: 40, height: 40, borderRadius: 12 },
          { key: 'text', marginLeft: 12, children: [
            { key: 'title', width: 120, height: 14, marginBottom: 6 },
            { key: 'subtitle', width: 80, height: 12 },
          ]},
        ]},
        { key: 'progress', width: '100%', height: 8, borderRadius: 4, marginTop: 16 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
});
```

**Step 3: Apply to Home screen (15 phút)**

Sửa `app/(tabs)/index.tsx`:
```tsx
import { ProductCardSkeleton } from '@/components/ui/skeletons';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  
  // ... existing code
  
  if (loading) {
    return (
      <ScrollView>
        <Container>
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </Container>
      </ScrollView>
    );
  }
  
  return (
    // ... existing product list
  );
}
```

**Step 4: Create empty state component (30 phút)**

Tạo file `components/ui/empty-state.tsx`:
```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const colors = useThemeColor();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
        <Ionicons name={icon as any} size={48} color={colors.textMuted} />
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
      
      {actionLabel && onAction && (
        <Pressable 
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={onAction}
        >
          <Text style={[styles.buttonText, { color: colors.bg }]}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
```

**Step 5: Apply empty states (30 phút)**

Sửa `app/cart.tsx`:
```tsx
import { EmptyState } from '@/components/ui/empty-state';

export default function CartScreen() {
  const { items } = useCart();
  
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="cart-outline"
          title="Giỏ hàng trống"
          description="Bạn chưa thêm sản phẩm nào vào giỏ hàng"
          actionLabel="Mua sắm ngay"
          onAction={() => router.push('/')}
        />
      </SafeAreaView>
    );
  }
  
  return (
    // ... existing cart UI
  );
}
```

**✅ Checkpoint Day 1-2:**
- [ ] Skeleton loading works on Home screen
- [ ] Empty cart shows nice empty state
- [ ] No console errors
- [ ] Test on phone/simulator

---

### Day 3: Toast Notifications

**Step 1: Install library (2 phút)**
```bash
npm install react-native-toast-message
```

**Step 2: Setup in layout (10 phút)**

Sửa `app/_layout.tsx`:
```tsx
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack>
          {/* ... existing screens */}
        </Stack>
        <Toast />  {/* Add this at the end */}
      </CartProvider>
    </AuthProvider>
  );
}
```

**Step 3: Use in Cart (10 phút)**

Sửa `context/CartContext.tsx`:
```tsx
import Toast from 'react-native-toast-message';

export function CartProvider({ children }) {
  // ... existing code
  
  const add = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, qty: item.qty + quantity }
            : item
        );
      }
      return [...prev, { ...product, qty: quantity }];
    });
    
    // Show toast
    Toast.show({
      type: 'success',
      text1: 'Đã thêm vào giỏ hàng',
      text2: product.name,
      position: 'bottom',
      visibilityTime: 2000,
    });
  };
  
  const remove = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
    
    Toast.show({
      type: 'info',
      text1: 'Đã xóa khỏi giỏ hàng',
      position: 'bottom',
      visibilityTime: 1500,
    });
  };
  
  // ... rest of context
}
```

**✅ Checkpoint Day 3:**
- [ ] Toast shows when add to cart
- [ ] Toast shows when remove from cart
- [ ] Toast auto-dismisses after 2s
- [ ] No crashes

---

### Day 4-5: Performance - FlatList Migration

**Ưu tiên:** Home screen (Product list)

**Step 1: Backup current code (2 phút)**
```bash
# Copy current file
Copy-Item "app\(tabs)\index.tsx" "app\(tabs)\index.backup.tsx"
```

**Step 2: Replace ScrollView with FlatList (30 phút)**

Sửa `app/(tabs)/index.tsx`:
```tsx
import { FlatList, RefreshControl } from 'react-native';

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadProducts = async () => {
    try {
      const data = await apiFetch('/products');
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  // Skeleton loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Container>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </Container>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            {...item}
            onPress={() => router.push(`/product/${item.id}`)}
            onAddToCart={() => addToCart(item)}
          />
        )}
        keyExtractor={item => item.id}
        
        // Performance optimizations
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        
        // Pull to refresh
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        
        // Header & footer
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>Sản phẩm nổi bật</Text>
          </View>
        )}
        
        ListFooterComponent={() => <View style={{ height: 20 }} />}
        
        // Empty state
        ListEmptyComponent={() => (
          <EmptyState
            icon="cube-outline"
            title="Không có sản phẩm"
            description="Chưa có sản phẩm nào được thêm"
          />
        )}
        
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
});
```

**Step 3: Test performance (10 phút)**
- Open app on phone
- Enable Perf Monitor (Dev Menu → Show Perf Monitor)
- Scroll product list
- Check FPS stays at 60

**✅ Checkpoint Day 4-5:**
- [ ] FlatList works smoothly
- [ ] Pull-to-refresh works
- [ ] 60fps when scrolling
- [ ] Empty state shows if no products

---

## 📅 Week 2-3 Preview

**Week 2: Checkout Flow**
- Delivery address form
- Payment method selector
- Order confirmation

**Week 3: Projects Module**
- Project detail screen
- Timeline chart
- Document upload

---

## 🛠️ Development Tools

### 1. Start Dev Server

```bash
cd "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025"
npx expo start --clear
```

### 2. Run on Phone
- Scan QR code with Expo Go app
- Or press `a` for Android emulator
- Or press `i` for iOS simulator

### 3. Debug Tools
- Press `m` to open Dev Menu
- "Show Perf Monitor" - Check FPS
- "Toggle Element Inspector" - Inspect UI
- React Native Debugger (separate app)

### 4. Type Check

```bash
npx tsc --noEmit
```

### 5. Test Backend Connection

```bash
curl https://baotienweb.cloud/api/v1/health
```

---

## 📝 Daily Workflow

**Morning (30 min):**
1. Pull latest code
2. npm install (if package.json changed)
3. Clear cache if needed
4. Start dev server
5. Check backend health

**Coding (4-6 hours):**
1. Pick 1 task from roadmap
2. Create branch: `feature/task-name`
3. Implement with tests
4. Test on phone
5. Check for console errors

**Wrap up (30 min):**
1. Commit changes
2. Push to GitHub
3. Update progress doc
4. Plan tomorrow's task

---

## 🚨 Common Issues & Fixes

### Issue 1: Metro Bundler không start

**Fix:**
```bash
Remove-Item -Path "node_modules\.cache" -Recurse -Force
Remove-Item -Path ".expo" -Recurse -Force
npx expo start --clear
```

### Issue 2: TypeScript errors

**Fix:**
```bash
npm install --save-dev @types/react @types/react-native
npx tsc --noEmit
```

### Issue 3: Cannot connect to backend

**Check:**
```bash
# Test from PowerShell
Invoke-RestMethod https://baotienweb.cloud/api/v1/health

# Test from app
# Change baseURL in services/api.ts if needed
```

### Issue 4: Image không hiển thị

**Fix:**
- Đảm bảo require base image: `require('./logo.png')`
- KHÔNG require @2x: `require('./logo@2x.png')` ❌
- Check image path chính xác

### Issue 5: Dark mode broken

**Check:**
- Mọi color dùng từ `useThemeColor()`
- Không hardcode colors
- Test cả light và dark mode

---

## 📚 Learning Resources

**React Native:**
- https://reactnative.dev/docs/getting-started
- https://docs.expo.dev/

**UI/UX:**
- [UI_COMPONENTS.md](./UI_COMPONENTS.md) - Design system
- [UX_UI_GUIDE.md](./UX_UI_GUIDE.md) - UX patterns

**Performance:**
- [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) - Optimization tips

**API:**
- [API_REFERENCE.md](./API_REFERENCE.md) - Backend endpoints

---

## 🎯 Success Metrics

**After Week 1:**
- [ ] 5+ screens have skeleton loading
- [ ] Toast notifications work
- [ ] FlatList on Home screen
- [ ] 8+ empty states created

**After Week 3:**
- [ ] Checkout flow complete
- [ ] Project detail with timeline
- [ ] 60fps animations
- [ ] All lists use FlatList

**After Week 6:**
- [ ] All features from MVP complete
- [ ] < 2s app launch
- [ ] < 50MB APK size
- [ ] Zero console warnings

---

## 💬 Daily Standup Template

**Yesterday:**
- ✅ Completed: [Task name]
- ❌ Blocked: [Issue description]

**Today:**
- 🎯 Working on: [Task name]
- ⏰ Expected completion: [Time]

**Blockers:**
- None / [Describe blocker]

---

## 📞 Need Help?

1. Check [docs/](.) folder for guides
2. Search React Native docs
3. Ask on Stack Overflow
4. Review existing code in `components/ui/`

---

**Start now: Pick Day 1 task and begin! 🚀**

**Last Updated:** December 24, 2025  
**Version:** 1.0.0
