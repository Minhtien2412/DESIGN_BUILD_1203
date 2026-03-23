/**
 * OnboardingScreen — 3-slide swipe introduction
 *
 * After completing, marks onboarding as seen and navigates to role-select.
 *
 * @created 2026-03-21
 */

import { ROLE_THEME } from "@/constants/roleTheme";
import { useRole } from "@/context/RoleContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type ViewToken
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW, height: SH } = Dimensions.get("window");

interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    icon: "construct-outline",
    title: "Kết nối ngành xây dựng",
    description:
      "Nền tảng số 1 kết nối Thợ, Kỹ sư, Nhà thầu và Khách hàng trong lĩnh vực xây dựng & thiết kế.",
    bgColor: ROLE_THEME.primary,
    iconColor: "#FFFFFF",
  },
  {
    id: "2",
    icon: "people-outline",
    title: "4 vai trò, 1 ứng dụng",
    description:
      "Dù bạn là Thợ thi công, Kỹ sư/KTS, Nhà thầu hay Khách hàng — app đều có giao diện riêng phù hợp nhu cầu của bạn.",
    bgColor: "#6366F1",
    iconColor: "#FFFFFF",
  },
  {
    id: "3",
    icon: "rocket-outline",
    title: "Bắt đầu ngay",
    description:
      "Chọn vai trò, nhận việc, quản lý dự án, tìm dịch vụ — tất cả trong tầm tay. Hãy bắt đầu hành trình của bạn!",
    bgColor: "#F59E0B",
    iconColor: "#FFFFFF",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setOnboardingSeen, role } = useRole();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    await setOnboardingSeen();
    if (role) {
      router.replace("/(tabs)");
    } else {
      router.replace("/role-select");
    }
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[s.slide, { width: SW }]}>
      <View style={[s.iconContainer, { backgroundColor: item.bgColor }]}>
        <Ionicons name={item.icon} size={64} color={item.iconColor} />
      </View>
      <Text style={s.slideTitle}>{item.title}</Text>
      <Text style={s.slideDescription}>{item.description}</Text>
    </View>
  );

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={ROLE_THEME.bg} />

      {/* Skip button */}
      <TouchableOpacity
        style={[s.skipBtn, { top: insets.top + 16 }]}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={s.skipText}>Bỏ qua</Text>
      </TouchableOpacity>

      {/* Slides */}
      <View style={s.slidesArea}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </View>

      {/* Bottom controls */}
      <View
        style={[s.bottomArea, { paddingBottom: Math.max(insets.bottom, 24) }]}
      >
        {/* Pagination dots */}
        <View style={s.pagination}>
          {SLIDES.map((_, idx) => {
            const inputRange = [(idx - 1) * SW, idx * SW, (idx + 1) * SW];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: "clamp",
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={idx}
                style={[
                  s.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: ROLE_THEME.primary,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity
          style={[s.nextBtn, isLast && s.nextBtnFinal]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          {isLast ? (
            <Text style={s.nextBtnText}>Bắt đầu</Text>
          ) : (
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ROLE_THEME.bg,
  },
  skipBtn: {
    position: "absolute",
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 15,
    color: ROLE_THEME.textSecondary,
    fontWeight: "500",
  },
  slidesArea: {
    flex: 1,
    justifyContent: "center",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 130,
    height: 130,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  slideTitle: {
    fontSize: ROLE_THEME.fontSize.heading,
    fontWeight: "800",
    color: ROLE_THEME.textPrimary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 34,
  },
  slideDescription: {
    fontSize: ROLE_THEME.fontSize.lg,
    color: ROLE_THEME.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomArea: {
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
  },
  pagination: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ROLE_THEME.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: ROLE_THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextBtnFinal: {
    width: "auto",
    paddingHorizontal: 32,
    borderRadius: ROLE_THEME.radius.xl,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
