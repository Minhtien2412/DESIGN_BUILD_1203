# 🧩 Component Usage Guide

Practical guide for using navigation components effectively in your application.

---

## Overview

The navigation system provides 5 pre-built, type-safe components:

| Component | Use Case | Complexity |
|-----------|----------|------------|
| **RouteCard** | Card-style navigation buttons | ⭐ Beginner |
| **ServiceGrid** | Grid layouts for multiple routes | ⭐⭐ Intermediate |
| **QuickAccessButton** | Prominent CTA buttons | ⭐ Beginner |
| **NavigationBreadcrumb** | Hierarchical breadcrumb trail | ⭐⭐ Intermediate |
| **RouteLink** | Inline text links | ⭐ Beginner |

---

## 1. RouteCard

### Basic Usage

```tsx
import { RouteCard } from '@/components/navigation/RouteCard';
import { APP_ROUTES } from '@/constants/typed-routes';

export default function ServicesScreen() {
  return (
    <RouteCard
      route={APP_ROUTES.HOUSE_DESIGN}
      title="Thiết kế nhà"
      icon="home"
      color="#FF6B6B"
    />
  );
}
```

### With Description

```tsx
<RouteCard
  route={APP_ROUTES.HOUSE_DESIGN}
  title="Thiết kế nhà"
  description="Thiết kế chuyên nghiệp, hiện đại"
  icon="home"
  color="#FF6B6B"
/>
```

### Custom Press Handler

```tsx
<RouteCard
  route={APP_ROUTES.HOUSE_DESIGN}
  title="Thiết kế nhà"
  icon="home"
  color="#FF6B6B"
  onPress={() => {
    // Custom logic before navigation
    console.log('Opening house design');
    // Navigation handled automatically
  }}
/>
```

### Styling Variants

#### Horizontal Card

```tsx
<RouteCard
  route={APP_ROUTES.HOUSE_DESIGN}
  title="Thiết kế nhà"
  icon="home"
  color="#FF6B6B"
  style={{ flexDirection: 'row', alignItems: 'center' }}
/>
```

#### Compact Card

```tsx
<RouteCard
  route={APP_ROUTES.HOUSE_DESIGN}
  title="Thiết kế"
  icon="home"
  color="#FF6B6B"
  style={{ padding: 8, minHeight: 80 }}
/>
```

### Common Patterns

#### Service Cards Grid

```tsx
const SERVICES = [
  { route: APP_ROUTES.HOUSE_DESIGN, title: 'Thiết kế nhà', icon: 'home', color: '#FF6B6B' },
  { route: APP_ROUTES.INTERIOR_DESIGN, title: 'Nội thất', icon: 'cube', color: '#4ECDC4' },
  { route: APP_ROUTES.CONSTRUCTION_COMPANY, title: 'Thi công', icon: 'construct', color: '#FFD93D' },
];

return (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
    {SERVICES.map(service => (
      <RouteCard
        key={service.route}
        route={service.route}
        title={service.title}
        icon={service.icon}
        color={service.color}
        style={{ width: '48%' }}
      />
    ))}
  </View>
);
```

---

## 2. ServiceGrid

### Basic Usage

```tsx
import { ServiceGrid } from '@/components/navigation/ServiceGrid';
import { APP_ROUTES } from '@/constants/typed-routes';

const MAIN_SERVICES = [
  { route: APP_ROUTES.HOUSE_DESIGN, title: 'Thiết kế nhà', icon: 'home', color: '#FF6B6B' },
  { route: APP_ROUTES.INTERIOR_DESIGN, title: 'Nội thất', icon: 'cube', color: '#4ECDC4' },
  { route: APP_ROUTES.CONSTRUCTION_COMPANY, title: 'Thi công', icon: 'construct', color: '#FFD93D' },
  { route: APP_ROUTES.QUALITY_SUPERVISION, title: 'Giám sát', icon: 'checkmark-circle', color: '#95E1D3' },
];

export default function HomeScreen() {
  return (
    <ServiceGrid services={MAIN_SERVICES} />
  );
}
```

### Responsive Columns

