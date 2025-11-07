import { ThemedView } from '@/components/themed-view';
import { Container } from '@/components/ui/container';
import { MenuItem as ThemedMenuItem } from '@/components/ui/menu-item';
import { ProfileCompletionStatus } from '@/components/ui/ProfileCompletionStatus';
import { ProfileSuggestions } from '@/components/ui/ProfileSuggestions';
import { Section } from '@/components/ui/section';
import { SurfaceCard } from '@/components/ui/surface-card';
import { useAuth } from '@/features/auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSmartBackHandler } from '@/hooks/useBackHandler';
import { useProfile } from '@/hooks/useProfile';
import { resolveAvatar } from '@/utils/avatar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function TrangCaNhan() {
  const { user: authUser, signOut, isAuthenticated } = useAuth();
  const { user: profileUser, loading, refresh } = useProfile();
  const [refreshing, setRefreshing] = React.useState(false);

  // Theme tokens
  const bg = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');
  const textInverse = useThemeColor({}, 'textInverse');
  const info = useThemeColor({}, 'info');
  const warning = useThemeColor({}, 'warning');
  const secondary = useThemeColor({}, 'secondary');
  const iconColor = useThemeColor({}, 'icon');
  const surfaceMuted = useThemeColor({}, 'surfaceMuted');

  // Smart back handler
  useSmartBackHandler();

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Guest mode: Show login prompt if not authenticated
  if (!isAuthenticated && !loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <ThemedView style={styles.guestContainer}>
          <Ionicons name="person-circle-outline" size={100} color={textMuted} />
          <Text style={[styles.guestTitle, { color: text } ]}>Chưa đăng nhập</Text>
          <Text style={[styles.guestSubtitle, { color: textMuted } ]}>
            Đăng nhập để trải nghiệm đầy đủ tính năng
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: primary }]}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={[styles.loginButtonText, { color: textInverse }]}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.registerButton, { borderColor: primary, backgroundColor: surface }]}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.8}
          >
            <Text style={[styles.registerButtonText, { color: primary }]}>Tạo tài khoản mới</Text>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const user = profileUser || authUser;
  const name = user?.name || user?.phone || user?.email?.split('@')[0] || 'Người dùng';
  const avatar = resolveAvatar(user?.avatar, { userId: user?.id || 'guest', nameFallback: name, size: 120 });
  const role = user?.role || 'Kiến trúc sư - Trang cá nhân';

  const MenuItem = ({ icon, text, onPress, iconBg = surfaceMuted }: { icon: React.ReactNode; text: string; onPress?: () => void; iconBg?: string }) => (
    <ThemedMenuItem icon={icon} text={text} onPress={onPress} iconBg={iconBg} />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <ThemedView style={{ flex: 1 }}>
      <Container
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primary]} />
        }
      >
        {/* Header với Avatar */}
        <View style={[styles.header, { backgroundColor: surface }]}>
          <View style={styles.headerContent}>
            {loading && !user ? (
              <ActivityIndicator size="large" color={primary} />
            ) : (
              <>
                <TouchableOpacity
                  onLongPress={() => {
                    if (__DEV__) {
                      router.push('/utilities/api-diagnostics');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: avatar }} style={[styles.avatar, { backgroundColor: border }]} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                  <Text style={[styles.userName, { color: text }]}>{name}</Text>
                  <Text style={[styles.userRole, { color: textMuted }]}>{role}</Text>
                </View>
              </>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: surface }]} onPress={() => {}}>
              <Ionicons name="globe-outline" size={24} color={text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: surface }]} onPress={() => router.push('/profile/settings')}>
              <Ionicons name="settings-outline" size={24} color={text} />
            </TouchableOpacity>
          </View>
        </View>

  {/* Profile completion and suggestions */}
  <ProfileCompletionStatus />
  <ProfileSuggestions />

        {/* Tiện ích */}
        <SurfaceCard style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <Section title="Tiện ích">
            <MenuItem 
              icon={<MaterialCommunityIcons name="briefcase-outline" size={22} color={primary} />} 
              text="Hồ sơ năng lực" 
              onPress={() => router.push('/profile/portfolio')}
            />
            <MenuItem 
              icon={<Ionicons name="cloud-outline" size={22} color={primary} />} 
              text="Cloud của tôi" 
              onPress={() => router.push('/profile/cloud')}
            />
            <MenuItem 
              icon={<Ionicons name="wallet-outline" size={22} color={primary} />} 
              text="Thanh toán" 
              onPress={() => router.push('/profile/payment')}
            />
          </Section>
        </SurfaceCard>

        {/* Cá nhân */}
        <SurfaceCard style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <Section title="Cá nhân">
            <MenuItem 
              icon={<Ionicons name="person-outline" size={22} color={info} />} 
              text="Thông tin cá nhân" 
              iconBg={surfaceMuted}
              onPress={() => router.push('/profile/info')} 
            />
            <MenuItem 
              icon={<Ionicons name="shield-checkmark-outline" size={22} color={secondary} />} 
              text="Quyền riêng tư" 
              iconBg={surfaceMuted}
              onPress={() => router.push('/profile/privacy')} 
            />
            <MenuItem 
              icon={<Ionicons name="lock-closed-outline" size={22} color={warning} />} 
              text="Tài khoản bảo mật" 
              iconBg={surfaceMuted}
              onPress={() => router.push('/profile/security')} 
            />
            <MenuItem 
              icon={<Ionicons name="settings-outline" size={22} color={iconColor} />} 
              text="Cài đặt chung" 
              iconBg={surfaceMuted}
              onPress={() => router.push('/profile/settings')} 
            />
          </Section>
        </SurfaceCard>

        {/* Hỗ trợ */}
        <SurfaceCard style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <Section title="Hỗ trợ">
            <MenuItem 
              icon={<Ionicons name="help-circle-outline" size={22} color={info} />} 
              text="Trung tâm hỗ trợ" 
              iconBg={surfaceMuted}
              onPress={() => router.push('/communications')} 
            />
            <MenuItem 
              icon={<Ionicons name="document-text-outline" size={22} color={info} />} 
              text="Điều khoản và chính sách" 
              iconBg={surfaceMuted}
              onPress={() => router.push('/legal/terms')} 
            />
          </Section>
        </SurfaceCard>

        {/* Developer Tools (Only in __DEV__) */}
        {__DEV__ && (
          <SurfaceCard style={{ marginHorizontal: 16, marginBottom: 12 }}>
            <Section title="🧪 Developer Tools">
              <MenuItem 
                icon={<Ionicons name="flask-outline" size={22} color={warning} />} 
                text="Demo Thông Báo (NEW)" 
                iconBg={surfaceMuted}
                onPress={() => router.push('/demo/notification-demo')} 
              />
              <MenuItem 
                icon={<Ionicons name="bug-outline" size={22} color={secondary} />} 
                text="API Diagnostics" 
                iconBg={surfaceMuted}
                onPress={() => router.push('/utilities/api-diagnostics')} 
              />
            </Section>
          </SurfaceCard>
        )}

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: surface }]} onPress={signOut}>
          <Ionicons name="log-out-outline" size={22} color={errorColor} />
          <Text style={[styles.logoutText, { color: textMuted }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </Container>
    </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gradientHeader: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#e5e7eb',
    marginBottom: 12,
  },
  userNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userRoleLarge: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginTop: -28,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  menuSection: { 
    backgroundColor: '#fff', 
    marginTop: 0, 
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileItem: {},
  profileItemLeft: {},
  profileItemText: {},
  logoutButton: {
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: { 
    fontSize: 16, 
    fontWeight: '600',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: 'transparent',
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    width: '100%',
    backgroundColor: undefined,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: undefined,
  },
  // New styles for redesigned profile
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconContainer: {},
});
 
