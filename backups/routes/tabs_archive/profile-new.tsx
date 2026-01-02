import { useAuth } from '@/features/auth';
import { useProfile } from '@/hooks/useProfile';
import { getAvatarUrlFor } from '@/services/profile';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as React from 'react';
import {
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ProfileScreen() {
  const { user: authUser, signOut, isAuthenticated } = useAuth();
  const { user: profileUser, loading, refresh } = useProfile();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Guest mode
  if (!isAuthenticated && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guestContainer}>
          <Ionicons name="person-circle-outline" size={100} color="#A0A0A0" />
          <Text style={styles.guestTitle}>Chưa đăng nhập</Text>
          <Text style={styles.guestSubtitle}>Đăng nhập để trải nghiệm đầy đủ tính năng</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerButtonText}>Tạo tài khoản mới</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const user = profileUser || authUser;
  const name = user?.name || user?.phone || user?.email?.split('@')[0] || 'Người dùng';
  const avatar = user?.avatar || getAvatarUrlFor(user?.id || 'guest', name);
  const role = user?.role || 'Kiến trúc sư - Trang cá nhân';

  const MenuItem = ({
    icon,
    title,
    onPress,
    iconBg = '#E8F5E9',
  }: {
    icon: React.ReactNode;
    title: string;
    onPress?: () => void;
    iconBg?: string;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconContainer, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.menuTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />}
      >
        {/* Header với Avatar */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.userRole}>{role}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={() => {}}>
              <Ionicons name="globe-outline" size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/profile/settings')}>
              <Ionicons name="people-outline" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tiện ích */}
        <View style={styles.section}>
          <SectionHeader title="Tiện ích" />
          <MenuItem
            icon={<MaterialCommunityIcons name="briefcase-outline" size={22} color="#10B981" />}
            title="Hồ sơ năng lực"
            onPress={() => router.push('/profile/portfolio')}
          />
          <MenuItem
            icon={<Ionicons name="cloud-outline" size={22} color="#10B981" />}
            title="Cloud của tôi"
            onPress={() => router.push('/profile/cloud')}
          />
          <MenuItem
            icon={<Ionicons name="wallet-outline" size={22} color="#10B981" />}
            title="Thanh toán"
            onPress={() => router.push('/profile/payment')}
          />
        </View>

        {/* Cá nhân */}
        <View style={styles.section}>
          <SectionHeader title="Cá nhân" />
          <MenuItem
            icon={<Ionicons name="person-outline" size={22} color="#3B82F6" />}
            title="Thông tin cá nhân"
            iconBg="#EFF6FF"
            onPress={() => router.push('/profile/info')}
          />
          <MenuItem
            icon={<Ionicons name="shield-checkmark-outline" size={22} color="#8B5CF6" />}
            title="Quyền riêng tư"
            iconBg="#F5F3FF"
            onPress={() => router.push('/profile/privacy')}
          />
          <MenuItem
            icon={<Ionicons name="lock-closed-outline" size={22} color="#F59E0B" />}
            title="Tài khoản bảo mật"
            iconBg="#FEF3C7"
            onPress={() => router.push('/profile/security')}
          />
          <MenuItem
            icon={<Ionicons name="settings-outline" size={22} color="#6B7280" />}
            title="Cài đặt chung"
            iconBg="#F3F4F6"
            onPress={() => router.push('/profile/settings')}
          />
        </View>

        {/* Hỗ trợ */}
        <View style={styles.section}>
          <SectionHeader title="Hỗ trợ" />
          <MenuItem
            icon={<Ionicons name="help-circle-outline" size={22} color="#EC4899" />}
            title="Trung tâm hỗ trợ"
            iconBg="#FCE7F3"
            onPress={() => router.push('/communications')}
          />
          <MenuItem
            icon={<Ionicons name="document-text-outline" size={22} color="#06B6D4" />}
            title="Điều khoản và chính sách"
            iconBg="#CFFAFE"
            onPress={() => router.push('/legal/terms')}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 12,
    paddingHorizontal: 48,
    paddingVertical: 14,
  },
  registerButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  userRole: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
