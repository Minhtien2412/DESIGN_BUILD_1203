import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface ApiErrorDisplayProps {
  error: Error | unknown;
  endpoint?: string;
  onRetry?: () => void;
  onBack?: () => void;
  showDetails?: boolean;
}

/**
 * API Error Display Component
 * 
 * Shows user-friendly error messages for API failures
 * with retry and navigation options
 * 
 * Usage:
 * ```tsx
 * try {
 *   const data = await apiService.getData();
 * } catch (error) {
 *   return <ApiErrorDisplay error={error} onRetry={loadData} />;
 * }
 * ```
 */
export function ApiErrorDisplay({
  error,
  endpoint,
  onRetry,
  onBack,
  showDetails = __DEV__,
}: ApiErrorDisplayProps) {
  const colors = {
    background: useThemeColor({}, 'background'),
    text: useThemeColor({}, 'text'),
    textMuted: useThemeColor({}, 'textMuted'),
    primary: useThemeColor({}, 'primary'),
    error: useThemeColor({}, 'error'),
    border: useThemeColor({}, 'border'),
  };

  // Parse error
  const getErrorInfo = () => {
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('404')) {
        return {
          icon: 'construct-outline' as const,
          title: 'Tính năng đang phát triển',
          message: 'Tính năng này chưa sẵn sàng. Vui lòng quay lại sau.',
          color: colors.primary,
          canRetry: false,
        };
      }
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return {
          icon: 'lock-closed-outline' as const,
          title: 'Phiên đăng nhập hết hạn',
          message: 'Vui lòng đăng nhập lại để tiếp tục.',
          color: '#F59E0B',
          canRetry: false,
        };
      }
      
      if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        return {
          icon: 'cloud-offline-outline' as const,
          title: 'Lỗi kết nối',
          message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
          color: colors.error,
          canRetry: true,
        };
      }
      
      if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        return {
          icon: 'bug-outline' as const,
          title: 'Lỗi hệ thống',
          message: 'Đã xảy ra lỗi trên máy chủ. Chúng tôi đang xử lý vấn đề.',
          color: colors.error,
          canRetry: true,
        };
      }
      
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        return {
          icon: 'alert-circle-outline' as const,
          title: 'Dữ liệu không hợp lệ',
          message: 'Thông tin bạn cung cấp không đúng định dạng. Vui lòng kiểm tra lại.',
          color: '#F59E0B',
          canRetry: false,
        };
      }
      
      // Generic error
      return {
        icon: 'warning-outline' as const,
        title: 'Đã xảy ra lỗi',
        message: error.message || 'Không thể hoàn thành yêu cầu. Vui lòng thử lại.',
        color: colors.error,
        canRetry: true,
      };
    }
    
    // Unknown error
    return {
      icon: 'warning-outline' as const,
      title: 'Đã xảy ra lỗi',
      message: 'Không thể hoàn thành yêu cầu. Vui lòng thử lại.',
      color: colors.error,
      canRetry: true,
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { borderColor: errorInfo.color + '30' }]}>
        <Ionicons name={errorInfo.icon} size={64} color={errorInfo.color} />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>
        {errorInfo.title}
      </Text>

      {/* Message */}
      <Text style={[styles.message, { color: colors.textMuted }]}>
        {errorInfo.message}
      </Text>

      {/* Endpoint Info */}
      {endpoint && showDetails && (
        <View style={[styles.detailsBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.detailsLabel, { color: colors.textMuted }]}>
            Endpoint:
          </Text>
          <Text style={[styles.detailsValue, { color: colors.text }]}>
            {endpoint}
          </Text>
        </View>
      )}

      {/* Error Details (Dev Only) */}
      {showDetails && error instanceof Error && (
        <View style={[styles.detailsBox, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
          <Text style={[styles.detailsLabel, { color: '#DC2626' }]}>
            Chi tiết lỗi (Dev mode):
          </Text>
          <Text style={[styles.detailsValue, { color: '#EF4444' }]}>
            {error.message}
          </Text>
          {error.stack && (
            <Text style={[styles.stackTrace, { color: '#9CA3AF' }]} numberOfLines={5}>
              {error.stack}
            </Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {errorInfo.canRetry && onRetry && (
          <TouchableOpacity
            style={[styles.button, styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={onRetry}
            activeOpacity={0.7}
          >
            <Ionicons name="reload" size={20} color="#fff" />
            <Text style={styles.buttonText}>Thử lại</Text>
          </TouchableOpacity>
        )}

        {onBack && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.backButton,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
            <Text style={[styles.buttonText, { color: colors.text }]}>
              Quay lại
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Help Text */}
      <Text style={[styles.helpText, { color: colors.textMuted }]}>
        Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ bộ phận hỗ trợ.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  stackTrace: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  retryButton: {},
  backButton: {
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
