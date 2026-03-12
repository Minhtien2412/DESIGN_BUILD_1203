# Android Emulator & WebRTC Testing Guide

## Problem: Emulator Connection Refused

```
Error: could not connect to TCP port 5554
Error code 10061: Connection refused
```

---

## Quick Fixes

### Option 1: Use Physical Device (RECOMMENDED for WebRTC)

**Why?** WebRTC cần camera và microphone thật để test video call.

**Steps:**
```bash
# 1. Run fix script
.\fix-emulator.ps1

# 2. Choose option 2 (Physical device)

# 3. Follow on-screen instructions:
#    - Connect phone via USB
#    - Enable Developer Options
#    - Enable USB Debugging
#    - Accept debugging prompt

# 4. Verify device connected
adb devices
# Should show: <device-id>  device

# 5. Build & install
npm run run:dev:android
```

---

### Option 2: Fix Emulator Connection

**Why?** Emulator port 5554 bị stuck hoặc ADB server lỗi.

**Steps:**
```bash
# 1. Run fix script
.\fix-emulator.ps1

# 2. Choose option 3 (Kill all processes)

# 3. Choose option 1 (Start emulator)

# 4. Select AVD from list

# 5. Wait for emulator to boot

# 6. Build & install
npm run run:dev:android
```

---

### Option 3: Manual Fix

**Kill stuck processes:**
```powershell
# Kill ADB
Get-Process | Where-Object {$_.ProcessName -eq "adb"} | Stop-Process -Force

# Kill emulator
Get-Process | Where-Object {$_.ProcessName -like "*emulator*"} | Stop-Process -Force

# Restart ADB
cd $env:LOCALAPPDATA\Android\Sdk\platform-tools
.\adb kill-server
.\adb start-server
```

**Start emulator manually:**
```powershell
cd $env:LOCALAPPDATA\Android\Sdk\emulator

# List available emulators
.\emulator.exe -list-avds

# Start specific emulator
.\emulator.exe -avd <AVD_NAME>
```

---

## WebRTC Testing Requirements

### ⚠️ Important Limitations

| Platform | Camera | Microphone | WebRTC | Recommended |
|----------|--------|------------|--------|-------------|
| Expo Go | ❌ | ❌ | ❌ | ❌ No |
| Emulator | ⚠️ Virtual | ⚠️ Virtual | ⚠️ Limited | ❌ No |
| Physical Device | ✅ Real | ✅ Real | ✅ Full | ✅ YES |

**Best Practice:** Always test WebRTC on **2 physical devices**

---

## Complete Testing Workflow

### Step 1: Build Development Build
```bash
# Option A: Build locally (faster)
npm run run:dev:android
# Takes: 5-10 minutes first time

# Option B: Build on EAS Cloud (slower)
eas build --profile development --platform android
# Takes: 15-20 minutes
```

### Step 2: Install on 2 Devices
```bash
# Device 1
adb -s <device-1-id> install app-build.apk

# Device 2  
adb -s <device-2-id> install app-build.apk

# Or install manually:
# 1. Copy APK to phone
# 2. Open file manager
# 3. Tap APK to install
```

### Step 3: Deploy Backend
```bash
# Fix backend signaling
.\deploy-backend-webrtc.ps1

# Verify deployment
ssh root@baotienweb.cloud 'pm2 logs baotienweb-api --lines 50'
```

### Step 4: Test Video Call
```
Device 1:
1. Open app
2. Login: testuser@baotienweb.cloud / Test123456
3. Navigate: Home > Contacts
4. Tap video call icon on User B

Device 2:
1. Open app
2. Login: testuser2@baotienweb.cloud / Test123456
3. Wait for incoming call
4. Accept call

Expected Result:
✅ Both devices show video streams
✅ Audio works both ways
✅ Controls work (mute, video off, flip camera)
✅ Call ends gracefully
```

---

## Troubleshooting

### Issue: "Device not found"
```bash
# Check USB debugging enabled
adb devices

# Should show:
# List of devices attached
# <serial>    device

# If "unauthorized":
# - Check phone screen for authorization dialog
# - Unplug/replug USB cable
```

### Issue: "Build failed - SDK not found"
```bash
# Set ANDROID_HOME environment variable
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:PATH"

# Verify
echo $env:ANDROID_HOME
```

### Issue: "Emulator boots but app won't install"
```bash
# Wait for full boot
adb wait-for-device

# Check device is fully booted
adb shell getprop sys.boot_completed
# Should return: 1

# Try install again
npm run run:dev:android
```

### Issue: "WebRTC not working on emulator"
**Solution:** Use physical device. Emulator không support WebRTC đầy đủ.

---

## Scripts Available

| Script | Purpose | Usage |
|--------|---------|-------|
| `fix-emulator.ps1` | Fix emulator connection | `.\fix-emulator.ps1` |
| `deploy-backend-webrtc.ps1` | Deploy backend fixes | `.\deploy-backend-webrtc.ps1` |
| `npm run run:dev:android` | Build & install on device | Auto-detects device |

---

## Quick Commands Reference

```bash
# List connected devices
adb devices

# List emulators
emulator -list-avds

# Start specific emulator
emulator -avd <name>

# Install APK
adb install <path-to-apk>

# View device logs
adb logcat | grep -i "expo"

# Clear app data
adb shell pm clear com.adminmarketingnx.APP_DESIGN_BUILD

# Restart ADB
adb kill-server && adb start-server
```

---

## Next Steps After Successful Build

1. ✅ App installed on device
2. ✅ Permissions granted (Camera, Location, Notifications)
3. ✅ Backend deployed with WebRTC fixes
4. 🧪 Test video call between 2 devices
5. 📊 Monitor logs for errors
6. 🔧 Setup TURN server for production (optional)

---

**Created:** December 19, 2025  
**Status:** Ready for Testing
