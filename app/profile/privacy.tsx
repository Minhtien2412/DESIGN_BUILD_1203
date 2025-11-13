import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth';
import { ApiError, apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import * as React from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PrivacySettings {
  // Profile Visibility
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showActivity: boolean;
  
  // Data & Privacy
  allowAnalytics: boolean;
  allowPersonalization: boolean;
  allowThirdParty: boolean;
  
  // Communication
  allowMessages: 'everyone' | 'friends' | 'none';
  showOnlineStatus: boolean;
  readReceipts: boolean;
}

export default function PrivacyScreen() {
  const { user, signOut } = useAuth();
  
  const [settings, setSettings] = React.useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showActivity: true,
    allowAnalytics: true,
    allowPersonalization: true,
    allowThirdParty: false,
    allowMessages: 'everyone',
    showOnlineStatus: true,
    readReceipts: true,
  });

  const updateSetting = <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => {
    setSettings({ ...settings, [key]: value });
    // TODO: Save to backend
  };

  const handleProfileVisibility = () => {
    Alert.alert(
      'Hiển thị hồ sơ',
      'Chọn ai có thể xem hồ sơ của bạn',
      [
        {
          text: 'Công khai',
          onPress: () => updateSetting('profileVisibility', 'public'),
        },
        {
          text: 'Chỉ bạn bè',
          onPress: () => updateSetting('profileVisibility', 'friends'),
        },
        {
          text: 'Riêng tư',
          onPress: () => updateSetting('profileVisibility', 'private'),
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleMessagesPrivacy = () => {
    Alert.alert(
      'Nhận tin nhắn từ',
      'Chọn ai có thể gửi tin nhắn cho bạn',
      [
        {
          text: 'Tất cả mọi người',
          onPress: () => updateSetting('allowMessages', 'everyone'),
        },
        {
          text: 'Chỉ bạn bè',
          onPress: () => updateSetting('allowMessages', 'friends'),
        },
        {
          text: 'Không ai',
          onPress: () => updateSetting('allowMessages', 'none'),
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Tải xuống dữ liệu',
      'Chúng tôi sẽ gửi một bản sao dữ liệu cá nhân của bạn qua email trong vòng 48 giờ.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            Alert.alert('Đã gửi yêu cầu', 'Vui lòng kiểm tra email của bạn sau 48 giờ.');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Xóa tài khoản',
      'Bạn có chắc muốn xóa tài khoản vĩnh viễn? Hành động này KHÔNG THỂ hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS === 'ios') {
              // iOS-only prompt
              Alert.prompt(
                'Xác nhận xóa tài khoản',
                `Nhập "${user?.email}" để xác nhận`,
                [
                  { text: 'Hủy', style: 'cancel' },
                  {
                    text: 'Xóa vĩnh viễn',
                    style: 'destructive',
                    onPress: async (value?: string) => {
                      if (value !== user?.email) {
                        Alert.alert('Lỗi', 'Email không khớp');
                        return;
                      }
                      try {
                        await apiFetch('/auth/delete-account', { method: 'DELETE', data: { email: user?.email } });
                        Alert.alert('Tài khoản đã được xóa', 'Cảm ơn bạn đã sử dụng dịch vụ.');
                        await signOut();
                        router.replace('/(auth)/login');
                      } catch (e) {
                        const msg = (e as ApiError)?.data?.message || (e as Error)?.message || 'Không thể xóa tài khoản';
                        Alert.alert('Lỗi', msg);
                      }
                    }
                  }
                ],
                'plain-text'
              );
            } else {
              // Android: no prompt API; proceed with a final confirmation
              Alert.alert(
                'Xác nhận xóa tài khoản',
                'Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này?',
                [
                  { text: 'Hủy', style: 'cancel' },
                  {
                    text: 'Xóa vĩnh viễn',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await apiFetch('/auth/delete-account', { method: 'DELETE', data: { email: user?.email } });
                        Alert.alert('Tài khoản đã được xóa', 'Cảm ơn bạn đã sử dụng dịch vụ.');
                        await signOut();
                        router.replace('/(auth)/login');
                      } catch (e) {
                        const msg = (e as ApiError)?.data?.message || (e as Error)?.message || 'Không thể xóa tài khoản';
                        Alert.alert('Lỗi', msg);
                      }
                    }
                  }
                ]
              );
            }
          }
        }
      ]
    );
  };

  const getVisibilityLabel = () => {
    switch (settings.profileVisibility) {
      case 'public': return 'Công khai';
      case 'friends': return 'Chỉ bạn bè';
      case 'private': return 'Riêng tư';
    }
  };

  const getMessagesLabel = () => {
    switch (settings.allowMessages) {
      case 'everyone': return 'Tất cả';
      case 'friends': return 'Bạn bè';
      case 'none': return 'Không ai';
    }
  };

  const SettingRow = ({ 
    icon, 
    title, 
    description, 
    value, 
    onPress,
  }: { 
    icon: string; 
    title: string; 
    description?: string;
    value?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color="#6B7280" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {onPress && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
      </View>
    </TouchableOpacity>
  );

  const SwitchRow = ({ 
    icon, 
    title, 
    description, 
    value, 
    onChange,
  }: { 
    icon: string; 
    title: string; 
    description?: string;
    value: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color="#6B7280" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#D1D5DB', true: '#0891B2' }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen 
        options={{ 
          title: 'Quyền riêng tư',
          headerBackTitle: 'Quay lại',
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Privacy */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={24} color="#0891B2" />
            <Text style={styles.sectionTitle}>Hồ sơ cá nhân</Text>
          </View>
          
          <View style={styles.card}>
            <SettingRow
              icon="eye-outline"
              title="Hiển thị hồ sơ"
              description="Ai có thể xem hồ sơ của bạn"
              value={getVisibilityLabel()}
              onPress={handleProfileVisibility}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="mail-outline"
              title="Hiển thị email"
              description="Email xuất hiện trên hồ sơ công khai"
              value={settings.showEmail}
              onChange={(value) => updateSetting('showEmail', value)}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="call-outline"
              title="Hiển thị số điện thoại"
              description="Số điện thoại xuất hiện trên hồ sơ"
              value={settings.showPhone}
              onChange={(value) => updateSetting('showPhone', value)}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="pulse-outline"
              title="Hiển thị hoạt động"
              description="Chia sẻ hoạt động gần đây"
              value={settings.showActivity}
              onChange={(value) => updateSetting('showActivity', value)}
            />
          </View>
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>Dữ liệu & quyền riêng tư</Text>
          </View>
          
          <View style={styles.card}>
            <SwitchRow
              icon="analytics-outline"
              title="Phân tích sử dụng"
              description="Giúp cải thiện trải nghiệm của bạn"
              value={settings.allowAnalytics}
              onChange={(value) => updateSetting('allowAnalytics', value)}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="sparkles-outline"
              title="Cá nhân hóa nội dung"
              description="Đề xuất nội dung phù hợp với bạn"
              value={settings.allowPersonalization}
              onChange={(value) => updateSetting('allowPersonalization', value)}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="link-outline"
              title="Chia sẻ với đối tác"
              description="Chia sẻ dữ liệu với đối tác tin cậy"
              value={settings.allowThirdParty}
              onChange={(value) => updateSetting('allowThirdParty', value)}
            />
          </View>
        </View>

        {/* Communication */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles-outline" size={24} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Giao tiếp</Text>
          </View>
          
          <View style={styles.card}>
            <SettingRow
              icon="mail-open-outline"
              title="Nhận tin nhắn từ"
              description="Ai có thể gửi tin nhắn cho bạn"
              value={getMessagesLabel()}
              onPress={handleMessagesPrivacy}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="radio-button-on-outline"
              title="Trạng thái online"
              description="Hiển thị khi bạn đang trực tuyến"
              value={settings.showOnlineStatus}
              onChange={(value) => updateSetting('showOnlineStatus', value)}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="checkmark-done-outline"
              title="Đã xem tin nhắn"
              description="Cho phép người gửi biết bạn đã đọc"
              value={settings.readReceipts}
              onChange={(value) => updateSetting('readReceipts', value)}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Quản lý dữ liệu</Text>
          </View>
          
          <View style={styles.card}>
            <SettingRow
              icon="download-outline"
              title="Tải xuống dữ liệu"
              description="Nhận bản sao dữ liệu của bạn"
              onPress={handleDownloadData}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning-outline" size={24} color="#EF4444" />
            <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Vùng nguy hiểm</Text>
          </View>
          
          <View style={[styles.card, styles.dangerCard]}>
            <TouchableOpacity 
              style={styles.dangerButton}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
              <View style={styles.dangerText}>
                <Text style={styles.dangerTitle}>Xóa tài khoản</Text>
                <Text style={styles.dangerDescription}>Xóa vĩnh viễn tài khoản và dữ liệu</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#0891B2" />
            <Text style={styles.infoTitle}>Về quyền riêng tư</Text>
          </View>
          <Text style={styles.infoText}>
            Chúng tôi cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn. 
            Đọc thêm tại <Text style={styles.linkText} onPress={() => router.push('/legal/privacy' as any)}>Chính sách bảo mật</Text>.
          </Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 15,
    color: '#0891B2',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 52,
  },
  dangerCard: {
    borderColor: '#FEE2E2',
    borderWidth: 1,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  dangerText: {
    flex: 1,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 2,
  },
  dangerDescription: {
    fontSize: 13,
    color: '#DC2626',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
  },
  infoText: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
  },
  linkText: {
    color: '#0891B2',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
