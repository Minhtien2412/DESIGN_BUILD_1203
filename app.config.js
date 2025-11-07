import { existsSync } from 'fs';
import { join } from 'path';

const IS_DEV = process.env.NODE_ENV !== 'production';
const DEV_API_URL = 'http://127.0.0.1:4000';
const PROD_API_URL = 'https://api.thietkeresort.com.vn';
const ENV_API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || (IS_DEV ? DEV_API_URL : PROD_API_URL);

const appConfig = {
  expo: {
    name: "APP_DESIGN_BUILD",
    slug: "APP_DESIGN_BUILD",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "appdesignbuild",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "Ứng dụng cần quyền camera để quay video.",
        NSMicrophoneUsageDescription: "Ứng dụng cần quyền micro để ghi âm khi quay video.",
        NSPhotoLibraryUsageDescription: "Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh và video.",
        NSLocationWhenInUseUsageDescription: "Ứng dụng dùng vị trí của bạn để gắn địa điểm vào bài đăng."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      package: "com.adminmarketingnx.APP_DESIGN_BUILD",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.ACCESS_MEDIA_LOCATION",
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO",
        "android.permission.READ_MEDIA_AUDIO",
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.POST_NOTIFICATIONS"
      ]
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-notifications",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      [
        "expo-video",
        {
          supportsPictureInPicture: true
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: false
    },
    extra: {
      router: {},
      eas: {
        projectId: "54fbd98b-b34c-47eb-afd1-450b8ee4ca98"
      },
      PUBLIC_BUILDER_KEY: "ea928659200a478291d0fd496716e6ab",
      PUBLIC_BASE_URL: PROD_API_URL,
      EXPO_PUBLIC_API_BASE_URL: ENV_API_BASE,
      EXPO_PUBLIC_API_PREFIX: process.env.EXPO_PUBLIC_API_PREFIX ?? '',
      EXPO_PUBLIC_NODE_API_BASE_URL: ENV_API_BASE,
      EXPO_PUBLIC_WS_URL: process.env.EXPO_PUBLIC_WS_URL || (IS_DEV ? 'ws://127.0.0.1:4000/ws' : 'wss://api.thietkeresort.com.vn/ws'),
      EXPO_PUBLIC_API_DEBUG: process.env.EXPO_PUBLIC_API_DEBUG || "1",
      EXPO_PUBLIC_SUPPRESS_KEY_WARN: process.env.EXPO_PUBLIC_SUPPRESS_KEY_WARN || "1",
      EXPO_PUBLIC_DISABLE_REMOTE_CONTACTS: process.env.EXPO_PUBLIC_DISABLE_REMOTE_CONTACTS || "1",
      EXPO_PUBLIC_PRODUCTION_API_URL: PROD_API_URL,
      EXPO_PUBLIC_DEV_API_URL: DEV_API_URL,
      EXPO_PUBLIC_API_KEY: process.env.EXPO_PUBLIC_API_KEY || '',
      EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV || (IS_DEV ? 'development' : 'prod')
    }
  }
};

// Conditionally add googleServicesFile if the file exists
const googleServicesPath = join(__dirname, 'android', 'app', 'google-services.json');
if (existsSync(googleServicesPath)) {
  appConfig.expo.android.googleServicesFile = "./android/app/google-services.json";
}

export default appConfig;