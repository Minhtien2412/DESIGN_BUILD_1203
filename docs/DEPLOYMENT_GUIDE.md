# Deployment Guide - Construction Manager Pro

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Build Configuration](#build-configuration)
3. [iOS Deployment](#ios-deployment)
4. [Android Deployment](#android-deployment)
5. [Beta Testing](#beta-testing)
6. [Store Submission](#store-submission)
7. [Post-Launch Monitoring](#post-launch-monitoring)

---

## Pre-Deployment Checklist

### Code Quality ✅
- [ ] All TypeScript errors resolved (`npx tsc --noEmit`)
- [ ] No console.log statements in production code
- [ ] All TODO comments addressed or documented
- [ ] Error boundaries implemented for all major screens
- [ ] Loading states implemented for all async operations
- [ ] Empty states designed for all list screens

### Performance ✅
- [ ] Bundle size analyzed and optimized (<50MB)
- [ ] Images optimized (WebP format, compressed)
- [ ] Lazy loading implemented for heavy components
- [ ] FlatList optimization applied (removeClippedSubviews, etc.)
- [ ] Memory leaks checked and fixed
- [ ] Startup time < 3 seconds

### Security ✅
- [ ] API keys moved to environment variables
- [ ] Sensitive data stored in SecureStore
- [ ] HTTPS enforced for all network requests
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] Password strength validation implemented

### Testing ✅
- [ ] Unit tests passing (>80% coverage for critical services)
- [ ] Integration tests passing (API flows, auth, payments)
- [ ] Manual testing completed on iOS and Android
- [ ] Payment flows tested (MoMo, VNPay, Stripe)
- [ ] Offline functionality tested
- [ ] Different screen sizes tested

### Content & Legal ✅
- [ ] Privacy Policy created and linked
- [ ] Terms of Service created and linked
- [ ] App icon designed (1024x1024 for iOS, adaptive for Android)
- [ ] Splash screen designed
- [ ] Store screenshots prepared (5-8 per platform)
- [ ] Store description written (Vietnamese + English)
- [ ] App demo video recorded (30-60 seconds)

---

## Build Configuration

### Environment Variables

Create `.env.production`:
```bash
API_URL=https://baotienweb.cloud
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY
SENTRY_DSN=YOUR_SENTRY_DSN
```

### EAS Configuration

Install EAS CLI:
```bash
npm install -g eas-cli
eas login
```

Configure `eas.json`:
```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-id",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## iOS Deployment

### 1. Prerequisites
- Apple Developer Account ($99/year)
- Xcode installed (latest version)
- Valid provisioning profiles
- App Store Connect access

### 2. Configure iOS Build

Update `app.config.production.js`:
```javascript
ios: {
  bundleIdentifier: 'com.baotienweb.constructionmanager',
  buildNumber: '1',
  infoPlist: {
    NSCameraUsageDescription: 'Access camera for site photos',
    NSPhotoLibraryUsageDescription: 'Access photos for documentation',
    NSLocationWhenInUseUsageDescription: 'Track equipment locations',
  },
}
```

### 3. Build for iOS

```bash
# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Wait for build to complete (15-30 minutes)
```

### 4. Submit to App Store

```bash
# Submit build
eas submit --platform ios --latest

# Or manually via Xcode/App Store Connect
```

### 5. App Store Connect Setup

1. **App Information**:
   - Name: Construction Manager Pro
   - Subtitle: Professional Construction Management
   - Category: Business/Productivity
   - Content Rights: App contains third-party content

2. **Pricing**:
   - Free with in-app purchases (optional)
   - Or paid app ($4.99-$9.99)

3. **App Review Information**:
   - Demo account credentials
   - Notes for reviewer
   - Contact information

4. **Version Information**:
   - Screenshots (6.5" iPhone, 12.9" iPad)
   - App preview video (30 seconds)
   - Description (4000 chars max)
   - Keywords (100 chars max)
   - Support URL
   - Marketing URL

### 6. Screenshots Required

**iPhone 6.5" (1242 x 2688)**:
1. Dashboard with project statistics
2. Project detail with timeline
3. AI chatbot conversation
4. Fleet management screen
5. Analytics dashboard

**iPad Pro 12.9" (2048 x 2732)**:
1. Dashboard (landscape)
2. Project management (split view)
3. Document management

---

## Android Deployment

### 1. Prerequisites
- Google Play Developer Account ($25 one-time)
- Android Studio installed
- Signing key generated

### 2. Generate Signing Key

```bash
# Generate upload key
keytool -genkeypair -v -storetype PKCS12 \
  -keystore construction-manager-upload.keystore \
  -alias construction-manager \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Store credentials securely
```

### 3. Configure Android Build

Update `app.config.production.js`:
```javascript
android: {
  package: 'com.baotienweb.constructionmanager',
  versionCode: 1,
  permissions: [
    'CAMERA',
    'READ_EXTERNAL_STORAGE',
    'WRITE_EXTERNAL_STORAGE',
    'ACCESS_FINE_LOCATION',
  ],
}
```

### 4. Build for Android

```bash
# Build AAB (Android App Bundle)
eas build --platform android --profile production

# Build APK for testing
eas build --platform android --profile preview
```

### 5. Submit to Google Play

```bash
# Create service account in Google Play Console
# Download JSON key

# Submit build
eas submit --platform android --latest \
  --service-account-key-path ./google-play-service-account.json
```

### 6. Google Play Console Setup

1. **App Content**:
   - Privacy Policy URL
   - App access (provide demo account)
   - Ads declaration (no ads)
   - Content rating questionnaire

2. **Store Listing**:
   - App name: Construction Manager Pro
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (phone + tablet)
   - Feature graphic (1024 x 500)
   - App icon (512 x 512)

3. **Release**:
   - Internal testing → Closed testing → Open testing → Production
   - Rollout percentage (10% → 50% → 100%)

### 7. Screenshots Required

**Phone (1080 x 1920)**:
- Minimum 2, maximum 8 screenshots
- Same scenes as iOS

**Tablet (1200 x 1920)**:
- Minimum 1, maximum 8 screenshots
- Landscape layouts

---

## Beta Testing

### iOS TestFlight

```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Add testers in App Store Connect
# Share TestFlight link
```

**Beta Test Plan**:
- Duration: 2 weeks
- Testers: 50-100 users (mix of engineers, admins, contractors)
- Focus areas:
  - Payment flows
  - Offline functionality
  - Performance on older devices
  - Battery consumption

### Android Internal Testing

```bash
# Upload to internal track
eas submit --platform android --profile preview
```

**Test Distribution**:
- Internal testers: 10-20 team members
- Closed testing: 50-100 external testers
- Open testing: Public beta (optional)

### Feedback Collection

Create feedback form:
- Bugs encountered
- Performance issues
- Feature requests
- Usability problems
- Overall satisfaction (1-5 stars)

---

## Store Submission

### App Store Review Guidelines

**Approval Tips**:
1. Provide demo account with full access
2. Clear instructions in "Notes for Reviewer"
3. Respond quickly to review feedback
4. Explain any unusual permissions

**Common Rejection Reasons**:
- Crashes on launch
- Missing required functionality
- Incomplete metadata
- Unclear privacy policy
- Unresponsive UI

**Review Timeline**:
- Average: 1-2 days
- Complex apps: 3-7 days
- Appeals: 1-2 weeks

### Google Play Review

**Faster Approval**:
- Internal testing first (immediate)
- Closed testing (1-2 days)
- Production (1-3 days)

**Common Issues**:
- Missing content rating
- Incomplete store listing
- Policy violations
- Technical issues

---

## Post-Launch Monitoring

### Analytics Setup

**Sentry Integration**:
```bash
npm install @sentry/react-native

# Configure in app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
});
```

**Google Analytics**:
```bash
npm install @react-native-firebase/analytics
```

### Key Metrics to Monitor

**Technical**:
- Crash-free rate (target: >99%)
- App startup time (target: <3s)
- API response times (target: <2s)
- Memory usage (target: <200MB)
- Battery consumption

**Business**:
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Retention rate (Day 1, Day 7, Day 30)
- Feature adoption rates
- Payment conversion rate

### Update Strategy

**Version Numbering**:
- Major: 1.0.0 (breaking changes)
- Minor: 1.1.0 (new features)
- Patch: 1.0.1 (bug fixes)

**Release Cadence**:
- Hot fixes: As needed (critical bugs)
- Patches: Every 1-2 weeks
- Features: Every 4-6 weeks
- Major: Every 6-12 months

### Support Channels

1. **In-App Support**:
   - Help center / FAQ
   - Contact form
   - Live chat (optional)

2. **Email Support**:
   - support@baotienweb.cloud
   - Response time: <24 hours

3. **Social Media**:
   - Facebook page
   - LinkedIn company page

---

## Launch Checklist

### Week Before Launch
- [ ] Final round of testing
- [ ] Beta feedback addressed
- [ ] Store listings finalized
- [ ] Marketing materials ready
- [ ] Support team trained
- [ ] Monitoring tools configured

### Launch Day
- [ ] Submit to stores
- [ ] Announce on social media
- [ ] Email existing customers
- [ ] Monitor crash reports
- [ ] Respond to reviews
- [ ] Track downloads

### First Week
- [ ] Daily monitoring
- [ ] Quick bug fixes
- [ ] Collect user feedback
- [ ] Adjust marketing strategy
- [ ] Plan first update

---

## Budget Estimates

### Development Costs
- Apple Developer Account: $99/year
- Google Play Developer Account: $25 (one-time)
- Backend hosting (VPS): $20-50/month
- SSL certificates: Free (Let's Encrypt)
- Sentry: $26/month (basic plan)
- Total first year: ~$500-800

### Marketing Budget (Optional)
- App Store Optimization: $500-1000
- Social media ads: $500-2000/month
- PR/Press releases: $500-1500
- Total first month: $1500-4500

---

## Success Criteria

### Technical Success
- ✅ Crash-free rate >99%
- ✅ Average rating >4.0 stars
- ✅ App size <50MB
- ✅ Cold start time <3s
- ✅ API response time <2s

### Business Success
- 📊 1,000+ downloads in first month
- 📊 20% Day-7 retention rate
- 📊 10% paid conversion (if freemium)
- 📊 50+ positive reviews
- 📊 Featured in "New Apps" (App Store)

---

## Emergency Contacts

**Technical Issues**:
- Backend: ops@baotienweb.cloud
- Frontend: dev@baotienweb.cloud

**App Store Issues**:
- Apple: developer.apple.com/support
- Google: support.google.com/googleplay

**Payment Issues**:
- Stripe: support@stripe.com
- MoMo: support@momo.vn
- VNPay: support@vnpay.vn

---

**Last Updated**: December 25, 2025  
**Version**: 1.0  
**Next Review**: After first 1000 users
