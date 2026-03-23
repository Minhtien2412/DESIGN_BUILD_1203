import { Ionicons } from "@expo/vector-icons";
import type { ImageSourcePropType } from "react-native";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface SectionHeaderProps {
  title: string;
  titleColor?: string;
  actionText?: string;
  onActionPress?: () => void;
  searchPlaceholder?: string;
  searchBackgroundColor?: string;
  searchIconColor?: string;
  searchTextColor?: string;
  searchIconSource?: ImageSourcePropType;
}

export function SectionHeader({
  title,
  titleColor = "#111827",
  actionText,
  onActionPress,
  searchPlaceholder,
  searchBackgroundColor = "#F3F4F6",
  searchIconColor = "#9CA3AF",
  searchTextColor = "#9CA3AF",
  searchIconSource,
}: SectionHeaderProps) {
  return (
    <View style={s.wrap}>
      <Text style={[s.title, { color: titleColor }]}>{title}</Text>

      {searchPlaceholder ? (
        <View style={[s.searchBox, { backgroundColor: searchBackgroundColor }]}>
          {searchIconSource ? (
            <Image
              source={searchIconSource}
              style={s.searchIconImage}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="search-outline" size={14} color={searchIconColor} />
          )}
          <TextInput
            style={[s.searchInput, { color: searchTextColor }]}
            value=""
            editable={false}
            placeholder={searchPlaceholder}
            placeholderTextColor={searchTextColor}
            pointerEvents="none"
          />
        </View>
      ) : actionText ? (
        <TouchableOpacity activeOpacity={0.75} onPress={onActionPress}>
          <Text style={s.actionText}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
    textTransform: "uppercase",
    flexShrink: 1,
  },
  actionText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
  },
  searchBox: {
    width: 168,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 10,
    paddingVertical: 0,
  },
  searchIconImage: {
    width: 13,
    height: 13,
    opacity: 0.72,
  },
});
