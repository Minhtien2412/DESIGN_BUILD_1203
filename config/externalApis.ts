/**
 * External API Configuration
 * ==========================
 *
 * Cấu hình các API keys và endpoints cho các dịch vụ bên ngoài.
 * Sử dụng biến môi trường từ .env
 *
 * @author ThietKeResort Team
 * @created 2026-01-12
 */

// ============================================
// AI Services
// ============================================
export const AI_CONFIG = {
  // OpenAI
  openai: {
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || "",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4-turbo-preview",
  },

  // Google Gemini
  gemini: {
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || "",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-pro",
  },

  // Anthropic Claude
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY || "",
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-3-opus-20240229",
  },
};

// ============================================
// OTP & SMS Services
// ============================================
export const SMS_CONFIG = {
  // Twilio (International)
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
    verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID || "",
  },

  // eSMS Vietnam
  esms: {
    apiKey: process.env.ESMS_API_KEY || "",
    secretKey: process.env.ESMS_SECRET_KEY || "",
    brandName: process.env.ESMS_BRAND_NAME || "ThietKeResort",
    smsType: process.env.ESMS_SMS_TYPE || "2",
    baseUrl: "https://rest.esms.vn/MainService.svc/json",
  },

  // StringeeX Vietnam
  stringeex: {
    apiKey: process.env.STRINGEEX_API_KEY || "",
    apiSecret: process.env.STRINGEEX_API_SECRET || "",
    baseUrl: "https://api.stringee.com/v1",
  },

  // Vonage/Nexmo (International)
  vonage: {
    apiKey: process.env.VONAGE_API_KEY || "",
    apiSecret: process.env.VONAGE_API_SECRET || "",
    brandName: process.env.VONAGE_BRAND_NAME || "ThietKeResort",
    baseUrl: "https://api.nexmo.com",
  },
};

// ============================================
// Weather Services
// ============================================
export const WEATHER_CONFIG = {
  // OpenWeatherMap
  openweathermap: {
    apiKey: process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY || "",
    baseUrl:
      process.env.OPENWEATHERMAP_BASE_URL ||
      "https://api.openweathermap.org/data/2.5",
    units: "metric",
    lang: "vi",
  },

  // WeatherAPI
  weatherapi: {
    apiKey: process.env.EXPO_PUBLIC_WEATHERAPI_KEY || "",
    baseUrl: process.env.WEATHERAPI_BASE_URL || "https://api.weatherapi.com/v1",
  },

  // Visual Crossing
  visualcrossing: {
    apiKey: process.env.VISUALCROSSING_API_KEY || "",
    baseUrl:
      "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services",
  },
};

// ============================================
// News Services
// ============================================
export const NEWS_CONFIG = {
  // NewsAPI
  newsapi: {
    apiKey: process.env.EXPO_PUBLIC_NEWSAPI_KEY || "",
    baseUrl: process.env.NEWSAPI_BASE_URL || "https://newsapi.org/v2",
    country: "vn",
    language: "vi",
  },

  // GNews
  gnews: {
    apiKey: process.env.EXPO_PUBLIC_GNEWS_API_KEY || "",
    baseUrl: "https://gnews.io/api/v4",
    country: "vn",
    language: "vi",
  },

  // TheNewsAPI
  thenewsapi: {
    apiKey: process.env.THENEWSAPI_KEY || "",
    baseUrl: "https://api.thenewsapi.com/v1",
  },

  // MediaStack
  mediastack: {
    apiKey: process.env.MEDIASTACK_API_KEY || "",
    baseUrl: "http://api.mediastack.com/v1",
    countries: "vn",
    languages: "vi",
  },
};

// ============================================
// Maps & Location Services
// ============================================
export const MAPS_CONFIG = {
  // Google Maps
  google: {
    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    baseUrl: "https://maps.googleapis.com/maps/api",
  },

  // Mapbox
  mapbox: {
    accessToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "",
    baseUrl: "https://api.mapbox.com",
    styleUrl: "mapbox://styles/mapbox/streets-v12",
  },

  // GoongMaps Vietnam
  goong: {
    apiKey: process.env.EXPO_PUBLIC_GOONG_API_KEY || "",
    maptilesKey: process.env.GOONG_MAPTILES_KEY || "",
    baseUrl: "https://rsapi.goong.io",
  },

  // HERE Maps
  here: {
    apiKey: process.env.HERE_API_KEY || "",
    baseUrl: "https://geocode.search.hereapi.com/v1",
  },
};

