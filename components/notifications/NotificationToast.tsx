/**
 * Zalo-style Toast Notification Component
 * Hiển thị thông báo popup khi có tin nhắn mới/cuộc gọi
 * 
 * @author AI Assistant
 * @date 03/01/2026
 */

import { useUnifiedBadge } from '@/context/UnifiedBadgeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const COLORS = {
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  primary: '#0068FF',
  success: '#0D9488',
  warning: '#0D9488',
  error: '#000000',
  shadow: 'rgba(0, 0, 0, 0.15)',
};

interface ToastNotification {
  id: string;
  type: 'message' | 'call' | 'system';
  title: string;
  body: string;
  avatar?: string;
  route?: string;
}

export function NotificationToast() {
  const { messageNotifications, callNotifications } = useUnifiedBadge();
  const [currentToast, setCurrentToast] = useState<ToastNotification | null>(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const toastQueue = useRef<ToastNotification[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show toast animation
  const showToast = useCallback((toast: ToastNotification) => {
    setCurrentToast(toast);
    
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after 4 seconds
    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, 4000);
  }, [translateY, opacity]);

  // Hide toast animation
  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: -100,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentToast(null);
      // Process next toast in queue
      if (toastQueue.current.length > 0) {
        const nextToast = toastQueue.current.shift();
        if (nextToast) {
          setTimeout(() => showToast(nextToast), 300);
        }
      }
    });
  }, [translateY, opacity, showToast]);

  // Handle toast press
  const handleToastPress = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (currentToast?.route) {
      hideToast();
      router.push(currentToast.route as any);
    }
  }, [currentToast, hideToast]);

  // Watch for new message notifications
  useEffect(() => {
    const unreadMessages = messageNotifications.filter(n => !n.isRead);
    if (unreadMessages.length > 0) {
      const latestMessage = unreadMessages[0];
      const newToast: ToastNotification = {
        id: latestMessage.id,
        type: 'message',
        title: latestMessage.senderName,
        body: latestMessage.type === 'image' ? '📷 Hình ảnh' 
          : latestMessage.type === 'voice' ? '🎤 Tin nhắn thoại'
          : latestMessage.type === 'file' ? '📎 Tệp đính kèm'
          : latestMessage.content,
        avatar: latestMessage.senderAvatar,
        route: `/messages/chat/${latestMessage.conversationId}`,
      };

      if (!currentToast) {
        showToast(newToast);
      } else if (currentToast.id !== newToast.id) {
        toastQueue.current.push(newToast);
      }
    }
  }, [messageNotifications, currentToast, showToast]);

  // Watch for new call notifications
  useEffect(() => {
    const missedCalls = callNotifications.filter(n => !n.isRead && n.status === 'missed');
    if (missedCalls.length > 0) {
      const latestCall = missedCalls[0];
      const newToast: ToastNotification = {
        id: latestCall.id,
        type: 'call',
        title: latestCall.callerName,
        body: latestCall.type === 'video' ? '📹 Cuộc gọi video nhỡ' : '📞 Cuộc gọi nhỡ',
        avatar: latestCall.callerAvatar,
        route: '/call/history',
      };

      if (!currentToast) {
        showToast(newToast);
      } else if (currentToast.id !== newToast.id) {
        toastQueue.current.push(newToast);
      }
    }
  }, [callNotifications, currentToast, showToast]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!currentToast) return null;

  const getIcon = () => {
    switch (currentToast.type) {
      case 'message':
        return <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.primary} />;
      case 'call':
        return <Ionicons name="call" size={24} color={COLORS.error} />;
      default:
        return <Ionicons name="notifications" size={24} color={COLORS.warning} />;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Pressable style={styles.toast} onPress={handleToastPress}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {currentToast.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {currentToast.body}
          </Text>
        </View>
        <Pressable style={styles.closeButton} onPress={hideToast}>
          <Ionicons name="close" size={18} color={COLORS.textSecondary} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 10,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  body: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  closeButton: {
    padding: 8,
  },
});

export default NotificationToast;
