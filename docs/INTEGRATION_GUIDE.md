# 🔗 Integration Guide: Frontend ↔️ Backend

Complete guide for connecting the Expo mobile app with the NestJS backend API.

**Last Updated:** December 24, 2025

---

## 📑 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Environment Configuration](#environment-configuration)
3. [API Integration](#api-integration)
4. [Authentication Flow](#authentication-flow)
5. [Data Flow Examples](#data-flow-examples)
6. [Error Handling](#error-handling)
7. [Testing Integration](#testing-integration)
8. [Deployment Workflow](#deployment-workflow)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      MOBILE CLIENT                          │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐             │
│  │   Expo Router    │◄───┤   AuthContext    │             │
│  │   (Navigation)   │    │   (Auth State)   │             │
│  └────────┬─────────┘    └────────┬─────────┘             │
│           │                       │                         │
│  ┌────────▼───────────────────────▼─────────┐             │
│  │          API Service Layer               │             │
│  │  (services/api.ts + authApi.ts)          │             │
│  └────────────────┬─────────────────────────┘             │
│                   │                                         │
└───────────────────┼─────────────────────────────────────────┘
                    │
                    │ HTTPS (REST API)
                    │ Authorization: Bearer <token>
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                   NGINX REVERSE PROXY                       │
│              https://baotienweb.cloud                       │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                    BACKEND SERVER                           │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐             │
│  │   NestJS API     │◄───┤   PostgreSQL     │             │
│  │   (Port 3000)    │    │   Database       │             │
│  └──────────────────┘    └──────────────────┘             │
│                                                             │
│  PM2 Process Manager (PID 612302)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Environment Configuration

### Backend Configuration

**File:** `BE-baotienweb.cloud/.env`

```env
# Server
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# API Security
API_KEY=thietke-resort-api-key-2024
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=https://baotienweb.cloud,http://localhost:8081

# Email (for future email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

### Frontend Configuration

**File:** `app.config.ts`

```typescript
export default {
  expo: {
    extra: {
      // Development
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
      
      // Production
      // apiUrl: 'https://baotienweb.cloud/api/v1',
      
      apiKey: process.env.EXPO_PUBLIC_API_KEY || 'thietke-resort-api-key-2024',
      environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development'
    }
  }
};
```

**Environment Variables:**

Create `.env` file in project root:

```env
# API Configuration
EXPO_PUBLIC_API_URL=https://baotienweb.cloud/api/v1
EXPO_PUBLIC_API_KEY=thietke-resort-api-key-2024
EXPO_PUBLIC_ENVIRONMENT=production

# Feature Flags
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true
```

**Access in code:**

```typescript
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
const apiKey = Constants.expoConfig?.extra?.apiKey;
```

---

## 🔌 API Integration

### API Service Layer

**File:** `services/api.ts`

```typescript
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
const API_KEY = Constants.expoConfig?.extra?.apiKey;
const TIMEOUT = 15000;

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public url: string,
    public detail?: string,
    public body?: any
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const url = `${BASE_URL}${path}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }

      throw new ApiError(
        response.status,
        response.statusText,
        url,
        errorBody?.message || 'Request failed',
        errorBody
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw new Error('Network request failed');
  }
}
```

---

### Authentication API

**File:** `services/authApi.ts`

```typescript
import { apiFetch } from './api';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export type UserRole = 
  | 'CLIENT' 
  | 'ENGINEER' 
  | 'CONTRACTOR' 
  | 'STAFF' 
  | 'ARCHITECT' 
  | 'DESIGNER' 
  | 'SUPPLIER' 
  | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  emailVerified: boolean;
  phone?: string;
  location?: {
    city: string;
    country: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store tokens
    await SecureStore.setItemAsync(TOKEN_KEY, response.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);
    
    return response;
  },

  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    await SecureStore.setItemAsync(TOKEN_KEY, response.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);
    
    return response;
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    
    if (!token) {
      throw new Error('No authentication token');
    }
    
    return await apiFetch('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Refresh access token
  async refreshToken(): Promise<string> {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    
    const response = await apiFetch('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    await SecureStore.setItemAsync(TOKEN_KEY, response.accessToken);
    return response.accessToken;
  },

  // Logout
  async logout(): Promise<void> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    
    if (token) {
      try {
        await apiFetch('/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    
    // Clear local tokens
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },

  // Get stored token
  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },
};
```

---

## 🔐 Authentication Flow

### Registration Flow

```
┌─────────────┐
│   User      │
│   Taps      │
│  "Sign Up"  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Frontend: auth-3d-flip.tsx          │
│  1. Validate form inputs             │
│  2. Check staff secret (if STAFF)    │
│  3. Call authApi.register()          │
└──────┬───────────────────────────────┘
       │
       │ POST /api/v1/auth/register
       │ { email, password, fullName, role }
       ▼
┌──────────────────────────────────────┐
│  Backend: auth.controller.ts         │
│  1. Validate input (class-validator) │
│  2. Check email uniqueness           │
│  3. Hash password (bcrypt)           │
│  4. Create user in database          │
│  5. Generate JWT tokens              │
└──────┬───────────────────────────────┘
       │
       │ Response: { user, accessToken, refreshToken }
       ▼
┌──────────────────────────────────────┐
│  Frontend: AuthContext               │
│  1. Store tokens in SecureStore      │
│  2. Update user state                │
│  3. Navigate to home screen          │
└──────────────────────────────────────┘
```

### Login Flow

```
User enters email/password
       ↓
authApi.login(email, password)
       ↓
POST /api/v1/auth/login
       ↓
Backend verifies credentials
       ↓
Returns { user, accessToken, refreshToken }
       ↓
Store tokens securely
       ↓
Update AuthContext.user
       ↓
Redirect to home
```

### Token Refresh Flow

```
API request fails with 401
       ↓
Detect token expiration
       ↓
authApi.refreshToken()
       ↓
POST /api/v1/auth/refresh
       ↓
Backend validates refresh token
       ↓
Returns new accessToken
       ↓
Update stored token
       ↓
Retry original request
```

---

## 📊 Data Flow Examples

### Fetching Products

```typescript
// Frontend: app/(tabs)/index.tsx

import { useEffect, useState } from 'react';
import { apiFetch } from '@/services/api';

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // API call
      const response = await apiFetch('/products?page=1&limit=20');
      
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard {...item} />}
      refreshing={loading}
      onRefresh={loadProducts}
    />
  );
}
```

**API Request:**
```
GET https://baotienweb.cloud/api/v1/products?page=1&limit=20
Headers:
  x-api-key: thietke-resort-api-key-2024
```

**API Response:**
```json
{
  "data": [
    {
      "id": "prod-001",
      "name": "Sofa Hiện Đại",
      "price": 15000000,
      "image": "https://example.com/sofa.jpg",
      "category": "furniture"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### Adding to Cart

```typescript
// Frontend: context/CartContext.tsx

import { createContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const CART_KEY = 'shopping_cart';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = async (product: Product, quantity = 1) => {
    const existingIndex = items.findIndex(i => i.id === product.id);
    
    let newItems;
    if (existingIndex >= 0) {
      newItems = [...items];
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems = [...items, { ...product, quantity }];
    }
    
    setItems(newItems);
    
    // Persist to storage
    await SecureStore.setItemAsync(CART_KEY, JSON.stringify(newItems));
  };

  const totalPrice = items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );

  return (
    <CartContext.Provider value={{ items, add, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}
```

**Usage:**
```typescript
// In any component
const { add } = useCart();

const handleAddToCart = () => {
  add(product, 1);
  Alert.alert('Success', 'Added to cart');
};
```

---

### Authenticated Request (Projects)

```typescript
// Frontend: app/projects/index.tsx

import { authApi } from '@/services/authApi';
import { apiFetch } from '@/services/api';

export default function ProjectsScreen() {
  const loadProjects = async () => {
    try {
      // Get auth token
      const token = await authApi.getToken();
      
      if (!token) {
        router.push('/(auth)/sign-in');
        return;
      }
      
      // Authenticated API call
      const response = await apiFetch('/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setProjects(response.data);
    } catch (error) {
      if (error.status === 401) {
        // Token expired, try refresh
        try {
          await authApi.refreshToken();
          // Retry request
          await loadProjects();
        } catch {
          // Refresh failed, redirect to login
          router.push('/(auth)/sign-in');
        }
      }
    }
  };
  
  // ... rest of component
}
```

---

## ⚠️ Error Handling

### Centralized Error Handler

```typescript
// utils/errorHandler.ts

import { ApiError } from '@/services/api';
import { Alert } from 'react-native';

export function handleApiError(error: unknown, fallbackMessage = 'An error occurred') {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        Alert.alert('Invalid Request', error.detail || 'Please check your input');
        break;
      case 401:
        Alert.alert('Unauthorized', 'Please sign in again');
        // Navigate to sign in
        break;
      case 403:
        Alert.alert('Forbidden', 'You don\'t have permission for this action');
        break;
      case 404:
        Alert.alert('Not Found', 'The requested resource was not found');
        break;
      case 409:
        Alert.alert('Conflict', error.detail || 'This item already exists');
        break;
      case 500:
        Alert.alert('Server Error', 'Something went wrong. Please try again later');
        break;
      default:
        Alert.alert('Error', error.detail || fallbackMessage);
    }
  } else if (error instanceof Error) {
    if (error.message === 'Request timeout') {
      Alert.alert('Timeout', 'The request took too long. Please check your connection');
    } else if (error.message === 'Network request failed') {
      Alert.alert('Network Error', 'Please check your internet connection');
    } else {
      Alert.alert('Error', error.message);
    }
  } else {
    Alert.alert('Error', fallbackMessage);
  }
}

// Usage in components:
try {
  await authApi.login(email, password);
} catch (error) {
  handleApiError(error, 'Failed to sign in');
}
```

---

## 🧪 Testing Integration

### Manual Testing Checklist

**Backend Tests:**
```bash
# Run comprehensive backend test
cd "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025"
.\test-backend-complete.ps1
```

**Frontend Tests:**

1. **Authentication:**
   - [ ] Register with CLIENT role
   - [ ] Register with STAFF role (test secret key validation)
   - [ ] Login with created account
   - [ ] View profile after login
   - [ ] Logout and verify token cleared

2. **Products:**
   - [ ] Load products on home screen
   - [ ] Filter products by category
   - [ ] View product detail
   - [ ] Add product to cart

3. **Cart:**
   - [ ] View cart items
   - [ ] Increment/decrement quantity
   - [ ] Remove item from cart
   - [ ] Persist cart on app restart

4. **Projects:**
   - [ ] Load projects list (authenticated)
   - [ ] View project detail
   - [ ] Filter projects by status

---

### API Testing with Postman

**Collection Structure:**

```
Baotienweb API
├── Health
│   └── GET /health
├── Auth
│   ├── POST /auth/register (CLIENT)
│   ├── POST /auth/register (STAFF)
│   ├── POST /auth/login
│   ├── GET /auth/profile
│   ├── POST /auth/refresh
│   └── POST /auth/logout
├── Products
│   ├── GET /products
│   └── GET /products/:id
└── Projects
    ├── GET /projects
    └── GET /projects/:id
```

**Environment Variables:**
```
baseUrl: https://baotienweb.cloud/api/v1
apiKey: thietke-resort-api-key-2024
accessToken: (set after login)
```

---

## 🚀 Deployment Workflow

### Backend Deployment

```bash
# 1. Build on local machine
cd BE-baotienweb.cloud
npm run build

# 2. Create deployment package
cd ..
.\compress-backend.ps1  # Creates deploy-complete.zip

# 3. Upload to VPS
scp deploy-complete.zip root@103.200.20.100:/tmp/

# 4. SSH to VPS and extract
ssh root@103.200.20.100
cd /tmp
bash deploy-on-vps.sh

# 5. Run migrations
sudo -u postgres psql -d postgres -f /root/baotienweb-api/add_new_roles.sql
sudo -u postgres psql -d postgres -f /root/baotienweb-api/add_email_verification.sql
sudo -u postgres psql -d postgres -f /root/baotienweb-api/add_contacts_table.sql

# 6. Restart PM2
pm2 restart baotienweb-api
pm2 logs baotienweb-api --lines 50

# 7. Verify deployment
curl http://localhost:3000/api/v1/health
```

---

### Frontend Deployment (EAS Build)

```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to Expo account
eas login

# 3. Configure project
eas build:configure

# 4. Build for Android
eas build --platform android --profile production

# 5. Build for iOS (requires Apple Developer account)
eas build --platform ios --profile production

# 6. Submit to Google Play
eas submit --platform android

# 7. Submit to App Store
eas submit --platform ios
```

**EAS Configuration:** `eas.json`

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://baotienweb.cloud/api/v1",
        "EXPO_PUBLIC_ENVIRONMENT": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

### Environment-Specific Configs

**Development:**
```typescript
// app.config.ts
export default {
  extra: {
    apiUrl: 'http://localhost:3000/api/v1',  // Local backend
    environment: 'development'
  }
};
```

**Staging:**
```typescript
export default {
  extra: {
    apiUrl: 'https://staging.baotienweb.cloud/api/v1',
    environment: 'staging'
  }
};
```

**Production:**
```typescript
export default {
  extra: {
    apiUrl: 'https://baotienweb.cloud/api/v1',
    environment: 'production'
  }
};
```

---

## 🔒 Security Best Practices

1. **Never hardcode secrets in code:**
   ```typescript
   // ❌ BAD
   const API_KEY = 'thietke-resort-api-key-2024';
   
   // ✅ GOOD
   const API_KEY = Constants.expoConfig?.extra?.apiKey;
   ```

2. **Always use HTTPS in production:**
   ```typescript
   const BASE_URL = process.env.NODE_ENV === 'production'
     ? 'https://baotienweb.cloud/api/v1'
     : 'http://localhost:3000/api/v1';
   ```

3. **Store sensitive data securely:**
   ```typescript
   // Use SecureStore for tokens, NOT AsyncStorage
   import * as SecureStore from 'expo-secure-store';
   await SecureStore.setItemAsync('token', accessToken);
   ```

4. **Validate all user inputs:**
   ```typescript
   // Backend: Use class-validator
   export class RegisterDto {
     @IsEmail()
     email: string;
     
     @MinLength(8)
     @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
     password: string;
   }
   ```

5. **Implement rate limiting:**
   ```typescript
   // Backend: throttler module
   @UseGuards(ThrottlerGuard)
   @Throttle(10, 60)  // 10 requests per minute
   @Post('login')
   async login() { ... }
   ```

---

## 📝 Integration Checklist

Before going to production:

- [ ] Backend health endpoint returns 200 OK
- [ ] All 8 user roles can register successfully
- [ ] Staff secret key validation works
- [ ] Login returns valid JWT token
- [ ] Token refresh works when token expires
- [ ] Products API returns data with pagination
- [ ] Projects API requires authentication
- [ ] Cart persists on app restart
- [ ] Error messages are user-friendly
- [ ] API timeout is handled gracefully
- [ ] Network errors show retry option
- [ ] All API calls use HTTPS in production
- [ ] Sensitive data stored in SecureStore
- [ ] API keys not hardcoded in code
- [ ] CORS configured for mobile app domain

---

**Last Updated:** December 24, 2025  
**Version:** 1.0.0
