# Navigation Analytics System - Complete Guide

## 📊 Overview

The Navigation Analytics System tracks user navigation patterns throughout the app, providing insights into popular routes, user journeys, layer distribution, and overall navigation behavior.

## ✅ Implementation Status

**Task 5: Add Navigation Analytics** - ✅ COMPLETED

### What We Built

1. **Analytics Tracking System** (`utils/analytics.ts`)
   - `trackNavigation()` function for route tracking
   - AsyncStorage persistence (max 1000 events)
   - Session management
   - Event aggregation and summaries

2. **Analytics Dashboard** (`app/analytics.tsx`)
   - Visual dashboard at `/analytics` or `APP_ROUTES.ANALYTICS`
   - Real-time statistics (navigations, unique routes, avg duration)
   - Top 10 routes with percentages
   - Layer distribution heatmap
   - Recent user journeys with timeline
   - Export analytics as JSON
   - Clear analytics data

3. **Integration Points**
   - Home screen `navigateTo()` function ✅
   - `RouteCard` component ✅
   - `QuickAccessButton` component ✅
   - All 9 layers tracked automatically

---

## 🚀 Quick Start

### 1. Track Navigation Events

```typescript
import { trackNavigation } from '@/utils/analytics';

// Basic usage
await trackNavigation('/house-design');

// With metadata
await trackNavigation(APP_ROUTES.HOUSE_DESIGN, {
  category: 'construction',
  layer: 1,
});
```

### 2. Access Analytics Dashboard

Navigate to `/analytics` to view:
- Total navigations count
- Unique routes visited
- Average session duration
- Top 10 most popular routes
- Layer distribution (9-layer heatmap)
- Recent user journeys

### 3. Export Analytics Data

From the dashboard:
1. Tap the share icon (📤) in top-right
2. Choose export format (JSON)
3. Share via email, messaging, or save to files

---

## 📁 File Structure

```
utils/
  └── analytics.ts          # Core analytics functions

app/
  └── analytics.tsx         # Analytics dashboard UI

components/navigation/
  ├── RouteCard.tsx         # Tracks card clicks
  └── QuickAccessButton.tsx # Tracks CTA clicks

app/(tabs)/
  └── index.tsx             # Home screen integration
```

---

## 🔧 API Reference

### `trackNavigation(route, metadata?)`

Track a navigation event.

**Parameters:**
- `route` (string): The navigation route (e.g., `/house-design`)
- `metadata` (optional object):
  - `category` (string): Event category (e.g., 'home_navigation', 'route_card')
  - `layer` (number): Architecture layer (1-9)
  - `sessionId` (string): Custom session ID (auto-generated if omitted)

**Returns:** `Promise<void>`

**Example:**
```typescript
await trackNavigation(APP_ROUTES.MATERIALS, {
  category: 'layer_1',
  layer: 1,
});
```

---

### `getAnalyticsSummary()`

Get aggregated analytics summary.

**Returns:** `Promise<AnalyticsSummary>`

```typescript
interface AnalyticsSummary {
  totalNavigations: number;
  uniqueRoutes: number;
  topRoutes: Array<{
    route: string;
    count: number;
    percentage: number;
  }>;
  layerDistribution: Record<number, number>;
  categoryDistribution: Record<string, number>;
  averageSessionDuration: number;
  lastUpdated: number;
}
```

**Example:**
```typescript
const summary = await getAnalyticsSummary();
console.log(`Total: ${summary.totalNavigations}`);
console.log(`Top route: ${summary.topRoutes[0].route}`);
```

---

### `getUserJourneys(limit?)`

Get recent user session journeys.

**Parameters:**
- `limit` (number, default: 10): Max journeys to return

**Returns:** `Promise<UserJourney[]>`

```typescript
interface UserJourney {
  sessionId: string;
  startTime: number;
  endTime?: number;
  routes: Array<{
    route: string;
    timestamp: number;
    duration?: number;
  }>;
}
```

