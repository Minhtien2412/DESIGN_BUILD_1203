/**
 * DealHotBanner — Bottom promotional "Deal HOT / TIỆN ÍCH NỘI THẤT" banner
 * Green background with bold title + 4 benefit badges at bottom
 */
import type { Ionicons as IoniconsType } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

interface Badge {
  id: string;
  label: string;
  icon: ComponentProps<typeof IoniconsType>["name"];
}

interface Props {
  badges: Badge[];
}

export function DealHotBanner({ badges }: Props) {
  return (
    <View style={s.container}>
      {/* Top tag */}
      <View style={s.tagRow}>
        <View style={s.dealTag}>
          <Text style={s.dealTagText}>Deal HOT</Text>
        </View>
      </View>

      {/* Title area */}
      <Text style={s.title}>TIỆN ÍCH{"\n"}NỘI THẤT</Text>
      <Text style={s.subtitle}>
        Sắm tiện ích hiện đại —{"\n"}nâng cấp không gian sống
      </Text>

      {/* Benefit badges */}
      <View style={s.badgeRow}>
        {badges.map((badge) => (
          <View key={badge.id} style={s.badge}>
            <View style={s.badgeIconCircle}>
              <Ionicons name={badge.icon as any} size={16} color="#90B44C" />
            </View>
            <Text style={s.badgeText}>{badge.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: "#90B44C",
    padding: 20,
    overflow: "hidden",
  },
  tagRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dealTag: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  dealTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 17,
    marginTop: 6,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: 72,
    gap: 4,
  },
  badgeIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 11,
  },
});
