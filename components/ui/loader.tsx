/**
 * Loader Component
 * Consistent loading states with multiple variants
 */

import { Colors } from '@/constants/theme';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export interface LoaderProps {
  /** Height of the loader container */
  height?: number;
  /** Size of the spinner */
  size?: 'small' | 'large';
  /** Text to display below spinner */
  text?: string;
  /** Show full-screen overlay */
  overlay?: boolean;
  /** Custom color */
  color?: string;
}

export function Loader({ 
  height = 120, 
  size = 'large', 
  text,
  overlay = false,
  color = Colors.light.primary 
}: LoaderProps) {
  const content = (
    <>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </>
  );

  if (overlay) {
    return (
      <View style={styles.overlay}>
        {content}
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      {content}
    </View>
  );
}

/**
 * Inline loader for small spaces (e.g., buttons, cards)
 */
export function InlineLoader({ 
  size = 'small', 
  color = Colors.light.primary,
  style 
}: { 
  size?: 'small' | 'large'; 
  color?: string;
  style?: any;
}) {
  return (
    <View style={[styles.inline, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

/**
 * Centered full-screen loader
 */
export function FullScreenLoader({ 
  text,
  color = Colors.light.primary 
}: { 
  text?: string;
  color?: string;
}) {
  return (
    <View style={styles.fullScreen}>
      <ActivityIndicator size="large" color={color} />
      {text && <Text style={styles.fullScreenText}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  inline: {
    padding: 8,
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  fullScreenText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
