/**
 * Internationalization (i18n) Module
 * Multi-language support for the app
 * @created 04/02/2026
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";

// ============================================================================
// Types
// ============================================================================

export type SupportedLanguage =
  | "vi"
  | "en"
  | "zh"
  | "ja"
  | "ko"
  | "th"
  | "fr"
  | "es"
  | "de"
  | "pt"
  | "ru"
  | "ar"
  | "hi";

export interface TranslationStrings {
  // Common
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    search: string;
    filter: string;
    sort: string;
    viewAll: string;
    seeMore: string;
    back: string;
    next: string;
    done: string;
    close: string;
    ok: string;
    yes: string;
    no: string;
    success: string;
    failed: string;
    required: string;
    optional: string;
    noData: string;
    noResults: string;
    offline: string;
    online: string;
  };

  // Auth
  auth: {
    login: string;
    logout: string;
    signup: string;
    forgotPassword: string;
    resetPassword: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phoneNumber: string;
    rememberMe: string;
    orContinueWith: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    welcomeBack: string;
    createAccount: string;
    logoutConfirm: string;
  };

  // Home
  home: {
    title: string;
    searchPlaceholder: string;
    categories: string;
    featuredServices: string;
    featuredWorkers: string;
    flashSale: string;
    newArrivals: string;
    topRated: string;
    nearYou: string;
    promotions: string;
    livestreams: string;
    houseTemplates: string;
  };

  // Profile
  profile: {
    title: string;
    editProfile: string;
    myOrders: string;
    myProjects: string;
    favorites: string;
    viewHistory: string;
    notifications: string;
    settings: string;
    helpSupport: string;
    aboutUs: string;
    rateApp: string;
    shareApp: string;
    version: string;
    memberSince: string;
    totalOrders: string;
    totalSpent: string;
    loyaltyPoints: string;
  };

  // Settings
  settings: {
    title: string;
    language: string;
    darkMode: string;
    notifications: string;
    privacy: string;
    security: string;
    cloudBackup: string;
    clearCache: string;
    deleteAccount: string;
    pushNotifications: string;
    emailNotifications: string;
    smsNotifications: string;
    twoFactorAuth: string;
    biometricLogin: string;
    changePassword: string;
  };

  // Cart & Checkout
  cart: {
    title: string;
    empty: string;
    addToCart: string;
    removeFromCart: string;
    subtotal: string;
    discount: string;
    shipping: string;
    total: string;
    checkout: string;
    continueShopping: string;
    quantity: string;
    updateQuantity: string;
    clearCart: string;
    proceedToCheckout: string;
  };

  // Workers
  workers: {
    title: string;
    available: string;
    busy: string;
    rating: string;
    reviews: string;
    projects: string;
    experience: string;
    hourlyRate: string;
    contactWorker: string;
    hireWorker: string;
    skills: string;
    portfolio: string;
    certificates: string;
  };

  // Services
  services: {
    title: string;
    architecture: string;
    interior: string;
    construction: string;
    renovation: string;
    consulting: string;
    estimation: string;
    priceRange: string;
    duration: string;
    requestQuote: string;
    bookService: string;
    serviceDetails: string;
  };

  // Projects
  projects: {
    title: string;
    myProjects: string;
    newProject: string;
    inProgress: string;
    completed: string;
    pending: string;
    cancelled: string;
    progress: string;
    timeline: string;
    budget: string;
    documents: string;
    team: string;
    updates: string;
  };

  // Chat
  chat: {
    title: string;
    conversations: string;
    newMessage: string;
    typeMessage: string;
    send: string;
    delivered: string;
    read: string;
    online: string;
    lastSeen: string;
    typing: string;
    attachFile: string;
    takePhoto: string;
    chooseFromGallery: string;
  };

  // Notifications
  notifications: {
    title: string;
    markAllRead: string;
    clearAll: string;
    noNotifications: string;
    newOrder: string;
    orderUpdate: string;
    projectUpdate: string;
    newMessage: string;
    promotion: string;
    system: string;
  };

  // Errors
  errors: {
    networkError: string;
    serverError: string;
    unauthorized: string;
    notFound: string;
    validationError: string;
    sessionExpired: string;
    somethingWentWrong: string;
    tryAgainLater: string;
    noInternet: string;
    timeout: string;
  };

  // Time
  time: {
    now: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    yesterday: string;
    today: string;
    tomorrow: string;
  };

  // Permissions
  permissions: {
    camera: string;
    cameraDesc: string;
    location: string;
    locationDesc: string;
    storage: string;
    storageDesc: string;
    contacts: string;
    contactsDesc: string;
    notifications: string;
    notificationsDesc: string;
    microphone: string;
    microphoneDesc: string;
  };
}

// ============================================================================
// Vietnamese Translations
// ============================================================================

export const vi: TranslationStrings = {
  common: {
    loading: "Đang tải...",
    error: "Lỗi",
    retry: "Thử lại",
    cancel: "Hủy",
    confirm: "Xác nhận",
    save: "Lưu",
    delete: "Xóa",
    edit: "Sửa",
    search: "Tìm kiếm",
    filter: "Lọc",
    sort: "Sắp xếp",
    viewAll: "Xem tất cả",
    seeMore: "Xem thêm",
    back: "Quay lại",
    next: "Tiếp tục",
    done: "Hoàn thành",
    close: "Đóng",
    ok: "OK",
    yes: "Có",
    no: "Không",
    success: "Thành công",
    failed: "Thất bại",
    required: "Bắt buộc",
    optional: "Tùy chọn",
    noData: "Không có dữ liệu",
    noResults: "Không tìm thấy kết quả",
    offline: "Ngoại tuyến",
    online: "Trực tuyến",
  },

  auth: {
    login: "Đăng nhập",
    logout: "Đăng xuất",
    signup: "Đăng ký",
    forgotPassword: "Quên mật khẩu?",
    resetPassword: "Đặt lại mật khẩu",
    email: "Email",
    password: "Mật khẩu",
    confirmPassword: "Xác nhận mật khẩu",
    fullName: "Họ và tên",
    phoneNumber: "Số điện thoại",
    rememberMe: "Ghi nhớ đăng nhập",
    orContinueWith: "Hoặc tiếp tục với",
    alreadyHaveAccount: "Đã có tài khoản?",
    dontHaveAccount: "Chưa có tài khoản?",
    welcomeBack: "Chào mừng trở lại",
    createAccount: "Tạo tài khoản mới",
    logoutConfirm: "Bạn có chắc muốn đăng xuất?",
  },

  home: {
    title: "Trang chủ",
    searchPlaceholder: "Tìm kiếm dịch vụ, thợ xây dựng...",
    categories: "Danh mục",
    featuredServices: "Dịch vụ nổi bật",
    featuredWorkers: "Thợ được đề xuất",
    flashSale: "Flash Sale",
    newArrivals: "Mới nhất",
    topRated: "Được đánh giá cao",
    nearYou: "Gần bạn",
    promotions: "Khuyến mãi",
    livestreams: "Livestream",
    houseTemplates: "Mẫu nhà",
  },

  profile: {
    title: "Tài khoản",
    editProfile: "Chỉnh sửa hồ sơ",
    myOrders: "Đơn hàng của tôi",
    myProjects: "Dự án của tôi",
    favorites: "Yêu thích",
    viewHistory: "Lịch sử xem",
    notifications: "Thông báo",
    settings: "Cài đặt",
    helpSupport: "Trợ giúp & Hỗ trợ",
    aboutUs: "Về chúng tôi",
    rateApp: "Đánh giá ứng dụng",
    shareApp: "Chia sẻ ứng dụng",
    version: "Phiên bản",
    memberSince: "Thành viên từ",
    totalOrders: "Tổng đơn hàng",
    totalSpent: "Tổng chi tiêu",
    loyaltyPoints: "Điểm thưởng",
  },

  settings: {
    title: "Cài đặt",
    language: "Ngôn ngữ",
    darkMode: "Chế độ tối",
    notifications: "Thông báo",
    privacy: "Quyền riêng tư",
    security: "Bảo mật",
    cloudBackup: "Sao lưu đám mây",
    clearCache: "Xóa bộ nhớ đệm",
    deleteAccount: "Xóa tài khoản",
    pushNotifications: "Thông báo đẩy",
    emailNotifications: "Thông báo email",
    smsNotifications: "Thông báo SMS",
    twoFactorAuth: "Xác thực 2 lớp",
    biometricLogin: "Đăng nhập sinh trắc học",
    changePassword: "Đổi mật khẩu",
  },

  cart: {
    title: "Giỏ hàng",
    empty: "Giỏ hàng trống",
    addToCart: "Thêm vào giỏ",
    removeFromCart: "Xóa khỏi giỏ",
    subtotal: "Tạm tính",
    discount: "Giảm giá",
    shipping: "Phí vận chuyển",
    total: "Tổng cộng",
    checkout: "Thanh toán",
    continueShopping: "Tiếp tục mua sắm",
    quantity: "Số lượng",
    updateQuantity: "Cập nhật số lượng",
    clearCart: "Xóa giỏ hàng",
    proceedToCheckout: "Tiến hành thanh toán",
  },

  workers: {
    title: "Thợ xây dựng",
    available: "Sẵn sàng",
    busy: "Đang bận",
    rating: "Đánh giá",
    reviews: "Nhận xét",
    projects: "Dự án",
    experience: "Kinh nghiệm",
    hourlyRate: "Giá/giờ",
    contactWorker: "Liên hệ thợ",
    hireWorker: "Thuê thợ",
    skills: "Kỹ năng",
    portfolio: "Hồ sơ năng lực",
    certificates: "Chứng chỉ",
  },

  services: {
    title: "Dịch vụ",
    architecture: "Thiết kế kiến trúc",
    interior: "Thiết kế nội thất",
    construction: "Xây dựng",
    renovation: "Sửa chữa",
    consulting: "Tư vấn",
    estimation: "Dự toán",
    priceRange: "Khoảng giá",
    duration: "Thời gian",
    requestQuote: "Yêu cầu báo giá",
    bookService: "Đặt dịch vụ",
    serviceDetails: "Chi tiết dịch vụ",
  },

  projects: {
    title: "Dự án",
    myProjects: "Dự án của tôi",
    newProject: "Tạo dự án mới",
    inProgress: "Đang thực hiện",
    completed: "Hoàn thành",
    pending: "Chờ xử lý",
    cancelled: "Đã hủy",
    progress: "Tiến độ",
    timeline: "Lịch trình",
    budget: "Ngân sách",
    documents: "Tài liệu",
    team: "Đội ngũ",
    updates: "Cập nhật",
  },

  chat: {
    title: "Tin nhắn",
    conversations: "Cuộc trò chuyện",
    newMessage: "Tin nhắn mới",
    typeMessage: "Nhập tin nhắn...",
    send: "Gửi",
    delivered: "Đã gửi",
    read: "Đã xem",
    online: "Đang hoạt động",
    lastSeen: "Hoạt động lần cuối",
    typing: "Đang nhập...",
    attachFile: "Đính kèm file",
    takePhoto: "Chụp ảnh",
    chooseFromGallery: "Chọn từ thư viện",
  },

  notifications: {
    title: "Thông báo",
    markAllRead: "Đánh dấu tất cả đã đọc",
    clearAll: "Xóa tất cả",
    noNotifications: "Không có thông báo",
    newOrder: "Đơn hàng mới",
    orderUpdate: "Cập nhật đơn hàng",
    projectUpdate: "Cập nhật dự án",
    newMessage: "Tin nhắn mới",
    promotion: "Khuyến mãi",
    system: "Hệ thống",
  },

  errors: {
    networkError: "Lỗi kết nối mạng",
    serverError: "Lỗi máy chủ",
    unauthorized: "Không có quyền truy cập",
    notFound: "Không tìm thấy",
    validationError: "Dữ liệu không hợp lệ",
    sessionExpired: "Phiên đăng nhập đã hết hạn",
    somethingWentWrong: "Đã có lỗi xảy ra",
    tryAgainLater: "Vui lòng thử lại sau",
    noInternet: "Không có kết nối internet",
    timeout: "Hết thời gian chờ",
  },

  time: {
    now: "Vừa xong",
    minutesAgo: "phút trước",
    hoursAgo: "giờ trước",
    daysAgo: "ngày trước",
    yesterday: "Hôm qua",
    today: "Hôm nay",
    tomorrow: "Ngày mai",
  },

  permissions: {
    camera: "Camera",
    cameraDesc: "Chụp ảnh và quay video cho dự án",
    location: "Vị trí",
    locationDesc: "Tìm thợ và dịch vụ gần bạn",
    storage: "Bộ nhớ",
    storageDesc: "Lưu và truy cập tài liệu dự án",
    contacts: "Danh bạ",
    contactsDesc: "Mời bạn bè và đồng nghiệp",
    notifications: "Thông báo",
    notificationsDesc: "Nhận cập nhật về đơn hàng và dự án",
    microphone: "Micro",
    microphoneDesc: "Gọi thoại và ghi âm",
  },
};

// ============================================================================
// English Translations
// ============================================================================

export const en: TranslationStrings = {
  common: {
    loading: "Loading...",
    error: "Error",
    retry: "Retry",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    viewAll: "View All",
    seeMore: "See More",
    back: "Back",
    next: "Next",
    done: "Done",
    close: "Close",
    ok: "OK",
    yes: "Yes",
    no: "No",
    success: "Success",
    failed: "Failed",
    required: "Required",
    optional: "Optional",
    noData: "No data",
    noResults: "No results found",
    offline: "Offline",
    online: "Online",
  },

  auth: {
    login: "Login",
    logout: "Logout",
    signup: "Sign Up",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    rememberMe: "Remember Me",
    orContinueWith: "Or continue with",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    welcomeBack: "Welcome Back",
    createAccount: "Create New Account",
    logoutConfirm: "Are you sure you want to logout?",
  },

  home: {
    title: "Home",
    searchPlaceholder: "Search services, workers...",
    categories: "Categories",
    featuredServices: "Featured Services",
    featuredWorkers: "Featured Workers",
    flashSale: "Flash Sale",
    newArrivals: "New Arrivals",
    topRated: "Top Rated",
    nearYou: "Near You",
    promotions: "Promotions",
    livestreams: "Livestreams",
    houseTemplates: "House Templates",
  },

  profile: {
    title: "Profile",
    editProfile: "Edit Profile",
    myOrders: "My Orders",
    myProjects: "My Projects",
    favorites: "Favorites",
    viewHistory: "View History",
    notifications: "Notifications",
    settings: "Settings",
    helpSupport: "Help & Support",
    aboutUs: "About Us",
    rateApp: "Rate App",
    shareApp: "Share App",
    version: "Version",
    memberSince: "Member Since",
    totalOrders: "Total Orders",
    totalSpent: "Total Spent",
    loyaltyPoints: "Loyalty Points",
  },

  settings: {
    title: "Settings",
    language: "Language",
    darkMode: "Dark Mode",
    notifications: "Notifications",
    privacy: "Privacy",
    security: "Security",
    cloudBackup: "Cloud Backup",
    clearCache: "Clear Cache",
    deleteAccount: "Delete Account",
    pushNotifications: "Push Notifications",
    emailNotifications: "Email Notifications",
    smsNotifications: "SMS Notifications",
    twoFactorAuth: "Two-Factor Auth",
    biometricLogin: "Biometric Login",
    changePassword: "Change Password",
  },

  cart: {
    title: "Cart",
    empty: "Your cart is empty",
    addToCart: "Add to Cart",
    removeFromCart: "Remove from Cart",
    subtotal: "Subtotal",
    discount: "Discount",
    shipping: "Shipping",
    total: "Total",
    checkout: "Checkout",
    continueShopping: "Continue Shopping",
    quantity: "Quantity",
    updateQuantity: "Update Quantity",
    clearCart: "Clear Cart",
    proceedToCheckout: "Proceed to Checkout",
  },

  workers: {
    title: "Workers",
    available: "Available",
    busy: "Busy",
    rating: "Rating",
    reviews: "Reviews",
    projects: "Projects",
    experience: "Experience",
    hourlyRate: "Hourly Rate",
    contactWorker: "Contact Worker",
    hireWorker: "Hire Worker",
    skills: "Skills",
    portfolio: "Portfolio",
    certificates: "Certificates",
  },

  services: {
    title: "Services",
    architecture: "Architecture Design",
    interior: "Interior Design",
    construction: "Construction",
    renovation: "Renovation",
    consulting: "Consulting",
    estimation: "Cost Estimation",
    priceRange: "Price Range",
    duration: "Duration",
    requestQuote: "Request Quote",
    bookService: "Book Service",
    serviceDetails: "Service Details",
  },

  projects: {
    title: "Projects",
    myProjects: "My Projects",
    newProject: "New Project",
    inProgress: "In Progress",
    completed: "Completed",
    pending: "Pending",
    cancelled: "Cancelled",
    progress: "Progress",
    timeline: "Timeline",
    budget: "Budget",
    documents: "Documents",
    team: "Team",
    updates: "Updates",
  },

  chat: {
    title: "Messages",
    conversations: "Conversations",
    newMessage: "New Message",
    typeMessage: "Type a message...",
    send: "Send",
    delivered: "Delivered",
    read: "Read",
    online: "Online",
    lastSeen: "Last seen",
    typing: "Typing...",
    attachFile: "Attach File",
    takePhoto: "Take Photo",
    chooseFromGallery: "Choose from Gallery",
  },

  notifications: {
    title: "Notifications",
    markAllRead: "Mark All as Read",
    clearAll: "Clear All",
    noNotifications: "No notifications",
    newOrder: "New Order",
    orderUpdate: "Order Update",
    projectUpdate: "Project Update",
    newMessage: "New Message",
    promotion: "Promotion",
    system: "System",
  },

  errors: {
    networkError: "Network error",
    serverError: "Server error",
    unauthorized: "Unauthorized access",
    notFound: "Not found",
    validationError: "Validation error",
    sessionExpired: "Session expired",
    somethingWentWrong: "Something went wrong",
    tryAgainLater: "Please try again later",
    noInternet: "No internet connection",
    timeout: "Request timeout",
  },

  time: {
    now: "Just now",
    minutesAgo: "minutes ago",
    hoursAgo: "hours ago",
    daysAgo: "days ago",
    yesterday: "Yesterday",
    today: "Today",
    tomorrow: "Tomorrow",
  },

  permissions: {
    camera: "Camera",
    cameraDesc: "Take photos and videos for projects",
    location: "Location",
    locationDesc: "Find workers and services near you",
    storage: "Storage",
    storageDesc: "Save and access project documents",
    contacts: "Contacts",
    contactsDesc: "Invite friends and colleagues",
    notifications: "Notifications",
    notificationsDesc: "Get updates about orders and projects",
    microphone: "Microphone",
    microphoneDesc: "Voice calls and recording",
  },
};

// ============================================================================
// Translation Manager
// ============================================================================

const LANGUAGE_STORAGE_KEY = "@app_language";

const translations: Partial<Record<SupportedLanguage, TranslationStrings>> & {
  vi: TranslationStrings;
  en: TranslationStrings;
} = {
  vi,
  en,
};

let currentLanguage: SupportedLanguage = "vi";

/**
 * Initialize language from storage
 */
