# Production Environment Configuration Guide

## 📋 Backend API Specifications

### Base Configuration
```
Server: https://api.thietkeresort.com.vn
WebSocket: wss://api.thietkeresort.com.vn/ws
API Key: thietke-resort-api-key-2024
```

### API Endpoints Structure

#### Authentication (NO /api prefix)
```
POST   /auth/register   - User registration
POST   /auth/login      - User login  
GET    /auth/me         - Get current user (Bearer token required)
GET    /auth/roles      - Get available roles
POST   /auth/refresh    - Refresh access token
POST   /auth/google     - Google OAuth
POST   /auth/facebook   - Facebook OAuth
```

#### Projects
```
GET    /projects        - List projects (query: page, limit)
GET    /projects/:id    - Get project details
POST   /projects        - Create project
PATCH  /projects/:id    - Update project
DELETE /projects/:id    - Delete project
```

#### Bids/Quotations
```
POST   /bids            - Create bid (firm submission)
GET    /bids            - List bids
GET    /bids/:id        - Get bid details
```

#### Notifications (Future)
```
GET    /notifications               - List notifications
POST   /notifications/:id/read      - Mark as read
GET    /notifications?category=...  - Filter by category
```

#### Activity Logs (Future)
```
POST   /activity-log    - Record activity (login/logout)
GET    /activity-log    - Get activity history
```

---

## 🔧 App Configuration Files

### 1. `.env.local` (Development)
```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://api.thietkeresort.com.vn
EXPO_PUBLIC_WS_URL=wss://api.thietkeresort.com.vn/ws
EXPO_PUBLIC_API_KEY=thietke-resort-api-key-2024

# API Prefix (EMPTY for /auth/* endpoints)
EXPO_PUBLIC_API_PREFIX=

# OAuth Paths
EXPO_PUBLIC_AUTH_GOOGLE_PATH=/auth/google
EXPO_PUBLIC_AUTH_FACEBOOK_PATH=/auth/facebook
EXPO_PUBLIC_AUTH_REFRESH_PATH=/auth/refresh

# Social Login
EXPO_PUBLIC_ENABLE_SOCIAL_GOOGLE=true
EXPO_PUBLIC_ENABLE_SOCIAL_FACEBOOK=true
EXPO_PUBLIC_GOOGLE_CLIENT_ID=702527545429-60e3mi47s816iu9aus38kb83qgkmkgna.apps.googleusercontent.com

# Environment
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_DEBUG=true
EXPO_PUBLIC_SHOW_ENV_CARD=true

# Performance
EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
EXPO_PUBLIC_MAX_CONCURRENT_REQUESTS=5
EXPO_PUBLIC_IMAGE_CACHE_SIZE=100
EXPO_PUBLIC_ENABLE_REQUEST_DEDUPLICATION=true
EXPO_PUBLIC_MEMORY_WARNING_THRESHOLD=0.8

# Retry/Backoff
EXPO_PUBLIC_BACKOFF_BASE_MS=500
EXPO_PUBLIC_BACKOFF_JITTER_MS=500
```

