import { CallType, useCall } from '@/context/CallContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet } from 'react-native';

interface CallButtonProps {
  userId: number;
  userName: string;
  type?: CallType;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export function CallButton({ 
  userId, 
  userName, 
  type = 'video', 
  size = 'medium',
  style 
}: CallButtonProps) {
  const { startCall, connected } = useCall();
  const tintColor = useThemeColor({}, 'tint');

  const handlePress = async () => {
    if (!connected) {
      Alert.alert(
        'Không thể kết nối',
        'Vui lòng kiểm tra kết nối mạng và thử lại.'
      );
      return;
    }

    try {
      await startCall(userId, type);
      // Navigate to active call screen
      router.push('/call/active' as any);
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.message || 'Không thể bắt đầu cuộc gọi. Vui lòng thử lại.'
      );
    }
  };

  const buttonSize = {
    small: 36,
    medium: 48,
    large: 64,
  }[size];

  const iconSize = {
    small: 18,
    medium: 24,
    large: 32,
  }[size];

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: type === 'video' ? '#0EA5E9' : '#0066CC',
        },
        pressed && styles.buttonPressed,
        style,
      ]}
    >
      <Ionicons
        name={type === 'video' ? 'videocam' : 'call'}
        size={iconSize}
        color="#FFFFFF"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
});
