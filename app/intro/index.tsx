import AuthBackground from '@/components/ui/AuthBackground';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
// Responsive image height to avoid overlap on small screens
const IMAGE_HEIGHT = Math.max(140, Math.min(180, Math.round(width * 0.42)));

type Slide = {
  key: string;
  title: string;
  description: string;
  image: any; // RN require
};

const SLIDES: Slide[] = [
  {
    key: 's1',
    title: 'Quản lý xây dựng thông minh',
    description: 'Theo dõi dự án, chi phí và tiến độ ngay trong tầm tay.',
    image: require('@/assets/images/react-logo.webp'),
  },
  {
    key: 's2',
    title: 'Mua sắm & dịch vụ tiện ích',
    description: 'Kết nối nhà thầu, sản phẩm và dịch vụ một cách liền mạch.',
    image: require('@/assets/images/placeholder-video.webp'),
  },
  {
    key: 's3',
    title: 'Trải nghiệm hiện đại',
    description: 'Giao diện đẹp, mượt mà, tối ưu cho mọi thiết bị.',
    image: require('@/assets/images/partial-react-logo.webp'),
  },
];

export default function IntroScreen() {
  const router = useRouter();
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const surface = useThemeColor({}, 'surface');

  const scrollX = useRef(new Animated.Value(0)).current;
  
  const renderItem = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const translateX = scrollX.interpolate({ inputRange, outputRange: [50, 0, -50], extrapolate: 'clamp' });
    const opacity = scrollX.interpolate({ inputRange, outputRange: [0.6, 1, 0.6], extrapolate: 'clamp' });
    return (
      <View style={[styles.slide, { width }]}> 
        <View style={[styles.card, { backgroundColor: surface }]}>          
          <Animated.Image source={item.image} resizeMode="contain" style={[styles.image, { transform: [{ translateX }], opacity }]} />
          <Animated.Text style={[styles.title, { color: text, opacity }]}>{item.title}</Animated.Text>
          <Animated.Text style={[styles.desc, { color: textMuted, opacity }]}>{item.description}</Animated.Text>
        </View>
      </View>
    );
  };

  return (
    <AuthBackground>
      <View style={styles.container}>
        <Animated.FlatList
          data={SLIDES}
          keyExtractor={(s) => s.key}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
        />

        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
            const opacity = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
            return <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity, backgroundColor: primary }]} />;
          })}
        </View>

        <View style={styles.ctaRow}>
          <Text onPress={() => router.push('/(auth)/login')} style={[styles.ctaGhost, { color: textMuted }]}>Đăng nhập</Text>
          <Text onPress={() => router.push('/(tabs)')} style={[styles.cta, { backgroundColor: primary }]}>Bắt đầu</Text>
        </View>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  slide: {
    alignItems: 'center',
  },
  card: {
    width: width - 48,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  image: {
    width: '80%',
    height: IMAGE_HEIGHT,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 6,
  },
  dots: {
    position: 'absolute',
    bottom: 110,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 8,
  },
  ctaRow: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaGhost: {
    fontSize: 16,
    fontWeight: '600',
  },
  cta: {
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    overflow: 'hidden',
    fontSize: 16,
    fontWeight: '700',
  },
});
