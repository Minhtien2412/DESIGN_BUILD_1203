import { StyleSheet, TouchableOpacity, View } from "react-native";

import AppImage from "../../shared/components/AppImage";
import AppText from "../../shared/components/AppText";
import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { shadows } from "../../shared/theme/shadows";
import { spacing } from "../../shared/theme/spacing";
import { BannerData } from "../mock/home.types";

type PromoBannerProps = {
  banner: BannerData;
  onPress?: (banner: BannerData) => void;
};

export default function PromoBanner({ banner, onPress }: PromoBannerProps) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.92}
        style={[styles.container, { height: banner.height ?? 176 }]}
        onPress={() => onPress?.(banner)}
      >
        <AppImage
          source={banner.image}
          containerStyle={styles.imageContainer}
          style={styles.image}
        />
        {banner.badge ? (
          <View style={styles.badge}>
            <AppText variant="overline" color={colors.brandDark}>
              {banner.badge}
            </AppText>
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    marginBottom: 16,
  },
  container: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.card,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
});
