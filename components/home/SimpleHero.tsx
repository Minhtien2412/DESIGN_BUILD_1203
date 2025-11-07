import { memo } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface SimpleHeroProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  imageSource?: any;
  style?: any;
}

export const SimpleHero = memo(function SimpleHero({
  title = "Thiết Kế Resort",
  subtitle = "Kiến tạo không gian nghỉ dưỡng hoàn hảo",
  badgeText = "HOT",
  imageSource,
  style
}: SimpleHeroProps) {
  return (
    <View style={[styles.heroContainer, style]}>
      <Image
        source={imageSource || require('@/assets/images/react-logo.png')}
        style={styles.heroImage}
        resizeMode="cover"
      />
      <View style={styles.heroOverlay}>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSubtitle}>{subtitle}</Text>
        {badgeText && (
          <View style={styles.hotBadge}>
            <Text style={styles.hotBadgeText}>{badgeText}</Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  heroContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    height: 160,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  hotBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hotBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
});
