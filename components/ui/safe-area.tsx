import React from 'react';
import { Platform, ScrollView, ScrollViewProps, View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * SafeScrollView - ScrollView với padding bottom tự động cho tab bar
 * Sử dụng cho các màn hình có tab bar
 */
interface SafeScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  hasTabBar?: boolean; // Có tab bar hay không
  extraPadding?: number; // Padding thêm nếu cần
}

export function SafeScrollView({ 
  children, 
  hasTabBar = true, 
  extraPadding = 0,
  contentContainerStyle,
  ...props 
}: SafeScrollViewProps) {
  const insets = useSafeAreaInsets();
  
  // Tính toán padding bottom
  const bottomPadding = hasTabBar 
    ? Platform.select({
        ios: 60 + insets.bottom + extraPadding, // Tab bar height + safe area + extra
        android: 60 + extraPadding,
        default: 60 + extraPadding
      })
    : insets.bottom + extraPadding;

  return (
    <ScrollView
      {...props}
      contentContainerStyle={[
        contentContainerStyle,
        { paddingBottom: bottomPadding }
      ]}
    >
      {children}
    </ScrollView>
  );
}

/**
 * SafeView - View với padding bottom tự động
 * Sử dụng cho các màn hình không có scroll
 */
interface SafeViewProps extends ViewProps {
  children: React.ReactNode;
  hasTabBar?: boolean;
  extraPadding?: number;
}

export function SafeView({ 
  children, 
  hasTabBar = true, 
  extraPadding = 0,
  style,
  ...props 
}: SafeViewProps) {
  const insets = useSafeAreaInsets();
  
  const bottomPadding = hasTabBar 
    ? Platform.select({
        ios: 60 + insets.bottom + extraPadding,
        android: 60 + extraPadding,
        default: 60 + extraPadding
      })
    : insets.bottom + extraPadding;

  return (
    <View
      {...props}
      style={[
        style,
        { paddingBottom: bottomPadding }
      ]}
    >
      {children}
    </View>
  );
}

/**
 * Hook để lấy tab bar height với safe area
 */
export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  
  return Platform.select({
    ios: 60 + insets.bottom,
    android: 60,
    default: 60
  });
}

/**
 * Hook để lấy safe area insets
 */
export { useSafeAreaInsets };
