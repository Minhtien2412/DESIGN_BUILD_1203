# GitHub Copilot Instructions (Project-Specific Guidance)

This repository is an Expo Router (SDK 54) + React 19 + TypeScript mobile application targeting a Shopee‑style shopping / services experience. These instructions help AI assistants produce consistent, type‑safe, idiomatic contributions.

---
## Core Architectural Principles
1. **Routing:** Uses `expo-router` with typed routes. Dynamic product detail route: `app/product/[id].tsx`. Hidden auxiliary pages (e.g. `menu4..menu9`) live under `app/(tabs)/` but are NOT in the bottom tab bar (they use `tabBarButton: () => null`).
2. **Providers Order:** Root layout (`app/_layout.tsx`) mounts `AuthProvider` → `CartProvider` → `Stack`. Keep this order (auth state may influence cart clearing on sign out later).
3. **State Management:** Lightweight React Context only (Auth & Cart). Avoid introducing Redux/MobX unless explicitly requested.
4. **Design System:** Reuse UI atoms/molecules in `components/ui/` (e.g. `button`, `input`, `container`, `section`, `menu-card`, `product-card`, `info-box`, `loader`). Prefer extending these over creating ad-hoc styles.
5. **Styling & Theming:** Follow theme utilities and `useThemeColor` hook (see `hooks/` and `constants/theme.ts`). Do not hardcode colors when a semantic token exists.
6. **Images/Assets:** Always require the **base** scale asset (e.g. `require('../assets/images/react-logo.png')`). Metro auto-resolves `@2x/@3x` variants. Never require `@2x` or `@3x` explicitly.
7. **Error Handling:** Centralized via `services/api.ts` (`apiFetch`). Use its exported helper instead of raw `fetch` for any network call.
8. **Async Storage:** Use `SecureStore` through `utils/storage.ts` for sensitive items (tokens) and cart persistence. Do not access platform storage APIs directly.

---
## Routing & Navigation Conventions
- Use string literal paths when possible: `router.push('/cart')`.
- For dynamic product links, generate with a helper: `/product/${id}` (ensure `id` exists in `PRODUCTS`).
- Remove all `as any` casts when creating links. If type friction occurs, create a small helper:
  ```ts
  export const productRoute = (id: string) => `/product/${id}` as const;
  ```
- Hidden routes must not accidentally surface as tabs—confirm `options={{ tabBarButton: () => null }}` in layout.
- Keep bottom tab count to four visible entries: Home (`index`), Projects (shop), Notifications, Profile.

---
## Context Contracts
### AuthContext
- Exposes: `user`, `signIn(email, pass)`, `signUp(email, pass)`, `signOut()`, `loading`.
- Tokens stored securely. Future changes (refresh, profile) must remain backward compatible unless a migration is documented.

### CartContext
- Items keyed by product id; shape: `{ id, name, price, qty, image }`.
- Methods: `add(product, qty?)`, `remove(id)`, `increment(id)`, `decrement(id)`, `clear()`. Derived: `totalQty`, `totalPrice`.
- Always persist after every mutation; keep operations synchronous wrapping async persistence fire-and-forget (unless adding error recovery logic deliberately).

---
## Data & Mock Layer
- `data/products.ts` houses `PRODUCTS`. Add new products by appending with unique `id` (string). Keep deterministic pricing (integer VND). Include descriptions where helpful.
- When real API integration begins, retain `PRODUCTS` for offline / skeleton unless explicitly removed.

---
## API Layer Usage
Use `apiFetch(path, options?)` only. It currently:
- Applies a timeout (AbortController).
- Attempts JSON parse; falls back to text.
- Normalizes error shape via `ApiError` with: `status`, `statusText`, `url`, `detail`, `body`.
Guidelines:
- Wrap calls in try/catch.
- Surface user-facing errors with friendly message + optional retry.
- Avoid duplicating timeout logic elsewhere.

Example:
```ts
try {
  const data = await apiFetch('/products');
} catch (e) {
  if (e instanceof ApiError) {
    // handle structured error
  }
}
```

---
## UI Component Guidelines
- Prefer composing inside `Container` and `Section` for spacing consistency.
- Use `fullWidth` prop on `Container` only for edge-to-edge grids.
- `Button`: supply `loading` when performing async actions; disable while loading.
- `Input`: maintain controlled pattern (`value`, `onChangeText`). Add minimal validation inline or via small utility—avoid large form libs unless required.
- `Loader`: show for short fetch states; for longer operations consider skeleton UIs.

---
## Performance & Quality
- Keep bundle lean: no large third-party libs without justification.
- Avoid unnecessary re-renders: memoize heavy list items if performance issues appear (not premature optimization).
- Use FlatList or FlashList (if added) for large product sets; current small static array is fine.

---
## Type Safety Rules
- Zero tolerance for `as any` (remove remaining ones). If a type gap exists, define an interface or helper function.
- For navigation string literal unions, prefer helper factories over casting.
- Extend `Product` type rather than augmenting ad-hoc object shapes in cart logic.

---
## Adding New Features (Examples)
### Checkout Flow (Future)
1. Introduce `Order` type and `orders` storage (separate context or extend CartContext minimally).
2. Move cart → order, clear cart, persist order history.
3. Provide optimistic UI then reconcile with API.

### Category Filtering
1. Add `category` to `Product` type.
2. Create derived list with filter chips component.
3. Persist last category filter in storage for UX continuity.

---
## Testing & Validation (Lightweight)
- Run: `npm start` (alias for `expo start`).
- Quick smoke: open Android / Web; navigate product list → product detail → add to cart → view cart.
- Before commits adding navigation: ensure no red screen from unresolved asset or route.

---
## Common Pitfalls & Resolutions
| Issue | Cause | Fix |
|-------|-------|-----|
| Asset resolution error for `@2x` | Directly requiring scaled image | Require base `react-logo.png` only |
| Route type error | Using object form without matching types | Switch to string literal `/product/<id>` |
| Stale cart after sign out | (Future) Not clearing cart | Clear on signOut once business rule confirmed |
| Network hang | Missing timeout | Already handled by `apiFetch`; use it |

---
## Code Style
- Follow existing formatting; rely on ESLint config (`eslint.config.js`).
- Prefer named exports; default exports only for screens/components that benefit from expo-router conventions.
- Keep functions small (< ~50 LOC) or refactor.

---
## Contribution Checklist
Before submitting a feature PR:
- [ ] No `as any` or newly introduced eslint-disable comments.
- [ ] All navigation uses helper or literal strings.
- [ ] Assets required via base scale name.
- [ ] Context contracts unchanged or migration documented.
- [ ] API calls use `apiFetch`.
- [ ] New UI reuses design system components.
- [ ] TypeScript passes with `strict`.

---
## Quick Reference
- Product dynamic route: `/product/[id]` (push with template string).
- Cart route: `/cart`.
- Providers: `app/_layout.tsx`.
- Mock data: `data/products.ts`.
- API wrapper: `services/api.ts`.

---
## AI Assistant Guidance
When asked to add a feature:
1. Identify existing UI component to extend.
2. Ensure route fits naming & folder conventions.
3. Avoid adding new global state unless necessary.
4. Keep types explicit; add or refine types instead of casting.
5. Update this instruction file if a new architectural pattern is introduced.

If uncertain, prefer creating a small, composable helper over broad refactors.

---
*End of instructions.*
