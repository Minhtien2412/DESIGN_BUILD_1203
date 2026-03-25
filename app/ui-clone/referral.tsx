import { RewardMilestone, StatsGrid } from "@/components/ui-clone/blocks";
import {
    BaseCard,
    EmptyQR,
    PrimaryButton,
    ScreenContainer,
    ScreenScroll,
    SecondaryButton,
    SectionHeading
} from "@/components/ui-clone/primitives";
import { uiCloneTheme } from "@/constants/uiCloneTheme";
import { referralsMock } from "@/data/uiCloneMock";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const t = uiCloneTheme;

export default function ReferralScreen() {
  const data = referralsMock;

  return (
    <ScreenContainer>
      <ScreenScroll>
        <View style={styles.heroTop}>
          <Text style={styles.heroTitle}>
            Giới thiệu thợ – Nhận quà liền tay
          </Text>
          <Text style={styles.heroSubtitle}>{data.subtitle}</Text>
        </View>

        <BaseCard style={styles.qrMainCard} shadow="md">
          <EmptyQR />
          <Text style={styles.codeLabel}>Mã giới thiệu:</Text>
          <Text style={styles.codeValue}>{data.code}</Text>
          <View style={styles.btnRow}>
            <PrimaryButton
              label="Chia sẻ mã QR"
              leftIcon="share-social-outline"
              style={{ flex: 1 }}
            />
            <SecondaryButton
              label="Sao chép link mời"
              leftIcon="copy-outline"
              style={{ flex: 1 }}
            />
          </View>
          <Text style={styles.qrNote}>{data.note}</Text>
        </BaseCard>

        <SectionHeading
          title="Thống kê cá nhân"
          actionLabel="Siêu cộng tác viên"
          actionColor={t.colors.warning}
        />
        <StatsGrid
          items={data.stats.map((item) => ({
            key: item.key,
            label: item.label,
            value: item.value,
          }))}
        />

        <RewardMilestone
          items={data.milestones}
          reachedCount={1}
          headerText={data.achievementText}
          helperText={data.specialMilestoneText}
        />

        <SectionHeading title="Cách hoạt động" />
        <BaseCard>
          <View style={styles.howRow}>
            {data.howItWorks.map((item, idx) => (
              <View key={item} style={styles.howCol}>
                <View style={styles.howIcon}>
                  <Ionicons
                    name={
                      ["qr-code-outline", "person-add-outline", "gift-outline"][
                        idx
                      ] as
                        | "qr-code-outline"
                        | "person-add-outline"
                        | "gift-outline"
                    }
                    size={20}
                    color={t.colors.brandStrong}
                  />
                </View>
                <Text style={styles.howText}>{item}</Text>
              </View>
            ))}
          </View>
        </BaseCard>

        <SectionHeading title="Khu vực quà tặng" />
        <View style={styles.rewardCardRow}>
          {data.rewardCards.map((reward) => (
            <BaseCard key={reward.id} style={styles.rewardCard}>
              <Text style={styles.rewardCardTitle}>{reward.title}</Text>
              <Text style={styles.rewardCardSub}>{reward.condition}</Text>
            </BaseCard>
          ))}
        </View>

        <PrimaryButton label="Mời thợ ngay" leftIcon="person-add-outline" />
        <SecondaryButton label="Xem lịch sử giới thiệu" />
      </ScreenScroll>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroTop: {
    backgroundColor: t.colors.brand,
    borderRadius: t.radius.r8,
    padding: t.spacing.s8,
    marginBottom: t.spacing.s2,
  },
  heroTitle: {
    ...t.typography.titleLg,
    color: t.colors.textOnBrand,
  },
  heroSubtitle: {
    ...t.typography.bodyMd,
    color: t.colors.textOnBrand,
    opacity: 0.92,
    marginTop: t.spacing.s2,
  },
  qrMainCard: {
    marginTop: -20,
  },
  codeLabel: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
    textAlign: "center",
    marginTop: t.spacing.s4,
  },
  codeValue: {
    ...t.typography.h2,
    color: t.colors.brandStrong,
    textAlign: "center",
    marginTop: 2,
  },
  btnRow: {
    marginTop: t.spacing.s6,
    flexDirection: "row",
    gap: t.spacing.s4,
  },
  qrNote: {
    ...t.typography.bodySm,
    color: t.colors.textSecondary,
    textAlign: "center",
    marginTop: t.spacing.s5,
  },
  howRow: {
    flexDirection: "row",
    gap: t.spacing.s4,
  },
  howCol: {
    flex: 1,
    alignItems: "center",
  },
  howIcon: {
    width: 44,
    height: 44,
    borderRadius: t.radius.rPill,
    backgroundColor: t.colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  howText: {
    ...t.typography.bodySm,
    color: t.colors.textSecondary,
    textAlign: "center",
    marginTop: t.spacing.s3,
  },
  rewardCardRow: {
    flexDirection: "row",
    gap: t.spacing.s4,
  },
  rewardCard: {
    flex: 1,
    minHeight: 84,
    justifyContent: "center",
  },
  rewardCardTitle: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
  },
  rewardCardSub: {
    ...t.typography.bodySm,
    color: t.colors.textSecondary,
    marginTop: 2,
  },
});