```tsx
<ServiceGrid
  services={MAIN_SERVICES}
  columns={2}      // Mobile: 2 columns
  spacing={16}     // 16px gap between cards
/>

// Tablet/Desktop: Auto-adjust columns based on screen width
```

### Dynamic Service List

```tsx
import { useMemo } from 'react';

export default function DynamicServices() {
  const services = useMemo(() => {
    // Load from API, filter based on user role, etc.
    return [
      { route: APP_ROUTES.HOUSE_DESIGN, title: 'Design', icon: 'home', color: '#FF6B6B' },
      // ... more services
    ];
  }, []);

  return <ServiceGrid services={services} columns={2} />;
}
```

### With Section Headers

```tsx
<View>
  <Text style={styles.sectionTitle}>Dịch vụ chính</Text>
  <ServiceGrid services={MAIN_SERVICES} columns={2} />
  
  <Text style={styles.sectionTitle}>Tiện ích</Text>
  <ServiceGrid services={UTILITY_SERVICES} columns={3} />
</View>
```

---

## 3. QuickAccessButton

### Primary Button

```tsx
import { QuickAccessButton } from '@/components/navigation/QuickAccessButton';
import { APP_ROUTES } from '@/constants/typed-routes';

<QuickAccessButton
  route={APP_ROUTES.PROJECTS_CREATE}
  label="Tạo dự án mới"
  icon="add-circle"
  variant="primary"
/>
```

### Button Variants

```tsx
// Primary (solid background)
<QuickAccessButton
  route={APP_ROUTES.PROJECTS_CREATE}
  label="Tạo dự án"
  variant="primary"
/>

// Secondary (lighter background)
<QuickAccessButton
  route={APP_ROUTES.SITEMAP}
  label="Xem bản đồ"
  variant="secondary"
/>

// Outline (border only)
<QuickAccessButton
  route={APP_ROUTES.SEARCH}
  label="Tìm kiếm"
  variant="outline"
/>
```

### Full Width Button

```tsx
<QuickAccessButton
  route={APP_ROUTES.CHECKOUT}
  label="Thanh toán ngay"
  icon="card"
  variant="primary"
  fullWidth
/>
```

### Button Group

```tsx
<View style={{ flexDirection: 'row', gap: 12 }}>
  <QuickAccessButton
    route={APP_ROUTES.PROJECTS_CREATE}
    label="Tạo dự án"
    icon="add"
    variant="primary"
    style={{ flex: 1 }}
  />
  <QuickAccessButton
    route={APP_ROUTES.MY_PROJECTS}
    label="Dự án của tôi"
    icon="folder"
    variant="secondary"
    style={{ flex: 1 }}
  />
</View>
```

### With Loading State

```tsx
const [loading, setLoading] = useState(false);

<QuickAccessButton
  route={APP_ROUTES.CHECKOUT}
  label={loading ? 'Đang xử lý...' : 'Thanh toán'}
  icon="card"
  variant="primary"
  onPress={async () => {
    setLoading(true);
    await processPayment();
    setLoading(false);
    // Navigation happens after
  }}
  disabled={loading}
/>
```

---

## 4. NavigationBreadcrumb

### Basic Usage

```tsx
import { NavigationBreadcrumb } from '@/components/navigation/NavigationBreadcrumb';
import { APP_ROUTES } from '@/constants/typed-routes';

export default function HouseDesignScreen() {
  return (
    <View>
      <NavigationBreadcrumb currentRoute={APP_ROUTES.HOUSE_DESIGN} />
      {/* Rest of screen */}
    </View>
  );
}

// Renders: Home > Services > House Design
```

### Custom Separator

```tsx
<NavigationBreadcrumb
  currentRoute={APP_ROUTES.HOUSE_DESIGN}
  separator="›"
/>

// Renders: Home › Services › House Design
```

### Max Items (Truncation)

```tsx
<NavigationBreadcrumb
  currentRoute={APP_ROUTES.HOUSE_DESIGN}
  maxItems={3}
/>

// For deep routes: Home > ... > Parent > Current
```

### Responsive Breadcrumb

