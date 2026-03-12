/**
 * Zalo Login Button Component
 * ===========================
 * 
 * Nút đăng nhập bằng Zalo
 * 
 * @author AI Assistant
 * @date 14/01/2026
 */

import { useZaloAuth } from '@/hooks/useZaloAuth';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// ==================== TYPES ====================

interface ZaloLoginButtonProps {
  /** Callback khi đăng nhập thành công */
  onSuccess?: () => void;
  /** Callback khi đăng nhập thất bại */
  onError?: (error: string) => void;
  /** Variant style */
  variant?: 'filled' | 'outlined';
  /** Size */
  size?: 'small' | 'medium' | 'large';
  /** Custom text */
  text?: string;
  /** Full width */
  fullWidth?: boolean;
  /** Disabled */
  disabled?: boolean;
}

// ==================== ZALO COLORS ====================

const ZALO_BLUE = '#0068FF';
const ZALO_DARK = '#0052CC';

// ==================== COMPONENT ====================

export function ZaloLoginButton({
  onSuccess,
  onError,
  variant = 'filled',
  size = 'medium',
  text = 'Đăng nhập với Zalo',
  fullWidth = false,
  disabled = false,
}: ZaloLoginButtonProps) {
  const { loading, signInWithZalo } = useZaloAuth();

  const handlePress = async () => {
    const success = await signInWithZalo();
    if (success) {
      onSuccess?.();
    } else {
      onError?.('Đăng nhập Zalo thất bại');
    }
  };

  const buttonStyles = [
    styles.button,
    variant === 'filled' ? styles.buttonFilled : styles.buttonOutlined,
    size === 'small' && styles.buttonSmall,
    size === 'large' && styles.buttonLarge,
    fullWidth && styles.buttonFullWidth,
    (disabled || loading) && styles.buttonDisabled,
  ];

  const textStyles = [
    styles.text,
    variant === 'filled' ? styles.textFilled : styles.textOutlined,
    size === 'small' && styles.textSmall,
    size === 'large' && styles.textLarge,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'filled' ? '#FFF' : ZALO_BLUE} 
        />
      ) : (
        <View style={styles.content}>
          {/* Zalo Icon */}
          <View style={[
            styles.iconContainer,
            variant === 'outlined' && styles.iconContainerOutlined
          ]}>
            <Text style={styles.zaloIcon}>Z</Text>
          </View>
          <Text style={textStyles}>{text}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ==================== SHARE BUTTON ====================

interface ZaloShareButtonProps {
  title: string;
  description?: string;
  link?: string;
  variant?: 'icon' | 'text' | 'full';
}

export function ZaloShareButton({
  title,
  description,
  link,
  variant = 'full',
}: ZaloShareButtonProps) {
  const { share } = useZaloAuth();

  const handleShare = async () => {
    await share({ title, description, link });
  };

  if (variant === 'icon') {
    return (
      <TouchableOpacity style={styles.shareIconButton} onPress={handleShare}>
        <Text style={styles.zaloIconSmall}>Z</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
      <Text style={styles.zaloIconSmall}>Z</Text>
      {variant === 'full' && (
        <Text style={styles.shareText}>Chia sẻ Zalo</Text>
      )}
    </TouchableOpacity>
  );
}

// ==================== CHAT OA BUTTON ====================

interface ZaloChatButtonProps {
  text?: string;
}

export function ZaloChatButton({ text = 'Chat với chúng tôi' }: ZaloChatButtonProps) {
  const { openOA } = useZaloAuth();

  return (
    <TouchableOpacity style={styles.chatButton} onPress={openOA}>
      <View style={styles.chatIconContainer}>
        <Text style={styles.zaloIconWhite}>Z</Text>
      </View>
      <Text style={styles.chatText}>{text}</Text>
    </TouchableOpacity>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 200,
  },
  buttonFilled: {
    backgroundColor: ZALO_BLUE,
  },
  buttonOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: ZALO_BLUE,
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 150,
  },
  buttonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minWidth: 250,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconContainerOutlined: {
    backgroundColor: ZALO_BLUE,
  },
  zaloIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ZALO_BLUE,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
  textFilled: {
    color: '#FFF',
  },
  textOutlined: {
    color: ZALO_BLUE,
  },
  textSmall: {
    fontSize: 13,
  },
  textLarge: {
    fontSize: 17,
  },

  // Share button
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZALO_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ZALO_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  zaloIconSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },

  // Chat button
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: ZALO_BLUE,
  },
  chatIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ZALO_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  zaloIconWhite: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  chatText: {
    fontSize: 14,
    fontWeight: '600',
    color: ZALO_BLUE,
  },
});

export default ZaloLoginButton;
