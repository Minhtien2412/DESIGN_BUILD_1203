/**
 * Environment Configuration
 * This file exposes environment variables to the app
 */
import Constants from "expo-constants";

interface EnvConfig {
  API_BASE_URL: string;
  API_PREFIX: string;
  API_KEY: string;
  // WebSocket Configuration
  WS_BASE_URL?: string; // Base WebSocket URL without namespace
  WS_CHAT_NS?: string; // Chat namespace
  WS_CALL_NS?: string; // Call namespace
  WS_PROGRESS_NS?: string; // Progress namespace
  // Legacy (deprecated)
  WS_URL?: string;
  WS_PROGRESS_URL?: string;
  AUTH_REFRESH_PATH?: string;
  AUTH_GOOGLE_PATH?: string;
  AUTH_FACEBOOK_PATH?: string;
  ENABLE_SOCIAL_GOOGLE?: boolean;
  ENABLE_SOCIAL_FACEBOOK?: boolean;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_WEB_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_ANDROID_CLIENT_ID?: string;
  GOOGLE_IOS_CLIENT_ID?: string;
  BACKOFF_BASE_MS?: number;
  BACKOFF_JITTER_MS?: number;
  // AI
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  // Pexels API (Free Photos & Videos)
  PEXELS_API_KEY?: string;
  // GNews API (News Service)
  GNEWS_API_KEY?: string;
  // Perfex CRM Integration
  PERFEX_CRM_URL?: string;
  PERFEX_API_TOKEN?: string;
  PERFEX_API_KEY?: string; // Custom API Key for /custom_api endpoints
  // GetOTP (SMS OTP Service)
  GETOTP_API_KEY?: string;
  GETOTP_SENDER_NAME?: string;
  GETOTP_DEFAULT_CHANNEL?: string;
  // LiveKit (Video Calls/Meetings/Livestreams)
  LIVEKIT_URL?: string;
  LIVEKIT_API_KEY?: string;
  LIVEKIT_API_SECRET?: string;
  // Agora (Backup video platform)
  AGORA_APP_ID?: string;
}

// Get values from Constants (loaded from app.config.ts)
const extra = Constants.expoConfig?.extra || {};

