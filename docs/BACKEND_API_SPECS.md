# Backend API Specifications - Phase 1

> **Document Purpose**: Chi tiết kỹ thuật cho tất cả Backend endpoints cần thiết cho Phase 1
> **Target Audience**: Backend developers, QA team
> **Last Updated**: 2025-12-12

---

## 📋 Table of Contents

1. [Profile Upload Endpoints](#1-profile-upload-endpoints)
2. [Profile Management Endpoints](#2-profile-management-endpoints)
3. [Project CRUD Endpoints](#3-project-crud-endpoints)
4. [Services Enhancement Endpoints](#4-services-enhancement-endpoints)
5. [Error Codes Reference](#5-error-codes-reference)
6. [Authentication Requirements](#6-authentication-requirements)

---

## 1. Profile Upload Endpoints

### 1.1 Upload Avatar

**Endpoint**: `POST /api/v1/profile/avatar`

**Purpose**: Upload user avatar image

**Authentication**: Required (Bearer token)

**Content-Type**: `multipart/form-data`

**Request**:
```http
POST /api/v1/profile/avatar
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

------WebKitFormBoundary
Content-Disposition: form-data; name="avatar"; filename="avatar.jpg"
Content-Type: image/jpeg

<binary_data>
------WebKitFormBoundary--
```

**Form Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `avatar` | File | ✅ Yes | Image file (jpg, jpeg, png, webp) |

**Validation Rules**:
- Max file size: 5MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Filename must be sanitized (remove special chars)
- Image must be resized to 512x512 (maintain aspect ratio)
- Generate thumbnail 120x120

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar_url": "https://baotienweb.cloud/uploads/avatars/user_123_1702396800000.jpg",
    "thumbnail_url": "https://baotienweb.cloud/uploads/avatars/user_123_1702396800000_thumb.jpg",
    "uploaded_at": "2025-12-12T10:30:00Z"
  }
}
```

**Error Responses**:

400 Bad Request - Invalid file:
```json
{
  "success": false,
  "error": "INVALID_FILE",
  "message": "File type not allowed. Use jpg, png, or webp",
  "details": {
    "allowed_types": ["image/jpeg", "image/png", "image/webp"],
    "received_type": "image/gif"
  }
}
```

413 Payload Too Large:
```json
{
  "success": false,
  "error": "FILE_TOO_LARGE",
  "message": "File size exceeds 5MB limit",
  "details": {
    "max_size": 5242880,
    "received_size": 6000000
  }
}
```

401 Unauthorized:
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

**File Storage**:
- Path: `/uploads/avatars/`
- Naming convention: `user_{userId}_{timestamp}.{ext}`
- Permissions: Read-only for public access
- Old avatar should be deleted after successful upload

**Image Processing**:
```javascript
// Pseudocode
1. Validate file size and type
2. Generate unique filename
3. Resize original to 512x512 (sharp/jimp)
4. Create thumbnail 120x120
5. Save both files
6. Delete old avatar if exists
7. Update user record in database
8. Return URLs
```

---

### 1.2 Delete Avatar

**Endpoint**: `DELETE /api/v1/profile/avatar`

**Purpose**: Remove user avatar and set to default

**Authentication**: Required

**Request**:
```http
DELETE /api/v1/profile/avatar
Authorization: Bearer <access_token>
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Avatar deleted successfully",
  "data": {
    "avatar_url": null,
    "default_avatar": "https://baotienweb.cloud/assets/default-avatar.png"
  }
}
```

---

## 2. Profile Management Endpoints

### 2.1 Update Profile

**Endpoint**: `PATCH /api/v1/profile`

**Purpose**: Update user profile information

**Authentication**: Required

**Content-Type**: `application/json`

**Request**:
```http
PATCH /api/v1/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "phone": "0901234567",
  "address": "123 Nguyễn Huệ, Q1, TPHCM",
  "bio": "Kỹ sư xây dựng với 10 năm kinh nghiệm",
  "dateOfBirth": "1990-05-15",
  "gender": "male"
}
```

**Request Body Schema**:
| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `name` | string | No | 100 | Full name |
| `phone` | string | No | 20 | Phone number (validate format) |
| `address` | string | No | 255 | Address |
| `bio` | string | No | 500 | Biography |
| `dateOfBirth` | string (ISO date) | No | - | Format: YYYY-MM-DD |
| `gender` | enum | No | - | Values: "male", "female", "other" |

**Validation Rules**:
- `phone`: Must match Vietnamese phone format: `/^(0[3|5|7|8|9])+([0-9]{8})$/`
- `dateOfBirth`: Must be in past, user must be at least 18 years old
- `name`: Minimum 2 characters, no special characters except Vietnamese accents
- All fields are optional (partial update)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 123,
    "email": "user@example.com",
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "address": "123 Nguyễn Huệ, Q1, TPHCM",
    "bio": "Kỹ sư xây dựng với 10 năm kinh nghiệm",
    "avatar": "https://baotienweb.cloud/uploads/avatars/user_123.jpg",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2025-12-12T10:30:00Z"
  }
}
```

**Error Responses**:

400 Bad Request - Validation error:
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "phone": ["Invalid phone number format"],
    "dateOfBirth": ["User must be at least 18 years old"]
  }
}
```

---

### 2.2 Get Profile

**Endpoint**: `GET /api/v1/profile`

**Purpose**: Get current user profile (enhanced with avatar field)

**Authentication**: Required

**Request**:
```http
GET /api/v1/profile
Authorization: Bearer <access_token>
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "address": "123 Nguyễn Huệ, Q1, TPHCM",
    "bio": "Kỹ sư xây dựng với 10 năm kinh nghiệm",
    "avatar": "https://baotienweb.cloud/uploads/avatars/user_123.jpg",
    "avatar_thumbnail": "https://baotienweb.cloud/uploads/avatars/user_123_thumb.jpg",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "role": "engineer",
    "verified": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2025-12-12T10:30:00Z",
    "stats": {
      "projects_count": 12,
      "completed_tasks": 45,
      "avg_rating": 4.8
    }
  }
}
```

**Enhancement Required**:
- Add `avatar` field to existing `/auth/me` response
- Add `avatar_thumbnail` field for optimized loading
- Include user stats if available

---

## 3. Project CRUD Endpoints

### 3.1 Get All Projects

**Endpoint**: `GET /api/v1/projects`

**Purpose**: Get list of projects for current user

**Authentication**: Required

**Request**:
```http
GET /api/v1/projects?page=1&limit=20&status=IN_PROGRESS&sort=createdAt:desc
Authorization: Bearer <access_token>
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `status` | enum | all | Filter by status |
| `sort` | string | createdAt:desc | Sort field:direction |
| `search` | string | - | Search in title/description |

