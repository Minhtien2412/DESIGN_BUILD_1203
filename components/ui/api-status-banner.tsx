import { useApiConnectionStatus } from '@/hooks/useApiConnectionStatus';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ApiStatusBannerProps {
  showDetails?: boolean;
  style?: any;
}

export const ApiStatusBanner: React.FC<ApiStatusBannerProps> = ({ 
  showDetails = true, 
  style 
}) => {
  const { status, retry } = useApiConnectionStatus();

  const getStatusColor = () => {
    if (status.isChecking) return '#f39c12';
    if (status.isConnected) return '#27ae60';
    return '#e74c3c';
  };

  const getStatusIcon = () => {
    if (status.isChecking) return '🔄';
    if (status.isConnected) return '🟢';
    return '🔴';
  };

  const getStatusText = () => {
    if (status.isChecking) return 'Đang kiểm tra kết nối...';
    if (status.isConnected) return 'API Online';
    return 'API Offline (Dữ liệu mẫu)';
  };

  const getDetailText = () => {
    if (status.isConnected) {
      return 'Kết nối với máy chủ thành công';
    }
    if (status.fallbackActive) {
      return 'Automatic fallback đang hoạt động - Dữ liệu mẫu có sẵn';
    }
    return 'Đang sử dụng dữ liệu offline';
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() + '20' }, style]}>
      <View style={styles.statusRow}>
        <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        <View style={styles.statusTextContainer}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          {showDetails && (
            <Text style={styles.detailText}>
              {getDetailText()}
            </Text>
          )}
        </View>
        {!status.isConnected && !status.isChecking && (
          <TouchableOpacity 
            style={[styles.retryButton, { borderColor: getStatusColor() }]}
            onPress={retry}
          >
            <Text style={[styles.retryText, { color: getStatusColor() }]}>
              🔄 Thử lại
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {status.lastChecked && showDetails && (
        <Text style={styles.timestampText}>
          Kiểm tra lần cuối: {status.lastChecked.toLocaleTimeString('vi-VN')}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    marginVertical: 8
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8
  },
  statusTextContainer: {
    flex: 1
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600'
  },
  detailText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1
  },
  retryText: {
    fontSize: 12,
    fontWeight: '500'
  },
  timestampText: {
    fontSize: 10,
    color: '#95a5a6',
    marginTop: 6,
    textAlign: 'center'
  }
});

export default ApiStatusBanner;
