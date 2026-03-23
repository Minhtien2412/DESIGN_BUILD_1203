import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import AppImage from "../../shared/components/AppImage";
import AppText from "../../shared/components/AppText";
import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { shadows } from "../../shared/theme/shadows";
import { spacing } from "../../shared/theme/spacing";
import { ProductCardData } from "../mock/home.types";

type ProductCardProps = {
  item: ProductCardData;
  onPress?: (item: ProductCardData) => void;
};

export default function ProductCard({ item, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => onPress?.(item)}
    >
      <AppImage
        source={item.image}
        resizeMode="cover"
        containerStyle={styles.imageWrap}
        style={styles.image}
      />
      <View style={styles.content}>
        <AppText variant="title" numberOfLines={2}>
          {item.title}
        </AppText>
        {item.subtitle ? (
          <AppText
            variant="bodySmall"
            color={colors.textSecondary}
            numberOfLines={2}
          >
            {item.subtitle}
          </AppText>
        ) : null}
        <View style={styles.priceRow}>
          <AppText variant="title" color={colors.brandDark}>
            {item.price}
          </AppText>
          <View style={styles.soldChip}>
            <Ionicons name="cart-outline" size={12} color={colors.brandDark} />
            <AppText variant="micro" color={colors.brandDark}>
              {item.sold}
            </AppText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 196,
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.card,
  },
  imageWrap: {
    width: "100%",
    height: 150,
    backgroundColor: colors.surfaceAlt,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 12,
    gap: 6,
  },
  priceRow: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  soldChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
  },
});
