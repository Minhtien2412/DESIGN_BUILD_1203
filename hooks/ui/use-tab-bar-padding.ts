import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_BASE_HEIGHT = 86; 

export function useTabBarPadding() {
  const insets = useSafeAreaInsets();

  const bottomPadding = Platform.select({
    ios: insets.bottom > 0 ? insets.bottom : 8,
    android: Math.max(insets.bottom, 8),
    default: 8,
  });

  return TAB_BAR_BASE_HEIGHT + bottomPadding + 16;
}