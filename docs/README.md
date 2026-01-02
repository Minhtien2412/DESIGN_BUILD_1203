# 📚 Documentation Index

Complete documentation for the Expo + NestJS Construction Management Application.

**Project:** Baotienweb Construction Platform  
**Last Updated:** December 24, 2025

---

## 🎯 Quick Links

### For Developers
- [API Reference](./API_REFERENCE.md) - Complete backend API documentation
- [UI Components](./UI_COMPONENTS.md) - Frontend component library guide
- [Integration Guide](./INTEGRATION_GUIDE.md) - Connect FE ↔️ BE

### For Testers
- [Frontend Testing Checklist](./FRONTEND_TESTING_CHECKLIST.md) - 36 manual test cases
- [Backend Test Script](../test-backend-complete.ps1) - Automated API tests

### For Deployment
- [Testing Instructions](../TESTING_INSTRUCTIONS.md) - Quick deployment verification
- [Integration Guide - Deployment](./INTEGRATION_GUIDE.md#deployment-workflow)

---

## 📖 Documentation Overview

### 1. [API_REFERENCE.md](./API_REFERENCE.md)

**Complete Backend API Documentation**

**Contents:**
- System Health endpoints
- Authentication (register, login, refresh, logout)
- User management (profile, change password)
- Products API (list, detail, filtering)
- Projects API (list, detail, authenticated)
- Error codes and rate limiting

**Key Features:**
- 8 user roles: CLIENT, ENGINEER, CONTRACTOR, STAFF, ARCHITECT, DESIGNER, SUPPLIER, ADMIN
- JWT authentication with refresh tokens
- Pagination and filtering
- Comprehensive error responses

**Use When:**
- Building new API clients
- Integrating with mobile app
- Troubleshooting API errors
- Understanding authentication flow

---

### 2. [UI_COMPONENTS.md](./UI_COMPONENTS.md)

**Frontend Component Library & Design System**

**Contents:**
- Design tokens (colors, typography, spacing)
- UI component library (Button, Input, Card, etc.)
- Screen components (Auth, Home, Cart, Profile)
- Navigation structure
- State management (AuthContext, CartContext)
- Best practices and code style

**Key Features:**
- Shopee-inspired mobile UI
- Light/Dark theme support
- 8 role selection with staff secret validation
- Cart persistence with SecureStore
- Type-safe navigation helpers

**Use When:**
- Creating new screens
- Building reusable components
- Implementing consistent styling
- Understanding app structure

---

### 3. [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

**Connecting Frontend with Backend**

**Contents:**
- Architecture overview with diagrams
- Environment configuration (dev/staging/prod)
- API integration patterns
- Authentication flow
- Data flow examples
- Error handling strategies
- Deployment workflows

**Key Features:**
- Step-by-step integration guides
- Code examples for common tasks
- Security best practices
- EAS Build configuration

**Use When:**
- Setting up new environments
- Troubleshooting API integration
- Deploying to production
- Implementing new features

---

### 4. [FRONTEND_TESTING_CHECKLIST.md](./FRONTEND_TESTING_CHECKLIST.md)

**Manual Testing Guide (36 Test Cases)**

**Contents:**
- Authentication testing (8 test cases)
- Home screen testing (4 test cases)
- Product detail testing (4 test cases)
- Cart testing (6 test cases)
- Projects testing (3 test cases)
- Notifications testing (2 test cases)
- Profile testing (4 test cases)
- UI/UX testing (5 test cases)

**Key Features:**
- Checkbox format for easy tracking
- Expected results for each test
- Bug tracking template
- Sign-off section

**Use When:**
- Before production release
- After major feature additions
- Regression testing
- QA handoff

---

### 5. [test-backend-complete.ps1](../test-backend-complete.ps1)

**Automated Backend API Test Script**

**Tests:**
- Health check
- 8 role registrations (CLIENT → ADMIN)
- Login authentication
- User profile retrieval
- Products API
- Projects API

**Features:**
- Colored console output
- Pass/fail statistics
- JSON report export
- Automatic token management

**Run:**
```powershell
cd "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025"
.\test-backend-complete.ps1
```

---

## 🚀 Getting Started Guides

### For New Developers

**1. Setup Development Environment:**
```bash
# Clone repository
git clone <repo-url>

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm start
```

**2. Read Documentation in Order:**
1. [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md#architecture-overview) - Understand architecture
2. [API_REFERENCE.md](./API_REFERENCE.md) - Learn API endpoints
3. [UI_COMPONENTS.md](./UI_COMPONENTS.md) - Explore component library
4. Review project structure in VS Code

**3. Run First Test:**
```powershell
# Test backend connectivity
.\test-backend-complete.ps1

# Start mobile app
npm start
# Press 'a' for Android
```

---

### For Testers

**1. Setup Test Environment:**
```bash
# Ensure backend is running
# SSH to VPS: ssh root@103.200.20.100
pm2 status

# Start mobile app
npm start
```

**2. Follow Testing Checklist:**
- Open [FRONTEND_TESTING_CHECKLIST.md](./FRONTEND_TESTING_CHECKLIST.md)
- Complete all 36 test cases
- Document bugs in template
- Calculate pass rate

**3. Run Automated Backend Tests:**
```powershell
.\test-backend-complete.ps1
```

---

### For DevOps/Deployment

**1. Backend Deployment:**
```bash
# Build backend
cd BE-baotienweb.cloud
npm run build

# Create deployment package
cd ..
.\compress-backend.ps1

# Upload to VPS
scp deploy-complete.zip root@103.200.20.100:/tmp/

# Extract and restart
ssh root@103.200.20.100
bash deploy-on-vps.sh
pm2 restart baotienweb-api
```

**2. Frontend Deployment (EAS):**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build for production
eas build --platform android --profile production
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

**3. Verify Deployment:**
- Run `test-backend-complete.ps1`
- Check all API tests pass
- Test mobile app on device
- Verify authentication flow

**Full guide:** [INTEGRATION_GUIDE.md#deployment-workflow](./INTEGRATION_GUIDE.md#deployment-workflow)

---

## 📊 Documentation Coverage

| Area | Status | Files |
|------|--------|-------|
| **Backend API** | ✅ Complete | API_REFERENCE.md |
| **Frontend UI** | ✅ Complete | UI_COMPONENTS.md |
| **Integration** | ✅ Complete | INTEGRATION_GUIDE.md |
| **Testing (FE)** | ✅ Complete | FRONTEND_TESTING_CHECKLIST.md |
| **Testing (BE)** | ✅ Complete | test-backend-complete.ps1 |
| **Deployment** | ✅ Complete | INTEGRATION_GUIDE.md (section) |
| **Architecture** | ✅ Complete | INTEGRATION_GUIDE.md (diagrams) |
| **Security** | ✅ Complete | INTEGRATION_GUIDE.md (section) |

---

## 🔍 Find Documentation By Task

### "I want to..."

**...understand the system architecture**
→ [INTEGRATION_GUIDE.md#architecture-overview](./INTEGRATION_GUIDE.md#architecture-overview)

**...integrate login functionality**
→ [INTEGRATION_GUIDE.md#authentication-flow](./INTEGRATION_GUIDE.md#authentication-flow)  
→ [API_REFERENCE.md#authentication-endpoints](./API_REFERENCE.md#authentication-endpoints)

**...build a new screen**
→ [UI_COMPONENTS.md#screen-template](./UI_COMPONENTS.md#screen-template)  
→ [UI_COMPONENTS.md#ui-components-library](./UI_COMPONENTS.md#ui-components-library)

**...style a component**
→ [UI_COMPONENTS.md#design-tokens](./UI_COMPONENTS.md#design-tokens)  
→ [UI_COMPONENTS.md#best-practices](./UI_COMPONENTS.md#best-practices)

**...fetch data from API**
→ [INTEGRATION_GUIDE.md#data-flow-examples](./INTEGRATION_GUIDE.md#data-flow-examples)  
→ [API_REFERENCE.md](./API_REFERENCE.md)

**...handle API errors**
→ [INTEGRATION_GUIDE.md#error-handling](./INTEGRATION_GUIDE.md#error-handling)  
→ [API_REFERENCE.md#error-codes](./API_REFERENCE.md#error-codes)

**...test the application**
→ [FRONTEND_TESTING_CHECKLIST.md](./FRONTEND_TESTING_CHECKLIST.md)  
→ [test-backend-complete.ps1](../test-backend-complete.ps1)

**...deploy to production**
→ [INTEGRATION_GUIDE.md#deployment-workflow](./INTEGRATION_GUIDE.md#deployment-workflow)

**...understand user roles**
→ [API_REFERENCE.md#register-user](./API_REFERENCE.md#register-user)  
→ [UI_COMPONENTS.md#sign-up-screen](./UI_COMPONENTS.md#sign-up-screen)

---

## 📝 Maintenance

### Updating Documentation

When making changes to the codebase:

1. **New API Endpoint Added:**
   - Update [API_REFERENCE.md](./API_REFERENCE.md)
   - Add request/response examples
   - Update error codes if new ones added
   - Add to [test-backend-complete.ps1](../test-backend-complete.ps1)

2. **New UI Component Created:**
   - Document in [UI_COMPONENTS.md](./UI_COMPONENTS.md)
   - Include props interface
   - Show usage examples
   - Add to component library section

3. **New Screen Added:**
   - Update [UI_COMPONENTS.md#screen-components](./UI_COMPONENTS.md#screen-components)
   - Add navigation route
   - Create test cases in [FRONTEND_TESTING_CHECKLIST.md](./FRONTEND_TESTING_CHECKLIST.md)

4. **Authentication Changed:**
   - Update [API_REFERENCE.md#authentication](./API_REFERENCE.md#authentication-endpoints)
   - Update [INTEGRATION_GUIDE.md#authentication-flow](./INTEGRATION_GUIDE.md#authentication-flow)
   - Update auth test cases

5. **Deployment Process Changed:**
   - Update [INTEGRATION_GUIDE.md#deployment-workflow](./INTEGRATION_GUIDE.md#deployment-workflow)
   - Update scripts if necessary
   - Document new environment variables

---

## 🎓 Learning Resources

### External Documentation

- **Expo Router:** https://docs.expo.dev/router/introduction/
- **React Native:** https://reactnative.dev/docs/getting-started
- **NestJS:** https://docs.nestjs.com/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **TypeScript:** https://www.typescriptlang.org/docs/

### Video Tutorials

- Expo Router Navigation: https://www.youtube.com/expo
- NestJS Authentication: https://www.youtube.com/nestjs
- React Native Animations: https://www.youtube.com/reanimated

---

## 💬 Support

### Documentation Issues

If you find errors or unclear sections in documentation:

1. **Check latest version:** Ensure you have the most recent docs
2. **Search existing issues:** Someone may have already reported it
3. **Create issue:** Include:
   - Document name and section
   - What's unclear or incorrect
   - Suggested improvement
   - Your environment details

### Getting Help

- **API Questions:** Reference [API_REFERENCE.md](./API_REFERENCE.md) first
- **UI Questions:** Check [UI_COMPONENTS.md](./UI_COMPONENTS.md) examples
- **Integration Issues:** See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) troubleshooting
- **Testing Help:** Follow [FRONTEND_TESTING_CHECKLIST.md](./FRONTEND_TESTING_CHECKLIST.md) step-by-step

---

## 🏆 Documentation Quality

This documentation aims to be:

✅ **Comprehensive** - Covers all major features  
✅ **Practical** - Includes code examples  
✅ **Searchable** - Clear section headers  
✅ **Up-to-date** - Reflects current codebase  
✅ **Beginner-friendly** - Clear explanations  
✅ **Well-organized** - Logical structure

---

**Documentation Version:** 1.0.0  
**Last Updated:** December 24, 2025  
**Next Review:** March 2026
