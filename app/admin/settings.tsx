import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiFetch } from '@/services/api';
import { hasPermission } from '@/utils/permissions';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

interface Settings {
  general: {
    company_name: string;
    company_email: string;
    company_phone: string;
    company_address: string;
    timezone: string;
    date_format: string;
  };
  email: {
    smtp_host: string;
    smtp_port: string;
    smtp_username: string;
    smtp_password: string;
    smtp_encryption: string;
    from_email: string;
    from_name: string;
  };
  security: {
    two_factor_enabled: boolean;
    password_min_length: number;
    session_timeout: number;
    max_login_attempts: number;
  };
  features: {
    enable_projects: boolean;
    enable_tasks: boolean;
    enable_invoices: boolean;
    enable_estimates: boolean;
    enable_contracts: boolean;
    enable_proposals: boolean;
  };
}

export default function SettingsScreen() {
  const { user } = useAuth();
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const cardBg = useThemeColor({}, 'surface');
  const switchTrack = useThemeColor({}, 'tint');

  // Permission check
  useEffect(() => {
    if (!user?.admin || !hasPermission(user.permissions, 'settings', 'view')) {
      Alert.alert('Không có quyền', 'Bạn không có quyền xem cài đặt', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [user]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<keyof Settings>('general');
  
  const [settings, setSettings] = useState<Settings>({
    general: {
      company_name: '',
      company_email: '',
      company_phone: '',
      company_address: '',
      timezone: 'Asia/Ho_Chi_Minh',
      date_format: 'dd/MM/yyyy',
    },
    email: {
      smtp_host: '',
      smtp_port: '587',
      smtp_username: '',
      smtp_password: '',
      smtp_encryption: 'tls',
      from_email: '',
      from_name: '',
    },
    security: {
      two_factor_enabled: false,
      password_min_length: 6,
      session_timeout: 30,
      max_login_attempts: 5,
    },
    features: {
      enable_projects: true,
      enable_tasks: true,
      enable_invoices: true,
      enable_estimates: true,
      enable_contracts: true,
      enable_proposals: true,
    },
  });

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await apiFetch<Settings>('/admin/settings');
        setSettings(response);
      } catch (error: any) {
        console.error('[Settings] Fetch error:', error);
        // Use default settings on error
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle save
  const handleSave = async () => {
    if (!hasPermission(user?.permissions, 'settings', 'edit')) {
      Alert.alert('Không có quyền', 'Bạn không có quyền chỉnh sửa cài đặt');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      Alert.alert('Thành công', 'Cài đặt đã được lưu');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu cài đặt');
    } finally {
      setSubmitting(false);
    }
  };

  // Update field helper
  const updateField = (section: keyof Settings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      }
    }));
  };

  const sections = [
    { key: 'general' as const, label: 'Chung', icon: 'settings-outline' as const },
    { key: 'email' as const, label: 'Email', icon: 'mail-outline' as const },
    { key: 'security' as const, label: 'Bảo mật', icon: 'shield-checkmark-outline' as const },
    { key: 'features' as const, label: 'Tính năng', icon: 'apps-outline' as const },
  ];

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Loader />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Container>
        {/* Header */}
        <Section>
          <View style={styles.header}>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </Button>
            <ThemedText type="title">Cài đặt hệ thống</ThemedText>
          </View>
        </Section>

        {/* Section Tabs */}
        <Section>
          <View style={styles.tabs}>
            {sections.map((section) => (
              <TouchableOpacity
                key={section.key}
                onPress={() => setActiveSection(section.key)}
                style={[
                  styles.tab,
                  { borderColor },
                  activeSection === section.key && styles.tabActive
                ]}
              >
                <Ionicons
                  name={section.icon}
                  size={20}
                  color={activeSection === section.key ? '#3b82f6' : mutedColor}
                />
                <ThemedText
                  style={[
                    styles.tabText,
                    activeSection === section.key && styles.tabTextActive
                  ]}
                >
                  {section.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </Section>
      </Container>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Container>
          {/* General Settings */}
          {activeSection === 'general' && (
            <Section>
              <View style={[styles.settingsCard, { backgroundColor: cardBg, borderColor }]}>
                <ThemedText type="subtitle" style={styles.cardTitle}>Thông tin công ty</ThemedText>

                <Input
                  label="Tên công ty"
                  value={settings.general.company_name}
                  onChangeText={(text) => updateField('general', 'company_name', text)}
                  placeholder="Nhập tên công ty"
                />

                <Input
                  label="Email công ty"
                  value={settings.general.company_email}
                  onChangeText={(text) => updateField('general', 'company_email', text)}
                  placeholder="email@company.com"
                  keyboardType="email-address"
                />

                <Input
                  label="Số điện thoại"
                  value={settings.general.company_phone}
                  onChangeText={(text) => updateField('general', 'company_phone', text)}
                  placeholder="0123456789"
                  keyboardType="phone-pad"
                />

                <Input
                  label="Địa chỉ"
                  value={settings.general.company_address}
                  onChangeText={(text) => updateField('general', 'company_address', text)}
                  placeholder="Nhập địa chỉ công ty"
                  multiline
                  numberOfLines={3}
                />

                <Input
                  label="Múi giờ"
                  value={settings.general.timezone}
                  onChangeText={(text) => updateField('general', 'timezone', text)}
                  placeholder="Asia/Ho_Chi_Minh"
                />

                <Input
                  label="Định dạng ngày"
                  value={settings.general.date_format}
                  onChangeText={(text) => updateField('general', 'date_format', text)}
                  placeholder="dd/MM/yyyy"
                />
              </View>
            </Section>
          )}

          {/* Email Settings */}
          {activeSection === 'email' && (
            <Section>
              <View style={[styles.settingsCard, { backgroundColor: cardBg, borderColor }]}>
                <ThemedText type="subtitle" style={styles.cardTitle}>Cấu hình SMTP</ThemedText>

                <Input
                  label="SMTP Host"
                  value={settings.email.smtp_host}
                  onChangeText={(text) => updateField('email', 'smtp_host', text)}
                  placeholder="smtp.gmail.com"
                />

                <Input
                  label="SMTP Port"
                  value={settings.email.smtp_port}
                  onChangeText={(text) => updateField('email', 'smtp_port', text)}
                  placeholder="587"
                  keyboardType="number-pad"
                />

                <Input
                  label="SMTP Username"
                  value={settings.email.smtp_username}
                  onChangeText={(text) => updateField('email', 'smtp_username', text)}
                  placeholder="your-email@gmail.com"
                  autoCapitalize="none"
                />

                <Input
                  label="SMTP Password"
                  value={settings.email.smtp_password}
                  onChangeText={(text) => updateField('email', 'smtp_password', text)}
                  placeholder="Mật khẩu SMTP"
                  secureTextEntry
                />

                <Input
                  label="Encryption"
                  value={settings.email.smtp_encryption}
                  onChangeText={(text) => updateField('email', 'smtp_encryption', text)}
                  placeholder="tls hoặc ssl"
                />

                <Input
                  label="Email gửi"
                  value={settings.email.from_email}
                  onChangeText={(text) => updateField('email', 'from_email', text)}
                  placeholder="noreply@company.com"
                  keyboardType="email-address"
                />

                <Input
                  label="Tên người gửi"
                  value={settings.email.from_name}
                  onChangeText={(text) => updateField('email', 'from_name', text)}
                  placeholder="Tên công ty"
                />
              </View>
            </Section>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <Section>
              <View style={[styles.settingsCard, { backgroundColor: cardBg, borderColor }]}>
                <ThemedText type="subtitle" style={styles.cardTitle}>Bảo mật</ThemedText>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <ThemedText type="defaultSemiBold">Xác thực 2 yếu tố</ThemedText>
                    <ThemedText style={[styles.settingDesc, { color: mutedColor }]}>
                      Bắt buộc nhân viên sử dụng 2FA
                    </ThemedText>
                  </View>
                  <Switch
                    value={settings.security.two_factor_enabled}
                    onValueChange={(value) => updateField('security', 'two_factor_enabled', value)}
                    trackColor={{ false: '#767577', true: switchTrack }}
                  />
                </View>

                <Input
                  label="Độ dài mật khẩu tối thiểu"
                  value={settings.security.password_min_length.toString()}
                  onChangeText={(text) => updateField('security', 'password_min_length', parseInt(text) || 6)}
                  placeholder="6"
                  keyboardType="number-pad"
                />

                <Input
                  label="Thời gian timeout phiên (phút)"
                  value={settings.security.session_timeout.toString()}
                  onChangeText={(text) => updateField('security', 'session_timeout', parseInt(text) || 30)}
                  placeholder="30"
                  keyboardType="number-pad"
                />

                <Input
                  label="Số lần đăng nhập tối đa"
                  value={settings.security.max_login_attempts.toString()}
                  onChangeText={(text) => updateField('security', 'max_login_attempts', parseInt(text) || 5)}
                  placeholder="5"
                  keyboardType="number-pad"
                />
              </View>
            </Section>
          )}

          {/* Features Settings */}
          {activeSection === 'features' && (
            <Section>
              <View style={[styles.settingsCard, { backgroundColor: cardBg, borderColor }]}>
                <ThemedText type="subtitle" style={styles.cardTitle}>Tính năng</ThemedText>
                <ThemedText style={[styles.cardDesc, { color: mutedColor }]}>
                  Bật/tắt các tính năng trong hệ thống
                </ThemedText>

                {Object.entries(settings.features).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    enable_projects: 'Dự án',
                    enable_tasks: 'Nhiệm vụ',
                    enable_invoices: 'Hóa đơn',
                    enable_estimates: 'Báo giá',
                    enable_contracts: 'Hợp đồng',
                    enable_proposals: 'Đề xuất',
                  };

                  return (
                    <View key={key} style={styles.settingRow}>
                      <View style={styles.settingInfo}>
                        <ThemedText type="defaultSemiBold">{labels[key]}</ThemedText>
                      </View>
                      <Switch
                        value={value}
                        onValueChange={(newValue) => updateField('features', key, newValue)}
                        trackColor={{ false: '#767577', true: switchTrack }}
                      />
                    </View>
                  );
                })}
              </View>
            </Section>
          )}

          {/* Save Button */}
          {hasPermission(user?.permissions, 'settings', 'edit') && (
            <Section>
              <Button
                onPress={handleSave}
                loading={submitting}
                disabled={submitting}
                fullWidth
              >
                Lưu cài đặt
              </Button>
            </Section>
          )}
        </Container>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    padding: 0,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  tabActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
  },
  tabTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  settingsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    marginTop: -8,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingDesc: {
    fontSize: 13,
    marginTop: 4,
  },
});
