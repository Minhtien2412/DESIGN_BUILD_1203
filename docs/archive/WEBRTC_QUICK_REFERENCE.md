# WebRTC End-to-End Testing - Quick Reference

## 🚀 Deployment Commands (Chọn 1)

### Option A: PowerShell (Windows)
```powershell
.\deploy-backend-webrtc.ps1
```

### Option B: Bash (Linux/Mac)
```bash
chmod +x deploy-backend-webrtc.sh
./deploy-backend-webrtc.sh
```

### Option C: Manual SSH
```bash
# 1. Upload files
scp BE-baotienweb.cloud/src/call/*.ts root@baotienweb.cloud:/var/www/baotienweb.cloud/BE-baotienweb.cloud/src/call/

# 2. SSH và build
ssh root@baotienweb.cloud
cd /var/www/baotienweb.cloud/BE-baotienweb.cloud
npm run build
pm2 restart baotienweb-api
pm2 logs baotienweb-api --lines 50
```

---

## 📱 Build & Test Commands

### Build Development Build
```bash
# Android (nhanh nhất)
npx expo run:android

# iOS (Mac only)
npx expo run:ios

# Cloud build (chậm hơn nhưng không cần setup)
eas build --profile development --platform android
```

### Start Dev Server
```bash
npx expo start --dev-client
```

---

## 🧪 Test Flow (2 Devices Required)

### Device 1 (User A)
1. Login: `testuser@baotienweb.cloud` / `Test123456`
2. Navigate: Home → Contacts
3. Tap video call icon on User B
4. Wait for connection

### Device 2 (User B)
1. Login: `testuser2@baotienweb.cloud` / `Test123456`
2. Wait for incoming call
3. Accept call
4. Check video/audio

### Verify
- ✅ Local video hiển thị (góc trên, nhỏ)
- ✅ Remote video hiển thị (full screen)
- ✅ Audio 2 chiều
- ✅ Controls hoạt động (mute, video, speaker, flip)
- ✅ End call → về màn hình cũ

---

## 🔍 Debugging Commands

### Check Backend Logs
```bash
ssh root@baotienweb.cloud 'pm2 logs baotienweb-api --lines 100'
```

### Check WebSocket Connection
```bash
# Install wscat nếu chưa có
npm install -g wscat

# Test connection
wscat -c wss://baotienweb.cloud/call
```

### Check Frontend Logs
```bash
# Trong terminal đang chạy expo start
# Logs sẽ hiện tự động khi app chạy
```

### Check App Errors
- Shake device → Dev Menu → Debug Remote JS
- Chrome DevTools will open
- Check Console tab

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "WebRTC not available" | Build development build (not Expo Go) |
| "Cannot connect to server" | Check Backend running: `pm2 status` |
| No video stream | Check camera permissions |
| No audio | Check microphone permissions |
| Connection timeout | Add TURN server (see docs) |
| "Call not found" error | Backend chưa deploy fixes |

---

## 📋 Files Modified

### Backend
- `BE-baotienweb.cloud/src/call/call.gateway.ts` ✅
- `BE-baotienweb.cloud/src/call/call.service.ts` ✅

### Frontend
- `context/CallContext.tsx` ✅
- `utils/VideoCallManager.ts` ✅
- `components/call/ActiveCallScreen.tsx` ✅
- `utils/webrtc.ts` ✅

---

## ✅ Deployment Checklist

Pre-deployment:
- [x] Backend fixes coded
- [x] Deploy scripts created
- [ ] Backend deployed to VPS
- [ ] Backend logs verified
- [ ] WebSocket connection tested

Testing:
- [ ] Development build created
- [ ] Installed on 2 devices
- [ ] Test users can login
- [ ] Video call end-to-end tested
- [ ] All controls tested

Production Ready:
- [ ] TURN server setup
- [ ] SSL/WSS verified
- [ ] CORS configured properly
- [ ] Production build created
- [ ] Performance tested

---

## 📞 Support

**Logs Location:**
- Backend: SSH → `pm2 logs baotienweb-api`
- Frontend: Expo dev server console
- App: Device shake → Dev menu → Logs

**Documentation:**
- Full guide: `WEBRTC_BACKEND_FIXES.md`
- Build guide: `BUILD_DEVELOPMENT_BUILD.md`
- Implementation: `WEBRTC_IMPLEMENTATION.md`

---

**Last Updated:** 2025-12-19  
**Status:** Ready for deployment
