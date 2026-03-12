import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

type ZoomableImageProps = {
  uri: string;
  minScale?: number;
  maxScale?: number;
  doubleTapScale?: number;
  onScaleChange?: (scale: number) => void;
};

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function ZoomableImage({
  uri,
  minScale = 1,
  maxScale = 4,
  doubleTapScale = 2,
  onScaleChange,
}: ZoomableImageProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      const next = clamp(savedScale.value * e.scale, minScale, maxScale);
      scale.value = next;
      if (onScaleChange) runOnJS(onScaleChange)(next);
    })
    .onEnd(() => {
      if (scale.value < minScale) scale.value = withTiming(minScale);
      if (scale.value > maxScale) scale.value = withTiming(maxScale);
    });

  const pan = Gesture.Pan()
    .onStart(() => {
      savedX.value = translationX.value;
      savedY.value = translationY.value;
    })
    .onUpdate((e) => {
      // Allow panning more when zoomed in; keep it modest when at 1x
      const factor = Math.max(1, scale.value);
      translationX.value = savedX.value + e.translationX / (1 / factor);
      translationY.value = savedY.value + e.translationY / (1 / factor);
    })
    .onEnd(() => {
      // No hard bounds (image size unknown). Soft settle.
      translationX.value = withTiming(translationX.value);
      translationY.value = withTiming(translationY.value);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const target = scale.value > 1 ? 1 : doubleTapScale;
      scale.value = withTiming(target);
      if (target === 1) {
        translationX.value = withTiming(0);
        translationY.value = withTiming(0);
      }
      if (onScaleChange) runOnJS(onScaleChange)(target);
    });

  const composed = Gesture.Simultaneous(doubleTap, pinch, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <AnimatedImage
        source={{ uri }}
        contentFit="contain"
        style={[styles.image, animatedStyle]}
        recyclingKey={uri}
        transition={100}
      />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
