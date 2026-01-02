/**
 * Luxury Profile Screen - European Design
 * Sophisticated personal profile with elegant animations
 */

import { LuxuryButton } from '@/components/ui/luxury-button';
import { LuxuryCard } from '@/components/ui/luxury-card';
import { Animations } from '@/constants/animations';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { useSmartBackHandler } from '@/hooks/useBackHandler';
import { useProfile } from '@/hooks/useProfile';
import { resolveAvatar } from '@/utils/avatar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as React from 'react';
import {
    ActivityIndicator,
    Animated,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  badge?: string;
  iconColor?: string;
  showChevron?: boolean;
}

function LuxuryMenuItem({ icon, title, subtitle, onPress, badge, iconColor, showChevron = true }: MenuItemProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

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
      <Animated.View style={[styles.menuItem, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor ? `${iconColor}15` : Colors.light.surfaceMuted }]}>
          <Ionicons name={icon} size={22} color={iconColor || Colors.light.primary} />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.menuRight}>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
          {showChevron && <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function LuxuryProfileScreen() {
  const { user: authUser, signOut, isAuthenticated } = useAuth();
  const { user: profileUser, loading, refresh } = useProfile();
  const [refreshing, setRefreshing] = React.useState(false);

  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useSmartBackHandler();

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Animations.timing.smooth,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: Animations.timing.elegant,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Guest mode
  if (!isAuthenticated && !loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.light.marble, Colors.light.background]}
          style={styles.guestGradient}
        >
          <Animated.View style={[styles.guestContainer, { opacity: fadeAnim }]}>
            <View style={styles.guestIconContainer}>
              <Ionicons name="person-circle-outline" size={120} color={Colors.light.accent} />
            </View>
            <Text style={styles.guestTitle}>Chào mừng bạn</Text>
            <Text style={styles.guestSubtitle}>
              Đăng nhập để trải nghiệm đầy đủ{'\n'}tính năng cao cấp
            </Text>
            <View style={styles.guestButtons}>
              <LuxuryButton
                title="Đăng nhập"
                variant="luxury"
                size="large"
                fullWidth
                onPress={() => router.push('/(auth)/login')}
                icon="log-in-outline"
              />
              <LuxuryButton
                title="Tạo tài khoản"
                variant="outline"
                size="large"
                fullWidth
                onPress={() => router.push('/(auth)/register')}
                icon="person-add-outline"
              />
            </View>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  }

  const user = profileUser || authUser;
  const name = user?.name || user?.phone || user?.email?.split('@')[0] || 'Người dùng';
  const avatar = resolveAvatar(user?.avatar, { userId: user?.id || 'guest', nameFallback: name, size: 120 });
  const role = user?.role || 'Kiến trúc sư';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.light.accent}
            colors={[Colors.light.accent]}
          />
        }
      >
        {/* Luxury Header with Gradient */}
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.secondary]}
          style={styles.headerGradient}
        >
          <Animated.View 
            style={[
              styles.headerContent,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/profile/settings')}>
              <Ionicons name="settings-outline" size={24} color={Colors.light.textInverse} />
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="large" color={Colors.light.accent} />
            ) : (
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                  <View style={styles.avatarBadge}>
                    <Ionicons name="checkmark-circle" size={28} color={Colors.light.accent} />
                  </View>
                </View>
                <Text style={styles.profileName}>{name}</Text>
                <Text style={styles.profileRole}>{role}</Text>
                
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>Dự án</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>48</Text>
                    <Text style={styles.statLabel}>Nhiệm vụ</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>5.0</Text>
                    <Text style={styles.statLabel}>Đánh giá</Text>
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
        </LinearGradient>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/profile/edit')}>
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.light.goldLight }]}>
                <Ionicons name="create-outline" size={20} color={Colors.light.primary} />
              </View>
              <Text style={styles.quickActionText}>Chỉnh sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/profile/portfolio')}>
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.light.goldLight }]}>
                <MaterialCommunityIcons name="briefcase-outline" size={20} color={Colors.light.primary} />
              </View>
              <Text style={styles.quickActionText}>Hồ sơ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/profile/rewards')}>
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.light.goldLight }]}>
                <Ionicons name="gift-outline" size={20} color={Colors.light.primary} />
              </View>
              <Text style={styles.quickActionText}>Ưu đãi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/profile/cloud')}>
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.light.goldLight }]}>
                <Ionicons name="cloud-outline" size={20} color={Colors.light.primary} />
              </View>
              <Text style={styles.quickActionText}>Cloud</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Sections */}
          <LuxuryCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.goldAccent} />
                <Text style={styles.sectionTitle}>Tài khoản & Quản lý</Text>
              </View>
            </View>
            <LuxuryMenuItem
              icon="person-outline"
              title="Thông tin cá nhân"
              subtitle="Cập nhật thông tin của bạn"
              onPress={() => router.push('/profile/info')}
              iconColor={Colors.light.primary}
            />
            <LuxuryMenuItem
              icon="wallet-outline"
              title="Thanh toán & Ví"
              subtitle="Quản lý phương thức thanh toán"
              onPress={() => router.push('/profile/payment')}
              iconColor={Colors.light.accent}
            />
            <LuxuryMenuItem
              icon="location-outline"
              title="Địa chỉ giao hàng"
              subtitle="Quản lý địa chỉ"
              onPress={() => router.push('/profile/addresses')}
              iconColor={Colors.light.secondary}
            />
          </LuxuryCard>

          <LuxuryCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.goldAccent} />
                <Text style={styles.sectionTitle}>Hoạt động</Text>
              </View>
            </View>
            <LuxuryMenuItem
              icon="receipt-outline"
              title="Đơn hàng của tôi"
              subtitle="Theo dõi đơn hàng"
              onPress={() => router.push('/profile/orders')}
              badge="3"
              iconColor={Colors.light.success}
            />
            <LuxuryMenuItem
              icon="heart-outline"
              title="Yêu thích"
              subtitle="Sản phẩm & dịch vụ đã lưu"
              onPress={() => router.push('/profile/favorites')}
              iconColor={Colors.light.error}
            />
            <LuxuryMenuItem
              icon="star-outline"
              title="Đánh giá của tôi"
              subtitle="Xem các đánh giá đã viết"
              onPress={() => router.push('/profile/reviews')}
              iconColor={Colors.light.warning}
            />
          </LuxuryCard>

          <LuxuryCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.goldAccent} />
                <Text style={styles.sectionTitle}>Bảo mật & Riêng tư</Text>
              </View>
            </View>
            <LuxuryMenuItem
              icon="shield-checkmark-outline"
              title="Quyền riêng tư"
              subtitle="Kiểm soát dữ liệu của bạn"
              onPress={() => router.push('/profile/privacy')}
              iconColor={Colors.light.info}
            />
            <LuxuryMenuItem
              icon="lock-closed-outline"
              title="Bảo mật tài khoản"
              subtitle="Mật khẩu & xác thực 2 lớp"
              onPress={() => router.push('/profile/security')}
              iconColor={Colors.light.warning}
            />
            <LuxuryMenuItem
              icon="key-outline"
              title="Quyền truy cập"
              subtitle="Quản lý phân quyền"
              onPress={() => router.push('/profile/permissions')}
              iconColor={Colors.light.secondary}
            />
          </LuxuryCard>

          <LuxuryCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.goldAccent} />
                <Text style={styles.sectionTitle}>Hỗ trợ</Text>
              </View>
            </View>
            <LuxuryMenuItem
              icon="help-circle-outline"
              title="Trung tâm hỗ trợ"
              subtitle="Câu hỏi thường gặp"
              onPress={() => router.push('/profile/help')}
              iconColor={Colors.light.info}
            />
            <LuxuryMenuItem
              icon="document-text-outline"
              title="Điều khoản & Chính sách"
              subtitle="Quy định sử dụng"
              onPress={() => router.push('/legal/terms')}
              iconColor={Colors.light.textMuted}
            />
          </LuxuryCard>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutContainer} onPress={signOut}>
            <LuxuryCard style={styles.logoutCard}>
              <View style={styles.logoutContent}>
                <Ionicons name="log-out-outline" size={22} color={Colors.light.error} />
                <Text style={styles.logoutText}>Đăng xuất</Text>
              </View>
            </LuxuryCard>
          </TouchableOpacity>

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

  // Guest Mode
  guestGradient: {
    flex: 1,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  guestIconContainer: {
    marginBottom: 30,
  },
  guestTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  guestSubtitle: {
    fontSize: 16,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  guestButtons: {
    width: '100%',
    gap: 16,
  },

  // Header
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  settingsButton: {
    position: 'absolute',
    top: 0,
    right: 20,
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.light.accent,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 2,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.textInverse,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  profileRole: {
    fontSize: 15,
    color: Colors.light.goldLight,
    marginBottom: 24,
    letterSpacing: 0.3,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.goldLight,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Content
  content: {
    marginTop: -20,
    paddingHorizontal: 16,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
    letterSpacing: 0.3,
  },

  // Sections
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

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: Colors.light.accent,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  // Logout
  logoutContainer: {
    marginTop: 8,
  },
  logoutCard: {
    borderColor: Colors.light.error + '30',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.error,
    letterSpacing: 0.3,
  },
});
