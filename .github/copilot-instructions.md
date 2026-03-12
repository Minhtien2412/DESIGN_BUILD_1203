# GitHub Copilot Instructions (Project-Specific Guidance)

## Architecture

- Expo Router (SDK 54) + React Native 19 TypeScript app blending Shopee-style commerce with construction/CRM tooling; screens sit under `app/` (tabs in `app/(tabs)/`, admin/AI flows in dedicated folders) as outlined in `README.md`.
- Route with string literals (e.g. `/product/${id}`) and keep hidden menus under `(tabs)` with `tabBarButton: () => null` to avoid polluting the main nav.
- The root stack in `app/_layout.tsx` wraps Sentry, analytics (`useScreenTracking`, `initAnalyticsSession`), offline/banner/toast layers, and the media viewer before mounting the Expo `Stack`; never short-circuit these wrappers.

## Providers & State

- Provider order in `app/_layout.tsx` is strict: Auth → PerfexAuth → Cart → Favorites → ViewHistory → Meeting → Call → CommunicationHub → WebSocket → Progress socket → Utilities → ProjectData → VideoInteractions → Notification → PushNotification → Notifications → UnifiedBadge. Insert new providers near their closest dependency.
- `context/AuthContext.tsx` handles login/signup, token persistence, Perfex sync, and permission helpers; always go through `authApi` plus `saveTokens` so `apiFetch` can refresh tokens automatically.
- `context/cart-context.tsx` stores full `Product` objects, persists via AsyncStorage, and drives the cart badge service—use `addToCart`, `updateQuantity`, and `clearCart` instead of mutating arrays.
- Feature screens rely on numerous domain contexts (calls, meetings, notifications, sockets); consume the existing hooks rather than creating duplicate local state.

## Data & APIs

- `apiFetch` in `services/api.ts` injects the `X-API-Key`, bearer token, 20s timeout, retry/backoff, and refresh-token orchestration; prefer `get/post/put/patch/del` helpers instead of raw `fetch`.
- Configuration comes from `config/env.ts`; Android localhost is auto-mapped to `10.0.2.2`, and websocket namespaces (`/chat`, `/call`, `/progress`) live there too.
- Tokens must flow through `services/token.service.ts` (`saveTokens`, `clearTokens`, `calculateExpiryTimestamp`) and sensitive storage should reuse `utils/storage.ts` to stay SecureStore-compatible.
- Cart persistence and badge updates are centralized in `context/cart-context.tsx` via AsyncStorage + `cartBadge`; avoid duplicating persistence logic.
- Offline catalog data plus search helpers reside in `data/products.ts`; keep `id`, `price`, localized descriptions, and tags in sync when adding mock entries.

## UI & Theming

- Follow the minimalist palette in `constants/theme.ts` and request colors through `useThemeColor`; compose existing atoms inside `components/ui/` such as `components/ui/button.tsx` for consistent spacing and states.
- Layout screens with shared primitives (`Container`, `Section`, cards) rather than bespoke styles so tablet/phone spacing stays uniform.
- Global overlays (`FullMediaViewerProvider`, `OfflineIndicator`, `NotificationToast`, `IncomingCallModal`) already exist—toggle them via their hooks/services instead of recreating UI.
- Always require the base-scale asset (`require('../img.png')`); Metro handles `@2x/@3x` variants automatically.

## Workflows

- Standard loop: `npm install`, `npm start` (Expo dev), `npm test`, `npm run lint`, and `npx tsc --noEmit` for strict TS (see `START_HERE.md`).
- Capture diagnostic output into the text files described in START_HERE (`typescript-errors.txt`, `eslint-errors.txt`, etc.) when triaging quality issues.
- Architecture, API, deployment, and testing guides live under `docs/`; review the relevant guide before changing backend-aligned modules.

## Pitfalls & Tips

- Requests fail without `ENV.API_KEY`; ensure `.env` / `app.config.ts` exports `EXPO_PUBLIC_API_KEY` so Fastify accepts even auth calls.
- Guest mode is allowed: `AuthNavigator` in `app/_layout.tsx` only redirects authenticated users into `(tabs)`; guard protected actions per-screen with `useAuth()` instead of forcing global redirects.
- Cart totals drive the unified badge via `cartBadge`; bypassing the context causes stale counts.
- Prefer typed helpers over `as any`; when navigation strings feel clumsy, add a small factory (e.g., `productRoute(id)`) rather than casting.

netstat -ano | findstr 63266
