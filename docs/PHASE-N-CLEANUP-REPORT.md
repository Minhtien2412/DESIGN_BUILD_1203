# Phase N — Remaining Cleanup Report

**Date:** 2026-03-10  
**Status:** Scan COMPLETE | Fixes PENDING

---

## N1 — Raw `fetch()` Usage Scan

### Summary

| Severity                                            | Count | Action                       |
| --------------------------------------------------- | ----- | ---------------------------- |
| **HIGH** — Backend API without `apiFetch`           | 10    | Replace with `apiFetch()`    |
| **MEDIUM** — External APIs (Google, Goong, OAuth)   | 8     | Acceptable, optional wrapper |
| **LOW** — File ops, blob downloads, apiFetch itself | 19    | No action needed             |
| **Examples** — Non-production code                  | 6     | No action needed             |

**No `XMLHttpRequest`, `axios`, or raw `WebSocket` instances detected.**

---

### HIGH Severity — Must Fix

#### 1. Finishing Module (3 instances) — Hardcoded domain + API key

| File                                    | Line | Endpoint                                     | Issue                              |
| --------------------------------------- | ---- | -------------------------------------------- | ---------------------------------- |
| `app/finishing/products/[category].tsx` | 193  | `https://baotienweb.cloud/api/v1/products`   | Hardcoded URL + manual `X-API-Key` |
| `app/finishing/product/[id].tsx`        | 115  | `https://baotienweb.cloud/api/v1/users/{id}` | Hardcoded URL + manual `X-API-Key` |
| `app/finishing/product/[id].tsx`        | 134  | `https://baotienweb.cloud/api/v1/products`   | Hardcoded URL + manual `X-API-Key` |

**Fix:** Replace with `import { get } from '@/services/api'` → `get('/products', params)` / `get('/users/{id}')`.

#### 2. Admin Perfex Test (3 instances) — Test endpoint

| File                        | Line | Endpoint                            | Issue                     |
| --------------------------- | ---- | ----------------------------------- | ------------------------- |
| `app/admin/perfex-test.tsx` | 44   | `${perfexUrl}/custom_api/test`      | Raw fetch to external CRM |
| `app/admin/perfex-test.tsx` | 64   | `${perfexUrl}/custom_api/customers` | Raw fetch to external CRM |
| `app/admin/perfex-test.tsx` | 85   | `${perfexUrl}/custom_api/projects`  | Raw fetch to external CRM |

**Fix:** Create `services/api/perfex.service.ts` wrapping Perfex API calls, or accept as test-only screen.

#### 3. Zalo Auth (2 instances) — Auth flow without `apiFetch`

| File                   | Line | Endpoint                     | Issue                       |
| ---------------------- | ---- | ---------------------------- | --------------------------- |
| `hooks/useZaloAuth.ts` | 76   | `${API_BASE}/auth/zalo`      | Raw fetch, no retry/refresh |
| `hooks/useZaloAuth.ts` | 139  | `${API_BASE}/auth/link-zalo` | Raw fetch, no retry/refresh |

**Fix:** Replace with `post('/auth/zalo', body)` / `post('/auth/link-zalo', body)`.

#### 4. Health Check Hooks (2 instances) — Hardcoded URL

| File                           | Line | Endpoint                                    | Issue              |
| ------------------------------ | ---- | ------------------------------------------- | ------------------ |
| `hooks/use-api-call.ts`        | 160  | `https://baotienweb.cloud/api/v1{endpoint}` | Hardcoded domain   |
| `hooks/useServerConnection.ts` | 56   | Config URL                                  | Manual `X-API-Key` |

**Fix:** Use `ENV.API_BASE_URL` for URL construction. Health checks can use raw fetch but should use env-based URLs.

---

### MEDIUM Severity — Acceptable, Optional Improvement

