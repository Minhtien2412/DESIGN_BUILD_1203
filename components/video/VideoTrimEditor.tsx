/**
 * VideoTrimEditor - Video trim UI component
 * VIDEO-006: User Upload Video - Trim editor
 */

import React, { useCallback, useState } from "react";
import { Dimensions, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface TrimRange {
  startTime: number;
  endTime: number;
}

export interface VideoTrimEditorProps {
  duration: number; // Total video duration in seconds
  thumbnails?: string[]; // Array of thumbnail URIs for timeline
  minDuration?: number; // Minimum trim duration
  maxDuration?: number; // Maximum trim duration
  initialStart?: number;
  initialEnd?: number;
  onTrimChange?: (range: TrimRange) => void;
  style?: ViewStyle;
}

const TIMELINE_PADDING = 16;
const HANDLE_WIDTH = 20;
const MIN_TRIM_WIDTH = 40;

export function VideoTrimEditor({
  duration,
  thumbnails = [],
  minDuration = 1,
  maxDuration,
  initialStart = 0,
  initialEnd,
  onTrimChange,
  style,
}: VideoTrimEditorProps): React.ReactElement {
  const timelineWidth = SCREEN_WIDTH - TIMELINE_PADDING * 2;
  const effectiveMaxDuration = maxDuration || duration;
  const effectiveEndTime = initialEnd ?? duration;

  // Shared values for animation
  const leftPosition = useSharedValue(
    (initialStart / duration) * timelineWidth
  );
  const rightPosition = useSharedValue(
    (effectiveEndTime / duration) * timelineWidth
  );

  const [trimRange, setTrimRange] = useState<TrimRange>({
    startTime: initialStart,
    endTime: effectiveEndTime,
  });

  // Convert position to time
  const positionToTime = useCallback(
    (position: number) => {
      return (position / timelineWidth) * duration;
    },
    [timelineWidth, duration]
  );

  // Update trim range
  const updateTrimRange = useCallback(
    (startPos: number, endPos: number) => {
      const newRange = {
        startTime: Math.max(0, positionToTime(startPos)),
        endTime: Math.min(duration, positionToTime(endPos)),
      };

      // Validate duration
      const trimDuration = newRange.endTime - newRange.startTime;
      if (trimDuration >= minDuration && trimDuration <= effectiveMaxDuration) {
        setTrimRange(newRange);
        onTrimChange?.(newRange);
      }
    },
    [positionToTime, duration, minDuration, effectiveMaxDuration, onTrimChange]
  );

  // Left handle gesture
  const leftGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newLeft = Math.max(
        0,
        Math.min(
          rightPosition.value - MIN_TRIM_WIDTH,
          leftPosition.value + e.translationX
        )
      );
      leftPosition.value = newLeft;
    })
    .onEnd(() => {
      runOnJS(updateTrimRange)(leftPosition.value, rightPosition.value);
    });

  // Right handle gesture
  const rightGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newRight = Math.min(
        timelineWidth,
        Math.max(
          leftPosition.value + MIN_TRIM_WIDTH,
          rightPosition.value + e.translationX
        )
      );
      rightPosition.value = newRight;
    })
    .onEnd(() => {
      runOnJS(updateTrimRange)(leftPosition.value, rightPosition.value);
    });

  // Animated styles
  const leftHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftPosition.value - HANDLE_WIDTH }],
  }));

  const rightHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightPosition.value }],
  }));

  const selectedAreaStyle = useAnimatedStyle(() => ({
    left: leftPosition.value,
    width: rightPosition.value - leftPosition.value,
  }));

  const leftOverlayStyle = useAnimatedStyle(() => ({
    width: leftPosition.value,
  }));

  const rightOverlayStyle = useAnimatedStyle(() => ({
    width: timelineWidth - rightPosition.value,
  }));

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Time labels */}
      <View style={styles.timeLabels}>
        <Text style={styles.timeText}>{formatTime(trimRange.startTime)}</Text>
        <Text style={styles.durationText}>
          {formatTime(trimRange.endTime - trimRange.startTime)}
        </Text>
        <Text style={styles.timeText}>{formatTime(trimRange.endTime)}</Text>
      </View>

      {/* Timeline */}
      <View style={[styles.timeline, { width: timelineWidth }]}>
        {/* Thumbnail track */}
        <View style={styles.thumbnailTrack}>
          {thumbnails.length > 0 ? (
            thumbnails.map((uri, index) => (
              <Animated.Image
                key={index}
                source={{ uri }}
                style={styles.thumbnail}
              />
            ))
          ) : (
            <View style={styles.placeholderTrack} />
          )}
        </View>

        {/* Left overlay (dimmed) */}
        <Animated.View
          style={[styles.overlay, styles.leftOverlay, leftOverlayStyle]}
        />

        {/* Right overlay (dimmed) */}
        <Animated.View
          style={[styles.overlay, styles.rightOverlay, rightOverlayStyle]}
        />

        {/* Selected area border */}
        <Animated.View style={[styles.selectedArea, selectedAreaStyle]}>
          <View style={styles.selectedBorder} />
        </Animated.View>

        {/* Left handle */}
        <GestureDetector gesture={leftGesture}>
          <Animated.View
            style={[styles.handle, styles.leftHandle, leftHandleStyle]}
          >
            <View style={styles.handleBar} />
          </Animated.View>
        </GestureDetector>

        {/* Right handle */}
        <GestureDetector gesture={rightGesture}>
          <Animated.View
            style={[styles.handle, styles.rightHandle, rightHandleStyle]}
          >
            <View style={styles.handleBar} />
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Instructions */}
      <Text style={styles.instructions}>Kéo các thanh để chọn đoạn video</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: TIMELINE_PADDING,
    paddingVertical: 16,
  },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  durationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  timeline: {
    height: 60,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  thumbnailTrack: {
    flexDirection: "row",
    height: "100%",
  },
  thumbnail: {
    flex: 1,
    height: "100%",
  },
  placeholderTrack: {
    flex: 1,
    backgroundColor: "#333",
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  leftOverlay: {
    left: 0,
  },
  rightOverlay: {
    right: 0,
  },
  selectedArea: {
    position: "absolute",
    top: 0,
    bottom: 0,
  },
  selectedBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#FF6B35",
    borderRadius: 4,
  },
  handle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: HANDLE_WIDTH,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
  },
  leftHandle: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightHandle: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  handleBar: {
    width: 4,
    height: 24,
    backgroundColor: "#FFF",
    borderRadius: 2,
  },
  instructions: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});

export default VideoTrimEditor;
