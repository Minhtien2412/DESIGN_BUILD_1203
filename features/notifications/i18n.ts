// Multi-language support for notifications
export type SupportedLanguage = 'vi' | 'en' | 'zh' | 'ja' | 'ko';

export interface TranslationEntry {
  vi: string;
  en: string;
  zh?: string;
  ja?: string;
  ko?: string;
}

// Notification type translations
export const NOTIFICATION_TYPES: Record<string, TranslationEntry> = {
  system: {
    vi: 'Hệ thống',
    en: 'System',
    zh: '系统',
    ja: 'システム',
    ko: '시스템',
  },
  message: {
    vi: 'Tin nhắn',
    en: 'Message',
    zh: '消息',
    ja: 'メッセージ',
    ko: '메시지',
  },
  live: {
    vi: 'Trực tiếp',
    en: 'Live',
    zh: '直播',
    ja: 'ライブ',
    ko: '라이브',
  },
  order: {
    vi: 'Đơn hàng',
    en: 'Order',
    zh: '订单',
    ja: '注文',
    ko: '주문',
  },
  reminder: {
    vi: 'Nhắc nhở',
    en: 'Reminder',
    zh: '提醒',
    ja: 'リマインダー',
    ko: '알림',
  },
  appointment: {
    vi: 'Cuộc hẹn',
    en: 'Appointment',
    zh: '约会',
    ja: 'アポイントメント',
    ko: '약속',
  },
  deadline: {
    vi: 'Deadline',
    en: 'Deadline',
    zh: '截止日期',
    ja: '締切',
    ko: '마감일',
  },
};

// Common notification messages
export const NOTIFICATION_MESSAGES: Record<string, TranslationEntry> = {
  // Analytics
  'analytics.title': {
    vi: 'Thống kê thông báo',
    en: 'Notification Analytics',
    zh: '通知分析',
    ja: '通知分析',
    ko: '알림 분석',
  },
  'analytics.totalReceived': {
    vi: 'Tổng nhận',
    en: 'Total Received',
    zh: '总接收',
    ja: '総受信',
    ko: '총 수신',
  },
  'analytics.readRate': {
    vi: 'Tỷ lệ đọc',
    en: 'Read Rate',
    zh: '阅读率',
    ja: '開封率',
    ko: '읽기 비율',
  },
  'analytics.clickRate': {
    vi: 'Tỷ lệ nhấp',
    en: 'Click Rate',
    zh: '点击率',
    ja: 'クリック率',
    ko: '클릭률',
  },
  
  // Scheduled notifications
  'schedule.title': {
    vi: 'Thông báo theo lịch',
    en: 'Scheduled Notifications',
    zh: '定时通知',
    ja: 'スケジュール通知',
    ko: '예약 알림',
  },
  'schedule.upcoming': {
    vi: 'Sắp tới',
    en: 'Upcoming',
    zh: '即将到来',
    ja: '今後',
    ko: '다가오는',
  },
  'schedule.overdue': {
    vi: 'Quá hạn',
    en: 'Overdue',
    zh: '过期',
    ja: '期限切れ',
    ko: '기한 초과',
  },
  'schedule.create': {
    vi: 'Tạo thông báo mới',
    en: 'Create New Notification',
    zh: '创建新通知',
    ja: '新しい通知を作成',
    ko: '새 알림 만들기',
  },
  
  // Actions
  'action.markRead': {
    vi: 'Đánh dấu đã đọc',
    en: 'Mark as Read',
    zh: '标记为已读',
    ja: '既読にする',
    ko: '읽음으로 표시',
  },
  'action.markUnread': {
    vi: 'Đánh dấu chưa đọc',
    en: 'Mark as Unread',
    zh: '标记为未读',
    ja: '未読にする',
    ko: '안 읽음으로 표시',
  },
  'action.delete': {
    vi: 'Xóa',
    en: 'Delete',
    zh: '删除',
    ja: '削除',
    ko: '삭제',
  },
  'action.cancel': {
    vi: 'Hủy',
    en: 'Cancel',
    zh: '取消',
    ja: 'キャンセル',
    ko: '취소',
  },
  'action.save': {
    vi: 'Lưu',
    en: 'Save',
    zh: '保存',
    ja: '保存',
    ko: '저장',
  },
  'action.retry': {
    vi: 'Thử lại',
    en: 'Retry',
    zh: '重试',
    ja: 'やり直し',
    ko: '다시 시도',
  },
  
  // Status messages
  'status.loading': {
    vi: 'Đang tải...',
    en: 'Loading...',
    zh: '加载中...',
    ja: '読み込み中...',
    ko: '로딩 중...',
  },
  'status.empty': {
    vi: 'Không có thông báo',
    en: 'No notifications',
    zh: '没有通知',
    ja: '通知はありません',
    ko: '알림이 없습니다',
  },
  'status.error': {
    vi: 'Đã xảy ra lỗi',
    en: 'An error occurred',
    zh: '发生错误',
    ja: 'エラーが発生しました',
    ko: '오류가 발생했습니다',
  },
  'status.success': {
    vi: 'Thành công',
    en: 'Success',
    zh: '成功',
    ja: '成功',
    ko: '성공',
  },
  
  // Time expressions
  'time.justNow': {
    vi: 'Vừa xong',
    en: 'Just now',
    zh: '刚刚',
    ja: 'たった今',
    ko: '방금',
  },
  'time.minutesAgo': {
    vi: '{minutes} phút trước',
    en: '{minutes} minutes ago',
    zh: '{minutes}分钟前',
    ja: '{minutes}分前',
    ko: '{minutes}분 전',
  },
  'time.hoursAgo': {
    vi: '{hours} giờ trước',
    en: '{hours} hours ago',
    zh: '{hours}小时前',
    ja: '{hours}時間前',
    ko: '{hours}시간 전',
  },
  'time.daysAgo': {
    vi: '{days} ngày trước',
    en: '{days} days ago',
    zh: '{days}天前',
    ja: '{days}日前',
    ko: '{days}일 전',
  },
  
  // Priority levels
  'priority.low': {
    vi: 'Thấp',
    en: 'Low',
    zh: '低',
    ja: '低',
    ko: '낮음',
  },
  'priority.normal': {
    vi: 'Bình thường',
    en: 'Normal',
    zh: '正常',
    ja: '通常',
    ko: '보통',
  },
  'priority.high': {
    vi: 'Cao',
    en: 'High',
    zh: '高',
    ja: '高',
    ko: '높음',
  },
  'priority.urgent': {
    vi: 'Khẩn cấp',
    en: 'Urgent',
    zh: '紧急',
    ja: '緊急',
    ko: '긴급',
  },
  
  // Template names
  'template.projectUpdate': {
    vi: 'Cập nhật dự án',
    en: 'Project Update',
    zh: '项目更新',
    ja: 'プロジェクト更新',
    ko: '프로젝트 업데이트',
  },
  'template.newMessage': {
    vi: 'Tin nhắn mới',
    en: 'New Message',
    zh: '新消息',
    ja: '新しいメッセージ',
    ko: '새 메시지',
  },
  'template.deadlineReminder': {
    vi: 'Nhắc nhở deadline',
    en: 'Deadline Reminder',
    zh: '截止日期提醒',
    ja: '締切リマインダー',
    ko: '마감일 알림',
  },
  'template.paymentSuccess': {
    vi: 'Thanh toán thành công',
    en: 'Payment Success',
    zh: '付款成功',
    ja: '支払い成功',
    ko: '결제 성공',
  },
};

