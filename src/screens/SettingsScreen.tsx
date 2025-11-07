import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/auth';

const SettingsScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const { clear } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: () => clear()
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Xóa tài khoản',
      'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => Alert.alert('Thông báo', 'Tính năng đang được phát triển')
        },
      ]
    );
  };

  const settingsMenuItems = [
    {
      title: 'Thông báo',
      icon: 'notifications-outline',
      type: 'switch',
      value: notifications,
      onToggle: setNotifications,
    },
    {
      title: 'Chế độ tối',
      icon: 'moon-outline',
      type: 'switch',
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      title: 'Tự động sao lưu',
      icon: 'cloud-upload-outline',
      type: 'switch',
      value: autoBackup,
      onToggle: setAutoBackup,
    },
    {
      title: 'Ngôn ngữ',
      icon: 'language-outline',
      type: 'button',
      value: 'Tiếng Việt',
      onPress: () => Alert.alert('Ngôn ngữ', 'Tính năng đang được phát triển'),
    },
    {
      title: 'Bảo mật',
      icon: 'shield-checkmark-outline',
      type: 'button',
      onPress: () => Alert.alert('Bảo mật', 'Tính năng đang được phát triển'),
    },
    {
      title: 'Quyền riêng tư',
      icon: 'lock-closed-outline',
      type: 'button',
      onPress: () => Alert.alert('Quyền riêng tư', 'Tính năng đang được phát triển'),
    },
  ];

  const supportMenuItems = [
    {
      title: 'Trung tâm trợ giúp',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Trợ giúp', 'Tính năng đang được phát triển'),
    },
    {
      title: 'Liên hệ hỗ trợ',
      icon: 'mail-outline',
      onPress: () => Alert.alert('Liên hệ', 'Tính năng đang được phát triển'),
    },
    {
      title: 'Báo cáo lỗi',
      icon: 'bug-outline',
      onPress: () => Alert.alert('Báo cáo lỗi', 'Tính năng đang được phát triển'),
    },
    {
      title: 'Đánh giá ứng dụng',
      icon: 'star-outline',
      onPress: () => Alert.alert('Đánh giá', 'Tính năng đang được phát triển'),
    },
  ];

  const renderSettingItem = (item: any, index: number) => (
    <View key={index} style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={item.icon} size={22} color="#007AFF" />
        </View>
        <Text style={styles.settingItemText}>{item.title}</Text>
      </View>
      <View style={styles.settingItemRight}>
        {item.type === 'switch' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#ccc', true: '#007AFF' }}
            thumbColor={item.value ? '#fff' : '#f4f3f4'}
          />
        ) : item.type === 'button' && item.value ? (
          <>
            <Text style={styles.settingValue}>{item.value}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </>
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        )}
      </View>
    </View>
  );

  const renderSupportItem = (item: any, index: number) => (
    <TouchableOpacity key={index} style={styles.settingItem} onPress={item.onPress}>
      <View style={styles.settingItemLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={item.icon} size={22} color="#666" />
        </View>
        <Text style={styles.settingItemText}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Cài đặt</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt chung</Text>
          <View style={styles.sectionContent}>
            {settingsMenuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.settingItem}
                onPress={item.onPress}
                disabled={item.type === 'switch'}
              >
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIcon}>
                    <Ionicons name={item.icon as any} size={22} color="#007AFF" />
                  </View>
                  <Text style={styles.settingItemText}>{item.title}</Text>
                </View>
                <View style={styles.settingItemRight}>
                  {item.type === 'switch' ? (
                    <Switch
                      value={typeof item.value === 'boolean' ? item.value : false}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#ccc', true: '#007AFF' }}
                      thumbColor={item.value ? '#fff' : '#f4f3f4'}
                    />
                  ) : item.type === 'button' && item.value ? (
                    <>
                      <Text style={styles.settingValue}>{item.value}</Text>
                      <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </>
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          <View style={styles.sectionContent}>
            {supportMenuItems.map(renderSupportItem)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.settingIcon, styles.logoutIcon]}>
                  <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
                </View>
                <Text style={[styles.settingItemText, styles.logoutText]}>Đăng xuất</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.settingIcon, styles.deleteIcon]}>
                  <Ionicons name="trash-outline" size={22} color="#FF4444" />
                </View>
                <Text style={[styles.settingItemText, styles.deleteText]}>Xóa tài khoản</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 TKR - Thiết Kế Resort</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  logoutIcon: {
    backgroundColor: '#fff5f5',
  },
  deleteIcon: {
    backgroundColor: '#fff0f0',
  },
  settingItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutText: {
    color: '#FF6B6B',
  },
  deleteText: {
    color: '#FF4444',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;