// ============================================
// Payment Gateways
// ============================================
export const PAYMENT_CONFIG = {
  // VNPay
  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE || "",
    hashSecret: process.env.VNPAY_HASH_SECRET || "",
    url:
      process.env.VNPAY_URL ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl: process.env.VNPAY_RETURN_URL || "",
    apiUrl: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  },

  // MoMo
  momo: {
    partnerCode: process.env.MOMO_PARTNER_CODE || "",
    accessKey: process.env.MOMO_ACCESS_KEY || "",
    secretKey: process.env.MOMO_SECRET_KEY || "",
    endpoint:
      process.env.MOMO_ENDPOINT ||
      "https://test-payment.momo.vn/v2/gateway/api",
  },

  // ZaloPay
  zalopay: {
    appId: process.env.ZALOPAY_APP_ID || "",
    key1: process.env.ZALOPAY_KEY1 || "",
    key2: process.env.ZALOPAY_KEY2 || "",
    endpoint:
      process.env.ZALOPAY_ENDPOINT || "https://sb-openapi.zalopay.vn/v2",
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  },

  // ACB ONE Connect
  acb: {
    clientId: process.env.ACB_CLIENT_ID || "",
    apiUrl: process.env.ACB_API_URL || "https://apiconnect.acb.com.vn",
  },
};

// ============================================
// Firebase
// ============================================
export const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || "",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "",
  fcmServerKey: process.env.FCM_SERVER_KEY || "",
};

// ============================================
// Cloud Storage
// ============================================
export const STORAGE_CONFIG = {
  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    uploadPreset: "thietkeresort",
    baseUrl: "https://api.cloudinary.com/v1_1",
  },

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    region: process.env.AWS_REGION || "ap-southeast-1",
    bucket: process.env.AWS_S3_BUCKET || "",
  },

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },
};

// ============================================
// Email Services
// ============================================
export const EMAIL_CONFIG = {
  // SendGrid
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || "",
    fromEmail: process.env.SENDGRID_FROM_EMAIL || "noreply@thietkeresort.com",
    baseUrl: "https://api.sendgrid.com/v3",
  },

  // Mailgun
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY || "",
    domain: process.env.MAILGUN_DOMAIN || "",
    baseUrl: "https://api.mailgun.net/v3",
  },

  // Resend
  resend: {
    apiKey: process.env.RESEND_API_KEY || "",
    baseUrl: "https://api.resend.com",
  },
};

// ============================================
// Real-time Communication
// ============================================
export const REALTIME_CONFIG = {
  // LiveKit
  livekit: {
    apiKey: process.env.LIVEKIT_API_KEY || "",
    apiSecret: process.env.LIVEKIT_API_SECRET || "",
    url: process.env.LIVEKIT_URL || "",
  },

  // Agora
  agora: {
    appId: process.env.AGORA_APP_ID || "",
    appCertificate: process.env.AGORA_APP_CERTIFICATE || "",
  },

  // Pusher
  pusher: {
    appId: process.env.PUSHER_APP_ID || "",
    key: process.env.PUSHER_KEY || "",
    secret: process.env.PUSHER_SECRET || "",
    cluster: process.env.PUSHER_CLUSTER || "ap1",
  },
};

// ============================================
// Analytics & Monitoring
// ============================================
export const ANALYTICS_CONFIG = {
  // Sentry
  sentry: {
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || "",
  },

  // Mixpanel
  mixpanel: {
    token: process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || "",
  },

  // Amplitude
  amplitude: {
    apiKey: process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY || "",
  },
};

// ============================================
// Social Media
// ============================================
export const SOCIAL_CONFIG = {
  // Facebook
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || "",
    appSecret: process.env.FACEBOOK_APP_SECRET || "",
  },

  // Zalo
  zalo: {
    appId: process.env.ZALO_APP_ID || "",
    appSecret: process.env.ZALO_APP_SECRET || "",
    oaAccessToken: process.env.ZALO_OA_ACCESS_TOKEN || "",
    baseUrl: "https://openapi.zalo.me/v2.0",
  },

  // TikTok
  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
  },
};

// ============================================
// Search & Vector DB
// ============================================
export const SEARCH_CONFIG = {
  // Algolia
  algolia: {
    appId: process.env.ALGOLIA_APP_ID || "",
    apiKey: process.env.ALGOLIA_API_KEY || "",
    searchKey: process.env.ALGOLIA_SEARCH_KEY || "",
  },

  // Pinecone
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || "",
    environment: process.env.PINECONE_ENVIRONMENT || "",
    index: process.env.PINECONE_INDEX || "",
  },
};

