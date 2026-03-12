# 📱 Mobile App vs Web Checklist - Feature Mapping

> **Current Project:** React Native + Expo (Mobile App)  
> **Web Checklist:** React Web App Features

This document maps the Web Frontend Checklist to what already exists (or should be added) in the current **React Native mobile app**.

---

## ✅ IMPLEMENTED IN MOBILE APP

### 🟢 **Authentication (PHASE 1)** - PARTIALLY DONE

**Existing:**
- ✅ AuthContext (`contexts/auth/AuthContext.tsx`)
- ✅ AuthProvider with signIn, signUp, signOut
- ✅ Token storage using SecureStore (`utils/storage.ts`)
- ✅ Protected routes (via AuthContext)
- ✅ Login/Register forms (basic)

**Missing:**
- ❌ OAuth (Google/Apple) integration
- ❌ Forgot password flow
- ❌ Email verification
- ❌ Biometric authentication (Touch ID/Face ID)
- ❌ Auto token refresh interceptor

**Mobile-Specific:**
- 📱 Use `expo-auth-session` for OAuth
- 📱 Use `expo-local-authentication` for biometrics
- 📱 Store tokens in `expo-secure-store`

---

### 🟢 **Shopping Features (PHASE 2 equivalent)** - DONE

**Existing:**
- ✅ Product listing (PRODUCTS data)
- ✅ ProductCard component (modern design)
- ✅ FeaturedProducts carousel
- ✅ CategoryPills filter
- ✅ HeroBanner with auto-carousel
- ✅ Cart functionality (CartContext)
- ✅ Add to cart, increment, decrement
- ✅ Product search (basic)

**Missing:**
- ❌ Product filtering (by price, category, etc.)
- ❌ Product sorting (price, name, newest)
- ❌ Wishlist persistence
- ❌ Product reviews & ratings
- ❌ Share product functionality

---

### 🟡 **Payments (PHASE 3)** - NOT IMPLEMENTED

**Current Status:** No payment integration

**Mobile Implementation Path:**
```typescript
// For Vietnam market - prioritize:
1. Momo SDK (expo-linking for deep links)
2. VNPay SDK
3. ZaloPay SDK
4. Stripe (international)

// Example: Momo integration
import * as Linking from 'expo-linking';

async function payWithMomo(amount: number, orderId: string) {
  const deepLink = `momo://payment?amount=${amount}&orderId=${orderId}`;
  await Linking.openURL(deepLink);
  
  // Listen for callback
  Linking.addEventListener('url', handleMomoCallback);
}
```

**Components Needed:**
- [ ] PaymentMethodSelector
- [ ] PaymentWebView (for web-based gateways)
- [ ] PaymentSuccess screen
- [ ] PaymentFailed screen
- [ ] OrderHistory screen

---

### 🔴 **Real-time Features (PHASE 5-6)** - NOT IMPLEMENTED

**Current Status:** 
- ✅ Socket.IO client setup exists in codebase
- ❌ No active chat/messaging implementation
- ❌ No video call integration

**Mobile-Specific Considerations:**
```typescript
// Chat (use react-native-gifted-chat)
npm install react-native-gifted-chat

// Video (LiveKit has React Native SDK)
npm install @livekit/react-native
npm install @livekit/react-native-webrtc

// Push Notifications
npm install expo-notifications
```

**Components Needed:**
- [ ] ChatList screen
- [ ] ChatRoom screen
- [ ] MessageBubble component
- [ ] VideoCallScreen
- [ ] IncomingCallModal

---

### 🟡 **Dashboard/Analytics (PHASE 7)** - PARTIAL

**Existing:**
- ✅ Basic home screen with stats
- ✅ Product categories overview

**Missing:**
- ❌ Revenue charts
- ❌ Project statistics
- ❌ Analytics dashboard
- ❌ Admin panel

**Mobile Charts:**
```bash
# Victory Native for React Native charts
npm install victory-native react-native-svg
```

---

### 🟢 **Notifications (PHASE 8)** - PARTIAL

**Existing:**
- ✅ Notifications tab/screen exists
- ⚠️ Limited functionality

**Mobile Implementation:**
```typescript
// Expo Notifications
import * as Notifications from 'expo-notifications';

// 1. Request permission
const { status } = await Notifications.requestPermissionsAsync();

// 2. Get push token
const token = (await Notifications.getExpoPushTokenAsync()).data;

// 3. Send to backend
await api.post('/users/device-token', { token });

// 4. Listen for notifications
Notifications.addNotificationReceivedListener(notification => {
  // Update badge count, show in-app alert
});
```

**Components Needed:**
- ✅ NotificationList (exists)
- [ ] NotificationBadge (unread count)
- [ ] NotificationSettings screen
- [ ] PushNotificationHandler

---

### 🟢 **File Upload (PHASE 9)** - PARTIAL

**Existing:**
- ⚠️ Image picker functionality exists in some screens

**Mobile Implementation:**
```typescript
// Expo Image Picker
import * as ImagePicker from 'expo-image-picker';

// Pick image
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.8,
  allowsMultipleSelection: true,
});

