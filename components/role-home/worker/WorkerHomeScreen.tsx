import { RoleSwitcher } from "@/components/role-home/common";
import {
    IconGridSection,
    LiveVideoRow,
    MarketplaceSection,
    ProductHorizontalSection,
    PromoBanner,
    SearchMenuHeader,
} from "@/components/role-home/mobile-home";
import { useRole } from "@/context/RoleContext";
import {
    workerConstructionItems,
    workerDesignItems,
    workerFinishingItems,
    workerFurnitureProducts,
    workerHomeBanners,
    workerLiveItems,
    workerMaintenanceItems,
    workerMarketplaceItems,
    workerTopServiceItems,
    workerVideoItems,
} from "@/data/role-home/workerHomeUiData";
import { navigateByFeatureId, safeNavigate } from "@/utils/safeNavigation";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function WorkerHomeScreen() {
  const { role, setRole } = useRole();
  const [switcherVisible, setSwitcherVisible] = useState(false);

  const handleRoleSwitch = useCallback(
    async (newRole: any) => {
      await setRole(newRole);
    },
    [setRole],
  );

  const handleItemPress = useCallback((id: string) => {
    navigateByFeatureId(id);
  }, []);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <SearchMenuHeader
        placeholder="Tìm kiếm..."
        onSearchPress={() => safeNavigate("/search")}
        onMenuPress={() => setSwitcherVisible(true)}
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <IconGridSection
          title="DỊCH VỤ"
          titleColor="#7FAF4D"
          items={workerTopServiceItems}
          onItemPress={handleItemPress}
        />

        <PromoBanner
          image={workerHomeBanners.hero}
          marginTop={10}
          heightRatio={0.62}
        />

        <LiveVideoRow
          liveItems={workerLiveItems}
          videoItems={workerVideoItems}
          onLivePress={handleItemPress}
          onVideoPress={handleItemPress}
          onSeeMoreLive={() => safeNavigate("/(tabs)/live")}
          onSeeMoreVideo={() => safeNavigate("/(tabs)/live", { tab: "video" })}
        />

        <IconGridSection
          title="TIỆN ÍCH THIẾT KẾ"
          titleColor="#7FAF4D"
          searchPlaceholder="Tìm giải pháp, pccc..."
          items={workerDesignItems}
          onItemPress={handleItemPress}
        />
        <PromoBanner image={workerHomeBanners.design} />

        <IconGridSection
          title="TIỆN ÍCH XÂY DỰNG"
          titleColor="#7FAF4D"
          searchPlaceholder="Vật liệu, thợ, nhân công xây dựng..."
          items={workerConstructionItems}
          onItemPress={handleItemPress}
        />
        <PromoBanner image={workerHomeBanners.construction} />

        <IconGridSection
          title="TIỆN ÍCH HOÀN THIỆN"
          titleColor="#7FAF4D"
          searchPlaceholder="Thợ hoàn thiện, thợ sơn, thợ gạch..."
          items={workerFinishingItems}
          onItemPress={handleItemPress}
        />
        <PromoBanner image={workerHomeBanners.finishing} />

        <IconGridSection
          title="TIỆN ÍCH BẢO TRÌ - SỬA CHỮA"
          titleColor="#7FAF4D"
          searchPlaceholder="Thợ điện, nước, wifi, máy lạnh..."
          items={workerMaintenanceItems}
          onItemPress={handleItemPress}
        />
        <PromoBanner image={workerHomeBanners.maintenance} />

        <MarketplaceSection
          items={workerMarketplaceItems}
          onItemPress={handleItemPress}
        />

        <LiveVideoRow
          liveItems={workerLiveItems}
          videoItems={workerVideoItems}
          onLivePress={handleItemPress}
          onVideoPress={handleItemPress}
          onSeeMoreLive={() => safeNavigate("/(tabs)/live")}
          onSeeMoreVideo={() => safeNavigate("/(tabs)/live", { tab: "video" })}
        />

        <ProductHorizontalSection
          title="SẢN PHẨM NỘI THẤT"
          items={workerFurnitureProducts}
          onItemPress={handleItemPress}
          onSeeAllPress={() =>
            safeNavigate("/(tabs)/shop", { category: "furniture" })
          }
        />

        <PromoBanner
          image={workerHomeBanners.interiorDeal}
          marginTop={16}
          heightRatio={0.42}
        />

        <View style={s.footerSpace} />
      </ScrollView>

      <RoleSwitcher
        visible={switcherVisible}
        currentRole={role || "worker"}
        onSelect={handleRoleSwitch}
        onClose={() => setSwitcherVisible(false)}
      />
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
