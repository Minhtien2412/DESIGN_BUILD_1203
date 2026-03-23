/**
 * CustomerHomeView — Customer (Khách) home screen composition
 *
 * Sections:
 * 1. Hero Banner — Dịch vụ & Thiết kế
 * 2. TIỆN ÍCH THIẾT KẾ — Design utilities (8 icons) + search pill
 * 3. Promo Banner — Tìm kiến trúc sư
 * 4. TIỆN ÍCH XÂY DỰNG — Construction workers (12 icons) + search pill
 * 5. Promo Banner — Tìm thợ nhân công nhanh
 * 6. TIỆN ÍCH HOÀN THIỆN — Finishing workers (8 icons) + search pill
 * 7. Promo Banner — Hot deals
 * 8. CỘNG ĐỒNG — Community icons
 */
import { useCustomerHomeData } from "@/hooks/useCustomerHomeData";
import { useI18n } from "@/services/i18nService";
import { memo, useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import { BannerCarousel } from "./BannerCarousel";
import { CategoryIconGrid } from "./CategoryIconGrid";
import { CommunityIconGrid } from "./CommunityIconGrid";
import { HomeEmpty } from "./HomeEmpty";
import { HomeSkeleton } from "./HomeSkeleton";
import { SectionTitle } from "./SectionTitle";
import { WorkerGrid } from "./WorkerGrid";

export const CustomerHomeView = memo(() => {
  const { t } = useI18n();
  const [refreshing, setRefreshing] = useState(false);

  const {
    designGridItems,
    dynamicConstructionWorkers,
    dynamicFinishingWorkers,
    communityItems,
    designBanners,
    constructionBanners,
    shoppingBanners,
    isLoading,
    error,
    refresh,
  } = useCustomerHomeData();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh().finally(() => {
      setTimeout(() => setRefreshing(false), 1200);
    });
  }, [refresh]);

  if (isLoading && !refreshing) return <HomeSkeleton />;
  if (error && designGridItems.length === 0)
    return <HomeEmpty onRetry={onRefresh} />;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#0D9488"]}
          tintColor="#0D9488"
        />
      }
    >
      {/* ══════ 1. Hero Banner — Dịch vụ & Thiết kế ══════ */}
      <BannerCarousel data={designBanners} />

      {/* ══════ 2. TIỆN ÍCH THIẾT KẾ ══════ */}
      <SectionTitle
        title={t("home.designUtils")}
        searchHint={t("home.searchDesign")}
      />
      <CategoryIconGrid data={designGridItems} />

      {/* ══════ 3. Promo Banner — Xây dựng & Hoàn thiện ══════ */}
      <BannerCarousel data={constructionBanners} />

      {/* ══════ 4. TIỆN ÍCH XÂY DỰNG ══════ */}
      <SectionTitle
        title={t("home.constructionUtils")}
        searchHint={t("home.searchConstruction")}
      />
      <WorkerGrid data={dynamicConstructionWorkers.slice(0, 12)} />

      {/* ══════ 5. Promo Banner — Mua sắm ══════ */}
      <BannerCarousel data={shoppingBanners} />

      {/* ══════ 6. TIỆN ÍCH HOÀN THIỆN ══════ */}
      <SectionTitle
        title={t("home.finishingUtils")}
        searchHint={t("home.searchFinishing")}
      />
      <WorkerGrid data={dynamicFinishingWorkers.slice(0, 8)} />

      {/* ══════ 7. Promo Banner — Hot deals ══════ */}
      <BannerCarousel data={constructionBanners} />

      {/* ══════ 8. CỘNG ĐỒNG ══════ */}
      <SectionTitle
        title={t("home.community")}
        seeMore="/(tabs)/social"
        seeMoreLabel={t("home.seeMore")}
      />
      <CommunityIconGrid data={communityItems} />

      {/* Bottom spacing for tab bar */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 90,
  },
  bottomSpacer: {
    height: 20,
  },
});
