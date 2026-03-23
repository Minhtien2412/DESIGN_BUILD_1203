/**
 * Localization Utilities - Tiện ích đa ngôn ngữ
 * Sử dụng expo-localization để hỗ trợ đa ngôn ngữ
 */

import * as Localization from "expo-localization";

// ============================================
// TYPES
// ============================================

export interface LocaleInfo {
  languageCode: string;
  languageTag: string;
  regionCode: string | null;
  textDirection: "ltr" | "rtl";
  currency: string | null;
  timezone: string;
  uses24HourClock: boolean;
  decimalSeparator: string;
  groupingSeparator: string;
}

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

export interface TranslationMap {
  [key: string]: {
    vi: string;
    en: string;
    zh?: string;
    ja?: string;
    ko?: string;
  };
}

// ============================================
// LOCALIZATION UTILITIES
// ============================================

/**
 * Get device locale information
 */
export function getLocaleInfo(): LocaleInfo {
  const locales = Localization.getLocales();
  const calendars = Localization.getCalendars();
  const locale = locales[0];
  const calendar = calendars[0];

  return {
    languageCode: locale?.languageCode || "vi",
    languageTag: locale?.languageTag || "vi-VN",
    regionCode: locale?.regionCode || "VN",
    textDirection: locale?.textDirection || "ltr",
    currency: locale?.currencyCode || "VND",
    timezone: calendar?.timeZone || "Asia/Ho_Chi_Minh",
    uses24HourClock: calendar?.uses24hourClock ?? true,
    decimalSeparator: locale?.decimalSeparator || ",",
    groupingSeparator: locale?.digitGroupingSeparator || ".",
  };
}

/**
 * Get device language code (vi, en, zh, etc.)
 */
export function getLanguageCode(): string {
  const locales = Localization.getLocales();
  return locales[0]?.languageCode || "vi";
}

/**
 * Get device region code (VN, US, etc.)
 */
export function getRegionCode(): string {
  const locales = Localization.getLocales();
  return locales[0]?.regionCode || "VN";
}

/**
 * Get device timezone
 */
export function getTimezone(): string {
  const calendars = Localization.getCalendars();
  return calendars[0]?.timeZone || "Asia/Ho_Chi_Minh";
}

/**
 * Check if device uses RTL layout
 */
export function isRTL(): boolean {
  const locales = Localization.getLocales();
  return locales[0]?.textDirection === "rtl";
}

/**
 * Check if device uses 24-hour clock
 */
export function uses24HourClock(): boolean {
  const calendars = Localization.getCalendars();
  return calendars[0]?.uses24hourClock ?? true;
}

/**
 * Get device currency code
 */
export function getCurrencyCode(): string {
  const locales = Localization.getLocales();
  return locales[0]?.currencyCode || "VND";
}

// ============================================
// NUMBER FORMATTING
// ============================================

/**
 * Format number with locale separators
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  const locale = getLocaleInfo();
  return new Intl.NumberFormat(locale.languageTag, options).format(value);
}

/**
 * Format currency
 */
export function formatCurrency(
  value: number,
  currency?: string,
  options?: Intl.NumberFormatOptions,
): string {
  const locale = getLocaleInfo();
  return new Intl.NumberFormat(locale.languageTag, {
    style: "currency",
    currency: currency || locale.currency || "VND",
    ...options,
  }).format(value);
}

/**
 * Format VND currency (common use case)
 */
export function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
  const locale = getLocaleInfo();
  return new Intl.NumberFormat(locale.languageTag, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Format date with locale
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const locale = getLocaleInfo();
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat(locale.languageTag, options).format(dateObj);
}

/**
 * Format date as short string (DD/MM/YYYY)
 */
