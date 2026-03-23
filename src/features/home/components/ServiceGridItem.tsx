import { StyleSheet, TouchableOpacity, View } from "react-native";

import AppImage from "../../shared/components/AppImage";
import AppText from "../../shared/components/AppText";
import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { shadows } from "../../shared/theme/shadows";
import { ServiceItem } from "../mock/home.types";

type ServiceGridItemProps = {
  item: ServiceItem;
  width: number;
  compact?: boolean;
  onPress?: (item: ServiceItem) => void;
};

export default function ServiceGridItem({
  item,
  width,
  compact = false,
  onPress,
}: ServiceGridItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      style={[styles.wrapper, { width }]}
      onPress={() => onPress?.(item)}
    >
      <View style={[styles.iconShell, compact && styles.iconShellCompact]}>
        <AppImage
          source={item.icon}
          resizeMode="contain"
          containerStyle={styles.imageWrap}
          style={styles.image}
          backgroundColor="transparent"
        />
        {item.badge ? (
          <View style={styles.badge}>
            <AppText variant="micro" color={colors.white}>
              {item.badge}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText
        variant="caption"
        align="center"
        style={styles.label}
        numberOfLines={2}
      >
        {item.title}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  iconShell: {
    width: 66,
    height: 66,
    borderRadius: 18,
    backgroundColor: colors.brandSurface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.soft,
  },
  iconShellCompact: {
    width: 62,
    height: 62,
  },
  imageWrap: {
    width: 36,
    height: 36,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  label: {
    minHeight: 34,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.brand,
  },
});
