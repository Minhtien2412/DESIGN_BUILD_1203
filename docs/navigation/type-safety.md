# 🔐 Type Safety Guide

Understanding and leveraging TypeScript for navigation type safety.

---

## Why Type Safety Matters

### Problems with Hardcoded Strings

```typescript
// ❌ Traditional approach (error-prone)
router.push('/services/house-design');

// Problems:
// 1. Typos not caught until runtime
router.push('/servics/house-design'); // Typo! Runtime error

// 2. Refactoring is dangerous
// If you rename the route, you must find ALL string references manually

// 3. No autocomplete
// You have to remember exact paths

// 4. No compile-time validation
// Code compiles even with invalid routes
```

### Benefits of Type-Safe Routes

```typescript
// ✅ Type-safe approach
router.push(APP_ROUTES.HOUSE_DESIGN);

// Benefits:
// 1. Typos caught at compile-time
router.push(APP_ROUTES.HOSE_DESIGN); // TypeScript error immediately!

// 2. Safe refactoring
// Rename route constant → all references update automatically

// 3. Full autocomplete
// APP_ROUTES. → IDE shows all 71 routes

// 4. Compile-time validation
// Won't build if routes are invalid
```

---

## Architecture Deep Dive

### 1. Const Assertions

The foundation of type safety:

```typescript
// Without const assertion
const ROUTES = {
  HOME: '/(tabs)/index',
};
// Type: { HOME: string }
// Problem: Any string is valid! ❌

// With const assertion
const ROUTES = {
  HOME: '/(tabs)/index' as const,
} as const;
// Type: { HOME: '/(tabs)/index' }
// Benefit: Only exact literal is valid! ✅
```

### 2. Union Type Generation

Automatically creates a union of all route values:

```typescript
export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];

// Expands to:
type AppRoute = 
  | '/(tabs)/index'
  | '/services/house-design'
  | '/construction/progress'
  | ... // 68 more routes
  ;

// Now AppRoute is a discriminated union!
```

### 3. Type Guards

Runtime validation with compile-time types:

```typescript
export function isValidRoute(route: string): route is AppRoute {
  return Object.values(APP_ROUTES).includes(route as AppRoute);
}

// Usage
const userInput = '/services/house-design';

if (isValidRoute(userInput)) {
  // TypeScript now knows userInput is AppRoute
  router.push(userInput); // ✅ Type-safe
}
```

---

## Advanced TypeScript Patterns

### Pattern 1: Extract Routes by Category

```typescript
// Extract all service routes
type ServiceRoutes = Extract<AppRoute, `/services/${string}`>;

// Result:
// type ServiceRoutes =
//   | '/services/house-design'
//   | '/services/interior-design'
//   | '/services/construction-company'
//   | '/services/quality-supervision'
//   | '/services/feng-shui'

// Usage
function navigateToService(route: ServiceRoutes) {
  router.push(route);
}

navigateToService(APP_ROUTES.HOUSE_DESIGN); // ✅ OK
navigateToService(APP_ROUTES.CONSTRUCTION_PROGRESS); // ❌ Error - not a service route
```

### Pattern 2: Exclude Routes by Pattern

```typescript
// Exclude tab routes
type NonTabRoutes = Exclude<AppRoute, `/(tabs)/${string}`>;

// Result: All routes except tab routes
```

### Pattern 3: Route Parameter Extraction

```typescript
// Extract dynamic segment from route
type ExtractParams<T extends string> = 
  T extends `${infer _Start}[${infer Param}]${infer _End}`
    ? Param
    : never;

// Usage
type ProductParams = ExtractParams<'/product/[id]'>;
// Result: 'id'

type ProjectEditParams = ExtractParams<'/projects/[id]/edit'>;
// Result: 'id'
```

### Pattern 4: Route Validation Function

```typescript
// Type-safe route validator
function createRouteValidator<T extends AppRoute>(route: T) {
  return (input: string): input is T => {
    return input === route;
  };
}

// Usage
const isHouseDesignRoute = createRouteValidator(APP_ROUTES.HOUSE_DESIGN);

if (isHouseDesignRoute(userInput)) {
  // TypeScript knows userInput is exactly '/services/house-design'
}
```

---

## Type-Safe Components

### Generic Route Component

```typescript
interface RouteComponentProps<T extends AppRoute> {
  route: T;
  title: string;
  onNavigate?: (route: T) => void;
}

function RouteComponent<T extends AppRoute>({
  route,
  title,
  onNavigate,
}: RouteComponentProps<T>) {
  return (
    <TouchableOpacity
      onPress={() => {
        onNavigate?.(route);
        router.push(route);
      }}
    >
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}

// Usage with type inference
<RouteComponent
  route={APP_ROUTES.HOUSE_DESIGN}
  title="House Design"
  onNavigate={(route) => {
    // `route` is inferred as '/services/house-design'
    console.log(route);
  }}
/>
```

