/**
 * LibraryGrid — Thư viện thiết kế (Architectural categories)
 *
 * Horizontal scrollable cards showing building type categories.
 * Each card has image, label, and a subtle design overlay.
 * Data from @/data/home-data LIBRARY_ITEMS.
 *
 * @created 2026-02-26
 */

import type { ServiceItem } from "@/data/home-data";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { memo } from "react";
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export interface LibraryGridProps {
  data: ServiceItem[];
}

export const LibraryGrid = memo<LibraryGridProps>(({ data }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={s.scroll}
  >
    {data.map((item) => (
      <TouchableOpacity
        key={item.id}
        style={s.card}
        onPress={() => router.push(item.route as Href)}
        activeOpacity={0.85}
      >
        <View style={s.imgWrap}>
          <Image source={item.icon} style={s.img} resizeMode="cover" />
          {/* Overlay gradient */}
          <View style={s.overlay} />
          {/* Category icon */}
          <View style={s.iconBadge}>
            <Ionicons name="cube-outline" size={14} color="#fff" />
          </View>
        </View>
        <Text style={s.label} numberOfLines={2}>
          {item.label}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
));

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 16, gap: 10 },
  card: {
    width: 100,
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  imgWrap: {
    width: 100,
    height: 80,
    position: "relative",
    overflow: "hidden",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  img: {
    width: 100,
    height: 80,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.15)",
  },
  iconBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(13,148,136,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    paddingHorizontal: 4,
    paddingVertical: 6,
    lineHeight: 14,
  },
});
