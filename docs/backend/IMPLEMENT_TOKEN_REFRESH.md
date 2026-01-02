# Backend Implementation: Token Refresh Endpoint

**Priority**: 🔴 HIGH  
**Estimated Time**: 2 hours  
**Complexity**: Medium  
**Status**: PENDING ⏳

---

## 📋 Quick Summary

Implement `POST /api/v1/auth/refresh` endpoint to automatically renew expired access tokens using refresh tokens, enabling seamless user authentication.

**Mobile Status**: ✅ READY (auto-refresh interceptor already implemented in `apiClient.ts`)

---

## 🎯 Requirements

### Endpoint Specification

```
POST /api/v1/auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (200 OK):
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CLIENT"
  }
}

Error (401 Unauthorized):
{
  "statusCode": 401,
  "message": "Invalid or expired refresh token",
  "error": "Unauthorized"
}
```

---

## 🗄️ Database Schema

Add to `prisma/schema.prisma`:

```prisma
model RefreshToken {
  id           Int       @id @default(autoincrement())
  token        String    @unique
  userId       Int
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt    DateTime
  createdAt    DateTime  @default(now())
  revokedAt    DateTime?
  replacedBy   String?   // Token that replaced this one (rotation tracking)
  deviceInfo   String?   // User agent / device fingerprint
  ipAddress    String?   // IP address for security
  
  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}

// Add to User model
model User {
  // ... existing fields
  refreshTokens RefreshToken[]
}
```

**Migration**:
```bash
npx prisma migrate dev --name add-refresh-token-table
```

---

## 💻 Implementation Files

### 1. DTO (Data Transfer Object)

**File**: `src/auth/dto/refresh-token.dto.ts`

```typescript
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
```

---

### 2. Auth Service

**File**: `src/auth/auth.service.ts`

Add these methods to existing `AuthService`:

```typescript
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Generate access token (short-lived: 15 minutes)
   */
  generateAccessToken(userId: number, email: string, role: string): string {
    return this.jwtService.sign(
      { sub: userId, email, role },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: '15m', // 15 minutes
      },
    );
  }

  /**
   * Generate refresh token (long-lived: 7 days)
   */
  generateRefreshToken(userId: number): string {
    return this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d', // 7 days
      },
    );
  }

  /**
   * Store refresh token in database
   */
  async storeRefreshToken(
    userId: number,
    token: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
        deviceInfo,
        ipAddress,
      },
    });
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string, deviceInfo?: string, ipAddress?: string) {
    // 1. Verify refresh token JWT signature
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      console.error('[Auth] Invalid refresh token JWT:', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 2. Check if refresh token exists in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      console.error('[Auth] Refresh token not found in database');
      throw new UnauthorizedException('Refresh token not found');
    }

    // 3. Check if token was revoked (security breach detection)
    if (storedToken.revokedAt) {
      console.error('[Auth] ⚠️ SECURITY: Revoked token reuse detected!');
      console.error('[Auth] User ID:', storedToken.userId);
      console.error('[Auth] Token:', refreshToken.substring(0, 20) + '...');
      
      // Revoke ALL user's tokens (potential token theft)
      await this.revokeAllUserTokens(storedToken.userId);
      
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // 4. Check if token expired
    if (new Date() > storedToken.expiresAt) {
      console.error('[Auth] Refresh token expired');
      throw new UnauthorizedException('Refresh token expired');
    }

    // 5. Get user details
    const user = storedToken.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 6. Generate new tokens
    const newAccessToken = this.generateAccessToken(user.id, user.email, user.role);
    const newRefreshToken = this.generateRefreshToken(user.id);

    // 7. Token rotation: Revoke old refresh token, store new one
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        revokedAt: new Date(),
        replacedBy: newRefreshToken,
      },
    });

    await this.storeRefreshToken(user.id, newRefreshToken, deviceInfo, ipAddress);

    console.log(`[Auth] ✅ Token refreshed successfully for user ${user.email}`);

    // 8. Return new tokens and user info
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  /**
   * Revoke all refresh tokens for a user (security measure)
   */
  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null, // Only revoke active tokens
      },
      data: {
        revokedAt: new Date(),
      },
    });

    console.log(`[Auth] 🗑️ Revoked all tokens for user ${userId}`);
  }

  /**
   * Clean up expired refresh tokens (scheduled job)
   */
  async cleanupExpiredTokens(): Promise<void> {
    const deleted = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`[Auth] 🧹 Cleaned up ${deleted.count} expired refresh tokens`);
  }
}
```

