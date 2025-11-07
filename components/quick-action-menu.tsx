/**
 * Quick Action Menu Component
 * Bottom sheet menu với quick access đến các features chính
 * Design inspired by iOS Control Center và Telegram
 */

import { HapticFeedback } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_HEIGHT = SCREEN_HEIGHT * 0.65;

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  backgroundColor: string;
  route: Href;
  badge?: number;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'projects',
    title: 'Dự án',
    subtitle: 'Quản lý công trình',
    icon: 'folder-open',
    iconColor: '#0891B2',
    backgroundColor: '#E0F2FE',
    route: '/(tabs)/projects',
  },
  {
    id: 'payments',
    title: 'Thanh toán',
    subtitle: 'Lịch sử giao dịch',
    icon: 'card',
    iconColor: '#10B981',
    backgroundColor: '#D1FAE5',
    route: '/profile/payment',
  },
  {
    id: 'progress',
    title: 'Tiến độ',
    subtitle: 'Theo dõi công việc',
    icon: 'stats-chart',
    iconColor: '#8B5CF6',
    backgroundColor: '#EDE9FE',
    route: '/(tabs)/projects',
  },
  {
    id: 'utilities',
    title: 'Tiện ích',
    subtitle: 'Dịch vụ hỗ trợ',
    icon: 'grid',
    iconColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
    route: '/utilities/ep-coc',
  },
  {
    id: 'products',
    title: 'Sản phẩm',
    subtitle: 'Vật liệu xây dựng',
    icon: 'cube',
    iconColor: '#EF4444',
    backgroundColor: '#FEE2E2',
    route: '/shopping/vat-lieu-xay',
  },
  {
    id: 'videos',
    title: 'Video',
    subtitle: 'Hướng dẫn & mẹo hay',
    icon: 'play-circle',
    iconColor: '#EC4899',
    backgroundColor: '#FCE7F3',
    route: '/(tabs)',
  },
];

const QUICK_SETTINGS: { id: string; icon: keyof typeof Ionicons.glyphMap; label: string; route: Href }[] = [
  {
    id: 'notifications',
    icon: 'notifications' as keyof typeof Ionicons.glyphMap,
    label: 'Thông báo',
    route: '/(tabs)/notifications',
  },
  {
    id: 'profile',
    icon: 'person' as keyof typeof Ionicons.glyphMap,
    label: 'Cá nhân',
    route: '/(tabs)/profile',
  },
  {
    id: 'settings',
    icon: 'settings' as keyof typeof Ionicons.glyphMap,
    label: 'Cài đặt',
    route: '/profile/settings',
  },
  {
    id: 'help',
    icon: 'help-circle' as keyof typeof Ionicons.glyphMap,
    label: 'Trợ giúp',
    route: '/profile/info',
  },
];

interface QuickActionMenuProps {
  visible: boolean;
  onClose: () => void;
}

export const QuickActionMenu: React.FC<QuickActionMenuProps> = ({ visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(MENU_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      HapticFeedback.menuOpen();
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      HapticFeedback.menuClose();
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: MENU_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleActionPress = (route: Href) => {
    HapticFeedback.light();
    onClose();
    setTimeout(() => {
      router.push(route);
    }, 300);
  };

  const handleBackdropPress = () => {
    HapticFeedback.light();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />
        </Animated.View>

        {/* Menu Sheet */}
        <Animated.View
          style={[
            styles.menuContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.menuContent, styles.menuContentBackground]}>
            {renderMenuContent()}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  function renderMenuContent() {
    return (
      <>
        {/* Handle bar */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Truy cập nhanh</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={28} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Main Actions Grid */}
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => handleActionPress(action.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: action.backgroundColor }]}>
                <Ionicons name={action.icon} size={28} color={action.iconColor} />
                {action.badge && action.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{action.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.actionTitle} numberOfLines={1}>
                {action.title}
              </Text>
              <Text style={styles.actionSubtitle} numberOfLines={1}>
                {action.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Cài đặt nhanh</Text>
          <View style={styles.settingsGrid}>
            {QUICK_SETTINGS.map((setting) => (
              <TouchableOpacity
                key={setting.id}
                style={styles.settingButton}
                onPress={() => handleActionPress(setting.route)}
                activeOpacity={0.7}
              >
                <Ionicons name={setting.icon} size={24} color="#4B5563" />
                <Text style={styles.settingLabel}>{setting.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    height: MENU_HEIGHT,
    width: SCREEN_WIDTH,
  },
  menuContent: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  menuContentBackground: {
    backgroundColor: '#F9FAFB',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  actionCard: {
    width: (SCREEN_WIDTH - 56) / 3,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  settingsSection: {
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  settingButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  settingLabel: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 6,
    fontWeight: '500',
  },
});
