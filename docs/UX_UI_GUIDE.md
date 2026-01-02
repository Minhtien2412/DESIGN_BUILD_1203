# 🎨 UX/UI Enhancement Guide

**Mục tiêu:** Tạo trải nghiệm người dùng mượt mà, trực quan, và chuyên nghiệp

---

## 🌟 Nguyên Tắc UX Cốt Lõi

### 1. Phản Hồi Tức Thì (Immediate Feedback)
Người dùng phải **luôn biết** hệ thống đang làm gì.

**Áp dụng:**
- Button press → Scale animation + haptic feedback
- API call → Loading indicator
- Success/Error → Toast notification
- Long process → Progress bar

### 2. Giảm Thiểu Nhận Thức (Minimize Cognitive Load)
Giữ mọi thứ đơn giản, rõ ràng.

**Áp dụng:**
- Max 3-4 actions per screen
- Consistent layouts
- Clear labels
- Hide advanced options

### 3. Dự Đoán Hành Vi (Anticipate Needs)
Hiểu người dùng muốn gì tiếp theo.

**Áp dụng:**
- Preload next screen
- Smart defaults
- Recently used items
- Auto-save drafts

### 4. Tha Thứ Lỗi (Forgiving Errors)
Cho phép hoàn tác, xác nhận hành động nguy hiểm.

**Áp dụng:**
- Undo cart removal (5s window)
- Confirm delete actions
- Save drafts automatically
- Offline mode with sync

---

## 🎯 Cải Tiến UX Ưu Tiên Cao

### 1. Loading States (Skeleton Screens)

**❌ Hiện tại (BAD):**
```tsx
{loading && <ActivityIndicator />}
{!loading && products.map(p => <ProductCard {...p} />)}
```

**✅ Nên dùng (GOOD):**
```bash
npm install react-native-skeleton-content
```

```tsx
import SkeletonContent from 'react-native-skeleton-content';

<SkeletonContent
  isLoading={loading}
  containerStyle={{ flex: 1 }}
  layout={[
    { key: 'card1', width: '100%', height: 120, marginBottom: 12, borderRadius: 12 },
    { key: 'card2', width: '100%', height: 120, marginBottom: 12, borderRadius: 12 },
    { key: 'card3', width: '100%', height: 120, marginBottom: 12, borderRadius: 12 },
  ]}
>
  {products.map(p => <ProductCard key={p.id} {...p} />)}
</SkeletonContent>
```

**Skeleton cho ProductCard:**
```tsx
// components/ui/product-card-skeleton.tsx
export function ProductCardSkeleton() {
  return (
    <View style={styles.card}>
      <ShimmerPlaceholder style={styles.image} />
      <View style={styles.info}>
        <ShimmerPlaceholder style={styles.title} />
        <ShimmerPlaceholder style={styles.price} />
        <ShimmerPlaceholder style={styles.rating} />
      </View>
    </View>
  );
}
```

**Áp dụng ở:**
- [ ] Product list (Home screen)
- [ ] Project list (Shop screen)
- [ ] Cart screen
- [ ] Order history
- [ ] Profile screen

---

### 2. Empty States (Hướng Dẫn Người Dùng)

**Mỗi màn hình trống cần:**
1. Icon/Illustration
2. Tiêu đề rõ ràng
3. Mô tả ngắn gọn
4. Call-to-action button

**Template:**
```tsx
// components/ui/empty-state.tsx
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
        <Ionicons name={icon} size={48} color={colors.textMuted} />
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
```

**Ví dụ sử dụng:**
```tsx
// Cart trống
<EmptyState
  icon="cart-outline"
  title="Giỏ hàng trống"
  description="Bạn chưa thêm sản phẩm nào vào giỏ hàng"
  actionLabel="Mua sắm ngay"
  onAction={() => router.push('/')}
/>

// Không có đơn hàng
<EmptyState
  icon="receipt-outline"
  title="Chưa có đơn hàng"
  description="Lịch sử đơn hàng của bạn sẽ hiện ở đây"
/>

// Không có kết quả tìm kiếm
<EmptyState
  icon="search-outline"
  title="Không tìm thấy kết quả"
  description="Thử từ khóa khác hoặc xóa bộ lọc"
  actionLabel="Xóa bộ lọc"
  onAction={clearFilters}
/>
```

**Tạo cho 10+ màn hình:**
- [ ] Empty cart
- [ ] No search results
- [ ] No projects
- [ ] No orders
- [ ] No notifications
- [ ] No saved items
- [ ] Offline mode
- [ ] No payment methods
- [ ] No addresses
- [ ] No friends/contacts

