/**
 * Banner Carousel - Shopee/Grab Style
 * Created: 12/12/2025
 * 
 * Features:
 * - Auto-scroll with configurable interval
 * - Dots indicator
 * - Flash sale countdown timer
 * - ImageBackground support
 * - Smooth animations
 * - Touch to pause auto-scroll
 * 
 * Usage:
 * <BannerCarousel 
 *   banners={banners}
 *   autoScroll={true}
 *   interval={3000}
 * />
 */

import {
    MODERN_COLORS,
    MODERN_DIMENSIONS,
    MODERN_RADIUS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from '@/constants/modern-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    ImageSourcePropType,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface Banner {
  id: string;
  image: ImageSourcePropType;
  title?: string;
  subtitle?: string;
  url?: string;
  endTime?: Date; // For flash sale countdown
}

interface BannerCarouselProps {
  banners: Banner[];
  autoScroll?: boolean;
  interval?: number; // milliseconds
  height?: number;
  onBannerPress?: (banner: Banner) => void;
  showCountdown?: boolean;
}

export default function BannerCarousel({
  banners,
  autoScroll = true,
  interval = 3000,
  height = MODERN_DIMENSIONS.bannerHeight,
  onBannerPress,
  showCountdown = false,
}: BannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [countdown, setCountdown] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate countdown for flash sale
  const calculateCountdown = (endTime?: Date) => {
    if (!endTime) return '';
    
    const now = new Date().getTime();
    const end = endTime.getTime();
    const diff = end - now;
    
    if (diff <= 0) return 'Đã kết thúc';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Update countdown every second
  useEffect(() => {
    if (!showCountdown) return;
    
    const timer = setInterval(() => {
      const activeBanner = banners[activeIndex];
      setCountdown(calculateCountdown(activeBanner?.endTime));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [activeIndex, banners, showCountdown]);

  // Auto scroll
  useEffect(() => {
    if (!autoScroll || banners.length <= 1) return;
    
    intervalRef.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % banners.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeIndex, autoScroll, interval, banners.length]);

  // Handle scroll
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  // Handle banner press
  const handleBannerPress = (banner: Banner) => {
    onBannerPress?.(banner);
  };

  // Stop auto-scroll when user touches
  const handleTouchStart = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Resume auto-scroll when user releases
  const handleTouchEnd = () => {
    if (!autoScroll || banners.length <= 1) return;
    
    intervalRef.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % banners.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, interval);
  };

  if (banners.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.9}
            onPress={() => handleBannerPress(banner)}
            style={styles.bannerContainer}
          >
            <ImageBackground
              source={banner.image}
              style={[styles.banner, { height }]}
              imageStyle={styles.bannerImage}
            >
              {/* Gradient Overlay */}
              {(banner.title || banner.subtitle || showCountdown) && (
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)']}
                  style={styles.gradientOverlay}
                >
                  <View style={styles.bannerContent}>
                    {banner.title && (
                      <Text style={styles.bannerTitle}>{banner.title}</Text>
                    )}
                    {banner.subtitle && (
                      <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                    )}
                    
                    {/* Flash Sale Countdown */}
                    {showCountdown && banner.endTime && countdown && (
                      <View style={styles.countdownContainer}>
                        <Text style={styles.countdownLabel}>Kết thúc sau:</Text>
                        <View style={styles.countdownTime}>
                          <Text style={styles.countdownText}>{countdown}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              )}
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Dots Indicator */}
      {banners.length > 1 && (
        <View style={styles.dotsContainer}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: MODERN_SPACING.sm,
  },
  
  // ScrollView
  scrollView: {
    flexGrow: 0,
  },
  
  // Banner
  bannerContainer: {
    width: SCREEN_WIDTH,
    paddingHorizontal: MODERN_SPACING.md,
  },
  banner: {
    width: SCREEN_WIDTH - (MODERN_SPACING.md * 2),
    borderRadius: MODERN_RADIUS.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bannerImage: {
    borderRadius: MODERN_RADIUS.lg,
  },
  
  // Gradient Overlay
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: MODERN_SPACING.xxxl,
    paddingHorizontal: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.md,
  },
  
  // Banner Content
  bannerContent: {
    gap: MODERN_SPACING.xxs,
  },
  bannerTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.surface,
  },
  bannerSubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.surface,
  },
  
  // Countdown
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.sm,
    marginTop: MODERN_SPACING.xs,
  },
  countdownLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.surface,
  },
  countdownTime: {
    backgroundColor: MODERN_COLORS.flashSale,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xxs,
    borderRadius: MODERN_RADIUS.sm,
  },
  countdownText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.surface,
    fontVariant: ['tabular-nums'],
  },
  
  // Dots Indicator
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: MODERN_SPACING.xs,
    marginTop: MODERN_SPACING.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.textDisabled,
  },
  dotActive: {
    width: 20,
    backgroundColor: MODERN_COLORS.primary,
  },
});
