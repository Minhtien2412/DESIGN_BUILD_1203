import { getFeatureDisplayStatus } from "@/utils/safeNavigation";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { HomeIconItem } from "./types";

interface ServiceIconItemProps {
  item: HomeIconItem;
  width: number;
  onPress?: (id: string) => void;
}

const STATUS_BADGE: Record<
  string,
  { text: string; bg: string; fg: string } | null
> = {
  ready: null,
  "coming-soon": { text: "Sắp ra", bg: "#FEF3C7", fg: "#D97706" },
  disabled: { text: "Tạm khóa", bg: "#FEE2E2", fg: "#DC2626" },
  mock: { text: "Demo", bg: "#DBEAFE", fg: "#2563EB" },
};

export function ServiceIconItem({
  item,
  width,
  onPress,
}: ServiceIconItemProps) {
  const displayStatus = getFeatureDisplayStatus(item.id);
  const badge = STATUS_BADGE[displayStatus];
  const isBlocked =
    displayStatus === "coming-soon" || displayStatus === "disabled";

  return (
    <TouchableOpacity
      activeOpacity={isBlocked ? 0.5 : 0.78}
      style={[s.item, { width }, isBlocked && s.itemDisabled]}
      onPress={() => onPress?.(item.id)}
    >
      <View style={[s.iconBox, isBlocked && s.iconBoxDisabled]}>
        <Image source={item.icon} style={s.icon} resizeMode="cover" />
        {badge && (
          <View style={[s.badge, { backgroundColor: badge.bg }]}>
            <Text style={[s.badgeText, { color: badge.fg }]}>{badge.text}</Text>
          </View>
        )}
      </View>
      <Text style={[s.label, isBlocked && s.labelDisabled]} numberOfLines={2}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  item: {
    alignItems: "center",
    marginBottom: 6,
  },
  itemDisabled: {
    opacity: 0.55,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: "#EEF7DA",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  iconBoxDisabled: {
    backgroundColor: "#F3F4F6",
  },
  icon: {
    width: 50,
    height: 50,
  },
  label: {
    fontSize: 10,
    color: "#111827",
    textAlign: "center",
    lineHeight: 12,
    minHeight: 24,
    fontWeight: "500",
  },
  labelDisabled: {
    color: "#9CA3AF",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderBottomLeftRadius: 4,
    borderTopRightRadius: 6,
  },
  badgeText: {
    fontSize: 7,
    fontWeight: "700",
  },
});
