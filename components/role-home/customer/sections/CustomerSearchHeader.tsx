/**
 * CustomerSearchHeader — Top search bar matching reference
 * White background, rounded search input, filter icon on right
 */
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  onSearchPress?: () => void;
  onFilterPress?: () => void;
}

export function CustomerSearchHeader({ onSearchPress, onFilterPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.container, { paddingTop: insets.top + 8 }]}>
      <View style={s.searchRow}>
        <TouchableOpacity
          style={s.searchBox}
          activeOpacity={0.7}
          onPress={onSearchPress}
        >
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            style={s.input}
            placeholder="Tìm kiếm..."
            placeholderTextColor="#9CA3AF"
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.filterBtn}
          activeOpacity={0.7}
          onPress={onFilterPress}
        >
          <Ionicons name="menu-outline" size={22} color="#1A1A2E" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A2E",
    padding: 0,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
});
