# 📱 ThietKeResort Mobile App# 📱 ThietKeResort Mobile App - Frontend# Welcome to your Expo app 👋



**Expo Router + React Native + TypeScript**  

**Version:** 1.0.0  

**Last Updated:** October 30, 2025**Expo Router + React Native + TypeScript**  This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).



This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).**Version**: 1.0.0  



---**Scope**: Frontend Application Only## Get started



## 📚 Documentation



**All project documentation (217 files) has been organized in the [`docs/`](./docs) folder.**---1. Install dependencies



👉 **[Click here to browse all documentation](./docs/README.md)**



### 🎯 Quick Links:## 🎯 Project Overview   ```bash

- 🔐 [Admin System Complete](./docs/ADMIN_COMPLETE_README.md)

- 👤 [Profile Screens Complete](./docs/PROFILE_SCREENS_COMPLETE.md) ⭐ **Latest (Oct 30, 2025)**   npm install

- 🔑 [Authentication System](./docs/AUTHENTICATION_SYSTEM_COMPLETE.md)

- 🌐 [API Integration Guide](./docs/API_INTEGRATION_INDEX.md)Mobile application for ThietKeResort service platform built with:   ```

- 📹 [Video Call System](./docs/VIDEO_CALL_DOCUMENTATION_INDEX.md)

- 🎨 [UI/UX Design Guide](./docs/FIGMA_DESIGN_GUIDE.md)- **Expo SDK 54** - React Native framework

- 🚀 [Production Deployment](./docs/PRODUCTION_DEPLOYMENT_GUIDE.md)

- ✅ [Testing Checklist](./docs/TESTING_CHECKLIST.md)- **Expo Router** - File-based routing2. Start the app



---- **TypeScript** - Type safety



## 🎯 Project Overview- **Context API** - State management   ```bash



Mobile application for **ThietKeResort** service platform - a comprehensive resort design and construction management system.   npx expo start



### Tech Stack:---   ```

- **Expo SDK 54** - React Native framework

- **Expo Router** - File-based routing

- **TypeScript** - Full type safety

- **Context API** - State management## 🚀 Quick StartIn the output, you'll find options to open the app in a

- **AsyncStorage** - Local persistence

- **Ionicons** - Icon library



### Key Features:### Prerequisites- [development build](https://docs.expo.dev/develop/development-builds/introduction/)

- ✅ **Authentication** - Login, Register, Social Auth (Google, Facebook), Guest Mode

- ✅ **Admin System** - Staff, Roles, Permissions, Departments, Activity Logs- Node.js 18+ - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)

- ✅ **Profile Management** - Info, Security, Settings, Payment, Privacy (5 complete screens)

- ✅ **Projects** - Construction project management- npm or yarn- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

- ✅ **Video Calls** - LiveKit/Agora integration

- ✅ **Feed System** - Social feed with posts- Expo Go app (for testing) or development build- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

- ✅ **Utilities & Services** - Booking system



---

### InstallationYou can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## 🚀 Quick Start



### Prerequisites

- Node.js 18+1. **Clone repository**## Get a fresh project

- npm or yarn

- Expo CLI: `npm install -g expo-cli````bash

- Expo Go app (iOS/Android) or development build

git clone https://github.com/minhtien2412tran/APP_DESIGN_BUILD.gitWhen you're ready, run:

### Installation

cd APP_DESIGN_BUILD02.10.2025

```bash

# 1. Clone the repository``````bash

git clone <repository-url>

cd APP_DESIGN_BUILD02.10.2025npm run reset-project



# 2. Install dependencies2. **Install dependencies**```

npm install

```bash

# 3. Start the development server

npx expo startnpm installThis command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

```

```

### Running the App

## Learn more

Choose one of the following options:

3. **Setup environment**

1. **Expo Go (Quick Test)**

   - Scan QR code with Expo Go app```bashTo learn more about developing your project with Expo, look at the following resources:

   - Limited to Expo SDK features

# Copy .env.example to .env

