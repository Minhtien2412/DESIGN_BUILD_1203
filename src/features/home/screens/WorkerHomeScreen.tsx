import { UserRole } from "@/types/role";
import { router } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import AppContainer from "../../shared/components/AppContainer";
import AppText from "../../shared/components/AppText";
import BottomTabBar, {
    BottomTabItem,
} from "../../shared/components/BottomTabBar";
import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { shadows } from "../../shared/theme/shadows";
import { spacing } from "../../shared/theme/spacing";
import AppHeader from "../components/AppHeader";
import PromoBanner from "../components/PromoBanner";
import SectionTitle from "../components/SectionTitle";
import ServiceSection from "../components/ServiceSection";
import {
    BannerData,
    ServiceItem,
    ServiceSectionData,
} from "../mock/home.types";
import { workerHomeMock } from "../mock/workerHome.mock";
import {
    demoBannerCampaignRoute,
    demoServiceCategoryRoute,
    demoWorkerRewardsRoute,
    demoWorkerTabRoute,
} from "../navigation/demoRoutes";

function RewardStats() {
  const stats = [
    { id: "introduced", label: "Số thợ đã giới thiệu", value: "18" },
    { id: "success", label: "Đăng ký thành công", value: "16" },
    { id: "bonus", label: "Phần quà hiện tại", value: "100.000đ" },
    { id: "next", label: "Mục tiêu tiếp theo", value: "20 thợ (TV)" },
  ];

  return (
    <View style={styles.rewardWrap}>
      <SectionTitle title="Thống kê cá nhân" />
      <View style={styles.rewardGrid}>
        {stats.map((stat) => (
          <View key={stat.id} style={styles.rewardCard}>
            <AppText variant="micro" color={colors.textSecondary}>
              {stat.label}
            </AppText>
            <AppText variant="h3" style={styles.rewardValue}>
              {stat.value}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function WorkerHomeScreen() {
  const role: UserRole = "worker";

  const tabs: BottomTabItem[] = workerHomeMock.tabs.map((item) => ({
    ...item,
    icon: item.icon as BottomTabItem["icon"],
  }));

  const handleServicePress = (
    _item: ServiceItem,
    section: ServiceSectionData,
  ) => {
    router.push(demoServiceCategoryRoute(section.id, role, section.title));
  };

  const handleSectionAction = (section: ServiceSectionData) => {
    router.push(demoServiceCategoryRoute(section.id, role, section.title));
  };

  const handleBannerPress = (banner: BannerData) => {
    if (banner.id === "worker-referral") {
      router.push(demoWorkerRewardsRoute());
      return;
    }

    router.push(
      demoBannerCampaignRoute(
        banner.id,
        role,
        banner.badge ?? "Chi tiết chiến dịch",
      ),
    );
  };

  return (
    <AppContainer>
      <AppHeader
        title={workerHomeMock.headerTitle}
        subtitle={workerHomeMock.headerSubtitle}
        searchPlaceholder={workerHomeMock.searchPlaceholder}
        eyebrow="Thợ / Freelancer"
        onSearchPress={() =>
          router.push(
            demoServiceCategoryRoute(
              "worker-construction",
              role,
              "Tìm việc theo tay nghề",
            ),
          )
        }
        onMenuPress={() => router.push(demoWorkerRewardsRoute())}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <PromoBanner
          banner={workerHomeMock.heroBanner}
          onPress={handleBannerPress}
        />
        <ServiceSection
          section={workerHomeMock.designUtilities}
          compact
          onItemPress={handleServicePress}
          onActionPress={handleSectionAction}
        />
        <PromoBanner
          banner={workerHomeMock.designBanner}
          onPress={handleBannerPress}
        />
        <ServiceSection
          section={workerHomeMock.constructionUtilities}
          compact
          onItemPress={handleServicePress}
          onActionPress={handleSectionAction}
        />
        <PromoBanner
          banner={workerHomeMock.constructionBanner}
          onPress={handleBannerPress}
        />
        <ServiceSection
          section={workerHomeMock.finishingUtilities}
          compact
          onItemPress={handleServicePress}
          onActionPress={handleSectionAction}
        />
        <PromoBanner
          banner={workerHomeMock.finishingBanner}
          onPress={handleBannerPress}
        />

        <RewardStats />
        <PromoBanner
          banner={workerHomeMock.referralBanner}
          onPress={handleBannerPress}
        />

        <View style={styles.ctaCard}>
          <AppText variant="h3">Mời thợ mới - nhận quà liền tay</AppText>
          <AppText variant="bodySmall" color={colors.textSecondary}>
            Chia sẻ mã QR, theo dõi mốc quà thưởng và đẩy nhanh tỷ lệ nhận job
            chất lượng quanh bạn.
          </AppText>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.ctaButton}
            onPress={() => router.push(demoWorkerRewardsRoute())}
          >
            <AppText variant="button" color={colors.white}>
              Mời thợ ngay
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomTabBar
        items={tabs}
        onItemPress={(item) => router.push(demoWorkerTabRoute(item.id))}
      />
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 132,
  },
  rewardWrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  rewardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: spacing.md,
    rowGap: spacing.sm,
  },
  rewardCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: spacing.xs,
    ...shadows.card,
  },
  rewardValue: {
    marginTop: 2,
  },
  ctaCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: spacing.sm,
    ...shadows.card,
  },
  ctaButton: {
    marginTop: spacing.sm,
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.cta,
  },
});
