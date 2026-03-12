# 🎨 KẾ HOẠCH NÂNG CẤP GIAO DIỆN HIỆN ĐẠI - SHOPEE/GRAB STYLE

> **Ngày:** 12/12/2025  
> **Mục tiêu:** Modernize UI theo phong cách Shopee/Grab với Nordic Minimalism colors  
> **Timeline:** 4-6 tuần

---

## 🎯 PHÂN TÍCH STYLE SHOPEE & GRAB

### Shopee Style Elements:
```
✅ Orange accent color (#EE4D2D) → Thay bằng #4AA14A (Nordic Green)
✅ White background với light gray sections
✅ Card-based layout với subtle shadows
✅ Icon-driven navigation
✅ Bottom navigation bar (5 tabs)
✅ Flash sale banners với countdown
✅ Grid layout cho products (2 columns)
✅ Sticky search bar
✅ Quick action buttons
✅ Badge notifications (red dots)
✅ Smooth transitions & animations
```

### Grab Style Elements:
```
✅ Green primary color (#00B14F) → Giữ #4AA14A
✅ Clean, minimalist design
✅ Large touch targets (48px minimum)
✅ Map-centric interfaces
✅ Real-time status updates
✅ Bottom sheets for actions
✅ Floating Action Button (FAB)
✅ Progress indicators
✅ Skeleton loading states
✅ Toast notifications
```

---

## 🎨 DESIGN SYSTEM MỚI

### Color Palette (Nordic-Shopee Hybrid)
```typescript
const ModernColors = {
  // Primary (giữ Nordic green)
  primary: '#4AA14A',           // Main green
  primaryLight: '#6BC56B',      // Light green for hover
  primaryDark: '#3A8A3A',       // Dark green for pressed
  primaryBg: '#E8F5E9',         // Light green background
  
  // Secondary (thêm Shopee-inspired)
  secondary: '#FFB300',         // Amber for flash sales
  secondaryLight: '#FFCA28',
  secondaryDark: '#FF8F00',
  secondaryBg: '#FFF8E1',
  
  // Neutrals (Shopee/Grab style)
  background: '#F5F5F5',        // Light gray (was #FFFFFF)
  surface: '#FFFFFF',           // White cards (was #F8F8F8)
  surfaceHover: '#FAFAFA',
  border: '#E0E0E0',            // Stronger border (was #F0F0F0)
  divider: '#EEEEEE',
  
  // Text (cải thiện contrast)
  text: '#212121',              // Darker (was #1A1A1A)
  textSecondary: '#757575',     // Medium gray (was #808080)
  textDisabled: '#BDBDBD',
  textOnPrimary: '#FFFFFF',
  
  // Status (Shopee-inspired)
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Special (Shopee features)
  flashSale: '#FF6B00',         // Hot sale color
  discount: '#FF3D00',          // Discount badge
  new: '#00BCD4',               // New item badge
  favorite: '#FF4081',          // Wishlist heart
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
};
```

### Typography (Shopee-style)
```typescript
const ModernTypography = {
  // Headers (Bold, impactful)
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },  // Lớn hơn
  h2: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h5: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  
  // Body (Readable)
  bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400', lineHeight: 18 },
  
  // Special
  price: { fontSize: 20, fontWeight: '700', lineHeight: 28 },     // Product price
  priceSmall: { fontSize: 16, fontWeight: '700', lineHeight: 24 },
  discount: { fontSize: 12, fontWeight: '600', lineHeight: 16 },  // -50% badge
  button: { fontSize: 16, fontWeight: '600', lineHeight: 24 },    // Lớn hơn
  caption: { fontSize: 11, fontWeight: '400', lineHeight: 16 },
  overline: { fontSize: 10, fontWeight: '700', lineHeight: 14, letterSpacing: 1.5 },
};
```

### Spacing (Shopee-style: tighter, more compact)
```typescript
const ModernSpacing = {
  xs: 4,
  sm: 8,
  md: 12,   // Base spacing
  lg: 16,
  xl: 20,   // Card padding
  xxl: 24,
  xxxl: 32,
  
  // Component-specific
  cardPadding: 12,        // Compact cards
  sectionPadding: 16,     // Section spacing
  screenPadding: 16,      // Screen edges
  gridGap: 8,             // Product grid gap
};
```

