/**
 * Component hiển thị banner khi feature đang offline/coming soon
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import { useFeature } from '../../hooks/useFeatureAvailability';

interface FeatureStatusBannerProps {
  featureKey: string;
  showWhenAvailable?: boolean;
  onDismiss?: () => void;
  style?: object;
}

export function FeatureStatusBanner({
  featureKey,
  showWhenAvailable = false,
  onDismiss,
  style,
}: FeatureStatusBannerProps) {
  const { status, message, isAvailable, isDegraded, isComingSoon, hasMockData } = useFeature(featureKey);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
  // Không hiển thị nếu feature available và showWhenAvailable = false
  if (isAvailable && !showWhenAvailable) {
    return null;
  }
  
  // Chọn màu và icon dựa trên status
  const getStatusStyle = () => {
    switch (status) {
      case 'available':
        return {
          bgColor: '#E8F5E9',
          borderColor: '#4CAF50',
          iconName: 'checkmark-circle' as const,
          iconColor: '#4CAF50',
        };
      case 'degraded':
        return {
          bgColor: '#FFF3E0',
          borderColor: '#FF9800',
          iconName: 'warning' as const,
          iconColor: '#FF9800',
        };
      case 'coming_soon':
        return {
          bgColor: '#E3F2FD',
          borderColor: '#2196F3',
          iconName: 'time' as const,
          iconColor: '#2196F3',
        };
      default:
        return {
          bgColor: '#FFEBEE',
          borderColor: '#F44336',
          iconName: 'close-circle' as const,
          iconColor: '#F44336',
        };
    }
  };
  
  const statusStyle = getStatusStyle();
  
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: statusStyle.bgColor,
          borderColor: statusStyle.borderColor,
        },
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={statusStyle.iconName} size={24} color={statusStyle.iconColor} />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={[styles.message, { color: textColor }]}>{message}</Text>
        {hasMockData && isComingSoon && (
          <Text style={styles.subMessage}>Đang hiển thị dữ liệu mẫu</Text>
        )}
      </View>
      
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );
}

interface OfflineIndicatorProps {
  isConnected: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onPress?: () => void;
}

export function OfflineIndicator({
  isConnected,
  pendingCount,
  isSyncing,
  onPress,
}: OfflineIndicatorProps) {
  if (isConnected && pendingCount === 0) {
    return null;
  }
  
  return (
    <TouchableOpacity
      style={[
        styles.offlineIndicator,
        { backgroundColor: isConnected ? '#4CAF50' : '#F44336' },
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={isSyncing ? 'sync' : isConnected ? 'cloud-upload' : 'cloud-offline'}
        size={16}
        color="#FFF"
      />
      <Text style={styles.offlineText}>
        {isSyncing
          ? 'Đang đồng bộ...'
          : isConnected
          ? `${pendingCount} file chờ upload`
          : 'Đang offline'}
      </Text>
    </TouchableOpacity>
  );
}

interface ComingSoonOverlayProps {
  featureKey: string;
  children: React.ReactNode;
}

export function ComingSoonOverlay({ featureKey, children }: ComingSoonOverlayProps) {
  const { isComingSoon, message } = useFeature(featureKey);
  
  if (!isComingSoon) {
    return <>{children}</>;
  }
  
  return (
    <View style={styles.overlayContainer}>
      {children}
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          <Ionicons name="construct" size={48} color="#2196F3" />
          <Text style={styles.overlayTitle}>Sắp ra mắt</Text>
          <Text style={styles.overlayMessage}>{message}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
  },
  subMessage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dismissButton: {
    padding: 4,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  offlineText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  overlayContainer: {
    position: 'relative',
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    alignItems: 'center',
    padding: 24,
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 16,
    marginBottom: 8,
  },
  overlayMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    maxWidth: 280,
  },
});

export default {
  FeatureStatusBanner,
  OfflineIndicator,
  ComingSoonOverlay,
};
