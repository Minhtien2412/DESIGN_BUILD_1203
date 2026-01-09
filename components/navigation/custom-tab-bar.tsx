/**
 * Custom Tab Bar - Luxury Minimalist Design
 * Features: 
 * - Large icons (26px) with smooth scale animations
 * - Small labels (11px) with proper spacing
 * - Center FAB button (60px) elegant dark theme
 * - Monochrome color scheme (black/gray/white)
 * - Active: Deep black (#1a1a1a) with subtle gradient
 * - Inactive: Neutral gray (#9ca3af)
 * - Premium matte finish with soft shadows
 * - 4 tabs only: Trang chủ | Cộng đồng | Dự án | Cá nhân
 * - Notifications moved to header only
 */
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuickActionSheet } from './quick-action-sheet';

const TABS_CONFIG = [
  { name: 'index', label: 'Trang chủ', icon: 'home', activeIcon: 'home' },
  { name: 'social', label: 'Cộng đồng', icon: 'people-outline', activeIcon: 'people' },
  { name: 'projects', label: 'Dự án', icon: 'briefcase-outline', activeIcon: 'briefcase' },
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
      // Find the correct animation index from TABS_CONFIG
      const animIndex = TABS_CONFIG.findIndex(tab => tab.name === routeName);
      
      if (animIndex !== -1 && scaleAnims[animIndex]) {
        // Quick scale animation - Shopee style
        Animated.sequence([
          Animated.spring(scaleAnims[animIndex], {
            toValue: 0.85,
            useNativeDriver: true,
            speed: 50,
            bounciness: 0,
          }),
          Animated.spring(scaleAnims[animIndex], {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
          }),
        ]).start();
      }

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
    // Navigate to different utility pages
    switch (actionId) {
      case 'cost-estimator':
        navigation.navigate('utilities/cost-estimator');
        break;
      case 'store-locator':
        navigation.navigate('utilities/store-locator');
        break;
      case 'schedule':
        navigation.navigate('utilities/schedule');
        break;
      case 'quote-request':
        navigation.navigate('utilities/quote-request');
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
        {/* Left tabs (Home, Home XD) */}
        {TABS_CONFIG.slice(0, 2).map((tab, configIndex) => {
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
                  { transform: [{ scale: scaleAnims[configIndex] }] },
                ]}
              >
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={isFocused ? (tab.activeIcon as any) : (tab.icon as any)}
                    size={26}
                    color={isFocused ? '#1a1a1a' : '#9ca3af'}
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
          activeOpacity={0.85}
          onPress={handleCenterButtonPress}
          style={styles.centerButtonContainer}
        >
          <Animated.View
            style={[
              styles.centerButton,
              { transform: [{ scale: centerButtonScale }] },
            ]}
          >
            <Ionicons name="add" size={30} color="#ffffff" />
          </Animated.View>
        </TouchableOpacity>

        {/* Right tabs (Projects, Notifications, Profile) */}
        {TABS_CONFIG.slice(2).map((tab, sliceIndex) => {
          const routeIndex = state.routes.findIndex(r => r.name === tab.name);
          const isFocused = state.index === routeIndex;
          const route = state.routes[routeIndex];
          const configIndex = sliceIndex + 2; // Offset by 2 since this is slice(2)
          
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
                  { transform: [{ scale: scaleAnims[configIndex] }] },
                ]}
              >
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={isFocused ? (tab.activeIcon as any) : (tab.icon as any)}
                    size={26}
                    color={isFocused ? '#1a1a1a' : '#9ca3af'}
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
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    paddingTop: 2,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
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
    paddingVertical: 4,
    minHeight: 32,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
    position: 'relative',
    width: 32,
    height: 32,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fafafa',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  },
  label: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '400',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  labelActive: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -11,
    marginHorizontal: 12,
  },
  centerButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: '#4a4a4a',
  },
});
