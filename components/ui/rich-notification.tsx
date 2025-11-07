import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export interface NotificationTemplate {
  id: string;
  name: string;
  category: 'marketing' | 'system' | 'social' | 'commerce' | 'reminder';
  
  // Template structure
  layout: 'basic' | 'image' | 'action' | 'progress' | 'social';
  
  // Content fields
  title: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  iconName?: string;
  
  // Actions
  primaryAction?: {
    label: string;
    route?: string;
    action?: 'open' | 'call' | 'message' | 'share';
  };
  secondaryAction?: {
    label: string;
    route?: string;
    action?: 'dismiss' | 'later' | 'settings';
  };
  
  // Styling
  colorScheme?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  
  // Rich content
  attachments?: {
    type: 'image' | 'video' | 'document' | 'link';
    url: string;
    title?: string;
    preview?: string;
  }[];
  
  // Progress indicator
  progress?: {
    current: number;
    total: number;
    unit?: string;
    showPercentage?: boolean;
  };
  
  // Social features
  author?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  
  // Interactive elements
  rating?: {
    current: number;
    max: number;
    allowChange?: boolean;
  };
  
  createdAt: number;
  updatedAt: number;
}

// Pre-built templates
export const NOTIFICATION_TEMPLATES: Record<string, Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>> = {
  'project-update': {
    name: 'Cập nhật dự án',
    category: 'system',
    layout: 'progress',
    title: 'Dự án [PROJECT_NAME] đã cập nhật',
    body: 'Tiến độ: [PROGRESS]% hoàn thành',
    iconName: 'briefcase',
    colorScheme: 'blue',
    priority: 'normal',
    progress: {
      current: 0,
      total: 100,
      unit: '%',
      showPercentage: true,
    },
    primaryAction: {
      label: 'Xem chi tiết',
      route: '/projects/[id]',
      action: 'open',
    },
  },
  
  'new-message': {
    name: 'Tin nhắn mới',
    category: 'social',
    layout: 'social',
    title: 'Tin nhắn từ [SENDER_NAME]',
    body: '[MESSAGE_PREVIEW]',
    iconName: 'chatbubble',
    colorScheme: 'green',
    priority: 'high',
    author: {
      name: '',
      avatar: '',
      role: 'Client',
    },
    primaryAction: {
      label: 'Trả lời',
      route: '/chat/[userId]',
      action: 'open',
    },
    secondaryAction: {
      label: 'Sau',
      action: 'later',
    },
  },
  
  'deadline-reminder': {
    name: 'Nhắc nhở deadline',
    category: 'reminder',
    layout: 'action',
    title: 'Deadline sắp tới',
    body: '[TASK_NAME] cần hoàn thành trong [TIME_LEFT]',
    iconName: 'warning',
    colorScheme: 'orange',
    priority: 'urgent',
    primaryAction: {
      label: 'Xem task',
      action: 'open',
    },
    secondaryAction: {
      label: 'Nhắc lại sau',
      action: 'later',
    },
  },
  
  'payment-success': {
    name: 'Thanh toán thành công',
    category: 'commerce',
    layout: 'image',
    title: 'Thanh toán thành công',
    subtitle: 'Cảm ơn bạn đã thanh toán',
    body: 'Số tiền: [AMOUNT] VND\nMã giao dịch: [TRANSACTION_ID]',
    iconName: 'checkmark-circle',
    colorScheme: 'green',
    priority: 'high',
    imageUrl: 'https://via.placeholder.com/300x150/4CAF50/white?text=✓+Paid',
    primaryAction: {
      label: 'Xem hóa đơn',
      action: 'open',
    },
  },
  
  'system-maintenance': {
    name: 'Bảo trì hệ thống',
    category: 'system',
    layout: 'basic',
    title: 'Thông báo bảo trì',
    body: 'Hệ thống sẽ bảo trì từ [START_TIME] đến [END_TIME]',
    iconName: 'build',
    colorScheme: 'purple',
    priority: 'normal',
    primaryAction: {
      label: 'Chi tiết',
      action: 'open',
    },
  },
  
  'rating-request': {
    name: 'Yêu cầu đánh giá',
    category: 'marketing',
    layout: 'action',
    title: 'Đánh giá trải nghiệm',
    body: 'Hãy cho chúng tôi biết cảm nhận của bạn về dịch vụ',
    iconName: 'star',
    colorScheme: 'orange',
    priority: 'low',
    rating: {
      current: 0,
      max: 5,
      allowChange: true,
    },
    primaryAction: {
      label: 'Đánh giá ngay',
      action: 'open',
    },
    secondaryAction: {
      label: 'Bỏ qua',
      action: 'dismiss',
    },
  },
};

// Render rich notification content
interface RichNotificationProps {
  template: NotificationTemplate;
  data?: Record<string, any>;
  onAction?: (action: 'primary' | 'secondary', route?: string) => void;
  compact?: boolean;
}

