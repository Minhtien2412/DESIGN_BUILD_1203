import AuthBackground from "@/components/ui/AuthBackground";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const IMAGE_HEIGHT = Math.max(140, Math.min(200, Math.round(width * 0.45)));
const ONBOARDING_KEY = "@app_onboarding_complete";

type Slide = {
  key: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  features: string[];
  gradient: [string, string];
};

const SLIDES: Slide[] = [
  {
    key: "s1",
    title: "Chào mừng đến với App",
    description: "Ứng dụng quản lý xây dựng và thiết kế toàn diện",
    icon: "home-outline",
    features: [
      "🏗️ Quản lý dự án xây dựng",
      "📊 Theo dõi tiến độ realtime",
      "💰 Kiểm soát ngân sách",
      "📱 Đồng bộ đa nền tảng",
    ],
    gradient: ["#667eea", "#764ba2"],
  },
  {
    key: "s2",
    title: "Tin nhắn & Cuộc gọi",
    description: "Kết nối với đội ngũ mọi lúc mọi nơi",
    icon: "chatbubbles-outline",
    features: [
      "💬 Tin nhắn realtime",
      "📞 Gọi thoại/video HD",
      "👥 Nhóm chat không giới hạn",
      "📎 Chia sẻ file dễ dàng",
    ],
    gradient: ["#11998e", "#38ef7d"],
  },
  {
    key: "s3",
    title: "Cộng đồng & Mạng xã hội",
    description: "Kết nối với cộng đồng kiến trúc và xây dựng",
    icon: "people-outline",
    features: [
      "📸 Chia sẻ dự án của bạn",
      "🎥 Video showcase công trình",
      "❤️ Tương tác với cộng đồng",
      "🔔 Thông báo realtime",
    ],
    gradient: ["#fc4a1a", "#f7b733"],
  },
  {
    key: "s4",
    title: "AI & Công nghệ",
    description: "Trợ lý AI thông minh hỗ trợ công việc",
    icon: "sparkles-outline",
    features: [
      "🤖 AI phân tích thiết kế",
      "📐 Tính toán vật liệu tự động",
      "🎨 Gợi ý thiết kế thông minh",
      "📈 Dự báo tiến độ dự án",
    ],
    gradient: ["#8E2DE2", "#4A00E0"],
  },
  {
    key: "s5",
    title: "Sẵn sàng bắt đầu!",
    description: "Đăng ký ngay để trải nghiệm đầy đủ tính năng",
    icon: "rocket-outline",
    features: [
      "✅ Miễn phí đăng ký",
      "🔒 Bảo mật cao cấp",
      "🌐 Hỗ trợ đa ngôn ngữ",
      "💎 Nâng cấp Premium bất cứ lúc nào",
    ],
    gradient: ["#00c6ff", "#0072ff"],
  },
];

