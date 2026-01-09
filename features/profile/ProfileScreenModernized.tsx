/**
 * Profile Screen - Modernized with Nordic Green Theme
 * Shopee/Grab style with stats cards, sections, settings
 * Updated: 09/01/2026 - Added Avatar Upload
 */

import { MODERN_COLORS, MODERN_RADIUS, MODERN_SHADOWS, MODERN_SPACING, MODERN_TYPOGRAPHY } from '@/constants/modern-theme';
import { useAuth } from '@/features/auth';
import { apiFetch } from '@/services/api';
import avatarService, { AvatarUploadProgress } from '@/services/avatarService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProfileScreenModernized() {
  const { user, signOut, isAuthenticated, updateAvatar } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: () => signOut()
        },
      ]
    );
  };

  const handlePrivacySettings = async () => {
    try {
      const settings = await apiFetch('/user/privacy-settings');
      console.log('[Profile] Privacy settings:', settings);
      Alert.alert('Quyền riêng tư', 'Tính năng quản lý quyền riêng tư đang phát triển');
    } catch (error: any) {
      console.error('[Profile] Privacy error:', error);
      Alert.alert('Lỗi', 'Không thể tải cài đặt quyền riêng tư');
    }
  };

  const handleUsageAnalytics = async () => {
    try {
      const analytics = await apiFetch('/user/analytics');
      console.log('[Profile] Usage analytics:', analytics);
      Alert.alert(
        'Thống kê sử dụng',
        `Dự án: ${analytics.projectCount || 0}\nHoạt động: ${analytics.activityCount || 0}\nThời gian: ${analytics.totalHours || 0}h`
      );
    } catch (error: any) {
      console.error('[Profile] Analytics error:', error);
      Alert.alert('Lỗi', 'Không thể tải thống kê sử dụng');
    }
  };

  const handleEditAccount = () => {
    router.push('/profile/edit');
  };

  // ==================== AVATAR UPLOAD ====================
  const handleAvatarUpload = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Hủy', 'Chụp ảnh', 'Chọn từ thư viện', 'Xóa ảnh hiện tại'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
          title: 'Thay đổi ảnh đại diện',
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await uploadFromCamera();
          } else if (buttonIndex === 2) {
            await uploadFromGallery();
          } else if (buttonIndex === 3) {
            await deleteCurrentAvatar();
          }
        }
      );
    } else {
      Alert.alert(
        'Thay đổi ảnh đại diện',
        'Chọn phương thức',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Chụp ảnh', onPress: uploadFromCamera },
          { text: 'Chọn từ thư viện', onPress: uploadFromGallery },
          { 
            text: 'Xóa ảnh hiện tại', 
            style: 'destructive', 
            onPress: deleteCurrentAvatar 
          },
        ]
      );
    }
  };

  const uploadFromCamera = async () => {
    try {
      setAvatarUploading(true);
      setUploadProgress(0);
      
      const result = await avatarService.pickAndUpload(
        'camera',
        { maxSizeMB: 2, compressQuality: 0.8 },
        (progress: AvatarUploadProgress) => setUploadProgress(progress.percentage)
      );
      
      if (result.success && result.url) {
        // Update user context với avatar mới
        await updateAvatar(result.url);
        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
      } else if (result.error) {
        Alert.alert('Lỗi', result.error);
      }
    } catch (error: any) {
      console.error('[Profile] Camera upload error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể chụp ảnh');
    } finally {
      setAvatarUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadFromGallery = async () => {
    try {
      setAvatarUploading(true);
      setUploadProgress(0);
      
      const result = await avatarService.pickAndUpload(
        'gallery',
        { maxSizeMB: 2, compressQuality: 0.8 },
        (progress: AvatarUploadProgress) => setUploadProgress(progress.percentage)
      );
      
      if (result.success && result.url) {
        // Update user context với avatar mới
        await updateAvatar(result.url);
        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
      } else if (result.error) {
        Alert.alert('Lỗi', result.error);
      }
    } catch (error: any) {
      console.error('[Profile] Gallery upload error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể chọn ảnh');
    } finally {
      setAvatarUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteCurrentAvatar = async () => {
    Alert.alert(
      'Xóa ảnh đại diện',
      'Bạn có chắc muốn xóa ảnh đại diện hiện tại?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setAvatarUploading(true);
              const result = await avatarService.delete();
              if (result.success) {
                await updateAvatar('');
                Alert.alert('Thành công', 'Đã xóa ảnh đại diện');
              } else {
                Alert.alert('Lỗi', result.error || 'Không thể xóa ảnh');
              }
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa ảnh');
            } finally {
              setAvatarUploading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Xóa tài khoản',
      'Bạn có chắc muốn xóa tài khoản? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch('/user/account', { method: 'DELETE' });
              Alert.alert('Thành công', 'Đã xóa tài khoản', [
                { text: 'OK', onPress: () => signOut() },
              ]);
            } catch (error: any) {
              console.error('[Profile] Delete account error:', error);
              Alert.alert('Lỗi', error.detail || 'Không thể xóa tài khoản');
            }
          },
        },
      ]
    );
  };

  const handleReportUser = (userId: string) => {
    Alert.alert(
      'Báo cáo người dùng',
      'Vui lòng chọn lý do báo cáo',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Spam',
          onPress: async () => {
            try {
              await apiFetch('/user/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, reason: 'spam' }),
              });
              Alert.alert('Thành công', 'Đã gửi báo cáo');
            } catch (error: any) {
              console.error('[Profile] Report error:', error);
              Alert.alert('Lỗi', 'Không thể gửi báo cáo');
            }
          },
        },
        {
          text: 'Lừa đảo',
          onPress: async () => {
            try {
              await apiFetch('/user/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, reason: 'fraud' }),
              });
              Alert.alert('Thành công', 'Đã gửi báo cáo');
            } catch (error: any) {
              console.error('[Profile] Report error:', error);
              Alert.alert('Lỗi', 'Không thể gửi báo cáo');
            }
          },
        },
      ]
    );
  };

  const handleBlockUser = async (userId: string) => {
    Alert.alert(
      'Chặn người dùng',
      'Bạn có chắc muốn chặn người dùng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chặn',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch('/user/block', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
              });
              Alert.alert('Thành công', 'Đã chặn người dùng');
            } catch (error: any) {
              console.error('[Profile] Block error:', error);
              Alert.alert('Lỗi', 'Không thể chặn người dùng');
            }
          },
        },
      ]
    );
  };

  // Guest mode
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={MODERN_COLORS.background} />
        <View style={styles.guestContainer}>
          <Ionicons name="person-circle-outline" size={100} color={MODERN_COLORS.textSecondary} />
          <Text style={styles.guestTitle}>Chưa đăng nhập</Text>
          <Text style={styles.guestSubtitle}>
            Đăng nhập để trải nghiệm đầy đủ tính năng
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Tạo tài khoản mới</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const name = user?.name || user?.email?.split('@')[0] || 'Người dùng';
  const email = user?.email || '';
  const role = user?.role === 'ADMIN' ? 'Quản trị viên' : 
               user?.role === 'ENGINEER' ? 'Kỹ sư' : 'Khách hàng';

  const renderStatCard = (icon: string, value: string, label: string, color: string) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderMenuItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    color: string = MODERN_COLORS.text
  ) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: MODERN_COLORS.primaryBg }]}>
          <Ionicons name={icon as any} size={22} color={MODERN_COLORS.primary} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, { color }]}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={MODERN_COLORS.textSecondary} />
    </TouchableOpacity>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={MODERN_COLORS.background} />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[MODERN_COLORS.primary]}
            tintColor={MODERN_COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Tài khoản</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color={MODERN_COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              {/* Avatar with Image or Initial */}
              {user?.avatar ? (
                <Image 
                  source={{ uri: user.avatar }} 
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{name[0].toUpperCase()}</Text>
                </View>
              )}
              
              {/* Upload Progress Overlay */}
              {avatarUploading && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                  {uploadProgress > 0 && (
                    <Text style={styles.uploadProgressText}>{uploadProgress}%</Text>
                  )}
                </View>
              )}
              
              {/* Edit Button */}
              <TouchableOpacity 
                style={styles.avatarEditButton}
                onPress={handleAvatarUpload}
                disabled={avatarUploading}
              >
                <Ionicons name="camera" size={16} color={MODERN_COLORS.surface} />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{email}</Text>
            
            {/* User ID Display */}
            <View style={styles.userIdBadge}>
              <Ionicons name="finger-print-outline" size={12} color={MODERN_COLORS.textSecondary} />
              <Text style={styles.userIdText}>ID: {user?.id?.slice(0, 8) || 'N/A'}</Text>
            </View>
            
            {/* Phone Number */}
            {user?.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={14} color={MODERN_COLORS.textSecondary} />
                <Text style={styles.infoText}>{user.phone}</Text>
              </View>
            )}
            
            {/* Location */}
            {user?.location?.address && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={14} color={MODERN_COLORS.textSecondary} />
                <Text style={styles.infoText}>{user.location.address}</Text>
              </View>
            )}
            
            <View style={styles.roleBadge}>
              <Ionicons name="briefcase-outline" size={14} color={MODERN_COLORS.primary} />
              <Text style={styles.roleText}>{role}</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {renderStatCard('folder-outline', '12', 'Dự án', MODERN_COLORS.primary)}
            {renderStatCard('checkmark-done-outline', '8', 'Hoàn thành', MODERN_COLORS.success)}
            {renderStatCard('time-outline', '4', 'Đang làm', MODERN_COLORS.warning)}
          </View>
        </View>

        {/* Menu Sections */}
        {/* Quick Actions - Zalo Style */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Liên lạc nhanh</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/communications')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#0068FF' }]}>
                <Ionicons name="chatbubbles" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionLabel}>Tin nhắn</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/call/history')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#00B14F' }]}>
                <Ionicons name="call" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionLabel}>Cuộc gọi</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/messages')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#666666' }]}>
                <Ionicons name="people" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionLabel}>Danh bạ</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/profile/history')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="time" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionLabel}>Lịch sử</Text>
            </TouchableOpacity>
          </View>
        </View>

        {renderSection('Tài khoản', (
          <>
            {renderMenuItem('person-outline', 'Thông tin cá nhân', 'Cập nhật thông tin của bạn', handleEditAccount)}
            {renderMenuItem('lock-closed-outline', 'Đổi mật khẩu', 'Bảo mật tài khoản')}
            {renderMenuItem('notifications-outline', 'Thông báo', 'Quản lý thông báo')}
            {renderMenuItem('trash-outline', 'Xóa tài khoản', 'Xóa vĩnh viễn tài khoản', handleDeleteAccount, MODERN_COLORS.danger)}
          </>
        ))}

        {renderSection('Dự án', (
          <>
            {renderMenuItem('folder-open-outline', 'Dự án của tôi', '12 dự án đang quản lý')}
            {renderMenuItem('star-outline', 'Dự án yêu thích', '5 dự án')}
            {renderMenuItem('time-outline', 'Lịch sử hoạt động', 'Xem hoạt động gần đây', handleUsageAnalytics)}
          </>
        ))}
        
        {renderSection('File & Media', (
          <>
            {renderMenuItem(
              'cloud-upload-outline', 
              'Upload & Download Test', 
              'Test upload file/video và get link',
              () => router.push('/profile/file-upload-demo'),
              MODERN_COLORS.primary
            )}
            {renderMenuItem('folder-outline', 'File Manager', 'Quản lý file đã upload')}
          </>
        ))}

        {renderSection('Developer Tools', (
          <>
            {renderMenuItem(
              'cloud-done-outline', 
              'Test CRM Sync', 
              'Test Perfex CRM data integration',
              () => router.push('/(tabs)/test-crm'),
              MODERN_COLORS.success
            )}
          </>
        ))}

        {renderSection('Cài đặt', (
          <>
            {renderMenuItem('language-outline', 'Ngôn ngữ', 'Tiếng Việt')}
            {renderMenuItem('moon-outline', 'Giao diện tối', 'Tắt')}
            {renderMenuItem('shield-checkmark-outline', 'Quyền riêng tư', 'Quản lý quyền riêng tư', handlePrivacySettings)}
          </>
        ))}

        {renderSection('Hỗ trợ', (
          <>
            {renderMenuItem('help-circle-outline', 'Trung tâm trợ giúp', 'Câu hỏi thường gặp')}
            {renderMenuItem('chatbubble-outline', 'Liên hệ hỗ trợ', 'Gửi phản hồi')}
            {renderMenuItem('document-text-outline', 'Điều khoản dịch vụ', 'Chính sách & điều khoản')}
          </>
        ))}

        {/* Sign Out Button */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={MODERN_COLORS.danger} />
            <Text style={styles.signOutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.version}>Phiên bản 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: MODERN_SPACING.xl,
  },
  guestTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xxl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.lg,
    marginBottom: MODERN_SPACING.sm,
  },
  guestSubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: MODERN_SPACING.xxxl,
  },
  loginButton: {
    width: '100%',
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: MODERN_RADIUS.md,
    paddingVertical: MODERN_SPACING.md,
    alignItems: 'center',
    marginBottom: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  loginButtonText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.surface,
  },
  registerButton: {
    width: '100%',
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    paddingVertical: MODERN_SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MODERN_COLORS.primary,
  },
  registerButtonText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.primary,
  },
  header: {
    backgroundColor: MODERN_COLORS.surface,
    paddingTop: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.xl,
    marginBottom: MODERN_SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.lg,
    marginBottom: MODERN_SPACING.lg,
  },
  headerTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xxl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
  },
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: MODERN_SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: MODERN_SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...MODERN_SHADOWS.md,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: MODERN_COLORS.background,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadProgressText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    marginTop: 2,
  },
  avatarText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xxxl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.surface,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MODERN_COLORS.surface,
  },
  userName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.xxs,
  },
  userEmail: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.sm,
  },
  userIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MODERN_COLORS.background,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.sm,
    marginBottom: MODERN_SPACING.xs,
  },
  userIdText: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xs,
    marginBottom: MODERN_SPACING.xs,
  },
  infoText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.xxs,
    backgroundColor: MODERN_COLORS.primaryBg,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.full,
    marginTop: MODERN_SPACING.sm,
  },
  roleText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: MODERN_SPACING.lg,
    marginTop: MODERN_SPACING.xl,
    gap: MODERN_SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: MODERN_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: MODERN_SPACING.sm,
  },
  statValue: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.xxs,
  },
  statLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
  },
  section: {
    marginBottom: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.lg,
  },
  sectionTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.sm,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    overflow: 'hidden',
    ...MODERN_SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: MODERN_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: MODERN_SPACING.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.text,
  },
  menuSubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.xxs,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    paddingVertical: MODERN_SPACING.md,
    borderWidth: 1,
    borderColor: MODERN_COLORS.danger + '30',
  },
  signOutText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.danger,
  },
  version: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
    textAlign: 'center',
    marginTop: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.xxxl,
  },
  // Quick Actions - Zalo Style
  quickActionsSection: {
    marginBottom: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.lg,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    paddingVertical: MODERN_SPACING.lg,
    paddingHorizontal: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: MODERN_SPACING.sm,
  },
  quickActionLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.text,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
});