**Status Values**: `PLANNING`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETED`, `CANCELLED`

**Response Success (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Xây dựng biệt thự 3 tầng",
      "description": "Dự án xây dựng biệt thự cao cấp tại Quận 9",
      "status": "IN_PROGRESS",
      "budget": 500000000,
      "startDate": "2025-01-15",
      "endDate": "2025-12-31",
      "location": "Quận 9, TPHCM",
      "images": [
        "https://baotienweb.cloud/uploads/projects/1_image1.jpg"
      ],
      "clientId": 456,
      "engineerId": 123,
      "client": {
        "id": 456,
        "name": "Nguyễn Thị B",
        "email": "client@example.com"
      },
      "engineer": {
        "id": 123,
        "name": "Nguyễn Văn A",
        "email": "engineer@example.com"
      },
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-12-12T10:30:00Z",
      "_count": {
        "tasks": 15,
        "comments": 8,
        "files": 25
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### 3.2 Get Project by ID

**Endpoint**: `GET /api/v1/projects/:id`

**Purpose**: Get detailed project information

**Authentication**: Required

**Request**:
```http
GET /api/v1/projects/1
Authorization: Bearer <access_token>
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Xây dựng biệt thự 3 tầng",
    "description": "Dự án xây dựng biệt thự cao cấp tại Quận 9",
    "status": "IN_PROGRESS",
    "budget": 500000000,
    "startDate": "2025-01-15",
    "endDate": "2025-12-31",
    "location": "Quận 9, TPHCM",
    "images": [
      "https://baotienweb.cloud/uploads/projects/1_image1.jpg",
      "https://baotienweb.cloud/uploads/projects/1_image2.jpg"
    ],
    "clientId": 456,
    "engineerId": 123,
    "client": {
      "id": 456,
      "name": "Nguyễn Thị B",
      "email": "client@example.com",
      "phone": "0909876543"
    },
    "engineer": {
      "id": 123,
      "name": "Nguyễn Văn A",
      "email": "engineer@example.com"
    },
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-12-12T10:30:00Z",
    "_count": {
      "tasks": 15,
      "comments": 8,
      "files": 25
    },
    "progress": {
      "completed_tasks": 8,
      "total_tasks": 15,
      "percentage": 53.33
    }
  }
}
```

**Error Response (404)**:
```json
{
  "success": false,
  "error": "PROJECT_NOT_FOUND",
  "message": "Project with ID 1 not found"
}
```

**Error Response (403)**:
```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "You don't have permission to view this project"
}
```

---

### 3.3 Create Project

**Endpoint**: `POST /api/v1/projects`

**Purpose**: Create new project

**Authentication**: Required

**Content-Type**: `application/json`

**Request**:
```http
POST /api/v1/projects
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Xây dựng biệt thự 3 tầng",
  "description": "Dự án xây dựng biệt thự cao cấp tại Quận 9",
  "budget": 500000000,
  "startDate": "2025-01-15",
  "endDate": "2025-12-31",
  "location": "Quận 9, TPHCM"
}
```

**Request Body Schema**:
| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `title` | string | ✅ Yes | 255 | Project title |
| `description` | string | No | 5000 | Project description |
| `budget` | number | No | - | Budget in VND |
| `startDate` | string (ISO) | No | - | Format: YYYY-MM-DD |
| `endDate` | string (ISO) | No | - | Format: YYYY-MM-DD |
| `location` | string | No | 500 | Project location |

**Validation Rules**:
- `title`: Minimum 3 characters, required
- `budget`: Must be positive number
- `endDate`: Must be after `startDate` if both provided
- Auto-set `status` to `PLANNING`
- Auto-assign `engineerId` to current user

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": 2,
    "title": "Xây dựng biệt thự 3 tầng",
    "description": "Dự án xây dựng biệt thự cao cấp tại Quận 9",
    "status": "PLANNING",
    "budget": 500000000,
    "startDate": "2025-01-15",
    "endDate": "2025-12-31",
    "location": "Quận 9, TPHCM",
    "images": [],
    "clientId": null,
    "engineerId": 123,
    "createdAt": "2025-12-12T10:30:00Z",
    "updatedAt": "2025-12-12T10:30:00Z"
  }
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "title": ["Title is required"],
    "endDate": ["End date must be after start date"]
  }
}
```

