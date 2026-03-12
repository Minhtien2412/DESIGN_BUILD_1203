# 📚 Backend API Reference Documentation

**Base URL:** `https://baotienweb.cloud/api/v1`  
**API Version:** 1.0  
**Last Updated:** December 24, 2025

---

## 🔐 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message",
  "statusCode": 200
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## 📑 Table of Contents

1. [System Health](#system-health)
2. [Authentication](#authentication-endpoints)
3. [User Management](#user-management)
4. [Products](#products)
5. [Projects](#projects)
6. [Error Codes](#error-codes)

---

## 🏥 System Health

### Check API Health

Check backend service status including database, memory, and disk.

**Endpoint:** `GET /health`

**Headers:** None required

**Response:**
```json
{
  "status": "ok",
  "database": {
    "status": "up"
  },
  "memory": {
    "status": "up",
    "used": "185 MB",
    "total": "512 MB"
  },
  "disk": {
    "status": "up"
  }
}
```

**Status Codes:**
- `200 OK` - Service is healthy
- `503 Service Unavailable` - Service is down

**Example Request:**
```bash
curl -X GET https://baotienweb.cloud/api/v1/health
```

---

## 🔑 Authentication Endpoints

### Register User

Create a new user account with specified role.

**Endpoint:** `POST /auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "role": "CLIENT"
}
```

**Field Validations:**
- `email`: Valid email format, unique
- `password`: Min 8 characters, must contain uppercase, lowercase, number, special char
- `fullName`: 2-100 characters
- `role`: One of `CLIENT`, `ENGINEER`, `CONTRACTOR`, `STAFF`, `ARCHITECT`, `DESIGNER`, `SUPPLIER`, `ADMIN`

**Response:**
```json
{
  "user": {
    "id": 123,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "CLIENT",
    "emailVerified": false,
    "createdAt": "2025-12-24T10:30:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**
- `201 Created` - User registered successfully
- `400 Bad Request` - Invalid input data
- `409 Conflict` - Email already exists

**Example Request:**
```bash
curl -X POST https://baotienweb.cloud/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "fullName": "John Doe",
    "role": "CLIENT"
  }'
```

---

### Login User

Authenticate user and receive access tokens.

**Endpoint:** `POST /auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {
    "id": 123,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "CLIENT",
    "emailVerified": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**
- `200 OK` - Login successful
- `401 Unauthorized` - Invalid credentials
- `404 Not Found` - User not found

**Example Request:**
```bash
curl -X POST https://baotienweb.cloud/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

---

### Get User Profile

Retrieve authenticated user's profile information.

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 123,
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "CLIENT",
  "emailVerified": true,
  "phone": "+1234567890",
  "location": {
    "city": "Ho Chi Minh",
    "country": "Vietnam"
  },
  "createdAt": "2025-12-24T10:30:00Z",
  "updatedAt": "2025-12-24T10:30:00Z"
}
```

**Status Codes:**
- `200 OK` - Profile retrieved
- `401 Unauthorized` - Invalid or missing token

**Example Request:**
```bash
curl -X GET https://baotienweb.cloud/api/v1/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Refresh Access Token

Get new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**
- `200 OK` - Token refreshed
- `401 Unauthorized` - Invalid refresh token

---

### Logout User

Invalidate user session and tokens.

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Status Codes:**
- `200 OK` - Logout successful
- `401 Unauthorized` - Invalid token

---

## 👤 User Management

### Update User Profile

Update authenticated user's profile information.

**Endpoint:** `PATCH /users/profile`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Updated Doe",
  "phone": "+1234567890",
  "location": {
    "city": "Ho Chi Minh",
    "country": "Vietnam"
  }
}
```

**Response:**
```json
{
  "id": 123,
  "email": "user@example.com",
  "fullName": "John Updated Doe",
  "phone": "+1234567890",
  "location": {
    "city": "Ho Chi Minh",
    "country": "Vietnam"
  },
  "updatedAt": "2025-12-24T11:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Profile updated
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Invalid token

---

### Change Password

Change authenticated user's password.

**Endpoint:** `POST /users/change-password`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

**Status Codes:**
- `200 OK` - Password changed
- `400 Bad Request` - Invalid passwords
- `401 Unauthorized` - Current password incorrect

---

## 🛍️ Products

### Get All Products

Retrieve list of all available products.

**Endpoint:** `GET /products`

**Headers:**
```
x-api-key: thietke-resort-api-key-2024
```

**Query Parameters:**
- `category` (optional): Filter by category (e.g., `furniture`, `lighting`)
- `minPrice` (optional): Minimum price filter (VND)
- `maxPrice` (optional): Maximum price filter (VND)
- `search` (optional): Search by product name
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "prod-001",
      "name": "Sofa Hiện Đại",
      "description": "Sofa 3 chỗ ngồi cao cấp",
      "price": 15000000,
      "category": "furniture",
      "images": [
        "https://example.com/sofa-1.jpg",
        "https://example.com/sofa-2.jpg"
      ],
      "inStock": true,
      "createdAt": "2025-12-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

**Status Codes:**
- `200 OK` - Products retrieved
- `401 Unauthorized` - Missing or invalid API key

**Example Request:**
```bash
curl -X GET "https://baotienweb.cloud/api/v1/products?category=furniture&page=1&limit=10" \
  -H "x-api-key: thietke-resort-api-key-2024"
```

---

### Get Product by ID

Retrieve detailed information about a specific product.

**Endpoint:** `GET /products/:id`

**Headers:**
```
x-api-key: thietke-resort-api-key-2024
```

**Response:**
```json
{
  "id": "prod-001",
  "name": "Sofa Hiện Đại",
  "description": "Sofa 3 chỗ ngồi cao cấp với chất liệu vải bền đẹp",
  "price": 15000000,
  "category": "furniture",
  "images": [
    "https://example.com/sofa-1.jpg",
    "https://example.com/sofa-2.jpg",
    "https://example.com/sofa-3.jpg"
  ],
  "specifications": {
    "dimensions": "220 x 90 x 85 cm",
    "material": "Vải bọc cao cấp",
    "color": "Xám nhạt"
  },
  "inStock": true,
  "stockQuantity": 25,
  "createdAt": "2025-12-20T10:00:00Z",
  "updatedAt": "2025-12-23T15:30:00Z"
}
```

**Status Codes:**
- `200 OK` - Product found
- `404 Not Found` - Product does not exist
- `401 Unauthorized` - Missing or invalid API key

---

## 🏗️ Projects

### Get All Projects

Retrieve list of construction projects.

**Endpoint:** `GET /projects`

**Headers:**
```
x-api-key: thietke-resort-api-key-2024
```

**Query Parameters:**
- `status` (optional): Filter by status (`planning`, `in_progress`, `completed`)
- `type` (optional): Filter by project type (`residential`, `commercial`, `resort`)
- `search` (optional): Search by project name or location
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "proj-001",
      "name": "Thiên Đường Resort",
      "description": "Resort 5 sao tại Phú Quốc",
      "location": "Phú Quốc, Kiên Giang",
      "type": "resort",
      "status": "in_progress",
      "area": 50000,
      "startDate": "2025-01-15",
      "completionDate": "2026-06-30",
      "budget": 500000000000,
      "images": [
        "https://example.com/project-1.jpg"
      ],
      "progress": 35,
      "createdAt": "2025-01-10T08:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Status Codes:**
- `200 OK` - Projects retrieved
- `401 Unauthorized` - Missing or invalid API key

**Example Request:**
```bash
curl -X GET "https://baotienweb.cloud/api/v1/projects?status=in_progress&page=1" \
  -H "x-api-key: thietke-resort-api-key-2024"
```

---

### Get Project by ID

Retrieve detailed information about a specific project.

**Endpoint:** `GET /projects/:id`

**Headers:**
```
x-api-key: thietke-resort-api-key-2024
```

**Response:**
```json
{
  "id": "proj-001",
  "name": "Thiên Đường Resort",
  "description": "Resort 5 sao cao cấp tại đảo Phú Quốc",
  "location": "Phú Quốc, Kiên Giang",
  "type": "resort",
  "status": "in_progress",
  "area": 50000,
  "startDate": "2025-01-15",
  "completionDate": "2026-06-30",
  "budget": 500000000000,
  "progress": 35,
  "images": [
    "https://example.com/project-1.jpg",
    "https://example.com/project-2.jpg"
  ],
  "milestones": [
    {
      "name": "Site Preparation",
      "status": "completed",
      "completionDate": "2025-03-01"
    },
    {
      "name": "Foundation Work",
      "status": "in_progress",
      "progress": 70
    }
  ],
  "team": [
    {
      "userId": 5,
      "role": "ARCHITECT",
      "name": "Nguyễn Văn A"
    }
  ],
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-12-20T14:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Project found
- `404 Not Found` - Project does not exist
- `401 Unauthorized` - Missing or invalid API key

---

## ⚠️ Error Codes

### HTTP Status Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| `200` | OK | Request succeeded |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request body, missing required fields |
| `401` | Unauthorized | Missing, invalid, or expired auth token |
| `403` | Forbidden | Insufficient permissions for requested resource |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate resource (e.g., email already registered) |
| `422` | Unprocessable Entity | Validation errors in request data |
| `500` | Internal Server Error | Server-side error, contact support |
| `503` | Service Unavailable | Service temporarily down for maintenance |

---

### Application Error Codes

| Error Code | Message | Resolution |
|------------|---------|------------|
| `AUTH_001` | Invalid credentials | Check email and password |
| `AUTH_002` | Token expired | Refresh access token using refresh token |
| `AUTH_003` | Email not verified | Complete email verification process |
| `USER_001` | User not found | Verify user ID or email |
| `USER_002` | Email already exists | Use different email address |
| `PROD_001` | Product not found | Check product ID |
| `PROJ_001` | Project not found | Check project ID |
| `VAL_001` | Validation error | Review request body fields |

---

## 📝 Rate Limiting

API requests are rate limited to prevent abuse:

- **Unauthenticated requests:** 100 requests per hour per IP
- **Authenticated requests:** 1000 requests per hour per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

If rate limit exceeded:
```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 3600
}
```

---

## 🔧 API Versioning

API version is included in the base URL: `/api/v1/`

When breaking changes are introduced, a new version will be released (e.g., `/api/v2/`). Previous versions will be maintained for 6 months after new version release.

---

## 📞 Support

- **API Documentation:** https://baotienweb.cloud/api/docs
- **Email Support:** api-support@baotienweb.cloud
- **Status Page:** https://status.baotienweb.cloud

---

**Last Updated:** December 24, 2025  
**Version:** 1.0.0