```tsx
import { useWindowDimensions } from 'react-native';

export default function ResponsiveBreadcrumb() {
  const { width } = useWindowDimensions();
  const maxItems = width < 768 ? 2 : 5; // Mobile: 2, Desktop: 5

  return (
    <NavigationBreadcrumb
      currentRoute={APP_ROUTES.HOUSE_DESIGN}
      maxItems={maxItems}
    />
  );
}
```

### Breadcrumb in Header

```tsx
export default function ScreenWithBreadcrumb() {
  return (
    <View>
      <View style={styles.header}>
        <NavigationBreadcrumb currentRoute={APP_ROUTES.HOUSE_DESIGN} />
      </View>
      <ScrollView>
        {/* Content */}
      </ScrollView>
    </View>
  );
}
```

---

## 5. RouteLink

### Inline Text Link

```tsx
import { RouteLink } from '@/components/navigation/RouteLink';
import { APP_ROUTES } from '@/constants/typed-routes';

<Text>
  Xem thêm thông tin tại{' '}
  <RouteLink route={APP_ROUTES.HOUSE_DESIGN}>
    trang thiết kế nhà
  </RouteLink>
</Text>
```

### Styled Link

```tsx
<RouteLink
  route={APP_ROUTES.HOUSE_DESIGN}
  style={{ color: '#FF6B6B', fontWeight: 'bold' }}
>
  Thiết kế nhà chuyên nghiệp
</RouteLink>
```

### Link in Paragraph

```tsx
<Text style={styles.paragraph}>
  Chúng tôi cung cấp đầy đủ dịch vụ từ{' '}
  <RouteLink route={APP_ROUTES.HOUSE_DESIGN}>thiết kế</RouteLink>
  {', '}
  <RouteLink route={APP_ROUTES.CONSTRUCTION_COMPANY}>thi công</RouteLink>
  {' đến '}
  <RouteLink route={APP_ROUTES.QUALITY_SUPERVISION}>giám sát chất lượng</RouteLink>
  .
</Text>
```

### Link List

```tsx
const RELATED_LINKS = [
  { route: APP_ROUTES.HOUSE_DESIGN, label: 'Thiết kế nhà' },
  { route: APP_ROUTES.INTERIOR_DESIGN, label: 'Thiết kế nội thất' },
  { route: APP_ROUTES.FENG_SHUI, label: 'Phong thủy' },
];

<View>
  <Text style={styles.title}>Xem thêm:</Text>
  {RELATED_LINKS.map(link => (
    <Text key={link.route}>
      • <RouteLink route={link.route}>{link.label}</RouteLink>
    </Text>
  ))}
</View>
```

---

## Advanced Patterns

### Conditional Navigation

```tsx
import { useAuth } from '@/contexts/AuthContext';

export default function ConditionalRoute() {
  const { user } = useAuth();

  return (
    <RouteCard
      route={user ? APP_ROUTES.MY_PROJECTS : APP_ROUTES.AUTH_LOGIN}
      title={user ? 'Dự án của tôi' : 'Đăng nhập'}
      icon={user ? 'folder' : 'log-in'}
      color="#4ECDC4"
    />
  );
}
```

### Dynamic Route with Parameters

```tsx
// For routes like /product/[id]
import { router } from 'expo-router';

<RouteCard
  route={`/product/${productId}` as AppRoute} // Type assertion for dynamic routes
  title={product.name}
  icon="cube"
  color="#FF6B6B"
/>

// Or use onPress for full control
<RouteCard
  route={APP_ROUTES.SHOPPING_INDEX} // Fallback route
  title={product.name}
  icon="cube"
  color="#FF6B6B"
  onPress={() => router.push(`/product/${productId}`)}
/>
```

### Analytics-Tracked Navigation

```tsx
import { trackNavigation } from '@/utils/analytics';

<RouteCard
  route={APP_ROUTES.HOUSE_DESIGN}
  title="Thiết kế nhà"
  icon="home"
  color="#FF6B6B"
  onPress={async () => {
    await trackNavigation(APP_ROUTES.HOUSE_DESIGN, {
      category: 'service',
      layer: 2,
      sessionId: userSession.id,
    });
    // Component handles actual navigation
  }}
/>
```

