/**
 * Floating Action Button (FAB) Component
 * iOS-style floating button with quick actions menu
 * Similar to iPhone's AssistiveTouch
 */

import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface QuickAction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  action: () => void;
}

interface FloatingActionButtonProps {
  projectId?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: number;
  enabled?: boolean;
}

export default function FloatingActionButton({
  projectId,
  position = 'bottom-right',
  size = 56,
  enabled = true
}: FloatingActionButtonProps) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  if (!enabled) return null;

  const quickActions: QuickAction[] = [
    {
      id: 'home',
      icon: 'home',
      label: 'Trang chủ',
      color: '#3b82f6',
      action: () => {
        setShowMenu(false);
        router.push('/');
      }
    },
    {
      id: 'projects',
      icon: 'briefcase',
      label: 'Dự án',
      color: '#0066CC',
      action: () => {
        setShowMenu(false);
        router.push('/projects');
      }
    },
    {
      id: 'notifications',
      icon: 'notifications',
      label: 'Thông báo',
      color: '#0066CC',
      action: () => {
        setShowMenu(false);
        router.push('/notifications');
      }
    },
    {
      id: 'profile',
      icon: 'person',
      label: 'Hồ sơ',
      color: '#666666',
      action: () => {
        setShowMenu(false);
        router.push('/profile');
      }
    },
    ...(projectId ? [
      {
        id: 'diary',
        icon: 'calendar' as keyof typeof Ionicons.glyphMap,
        label: 'Nhật ký',
        color: '#06b6d4',
        action: () => {
          setShowMenu(false);
          router.push(`/projects/${projectId}/diary`);
        }
      },
      {
        id: 'safety',
        icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
        label: 'An toàn',
        color: '#000000',
        action: () => {
          setShowMenu(false);
          router.push(`/projects/${projectId}/safety/incidents`);
        }
      },
      {
        id: 'qc',
        icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
        label: 'QC/QA',
        color: '#84cc16',
        action: () => {
          setShowMenu(false);
          router.push(`/projects/${projectId}/qc/inspections`);
        }
      }
    ] : [])
  ];

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();

    setShowMenu(true);
  };

  const positionStyles = {
    'bottom-right': { bottom: 24, right: 24 },
    'bottom-left': { bottom: 24, left: 24 },
    'top-right': { top: 24, right: 24 },
    'top-left': { top: 24, left: 24 }
  };

  return (
    <>
      {/* Main FAB Button */}
      <Animated.View
        style={[
          styles.fab,
          positionStyles[position],
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.fabButton}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={styles.fabIcon}>
            <View style={styles.fabDot} />
            <View style={styles.fabDot} />
            <View style={styles.fabDot} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Quick Actions Menu */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Truy cập nhanh</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowMenu(false)}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.actionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionButton}
                  onPress={action.action}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.actionIconContainer,
                      { backgroundColor: action.color + '20' }
                    ]}
                  >
                    <Ionicons
                      name={action.icon}
                      size={28}
                      color={action.color}
                    />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* User Info */}
            {user && (
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userInitial}>
                    {user.email?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user.email}</Text>
                  <Text style={styles.userRole}>Construction Manager</Text>
                </View>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999
  },
  fabButton: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff'
  },
  fabIcon: {
    flexDirection: 'row',
    gap: 3
  },
  fabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff'
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937'
  },
  closeButton: {
    padding: 4
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24
  },
  actionButton: {
    width: '30%',
    alignItems: 'center',
    gap: 8
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userInitial: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff'
  },
  userDetails: {
    flex: 1
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937'
  },
  userRole: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2
  }
});