2. **iOS Simulator** (Mac only)

   - Press `i` in terminalcp .env.example .env- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).

   - Requires Xcode installed

- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

3. **Android Emulator**

   - Press `a` in terminal# Edit .env with your configuration

   - Requires Android Studio

```## Join the community

4. **Development Build** (Recommended for full features)

   ```bash

   npx expo run:android

   # or4. **Start development server**Join our community of developers creating universal apps.

   npx expo run:ios

   ``````bash



---npx expo start- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.



## 📂 Project Structure```- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.



```

app/5. **Run on device/simulator**

├── (auth)/           # Authentication screens```bash

│   ├── login.tsx# iOS

│   ├── register.tsxnpx expo run:ios

│   └── forgot-password.tsx

├── (tabs)/           # Main app tabs# Android

│   ├── index.tsx     # Homenpx expo run:android

│   ├── projects.tsx  # Projects

│   ├── notifications.tsx# Web

│   └── profile.tsx   # Profile hubnpx expo start --web

├── admin/            # Admin system (13 screens)

│   ├── dashboard.tsx# Expo Go (scan QR code)

│   ├── staff/```

│   ├── roles/

│   ├── departments/---

│   └── settings.tsx

├── profile/          # Profile screens (5 screens)## 📂 Project Structure

│   ├── info.tsx      # Edit profile

│   ├── security.tsx  # Password & 2FA```

│   ├── settings.tsx  # App settingsapp/                      # Screens & routing (expo-router)

│   ├── payment.tsx   # Wallet & payments├── (auth)/              # Authentication screens

│   └── privacy.tsx   # Privacy controls│   ├── login.tsx

├── projects/         # Project management│   ├── register.tsx

├── call/             # Video call screens│   ├── forgot-password.tsx

├── legal/            # Legal pages│   └── reset-password.tsx

└── _layout.tsx       # Root layout├── (tabs)/              # Main app tabs

│   ├── index.tsx        # Home screen

components/│   ├── profile.tsx

├── ui/               # Reusable UI components│   ├── projects.tsx

├── themed-view.tsx│   └── notifications.tsx

└── themed-text.tsx├── call/                # Call screens

│   └── video-call.tsx

context/└── _layout.tsx          # Root layout

├── AuthContext.tsx   # Authentication state

└── CartContext.tsx   # Shopping cartcomponents/              # Reusable UI components

├── ui/                  # UI primitives

services/│   ├── button.tsx

├── api.ts            # API client│   ├── input.tsx

└── profile.ts        # Profile services│   ├── container.tsx

│   └── NotificationBell.tsx

docs/                 # 📚 All documentation (217 files)└── auth/                # Auth-specific components

└── README.md         # Documentation index

```context/                 # State management

├── AuthContext.tsx      # Authentication state

---├── CartContext.tsx      # Shopping cart (if applicable)

└── NotificationContext.tsx  # Notifications

## 🔧 Configuration

hooks/                   # Custom React hooks

### Environment Variables├── useGoogleAuth.ts     # Google OAuth

└── useThemeColor.ts     # Theme utilities

Create a `.env` file in the root directory:

services/                # API & external services

```env├── api.ts               # API client (fetch wrapper)

API_BASE_URL=https://api.thietkeresort.com.vn├── googleSignIn.ts      # Google Sign-In

AGORA_APP_ID=your_agora_app_id└── storage.ts           # Secure storage wrapper

LIVEKIT_URL=your_livekit_url

```constants/               # App constants

├── theme.ts             # Colors, typography

### API Configuration└── config.ts            # App configuration



Backend API: `https://api.thietkeresort.com.vn/perfex_crm/`utils/                   # Utility functions

assets/                  # Images, fonts, icons

See [`docs/API_INTEGRATION_INDEX.md`](./docs/API_INTEGRATION_INDEX.md) for complete API documentation.types/                   # TypeScript type definitions

```

---

---

## 🧪 Testing

## 🔑 Environment Variables

### Run Tests

```bash### Required Variables

# Unit tests