### 2. `.env` (Production)
```bash
# API Configuration - PRODUCTION
EXPO_PUBLIC_API_BASE_URL=https://api.thietkeresort.com.vn
EXPO_PUBLIC_WS_URL=wss://api.thietkeresort.com.vn/ws
EXPO_PUBLIC_API_KEY=thietke-resort-api-key-2024

# NO API PREFIX (auth endpoints at root)
EXPO_PUBLIC_API_PREFIX=

# OAuth
EXPO_PUBLIC_AUTH_GOOGLE_PATH=/auth/google
EXPO_PUBLIC_AUTH_FACEBOOK_PATH=/auth/facebook
EXPO_PUBLIC_AUTH_REFRESH_PATH=/auth/refresh

# Social Login
EXPO_PUBLIC_ENABLE_SOCIAL_GOOGLE=true
EXPO_PUBLIC_ENABLE_SOCIAL_FACEBOOK=false
EXPO_PUBLIC_GOOGLE_CLIENT_ID=702527545429-60e3mi47s816iu9aus38kb83qgkmkgna.apps.googleusercontent.com

# Environment
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_DEBUG=false
EXPO_PUBLIC_SHOW_ENV_CARD=false
EXPO_PUBLIC_DISABLE_MOCK_AUTH=true
EXPO_PUBLIC_SUPPRESS_EXPO_GO_WARNINGS=true

# Performance (Production optimized)
EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
EXPO_PUBLIC_MAX_CONCURRENT_REQUESTS=10
EXPO_PUBLIC_IMAGE_CACHE_SIZE=200
EXPO_PUBLIC_ENABLE_REQUEST_DEDUPLICATION=true
EXPO_PUBLIC_MEMORY_WARNING_THRESHOLD=0.9

# Retry/Backoff
EXPO_PUBLIC_BACKOFF_BASE_MS=1000
EXPO_PUBLIC_BACKOFF_JITTER_MS=1000
```

---

## ✅ Verification Checklist

### 1. Test Authentication Endpoints
```bash
# Test roles endpoint
curl https://api.thietkeresort.com.vn/auth/roles

# Test register
curl -X POST https://api.thietkeresort.com.vn/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","fullName":"Test User","role":"client"}'

# Test login
curl -X POST https://api.thietkeresort.com.vn/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'

# Test me (with token)
curl https://api.thietkeresort.com.vn/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Verify Config in App
```typescript
// In app, check console logs:
import { ENV } from '@/config/env';

console.log('API Base:', ENV.API_BASE_URL);
// Should print: https://api.thietkeresort.com.vn

console.log('API Prefix:', ENV.API_PREFIX);
// Should print: (empty string)

console.log('Full auth URL:', `${ENV.API_BASE_URL}${ENV.API_PREFIX}/auth/login`);
// Should print: https://api.thietkeresort.com.vn/auth/login
```

### 3. Test API Service
```typescript
import { apiFetch } from '@/services/api';

// This should work:
const roles = await apiFetch('/auth/roles');
console.log(roles);

// This should work:
const user = await apiFetch('/auth/me', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 🔍 Current Status

✅ **Working Endpoints:**
- GET /auth/roles - ✅ Tested
- POST /auth/register - ✅ Tested
- POST /auth/login - ✅ Tested
- GET /auth/me - ✅ Tested

⏳ **Future Endpoints (Not Yet Implemented):**
- POST /activity-log
- GET /activity-log
- POST /notifications/:id/read
- GET /notifications?category=...

---

## 📝 Implementation Notes

### AuthContext Integration
```typescript
// context/auth-context.tsx uses:
- POST /auth/register
- POST /auth/login  
- GET /auth/me
- POST /auth/refresh (when token expires)
```

### API Service Configuration
```typescript
// services/api.ts automatically:
- Adds API_KEY header to all requests
- Constructs URLs: BASE_URL + PREFIX + path
- With PREFIX = '', results in: https://api.thietkeresort.com.vn/auth/login
- Handles retry with exponential backoff
- Deduplicates concurrent identical requests
```

### Error Handling
```typescript
// All API errors normalized to:
{
  status: number,
  statusText: string,
  url: string,
  detail: string,
  body: any
}
```

---

## 🚀 Quick Start

1. **Copy `.env.local` template** to your project root
2. **Update values** if backend URL changes
3. **Run app:** `npm start`
4. **Verify in console:** Check ENV configuration logs
5. **Test login:** Use test user or create new account

---

## 📚 References

- OpenAPI Spec: `openapi/seed.yaml`
- ENV Config: `config/env.ts`
- API Service: `services/api.ts`
- Auth Context: `context/auth-context.tsx`
- Quick Reference: `QUICK_REFERENCE.md`
