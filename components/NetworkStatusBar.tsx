/**
 * Network Status Bar Component
 * Shows offline/syncing status at the top of the screen
 */

import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface NetworkStatusBarProps {
  showWhenOnline?: boolean;
}

export function NetworkStatusBar({ showWhenOnline = false }: NetworkStatusBarProps) {
  const { isOnline, isSyncing, pendingCount } = useOfflineSync();
  const [visible, setVisible] = useState(false);
  const translateY = React.useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    const shouldShow = !isOnline || isSyncing || (showWhenOnline && pendingCount > 0);
    
    if (shouldShow && !visible) {
      setVisible(true);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
    } else if (!shouldShow && visible) {
      Animated.timing(translateY, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [isOnline, isSyncing, pendingCount, visible, showWhenOnline, translateY]);

  if (!visible) return null;

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        backgroundColor: '#FF6B6B',
        icon: 'cloud-offline-outline' as const,
        text: 'Không có kết nối mạng',
      };
    }
    if (isSyncing) {
      return {
        backgroundColor: '#4ECDC4',
        icon: 'sync-outline' as const,
        text: `Đang đồng bộ ${pendingCount} mục...`,
      };
    }
    if (pendingCount > 0) {
      return {
        backgroundColor: '#FFE66D',
        icon: 'time-outline' as const,
        text: `${pendingCount} mục đang chờ đồng bộ`,
      };
    }
    return {
      backgroundColor: '#00B14F',
      icon: 'checkmark-circle-outline' as const,
      text: 'Đã đồng bộ',
    };
  };

  const config = getStatusConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor, transform: [{ translateY }] },
      ]}
    >
      <Ionicons name={config.icon} size={16} color="#fff" style={styles.icon} />
      <Text style={styles.text}>{config.text}</Text>
    </Animated.View>
  );
}

/**
 * Compact Offline Indicator for Headers
 */
export function OfflineIndicator() {
  const { isOnline, pendingCount } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <View style={[
      styles.indicator,
      { backgroundColor: isOnline ? '#FFE66D' : '#FF6B6B' },
    ]}>
      <Ionicons
        name={isOnline ? 'sync-outline' : 'cloud-offline-outline'}
        size={12}
        color="#fff"
      />
      {pendingCount > 0 && (
        <Text style={styles.indicatorText}>{pendingCount}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 44, // Safe area
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  indicatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NetworkStatusBar;