---

### 3.4 Update Project

**Endpoint**: `PATCH /api/v1/projects/:id`

**Purpose**: Update existing project

**Authentication**: Required

**Content-Type**: `application/json`

**Request**:
```http
PATCH /api/v1/projects/1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Xây dựng biệt thự 3 tầng - Updated",
  "status": "IN_PROGRESS",
  "budget": 550000000
}
```

**Request Body Schema**: (All fields optional - partial update)
| Field | Type | Max Length | Description |
|-------|------|------------|-------------|
| `title` | string | 255 | Project title |
| `description` | string | 5000 | Project description |
| `status` | enum | - | Project status |
| `budget` | number | - | Budget in VND |
| `startDate` | string (ISO) | - | Format: YYYY-MM-DD |
| `endDate` | string (ISO) | - | Format: YYYY-MM-DD |
| `location` | string | 500 | Project location |

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": 1,
    "title": "Xây dựng biệt thự 3 tầng - Updated",
    "status": "IN_PROGRESS",
    "budget": 550000000,
    "updatedAt": "2025-12-12T10:35:00Z"
  }
}
```

**Error Response (403)**:
```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "Only project engineer can update this project"
}
```

---

### 3.5 Delete Project

**Endpoint**: `DELETE /api/v1/projects/:id`

**Purpose**: Soft delete project (set status to CANCELLED)

**Authentication**: Required

**Request**:
```http
DELETE /api/v1/projects/1
Authorization: Bearer <access_token>
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Note**: Implement soft delete by setting `status` to `CANCELLED` and `deletedAt` timestamp

---

## 4. Services Enhancement Endpoints

### 4.1 Get Service Details

**Endpoint**: `GET /api/v1/services/:id/details`

**Purpose**: Get detailed service information with reviews and booking info

**Authentication**: Optional (public endpoint)

