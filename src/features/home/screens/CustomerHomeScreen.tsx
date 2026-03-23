import { UserRole } from "@/types/role";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import AppContainer from "../../shared/components/AppContainer";
import AppText from "../../shared/components/AppText";
import BottomTabBar, {
    BottomTabItem,
} from "../../shared/components/BottomTabBar";
import { colors } from "../../shared/theme/colors";
import { spacing } from "../../shared/theme/spacing";
import AppHeader from "../components/AppHeader";
import LiveCard from "../components/LiveCard";
import ProductCard from "../components/ProductCard";
import PromoBanner from "../components/PromoBanner";
import SectionTitle from "../components/SectionTitle";
import ServiceSection from "../components/ServiceSection";
import VideoCard from "../components/VideoCard";
import { customerHomeMock } from "../mock/customerHome.mock";
import {
    BannerData,
    MediaCardData,
    ProductCardData,
    ServiceItem,
    ServiceSectionData,
} from "../mock/home.types";
import {
    demoBannerCampaignRoute,
    demoCustomerTabRoute,
    demoProductDetailRoute,
    demoServiceCategoryRoute,
} from "../navigation/demoRoutes";

function MediaSection({
  title,
  items,
  onItemPress,
  onActionPress,
}: {
  title: string;
  items: MediaCardData[];
  onItemPress?: (item: MediaCardData) => void;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.mediaSection}>
      <SectionTitle
        title={title}
        actionLabel="Xem tất cả"
        onActionPress={onActionPress}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mediaScrollContent}
      >
        {items.map((item) =>
          item.badge === "LIVE" ? (
            <LiveCard key={item.id} item={item} onPress={onItemPress} />
          ) : (
            <VideoCard key={item.id} item={item} onPress={onItemPress} />
          ),
        )}
      </ScrollView>
    </View>
  );
}

export default function CustomerHomeScreen() {
  const role: UserRole = "customer";

  const tabs: BottomTabItem[] = customerHomeMock.tabs.map((item) => ({
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
    router.push(
      demoBannerCampaignRoute(
        banner.id,
        role,
        banner.badge ?? "Chiến dịch nổi bật",
      ),
    );
  };

  const handleMediaPress = (item: MediaCardData) => {
    router.push(demoBannerCampaignRoute(item.id, role, item.title));
  };

  const handleProductPress = (item: ProductCardData) => {
    router.push(demoProductDetailRoute(item.id, role));
  };

  return (
    <AppContainer>
      <AppHeader
        title={customerHomeMock.headerTitle}
        subtitle={customerHomeMock.headerSubtitle}
        searchPlaceholder={customerHomeMock.searchPlaceholder}
        eyebrow="Khách hàng"
        onSearchPress={() =>
          router.push(demoServiceCategoryRoute("services", role, "Tìm dịch vụ"))
        }
        onMenuPress={() =>
          router.push(
            demoBannerCampaignRoute("customer-hero", role, "Menu khách hàng"),
          )
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ServiceSection
          section={customerHomeMock.services}
          onItemPress={handleServicePress}
          onActionPress={handleSectionAction}
        />
        <PromoBanner
          banner={customerHomeMock.heroBanner}
          onPress={handleBannerPress}
        />
        <MediaSection
          title="Live / Video nổi bật"
          items={customerHomeMock.media}
          onItemPress={handleMediaPress}
          onActionPress={() =>
            router.push(
              demoBannerCampaignRoute("live-1", role, "Live / Video nổi bật"),
            )
          }
        />
        <ServiceSection
          section={customerHomeMock.designUtilities}
          compact
          onItemPress={handleServicePress}
          onActionPress={handleSectionAction}
        />
        <PromoBanner
          banner={customerHomeMock.designBanner}
          onPress={handleBannerPress}
        />
        <ServiceSection
          section={customerHomeMock.constructionUtilities}
          compact
          onItemPress={handleServicePress}
          onActionPress={handleSectionAction}
        />
        <PromoBanner
          banner={customerHomeMock.constructionBanner}
          onPress={handleBannerPress}
        />
        <ServiceSection
          section={customerHomeMock.finishingUtilities}
          compact
          onItemPress={handleServicePress}
          onActionPress={handleSectionAction}
        />
        <PromoBanner
          banner={customerHomeMock.finishingBanner}
          onPress={handleBannerPress}
        />
        <ServiceSection
          section={customerHomeMock.maintenanceUtilities}
          compact
          onItemPress={handleServicePress}
          onActionPress={handleSectionAction}
        />
        <PromoBanner
          banner={customerHomeMock.maintenanceBanner}
          onPress={handleBannerPress}
        />
        <ServiceSection
          section={customerHomeMock.marketplaceUtilities}
          compact
          onItemPress={handleServicePress}
          onActionPress={handleSectionAction}
        />
        <MediaSection
          title="Live / Video thị trường"
          items={customerHomeMock.secondaryMedia}
          onItemPress={handleMediaPress}
          onActionPress={() =>
            router.push(
              demoBannerCampaignRoute(
                customerHomeMock.secondaryMedia[0]?.id ?? "video-1",
                role,
                "Live / Video thị trường",
              ),
            )
          }
        />

        <View style={styles.productSection}>
          <SectionTitle
            title="Sản phẩm nội thất"
            actionLabel="Xem tất cả"
            onActionPress={() =>
              router.push(demoProductDetailRoute("desk", role))
            }
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productScrollContent}
          >
            {customerHomeMock.products.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onPress={handleProductPress}
              />
            ))}
          </ScrollView>
        </View>

        <PromoBanner
          banner={customerHomeMock.finalBanner}
          onPress={handleBannerPress}
        />

        <View style={styles.footerCopy}>
          <AppText
            variant="bodySmall"
            color={colors.textSecondary}
            align="center"
          >
            Figma-first home experience cho khách hàng: dịch vụ, tiện ích, live
            content và market place nội thất.
          </AppText>
        </View>
      </ScrollView>

      <BottomTabBar
        items={tabs}
        onItemPress={(item) => router.push(demoCustomerTabRoute(item.id))}
      />
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 132,
  },
  mediaSection: {
    marginBottom: spacing.md,
  },
  mediaScrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    gap: spacing.md,
  },
  productSection: {
    marginBottom: spacing.md,
  },
  productScrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    gap: spacing.md,
  },
  footerCopy: {
    paddingHorizontal: spacing.xxl,
    marginTop: 4,
  },
});
