# API Endpoints Summary - Design Build App

## Base URL
```
https://baotienweb.cloud/api/v1
```

## Headers Required
```
X-API-Key: thietke-resort-api-key-2024
Authorization: Bearer <access_token>  (for protected endpoints)
Content-Type: application/json
```

---

## 🔐 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Email/Password login |
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| POST | `/auth/logout` | ✅ | Logout (invalidate token) |
| POST | `/auth/forgot-password` | ❌ | Request password reset |
| POST | `/auth/reset-password` | ❌ | Reset password with token |

## 📱 Zalo Integration

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/zalo/login` | ❌ | Login with Zalo OAuth |
| POST | `/zalo/send-otp` | ❌ | Send OTP to phone |
| POST | `/zalo/verify-otp` | ❌ | Verify OTP code |
| POST | `/zalo/register-phone` | ❌ | Register with phone number |
| POST | `/zalo/link-phone` | ✅ | Link phone to existing account |
| POST | `/zalo/send-zns` | ✅ | Send ZNS notification |
| POST | `/zalo/send-zns-otp` | ❌ | Send OTP via ZNS |
| POST | `/zalo/send-zns-dev` | ✅ | Send ZNS (dev mode) |
| GET | `/zalo/templates` | ✅ | List ZNS templates |
| GET | `/zalo/templates/:id` | ✅ | Get template details |
| GET | `/zalo/oa-info` | ✅ | Get OA information |
| POST | `/zalo/oa-message` | ✅ | Send OA message |
| GET | `/zalo/oauth/callback` | ❌ | OAuth callback |
| GET/POST | `/zalo/webhook` | ❌ | Webhook receiver |
| GET | `/zalo/status` | ❌ | Check Zalo config status |
| GET | `/zalo/info` | ❌ | Integration info |

## 💬 Messages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/messages/conversations` | ✅ | List all conversations |
| GET | `/messages/conversations/:id` | ✅ | Get messages in conversation |
| POST | `/messages` | ✅ | Send new message |
| PATCH | `/messages/:id/read` | ✅ | Mark message as read |
| PATCH | `/messages/conversations/:id/read-all` | ✅ | Mark all as read |
| GET | `/messages/unread-count` | ✅ | Get unread count |

## 📞 Calls (Voice/Video)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/call/start` | ✅ | Start a call |
| POST | `/call/accept/:callId` | ✅ | Accept incoming call |
| POST | `/call/reject/:callId` | ✅ | Reject incoming call |
| POST | `/call/end` | ✅ | End current call |
| GET | `/call/history` | ✅ | Get call history |
| GET | `/call/missed-count` | ✅ | Get missed calls count |

## 🎬 Live Streams

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/live-streams` | ✅ | Create new stream |
| GET | `/live-streams` | ✅ | List all streams |
| GET | `/live-streams/live` | ✅ | Get currently live streams |
| GET | `/live-streams/:id` | ✅ | Get stream details |
| POST | `/live-streams/:id/start` | ✅ | Start streaming |
| POST | `/live-streams/:id/end` | ✅ | End stream |
| POST | `/live-streams/:id/join` | ✅ | Join as viewer |
| POST | `/live-streams/:id/leave` | ✅ | Leave stream |
| POST | `/live-streams/:id/comments` | ✅ | Add comment |
| GET | `/live-streams/:id/comments` | ✅ | Get comments |
| POST | `/live-streams/:id/reactions` | ✅ | Add reaction |
| GET | `/live-streams/:id/reactions` | ✅ | Get reaction counts |
| PATCH | `/live-streams/:id` | ✅ | Update stream settings |
| DELETE | `/live-streams/:id` | ✅ | Delete stream |

## 🎥 Video Rooms (WebRTC)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/video/rooms` | ✅ | Create video room |
| POST | `/video/rooms/:roomId/token` | ✅ | Get room token |
| GET | `/video/rooms` | ✅ | List active rooms |
| GET | `/video/rooms/:roomId` | ✅ | Get room details |
| DELETE | `/video/rooms/:roomId` | ✅ | End room |
| POST | `/video/rooms/:roomId/leave` | ✅ | Leave room |
| GET | `/video/health` | ✅ | Check LiveKit status |

## 📊 Video Interactions (Coming Soon - requires migration)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/videos/:videoId/like` | ✅ | Toggle like |
| GET | `/videos/:videoId/liked` | ✅ | Check if liked |
| POST | `/videos/:videoId/comments` | ✅ | Add comment |
| GET | `/videos/:videoId/comments` | ❌ | Get comments |
| PATCH | `/videos/comments/:commentId` | ✅ | Update comment |
| DELETE | `/videos/comments/:commentId` | ✅ | Delete comment |
| POST | `/videos/comments/:commentId/like` | ✅ | Like comment |
| POST | `/videos/:videoId/view` | ❌ | Track view |
| POST | `/videos/:videoId/share` | ❌ | Track share |
| GET | `/videos/:videoId/stats` | ❌ | Get video stats |

