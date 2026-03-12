// Session Management Component
// Displays active sessions and allows user to manage them

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

interface SessionItemProps {
  session: any; // UserSession from sessionManagement
  isCurrentSession: boolean;
  onRevoke: (sessionId: string) => void;
}

const SessionItem: React.FC<SessionItemProps> = ({ session, isCurrentSession, onRevoke }) => {
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'icon');
  const successColor = useThemeColor({}, 'tint');
  const dangerColor = useThemeColor({}, 'danger');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'android':
        return 'phone-portrait-outline';
      case 'ios':
        return 'phone-portrait-outline';
      case 'web':
        return 'desktop-outline';
      default:
        return 'hardware-chip-outline';
    }
  };

  const handleRevoke = () => {
    if (isCurrentSession) {
      Alert.alert(
        'Đăng xuất khỏi thiết bị này',
        'Bạn có chắc muốn đăng xuất khỏi thiết bị này không? Bạn sẽ cần đăng nhập lại.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng xuất', style: 'destructive', onPress: () => onRevoke(session.id) }
        ]
      );
    } else {
      Alert.alert(
        'Thu hồi phiên đăng nhập',
        `Bạn có chắc muốn thu hồi phiên đăng nhập từ "${session.device_name}" không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Thu hồi', style: 'destructive', onPress: () => onRevoke(session.id) }
        ]
      );
    }
  };

  return (
    <View
      style={{
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isCurrentSession ? successColor : borderColor,
        backgroundColor: isCurrentSession ? successColor + '10' : 'transparent',
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons
          name={getDeviceIcon(session.device_type)}
          size={24}
          color={isCurrentSession ? successColor : textColor}
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>
            {session.device_name}
          </Text>
          {isCurrentSession && (
            <Text style={{ fontSize: 12, color: successColor, fontWeight: '500' }}>
              Thiết bị hiện tại
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={handleRevoke}
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: dangerColor + '20',
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={dangerColor} />
        </TouchableOpacity>
      </View>

      <View style={{ marginLeft: 36 }}>
        <Text style={{ fontSize: 14, color: mutedColor, marginBottom: 4 }}>
          Nền tảng: {session.platform.toUpperCase()}
        </Text>
        <Text style={{ fontSize: 14, color: mutedColor, marginBottom: 4 }}>
          Hoạt động cuối: {formatDate(session.last_active_at)}
        </Text>
        <Text style={{ fontSize: 14, color: mutedColor }}>
          Tạo lúc: {formatDate(session.created_at)}
        </Text>
      </View>
    </View>
  );
};

export const SessionManagement: React.FC = () => { return null; };