**Example:**
```typescript
const journeys = await getUserJourneys(5);
journeys.forEach(journey => {
  console.log(`Session: ${journey.sessionId}`);
  console.log(`Routes: ${journey.routes.length}`);
});
```

---

### `clearAnalytics()`

Clear all stored analytics data.

**Returns:** `Promise<void>`

**Example:**
```typescript
await clearAnalytics();
// All analytics data removed, new session started
```

---

### `exportAnalyticsJSON()`

Export analytics data as JSON string.

**Returns:** `Promise<string>`

**Example:**
```typescript
const json = await exportAnalyticsJSON();
await Share.share({
  message: json,
  title: 'Navigation Analytics Export',
});
```

---

## 🎯 Integration Examples

### Home Screen Integration

```typescript
// app/(tabs)/index.tsx
import { trackNavigation } from '@/utils/analytics';

const navigateTo = async (route: AppRoute) => {
  try {
    await trackNavigation(route, {
      category: 'home_navigation',
    });
    router.push(route);
  } catch (error) {
    console.error('Navigation error:', error);
  }
};
```

### Component Integration

```typescript
// components/navigation/RouteCard.tsx
import { trackNavigation } from '@/utils/analytics';

const handlePress = async () => {
  await trackNavigation(route, {
    category: 'route_card',
  });
  router.push(route as any);
};
```

---

## 📈 Dashboard Features

### 1. Summary Statistics

Three key metric cards:
- **Total Navigations**: All navigation events tracked
- **Unique Routes**: Number of distinct routes visited
- **Avg Duration**: Average time spent per route

### 2. Top Routes

