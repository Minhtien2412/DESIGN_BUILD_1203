# 🏗️ Construction Management Platform

**Modern mobile app built with Expo Router (SDK 54) + React Native 19 + TypeScript**

[![Tests](https://img.shields.io/badge/tests-733%2F735%20passing-brightgreen)](https://github.com)
[![TypeScript](https://img.shields.io/badge/typescript-0%20errors-blue)](https://github.com)
[![Production](https://img.shields.io/badge/production-live-green)](https://baotienweb.cloud)

## 🌐 Production URLs

| Service      | URL                                    |
| ------------ | -------------------------------------- |
| **API**      | https://baotienweb.cloud/api/v1        |
| **Frontend** | https://app.baotienweb.cloud           |
| **API Docs** | https://baotienweb.cloud/api/docs      |
| **Health**   | https://baotienweb.cloud/api/v1/health |

## 📁 Project Structure

```
📦 APP_DESIGN_BUILD05.12.2025/
├── 📱 app/                    # Expo Router screens (630+ files)
├── 🧩 components/             # UI components
├── 🎣 hooks/                  # Custom hooks
├── 🔧 services/               # API & business logic (200+ services)
├── 📊 context/                # State management
├── 🎨 constants/              # Design system
├── 🎯 types/                  # TypeScript types
├── 🛠️ utils/                  # Helpers
├── 📦 assets/                 # Images & fonts
├── 🏗️ config/                 # Configuration
├── 📚 docs/                   # Documentation (150+ guides)
├── 🧪 __tests__/              # Jest tests (32 suites, 735 tests)
└── 🔙 BE-baotienweb.cloud/    # NestJS Backend API
```

## � Environment Setup

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

**Required variables** (app will not function without these):

| Variable                       | Description          |
| ------------------------------ | -------------------- |
| `EXPO_PUBLIC_API_KEY`          | Fastify API key      |
| `EXPO_PUBLIC_API_URL`          | Backend API base URL |
| `EXPO_PUBLIC_WS_URL`           | WebSocket server URL |
| `EXPO_PUBLIC_PERFEX_API_TOKEN` | Perfex CRM JWT token |
| `EXPO_PUBLIC_PERFEX_API_KEY`   | Perfex CRM API key   |
| `EXPO_PUBLIC_GETOTP_API_KEY`   | GetOTP service key   |

See `.env.example` for the full list including optional AI, LiveKit, and cloud storage keys.

> **⚠️ Never commit real secrets.** All sensitive values must live in `.env` (git-ignored).

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# ➡️ Edit .env with your real keys

# Start development server
npm start

# Run tests
npm test

# TypeScript check
npx tsc -p tsconfig.app.json --noEmit

# ESLint
npm run lint
```

## 📊 Quality Metrics

| Metric         | Status                      |
| -------------- | --------------------------- |
| **Tests**      | 733/735 passing (99.7%)     |
| **TypeScript** | 0 errors                    |
| **ESLint**     | 925 warnings (non-blocking) |
| **Production** | ✅ Live & Healthy           |

## 🔑 Key Features

- ✅ **Authentication** - Phone OTP, Biometric, Social login
- ✅ **Project Management** - Construction tracking, timelines
- ✅ **CRM Integration** - Perfex CRM sync
- ✅ **Video/Reels** - TikTok-style video feed
- ✅ **Real-time Chat** - WebSocket messaging
- ✅ **Video Calls** - LiveKit integration
- ✅ **AI Assistant** - OpenAI/Gemini powered
- ✅ **Offline Support** - Queue & sync system
- ✅ **Push Notifications** - FCM integration

## 📱 Build for Device

```bash
# Android APK (development)
npx eas build --platform android --profile development

# Android APK (preview)
npx eas build --platform android --profile preview

# iOS (requires Apple Developer account)
npx eas build --platform ios --profile development
```

## 📖 Documentation

See [docs/](docs/) folder for comprehensive documentation:

- [API Integration Guide](docs/API_INTEGRATION_GUIDE.md)
- [Authentication Guide](docs/AUTH_PERMISSION_COMPLETE_GUIDE.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Quick Start](docs/QUICK_START.md)

---

**Last Updated**: January 23, 2026 | **Version**: 4.1
