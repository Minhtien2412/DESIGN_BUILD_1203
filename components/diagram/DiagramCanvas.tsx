import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { G } from 'react-native-svg';

export type CanvasViewport = { x: number; y: number; scale: number };

export type DiagramCanvasProps = PropsWithChildren<{
  width: number;
  height: number;
  initial?: CanvasViewport;
  onViewportChange?: (v: CanvasViewport) => void;
  backgroundColor?: string;
}>;

const AnimatedG = Animated.createAnimatedComponent(G);

export default function DiagramCanvas({ width, height, initial, onViewportChange, children, backgroundColor = '#fff' }: DiagramCanvasProps) {
  const scale = useSharedValue(initial?.scale ?? 1);
  const tx = useSharedValue(initial?.x ?? 0);
  const ty = useSharedValue(initial?.y ?? 0);

  const sx = useSharedValue(0);
  const sy = useSharedValue(0);
  const savedScale = useSharedValue(1);

  const pan = Gesture.Pan()
    .onStart(() => {
      sx.value = tx.value;
      sy.value = ty.value;
    })
    .onUpdate(e => {
      tx.value = sx.value + e.translationX;
      ty.value = sy.value + e.translationY;
    })
    .onEnd(() => {
      onViewportChange?.({ x: tx.value, y: ty.value, scale: scale.value });
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate(e => {
      const next = Math.min(6, Math.max(0.3, savedScale.value * e.scale));
      scale.value = next;
    })
    .onEnd(() => {
      onViewportChange?.({ x: tx.value, y: ty.value, scale: scale.value });
    });

  const doubleTap = Gesture.Tap().numberOfTaps(2).onEnd(() => {
    const target = scale.value > 1 ? 1 : 2;
    scale.value = withTiming(target);
    if (target === 1) {
      tx.value = withTiming(0);
      ty.value = withTiming(0);
    }
    onViewportChange?.({ x: tx.value, y: ty.value, scale: target });
  });

  const composed = Gesture.Simultaneous(doubleTap, pinch, pan);

  const transformStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <GestureDetector gesture={composed}>
        <Svg width={width} height={height}>
          {/* Static background grid */}
          {/* Consumers draw content within the transformed group */}
          <AnimatedG animatedProps={useAnimatedProps(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }] as any }))}>
            {/* Reanimated can't drive props array easily in RN-SVG without animatedProps above, but children will inherit via parent transform */}
            {children}
          </AnimatedG>
        </Svg>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