**Request**:
```http
GET /api/v1/services/1/details
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Thiết kế nhà phố",
    "description": "Dịch vụ thiết kế nhà phố hiện đại, sang trọng",
    "category": "Design",
    "price": 5000000,
    "unit": "m²",
    "duration": "30 ngày",
    "features": [
      "Bản vẽ 3D",
      "Bản vẽ thi công",
      "Giấy phép xây dựng"
    ],
    "images": [
      "https://baotienweb.cloud/uploads/services/1_img1.jpg"
    ],
    "status": "ACTIVE",
    "rating": 4.8,
    "reviewCount": 156,
    "viewCount": 1234,
    "orderCount": 45,
    "creator": {
      "id": 789,
      "name": "Công ty ABC",
      "email": "abc@example.com",
      "avatar": "https://baotienweb.cloud/uploads/avatars/789.jpg"
    },
    "recentReviews": [
      {
        "id": 1,
        "userId": 100,
        "rating": 5,
        "comment": "Dịch vụ tuyệt vời!",
        "createdAt": "2025-12-10T00:00:00Z",
        "user": {
          "id": 100,
          "name": "Khách hàng A",
          "avatar": "https://..."
        }
      }
    ],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-12-12T10:30:00Z"
  }
}
```

---

### 4.2 Create Service Booking

**Endpoint**: `POST /api/v1/services/bookings`

**Purpose**: Create booking for a service

**Authentication**: Required

**Request**:
```http
POST /api/v1/services/bookings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "serviceId": 1,
  "startDate": "2025-12-20",
  "endDate": "2026-01-20",
  "notes": "Cần thiết kế cho nhà 3 tầng, diện tích 120m²"
}
```

**Request Body Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `serviceId` | integer | ✅ Yes | Service ID to book |
| `startDate` | string (ISO) | ✅ Yes | Booking start date |
| `endDate` | string (ISO) | ✅ Yes | Booking end date |
| `notes` | string | No | Additional notes (max 1000 chars) |

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 10,
    "serviceId": 1,
    "userId": 123,
    "status": "PENDING",
    "startDate": "2025-12-20",
    "endDate": "2026-01-20",
    "totalPrice": 150000000,
    "notes": "Cần thiết kế cho nhà 3 tầng, diện tích 120m²",
    "createdAt": "2025-12-12T10:40:00Z"
  }
}
```

---

## 5. Error Codes Reference

### Standard Error Response Format
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": ["Validation error message"]
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User lacks permission for this resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `INVALID_FILE` | 400 | File upload validation failed |
| `FILE_TOO_LARGE` | 413 | File exceeds size limit |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `PROJECT_NOT_FOUND` | 404 | Project ID not found |
| `SERVICE_NOT_FOUND` | 404 | Service ID not found |

---

## 6. Authentication Requirements

### Bearer Token Format
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Validation
- Check token expiration
- Verify signature with secret key
- Extract `userId` from payload
- Check if user still exists and is active

### Public Endpoints (No Auth Required)
- `GET /api/v1/services`
- `GET /api/v1/services/:id`
- `GET /api/v1/services/:id/details`
- `GET /api/v1/services/categories`

### Protected Endpoints (Auth Required)
- All `/profile/*` endpoints
- All `/projects/*` endpoints (except GET /projects for public portfolio)
- `POST /services/bookings`

---

## 📝 Implementation Checklist

### Profile Endpoints
- [ ] POST /profile/avatar - Multipart upload with image processing
- [ ] DELETE /profile/avatar - Remove avatar file
- [ ] PATCH /profile - Update user info
- [ ] GET /profile - Include avatar field

### Project Endpoints
- [ ] GET /projects - List with pagination
- [ ] GET /projects/:id - Single project detail
- [ ] POST /projects - Create project
- [ ] PATCH /projects/:id - Update project
- [ ] DELETE /projects/:id - Soft delete

### Services Endpoints
- [ ] GET /services/:id/details - Enhanced service info
- [ ] POST /services/bookings - Create booking

### Infrastructure
- [ ] File storage setup (/uploads/avatars/)
- [ ] Image processing library (sharp/jimp)
- [ ] CORS configuration for file access
- [ ] Database migrations
- [ ] Error handling middleware
- [ ] Request validation middleware

---

**Total Endpoints**: 11 endpoints
**Estimated Development Time**: 5-7 days (1 backend developer)
**Priority**: High - blocks frontend development

---

*Generated: 2025-12-12*
