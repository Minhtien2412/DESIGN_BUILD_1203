/**
 * DesignLiveSection — Horizontal live thumbnails with LIVE badge
 */
import { DESIGN_LIVE } from "@/data/home-data";
import { Href, router } from "expo-router";
import { memo } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PAD = 16;

export const DesignLiveSection = memo(() => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
  >
    {DESIGN_LIVE.map((item) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => router.push(item.route as Href)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.image }} style={styles.thumb} />
        {item.badge && (
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeTxt}>Live</Text>
          </View>
        )}
      </TouchableOpacity>
    ))}
  </ScrollView>
));

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: PAD,
    gap: 8,
  },
  thumb: {
    width: 84,
    height: 114,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  badge: {
    position: "absolute",
    top: 4,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220,38,38,0.85)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  badgeTxt: {
    fontSize: 8,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
});
