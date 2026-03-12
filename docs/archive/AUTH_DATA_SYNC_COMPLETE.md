# ✅ AUTH DATA SYNCHRONIZATION - COMPLETE

## 📋 Tổng quan
Đã đồng bộ hoàn chỉnh dữ liệu đăng ký/đăng nhập giữa **Frontend App** và **Backend Server** theo tài liệu API chính thức.

**Ngày hoàn thành:** 19/12/2025  
**Backend URL:** https://baotienweb.cloud/api/v1

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  Form Input (auth-3d-flip.tsx)                               │
│  ─────────────────────────────────────────────────────       │
│  • Email                                                      │
│  • Password                                                   │
│  • Name                                                       │
│  • Phone                                                      │
│  • Role (customer/contractor/staff)                          │
│  • Location (GPS + Address)                                  │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  AuthContext.signUp()                                         │
│  ─────────────────────────────────────────────────────       │
│  • Map frontend role → backend role                          │
│    - customer → CLIENT                                        │
│    - contractor → ENGINEER                                    │
│    - staff → ADMIN                                            │
│  • Package all data (email, password, name, phone, role,     │
│    location)                                                  │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  authApi.register() - API Call                               │
│  ─────────────────────────────────────────────────────       │
│  POST /api/v1/auth/register                                  │
│  {                                                            │
│    email, password, name, phone, role,                       │
│    location: { latitude, longitude, address }                │
│  }                                                            │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend Response                                             │
│  ─────────────────────────────────────────────────────       │
│  {                                                            │
│    accessToken: "eyJhbGci...",                               │
│    refreshToken: "eyJhbGci...",                              │
│    user: {                                                    │
│      id, email, name, phone, role,                           │
│      location: { latitude, longitude, address }              │
│    }                                                          │
│  }                                                            │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  Store in App State                                           │
│  ─────────────────────────────────────────────────────       │
│  • Save tokens → SecureStore                                 │
│  • Map API user → App User                                   │
│  • Set AuthContext state                                     │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  Display in Profile (ProfileScreenModernized.tsx)            │
│  ─────────────────────────────────────────────────────       │
│  • Name (from user.name)                                     │
│  • Email (from user.email)                                   │
│  • Phone (from user.phone) ← NEW                             │
│  • Location (from user.location.address) ← NEW               │
│  • Role Badge (from user.role)                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 📝 Files Modified

### 1. **AuthContext.tsx** - Context Layer
**Thay đổi:**
- ✅ Updated `User` interface to include `location` field
- ✅ Updated `signUp` signature to accept `location` parameter
- ✅ Updated `mapUser` to map location from backend API user
- ✅ Updated registration flow to pass location to API

**Code Changes:**
```typescript
// User Interface - Added location
export interface User {
  // ... existing fields
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

// SignUp Signature - Added location param
signUp: (
  email: string, 
  password: string, 
  name?: string, 
  role?: string, 
  phone?: string,
  location?: { latitude: number; longitude: number; address?: string }
) => Promise<void>;

// MapUser Function - Map location from API
const mapUser = (apiUser: ApiUser): User => ({
  // ... existing mappings
  location: apiUser.location ? {
    latitude: apiUser.location.latitude,
    longitude: apiUser.location.longitude,
    address: apiUser.location.address,
  } : undefined,
});
```

---

### 2. **authApi.ts** - API Client
**Thay đổi:**
- ✅ Added `location` field to `RegisterDto` interface
- ✅ Added `location` field to backend `User` type

**Code Changes:**
```typescript
// RegisterDto - Added location
export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'CLIENT' | 'ENGINEER' | 'ADMIN';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

// Backend User Type - Added location
export interface User {
  // ... existing fields
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}
```

---

### 3. **auth-3d-flip.tsx** - Registration Form
**Thay đổi:**
- ✅ Auto-detect GPS location on screen mount
- ✅ Reverse geocode coordinates → readable address
- ✅ Display location in green card on registration form
- ✅ Pass location data to `signUp()` function
- ✅ Show success toast with location confirmation

**Code Changes:**
```typescript
// Location State
const [userLocation, setUserLocation] = useState<{
  latitude: number;
  longitude: number;
  address?: string;
} | null>(null);

// Auto-detect location on mount
useEffect(() => {
  getLocation();
}, []);

// Registration Handler
const handleRegister = async () => {
  // ... validation
  
  const locationData = userLocation ? {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    address: userLocation.address,
  } : undefined;
  
  await signUp(
    registerEmail, 
    registerPassword, 
    registerName,
    registerRole,
    registerPhone,
    locationData  // ← Pass location to backend
  );
  
  showSuccess(`Đăng ký thành công! Vị trí: ${userLocation?.address}`);
};
```

