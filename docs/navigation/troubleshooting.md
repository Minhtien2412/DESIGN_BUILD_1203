# 🐛 Troubleshooting Guide

Common issues and solutions for the navigation system.

---

## Quick Diagnostics

Run these commands first:

```bash
# Check route definitions
npm run typecheck

# Verify route files exist
npm run test:routes:verify

# Check navigation links
npm run test:routes:links

# Validate naming conventions
npm run test:routes:naming
```

---

## Common Issues

### 1. "Route not found" Error

**Symptoms:**
- Navigation button does nothing
- Console shows: `Route '/my-route' not found`
- Screen goes blank after navigation

**Possible Causes & Solutions:**

#### A. Route not defined in typed-routes.ts

```bash
# Check if route exists
grep -r "MY_ROUTE" constants/typed-routes.ts
```

**Solution:**
```typescript
// Add to constants/typed-routes.ts
export const APP_ROUTES = {
  // ... existing routes ...
  MY_ROUTE: '/path/to/my-route' as const,
} as const;
```

#### B. Screen file doesn't exist

```bash
# Verify file exists
npm run test:routes:verify
```

**Solution:**
```bash
# Create missing file
mkdir -p app/path/to
touch app/path/to/my-route.tsx
```

#### C. File path doesn't match route

```typescript
// ❌ Mismatch
APP_ROUTES.MY_FEATURE: '/features/my-feature'
File: app/feature/my-feature.tsx (missing 's')

// ✅ Correct
APP_ROUTES.MY_FEATURE: '/features/my-feature'
File: app/features/my-feature.tsx
```

---

### 2. TypeScript Errors

#### Error: "Property does not exist on type APP_ROUTES"

```typescript
// ❌ Error
router.push(APP_ROUTES.MY_NEW_ROUTE);
          ~~~~~~~~~~~~~~~~~~~~~
// Property 'MY_NEW_ROUTE' does not exist
```

**Solutions:**

1. **Restart TypeScript server**
```bash
# VS Code: Cmd+Shift+P > "TypeScript: Restart TS Server"
# Or close/reopen editor
```

2. **Verify constant exists**
```typescript
// constants/typed-routes.ts
export const APP_ROUTES = {
  MY_NEW_ROUTE: '/path/to/route' as const, // Must have this
} as const;
```

3. **Check for typos**
```typescript
// ❌ Wrong
APP_ROUTES.MY_NEW_ROUT  // Missing 'E'

// ✅ Correct
APP_ROUTES.MY_NEW_ROUTE
```

#### Error: "Type string is not assignable to type AppRoute"

```typescript
// ❌ Error
const route: AppRoute = '/some/path';
```

**Solution:**
```typescript
// ✅ Use constant
const route: AppRoute = APP_ROUTES.SOME_PATH;

// ✅ Or type assertion (for dynamic routes)
const route = `/product/${id}` as AppRoute;

// ✅ Or validation
if (isValidRoute(userInput)) {
  const route: AppRoute = userInput;
}
```

---

### 3. Navigation Doesn't Trigger

**Symptoms:**
- Button press has no effect
- No console errors
- Screen doesn't change

**Debugging Steps:**

1. **Check router import**
```typescript
// ✅ Correct
import { router } from 'expo-router';

// ❌ Wrong (missing import)
// No import statement
```

2. **Verify button wired correctly**
```tsx
// ❌ Wrong - missing onPress
<TouchableOpacity>
  <Text>Navigate</Text>
</TouchableOpacity>

// ✅ Correct
<TouchableOpacity onPress={() => router.push(APP_ROUTES.MY_ROUTE)}>
  <Text>Navigate</Text>
</TouchableOpacity>
```

3. **Check for preventDefault**
```tsx
// ❌ Blocks navigation
<RouteCard
  route={APP_ROUTES.MY_ROUTE}
  onPress={(e) => {
    e.preventDefault(); // Don't do this
    console.log('pressed');
  }}
/>

// ✅ Let navigation happen
<RouteCard
  route={APP_ROUTES.MY_ROUTE}
  onPress={() => {
    console.log('pressed');
    // Component handles navigation automatically
  }}
/>
```

