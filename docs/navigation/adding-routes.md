# ➕ Adding New Routes

Step-by-step checklist for adding new routes to the application.

---

## Quick Reference

**Time Required:** 10-15 minutes per route  
**Difficulty:** ⭐ Beginner  
**Prerequisites:** Basic TypeScript knowledge

---

## The Complete Checklist

### ✅ Phase 1: Define Route (5 minutes)

1. **Add route constant to `typed-routes.ts`**

```typescript
// constants/typed-routes.ts

export const APP_ROUTES = {
  // ... existing routes ...
  
  // Add your new route here
  MY_NEW_FEATURE: '/features/my-new-feature' as const,
} as const;
```

**Naming Conventions:**
- Use SCREAMING_SNAKE_CASE for constant names
- Use kebab-case for route paths
- Start path with `/`
- No trailing slash (except root `/`)
- Group related routes together

**Examples:**
```typescript
// ✅ GOOD
HOUSE_DESIGN: '/services/house-design' as const,
PROJECT_CREATE: '/projects/create' as const,
ADMIN_DASHBOARD: '/admin/dashboard' as const,

// ❌ BAD
houseDesign: '/services/HouseDesign' as const,  // Wrong case
HOUSE_DESIGN: 'services/house-design' as const, // Missing leading /
HOUSE_DESIGN: '/services/house-design/' as const, // Trailing slash
```

2. **Verify TypeScript compiles**

```bash
npm run typecheck
```

Should show zero errors. The `AppRoute` type automatically includes your new route.

---

### ✅ Phase 2: Create Route File (5 minutes)

3. **Create the screen file**

```bash
# Create directory if needed
mkdir -p app/features

# Create screen file
touch app/features/my-new-feature.tsx
```

4. **Add basic screen implementation**

```tsx
// app/features/my-new-feature.tsx

import { View, Text, StyleSheet } from 'react-native';
import { Container } from '@/components/ui/container';
import { NavigationBreadcrumb } from '@/components/navigation/NavigationBreadcrumb';
import { APP_ROUTES } from '@/constants/typed-routes';

export default function MyNewFeatureScreen() {
  return (
    <Container>
      <NavigationBreadcrumb currentRoute={APP_ROUTES.MY_NEW_FEATURE} />
      
      <Text style={styles.title}>My New Feature</Text>
      <Text style={styles.description}>
        This is my new feature screen.
      </Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
});
```

**File Location Rules:**
- Match file path to route path
- Options:
  - `app/features/my-new-feature.tsx` ✅
  - `app/features/my-new-feature/index.tsx` ✅
- Use `(tabs)` for tab routes: `app/(tabs)/my-tab.tsx`

---

### ✅ Phase 3: Add Navigation Links (3 minutes)

5. **Add RouteCard to home screen or relevant section**

```tsx
// app/(tabs)/index.tsx

import { RouteCard } from '@/components/navigation/RouteCard';
import { APP_ROUTES } from '@/constants/typed-routes';

// Add to your render method
<RouteCard
  route={APP_ROUTES.MY_NEW_FEATURE}
  title="My New Feature"
  icon="star"
  color="#FF6B6B"
  description="Try out our new feature"
/>
```

6. **Optional: Add to ServiceGrid**

```tsx
const NEW_SERVICES = [
  {
    route: APP_ROUTES.MY_NEW_FEATURE,
    title: 'My New Feature',
    icon: 'star',
    color: '#FF6B6B',
  },
  // ... more services
];

<ServiceGrid services={NEW_SERVICES} columns={2} />
```

---

### ✅ Phase 4: Add Metadata (2 minutes)

7. **Add route to category mapping** (optional but recommended)

```typescript
// constants/typed-routes.ts

export function getRouteCategory(route: AppRoute): RouteCategory {
  if (route.startsWith('/services/')) return 'service';
  if (route.startsWith('/features/')) return 'feature'; // Add new category
  // ... other categories
  return 'other';
}
```

8. **Add to route metadata** (optional)

```typescript
// constants/route-metadata.ts (create if doesn't exist)

export const ROUTE_METADATA: Record<AppRoute, RouteMetadata> = {
  [APP_ROUTES.MY_NEW_FEATURE]: {
    route: APP_ROUTES.MY_NEW_FEATURE,
    category: 'feature',
    layer: 2,
    title: 'My New Feature',
    description: 'Description of the feature',
    requiresAuth: false,
    icon: 'star',
  },
  // ... other routes
};
```

