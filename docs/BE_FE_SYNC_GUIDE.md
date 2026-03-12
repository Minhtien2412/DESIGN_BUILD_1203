# 🔄 Backend - Frontend Sync Guide

Tài liệu hướng dẫn đồng bộ giữa Backend (NestJS) và Frontend (React Native/Expo).

---

## 📁 Project Structure

```
APP_DESIGN_BUILD05.12.2025/
├── BE-baotienweb.cloud/          # Backend NestJS API
│   ├── src/
│   │   ├── auth/                 # Authentication module
│   │   ├── users/                # Users module
│   │   ├── products/             # Products module
│   │   ├── chat/                 # Chat module
│   │   └── ...
│   └── prisma/                   # Database schema
│
├── app/                          # Frontend Expo Router
│   ├── (tabs)/                   # Tab screens
│   ├── (auth)/                   # Auth screens
│   └── ...
│
├── services/                     # API services
│   ├── api.ts                    # Base API client
│   ├── authApi.ts                # Auth API
│   └── ...
│
├── types/                        # TypeScript types
│   ├── unified-*.ts              # Unified types (FE + BE)
│   └── api.d.ts                  # Generated API types
│
└── context/                      # React contexts
    ├── AuthContext.tsx
    ├── cart-context.tsx
    └── ...
```

---

## 🔄 SYNC CHECKLIST

### ✅ Khi thêm Feature mới:

- [ ] **BE**: Tạo API endpoint mới
- [ ] **BE**: Thêm validation (DTOs)
- [ ] **BE**: Document endpoint (Swagger)
- [ ] **FE**: Thêm type vào `types/unified-*.ts`
- [ ] **FE**: Tạo service function trong `services/`
- [ ] **FE**: Tạo UI components
- [ ] **Test**: API integration test
- [ ] **Test**: E2E test

### ✅ Khi sửa API:

- [ ] **BE**: Update endpoint
- [ ] **BE**: Update DTOs
- [ ] **BE**: Update Swagger docs
- [ ] **FE**: Update unified types
- [ ] **FE**: Update normalize functions
- [ ] **FE**: Update services
- [ ] **Test**: Verify không break existing features

---

## 🔗 API Endpoints Mapping

### Authentication

| Endpoint         | Method | BE Controller        | FE Service               |
| ---------------- | ------ | -------------------- | ------------------------ |
| `/auth/login`    | POST   | `auth.controller.ts` | `authApi.login()`        |
| `/auth/register` | POST   | `auth.controller.ts` | `authApi.register()`     |
| `/auth/refresh`  | POST   | `auth.controller.ts` | `authApi.refreshToken()` |
| `/auth/logout`   | POST   | `auth.controller.ts` | `authApi.logout()`       |

### Users

| Endpoint     | Method | BE Controller         | FE Service          |
| ------------ | ------ | --------------------- | ------------------- |
| `/users/me`  | GET    | `users.controller.ts` | `userApi.getMe()`   |
| `/users/:id` | GET    | `users.controller.ts` | `userApi.getById()` |
| `/users`     | PATCH  | `users.controller.ts` | `userApi.update()`  |

### Products

| Endpoint           | Method | BE Controller            | FE Service             |
| ------------------ | ------ | ------------------------ | ---------------------- |
| `/products`        | GET    | `products.controller.ts` | `productApi.getAll()`  |
| `/products/:id`    | GET    | `products.controller.ts` | `productApi.getById()` |
| `/products/search` | GET    | `products.controller.ts` | `productApi.search()`  |

### Chat

| Endpoint                   | Method | BE Controller        | FE Service              |
| -------------------------- | ------ | -------------------- | ----------------------- |
| `/chat/rooms`              | GET    | `chat.controller.ts` | `chatApi.getRooms()`    |
| `/chat/rooms/:id/messages` | GET    | `chat.controller.ts` | `chatApi.getMessages()` |
| `/chat/rooms/:id/messages` | POST   | `chat.controller.ts` | `chatApi.sendMessage()` |

---

## 📝 Type Sync Pattern

### Backend DTO → Frontend Type

**Backend (NestJS DTO):**

```typescript
// src/users/dto/user-response.dto.ts
export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ required: false })
  avatar?: string;
}
```

**Frontend (Unified Type):**

```typescript
// types/unified-user.ts
export interface User {
  id: number;
  email: string;
  fullName: string;
  avatar?: string;
}

// Normalize function for API response
export function normalizeUser(data: any): User {
  return {
    id: data.id,
    email: data.email,
    fullName: data.fullName || data.full_name || "",
    avatar: data.avatar || data.avatarUrl,
  };
}
```

---

## 🔧 Service Pattern

### Base API Client

```typescript
// services/api.ts
import { ENV } from "@/config/env";

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${ENV.API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": ENV.API_KEY,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json();
}
```

### Feature Service

```typescript
// services/userApi.ts
import { apiFetch } from "./api";
import { User, normalizeUser } from "@/types/unified-user";

export const userApi = {
  async getMe(): Promise<User> {
    const data = await apiFetch("/users/me");
    return normalizeUser(data);
  },

  async update(updates: Partial<User>): Promise<User> {
    const data = await apiFetch("/users", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return normalizeUser(data);
  },
};
```

---

## 🔐 Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Database   │
│  (Expo App) │     │  (NestJS)   │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │  POST /auth/login │
       │──────────────────▶│
       │                   │
       │  { accessToken,   │
       │    refreshToken } │
       │◀──────────────────│
       │                   │
       │  Save tokens to   │
       │  SecureStore      │
       │                   │
       │  GET /users/me    │
       │  + Bearer token   │
       │──────────────────▶│
       │                   │
       │  User data        │
       │◀──────────────────│
```

---

## 🧪 Testing Checklist

### API Testing (Backend)

```bash
# Run all tests
cd BE-baotienweb.cloud
npm run test

# Run specific module tests
npm run test -- --grep "AuthController"

# Run e2e tests
npm run test:e2e
```

### Integration Testing (Frontend)

```bash
# Run Jest tests
npm test

# Run specific test file
npm test -- services/authApi.test.ts
```

### Manual Testing

1. **Swagger UI**: https://baotienweb.cloud/api/docs
2. **Postman Collection**: `/docs/postman/`
3. **cURL examples**: `/docs/api-examples/`

---

## 🚨 Common Sync Issues

### 1. Type Mismatch

**Problem:** Backend returns `snake_case`, Frontend expects `camelCase`
**Solution:** Use normalize functions

```typescript
// Normalize backend response
export function normalizeProduct(data: any): Product {
  return {
    id: data.id,
    productName: data.product_name || data.productName,
    createdAt: new Date(data.created_at || data.createdAt),
  };
}
```

### 2. Missing Fields

**Problem:** Backend adds new field, Frontend doesn't know
**Solution:**

- Always update `types/unified-*.ts` when adding BE fields
- Use optional chaining for backward compatibility

### 3. Validation Errors

**Problem:** Frontend sends invalid data
**Solution:**

- Match DTO validation rules on both ends
- Use shared validation schemas (Zod/Yup)

---

## 📚 Related Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Authentication Guide](./AUTH_GUIDE.md)
- [WebSocket Integration](./WEBSOCKET_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

## 🔄 Version History

| Version | Date       | Changes            |
| ------- | ---------- | ------------------ |
| 1.0.0   | 2026-01-31 | Initial sync guide |
