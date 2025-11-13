import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import * as React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Settings {
  // General
  language: 'vi' | 'en';
  theme: 'light' | 'dark' | 'auto';
  
  // Notifications
  pushNotifications: boolean;
  emailNotifications: boolean;
  projectUpdates: boolean;
  promotions: boolean;
  
  // Privacy
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  showActivity: boolean;
  
  // App Behavior
  autoPlay: boolean;
  dataUsage: 'low' | 'medium' | 'high';
  cacheVideos: boolean;
}

const SETTINGS_STORAGE_KEY = '@app_settings';

export default function SettingsScreen() {
  const [settings, setSettings] = React.useState<Settings>({
    language: 'vi',
    theme: 'light',
    pushNotifications: true,
    emailNotifications: true,
    projectUpdates: true,
    promotions: false,
    profileVisibility: 'public',
    showOnlineStatus: true,
    showActivity: true,
    autoPlay: true,
    dataUsage: 'medium',
    cacheVideos: false,
  });

  const [saving, setSaving] = React.useState(false);

  // Load settings from storage
  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      setSaving(true);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      // Show success message
      setTimeout(() => setSaving(false), 500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Lỗi', 'Không thể lưu cài đặt');
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleLanguageChange = () => {
    Alert.alert(
      'Chọn ngôn ngữ',
      '',
      [
        {
          text: 'Tiếng Việt',
          onPress: () => updateSetting('language', 'vi'),
          style: settings.language === 'vi' ? 'default' : 'cancel',
        },
        {
          text: 'English',
          onPress: () => updateSetting('language', 'en'),
          style: settings.language === 'en' ? 'default' : 'cancel',
        },
      ]
    );
  };

  const handleThemeChange = () => {
    Alert.alert(
      'Chọn giao diện',
      '',
      [
        {
          text: 'Sáng',
          onPress: () => updateSetting('theme', 'light'),
        },
        {
          text: 'Tối',
          onPress: () => updateSetting('theme', 'dark'),
        },
        {
          text: 'Tự động',
          onPress: () => updateSetting('theme', 'auto'),
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleProfileVisibilityChange = () => {
    Alert.alert(
      'Hiển thị hồ sơ',
      'Chọn ai có thể xem hồ sơ của bạn',
      [
        {
          text: 'Công khai',
          onPress: () => updateSetting('profileVisibility', 'public'),
        },
        {
          text: 'Bạn bè',
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

  const handleDataUsageChange = () => {
    Alert.alert(
      'Sử dụng dữ liệu',
      'Chọn chất lượng video và hình ảnh',
      [
        {
          text: 'Thấp (tiết kiệm dữ liệu)',
          onPress: () => updateSetting('dataUsage', 'low'),
        },
        {
          text: 'Trung bình',
          onPress: () => updateSetting('dataUsage', 'medium'),
        },
        {
          text: 'Cao (chất lượng tốt nhất)',
          onPress: () => updateSetting('dataUsage', 'high'),
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Xóa bộ nhớ đệm',
      'Điều này sẽ xóa tất cả dữ liệu tạm thời và có thể giải phóng dung lượng lưu trữ.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              // Targeted AsyncStorage cleanup to avoid logging user out
              const keys = await AsyncStorage.getAllKeys();
              const removable = keys.filter(k => (
                k.startsWith('@project_') ||
                k.startsWith('@cache_') ||
                k.startsWith('@app_cache_') ||
                k === '@video_cache' ||
                k === '@image_cache'
              ));
              if (removable.length > 0) {
                await AsyncStorage.multiRemove(removable);
              }

              // Optional: remove transient SecureStore caches (keep auth token)
              // Add known non-auth keys here if used in the future
              // e.g., await SecureStore.deleteItemAsync('NON_AUTH_CACHE_KEY');

              Alert.alert('Thành công', 'Đã xóa bộ nhớ đệm');
            } catch (e) {
              console.error('Cache clear failed', e);
              Alert.alert('Lỗi', 'Không thể xóa bộ nhớ đệm');
            }
          }
        }
      ]
    );
  };

  const getLanguageLabel = () => {
    return settings.language === 'vi' ? 'Tiếng Việt' : 'English';
  };

  const getThemeLabel = () => {
    switch (settings.theme) {
      case 'light': return 'Sáng';
      case 'dark': return 'Tối';
      case 'auto': return 'Tự động';
    }
  };

  const getProfileVisibilityLabel = () => {
    switch (settings.profileVisibility) {
      case 'public': return 'Công khai';
      case 'friends': return 'Bạn bè';
      case 'private': return 'Riêng tư';
    }
  };

  const getDataUsageLabel = () => {
    switch (settings.dataUsage) {
      case 'low': return 'Thấp';
      case 'medium': return 'Trung bình';
      case 'high': return 'Cao';
    }
  };

  const SettingRow = ({ 
    icon, 
    title, 
    description, 
    value, 
    onPress,
    showArrow = true,
  }: { 
    icon: string; 
    title: string; 
    description?: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
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
        {showArrow && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
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
          title: 'Cài đặt chung',
          headerBackTitle: 'Quay lại',
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* General Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={24} color="#0891B2" />
            <Text style={styles.sectionTitle}>Cài đặt chung</Text>
          </View>
          
          <View style={styles.card}>
            <SettingRow
              icon="language-outline"
              title="Ngôn ngữ"
              description="Thay đổi ngôn ngữ ứng dụng"
              value={getLanguageLabel()}
              onPress={handleLanguageChange}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="color-palette-outline"
              title="Giao diện"
              description="Chọn chế độ sáng/tối"
              value={getThemeLabel()}
              onPress={handleThemeChange}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>Thông báo</Text>
          </View>
          
          <View style={styles.card}>
            <SwitchRow
              icon="notifications"
              title="Thông báo đẩy"
              description="Nhận thông báo trên thiết bị"
              value={settings.pushNotifications}
              onChange={(value) => updateSetting('pushNotifications', value)}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="mail"
              title="Thông báo email"
              description="Nhận email về hoạt động quan trọng"
              value={settings.emailNotifications}
              onChange={(value) => updateSetting('emailNotifications', value)}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="briefcase"
              title="Cập nhật dự án"
              description="Thông báo về tiến độ dự án"
              value={settings.projectUpdates}
              onChange={(value) => updateSetting('projectUpdates', value)}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="pricetag"
              title="Khuyến mãi"
              description="Nhận thông báo về ưu đãi đặc biệt"
              value={settings.promotions}
              onChange={(value) => updateSetting('promotions', value)}
            />
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-outline" size={24} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Quyền riêng tư</Text>
          </View>
          
          <View style={styles.card}>
            <SettingRow
              icon="eye-outline"
              title="Hiển thị hồ sơ"
              description="Kiểm soát ai xem được hồ sơ"
              value={getProfileVisibilityLabel()}
              onPress={handleProfileVisibilityChange}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="radio-button-on"
              title="Hiển thị trạng thái online"
              description="Cho phép người khác biết bạn đang online"
              value={settings.showOnlineStatus}
              onChange={(value) => updateSetting('showOnlineStatus', value)}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="pulse"
              title="Hiển thị hoạt động"
              description="Chia sẻ hoạt động gần đây"
              value={settings.showActivity}
              onChange={(value) => updateSetting('showActivity', value)}
            />
          </View>
        </View>

        {/* App Behavior */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="phone-portrait-outline" size={24} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Ứng dụng</Text>
          </View>
          
          <View style={styles.card}>
            <SwitchRow
              icon="play-circle"
              title="Tự động phát video"
              description="Phát video khi cuộn qua"
              value={settings.autoPlay}
              onChange={(value) => updateSetting('autoPlay', value)}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="cellular-outline"
              title="Sử dụng dữ liệu"
              description="Chất lượng video và hình ảnh"
              value={getDataUsageLabel()}
              onPress={handleDataUsageChange}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="download-outline"
              title="Lưu video vào bộ nhớ đệm"
              description="Tải trước để xem ngoại tuyến"
              value={settings.cacheVideos}
              onChange={(value) => updateSetting('cacheVideos', value)}
            />
          </View>
        </View>

        {/* Storage & Cache */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="server-outline" size={24} color="#EF4444" />
            <Text style={styles.sectionTitle}>Bộ nhớ</Text>
          </View>
          
          <View style={styles.card}>
            <SettingRow
              icon="trash-outline"
              title="Xóa bộ nhớ đệm"
              description="Giải phóng dung lượng lưu trữ"
              onPress={handleClearCache}
              showArrow={false}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Phiên bản: 1.0.0 (Build 1)</Text>
          <Text style={styles.infoText}>© 2025 ThietKeResort.com.vn</Text>
        </View>

        {/* Save Indicator */}
        {saving && (
          <View style={styles.savingIndicator}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.savingText}>Đã lưu</Text>
          </View>
        )}
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
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  savingIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  savingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
  },
});
