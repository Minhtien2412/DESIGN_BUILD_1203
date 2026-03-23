import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { APP_ROUTES } from "@/constants/typed-routes";
import { UserRole } from "@/types/role";

import AppImage from "../../shared/components/AppImage";
import AppText from "../../shared/components/AppText";
import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { shadows } from "../../shared/theme/shadows";
import { spacing } from "../../shared/theme/spacing";
import DetailScreenScaffold, {
    DetailSectionCard,
} from "../components/DetailScreenScaffold";
import {
    buildSpecRows,
    getRoleLabel,
    resolveProduct,
} from "../mock/detailResolvers";
import { demoRoleHomeRoute } from "../navigation/demoRoutes";

type ProductDetailScreenProps = {
  productId?: string;
  role?: UserRole;
};

export default function ProductDetailScreen({
  productId,
  role = "customer",
}: ProductDetailScreenProps) {
  const product = resolveProduct(productId);
  const specs = buildSpecRows(product);

  return (
    <DetailScreenScaffold
      title={product.title}
      subtitle={product.subtitle}
      roleLabel={getRoleLabel(role)}
      fallbackHref={demoRoleHomeRoute(role)}
      footer={
        <View style={styles.footerWrap}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.footerButton}
            onPress={() => router.push(APP_ROUTES.CHECKOUT)}
          >
            <AppText variant="button" color={colors.white}>
              Đặt hàng ngay
            </AppText>
          </TouchableOpacity>
        </View>
      }
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.imageShell}>
        <AppImage
          source={product.image}
          containerStyle={styles.imageWrap}
          style={styles.image}
        />
      </View>

      <DetailSectionCard>
        <AppText variant="h2" color={colors.brandDark}>
          {product.price}
        </AppText>
        <AppText variant="bodySmall" color={colors.textSecondary}>
          {product.sold} • Dự án: Vinhomes Q9 • Giao ngày 26/03/2026
        </AppText>
      </DetailSectionCard>

      <DetailSectionCard title="Thông số & triển khai">
        {specs.map((row) => (
          <View key={row.id} style={styles.specRow}>
            <AppText variant="bodySmall" color={colors.textSecondary}>
              {row.label}
            </AppText>
            <AppText variant="bodySmall">{row.value}</AppText>
          </View>
        ))}
      </DetailSectionCard>

      <DetailSectionCard title="Mô tả sản phẩm">
        <AppText variant="body">
          Sản phẩm demo được dựng để giữ đúng feel của marketplace trong
          Figma/ảnh tham chiếu: card nền trắng, ảnh lớn, CTA cố định cuối màn
          hình và thông tin tách thành từng section rõ ràng.
        </AppText>
      </DetailSectionCard>
    </DetailScreenScaffold>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 148,
  },
  imageShell: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.card,
  },
  imageWrap: {
    height: 280,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  specRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  footerWrap: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: 24,
  },
  footerButton: {
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.cta,
  },
});
