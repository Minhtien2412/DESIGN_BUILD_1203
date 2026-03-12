# ⚡ Performance Optimization Guide - React Native

**Target:** 60fps animations, < 2s load time, < 50MB bundle  
**Applies to:** Expo Router + React 19 + TypeScript

---

## 📊 Performance Audit Checklist

Run this BEFORE optimizing to establish baseline:

```bash
# 1. Profile app performance
npx react-native start --reset-cache
# Open app → Dev Menu → Enable Perf Monitor

# 2. Analyze bundle size
npx expo export --platform android
# Check android/build output size

# 3. Memory profiling
# Dev Menu → Show Perf Monitor
# Monitor JS Heap, Views, RAM

# 4. Network monitoring
# Use React Native Debugger → Network tab
# Or Flipper → Network plugin
```

**Baseline Metrics:**
```
FPS: _____ (target: 60)
Load Time: _____ s (target: < 2s)
Bundle Size: _____ MB (target: < 50MB)
Memory: _____ MB (target: < 150MB)
API Latency: _____ ms (target: < 500ms)
```

---

## 🎯 Optimization Priority Matrix

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| FlatList instead of ScrollView | HIGH | LOW | 🔥 DO FIRST |
| Image optimization | HIGH | LOW | 🔥 DO FIRST |
| Remove console.log | MEDIUM | LOW | 🔥 DO FIRST |
| Memoization | HIGH | MEDIUM | ⚡ HIGH |
| Code splitting | MEDIUM | MEDIUM | ⚡ HIGH |
| Bundle size reduction | MEDIUM | HIGH | 🟡 MEDIUM |
| Native module migration | LOW | HIGH | 🟢 LOW |

---

## 1️⃣ List Rendering Optimization

### Problem: ScrollView with 100+ items = Laggy scroll

❌ **BAD - Current Implementation:**
```tsx
<ScrollView>
  {products.map(product => (
    <ProductCard key={product.id} {...product} />
  ))}
</ScrollView>
```

✅ **GOOD - Use FlatList:**
```tsx
<FlatList
  data={products}
  renderItem={({ item }) => <ProductCard {...item} />}
  keyExtractor={item => item.id}
  
  // Performance props
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  
  // Optimizations
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  
  // Better than onEndReached for pagination
  onEndReachedThreshold={0.5}
  onEndReached={loadMore}
/>
```

### FlashList (Even Faster)

```bash
npm install @shopify/flash-list
```

```tsx
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={products}
  renderItem={({ item }) => <ProductCard {...item} />}
  estimatedItemSize={120}  // Average item height
/>
```

**Apply to:**
- [ ] `app/(tabs)/index.tsx` - Products list
- [ ] `app/(tabs)/shop.tsx` - Projects list  
- [ ] `app/cart.tsx` - Cart items
- [ ] `app/orders/index.tsx` - Order history
- [ ] `app/notifications.tsx` - Notifications

**Expected Result:** 30-40% FPS improvement on scroll

---

## 2️⃣ Image Optimization

### Problem: Images load slowly and consume memory

❌ **BAD:**
```tsx
<Image 
  source={{ uri: product.image }} 
  style={{ width: 200, height: 200 }}
/>
```

✅ **GOOD - Use expo-image:**
```bash
npx expo install expo-image
```

```tsx
import { Image } from 'expo-image';

<Image
  source={{ uri: product.image }}
  style={{ width: 200, height: 200 }}
  
  // Placeholder while loading
  placeholder={blurhash}
  
  // Cache images
  cachePolicy="memory-disk"
  
  // Responsive images
  contentFit="cover"
  
  // Transition animation
  transition={200}
/>
```

### Generate Blurhash Placeholders

```typescript
// utils/blurhash.ts
import { encode } from 'blurhash';

export const generateBlurhash = async (imageUrl: string) => {
  // Generate blurhash on backend
  // Store in product.blurhash field
  return "LEHV6nWB2yk8pyo0adR*.7kCMdnj";
};
```

### Image Caching Strategy

```typescript
// services/imageCache.ts
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';

const cacheDir = FileSystem.cacheDirectory + 'images/';

export const preloadImages = async (urls: string[]) => {
  await Promise.all(
    urls.map(url => Image.prefetch(url))
  );
};

export const clearImageCache = async () => {
  await Image.clearMemoryCache();
  await Image.clearDiskCache();
};
```

**Apply to:**
- [ ] ProductCard thumbnails
- [ ] Product detail carousel
- [ ] User avatars
- [ ] Project images

**Expected Result:** 50% faster image load, 30% less memory

---

## 3️⃣ Component Memoization

### Problem: Components re-render unnecessarily

❌ **BAD - Re-renders every time parent updates:**
```tsx
function ProductCard({ product, onPress }) {
  return (
    <Pressable onPress={() => onPress(product.id)}>
      <Text>{product.name}</Text>
      <Text>{product.price}</Text>
    </Pressable>
  );
}
```

