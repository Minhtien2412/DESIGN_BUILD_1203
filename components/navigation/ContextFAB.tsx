 import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

interface ContextAction {
  icon: string;
  color: string;
  route: string;
  label: string;
}

export const ContextFAB: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  // Determine context actions based on current route
  const actions = useMemo<ContextAction[]>(() => {
    if (pathname === '/') {
      return [
        { icon: 'search', color: '#4A90E2', route: '/search', label: 'Tìm kiếm' },
        { icon: 'add-circle', color: '#27AE60', route: '/projects', label: 'Dự án mới' },
      ];
    }

    if (pathname.startsWith('/projects')) {
      return [
        { icon: 'add', color: '#27AE60', route: '/projects/new', label: 'Tạo dự án' },
        { icon: 'list', color: '#4A90E2', route: '/projects', label: 'Danh sách' },
      ];
    }

    if (pathname.startsWith('/construction')) {
      return [
        { icon: 'camera', color: '#E67E22', route: '/construction/photo', label: 'Chụp ảnh' },
        { icon: 'document-text', color: '#9B59B6', route: '/construction/report', label: 'Báo cáo' },
      ];
    }

    if (pathname.startsWith('/messages')) {
      return [
        { icon: 'create', color: '#3498DB', route: '/messages/new', label: 'Tin nhắn mới' },
      ];
    }

    // Default actions
    return [
      { icon: 'search', color: '#4A90E2', route: '/search', label: 'Tìm kiếm' },
    ];
  }, [pathname]);

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.spring(rotateAnim, {
      toValue,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const handleActionPress = (route: string) => {
    router.push(route as any);
    setIsExpanded(false);
    Animated.spring(rotateAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  if (actions.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Expanded Actions */}
      {isExpanded && (
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <Animated.View
              key={index}
              style={[
                styles.actionWrapper,
                {
                  opacity: rotateAnim,
                  transform: [
                    {
                      translateY: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Pressable
                onPress={() => handleActionPress(action.route)}
                style={[styles.actionButton, { backgroundColor: action.color }]}
              >
                <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Main FAB */}
      <Pressable onPress={toggleExpand} style={styles.mainFAB}>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    alignItems: 'center',
  },
  actionsContainer: {
    marginBottom: 12,
    gap: 12,
  },
  actionWrapper: {
    alignItems: 'center',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mainFAB: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