---

### 3. Auth Controller

**File**: `src/auth/auth.controller.ts`

Add this endpoint to existing `AuthController`:

```typescript
import { Body, Controller, Post, Req, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const { refreshToken } = dto;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    // Extract client info for security tracking
    const deviceInfo = userAgent || 'Unknown Device';
    const ipAddress = req.ip || req.socket.remoteAddress || 'Unknown IP';

    try {
      const tokens = await this.authService.refreshTokens(
        refreshToken,
        deviceInfo,
        ipAddress,
      );

      return tokens;
    } catch (error) {
      console.error('[AuthController] Token refresh failed:', error.message);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
```

---

### 4. Update Login/Register to Issue Refresh Tokens

**Modify existing login method**:

```typescript
// In auth.service.ts
async login(email: string, password: string, deviceInfo?: string, ipAddress?: string) {
  // ... existing validation logic

  // Generate tokens
  const accessToken = this.generateAccessToken(user.id, user.email, user.role);
  const refreshToken = this.generateRefreshToken(user.id);

  // Store refresh token
  await this.storeRefreshToken(user.id, refreshToken, deviceInfo, ipAddress);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    },
  };
}

// Same for register(), socialLogin(), etc.
```

---

## 🔐 Environment Variables

Add to `.env`:

```env
# JWT Secrets (MUST be different!)
JWT_SECRET=your-super-secret-access-token-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-different-from-access-min-32-chars

# Token Expiry
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

**Security Best Practices**:
- Access token secret ≠ Refresh token secret
- Use strong random strings (min 32 characters)
- Never commit secrets to git
- Rotate secrets regularly in production

---

## 🧪 Testing

### 1. Manual Test with Postman

**Step 1: Login to get tokens**

```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

**Step 2: Wait for access token to expire (or manually expire it)**

```
# Option: Manually set JWT_ACCESS_EXPIRY=10s in .env for testing
```

**Step 3: Refresh token**

```
POST http://localhost:3000/api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response:
{
  "accessToken": "NEW_eyJhbGc...",
  "refreshToken": "NEW_eyJhbGc...",
  "user": { ... }
}
```

**Step 4: Use new access token**

```
GET http://localhost:3000/api/v1/users/me
Authorization: Bearer NEW_eyJhbGc...

Response:
{
  "id": 1,
  "email": "test@example.com",
  ...
}
```

---

### 2. Test Token Rotation

```
POST /api/v1/auth/refresh
Body: { "refreshToken": "OLD_TOKEN" }

Response: { "accessToken": "NEW_A", "refreshToken": "NEW_R" }

# Try using OLD_TOKEN again (should fail)
POST /api/v1/auth/refresh
Body: { "refreshToken": "OLD_TOKEN" }

Response (401):
{
  "statusCode": 401,
  "message": "Refresh token has been revoked",
  "error": "Unauthorized"
}

# Check database: ALL user's tokens should be revoked (security measure)
```

---

### 3. Test Expiry

```sql
-- Manually expire token in database
UPDATE "RefreshToken"
SET "expiresAt" = NOW() - INTERVAL '1 day'
WHERE token = 'YOUR_REFRESH_TOKEN';

-- Try to refresh
POST /api/v1/auth/refresh
Body: { "refreshToken": "EXPIRED_TOKEN" }

Response (401):
{
  "statusCode": 401,
  "message": "Refresh token expired"
}
```

---

### 4. Automated Test (Jest)

**File**: `src/auth/auth.service.spec.ts`

```typescript
describe('AuthService - Token Refresh', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService, PrismaService, JwtService, ConfigService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should refresh tokens successfully', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@test.com', password: 'hash', role: 'CLIENT' },
    });

    const refreshToken = service.generateRefreshToken(user.id);
    await service.storeRefreshToken(user.id, refreshToken);

    const result = await service.refreshTokens(refreshToken);

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.refreshToken).not.toBe(refreshToken); // Token rotated
    expect(result.user.id).toBe(user.id);
  });

  it('should revoke all tokens on reuse detection', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@test.com', password: 'hash', role: 'CLIENT' },
    });

    const refreshToken = service.generateRefreshToken(user.id);
    await service.storeRefreshToken(user.id, refreshToken);

    // First refresh: success
    await service.refreshTokens(refreshToken);

    // Second refresh with same token: should fail and revoke all
    await expect(service.refreshTokens(refreshToken)).rejects.toThrow();

    // Check all tokens revoked
    const tokens = await prisma.refreshToken.findMany({
      where: { userId: user.id, revokedAt: null },
    });
    expect(tokens).toHaveLength(0);
  });
});
```