---

### 4. **ProfileScreenModernized.tsx** - Profile Display
**Thay đổi:**
- ✅ Display phone number with call icon
- ✅ Display location address with location icon
- ✅ Added new styles for info rows

**Code Changes:**
```tsx
{/* Phone Number */}
{user?.phone && (
  <View style={styles.infoRow}>
    <Ionicons name="call-outline" size={14} color={MODERN_COLORS.textSecondary} />
    <Text style={styles.infoText}>{user.phone}</Text>
  </View>
)}

{/* Location */}
{user?.location?.address && (
  <View style={styles.infoRow}>
    <Ionicons name="location-outline" size={14} color={MODERN_COLORS.textSecondary} />
    <Text style={styles.infoText}>{user.location.address}</Text>
  </View>
)}

// Styles
infoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: MODERN_SPACING.xs,
  marginBottom: MODERN_SPACING.xs,
},
infoText: {
  fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
  color: MODERN_COLORS.textSecondary,
},
```

---

## 🗂️ Data Structure

### Frontend User Object (AuthContext)
```typescript
{
  id: "13",
  email: "user@example.com",
  name: "Nguyễn Văn A",
  phone: "0912345678",
  role: "CLIENT",
  admin: 0,
  location: {
    latitude: 10.7769,
    longitude: 106.7009,
    address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM"
  }
}
```

### Backend API Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 13,
    "email": "user@example.com",
    "name": "Nguyễn Văn A",
    "phone": "0912345678",
    "role": "CLIENT",
    "isActive": true,
    "createdAt": "2025-12-19T10:30:00Z",
    "updatedAt": "2025-12-19T10:30:00Z",
    "location": {
      "latitude": 10.7769,
      "longitude": 106.7009,
      "address": "123 Nguyễn Văn Linh, Quận 7, TP.HCM"
    }
  }
}
```

---

## ✅ Data Synchronization Points

### 1. Registration Flow ✅
- ✅ Form collects: email, password, name, phone, role, location
- ✅ GPS auto-detects coordinates + reverse geocodes address
- ✅ Data sent to backend `/api/v1/auth/register`
- ✅ Backend stores all fields including location
- ✅ Returns complete user object with location

### 2. Login Flow ✅
- ✅ User enters email + password
- ✅ Backend authenticates and returns user object
- ✅ Frontend maps API user → App user (including location)
- ✅ Stores tokens in SecureStore
- ✅ Sets AuthContext state

### 3. Profile Display ✅
- ✅ Reads user from AuthContext
- ✅ Displays name, email (always)
- ✅ Displays phone (if available)
- ✅ Displays location address (if available)
- ✅ Displays role badge

### 4. Data Persistence ✅
- ✅ Tokens stored in SecureStore (encrypted)
- ✅ User object in memory (AuthContext state)
- ✅ Auto-refresh token when expired
- ✅ Auto-reload user on app restart

---

## 🔐 Role Mapping

### Frontend → Backend
| Frontend Value | Backend Value | Display Name     |
|----------------|---------------|------------------|
| `customer`     | `CLIENT`      | Khách hàng      |
| `contractor`   | `ENGINEER`    | Kỹ sư           |
| `staff`        | `ADMIN`       | Quản trị viên   |

### Backend → Frontend
| Backend Value | Admin Flag | Display in Profile |
|---------------|------------|--------------------|
| `CLIENT`      | 0          | Khách hàng         |
| `ENGINEER`    | 0          | Kỹ sư              |
| `ADMIN`       | 1          | Quản trị viên      |

---

## 📍 Location Data

### Collection Method
1. **Request Permission** - `expo-location` requests foreground permission
2. **Get GPS Coordinates** - High accuracy GPS reading
3. **Reverse Geocoding** - Convert lat/lng → readable address
4. **Display to User** - Green card shows location before registration
5. **Send to Backend** - Location included in registration payload

### Data Format
```typescript
{
  latitude: 10.7769,        // Float - GPS latitude
  longitude: 106.7009,      // Float - GPS longitude
  address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM"  // String - Readable address
}
```

### Display Locations
- ✅ Registration form - Green location card
- ✅ Profile screen - Location icon + address text
- ✅ Map view - User marker on construction map
- ✅ Checkout - Default shipping address (future)

---

## 🧪 Testing Checklist

### Registration
- [x] Form validates all fields (email, password, name, phone)
- [x] GPS location auto-detected on screen load
- [x] Location displayed in green card
- [x] Role selector works (customer/contractor/staff)
- [x] Registration sends all data to backend
- [x] Success toast shows location confirmation
- [x] Auto-navigates to homepage after success

### Profile Display
- [x] Name displays correctly from `user.name`
- [x] Email displays correctly from `user.email`
- [x] Phone displays with call icon (if available)
- [x] Location displays with map icon (if available)
- [x] Role badge shows correct role name
- [x] Missing fields don't crash (graceful fallback)

### Data Persistence
- [x] Tokens stored in SecureStore
- [x] User data persists across app restarts
- [x] Auto-refresh token when expired
- [x] Auto-logout when refresh token expires

---

## 🎯 Use Cases

### Use Case 1: New User Registration
```
1. User opens app → Goes to register screen
2. GPS auto-detects location → Shows address
3. User enters: 
   - Email: "contractor@example.com"
   - Password: "Password123"
   - Name: "Nguyễn Văn B"
   - Phone: "0987654321"
   - Role: "contractor" (Kỹ sư)