### Conditional Route Props

```typescript
// Different props based on route type
type RouteCardProps<T extends AppRoute> = {
  route: T;
  title: string;
} & (
  T extends `/product/${string}`
    ? { productId: string } // Product routes require productId
    : T extends `/projects/${string}`
    ? { projectId: string } // Project routes require projectId
    : {}
);

function RouteCard<T extends AppRoute>(props: RouteCardProps<T>) {
  // Implementation
}

// Usage
<RouteCard
  route={APP_ROUTES.HOUSE_DESIGN}
  title="Design"
  // No extra props needed
/>

<RouteCard
  route="/product/[id]"
  title="Product"
  productId="123" // Required for product routes!
/>
```

---

## Type-Safe Navigation Hooks

### Custom Hook with Type Safety

```typescript
interface NavigationOptions {
  replace?: boolean;
  analyticsCategory?: string;
}

function useTypedNavigation() {
  const navigate = useCallback(
    (route: AppRoute, options?: NavigationOptions) => {
      if (options?.analyticsCategory) {
        trackNavigation(route, {
          category: options.analyticsCategory,
        });
      }
      
      if (options?.replace) {
        router.replace(route);
      } else {
        router.push(route);
      }
    },
    []
  );
  
  return { navigate };
}

// Usage
function MyComponent() {
  const { navigate } = useTypedNavigation();
  
  return (
    <Button
      onPress={() => navigate(APP_ROUTES.HOUSE_DESIGN, {
        analyticsCategory: 'service',
      })}
    >
      Go to Design
    </Button>
  );
}
```

### Navigation Stack Type

```typescript
// Track navigation stack with types
type NavigationStack = AppRoute[];

class TypedNavigationHistory {
  private stack: NavigationStack = [];
  
  push(route: AppRoute) {
    this.stack.push(route);
  }
  
  pop(): AppRoute | undefined {
    return this.stack.pop();
  }
  
  current(): AppRoute | undefined {
    return this.stack[this.stack.length - 1];
  }
  
  canGoBack(): boolean {
    return this.stack.length > 1;
  }
}
```

---

## Type-Safe Route Metadata

### Strongly-Typed Metadata

```typescript
interface RouteMetadata {
  route: AppRoute;
  category: RouteCategory;
  layer: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; // Only valid layers
  title: string;
  description?: string;
  requiresAuth: boolean;
  icon?: string;
}

// Create metadata map with type safety
const ROUTE_METADATA: Record<AppRoute, RouteMetadata> = {
  [APP_ROUTES.HOME]: {
    route: APP_ROUTES.HOME,
    category: 'home',
    layer: 0,
    title: 'Home',
    requiresAuth: false,
  },
  // TypeScript ensures all routes are covered!
  // Missing routes = compile error
};
```

### Type-Safe Route Groups

```typescript
// Group routes by category with types
const SERVICE_ROUTES = [
  APP_ROUTES.HOUSE_DESIGN,
  APP_ROUTES.INTERIOR_DESIGN,
  APP_ROUTES.CONSTRUCTION_COMPANY,
  APP_ROUTES.QUALITY_SUPERVISION,
  APP_ROUTES.FENG_SHUI,
] as const;

type ServiceRoute = typeof SERVICE_ROUTES[number];
// Type: Union of service routes only

function isServiceRoute(route: AppRoute): route is ServiceRoute {
  return SERVICE_ROUTES.includes(route as ServiceRoute);
}
```

---

## Compile-Time Validation

### Enforce Route Existence

```typescript
// This won't compile if route doesn't exist
const route: AppRoute = APP_ROUTES.NONEXISTENT_ROUTE;
                                  ~~~~~~~~~~~~~~~~~~
// Error: Property 'NONEXISTENT_ROUTE' does not exist
```

### Enforce Pattern Matching

```typescript
// Only accept routes matching pattern
function navigateToService(route: Extract<AppRoute, `/services/${string}`>) {
  router.push(route);
}

navigateToService(APP_ROUTES.HOUSE_DESIGN); // ✅ OK
navigateToService(APP_ROUTES.CART); // ❌ Error - not a service route
```

### Ensure All Cases Handled

```typescript
// Exhaustive switch with never check
function getRouteColor(route: AppRoute): string {
  switch (route) {
    case APP_ROUTES.HOME:
      return '#FF6B6B';
    case APP_ROUTES.HOUSE_DESIGN:
      return '#4ECDC4';
    // ... all other routes
    default:
      // TypeScript error if any route is missing!
      const exhaustiveCheck: never = route;
      return exhaustiveCheck;
  }
}
```