---

### ✅ Phase 5: Testing (5 minutes)

9. **Run route verification tests**

```bash
npm run test:routes
```

Expected output:
```
✅ /features/my-new-feature
   → app/features/my-new-feature.tsx
```

10. **Manual testing**

```bash
npm start
```

- [ ] Navigate to your new route from home screen
- [ ] Verify breadcrumb displays correctly
- [ ] Test back navigation
- [ ] Check on both iOS and Android (if applicable)

11. **Check for hardcoded paths**

```bash
npm run test:routes:links
```

Should show your new route as a valid route in the output.

---

### ✅ Phase 6: Documentation (Optional, 2 minutes)

12. **Update route inventory**

```markdown
// ROUTE_MAPPING_AUDIT.md

### Layer 2: Feature Routes

| Route | Path | Screen File | Status |
|-------|------|-------------|--------|
| MY_NEW_FEATURE | /features/my-new-feature | app/features/my-new-feature.tsx | ✅ Active |
```

13. **Add to sitemap** (if using interactive sitemap)

```tsx
// app/sitemap/index.tsx

const FEATURES_ROUTES = [
  { route: APP_ROUTES.MY_NEW_FEATURE, title: 'My New Feature', layer: 2 },
  // ... other features
];
```

---

## Quick Start Template

Copy-paste this template for new routes:

### 1. Add to `constants/typed-routes.ts`

```typescript
MY_NEW_FEATURE: '/category/my-new-feature' as const,
```

### 2. Create `app/category/my-new-feature.tsx`

```tsx
import { View, Text, StyleSheet } from 'react-native';
import { Container } from '@/components/ui/container';
import { APP_ROUTES } from '@/constants/typed-routes';

export default function MyNewFeatureScreen() {
  return (
    <Container>
      <Text style={styles.title}>My New Feature</Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold' },
});
```

### 3. Add navigation link

```tsx
<RouteCard
  route={APP_ROUTES.MY_NEW_FEATURE}
  title="My New Feature"
  icon="star"
  color="#FF6B6B"
/>
```

### 4. Test

```bash
npm run test:routes
```

---

## Advanced Scenarios

### Dynamic Routes (with Parameters)

For routes like `/product/[id]` or `/projects/[id]/edit`:

1. **Add base route to typed-routes**

```typescript
PRODUCT_DETAIL: '/product/[id]' as const,
PROJECT_EDIT: '/projects/[id]/edit' as const,
```

2. **Create file with brackets**

```bash
mkdir -p app/product
touch app/product/[id].tsx
```

3. **Access parameters in screen**

```tsx
// app/product/[id].tsx

import { useLocalSearchParams } from 'expo-router';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  return (
    <View>
      <Text>Product ID: {id}</Text>
    </View>
  );
}
```

4. **Navigate with parameters**

```tsx
// Use template literal
router.push(`/product/${productId}`);

// Or use helper
router.push({
  pathname: APP_ROUTES.PRODUCT_DETAIL,
  params: { id: productId },
});
```

---

### Nested Routes

For nested navigation like `/admin/users/[id]/edit`:

1. **Create directory structure**

```bash
mkdir -p app/admin/users/[id]
touch app/admin/users/[id]/edit.tsx
```

2. **Add to typed-routes**

```typescript
ADMIN_USER_EDIT: '/admin/users/[id]/edit' as const,
```

3. **Navigate**

```tsx
router.push(`/admin/users/${userId}/edit`);
```

---

### Tab Routes

For bottom tab navigation routes:

1. **Create in `(tabs)` directory**

```bash
touch app/(tabs)/my-tab.tsx
```

2. **Add to typed-routes**

```typescript
MY_TAB: '/(tabs)/my-tab' as const,
```

3. **Configure tab in `app/(tabs)/_layout.tsx`**

```tsx
<Tabs.Screen
  name="my-tab"
  options={{
    title: 'My Tab',
    tabBarIcon: ({ color }) => <TabBarIcon name="star" color={color} />,
  }}
/>
```

---

### Modal Routes

For modal/overlay screens:

1. **Create in root or dedicated folder**

```bash
touch app/modals/my-modal.tsx
```

2. **Add to typed-routes**

```typescript
MY_MODAL: '/modals/my-modal' as const,
```

3. **Navigate with modal presentation**

```tsx
router.push({
  pathname: APP_ROUTES.MY_MODAL,
  params: { presentation: 'modal' },
});
```

