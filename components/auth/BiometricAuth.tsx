import { useThemeColor } from '@/hooks/use-theme-color';
import { getToken, setToken } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface BiometricAuthProps {
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  fallbackToPassword?: () => void;
}

interface BiometricCapabilities {
  isAvailable: boolean;
  biometricType: LocalAuthentication.AuthenticationType[];
  isEnrolled: boolean;
}

export function BiometricAuth({ onSuccess, onError, fallbackToPassword }: BiometricAuthProps) {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    isAvailable: false,
    biometricType: [],
    isEnrolled: false,
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');

  useEffect(() => {
    checkBiometricCapabilities();
  }, []);

  const checkBiometricCapabilities = async () => {
    try {
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const biometricType = await LocalAuthentication.supportedAuthenticationTypesAsync();

      setCapabilities({
        isAvailable,
        biometricType,
        isEnrolled,
      });
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
    }
  };

  const getBiometricIcon = () => {
    if (capabilities.biometricType.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return Platform.OS === 'ios' ? 'scan' : 'scan';
    }
    if (capabilities.biometricType.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'finger-print';
    }
    return 'lock-closed';
  };

  const getBiometricText = () => {
    if (capabilities.biometricType.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return Platform.OS === 'ios' ? 'Face ID' : 'Nhận dạng khuôn mặt';
    }
    if (capabilities.biometricType.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Vân tay';
    }
    return 'Xác thực sinh trắc học';
  };

  const authenticateWithBiometrics = async () => {
    if (!capabilities.isAvailable || !capabilities.isEnrolled) {
      Alert.alert(
        'Không khả dụng',
        'Xác thực sinh trắc học không được thiết lập trên thiết bị này',
        [{ text: 'OK', onPress: fallbackToPassword }]
      );
      return;
    }

    setIsAuthenticating(true);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Xác thực để đăng nhập',
        fallbackLabel: 'Sử dụng mật khẩu',
        cancelLabel: 'Hủy',
      });

      if (result.success) {
        // Retrieve stored token after successful biometric authentication
        const storedToken = await getToken();
        if (storedToken) {
          onSuccess(storedToken);
        } else {
          // No stored token, fallback to password
          Alert.alert(
            'Cần đăng nhập',
            'Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập bằng mật khẩu.',
            [{ text: 'OK', onPress: fallbackToPassword }]
          );
        }
      } else {
        // Authentication was cancelled or failed
        if (result.error === 'system_cancel' || result.error === 'user_cancel') {
          // User cancelled, don't show error
          return;
        }
        
        onError?.(result.error || 'Xác thực thất bại');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      onError?.('Có lỗi xảy ra khi xác thực');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const enableBiometricAuth = async (token: string) => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Kích hoạt xác thực sinh trắc học',
        fallbackLabel: 'Bỏ qua',
        cancelLabel: 'Hủy',
      });

      if (result.success) {
        await setToken(token); // Store token for future biometric login
        Alert.alert(
          'Thành công',
          'Xác thực sinh trắc học đã được kích hoạt. Bạn có thể sử dụng nó để đăng nhập trong tương lai.'
        );
        return true;
      }
    } catch (error) {
      console.error('Error enabling biometric auth:', error);
    }
    return false;
  };

  if (!capabilities.isAvailable) {
    return null; // Don't render if biometric auth is not available
  }

  return (
    <View style={styles.container}>
      {capabilities.isEnrolled ? (
        <TouchableOpacity
          style={[styles.biometricButton, { borderColor: primaryColor }]}
          onPress={authenticateWithBiometrics}
          disabled={isAuthenticating}
        >
          <Ionicons
            name={getBiometricIcon()}
            size={32}
            color={primaryColor}
            style={styles.biometricIcon}
          />
          <Text style={[styles.biometricText, { color: primaryColor }]}>
            {isAuthenticating ? 'Đang xác thực...' : `Đăng nhập bằng ${getBiometricText()}`}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.notEnrolledContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={[styles.notEnrolledText, { color: textColor }]}>
            Vui lòng thiết lập {getBiometricText()} trong Cài đặt để sử dụng tính năng này
          </Text>
        </View>
      )}

      {fallbackToPassword && (
        <TouchableOpacity style={styles.fallbackButton} onPress={fallbackToPassword}>
          <Text style={[styles.fallbackText, { color: textColor }]}>
            Sử dụng mật khẩu thay thế
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Export function to enable biometric auth after login

// Utility function to check if biometric auth is available
export const isBiometricAuthAvailable = async (): Promise<boolean> => {
  try {
    const isAvailable = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return isAvailable && isEnrolled;
  } catch (error) {
    return false;
  }
};

// Utility function to prompt user to enable biometric auth after login
export const promptEnableBiometric = async (token: string): Promise<boolean> => {
  const isAvailable = await isBiometricAuthAvailable();
  
  if (!isAvailable) return false;

  return new Promise((resolve) => {
    Alert.alert(
      'Kích hoạt xác thức sinh trắc học?',
      'Bạn có muốn sử dụng xác thực sinh trắc học để đăng nhập nhanh hơn trong tương lai không?',
      [
        {
          text: 'Bỏ qua',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Kích hoạt',
          onPress: async () => {
            try {
              const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Kích hoạt xác thực sinh trắc học',
                fallbackLabel: 'Bỏ qua',
                cancelLabel: 'Hủy',
              });

              if (result.success) {
                await setToken(token);
                resolve(true);
              } else {
                resolve(false);
              }
            } catch (error) {
              resolve(false);
            }
          },
        },
      ]
    );
  });
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  biometricIcon: {
    marginRight: 12,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '500',
  },
  notEnrolledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  notEnrolledText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
    opacity: 0.7,
  },
  fallbackButton: {
    paddingVertical: 8,
  },
  fallbackText: {
    fontSize: 14,
    textDecorationLine: 'underline',
    opacity: 0.7,
  },
});
