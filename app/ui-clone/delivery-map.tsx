import {
    DeliveryDriverCard,
    MapHeroCard,
    StatsGrid,
    StepProgress,
    TransportTimeline,
} from "@/components/ui-clone/blocks";
import {
    AppHeader,
    BaseCard,
    ScreenContainer,
    ScreenScroll,
    SectionHeading,
} from "@/components/ui-clone/primitives";
import { uiCloneTheme } from "@/constants/uiCloneTheme";
import { ordersMock, transportMock } from "@/data/uiCloneMock";
import { StyleSheet, Text, View } from "react-native";

const t = uiCloneTheme;
const mapPlaceholder = require("../../assets/banner/banner-home-6.jpg");

export default function DeliveryMapScreen() {
  const mapData = ordersMock.deliveryMap;

  return (
    <ScreenContainer>
      <ScreenScroll>
        <AppHeader title="Theo dõi xe giao hàng" />

        <MapHeroCard
          mapImage={mapPlaceholder}
          overlay={
            <DeliveryDriverCard
              avatar={transportMock.driver.avatar}
              driverName={transportMock.driver.name}
              plate={transportMock.driver.plate}
              rating={transportMock.driver.rating}
            />
          }
        />

        <BaseCard>
          <View style={styles.etaRow}>
            <View>
              <Text style={styles.etaTitle}>{mapData.etaLabel}</Text>
              <Text style={styles.etaSub}>{mapData.etaSub}</Text>
            </View>
            <Text style={styles.etaTime}>{mapData.etaTime}</Text>
          </View>
          <View style={{ marginTop: t.spacing.s6 }}>
            <StepProgress steps={mapData.progressSteps} currentStep={2} />
          </View>
        </BaseCard>

        <SectionHeading title="Thông tin đơn hàng" />
        <StatsGrid items={mapData.orderStats} />

        <SectionHeading title="Trạng thái vận chuyển" />
        <TransportTimeline nodes={transportMock.timeline} />
      </ScreenScroll>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  etaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  etaTitle: {
    ...t.typography.titleMd,
    color: t.colors.textPrimary,
  },
  etaSub: {
    ...t.typography.bodyMd,
    color: t.colors.textSecondary,
    marginTop: 2,
  },
  etaTime: {
    ...t.typography.h3,
    color: t.colors.brandStrong,
  },
});