✅ **GOOD - Memoized with stable callbacks:**
```tsx
import { memo, useCallback } from 'react';

const ProductCard = memo(({ product, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(product.id);
  }, [product.id, onPress]);
  
  return (
    <Pressable onPress={handlePress}>
      <Text>{product.name}</Text>
      <Text>{product.price.toLocaleString()}</Text>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.price === nextProps.product.price;
});
```

### useMemo for Expensive Calculations

```tsx
// ❌ BAD - Recalculates every render
function CartTotal({ items }) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return <Text>{total}</Text>;
}

// ✅ GOOD - Cached calculation
function CartTotal({ items }) {
  const total = useMemo(() => 
    items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items]
  );
  return <Text>{total}</Text>;
}
```

### useCallback for Event Handlers

```tsx
// ❌ BAD - New function every render
function ProductList({ products }) {
  return products.map(p => (
    <ProductCard 
      key={p.id}
      product={p}
      onPress={() => router.push(`/product/${p.id}`)}  // NEW FUNCTION!
    />
  ));
}

// ✅ GOOD - Stable function reference
function ProductList({ products }) {
  const handlePress = useCallback((id: string) => {
    router.push(`/product/${id}`);
  }, []);
  
  return products.map(p => (
    <ProductCard 
      key={p.id}
      product={p}
      onPress={handlePress}
    />
  ));
}
```

**Apply to:**
- [ ] ProductCard
- [ ] MenuCard
- [ ] CartItem
- [ ] ProjectCard

**Expected Result:** 20-30% less re-renders

---

## 4️⃣ Bundle Size Reduction

### Current Bundle Analysis

```bash
# Analyze what's in your bundle
npx expo export --dump-sourcemap
npx source-map-explorer dist/**/*.js
```

### Tree-shaking Optimization

❌ **BAD - Imports entire library:**
```typescript
import _ from 'lodash';
import moment from 'moment';
import * as Icons from '@expo/vector-icons';

const sorted = _.sortBy(items, 'price');
const date = moment().format('YYYY-MM-DD');
```

✅ **GOOD - Import only what you need:**
```typescript
import sortBy from 'lodash-es/sortBy';  // ES6 modules (tree-shakeable)
import { format } from 'date-fns';      // Lighter than moment
import { Ionicons } from '@expo/vector-icons';  // Specific icon set

const sorted = sortBy(items, 'price');
const date = format(new Date(), 'yyyy-MM-dd');
```

### Remove Unused Dependencies

```bash
# Find unused deps
npx depcheck

# Remove them
npm uninstall unused-package
```

**Common Heavy Packages to Replace:**

| Heavy | Lighter Alternative | Size Saved |
|-------|-------------------|------------|
| `moment` | `date-fns` | ~200KB |
| `lodash` | `lodash-es` + tree-shaking | ~70KB |
| `react-native-vector-icons` (all) | `@expo/vector-icons` (one set) | ~500KB |
| `axios` | `fetch` API | ~50KB |

### Code Splitting with Lazy Loading

```typescript
// ❌ BAD - Loads everything upfront
import ProjectCanvas from './components/ProjectCanvas';
import PDFViewer from './components/PDFViewer';

// ✅ GOOD - Loads on demand
const ProjectCanvas = lazy(() => import('./components/ProjectCanvas'));
const PDFViewer = lazy(() => import('./components/PDFViewer'));

function ProjectDetail() {
  return (
    <Suspense fallback={<Loader />}>
      {showCanvas && <ProjectCanvas />}
    </Suspense>
  );
}
```

**Apply to:**
- [ ] Heavy screens (Canvas, Charts)
- [ ] PDF viewer
- [ ] Video player
- [ ] Map components

**Expected Result:** 30-40% smaller initial bundle

---

## 5️⃣ Animation Performance

### Problem: Janky animations (< 60fps)

❌ **BAD - JS thread animations:**
```tsx
const [scale, setScale] = useState(1);

<Animated.View style={{ transform: [{ scale }] }}>
  <Pressable onPress={() => setScale(0.95)}>
    <Text>Press me</Text>
  </Pressable>
</Animated.View>
```

✅ **GOOD - Native animations with Reanimated:**
```typescript
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring 
} from 'react-native-reanimated';

function AnimatedButton() {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  return (
    <Animated.View style={animatedStyle}>
      <Pressable 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text>Press me</Text>
      </Pressable>
    </Animated.View>
  );
}
```

### LayoutAnimation for Simple Transitions

```typescript
import { LayoutAnimation, UIManager, Platform } from 'react-native';

// Enable on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function CollapsibleSection() {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  
  return (
    <View>
      <Pressable onPress={toggleExpanded}>
        <Text>Toggle</Text>
      </Pressable>
      {expanded && <Text>Content</Text>}
    </View>
  );
}
```

**Apply to:**
- [ ] Button press feedback
- [ ] Card expand/collapse
- [ ] Sheet modals
- [ ] Tab transitions

**Expected Result:** Smooth 60fps animations

---

## 6️⃣ API & Network Optimization

### Request Batching

```typescript
// ❌ BAD - 3 separate requests
const user = await apiFetch('/users/123');
const orders = await apiFetch('/orders?userId=123');
const projects = await apiFetch('/projects?userId=123');

// ✅ GOOD - 1 batch request
const data = await apiFetch('/users/123/dashboard');
// Returns: { user, orders, projects }
```