npm test```bash

# API Configuration

# E2E tests (if configured)EXPO_PUBLIC_API_BASE_URL=https://api.thietkeresort.com.vn

npm run test:e2eEXPO_PUBLIC_API_KEY=thietke-resort-api-key-2024

```

# Google OAuth (Web Client ID)

### Test AccountsEXPO_PUBLIC_GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com

See [`docs/TEST_LOGIN_GUIDE.md`](./docs/TEST_LOGIN_GUIDE.md) for test credentials.

# Feature Flags

---EXPO_PUBLIC_ENABLE_SOCIAL_GOOGLE=true

EXPO_PUBLIC_ENABLE_SOCIAL_FACEBOOK=false

## 📱 Building for Production

# Environment

### Android APK/AABEXPO_PUBLIC_ENV=development

```bash```

# Build APK

eas build --platform android --profile production### ⚠️ Security Notes

- **NEVER** commit `.env` file

# Build AAB for Google Play- Only use `EXPO_PUBLIC_*` prefix for client-side variables

eas build --platform android --profile production --android-buildType app-bundle- Backend secrets must stay on backend server

```- API key in frontend is for rate limiting only (not secret)



### iOS IPA---

```bash

eas build --platform ios --profile production## 🏗️ Architecture

```

### State Management

See [`docs/PRODUCTION_DEPLOYMENT_GUIDE.md`](./docs/PRODUCTION_DEPLOYMENT_GUIDE.md) for detailed instructions.- **Context API** for global state (Auth, Notifications)

- **React Hooks** for local state

---- No Redux/MobX (lightweight approach)



## 📖 Learn More### Routing

- **Expo Router** (file-based)

### Expo Documentation- Automatic navigation stack

- [Expo Documentation](https://docs.expo.dev/)- Type-safe routes

- [Expo Router](https://docs.expo.dev/router/introduction/)

- [TypeScript with Expo](https://docs.expo.dev/guides/typescript/)### API Integration

- Centralized `apiFetch()` wrapper

### React Native- Auto includes API key and auth headers

- [React Native Documentation](https://reactnative.dev/)- Error handling with `ApiError` class

- [React Navigation](https://reactnavigation.org/)

### Authentication Flow

### Project Documentation```

- [Complete Documentation Index](./docs/README.md)App Start

- [Architecture Guide](./docs/SYSTEM_ARCHITECTURE_COMPLETE.md)  ↓

- [API Integration](./docs/API_INTEGRATION_INDEX.md)Check stored token

- [Security Guide](./docs/SECURITY_README.md)  ↓ (valid)

Load user session → Home

---  ↓ (invalid)

Redirect to Login

## 🤝 Contributing```



1. Check [`docs/TEAM_INTEGRATION_GUIDE.md`](./docs/TEAM_INTEGRATION_GUIDE.md)---

2. Follow TypeScript strict mode

3. Use project's UI components (`components/ui/`)## 🔌 Backend Integration

4. Write tests for new features

5. Update documentation### API Base URL

```

---Production: https://api.thietkeresort.com.vn

```

## 📊 Project Status

### Required Endpoints

### Latest Updates (October 30, 2025)See [`API_REQUIREMENTS.md`](./API_REQUIREMENTS.md) for complete API contract.

- ✅ **5 Profile Screens** - Complete with validation & persistence

- ✅ **Admin System** - 13 screens with full CRUD operations**Critical Endpoints**:

- ✅ **Authentication** - Social login, Guest mode, Password reset- `GET /auth/me` - Load user session

- ✅ **Video Calls** - LiveKit integration complete- `POST /auth/login` - Email/password login

- ✅ **API Integration** - Backend connected- `POST /auth/social` - Social OAuth login

- `GET /api/notifications/user/:userId` - Notifications

### Statistics

- **Total Screens:** 50+**Status**: Some endpoints pending backend implementation ⏳

- **Total Lines of Code:** 15,000+

- **Documentation Files:** 217---

- **Test Coverage:** In progress

## 🎨 UI/UX