4. **Verify not disabled**
```tsx
// Check button isn't disabled
<QuickAccessButton
  route={APP_ROUTES.MY_ROUTE}
  disabled={false} // Should be false or omitted
/>
```

---

### 4. Screen Renders Blank

**Symptoms:**
- Navigation succeeds (URL changes)
- Screen is completely blank
- No error in console

**Possible Causes:**

#### A. Missing default export

```tsx
// ❌ Wrong - named export
export function MyScreen() {
  return <View><Text>Hello</Text></View>;
}

// ✅ Correct - default export
export default function MyScreen() {
  return <View><Text>Hello</Text></View>;
}
```

#### B. Component returns null/undefined

```tsx
// ❌ Wrong - no return
export default function MyScreen() {
  <View><Text>Hello</Text></View>; // Missing return
}

// ✅ Correct
export default function MyScreen() {
  return <View><Text>Hello</Text></View>;
}
```

#### C. Conditional render blocks content

```tsx
// ❌ Renders nothing if loading is false
export default function MyScreen() {
  const [loading, setLoading] = useState(false);
  
  if (loading) {
    return <ActivityIndicator />;
  }
  // Missing else case!
}

// ✅ Correct
export default function MyScreen() {
  const [loading, setLoading] = useState(false);
  
  if (loading) {
    return <ActivityIndicator />;
  }
  
  return <View><Text>Content</Text></View>;
}
```

---

### 5. Dynamic Routes Not Working

**Symptoms:**
- Static routes work fine
- Dynamic routes (e.g., `/product/[id]`) show 404
- Parameters not accessible

**Solutions:**

#### A. Verify bracket syntax

```bash
# ❌ Wrong filename
app/product/id.tsx
app/product/:id.tsx
app/product/{id}.tsx

# ✅ Correct filename
app/product/[id].tsx
```

#### B. Access params correctly

```tsx
// ❌ Wrong
import { useParams } from 'react-router';

// ✅ Correct
import { useLocalSearchParams } from 'expo-router';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Text>Product {id}</Text>;
}
```

#### C. Navigate with parameters

```tsx
// ✅ Method 1: Template literal
router.push(`/product/${productId}`);

// ✅ Method 2: Object with params
router.push({
  pathname: '/product/[id]',
  params: { id: productId },
});
```

---

### 6. Analytics Not Tracking

**Symptoms:**
- Navigation works
- No analytics events in dashboard
- `trackNavigation()` seems to do nothing

**Debugging:**

1. **Check AsyncStorage**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if events are stored
const events = await AsyncStorage.getItem('@analytics_events');
console.log('Analytics events:', JSON.parse(events || '[]'));
```

2. **Verify trackNavigation is called**
```tsx
// Add console.log to confirm
import { trackNavigation } from '@/utils/analytics';

await trackNavigation(APP_ROUTES.MY_ROUTE);
console.log('Analytics tracked'); // Should print
```

3. **Check for errors**
```typescript
// Wrap in try/catch
try {
  await trackNavigation(APP_ROUTES.MY_ROUTE);
} catch (error) {
  console.error('Analytics error:', error);
}
```

**See:** [NAVIGATION_ANALYTICS_GUIDE.md](../NAVIGATION_ANALYTICS_GUIDE.md) for detailed troubleshooting

---

### 7. Performance Issues

**Symptoms:**
- Navigation feels sluggish
- Screen takes long to load
- App stutters during navigation

**Solutions:**

#### A. Implement lazy loading

```tsx
// ❌ Import all screens upfront
import HomeScreen from './app/(tabs)/index';
import ProjectsScreen from './app/(tabs)/projects';
import ProfileScreen from './app/(tabs)/profile';

// ✅ Lazy load screens
const HomeScreen = lazy(() => import('./app/(tabs)/index'));
const ProjectsScreen = lazy(() => import('./app/(tabs)/projects'));
const ProfileScreen = lazy(() => import('./app/(tabs)/profile'));
```

#### B. Memoize service arrays

```tsx
// ❌ Recreate array every render
<ServiceGrid services={[
  { route: APP_ROUTES.HOUSE_DESIGN, title: 'Design', icon: 'home', color: '#FF6B6B' },
  // ... more
]} />

// ✅ Memoize array
const SERVICES = useMemo(() => [
  { route: APP_ROUTES.HOUSE_DESIGN, title: 'Design', icon: 'home', color: '#FF6B6B' },
  // ... more
], []);