### Memoized Component Lists

```tsx
import { useMemo } from 'react';

export default function OptimizedServiceList() {
  const services = useMemo(() => [
    { route: APP_ROUTES.HOUSE_DESIGN, title: 'Thiết kế', icon: 'home', color: '#FF6B6B' },
    // ... more services
  ], []);

  return (
    <ServiceGrid services={services} />
  );
}
```

### Lazy Loading Components

```tsx
import { lazy, Suspense } from 'react';
import { ActivityIndicator } from 'react-native';

const ServiceGrid = lazy(() => import('@/components/navigation/ServiceGrid'));

export default function LazyServices() {
  return (
    <Suspense fallback={<ActivityIndicator />}>
      <ServiceGrid services={MAIN_SERVICES} />
    </Suspense>
  );
}
```

---

## Component Composition

### Combined Navigation UI

```tsx
export default function HomeScreen() {
  return (
    <ScrollView>
      {/* Hero CTA */}
      <QuickAccessButton
        route={APP_ROUTES.PROJECTS_CREATE}
        label="Tạo dự án mới"
        icon="add-circle"
        variant="primary"
        fullWidth
      />

      {/* Main Services Grid */}
      <Text style={styles.sectionTitle}>Dịch vụ chính</Text>
      <ServiceGrid services={MAIN_SERVICES} columns={2} />

      {/* Utility Links */}
      <Text style={styles.sectionTitle}>Tiện ích</Text>
      <View style={styles.utilityGrid}>
        {UTILITIES.map(util => (
          <RouteCard
            key={util.route}
            route={util.route}
            title={util.title}
            icon={util.icon}
            color={util.color}
            style={{ width: '30%' }}
          />
        ))}
      </View>

      {/* Footer Links */}
      <Text style={styles.footerText}>
        Xem thêm tại <RouteLink route={APP_ROUTES.SITEMAP}>Sơ đồ trang web</RouteLink>
      </Text>
    </ScrollView>
  );
}
```

---

## Best Practices

### 1. Always Use APP_ROUTES Constants

```tsx
// ❌ DON'T
<RouteCard route="/services/house-design" title="Design" />

// ✅ DO
<RouteCard route={APP_ROUTES.HOUSE_DESIGN} title="Design" />
```

### 2. Memoize Service Arrays

```tsx
// ❌ DON'T (recreates array on every render)
<ServiceGrid services={[
  { route: APP_ROUTES.HOUSE_DESIGN, title: 'Design', icon: 'home', color: '#FF6B6B' },
  // ...
]} />

// ✅ DO (memoize outside component or with useMemo)
const SERVICES = [ /* ... */ ];
<ServiceGrid services={SERVICES} />
```

### 3. Provide Meaningful Titles

```tsx
// ❌ DON'T (too generic)
<RouteCard route={APP_ROUTES.HOUSE_DESIGN} title="Click here" />

// ✅ DO (descriptive)
<RouteCard route={APP_ROUTES.HOUSE_DESIGN} title="Thiết kế nhà chuyên nghiệp" />
```

### 4. Use Icons Consistently

```tsx
// Establish icon mapping
const ROUTE_ICONS = {
  [APP_ROUTES.HOUSE_DESIGN]: 'home',
  [APP_ROUTES.INTERIOR_DESIGN]: 'cube',
  [APP_ROUTES.CONSTRUCTION_COMPANY]: 'construct',
};

// Apply consistently
<RouteCard
  route={APP_ROUTES.HOUSE_DESIGN}
  icon={ROUTE_ICONS[APP_ROUTES.HOUSE_DESIGN]}
  title="Thiết kế nhà"
/>
```

### 5. Handle Loading States

```tsx
const [loading, setLoading] = useState(true);
const [services, setServices] = useState([]);

useEffect(() => {
  loadServices().then(data => {
    setServices(data);
    setLoading(false);
  });
}, []);

if (loading) return <ActivityIndicator />;

return <ServiceGrid services={services} />;
```

---

## Accessibility

