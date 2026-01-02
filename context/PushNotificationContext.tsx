import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

// Only import expo-notifications if not in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';
let Notifications: any = null;

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      } as any),
    });
  } catch (e) {
    console.warn('[PushNotifications] expo-notifications not available:', e);
  }
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  type: 'order' | 'promotion' | 'system' | 'chat';
  timestamp: number;
  read: boolean;
}

interface PushNotificationContextType {
  notifications: PushNotification[];
  unreadCount: number;
  expoPushToken: string | null;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

const NOTIFICATIONS_KEY = 'push_notifications';

export function PushNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  // Load notifications from storage
  useEffect(() => {
    loadNotifications();
  }, []);

  // Save notifications to storage
  useEffect(() => {
    saveNotifications();
  }, [notifications]);

  // Register for push notifications
  useEffect(() => {
    if (!Notifications) {
      console.log('[PushNotifications] Skipping registration (Expo Go detected)');
      return;
    }

    registerForPushNotifications();

    // Listen for incoming notifications
    const notificationListener = Notifications.addNotificationReceivedListener((notification: any) => {
      const newNotification: PushNotification = {
        id: notification.request.identifier,
        title: notification.request.content.title || 'Thông báo mới',
        body: notification.request.content.body || '',
        data: notification.request.content.data,
        type: (notification.request.content.data?.type as any) || 'system',
        timestamp: Date.now(),
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
    });

    // Listen for notification taps
    const responseListener = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const notificationId = response.notification.request.identifier;
      markAsRead(notificationId);
      
      // Handle notification action based on type
      const data = response.notification.request.content.data;
      if (data?.screen) {
        // Navigate to screen (you can integrate with router here)
        console.log('Navigate to:', data.screen);
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const saveNotifications = async () => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };

  const registerForPushNotifications = async () => {
    if (!Notifications) return;

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B35',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Quyền thông báo',
          'Vui lòng bật thông báo để nhận cập nhật đơn hàng và khuyến mãi'
        );
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
      console.log('Expo Push Token:', token);
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    if (!Notifications) {
      console.log('[PushNotifications] Cannot send notification (Expo Go)');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: PushNotificationContextType = {
    notifications,
    unreadCount,
    expoPushToken,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    sendLocalNotification,
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
}

export function usePushNotifications() {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error('usePushNotifications must be used within a PushNotificationProvider');
  }
  return context;
}