<ServiceGrid services={SERVICES} />
```

#### C. Use React.memo for cards

```tsx
// ✅ Prevent unnecessary re-renders
const MemoizedRouteCard = React.memo(RouteCard);

<MemoizedRouteCard
  route={APP_ROUTES.HOUSE_DESIGN}
  title="Design"
  icon="home"
  color="#FF6B6B"
/>
```

**See:** [Performance Optimization Guide](./performance.md)

---

### 8. Testing Failures

#### Test fails: "Expected route to exist"

```bash
❌ /my-new-route
   → No file found
```

**Solution:**
```bash
# Create the missing file
mkdir -p app/path/to
touch app/path/to/my-new-route.tsx

# Re-run tests
npm run test:routes:verify
```

#### Test fails: "Invalid navigation call"

```bash
❌ app/(tabs)/index.tsx:123 → /hardcoded/route
   Route not found in APP_ROUTES
```

**Solution:**
```typescript
// Replace hardcoded path
router.push('/hardcoded/route'); // ❌

// With typed constant
router.push(APP_ROUTES.MY_ROUTE); // ✅
```

#### Test fails: "Naming convention violation"

```bash
❌ MY_ROUTE: /MyRoute
   Error: Route must use lowercase only
```

**Solution:**
```typescript
// Fix route path casing
MY_ROUTE: '/MyRoute' as const, // ❌

MY_ROUTE: '/my-route' as const, // ✅
```

---

### 9. Breadcrumb Not Showing

**Symptoms:**
- NavigationBreadcrumb component renders but is invisible
- Breadcrumb trail incomplete

**Solutions:**

1. **Check parent container has space**
```tsx
// ❌ Container too small
<View style={{ height: 0 }}>
  <NavigationBreadcrumb currentRoute={APP_ROUTES.MY_ROUTE} />
</View>

// ✅ Adequate space
<View style={{ minHeight: 40 }}>
  <NavigationBreadcrumb currentRoute={APP_ROUTES.MY_ROUTE} />
</View>
```

2. **Verify currentRoute prop**
```tsx
// ❌ Wrong - string instead of constant
<NavigationBreadcrumb currentRoute="/my-route" />

// ✅ Correct - use constant
<NavigationBreadcrumb currentRoute={APP_ROUTES.MY_ROUTE} />
```

3. **Check route depth**
```tsx
// Some routes may be too shallow for meaningful breadcrumb
// Example: Home route shows no breadcrumb (depth 0)
```

---

### 10. Deep Linking Issues

**Symptoms:**
- External links don't open app
- Universal links return 404
- URL scheme not working

**Solutions:**

1. **Verify app.json configuration**
```json
{
  "expo": {
    "scheme": "myapp",
    "ios": {
      "bundleIdentifier": "com.yourcompany.myapp",
      "associatedDomains": ["applinks:myapp.com"]
    },
    "android": {
      "package": "com.yourcompany.myapp",
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "myapp.com"
            }
          ]
        }
      ]
    }
  }
}
```

2. **Test deep link locally**
```bash
# iOS Simulator
xcrun simctl openurl booted myapp://product/123

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "myapp://product/123" com.yourcompany.myapp
```

**See:** [Deep Linking Guide](./deep-linking.md)

---

## Debugging Tools

### Enable Debug Mode

```typescript
// constants/typed-routes.ts

// Add debug flag
export const DEBUG_NAVIGATION = __DEV__;

// Add logging to helpers
export function isValidRoute(route: string): route is AppRoute {
  const valid = Object.values(APP_ROUTES).includes(route as AppRoute);
  
  if (DEBUG_NAVIGATION && !valid) {
    console.warn(`Invalid route: ${route}`);
    console.log('Valid routes:', Object.keys(APP_ROUTES));
  }
  
  return valid;
}
```

### Log All Navigation

```typescript
// utils/navigation-logger.ts

import { router } from 'expo-router';

export function setupNavigationLogger() {
  const originalPush = router.push;
  
  router.push = (...args) => {
    console.log('[Navigation] Push:', args);
    return originalPush.apply(router, args);
  };
}

