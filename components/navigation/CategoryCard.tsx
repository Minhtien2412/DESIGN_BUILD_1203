import { useAnalytics } from '@/hooks/useAnalytics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

interface CategoryCardProps {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  gradient?: [string, string];
  moduleCount?: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  label,
  description,
  icon,
  color,
  gradient,
  moduleCount,
}) => {
  const router = useRouter();
  const { trackCategory } = useAnalytics();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const handlePress = () => {
    trackCategory(id, label);
    router.push(`/categories/${id}` as any);
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <LinearGradient
          colors={gradient || [color, color]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Badge */}
          {moduleCount !== undefined && moduleCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{moduleCount}</Text>
            </View>
          )}

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={32} color="#FFFFFF" />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.label} numberOfLines={2}>
              {label}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          </View>

          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 5,
  },
  pressable: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 16,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  iconContainer: {
    marginBottom: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
  },
  arrowContainer: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
});
