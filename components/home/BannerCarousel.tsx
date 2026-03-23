/**
 * BannerCarousel — Auto-rotating promo banner with dot indicators
 */
import { Href, router } from "expo-router";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    ImageSourcePropType,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SW } = Dimensions.get("window");
const PAD = 16;
const BANNER_W = SW - PAD * 2;
const BANNER_H = BANNER_W * 0.44;

export interface BannerItem {
  id: string;
  image: ImageSourcePropType;
  route: string;
}

export const BannerCarousel = memo<{ data: BannerItem[] }>(({ data }) => {
  const flatRef = useRef<FlatList>(null);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (data.length < 2) return; // No rotation needed for 0-1 items
    timerRef.current = setInterval(() => {
      const next = (indexRef.current + 1) % data.length;
      indexRef.current = next;
      setActiveIdx(next);
      try {
        flatRef.current?.scrollToIndex({ index: next, animated: true });
      } catch {
        // Layout not ready yet — skip this tick
      }
    }, 5000);
  }, [data.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_W);
      indexRef.current = idx;
      setActiveIdx(idx);
      startTimer();
    },
    [startTimer],
  );

  if (!data.length) return null;

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatRef}
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, index) => ({
          length: BANNER_W,
          offset: BANNER_W * index,
          index,
        })}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(item.route as Href)}
            style={{ width: BANNER_W }}
          >
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />
      <View style={styles.dots}>
        {data.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIdx && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    paddingHorizontal: PAD,
  },
  image: {
    width: BANNER_W,
    height: BANNER_H,
    borderRadius: 12,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#0D9488",
    borderRadius: 4,
  },
});
