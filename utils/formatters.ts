/**
 * Formatting Utilities for Construction App
 * Handles currency, dates, numbers, and Vietnamese-specific formatting
 */

/**
 * Format number to Vietnamese currency (VND)
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('vi-VN')} ₫`;
};

/**
 * Format currency in short form (millions)
 */
export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} tr`;
  }
  return formatCurrency(amount);
};

/**
 * Format area (square meters)
 */
export const formatArea = (area: number, unit: string = 'm²'): string => {
  return `${area.toLocaleString('vi-VN')} ${unit}`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format date to Vietnamese format (dd/mm/yyyy)
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format time (HH:mm)
 */
export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Format date and time
 */
export const formatDateTime = (date: Date | string): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Format relative time (e.g., "2 giờ trước")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return `${Math.floor(diffDays / 365)} năm trước`;
};

/**
 * Format phone number (Vietnamese format)
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format: 0xxx xxx xxx or 0xx xxx xxxx
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format rating (e.g., "4.8/5.0")
 */
export const formatRating = (rating: number, maxRating: number = 5): string => {
  return `${rating.toFixed(1)}/${maxRating.toFixed(1)}`;
};

/**
 * Format number with suffix (K, M, B)
 */
export const formatNumberShort = (num: number): string => {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Format duration (seconds to readable format)
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

/**
 * Format Vietnamese address
 */
export const formatAddress = (address: {
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
}): string => {
  const parts = [
    address.street,
    address.ward,
    address.district,
    address.city,
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Capitalize first letter
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Capitalize each word
 */
export const capitalizeWords = (text: string): string => {
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Format construction progress (e.g., "Giai đoạn 2/5")
 */
export const formatProgress = (current: number, total: number): string => {
  return `Giai đoạn ${current}/${total}`;
};

/**
 * Format price range
 */
export const formatPriceRange = (min: number, max: number): string => {
  return `${formatCurrencyShort(min)} - ${formatCurrencyShort(max)}`;
};

/**
 * Parse Vietnamese currency string to number
 */
export const parseCurrency = (currencyString: string): number => {
  return parseInt(currencyString.replace(/[^\d]/g, ''), 10) || 0;
};

/**
 * Format measurement (with unit conversion)
 */
export const formatMeasurement = (
  value: number,
  unit: 'mm' | 'cm' | 'm' | 'km'
): string => {
  const conversions = {
    mm: { display: 'mm', factor: 1 },
    cm: { display: 'cm', factor: 10 },
    m: { display: 'm', factor: 1000 },
    km: { display: 'km', factor: 1000000 },
  };
  
  const config = conversions[unit];
  return `${(value / config.factor).toFixed(2)} ${config.display}`;
};

/**
 * Format coordinate (latitude/longitude)
 */
export const formatCoordinate = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Validation: Check if Vietnamese phone number
 */
export const isValidVietnamesePhone = (phone: string): boolean => {
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validation: Check if valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Export all formatters
 */
export default {
  currency: formatCurrency,
  currencyShort: formatCurrencyShort,
  area: formatArea,
  percentage: formatPercentage,
  date: formatDate,
  time: formatTime,
  dateTime: formatDateTime,
  relativeTime: formatRelativeTime,
  phoneNumber: formatPhoneNumber,
  fileSize: formatFileSize,
  rating: formatRating,
  numberShort: formatNumberShort,
  duration: formatDuration,
  address: formatAddress,
  truncate: truncateText,
  capitalize,
  capitalizeWords,
  progress: formatProgress,
  priceRange: formatPriceRange,
  parseCurrency,
  measurement: formatMeasurement,
  coordinate: formatCoordinate,
  validate: {
    phone: isValidVietnamesePhone,
    email: isValidEmail,
  },
};