export function formatDateShort(date: Date | string | number): string {
  return formatDate(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format date as long string (Thứ X, ngày DD tháng MM năm YYYY)
 */
export function formatDateLong(date: Date | string | number): string {
  return formatDate(date, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format time
 */
export function formatTime(
  date: Date | string | number,
  includeSeconds: boolean = false,
): string {
  const locale = getLocaleInfo();
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat(locale.languageTag, {
    hour: "2-digit",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
    hour12: !locale.uses24HourClock,
  }).format(dateObj);
}

/**
 * Format datetime
 */
export function formatDateTime(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  return formatDate(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}

/**
 * Format relative time (e.g., "2 giờ trước", "trong 3 ngày")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const locale = getLocaleInfo();
  const now = new Date();
  const dateObj = new Date(date);
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffWeek = Math.round(diffDay / 7);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);

  const rtf = new Intl.RelativeTimeFormat(locale.languageTag, {
    numeric: "auto",
  });

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, "second");
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");
  if (Math.abs(diffDay) < 7) return rtf.format(diffDay, "day");
  if (Math.abs(diffWeek) < 4) return rtf.format(diffWeek, "week");
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, "month");
  return rtf.format(diffYear, "year");
}

// ============================================
// TRANSLATION HELPER
// ============================================

/**
 * Simple translation function
 */
export function translate(
  translations: TranslationMap,
  key: string,
  fallback?: string,
): string {
  const lang = getLanguageCode() as SupportedLanguage;
  const entry = translations[key];

  if (!entry) return fallback || key;

  // Try exact language
  const langEntry = (entry as Record<string, string | undefined>)[lang];
  if (langEntry) return langEntry;

  // Fallback to Vietnamese then English
  if (entry.vi) return entry.vi;
  if (entry.en) return entry.en;

  return fallback || key;
}

/**
 * Create a translator function with predefined translations
 */
export function createTranslator(translations: TranslationMap) {
  return (key: string, fallback?: string) =>
    translate(translations, key, fallback);
}

// ============================================
// COMMON TRANSLATIONS
// ============================================

export const commonTranslations: TranslationMap = {
  // Actions
  save: { vi: "Lưu", en: "Save" },
  cancel: { vi: "Hủy", en: "Cancel" },
  delete: { vi: "Xóa", en: "Delete" },
  edit: { vi: "Sửa", en: "Edit" },
  add: { vi: "Thêm", en: "Add" },
  create: { vi: "Tạo", en: "Create" },
  update: { vi: "Cập nhật", en: "Update" },
  confirm: { vi: "Xác nhận", en: "Confirm" },
  close: { vi: "Đóng", en: "Close" },
  back: { vi: "Quay lại", en: "Back" },
  next: { vi: "Tiếp", en: "Next" },
  done: { vi: "Xong", en: "Done" },
  search: { vi: "Tìm kiếm", en: "Search" },
  filter: { vi: "Lọc", en: "Filter" },
  sort: { vi: "Sắp xếp", en: "Sort" },
  refresh: { vi: "Làm mới", en: "Refresh" },
  retry: { vi: "Thử lại", en: "Retry" },
  submit: { vi: "Gửi", en: "Submit" },
  share: { vi: "Chia sẻ", en: "Share" },
  copy: { vi: "Sao chép", en: "Copy" },

  // Status
  loading: { vi: "Đang tải...", en: "Loading..." },
  success: { vi: "Thành công", en: "Success" },
  error: { vi: "Lỗi", en: "Error" },
  warning: { vi: "Cảnh báo", en: "Warning" },
  info: { vi: "Thông tin", en: "Information" },
  pending: { vi: "Đang chờ", en: "Pending" },
  completed: { vi: "Hoàn thành", en: "Completed" },
  failed: { vi: "Thất bại", en: "Failed" },
  processing: { vi: "Đang xử lý", en: "Processing" },

  // Network
  offline: { vi: "Không có mạng", en: "Offline" },
  online: { vi: "Đã kết nối", en: "Online" },
  noInternet: { vi: "Không có kết nối internet", en: "No internet connection" },
  connectionError: { vi: "Lỗi kết nối", en: "Connection error" },

  // Time
  today: { vi: "Hôm nay", en: "Today" },
  yesterday: { vi: "Hôm qua", en: "Yesterday" },
  tomorrow: { vi: "Ngày mai", en: "Tomorrow" },
  now: { vi: "Bây giờ", en: "Now" },

  // Empty states
  noData: { vi: "Không có dữ liệu", en: "No data" },
  noResults: { vi: "Không tìm thấy kết quả", en: "No results found" },
  empty: { vi: "Trống", en: "Empty" },
};

// ============================================
// EXPORTS
// ============================================

export const localizationUtils = {
  // Locale info
  getLocaleInfo,
  getLanguageCode,
  getRegionCode,
  getTimezone,
  isRTL,
  uses24HourClock,
  getCurrencyCode,

  // Number formatting
  formatNumber,
  formatCurrency,
  formatVND,
  formatPercent,

  // Date formatting
  formatDate,
  formatDateShort,
  formatDateLong,
  formatTime,
  formatDateTime,
  formatRelativeTime,

  // Translation
  translate,
  createTranslator,
  commonTranslations,
};

export default localizationUtils;
