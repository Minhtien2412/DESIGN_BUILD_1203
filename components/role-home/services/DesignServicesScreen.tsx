import {
    IconGridSection,
    LiveVideoRow,
    MarketplaceSection,
    ProductHorizontalSection,
    PromoBanner,
    SearchMenuHeader,
} from "@/components/role-home/mobile-home";
import {
    designServicesBanners,
    designServicesControlIcons,
    designServicesDesignItems,
    designServicesLiveItems,
    designServicesMaintenanceItems,
    designServicesMarketplaceItems,
    designServicesProducts,
    designServicesTopItems,
    designServicesVideoItems,
} from "@/data/role-home/designServicesData";
import { navigateByFeatureId, safeNavigate } from "@/utils/safeNavigation";
import { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function DesignServicesScreen() {
  const handleItemPress = useCallback((id: string) => {
    navigateByFeatureId(id);
  }, []);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <SearchMenuHeader
        placeholder="Tìm kiếm..."
        onSearchPress={() => safeNavigate("/search")}
        onMenuPress={() => safeNavigate("/(tabs)/menu")}
        searchIconSource={designServicesControlIcons.search}
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <IconGridSection
          title="DỊCH VỤ"
          titleColor="#7FAF4D"
          items={designServicesTopItems}
          onItemPress={handleItemPress}
        />

        <PromoBanner
          image={designServicesBanners.hero}
          marginTop={10}
          heightRatio={0.62}
        />

        <LiveVideoRow
          liveItems={designServicesLiveItems}
          videoItems={designServicesVideoItems}
          onLivePress={handleItemPress}
          onVideoPress={handleItemPress}
          onSeeMoreLive={() => safeNavigate("/(tabs)/live")}
          onSeeMoreVideo={() => safeNavigate("/(tabs)/live", { tab: "video" })}
          videoBadgeIconSource={designServicesControlIcons.play}
        />

        <IconGridSection
          title="TIỆN ÍCH THIẾT KẾ"
          titleColor="#7FAF4D"
          searchPlaceholder="Tìm giải pháp, pccc..."
          searchIconSource={designServicesControlIcons.search}
          items={designServicesDesignItems}
          onItemPress={handleItemPress}
        />
        <PromoBanner image={designServicesBanners.design} />

        <IconGridSection
          title="TIỆN ÍCH BẢO TRÌ - SỬA CHỮA"
          titleColor="#7FAF4D"
          searchPlaceholder="Thợ sửa điện, nước, wifi, máy lạnh..."
          searchIconSource={designServicesControlIcons.search}
          items={designServicesMaintenanceItems}
          onItemPress={handleItemPress}
        />
        <PromoBanner image={designServicesBanners.maintenance} />

        <MarketplaceSection
          items={designServicesMarketplaceItems}
          onItemPress={handleItemPress}
          searchIconSource={designServicesControlIcons.search}
        />

        <LiveVideoRow
          liveItems={designServicesLiveItems}
          videoItems={designServicesVideoItems}
          onLivePress={handleItemPress}
          onVideoPress={handleItemPress}
          onSeeMoreLive={() => safeNavigate("/(tabs)/live")}
          onSeeMoreVideo={() => safeNavigate("/(tabs)/live", { tab: "video" })}
          videoBadgeIconSource={designServicesControlIcons.play}
        />

        <ProductHorizontalSection
          title="SẢN PHẨM NỘI THẤT"
          items={designServicesProducts}
          onItemPress={handleItemPress}
          onSeeAllPress={() =>
            safeNavigate("/(tabs)/shop", { category: "furniture" })
          }
        />

        <PromoBanner
          image={designServicesBanners.interiorDeal}
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