| File                                 | Count | API                   | Notes                                                                           |
| ------------------------------------ | ----- | --------------------- | ------------------------------------------------------------------------------- |
| `components/maps/LocationPicker.tsx` | 5     | Google Maps + Goong   | External geocoding APIs. Consider a `services/maps.service.ts` wrapper for DRY. |
| `hooks/useGoogleAuth.ts`             | 1     | Google OAuth userinfo | Standard OAuth pattern, acceptable.                                             |
| `hooks/useGoogleOAuth.native.ts`     | 1     | Google OAuth userinfo | Standard OAuth pattern, acceptable.                                             |
| `hooks/useAvatar.ts`                 | 1     | Local file blob       | File processing, acceptable.                                                    |

---

### Direct Token Imports (Should Use Auth Context)

| File                | Import                            | Issue                                                          |
| ------------------- | --------------------------------- | -------------------------------------------------------------- |
| `hooks/use-chat.ts` | `getAccessToken` from `apiClient` | Socket auth needs token, but should use auth context lifecycle |

---

## N2 — Hardcoded URLs

| File                                    | URL Pattern                           | Fix                    |
| --------------------------------------- | ------------------------------------- | ---------------------- |
| `app/finishing/products/[category].tsx` | `https://baotienweb.cloud/api/v1/...` | Use `ENV.API_BASE_URL` |
| `app/finishing/product/[id].tsx`        | `https://baotienweb.cloud/api/v1/...` | Use `ENV.API_BASE_URL` |
| `hooks/use-api-call.ts`                 | `https://baotienweb.cloud/api/v1...`  | Use `ENV.API_BASE_URL` |

---

## N3 — Chat Consolidation Cleanup Summary

### Deleted This Session (3 files)

| File                           | Reason                         |
| ------------------------------ | ------------------------------ |
| `services/message.service.ts`  | 0 importers (dead code)        |
| `services/api/chatApi.ts`      | 0 FE importers after migration |
| `services/api/chat.service.ts` | 0 FE importers after migration |

### Migrated to Canonical (3 files, 0 errors)

| File                             | Before                         | After                      |
| -------------------------------- | ------------------------------ | -------------------------- |
| `services/chatAPIService.ts`     | `chat.service.ts` + raw fetch  | `conversations.service.ts` |
| `services/api/messagesApi.ts`    | raw `fetch()` to `/chat/rooms` | `conversations.service.ts` |
| `services/unifiedChatService.ts` | `chatApi` with `parseInt(id)`  | `conversations.service.ts` |

### Barrel Exports Cleaned (3 files)

| File                     | Change                                         |
| ------------------------ | ---------------------------------------------- |
| `services/api/index.ts`  | Removed `chatService`/`chat` exports           |
| `services/index.ts`      | Removed `chatService` re-export                |
| `features/chat/index.ts` | Redirected to `conversations.service.ts` types |

---

## N4 — Prioritized Fix Order

| Priority | Task                                                  | Files       | Effort        |
| -------- | ----------------------------------------------------- | ----------- | ------------- |
| P0       | Replace hardcoded URLs + API keys in finishing module | 2 files     | 15 min        |
| P0       | Replace raw fetch in Zalo auth hooks                  | 1 file      | 10 min        |
| P1       | Replace raw fetch in health check hooks               | 2 files     | 10 min        |
| P2       | Create Perfex service wrapper or accept test-only     | 1 file      | 20 min        |
| P2       | Create maps service wrapper                           | 1 component | 30 min        |
| P3       | Socket migration (L3c deferred)                       | 4+ files    | Multi-session |

---

## Master Audit Update

### Files Eliminated This Session: 3

### Files Migrated This Session: 6

### Raw `fetch()` Instances Removed: ~15 (messagesApi + chatAPIService)

### Remaining HIGH Severity raw fetch: 10

### Remaining Chat Services Active: 6 (canonical + actively-used adapters)

### Remaining Chat Services for Future Cleanup: 4 (socket layer, deferred)