### Border Radius (Modern, Shopee-style)
```typescript
const ModernBorderRadius = {
  none: 0,
  sm: 4,      // Small elements
  md: 8,      // Cards, buttons
  lg: 12,     // Modals
  xl: 16,     // Large cards
  xxl: 20,    // Hero sections
  full: 9999, // Pills, avatars
};
```

### Shadows (Shopee-style: subtle & layered)
```typescript
const ModernElevation = {
  0: { shadowOpacity: 0 },
  1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
};
```

---

## 📱 COMPONENT REDESIGN

### 1. Button Components (Shopee-style)

#### Primary Button
```typescript
<TouchableOpacity 
  style={styles.buttonPrimary}
  activeOpacity={0.8}
>
  <LinearGradient
    colors={['#6BC56B', '#4AA14A']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.buttonGradient}
  >
    <Text style={styles.buttonText}>Mua ngay</Text>
  </LinearGradient>
</TouchableOpacity>

const styles = StyleSheet.create({
  buttonPrimary: {
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```

#### Outline Button (Shopee-style)
```typescript
<TouchableOpacity style={styles.buttonOutline}>
  <Ionicons name="heart-outline" size={20} color="#4AA14A" />
  <Text style={styles.buttonOutlineText}>Yêu thích</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  buttonOutline: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4AA14A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  buttonOutlineText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4AA14A',
  },
});
```

### 2. Product Card (Shopee 2-column grid)
```typescript
<TouchableOpacity style={styles.productCard}>
  {/* Image with badge */}
  <View style={styles.imageContainer}>
    <Image source={product.image} style={styles.productImage} />
    
    {product.discount && (
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>-{product.discount}%</Text>
      </View>
    )}
    
    {product.isNew && (
      <View style={styles.newBadge}>
        <Text style={styles.newText}>MỚI</Text>
      </View>
    )}
    
    <TouchableOpacity style={styles.favoriteButton}>
      <Ionicons name="heart-outline" size={20} color="#FFF" />
    </TouchableOpacity>
  </View>
  
  {/* Content */}
  <View style={styles.productContent}>
    <Text style={styles.productName} numberOfLines={2}>
      {product.name}
    </Text>
    
    <View style={styles.ratingRow}>
      <Ionicons name="star" size={12} color="#FFB300" />
      <Text style={styles.rating}>{product.rating}</Text>
      <Text style={styles.sold}>Đã bán {product.sold}</Text>
    </View>
    
    <View style={styles.priceRow}>
      {product.originalPrice && (
        <Text style={styles.originalPrice}>
          ₫{product.originalPrice.toLocaleString()}
        </Text>
      )}
      <Text style={styles.price}>
        ₫{product.price.toLocaleString()}
      </Text>
    </View>
  </View>
</TouchableOpacity>

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#00BCD4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productContent: {
    padding: 8,
  },
  productName: {
    fontSize: 14,
    lineHeight: 20,
    color: '#212121',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    color: '#757575',
  },
  sold: {
    fontSize: 12,
    color: '#BDBDBD',
    marginLeft: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#BDBDBD',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B00',
  },
});
```

### 3. Search Bar (Shopee-style với suggestions)
```typescript
<View style={styles.searchContainer}>
  <View style={styles.searchBar}>
    <Ionicons name="search" size={20} color="#757575" />
    <TextInput
      style={styles.searchInput}
      placeholder="Tìm kiếm sản phẩm..."
      placeholderTextColor="#BDBDBD"
      value={searchQuery}
      onChangeText={setSearchQuery}
      onFocus={() => setShowSuggestions(true)}
    />
    {searchQuery.length > 0 && (
      <TouchableOpacity onPress={() => setSearchQuery('')}>
        <Ionicons name="close-circle" size={20} color="#BDBDBD" />
      </TouchableOpacity>
    )}
  </View>
  
  {/* Search suggestions */}
  {showSuggestions && (
    <View style={styles.suggestions}>
      <Text style={styles.suggestionsTitle}>Tìm kiếm phổ biến</Text>
      {POPULAR_SEARCHES.map((item) => (
        <TouchableOpacity 
          key={item.id}
          style={styles.suggestionItem}
          onPress={() => handleSearch(item.keyword)}
        >
          <Ionicons name="trending-up" size={16} color="#FFB300" />
          <Text style={styles.suggestionText}>{item.keyword}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )}
</View>

const styles = StyleSheet.create({
  searchContainer: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#212121',
  },
  suggestions: {
    position: 'absolute',
    top: 64,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 1000,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#212121',
  },
});
```