---

### Design System

## 🐛 Known Issues- **Colors**: Dark theme with `#90B44C` accent

- **Typography**: System fonts, consistent sizing

See [`docs/ERROR_AUDIT_REPORT.md`](./docs/ERROR_AUDIT_REPORT.md) for current issues and fixes.- **Spacing**: 24px sections, 16px cards

- **Border Radius**: 16px cards, 12px buttons

---

### Figma Design

## 📝 LicenseSee [`FIGMA_DESIGN_GUIDE.md`](./FIGMA_DESIGN_GUIDE.md) for design integration.



This project is proprietary software for ThietKeResort.---



---## 📦 Key Dependencies



## 👥 Team```json

{

- **Frontend Development:** React Native + Expo  "expo": "~54.0.0",

- **Backend API:** Perfex CRM (PHP/CodeIgniter)  "expo-router": "^4.0.0",

- **Video Calls:** LiveKit/Agora  "react-native": "0.76.0",

- **Documentation:** GitHub Copilot  "typescript": "^5.3.0",

  "expo-auth-session": "~6.0.0",

---  "expo-secure-store": "~14.0.0",

  "expo-linear-gradient": "~14.0.0"

## 📞 Support}

```

For questions and support:

- 📧 Email: support@thietkeresort.com.vn---

- 📚 Documentation: [`./docs/`](./docs)

- 🐛 Issues: See error logs and documentation## 🧪 Testing



---```bash

# Type checking

**Built with ❤️ using Expo + React Native + TypeScript**npx tsc --noEmit


# Linting
npm run lint

# Clear cache
npx expo start -c
```

---

## 📱 Build & Deploy

### Development Build
```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Production Build
```bash
# iOS
eas build --profile production --platform ios

# Android  
eas build --profile production --platform android
```

### Submit to Stores
```bash
# App Store
eas submit --platform ios

# Play Store
eas submit --platform android
```

---

## 📖 Documentation

- [`CLEAN_ARCHITECTURE_PLAN.md`](./CLEAN_ARCHITECTURE_PLAN.md) - Architecture principles
- [`API_REQUIREMENTS.md`](./API_REQUIREMENTS.md) - Required backend APIs
- [`FIGMA_DESIGN_GUIDE.md`](./FIGMA_DESIGN_GUIDE.md) - Design integration
- [`APP_STRUCTURE_CURRENT.md`](./APP_STRUCTURE_CURRENT.md) - Current state
- [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) - AI coding guidelines

---

## 🤝 Contributing

### Frontend Team
1. Fork repository
2. Create feature branch
3. Follow TypeScript strict mode
4. No `as any` casts
5. Use existing UI components
6. Submit PR with description

### Backend Team
- See [`API_REQUIREMENTS.md`](./API_REQUIREMENTS.md) for required endpoints
- This repo is **frontend only** - no backend code here

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: `Route GET:/auth/me not found`  
**Fix**: Backend endpoint not implemented yet. See `API_REQUIREMENTS.md`

**Issue**: Google Sign-In not working  
**Fix**: Check `EXPO_PUBLIC_GOOGLE_CLIENT_ID` in `.env`

**Issue**: Build errors after pulling  
**Fix**: 
```bash
rm -rf node_modules
npm install
npx expo start -c
```

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/minhtien2412tran/APP_DESIGN_BUILD/issues)
- **Discussions**: [GitHub Discussions](https://github.com/minhtien2412tran/APP_DESIGN_BUILD/discussions)

---

## 📄 License

[Your License Here]

---

## ✨ Features

- ✅ Email/Password Authentication
- ✅ Google OAuth Login
- ✅ User Profile Management
- ✅ Project Management
- ✅ Real-time Notifications (frontend ready)
- ✅ Video Call Integration (Agora)
- ✅ Dark Theme
- ⏳ Figma Design Integration (pending specs)

---

**Frontend Status**: ✅ Ready for production  
**Backend Status**: ⏳ Some endpoints pending

Last Updated: January 22, 2025
