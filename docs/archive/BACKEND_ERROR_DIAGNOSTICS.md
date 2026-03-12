# 🔍 Backend Connection Diagnostics Report

**Generated:** December 12, 2025  
**Status:** 🔴 BACKEND ISSUES DETECTED

---

## 🎯 Current Backend Configuration

### API Endpoints
```
Base URL: https://baotienweb.cloud/api/v1
API Prefix: (empty - direct /auth, /projects, etc.)
API Key: thietke-resort-api-key-2024
WebSocket: wss://baotienweb.cloud/ws
```

### Platform-Specific URLs
- **Web/iOS:** https://baotienweb.cloud/api/v1
- **Android Emulator:** Converts localhost to 10.0.2.2 automatically
- **Physical Android:** Uses production URL

---

## ❌ Common Backend Errors

### 1. **CORS Errors (Web Only)**
**Symptoms:**
```
Access to fetch at 'https://baotienweb.cloud/api/v1/auth/login' 
from origin 'http://localhost:8081' has been blocked by CORS policy
```

**Cause:** Backend không cho phép origin `http://localhost:8081`

**Fix Backend (Fastify):**
```typescript
// fastify-cors plugin
fastify.register(fastifyCors, {
  origin: [
    'http://localhost:8081',
    'http://localhost:19006', // Expo web
    'https://your-production-domain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
});
```

**Temporary Workaround (Frontend):**
- Use mobile app instead of web
- Use browser extension to disable CORS (dev only!)

---

### 2. **401 Unauthorized - Missing/Invalid Token**
**Symptoms:**
```
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Missing authentication token"
}
```

**Causes:**
- Token expired
- Token not sent in request
- Token format invalid

**Check:**
```typescript
// In services/api.ts
console.log('[API] Current token:', authToken?.substring(0, 20));
```

**Fix:**
- Sign out and sign in again
- Check if AuthContext is setting token: `setToken(response.token)`
- Verify token in request headers: `Authorization: Bearer ${token}`

---

### 3. **404 Not Found - Wrong Endpoint**
**Symptoms:**
```
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Route POST:/api/v1/auth/register not found"
}
```

**Common Mismatches:**
| Frontend Calls | Backend Expects | Issue |
|---------------|-----------------|-------|
| `/api/v1/auth/login` | `/auth/login` | Extra `/api/v1` prefix |
| `/auth/login` | `/api/auth/login` | Missing `/api` prefix |
| `GET /projects` | `GET /api/v1/projects` | Missing base path |

**Fix:**
- Check `config/env.ts`: `API_BASE_URL` value
- Check backend routes registration
- Verify API_PREFIX setting (should be empty for mobile)

---

### 4. **500 Internal Server Error**
**Symptoms:**
```
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

**Causes:**
- Database connection failed
- Unhandled exception in backend code
- Missing environment variables on server

**Check Backend Logs:**
```bash
# SSH to server
ssh root@baotienweb.cloud

# View Fastify logs
pm2 logs api
# or
journalctl -u fastify-api -f
```

---

### 5. **Network Request Failed**
**Symptoms:**
```
[Error] Network request failed
TypeError: Network request failed
```

**Causes:**
- Backend server down
- DNS not resolving
- Firewall blocking
- Internet connection issue

**Diagnostic Commands:**
```bash
# Test if server is reachable
ping baotienweb.cloud

# Test HTTP connection
curl https://baotienweb.cloud/api/v1/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://baotienweb.cloud/api/v1/auth/me
```

---

### 6. **Timeout Error**
**Symptoms:**
```
[ApiError] Request timeout after 30000ms
```

**Causes:**
- Slow backend response
- Database query too slow
- Network latency

**Fix Frontend:**
```typescript
// Increase timeout in services/api.ts
const response = await apiFetch('/slow-endpoint', {
  timeoutMs: 60000 // 60 seconds instead of 30
});
```

**Fix Backend:**
- Optimize database queries (add indexes)
- Add caching layer (Redis)
- Check slow query logs

---

### 7. **422 Unprocessable Entity - Validation Failed**
**Symptoms:**
```
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": "Validation failed",
  "validation": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Causes:**
- Frontend sends wrong data format
- Missing required fields
- Data type mismatch

