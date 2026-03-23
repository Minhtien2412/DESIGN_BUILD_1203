/**
 * LiveVideoRow — Side-by-side LIVE + VIDEO cards
 * Green-bordered rounded container, each side has title + "Xem thêm >"
 * and thumbnail cards inside.
 */
import type {
    LiveStreamItem,
    VideoItem,
} from "@/data/role-home/customerHomeData";
import { Ionicons } from "@expo/vector-icons";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SW } = Dimensions.get("window");
const CARD_W = (SW - 32 - 12) / 2;

interface Props {
  liveStreams: LiveStreamItem[];
  videoItems: VideoItem[];
  onLivePress?: (id: string) => void;
  onVideoPress?: (id: string) => void;
  onSeeMoreLive?: () => void;
  onSeeMoreVideo?: () => void;
}

export function LiveVideoRow({
  liveStreams,
  videoItems,
  onLivePress,
  onVideoPress,
  onSeeMoreLive,
  onSeeMoreVideo,
}: Props) {
  return (
    <View style={s.container}>
      {/* LIVE card */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>LIVE</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onSeeMoreLive}>
            <Text style={s.seeMore}>Xem thêm &gt;</Text>
          </TouchableOpacity>
        </View>
        <View style={s.thumbnailRow}>
          {liveStreams.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={s.thumbnail}
              activeOpacity={0.7}
              onPress={() => onLivePress?.(item.id)}
            >
              <View style={s.thumbImage}>
                <Ionicons name="play-circle" size={20} color="#FFF" />
              </View>
              {item.isLive && (
                <View style={s.liveBadge}>
                  <View style={s.liveDot} />
                  <Text style={s.liveText}>LIVE</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* VIDEO card */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>VIDEO</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onSeeMoreVideo}>
            <Text style={s.seeMore}>Xem thêm &gt;</Text>
          </TouchableOpacity>
        </View>
        <View style={s.thumbnailRow}>
          {videoItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={s.thumbnail}
              activeOpacity={0.7}
              onPress={() => onVideoPress?.(item.id)}
            >
              <View style={s.thumbImage}>
                <Ionicons name="play-circle" size={20} color="#FFF" />
              </View>
              <View style={s.viewsBadge}>
                <Ionicons name="eye-outline" size={10} color="#FFF" />
                <Text style={s.viewsText}>{item.views}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#90B44C",
    padding: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1A2E",
  },
  seeMore: {
    fontSize: 11,
    color: "#90B44C",
    fontWeight: "600",
  },
  thumbnailRow: {
    flexDirection: "row",
    gap: 6,
  },
  thumbnail: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: 10,
    backgroundColor: "#E8F0D8",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  liveBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 3,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#FFFFFF",
  },
  liveText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  viewsBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 3,
  },
  viewsText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
