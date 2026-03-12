/**
 * OfflineIndicator Component
 * Shows a banner when the device is offline
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Platform, StyleSheet, Text } from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export function OfflineIndicator() {
  const { isOffline } = useNetworkStatus();
  const backgroundColor = useThemeColor({}, 'error');
  const textColor = '#FFFFFF';
  
  const [slideAnim] = React.useState(new Animated.Value(-50));

  React.useEffect(() => {
    if (isOffline) {
      // Slide down
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    } else {
      // Slide up
      Animated.spring(slideAnim, {
        toValue: -50,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    }
  }, [isOffline, slideAnim]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons name="cloud-offline-outline" size={18} color={textColor} />
      <Text style={[styles.text, { color: textColor }]}>
        No Internet Connection
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 0, // Account for status bar on iOS
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 9999,
    ...Platform.select({
      web: {
        position: 'fixed' as any,
      },
    }),
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
