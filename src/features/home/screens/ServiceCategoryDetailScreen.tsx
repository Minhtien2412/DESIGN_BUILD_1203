import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

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
import { getRoleLabel, resolveServiceSection } from "../mock/detailResolvers";
import {
    demoBannerCampaignRoute,
    demoProductDetailRoute,
    demoRoleHomeRoute,
} from "../navigation/demoRoutes";

type ServiceCategoryDetailScreenProps = {
  role: UserRole;
  categoryId?: string;
  title?: string;
};

export default function ServiceCategoryDetailScreen({
  role,
  categoryId,
  title,
}: ServiceCategoryDetailScreenProps) {
  const { section, summary } = resolveServiceSection(role, categoryId, title);

  return (
    <DetailScreenScaffold
      title={section.title}
      subtitle={summary}
      roleLabel={getRoleLabel(role)}
      fallbackHref={demoRoleHomeRoute(role)}
    >
      <DetailSectionCard>
        <View style={styles.headerCardRow}>
          <View style={styles.headerBadge}>
            <AppText variant="overline" color={colors.brandDark}>
              {section.title}
            </AppText>
          </View>
          <AppText variant="bodySmall" color={colors.textSecondary}>
            Dự án: Vinhomes Q9 • Ngày giao: 26/03/2026
          </AppText>
        </View>
        <AppText variant="body">
          Bộ danh mục này được trình bày dưới dạng production-ready mockup để
          nối API sau, vẫn giữ spacing/card style đồng nhất với home screen.
        </AppText>
      </DetailSectionCard>

      <DetailSectionCard title="Danh sách hạng mục">
        <View style={styles.itemGrid}>
          {section.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              style={styles.serviceRow}
              onPress={() =>
                router.push(demoBannerCampaignRoute(item.id, role, item.title))
              }
            >
              <View style={styles.serviceIconShell}>
                <AppImage
                  source={item.icon}
                  resizeMode="contain"
                  containerStyle={styles.serviceImageWrap}
                  style={styles.serviceImage}
                  backgroundColor="transparent"
                />
              </View>
              <View style={styles.serviceCopy}>
                <AppText variant="title">{item.title}</AppText>
                <AppText variant="bodySmall" color={colors.textSecondary}>
                  Đội ngũ phù hợp, giá mẫu rõ ràng và dễ mở rộng workflow sau.
                </AppText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>
      </DetailSectionCard>

      <DetailSectionCard title="Gợi ý vật tư / sản phẩm liên quan">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedScroll}
        >
          {["desk", "sofa", "bed"].map((id) => (
            <TouchableOpacity
              key={id}
              activeOpacity={0.88}
              style={styles.relatedProductCard}
              onPress={() => router.push(demoProductDetailRoute(id, role))}
            >
              <AppText variant="title">
                {id === "desk"
                  ? "Bàn làm việc"
                  : id === "sofa"
                    ? "Sofa phòng khách"
                    : "Giường ngủ"}
              </AppText>
              <AppText variant="bodySmall" color={colors.textSecondary}>
                Sản phẩm demo để nối marketplace hoặc vật tư liên quan.
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </DetailSectionCard>
    </DetailScreenScaffold>
  );
}

const styles = StyleSheet.create({
  headerCardRow: {
    gap: spacing.xs,
  },
  headerBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
  },
  itemGrid: {
    gap: spacing.sm,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundSoft,
  },
  serviceIconShell: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.soft,
  },
  serviceImageWrap: {
    width: 30,
    height: 30,
  },
  serviceImage: {
    width: "100%",
    height: "100%",
  },
  serviceCopy: {
    flex: 1,
    gap: 2,
  },
  relatedScroll: {
    gap: spacing.sm,
  },
  relatedProductCard: {
    width: 220,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.backgroundSoft,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: spacing.xs,
  },
});
