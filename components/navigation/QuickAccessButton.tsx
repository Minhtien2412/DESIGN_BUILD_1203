/**
 * QuickAccessButton - CTA button for primary actions
 * Used in bottom action bar (Create Project, Start Livestream)
 * Features: Loading states, icons, gradient background
 */

import type { AppRoute } from '@/constants/typed-routes';
import { trackNavigation } from '@/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';

export interface QuickAccessButtonProps {
  /** Button label */
  label: string;
  /** Ionicons name */
  icon: string;
  /** Navigation route */
  route?: AppRoute;
  /** Custom press handler */
  onPress?: () => void | Promise<void>;
  /** Background color */
  color?: string;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

export const QuickAccessButton: React.FC<QuickAccessButtonProps> = ({
  label,
  icon,
  route,
  onPress,
  color = '#0080FF',
  loading = false,
  disabled = false,
  style,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePress = async () => {
    if (disabled || loading || isProcessing) return;

    try {
      setIsProcessing(true);

      if (onPress) {
        await onPress();
      } else if (route) {
        // Track navigation
        await trackNavigation(route, {
          category: 'quick_access',
          layer: undefined,
          sessionId: undefined,
        });
        router.push(route as any);
      }
    } catch (error) {
      console.error('QuickAccessButton error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = loading || isProcessing;
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: color },
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFF" size="small" />
      ) : (
        <Ionicons name={icon as any} size={20} color="#FFF" />
      )}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
