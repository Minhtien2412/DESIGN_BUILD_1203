/**
 * ToastNotification Component
 * Thông báo toast im lặng (thay thế Alert)
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text } from 'react-native';

export interface ToastNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
  onHide?: () => void;
  onDismiss?: () => void; // Alias for onHide for backward compatibility
  duration?: number;
}

export function ToastNotification({
  message,
  type = 'info',
  visible,
  onHide,
  onDismiss,
  duration = 3000,
}: ToastNotificationProps) {
  // Use onDismiss as fallback for onHide
  const handleHide = onHide || onDismiss;
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          handleHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  if (!visible) return null;

  const config = {
    success: {
      icon: 'checkmark-circle' as const,
      color: '#0D9488',
      bgColor: '#D1FAE5',
    },
    error: {
      icon: 'close-circle' as const,
      color: '#000000',
      bgColor: '#FEE2E2',
    },
    warning: {
      icon: 'warning' as const,
      color: '#0D9488',
      bgColor: '#FEF3C7',
    },
    info: {
      icon: 'information-circle' as const,
      color: '#0D9488',
      bgColor: '#F0FDFA',
    },
  };

  const currentConfig = config[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: currentConfig.bgColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Ionicons name={currentConfig.icon} size={22} color={currentConfig.color} />
      <Text style={[styles.message, { color: currentConfig.color }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    zIndex: 9999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  message: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
});