// Upload
const formData = new FormData();
formData.append('file', {
  uri: result.assets[0].uri,
  name: 'photo.jpg',
  type: 'image/jpeg',
});
```

**Components Needed:**
- [ ] ImagePickerModal
- [ ] ImageCropper
- [ ] UploadProgress indicator
- [ ] ImageGallery with zoom

---

## 🆕 MOBILE-ONLY FEATURES (Not in Web Checklist)

### 📱 Native Device Features

**Camera Integration:**
```typescript
// Expo Camera
import { Camera } from 'expo-camera';

// QR Scanner
import { BarCodeScanner } from 'expo-barcode-scanner';
```

**Location Services:**
```typescript
// Expo Location
import * as Location from 'expo-location';

// Get current location for nearby projects
const location = await Location.getCurrentPositionAsync({});
```

**Contacts Access:**
```typescript
// Expo Contacts
import * as Contacts from 'expo-contacts';

// Share project with contacts
```

**Calendar Integration:**
```typescript
// Expo Calendar
import * as Calendar from 'expo-calendar';

// Add project deadlines to calendar
```

---

## 🎯 PRIORITY ROADMAP FOR MOBILE APP

### 🔴 **CRITICAL (Next 2 weeks)**
1. [ ] Complete authentication flow
   - OAuth (Google/Apple)
   - Forgot password
   - Token refresh
2. [ ] Payment integration (Momo + VNPay)
3. [ ] Push notifications setup
4. [ ] Product filtering & sorting

### 🟠 **HIGH (Next 1 month)**
1. [ ] Chat/messaging (Socket.IO + Gifted Chat)
2. [ ] Order management screens
3. [ ] Contract viewing
4. [ ] QC/Bug reporting

### 🟡 **MEDIUM (Next 2-3 months)**
1. [ ] Video calls (LiveKit)
2. [ ] Dashboard analytics
3. [ ] Wishlist persistence
4. [ ] Project timeline view

### 🟢 **LOW (Future)**
1. [ ] AR view for construction projects
2. [ ] Offline mode with sync
3. [ ] Widget for iOS/Android
4. [ ] Apple Watch companion app

---

## 📦 ADDITIONAL PACKAGES NEEDED

```json
{
  "dependencies": {
    "@livekit/react-native": "^2.0.0",
    "@livekit/react-native-webrtc": "^124.0.0",
    "react-native-gifted-chat": "^2.4.0",
    "victory-native": "^37.0.0",
    "react-native-svg": "^14.0.0",
    "expo-notifications": "~0.27.0",
    "expo-local-authentication": "~13.8.0",
    "expo-auth-session": "~5.4.0",
    "expo-image-picker": "~14.7.0",
    "expo-camera": "~14.1.0",
    "expo-location": "~16.5.0",
    "expo-calendar": "~12.7.0",
    "expo-contacts": "~12.7.0",
    "@stripe/stripe-react-native": "^0.35.0",
    "react-native-webview": "^13.6.0"
  }
}
```

---

## 🔄 WEB ↔️ MOBILE SYNC STRATEGY

### Shared Backend
- ✅ Both use same API: `https://baotienweb.cloud/api/v1`
- ✅ Same authentication tokens
- ✅ Same data models

### Platform-Specific
- **Web:** Desktop-first UI, mouse/keyboard optimized
- **Mobile:** Touch gestures, native features, offline-first

### Sync Features
```typescript
// Share deep links between platforms
// Web: https://app.baotienweb.com/products/bt001
// Mobile: baotienweb://products/bt001

// QR code bridge
// Web generates QR → Mobile scans → Opens in app
```

---

## 🛠️ MIGRATION GUIDE: Web → Mobile

### Routing
```typescript
// Web (React Router)
<Route path="/products/:id" element={<ProductDetail />} />

// Mobile (Expo Router) - ALREADY USING THIS ✅
// app/product/[id].tsx
```

### Forms
```typescript
// Web: react-hook-form works on mobile too ✅
import { useForm } from 'react-hook-form';

// Mobile: Add native keyboard handling
<TextInput
  returnKeyType="next"
  onSubmitEditing={() => nextInput.current?.focus()}
/>
```

### Navigation
```typescript
// Web: Link component
<Link to="/cart">Cart</Link>

// Mobile: expo-router ✅
import { router } from 'expo-router';
router.push('/cart');
```

### Storage
```typescript
// Web: localStorage
localStorage.setItem('token', token);

// Mobile: SecureStore ✅ ALREADY USING
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('token', token);
```

---

## ✅ CURRENT APP STATUS SUMMARY

**What's Working:**
- ✅ Modern UI with Western minimalist design
- ✅ Product browsing (HeroBanner, FeaturedProducts, CategoryPills)
- ✅ Shopping cart functionality
- ✅ Basic authentication
- ✅ API integration setup
- ✅ Navigation (expo-router)
- ✅ Secure token storage

**What's Missing:**
- ❌ Payment processing
- ❌ Real-time chat
- ❌ Video calls
- ❌ Push notifications (setup needed)
- ❌ OAuth login
- ❌ Order history
- ❌ Contract management
- ❌ QC/Bug reporting

**Next Steps:**
1. Implement payment gateways (Momo/VNPay)
2. Add push notifications
3. Complete authentication (OAuth, biometrics)
4. Build order management screens
5. Integrate real-time features

---

**Last Updated:** December 15, 2025  
**App Version:** 1.0.0  
**Expo SDK:** 54  
**React Native:** 0.81.5
