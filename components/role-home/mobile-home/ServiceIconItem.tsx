import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { HomeIconItem } from "./types";

interface ServiceIconItemProps {
  item: HomeIconItem;
  width: number;
  onPress?: (id: string) => void;
}

export function ServiceIconItem({
  item,
  width,
  onPress,
}: ServiceIconItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      style={[s.item, { width }]}
      onPress={() => onPress?.(item.id)}
    >
      <View style={s.iconBox}>
        <Image source={item.icon} style={s.icon} resizeMode="cover" />
      </View>
      <Text style={s.label} numberOfLines={2}>
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
});
