/**
 * WorkerHomeView — Worker (Thợ) home screen composition
 *
 * Sections:
 * 1. DỊCH VỤ — Core services grid (3 rows × 4 cols)
 * 2. DESIGN LIVE — Horizontal live thumbnails
 * 3. Banner — Dịch vụ & Thiết kế
 * 4. TIỆN ÍCH BẢO TRÌ - SỬA CHỮA — Maintenance (2×4) + search pill
 * 5. Banner — Bảo trì
 * 6. TIỆN ÍCH MUA SẮM TRANG THIẾT BỊ — Equipment (2×4) + search pill
 * 7. LIVE & VIDEO — Dual horizontal sections
 * 8. SẢN PHẨM NỘI THẤT — Product cards horizontal
 * 9. Banner — Mua sắm promo
 * 10. CỘNG ĐỒNG — Community icons
 * 11. VIDEO CONSTRUCTIONS — Category tags + video thumbnails
 */
import {
    DESIGN_BANNERS,
    MAINTENANCE_BANNERS,
    SHOPPING_BANNERS,
} from "@/data/home-banners";
import {
    COMMUNITY_ITEMS,
    EQUIPMENT_ITEMS,
    MAINTENANCE_WORKERS,
    SERVICES,
} from "@/data/home-data";
import { useHomeData } from "@/hooks/useHomeData";
import { useProductsAsync } from "@/hooks/useProductsAsync";
import { useI18n } from "@/services/i18nService";
import { memo, useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import { BannerCarousel } from "./BannerCarousel";
import { CategoryIconGrid, GridItem } from "./CategoryIconGrid";
import { CategoryTagRow } from "./CategoryTagRow";
import { CommunityIconGrid } from "./CommunityIconGrid";
import { DesignLiveSection } from "./DesignLiveSection";
import { HomeEmpty } from "./HomeEmpty";
import { HomeSkeleton } from "./HomeSkeleton";
import { ProductSection } from "./ProductSection";
import { SectionTitle } from "./SectionTitle";
import { VideoThumbnails } from "./VideoThumbnails";
import { WorkerGrid } from "./WorkerGrid";

export const WorkerHomeView = memo(() => {
  const { t } = useI18n();
  const [refreshing, setRefreshing] = useState(false);

  const {
    services: apiServices,
    equipment: apiEquipment,
    banners: apiBanners,
    isLoading,
    error,
    refresh: refreshData,
  } = useHomeData({}, { sections: ["services", "equipment", "banners"] });

  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    refresh: refreshProducts,
  } = useProductsAsync();

  // Merge API results with local fallbacks
  const servicesGrid: GridItem[] = (apiServices.length ? apiServices : SERVICES)
    .slice(0, 12)
    .map((s) => ({
      id: typeof s.id === "string" ? parseInt(s.id, 10) || 0 : (s.id as number),
      label: s.label ?? (s as any).name ?? "",
      icon: s.icon,
      route: s.route ?? "/services",
    }));

  const equipmentGrid: GridItem[] = (
    apiEquipment.length ? apiEquipment : EQUIPMENT_ITEMS
  )
    .slice(0, 8)
    .map((e) => ({
      id: typeof e.id === "string" ? parseInt(e.id, 10) || 0 : (e.id as number),
      label: e.label ?? (e as any).name ?? "",
      icon: e.icon,
      route: e.route ?? "/categories/equipment",
    }));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([refreshData(), refreshProducts()]).finally(() => {
      setTimeout(() => setRefreshing(false), 600);
    });
  }, [refreshData, refreshProducts]);

  if (isLoading && !refreshing) return <HomeSkeleton />;
  if (error && !apiServices.length) return <HomeEmpty onRetry={onRefresh} />;

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
      {/* ══════ 1. DỊCH VỤ ══════ */}
      <SectionTitle title={t("home.services")} />
      <CategoryIconGrid data={servicesGrid} />

      {/* ══════ 2. DESIGN LIVE ══════ */}
      <SectionTitle
        title={t("home.designLive")}
        seeMore="/live"
        seeMoreLabel={t("home.seeMore")}
      />
      <DesignLiveSection />

      {/* ══════ 3. Banner — Dịch vụ & Thiết kế ══════ */}
      <BannerCarousel data={DESIGN_BANNERS} />

      {/* ══════ 4. TIỆN ÍCH BẢO TRÌ - SỬA CHỮA ══════ */}
      <SectionTitle
        title={t("home.maintenanceUtils")}
        searchHint={t("home.searchMaintenance")}
      />
      <WorkerGrid data={MAINTENANCE_WORKERS} />

      {/* ══════ 5. Banner — Bảo trì ══════ */}
      <BannerCarousel data={MAINTENANCE_BANNERS} />

      {/* ══════ 6. TIỆN ÍCH MUA SẮM TRANG THIẾT BỊ ══════ */}
      <SectionTitle
        title={t("home.equipmentUtils")}
        searchHint={t("home.searchEquipment")}
      />
      <CategoryIconGrid data={equipmentGrid} />

      {/* ══════ 7. LIVE & VIDEO — Dual sections ══════ */}
      <View style={styles.dualSection}>
        <View style={styles.dualHalf}>
          <SectionTitle title="LIVE" />
          <DesignLiveSection />
        </View>
        <View style={styles.dualHalf}>
          <SectionTitle title="VIDEO" />
          <VideoThumbnails offset={0} />
        </View>
      </View>

      {/* ══════ 8. SẢN PHẨM NỘI THẤT ══════ */}
      <SectionTitle
        title="SẢN PHẨM NỘI THẤT"
        seeMore="/categories/furniture"
        seeMoreLabel={t("home.seeMore")}
      />
      <ProductSection
        products={products}
        isLoading={productsLoading}
        error={productsError}
      />

      {/* ══════ 9. Banner — Mua sắm promo ══════ */}
      <BannerCarousel data={SHOPPING_BANNERS} />

      {/* ══════ 10. CỘNG ĐỒNG ══════ */}
      <SectionTitle
        title={t("home.community")}
        seeMore="/(tabs)/social"
        seeMoreLabel={t("home.seeMore")}
      />
      <CommunityIconGrid data={COMMUNITY_ITEMS} />

      {/* ══════ 11. VIDEO CONSTRUCTIONS ══════ */}
      <SectionTitle title={t("home.videoConstructions")} />
      <VideoThumbnails offset={6} />
      <CategoryTagRow />

      {/* Bottom spacing for tab bar */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 90,
  },
  dualSection: {
    marginTop: 12,
  },
  dualHalf: {
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 20,
  },
});
