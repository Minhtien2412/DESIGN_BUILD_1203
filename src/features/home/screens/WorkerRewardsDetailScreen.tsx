import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { copyToClipboard } from "@/shared/utils/clipboardUtils";
import AppImage from "../../shared/components/AppImage";
import AppText from "../../shared/components/AppText";
import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { shadows } from "../../shared/theme/shadows";
import { spacing } from "../../shared/theme/spacing";
import DetailScreenScaffold, {
    DetailSectionCard,
} from "../components/DetailScreenScaffold";
import { getRoleLabel, resolveWorkerRewardData } from "../mock/detailResolvers";
import { demoRoleHomeRoute } from "../navigation/demoRoutes";

export default function WorkerRewardsDetailScreen() {
  const data = resolveWorkerRewardData();
  const [copyStatus, setCopyStatus] = useState("");

  const handleCopyCode = async () => {
    const copied = await copyToClipboard(data.referralCode);
    setCopyStatus(
      copied
        ? `Đã sao chép mã ${data.referralCode}`
        : "Sao chép chưa thành công",
    );
  };

  return (
    <DetailScreenScaffold
      title="Giới thiệu thợ - Nhận quà liền tay"
      subtitle="Theo dõi referral, mốc thưởng và phần quà đang chờ mở khóa."
      roleLabel={getRoleLabel("worker")}
      fallbackHref={demoRoleHomeRoute("worker")}
    >
      <View style={styles.heroWrap}>
        <AppImage
          source={data.heroImage}
          containerStyle={styles.heroImageWrap}
          style={styles.heroImage}
        />
      </View>

      <DetailSectionCard title="Mã giới thiệu">
        <View style={styles.codeRow}>
          <View>
            <AppText variant="micro" color={colors.textSecondary}>
              Referral code
            </AppText>
            <AppText variant="h2" color={colors.brandDark}>
              {data.referralCode}
            </AppText>
          </View>
          <View style={styles.rewardChip}>
            <AppText variant="caption" color={colors.brandDark}>
              Thưởng hiện tại {data.currentReward}
            </AppText>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.copyButton}
          onPress={handleCopyCode}
        >
          <AppText variant="button" color={colors.brandDark}>
            Sao chép mã giới thiệu
          </AppText>
        </TouchableOpacity>

        {copyStatus ? (
          <AppText variant="caption" color={colors.textSecondary}>
            {copyStatus}
          </AppText>
        ) : null}
      </DetailSectionCard>

      <DetailSectionCard title="Thống kê cá nhân">
        <View style={styles.statsGrid}>
          {data.stats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <AppText variant="micro" color={colors.textSecondary}>
                {stat.label}
              </AppText>
              <AppText variant="h3">{stat.value}</AppText>
            </View>
          ))}
        </View>
      </DetailSectionCard>

      <DetailSectionCard title="Cách hoạt động">
        {[
          "Chia sẻ mã QR / link mời cho thợ mới.",
          "Thợ tải app và đăng ký thành công.",
          "Hệ thống ghi nhận lượt giới thiệu hợp lệ theo milestone.",
        ].map((text) => (
          <View key={text} style={styles.stepRow}>
            <View style={styles.stepDot} />
            <AppText
              variant="bodySmall"
              color={colors.textSecondary}
              style={styles.stepText}
            >
              {text}
            </AppText>
          </View>
        ))}
      </DetailSectionCard>

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.ctaButton}
        onPress={() => router.push(demoRoleHomeRoute("worker"))}
      >
        <AppText variant="button" color={colors.white}>
          Về trang thợ
        </AppText>
      </TouchableOpacity>
    </DetailScreenScaffold>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    borderRadius: 22,
    overflow: "hidden",
    ...shadows.card,
  },
  heroImageWrap: {
    height: 224,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  rewardChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
  },
  copyButton: {
    marginTop: spacing.sm,
    height: 46,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
  },
  statCard: {
    width: "48%",
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.backgroundSoft,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: spacing.xs,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    marginTop: 4,
    backgroundColor: colors.brand,
  },
  stepText: {
    flex: 1,
  },
  ctaButton: {
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    ...shadows.cta,
  },
});
