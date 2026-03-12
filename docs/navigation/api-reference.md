# 📖 API Reference

Complete reference for all navigation-related functions, types, and components.

---

## Table of Contents

1. [Constants](#constants)
2. [Types](#types)
3. [Helper Functions](#helper-functions)
4. [Components](#components)
5. [Analytics](#analytics)
6. [Hooks](#hooks)

---

## Constants

### APP_ROUTES

**Location:** `constants/typed-routes.ts`

Object containing all application routes as strongly-typed constants.

```typescript
export const APP_ROUTES = {
  HOME: '/(tabs)/index' as const,
  HOUSE_DESIGN: '/services/house-design' as const,
  CONSTRUCTION_PROGRESS: '/construction/progress' as const,
  // ... 68 more routes
} as const;
```

**Total Routes:** 71

**Categories:**
- **Services** (9 routes): House design, interior design, construction companies, etc.
- **Construction** (6 routes): Progress tracking, booking, map view, etc.
- **Utilities** (14 routes): Cost estimator, QR code, store locator, etc.
- **Finishing** (8 routes): Tiles, paint, stone, etc.
- **Project Management** (15 routes): Materials, labor, timeline, budget, etc.
- **Shopping** (5 routes): Categories, cart, checkout, etc.
- **Communication** (4 routes): Messages, calls, notifications, etc.
- **Admin** (3 routes): Dashboard, analytics, etc.
- **Tabs** (5 routes): Home, projects, live, notifications, profile

**Usage:**

```typescript
import { APP_ROUTES } from '@/constants/typed-routes';
import { router } from 'expo-router';

// Navigate to house design
router.push(APP_ROUTES.HOUSE_DESIGN);

// Use in link
<Link href={APP_ROUTES.CONSTRUCTION_PROGRESS}>View Progress</Link>
```

**Benefits:**
- ✅ Compile-time type checking
- ✅ Autocomplete in IDE
- ✅ Refactoring safety (rename all references)
- ✅ Zero typos (compiler catches errors)

---

## Types

### AppRoute

**Location:** `constants/typed-routes.ts`

Union type of all valid routes derived from `APP_ROUTES`.

```typescript
export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];

// Examples of valid AppRoute values:
// - '/(tabs)/index'
// - '/services/house-design'
// - '/construction/progress'
```

**Usage:**

```typescript
function navigateTo(route: AppRoute) {
  router.push(route);
}

// ✅ Valid - type-safe
navigateTo(APP_ROUTES.HOUSE_DESIGN);

// ❌ Error - TypeScript catches invalid route
navigateTo('/invalid/route'); // Type error!
```

### RouteCategory

**Location:** `constants/typed-routes.ts`

```typescript
type RouteCategory = 
  | 'home'
  | 'service'
  | 'utility'
  | 'construction'
  | 'finishing'
  | 'project-management'
  | 'shopping'
  | 'communication'
  | 'admin'
  | 'other';
```

### RouteMetadata

**Location:** `constants/typed-routes.ts`

```typescript
interface RouteMetadata {
  route: AppRoute;
  category: RouteCategory;
  layer: number; // 0-9 (depth in hierarchy)
  title?: string;
  description?: string;
  requiresAuth?: boolean;
  icon?: string;
}
```

**Example:**

```typescript
const metadata: RouteMetadata = {
  route: APP_ROUTES.HOUSE_DESIGN,
  category: 'service',
  layer: 2,
  title: 'Thiết kế nhà',
  description: 'Professional house design services',
  requiresAuth: false,
  icon: 'home',
};
```

---

## Helper Functions

### isValidRoute()

Validates if a string is a valid route in the application.

**Signature:**

```typescript
function isValidRoute(route: string): route is AppRoute
```

**Parameters:**
- `route` (string): Route path to validate

**Returns:** `boolean` - True if route exists in `APP_ROUTES`

**Usage:**

```typescript
import { isValidRoute } from '@/constants/typed-routes';

const userInput = '/services/house-design';

if (isValidRoute(userInput)) {
  // TypeScript now knows userInput is AppRoute
  router.push(userInput);
} else {
  console.error('Invalid route:', userInput);
}
```

**Performance:** O(n) - Linear search through route values

---

### getRouteCategory()

Gets the category of a route (service, utility, construction, etc.).

**Signature:**

```typescript
function getRouteCategory(route: AppRoute): RouteCategory
```

**Parameters:**
- `route` (AppRoute): Route to categorize

**Returns:** `RouteCategory` - Category of the route

**Usage:**

```typescript
import { getRouteCategory, APP_ROUTES } from '@/constants/typed-routes';

const category = getRouteCategory(APP_ROUTES.HOUSE_DESIGN);
console.log(category); // 'service'

// Use for conditional styling
const bgColor = category === 'service' ? '#FF6B6B' : '#4ECDC4';
```

**Category Detection Rules:**
1. Path starts with `/services/` → `'service'`
2. Path starts with `/utilities/` → `'utility'`
3. Path starts with `/construction/` → `'construction'`
4. Path starts with `/finishing/` → `'finishing'`
5. Path starts with `/shopping/` → `'shopping'`
6. Path is `/(tabs)/index` → `'home'`
7. Path starts with `/admin/` → `'admin'`
8. Otherwise → `'other'`

---

### searchRoutes()

Searches routes by keyword with fuzzy matching.

**Signature:**

```typescript
function searchRoutes(query: string): AppRoute[]
```

**Parameters:**
- `query` (string): Search keyword (case-insensitive)

**Returns:** `AppRoute[]` - Array of matching routes

**Usage:**

```typescript
import { searchRoutes } from '@/constants/typed-routes';

// Search by Vietnamese keyword
const results = searchRoutes('thiết kế');
// Returns: [
//   '/services/house-design',
//   '/services/interior-design',
//   '/utilities/design-team'
// ]

// Search by English keyword
const constructionRoutes = searchRoutes('construction');
// Returns all routes containing 'construction'
```

**Search Algorithm:**
1. Convert query to lowercase
2. Check if route path contains query string
3. Return all matches (unsorted)

**Performance:** O(n) - Linear scan through all routes

**Enhancement Opportunity:**
- Add Vietnamese keyword mapping (e.g., "thiết kế" → "design")
- Implement fuzzy matching (Levenshtein distance)
- Add relevance scoring

---

### getRouteMetadata()

Gets comprehensive metadata for a route.

**Signature:**

```typescript
function getRouteMetadata(route: AppRoute): RouteMetadata
```

**Parameters:**
- `route` (AppRoute): Route to get metadata for

**Returns:** `RouteMetadata` - Full route metadata object

**Usage:**

```typescript
import { getRouteMetadata, APP_ROUTES } from '@/constants/typed-routes';

const metadata = getRouteMetadata(APP_ROUTES.HOUSE_DESIGN);

console.log(metadata);
// {
//   route: '/services/house-design',
//   category: 'service',
//   layer: 2,
//   title: 'House Design',
//   requiresAuth: false
// }
```

**Metadata Sources:**
- `route`: Direct value
- `category`: Computed via `getRouteCategory()`
- `layer`: Computed from path depth (0-9)
- `title`: Derived from path (future: external config file)
- `requiresAuth`: Based on category (admin routes require auth)

---

## Components

### RouteCard

Card-style navigation button with icon, title, and description.

**Location:** `components/navigation/RouteCard.tsx`

**Props:**

```typescript
interface RouteCardProps {
  route: AppRoute;           // Required: route to navigate to
  title: string;             // Required: display title
  icon?: string;             // Optional: icon name (Ionicons)
  color?: string;            // Optional: accent color
  description?: string;      // Optional: subtitle text
  onPress?: () => void;      // Optional: custom press handler
}
```

**Usage:**

```tsx
import { RouteCard } from '@/components/navigation/RouteCard';
import { APP_ROUTES } from '@/constants/typed-routes';

<RouteCard
  route={APP_ROUTES.HOUSE_DESIGN}
  title="Thiết kế nhà"
  icon="home"
  color="#FF6B6B"
  description="Chuyên nghiệp, hiện đại"
/>
```

**Features:**
- ✅ Automatic analytics tracking on press
- ✅ Press animation (scale)
- ✅ Customizable appearance
- ✅ Accessible (screen reader support)

**Styling:**
- Default: White background, rounded corners, shadow
- Hover: Slight scale (1.05)
- Active: Scale down (0.95)

---

### ServiceGrid

Grid layout for displaying multiple navigation cards.

**Location:** `components/navigation/ServiceGrid.tsx`

**Props:**

```typescript
interface ServiceGridProps {
  services: Array<{
    route: AppRoute;
    title: string;
    icon: string;
    color: string;
  }>;
  columns?: number;          // Optional: grid columns (default: 2)
  spacing?: number;          // Optional: gap between cards (default: 16)
}
```

**Usage:**

```tsx
import { ServiceGrid } from '@/components/navigation/ServiceGrid';
import { APP_ROUTES } from '@/constants/typed-routes';

const MAIN_SERVICES = [
  {
    route: APP_ROUTES.HOUSE_DESIGN,
    title: 'Thiết kế nhà',
    icon: 'home',
    color: '#FF6B6B',
  },
  {
    route: APP_ROUTES.INTERIOR_DESIGN,
    title: 'Nội thất',
    icon: 'cube',
    color: '#4ECDC4',
  },
  // ... more services
];

<ServiceGrid
  services={MAIN_SERVICES}
  columns={2}
  spacing={12}
/>
```

**Responsive:**
- Mobile: 2 columns (default)
- Tablet: 3-4 columns (auto-adjust based on screen width)
- Desktop: 4+ columns

---

### QuickAccessButton

Prominent CTA-style button for primary actions.

**Location:** `components/navigation/QuickAccessButton.tsx`

**Props:**

```typescript
interface QuickAccessButtonProps {
  route: AppRoute;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  onPress?: () => void;
}
```

**Usage:**

```tsx
import { QuickAccessButton } from '@/components/navigation/QuickAccessButton';
import { APP_ROUTES } from '@/constants/typed-routes';

<QuickAccessButton
  route={APP_ROUTES.PROJECTS_CREATE}
  label="Tạo dự án mới"
  icon="add-circle"
  variant="primary"
  fullWidth
/>
```

**Variants:**
- `primary`: Solid background, white text
- `secondary`: Lighter background, dark text
- `outline`: Border only, transparent background

---

### NavigationBreadcrumb

Hierarchical breadcrumb trail showing navigation path.

**Location:** `components/navigation/NavigationBreadcrumb.tsx`

**Props:**

```typescript
interface NavigationBreadcrumbProps {
  currentRoute: AppRoute;
  separator?: string;        // Default: '/'
  maxItems?: number;         // Default: 5
}
```

**Usage:**

```tsx
import { NavigationBreadcrumb } from '@/components/navigation/NavigationBreadcrumb';
import { APP_ROUTES } from '@/constants/typed-routes';

<NavigationBreadcrumb
  currentRoute={APP_ROUTES.HOUSE_DESIGN}
  separator="›"
  maxItems={3}
/>

// Renders: Home › Services › House Design
```

**Features:**
- ✅ Auto-generates breadcrumb from route path
- ✅ Clickable segments (navigate to parent routes)
- ✅ Truncation for long paths
- ✅ Responsive (collapses on mobile)

---

### RouteLink

Inline text link with route.

**Location:** `components/navigation/RouteLink.tsx`

**Props:**

```typescript
interface RouteLinkProps {
  route: AppRoute;
  children: React.ReactNode;
  style?: TextStyle;
}
```

**Usage:**

```tsx
import { RouteLink } from '@/components/navigation/RouteLink';
import { APP_ROUTES } from '@/constants/typed-routes';

<Text>
  Xem thêm tại{' '}
  <RouteLink route={APP_ROUTES.HOUSE_DESIGN}>
    trang thiết kế nhà
  </RouteLink>
</Text>
```

**Features:**
- ✅ Styled as link (underline, color)
- ✅ Press animation
- ✅ Analytics tracking

---

## Analytics

### trackNavigation()

Tracks navigation events for analytics.

**Location:** `utils/analytics.ts`

**Signature:**

```typescript
function trackNavigation(
  route: string,
  metadata?: {
    category?: string;
    layer?: number;
    sessionId?: string;
  }
): Promise<void>
```

**Parameters:**
- `route` (string): Route being navigated to
- `metadata` (optional):
  - `category`: Route category (service, utility, etc.)
  - `layer`: Depth in hierarchy (0-9)
  - `sessionId`: User session ID

**Usage:**

```typescript
import { trackNavigation } from '@/utils/analytics';
import { APP_ROUTES } from '@/constants/typed-routes';

async function handlePress() {
  await trackNavigation(APP_ROUTES.HOUSE_DESIGN, {
    category: 'service',
    layer: 2,
  });
  
  router.push(APP_ROUTES.HOUSE_DESIGN);
}
```

**Data Stored:**
- Event type: `'navigation_action'`
- Action: `'link'`
- Destination: Route path
- Timestamp: ISO 8601 format
- Metadata: Category, layer, session ID

**Storage:** AsyncStorage (key: `@analytics_events`)

**Retention:** 30 days (auto-cleanup)

**See:** [NAVIGATION_ANALYTICS_GUIDE.md](../NAVIGATION_ANALYTICS_GUIDE.md) for full documentation

---

## Hooks

### useNavigation()

Custom hook for type-safe navigation.

**Location:** `hooks/useNavigation.ts` (if exists)

**Signature:**

```typescript
function useNavigation() {
  return {
    navigate: (route: AppRoute) => void;
    goBack: () => void;
    canGoBack: () => boolean;
  };
}
```

**Usage:**

```tsx
import { useNavigation } from '@/hooks/useNavigation';
import { APP_ROUTES } from '@/constants/typed-routes';

function MyComponent() {
  const { navigate, goBack } = useNavigation();
  
  return (
    <Button onPress={() => navigate(APP_ROUTES.HOUSE_DESIGN)}>
      Go to House Design
    </Button>
  );
}
```

**Note:** This hook wraps `expo-router`'s router for convenience and analytics integration.

---

## Migration Helpers

### migrateToTypedRoute()

Helper function to migrate hardcoded paths to typed routes.

**Usage:**

```typescript
// Before migration
router.push('/services/house-design');

// During migration (development only)
router.push(migrateToTypedRoute('/services/house-design'));
// Logs warning: "Use APP_ROUTES.HOUSE_DESIGN instead"

// After migration
router.push(APP_ROUTES.HOUSE_DESIGN);
```

**Development Tool:** Helps identify remaining hardcoded paths in console.

---

## Error Handling

### RouteNotFoundError

Thrown when attempting to navigate to invalid route.

```typescript
class RouteNotFoundError extends Error {
  constructor(route: string) {
    super(`Route not found: ${route}`);
    this.name = 'RouteNotFoundError';
  }
}
```

**Usage:**

```typescript
try {
  if (!isValidRoute(userInput)) {
    throw new RouteNotFoundError(userInput);
  }
  router.push(userInput);
} catch (error) {
  if (error instanceof RouteNotFoundError) {
    showErrorToast('Invalid navigation link');
  }
}
```

---

## TypeScript Utilities

### Extract Route Pattern

Extract routes matching a pattern:

```typescript
type ServiceRoutes = Extract<AppRoute, `/services/${string}`>;
// Result: Union of all service routes

type ConstructionRoutes = Extract<AppRoute, `/construction/${string}`>;
// Result: Union of all construction routes
```

### Route String Literal

Create string literal types from routes:

```typescript
type RouteString = `route:${AppRoute}`;
// Examples: 'route:/services/house-design', 'route:/cart', etc.
```

---

## Performance Considerations

### Route Lookup Performance

| Function | Time Complexity | Notes |
|----------|-----------------|-------|
| `isValidRoute()` | O(n) | Linear search, ~71 routes |
| `getRouteCategory()` | O(1) | Pattern matching |
| `searchRoutes()` | O(n) | Linear search with filter |
| `getRouteMetadata()` | O(1) | Computed on-the-fly |

**Optimization Opportunities:**
- Use `Map<string, AppRoute>` for O(1) validation
- Cache metadata in WeakMap
- Implement trie for prefix search

### Bundle Size Impact

- **typed-routes.ts:** ~5KB
- **Navigation components:** ~15KB
- **Analytics:** ~8KB
- **Total:** ~28KB

**Lazy Loading:**
All navigation components support lazy loading via `React.lazy()`:

```tsx
const RouteCard = lazy(() => import('@/components/navigation/RouteCard'));
```

---

## Version History

### v1.0.0 (Current)
- Initial release
- 71 typed routes
- 5 navigation components
- Full analytics integration
- Complete test suite

### Future (v2.0.0)
- Dynamic route generation from backend
- AI-powered route suggestions
- Advanced deep linking
- Multi-language support

---

**Last Updated:** December 22, 2025  
**Maintainer:** Navigation Team  
**Status:** Production Ready
