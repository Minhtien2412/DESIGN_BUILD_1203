import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { UserRole } from "@/types/role";

import AppImage from "../../shared/components/AppImage";
import AppText from "../../shared/components/AppText";
import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { spacing } from "../../shared/theme/spacing";
import DetailScreenScaffold, {
    DetailSectionCard,
} from "../components/DetailScreenScaffold";
import { getRoleLabel, resolveBannerCampaign } from "../mock/detailResolvers";
import {
    demoInternalDashboardRoute,
    demoProductDetailRoute,
    demoRoleHomeRoute,
    demoServiceCategoryRoute,
    demoWorkerRewardsRoute,
} from "../navigation/demoRoutes";

type BannerCampaignDetailScreenProps = {
  role: UserRole;
  campaignId?: string;
  title?: string;
};

export default function BannerCampaignDetailScreen({
  role,
  campaignId,
  title,
}: BannerCampaignDetailScreenProps) {
  const campaign = resolveBannerCampaign(role, campaignId, title);
  // Href union (2835+ routes) exceeds TS complexity limit — explicit any cast
  const primaryHref =
    role === "worker"
      ? demoWorkerRewardsRoute()
      : role === "internal_manager"
        ? demoInternalDashboardRoute("projects")
        : (demoServiceCategoryRoute(
            "services",
            role,
            "Khám phá dịch vụ",
          ) as any);
  const secondaryHref =
    role === "customer"
      ? demoProductDetailRoute("desk", role)
      : (demoRoleHomeRoute(role) as any);

  return (
    <DetailScreenScaffold
      title={campaign.title}
      subtitle={campaign.subtitle}
      roleLabel={getRoleLabel(role)}
      fallbackHref={demoRoleHomeRoute(role)}
    >
      <View style={styles.heroWrap}>
        <AppImage
          source={campaign.image}
          containerStyle={styles.heroImageWrap}
          style={styles.heroImage}
        />
        <View style={styles.heroBadge}>
          <AppText variant="overline" color={colors.brandDark}>
            {campaign.badge}
          </AppText>
        </View>
      </View>

      <DetailSectionCard title="Thông điệp chiến dịch">
        <AppText variant="body">
          Nội dung campaign đang được trình bày theo đúng layout card lớn, bo
          góc mềm, nền sáng và badge xanh cốm giống cụm banner trên home.
        </AppText>
      </DetailSectionCard>

      <DetailSectionCard title="Điểm nổi bật">
        {[
          "Banner ratio giữ đúng tinh thần mobile-first và dễ thay ảnh CMS.",
          "Khoảng cách 16px ngoài card, card padding 16px nhất quán.",
          "Có thể mở rộng cho campaign theo khu vực, referral hoặc flash sale.",
        ].map((text) => (
          <View key={text} style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.brand} />
            <AppText
              variant="bodySmall"
              color={colors.textSecondary}
              style={styles.bulletText}
            >
              {text}
            </AppText>
          </View>
        ))}
      </DetailSectionCard>

      <DetailSectionCard title="Thời gian áp dụng">
        <View style={styles.timelineBlock}>
          <AppText variant="title">26/03/2026</AppText>
          <AppText variant="bodySmall" color={colors.textSecondary}>
            Áp dụng cho dự án Vinhomes Q9, ưu tiên đơn vật tư, nội thất và
            referral campaign theo role.
          </AppText>
        </View>
      </DetailSectionCard>

      <DetailSectionCard title="Hành động tiếp theo">
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.primaryButton}
            onPress={() => router.push(primaryHref as Href)}
          >
            <AppText variant="button" color={colors.white}>
              {role === "worker"
                ? "Xem thưởng giới thiệu"
                : role === "internal_manager"
                  ? "Mở dashboard dự án"
                  : "Khám phá dịch vụ"}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.secondaryButton}
            onPress={() => router.push(secondaryHref as Href)}
          >
            <AppText variant="button" color={colors.brandDark}>
              {role === "customer"
                ? "Xem sản phẩm liên quan"
                : "Về trang chính"}
            </AppText>
          </TouchableOpacity>
        </View>
      </DetailSectionCard>
    </DetailScreenScaffold>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    borderRadius: 20,
    overflow: "hidden",
  },
  heroImageWrap: {
    height: 204,
    borderRadius: 20,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  bulletText: {
    flex: 1,
  },
  timelineBlock: {
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSurface,
    gap: spacing.xs,
  },
  actionRow: {
    gap: spacing.sm,
  },
  primaryButton: {
    height: 50,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand,
  },
  secondaryButton: {
    height: 50,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft,
  },
});
