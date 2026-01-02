# 🚀 Backend & Frontend Integration Status

## 📋 Tổng quan

Tài liệu này tổng hợp trạng thái tích hợp giữa Frontend và Backend.

---

## ✅ Frontend Services (Hoàn thành)

### 1. Profile API (`services/profileApi.ts`)
| Function | Method | Endpoint | Status |
|----------|--------|----------|--------|
| `getProfile()` | GET | `/profile` | ✅ Ready |
| `updateProfile()` | PATCH | `/profile` | ✅ Ready |
| `uploadAvatar()` | POST | `/profile/avatar` | ✅ Ready |
| `deleteAvatar()` | DELETE | `/profile/avatar` | ✅ Ready |

**Validation helpers:**
- `isValidVietnamesePhone()` - Regex: `/^(0[3|5|7|8|9])+([0-9]{8})$/`
- `isValidDateOfBirth()` - Check >10 tuổi
- `isValidName()` - Min 2 ký tự, max 100
- `getAvatarUrl()` - Generate full URL from relative path

### 2. Services Booking API (`services/servicesApi.ts`)
| Function | Method | Endpoint | Status |
|----------|--------|----------|--------|
| `getServices()` | GET | `/services` | ✅ Ready |
| `getServiceDetails()` | GET | `/services/:id` | ✅ Ready |
| `getServiceFullDetails()` | GET | `/services/:id/details` | ✅ Ready |
| `createBooking()` | POST | `/services/bookings` | ✅ Ready |
| `getUserBookings()` | GET | `/services/bookings` | ✅ Ready |
| `cancelBooking()` | PATCH | `/services/bookings/:id/cancel` | ✅ Ready |
| `getServiceCategories()` | GET | `/services/categories` | ✅ Ready |

### 3. Notifications API (`services/notifications-api.ts`)
| Function | Method | Endpoint | Status |
|----------|--------|----------|--------|
| `getNotifications()` | GET | `/notifications` | ✅ Ready |
| `getUnreadCount()` | GET | `/notifications/unread-count` | ✅ Ready |
| `markAsRead()` | PATCH | `/notifications/:id/read` | ✅ Ready |
| `markAllAsRead()` | PATCH | `/notifications/read-all` | ✅ Ready |

### 4. Projects API (`services/projects.ts`)
| Function | Method | Endpoint | Status |
|----------|--------|----------|--------|
| `getProjects()` | GET | `/projects` | ✅ Ready |
| `getProject()` | GET | `/projects/:id` | ✅ Ready |
| `createProject()` | POST | `/projects` | ✅ Ready |
| `updateProject()` | PATCH | `/projects/:id` | ✅ Fixed (PUT→PATCH) |
| `deleteProject()` | DELETE | `/projects/:id` | ✅ Ready |

---

## 🔧 Backend Modules (Cần Deploy)

### Files đã tạo trong `backend-files/`

```
backend-files/
├── profile/
│   ├── profile.controller.ts    ✅
│   ├── profile.service.ts       ✅
│   ├── profile.module.ts        ✅
│   ├── index.ts                 ✅
│   └── dto/
│       └── update-profile.dto.ts ✅
├── notifications/
│   ├── notifications.controller.ts  ✅
│   ├── notifications.service.ts     ✅
│   ├── notifications.module.ts      ✅
│   └── index.ts                     ✅
├── prisma/
│   ├── schema.prisma.additions      ✅
│   └── migrations/
│       └── add_profile_notifications.sql ✅
└── deploy-backend.sh                ✅
```

---

## 📡 API Endpoints Summary

### Base URL
```
Production: https://baotienweb.cloud/api/v1
Local Dev:  http://localhost:3000/api/v1
```

### Profile Endpoints
```
GET    /profile              - Get current user profile
PATCH  /profile              - Update profile info
POST   /profile/avatar       - Upload avatar (multipart/form-data)
DELETE /profile/avatar       - Delete avatar
```

### Notifications Endpoints
```
GET    /notifications                    - List notifications (paginated)
GET    /notifications/unread-count       - Get unread count
PATCH  /notifications/:id/read           - Mark as read
PATCH  /notifications/read-all           - Mark all as read
PATCH  /notifications/:id/archive        - Archive notification
```

### Services Endpoints
```
GET    /services                        - List services (public)
GET    /services/:id                    - Get service details (public)
GET    /services/:id/details            - Get enhanced details with reviews
POST   /services/bookings               - Create booking (auth)
GET    /services/bookings               - Get user bookings (auth)
PATCH  /services/bookings/:id/cancel    - Cancel booking (auth)
GET    /services/categories             - Get categories (public)
```

---

## 🔐 Authentication

Tất cả protected endpoints yêu cầu:
```
Authorization: Bearer <access_token>
```

Login endpoint: `POST /auth/login`
Response: `{ access_token, refresh_token, user }`

---

## 📦 Deployment Instructions

### Option 1: Automatic (Recommended)
```bash
# SSH vào server
ssh root@103.200.20.100
# Password: 6k4BOIRDwWhsM39F2DyM

# Navigate và chạy script
cd /var/www/baotienweb-api
# Upload và chạy deploy-backend.sh
bash deploy-backend.sh
```

### Option 2: Manual
Xem chi tiết tại: `BACKEND_DEPLOYMENT_MANUAL.md`

---

## ⚙️ Environment Configuration

### Frontend (.env)
```env
EXPO_PUBLIC_API_BASE_URL=https://baotienweb.cloud/api/v1
EXPO_PUBLIC_WS_URL=wss://baotienweb.cloud/ws
EXPO_PUBLIC_API_KEY=thietke-resort-api-key-2024
```

### Backend Server
```
Server: 103.200.20.100
Backend Path: /var/www/baotienweb-api
PM2 App: baotienweb-api
Database: PostgreSQL (Prisma ORM)
```

---

## ✅ Checklist

### Frontend (Done)
- [x] `profileApi.ts` - Profile CRUD với avatar upload
- [x] `servicesApi.ts` - Services và Bookings
- [x] `notifications-api.ts` - Notifications system  
- [x] `projects.ts` - Fixed PATCH method
- [x] `useProfile.ts` hook - Avatar upload với camera
- [x] `useServicesBooking.ts` hook - Services state management
- [x] Environment config pointing to production

### Backend (Pending Deploy)
- [ ] Profile module files uploaded
- [ ] Notifications module files uploaded
- [ ] app.module.ts updated with imports
- [ ] Prisma schema updated
- [ ] Migration ran
- [ ] Sharp installed
- [ ] PM2 restarted
- [ ] API endpoints tested

---

## 🧪 Test Commands

```bash
# Test profile (cần token)
curl -X GET https://baotienweb.cloud/api/v1/profile \
  -H "Authorization: Bearer <token>"

# Test notifications
curl -X GET "https://baotienweb.cloud/api/v1/notifications?page=1&limit=10" \
  -H "Authorization: Bearer <token>"

# Test services (public)
curl -X GET "https://baotienweb.cloud/api/v1/services"
```

---

## 📄 Related Documentation

- `BACKEND_DEPLOYMENT_MANUAL.md` - Chi tiết deploy backend
- `API_INTEGRATION_COMPLETE.md` - Frontend integration guide
- `BACKEND_API_SPECS.md` - API specifications
- `backend-files/deploy-backend.sh` - Auto deploy script