**Fix:**
- Check API specs: `BACKEND_API_SPECS.md`
- Validate data before sending
- Match backend validation rules

---

## 🔧 Debugging Tools

### 1. Test API Connection
```bash
# Run connection test
npx ts-node tests/ArchitectureConnectionTest.ts

# Or use PowerShell script
.\test-api-connection.ps1
```

### 2. Check Environment Variables
```bash
# In terminal where Expo runs
echo $EXPO_PUBLIC_API_BASE_URL

# Or in app console
console.log('[ENV]', ENV.API_BASE_URL);
```

### 3. Monitor Network Requests

**React Native Debugger:**
1. Open Chrome DevTools
2. Go to Network tab
3. Filter: XHR/Fetch
4. Check request/response

**Expo Developer Tools:**
```
http://localhost:19002
```
Click "Debug JS Remotely"

**Charles Proxy / Proxyman:**
- Intercept all HTTP/HTTPS requests
- View headers, body, response

### 4. Backend Health Check
```bash
# Test health endpoint
curl https://baotienweb.cloud/api/v1/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-12-12T10:30:00Z",
  "version": "1.0.0"
}
```

---

## 📋 Backend Implementation Checklist

### Phase 1 Required Endpoints (11 total)

**Profile (4 endpoints):**
- [ ] `POST /api/v1/profile/avatar` - Upload avatar
- [ ] `DELETE /api/v1/profile/avatar` - Delete avatar
- [ ] `PATCH /api/v1/profile` - Update profile
- [ ] `GET /api/v1/profile` - Get profile (with avatar)

**Projects (5 endpoints):**
- [ ] `GET /api/v1/projects` - List projects
- [ ] `GET /api/v1/projects/:id` - Get project detail
- [ ] `POST /api/v1/projects` - Create project
- [ ] `PATCH /api/v1/projects/:id` - Update project
- [ ] `DELETE /api/v1/projects/:id` - Delete project (soft)

**Services (2 endpoints):**
- [ ] `GET /api/v1/services/:id/details` - Get service detail
- [ ] `POST /api/v1/services/bookings` - Create booking

---

## 🚨 Critical Issues to Report

### Issue Template
```markdown
**Error Type:** [CORS / 401 / 404 / 500 / Network / Timeout / Validation]

**Endpoint:** POST /api/v1/auth/login

**Request:**
```json
{
  "email": "test@demo.com",
  "password": "test123"
}
```

**Response Status:** 404 Not Found

**Response Body:**
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Route not found"
}
```

**Expected:** 200 OK with token

**Backend Logs:** [Attach if available]

**Frontend Logs:**
```
[authApi] Calling /auth/login
[API] Network request failed
```
```

---

## 🔄 Next Steps

### If Backend Not Implemented:
1. Continue testing with **mock data** (Phase 1 frontend testing)
2. Document expected behavior
3. Create API specs (already done: `BACKEND_API_SPECS.md`)
4. Wait for backend team

### If Backend Has Bugs:
1. Use debugging tools above
2. Create detailed bug report
3. Share backend logs with team
4. Implement error handling in frontend

### If Backend Works:
1. Test all 11 endpoints
2. Verify data persistence
3. Test error scenarios
4. Complete E2E testing

---

## 📞 Support Contacts

**Backend Team:**
- Server: `baotienweb.cloud`
- SSH Access: `root@baotienweb.cloud`
- API Docs: `BACKEND_API_SPECS.md`

**Frontend Team:**
- Test Plans: `PHASE_1_E2E_TEST_PLAN.md`
- Manual Tests: `MANUAL_TEST_GUIDE.md`

---

## 💡 Quick Fixes

### Reset Authentication
```typescript
// In app
import { clearToken } from '@/services/api';
clearToken();
// Then sign in again
```

### Force Logout
```typescript
// In AuthContext
await signOut();
```

### Clear App Cache
```bash
# Terminal
npx expo start -c
```

### Check Current Config
```typescript
// Add to any screen
import ENV from '@/config/env';
console.log('API Base:', ENV.API_BASE_URL);
console.log('API Key:', ENV.API_KEY);
```

---

**Status Legend:**
- ✅ Working
- ⚠️ Warning
- 🔴 Critical Error
- ⏳ Pending Backend

*Last Updated: December 12, 2025*