// Call in app/_layout.tsx
setupNavigationLogger();
```

### Visual Route Debugger

```tsx
// components/dev/RouteDebugger.tsx

import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { usePathname } from 'expo-router';

export function RouteDebugger() {
  const pathname = usePathname();
  
  if (!__DEV__) return null;
  
  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 8,
    }}>
      <Text style={{ color: 'white', fontSize: 12 }}>
        Current Route: {pathname}
      </Text>
    </View>
  );
}
```

---

## Getting Help

### Self-Service Resources

1. **Check documentation**
   - [API Reference](./api-reference.md)
   - [Component Guide](./component-guide.md)
   - [Adding Routes](./adding-routes.md)

2. **Run diagnostics**
   ```bash
   npm run test:routes
   ```

3. **Search existing issues**
   - GitHub Issues
   - Internal Wiki
   - Slack history

### Contact Support

| Issue Type | Contact | Response Time |
|-----------|---------|---------------|
| Bug report | #navigation-bugs (Slack) | 1-2 hours |
| Feature request | navigation-team@company.com | 1-2 days |
| Urgent production issue | On-call: +1-555-NAV-HELP | < 30 mins |
| General questions | #navigation-help (Slack) | 2-4 hours |

### Bug Report Template

```markdown
**Issue:** [Brief description]

**Steps to Reproduce:**
1. Go to screen X
2. Click button Y
3. See error Z

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- OS: iOS 16.0 / Android 13
- App Version: 1.2.3
- Expo SDK: 50.0.0

**Screenshots/Logs:**
[Attach if available]

**Route Info:**
- Route constant: APP_ROUTES.MY_ROUTE
- Route path: /path/to/route
- Screen file: app/path/to/route.tsx
```

---

## Prevention Tips

### Before Committing

- [ ] Run `npm run typecheck` - Zero TypeScript errors
- [ ] Run `npm run test:routes` - All tests pass
- [ ] Test navigation manually on device
- [ ] Check console for warnings
- [ ] Verify no hardcoded route strings

### Code Review Checklist

- [ ] All routes use `APP_ROUTES.*` constants
- [ ] New routes added to `typed-routes.ts`
- [ ] Screen files exist and export default
- [ ] Routes follow naming conventions
- [ ] Analytics tracking included (if applicable)
- [ ] Tests updated (if route logic changed)

### CI/CD Integration

Add to your pipeline:

```yaml
# .github/workflows/ci.yml

- name: Route Verification Tests
  run: npm run test:routes
  
- name: Fail on hardcoded routes
  run: |
    if npm run test:routes:links | grep "❌"; then
      echo "Found hardcoded routes! Use APP_ROUTES constants."
      exit 1
    fi
```

---

## FAQ

### Q: Can I use relative paths like `./product`?

**A:** No, always use absolute paths starting with `/`:

```typescript
// ❌ Don't use relative
router.push('./product');

// ✅ Use absolute with APP_ROUTES
router.push(APP_ROUTES.PRODUCT_DETAIL);
```

### Q: How do I navigate to external URLs?

**A:** Use `Linking` API, not router:

```typescript
import { Linking } from 'react-native';

// For external websites
Linking.openURL('https://google.com');

// NOT router.push()
```

### Q: Can I add query parameters to routes?

**A:** Yes, use params:

```typescript
// Method 1: Template literal
router.push(`/shopping/index?cat=construction`);

// Method 2: Params object
router.push({
  pathname: APP_ROUTES.SHOPPING_INDEX,
  params: { cat: 'construction' },
});
```

### Q: What's the difference between push() and replace()?

**A:**
- `push()`: Adds to history, can go back
- `replace()`: Replaces current route, can't go back

```typescript
// User can press back
router.push(APP_ROUTES.PRODUCT_DETAIL);

// User cannot press back (good for login → home)
router.replace(APP_ROUTES.HOME);
```

### Q: How do I navigate programmatically after async operation?

**A:** Just await then navigate:

```typescript
async function handleSubmit() {
  try {
    await saveData();
    router.push(APP_ROUTES.SUCCESS);
  } catch (error) {
    router.push(APP_ROUTES.ERROR);
  }
}
```

---

**Last Updated:** December 22, 2025  
**Version:** 1.0.0  
**Need more help?** Contact #navigation-help on Slack