### Request Caching

```typescript
// utils/apiCache.ts
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function cachedFetch(url: string) {
  const cached = cache.get(url);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await apiFetch(url);
  cache.set(url, { data, timestamp: Date.now() });
  
  return data;
}
```

### Optimistic Updates

```typescript
// ❌ BAD - Wait for API response
async function addToCart(product) {
  setLoading(true);
  try {
    await apiAddToCart(product);
    await refreshCart();  // Refetch
  } finally {
    setLoading(false);
  }
}

// ✅ GOOD - Update UI immediately
async function addToCart(product) {
  // Update UI instantly
  setCartItems(prev => [...prev, product]);
  
  try {
    // Sync with backend in background
    await apiAddToCart(product);
  } catch (error) {
    // Rollback on error
    setCartItems(prev => prev.filter(p => p.id !== product.id));
    Alert.alert('Failed to add to cart');
  }
}
```

### Pagination & Infinite Scroll

```typescript
function ProductList() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const newProducts = await apiFetch(`/products?page=${page}&limit=20`);
      
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(page + 1);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard {...item} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <Loader /> : null}
    />
  );
}
```

**Expected Result:** 50% faster perceived load time

---

## 7️⃣ Memory Management

### Cleanup Subscriptions

```typescript
// ❌ BAD - Memory leak
useEffect(() => {
  const subscription = eventEmitter.on('update', handleUpdate);
  // Missing cleanup!
}, []);

// ✅ GOOD - Proper cleanup
useEffect(() => {
  const subscription = eventEmitter.on('update', handleUpdate);
  
  return () => {
    subscription.remove();  // Cleanup
  };
}, []);
```

### Clear Timers

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    // Do something
  }, 1000);
  
  return () => clearTimeout(timer);
}, []);
```

### Release Heavy Resources

```typescript
// Clear image cache when low memory
useEffect(() => {
  const handleMemoryWarning = async () => {
    await Image.clearMemoryCache();
  };
  
  // Listen for memory warnings
  const subscription = AppState.addEventListener('memoryWarning', handleMemoryWarning);
  
  return () => subscription.remove();
}, []);
```

---

## 8️⃣ Startup Time Optimization

### Reduce Initial Imports

```typescript
// app/_layout.tsx

// ❌ BAD - Heavy imports upfront
import './utils/analytics';  // 50KB
import './utils/crashReporting';  // 30KB
import './utils/notifications';  // 40KB

// ✅ GOOD - Lazy load non-critical
useEffect(() => {
  // Load after app is interactive
  import('./utils/analytics');
  import('./utils/crashReporting');
}, []);
```

### Async Initialization

```typescript
function App() {
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          'Inter': require('./assets/fonts/Inter.ttf'),
        });
        
        // Load cached data
        await loadAuthToken();
        await loadCartItems();
        
        // Preload critical images
        await Image.prefetch(CRITICAL_IMAGES);
      } finally {
        setReady(true);
      }
    }
    
    prepare();
  }, []);
  
  if (!ready) {
    return <SplashScreen />;
  }
  
  return <RootNavigator />;
}
```

---

## 🎯 Performance Monitoring

### Production Monitoring Setup

```typescript
// utils/performance.ts
import * as Sentry from '@sentry/react-native';

export function trackScreenLoad(screenName: string, duration: number) {
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `${screenName} loaded in ${duration}ms`,
    level: 'info',
  });
  
  if (duration > 2000) {
    Sentry.captureMessage(`Slow screen load: ${screenName}`);
  }
}

export function trackAPICall(endpoint: string, duration: number) {
  if (duration > 1000) {
    Sentry.captureMessage(`Slow API call: ${endpoint} (${duration}ms)`);
  }
}
```

### Custom Performance Marks

```typescript
import { performance } from 'perf_hooks';

// Mark start
performance.mark('product-list-start');

// Load products
await loadProducts();

// Mark end
performance.mark('product-list-end');

// Measure duration
performance.measure('product-list-load', 'product-list-start', 'product-list-end');

const [measure] = performance.getEntriesByName('product-list-load');
console.log(`Products loaded in ${measure.duration}ms`);
```

---

## 📋 Optimization Checklist

**Week 1: Critical Optimizations**
- [ ] Replace all ScrollView with FlatList
- [ ] Migrate Image to expo-image
- [ ] Add memoization to ProductCard, CartItem
- [ ] Remove all console.log statements
- [ ] Add loading skeletons

**Week 2: Bundle & Network**
- [ ] Replace lodash with lodash-es
- [ ] Replace moment with date-fns
- [ ] Implement request caching
- [ ] Add pagination to lists
- [ ] Lazy load heavy components

**Week 3: Polish**
- [ ] Native animations with Reanimated
- [ ] Memory leak cleanup
- [ ] Startup time optimization
- [ ] Production monitoring setup

**Target Results:**
- 🎯 60fps animations
- 🎯 < 2s app launch
- 🎯 < 50MB APK size
- 🎯 < 150MB memory usage

---

**Last Updated:** December 24, 2025  
**Version:** 1.0.0
