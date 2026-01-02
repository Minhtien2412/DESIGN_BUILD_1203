# 🔧 HƯỚNG DẪN TRIỂN KHAI COMPONENTS CHI TIẾT

> **File này chứa code implementation chi tiết cho từng component**

---

## 1️⃣ MODERN THEME SETUP

### File: `constants/modern-theme.ts`
```typescript
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Colors (Nordic-Shopee Hybrid)
export const ModernColors = {
  // Primary (Nordic Green)
  primary: '#4AA14A',
  primaryLight: '#6BC56B',
  primaryDark: '#3A8A3A',
  primaryBg: '#E8F5E9',
  
  // Secondary (Amber for highlights)
  secondary: '#FFB300',
  secondaryLight: '#FFCA28',
  secondaryDark: '#FF8F00',
  secondaryBg: '#FFF8E1',
  
  // Neutrals
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceHover: '#FAFAFA',
  border: '#E0E0E0',
  divider: '#EEEEEE',
  
  // Text
  text: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textOnPrimary: '#FFFFFF',
  
  // Status
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Special
  flashSale: '#FF6B00',
  discount: '#FF3D00',
  new: '#00BCD4',
  favorite: '#FF4081',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
};

// Typography
export const ModernTypography = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h5: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  
  price: { fontSize: 20, fontWeight: '700' as const, lineHeight: 28 },
  priceSmall: { fontSize: 16, fontWeight: '700' as const, lineHeight: 24 },
  discount: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  caption: { fontSize: 11, fontWeight: '400' as const, lineHeight: 16 },
  overline: { fontSize: 10, fontWeight: '700' as const, lineHeight: 14 },
};

// Spacing
export const ModernSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  cardPadding: 12,
  sectionPadding: 16,
  screenPadding: 16,
  gridGap: 8,
};

// Border Radius
export const ModernBorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

// Elevation (Shadows)
export const ModernElevation = {
  0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
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

// Screen dimensions
export const ModernDimensions = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  
  // Product grid
  productCardWidth: (SCREEN_WIDTH - (ModernSpacing.screenPadding * 2) - ModernSpacing.gridGap) / 2,
  
  // Common heights
  headerHeight: 56,
  tabBarHeight: 60,
  buttonHeight: 48,
  inputHeight: 48,
};

export default {
  colors: ModernColors,
  typography: ModernTypography,
  spacing: ModernSpacing,
  borderRadius: ModernBorderRadius,
  elevation: ModernElevation,
  dimensions: ModernDimensions,
};
```

---

## 2️⃣ MODERN BUTTON