---

## Migration Strategy

### Phase 1: Add Type Safety (Don't Break Existing)

```typescript
// Step 1: Create typed routes
export const APP_ROUTES = {
  HOME: '/(tabs)/index' as const,
  // ... more routes
} as const;

export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];

// Step 2: Make validator accept both
function navigate(route: string | AppRoute) {
  // Works with both old strings and new constants
  router.push(route as any); // Temporary escape hatch
}
```

### Phase 2: Gradual Migration

```typescript
// Mark old usage as deprecated
/**
 * @deprecated Use APP_ROUTES.HOME instead
 */
function navigateHome() {
  router.push('/(tabs)/index');
}

// New usage
function navigateHomeTyped() {
  router.push(APP_ROUTES.HOME); // ✅ Type-safe
}
```

### Phase 3: Remove String Overloads

```typescript
// Remove string overload, only accept AppRoute
function navigate(route: AppRoute) {
  router.push(route);
}

// Now only typed routes work
navigate(APP_ROUTES.HOME); // ✅
navigate('/some/path'); // ❌ Error
```

---

## Testing Type Safety

### Type-Level Tests

```typescript
// Test type inference
type Test1 = typeof APP_ROUTES.HOME extends AppRoute ? true : false;
//   ^? type Test1 = true

// Test union membership
type Test2 = '/services/house-design' extends AppRoute ? true : false;
//   ^? type Test2 = true

// Test invalid route
type Test3 = '/invalid/route' extends AppRoute ? true : false;
//   ^? type Test3 = false
```

### Runtime Validation Tests

```typescript
import { isValidRoute } from '@/constants/typed-routes';

describe('Route validation', () => {
  test('accepts valid routes', () => {
    expect(isValidRoute(APP_ROUTES.HOME)).toBe(true);
    expect(isValidRoute(APP_ROUTES.HOUSE_DESIGN)).toBe(true);
  });
  
  test('rejects invalid routes', () => {
    expect(isValidRoute('/invalid/route')).toBe(false);
    expect(isValidRoute('')).toBe(false);
  });
});
```

---

## Best Practices

### 1. Never Use String Literals

```typescript
// ❌ NEVER
router.push('/services/house-design');

// ✅ ALWAYS
router.push(APP_ROUTES.HOUSE_DESIGN);
```

### 2. Use Type Guards for User Input

```typescript
// ❌ Unsafe
function handleDeepLink(url: string) {
  router.push(url); // What if URL is invalid?
}

// ✅ Safe
function handleDeepLink(url: string) {
  if (isValidRoute(url)) {
    router.push(url); // TypeScript knows url is AppRoute
  } else {
    console.error('Invalid route:', url);
    router.push(APP_ROUTES.HOME); // Fallback
  }
}
```

### 3. Leverage IDE Autocomplete

```typescript
// Type "APP_ROUTES." and let IDE show you all options
router.push(APP_ROUTES.); // IDE shows 71 routes!
```

### 4. Use Const Assertions Everywhere

```typescript
// ❌ Loses type info
const routes = {
  HOME: '/(tabs)/index',
};

// ✅ Preserves exact types
const routes = {
  HOME: '/(tabs)/index' as const,
} as const;
```

### 5. Document Complex Types

```typescript
/**
 * Route type representing all valid navigation paths in the application.
 * 
 * @example
 * const route: AppRoute = APP_ROUTES.HOUSE_DESIGN;
 * router.push(route);
 * 
 * @see {APP_ROUTES} for all available routes
 */
export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];
```

---

## TypeScript Configuration

Ensure strict settings in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // Important for const assertions
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

---

## Future Enhancements

### Planned Type Safety Improvements

1. **Route Parameters Inference**
```typescript
// Auto-infer params from route
type RouteParams<T> = T extends `/product/[${infer P}]` ? { [K in P]: string } : {};

// Usage
const params: RouteParams<'/product/[id]'> = { id: '123' };
```

2. **Query Parameter Types**
```typescript
// Type-safe query params
interface RouteQueryParams {
  [APP_ROUTES.SHOPPING_INDEX]: { cat?: 'construction' | 'electrical' | 'furniture' };
  [APP_ROUTES.SEARCH]: { q: string; filter?: string };
}
```

3. **Compile-Time Route Tree Validation**
```typescript
// Validate parent-child relationships
type ValidChildRoutes<T> = // Complex type checking route hierarchy
```

---

## Resources

- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Template Literal Types:** https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
- **Const Assertions:** https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions

---

**Last Updated:** December 22, 2025  
**Version:** 1.0.0