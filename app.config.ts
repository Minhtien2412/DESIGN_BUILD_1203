import { existsSync } from "fs";
import { join } from "path";

// Detect Firebase config files
const ANDROID_GOOGLE_SERVICES = join(
  __dirname,
  "android",
  "app",
  "google-services.json",
);
const IOS_GOOGLE_SERVICES = join(__dirname, "ios", "GoogleService-Info.plist");
const HAS_ANDROID_GOOGLE_SERVICES = existsSync(ANDROID_GOOGLE_SERVICES);
const HAS_IOS_GOOGLE_SERVICES = existsSync(IOS_GOOGLE_SERVICES);

const IS_DEV = process.env.NODE_ENV !== "production";
// Default dev API points to local backend; mock server remains opt-in via .env
const DEV_API_URL = "http://127.0.0.1:4000";
// NOTE: Nginx proxies /api/* to /api/v1/*, so do NOT include /v1 here
const PROD_API_URL = "https://baotienweb.cloud/api";
const ENV_API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || PROD_API_URL;

export default function getConfig(props) {
  const { config } = props;
  return {
    ...config,
    expo: {
      name: "APP_DESIGN_BUILD",
      slug: "APP_DESIGN_BUILD",
      version: "1.0.0",
      orientation: "default",
      icon: "./assets/images/icon.png",
      scheme: "appdesignbuild",
      userInterfaceStyle: "automatic",
      // Enable New Architecture for Expo Go/dev build parity
      newArchEnabled: true,

      // Android status bar: match splash backgroundColor to avoid flash on launch
      androidStatusBar: {
        barStyle: "dark-content",
        backgroundColor: "#ffffff",
        translucent: true,
      },

      // Android navigation bar styling
      androidNavigationBar: {
        visible: "sticky-immersive",
        backgroundColor: "#1a1a2e",
      },

      // Disable advanced Metro symbolication to prevent InternalBytecode.js ENOENT errors
      _internal: {
        isDebug: process.env.NODE_ENV === "development",
      },

      ios: {
        supportsTablet: true,
        infoPlist: {
          NSCameraUsageDescription:
            "Ứng dụng cần quyền camera để quay video, chụp ảnh và gọi video.",
          NSMicrophoneUsageDescription:
            "Ứng dụng cần quyền micro để ghi âm khi quay video hoặc gọi video.",
          NSPhotoLibraryUsageDescription:
            "Ứng dụng cần quyền truy cập thư viện ảnh để chọn và lưu ảnh/video.",
          NSLocationWhenInUseUsageDescription:
            "Ứng dụng dùng vị trí của bạn để gắn địa điểm vào bài đăng.",
          NSFaceIDUsageDescription:
            "Ứng dụng sử dụng Face ID để xác thực sinh trắc học và tăng cường bảo mật.",
          // Notification permissions
          UNUserNotificationCenter: {
            UNNotificationPresentationOptions: {
              alert: true,
              badge: true,
              sound: true,
            },
          },
        },
        // Firebase iOS config (if present)
        googleServicesFile: HAS_IOS_GOOGLE_SERVICES
          ? "./ios/GoogleService-Info.plist"
          : undefined,
      },

      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/images/android-icon-foreground.png",
          backgroundImage: "./assets/images/android-icon-background.png",
          monochromeImage: "./assets/images/android-icon-monochrome.png",
        },
        package: "com.adminmarketingnx.APP_DESIGN_BUILD",
        softwareKeyboardLayoutMode: "pan",

        // Enhanced permissions for full functionality
        permissions: [
          // Camera & Media
          "android.permission.CAMERA",
          "android.permission.RECORD_AUDIO",
          "android.permission.READ_EXTERNAL_STORAGE",
          "android.permission.WRITE_EXTERNAL_STORAGE",
          "android.permission.ACCESS_MEDIA_LOCATION",
          "android.permission.READ_MEDIA_IMAGES",
          "android.permission.READ_MEDIA_VIDEO",
          "android.permission.READ_MEDIA_AUDIO",

          // Location
          "android.permission.ACCESS_FINE_LOCATION",
          "android.permission.ACCESS_COARSE_LOCATION",

          // Bluetooth (for WebRTC)
          "android.permission.BLUETOOTH",
          "android.permission.BLUETOOTH_ADMIN",
          "android.permission.BLUETOOTH_CONNECT",
          "android.permission.BLUETOOTH_SCAN",

          // Notifications (critical for push notifications)
          "android.permission.POST_NOTIFICATIONS",
          "android.permission.WAKE_LOCK",

          // Network
          "android.permission.INTERNET",
          "android.permission.ACCESS_NETWORK_STATE",

          // Vibration
          "android.permission.VIBRATE",
          // Biometrics
          "USE_BIOMETRIC",
          "USE_FINGERPRINT",
        ],
        // Firebase Android config (if present)
        googleServicesFile: HAS_ANDROID_GOOGLE_SERVICES
          ? "./android/app/google-services.json"
          : undefined,
      },

      web: {
        output: "static",
        favicon: "./assets/images/favicon.png",
      },

      plugins: [
        "expo-router",
        "expo-secure-store",
        "expo-web-browser",
        "expo-sqlite",
        "expo-localization",

        // Contacts for phone book sync (Zalo-style find friends)
        [
          "expo-contacts",
          {
            contactsPermission:
              "Ứng dụng cần quyền truy cập danh bạ để tìm bạn bè đang dùng ứng dụng.",
          },
        ],

        // Enhanced notifications plugin with proper configuration
        [
          "expo-notifications",
          {
            icon: "./assets/images/icon.png",
            color: "#ffffff",
            defaultChannel: "default",
          },
        ],

        // Splash screen
        [
          "expo-splash-screen",
          {
            image: "./assets/images/splash-icon.png",
            imageWidth: 200,
            resizeMode: "contain",
            backgroundColor: "#ffffff",
            dark: {
              backgroundColor: "#000000",
            },
          },
        ],

        // Video + Audio
        [
          "expo-video",
          {
            supportsPictureInPicture: true,
          },
        ],
        "expo-audio",

        // Media library for full access
        [
          "expo-media-library",
          {
            photosPermission:
              "Ứng dụng cần quyền truy cập thư viện ảnh để chọn và lưu ảnh/video.",
            savePhotosPermission:
              "Ứng dụng cần quyền lưu ảnh/video vào thư viện.",
            isAccessMediaLocationEnabled: true,
          },
        ],

        // Build properties for WebRTC and enhanced permissions
        [
          "expo-build-properties",
          {
            android: {
              compileSdkVersion: 35,
              targetSdkVersion: 34,
              buildToolsVersion: "35.0.0",
              kotlinVersion: "2.1.20",
              enableProguardInReleaseBuilds: true,
              enableShrinkResourcesInReleaseBuilds: true,
              extraProguardRules: "-keep class org.webrtc.** { *; }",
              useNextNotationsInGradleProperties: false,
              enableWebp: false,
            },
            ios: {
              deploymentTarget: "15.1",
              extraPods: [
                {
                  name: "WebRTC-lib",
                  path: "../node_modules/react-native-webrtc",
                  configurations: ["Debug", "Release"],
                },
              ],
            },
          },
        ],

        // Camera with enhanced permissions
        [
          "expo-camera",
          {
            cameraPermission:
              "Ứng dụng cần quyền camera để quay video và chụp ảnh.",
            microphonePermission: "Ứng dụng cần quyền micro để ghi âm.",
            recordAudioAndroid: true,
          },
        ],

        // Location services
        [
          "expo-location",
          {
            locationAlwaysAndWhenInUsePermission:
              "Ứng dụng cần quyền vị trí để gắn địa điểm vào bài đăng.",
          },
        ],
      ],

      // EAS Updates configuration
      runtimeVersion: "1.0.0",
      updates: {
        url: "https://u.expo.dev/54fbd98b-b34c-47eb-afd1-450b8ee4ca98",
      },

      experiments: {
        typedRoutes: true,
        reactCompiler: false,
      },

      extra: {
        // Prefer explicit env from .env files; fallback to sensible defaults
        API_URL: process.env.EXPO_PUBLIC_API_URL || ENV_API_BASE,
        EXPO_PUBLIC_API_BASE_URL: ENV_API_BASE,
        EXPO_PUBLIC_API_PREFIX: process.env.EXPO_PUBLIC_API_PREFIX ?? "",
        EXPO_PUBLIC_NODE_API_BASE_URL: ENV_API_BASE,
        EXPO_PUBLIC_API_KEY: process.env.EXPO_PUBLIC_API_KEY || "",
        EXPO_PUBLIC_WS_URL:
          process.env.EXPO_PUBLIC_WS_URL || "wss://baotienweb.cloud",
        EXPO_PUBLIC_WS_BASE_URL:
          process.env.EXPO_PUBLIC_WS_BASE_URL || "wss://baotienweb.cloud",
        EXPO_PUBLIC_WS_PROGRESS_URL:
          process.env.EXPO_PUBLIC_WS_PROGRESS_URL || undefined,
        EXPO_PUBLIC_AUTH_REFRESH_PATH:
          process.env.EXPO_PUBLIC_AUTH_REFRESH_PATH || "/auth/refresh",
        EXPO_PUBLIC_AUTH_GOOGLE_PATH:
          process.env.EXPO_PUBLIC_AUTH_GOOGLE_PATH || "/auth/google",
        EXPO_PUBLIC_AUTH_FACEBOOK_PATH:
          process.env.EXPO_PUBLIC_AUTH_FACEBOOK_PATH || "/auth/facebook",
        EXPO_PUBLIC_ENABLE_SOCIAL_GOOGLE:
          process.env.EXPO_PUBLIC_ENABLE_SOCIAL_GOOGLE || "1",
        EXPO_PUBLIC_ENABLE_SOCIAL_FACEBOOK:
          process.env.EXPO_PUBLIC_ENABLE_SOCIAL_FACEBOOK || "1",

        // Google OAuth Client IDs (Required for React Native)
        EXPO_PUBLIC_GOOGLE_CLIENT_ID:
          process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
        EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:
          process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
          process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
          "",
        EXPO_PUBLIC_GOOGLE_CLIENT_SECRET:
          process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || "",
        EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID:
          process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "",
        EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:
          process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "",
        EXPO_PUBLIC_BACKOFF_BASE_MS:
          process.env.EXPO_PUBLIC_BACKOFF_BASE_MS || "500",
        EXPO_PUBLIC_BACKOFF_JITTER_MS:
          process.env.EXPO_PUBLIC_BACKOFF_JITTER_MS || "500",

        // AI
        EXPO_PUBLIC_OPENAI_API_KEY:
          process.env.EXPO_PUBLIC_OPENAI_API_KEY || "",
        EXPO_PUBLIC_GEMINI_API_KEY:
          process.env.EXPO_PUBLIC_GEMINI_API_KEY || "",

        // External APIs
        EXPO_PUBLIC_PEXELS_API_KEY:
          process.env.EXPO_PUBLIC_PEXELS_API_KEY || "",
        EXPO_PUBLIC_GNEWS_API_KEY: process.env.EXPO_PUBLIC_GNEWS_API_KEY || "",

        // Perfex CRM
        EXPO_PUBLIC_PERFEX_CRM_URL:
          process.env.EXPO_PUBLIC_PERFEX_CRM_URL ||
          "https://thietkeresort.com.vn/perfex_crm",
        EXPO_PUBLIC_PERFEX_API_TOKEN:
          process.env.EXPO_PUBLIC_PERFEX_API_TOKEN || "",
        EXPO_PUBLIC_PERFEX_API_KEY:
          process.env.EXPO_PUBLIC_PERFEX_API_KEY || "",

        // GetOTP SMS
        EXPO_PUBLIC_GETOTP_API_KEY:
          process.env.EXPO_PUBLIC_GETOTP_API_KEY || "",
        EXPO_PUBLIC_GETOTP_SENDER_NAME:
          process.env.EXPO_PUBLIC_GETOTP_SENDER_NAME || "ThietKe",
        EXPO_PUBLIC_GETOTP_DEFAULT_CHANNEL:
          process.env.EXPO_PUBLIC_GETOTP_DEFAULT_CHANNEL || "sms",

        // LiveKit
        EXPO_PUBLIC_LIVEKIT_URL:
          process.env.EXPO_PUBLIC_LIVEKIT_URL ||
          process.env.EXPO_PUBLIC_LIVEKIT_WS_URL ||
          "",
        EXPO_PUBLIC_LIVEKIT_WS_URL:
          process.env.EXPO_PUBLIC_LIVEKIT_WS_URL || "",
        EXPO_PUBLIC_LIVEKIT_API_KEY:
          process.env.EXPO_PUBLIC_LIVEKIT_API_KEY || "",
        EXPO_PUBLIC_LIVEKIT_API_SECRET:
          process.env.EXPO_PUBLIC_LIVEKIT_API_SECRET || "",

        // Agora
        EXPO_PUBLIC_AGORA_APP_ID: process.env.EXPO_PUBLIC_AGORA_APP_ID || "",

        // Supabase
        EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
        EXPO_PUBLIC_SUPABASE_ANON_KEY:
          process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",

        // AWS S3
        EXPO_PUBLIC_AWS_REGION:
          process.env.EXPO_PUBLIC_AWS_REGION || "ap-southeast-1",
        EXPO_PUBLIC_AWS_S3_BUCKET: process.env.EXPO_PUBLIC_AWS_S3_BUCKET || "",
        EXPO_PUBLIC_AWS_ACCESS_KEY_ID:
          process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID || "",
        EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY:
          process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
        EXPO_PUBLIC_AWS_CLOUDFRONT_URL:
          process.env.EXPO_PUBLIC_AWS_CLOUDFRONT_URL || "",

        // Cloudinary
        EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME:
          process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
        EXPO_PUBLIC_CLOUDINARY_API_KEY:
          process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || "",
        EXPO_PUBLIC_CLOUDINARY_API_SECRET:
          process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET || "",
        EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET:
          process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "app_uploads",

        // Misc existing extras preserved
        router: {},
        eas: {
          projectId: "54fbd98b-b34c-47eb-afd1-450b8ee4ca98",
        },
        PUBLIC_BUILDER_KEY: "ea928659200a478291d0fd496716e6ab",
        PUBLIC_BASE_URL: PROD_API_URL,
        EXPO_PUBLIC_API_DEBUG: process.env.EXPO_PUBLIC_API_DEBUG || "1",
        EXPO_PUBLIC_SUPPRESS_KEY_WARN:
          process.env.EXPO_PUBLIC_SUPPRESS_KEY_WARN || "1",
        EXPO_PUBLIC_DISABLE_REMOTE_CONTACTS:
          process.env.EXPO_PUBLIC_DISABLE_REMOTE_CONTACTS || "1",
        EXPO_PUBLIC_PRODUCTION_API_URL: PROD_API_URL,
        EXPO_PUBLIC_DEV_API_URL: DEV_API_URL,
        EXPO_PUBLIC_ENV:
          process.env.EXPO_PUBLIC_ENV || (IS_DEV ? "development" : "prod"),
        EXPO_PUBLIC_REMOTE_AUTH: process.env.EXPO_PUBLIC_REMOTE_AUTH || "0",
        EXPO_PUBLIC_VIDEOS_URL: process.env.EXPO_PUBLIC_VIDEOS_URL || "",
        EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:
          process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      },
    },
  };
}

// Note: We set android.googleServicesFile and ios.googleServicesFile above when files exist.
