// Session Management Component
// Displays active sessions and allows user to manage them

import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { InfoBox } from '@/components/ui/info-box';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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

export const SessionManagement: React.FC = () => {
  const { currentSession, activeSessions, revokeSession, revokeAllOtherSessions, refreshSessions, signOut } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'icon');

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshSessions();
    } catch (error) {
      console.error('Failed to refresh sessions:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshSessions]);

  const handleRevokeSession = React.useCallback(async (sessionId: string) => {
    try {
      if (currentSession && sessionId === currentSession.id) {
        // If revoking current session, sign out completely
        await signOut();
      } else {
        await revokeSession(sessionId);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thu hồi phiên đăng nhập. Vui lòng thử lại.');
    }
  }, [currentSession, revokeSession, signOut]);

  const handleRevokeAllOther = React.useCallback(() => {
    const otherSessionsCount = activeSessions.filter(s => s.id !== currentSession?.id).length;
    
    if (otherSessionsCount === 0) {
      Alert.alert('Thông báo', 'Không có phiên đăng nhập nào khác để thu hồi.');
      return;
    }

    Alert.alert(
      'Thu hồi tất cả phiên khác',
      `Bạn có chắc muốn thu hồi ${otherSessionsCount} phiên đăng nhập khác không? Các thiết bị khác sẽ bị đăng xuất.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thu hồi tất cả',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeAllOtherSessions();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể thu hồi các phiên đăng nhập. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  }, [activeSessions, currentSession, revokeAllOtherSessions]);

  React.useEffect(() => {
    refreshSessions();
  }, []);

  return (
    <Container>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Section title="Quản lý phiên đăng nhập">
          <InfoBox
            title="Bảo mật tài khoản"
            items={[
              "Theo dõi và quản lý các thiết bị đã đăng nhập vào tài khoản của bạn.",
              "Thu hồi phiên đăng nhập từ các thiết bị không tin cậy."
            ]}
          />

          {activeSessions.length === 0 ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Ionicons name="phone-portrait-outline" size={48} color={mutedColor} />
              <Text style={{ fontSize: 16, color: mutedColor, marginTop: 12, textAlign: 'center' }}>
                Không có phiên đăng nhập nào
              </Text>
            </View>
          ) : (
            <>
              <Text style={{ fontSize: 18, fontWeight: '600', color: textColor, marginBottom: 16 }}>
                Phiên đăng nhập hoạt động ({activeSessions.length})
              </Text>

              {activeSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isCurrentSession={session.id === currentSession?.id}
                  onRevoke={handleRevokeSession}
                />
              ))}

              {activeSessions.filter(s => s.id !== currentSession?.id).length > 0 && (
                <View style={{ marginTop: 24 }}>
                  <Button
                    variant="secondary"
                    title="Thu hồi tất cả phiên khác"
                    onPress={handleRevokeAllOther}
                    style={{ marginBottom: 12 }}
                  />
                  <Text style={{ fontSize: 12, color: mutedColor, textAlign: 'center' }}>
                    Các thiết bị khác sẽ bị đăng xuất và cần đăng nhập lại
                  </Text>
                </View>
              )}
            </>
          )}
        </Section>
      </ScrollView>
    </Container>
  );
};

export default SessionManagement;
