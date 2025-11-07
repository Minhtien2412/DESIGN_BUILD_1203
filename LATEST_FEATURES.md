# 🆕 Latest Features & Developer Tools

**Last Updated:** November 6, 2025  
**Status:** Production Ready

This document covers the latest features added to the application.

---

## 📋 Table of Contents

1. [Enhanced Notification System](#enhanced-notification-system)
2. [Avatar Management](#avatar-management)
3. [Developer Tools](#developer-tools)
4. [TypeScript Tooling](#typescript-tooling)
5. [Environment Variables](#environment-variables)
6. [Quick Commands](#quick-commands)

---

## 🔔 Enhanced Notification System

A complete notification system with 4 specialized types and real-time updates.

### Features

- **4 Notification Types:**
  - **System** (maintenance, updates, announcements)
  - **Event** (deadlines, meetings, milestones)
  - **Live** (streams, video calls with pulse animation)
  - **Message** (chat, email, SMS with avatars)

- **5 Filter Tabs:** All, System, Event, Live, Message
- **Real-time Updates:** Viewer count simulation (every 3s)
- **15 Sample Notifications** in demo

### Testing

#### Visual Demo (In App)
```bash
npm start
# Navigate: Profile → Developer Tools → Demo Thông Báo (NEW)
```

#### CLI Test
```bash
node scripts/test-notifications-interactive.js
```

### Documentation

- `docs/NOTIFICATION_SYSTEM_ENHANCED.md` - Complete API reference (934 lines)
- `NOTIFICATION_SYSTEM_COMPLETE.md` - Implementation summary (568 lines)
- `TESTING_NOTIFICATIONS.md` - Testing guide (412 lines)
- `TEST_READY.md` - Quick start (216 lines)

### Component Usage

```typescript
import { LiveNotificationCard } from '@/components/notifications';

<LiveNotificationCard
  id="live-001"
  title="Livestream đang diễn ra"
  message="CEO đang chia sẻ kế hoạch Q1"
  liveType="stream"
  priority="high"
  read={false}
  createdAt={new Date().toISOString()}
  isActive={true}
  viewerCount={1234}
  startedAt={new Date(Date.now() - 1800000).toISOString()}
  onPress={() => handlePress()}
/>
```

---

## 👤 Avatar Management

Centralized avatar resolution with cache busting for real-time updates.

### Features

- **`useAvatar` Hook:** Memoized avatar resolution
- **`useCurrentUserAvatar`:** Auto cache-bust for current user
- **Cache Busting:** Avatar changes propagate immediately
- **Fallback System:** Deterministic placeholders via pravatar

### Usage

```typescript
import { useAvatar, useCurrentUserAvatar } from '@/hooks/useAvatar';

// Use specific avatar
const avatarUrl = useAvatar(user?.avatar, {
  userId: user?.id,
  size: 120,
  cacheBust: true
});

// Use current user's avatar (auto cache-bust)
const myAvatarUrl = useCurrentUserAvatar({ size: 120 });
```

### Manual Resolution

```typescript
import { resolveAvatar } from '@/utils/avatar';

const avatarUrl = resolveAvatar(user?.avatar, {
  userId: user?.id,
  nameFallback: user?.name,
  size: 150
});

// Add cache bust manually
const cachedUrl = `${avatarUrl}?v=${Date.now()}`;
```

### Integrated Components

- ✅ `MessageNotificationCard` - Sender avatars
- ✅ `notification-demo.tsx` - All demo avatars
- ✅ `app/(tabs)/profile.tsx` - User profile
- ✅ `app/profile/info.tsx` - Profile edit

---

## 🧪 Developer Tools

Development utilities for debugging and testing.

### Access Points

#### 1. Profile Screen (Recommended)
```bash
npm start
# Navigate: Profile → Developer Tools
```

**Available in __DEV__ mode only:**
- Demo Thông Báo (NEW) - Notification system demo
- API Diagnostics - Backend health check

#### 2. Long-press Avatar (Future)
Long-press on profile avatar will open diagnostics screen.

### API Diagnostics Screen

Path: `/utilities/api-diagnostics`

**Features:**
- Backend connectivity check
- Response time measurement
- Error details display
- Raw payload inspection

**Access:**
- Profile → Developer Tools → API Diagnostics
- Direct navigation: `router.push('/utilities/api-diagnostics')`

---

## 🔧 TypeScript Tooling

Improved type checking focused on active app code.

### New Scripts

```bash
# Check only active app code (excludes archived, tests, scripts, server)
npm run typecheck:app

# Check everything (original)
npm run typecheck
```

### Configuration

- **`tsconfig.app.json`** - Scoped config for app code only
- **Excludes:**
  - `_archived/**` - Backup files
  - `__tests__/**` - Test files
  - `scripts/**` - Build scripts
  - `server/**` - Backend code
  - `backend-implementation/**`

### Purpose

- ✅ Faster type checking
- ✅ Focus on production code
- ✅ Easier debugging (no noise from archived code)

### Known Issues

Running `npm run typecheck:app` reveals ~30+ type errors in admin screens:
- Button `title` prop missing (using `children` instead)
- Capability type mismatches
- Button variant type issues (`"default"`, `"destructive"`, `"outline"` not in union)

These are existing issues now visible with scoped type checking.

---

## 🌐 Environment Variables

Configure app behavior via environment variables.

### Available Variables

```bash
# .env or app.config.ts extra field

# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://your-backend.com
EXPO_PUBLIC_API_TIMEOUT=30000

# Backoff Configuration (retry logic)
EXPO_PUBLIC_BACKOFF_BASE_MS=1000
EXPO_PUBLIC_BACKOFF_JITTER_MS=300

# Feature Flags
EXPO_PUBLIC_ENABLE_DEV_TOOLS=true
```

### Usage in Code

```typescript
import Constants from 'expo-constants';

const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl 
  || 'http://localhost:3000';

const apiTimeout = Constants.expoConfig?.extra?.apiTimeout 
  || 30000;
```

### app.config.ts Example

```typescript
export default {
  expo: {
    // ... other config
    extra: {
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      apiTimeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
      backoffBaseMs: parseInt(process.env.EXPO_PUBLIC_BACKOFF_BASE_MS || '1000'),
      backoffJitterMs: parseInt(process.env.EXPO_PUBLIC_BACKOFF_JITTER_MS || '300'),
    }
  }
};
```

---

## ⚡ Quick Commands

### Development

```bash
# Start development server
npm start

# Start with cache clear
npm run clean:cache

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run in web browser
npm run web
```

### Type Checking

```bash
# Type check app code only (fast)
npm run typecheck:app

# Type check everything (slow)
npm run typecheck

# Lint code
npm run lint
```

### Testing

```bash
# Test notification system (CLI)
node scripts/test-notifications-interactive.js

# Start mock API server
npm run mock-server
```

### Media

```bash
# Generate video manifest
npm run videos:generate

# Check media sizes
npm run media:check

# Compress video
npm run compress:video
```

### Build

```bash
# Build for Android (dev)
npm run build:dev:android

# Build for iOS (dev)
npm run build:dev:ios

# Setup dev build
npm run setup:dev-build
```

---

## 📊 Unread Counts System

Intelligent unread count management with fallback and auto-recovery.

### Features

- ✅ Fallback to local counts when backend unavailable
- ✅ 10-minute re-probe interval (exponential backoff)
- ✅ Auto-recovery when backend deploys endpoint
- ✅ Tab bar badges show accurate counts

### Hooks

```typescript
import { useUnreadCounts } from '@/hooks/useUnreadCounts';

const { 
  notificationCount, 
  messageCount, 
  callCount, 
  loading 
} = useUnreadCounts();
```

### Individual Hooks

```typescript
import { useMessageUnreadCount } from '@/hooks/useMessageUnreadCount';
import { useCallUnreadCount } from '@/hooks/useCallUnreadCount';

const messageCount = useMessageUnreadCount();
const callCount = useCallUnreadCount();
```

---

## 🐛 Troubleshooting

### Notification Demo Not Showing

**Problem:** Developer Tools section not visible in Profile  
**Solution:**  
1. Ensure you're in development mode (`__DEV__` is true)
2. Restart Expo: `npm run clean:cache && npm start`
3. Check Profile screen has latest code

### Type Check Errors

**Problem:** `npm run typecheck:app` shows many errors  
**Solution:**  
These are existing issues in admin screens. To fix:
1. Add `title` prop to Button components (replace `children`)
2. Fix Capability type casts
3. Update ButtonVariant union type to include `"default"`, `"destructive"`, `"outline"`

### Avatar Not Updating

**Problem:** Avatar changes don't reflect immediately  
**Solution:**  
Use `useAvatar` hook with `cacheBust: true` or append `?v=${Date.now()}` manually.

---

## 📚 Additional Documentation

- **Notification System:** `docs/NOTIFICATION_SYSTEM_ENHANCED.md`
- **Implementation Summary:** `IMPLEMENTATION_COMPLETE.md`
- **Project Structure:** `PROJECT_STRUCTURE.md`
- **Testing Guide:** `TESTING_NOTIFICATIONS.md`
- **All Docs Index:** `docs/README.md`

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Run type check: `npm run typecheck:app`
3. Test changes: Visual demo + CLI test
4. Commit: `git commit -m "feat: your feature"`
5. Push: `git push origin feature/your-feature`
6. Create Pull Request

---

## 📝 Changelog

### [1.1.0] - 2025-11-06

**Added:**
- Enhanced notification system (4 types + demo)
- Avatar management hooks (`useAvatar`, `useCurrentUserAvatar`)
- Developer Tools section in Profile (dev mode only)
- TypeScript scoped config (`tsconfig.app.json`)
- `npm run typecheck:app` script
- Environment variable documentation

**Updated:**
- `MessageNotificationCard` - Uses `resolveAvatar` with cache bust
- `notification-demo.tsx` - All avatars use `resolveAvatar`
- `IMPLEMENTATION_COMPLETE.md` - Added new features section

**Fixed:**
- Avatar caching issues (cache bust implemented)
- Type checking noise from archived code (scoped config)

---

**For more information, see:** `IMPLEMENTATION_COMPLETE.md` and `docs/`