### File: `components/ui/modern-button.tsx`
```typescript
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ModernColors, ModernTypography, ModernBorderRadius, ModernElevation } from '@/constants/modern-theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ModernButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  children: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function ModernButton({
  variant = 'primary',
  size = 'medium',
  onPress,
  children,
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ModernButtonProps) {
  const isDisabled = disabled || loading;

  // Size styles
  const sizeStyles = {
    small: {
      height: 36,
      paddingHorizontal: 16,
      fontSize: 14,
      iconSize: 18,
    },
    medium: {
      height: 48,
      paddingHorizontal: 24,
      fontSize: 16,
      iconSize: 20,
    },
    large: {
      height: 56,
      paddingHorizontal: 32,
      fontSize: 18,
      iconSize: 24,
    },
  };

  const currentSize = sizeStyles[size];

  // Primary button (gradient)
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          { height: currentSize.height },
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        <LinearGradient
          colors={isDisabled ? ['#BDBDBD', '#9E9E9E'] : [ModernColors.primaryLight, ModernColors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { paddingHorizontal: currentSize.paddingHorizontal }]}
        >
          {loading ? (
            <ActivityIndicator color={ModernColors.textOnPrimary} size="small" />
          ) : (
            <View style={styles.content}>
              {icon && iconPosition === 'left' && (
                <Ionicons name={icon} size={currentSize.iconSize} color={ModernColors.textOnPrimary} />
              )}
              <Text style={[
                styles.textPrimary, 
                { fontSize: currentSize.fontSize },
                textStyle
              ]}>
                {children}
              </Text>
              {icon && iconPosition === 'right' && (
                <Ionicons name={icon} size={currentSize.iconSize} color={ModernColors.textOnPrimary} />
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Outline button
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[
          styles.button,
          styles.buttonOutline,
          { height: currentSize.height, paddingHorizontal: currentSize.paddingHorizontal },
          fullWidth && styles.fullWidth,
          isDisabled && styles.outlineDisabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={ModernColors.primary} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && (
              <Ionicons name={icon} size={currentSize.iconSize} color={ModernColors.primary} />
            )}
            <Text style={[
              styles.textOutline,
              { fontSize: currentSize.fontSize },
              isDisabled && styles.textDisabled,
              textStyle
            ]}>
              {children}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons name={icon} size={currentSize.iconSize} color={ModernColors.primary} />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Ghost button
  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[
          styles.button,
          { height: currentSize.height, paddingHorizontal: currentSize.paddingHorizontal },
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={ModernColors.primary} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && (
              <Ionicons name={icon} size={currentSize.iconSize} color={ModernColors.primary} />
            )}
            <Text style={[
              styles.textGhost,
              { fontSize: currentSize.fontSize },
              isDisabled && styles.textDisabled,
              textStyle
            ]}>
              {children}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons name={icon} size={currentSize.iconSize} color={ModernColors.primary} />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Secondary button
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        styles.buttonSecondary,
        { height: currentSize.height, paddingHorizontal: currentSize.paddingHorizontal },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={ModernColors.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={currentSize.iconSize} color={ModernColors.text} />
          )}
          <Text style={[
            styles.textSecondary,
            { fontSize: currentSize.fontSize },
            textStyle
          ]}>
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={currentSize.iconSize} color={ModernColors.text} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: ModernBorderRadius.md,
    overflow: 'hidden',
    ...ModernElevation[2],
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: ModernColors.surfaceHover,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: ModernColors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  textPrimary: {
    ...ModernTypography.button,
    color: ModernColors.textOnPrimary,
  },
  textSecondary: {
    ...ModernTypography.button,
    color: ModernColors.text,
  },
  textOutline: {
    ...ModernTypography.button,
    color: ModernColors.primary,
  },
  textGhost: {
    ...ModernTypography.button,
    color: ModernColors.primary,
  },
  textDisabled: {
    color: ModernColors.textDisabled,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  outlineDisabled: {
    borderColor: ModernColors.border,
  },
});
```

---

## 3️⃣ PRODUCT CARD (Shopee 2-column Grid)

