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
    customerDesignItems,
    customerFurnitureProducts,
    customerHomeBanners,
    customerLiveItems,
    customerMaintenanceItems,
    customerMarketplaceItems,
    customerTopServiceItems,
    customerVideoItems,
} from "@/data/role-home/customerHomeUiData";
import { navigateByFeatureId, safeNavigate } from "@/utils/safeNavigation";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function CustomerHomeScreen() {
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
          items={customerTopServiceItems}
          onItemPress={handleItemPress}
        />

        <PromoBanner
          image={customerHomeBanners.hero}
          marginTop={10}
          heightRatio={0.62}
        />

        <LiveVideoRow
          liveItems={customerLiveItems}
          videoItems={customerVideoItems}
          onLivePress={handleItemPress}
          onVideoPress={handleItemPress}
          onSeeMoreLive={() => safeNavigate("/(tabs)/live")}
          onSeeMoreVideo={() => safeNavigate("/(tabs)/live", { tab: "video" })}
        />

        <IconGridSection
          title="TIỆN ÍCH THIẾT KẾ"
          titleColor="#7FAF4D"
          searchPlaceholder="Tìm giải pháp, pccc..."
          items={customerDesignItems}
          onItemPress={handleItemPress}
        />
        <PromoBanner image={customerHomeBanners.design} />

        <IconGridSection
          title="TIỆN ÍCH BẢO TRÌ - SỬA CHỮA"
          titleColor="#7FAF4D"
          searchPlaceholder="Thợ sửa điện, nước, wifi, máy lạnh..."
          items={customerMaintenanceItems}
          onItemPress={handleItemPress}
        />
        <PromoBanner image={customerHomeBanners.maintenance} />

        <MarketplaceSection
          items={customerMarketplaceItems}
          onItemPress={handleItemPress}
        />

        <LiveVideoRow
          liveItems={customerLiveItems}
          videoItems={customerVideoItems}
          onLivePress={handleItemPress}
          onVideoPress={handleItemPress}
          onSeeMoreLive={() => safeNavigate("/(tabs)/live")}
          onSeeMoreVideo={() => safeNavigate("/(tabs)/live", { tab: "video" })}
        />

        <ProductHorizontalSection
          title="SẢN PHẨM NỘI THẤT"
          items={customerFurnitureProducts}
          onItemPress={handleItemPress}
          onSeeAllPress={() =>
            safeNavigate("/(tabs)/shop", { category: "furniture" })
          }
        />

        <PromoBanner
          image={customerHomeBanners.interiorDeal}
          marginTop={16}
          heightRatio={0.42}
        />

        <View style={s.footerSpace} />
      </ScrollView>

      <RoleSwitcher
        visible={switcherVisible}
        currentRole={role || "customer"}
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
