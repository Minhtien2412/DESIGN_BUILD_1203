/**
 * Luxury Settings Screen - European Design
 * Elegant settings with smooth animations
 */

import { LuxuryCard } from '@/components/ui/luxury-card';
import { Animations } from '@/constants/animations';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SettingToggleProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  iconColor?: string;
}

function SettingToggle({ icon, title, subtitle, value, onValueChange, iconColor }: SettingToggleProps) {
  return (
    <View style={styles.settingItem}>
      <View style={[styles.settingIcon, { backgroundColor: iconColor ? `${iconColor}15` : Colors.light.surfaceMuted }]}>
        <Ionicons name={icon} size={22} color={iconColor || Colors.light.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.light.border, true: Colors.light.accent }}
        thumbColor={value ? Colors.light.primary : Colors.light.textMuted}
        ios_backgroundColor={Colors.light.border}
      />
    </View>
  );
}

interface SettingLinkProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  value?: string;
  iconColor?: string;
}

function SettingLink({ icon, title, subtitle, onPress, value, iconColor }: SettingLinkProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      damping: 15,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 15,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View style={[styles.settingItem, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.settingIcon, { backgroundColor: iconColor ? `${iconColor}15` : Colors.light.surfaceMuted }]}>
          <Ionicons name={icon} size={22} color={iconColor || Colors.light.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.settingRight}>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function LuxurySettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animations.timing.smooth,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cài đặt</Text>
          <View style={{ width: 40 }} />
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Account Settings */}
          <LuxuryCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.goldAccent} />
                <Text style={styles.sectionTitle}>Tài khoản</Text>
              </View>
            </View>
            <SettingLink
              icon="person-outline"
              title="Chỉnh sửa hồ sơ"
              subtitle="Cập nhật thông tin cá nhân"
              onPress={() => router.push('/profile/edit' as Href)}
              iconColor={Colors.light.primary}
            />
            <SettingLink
              icon="lock-closed-outline"
              title="Đổi mật khẩu"
              subtitle="Cập nhật mật khẩu bảo mật"
              onPress={() => router.push('/profile/security' as Href)}
              iconColor={Colors.light.warning}
            />
            <SettingLink
              icon="mail-outline"
              title="Email"
              subtitle="Cập nhật địa chỉ email"
              value="user@example.com"
              iconColor={Colors.light.info}
            />
            <SettingLink
              icon="call-outline"
              title="Số điện thoại"
              subtitle="Quản lý số điện thoại"
              value="+84 xxx xxx xxx"
              iconColor={Colors.light.success}
            />
          </LuxuryCard>

          {/* Notifications */}
          <LuxuryCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.goldAccent} />
                <Text style={styles.sectionTitle}>Thông báo</Text>
              </View>
            </View>
            <SettingToggle
              icon="notifications-outline"
              title="Thông báo đẩy"
              subtitle="Nhận thông báo quan trọng"
              value={notifications}
              onValueChange={setNotifications}
              iconColor={Colors.light.primary}
            />
            <SettingToggle
              icon="mail-outline"
              title="Email cập nhật"
              subtitle="Nhận tin tức qua email"
              value={emailUpdates}
              onValueChange={setEmailUpdates}
              iconColor={Colors.light.info}
            />
            <SettingLink
              icon="megaphone-outline"
              title="Quản lý thông báo"
              subtitle="Tùy chỉnh chi tiết"
              onPress={() => router.push('/profile/notifications' as Href)}
              iconColor={Colors.light.accent}
            />
          </LuxuryCard>

          {/* Appearance */}
          <LuxuryCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.goldAccent} />
                <Text style={styles.sectionTitle}>Giao diện</Text>
              </View>
            </View>
            <SettingToggle
              icon="moon-outline"
              title="Chế độ tối"
              subtitle="Giao diện tối dễ nhìn"
              value={darkMode}
              onValueChange={setDarkMode}
              iconColor={Colors.light.primary}
            />
            <SettingLink
              icon="color-palette-outline"
              title="Chủ đề màu sắc"
              subtitle="European Luxury"
              value="Vàng champagne"
              iconColor={Colors.light.accent}
            />
            <SettingLink
              icon="text-outline"
              title="Kích thước chữ"
              subtitle="Điều chỉnh font chữ"
              value="Trung bình"
              iconColor={Colors.light.secondary}
            />
          </LuxuryCard>

          {/* Security & Privacy */}
          <LuxuryCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.goldAccent} />
                <Text style={styles.sectionTitle}>Bảo mật & Riêng tư</Text>
              </View>
            </View>
            <SettingToggle
              icon="finger-print"
              title="Sinh trắc học"
              subtitle="Đăng nhập bằng vân tay/Face ID"
              value={biometric}
              onValueChange={setBiometric}
              iconColor={Colors.light.success}
            />
            <SettingLink
              icon="shield-checkmark-outline"
              title="Xác thực 2 lớp"
              subtitle="Tăng cường bảo mật"
              onPress={() => router.push('/profile/security' as Href)}
              iconColor={Colors.light.warning}
            />
            <SettingLink
              icon="eye-off-outline"
              title="Quyền riêng tư"
              subtitle="Kiểm soát dữ liệu cá nhân"
              onPress={() => router.push('/profile/privacy' as Href)}
              iconColor={Colors.light.info}
            />
          </LuxuryCard>

          {/* Data & Storage */}
          <LuxuryCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.goldAccent} />
                <Text style={styles.sectionTitle}>Dữ liệu</Text>
              </View>
            </View>
            <SettingToggle
              icon="cloud-upload-outline"
              title="Tự động sao lưu"
              subtitle="Lưu trữ đám mây"
              value={autoSave}
              onValueChange={setAutoSave}
              iconColor={Colors.light.info}
            />
            <SettingLink
              icon="download-outline"
              title="Tải xuống dữ liệu"
              subtitle="Xuất thông tin cá nhân"
              iconColor={Colors.light.primary}
            />
            <SettingLink
              icon="trash-outline"
              title="Xóa cache"
              subtitle="Giải phóng bộ nhớ"
              value="124 MB"
              iconColor={Colors.light.error}
            />
          </LuxuryCard>

          {/* About */}
          <LuxuryCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.goldAccent} />
                <Text style={styles.sectionTitle}>Thông tin</Text>
              </View>
            </View>
            <SettingLink
              icon="information-circle-outline"
              title="Về ứng dụng"
              subtitle="Phiên bản 1.0.0"
              iconColor={Colors.light.info}
            />
            <SettingLink
              icon="document-text-outline"
              title="Điều khoản dịch vụ"
              onPress={() => router.push('/legal/terms' as Href)}
              iconColor={Colors.light.textMuted}
            />
            <SettingLink
              icon="shield-outline"
              title="Chính sách bảo mật"
              onPress={() => router.push('/legal/privacy' as Href)}
              iconColor={Colors.light.textMuted}
            />
            <SettingLink
              icon="help-circle-outline"
              title="Trợ giúp & Hỗ trợ"
              onPress={() => router.push('/profile/help' as Href)}
              iconColor={Colors.light.success}
            />
          </LuxuryCard>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goldAccent: {
    width: 3,
    height: 20,
    backgroundColor: Colors.light.accent,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
  },
});
