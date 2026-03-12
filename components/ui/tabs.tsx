/**
 * Tabs Component
 * Horizontal navigation tabs with underline indicator
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type ViewStyle
} from 'react-native';
import { IconSize, Spacing } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';

export interface TabItem {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (key: string) => void;
  variant?: 'line' | 'filled' | 'pills';
  scrollable?: boolean;
  centered?: boolean;
  style?: ViewStyle;
}

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  scrollable = false,
  centered = false,
  style,
}: TabsProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');

  const handleTabPress = (key: string, disabled?: boolean) => {
    if (!disabled) {
      onChange(key);
    }
  };

  const renderTab = (tab: TabItem) => {
    const isActive = tab.key === activeTab;
    const isDisabled = tab.disabled;

    const getTabStyle = () => {
      if (variant === 'filled') {
        return [
          styles.filledTab,
          {
            backgroundColor: isActive ? primaryColor : 'transparent',
          },
        ];
      }
      if (variant === 'pills') {
        return [
          styles.pillTab,
          {
            backgroundColor: isActive ? primaryColor : surfaceColor,
          },
        ];
      }
      return styles.lineTab;
    };

    const getTextColor = () => {
      if (isDisabled) return textMutedColor;
      if (variant === 'filled' || variant === 'pills') {
        return isActive ? '#FFFFFF' : textColor;
      }
      return isActive ? primaryColor : textColor;
    };

    return (
      <TouchableOpacity
        key={tab.key}
        style={[styles.tab, getTabStyle(), isDisabled && styles.disabled]}
        onPress={() => handleTabPress(tab.key, tab.disabled)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {tab.icon && (
          <Ionicons
            name={tab.icon}
            size={IconSize.md}
            color={getTextColor()}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.tabText,
            {
              color: getTextColor(),
              fontWeight: isActive ? TextVariants.button.fontWeight : '400',
            },
          ]}
        >
          {tab.label}
        </Text>
        {tab.badge !== undefined && tab.badge > 0 && (
          <View
            style={[
              styles.badge,
              { backgroundColor: isActive && (variant === 'filled' || variant === 'pills') ? '#FFFFFF' : primaryColor },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isActive && (variant === 'filled' || variant === 'pills') ? primaryColor : '#FFFFFF' },
              ]}
            >
              {tab.badge > 99 ? '99+' : tab.badge}
            </Text>
          </View>
        )}
        {variant === 'line' && isActive && (
          <View style={[styles.indicator, { backgroundColor: primaryColor }]} />
        )}
      </TouchableOpacity>
    );
  };

  const containerStyle = [
    styles.container,
    centered && !scrollable && styles.centered,
    { backgroundColor },
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={containerStyle}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map(renderTab)}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{tabs.map(renderTab)}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  centered: {
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing[4],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    position: 'relative',
    minHeight: 48,
  },
  lineTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filledTab: {
    marginHorizontal: Spacing[1],
    borderRadius: 8,
  },
  pillTab: {
    marginHorizontal: Spacing[1],
    borderRadius: 20,
  },
  icon: {
    marginRight: Spacing[2],
  },
  tabText: {
    fontSize: TextVariants.body2.fontSize,
  },
  badge: {
    marginLeft: Spacing[2],
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});

// Tab Panel Component
interface TabPanelProps {
  activeTab: string;
  tabKey: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function TabPanel({ activeTab, tabKey, children, style }: TabPanelProps) {
  if (activeTab !== tabKey) return null;

  return <View style={style}>{children}</View>;
}
