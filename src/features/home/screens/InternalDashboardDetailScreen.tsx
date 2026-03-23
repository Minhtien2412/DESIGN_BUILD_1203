import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import AppText from "../../shared/components/AppText";
import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { shadows } from "../../shared/theme/shadows";
import { spacing } from "../../shared/theme/spacing";
import DetailScreenScaffold, {
    DetailSectionCard,
} from "../components/DetailScreenScaffold";
import {
    getRoleLabel,
    resolveInternalDashboard,
} from "../mock/detailResolvers";
import {
    demoInternalQuickActionRoute,
    demoRoleHomeRoute,
} from "../navigation/demoRoutes";

type InternalDashboardDetailScreenProps = {
  section?: string;
};

export default function InternalDashboardDetailScreen({
  section,
}: InternalDashboardDetailScreenProps) {
  const data = resolveInternalDashboard(section);
  const fallbackHref = demoRoleHomeRoute("internal_manager");

  return (
    <DetailScreenScaffold
      title={data.title}
      subtitle={`${data.projectTitle} • ${data.projectPeriod}`}
      roleLabel={getRoleLabel("internal_manager")}
      fallbackHref={fallbackHref}
    >
      <DetailSectionCard title="Tổng quan nhanh">
        <View style={styles.metricGrid}>
          {data.metrics.map((metric) => (
            <View key={metric.id} style={styles.metricCard}>
              <AppText variant="micro" color={colors.textSecondary}>
                {metric.label}
              </AppText>
              <AppText variant="h3">{metric.value}</AppText>
            </View>
          ))}
        </View>
      </DetailSectionCard>

      <DetailSectionCard title="Quick actions">
        <View style={styles.quickGrid}>
          {data.quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              activeOpacity={0.88}
              style={styles.quickCard}
              onPress={() =>
                router.push(demoInternalQuickActionRoute(action.id))
              }
            >
              <View style={styles.quickIconWrap}>
                <Ionicons
                  name={action.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={colors.brand}
                />
              </View>
              <AppText variant="title">{action.title}</AppText>
              <AppText variant="bodySmall" color={colors.textSecondary}>
                {action.subtitle}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </DetailSectionCard>

      <DetailSectionCard title="Tiến trình vận chuyển / thực hiện">
        <View style={styles.timelineWrap}>
          {data.statusSteps.map((step) => (
            <View key={step.id} style={styles.timelineRow}>
              <View
                style={[
                  styles.timelineDot,
                  step.status === "done" && styles.timelineDotDone,
                  step.status === "active" && styles.timelineDotActive,
                ]}
              />
              <View style={styles.timelineCopy}>
                <AppText variant="title">{step.title}</AppText>
                <AppText variant="bodySmall" color={colors.textSecondary}>
                  {step.subtitle}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </DetailSectionCard>

      <DetailSectionCard title="Tài xế / điều phối">
        <AppText variant="title">{data.contact.name}</AppText>
        <AppText variant="bodySmall" color={colors.textSecondary}>
          {data.contact.role}
        </AppText>
        <AppText variant="bodySmall" color={colors.textSecondary}>
          {data.contact.phone} • {data.contact.plate} • {data.contact.rating}★
        </AppText>
      </DetailSectionCard>
    </DetailScreenScaffold>
  );
}

const styles = StyleSheet.create({
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
  },
  metricCard: {
    width: "48%",
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.backgroundSoft,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: spacing.xs,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
  },
  quickCard: {
    width: "48%",
    minHeight: 118,
    borderRadius: radius.lg,
    padding: 14,
    backgroundColor: colors.backgroundSoft,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: spacing.xs,
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    ...shadows.soft,
  },
  timelineWrap: {
    gap: spacing.sm,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
    marginTop: 5,
    backgroundColor: colors.border,
  },
  timelineDotDone: {
    backgroundColor: colors.brand,
  },
  timelineDotActive: {
    backgroundColor: colors.brandDark,
    transform: [{ scale: 1.2 }],
  },
  timelineCopy: {
    flex: 1,
    gap: 2,
  },
});
