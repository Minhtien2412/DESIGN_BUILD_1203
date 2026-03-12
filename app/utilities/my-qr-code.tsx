/**
 * My QR Code Screen - Zalo/Shopee/MoMo Style
 * User identity QR for profile sharing & scanning
 * @updated 2025-12-24
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Platform,
    Pressable,
    Share,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated, {
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.55;

// Zalo-style colors
const COLORS = {
  primary: '#0068FF',
  primaryDark: '#0055CC',
  bg: '#F0F2F5',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#65676B',
  textMuted: '#8A8D91',
  border: '#E4E6EB',
  success: '#31A24C',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MyQRCodeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'myQR' | 'scan'>('myQR');

  // Generate QR data - unique user identifier
  const qrData = user ? JSON.stringify({
    type: 'USER_PROFILE',
    userId: user.id,
    name: user.name || user.email?.split('@')[0],
    app: 'ThietKeResort',
    v: 1,
  }) : '';

  const handleShare = async () => {
    if (!user) return;
    try {
      await Share.share({
        message: `Quét mã QR để xem hồ sơ của tôi trên ThietKeResort\n\nhoặc truy cập: https://app.thietkeresort.com.vn/profile/${user.id}`,
        title: `Hồ sơ ${user.name || 'Người dùng'}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSave = () => {
    Alert.alert('Lưu QR', 'Mã QR đã được lưu vào thư viện ảnh', [{ text: 'OK' }]);
  };

  const handleScan = () => {
    router.push('/utilities/qr-scanner' as any);
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.headerGradient}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Mã QR của tôi</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Ionicons name="log-in-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Vui lòng đăng nhập để xem mã QR</Text>
          <Pressable style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const userName = user.name || user.email?.split('@')[0] || 'Người dùng';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header with Gradient */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.headerGradient}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mã QR của tôi</Text>
        <Pressable onPress={handleShare} style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={22} color="#fff" />
        </Pressable>
      </LinearGradient>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'myQR' && styles.tabActive]}
          onPress={() => setActiveTab('myQR')}
        >
          <Ionicons
            name="qr-code-outline"
            size={20}
            color={activeTab === 'myQR' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'myQR' && styles.tabTextActive]}>
            Mã của tôi
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'scan' && styles.tabActive]}
          onPress={() => setActiveTab('scan')}
        >
          <Ionicons
            name="scan-outline"
            size={20}
            color={activeTab === 'scan' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'scan' && styles.tabTextActive]}>
            Quét mã
          </Text>
        </Pressable>
      </View>

      {activeTab === 'myQR' ? (
        <Animated.View entering={FadeIn} style={styles.content}>
          {/* QR Card - Zalo Style */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.qrCard}>
            {/* User Info */}
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    style={styles.avatarPlaceholder}
                  >
                    <Text style={styles.avatarText}>{userInitial}</Text>
                  </LinearGradient>
                )}
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={10} color="#fff" />
                </View>
              </View>
              <Text style={styles.userName}>{userName}</Text>
              {user.role && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{user.role}</Text>
                </View>
              )}
            </View>

            {/* QR Code */}
            <View style={styles.qrWrapper}>
              <View style={styles.qrBackground}>
                <QRCode
                  value={qrData}
                  size={QR_SIZE}
                  color={COLORS.text}
                  backgroundColor="#fff"
                  logo={require('../../assets/images/icon.png')}
                  logoSize={QR_SIZE * 0.22}
                  logoBackgroundColor="#fff"
                  logoMargin={4}
                  logoBorderRadius={8}
                />
              </View>
              {/* Corner decorations */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>

            {/* User ID */}
            <View style={styles.idSection}>
              <Text style={styles.idLabel}>ID:</Text>
              <Text style={styles.idValue}>{user.id?.slice(0, 12) || 'N/A'}</Text>
            </View>

            {/* Hint */}
            <Text style={styles.hint}>Đưa mã này cho bạn bè để được thêm bạn</Text>
          </Animated.View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <ActionButton
              icon="download-outline"
              label="Lưu ảnh"
              onPress={handleSave}
              delay={200}
            />
            <ActionButton
              icon="share-social-outline"
              label="Chia sẻ"
              onPress={handleShare}
              delay={250}
              primary
            />
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn} style={styles.scanContent}>
          <View style={styles.scanPlaceholder}>
            <View style={styles.scanFrame}>
              <View style={[styles.scanCorner, styles.scanCornerTL]} />
              <View style={[styles.scanCorner, styles.scanCornerTR]} />
              <View style={[styles.scanCorner, styles.scanCornerBL]} />
              <View style={[styles.scanCorner, styles.scanCornerBR]} />
              <Ionicons name="scan" size={80} color={COLORS.primary} />
            </View>
            <Text style={styles.scanHint}>Đặt mã QR vào khung để quét</Text>
            <Pressable style={styles.openCameraBtn} onPress={handleScan}>
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.openCameraText}>Mở Camera</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// Action Button Component
const ActionButton = ({
  icon,
  label,
  onPress,
  primary = false,
  delay = 0,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  primary?: boolean;
  delay?: number;
}) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <AnimatedPressable
        style={[
          styles.actionBtn,
          primary ? styles.actionBtnPrimary : styles.actionBtnSecondary,
          animStyle,
        ]}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95); }}
        onPressOut={() => { scale.value = withSpring(1); }}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={primary ? '#fff' : COLORS.primary}
        />
        <Text style={[styles.actionBtnText, primary && styles.actionBtnTextPrimary]}>
          {label}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  shareBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.bg,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // QR Card
  qrCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },

  // User Section
  userSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  roleBadge: {
    marginTop: 6,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'capitalize',
  },

  // QR Wrapper
  qrWrapper: {
    position: 'relative',
    padding: 12,
  },
  qrBackground: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },

  // ID Section
  idSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  idLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  idValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  hint: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
  },
  actionBtnSecondary: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionBtnTextPrimary: {
    color: '#fff',
  },

  // Scan Content
  scanContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanPlaceholder: {
    alignItems: 'center',
  },
  scanFrame: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
  },
  scanCornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  scanCornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  scanCornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  scanCornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanHint: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 24,
    textAlign: 'center',
  },
  openCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  openCameraText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  loginBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
