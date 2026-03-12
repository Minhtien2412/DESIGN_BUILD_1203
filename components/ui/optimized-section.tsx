import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { DesignSystem } from '../../constants/design-system';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface OptimizedSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  collapsible?: boolean;
  headerAction?: () => void;
  headerActionLabel?: string;
  headerActionIcon?: string;
  showCount?: boolean;
  count?: number;
  style?: any;
}

/**
 * Optimized Section Component with Better UX
 * - Smooth expand/collapse animation
 * - Optional header action
 * - Count badge
 * - Collapsible functionality
 */
export default function OptimizedSection({
  title,
  subtitle,
  children,
  defaultExpanded = true,
  collapsible = false,
  headerAction,
  headerActionLabel = 'Xem thêm',
  headerActionIcon = 'arrow-forward',
  showCount = false,
  count,
  style,
}: OptimizedSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <Animated.View
      style={[styles.container, style]}
      entering={FadeIn.duration(300)}
      layout={Layout.springify()}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {collapsible && (
            <TouchableOpacity
              onPress={toggleExpand}
              style={styles.expandButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name={expanded ? 'chevron-down' : 'chevron-forward'}
                size={20}
                color={DesignSystem.colors.text.secondary}
              />
            </TouchableOpacity>
          )}

          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
              {showCount && count !== undefined && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{count}</Text>
                </View>
              )}
            </View>
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>
        </View>

        {headerAction && (
          <TouchableOpacity
            onPress={headerAction as any}
            style={styles.headerAction}
            activeOpacity={0.7}
          >
            <Text style={styles.actionText}>{headerActionLabel}</Text>
            <Ionicons
              name={headerActionIcon as any}
              size={16}
              color={DesignSystem.colors.secondary.main}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {expanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.content}
        >
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: DesignSystem.spacing.sectionPadding,
    marginBottom: DesignSystem.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expandButton: {
    marginRight: DesignSystem.spacing.sm,
    padding: 4,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
  },
  title: {
    ...DesignSystem.typography.styles.h4,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    ...DesignSystem.typography.styles.caption as any,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: DesignSystem.colors.primary.light,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: DesignSystem.borderRadius.round,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: DesignSystem.colors.secondary.main,
  },
  content: {
    marginTop: DesignSystem.spacing.sm,
  },
});
