import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import AppContainer from "../../shared/components/AppContainer";
import AppText from "../../shared/components/AppText";
import BottomTabBar, {
    BottomTabItem,
} from "../../shared/components/BottomTabBar";
import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { shadows } from "../../shared/theme/shadows";
import { spacing } from "../../shared/theme/spacing";
import AppHeader from "../components/AppHeader";
import SectionTitle from "../components/SectionTitle";
import { internalHomeMock } from "../mock/internalHome.mock";
import {
    demoInternalDashboardRoute,
    demoInternalQuickActionRoute,
    demoInternalTabRoute,
} from "../navigation/demoRoutes";

function AttendanceDot({ status }: { status: "done" | "pending" }) {
  const active = status === "done";
  return (
    <View
      style={[
        styles.attendanceDot,
        active ? styles.attendanceDotActive : styles.attendanceDotPending,
      ]}
    >
      {active ? (
        <Ionicons name="checkmark" size={10} color={colors.white} />
      ) : null}
    </View>
  );
}

function TimelineStep({
  title,
  subtitle,
  status,
  isLast,
}: {
  title: string;
  subtitle: string;
  status: "done" | "active" | "upcoming";
  isLast: boolean;
}) {
  const active = status === "active";
  const done = status === "done";

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View
          style={[
            styles.timelineDot,
            done && styles.timelineDotDone,
            active && styles.timelineDotActive,
          ]}
        >
          {done ? (
            <Ionicons name="checkmark" size={12} color={colors.white} />
          ) : null}
          {active ? (
            <Ionicons name="car-outline" size={12} color={colors.white} />
          ) : null}
        </View>
        {!isLast ? (
          <View
            style={[styles.timelineLine, done && styles.timelineLineDone]}
          />
        ) : null}
      </View>
      <View style={styles.timelineCopy}>
        <AppText variant="title">{title}</AppText>
        <AppText variant="bodySmall" color={colors.textSecondary}>
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

export default function InternalHomeScreen() {
  const tabs: BottomTabItem[] = internalHomeMock.tabs.map((item) => ({
    ...item,
    icon: item.icon as BottomTabItem["icon"],
  }));

  return (
    <AppContainer>
      <AppHeader
        title={internalHomeMock.headerTitle}
        subtitle={internalHomeMock.headerSubtitle}
        searchPlaceholder={internalHomeMock.searchPlaceholder}
        eyebrow="Nội bộ / Quản lý"
        onSearchPress={() =>
          router.push(demoInternalDashboardRoute("projects"))
        }
        onMenuPress={() => router.push(demoInternalDashboardRoute("profile"))}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.metricWrap}>
          {internalHomeMock.metrics.map((metric) => (
            <View key={metric.id} style={styles.metricCard}>
              <AppText variant="micro" color={colors.textSecondary}>
                {metric.label}
              </AppText>
              <AppText variant="h3">{metric.value}</AppText>
            </View>
          ))}
        </View>

        <View style={styles.sectionWrap}>
          <View style={styles.card}>
            <SectionTitle title="Công cụ quản lý" />
            <View style={styles.quickGrid}>
              {internalHomeMock.quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  activeOpacity={0.88}
                  style={[styles.quickCard, { backgroundColor: action.tint }]}
                  onPress={() =>
                    router.push(demoInternalQuickActionRoute(action.id))
                  }
                >
                  <View style={styles.quickIconWrap}>
                    <Ionicons
                      name={action.icon as keyof typeof Ionicons.glyphMap}
                      size={22}
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
          </View>
        </View>

        <View style={styles.sectionWrap}>
          <View style={styles.card}>
            <AppText variant="h3">{internalHomeMock.projectTitle}</AppText>
            <AppText variant="bodySmall" color={colors.textSecondary}>
              {internalHomeMock.projectPeriod}
            </AppText>

            <View style={styles.tableHeader}>
              <AppText variant="micro" color={colors.textSecondary}>
                Tên
              </AppText>
              <AppText variant="micro" color={colors.textSecondary}>
                Phone
              </AppText>
              <AppText variant="micro" color={colors.textSecondary}>
                Lương
              </AppText>
              <AppText variant="micro" color={colors.textSecondary}>
                T2-T5
              </AppText>
            </View>

            {internalHomeMock.payrollRows.map((row) => (
              <View key={row.id} style={styles.tableRow}>
                <AppText variant="bodySmall" style={styles.nameCell}>
                  {row.name}
                </AppText>
                <AppText
                  variant="bodySmall"
                  color={colors.textSecondary}
                  style={styles.phoneCell}
                >
                  {row.phone}
                </AppText>
                <AppText variant="bodySmall" style={styles.rateCell}>
                  {row.dailyRate}
                </AppText>
                <View style={styles.attendanceRow}>
                  {row.attendance.map((status, index) => (
                    <AttendanceDot key={`${row.id}-${index}`} status={status} />
                  ))}
                </View>
              </View>
            ))}

            <View style={styles.projectFooter}>
              <View>
                <AppText variant="micro" color={colors.textSecondary}>
                  Hình thức thanh toán
                </AppText>
                <AppText variant="title">
                  {internalHomeMock.paymentMethod}
                </AppText>
              </View>
              <View style={styles.totalWrap}>
                <AppText variant="micro" color={colors.textSecondary}>
                  Tổng cộng
                </AppText>
                <AppText variant="h2" color={colors.brandDark}>
                  {internalHomeMock.payrollTotal}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionWrap}>
          <View style={styles.card}>
            <SectionTitle title="Đánh giá đội thợ" />
            <View style={styles.ratingChipRow}>
              {internalHomeMock.ratings.map((rating) => (
                <View
                  key={rating.id}
                  style={[
                    styles.ratingChip,
                    rating.active && styles.ratingChipActive,
                  ]}
                >
                  <AppText
                    variant="caption"
                    color={rating.active ? colors.white : colors.text}
                  >
                    {rating.name} {rating.score}
                  </AppText>
                </View>
              ))}
            </View>

            {[
              "Tài năng",
              "Tay nghề",
              "Chăm chỉ",
              "Trung thực",
              "Tuân thủ ATLĐ",
            ].map((label) => (
              <View key={label} style={styles.ratingRow}>
                <AppText variant="bodySmall">{label}</AppText>
                <View style={styles.starRow}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Ionicons
                      key={`${label}-${index}`}
                      name="star"
                      size={16}
                      color={colors.brand}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionWrap}>
          <View style={styles.card}>
            <SectionTitle title="Thực hiện vận chuyển" />
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={colors.brand}
                />
              </View>
              <View style={styles.driverCopy}>
                <AppText variant="title">
                  {internalHomeMock.deliveryContact.name}
                </AppText>
                <AppText variant="bodySmall" color={colors.textSecondary}>
                  {internalHomeMock.deliveryContact.role}
                </AppText>
                <AppText variant="bodySmall" color={colors.textSecondary}>
                  {internalHomeMock.deliveryContact.phone} •{" "}
                  {internalHomeMock.deliveryContact.plate}
                </AppText>
              </View>
              <View style={styles.driverActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.driverActionButton}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={20}
                    color={colors.brand}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.driverActionButton,
                    styles.driverActionButtonActive,
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={colors.white}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.etaCard}>
              <AppText variant="h2">Xe đang đến công trình</AppText>
              <AppText variant="bodySmall" color={colors.textSecondary}>
                ETA 10:45 AM • Đánh giá{" "}
                {internalHomeMock.deliveryContact.rating}
              </AppText>
            </View>

            <View style={styles.timelineWrap}>
              {internalHomeMock.statusSteps.map((step, index) => (
                <TimelineStep
                  key={step.id}
                  title={step.title}
                  subtitle={step.subtitle}
                  status={step.status}
                  isLast={index === internalHomeMock.statusSteps.length - 1}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.sectionWrap}>
          <View style={[styles.card, styles.observeCard]}>
            <Ionicons name="eye-outline" size={30} color={colors.textMuted} />
            <AppText variant="title" color={colors.textSecondary}>
              5. Quan sát công trình
            </AppText>
          </View>
        </View>
      </ScrollView>

      <BottomTabBar
        items={tabs}
        onItemPress={(item) => router.push(demoInternalTabRoute(item.id))}
      />
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 132,
  },
  metricWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    rowGap: spacing.sm,
  },
  metricCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: spacing.xs,
    ...shadows.soft,
  },
  sectionWrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: spacing.md,
    ...shadows.card,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
  },
  quickCard: {
    width: "48%",
    minHeight: 124,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: spacing.xs,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  nameCell: {
    width: "22%",
  },
  phoneCell: {
    width: "22%",
  },
  rateCell: {
    width: "18%",
  },
  attendanceRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: spacing.sm,
  },
  attendanceDot: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  attendanceDotActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  attendanceDotPending: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  projectFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  totalWrap: {
    alignItems: "flex-end",
  },
  ratingChipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  ratingChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  ratingChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  starRow: {
    flexDirection: "row",
    gap: 3,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  driverAvatar: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft,
  },
  driverCopy: {
    flex: 1,
    gap: 4,
  },
  driverActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  driverActionButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft,
  },
  driverActionButtonActive: {
    backgroundColor: colors.brand,
  },
  etaCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.brandSurface,
    gap: spacing.xs,
  },
  timelineWrap: {
    gap: spacing.xs,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.sm,
  },
  timelineRail: {
    alignItems: "center",
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timelineDotDone: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  timelineDotActive: {
    backgroundColor: colors.brandDark,
    borderColor: colors.brandDark,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
    backgroundColor: colors.border,
  },
  timelineLineDone: {
    backgroundColor: colors.brand,
  },
  timelineCopy: {
    flex: 1,
    paddingBottom: spacing.md,
    gap: 4,
  },
  observeCard: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    borderStyle: "dashed",
  },
});
