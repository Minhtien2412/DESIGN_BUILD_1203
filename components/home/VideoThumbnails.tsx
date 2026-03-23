/**
 * VideoThumbnails — Horizontal video thumbnails with Live badge
 */
import { getPopularVideos, VideoItem } from "@/data/videos";
import { Href, router } from "expo-router";
import { memo, useMemo } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PAD = 16;

export const VideoThumbnails = memo<{ offset?: number }>(({ offset = 0 }) => {
  const videos = useMemo(() => {
    const all = getPopularVideos(20);
    return all.slice(offset, offset + 6);
  }, [offset]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {videos.map((v: VideoItem) => (
        <TouchableOpacity
          key={v.id}
          onPress={() => router.push("/demo-videos" as Href)}
          activeOpacity={0.85}
        >
          <View style={styles.thumbWrapper}>
            <Image source={{ uri: v.thumbnail }} style={styles.thumb} />
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTxt}>Live</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: PAD,
    gap: 6,
  },
  thumbWrapper: {
    position: "relative",
  },
  thumb: {
    width: 80,
    height: 110,
    borderRadius: 5,
    backgroundColor: "#E5E7EB",
  },
  liveBadge: {
    position: "absolute",
    top: 3,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF0000",
  },
  liveTxt: {
    fontSize: 8,
    fontWeight: "600",
    color: "#fff",
  },
});
