# EAS Build Troubleshooting Guide

**Status**: 8 build attempts - All failed at "Install dependencies" phase

## 🔍 Build History

| Build ID | Profile | Status | Duration | Fixes Applied |
|----------|---------|--------|----------|---------------|
| 39667fd7 | production | ❌ Failed | 1m 16s | Initial build |
| 3472ec98 | preview | ❌ Failed | 1m 19s | Updated 29 packages |
| 89e03a7f | production | ❌ Failed | ~1m | Firebase moved to deps |
| 3e0f2e19 | production | ❌ Failed | ~1m | --clear-cache |
| b85825cf | production | ❌ Failed | ~1m | Fixed zod 4.x → 3.23.8 |
| ba3d2755 | production | ❌ Failed | ~1m | Removed server packages |
| 496c51df | preview | ❌ Failed | 1m 15s | All cleanup |
| 608c7026 | preview | ❌ Failed | ~1m | Added pre-install hook |

## ❌ Consistent Error

```
Unknown error. See logs of the Install dependencies build phase for more information.
```

All builds fail during `npm install` on EAS servers.

## 🎯 Root Causes Identified

### 1. **Incompatible Packages (FIXED)**
- ✅ **zod**: 4.1.12 → 3.23.8 (v4 doesn't exist)
- ✅ **tsx**: Removed (server-side only)
- ✅ **bcryptjs, jsonwebtoken, node-fetch**: Removed (Node.js only)
- ✅ **Firebase packages**: Removed (not needed)
- ✅ **@types packages**: Orphaned types removed

### 2. **Postinstall Script** (POTENTIAL ISSUE)
```json
"postinstall": "node scripts/patch-expo-router-assets.js"
```
- Runs after every `npm install`
- May fail on EAS build environment
- Patches expo-router asset paths

### 3. **React Native Version** (CHECKED - OK)
- Current: 0.81.5
- Actually compatible with Expo SDK 54
- No changes needed

### 4. **Package Count** (OPTIMIZED)
- Before: 1,408 packages
- After cleanup: 1,312 packages
- Removed: 96 packages

## 💡 Recommended Solutions

### Option 1: Debug with Verbose Logs (RECOMMENDED)

Add to `eas.json`:
```json
{
  "build": {
    "preview": {
      "env": {
        "NPM_CONFIG_LOGLEVEL": "verbose"
      }
    }
  }
}
```

Then run:
```bash
npx eas-cli build --platform android --profile preview
```

This will provide detailed npm install logs.

### Option 2: Skip Postinstall Temporarily

Modify `package.json`:
```json
{
  "scripts": {
    "postinstall": "node scripts/patch-expo-router-assets.js || true"
  }
}
```

The `|| true` ensures build continues even if script fails.

### Option 3: Use Development Build Locally

1. Install Java JDK 17:
   - Download: https://adoptium.net/temurin/releases/?version=17
   - Set JAVA_HOME environment variable

2. Build locally:
   ```bash
   npx eas-cli build --platform android --local
   ```

3. This shows real-time errors for debugging.

### Option 4: Minimal Package Test

Create a temporary minimal `package.json` to isolate the problematic package:

1. Backup current package.json
2. Remove all optional dependencies
3. Keep only core Expo + React Native
4. Test build
5. Add packages back one by one

### Option 5: Use Different Build Worker

Add to `eas.json`:
```json
{
  "build": {
    "preview": {
      "node": "20.18.1",
      "resourceClass": "large"
    }
  }
}
```

Larger resource class may have better network/timeout handling.

## 🔧 Debugging Checklist

- [x] Updated all packages to SDK 54 compatible versions
- [x] Removed incompatible packages (zod 4.x, server packages)
- [x] Cleared npm cache
- [x] Deleted package-lock.json
- [x] Removed Firebase packages
- [x] Added pre-install hook
- [ ] Enable verbose npm logging
- [ ] Test with postinstall disabled
- [ ] Try local EAS build
- [ ] Test minimal package.json
- [ ] Try different build worker size

## 📊 Current Package Status

**Dependencies**: 1,312 packages
**Vulnerabilities**: 1 moderate

Key packages:
- expo: ~54.0.27 ✅
- react-native: 0.81.5 ✅
- react: 19.1.0 ✅
- expo-router: ~6.0.17 ✅

## 🚀 Working Alternative: Expo Go

While debugging EAS builds, use Expo Go for development testing:

```bash
npm start
```

Then scan QR code with Expo Go app (iOS/Android).

**Benefits**:
- ✅ Free
- ✅ Instant testing
- ✅ Hot reload
- ✅ 90% of features work

**Limitations**:
- ❌ Some native modules unavailable
- ❌ Cannot test custom native code
- ❌ Not for production distribution

## 📱 Production Deployment Options

Since EAS builds are failing, consider alternatives:

### 1. **Firebase App Distribution** (Recommended)
- FREE forever
- Unlimited testers
- Easy web upload
- Email invitations
- Requires local APK build (needs Java)

See: `docs/FIREBASE_APP_DISTRIBUTION_GUIDE.md`

### 2. **TestFlight (iOS)** 
- FREE
- Built into App Store Connect
- Requires Apple Developer ($99/year)
- Best for iOS testing

### 3. **Google Play Internal Testing**
- FREE
- Built into Play Console
- Requires Google Play Developer ($25 one-time)
- Best for Android testing

### 4. **Direct APK Distribution**
- Build locally with Gradle
- Share APK file directly
- No platform fees
- Requires Java JDK setup

## 🎯 Next Steps

1. **Enable verbose logging** in eas.json
2. **Run build** and capture full logs
3. **Search logs** for specific npm error
4. **Fix specific package** causing issue
5. **Rebuild** and verify

OR

1. **Setup Java JDK** (if not installed)
2. **Build locally** with `--local` flag
3. **See real-time errors**
4. **Fix immediately**
5. **Upload to Firebase** App Distribution

## 📞 Support Resources

- **Expo Forums**: https://forums.expo.dev
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Discord**: https://discord.gg/expo
- **Stack Overflow**: Tag `expo` + `eas-build`

## 🔗 Related Guides

- `EXPO_BUILD_DEPLOYMENT_GUIDE.md` - Complete EAS Build reference
- `FIREBASE_APP_DISTRIBUTION_GUIDE.md` - Firebase deployment (free)
- `BAO_CAO_DU_AN_CHI_TIET.md` - Project status report

---

**Last Updated**: December 9, 2025
**Status**: Debugging in progress - 8 failed builds
**Current Solution**: Using Expo Go for development testing
