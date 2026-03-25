# Navigation & Architecture Audit Report

> **Date:** 2025-12  
> **Scope:** Full routing, feature-map, homepage navigation, Google Maps, and missing screens  
> **Status:** All critical issues resolved

---

## Executive Summary

A comprehensive audit of the Expo Router navigation system revealed **one P0 critical bug** (100% of homepage icon presses routing to "Coming Soon"), **19 broken SITE_MAP hrefs**, and **5 missing screen files**. All issues have been fixed.

| Metric                    | Before        | After            |
| ------------------------- | ------------- | ---------------- |
| Customer icon IDs matched | **0/43 (0%)** | **43/43 (100%)** |
| Worker icon IDs matched   | **0/63 (0%)** | **63/63 (100%)** |
| SITE_MAP broken hrefs     | **19**        | **0**            |
| Missing screen files      | **5**         | **0**            |

---

## 1. Codebase Scale

| Item                                         | Count |
| -------------------------------------------- | ----- |
| Screen files (`app/**/*.tsx`)                | 838   |
| Route-registry entries (`route-registry.ts`) | 426   |
| Feature-map entries (`feature-map.ts`)       | 141   |
| Role home data IDs (customer)                | 43    |
| Role home data IDs (worker)                  | 63    |
| Tab routes (visible)                         | 4     |
| Tab routes (hidden, `href: null`)            | 16    |

### Role System

4 roles dispatched from `app/(tabs)/index.tsx`:

- **Customer** → `CustomerHomeScreen` (12 services + 8 design + 8 maintenance + 8 marketplace + 4 media + 3 furniture)
- **Worker** → `WorkerHomeScreen` (same as customer + 12 construction + 8 finishing)
- **Engineer** → `EngineerHomeScreen`
- **Contractor** → `ContractorHomeScreen`

---

## 2. Critical Bug: Feature-Map ID Mismatch (P0 — FIXED)

### Root Cause

`constants/feature-map.ts` used short placeholder IDs (`sv1`, `d1`, `c1`, `f1`, `m1`, `mp1`, `fp1`) while `data/role-home/customerHomeUiData.ts` and `workerHomeUiData.ts` used descriptive Vietnamese IDs (`service-thiet-ke-nha`, `design-kien-truc-su`, etc.).

### Impact

Every `handleItemPress(id)` call flowed through `navigateByFeatureId(id)` → feature-map `Map.get(id)` → **always `undefined`** → fallback to "Coming Soon" screen. **100% of homepage icons were non-functional.**

### Navigation Chain

```
UI data (id: "service-thiet-ke-nha")
  → handleItemPress(id)
  → navigateByFeatureId(id) [utils/safeNavigation.ts]
  → resolveRoute(id)
  → ALL_FEATURES_MAP.get(id) ← always undefined (map had "sv1")
  → fallback → MISC.COMING_SOON
```

### Fix Applied

Updated **all** feature-map IDs to match UI data IDs:

| Category              | Count | Old ID Pattern | New ID Pattern                                 |
| --------------------- | ----- | -------------- | ---------------------------------------------- |
| Customer Services     | 12    | `sv1`–`sv12`   | `service-thiet-ke-nha`, `service-xem-them`     |
| Customer Design       | 8     | `d1`–`d8`      | `design-kien-truc-su`, `design-ai`             |
| Customer Construction | 12    | `c1`–`c8`      | `construction-ep-coc`, `construction-be-tong`  |
| Customer Finishing    | 8     | `f1`–`f8`      | `finishing-op-gach`, `finishing-tho-camera`    |
| Customer Maintenance  | 8     | `m1`–`m8`      | `maintenance-may-giat`, `maintenance-xem-them` |
| Customer Marketplace  | 8     | `mp1`–`mp8`    | `market-bep`, `market-sofa`                    |
| Customer Furniture    | 3     | `fp1`–`fp3`    | `furniture-1`, `furniture-3`                   |
| Live/Video            | 4     | _(missing)_    | `live-1`, `live-2`, `video-1`, `video-2`       |

**Total: 63 customer + 63 worker IDs → all 100% matched after fix.**

### Files Modified

- `constants/feature-map.ts` — All ID values + added `LIVE_VIDEO_MAP` + updated `ALL_MAPS`

---

## 3. SITE_MAP Broken Hrefs (FIXED)

`constants/routes.ts` contained 19 routes pointing to non-existent root-level paths. These are used by the `IconTile` component for legacy navigation.

### Construction Utilities (8 hrefs)

| Before           | After                      |
| ---------------- | -------------------------- |
| `/ep-coc`        | `/utilities/ep-coc`        |
| `/dao-dat`       | `/utilities/dao-dat`       |
| `/vat-lieu`      | `/utilities/vat-lieu`      |
| `/be-tong`       | `/utilities/be-tong`       |
| `/nhan-cong`     | `/utilities/nhan-cong`     |
| `/tho-xay`       | `/utilities/tho-xay`       |
| `/tho-coffa`     | `/utilities/tho-coffa`     |
| `/tho-dien-nuoc` | `/utilities/tho-dien-nuoc` |

### Worker Specialties Without Dedicated Screens (4 hrefs)

| Before          | After      | Reason              |
| --------------- | ---------- | ------------------- |
| `/tho-sat`      | `/workers` | No dedicated screen |
| `/tho-co-khi`   | `/workers` | No dedicated screen |
| `/tho-to-tuong` | `/workers` | No dedicated screen |
| `/tho-cong`     | `/workers` | No dedicated screen |

### Finishing Utilities (7 hrefs)

