# Phase 3: Push Notifications - Testing & Implementation Guide

## Current Status

### ✅ What We Have

1. **Frontend**: UnifiedNotificationContext with push token registration
2. **expo-notifications**: Configured and ready
3. **Token Flow**: Request permission → Get token → Store locally

### ❌ What's Missing

1. **Backend Endpoint**: No `/push-tokens` or `/device-tokens` endpoint found
2. **Token Storage**: Tokens not being sent to backend
3. **Push Sending**: No backend service to send push notifications

---

## Implementation Plan

### Task 1: Backend - Device Tokens Table & Endpoint

**Create Database Schema:**

```prisma
// prisma/schema.prisma
model DeviceToken {
  id        Int      @id @default(autoincrement())
  userId    Int
  token     String   @unique
  platform  String   // "ios" | "android" | "web"
  deviceId  String?
  deviceName String?
  isActive  Boolean  @default(true)
  lastUsed  DateTime @default(now())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
}
```

**Create Controller:**

```typescript
// src/push/push.controller.ts
import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("push-tokens")
@UseGuards(JwtAuthGuard)
export class PushController {
  constructor(private pushService: PushService) {}

  @Post()
  async registerToken(
    @Req() req: any,
    @Body()
    dto: {
      token: string;
      platform: string;
      deviceId?: string;
      deviceName?: string;
    },
  ) {
    const userId = req.user.id;
    return this.pushService.registerToken(userId, dto);
  }
}
```

**Create Service:**

```typescript
// src/push/push.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Expo, ExpoPushMessage } from "expo-server-sdk";

@Injectable()
export class PushService {
  private expo: Expo;

  constructor(private prisma: PrismaService) {
    this.expo = new Expo();
  }

  async registerToken(userId: number, dto: any) {
    return this.prisma.deviceToken.upsert({
      where: { token: dto.token },
      update: {
        userId,
        platform: dto.platform,
        deviceId: dto.deviceId,
        deviceName: dto.deviceName,
        lastUsed: new Date(),
        isActive: true,
      },
      create: {
        userId,
        token: dto.token,
        platform: dto.platform,
        deviceId: dto.deviceId,
        deviceName: dto.deviceName,
      },
    });
  }

  async sendPushToUser(
    userId: number,
    title: string,
    body: string,
    data?: any,
  ) {
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId, isActive: true },
    });

    if (tokens.length === 0) {
      return { sent: 0, message: "No active tokens" };
    }

    const messages: ExpoPushMessage[] = tokens.map((t) => ({
      to: t.token,
      sound: "default",
      title,
      body,
      data,
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending push:", error);
      }
    }

    return { sent: tickets.length, tickets };
  }
}
```

### Task 2: Frontend - Fix Token Registration Endpoint

**Update UnifiedNotificationContext.tsx:**

```typescript
// Line ~760: Fix endpoint URL
if (user) {
  await apiFetch("/push-tokens", {
    // Remove /api/v1 prefix
    method: "POST",
    data: { token, platform: Platform.OS },
  }).catch(() => console.log("Failed to register push token"));
}
```

### Task 3: Test Push Token Registration

**Manual Test Script:**

```powershell
# 1. Login
$API_BASE = "https://baotienweb.cloud/api/v1"
$API_KEY = "sk_live_designbuild_2025_secure_key_v1"
$headers = @{"Content-Type"="application/json";"X-API-Key"=$API_KEY}
$loginBody = @{email="testuser1@baotienweb.cloud";password="Test@123456"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method Post -Body $loginBody -Headers $headers
$TOKEN = $response.accessToken

# 2. Register push token
$pushBody = @{
    token="ExponentPushToken[xxxxxx]"
    platform="android"
    deviceId="emulator"
    deviceName="Android Emulator"
} | ConvertTo-Json

$authHeaders = @{
    "Content-Type"="application/json"
    "X-API-Key"=$API_KEY
    "Authorization"="Bearer $TOKEN"
}

Invoke-RestMethod -Uri "$API_BASE/push-tokens" -Method Post -Body $pushBody -Headers $authHeaders
```

### Task 4: Test Push Notification Delivery

**Send Test Push:**

```powershell
# After registering token, send test push
$pushTestBody = @{
    userId=8
    title="Test Push Notification"
    body="This is a test from backend"
    data=@{type="test";timestamp=(Get-Date -Format "yyyy-MM-ddTHH:mm:ss")}
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API_BASE/push/send-to-user" -Method Post -Body $pushTestBody -Headers $authHeaders
```

### Task 5: Integrate with Notifications Service

**Update notifications.service.ts to send push:**

```typescript
// After creating notification in DB
async create(dto: CreateNotificationDto) {
  const notification = await this.prisma.notification.create({ data: dto });

  // Send push notification
  await this.pushService.sendPushToUser(
    dto.userId,
    dto.title,
    dto.body,
    { notificationId: notification.id, ...dto.data }
  );

  // Emit WebSocket event
  this.notificationsGateway.sendNotificationToUser(dto.userId, notification);

  return notification;
}
```

---

## Testing Checklist

### Phase 3.1: Token Registration

- [ ] Backend: Create device_tokens table migration
- [ ] Backend: Implement /push-tokens endpoint
- [ ] Backend: Test endpoint with curl/Postman
- [ ] Frontend: Run app on physical device
- [ ] Frontend: Request push permissions
- [ ] Frontend: Verify token sent to backend
- [ ] Backend: Verify token stored in database

### Phase 3.2: Push Delivery

- [ ] Backend: Install expo-server-sdk (`npm i expo-server-sdk`)
- [ ] Backend: Implement push sending service
- [ ] Backend: Create /push/send-to-user endpoint
- [ ] Test: Send push to logged-in user
- [ ] Test: App receives push in foreground
- [ ] Test: App receives push in background
- [ ] Test: Tapping push opens correct screen

### Phase 3.3: Integration

- [ ] Integrate push with notifications.service.ts
- [ ] Test: Create notification → Push sent automatically
- [ ] Test: WebSocket + Push work together
- [ ] Test: Badge updates correctly
- [ ] Error handling: Invalid tokens
- [ ] Error handling: Expo service errors

---

## Known Issues & Solutions

### Issue 1: No Backend Endpoint

**Status**: ❌ Not implemented  
**Solution**: Need to create push module in backend

### Issue 2: expo-server-sdk Not Installed

**Status**: ❌ Not installed  
**Solution**: `cd BE-baotienweb.cloud && npm i expo-server-sdk`

### Issue 3: Database Schema Missing

**Status**: ❌ No device_tokens table  
**Solution**: Add to schema.prisma and run migration

---

## Quick Start (After Backend Implementation)

1. **Start Backend**:

   ```bash
   cd BE-baotienweb.cloud
   npm run start:dev
   ```

2. **Start Frontend**:

   ```bash
   npm start
   ```

3. **Login on Physical Device**:
   - Email: testuser1@baotienweb.cloud
   - Password: Test@123456

4. **Check Console**:
   - Should see "Push token: ExponentPushToken[...]"
   - Should see "Token registered on server"

5. **Send Test Push**:
   Run the PowerShell test script above

---

## Next Steps

1. ⚠️ **Backend implementation required** - Cannot proceed without backend support
2. Create GitHub issue or ticket for backend team
3. Estimated backend work: 2-3 hours
4. Frontend is ready and waiting

---

_Document created: 2025-02-03_  
_Status: BLOCKED - Waiting for backend implementation_
