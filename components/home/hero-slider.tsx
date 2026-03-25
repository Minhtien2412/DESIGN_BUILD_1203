import { Colors } from "@/constants/theme";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export type BannerImage = { id: string; source: any; onPress?: () => void };

interface HeroSliderProps {
  images: BannerImage[];
  height?: number;
  autoPlay?: boolean;
  intervalMs?: number;
  rounded?: number;
}

const { width: SCREEN_W } = Dimensions.get("window");
const SLIDER_WIDTH = SCREEN_W - 32; // Account for padding

export const HeroSlider: React.FC<HeroSliderProps> = ({
  images,
  height = 160,
  autoPlay = true,
  intervalMs = 3500,
  rounded = 12,
}) => {
  const scrollRef = useRef<ScrollView | null>(null);
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const total = images.length;

  React.useEffect(() => {
    if (!autoPlay || total <= 1) return;
    const timer = setInterval(() => {
      const next = (index + 1) % total;
      scrollRef.current?.scrollTo({ x: next * SLIDER_WIDTH, animated: true });
      setIndex(next);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [index, autoPlay, intervalMs, total]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        const newIndex = Math.round(x / SLIDER_WIDTH);
        if (newIndex !== index && newIndex >= 0 && newIndex < total) {
          setIndex(newIndex);
        }
      },
    },
  );

  const containerStyle = useMemo(
    () => [styles.container, { height }],
    [height],
  );
  const imageStyle = useMemo(
    () => [
      styles.image,
      { height, borderRadius: rounded, width: SLIDER_WIDTH },
    ],
    [height, rounded],
  );

  return (
    <View style={containerStyle}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={SLIDER_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ alignItems: "center" }}
      >
        {images.map((img, i) => {
          const inputRange = [
            (i - 1) * SLIDER_WIDTH,
            i * SLIDER_WIDTH,
            (i + 1) * SLIDER_WIDTH,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.95, 1, 0.95],
            extrapolate: "clamp",
          });

          return (
            <TouchableOpacity
              key={img.id}
              activeOpacity={0.9}
              onPress={img.onPress}
            >
              <Animated.Image
                source={img.source}
                style={[imageStyle as any, { transform: [{ scale }] }]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Dots - Shopee Style */}
      {total > 1 && (
        <View style={styles.dots}>
          {images.map((img, i) => {
            const inputRange = [
              (i - 1) * SLIDER_WIDTH,
              i * SLIDER_WIDTH,
              (i + 1) * SLIDER_WIDTH,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [6, 16, 6],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={img.id}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    backgroundColor:
                      i === index
                        ? Colors.light.primary
                        : "rgba(255,255,255,0.6)",
                  },
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  image: {
    width: SLIDER_WIDTH,
  },
  dots: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
});

export default HeroSlider;
