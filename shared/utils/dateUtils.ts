/**
 * Date/Time Utilities
 * Xử lý ngày tháng và thời gian
 */

// ============================================
// TYPES
// ============================================

export interface TimeComponents {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type DateInput = Date | string | number;

// ============================================
// PARSE HELPERS
// ============================================

/**
 * Parse any date input to Date object
 */
export function parseDate(input: DateInput): Date {
  if (input instanceof Date) return input;
  return new Date(input);
}

// ============================================
// FORMAT FUNCTIONS
// ============================================

/**
 * Format date to Vietnamese format (dd/MM/yyyy)
 */
export function formatDateVN(input: DateInput): string {
  const date = parseDate(input);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format datetime to Vietnamese format (dd/MM/yyyy HH:mm)
 */
export function formatDateTimeVN(input: DateInput): string {
  const date = parseDate(input);
  const dateStr = formatDateVN(date);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Format time only (HH:mm)
 */
export function formatTime(input: DateInput): string {
  const date = parseDate(input);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Format time with seconds (HH:mm:ss)
 */
export function formatTimeFull(input: DateInput): string {
  const date = parseDate(input);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format ISO date (yyyy-MM-dd)
 */
export function formatDateISO(input: DateInput): string {
  const date = parseDate(input);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format to month/year (MM/yyyy or Tháng M, năm Y)
 */
export function formatMonthYear(
  input: DateInput,
  verbose: boolean = false,
): string {
  const date = parseDate(input);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  if (verbose) {
    return `Tháng ${month}, ${year}`;
  }
  return `${month.toString().padStart(2, "0")}/${year}`;
}

/**
 * Format day of week in Vietnamese
 */
export function formatDayOfWeek(
  input: DateInput,
  short: boolean = false,
): string {
  const date = parseDate(input);
  const day = date.getDay();
  const days = short
    ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
    : [
        "Chủ nhật",
        "Thứ hai",
        "Thứ ba",
        "Thứ tư",
        "Thứ năm",
        "Thứ sáu",
        "Thứ bảy",
      ];
  return days[day];
}

/**
 * Format full date with day name (Thứ X, dd/MM/yyyy)
 */
export function formatDateFull(input: DateInput): string {
  const date = parseDate(input);
  const dayName = formatDayOfWeek(date);
  const dateStr = formatDateVN(date);
  return `${dayName}, ${dateStr}`;
}

// ============================================
// RELATIVE TIME FUNCTIONS
// ============================================

/**
 * Get relative time in Vietnamese
 */
export function getRelativeTime(input: DateInput): string {
  const date = parseDate(input);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 0) {
    // Future
    const absDiffSec = Math.abs(diffSec);
    const absDiffMin = Math.floor(absDiffSec / 60);
    const absDiffHour = Math.floor(absDiffMin / 60);
    const absDiffDay = Math.floor(absDiffHour / 24);

    if (absDiffSec < 60) return "Sắp tới";
    if (absDiffMin < 60) return `Sau ${absDiffMin} phút`;
    if (absDiffHour < 24) return `Sau ${absDiffHour} giờ`;
    if (absDiffDay < 7) return `Sau ${absDiffDay} ngày`;
    return formatDateVN(date);
  }

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay === 1) return "Hôm qua";
  if (diffDay < 7) return `${diffDay} ngày trước`;
  if (diffWeek < 4) return `${diffWeek} tuần trước`;
  if (diffMonth < 12) return `${diffMonth} tháng trước`;
  if (diffYear === 1) return "1 năm trước";
  return `${diffYear} năm trước`;
}

/**
 * Get smart relative time (shows time for today, date for older)
 */
export function getSmartTime(input: DateInput): string {
  const date = parseDate(input);
  const now = new Date();

  if (isToday(date)) {
    return formatTime(date);
  }
  if (isYesterday(date)) {
    return `Hôm qua ${formatTime(date)}`;
  }
  if (isThisWeek(date)) {
    return `${formatDayOfWeek(date, true)} ${formatTime(date)}`;
  }
  if (isThisYear(date)) {
    return formatDateVN(date).slice(0, 5); // dd/MM
  }
  return formatDateVN(date);
}

// ============================================
// CHECK FUNCTIONS
// ============================================

/**
 * Check if date is today
 */
export function isToday(input: DateInput): boolean {
  const date = parseDate(input);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is yesterday
 */
export function isYesterday(input: DateInput): boolean {
  const date = parseDate(input);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(input: DateInput): boolean {
  const date = parseDate(input);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Check if date is this week
 */
export function isThisWeek(input: DateInput): boolean {
  const date = parseDate(input);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return date >= weekStart && date < weekEnd;
}

/**
 * Check if date is this month
 */
export function isThisMonth(input: DateInput): boolean {
  const date = parseDate(input);
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

/**
 * Check if date is this year
 */
export function isThisYear(input: DateInput): boolean {
  const date = parseDate(input);
  return date.getFullYear() === new Date().getFullYear();
}

/**
 * Check if date is in the past
 */
export function isPast(input: DateInput): boolean {
  return parseDate(input) < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(input: DateInput): boolean {
  return parseDate(input) > new Date();
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: DateInput, date2: DateInput): boolean {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

// ============================================
// MANIPULATION FUNCTIONS
// ============================================

/**
 * Add days to date
 */
export function addDays(input: DateInput, days: number): Date {
  const date = new Date(parseDate(input));
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Add months to date
 */
export function addMonths(input: DateInput, months: number): Date {
  const date = new Date(parseDate(input));
  date.setMonth(date.getMonth() + months);
  return date;
}

/**
 * Add years to date
 */
export function addYears(input: DateInput, years: number): Date {
  const date = new Date(parseDate(input));
  date.setFullYear(date.getFullYear() + years);
  return date;
}

/**
 * Add hours to date
 */
export function addHours(input: DateInput, hours: number): Date {
  const date = new Date(parseDate(input));
  date.setHours(date.getHours() + hours);
  return date;
}

/**
 * Add minutes to date
 */
export function addMinutes(input: DateInput, minutes: number): Date {
  const date = new Date(parseDate(input));
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

/**
 * Get start of day (00:00:00)
 */
export function startOfDay(input: DateInput): Date {
  const date = new Date(parseDate(input));
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get end of day (23:59:59.999)
 */
export function endOfDay(input: DateInput): Date {
  const date = new Date(parseDate(input));
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * Get start of month
 */
export function startOfMonth(input: DateInput): Date {
  const date = new Date(parseDate(input));
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get end of month
 */
export function endOfMonth(input: DateInput): Date {
  const date = new Date(parseDate(input));
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  date.setHours(23, 59, 59, 999);
  return date;
}

// ============================================
// DIFFERENCE FUNCTIONS
// ============================================

/**
 * Get difference in days
 */
export function diffInDays(date1: DateInput, date2: DateInput): number {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get difference in hours
 */
export function diffInHours(date1: DateInput, date2: DateInput): number {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60));
}

/**
 * Get difference in minutes
 */
export function diffInMinutes(date1: DateInput, date2: DateInput): number {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * Get detailed time difference
 */
export function diffDetailed(
  date1: DateInput,
  date2: DateInput,
): TimeComponents {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  let diffMs = Math.abs(d2.getTime() - d1.getTime());

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  diffMs -= days * 1000 * 60 * 60 * 24;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs -= hours * 1000 * 60 * 60;

  const minutes = Math.floor(diffMs / (1000 * 60));
  diffMs -= minutes * 1000 * 60;

  const seconds = Math.floor(diffMs / 1000);

  return { days, hours, minutes, seconds };
}

// ============================================
// COUNTDOWN / TIMER
// ============================================

/**
 * Format countdown (for timers)
 */
export function formatCountdown(
  totalSeconds: number,
  showHours: boolean = true,
): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (showHours && hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Get countdown to a date
 */
export function getCountdownTo(
  target: DateInput,
): TimeComponents & { totalSeconds: number; isPast: boolean } {
  const targetDate = parseDate(target);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);

  const totalSeconds = Math.floor(absDiffMs / 1000);
  const detailed = diffDetailed(now, targetDate);

  return { ...detailed, totalSeconds, isPast };
}

// ============================================
// EXPORTS
// ============================================

export const dateUtils = {
  parseDate,
  formatDateVN,
  formatDateTimeVN,
  formatTime,
  formatTimeFull,
  formatDateISO,
  formatMonthYear,
  formatDayOfWeek,
  formatDateFull,
  getRelativeTime,
  getSmartTime,
  isToday,
  isYesterday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  isThisYear,
  isPast,
  isFuture,
  isSameDay,
  addDays,
  addMonths,
  addYears,
  addHours,
  addMinutes,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  diffInDays,
  diffInHours,
  diffInMinutes,
  diffDetailed,
  formatCountdown,
  getCountdownTo,
};

export default dateUtils;