### Screen Reader Support

All components include proper accessibility labels:

```tsx
<RouteCard
  route={APP_ROUTES.HOUSE_DESIGN}
  title="Thiết kế nhà"
  icon="home"
  color="#FF6B6B"
  // Automatically adds:
  // accessibilityLabel="Thiết kế nhà"
  // accessibilityRole="button"
  // accessibilityHint="Navigate to house design service"
/>
```

### Custom Accessibility

```tsx
<RouteCard
  route={APP_ROUTES.HOUSE_DESIGN}
  title="Thiết kế nhà"
  icon="home"
  color="#FF6B6B"
  accessibilityLabel="Thiết kế nhà chuyên nghiệp"
  accessibilityHint="Mở trang dịch vụ thiết kế nhà để xem chi tiết"
/>
```

### Keyboard Navigation

All components support keyboard navigation automatically:
- **Tab:** Focus next component
- **Enter/Space:** Activate button
- **Escape:** Close modal/drawer

---

## Testing Components

### Unit Test Example

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { RouteCard } from '@/components/navigation/RouteCard';
import { APP_ROUTES } from '@/constants/typed-routes';

test('RouteCard navigates on press', () => {
  const mockPush = jest.fn();
  jest.mock('expo-router', () => ({
    router: { push: mockPush },
  }));

  const { getByText } = render(
    <RouteCard
      route={APP_ROUTES.HOUSE_DESIGN}
      title="Thiết kế nhà"
      icon="home"
      color="#FF6B6B"
    />
  );

  fireEvent.press(getByText('Thiết kế nhà'));
  expect(mockPush).toHaveBeenCalledWith(APP_ROUTES.HOUSE_DESIGN);
});
```

### Integration Test

```tsx
test('ServiceGrid renders all services', () => {
  const services = [
    { route: APP_ROUTES.HOUSE_DESIGN, title: 'Design', icon: 'home', color: '#FF6B6B' },
    { route: APP_ROUTES.INTERIOR_DESIGN, title: 'Interior', icon: 'cube', color: '#4ECDC4' },
  ];

  const { getByText } = render(<ServiceGrid services={services} />);

  expect(getByText('Design')).toBeTruthy();
  expect(getByText('Interior')).toBeTruthy();
});
```

---

## Common Pitfalls

### 1. Forgetting to Import APP_ROUTES

```tsx
// ❌ ERROR: Can't find 'HOUSE_DESIGN'
<RouteCard route={HOUSE_DESIGN} title="Design" />

// ✅ CORRECT
import { APP_ROUTES } from '@/constants/typed-routes';
<RouteCard route={APP_ROUTES.HOUSE_DESIGN} title="Design" />
```

### 2. Using Hardcoded Strings

```tsx
// ❌ NO TYPE SAFETY
<RouteCard route="/services/house-design" title="Design" />

// ✅ TYPE SAFE
<RouteCard route={APP_ROUTES.HOUSE_DESIGN} title="Design" />
```

### 3. Not Handling Dynamic Routes

```tsx
// ❌ BREAKS FOR /product/[id]
<RouteCard route={APP_ROUTES.PRODUCT_DETAIL} title="Product" />

// ✅ USE CUSTOM HANDLER
<RouteCard
  route={APP_ROUTES.SHOPPING_INDEX}
  title="Product"
  onPress={() => router.push(`/product/${productId}`)}
/>
```

### 4. Recreating Arrays on Every Render

```tsx
// ❌ PERFORMANCE ISSUE
function MyComponent() {
  return <ServiceGrid services={[ /* array literal */ ]} />;
}

// ✅ MEMOIZE
const SERVICES = [ /* ... */ ];
function MyComponent() {
  return <ServiceGrid services={SERVICES} />;
}
```

---

## Next Steps

- **[Adding New Routes](./adding-routes.md)** - Learn to add new routes
- **[Type Safety Guide](./type-safety.md)** - Deep dive into TypeScript benefits
- **[Performance Optimization](./performance.md)** - Optimize navigation performance

---

**Last Updated:** December 22, 2025  
**Version:** 1.0.0