| Before       | After                  |
| ------------ | ---------------------- |
| `/lat-gach`  | `/finishing/lat-gach`  |
| `/thach-cao` | `/finishing/thach-cao` |
| `/tho-son`   | `/finishing/son`       |
| `/tho-da`    | `/finishing/da`        |
| `/lam-cua`   | `/finishing/lam-cua`   |
| `/lan-can`   | `/finishing/lan-can`   |
| `/camera`    | `/finishing/camera`    |

### Files Modified

- `constants/routes.ts` — 19 href values corrected

---

## 4. Missing Screen Files (FIXED)

5 routes registered in `route-registry.ts` had no matching screen files in `app/`:

| Route                              | File Created                              |
| ---------------------------------- | ----------------------------------------- |
| `/projects/find-contractors`       | `app/projects/find-contractors.tsx`       |
| `/projects/quotation-list`         | `app/projects/quotation-list.tsx`         |
| `/projects/design-portfolio`       | `app/projects/design-portfolio.tsx`       |
| `/projects/architecture-portfolio` | `app/projects/architecture-portfolio.tsx` |
| `/projects/construction-portfolio` | `app/projects/construction-portfolio.tsx` |

Each screen implements: `SafeAreaView` + header with back button + `FlatList` + mock data + `StyleSheet`.

---

## 5. Google Maps Architecture (EXISTING — Comprehensive)

The codebase already has a full Google Maps/location stack. No new code was needed.

### Location Hooks

| Hook                  | File                           | Purpose                                      |
| --------------------- | ------------------------------ | -------------------------------------------- |
| `useLocation`         | `hooks/useLocation.ts`         | GPS + permission + reverse geocoding         |
| `useUserLocation`     | `hooks/useUserLocation.ts`     | High-level coords + watch mode + HCM default |
| `useRealtimeLocation` | `hooks/useRealtimeLocation.ts` | Background tracking + WebSocket broadcast    |

### Map Components

| Component         | File                                      | Status                                                 |
| ----------------- | ----------------------------------------- | ------------------------------------------------------ |
| `WorkerMapView`   | `components/worker/WorkerMapView.tsx`     | Full native maps (react-native-maps) with web fallback |
| `MeetingMapView`  | `components/meeting/MeetingMapView.tsx`   | Mock view (placeholder for production)                 |
| `LocationPicker`  | `components/maps/LocationPicker.tsx`      | Coordinate picker                                      |
| `LocationCheckIn` | `components/projects/LocationCheckIn.tsx` | Geofenced check-in                                     |

### Utilities

| Utility   | File                              | Functions                                                                 |
| --------- | --------------------------------- | ------------------------------------------------------------------------- |
| Geo math  | `utils/geo.ts`                    | `haversineDistance`, `formatDistance`, `estimateTravelTime`, bounding box |
| Mock maps | `mocks/mock-react-native-maps.js` | Web/Expo Go fallback for `react-native-maps`                              |

### Dependencies

- `expo-location` ~19.0.8 — installed
- `react-native-maps` — aliased to mock in `package.json` browser field (install real package for production builds)

### Production Deployment Note

To enable real Google Maps in production:

1. Install `react-native-maps`: `npx expo install react-native-maps`
2. Remove the browser field alias in `package.json`
3. Add `GOOGLE_MAPS_API_KEY` to `app.config.ts` under `android.config.googleMaps.apiKey` and `ios.config.googleMapsApiKey`
4. Replace `MeetingMapView` mock with real `MapView` implementation

---

## 6. Key Architecture Files

| File                                   | Purpose                                                             |
| -------------------------------------- | ------------------------------------------------------------------- |
| `constants/route-registry.ts`          | Single source of truth for all 426 route strings                    |
| `constants/feature-map.ts`             | Maps 141 icon/CTA IDs → routes (O(1) via Map)                       |
| `utils/safeNavigation.ts`              | `navigateByFeatureId()`, `safeNavigate()` with Coming Soon fallback |
| `constants/routes.ts`                  | Legacy SITE_MAP with icon grid data (used by `IconTile`)            |
| `data/role-home/customerHomeUiData.ts` | 43 customer home screen icon definitions                            |
| `data/role-home/workerHomeUiData.ts`   | 63 worker home screen icon definitions                              |
| `app/(tabs)/_layout.tsx`               | Tab configuration (4 visible + 16 hidden)                           |
| `app/(tabs)/index.tsx`                 | Role dispatcher → role home screens                                 |

---

## 7. Remaining Recommendations

### High Priority

1. **Install `react-native-maps`** for production builds and configure Google Maps API key
2. **Replace `MeetingMapView` mock** with real `MapView` using the pattern from `WorkerMapView.tsx`
3. **Add route type safety** — consider generating route types from `route-registry.ts` with a build-time script

### Medium Priority

4. **Consolidate `routes.ts` and `route-registry.ts`** — both define routes; `routes.ts` (SITE_MAP) could import from `route-registry.ts` instead of duplicating strings
5. **Add route existence tests** — automated test that every `route-registry.ts` entry has a corresponding `app/` screen file
6. **Worker specialty screens** — 4 worker types (thợ sắt, thợ cơ khí, thợ tô tường, thợ cổng) route to generic `/workers` page; create dedicated filtered views

### Low Priority

7. **Feature-map completeness** — 141 IDs are mapped but 426 routes exist; add mappings for features surfaced outside homepages (CRM, admin, AI tools)
8. **Deprecate `SITE_MAP`** — migrate remaining consumers to `route-registry.ts` + `feature-map.ts` and remove `routes.ts`