Visual list showing:
- Rank position (#1, #2, etc.)
- Route path (monospace font)
- Visit count + percentage
- Progress bar visualization

### 3. Layer Distribution

9-layer grid showing:
- Layer number (L1-L9)
- Navigation count per layer
- Percentage of total navigations
- Color-coded for easy identification

### 4. User Journeys

Recent sessions displaying:
- Session number
- Total duration
- Start timestamp
- First 3 routes in journey
- "+N more" indicator for longer sessions

### 5. Actions

- **Refresh**: Pull-to-refresh updates data
- **Export**: Share analytics as JSON
- **Clear**: Reset all analytics data

---

## 🔍 Use Cases

### 1. Feature Popularity Analysis

Track which features users engage with most:

```typescript
const summary = await getAnalyticsSummary();
const topFeature = summary.topRoutes[0];
console.log(`Most popular: ${topFeature.route} (${topFeature.percentage}%)`);
```

### 2. Layer Engagement

Identify which architecture layers need improvement:

```typescript
const summary = await getAnalyticsSummary();
Object.entries(summary.layerDistribution).forEach(([layer, count]) => {
  console.log(`Layer ${layer}: ${count} navigations`);
});
```

### 3. Dead-End Detection

Find routes with low engagement:

```typescript
const summary = await getAnalyticsSummary();
const lowEngagement = summary.topRoutes.filter(r => r.percentage < 1);
console.log('Low engagement routes:', lowEngagement);
```

### 4. User Journey Optimization

Analyze navigation patterns:

```typescript
const journeys = await getUserJourneys(20);
const avgJourneyLength = journeys.reduce((sum, j) => sum + j.routes.length, 0) / journeys.length;
console.log(`Average journey: ${avgJourneyLength} routes`);
```

---

## 🎨 Customization

### Change Maximum Stored Events

```typescript
// utils/analytics.ts
const MAX_EVENTS = 1000; // Change to desired limit
```

### Add Custom Metadata

```typescript
await trackNavigation(route, {
  category: 'my_custom_category',
  layer: 5,
  customField: 'custom_value', // Will be stored
});
```

### Modify Dashboard Colors

```typescript
// app/analytics.tsx
const styles = StyleSheet.create({
  statCard: {
    backgroundColor: '#YOUR_COLOR', // Customize stat cards
  },
  routeBarFill: {
    backgroundColor: '#YOUR_COLOR', // Customize progress bars
  },
});
```

---

## 🐛 Troubleshooting

### Analytics Not Tracking

**Problem**: Navigation events not appearing in dashboard

**Solution**:
1. Check `trackNavigation()` is called in navigation functions
2. Verify AsyncStorage permissions
3. Check console for errors
4. Ensure route is valid AppRoute type

### Dashboard Shows Zero Data

**Problem**: Dashboard displays "No data" or zeros

**Solution**:
1. Navigate to some routes first to generate data
2. Pull-to-refresh the dashboard
3. Check AsyncStorage is not full
4. Clear cache and restart app

### Export Fails

**Problem**: Share dialog doesn't appear

**Solution**:
1. Check device Share API permissions
2. Try smaller date range (fewer events)
3. Verify JSON.stringify works on data
4. Check for circular references

---

## 📊 Data Structure

### Stored Event Format

```typescript
{
  "id": "event_1671234567890_abc123",
  "route": "/house-design",
  "timestamp": 1671234567890,
  "category": "home_navigation",
  "layer": 1,
  "sessionId": "session_1671234560000_xyz789",
  "previousRoute": "/(tabs)/index",
  "duration": 5430  // milliseconds on previous route
}
```

### AsyncStorage Keys

- `@navigation_analytics`: Array of NavigationEvent objects
- `@analytics_session`: Current session ID

---

## 🚦 Performance Considerations

### Storage Optimization

- Events auto-trimmed to MAX_EVENTS (1000 by default)
- AsyncStorage operations are async (non-blocking)
- Minimal impact on navigation performance

### Memory Usage

- Each event: ~200-300 bytes
- 1000 events: ~200-300 KB
- Dashboard loads data on-demand

### Best Practices

1. **Don't block UI**: Always use `await` with try-catch
2. **Batch operations**: Load analytics only when needed
3. **Clean old data**: Periodically clear analytics (monthly)
4. **Monitor storage**: Check AsyncStorage size in production

---

## 🎯 Next Steps

### Immediate Actions

1. ✅ Navigate around app to generate sample data
2. ✅ Open `/analytics` dashboard to view results
3. ✅ Export analytics JSON to verify data structure
4. ✅ Integrate tracking in remaining navigation components

### Future Enhancements

1. **Real-time Analytics**: Send events to backend
2. **Funnel Analysis**: Track conversion paths
3. **A/B Testing**: Compare route variants
4. **Heatmaps**: Visual layer engagement maps
5. **Push Notifications**: Alert on anomalies
6. **ML Predictions**: Predict user next action

---

## 📚 Related Documentation

- [Type-Safe Routing System](./TYPED_ROUTES_GUIDE.md) - Route definitions
- [Navigation Components](./NAVIGATION_COMPONENTS_GUIDE.md) - UI components
- [Home Structure](../HOME_STRUCTURE_COMPLETE.md) - 9-layer architecture
- [Route Mapping Audit](../ROUTE_MAPPING_AUDIT.md) - Route inventory

---

## ✅ Verification Checklist

- [x] `trackNavigation()` function created in `utils/analytics.ts`
- [x] Analytics dashboard created at `app/analytics.tsx`
- [x] Home screen `navigateTo()` tracks events
- [x] `RouteCard` component tracks clicks
- [x] `QuickAccessButton` component tracks clicks
- [x] Dashboard shows summary statistics
- [x] Top routes visualization works
- [x] Layer distribution displays correctly
- [x] User journeys are tracked
- [x] Export functionality implemented
- [x] Clear analytics functionality works
- [x] No TypeScript errors
- [x] Backward compatible with existing analytics.ts

---

**Task 5 Status**: ✅ **COMPLETED**

All navigation analytics features implemented and integrated across home screen and navigation components!