### 4. Banner Carousel (Shopee flash sale style)
```typescript
<View style={styles.bannerContainer}>
  <ScrollView 
    horizontal 
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    onScroll={handleScroll}
  >
    {BANNERS.map((banner, index) => (
      <TouchableOpacity 
        key={banner.id}
        style={styles.bannerSlide}
        activeOpacity={0.9}
      >
        <ImageBackground 
          source={banner.image}
          style={styles.bannerImage}
          imageStyle={styles.bannerImageStyle}
        >
          {banner.hasCountdown && (
            <View style={styles.countdown}>
              <Ionicons name="flash" size={16} color="#FFB300" />
              <Text style={styles.countdownText}>
                Kết thúc trong {formatTime(banner.endTime)}
              </Text>
            </View>
          )}
        </ImageBackground>
      </TouchableOpacity>
    ))}
  </ScrollView>
  
  {/* Dots indicator */}
  <View style={styles.dotsContainer}>
    {BANNERS.map((_, index) => (
      <View 
        key={index}
        style={[
          styles.dot,
          currentIndex === index && styles.dotActive
        ]}
      />
    ))}
  </View>
</View>

const styles = StyleSheet.create({
  bannerContainer: {
    height: 160,
    marginBottom: 16,
  },
  bannerSlide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 16,
  },
  bannerImage: {
    width: '100%',
    height: 160,
    justifyContent: 'flex-end',
    padding: 16,
  },
  bannerImageStyle: {
    borderRadius: 12,
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#4AA14A',
  },
});
```

### 5. Bottom Navigation (Shopee 5-tab style)
```typescript
<View style={styles.tabBar}>
  {TABS.map((tab) => (
    <TouchableOpacity
      key={tab.route}
      style={styles.tab}
      onPress={() => router.push(tab.route)}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name={isActive(tab.route) ? tab.iconActive : tab.icon}
          size={26}
          color={isActive(tab.route) ? '#4AA14A' : '#BDBDBD'}
        />
        {tab.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {tab.badge > 99 ? '99+' : tab.badge}
            </Text>
          </View>
        )}
      </View>
      <Text style={[
        styles.label,
        isActive(tab.route) && styles.labelActive
      ]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  ))}
</View>

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 6,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  label: {
    fontSize: 11,
    color: '#BDBDBD',
    fontWeight: '500',
  },
  labelActive: {
    color: '#4AA14A',
    fontWeight: '600',
  },
});
```

---

## 📋 KẾ HOẠCH TRIỂN KHAI CHI TIẾT

### PHASE 1: Foundation (Tuần 1-2)
**Mục tiêu:** Cập nhật design system và base components

#### 1.1. Update Design System
- [ ] Tạo file `constants/modern-theme.ts`
  ```typescript
  export const ModernColors = { ... };
  export const ModernTypography = { ... };
  export const ModernSpacing = { ... };
  export const ModernBorderRadius = { ... };
  export const ModernElevation = { ... };
  ```

- [ ] Tạo theme provider mới
  ```typescript
  // context/ThemeContext.tsx
  export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    // Support dark mode future
  };
  ```

#### 1.2. Base Components
- [ ] **Button** (Shopee-style với gradient)
  - File: `components/ui/modern-button.tsx`
  - Variants: primary, secondary, outline, ghost
  - Sizes: small, medium, large
  - States: default, hover, pressed, disabled, loading

- [ ] **Card** (Shopee-style với subtle shadow)
  - File: `components/ui/modern-card.tsx`
  - Variants: default, elevated, outlined
  - Support: header, body, footer sections

- [ ] **Input** (Shopee-style focused state)
  - File: `components/ui/modern-input.tsx`
  - Support: prefix icon, suffix icon, clear button
  - States: default, focused, error, disabled

### PHASE 2: Navigation Components (Tuần 2-3)
**Mục tiêu:** Nâng cấp navigation system

#### 2.1. Bottom Tab Bar (Shopee 5-tab)
- [ ] Redesign `components/navigation/custom-tab-bar.tsx`
  - 5 tabs: Home, Categories, Messages, Notifications, Profile
  - Badge indicators (red dot)
  - Active state animation
  - Haptic feedback

