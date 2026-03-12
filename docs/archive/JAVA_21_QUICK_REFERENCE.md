# Java 21 Quick Reference

## ✅ Upgrade Complete!

Your Expo React Native Android project is now configured to use **Java 21 LTS**.

## Current Setup

- **Java Version:** 21.0.8 (Microsoft OpenJDK LTS)
- **JDK Location:** `C:\Users\Admin\.jdk\jdk-21.0.8`
- **Gradle:** 8.14.3
- **Kotlin:** 2.0.21

## Build Commands

```powershell
# Navigate to android directory first
cd android

# Check Gradle & Java version
./gradlew --version

# Clean build
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# List all available tasks
./gradlew tasks
```

## From Project Root

```powershell
# Run on Android (development)
npm run android

# Build APK
npm run build:android
```

## Configuration Files Modified

1. ✅ `android/gradle.properties` - Java home and version
2. ✅ `android/build.gradle` - Global Java config
3. ✅ `android/app/build.gradle` - App-level Java & Kotlin config

## Verification Script

Run anytime to check Java setup:
```powershell
./verify-java21.ps1
```

## Troubleshooting

### Issue: Gradle uses wrong Java version
**Solution:** Set JAVA_HOME environment variable:
```powershell
setx JAVA_HOME "C:\Users\Admin\.jdk\jdk-21.0.8"
```
Then restart terminal/IDE.

### Issue: Build fails with Java errors
**Solution 1:** Clean and rebuild:
```powershell
cd android
./gradlew clean
./gradlew assembleDebug
```

**Solution 2:** Stop Gradle daemons:
```powershell
cd android
./gradlew --stop
```

### Issue: Need to switch back to Java 17
Edit `android/gradle.properties`:
```properties
# org.gradle.java.home=C:/Users/Admin/.jdk/jdk-21.0.8
android.javaVersion=17
```

## Java 21 Features Available

✨ **Virtual Threads** - Lightweight concurrency
✨ **Record Patterns** - Enhanced pattern matching
✨ **Sequenced Collections** - New collection APIs
✨ **String Templates** (Preview) - Better string handling
✨ **Performance improvements** across the board

## Next Steps

1. ✅ Java 21 is configured
2. ✅ Gradle builds successfully
3. 🔄 Test your app: `npm run android`
4. 🚀 Build production APK when ready

## Documentation

- [Java 21 Release Notes](https://openjdk.org/projects/jdk/21/)
- [Android Gradle Plugin](https://developer.android.com/build/jdks)
- Full report: `JAVA_21_UPGRADE_REPORT.md`

---
**Status:** ✅ Ready for Development
**Date:** December 22, 2025
