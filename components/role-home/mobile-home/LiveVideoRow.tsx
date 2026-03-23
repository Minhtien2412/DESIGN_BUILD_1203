import { Ionicons } from "@expo/vector-icons";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { HomeLiveItem, HomeVideoItem } from "./types";

interface LiveVideoRowProps {
  liveItems: HomeLiveItem[];
  videoItems: HomeVideoItem[];
  onLivePress?: (id: string) => void;
  onVideoPress?: (id: string) => void;
  onSeeMoreLive?: () => void;
  onSeeMoreVideo?: () => void;
  marginTop?: number;
  videoBadgeIconSource?: ImageSourcePropType;
}

function MediaCard(props: {
  title: "LIVE" | "VIDEO";
  onSeeMore?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.cardTitle}>{props.title}</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={props.onSeeMore}>
          <Text style={s.seeMore}>Xem thêm &gt;</Text>
        </TouchableOpacity>
      </View>
      <View style={s.thumbRow}>{props.children}</View>
    </View>
  );
}

export function LiveVideoRow({
  liveItems,
  videoItems,
  onLivePress,
  onVideoPress,
  onSeeMoreLive,
  onSeeMoreVideo,
  marginTop = 12,
  videoBadgeIconSource,
}: LiveVideoRowProps) {
  return (
    <View style={[s.container, { marginTop }]}>
      <MediaCard title="LIVE" onSeeMore={onSeeMoreLive}>
        {liveItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            style={s.thumb}
            onPress={() => onLivePress?.(item.id)}
          >
            <Image
              source={item.image}
              style={s.thumbImage}
              resizeMode="cover"
            />
            <View style={s.liveBadge}>
              <View style={s.liveDot} />
              <Text style={s.liveBadgeText}>LIVE</Text>
            </View>
          </TouchableOpacity>
        ))}
      </MediaCard>

      <MediaCard title="VIDEO" onSeeMore={onSeeMoreVideo}>
        {videoItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            style={s.thumb}
            onPress={() => onVideoPress?.(item.id)}
          >
            <Image
              source={item.image}
              style={s.thumbImage}
              resizeMode="cover"
            />
            <View style={s.viewsBadge}>
              {videoBadgeIconSource ? (
                <Image
                  source={videoBadgeIconSource}
                  style={s.viewsIconImage}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name="play" size={10} color="#FFFFFF" />
              )}
              <Text style={s.viewsText}>{item.views}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </MediaCard>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#F9820F",
    borderRadius: 14,
    padding: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  seeMore: {
    color: "#FFE8D0",
    fontSize: 10,
    fontWeight: "600",
  },
  thumbRow: {
    flexDirection: "row",
    gap: 6,
  },
  thumb: {
    flex: 1,
    height: 84,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#D1D5DB",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  liveBadge: {
    position: "absolute",
    left: 4,
    top: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  liveBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
  },
  viewsBadge: {
    position: "absolute",
    left: 4,
    top: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(0,0,0,0.58)",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  viewsText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
  },
  viewsIconImage: {
    width: 9,
    height: 9,
    tintColor: "#FFFFFF",
    opacity: 0.95,
  },
});