// ============================================
// Currency & Finance
// ============================================
export const FINANCE_CONFIG = {
  // ExchangeRate-API
  exchangerate: {
    apiKey: process.env.EXCHANGERATE_API_KEY || "",
    baseUrl: "https://v6.exchangerate-api.com/v6",
  },

  // Fixer
  fixer: {
    apiKey: process.env.FIXER_API_KEY || "",
    baseUrl: "http://data.fixer.io/api",
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Check if an API service is configured
 */
export function isServiceConfigured(serviceName: string): boolean {
  const services: Record<string, () => boolean> = {
    openai: () => !!AI_CONFIG.openai.apiKey,
    gemini: () => !!AI_CONFIG.gemini.apiKey,
    twilio: () => !!SMS_CONFIG.twilio.accountSid,
    esms: () => !!SMS_CONFIG.esms.apiKey,
    openweathermap: () => !!WEATHER_CONFIG.openweathermap.apiKey,
    weatherapi: () => !!WEATHER_CONFIG.weatherapi.apiKey,
    newsapi: () => !!NEWS_CONFIG.newsapi.apiKey,
    gnews: () => !!NEWS_CONFIG.gnews.apiKey,
    googlemaps: () => !!MAPS_CONFIG.google.apiKey,
    mapbox: () => !!MAPS_CONFIG.mapbox.accessToken,
    goong: () => !!MAPS_CONFIG.goong.apiKey,
    vnpay: () => !!PAYMENT_CONFIG.vnpay.tmnCode,
    momo: () => !!PAYMENT_CONFIG.momo.partnerCode,
    zalopay: () => !!PAYMENT_CONFIG.zalopay.appId,
    stripe: () => !!PAYMENT_CONFIG.stripe.publishableKey,
    acb: () => !!PAYMENT_CONFIG.acb.clientId,
    firebase: () => !!FIREBASE_CONFIG.apiKey,
    cloudinary: () => !!STORAGE_CONFIG.cloudinary.cloudName,
    sendgrid: () => !!EMAIL_CONFIG.sendgrid.apiKey,
    sentry: () => !!ANALYTICS_CONFIG.sentry.dsn,
  };

  return services[serviceName]?.() ?? false;
}

/**
 * Get list of configured services
 */
export function getConfiguredServices(): string[] {
  const allServices = [
    "openai",
    "gemini",
    "twilio",
    "esms",
    "openweathermap",
    "weatherapi",
    "newsapi",
    "gnews",
    "googlemaps",
    "mapbox",
    "goong",
    "vnpay",
    "momo",
    "zalopay",
    "stripe",
    "firebase",
    "cloudinary",
    "sendgrid",
    "sentry",
  ];

  return allServices.filter(isServiceConfigured);
}

/**
 * Get configuration summary
 */
export function getConfigSummary(): Record<string, boolean> {
  return {
    ai: isServiceConfigured("openai") || isServiceConfigured("gemini"),
    sms: isServiceConfigured("twilio") || isServiceConfigured("esms"),
    weather:
      isServiceConfigured("openweathermap") ||
      isServiceConfigured("weatherapi"),
    news: isServiceConfigured("newsapi") || isServiceConfigured("gnews"),
    maps:
      isServiceConfigured("googlemaps") ||
      isServiceConfigured("mapbox") ||
      isServiceConfigured("goong"),
    payment:
      isServiceConfigured("vnpay") ||
      isServiceConfigured("momo") ||
      isServiceConfigured("zalopay") ||
      isServiceConfigured("stripe"),
    storage:
      isServiceConfigured("cloudinary") || isServiceConfigured("firebase"),
    email: isServiceConfigured("sendgrid"),
    analytics: isServiceConfigured("sentry"),
  };
}

export default {
  AI_CONFIG,
  SMS_CONFIG,
  WEATHER_CONFIG,
  NEWS_CONFIG,
  MAPS_CONFIG,
  PAYMENT_CONFIG,
  FIREBASE_CONFIG,
  STORAGE_CONFIG,
  EMAIL_CONFIG,
  REALTIME_CONFIG,
  ANALYTICS_CONFIG,
  SOCIAL_CONFIG,
  SEARCH_CONFIG,
  FINANCE_CONFIG,
  isServiceConfigured,
  getConfiguredServices,
  getConfigSummary,
};
