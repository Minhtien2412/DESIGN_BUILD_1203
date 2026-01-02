/**
 * Modern Hero Banner - Auto Carousel
 * Western minimalist design with smooth animations
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;
const CARD_HEIGHT = 200;

const HERO_SLIDES = [
  {
    id: '1',
    title: 'Luxury Villa Design',
    subtitle: 'Modern Architecture for Your Dream Home',
    image: 'https://nhaxinhdesign.com/wp-content/uploads/2023/biet-thu-hien-dai-sieu-dep-mat-tien-duong-nguyen-luong-bang-quan-7.jpg',
    fallbackImage: require('@/assets/images/react-logo.webp'), // Fallback local
    cta: 'Explore Now',
    route: '/services/house-design',
  },
  {
    id: '2',
    title: 'Premium Interiors',
    subtitle: 'Transform Your Space with Elegance',
    image: 'https://nhaxinhdesign.com/wp-content/uploads/2024/thiet-ke-thi-cong-noi-that-the-manhattan-glory-vinhomes-grand-park-quan-9.jpg',
    fallbackImage: require('@/assets/images/react-logo.webp'),
    cta: 'View Collection',
    route: '/services/interior-design',
  },
  {
    id: '3',
    title: 'Smart Construction',
    subtitle: 'Building Tomorrow, Today',
    image: 'https://nhaxinhdesign.com/wp-content/uploads/2023/biet-thu-hien-dai-san-vuon-rong-1000m2-gan-dai-lo-binh-duong.jpg',
    fallbackImage: require('@/assets/images/react-logo.webp'),
    cta: 'Get Started',
    route: '/shopping/index',
  },
];

export function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % HERO_SLIDES.length;
      setActiveIndex(nextIndex);
      
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (CARD_WIDTH + 16),
        animated: true,
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [activeIndex]);

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {HERO_SLIDES.map((slide, index) => (
          <Pressable
            key={slide.id}
            onPress={() => router.push(slide.route as any)}
            style={styles.slideContainer}
          >
            <View style={styles.card}>
              <Image
                source={{ uri: slide.image }}
                style={styles.image}
                contentFit="cover"
                transition={500}
                placeholder={slide.fallbackImage}
                placeholderContentFit="cover"
                onError={() => {
                  console.log('[HeroBanner] Failed to load image:', slide.image);
                }}
              />
              
              {/* Gradient overlay for text readability */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.gradient}
              />
              
              {/* Content */}
              <View style={styles.content}>
                <View style={styles.textContent}>
                  <Text style={styles.title}>{slide.title}</Text>
                  <Text style={styles.subtitle}>{slide.subtitle}</Text>
                </View>
                
                <BlurView intensity={80} tint="light" style={styles.ctaButton}>
                  <Text style={styles.ctaText}>{slide.cta}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#0A0A0A" />
                </BlurView>
              </View>
            </View>
          </Pressable>
        ))}
      </Animated.ScrollView>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {HERO_SLIDES.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => {
              setActiveIndex(index);
              scrollViewRef.current?.scrollTo({
                x: index * (CARD_WIDTH + 16),
                animated: true,
              });
            }}
          >
            <View
              style={[
                styles.dot,
                index === activeIndex && styles.activeDot,
              ]}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  slideContainer: {
    width: CARD_WIDTH,
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    // Modern shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    gap: 16,
  },
  textContent: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
    opacity: 0.95,
    letterSpacing: 0.2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#0A6847',
  },
});