#### 2.2. Search Bar (Shopee-style)
- [ ] Tạo `components/navigation/modern-search-bar.tsx`
  - Auto-suggestions
  - Recent searches
  - Popular searches
  - Voice search icon
  - Camera search (QR/barcode)

#### 2.3. Header Components
- [ ] Tạo `components/navigation/app-header.tsx`
  - Sticky header
  - Transparent background on scroll
  - Back button
  - Action buttons (search, cart, share)

### PHASE 3: Shopping Components (Tuần 3-4)
**Mục tiêu:** E-commerce components theo style Shopee

#### 3.1. Product Cards
- [ ] **Grid Product Card** (2 columns)
  - File: `components/shopping/product-card-grid.tsx`
  - Features: discount badge, new badge, favorite button
  - Image lazy loading
  - Rating stars
  - Sold count

- [ ] **List Product Card** (full width)
  - File: `components/shopping/product-card-list.tsx`
  - Horizontal layout
  - More details visible

- [ ] **Flash Sale Card**
  - File: `components/shopping/flash-sale-card.tsx`
  - Countdown timer
  - Progress bar (số lượng còn)
  - Special styling

#### 3.2. Shopping Features
- [ ] **Banner Carousel**
  - File: `components/shopping/banner-carousel.tsx`
  - Auto-scroll
  - Dots indicator
  - Countdown for flash sales

- [ ] **Category Grid** (Shopee-style)
  - File: `components/shopping/category-grid.tsx`
  - Icon + Label
  - 4 columns layout
  - Horizontal scroll

- [ ] **Filter Bottom Sheet**
  - File: `components/shopping/filter-sheet.tsx`
  - Price range
  - Categories
  - Ratings
  - Apply/Reset buttons

### PHASE 4: Home Screen Redesign (Tuần 4)
**Mục tiêu:** Áp dụng tất cả components vào Home

#### 4.1. Home Screen Layout
```typescript
// app/(tabs)/index.tsx - NEW STRUCTURE

<SafeScrollView>
  {/* Sticky Header */}
  <AppHeader 
    transparent
    showSearch
    showCart
    cartBadge={cartCount}
  />
  
  {/* Search Bar */}
  <ModernSearchBar
    placeholder="Tìm kiếm dự án, sản phẩm..."
    onFocus={() => router.push('/search')}
  />
  
  {/* Banner Carousel */}
  <BannerCarousel banners={BANNERS} />
  
  {/* Category Grid */}
  <Section title="Danh mục">
    <CategoryGrid categories={CATEGORIES} columns={4} />
  </Section>
  
  {/* Flash Sale */}
  {hasFlashSale && (
    <Section 
      title="FLASH SALE" 
      titleColor="#FF6B00"
      action="Xem tất cả"
      icon="flash"
    >
      <FlashSaleSection 
        endTime={flashSaleEndTime}
        products={flashSaleProducts}
      />
    </Section>
  )}
  
  {/* Quick Actions */}
  <QuickActions 
    actions={[
      { icon: 'add-circle', label: 'Tạo dự án', route: '/projects/create' },
      { icon: 'camera', label: 'Chụp ảnh', route: '/camera' },
      { icon: 'calendar', label: 'Lịch thi công', route: '/timeline' },
      { icon: 'people', label: 'Nhóm', route: '/team' },
    ]}
  />
  
  {/* Recommended Products */}
  <Section title="Gợi ý cho bạn" action="Xem thêm">
    <ProductGrid 
      products={recommendedProducts}
      columns={2}
      cardType="grid"
    />
  </Section>
  
  {/* Recent Projects */}
  <Section title="Dự án gần đây" action="Xem tất cả">
    <ProjectCarousel projects={recentProjects} />
  </Section>
  
  {/* You May Like */}
  <Section title="Có thể bạn cũng thích">
    <ProductGrid 
      products={suggestedProducts}
      columns={2}
      loadMore={loadMoreProducts}
    />
  </Section>
</SafeScrollView>
```

#### 4.2. Animations
- [ ] Parallax header
- [ ] Fade-in cards on scroll
- [ ] Skeleton loading
- [ ] Pull-to-refresh animation

### PHASE 5: Shopping Screens (Tuần 5)
**Mục tiêu:** Redesign shopping module

#### 5.1. Shopping Home
- [ ] Update `app/shopping/index.tsx`
  - Sticky categories tabs
  - Product grid (2 columns)
  - Infinite scroll
  - Filter floating button