## 🔔 Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/notifications` | ✅ | Create notification |
| GET | `/notifications` | ✅ | List notifications |
| GET | `/notifications/unread-count` | ✅ | Get unread count |
| PATCH | `/notifications/:id/read` | ✅ | Mark as read |
| PATCH | `/notifications/read-all` | ✅ | Mark all as read |
| PATCH | `/notifications/:id/archive` | ✅ | Archive notification |

## 💬 Comments (Projects/Tasks)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/comments` | ✅ | Add comment |
| GET | `/comments` | ✅ | List comments |
| DELETE | `/comments/:id` | ✅ | Delete comment |

## 📁 Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/tasks` | ✅ | Create task |
| GET | `/tasks` | ✅ | List tasks |
| GET | `/tasks/:id` | ✅ | Get task details |
| PUT | `/tasks/:id` | ✅ | Update task |
| DELETE | `/tasks/:id` | ✅ | Delete task |
| GET | `/tasks/:id/progress` | ✅ | Get task progress |

## 📂 Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/projects` | ✅ | Create project |
| GET | `/projects` | ✅ | List projects |
| GET | `/projects/:id` | ✅ | Get project details |
| PUT | `/projects/:id` | ✅ | Update project |
| DELETE | `/projects/:id` | ✅ | Delete project |

## 📤 File Upload

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/profile/avatar` | ✅ | Upload avatar |
| DELETE | `/profile/avatar` | ✅ | Delete avatar |
| POST | `/upload/documents` | ✅ | Upload documents |
| POST | `/upload/projects/photos` | ✅ | Upload project photos |
| POST | `/upload/files` | ✅ | Upload general files |
| DELETE | `/upload/files` | ✅ | Batch delete files |

## ❤️ Social (Coming Soon - requires migration)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/social/follow/:userId` | ✅ | Follow user |
| DELETE | `/social/follow/:userId` | ✅ | Unfollow user |
| GET | `/social/followers/:userId` | ✅ | Get followers |
| GET | `/social/following/:userId` | ✅ | Get following |
| GET | `/social/is-following/:userId` | ✅ | Check if following |
| POST | `/social/block/:userId` | ✅ | Block user |
| DELETE | `/social/block/:userId` | ✅ | Unblock user |
| GET | `/social/blocked` | ✅ | Get blocked list |
| GET | `/social/stats/:userId` | ✅ | Get user stats |
| POST | `/social/reactions` | ✅ | Add reaction |
| GET | `/social/reactions/:contentType/:contentId` | ✅ | Get reactions |

## 🏥 Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | Full health check |
| GET | `/health/db` | ❌ | Database health |
| GET | `/health/metrics` | ❌ | System metrics |

---

## WebSocket Namespaces

| Namespace | Events | Description |
|-----------|--------|-------------|
| `/chat` | `message`, `typing`, `read` | Real-time messaging |
| `/call` | `incoming_call`, `call_accepted`, `call_ended` | Call signaling |
| `/progress` | `task:progress`, `project:progress` | Progress updates |
| `/livestream` | `stream:started`, `stream:ended`, `viewer_joined` | Live streaming |

---

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Rate Limiting
- 100 requests per minute per IP
- Auth endpoints: 10 requests per minute
- OTP endpoints: 3 requests per 15 minutes

---

## Zalo OA Configuration

OA đã được liên kết:
- **OA Name**: Cty Nhà Xinh thiết kế thi công
- **OA ID**: 456044990408003327
- **App ID**: 1408601745775286980

### Để kích hoạt OTP qua Zalo ZNS:

1. **Lấy OA Access Token**:
   - Truy cập: https://developers.zalo.me/tools/explorer
   - Chọn "OA Access Token" (KHÔNG phải User Access Token)
   - Cấp quyền cho OA

2. **Tạo OTP Template**:
   - Truy cập: https://oa.zalo.me
   - Vào "Quản lý mẫu ZNS" → "Tạo mẫu mới"
   - Chọn loại: OTP / Xác thực
   - Gửi duyệt (1-2 ngày làm việc)

3. **Cập nhật .env trên VPS**:
```env
ZALO_OA_ACCESS_TOKEN=<oa_access_token>
ZALO_OA_REFRESH_TOKEN=<oa_refresh_token>
ZALO_OTP_TEMPLATE_ID=<template_id>
```
