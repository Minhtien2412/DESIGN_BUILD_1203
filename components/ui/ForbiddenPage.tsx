import { useThemeColor } from '@/hooks/use-theme-color';
import { Permission, Role } from '@/types/auth';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ForbiddenPageProps {
  permission?: Permission;
  role?: Role;
  onRetry?: () => void;
}

/**
 * 403 Forbidden page component
 * Shows when user lacks required permissions or roles
 */
export function ForbiddenPage({ permission, role, onRetry }: ForbiddenPageProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const getMessage = () => {
    if (permission) {
      return `Bạn không có quyền truy cập chức năng này. (${permission})`;
    }
    if (role) {
      return `Bạn cần có vai trò ${role} để truy cập chức năng này.`;
    }
    return 'Bạn không có quyền truy cập trang này.';
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Text style={[styles.icon, { color: '#dc3545' }]}>🚫</Text>

        <Text style={[styles.title, { color: '#dc3545' }]}>
          Truy cập bị từ chối
        </Text>

        <Text style={[styles.message, { color: textColor }]}>
          {getMessage()}
        </Text>

        <Text style={[styles.description, { color: '#6c757d' }]}>
          Liên hệ quản trị viên để được cấp quyền truy cập hoặc yêu cầu hỗ trợ.
        </Text>

        <View style={styles.buttonContainer}>
          {onRetry && (
            <TouchableOpacity
              style={[styles.button, styles.retryButton, { borderColor: tintColor }]}
              onPress={onRetry}
            >
              <Text style={[styles.buttonText, { color: tintColor }]}>
                Thử lại
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, { backgroundColor: tintColor }]}
            onPress={handleGoBack}
          >
            <Text style={[styles.buttonText, { color: 'white' }]}>
              Quay lại
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  primaryButton: {
    // backgroundColor is set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