---

### 3. Toast Notifications

**Cài đặt:**
```bash
npm install react-native-toast-message
```

**Setup trong `app/_layout.tsx`:**
```tsx
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <>
      <Stack />
      <Toast />
    </>
  );
}
```

**Sử dụng:**
```tsx
// Success
Toast.show({
  type: 'success',
  text1: 'Thành công',
  text2: 'Sản phẩm đã được thêm vào giỏ hàng',
  position: 'bottom',
  visibilityTime: 2000,
});

// Error
Toast.show({
  type: 'error',
  text1: 'Lỗi',
  text2: 'Không thể kết nối đến server',
});

// Info
Toast.show({
  type: 'info',
  text1: 'Đang xử lý',
  text2: 'Vui lòng đợi...',
});
```

**Custom Toast:**
```tsx
// config/toastConfig.tsx
const toastConfig = {
  success: (props) => (
    <View style={styles.successToast}>
      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
      <Text style={styles.toastText}>{props.text1}</Text>
    </View>
  ),
  error: (props) => (
    <View style={styles.errorToast}>
      <Ionicons name="close-circle" size={20} color="#EF4444" />
      <Text style={styles.toastText}>{props.text1}</Text>
    </View>
  ),
};

<Toast config={toastConfig} />
```

**Áp dụng cho:**
- [ ] Add to cart success
- [ ] Login success/error
- [ ] Form submission result
- [ ] Network errors
- [ ] Copy to clipboard
- [ ] Save success
- [ ] Delete confirmation

---

### 4. Pull-to-Refresh

**Thêm vào mọi list screen:**
```tsx
import { RefreshControl } from 'react-native';

const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  try {
    await loadProducts();
  } finally {
    setRefreshing(false);
  }
};

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.accent}
      colors={[colors.accent]}
    />
  }
>
  {/* Content */}
</ScrollView>
```

**Áp dụng ở:**
- [ ] Home screen (products)
- [ ] Projects list
- [ ] Order history
- [ ] Notifications
- [ ] Profile screen

---

### 5. Haptic Feedback (Rung nhẹ)

**Cài đặt:**
```bash
npx expo install expo-haptics
```

**Sử dụng:**
```tsx
import * as Haptics from 'expo-haptics';

// Button press - Rung nhẹ
<Pressable 
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handlePress();
  }}
>
  <Text>Press me</Text>
</Pressable>

// Success action - Rung vừa
const handleAddToCart = () => {
  addToCart(product);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  Toast.show({ type: 'success', text1: 'Đã thêm vào giỏ' });
};

// Error - Rung mạnh
const handleError = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  Toast.show({ type: 'error', text1: 'Có lỗi xảy ra' });
};

// Delete - Warning
const handleDelete = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  // Show confirmation dialog
};
```

**Áp dụng cho:**
- [ ] Button presses
- [ ] Add to cart
- [ ] Order placed
- [ ] Errors
- [ ] Swipe gestures
- [ ] Toggle switches

---

### 6. Swipe Gestures

**Cài đặt:**
```bash
npm install react-native-gesture-handler
npm install react-native-reanimated
```

**Swipe to Delete (Cart item):**
```tsx
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const RightActions = ({ onDelete }) => (
  <Pressable 
    style={styles.deleteButton}
    onPress={onDelete}
  >
    <Ionicons name="trash-outline" size={20} color="#fff" />
    <Text style={styles.deleteText}>Xóa</Text>
  </Pressable>
);

<Swipeable
  renderRightActions={() => <RightActions onDelete={handleDelete} />}
  overshootRight={false}
>
  <CartItem {...item} />
</Swipeable>
```

**Swipe to Archive (Notification):**
```tsx
const LeftActions = () => (
  <View style={styles.archiveButton}>
    <Ionicons name="archive-outline" size={20} color="#fff" />
  </View>
);

<Swipeable
  renderLeftActions={LeftActions}
  onSwipeableOpen={() => handleArchive(notification.id)}
>
  <NotificationItem {...notification} />
</Swipeable>
```

**Áp dụng ở:**
- [ ] Cart items (swipe left = delete)
- [ ] Notifications (swipe right = archive)
- [ ] Order items (swipe = quick actions)
- [ ] Saved items (swipe = remove)

---

### 7. Micro-animations