export const ENV: EnvConfig = {
  API_BASE_URL:
    extra.API_URL ||
    extra.EXPO_PUBLIC_API_BASE_URL ||
    "https://baotienweb.cloud/api/v1",
  // Mobile app uses /auth/* endpoints directly (NO /api prefix)
  API_PREFIX: "",
  API_KEY: extra.EXPO_PUBLIC_API_KEY || "thietke-resort-api-key-2024",

  // WebSocket Configuration - Backend uses Socket.IO with namespaces
  // Base URL (without namespace)
  WS_BASE_URL: extra.EXPO_PUBLIC_WS_BASE_URL || "wss://baotienweb.cloud",
  // Namespaces (must match backend Gateway decorators)
  WS_CHAT_NS: "/chat", // ChatGateway: @WebSocketGateway({ namespace: '/chat' })
  WS_CALL_NS: "/call", // CallGateway: @WebSocketGateway({ namespace: '/call' })
  WS_PROGRESS_NS: "/progress", // ProgressGateway: @WebSocketGateway({ namespace: '/progress' })

  // Legacy (for backward compatibility)
  WS_URL: extra.EXPO_PUBLIC_WS_URL || "wss://baotienweb.cloud",
  WS_PROGRESS_URL:
    extra.EXPO_PUBLIC_WS_PROGRESS_URL || "wss://baotienweb.cloud/progress",

  AUTH_REFRESH_PATH: extra.EXPO_PUBLIC_AUTH_REFRESH_PATH || "/auth/refresh",
  AUTH_GOOGLE_PATH: extra.EXPO_PUBLIC_AUTH_GOOGLE_PATH || "/auth/google",
  AUTH_FACEBOOK_PATH: extra.EXPO_PUBLIC_AUTH_FACEBOOK_PATH || "/auth/facebook",
  ENABLE_SOCIAL_GOOGLE: (extra.EXPO_PUBLIC_ENABLE_SOCIAL_GOOGLE ?? "1") !== "0",
  ENABLE_SOCIAL_FACEBOOK:
    (extra.EXPO_PUBLIC_ENABLE_SOCIAL_FACEBOOK ?? "1") !== "0",
  GOOGLE_CLIENT_ID:
    extra.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    "702679918765-ikhpcev251dh2ndd5cpqkqearkmips34.apps.googleusercontent.com",
  GOOGLE_WEB_CLIENT_ID:
    extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    extra.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET:
    extra.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET ||
    "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",
  GOOGLE_ANDROID_CLIENT_ID: extra.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID: extra.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  BACKOFF_BASE_MS: parseInt(extra.EXPO_PUBLIC_BACKOFF_BASE_MS || "500", 10),
  BACKOFF_JITTER_MS: parseInt(extra.EXPO_PUBLIC_BACKOFF_JITTER_MS || "500", 10),

  // AI Configuration
  OPENAI_API_KEY:
    extra.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  GEMINI_API_KEY:
    extra.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY,

  // Pexels API (Free Photos & Videos for construction demos)
  PEXELS_API_KEY:
    extra.EXPO_PUBLIC_PEXELS_API_KEY || process.env.PEXELS_API_KEY,

  // GNews API (Free News Service - 100 requests/day)
  GNEWS_API_KEY: extra.EXPO_PUBLIC_GNEWS_API_KEY || process.env.GNEWS_API_KEY,

  // Perfex CRM Integration (API Module đã kích hoạt)
  // TESTED: Token 2 works - 2 Customers, 1 Project available
  PERFEX_CRM_URL:
    extra.EXPO_PUBLIC_PERFEX_CRM_URL ||
    "https://thietkeresort.com.vn/perfex_crm",
  // Working Token (Alternate) - Expires: Long-term
  PERFEX_API_TOKEN:
    extra.EXPO_PUBLIC_PERFEX_API_TOKEN ||
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoibmhheGluaGQiLCJuYW1lIjoidGhpZXRrZXJlc29ydCIsIkFQSV9USU1FIjoxNzY3MDYzNzE1fQ.L9Mcg_xEOdcEYXbz9BprB93RD7ZuonhsshYPPInQm4Q",
  // Custom API Key for /custom_api endpoints (authentication)
  PERFEX_API_KEY: extra.EXPO_PUBLIC_PERFEX_API_KEY || "67890abcdef!@#$%^&*",

  // GetOTP Service Configuration (https://otp.dev)
  // Dashboard: https://otp.dev/en/dashboard/
  // Supports: SMS, Viber, Voice, Telegram
  GETOTP_API_KEY:
    extra.EXPO_PUBLIC_GETOTP_API_KEY || "b2c885626ab1e17735372aa843edb431",
  GETOTP_SENDER_NAME: extra.GETOTP_SENDER_NAME || "ThietKe",
  GETOTP_DEFAULT_CHANNEL: extra.GETOTP_DEFAULT_CHANNEL || "sms",

  // LiveKit Configuration (Video Calls/Meetings/Livestreams)
  // Get credentials from: https://cloud.livekit.io
  LIVEKIT_URL: extra.EXPO_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL,
  LIVEKIT_API_KEY:
    extra.EXPO_PUBLIC_LIVEKIT_API_KEY || process.env.LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET:
    extra.EXPO_PUBLIC_LIVEKIT_API_SECRET || process.env.LIVEKIT_API_SECRET,

  // Agora Configuration (Backup video platform)
  AGORA_APP_ID: extra.EXPO_PUBLIC_AGORA_APP_ID || process.env.AGORA_APP_ID,
};

// Debug logging
console.log("[ENV] Configuration loaded:");
console.log("[ENV] API_BASE_URL:", ENV.API_BASE_URL);
console.log("[ENV] API_PREFIX:", ENV.API_PREFIX);
console.log(
  "[ENV] API_KEY:",
  ENV.API_KEY ? ENV.API_KEY.substring(0, 15) + "..." : "NOT SET ⚠️"
);
console.log("[ENV] WS_BASE_URL:", ENV.WS_BASE_URL);
console.log(
  "[ENV] WS Namespaces:",
  ENV.WS_CHAT_NS,
  ENV.WS_CALL_NS,
  ENV.WS_PROGRESS_NS
);
console.log("[ENV] AUTH_REFRESH_PATH:", ENV.AUTH_REFRESH_PATH);
console.log(
  "[ENV] OPENAI_API_KEY:",
  ENV.OPENAI_API_KEY ? "✅ Configured" : "❌ NOT SET"
);
console.log(
  "[ENV] GEMINI_API_KEY:",
  ENV.GEMINI_API_KEY ? "✅ Configured" : "❌ NOT SET"
);
console.log(
  "[ENV] ENABLE_SOCIAL (G, F):",
  ENV.ENABLE_SOCIAL_GOOGLE,
  ENV.ENABLE_SOCIAL_FACEBOOK
);
console.log(
  "[ENV] LIVEKIT_URL:",
  ENV.LIVEKIT_URL ? "✅ Configured" : "❌ NOT SET"
);
console.log(
  "[ENV] LIVEKIT_API_KEY:",
  ENV.LIVEKIT_API_KEY ? "✅ Configured" : "❌ NOT SET"
);

// Validate critical values
if (!ENV.API_KEY) {
  console.error("[ENV] ❌ CRITICAL: API_KEY is not set!");
  console.error("[ENV] Check app.config.ts and .env file");
}

export default ENV;