---

## 📊 Monitoring & Logging

### Recommended Logs

```typescript
// In auth.service.ts
console.log(`[Auth] ✅ Token refreshed for user ${user.email}`);
console.log(`[Auth] 📊 Active sessions: ${activeCount}`);
console.error(`[Auth] ⚠️ SECURITY: Token reuse detected for user ${userId}`);
console.log(`[Auth] 🧹 Cleaned up ${deleted.count} expired tokens`);
```

### Metrics to Track

- Token refresh rate (per minute/hour)
- Token reuse attempts (security alerts)
- Average token lifetime
- Failed refresh attempts
- Active sessions per user

---

## 🔒 Security Checklist

- [x] Different secrets for access/refresh tokens
- [x] Token rotation on every refresh
- [x] Revoke old token immediately after rotation
- [x] Detect token reuse (revoke all user tokens)
- [x] Store refresh tokens in database (not just JWT)
- [x] Track device info + IP address
- [x] Short access token expiry (15 minutes)
- [x] Reasonable refresh token expiry (7 days)
- [x] Clean up expired tokens regularly
- [x] No authentication required for /auth/refresh endpoint
- [x] Rate limiting on refresh endpoint (optional)

---

## 🚀 Deployment Checklist

### Before Production

1. **Generate Strong Secrets**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Use this for JWT_SECRET

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Use this for JWT_REFRESH_SECRET (different!)
```

2. **Update .env.production**
```env
JWT_SECRET=<GENERATED_SECRET_1>
JWT_REFRESH_SECRET=<GENERATED_SECRET_2>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

3. **Run Database Migration**
```bash
npx prisma migrate deploy
```

4. **Setup Scheduled Token Cleanup**

Create cron job or NestJS scheduled task:

```typescript
// src/auth/auth.scheduler.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from './auth.service';

@Injectable()
export class AuthScheduler {
  constructor(private authService: AuthService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredTokens() {
    console.log('[Scheduler] Running token cleanup...');
    await this.authService.cleanupExpiredTokens();
  }
}
```

5. **Test in Staging First**
   - Test refresh flow with mobile app
   - Verify token rotation works
   - Test security measures (reuse detection)
   - Monitor logs for errors

6. **Enable Rate Limiting** (optional but recommended)

```typescript
// In auth.controller.ts
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
@Post('refresh')
async refresh(@Body() dto: RefreshTokenDto) {
  // ... existing code
}
```

---

## 🐛 Common Issues

### Issue 1: "Invalid refresh token" even with valid token

**Cause**: JWT_REFRESH_SECRET not set or different between environments

**Solution**:
```bash
# Check .env file has JWT_REFRESH_SECRET
# Verify it's loaded: console.log(this.config.get('JWT_REFRESH_SECRET'))
```

---

### Issue 2: Tokens not stored in database

**Cause**: `storeRefreshToken()` not called in login/register

**Solution**: Update all auth methods to store refresh tokens:
```typescript
await this.storeRefreshToken(user.id, refreshToken, deviceInfo, ipAddress);
```

---

### Issue 3: Refresh endpoint requires authentication

**Cause**: Global JWT guard applied to all routes

**Solution**: Make refresh endpoint public:
```typescript
import { Public } from '../decorators/public.decorator';

@Public() // Skip JWT guard
@Post('refresh')
async refresh(@Body() dto: RefreshTokenDto) { ... }
```

---

## 📚 References

- [TOKEN_REFRESH_COMPLETE.md](./TOKEN_REFRESH_COMPLETE.md) - Full documentation
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Token Security](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

## ✅ Completion Criteria

- [ ] Database migration executed (RefreshToken table created)
- [ ] `POST /auth/refresh` endpoint implemented
- [ ] Token rotation working (old token revoked)
- [ ] Security measures in place (reuse detection)
- [ ] Login/register updated to issue refresh tokens
- [ ] Manual testing passed (Postman)
- [ ] Mobile app tested with real endpoint
- [ ] Logs showing successful refreshes
- [ ] Production secrets generated and stored securely
- [ ] Scheduled cleanup task configured

---

**Estimated Time**: 2 hours  
**Priority**: 🔴 HIGH  
**Status**: Ready for implementation