---

## Common Issues & Solutions

### Issue 1: Route not found after adding

**Symptom:** Test fails with "Route not found"

**Solution:**
```bash
# Clear Metro cache
npx expo start --clear

# Verify file exists
ls app/features/my-new-feature.tsx

# Check path matches route
# Route: /features/my-new-feature
# File: app/features/my-new-feature.tsx ✅
```

---

### Issue 2: TypeScript error on new route

**Symptom:** `Property 'MY_NEW_FEATURE' does not exist on type...`

**Solution:**
```typescript
// Make sure you added it to APP_ROUTES
export const APP_ROUTES = {
  // ... existing routes ...
  MY_NEW_FEATURE: '/features/my-new-feature' as const, // Add this
} as const;

// Restart TypeScript server
// VS Code: Cmd+Shift+P > "TypeScript: Restart TS Server"
```

---

### Issue 3: Navigation doesn't work

**Symptom:** Button press does nothing

**Solution:**
```tsx
// Check you're using APP_ROUTES constant
<RouteCard route={APP_ROUTES.MY_NEW_FEATURE} /> // ✅

// NOT hardcoded string
<RouteCard route="/features/my-new-feature" /> // ❌

// Verify router import
import { router } from 'expo-router'; // ✅
```

---

### Issue 4: Screen shows blank

**Symptom:** Route navigates but screen is empty

**Solution:**
```tsx
// Make sure you export default
export default function MyScreen() { // ✅

// NOT named export
export function MyScreen() { // ❌
```

---

## Naming Conventions Reference

### Route Constant Names (TypeScript)

```typescript
// Pattern: CATEGORY_FEATURE_ACTION
HOUSE_DESIGN: '/services/house-design',
PROJECT_CREATE: '/projects/create',
ADMIN_USER_EDIT: '/admin/users/[id]/edit',

// Single word features
HOME: '/(tabs)/index',
CART: '/cart',
SEARCH: '/search',

// Grouped features
CONSTRUCTION_PROGRESS: '/construction/progress',
CONSTRUCTION_TRACKING: '/construction/tracking',
CONSTRUCTION_BOOKING: '/construction/booking',
```

### Route Paths (URL)

```typescript
// Pattern: /category/feature-name or /category/sub-category/feature-name

// ✅ GOOD
'/services/house-design'
'/construction/progress'
'/admin/users/create'
'/projects/[id]/edit'

// ❌ BAD
'/services/houseDesign'      // camelCase
'/services/house_design'      // snake_case
'/services/HOUSE-DESIGN'      // UPPERCASE
'/services/house-design/'     // trailing slash
'services/house-design'       // missing leading /
```

### File Paths

```
app/
├── (tabs)/
│   ├── index.tsx          // Home tab
│   ├── projects.tsx       // Projects tab
│   └── profile.tsx        // Profile tab
├── services/
│   ├── house-design.tsx
│   └── interior-design.tsx
├── construction/
│   ├── progress.tsx
│   └── tracking.tsx
├── product/
│   └── [id].tsx           // Dynamic route
└── admin/
    └── users/
        └── [id]/
            └── edit.tsx   // Nested dynamic route
```

---

## Testing Checklist

Before committing your new route:

- [ ] Route constant added to `typed-routes.ts`
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Screen file exists in correct location
- [ ] Screen exports default function
- [ ] Navigation link added (RouteCard/ServiceGrid)
- [ ] Route verification passes: `npm run test:routes:verify`
- [ ] Navigation links validation passes: `npm run test:routes:links`
- [ ] Naming conventions pass: `npm run test:routes:naming`
- [ ] Manual testing: Route navigates correctly
- [ ] Manual testing: Back navigation works
- [ ] Manual testing: Breadcrumb displays (if applicable)
- [ ] No hardcoded route strings in navigation calls
- [ ] Documentation updated (if required)

---

## Next Steps

After adding your route:

1. **[Component Usage Guide](./component-guide.md)** - Enhance your screen with navigation components
2. **[Analytics Integration](./analytics.md)** - Add tracking to your route
3. **[Performance Optimization](./performance.md)** - Optimize loading and rendering

---

## Need Help?

- **Slack:** #navigation-help
- **Email:** navigation-team@yourcompany.com
- **Docs:** [Troubleshooting Guide](./troubleshooting.md)

---

**Last Updated:** December 22, 2025  
**Version:** 1.0.0
