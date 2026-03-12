# 🎨 Frontend UI Components Documentation

**Framework:** Expo Router (SDK 54) + React 19 + TypeScript  
**Design System:** Custom Shopee-inspired mobile UI  
**Last Updated:** December 24, 2025

---

## 📑 Table of Contents

1. [Design Tokens](#design-tokens)
2. [UI Components Library](#ui-components-library)
3. [Screen Components](#screen-components)
4. [Navigation Structure](#navigation-structure)
5. [State Management](#state-management)
6. [Best Practices](#best-practices)

---

## 🎨 Design Tokens

### Color Palette

Located in `constants/theme.ts`

#### Light Theme
```typescript
{
  bg: '#ffffff',              // Background
  card: '#f8f9fa',           // Card background
  border: '#e9ecef',         // Border color
  text: '#212529',           // Primary text
  textSecondary: '#6c757d',  // Secondary text
  textMuted: '#adb5bd',      // Muted text
  accent: '#ff6b35',         // Primary accent (orange)
  accentSoft: '#fff3ec',     // Soft accent background
  live: '#FF3B30'            // Live indicator (red)
}
```

#### Dark Theme
```typescript
{
  bg: '#1a1a1a',             // Dark background
  card: '#2d2d2d',           // Dark card
  border: '#404040',         // Dark border
  text: '#ffffff',           // Light text
  textSecondary: '#b0b0b0',  // Secondary light text
  textMuted: '#808080',      // Muted light text
  accent: '#ff6b35',         // Accent (same)
  accentSoft: '#3a2620',     // Dark accent background
  live: '#FF3B30'            // Live indicator
}
```

### Typography

```typescript
{
  // Headers
  h1: { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
  h2: { fontSize: 24, fontWeight: '600', letterSpacing: -0.5 },
  h3: { fontSize: 20, fontWeight: '600', letterSpacing: -0.3 },
  
  // Body
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  
  // Labels
  label: { fontSize: 13, fontWeight: '500', letterSpacing: -0.2 },
  caption: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase' }
}
```

### Spacing

```typescript
{
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
}
```

### Border Radius

```typescript
{
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  round: 999  // Fully rounded (pills)
}
```

---

## 🧱 UI Components Library

Located in `components/ui/`

### Container

Wrapper component with consistent padding and spacing.

**Location:** `components/ui/container.tsx`

**Props:**
```typescript
{
  children: React.ReactNode;
  fullWidth?: boolean;        // Edge-to-edge (default: false)
  padding?: 'none' | 'sm' | 'md' | 'lg';  // Default: 'md'
  style?: ViewStyle;
}
```

**Usage:**
```tsx
<Container padding="lg">
  <Text>Content with large padding</Text>
</Container>

<Container fullWidth>
  <Text>Full width content</Text>
</Container>
```

---

### Section

Sectional divider with optional title and spacing.

**Location:** `components/ui/section.tsx`

**Props:**
```typescript
{
  title?: string;
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';  // Default: 'md'
  action?: React.ReactNode;       // Right side action button
}
```

**Usage:**
```tsx
<Section 
  title="Featured Products" 
  action={<Button label="View All" />}
  spacing="lg"
>
  <ProductList />
</Section>
```

---

### Button

Primary interactive button with loading state.

**Location:** `components/ui/button.tsx`

**Props:**
```typescript
{
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;              // Ionicons name
  fullWidth?: boolean;
  style?: ViewStyle;
}
```

**Variants:**

```tsx
// Primary (default)
<Button label="Continue" onPress={handleSubmit} />

// Secondary
<Button label="Cancel" variant="secondary" onPress={handleCancel} />

// Outline
<Button label="Learn More" variant="outline" onPress={handleInfo} />

// Ghost
<Button label="Skip" variant="ghost" onPress={handleSkip} />

// With loading state
<Button label="Submit" loading={isSubmitting} onPress={handleSubmit} />

// With icon
<Button label="Add to Cart" icon="cart-outline" onPress={addToCart} />
```

---

### Input

Text input field with label, error state, and validation.

**Location:** `components/ui/input.tsx`

**Props:**
```typescript
{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  leftIcon?: string;          // Ionicons name
  rightIcon?: string;
  onRightIconPress?: () => void;
}
```

**Usage:**
```tsx
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  placeholder="Enter your email"
  keyboardType="email-address"
  leftIcon="mail-outline"
  error={emailError}
/>

<Input
  label="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry={!showPassword}
  rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
  onRightIconPress={() => setShowPassword(!showPassword)}
/>
```

---

### ProductCard

Reusable product display card.

**Location:** `components/ui/product-card.tsx`

**Props:**
```typescript
{
  id: string;
  name: string;
  price: number;
  image: string;
  rating?: number;
  soldCount?: number;
  onPress?: () => void;
  onAddToCart?: () => void;
  compact?: boolean;          // Smaller variant
}
```

**Usage:**
```tsx
<ProductCard
  id="prod-001"
  name="Sofa Hiện Đại"
  price={15000000}
  image="https://example.com/sofa.jpg"
  rating={4.5}
  soldCount={128}
  onPress={() => router.push(`/product/${id}`)}
  onAddToCart={handleAddToCart}
/>
```

---

### MenuCard

Navigation card for feature modules.

**Location:** `components/ui/menu-card.tsx`

**Props:**
```typescript
{
  icon: string;               // Ionicons name
  title: string;
  subtitle?: string;
  color?: string;             // Accent color
  onPress: () => void;
  badge?: number;             // Notification badge count
}
```

**Usage:**
```tsx
<MenuCard
  icon="construct-outline"
  title="Construction"
  subtitle="Track project progress"
  color="#ff6b35"
  badge={3}
  onPress={() => router.push('/construction')}
/>
```

---

### InfoBox

Information display box with icon and text.

**Location:** `components/ui/info-box.tsx`

**Props:**
```typescript
{
  icon: string;
  title: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}
```

**Usage:**
```tsx
<InfoBox
  icon="checkmark-circle"
  title="Completed Tasks"
  value={25}
  variant="success"
/>
```

---

### Loader

Loading spinner with optional message.

**Location:** `components/ui/loader.tsx`

**Props:**
```typescript
{
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;       // Overlay entire screen
}
```

**Usage:**
```tsx
// Inline loader
<Loader message="Loading products..." />

// Full screen loader
<Loader fullScreen message="Authenticating..." />
```

---

## 📱 Screen Components

### Authentication Screens

**Location:** `app/(auth)/`

#### Sign In Screen
- Email/password login form
- "Forgot password" link
- Social login buttons (Google, Facebook)
- Navigation to sign up

#### Sign Up Screen
- **8 Role Selection Buttons:**
  - CLIENT (user icon)
  - ENGINEER (calculator icon)
  - CONTRACTOR (hammer icon)
  - STAFF (briefcase icon) - **Requires secret key**
  - ARCHITECT (compass icon)
  - DESIGNER (color-palette icon)
  - SUPPLIER (cube icon)
  - ADMIN (shield icon)
  
- **Staff Secret Validation:**
  - Input appears ONLY when STAFF role selected
  - Validates against hardcoded secret: `Nhaxinh@123`
  - Shows error "Mã bảo mật không đúng" if incorrect
  
- Form fields: Email, Password, Full Name, Phone (optional)
- Terms & conditions checkbox
- Navigation to sign in

**Key Implementation:**
```tsx
// Staff secret validation
if (selectedRole === 'STAFF' && staffSecret !== 'Nhaxinh@123') {
  setError('Mã bảo mật không đúng');
  return;
}

// Role selection renders 8 buttons
const roles = [
  { value: 'CLIENT', icon: 'person-outline', label: 'Client' },
  { value: 'ENGINEER', icon: 'calculator-outline', label: 'Engineer' },
  // ... 6 more roles
];
```

---

### Tab Screens

**Location:** `app/(tabs)/`

#### Home (Index)
- Hero banner with search
- Category chips (horizontal scroll)
- Featured products grid
- Recent projects section
- Quick action buttons (Construction, Materials, Safety, etc.)

#### Projects (Shop)
- Project listing with filters
- Status badges (Planning, In Progress, Completed)
- Progress bars
- Quick stats: Total projects, Active, Completed

#### Notifications
- Notification list with categories
- Mark as read functionality
- Filter by type (System, Project Updates, Messages)
- Empty state when no notifications

#### Profile
- User avatar and info
- Menu items: Edit Profile, Settings, Orders, Support, Logout
- Stats: Projects joined, Tasks completed
- Theme toggle (Light/Dark)

---

### Feature Screens

#### Product Detail
**Location:** `app/product/[id].tsx`

- Image carousel (swipeable)
- Product name, price, rating
- Description with "Read more" expansion
- Specifications table
- Quantity selector
- "Add to Cart" button
- Related products section

#### Cart
**Location:** `app/cart.tsx`

- Cart items list with thumbnails
- Quantity increment/decrement
- Remove item action
- Subtotal, tax, shipping breakdown
- Total price
- "Proceed to Checkout" button
- Empty cart state

#### Checkout
**Location:** `app/checkout.tsx`

- Delivery address form
- Payment method selection (COD, Credit Card, Bank Transfer)
- Order summary
- Terms acceptance
- "Place Order" button with loading state

---

## 🗺️ Navigation Structure

### Bottom Tab Navigation

4 visible tabs:
```
Home (index) → Shopping icon
Projects (shop) → Briefcase icon
Notifications → Bell icon
Profile → Person icon
```

### Hidden Routes

Located in `app/(tabs)/` but with `tabBarButton: () => null`:
- menu4.tsx (Utility route)
- menu5.tsx (Utility route)
- menu6.tsx (Utility route)
- menu7.tsx (Utility route)
- menu8.tsx (Utility route)
- menu9.tsx (Utility route)

### Dynamic Routes

```
/product/[id] → Product detail
/projects/[id] → Project detail
/meet/[code] → Video meeting room
```

### Navigation Helpers

```typescript
// Direct navigation
router.push('/cart');
router.push('/checkout');

// Dynamic navigation with params
router.push(`/product/${productId}`);
router.push(`/projects/${projectId}`);

// Go back
router.back();

// Replace (no back history)
router.replace('/profile');
```

---

## 🔄 State Management

### AuthContext

**Location:** `context/AuthContext.tsx`

```typescript
{
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
}
```

**Usage:**
```tsx
const { user, signIn, signOut } = useAuth();

// Check if authenticated
if (!user) {
  return <SignInScreen />;
}

// Sign out
await signOut();
```

---

### CartContext

**Location:** `context/CartContext.tsx`

```typescript
{
  items: CartItem[];
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
  totalQty: number;
  totalPrice: number;
}
```

**Usage:**
```tsx
const { items, add, totalPrice, totalQty } = useCart();

// Add product
add({ id: 'prod-001', name: 'Sofa', price: 15000000, image: '...' }, 2);

// Show cart badge
<Badge count={totalQty} />

// Display total
<Text>{totalPrice.toLocaleString('vi-VN')} VND</Text>
```

---

## ✅ Best Practices

### Component Structure

```tsx
// 1. Imports
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

// 2. Types
interface MyComponentProps {
  title: string;
  onPress: () => void;
}

// 3. Component
export function MyComponent({ title, onPress }: MyComponentProps) {
  // Hooks
  const colors = useThemeColor();
  
  // Handlers
  const handlePress = () => {
    // Logic
    onPress();
  };
  
  // Render
  return (
    <View style={{ backgroundColor: colors.card }}>
      <Text style={{ color: colors.text }}>{title}</Text>
      <Pressable onPress={handlePress}>
        <Text>Action</Text>
      </Pressable>
    </View>
  );
}

// 4. Styles
const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12
  }
});
```

---

### Styling Guidelines

✅ **DO:**
- Use theme colors via `useThemeColor()` hook
- Define styles in `StyleSheet.create()`
- Use semantic spacing tokens (`spacing.md`, `spacing.lg`)
- Keep inline styles minimal
- Use consistent border radius values

❌ **DON'T:**
- Hardcode colors (e.g., `color: '#000000'`)
- Use arbitrary numeric values (e.g., `padding: 13`)
- Mix theme colors with hardcoded values
- Create duplicate style definitions

---

### Type Safety

```typescript
// Define component props
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

// Use type helpers
export const productRoute = (id: string) => `/product/${id}` as const;

// Avoid `as any` casts
// ❌ BAD:
router.push('/cart' as any);

// ✅ GOOD:
router.push('/cart');
```

---

### Performance Optimization

```tsx
// Memoize expensive computations
const sortedProducts = useMemo(() => {
  return products.sort((a, b) => b.rating - a.rating);
}, [products]);

// Memoize callbacks
const handlePress = useCallback(() => {
  router.push(`/product/${id}`);
}, [id]);

// Use FlatList for large lists
<FlatList
  data={products}
  renderItem={({ item }) => <ProductCard {...item} />}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
/>
```

---

### Asset Management

```tsx
// ✅ GOOD: Require base scale image
const logo = require('../assets/images/logo.png');

// ❌ BAD: Never require @2x/@3x directly
const logo = require('../assets/images/logo@2x.png');  // WRONG!

// Metro auto-resolves:
// logo.png → iPhone SE
// logo@2x.png → iPhone 12
// logo@3x.png → iPhone 14 Pro
```

---

### Error Handling

```tsx
// UI components should handle errors gracefully
try {
  await signIn(email, password);
  router.replace('/');
} catch (error) {
  if (error instanceof ApiError) {
    setError(error.message);
  } else {
    setError('An unexpected error occurred');
  }
}

// Show user-friendly error messages
<Input
  label="Email"
  value={email}
  error={emailError}  // Display below input
/>
```

---

## 📋 Component Checklist

Before creating a new component:

- [ ] Check if existing UI component can be reused
- [ ] Define TypeScript interface for props
- [ ] Use theme colors via `useThemeColor()` hook
- [ ] Follow naming conventions (PascalCase for components)
- [ ] Add JSDoc comments for complex props
- [ ] Handle loading and error states
- [ ] Test on both light and dark themes
- [ ] Verify accessibility (labels, hit slop, contrast)
- [ ] Optimize for performance (memoization if needed)

---

## 🎯 Screen Template

```tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Container, Section, Button, Loader } from '@/components/ui';

export default function MyScreen() {
  const router = useRouter();
  const colors = useThemeColor();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch data
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen message="Loading..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView>
        <Container>
          <Section title="My Section">
            <Text style={{ color: colors.text }}>Content</Text>
          </Section>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
```

---

**Last Updated:** December 24, 2025  
**Version:** 1.0.0