### File: `components/shopping/product-card-grid.tsx`
```typescript
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ModernColors, ModernTypography, ModernSpacing, ModernBorderRadius, ModernElevation, ModernDimensions } from '@/constants/modern-theme';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: any;
  rating?: number;
  sold?: number;
  isNew?: boolean;
  isFavorite?: boolean;
}

interface ProductCardGridProps {
  product: Product;
  onFavorite?: (productId: string) => void;
}

export default function ProductCardGrid({ product, onFavorite }: ProductCardGridProps) {
  const discountPercent = product.discount || (product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0);

  return (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/shopping/product/${product.id}`)}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image 
          source={product.image} 
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}
        
        {/* New Badge */}
        {product.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>MỚI</Text>
          </View>
        )}
        
        {/* Favorite Button */}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => onFavorite?.(product.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={product.isFavorite ? 'heart' : 'heart-outline'} 
            size={20} 
            color={product.isFavorite ? ModernColors.favorite : '#FFF'} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        {/* Product Name */}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        
        {/* Rating & Sold */}
        {(product.rating || product.sold) && (
          <View style={styles.ratingRow}>
            {product.rating && (
              <>
                <Ionicons name="star" size={12} color={ModernColors.secondary} />
                <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
              </>
            )}
            {product.sold && (
              <Text style={styles.sold}>
                {product.rating && ' | '}
                Đã bán {product.sold > 1000 ? `${(product.sold / 1000).toFixed(1)}k` : product.sold}
              </Text>
            )}
          </View>
        )}
        
        {/* Price Row */}
        <View style={styles.priceRow}>
          {product.originalPrice && product.originalPrice > product.price && (
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
  );
}

const styles = StyleSheet.create({
  card: {
    width: ModernDimensions.productCardWidth,
    backgroundColor: ModernColors.surface,
    borderRadius: ModernBorderRadius.md,
    overflow: 'hidden',
    ...ModernElevation[1],
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: ModernColors.background,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: ModernColors.flashSale,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: ModernBorderRadius.md,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: ModernColors.textOnPrimary,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: ModernColors.new,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ModernBorderRadius.sm,
  },
  newText: {
    fontSize: 10,
    fontWeight: '700',
    color: ModernColors.textOnPrimary,
    letterSpacing: 0.5,
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
  content: {
    padding: ModernSpacing.cardPadding,
    gap: 6,
  },
  name: {
    ...ModernTypography.body,
    color: ModernColors.text,
    height: 40, // 2 lines
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: ModernColors.textSecondary,
  },
  sold: {
    fontSize: 12,
    color: ModernColors.textDisabled,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  originalPrice: {
    fontSize: 12,
    color: ModernColors.textDisabled,
    textDecorationLine: 'line-through',
  },
  price: {
    ...ModernTypography.priceSmall,
    color: ModernColors.flashSale,
  },
});
```

---

## 4️⃣ PRODUCT GRID (2 columns with infinite scroll)

### File: `components/shopping/product-grid.tsx`
```typescript
import React from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import ProductCardGrid from './product-card-grid';
import { ModernColors, ModernSpacing } from '@/constants/modern-theme';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: any;
  rating?: number;
  sold?: number;
  isNew?: boolean;
  isFavorite?: boolean;
}

interface ProductGridProps {
  products: Product[];
  onFavorite?: (productId: string) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

export default function ProductGrid({
  products,
  onFavorite,
  onLoadMore,
  isLoading = false,
  hasMore = false,
}: ProductGridProps) {
  const renderItem = ({ item }: { item: Product }) => (
    <ProductCardGrid product={item} onFavorite={onFavorite} />
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={ModernColors.primary} />
      </View>
    );
  };

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      onEndReached={hasMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: ModernSpacing.screenPadding,
    paddingBottom: ModernSpacing.xxl,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: ModernSpacing.gridGap,
  },
  footer: {
    paddingVertical: ModernSpacing.lg,
    alignItems: 'center',
  },
});
```

---

## 5️⃣ SEARCH BAR (Shopee-style)

### File: `components/navigation/modern-search-bar.tsx`
```typescript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModernColors, ModernTypography, ModernSpacing, ModernBorderRadius, ModernElevation } from '@/constants/modern-theme';

interface ModernSearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onSubmit?: (text: string) => void;
  showVoice?: boolean;
  showCamera?: boolean;
}

export default function ModernSearchBar({
  placeholder = 'Tìm kiếm...',
  value,
  onChangeText,
  onFocus,
  onSubmit,
  showVoice = true,
  showCamera = true,
}: ModernSearchBarProps) {
  const [searchText, setSearchText] = useState(value || '');

  const handleClear = () => {
    setSearchText('');
    onChangeText?.('');
  };

  const handleSubmit = () => {
    onSubmit?.(searchText);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={ModernColors.textSecondary} />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={ModernColors.textDisabled}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            onChangeText?.(text);
          }}
          onFocus={onFocus}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
        />
        
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={20} color={ModernColors.textDisabled} />
          </TouchableOpacity>
        )}
        
        {showVoice && searchText.length === 0 && (
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="mic-outline" size={20} color={ModernColors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {showCamera && (
          <TouchableOpacity 
            style={styles.cameraButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="camera-outline" size={20} color={ModernColors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: ModernSpacing.screenPadding,
    paddingVertical: ModernSpacing.md,
    backgroundColor: ModernColors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernColors.background,
    borderRadius: ModernBorderRadius.md,
    paddingHorizontal: ModernSpacing.md,
    height: 44,
    gap: ModernSpacing.sm,
  },
  input: {
    flex: 1,
    ...ModernTypography.body,
    color: ModernColors.text,
    paddingVertical: 0, // Remove default padding
  },
  cameraButton: {
    marginLeft: ModernSpacing.xs,
  },
});
```

Tiếp tục với các components còn lại?

1. **Banner Carousel** (auto-scroll với dots)
2. **Category Grid** (4 columns)
3. **Bottom Tab Bar** (5 tabs Shopee-style)
4. **Filter Bottom Sheet**
5. **Flash Sale Section**

Bạn muốn tôi tiếp tục tạo các components này không?