export default function IntroScreen() {
  const router = useRouter();
  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const primary = useThemeColor({}, "primary");
  const surface = useThemeColor({}, "surface");
  const background = useThemeColor({}, "background");

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLastSlide, setIsLastSlide] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Check if onboarding was completed
    checkOnboardingStatus();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (completed === "true") {
        // User already completed onboarding, can skip
      }
    } catch (error) {
      console.log("Error checking onboarding status:", error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch (error) {
      console.log("Error saving onboarding status:", error);
    }
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.push("/(tabs)");
  };

  const handleGetStarted = () => {
    completeOnboarding();
    router.push("/(auth)/login");
  };

  const handleLogin = () => {
    completeOnboarding();
    router.push("/(auth)/login");
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index || 0;
      setCurrentIndex(index);
      setIsLastSlide(index === SLIDES.length - 1);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: "clamp",
    });
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: "clamp",
    });
    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ["15deg", "0deg", "-15deg"],
      extrapolate: "clamp",
    });

    return (
      <View style={[styles.slide, { width }]}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: surface,
              transform: [{ scale }, { perspective: 1000 }, { rotateY }],
              opacity,
            },
          ]}
        >
          {/* Icon with gradient background */}
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Ionicons name={item.icon} size={60} color="#fff" />
          </LinearGradient>

          {/* Title */}
          <Text style={[styles.title, { color: text }]}>{item.title}</Text>

          {/* Description */}
          <Text style={[styles.desc, { color: textMuted }]}>
            {item.description}
          </Text>

          {/* Features list */}
          <View style={styles.featuresContainer}>
            {item.features.map((feature, idx) => (
              <Animated.View
                key={idx}
                style={[
                  styles.featureItem,
                  {
                    opacity: scrollX.interpolate({
                      inputRange: [
                        (index - 0.5) * width,
                        index * width,
                        (index + 0.5) * width,
                      ],
                      outputRange: [0, 1, 0],
                      extrapolate: "clamp",
                    }),
                    transform: [
                      {
                        translateX: scrollX.interpolate({
                          inputRange: [
                            (index - 0.5) * width,
                            index * width,
                            (index + 0.5) * width,
                          ],
                          outputRange: [-20, 0, 20],
                          extrapolate: "clamp",
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={[styles.featureText, { color: text }]}>
                  {feature}
                </Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <AuthBackground>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Skip button */}
        {!isLastSlide && (
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={[styles.skipText, { color: textMuted }]}>Bỏ qua</Text>
          </Pressable>
        )}

        {/* Slides */}
        <Animated.FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(s) => s.key}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={styles.flatListContent}
        />

        {/* Pagination dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            const backgroundColor = scrollX.interpolate({
              inputRange,
              outputRange: [textMuted, primary, textMuted],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBg, { backgroundColor: surface }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: primary,
                  width: scrollX.interpolate({
                    inputRange: [0, (SLIDES.length - 1) * width],
                    outputRange: ["20%", "100%"],
                    extrapolate: "clamp",
                  }),
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: textMuted }]}>
            {currentIndex + 1} / {SLIDES.length}
          </Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaRow}>
          {isLastSlide ? (
            <>
              <Pressable
                style={[styles.ctaSecondary, { borderColor: primary }]}
                onPress={handleLogin}
              >
                <Text style={[styles.ctaSecondaryText, { color: primary }]}>
                  Đăng nhập
                </Text>
              </Pressable>

              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaPrimary}
              >
                <Pressable
                  onPress={handleGetStarted}
                  style={styles.ctaPrimaryInner}
                >
                  <Text style={styles.ctaPrimaryText}>Đăng ký ngay</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </Pressable>
              </LinearGradient>
            </>
          ) : (
            <>
              <Pressable onPress={handleLogin}>
                <Text style={[styles.loginLink, { color: textMuted }]}>
                  Đã có tài khoản?
                </Text>
              </Pressable>

              <LinearGradient
                colors={[
                  SLIDES[currentIndex].gradient[0],
                  SLIDES[currentIndex].gradient[1],
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaNext}
              >
                <Pressable onPress={handleNext} style={styles.ctaNextInner}>
                  <Text style={styles.ctaNextText}>Tiếp theo</Text>
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                </Pressable>
              </LinearGradient>
            </>
          )}
        </View>
      </Animated.View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  skipButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "500",
  },
  flatListContent: {
    alignItems: "center",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  card: {
    width: width - 40,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  desc: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    width: "100%",
    gap: 12,
  },
  featureItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
  },
  dots: {
    position: "absolute",
    bottom: 180,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 8,
  },
  progressContainer: {
    position: "absolute",
    bottom: 150,
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
  },
  ctaRow: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 50 : 30,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: "500",
  },
  ctaSecondary: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
  },
  ctaSecondaryText: {
    fontSize: 16,
    fontWeight: "700",
  },
  ctaPrimary: {
    flex: 1.5,
    borderRadius: 16,
    shadowColor: "#667eea",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  ctaPrimaryInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  ctaPrimaryText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  ctaNext: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  ctaNextInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 6,
  },
  ctaNextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
