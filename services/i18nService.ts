/**
 * Internationalization (i18n) Service
 * Multi-language support for the entire app
 *
 * Supported languages:
 * - vi: Vietnamese (default)
 * - en: English
 * - zh: Chinese (Simplified)
 * - ja: Japanese
 * - ko: Korean
 *
 * @author ThietKeResort Team
 * @date 2026-01-24
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { NativeModules, Platform } from "react-native";

// ==================== TYPES ====================

export type SupportedLanguage = "vi" | "en" | "zh" | "ja" | "ko";

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}

export interface Translations {
  [namespace: string]: TranslationNamespace;
}

// ==================== CONSTANTS ====================

export const STORAGE_KEY = "@app_language";

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = "vi";

// ==================== TRANSLATION DATA ====================

const vi: Translations = {
  common: {
    appName: "ThietKeResort",
    loading: "Đang tải...",
    error: "Đã xảy ra lỗi",
    success: "Thành công",
    cancel: "Hủy",
    confirm: "Xác nhận",
    save: "Lưu",
    delete: "Xóa",
    edit: "Chỉnh sửa",
    add: "Thêm",
    search: "Tìm kiếm",
    filter: "Lọc",
    refresh: "Làm mới",
    retry: "Thử lại",
    close: "Đóng",
    back: "Quay lại",
    next: "Tiếp tục",
    done: "Xong",
    yes: "Có",
    no: "Không",
    ok: "OK",
    viewAll: "Xem tất cả",
    seeMore: "Xem thêm",
    noData: "Không có dữ liệu",
    noResults: "Không tìm thấy kết quả",
    manage: "Quản lý",
    share: "Chia sẻ",
  },
  auth: {
    login: "Đăng nhập",
    logout: "Đăng xuất",
    register: "Đăng ký",
    forgotPassword: "Quên mật khẩu?",
    changePassword: "Đổi mật khẩu",
    email: "Email",
    password: "Mật khẩu",
    phone: "Số điện thoại",
    otp: "Mã OTP",
    sendOtp: "Gửi mã OTP",
    createAccount: "Tạo tài khoản",
    haveAccount: "Đã có tài khoản?",
    noAccount: "Chưa có tài khoản?",
    orContinueWith: "Hoặc tiếp tục với",
    twoFactorAuth: "Xác thực 2 bước (2FA)",
    twoFactorAuthDesc: "Bảo mật tài khoản nâng cao",
    biometric: "Đăng nhập sinh trắc học",
    biometricDesc: "Face ID / Vân tay",
    welcomeBack: "Chào mừng trở lại!",
    logoutConfirm: "Bạn có chắc muốn đăng xuất?",
  },
  profile: {
    title: "Hồ sơ",
    account: "Tài khoản",
    personalInfo: "Thông tin cá nhân",
    updateProfile: "Cập nhật hồ sơ của bạn",
    editProfile: "Chỉnh sửa hồ sơ",
    changeAvatar: "Đổi ảnh đại diện",
    takePhoto: "Chụp ảnh",
    chooseFromGallery: "Chọn từ thư viện",
    removePhoto: "Xóa ảnh",
    verified: "Đã xác thực",
    notVerified: "Chưa xác thực",
    verifyPhone: "Xác thực số điện thoại",
    security: "Bảo mật",
    securityAccount: "Bảo mật tài khoản",
    completion: "Hoàn thiện hồ sơ",
    completionDesc: "Hoàn thành để nhận ưu đãi",
    myQRCode: "Mã QR của tôi",
    shareProfile: "Chia sẻ hồ sơ",
    saveImage: "Lưu ảnh",
    achievements: "Thành tựu",
    socialLinks: "Kết nối mạng xã hội",
    deleteAccount: "Xóa tài khoản",
    deleteForever: "Xóa vĩnh viễn",
    customer: "Khách hàng",
    admin: "Admin",
    engineer: "Kỹ sư",
    vip: "VIP",
  },
  settings: {
    title: "Cài đặt",
    appearance: "Giao diện",
    appearanceDesc: "Sáng / Tối / Tự động",
    language: "Ngôn ngữ",
    languageCurrent: "Tiếng Việt",
    selectLanguage: "Chọn ngôn ngữ",
    notifications: "Thông báo",
    manageNotifications: "Quản lý thông báo",
    privacy: "Quyền riêng tư",
    manageData: "Quản lý dữ liệu",
    version: "Phiên bản",
    helpCenter: "Trung tâm trợ giúp",
    faqGuide: "FAQ & Hướng dẫn",
    contactSupport: "Liên hệ hỗ trợ",
    chatWithUs: "Chat với chúng tôi",
    termsPolicy: "Điều khoản & Chính sách",
    rateApp: "Đánh giá ứng dụng",
    rateAppDesc: "Cho chúng tôi 5 sao!",
    danger: "Nguy hiểm",
  },
  nav: {
    home: "Trang chủ",
    explore: "Khám phá",
    favorites: "Yêu thích",
    cart: "Giỏ hàng",
    messages: "Tin nhắn",
    notifications: "Thông báo",
    profile: "Cá nhân",
    settings: "Cài đặt",
    projects: "Dự án",
    contacts: "Danh bạ",
    calls: "Cuộc gọi",
    accountSecurity: "Tài khoản & Bảo mật",
    projectsFavorites: "Dự án & Yêu thích",
    support: "Hỗ trợ",
  },
  home: {
    quickContact: "Liên lạc nhanh",
  },
  stats: {
    projects: "Dự án",
    completed: "Hoàn thành",
    orders: "Đơn hàng",
    favorites: "Yêu thích",
  },
  projects: {
    myProjects: "Dự án của tôi",
    projectCount: "{count} dự án",
    activityHistory: "Lịch sử hoạt động",
    recentActivity: "Xem hoạt động gần đây",
  },
  products: {
    savedItems: "{count} mục đã lưu",
  },
  achievements: {
    newMember: "Thành viên mới",
    newMemberDesc: "Tạo tài khoản thành công",
    securityPro: "Bảo mật cao",
    securityProDesc: "Bật xác thực 2FA",
    shopper: "Người mua sắm",
    shopperDesc: "Hoàn thành 10 đơn hàng",
    connector: "Kết nối",
    connectorDesc: "Nhắn tin với 5 người",
    vipMember: "VIP",
    vipMemberDesc: "Chi tiêu trên 10 triệu",
  },
  guest: {
    welcome: "Chào mừng bạn!",
    subtitle: "Đăng nhập để khám phá hàng ngàn\nsản phẩm và dịch vụ",
    orContinueWith: "hoặc tiếp tục với",
    createAccountNew: "Tạo tài khoản mới",
  },
  footer: {
    copyright: "© 2026 ThietKeResort. All rights reserved.",
    version: "Phiên bản {version}",
  },
  errors: {
    general: "Đã xảy ra lỗi",
    network: "Lỗi kết nối mạng",
    tryAgain: "Vui lòng thử lại",
    cannotTakePhoto: "Không thể chụp ảnh",
    cannotSelectPhoto: "Không thể chọn ảnh",
    cannotDeleteAccount: "Không thể xóa tài khoản",
  },
  success: {
    saved: "Đã lưu thành công",
    updated: "Đã cập nhật thành công",
    deleted: "Đã xóa thành công",
    avatarUpdated: "Đã cập nhật ảnh đại diện",
    avatarDeleted: "Đã xóa ảnh đại diện",
    accountDeleted: "Đã xóa tài khoản",
  },
};

const en: Translations = {
  common: {
    appName: "ThietKeResort",
    loading: "Loading...",
    error: "An error occurred",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    filter: "Filter",
    refresh: "Refresh",
    retry: "Retry",
    close: "Close",
    back: "Back",
    next: "Next",
    done: "Done",
    yes: "Yes",
    no: "No",
    ok: "OK",
    viewAll: "View All",
    seeMore: "See More",
    noData: "No data",
    noResults: "No results found",
    manage: "Manage",
    share: "Share",
  },
  auth: {
    login: "Login",
    logout: "Logout",
    register: "Register",
    forgotPassword: "Forgot password?",
    changePassword: "Change Password",
    email: "Email",
    password: "Password",
    phone: "Phone Number",
    otp: "OTP Code",
    sendOtp: "Send OTP",
    createAccount: "Create Account",
    haveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    orContinueWith: "Or continue with",
    twoFactorAuth: "Two-Factor Authentication (2FA)",
    twoFactorAuthDesc: "Enhanced account security",
    biometric: "Biometric Login",
    biometricDesc: "Face ID / Fingerprint",
    welcomeBack: "Welcome back!",
    logoutConfirm: "Are you sure you want to logout?",
  },
  profile: {
    title: "Profile",
    account: "Account",
    personalInfo: "Personal Information",
    updateProfile: "Update your profile",
    editProfile: "Edit Profile",
    changeAvatar: "Change Avatar",
    takePhoto: "Take Photo",
    chooseFromGallery: "Choose from Gallery",
    removePhoto: "Remove Photo",
    verified: "Verified",
    notVerified: "Not Verified",
    verifyPhone: "Verify Phone Number",
    security: "Security",
    securityAccount: "Account Security",
    completion: "Complete Profile",
    completionDesc: "Complete to get rewards",
    myQRCode: "My QR Code",
    shareProfile: "Share Profile",
    saveImage: "Save Image",
    achievements: "Achievements",
    socialLinks: "Social Media Links",
    deleteAccount: "Delete Account",
    deleteForever: "Delete Forever",
    customer: "Customer",
    admin: "Admin",
    engineer: "Engineer",
    vip: "VIP",
  },
  settings: {
    title: "Settings",
    appearance: "Appearance",
    appearanceDesc: "Light / Dark / Auto",
    language: "Language",
    languageCurrent: "English",
    selectLanguage: "Select Language",
    notifications: "Notifications",
    manageNotifications: "Manage Notifications",
    privacy: "Privacy",
    manageData: "Manage Data",
    version: "Version",
    helpCenter: "Help Center",
    faqGuide: "FAQ & Guide",
    contactSupport: "Contact Support",
    chatWithUs: "Chat with us",
    termsPolicy: "Terms & Policy",
    rateApp: "Rate App",
    rateAppDesc: "Give us 5 stars!",
    danger: "Danger",
  },
  nav: {
    home: "Home",
    explore: "Explore",
    favorites: "Favorites",
    cart: "Cart",
    messages: "Messages",
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    projects: "Projects",
    contacts: "Contacts",
    calls: "Calls",
    accountSecurity: "Account & Security",
    projectsFavorites: "Projects & Favorites",
    support: "Support",
  },
  home: {
    quickContact: "Quick Contact",
  },
  stats: {
    projects: "Projects",
    completed: "Completed",
    orders: "Orders",
    favorites: "Favorites",
  },
  projects: {
    myProjects: "My Projects",
    projectCount: "{count} projects",
    activityHistory: "Activity History",
    recentActivity: "View recent activity",
  },
  products: {
    savedItems: "{count} saved items",
  },
  achievements: {
    newMember: "New Member",
    newMemberDesc: "Account created successfully",
    securityPro: "Security Pro",
    securityProDesc: "Enable 2FA authentication",
    shopper: "Shopper",
    shopperDesc: "Complete 10 orders",
    connector: "Connector",
    connectorDesc: "Message 5 people",
    vipMember: "VIP",
    vipMemberDesc: "Spend over 10 million",
  },
  guest: {
    welcome: "Welcome!",
    subtitle: "Login to discover thousands\nof products and services",
    orContinueWith: "or continue with",
    createAccountNew: "Create new account",
  },
  footer: {
    copyright: "© 2026 ThietKeResort. All rights reserved.",
    version: "Version {version}",
  },
  errors: {
    general: "An error occurred",
    network: "Network error",
    tryAgain: "Please try again",
    cannotTakePhoto: "Cannot take photo",
    cannotSelectPhoto: "Cannot select photo",
    cannotDeleteAccount: "Cannot delete account",
  },
  success: {
    saved: "Saved successfully",
    updated: "Updated successfully",
    deleted: "Deleted successfully",
    avatarUpdated: "Avatar updated",
    avatarDeleted: "Avatar deleted",
    accountDeleted: "Account deleted",
  },
};

const zh: Translations = {
  common: {
    appName: "ThietKeResort",
    loading: "加载中...",
    error: "发生错误",
    success: "成功",
    cancel: "取消",
    confirm: "确认",
    save: "保存",
    delete: "删除",
    edit: "编辑",
    add: "添加",
    search: "搜索",
    filter: "筛选",
    refresh: "刷新",
    retry: "重试",
    close: "关闭",
    back: "返回",
    next: "下一步",
    done: "完成",
    yes: "是",
    no: "否",
    ok: "确定",
    viewAll: "查看全部",
    seeMore: "查看更多",
    noData: "无数据",
    noResults: "未找到结果",
    manage: "管理",
    share: "分享",
  },
  auth: {
    login: "登录",
    logout: "退出登录",
    register: "注册",
    forgotPassword: "忘记密码？",
    changePassword: "修改密码",
    email: "邮箱",
    password: "密码",
    phone: "电话号码",
    otp: "验证码",
    sendOtp: "发送验证码",
    createAccount: "创建账户",
    haveAccount: "已有账户？",
    noAccount: "没有账户？",
    orContinueWith: "或继续使用",
    twoFactorAuth: "两步验证 (2FA)",
    twoFactorAuthDesc: "增强账户安全",
    biometric: "生物识别登录",
    biometricDesc: "面部识别 / 指纹",
    welcomeBack: "欢迎回来！",
    logoutConfirm: "确定要退出登录吗？",
  },
  profile: {
    title: "个人资料",
    account: "账户",
    personalInfo: "个人信息",
    updateProfile: "更新您的资料",
    editProfile: "编辑资料",
    changeAvatar: "更换头像",
    takePhoto: "拍照",
    chooseFromGallery: "从相册选择",
    removePhoto: "删除照片",
    verified: "已验证",
    notVerified: "未验证",
    verifyPhone: "验证电话号码",
    security: "安全",
    securityAccount: "账户安全",
    completion: "完善资料",
    completionDesc: "完成后获得奖励",
    myQRCode: "我的二维码",
    shareProfile: "分享资料",
    saveImage: "保存图片",
    achievements: "成就",
    socialLinks: "社交媒体链接",
    deleteAccount: "删除账户",
    deleteForever: "永久删除",
    customer: "客户",
    admin: "管理员",
    engineer: "工程师",
    vip: "VIP",
  },
  settings: {
    title: "设置",
    appearance: "外观",
    appearanceDesc: "浅色 / 深色 / 自动",
    language: "语言",
    languageCurrent: "中文",
    selectLanguage: "选择语言",
    notifications: "通知",
    manageNotifications: "管理通知",
    privacy: "隐私",
    manageData: "管理数据",
    version: "版本",
    helpCenter: "帮助中心",
    faqGuide: "常见问题与指南",
    contactSupport: "联系支持",
    chatWithUs: "与我们聊天",
    termsPolicy: "条款与政策",
    rateApp: "评价应用",
    rateAppDesc: "给我们5星好评！",
    danger: "危险",
  },
  nav: {
    home: "首页",
    explore: "探索",
    favorites: "收藏",
    cart: "购物车",
    messages: "消息",
    notifications: "通知",
    profile: "个人",
    settings: "设置",
    projects: "项目",
    contacts: "联系人",
    calls: "通话",
    accountSecurity: "账户与安全",
    projectsFavorites: "项目与收藏",
    support: "支持",
  },
  home: { quickContact: "快速联系" },
  stats: {
    projects: "项目",
    completed: "已完成",
    orders: "订单",
    favorites: "收藏",
  },
  projects: {
    myProjects: "我的项目",
    projectCount: "{count} 个项目",
    activityHistory: "活动历史",
    recentActivity: "查看最近活动",
  },
  products: { savedItems: "已保存 {count} 项" },
  achievements: {
    newMember: "新成员",
    newMemberDesc: "成功创建账户",
    securityPro: "安全专家",
    securityProDesc: "启用两步验证",
    shopper: "购物达人",
    shopperDesc: "完成10个订单",
    connector: "社交达人",
    connectorDesc: "与5人聊天",
    vipMember: "VIP",
    vipMemberDesc: "消费超过1000万",
  },
  guest: {
    welcome: "欢迎！",
    subtitle: "登录发现数千种\n产品和服务",
    orContinueWith: "或继续使用",
    createAccountNew: "创建新账户",
  },
  footer: {
    copyright: "© 2026 ThietKeResort. 保留所有权利。",
    version: "版本 {version}",
  },
  errors: {
    general: "发生错误",
    network: "网络错误",
    tryAgain: "请重试",
    cannotTakePhoto: "无法拍照",
    cannotSelectPhoto: "无法选择照片",
    cannotDeleteAccount: "无法删除账户",
  },
  success: {
    saved: "保存成功",
    updated: "更新成功",
    deleted: "删除成功",
    avatarUpdated: "头像已更新",
    avatarDeleted: "头像已删除",
    accountDeleted: "账户已删除",
  },
};

const ja: Translations = {
  common: {
    appName: "ThietKeResort",
    loading: "読み込み中...",
    error: "エラーが発生しました",
    success: "成功",
    cancel: "キャンセル",
    confirm: "確認",
    save: "保存",
    delete: "削除",
    edit: "編集",
    add: "追加",
    search: "検索",
    filter: "フィルター",
    refresh: "更新",
    retry: "再試行",
    close: "閉じる",
    back: "戻る",
    next: "次へ",
    done: "完了",
    yes: "はい",
    no: "いいえ",
    ok: "OK",
    viewAll: "すべて表示",
    seeMore: "もっと見る",
    noData: "データがありません",
    noResults: "結果が見つかりません",
    manage: "管理",
    share: "共有",
  },
  auth: {
    login: "ログイン",
    logout: "ログアウト",
    register: "登録",
    forgotPassword: "パスワードをお忘れですか？",
    changePassword: "パスワード変更",
    email: "メール",
    password: "パスワード",
    phone: "電話番号",
    otp: "認証コード",
    sendOtp: "認証コードを送信",
    createAccount: "アカウント作成",
    haveAccount: "アカウントをお持ちですか？",
    noAccount: "アカウントをお持ちでないですか？",
    orContinueWith: "または続行",
    twoFactorAuth: "二要素認証 (2FA)",
    twoFactorAuthDesc: "アカウントセキュリティ強化",
    biometric: "生体認証ログイン",
    biometricDesc: "Face ID / 指紋",
    welcomeBack: "おかえりなさい！",
    logoutConfirm: "ログアウトしてもよろしいですか？",
  },
  profile: {
    title: "プロフィール",
    account: "アカウント",
    personalInfo: "個人情報",
    updateProfile: "プロフィールを更新",
    editProfile: "プロフィール編集",
    changeAvatar: "アバター変更",
    takePhoto: "写真を撮る",
    chooseFromGallery: "ギャラリーから選択",
    removePhoto: "写真を削除",
    verified: "確認済み",
    notVerified: "未確認",
    verifyPhone: "電話番号を確認",
    security: "セキュリティ",
    securityAccount: "アカウントセキュリティ",
    completion: "プロフィール完成",
    completionDesc: "完了して報酬を獲得",
    myQRCode: "マイQRコード",
    shareProfile: "プロフィールを共有",
    saveImage: "画像を保存",
    achievements: "実績",
    socialLinks: "SNSリンク",
    deleteAccount: "アカウント削除",
    deleteForever: "完全削除",
    customer: "お客様",
    admin: "管理者",
    engineer: "エンジニア",
    vip: "VIP",
  },
  settings: {
    title: "設定",
    appearance: "外観",
    appearanceDesc: "ライト / ダーク / 自動",
    language: "言語",
    languageCurrent: "日本語",
    selectLanguage: "言語を選択",
    notifications: "通知",
    manageNotifications: "通知を管理",
    privacy: "プライバシー",
    manageData: "データを管理",
    version: "バージョン",
    helpCenter: "ヘルプセンター",
    faqGuide: "FAQ & ガイド",
    contactSupport: "サポートに連絡",
    chatWithUs: "チャット",
    termsPolicy: "利用規約とポリシー",
    rateApp: "アプリを評価",
    rateAppDesc: "5つ星をください！",
    danger: "危険",
  },
  nav: {
    home: "ホーム",
    explore: "探索",
    favorites: "お気に入り",
    cart: "カート",
    messages: "メッセージ",
    notifications: "通知",
    profile: "プロフィール",
    settings: "設定",
    projects: "プロジェクト",
    contacts: "連絡先",
    calls: "通話",
    accountSecurity: "アカウントとセキュリティ",
    projectsFavorites: "プロジェクトとお気に入り",
    support: "サポート",
  },
  home: { quickContact: "クイック連絡" },
  stats: {
    projects: "プロジェクト",
    completed: "完了",
    orders: "注文",
    favorites: "お気に入り",
  },
  projects: {
    myProjects: "マイプロジェクト",
    projectCount: "{count} プロジェクト",
    activityHistory: "活動履歴",
    recentActivity: "最近の活動を表示",
  },
  products: { savedItems: "{count} 件保存済み" },
  achievements: {
    newMember: "新メンバー",
    newMemberDesc: "アカウント作成完了",
    securityPro: "セキュリティプロ",
    securityProDesc: "2FA認証を有効化",
    shopper: "ショッパー",
    shopperDesc: "10件の注文を完了",
    connector: "コネクター",
    connectorDesc: "5人とメッセージ",
    vipMember: "VIP",
    vipMemberDesc: "1000万以上支出",
  },
  guest: {
    welcome: "ようこそ！",
    subtitle: "ログインして数千の\n製品とサービスを発見",
    orContinueWith: "または続行",
    createAccountNew: "新規アカウント作成",
  },
  footer: {
    copyright: "© 2026 ThietKeResort. All rights reserved.",
    version: "バージョン {version}",
  },
  errors: {
    general: "エラーが発生しました",
    network: "ネットワークエラー",
    tryAgain: "再試行してください",
    cannotTakePhoto: "写真を撮れません",
    cannotSelectPhoto: "写真を選択できません",
    cannotDeleteAccount: "アカウントを削除できません",
  },
  success: {
    saved: "保存しました",
    updated: "更新しました",
    deleted: "削除しました",
    avatarUpdated: "アバターを更新しました",
    avatarDeleted: "アバターを削除しました",
    accountDeleted: "アカウントを削除しました",
  },
};

const ko: Translations = {
  common: {
    appName: "ThietKeResort",
    loading: "로딩 중...",
    error: "오류가 발생했습니다",
    success: "성공",
    cancel: "취소",
    confirm: "확인",
    save: "저장",
    delete: "삭제",
    edit: "편집",
    add: "추가",
    search: "검색",
    filter: "필터",
    refresh: "새로고침",
    retry: "다시 시도",
    close: "닫기",
    back: "뒤로",
    next: "다음",
    done: "완료",
    yes: "예",
    no: "아니오",
    ok: "확인",
    viewAll: "모두 보기",
    seeMore: "더 보기",
    noData: "데이터가 없습니다",
    noResults: "결과를 찾을 수 없습니다",
    manage: "관리",
    share: "공유",
  },
  auth: {
    login: "로그인",
    logout: "로그아웃",
    register: "회원가입",
    forgotPassword: "비밀번호를 잊으셨나요?",
    changePassword: "비밀번호 변경",
    email: "이메일",
    password: "비밀번호",
    phone: "전화번호",
    otp: "인증 코드",
    sendOtp: "인증 코드 전송",
    createAccount: "계정 만들기",
    haveAccount: "이미 계정이 있으신가요?",
    noAccount: "계정이 없으신가요?",
    orContinueWith: "또는 계속하기",
    twoFactorAuth: "2단계 인증 (2FA)",
    twoFactorAuthDesc: "계정 보안 강화",
    biometric: "생체 인식 로그인",
    biometricDesc: "Face ID / 지문",
    welcomeBack: "다시 오신 것을 환영합니다!",
    logoutConfirm: "로그아웃 하시겠습니까?",
  },
  profile: {
    title: "프로필",
    account: "계정",
    personalInfo: "개인 정보",
    updateProfile: "프로필 업데이트",
    editProfile: "프로필 편집",
    changeAvatar: "아바타 변경",
    takePhoto: "사진 찍기",
    chooseFromGallery: "갤러리에서 선택",
    removePhoto: "사진 삭제",
    verified: "인증됨",
    notVerified: "미인증",
    verifyPhone: "전화번호 인증",
    security: "보안",
    securityAccount: "계정 보안",
    completion: "프로필 완성",
    completionDesc: "완료하여 보상 받기",
    myQRCode: "내 QR 코드",
    shareProfile: "프로필 공유",
    saveImage: "이미지 저장",
    achievements: "업적",
    socialLinks: "소셜 미디어 링크",
    deleteAccount: "계정 삭제",
    deleteForever: "영구 삭제",
    customer: "고객",
    admin: "관리자",
    engineer: "엔지니어",
    vip: "VIP",
  },
  settings: {
    title: "설정",
    appearance: "모양",
    appearanceDesc: "라이트 / 다크 / 자동",
    language: "언어",
    languageCurrent: "한국어",
    selectLanguage: "언어 선택",
    notifications: "알림",
    manageNotifications: "알림 관리",
    privacy: "개인정보",
    manageData: "데이터 관리",
    version: "버전",
    helpCenter: "도움말 센터",
    faqGuide: "FAQ & 가이드",
    contactSupport: "지원 문의",
    chatWithUs: "채팅하기",
    termsPolicy: "이용약관 및 정책",
    rateApp: "앱 평가",
    rateAppDesc: "별 5개를 주세요!",
    danger: "위험",
  },
  nav: {
    home: "홈",
    explore: "탐색",
    favorites: "즐겨찾기",
    cart: "장바구니",
    messages: "메시지",
    notifications: "알림",
    profile: "프로필",
    settings: "설정",
    projects: "프로젝트",
    contacts: "연락처",
    calls: "통화",
    accountSecurity: "계정 및 보안",
    projectsFavorites: "프로젝트 및 즐겨찾기",
    support: "지원",
  },
  home: { quickContact: "빠른 연락" },
  stats: {
    projects: "프로젝트",
    completed: "완료",
    orders: "주문",
    favorites: "즐겨찾기",
  },
  projects: {
    myProjects: "내 프로젝트",
    projectCount: "프로젝트 {count}개",
    activityHistory: "활동 기록",
    recentActivity: "최근 활동 보기",
  },
  products: { savedItems: "{count}개 저장됨" },
  achievements: {
    newMember: "신규 회원",
    newMemberDesc: "계정 생성 완료",
    securityPro: "보안 전문가",
    securityProDesc: "2FA 인증 활성화",
    shopper: "쇼퍼",
    shopperDesc: "주문 10건 완료",
    connector: "커넥터",
    connectorDesc: "5명과 메시지",
    vipMember: "VIP",
    vipMemberDesc: "1000만 이상 지출",
  },
  guest: {
    welcome: "환영합니다!",
    subtitle: "로그인하여 수천 개의\n제품과 서비스를 발견하세요",
    orContinueWith: "또는 계속하기",
    createAccountNew: "새 계정 만들기",
  },
  footer: {
    copyright: "© 2026 ThietKeResort. All rights reserved.",
    version: "버전 {version}",
  },
  errors: {
    general: "오류가 발생했습니다",
    network: "네트워크 오류",
    tryAgain: "다시 시도해 주세요",
    cannotTakePhoto: "사진을 찍을 수 없습니다",
    cannotSelectPhoto: "사진을 선택할 수 없습니다",
    cannotDeleteAccount: "계정을 삭제할 수 없습니다",
  },
  success: {
    saved: "저장되었습니다",
    updated: "업데이트되었습니다",
    deleted: "삭제되었습니다",
    avatarUpdated: "아바타가 업데이트되었습니다",
    avatarDeleted: "아바타가 삭제되었습니다",
    accountDeleted: "계정이 삭제되었습니다",
  },
};

const translations: Record<SupportedLanguage, Translations> = {
  vi,
  en,
  zh,
  ja,
  ko,
};

// ==================== UTILITY FUNCTIONS ====================

export function getDeviceLanguage(): SupportedLanguage {
  try {
    // Get device locale without expo-localization
    let locale = "vi";

    if (Platform.OS === "ios") {
      locale =
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        "vi";
    } else if (Platform.OS === "android") {
      locale = NativeModules.I18nManager?.localeIdentifier || "vi";
    } else if (Platform.OS === "web") {
      locale = typeof navigator !== "undefined" ? navigator.language : "vi";
    }

    const langCode = locale.split("-")[0].split("_")[0].toLowerCase();

    if (SUPPORTED_LANGUAGES.some((l) => l.code === langCode)) {
      return langCode as SupportedLanguage;
    }
  } catch {
    // Fallback
  }
  return DEFAULT_LANGUAGE;
}

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split(".").reduce((acc, part) => {
    if (acc && typeof acc === "object") {
      return acc[part];
    }
    return undefined;
  }, obj);
}

export function translate(
  key: string,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
  params?: Record<string, string | number>,
): string {
  const langTranslations =
    translations[language] || translations[DEFAULT_LANGUAGE];

  let text = getNestedValue(langTranslations, key);

  if (!text && language !== "vi") {
    text = getNestedValue(translations.vi, key);
  }
  if (!text && language !== "en") {
    text = getNestedValue(translations.en, key);
  }
  if (!text) {
    console.warn(`[i18n] Missing translation: ${key}`);
    return key;
  }

  if (params && typeof text === "string") {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = (text as string).replace(
        new RegExp(`\\{${paramKey}\\}`, "g"),
        String(value),
      );
    });
  }

  return text as string;
}

// ==================== STORAGE ====================

export async function getStoredLanguage(): Promise<SupportedLanguage> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
      return stored as SupportedLanguage;
    }
  } catch (error) {
    console.error("[i18n] Failed to get stored language:", error);
  }
  return getDeviceLanguage();
}

export async function setStoredLanguage(
  language: SupportedLanguage,
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, language);
  } catch (error) {
    console.error("[i18n] Failed to store language:", error);
  }
}

// ==================== CONTEXT ====================

interface I18nContextType {
  language: SupportedLanguage;
  languageInfo: LanguageInfo;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// ==================== PROVIDER ====================

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({
  children,
}: I18nProviderProps): React.JSX.Element {
  const [language, setLanguageState] =
    useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStoredLanguage().then((lang) => {
      setLanguageState(lang);
      setIsLoading(false);
    });
  }, []);

  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    setLanguageState(lang);
    await setStoredLanguage(lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translate(key, language, params);
    },
    [language],
  );

  const languageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) ||
    SUPPORTED_LANGUAGES[0];

  const value: I18nContextType = {
    language,
    languageInfo,
    setLanguage,
    t,
    isLoading,
  };

  return React.createElement(I18nContext.Provider, { value }, children);
}

// ==================== HOOKS ====================

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function useTranslation(): {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: SupportedLanguage;
} {
  const { t, language } = useI18n();
  return { t, language };
}

// ==================== EXPORTS ====================

export { translations };
export default {
  translate,
  getDeviceLanguage,
  getStoredLanguage,
  setStoredLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
};
