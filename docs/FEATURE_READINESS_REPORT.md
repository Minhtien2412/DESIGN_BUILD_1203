# Feature Readiness & Backend Classification Report

> Auto-generated from codebase audit. Last updated: June 2025

## Status Legend

| Status        | Meaning                                             |
| ------------- | --------------------------------------------------- |
| `ready`       | Fully functional, wired to backend API              |
| `ui-only`     | UI complete with mock data — needs backend endpoint |
| `partial`     | Partially implemented (some features work)          |
| `placeholder` | Shell/stub screen only                              |
| `coming-soon` | Planned but not started                             |
| `disabled`    | Temporarily disabled                                |

---

## 1. READY — Backend-Wired Features

These features have API integration and function in production.

| Feature             | Route                            | API Endpoint                                      | Notes                                |
| ------------------- | -------------------------------- | ------------------------------------------------- | ------------------------------------ |
| Login / Signup      | `/auth/*`                        | `POST /api/auth/login`, `POST /api/auth/register` | Token refresh via `apiFetch`         |
| Worker Search       | `/workers`, `/find-workers`      | `GET /api/workers?category=`                      | Includes map view, filters           |
| Worker Map          | `/service-booking/worker-map`    | `GET /api/workers` + WebSocket `/progress`        | Real-time location via socket        |
| Worker Reviews      | `/service-booking/worker-review` | `GET /api/workers/:id/reviews`                    | Rating + comments                    |
| Chat                | `/chat/*`                        | WebSocket `/chat`                                 | Real-time messaging                  |
| Calls (Voice/Video) | `/call/*`                        | WebSocket `/call`                                 | WebRTC integration                   |
| Notifications       | `/notifications`                 | `GET /api/notifications`                          | Push + in-app                        |
| AI Assistant        | `/ai-assistant`                  | `POST /api/ai/chat`                               | Tool-calling architecture            |
| Product Catalog     | `/product/*`                     | `GET /api/products`                               | Fallback to local `data/products.ts` |
| Cart & Checkout     | `/cart`, `/checkout`             | Context-based (AsyncStorage)                      | Badges via `cartBadge` service       |
| User Profile        | `/profile`                       | `GET /api/users/me`                               | With Perfex CRM sync                 |

## 2. UI-ONLY — Needs Backend API

These screens have complete UI with mock data. Backend endpoints are the only blocker.

| Feature                    | Route                              | Needed API                                | Mock Data Location               |
| -------------------------- | ---------------------------------- | ----------------------------------------- | -------------------------------- |
| **Quotation List**         | `/projects/quotation-list`         | `GET /api/quotations?status=`             | Inline mock (4 items)            |
| **Find Contractors**       | `/projects/find-contractors`       | `GET /api/contractors?search=`            | Inline mock (5 items)            |
| **Design Portfolio**       | `/projects/design-portfolio`       | `GET /api/portfolios?type=design`         | Inline mock (6 items)            |
| **Architecture Portfolio** | `/projects/architecture-portfolio` | `GET /api/portfolios?type=architecture`   | Inline mock (6 items)            |
| **Construction Portfolio** | `/projects/construction-portfolio` | `GET /api/portfolios?type=construction`   | Inline mock (6 items)            |
| Dashboard (all roles)      | `/(tabs)/dashboard`                | `GET /api/dashboard`                      | `hooks/useDashboardData.ts` mock |
| Shopping Products          | `/(tabs)/shopping`                 | `GET /api/products`                       | Falls back to `data/products.ts` |
| Meeting Tracking           | `/meetings/*`                      | `GET /api/meetings`, WebSocket `/meeting` | `MeetingMapView` web fallback    |
| Service Booking Flow       | `/service-booking/*`               | `POST /api/bookings`                      | Partial mock data                |
| Worker Schedule            | `/worker/schedule`                 | `GET /api/workers/:id/schedule`           | Inline mock                      |
| Material Calculator        | `/tools/material-calculator`       | None (local calc)                         | Client-side only                 |
| 3D Model Viewer            | `/viewer/*`                        | `GET /api/models`                         | Local `.glb` files               |

## 3. PLACEHOLDER / COMING-SOON — Not Yet Built

| Feature ID                 | Label             | Target Route           | Priority |
| -------------------------- | ----------------- | ---------------------- | -------- |
| Various `*-xem-them` items | "Xem thêm" links  | Category listing pages | Low      |
| Warranty tracking          | Theo dõi bảo hành | `/projects/warranty`   | Medium   |
| Payment gateway            | Thanh toán online | `/checkout/payment`    | High     |
| Loyalty / Rewards          | Điểm thưởng       | `/rewards`             | Low      |

## 4. DATA SOURCE CLASSIFICATION

### API-Connected (via `apiFetch`)

- Auth endpoints (`/api/auth/*`)
- Worker endpoints (`/api/workers/*`)
- Product endpoints (`/api/products/*`)
- AI Brain (`/api/ai/*`)
- Notification endpoints (`/api/notifications/*`)
- CRM sync (`/api/perfex/*`)

### WebSocket-Connected (via socket namespaces)

- Chat: `/chat` namespace
- Calls: `/call` namespace
- Location tracking: `/progress` namespace

### Local/Client-Only

- Cart persistence → `AsyncStorage`
- Theme preferences → `useThemeColor`
- Favorites → `context/favorites-context.tsx`
- View history → `context/view-history-context.tsx`
- Material calculations → local math

### Mock Data Files

- `data/products.ts` — Offline product catalog (fallback)
- `data/role-home/*UiData.ts` — Home screen icon grids
- `data/role-home/homeUiAssetMap.ts` — Icon asset paths
- Inline mocks in all 5 project screens

---

## 5. MIGRATION CHECKLIST (Mock → API)

When backend endpoints become available for a feature:

1. **Create API service** in `services/` following existing pattern (`services/workers.api.ts`)
2. **Replace mock data** with `apiFetch` call using `get/post/put/del` helpers
3. **Add loading/error states** — the screens already have RefreshControl
4. **Remove mock banner** — delete the blue "Dữ liệu demo" banner from the screen
5. **Update feature-map status** — change from `"ui-only"` to `"ready"` in `constants/feature-map.ts`
6. **Test offline fallback** — ensure `apiFetch` retry/backoff handles network errors gracefully

---

## 6. ROLE-BASED FEATURE MATRIX

| Feature                | Customer | Worker      | Engineer     | Contractor      |
| ---------------------- | -------- | ----------- | ------------ | --------------- |
| Home services grid     | 12 icons | 8 shortcuts | 8 tools      | 8 actions       |
| Design utilities       | 8 icons  | -           | -            | -               |
| Construction utilities | 10 icons | -           | 6 site items | 4 project items |
| Finishing utilities    | 8 icons  | -           | -            | -               |
| Maintenance utilities  | 8 icons  | -           | -            | -               |
| Marketplace            | 8 icons  | -           | -            | 6 seller items  |
| Worker map             | View     | Listed      | View         | View            |
| AI Assistant           | Chat     | Chat        | Chat         | Chat            |
| Dashboard              | View     | View        | View         | View            |
| Booking management     | Create   | Accept      | Assign       | Create          |
| Portfolio screens      | View     | View        | Manage       | View            |

---

_This report is maintained alongside `constants/feature-map.ts`. Update both when adding new features._
