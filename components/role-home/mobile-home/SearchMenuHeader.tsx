import { Ionicons } from "@expo/vector-icons";
import type { ImageSourcePropType } from "react-native";
import {
    Image,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface SearchMenuHeaderProps {
  placeholder?: string;
  onSearchPress?: () => void;
  onMenuPress?: () => void;
  searchIconSource?: ImageSourcePropType;
  menuIconSource?: ImageSourcePropType;
}

export function SearchMenuHeader({
  placeholder = "Tìm kiếm...",
  onSearchPress,
  onMenuPress,
  searchIconSource,
  menuIconSource,
}: SearchMenuHeaderProps) {
  return (
    <View style={s.container}>
      <TouchableOpacity
        style={s.searchBox}
        activeOpacity={0.75}
        onPress={onSearchPress}
      >
        {searchIconSource ? (
          <Image
            source={searchIconSource}
            style={s.searchIconImage}
            resizeMode="contain"
          />
        ) : (
          <Ionicons name="search-outline" size={18} color="#98A2B3" />
        )}
        <TextInput
          style={s.searchInput}
          value=""
          editable={false}
          placeholder={placeholder}
          placeholderTextColor="#98A2B3"
          pointerEvents="none"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={s.menuButton}
        activeOpacity={0.75}
        onPress={onMenuPress}
      >
        {menuIconSource ? (
          <Image
            source={menuIconSource}
            style={s.menuIconImage}
            resizeMode="contain"
          />
        ) : (
          <Ionicons name="menu-outline" size={20} color="#1F2937" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  searchBox: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EFF1F3",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  searchInput: {
    flex: 1,
    color: "#1F2937",
    fontSize: 13,
    paddingVertical: 0,
  },
  searchIconImage: {
    width: 16,
    height: 16,
    opacity: 0.75,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#EFF1F3",
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconImage: {
    width: 18,
    height: 18,
    opacity: 0.86,
  },
});
