/**
 * Custom Tab Bar - Modern Shopee Style
 * Features: Larger icons (24px), smaller labels (10px), smooth scale animations, center + button
 * Color scheme: White/Black (active black), minimal design
 */
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuickActionSheet } from './quick-action-sheet';

const TABS_CONFIG = [
  { name: 'index', label: 'Trang chủ', icon: 'home', activeIcon: 'home' },
  { name: 'projects', label: 'Dự án', icon: 'briefcase-outline', activeIcon: 'briefcase' },
  { name: 'notifications', label: 'Thông báo', icon: 'notifications-outline', activeIcon: 'notifications' },
  { name: 'profile', label: 'Cá nhân', icon: 'person-outline', activeIcon: 'person' },
];

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [scaleAnims] = React.useState(
    TABS_CONFIG.map(() => new Animated.Value(1))
  );
  const [sheetVisible, setSheetVisible] = React.useState(false);
  const centerButtonScale = React.useRef(new Animated.Value(1)).current;

  const handlePress = (routeName: string, index: number) => {
    const isFocused = state.index === index;
    
    if (!isFocused) {
      // Quick scale animation - Shopee style
      Animated.sequence([
        Animated.spring(scaleAnims[index], {
          toValue: 0.85,
          useNativeDriver: true,
          speed: 50,
          bounciness: 0,
        }),
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
          bounciness: 4,
        }),
      ]).start();

      navigation.navigate(routeName);
    }
  };

  const handleCenterButtonPress = () => {
    // Animate center button
    Animated.sequence([
      Animated.spring(centerButtonScale, {
        toValue: 0.85,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.spring(centerButtonScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
    ]).start();

    setSheetVisible(true);
  };

  const handleActionPress = (actionId: string) => {
    // Handle different actions
    switch (actionId) {
      case 'live':
        // Navigate to live stream
        console.log('Open live stream');
        break;
      case 'videos':
        // Navigate to videos
        console.log('Open videos');
        break;
      case 'qr':
        // Open QR scanner
        console.log('Open QR scanner');
        break;
      case 'utilities':
        // Navigate to utilities
        navigation.navigate('menu');
        break;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.select({
            ios: insets.bottom > 0 ? insets.bottom : 8,
            android: 12,
            default: 12,
          }),
        },
      ]}
    >
      {/* Gradient overlay for depth */}
      <View style={styles.gradientOverlay} />
      
      <View style={styles.tabsContainer}>
        {TABS_CONFIG.slice(0, 2).map((tab) => {
          const routeIndex = state.routes.findIndex(r => r.name === tab.name);
          const isFocused = state.index === routeIndex;
          const route = state.routes[routeIndex];
          
          return (
            <Pressable
              key={tab.name}
              onPress={() => handlePress(route.name, routeIndex)}
              style={styles.tabButton}
              android_ripple={{ color: 'rgba(0, 0, 0, 0.08)', borderless: true }}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  { transform: [{ scale: scaleAnims[routeIndex] }] },
                ]}
              >
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={isFocused ? (tab.activeIcon as any) : (tab.icon as any)}
                    size={24}
                    color={isFocused ? '#111' : '#999'}
                  />
                </View>
                
                {/* Label */}
                <Text
                  style={[
                    styles.label,
                    isFocused && styles.labelActive,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}

        {/* Center + Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCenterButtonPress}
          style={styles.centerButtonContainer}
        >
          <Animated.View
            style={[
              styles.centerButton,
              { transform: [{ scale: centerButtonScale }] },
            ]}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </Animated.View>
        </TouchableOpacity>

  {/* Right tabs (Notifications, Profile) */}
  {TABS_CONFIG.slice(2).map((tab) => {
          const routeIndex = state.routes.findIndex(r => r.name === tab.name);
          const isFocused = state.index === routeIndex;
          const route = state.routes[routeIndex];
          
          return (
            <Pressable
              key={tab.name}
              onPress={() => handlePress(route.name, routeIndex)}
              style={styles.tabButton}
              android_ripple={{ color: 'rgba(0, 0, 0, 0.08)', borderless: true }}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  { transform: [{ scale: scaleAnims[routeIndex] }] },
                ]}
              >
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={isFocused ? (tab.activeIcon as any) : (tab.icon as any)}
                    size={24}
                    color={isFocused ? '#111' : '#999'}
                  />
                </View>
                
                {/* Label */}
                <Text
                  style={[
                    styles.label,
                    isFocused && styles.labelActive,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>

      {/* Quick Action Sheet */}
      <QuickActionSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onActionPress={handleActionPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#f0f0f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    paddingTop: 6,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  labelActive: {
    color: '#111',
    fontWeight: '600',
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    marginHorizontal: 8,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
