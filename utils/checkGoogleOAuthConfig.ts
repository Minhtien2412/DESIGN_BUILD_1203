/**
 * Google OAuth Configuration Checker
 * Run this to verify your setup before testing
 */

import ENV from "@/config/env";
import Constants from "expo-constants";
import { Platform } from "react-native";

export function checkGoogleOAuthConfig() {
  console.log("\n========================================");
  console.log("🔍 GOOGLE OAUTH CONFIGURATION CHECK");
  console.log("========================================\n");

  const config = {
    clientId: (ENV as any).GOOGLE_CLIENT_ID,
    webClientId: (ENV as any).GOOGLE_WEB_CLIENT_ID,
    androidClientId: (ENV as any).GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: (ENV as any).GOOGLE_IOS_CLIENT_ID,
  };

  let hasErrors = false;

  // Check Web Client ID
  console.log("📱 Platform:", Platform.OS);
  console.log("");

  console.log("1. Web Client ID (Bắt buộc)");
  if (config.webClientId || config.clientId) {
    console.log("   ✅ Configured");
  } else {
    console.log("   ❌ MISSING! Add EXPO_PUBLIC_GOOGLE_CLIENT_ID to .env");
    hasErrors = true;
  }
  console.log("");

  // Check Android Client ID
  console.log("2. Android Client ID");
  if (Platform.OS === "android") {
    if (config.androidClientId) {
      console.log("   ✅ Configured");
    } else {
      console.log("   ⚠️  MISSING! Using web client ID as fallback");
      console.log("   ⚠️  Google Sign-in may not work properly");
      console.log("   ⚠️  Add EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID to .env");
    }
  } else {
    console.log("   ⏭️  Skipped (not on Android)");
  }
  console.log("");

  // Check iOS Client ID
  console.log("3. iOS Client ID");
  if (Platform.OS === "ios") {
    if (config.iosClientId) {
      console.log("   ✅ Configured");
    } else {
      console.log("   ⚠️  MISSING! Using web client ID as fallback");
      console.log("   ⚠️  Google Sign-in may not work properly");
      console.log("   ⚠️  Add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID to .env");
    }
  } else {
    console.log("   ⏭️  Skipped (not on iOS)");
  }
  console.log("");

  // Check if running in Expo Go
  console.log("4. Runtime Environment");
  const isExpoGo = Constants.appOwnership === "expo";
  if (isExpoGo) {
    console.log("   ⚠️  Running in Expo Go");
    console.log("   ⚠️  Google OAuth may not work fully");
    console.log("   ⚠️  Recommended: Build development build");
    console.log(
      "   ⚠️  Command: eas build --profile development --platform",
      Platform.OS,
    );
  } else {
    console.log("   ✅ Running in Development Build or Standalone App");
  }
  console.log("");

  // Check package name / bundle ID
  console.log("5. App Identifier");
  const androidPackage = Constants.expoConfig?.android?.package;
  const iosBundleId = Constants.expoConfig?.ios?.bundleIdentifier;

  if (Platform.OS === "android" && androidPackage) {
    console.log("   Android Package:", androidPackage);
    if (androidPackage === "com.adminmarketingnx.APP_DESIGN_BUILD") {
      console.log("   ✅ Matches expected package name");
    } else {
      console.log(
        "   ⚠️  Different from expected: com.adminmarketingnx.APP_DESIGN_BUILD",
      );
      console.log("   ⚠️  Make sure Android Client ID uses this package name");
    }
  } else if (Platform.OS === "ios" && iosBundleId) {
    console.log("   iOS Bundle ID:", iosBundleId);
    if (iosBundleId === "com.adminmarketingnx.APP_DESIGN_BUILD") {
      console.log("   ✅ Matches expected bundle ID");
    } else {
      console.log(
        "   ⚠️  Different from expected: com.adminmarketingnx.APP_DESIGN_BUILD",
      );
      console.log("   ⚠️  Make sure iOS Client ID uses this bundle ID");
    }
  }
  console.log("");

  // Summary
  console.log("========================================");
  if (hasErrors) {
    console.log("❌ CONFIGURATION INCOMPLETE");
    console.log("========================================");
    console.log("");
    console.log("Next steps:");
    console.log("1. Run: .\\scripts\\get-sha1.ps1");
    console.log("2. Create OAuth Client IDs on Google Cloud Console");
    console.log("3. Update .env with all 3 Client IDs");
    console.log("4. Restart Metro: npx expo start -c");
    console.log("5. Build development build if needed");
  } else {
    console.log("✅ CONFIGURATION LOOKS GOOD!");
    console.log("========================================");
    console.log("");
    if (isExpoGo) {
      console.log("⚠️  Note: Still running in Expo Go");
      console.log("   For full OAuth support, build development build:");
      console.log("   eas build --profile development --platform", Platform.OS);
    } else {
      console.log("✅ Ready to test Google Sign-in!");
    }
  }
  console.log("");
}

// Auto-run on import in development
if (__DEV__) {
  checkGoogleOAuthConfig();
}
