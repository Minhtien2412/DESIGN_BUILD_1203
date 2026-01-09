/**
 * Formatters
 * Domain-specific formatting utilities
 */

/**
 * Format currency values
 */
export const formatCurrency = (amount: number, currency = 'VND'): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format date relative to now
 */
export const formatRelativeDate = (date: string | Date): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = targetDate.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Tomorrow';
  if (diffInDays === -1) return 'Yesterday';
  if (diffInDays > 0) return `In ${diffInDays} days`;
  return `${Math.abs(diffInDays)} days ago`;
};

/**
 * Format duration in days to human readable
 */
export const formatDuration = (days: number): string => {
  if (days < 1) return 'Less than a day';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  
  if (weeks === 1) {
    return remainingDays === 0 ? '1 week' : `1 week ${remainingDays} days`;
  }
  
  return remainingDays === 0 ? `${weeks} weeks` : `${weeks} weeks ${remainingDays} days`;
};

/**
 * Format percentage with proper styling
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format task status for display
 */
export const formatTaskStatus = (status: string): string => {
  switch (status) {
    case 'in-progress': return 'In Progress';
    case 'pending': return 'Pending';
    case 'completed': return 'Completed';
    case 'review': return 'Under Review';
    case 'delayed': return 'Delayed';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

/**
 * Format payment status for display
 */
export const formatPaymentStatus = (status: string): string => {
  switch (status) {
    case 'scheduled': return 'Scheduled';
    case 'pending': return 'Pending';
    case 'processing': return 'Processing';
    case 'completed': return 'Completed';
    case 'overdue': return 'Overdue';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Format large numbers with suffixes
 */
export const formatCompactNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
};