**Button Press Feedback:**
```tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

function AnimatedButton({ children, onPress }) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  return (
    <Animated.View style={animatedStyle}>
      <Pressable 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
```

**Card Entrance Animation:**
```tsx
import { FadeInUp } from 'react-native-reanimated';

function ProductCard({ product, index }) {
  return (
    <Animated.View 
      entering={FadeInUp.delay(index * 50).springify()}
    >
      <View style={styles.card}>
        {/* Card content */}
      </View>
    </Animated.View>
  );
}
```

**Floating Action Button (FAB):**
```tsx
<Animated.View 
  entering={FadeInUp.delay(300).springify()}
  style={styles.fab}
>
  <Pressable style={styles.fabButton} onPress={handleCreate}>
    <Ionicons name="add" size={24} color="#fff" />
  </Pressable>
</Animated.View>

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

**Áp dụng:**
- [ ] All buttons (scale on press)
- [ ] Cards (entrance animation)
- [ ] Modals (slide up)
- [ ] Tab bar (bounce on switch)
- [ ] FAB (create actions)

---

### 8. Form Validation UX

**Real-time Validation:**
```tsx
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');

const validateEmail = (value: string) => {
  if (!value) {
    setEmailError('Email không được để trống');
  } else if (!/\S+@\S+\.\S+/.test(value)) {
    setEmailError('Email không hợp lệ');
  } else {
    setEmailError('');
  }
};

<Input
  label="Email"
  value={email}
  onChangeText={(value) => {
    setEmail(value);
    validateEmail(value);
  }}
  error={emailError}
  leftIcon="mail-outline"
  // Show checkmark when valid
  rightIcon={!emailError && email ? "checkmark-circle" : undefined}
  rightIconColor="#10B981"
/>
```

**Password Strength Indicator:**
```tsx
function PasswordStrength({ password }: { password: string }) {
  const strength = calculateStrength(password);
  
  return (
    <View style={styles.strengthBar}>
      <View style={styles.bars}>
        {[1, 2, 3, 4].map(level => (
          <View
            key={level}
            style={[
              styles.bar,
              { backgroundColor: level <= strength ? getColor(strength) : '#E5E7EB' }
            ]}
          />
        ))}
      </View>
      <Text style={styles.strengthText}>{getLabel(strength)}</Text>
    </View>
  );
}

const getColor = (strength: number) => {
  if (strength <= 1) return '#EF4444'; // Red
  if (strength === 2) return '#F59E0B'; // Orange
  if (strength === 3) return '#10B981'; // Green
  return '#059669'; // Dark green
};

const getLabel = (strength: number) => {
  if (strength <= 1) return 'Yếu';
  if (strength === 2) return 'Trung bình';
  if (strength === 3) return 'Mạnh';
  return 'Rất mạnh';
};
```

---

### 9. Search Experience

**Debounced Search:**
```tsx
import { debounce } from 'lodash-es';

const [searchQuery, setSearchQuery] = useState('');
const [results, setResults] = useState([]);
const [searching, setSearching] = useState(false);

const searchProducts = async (query: string) => {
  if (!query.trim()) {
    setResults([]);
    return;
  }
  
  setSearching(true);
  try {
    const products = await apiFetch(`/products?search=${query}`);
    setResults(products);
  } finally {
    setSearching(false);
  }
};

const debouncedSearch = useMemo(
  () => debounce(searchProducts, 300),
  []
);

<Input
  placeholder="Tìm kiếm sản phẩm..."
  value={searchQuery}
  onChangeText={(value) => {
    setSearchQuery(value);
    debouncedSearch(value);
  }}
  leftIcon="search-outline"
  rightIcon={searching ? "hourglass-outline" : undefined}
/>
```

**Recent Searches:**
```tsx
// utils/searchHistory.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = 'searchHistory';
const MAX_HISTORY = 10;

export async function addSearchHistory(query: string) {
  const history = await getSearchHistory();
  const updated = [query, ...history.filter(q => q !== query)].slice(0, MAX_HISTORY);
  await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
}

export async function getSearchHistory(): Promise<string[]> {
  const json = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
  return json ? JSON.parse(json) : [];
}

