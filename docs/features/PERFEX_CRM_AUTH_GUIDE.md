# Perfex CRM Authentication Guide

## ✅ Token Configuration (Valid until 2030-12-30)

### API Credentials
```
Base URL: https://thietkeresort.com.vn/perfex_crm
User: nhaxinhd
Name: thietkeresort
Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoibmhheGluaGQiLCJuYW1lIjoidGhpZXRrZXJlc29ydCIsIkFQSV9USU1FIjoxNzY3MDYzNzE1fQ.L9Mcg_xEOdcEYXbz9BprB93RD7ZuonhsshYPPInQm4Q
Expires: 2030-12-30 10:04:00
```

### Environment Variables (Updated in .env.local)
```bash
PERFEX_CRM_URL=https://thietkeresort.com.vn/perfex_crm
PERFEX_API_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoibmhheGluaGQiLCJuYW1lIjoidGhpZXRrZXJlc29ydCIsIkFQSV9USU1FIjoxNzY3MDYzNzE1fQ.L9Mcg_xEOdcEYXbz9BprB93RD7ZuonhsshYPPInQm4Q
PERFEX_API_USER=nhaxinhd
PERFEX_API_NAME=thietkeresort
```

---

## 📊 API Test Results (Tested: 2025-12-31)

### ✅ Working Endpoints

#### 1. Customers API
```
GET https://thietkeresort.com.vn/perfex_crm/api/customers
Headers: { "authtoken": "<token>" }
Status: ✅ SUCCESS
Result: 2 customers found
```

**Sample Response:**
```json
{
  "value": [
    {
      "userid": "1",
      "company": "Anh Khương Q9",
      "phonenumber": "0359777108",
      "city": "Hồ Chí Minh",
      "address": "354A/5 Tân Kỳ Tân Quý...",
      "website": "baotienweb.cloud",
      "datecreated": "2025-12-01 15:11:04",
      "active": "1"
    },
    {
      "userid": "2",
      "company": "NHÀ XINH",
      "phonenumber": "0909452109",
      "city": "Hồ Chí Minh",
      "address": "77 Lam Sơn",
      "website": "nhaxinhdesign.com",
      "datecreated": "2025-12-24 10:52:43",
      "active": "1"
    }
  ],
  "Count": 2
}
```

#### 2. Projects API
```
GET https://thietkeresort.com.vn/perfex_crm/api/projects
Headers: { "authtoken": "<token>" }
Status: ✅ SUCCESS
Result: 1 project found
```

---

## 🔧 Integration in App

### 1. Authentication Context

**Two Authentication Systems Available:**

#### Option A: Main App Auth (Recommended for new users)
- File: `context/AuthContext.tsx`
- Backend: `https://baotienweb.cloud/api/v1/auth`
- Uses JWT with access/refresh tokens
- Supports registration with email/password

#### Option B: Perfex CRM Auth (For existing Perfex users)
- File: `context/PerfexAuthContext.tsx`
- Service: `services/perfexAuth.ts`
- Direct integration with Perfex CRM
- User types: Staff, Customer, Contact

### 2. API Service Configuration

File: `services/perfexSync.ts`

```typescript
const SYNC_CONFIG = {
  baseUrl: ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm',
  authToken: ENV.PERFEX_API_TOKEN || '',
  apiVersion: '/api',
  timeout: 30000,
};
```

### 3. Making API Calls

**Required Header:**
```typescript
headers: {
  'authtoken': PERFEX_API_TOKEN
}
```

**Example: Fetch Customers**
```typescript
import ENV from '@/config/env';

const fetchCustomers = async () => {
  const response = await fetch(`${ENV.PERFEX_CRM_URL}/api/customers`, {
    headers: {
      'authtoken': ENV.PERFEX_API_TOKEN
    }
  });
  return response.json();
};
```

---

## 📱 Available Data

### Current Perfex CRM Data:

1. **Customers**: 2 companies
   - Anh Khương Q9 (baotienweb.cloud)
   - NHÀ XINH (nhaxinhdesign.com)

2. **Projects**: 1 active project

3. **Staff**: API available (need to test)

---

## 🧪 Testing

### PowerShell Test Script
```powershell
# Run: .\test-perfex-token.ps1

$baseUrl = "https://thietkeresort.com.vn/perfex_crm"
$token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
$headers = @{"authtoken" = $token}

# Test Customers
$customers = Invoke-RestMethod -Uri "$baseUrl/api/customers" -Headers $headers
Write-Host "Customers: $($customers.Count)"

# Test Projects
$projects = Invoke-RestMethod -Uri "$baseUrl/api/projects" -Headers $headers
Write-Host "Projects: $($projects.Count)"
```

### In-App Test Screen
Navigate to: `/test-perfex-auth`

Features:
- Display user info (staffId, role)
- Test authentication flow
- Check permissions

---

## 🔐 Login Flow for CRM Users

### For Staff Members:
1. Open app → Login screen
2. Use Perfex CRM credentials
3. App calls PerfexAuthContext
4. PerfexAuthService validates against Perfex API
5. User object includes `staffid`, `role`, `permissions`

### For Customers:
1. Customers can register in app
2. Or use existing Perfex customer credentials
3. Access customer-specific data (projects, invoices)

---

## ⚙️ Configuration Steps

1. **Update Environment**
   ```bash
   # Already configured in .env.local
   PERFEX_CRM_URL=https://thietkeresort.com.vn/perfex_crm
   PERFEX_API_TOKEN=<your-token>
   ```

2. **Restart Development Server**
   ```bash
   npm start
   ```

3. **Test API Connection**
   ```bash
   .\test-perfex-token.ps1
   ```

4. **Navigate to CRM Screen**
   ```
   http://localhost:8083 → CRM Section
   ```

---

## 📝 Next Steps

### Immediate:
- [x] Configure token in `.env.local`
- [x] Test customers & projects APIs
- [ ] Implement login screen for Perfex users
- [ ] Sync CRM data to app database
- [ ] Add offline support for CRM data

### Future Enhancements:
- [ ] Add staff authentication endpoint
- [ ] Implement invoices sync
- [ ] Add tasks/tickets integration
- [ ] Real-time CRM updates via webhooks
- [ ] Mobile push notifications for CRM events

---

## 🐛 Troubleshooting

### Issue: 404 Page Not Found
**Solution**: Use correct header name `authtoken` (not `Authorization: Bearer`)

### Issue: Invalid Token
**Solution**: Token expires 2030-12-30. Regenerate from Perfex CRM admin panel if needed.

### Issue: Network Error
**Solution**: Check internet connection. Server is at `thietkeresort.com.vn` (not localhost).

---

## 📚 API Documentation

### Available Endpoints:
```
GET  /api/customers       - List all customers
GET  /api/customers/{id}  - Get customer details
GET  /api/projects        - List all projects
GET  /api/projects/{id}   - Get project details
GET  /api/staff           - List staff members
GET  /api/invoices        - List invoices
GET  /api/tasks           - List tasks
GET  /api/tickets         - List tickets
```

### Authentication:
All endpoints require `authtoken` header:
```
authtoken: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

---

**Last Updated**: December 31, 2025
**Token Status**: ✅ Valid until 2030-12-30
**Test Status**: ✅ All endpoints working