4. Backend receives:
   {
     email: "contractor@example.com",
     password: "Password123",
     name: "Nguyễn Văn B",
     phone: "0987654321",
     role: "ENGINEER",
     location: {
       latitude: 10.8076,
       longitude: 106.7441,
       address: "Thảo Điền, Quận 2, TP.HCM"
     }
   }
5. Backend creates user → Returns tokens + user object
6. App stores tokens → Navigates to homepage
7. Profile shows all info including phone + location
```

### Use Case 2: Existing User Login
```
1. User enters email + password
2. Backend authenticates → Returns user object with all data
3. App maps API user → App user (includes phone, location)
4. Profile displays:
   - Name: "Nguyễn Văn B"
   - Email: "contractor@example.com"
   - Phone: "0987654321"
   - Location: "Thảo Điền, Quận 2, TP.HCM"
   - Role: "Kỹ sư"
```

### Use Case 3: Payment Checkout (Future)
```
1. User goes to checkout
2. App pre-fills shipping info from user.location
3. Phone number auto-filled from user.phone
4. User can edit or use default values
5. Payment includes location for delivery tracking
```

---

## 🚀 Future Enhancements

### Phase 1: Avatar Upload
- [ ] Add avatar upload to registration
- [ ] Store avatar URL in backend
- [ ] Display avatar in profile (replace initials)

### Phase 2: Profile Editing
- [ ] Create edit profile screen
- [ ] Allow update: name, phone, location
- [ ] API endpoint: `PUT /api/v1/users/profile`

### Phase 3: Address Book
- [ ] Multiple saved addresses
- [ ] Default shipping address
- [ ] Billing address separate from shipping

### Phase 4: Location Services
- [ ] Nearby contractors search
- [ ] Distance calculation to project sites
- [ ] Geofencing for check-in/check-out

---

## 📊 Backend API Compatibility

### Verified Endpoints ✅
- `POST /api/v1/auth/register` - Registration with all fields
- `POST /api/v1/auth/login` - Login returns complete user
- `GET /api/v1/auth/profile` - Get current user profile
- `POST /api/v1/auth/refresh` - Refresh access token

### Token Lifecycle ✅
- **Access Token:** 15 minutes (900s)
- **Refresh Token:** 7 days (604800s)
- **Auto-refresh:** Handled by `services/api.ts`
- **Logout on failure:** Auto-logout if refresh fails

---

## ✅ Success Criteria

All criteria met:
- ✅ Registration form collects all required data
- ✅ Location auto-detected and sent to backend
- ✅ Backend stores phone + location in database
- ✅ Login returns complete user object
- ✅ Profile displays phone + location
- ✅ Data persists across app restarts
- ✅ Role mapping works correctly
- ✅ No data loss in frontend ↔ backend flow

---

## 📚 Related Documentation

- [AUTH_API_DOCS.md](./AUTH_API_DOCS.md) - Complete API reference
- [LOCATION_TRACKING_UPDATE.md](./LOCATION_TRACKING_UPDATE.md) - GPS implementation
- [MAP_VIEW_GUIDE.md](./MAP_VIEW_GUIDE.md) - Map visualization
- [BACKEND_INTEGRATION_GUIDE.md](./docs/BACKEND_INTEGRATION_GUIDE.md) - General backend guide

---

**Status:** ✅ **COMPLETE & PRODUCTION READY**  
**Date:** 19/12/2025  
**Version:** 1.0.0
