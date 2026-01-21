/**
 * User Profile View - Zalo-style with Message & Call Actions
 * View another user's profile with messaging and calling options
 * @route /profile/[userId]
 */

import Avatar from '@/components/ui/avatar';
import type { UserProfile } from '@/services/api/users.service';
import { getUserById } from '@/services/api/users.service';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Linking,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Zalo-inspired color scheme
const COLORS = {
  primary: '#0068FF',
  primaryDark: '#0052CC',
  primaryLight: '#E8F2FF',
  secondary: '#00B14F',
  danger: '#FF3B30',
  warning: '#FF9500',
  background: '#F5F6F8',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#8E8E93',
  textMuted: '#C7C7CC',
  border: '#E5E5EA',
  online: '#34C759',
  offline: '#8E8E93',
  gradientStart: '#0068FF',
  gradientEnd: '#00C3FF',
};

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user from database via API service
      console.log('[Profile] Fetching user from database:', userId);
      const userData = await getUserById(userId || '1');
      setUser(userData);
      
      // Animate content in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (err) {
      console.error('[Profile] Error loading user:', err);
      setError('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    router.push(`/messages/${userId}`);
  };

  const handleVoiceCall = () => {
    // Gọi thoại trực tiếp trong app
    router.push(`/call/${userId}?type=voice`);
  };

  const handleVideoCall = () => {
    // Gọi video trực tiếp trong app
    router.push(`/call/${userId}?type=video`);
  };

  // Tất cả cuộc gọi đều thực hiện trong app
  const handleInAppCall = (callType: 'voice' | 'video' = 'voice') => {
    router.push(`/call/${userId}?type=${callType}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Xem hồ sơ của ${user?.name} trên app`,
        title: user?.name,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleAddFriend = () => {
    Alert.alert(
      'Kết bạn',
      `Gửi lời mời kết bạn đến ${user?.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Gửi', style: 'default' },
      ]
    );
  };

  const handleBlock = () => {
    Alert.alert(
      'Chặn người dùng',
      `Bạn có chắc muốn chặn ${user?.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Chặn', 
          style: 'destructive',
        },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      'Báo cáo',
      'Chọn lý do báo cáo',
      [
        { text: 'Spam', onPress: () => {} },
        { text: 'Nội dung không phù hợp', onPress: () => {} },
        { text: 'Giả mạo', onPress: () => {} },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Vừa truy cập';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 5) return 'Vừa truy cập';
    if (diffMins < 60) return `Truy cập ${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Truy cập ${diffHours} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.danger} />
          <Text style={styles.errorText}>{error || 'Không tìm thấy người dùng'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchUserProfile}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Navigation Bar */}
          <View style={styles.navBar}>
            <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.navActions}>
              <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.navBtn} 
                onPress={() => {
                  Alert.alert('Tùy chọn', '', [
                    { text: 'Chặn người này', onPress: handleBlock, style: 'destructive' },
                    { text: 'Báo cáo', onPress: handleReport },
                    { text: 'Hủy', style: 'cancel' },
                  ]);
                }}
              >
                <Ionicons name="ellipsis-horizontal" size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Header */}
          <Animated.View 
            style={[
              styles.profileHeader,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Avatar
                avatar={user.avatar}
                userId={String(user.id)}
                name={user.name}
                pixelSize={100}
              />
              {/* Online Status Indicator */}
              <View style={[
                styles.onlineIndicator,
                { backgroundColor: user.online ? COLORS.online : COLORS.offline }
              ]} />
              {/* Verified Badge */}
              {user.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                </View>
              )}
            </View>

            {/* Name & Status */}
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userStatus}>
              {user.online ? 'Đang hoạt động' : formatLastSeen(user.lastSeen)}
            </Text>

            {/* Quick Stats */}
            {(user as any).stats?.mutualFriends !== undefined && (user as any).stats.mutualFriends > 0 && (
              <View style={styles.mutualFriendsRow}>
                <Ionicons name="people" size={14} color={COLORS.white} />
                <Text style={styles.mutualFriendsText}>
                  {(user as any).stats?.mutualFriends} bạn chung
                </Text>
              </View>
            )}
          </Animated.View>
        </LinearGradient>

        {/* Action Buttons - Like Zalo */}
        <View style={styles.actionContainer}>
          <View style={styles.actionRow}>
            {/* Message Button */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleMessage}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="chatbubble" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.actionLabel}>Nhắn tin</Text>
            </TouchableOpacity>

            {/* Voice Call Button */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleVoiceCall}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: COLORS.secondary }]}>
                <Ionicons name="call" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.actionLabel}>Gọi thoại</Text>
            </TouchableOpacity>

            {/* Video Call Button */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleVideoCall}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: '#666666' }]}>
                <Ionicons name="videocam" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.actionLabel}>Gọi video</Text>
            </TouchableOpacity>

            {/* Gọi nhanh - in-app call */}
            {user.phone && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleInAppCall('voice')}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconWrapper, { backgroundColor: COLORS.warning }]}>
                  <Ionicons name="call" size={24} color={COLORS.white} />
                </View>
                <Text style={styles.actionLabel}>Gọi nhanh</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Add Friend / Message Row */}
          {!(user as any).isFriend && (
            <TouchableOpacity 
              style={styles.addFriendBtn}
              onPress={handleAddFriend}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add" size={20} color={COLORS.white} />
              <Text style={styles.addFriendText}>Kết bạn</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

          {/* Role & Company */}
          {(user.role || user.company) && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="briefcase-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Công việc</Text>
                  <Text style={styles.infoValue}>
                    {user.role}{user.company ? ` tại ${user.company}` : ''}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Bio */}
          {user.bio && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Giới thiệu</Text>
                  <Text style={styles.infoValue}>{user.bio}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Phone - In-app call */}
          {user.phone && (
            <View style={styles.infoCard}>
              <TouchableOpacity style={styles.infoRow} onPress={() => handleInAppCall('voice')}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="call-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Số điện thoại</Text>
                  <Text style={[styles.infoValue, styles.linkText]}>{user.phone}</Text>
                </View>
                <View style={styles.callBtnRow}>
                  <TouchableOpacity 
                    style={styles.miniCallBtn}
                    onPress={() => handleInAppCall('voice')}
                  >
                    <Ionicons name="call" size={18} color={COLORS.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.miniCallBtn}
                    onPress={() => handleInAppCall('video')}
                  >
                    <Ionicons name="videocam" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Email */}
          {user.email && (
            <View style={styles.infoCard}>
              <TouchableOpacity 
                style={styles.infoRow}
                onPress={() => Linking.openURL(`mailto:${user.email}`)}
              >
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={[styles.infoValue, styles.linkText]}>{user.email}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats Section - For Construction App */}
        {((user as any).projects || user.rating) && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Thống kê</Text>
            <View style={styles.statsRow}>
              {(user as any).projects && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{(user as any).projects}</Text>
                  <Text style={styles.statLabel}>Dự án</Text>
                </View>
              )}
              {user.rating && (
                <View style={styles.statItem}>
                  <View style={styles.ratingRow}>
                    <Text style={styles.statValue}>{user.rating}</Text>
                    <Ionicons name="star" size={18} color={COLORS.warning} />
                  </View>
                  <Text style={styles.statLabel}>Đánh giá</Text>
                </View>
              )}
              {(user as any).mutualFriends !== undefined && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{(user as any).mutualFriends}</Text>
                  <Text style={styles.statLabel}>Bạn chung</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Message Button */}
      <TouchableOpacity 
        style={styles.floatingBtn}
        onPress={handleMessage}
        activeOpacity={0.9}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Header Gradient
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 30,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  navBtn: {
    padding: 8,
  },
  navActions: {
    flexDirection: 'row',
    gap: 4,
  },
  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 8,
  },
  mutualFriendsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  mutualFriendsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  // Action Buttons
  actionContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  addFriendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    gap: 8,
  },
  addFriendText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Info Section
  infoSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 20,
  },
  linkText: {
    color: COLORS.primary,
  },
  // Call buttons in info row
  callBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Stats Section
  statsSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // Floating Button
  floatingBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
