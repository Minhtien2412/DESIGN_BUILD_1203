/**
 * ShortcutGrid — Icon grid for quick actions
 *
 * @created 2026-03-21
 */

import { ROLE_THEME } from "@/constants/roleTheme";
import { Ionicons } from "@expo/vector-icons";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SW } = Dimensions.get("window");
const GRID_PADDING = 20;
const COLUMNS = 4;
const ITEM_SIZE = (SW - GRID_PADDING * 2 - (COLUMNS - 1) * 12) / COLUMNS;

interface ShortcutData {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  badge?: number;
}

interface Props {
  items: ShortcutData[];
  columns?: number;
  onPress?: (item: ShortcutData) => void;
}

export function ShortcutGrid({ items, columns = COLUMNS, onPress }: Props) {
  const itemSize = (SW - GRID_PADDING * 2 - (columns - 1) * 12) / columns;

  return (
    <View style={s.grid}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[s.item, { width: itemSize }]}
          onPress={() => onPress?.(item)}
          activeOpacity={0.7}
        >
          <View style={[s.iconBox, { backgroundColor: item.bgColor }]}>
            <Ionicons name={item.icon as any} size={24} color={item.color} />
            {item.badge != null && item.badge > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={s.label} numberOfLines={1}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: GRID_PADDING,
    gap: 12,
  },
  item: {
    alignItems: "center",
    gap: 6,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: ROLE_THEME.radius.lg,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  label: {
    fontSize: ROLE_THEME.fontSize.xs,
    color: ROLE_THEME.textPrimary,
    fontWeight: "500",
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