export async function initializeLanguage(): Promise<SupportedLanguage> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (
      stored &&
      [
        "vi",
        "en",
        "zh",
        "ja",
        "ko",
        "th",
        "fr",
        "es",
        "de",
        "pt",
        "ru",
        "ar",
        "hi",
      ].includes(stored)
    ) {
      currentLanguage = stored as SupportedLanguage;
    }
  } catch (error) {
    console.warn("Failed to load language from storage:", error);
  }
  return currentLanguage;
}

/**
 * Get current language
 */
export function getLanguage(): SupportedLanguage {
  return currentLanguage;
}

/**
 * Set language and persist to storage
 */
export async function setLanguage(lang: SupportedLanguage): Promise<void> {
  currentLanguage = lang;
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (error) {
    console.warn("Failed to save language to storage:", error);
  }
}

/**
 * Get translation strings for current language
 */
export function getTranslations(): TranslationStrings {
  return translations[currentLanguage] ?? translations.vi;
}

/**
 * Translate a key path (e.g., 'common.loading')
 */
export function t(keyPath: string): string {
  const keys = keyPath.split(".");
  let result: any = translations[currentLanguage] ?? translations.vi;

  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = result[key];
    } else {
      // Fallback to Vietnamese
      result = translations.vi;
      for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
          result = result[k];
        } else {
          return keyPath; // Return key if not found
        }
      }
    }
  }

  return typeof result === "string" ? result : keyPath;
}

/**
 * Check if RTL is needed (not currently used but ready for Arabic, etc.)
 */
export function isRTL(): boolean {
  return I18nManager.isRTL;
}

/**
 * Get available languages
 */
export function getAvailableLanguages(): Array<{
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}> {
  return [
    { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
    { code: "en", name: "English", nativeName: "English" },
    { code: "zh", name: "Chinese", nativeName: "中文" },
    { code: "ja", name: "Japanese", nativeName: "日本語" },
    { code: "ko", name: "Korean", nativeName: "한국어" },
    { code: "th", name: "Thai", nativeName: "ภาษาไทย" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "de", name: "German", nativeName: "Deutsch" },
    { code: "pt", name: "Portuguese", nativeName: "Português" },
    { code: "ru", name: "Russian", nativeName: "Русский" },
    { code: "ar", name: "Arabic", nativeName: "العربية" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  ];
}

export default {
  initializeLanguage,
  getLanguage,
  setLanguage,
  getTranslations,
  t,
  isRTL,
  getAvailableLanguages,
  vi,
  en,
};
