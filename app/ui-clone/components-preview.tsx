import {
    GalleryRow,
    PricingTable,
    RewardMilestone,
    StatsGrid,
    UtilityGrid,
} from "@/components/ui-clone/blocks";
import {
    AppHeader,
    BaseCard,
    PrimaryButton,
    ScreenContainer,
    ScreenScroll,
    SecondaryButton,
    SectionHeading,
} from "@/components/ui-clone/primitives";
import { uiCloneTheme } from "@/constants/uiCloneTheme";
import { ordersMock, referralsMock, utilitiesMock } from "@/data/uiCloneMock";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const t = uiCloneTheme;

export default function ComponentsPreviewScreen() {
  return (
    <ScreenContainer>
      <ScreenScroll>
        <AppHeader title="Components Preview" subtitle="Foundation UI blocks" />

        <SectionHeading title="Buttons" />
        <BaseCard>
          <View style={styles.rowGap}>
            <PrimaryButton label="Primary Action" leftIcon="flash-outline" />
            <SecondaryButton
              label="Secondary Action"
              leftIcon="sparkles-outline"
            />
          </View>
        </BaseCard>

        <SectionHeading title="Stats Grid" />
        <StatsGrid
          items={[
            {
              key: "a",
              label: "Orders",
              value: "24",
              icon: "document-text-outline",
            },
            { key: "b", label: "Delivery", value: "9", icon: "car-outline" },
            { key: "c", label: "Workers", value: "42", icon: "people-outline" },
            { key: "d", label: "Rating", value: "4.8", icon: "star-outline" },
          ]}
        />

        <SectionHeading title="Pricing + Gallery" />
        <GalleryRow
          images={ordersMock.materialOrder.materialThumbs}
          extraLabel="+5"
        />
        <PricingTable
          rows={ordersMock.materialOrder.quotationItems.slice(0, 4)}
        />

        <SectionHeading title="Rewards + Utility" />
        <RewardMilestone
          items={referralsMock.milestones}
          reachedCount={1}
          headerText={referralsMock.achievementText}
        />
        <UtilityGrid items={utilitiesMock.slice(0, 8)} />

        <BaseCard>
          <Text style={styles.helpText}>
            Màn preview giúp kiểm tra nhanh tính nhất quán của design system
            trước khi release.
          </Text>
          <PrimaryButton
            label="Quay lại index"
            leftIcon="arrow-back-outline"
            onPress={() => router.push("/ui-clone")}
          />
        </BaseCard>
      </ScreenScroll>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  rowGap: {
    gap: t.spacing.s4,
  },
  helpText: {
    ...t.typography.bodyMd,
    color: t.colors.textSecondary,
    marginBottom: t.spacing.s4,
  },
});
