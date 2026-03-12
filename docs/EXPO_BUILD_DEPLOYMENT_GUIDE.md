# 📱 EXPO BUILD & DEPLOYMENT GUIDE
## APP DESIGN BUILD - Production Deployment

**Ngày tạo:** 09/12/2025  
**Platform:** React Native + Expo  
**Build Service:** EAS Build

---

## 📋 MỤC LỤC

1. [Build Status](#build-status)
2. [Prerequisites](#prerequisites)
3. [Build Commands](#build-commands)
4. [Troubleshooting](#troubleshooting)
5. [Deployment Steps](#deployment-steps)

---

## 🎯 BUILD STATUS

### Latest Build
- **Build ID:** `39667fd7-07d7-4181-b9e6-3953980661b2`
- **Status:** ❌ Errored
- **Platform:** Android
- **Profile:** production
- **SDK:** 54.0.0
- **Started:** 11:13:04 9/12/2025
- **Finished:** 11:14:20 9/12/2025
- **Logs:** [View Logs](https://expo.dev/accounts/adminmarketingnx/projects/APP_DESIGN_BUILD/builds/39667fd7-07d7-4181-b9e6-3953980661b2)

### Build History
```
✅ Development builds: Working
❌ Production Android: Error
❌ Production iOS: Apple Developer account required
```

---

## 🔧 PREREQUISITES

### 1. Expo Account
```bash
# Login to Expo
npx expo login

# Verify account
npx eas whoami
```

✅ **Account:** adminmarketingnx  
✅ **Project:** APP_DESIGN_BUILD

### 2. EAS CLI
```bash
# Install globally
npm install -g eas-cli

# Or use npx
npx eas-cli --version
```

### 3. Android Requirements
- ✅ **Keystore:** Configured (Build Credentials e97dmV826M)
- ✅ **Remote credentials:** Active
- ✅ **Signing:** Automatic via EAS

### 4. iOS Requirements (Pending)
- ❌ **Apple Developer Account:** Not registered
- ❌ **Cost:** $99/year
- ❌ **Register:** https://developer.apple.com/register/
- ❌ **Provisioning Profile:** Not created
- ❌ **Distribution Certificate:** Not created

---

## 🚀 BUILD COMMANDS

### Development Build
```bash
# Development build for testing
npx eas-cli build --profile development --platform all
```

### Preview Build
```bash
# Preview build (internal distribution)
npx eas-cli build --profile preview --platform android
```

### Production Build

#### Android Only
```bash
# Production APK + AAB
npx eas-cli build --profile production --platform android
```

#### iOS Only (requires Apple Developer)
```bash
# Production IPA
npx eas-cli build --profile production --platform ios
```

#### Both Platforms
```bash
# Build Android + iOS simultaneously
npx eas-cli build --profile production --platform all
```

---

## 🔍 MONITORING BUILDS

### Check Build Status
```bash
# List all builds
npx eas-cli build:list

# View specific build
npx eas-cli build:view <build-id>
```

### View Logs
```bash
# Open build logs in browser
npx eas-cli build:view --build-id 39667fd7-07d7-4181-b9e6-3953980661b2
```

### Web Dashboard
- **URL:** https://expo.dev
- **Project:** https://expo.dev/accounts/adminmarketingnx/projects/APP_DESIGN_BUILD
- **Builds:** https://expo.dev/accounts/adminmarketingnx/projects/APP_DESIGN_BUILD/builds

---

## ❌ TROUBLESHOOTING

### Common Build Errors

#### 1. Android Build Failed
**Error:** Build exits with code 1

**Possible Causes:**
- Gradle configuration issues
- Dependency conflicts
- Out of memory
- Native module compilation errors

**Solutions:**
```bash
# 1. Clean project
cd android
./gradlew clean
cd ..

# 2. Clear Metro cache
npx expo start --clear

# 3. Reinstall dependencies
rm -rf node_modules
npm install

# 4. Update EAS CLI
npm install -g eas-cli@latest

# 5. Check eas.json configuration
cat eas.json
```

#### 2. iOS Build Failed - Apple Developer Required
**Error:** "You are not registered as an Apple Developer"

**Solution:**
1. Visit https://developer.apple.com/register/
2. Enroll in Apple Developer Program ($99/year)
3. Wait for approval (can take 24-48 hours)
4. Re-run build command

#### 3. Environment Variables Not Loaded
**Error:** "No environment variables found"

**Solution:**
```bash
# Check eas.json
# Ensure production profile has env variables

{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  }
}
```

#### 4. Certificate/Keystore Issues
**Error:** "Invalid keystore" or "Certificate expired"

**Solution:**
```bash
# Reset credentials
npx eas-cli credentials

# Let EAS manage credentials automatically
npx eas-cli build --platform android --auto-submit
```

---

## 📦 DEPLOYMENT STEPS

### ANDROID - Google Play Store

#### Step 1: Complete Build
```bash
# Build production AAB
npx eas-cli build --profile production --platform android

# Wait for build to complete (10-15 minutes)
# You'll receive email notification
```

#### Step 2: Download Build
```bash
# Download AAB file
npx eas-cli build:download --build-id <build-id>

# Or download from web dashboard
# https://expo.dev/accounts/adminmarketingnx/projects/APP_DESIGN_BUILD/builds
```

#### Step 3: Google Play Console Setup
1. **Create App:**
   - Go to https://play.google.com/console
   - Click "Create App"
   - Fill in app details:
     * App name: Design Build
     * Default language: Vietnamese
     * App category: Business
     * Developer email: minhtienkg2412@gmail.com

2. **Upload AAB:**
   - Navigate to "Production" → "Create new release"
   - Upload the AAB file
   - Fill in release notes
   - Set version: 1.0.0 (1)

3. **Complete App Listing:**
   - **Short description:** (4000 characters max)
   - **Full description:** (4000 characters max)
   - **App icon:** 512x512px
   - **Feature graphic:** 1024x500px
   - **Screenshots:**
     * Phone: At least 2 screenshots (1080x1920px or higher)
     * Tablet: Optional but recommended
   - **Privacy Policy URL:** Required
   - **Support email:** minhtienkg2412@gmail.com

4. **Content Rating:**
   - Complete questionnaire
   - Select appropriate rating

5. **Pricing & Distribution:**
   - Free or Paid
   - Select countries
   - Accept Google Play policies

#### Step 4: Submit for Review
- Review all sections
- Submit for review
- Wait 1-7 days for approval

---

### iOS - App Store (Pending Apple Developer)

#### Step 1: Enroll in Apple Developer Program
1. Visit https://developer.apple.com/programs/enroll/
2. Pay $99/year fee
3. Wait for approval (24-48 hours)

#### Step 2: Complete Build
```bash
# After Apple Developer account is active
npx eas-cli build --profile production --platform ios
```

#### Step 3: App Store Connect Setup
1. **Create App:**
   - Go to https://appstoreconnect.apple.com
   - Click "My Apps" → "+"
   - Fill in app details:
     * Bundle ID: com.adminmarketingnx.appdesignbuild
     * SKU: APP_DESIGN_BUILD_001
     * App name: Design Build

2. **Upload IPA:**
   - EAS will automatically upload to TestFlight
   - Or manually upload via Xcode/Transporter

3. **Complete App Information:**
   - **Name:** Design Build
   - **Subtitle:** (30 characters max)
   - **Description:** (4000 characters max)
   - **Keywords:** (100 characters max, comma-separated)
   - **Support URL:** Required
   - **Marketing URL:** Optional
   - **Privacy Policy URL:** Required

4. **Screenshots & Media:**
   - **iPhone Screenshots:** Required for all sizes
     * 6.7" Display: 1290x2796px (at least 3)
     * 6.5" Display: 1242x2688px
     * 5.5" Display: 1242x2208px
   - **iPad Screenshots:** Optional but recommended
   - **App Preview Videos:** Optional (15-30 seconds)

5. **Age Rating:**
   - Complete questionnaire
   - Select appropriate rating

6. **Pricing & Availability:**
   - Free or Paid
   - Select countries
   - Pre-order availability

#### Step 4: Submit for Review
- Build must pass TestFlight testing
- Submit for App Store review
- Wait 1-7 days for approval

---

## 🎯 POST-DEPLOYMENT

### Monitor App Performance
- **Google Play Console:** https://play.google.com/console
- **App Store Connect:** https://appstoreconnect.apple.com
- **Expo Analytics:** https://expo.dev

### Update App
```bash
# 1. Update version in app.json
# {
#   "expo": {
#     "version": "1.0.1",
#     "android": {
#       "versionCode": 2
#     },
#     "ios": {
#       "buildNumber": "2"
#     }
#   }
# }

# 2. Build new version
npx eas-cli build --profile production --platform all

# 3. Submit to stores
npx eas-cli submit --platform android
npx eas-cli submit --platform ios
```

---

## 📊 BUILD PROFILES (eas.json)

### Current Configuration
```json
{
  "cli": {
    "version": ">= 13.2.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "production": {
      "distribution": "store",
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      },
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🔐 SECURITY CHECKLIST

Before Production Release:
- [ ] Remove all console.log statements
- [ ] Remove debug code
- [ ] Update API URLs to production
- [ ] Enable ProGuard (Android obfuscation)
- [ ] Enable Bitcode (iOS optimization)
- [ ] Verify SSL certificate pinning
- [ ] Check environment variables
- [ ] Review app permissions
- [ ] Test on real devices
- [ ] Enable crash reporting (Sentry)
- [ ] Setup analytics (Firebase/Mixpanel)

---

## 📞 SUPPORT & RESOURCES

### Official Documentation
- **Expo Docs:** https://docs.expo.dev
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **EAS Submit:** https://docs.expo.dev/submit/introduction/
- **App Store Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Google Play Policies:** https://play.google.com/about/developer-content-policy/

### Contact
- **Developer:** minhtienkg2412@gmail.com
- **Expo Account:** adminmarketingnx
- **Project URL:** https://expo.dev/accounts/adminmarketingnx/projects/APP_DESIGN_BUILD

---

## 🎉 CURRENT STATUS SUMMARY

### ✅ Completed
- [x] Expo project initialized
- [x] EAS Build configured
- [x] Android keystore created
- [x] Remote credentials setup
- [x] Development builds working
- [x] Week 2 Construction Map complete (14 components, 5,929 lines)

### 🔄 In Progress
- [ ] Fix Android production build error
- [ ] Debug build logs
- [ ] Resolve dependency issues

### ⏳ Pending
- [ ] Register Apple Developer account ($99)
- [ ] iOS production build
- [ ] App Store submission
- [ ] Google Play submission
- [ ] Production deployment

---

**Last Updated:** 09/12/2025 11:20 AM  
**Next Action:** Check build logs và fix Android build error
