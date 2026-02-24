/**
 * CoverFrameSelector - Select cover frame from video
 * VIDEO-006: User Upload Video - Cover frame selector
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface CoverFrameSelectorProps {
  frames: string[]; // Array of frame image URIs
  duration: number; // Video duration in seconds
  selectedIndex?: number;
  onSelect?: (index: number, timeInSeconds: number) => void;
  style?: ViewStyle;
}

const FRAME_WIDTH = 80;
const FRAME_HEIGHT = 120;
const FRAME_MARGIN = 4;

export function CoverFrameSelector({
  frames,
  duration,
  selectedIndex = 0,
  onSelect,
  style,
}: CoverFrameSelectorProps): React.ReactElement {
  const [selected, setSelected] = useState(selectedIndex);

  const handleSelect = useCallback(
    (index: number) => {
      setSelected(index);
      const timeInSeconds = (index / (frames.length - 1 || 1)) * duration;
      onSelect?.(index, timeInSeconds);
    },
    [frames.length, duration, onSelect]
  );

  const formatTime = (index: number) => {
    const time = (index / (frames.length - 1 || 1)) * duration;
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderFrame = ({ item, index }: { item: string; index: number }) => {
    const isSelected = index === selected;

    return (
      <Pressable
        onPress={() => handleSelect(index)}
        style={[styles.frameContainer, isSelected && styles.selectedFrame]}
      >
        <Image source={{ uri: item }} style={styles.frameImage} />
        {isSelected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={24} color="#14B8A6" />
          </View>
        )}
        <Text style={styles.frameTime}>{formatTime(index)}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Chọn ảnh bìa</Text>
      <Text style={styles.subtitle}>
        Chọn khung hình làm ảnh bìa cho video của bạn
      </Text>

      {frames.length > 0 ? (
        <FlatList
          data={frames}
          renderItem={renderFrame}
          keyExtractor={(_, index) => `frame-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.frameList}
          initialScrollIndex={Math.min(selected, frames.length - 1)}
          getItemLayout={(_, index) => ({
            length: FRAME_WIDTH + FRAME_MARGIN * 2,
            offset: (FRAME_WIDTH + FRAME_MARGIN * 2) * index,
            index,
          })}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>Đang tải khung hình...</Text>
        </View>
      )}

      {/* Selected preview */}
      {frames.length > 0 && (
        <View style={styles.preview}>
          <Image
            source={{ uri: frames[selected] }}
            style={styles.previewImage}
          />
          <View style={styles.previewOverlay}>
            <Text style={styles.previewText}>Ảnh bìa đã chọn</Text>
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * Generate frame times for extraction
 */
export function generateFrameTimes(
  duration: number,
  frameCount = 10
): number[] {
  const times: number[] = [];
  const interval = duration / (frameCount - 1 || 1);

  for (let i = 0; i < frameCount; i++) {
    times.push(Math.min(i * interval, duration));
  }

  return times;
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
  },
  frameList: {
    paddingVertical: 8,
  },
  frameContainer: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    marginHorizontal: FRAME_MARGIN,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#333",
  },
  selectedFrame: {
    borderWidth: 3,
    borderColor: "#14B8A6",
  },
  frameImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  checkmark: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  frameTime: {
    position: "absolute",
    bottom: 4,
    left: 4,
    fontSize: 10,
    color: "#FFF",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyState: {
    height: FRAME_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  preview: {
    marginTop: 16,
    width: SCREEN_WIDTH - 32,
    height: (SCREEN_WIDTH - 32) * (16 / 9),
    maxHeight: 300,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  previewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  previewText: {
    fontSize: 14,
    color: "#FFF",
    textAlign: "center",
  },
});

export default CoverFrameSelector;