#### 5.2. Product Detail
- [ ] Update `app/shopping/product/[id].tsx`
  - Image carousel with zoom
  - Sticky buy button
  - Reviews section (Shopee-style)
  - Related products
  - Share button

#### 5.3. Cart & Checkout
- [ ] Update `app/cart.tsx`
  - Swipe to delete
  - Select items checkbox
  - Voucher section
  - Sticky checkout button

### PHASE 6: Project & Communication (Tuần 6)
**Mục tiêu:** Apply modern design to core features

#### 6.1. Project List
- [ ] Update `app/(tabs)/projects.tsx`
  - Card-based layout
  - Status badges
  - Progress bars
  - Quick actions

#### 6.2. Messages
- [ ] Update `app/messages/index.tsx`
  - Chat list (WhatsApp-style)
  - Unread badges
  - Swipe actions
  - Online indicators

#### 6.3. Notifications
- [ ] Update `app/(tabs)/notifications.tsx`
  - Timeline layout
  - Type icons
  - Mark as read
  - Clear all button

---

## 🎬 ANIMATION LIBRARY

### Install Dependencies
```bash
npm install react-native-reanimated
npm install react-native-gesture-handler
npm install lottie-react-native
npm install react-native-linear-gradient
```

### Common Animations
```typescript
// animations/common.ts

export const fadeIn = {
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 300,
};

export const slideUp = {
  from: { translateY: 50, opacity: 0 },
  to: { translateY: 0, opacity: 1 },
  duration: 400,
};

export const scaleIn = {
  from: { scale: 0.8, opacity: 0 },
  to: { scale: 1, opacity: 1 },
  duration: 300,
};

export const shimmer = {
  // Skeleton loading animation
  colors: ['#F5F5F5', '#EEEEEE', '#F5F5F5'],
  duration: 1000,
  loop: true,
};
```

---

## 📊 CHECKLIST TRIỂN KHAI

### Week 1-2: Foundation ✅
- [ ] Setup modern theme constants
- [ ] Create base components (Button, Card, Input)
- [ ] Create modern layout components
- [ ] Setup animation library
- [ ] Create Storybook/demo screens

### Week 3: Navigation & Shopping Core ✅
- [ ] Redesign bottom tab bar
- [ ] Create modern search bar
- [ ] Create product cards (grid & list)
- [ ] Create banner carousel
- [ ] Create category grid

### Week 4: Home Screen ✅
- [ ] Apply all components to home
- [ ] Implement animations
- [ ] Add skeleton loading
- [ ] Test performance
- [ ] Optimize images

### Week 5: Shopping Module ✅
- [ ] Redesign shopping home
- [ ] Redesign product detail
- [ ] Redesign cart
- [ ] Add filters & sorting
- [ ] Test checkout flow

### Week 6: Core Features ✅
- [ ] Update project screens
- [ ] Update messages
- [ ] Update notifications
- [ ] Update profile
- [ ] Final testing & polish

---

## 🎯 KẾT QUẢ MONG ĐỢI

### UI/UX Improvements:
✅ Giao diện hiện đại như Shopee/Grab  
✅ Màu sắc Nordic Green (#4AA14A) nhất quán  
✅ Typography rõ ràng, dễ đọc  
✅ Touch targets >= 48px  
✅ Smooth animations & transitions  
✅ Loading states đầy đủ  
✅ Error states thân thiện  
✅ Responsive design  

### Performance:
✅ Image lazy loading  
✅ Infinite scroll optimization  
✅ 60 FPS animations  
✅ Fast initial load (<2s)  
✅ Smooth scrolling  

### User Experience:
✅ Intuitive navigation  
✅ Quick actions accessible  
✅ Search powerful & fast  
✅ Checkout flow đơn giản  
✅ Real-time updates  

---

## 📝 NOTES

- **Giữ màu chủ đạo:** #4AA14A (Nordic Green) thay vì Shopee Orange
- **Học hỏi layout:** Copy Shopee/Grab structure nhưng apply Nordic colors
- **Component reuse:** Tạo component library mạnh để dùng lại
- **Performance first:** Optimize images, lazy load, infinite scroll
- **Test on real devices:** iPhone & Android

**Timeline tổng:** 6 tuần  
**Resources needed:** 1-2 developers  
**Testing:** 1 week additional for QA

---

Cập nhật: 12/12/2025