export async function clearSearchHistory() {
  await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
}
```

**Search Screen:**
```tsx
function SearchScreen() {
  const [history, setHistory] = useState<string[]>([]);
  
  useEffect(() => {
    loadHistory();
  }, []);
  
  const loadHistory = async () => {
    const h = await getSearchHistory();
    setHistory(h);
  };
  
  return (
    <View>
      {history.length > 0 && (
        <Section title="Tìm kiếm gần đây">
          {history.map(query => (
            <Pressable
              key={query}
              onPress={() => handleSearch(query)}
              style={styles.historyItem}
            >
              <Ionicons name="time-outline" size={20} color={colors.textMuted} />
              <Text style={styles.historyText}>{query}</Text>
              <Pressable onPress={() => removeFromHistory(query)}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </Pressable>
          ))}
        </Section>
      )}
    </View>
  );
}
```

---

### 10. Onboarding Screens

**Tạo intro flow:**
```bash
# Tạo screens
app/intro/index.tsx          # Onboarding slides
app/intro/permissions.tsx    # Request permissions
```

**Onboarding Slides:**
```tsx
import Onboarding from 'react-native-onboarding-swiper';

const slides = [
  {
    backgroundColor: '#FF6B35',
    image: <Image source={require('../../assets/intro-1.png')} style={styles.image} />,
    title: 'Quản lý công trình',
    subtitle: 'Theo dõi tiến độ dự án xây dựng mọi lúc mọi nơi',
  },
  {
    backgroundColor: '#4CAF50',
    image: <Image source={require('../../assets/intro-2.png')} style={styles.image} />,
    title: 'Mua sắm vật liệu',
    subtitle: 'Hàng ngàn sản phẩm xây dựng chất lượng cao',
  },
  {
    backgroundColor: '#2196F3',
    image: <Image source={require('../../assets/intro-3.png')} style={styles.image} />,
    title: 'Kết nối đội ngũ',
    subtitle: 'Cộng tác với kiến trúc sư, kỹ sư, nhà thầu',
  },
];

export default function IntroScreen() {
  const router = useRouter();
  
  const handleDone = async () => {
    await AsyncStorage.setItem('onboardingComplete', 'true');
    router.replace('/(auth)/sign-in');
  };
  
  return (
    <Onboarding
      pages={slides}
      onDone={handleDone}
      onSkip={handleDone}
      showSkip
      bottomBarHeight={60}
      nextLabel="Tiếp"
      skipLabel="Bỏ qua"
      doneLabel="Bắt đầu"
    />
  );
}
```

**Check onboarding status:**
```tsx
// app/_layout.tsx
const [onboardingComplete, setOnboardingComplete] = useState(false);

useEffect(() => {
  checkOnboarding();
}, []);

const checkOnboarding = async () => {
  const complete = await AsyncStorage.getItem('onboardingComplete');
  setOnboardingComplete(complete === 'true');
};

if (!onboardingComplete) {
  return <Redirect href="/intro" />;
}
```

---

## 🎨 Responsive Design

### Safe Area Handling

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
  {/* Content */}
</SafeAreaView>
```

### Adaptive Layouts

```tsx
import { useWindowDimensions } from 'react-native';

function ProductGrid() {
  const { width } = useWindowDimensions();
  const numColumns = width > 768 ? 3 : 2;
  
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard {...item} />}
      numColumns={numColumns}
      key={numColumns}  // Force re-render on column change
    />
  );
}
```

### Tablet Support

```tsx
import { Platform } from 'react-native';

const isTablet = Platform.isPad || (Platform.OS === 'android' && width >= 768);

<View style={[
  styles.container,
  isTablet && styles.containerTablet
]}>
  {/* Content */}
</View>
```

---

## 📋 UX Checklist

**Ngay lập tức (Week 1):**
- [ ] Thêm skeleton loading cho 5 screens
- [ ] Tạo 8 empty states
- [ ] Setup Toast notifications
- [ ] Thêm pull-to-refresh ở mọi list
- [ ] Haptic feedback cho buttons

**Tuần 2:**
- [ ] Swipe gestures (cart, notifications)
- [ ] Micro-animations (buttons, cards)
- [ ] Form validation với feedback
- [ ] Debounced search
- [ ] Search history

**Tuần 3:**
- [ ] Onboarding screens (3 slides)
- [ ] FAB cho quick actions
- [ ] Error recovery flows
- [ ] Offline mode indicator
- [ ] Safe area handling

**Đo lường thành công:**
- ✅ Mọi action có phản hồi visual/haptic
- ✅ Không có màn hình trống không có hướng dẫn
- ✅ Loading state luôn hiển thị
- ✅ Lỗi có thể retry được
- ✅ 60fps animations

---

**Last Updated:** December 24, 2025  
**Version:** 1.0.0
