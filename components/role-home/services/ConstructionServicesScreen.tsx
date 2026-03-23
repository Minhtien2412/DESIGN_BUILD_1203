import {
    IconGridSection,
    LiveVideoRow,
    MarketplaceSection,
    ProductHorizontalSection,
    PromoBanner,
    SearchMenuHeader,
} from "@/components/role-home/mobile-home";
import {
    constructionServicesBanners,
    constructionServicesConstructionItems,
    constructionServicesControlIcons,
    constructionServicesDesignItems,
    constructionServicesFinishingItems,
    constructionServicesLiveItems,
    constructionServicesMaintenanceItems,
    constructionServicesMarketplaceItems,
    constructionServicesProducts,
    constructionServicesTopItems,
    constructionServicesVideoItems,
} from "@/data/role-home/constructionServicesData";
import { navigateByFeatureId, safeNavigate } from "@/utils/safeNavigation";
import { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ConstructionServicesScreen() {
  const handleItemPress = useCallback((id: string) => {
    navigateByFeatureId(id);
  }, []);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <SearchMenuHeader
        placeholder="Tìm kiếm..."
        onSearchPress={() => safeNavigate("/search")}
        onMenuPress={() => safeNavigate("/(tabs)/menu")}
        searchIconSource={constructionServicesControlIcons.search}
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <IconGridSection
          title="DỊCH VỤ"
          titleColor="#7FAF4D"
          items={constructionServicesTopItems}
          onItemPress={handleItemPress}
        />

        <PromoBanner
          image={constructionServicesBanners.hero}
          marginTop={10}
          heightRatio={0.62}
        />

        <LiveVideoRow
          liveItems={constructionServicesLiveItems}
          videoItems={constructionServicesVideoItems}
          onLivePress={handleItemPress}
          onVideoPress={handleItemPress}
          onSeeMoreLive={() => safeNavigate("/(tabs)/live")}
          onSeeMoreVideo={() => safeNavigate("/(tabs)/live", { tab: "video" })}
          videoBadgeIconSource={constructionServicesControlIcons.play}
        />

        <IconGridSection
          title="TIỆN ÍCH THIẾT KẾ"
          titleColor="#7FAF4D"
          searchPlaceholder="Tìm giải pháp, pccc..."
          searchIconSource={constructionServicesControlIcons.search}
          items={constructionServicesDesignItems}
          onItemPress={handleItemPress}
        />
        <PromoBanner image={constructionServicesBanners.design} />

        <IconGridSection
          title="TIỆN ÍCH XÂY DỰNG"
          titleColor="#7FAF4D"
          searchPlaceholder="Vật liệu, thợ, nhân công xây dựng..."
          searchIconSource={constructionServicesControlIcons.search}
          items={constructionServicesConstructionItems}
          onItemPress={handleItemPress}
        />
        <PromoBanner image={constructionServicesBanners.construction} />

        <IconGridSection
          title="TIỆN ÍCH HOÀN THIỆN"
          titleColor="#7FAF4D"
          searchPlaceholder="Thợ hoàn thiện, thợ sơn, thợ gạch..."
          searchIconSource={constructionServicesControlIcons.search}
          items={constructionServicesFinishingItems}
          onItemPress={handleItemPress}
        />
        <PromoBanner image={constructionServicesBanners.finishing} />

        <IconGridSection
          title="TIỆN ÍCH BẢO TRÌ - SỬA CHỮA"
          titleColor="#7FAF4D"
          searchPlaceholder="Thợ điện, nước, wifi, máy lạnh..."
          searchIconSource={constructionServicesControlIcons.search}
          items={constructionServicesMaintenanceItems}
          onItemPress={handleItemPress}
        />
        <PromoBanner image={constructionServicesBanners.maintenance} />

        <MarketplaceSection
          items={constructionServicesMarketplaceItems}
          onItemPress={handleItemPress}
          searchIconSource={constructionServicesControlIcons.search}
        />

        <LiveVideoRow
          liveItems={constructionServicesLiveItems}
          videoItems={constructionServicesVideoItems}
          onLivePress={handleItemPress}
          onVideoPress={handleItemPress}
          onSeeMoreLive={() => safeNavigate("/(tabs)/live")}
          onSeeMoreVideo={() => safeNavigate("/(tabs)/live", { tab: "video" })}
          videoBadgeIconSource={constructionServicesControlIcons.play}
        />

        <ProductHorizontalSection
          title="SẢN PHẨM NỘI THẤT"
          items={constructionServicesProducts}
          onItemPress={handleItemPress}
          onSeeAllPress={() =>
            safeNavigate("/(tabs)/shop", { category: "furniture" })
          }
        />

        <PromoBanner
          image={constructionServicesBanners.interiorDeal}
          marginTop={16}
          heightRatio={0.42}
        />

        <View style={s.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  footerSpace: {
    height: 22,
  },
});