// Get device language or default to Vietnamese
export function getDeviceLanguage(): SupportedLanguage {
  // This would integrate with i18n library in a real app
  // For now, return Vietnamese as default
  return 'vi';
}

// Translate a key with optional parameters
export function t(
  key: string, 
  params?: Record<string, string | number>,
  language?: SupportedLanguage
): string {
  const lang = language || getDeviceLanguage();
  
  const entry = NOTIFICATION_MESSAGES[key];
  if (!entry) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  let translation = entry[lang] || entry.vi || entry.en || key;
  
  // Replace parameters
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      translation = translation.replace(`{${paramKey}}`, String(value));
    });
  }
  
  return translation;
}

// Translate notification type
export function translateType(type: string, language?: SupportedLanguage): string {
  const lang = language || getDeviceLanguage();
  const entry = NOTIFICATION_TYPES[type];
  
  if (!entry) {
    return type;
  }
  
  return entry[lang] || entry.vi || entry.en || type;
}

// Format relative time with i18n
export function formatRelativeTime(
  timestamp: number,
  language?: SupportedLanguage
): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return t('time.justNow', {}, language);
  } else if (minutes < 60) {
    return t('time.minutesAgo', { minutes }, language);
  } else if (hours < 24) {
    return t('time.hoursAgo', { hours }, language);
  } else {
    return t('time.daysAgo', { days }, language);
  }
}

// Localized notification templates
export const LOCALIZED_TEMPLATES: Record<string, Partial<Record<SupportedLanguage, any>>> = {
  'project-update': {
    vi: {
      title: 'Dự án [PROJECT_NAME] đã cập nhật',
      body: 'Tiến độ: [PROGRESS]% hoàn thành',
    },
    en: {
      title: 'Project [PROJECT_NAME] updated',
      body: 'Progress: [PROGRESS]% completed',
    },
    zh: {
      title: '项目 [PROJECT_NAME] 已更新',
      body: '进度：[PROGRESS]% 完成',
    },
  },
  'new-message': {
    vi: {
      title: 'Tin nhắn từ [SENDER_NAME]',
      body: '[MESSAGE_PREVIEW]',
    },
    en: {
      title: 'Message from [SENDER_NAME]',
      body: '[MESSAGE_PREVIEW]',
    },
    zh: {
      title: '来自 [SENDER_NAME] 的消息',
      body: '[MESSAGE_PREVIEW]',
    },
  },
  'deadline-reminder': {
    vi: {
      title: 'Deadline sắp tới',
      body: '[TASK_NAME] cần hoàn thành trong [TIME_LEFT]',
    },
    en: {
      title: 'Upcoming Deadline',
      body: '[TASK_NAME] needs to be completed in [TIME_LEFT]',
    },
    zh: {
      title: '即将到来的截止日期',
      body: '[TASK_NAME] 需要在 [TIME_LEFT] 内完成',
    },
  },
};

// Get localized template
export function getLocalizedTemplate(
  templateId: string,
  language?: SupportedLanguage
): any {
  const lang = language || getDeviceLanguage();
  const templates = LOCALIZED_TEMPLATES[templateId];
  
  if (!templates) {
    return null;
  }
  
  return templates[lang] || templates.vi || templates.en;
}

// Language preferences storage
import { getItem, setItem } from '@/utils/storage';

const LANGUAGE_KEY = 'app_language';

export async function getStoredLanguage(): Promise<SupportedLanguage> {
  try {
    const stored = await getItem(LANGUAGE_KEY);
    return (stored as SupportedLanguage) || getDeviceLanguage();
  } catch {
    return getDeviceLanguage();
  }
}

export async function setStoredLanguage(language: SupportedLanguage): Promise<void> {
  try {
    await setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Failed to store language preference:', error);
  }
}

// Language selector component data
export const SUPPORTED_LANGUAGES: Array<{
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}> = [
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
  },
];