export function RichNotification({ 
  template, 
  data = {}, 
  onAction, 
  compact = false 
}: RichNotificationProps) {
  const getColorScheme = (scheme?: string) => {
    switch (scheme) {
      case 'blue': return { primary: '#007AFF', bg: '#E8F2FF' };
      case 'green': return { primary: '#34C759', bg: '#E8F8EA' };
      case 'orange': return { primary: '#FF9500', bg: '#FFF4E8' };
      case 'red': return { primary: '#FF3B30', bg: '#FFE8E8' };
      case 'purple': return { primary: '#AF52DE', bg: '#F3E8FF' };
      default: return { primary: '#8E8E93', bg: '#F8F8F8' };
    }
  };

  const colors = getColorScheme(template.colorScheme);
  const interpolateText = (text: string) => {
    let result = text;
    Object.entries(data).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\[${key.toUpperCase()}\\]`, 'g'), String(value));
    });
    return result;
  };

  const renderLayout = () => {
    switch (template.layout) {
      case 'image':
        return (
          <View style={[styles.container, { backgroundColor: colors.bg }]}>
            {template.imageUrl && (
              <Image source={{ uri: template.imageUrl }} style={styles.headerImage} />
            )}
            <View style={styles.content}>
              <Text style={[styles.title, { color: colors.primary }]}>
                {interpolateText(template.title)}
              </Text>
              {template.subtitle && (
                <Text style={styles.subtitle}>{interpolateText(template.subtitle)}</Text>
              )}
              {template.body && (
                <Text style={styles.body}>{interpolateText(template.body)}</Text>
              )}
            </View>
            {renderActions()}
          </View>
        );

      case 'progress':
        return (
          <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={styles.header}>
              {template.iconName && (
                <Ionicons 
                  name={template.iconName as any} 
                  size={24} 
                  color={colors.primary} 
                />
              )}
              <Text style={[styles.title, { color: colors.primary }]}>
                {interpolateText(template.title)}
              </Text>
            </View>
            
            {template.progress && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        backgroundColor: colors.primary,
                        width: `${(template.progress.current / template.progress.total) * 100}%`
                      }
                    ]} 
                  />
                </View>
                {template.progress.showPercentage && (
                  <Text style={styles.progressText}>
                    {Math.round((template.progress.current / template.progress.total) * 100)}%
                  </Text>
                )}
              </View>
            )}
            
            {template.body && (
              <Text style={styles.body}>{interpolateText(template.body)}</Text>
            )}
            {renderActions()}
          </View>
        );

      case 'social':
        return (
          <View style={[styles.container, { backgroundColor: colors.bg }]}>
            {template.author && (
              <View style={styles.authorHeader}>
                {template.author.avatar ? (
                  <Image source={{ uri: template.author.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>
                      {template.author.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{template.author.name}</Text>
                  {template.author.role && (
                    <Text style={styles.authorRole}>{template.author.role}</Text>
                  )}
                </View>
              </View>
            )}
            
            <Text style={[styles.title, { color: colors.primary }]}>
              {interpolateText(template.title)}
            </Text>
            {template.body && (
              <Text style={styles.body}>{interpolateText(template.body)}</Text>
            )}
            {renderActions()}
          </View>
        );

      case 'action':
      default:
        return (
          <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={styles.header}>
              {template.iconName && (
                <Ionicons 
                  name={template.iconName as any} 
                  size={24} 
                  color={colors.primary} 
                />
              )}
              <View style={styles.titleContainer}>
                <Text style={[styles.title, { color: colors.primary }]}>
                  {interpolateText(template.title)}
                </Text>
                {template.subtitle && (
                  <Text style={styles.subtitle}>{interpolateText(template.subtitle)}</Text>
                )}
              </View>
            </View>
            
            {template.body && (
              <Text style={styles.body}>{interpolateText(template.body)}</Text>
            )}
            
            {template.rating && (
              <View style={styles.rating}>
                {Array.from({ length: template.rating.max }, (_, i) => (
                  <Ionicons
                    key={i}
                    name={i < (template.rating?.current || 0) ? 'star' : 'star-outline'}
                    size={20}
                    color={i < (template.rating?.current || 0) ? colors.primary : '#ddd'}
                  />
                ))}
              </View>
            )}
            
            {renderActions()}
          </View>
        );
    }
  };

  const renderActions = () => {
    if (!template.primaryAction && !template.secondaryAction) return null;
    
    return (
      <View style={styles.actions}>
        {template.secondaryAction && (
          <Pressable
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => onAction?.('secondary', template.secondaryAction?.route)}
          >
            <Text style={styles.secondaryButtonText}>
              {template.secondaryAction.label}
            </Text>
          </Pressable>
        )}
        {template.primaryAction && (
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => onAction?.('primary', template.primaryAction?.route)}
          >
            <Text style={styles.primaryButtonText}>
              {template.primaryAction.label}
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  return renderLayout();
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  authorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  authorRole: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5E7',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  rating: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
});

// Helper to create notification from template
export function createNotificationFromTemplate(
  templateId: string,
  data: Record<string, any> = {}
): Partial<any> {
  const template = NOTIFICATION_TEMPLATES[templateId];
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  return {
    title: template.title.replace(/\[([^\]]+)\]/g, (match, key) => 
      String(data[key.toLowerCase()] || match)
    ),
    body: template.body?.replace(/\[([^\]]+)\]/g, (match, key) => 
      String(data[key.toLowerCase()] || match)
    ),
    type: template.category,
    route: template.primaryAction?.route?.replace(/\[([^\]]+)\]/g, (match, key) => 
      String(data[key.toLowerCase()] || match)
    ),
    meta: {
      templateId,
      template,
      data,
    },
  };
}
