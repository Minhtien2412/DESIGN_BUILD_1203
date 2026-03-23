import { Ionicons } from "@expo/vector-icons";
import {
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import AppText from "./AppText";

export type BottomTabItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
};

type BottomTabBarProps = {
  items: BottomTabItem[];
  style?: StyleProp<ViewStyle>;
  onItemPress?: (item: BottomTabItem) => void;
};

export default function BottomTabBar({
  items,
  style,
  onItemPress,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
        style,
      ]}
    >
      <View style={styles.container}>
        {items.map((item) => {
          const isActive = Boolean(item.active);
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={styles.item}
              onPress={() => onItemPress?.(item)}
            >
              <View
                style={[styles.iconWrap, isActive && styles.iconWrapActive]}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={isActive ? colors.white : colors.textSecondary}
                />
              </View>
              <AppText
                variant="micro"
                color={isActive ? colors.brand : colors.textSecondary}
                style={styles.label}
                numberOfLines={1}
              >
                {item.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 0,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    paddingHorizontal: 6,
    paddingTop: 7,
    paddingBottom: 7,
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.floating,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: 3,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  iconWrapActive: {
    backgroundColor: colors.brand,
  },
  label: {
    maxWidth: 58,
  },
});
