import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React, { memo, useMemo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type ShortcutItem = {
  id: string;
  title: string;
  icon: (color: string) => React.ReactNode;
  onPress?: () => void;
  path?: string; // used to compute active state
  requiredPermission?: string; // permission required to view this shortcut
};

const SHORTCUTS: ShortcutItem[] = [
  { id: 'home', title: 'Home', icon: (color) => <Ionicons name="home-outline" size={22} color={color} />, onPress: () => router.push('/'), path: '/' },
  { id: 'products', title: 'Đấu thầu', icon: (color) => <Feather name="grid" size={20} color={color} />, onPress: () => router.push('/projects' as any), path: '/projects' },
  { id: 'live', title: 'Live/Video', icon: (color) => <MaterialCommunityIcons name="broadcast" size={20} color={color} />, onPress: () => router.push('/live' as any), path: '/live' },
  { id: 'bell', title: 'Thông báo', icon: (color) => <Feather name="bell" size={20} color={color} />, onPress: () => router.push('/notifications' as any), path: '/notifications' },
  { id: 'acc', title: 'Tài khoản', icon: (color) => <Ionicons name="person-circle-outline" size={22} color={color} />, onPress: () => router.push('/profile' as any), path: '/profile' },
];

export const GlobalShortcuts = memo(function GlobalShortcuts({ mode = 'fixed' }: { mode?: 'overlay' | 'fixed' }) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { user } = useAuth();
  const bg = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');
  const activeColor = useThemeColor({}, 'tint');
  const normalizedPath = useMemo(() => {
    // remove route group segments like '/(tabs)' then collapse multiple slashes
    const withoutGroups = pathname.replace(/\/\([^/]+\)/g, '');
    const collapsed = withoutGroups.replace(/\/+/g, '/');
    return collapsed || '/';
  }, [pathname]);

  const hidden = useMemo(() => {
    // Ẩn trên các màn hình auth (nhóm /(auth)) hoặc khi cần tập trung nhập OTP
    return pathname.startsWith('/(auth)');
  }, [pathname]);

  if (hidden) return null;

  const bottomOffset = getGlobalShortcutsBottomOffset(insets); // thêm khoảng cách nhỏ

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/') return normalizedPath === '/';
    return normalizedPath === path || normalizedPath.startsWith(path + '/');
  };

  if (mode === 'overlay') {
    return (
      <SafeAreaView pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <Animated.View
          entering={FadeInDown.duration(300)}
          exiting={FadeOut.duration(150)}
          style={[styles.wrap, { bottom: bottomOffset }]}
          pointerEvents="box-none"
        >
          <View style={[styles.inner, { backgroundColor: bg, borderColor: iconColor }] }>
            {SHORTCUTS.filter(s => !!user).map(s => {
              const active = isActive(s.path);
              const iconEl = s.icon(active ? activeColor : iconColor);
              return (
                <TouchableOpacity key={s.id} style={styles.item} onPress={s.onPress} activeOpacity={0.8}>
                  {iconEl}
                  <Text style={[styles.label, { color: active ? activeColor : iconColor }]} numberOfLines={1}>
                    {s.title}
                  </Text>
                  {active ? <View style={[styles.activeDot, { backgroundColor: activeColor }]} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // fixed footer mode (non-overlapping)
  return (
    <SafeAreaView edges={['bottom']}>
      <View style={[styles.fixedBar, { backgroundColor: bg, borderColor: iconColor }]}>
        {SHORTCUTS.filter(s => !!user).map(s => {
          const active = isActive(s.path);
          const iconEl = s.icon(active ? activeColor : iconColor);
          return (
            <TouchableOpacity key={s.id} style={styles.item} onPress={s.onPress} activeOpacity={0.8}>
              {iconEl}
              <Text style={[styles.label, { color: active ? activeColor : iconColor }]} numberOfLines={1}>
                {s.title}
              </Text>
              {active ? <View style={[styles.activeDot, { backgroundColor: activeColor }]} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
});

// Exported constants/helpers to reserve space for the floating bar globally
export const GLOBAL_SHORTCUTS_BAR_HEIGHT = 56; // approximate visual height of the pill bar
export const getGlobalShortcutsBottomOffset = (insets: { bottom: number }) => Math.max(insets.bottom, 8) + 8;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
  },
  fixedBar: {
    borderTopWidth: 0.5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    // nâng khối nổi
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: { fontSize: 10, fontWeight: Platform.OS === 'ios' ? '600' : '500' },
  activeDot: {
    width: 18,
    height: 3,
    borderRadius: 2,
    marginTop: 2,
  },
});

export default GlobalShortcuts;
