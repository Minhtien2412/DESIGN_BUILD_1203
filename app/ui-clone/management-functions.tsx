import {
    PayrollTableCard,
    RatingCriteriaBlock,
    RatingScoreTabs,
} from "@/components/ui-clone/blocks";
import {
    AppHeader,
    BaseCard,
    BottomNav,
    ScreenContainer,
    ScreenScroll,
    SectionHeading,
} from "@/components/ui-clone/primitives";
import { uiCloneTheme } from "@/constants/uiCloneTheme";
import { payrollMock, ratingsMock } from "@/data/uiCloneMock";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const t = uiCloneTheme;

const quickCards = [
  { id: "q1", icon: "people-outline", title: "Tạo cuộc họp - nhóm chat" },
  { id: "q2", icon: "calendar-outline", title: "Tạo lịch hẹn công việc" },
  { id: "q3", icon: "cart-outline", title: "Tạo đơn hàng vật tư" },
  {
    id: "q4",
    icon: "cash-outline",
    title: "Tạo bảng lương & Mời thợ",
    highlight: true,
    sub: "Mời thợ qua SET",
  },
];

const manageNav = [
  { key: "home", label: "Trang chủ", icon: "home-outline" },
  { key: "project", label: "D.s án", icon: "document-text-outline" },
  { key: "manage", label: "Quản lý", icon: "people-outline" },
  { key: "notify", label: "Thông báo", icon: "notifications-outline" },
  { key: "profile", label: "Cá nhân", icon: "person-outline" },
];

export default function ManagementFunctionsScreen() {
  return (
    <ScreenContainer>
      <ScreenScroll contentStyle={{ paddingHorizontal: 0 }}>
        <View style={styles.contentPad}>
          <AppHeader
            title="Chức năng (Kỹ sư/Đội trưởng)"
            rightIcons={[{ icon: "ellipsis-vertical" }]}
          />
        </View>

        <View style={styles.softSection}>
          <View style={styles.contentPad}>
            <Text style={styles.softSectionLabel}>CÔNG CỤ QUẢN LÝ</Text>
            <View style={styles.quickGrid}>
              {quickCards.map((item) => (
                <BaseCard
                  key={item.id}
                  style={[
                    styles.quickCard,
                    item.highlight ? styles.quickCardHighlight : null,
                  ]}
                  shadow="none"
                >
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={t.colors.brandStrong}
                  />
                  <Text style={styles.quickTitle}>{item.title}</Text>
                  {item.sub ? (
                    <Text style={styles.quickSub}>{item.sub}</Text>
                  ) : null}
                </BaseCard>
              ))}
            </View>

            <PayrollTableCard
              title={payrollMock.projectName}
              subtitle={payrollMock.weekLabel}
              rows={payrollMock.rows}
              paymentMethod={payrollMock.paymentMethod}
              total={payrollMock.total}
            />

            <SectionHeading title="ĐÁNH GIÁ ĐỘI THỢ" />
            <RatingScoreTabs
              tabs={ratingsMock.tabs}
              activeId={ratingsMock.tabs[0].id}
            />
            <RatingCriteriaBlock criteria={ratingsMock.criteria} />

            <BaseCard style={styles.observeBlock} shadow="none">
              <Ionicons
                name="eye-outline"
                size={34}
                color={t.colors.textTertiary}
              />
              <Text style={styles.observeText}>5. Quan sát công trình</Text>
            </BaseCard>
          </View>
        </View>
      </ScreenScroll>

      <BottomNav activeKey="manage" items={manageNav as any} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentPad: {
    paddingHorizontal: t.spacing.s8,
  },
  softSection: {
    marginTop: t.spacing.s5,
    backgroundColor: t.colors.bgSurfaceTint,
    paddingTop: t.spacing.s8,
    paddingBottom: t.spacing.s10,
  },
  softSectionLabel: {
    ...t.typography.titleSm,
    color: t.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: t.spacing.s5,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.spacing.s4,
    marginBottom: t.spacing.s6,
  },
  quickCard: {
    width: "48.8%",
    minHeight: 124,
    justifyContent: "flex-start",
    gap: t.spacing.s4,
  },
  quickCardHighlight: {
    borderColor: t.colors.borderBrand,
    backgroundColor: t.colors.bgSurfaceTint,
  },
  quickTitle: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
  },
  quickSub: {
    ...t.typography.bodySm,
    color: t.colors.textSecondary,
  },
  observeBlock: {
    marginTop: t.spacing.s8,
    minHeight: 110,
    borderStyle: "dashed",
    borderColor: t.colors.borderMuted,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.bgSurfaceSoft,
    gap: t.spacing.s2,
  },
  observeText: {
    ...t.typography.titleSm,
    color: t.colors.textTertiary,
  },
});
