import {
    AppHeader,
    BaseCard,
    PriceText,
    PrimaryButton,
    ScreenContainer,
    ScreenScroll,
    SectionHeading,
} from "@/components/ui-clone/primitives";
import { uiCloneTheme } from "@/constants/uiCloneTheme";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const t = uiCloneTheme;

const mainScreens = [
  {
    id: "s1",
    title: "Chi tiết đơn hàng vật tư / nhà cung cấp",
    route: "/ui-clone/material-order-detail",
  },
  {
    id: "s2",
    title: "Màn hình bản đồ theo dõi xe giao hàng",
    route: "/ui-clone/delivery-map",
  },
  {
    id: "s3",
    title: "Màn hình giới thiệu thợ / referral",
    route: "/ui-clone/referral",
  },
  {
    id: "s4",
    title: "Màn hình hồ sơ bán hàng / nhà cung cấp",
    route: "/ui-clone/seller-profile",
  },
  {
    id: "s5",
    title: "Màn hình hồ sơ đội trưởng / thợ",
    route: "/ui-clone/team-profile",
  },
  {
    id: "s6",
    title: "Màn hình hồ sơ KTS",
    route: "/ui-clone/architect-profile",
  },
  {
    id: "s7",
    title: "Màn hình hồ sơ kỹ sư",
    route: "/ui-clone/engineer-profile",
  },
  {
    id: "s8",
    title: "Màn hình chi tiết đơn hàng coffa",
    route: "/ui-clone/coffa-order-detail",
  },
  {
    id: "s9",
    title: "Màn hình chi tiết đơn hàng bê tông",
    route: "/ui-clone/concrete-order-detail",
  },
  {
    id: "s10",
    title: "Màn hình chức năng quản lý kỹ sư / đội trưởng",
    route: "/ui-clone/management-functions",
  },
];

const profileFlows = [
  ["Chỉnh sửa seller", "/ui-clone/profile/seller-edit"],
  ["Chỉnh sửa team", "/ui-clone/profile/team-edit"],
  ["Chỉnh sửa architect", "/ui-clone/profile/architect-edit"],
  ["Chỉnh sửa engineer", "/ui-clone/profile/engineer-edit"],
  ["Danh sách dự án", "/ui-clone/profile/projects-list"],
  ["Chi tiết dự án", "/ui-clone/profile/project-detail"],
  ["Danh sách live preview", "/ui-clone/profile/live-preview-list"],
  ["QR toàn màn hình", "/ui-clone/profile/full-qr"],
  ["Xác thực hồ sơ", "/ui-clone/profile/verification"],
  ["Cài đặt hồ sơ", "/ui-clone/profile/settings"],
] as const;

const orderFlows = [
  ["Danh sách vật tư", "/ui-clone/orders/material-list"],
  ["So sánh vật tư", "/ui-clone/orders/material-compare"],
  ["Xác nhận vật tư", "/ui-clone/orders/material-confirm"],
  ["Hoàn tất vật tư", "/ui-clone/orders/material-complete"],
  ["Danh sách coffa", "/ui-clone/orders/coffa-list"],
  ["Xác nhận coffa", "/ui-clone/orders/coffa-confirm"],
  ["Danh sách bê tông", "/ui-clone/orders/concrete-list"],
  ["Theo dõi bê tông", "/ui-clone/orders/concrete-tracking"],
  ["Chọn nhà cung cấp", "/ui-clone/orders/supplier-picker"],
  ["Chọn lịch giao", "/ui-clone/orders/schedule-picker"],
] as const;

const deliveryFlows = [
  ["Danh sách giao", "/ui-clone/delivery/list"],
  ["Chi tiết chuyến", "/ui-clone/delivery/trip-detail"],
  ["Chi tiết tài xế", "/ui-clone/delivery/driver-detail"],
  ["Lịch sử giao", "/ui-clone/delivery/history"],
  ["Proof of delivery", "/ui-clone/delivery/proof-of-delivery"],
  ["Báo cáo sự cố", "/ui-clone/delivery/report-issue"],
] as const;

const referralFlows = [
  ["Lịch sử referral", "/ui-clone/referral/history"],
  ["Kho phần thưởng", "/ui-clone/referral/rewards"],
  ["Chi tiết thưởng", "/ui-clone/referral/reward-detail"],
  ["Danh sách mời", "/ui-clone/referral/invite-list"],
  ["Chia sẻ referral", "/ui-clone/referral/share"],
  ["QR referral", "/ui-clone/referral/full-qr"],
  ["Thể lệ chương trình", "/ui-clone/referral/program-rules"],
] as const;

const managementFlows = [
  ["Tạo meeting", "/ui-clone/management/create-meeting"],
  ["Tạo chat group", "/ui-clone/management/create-chat-group"],
  ["Tạo schedule", "/ui-clone/management/create-schedule"],
  ["Tạo đơn hàng", "/ui-clone/management/create-order"],
  ["Bảng lương", "/ui-clone/management/payroll"],
  ["Chi tiết lương", "/ui-clone/management/payroll-detail"],
  ["Mời thợ", "/ui-clone/management/invite-worker"],
  ["Danh sách thợ", "/ui-clone/management/workers"],
  ["Chi tiết thợ", "/ui-clone/management/worker-detail"],
  ["Chi tiết đánh giá", "/ui-clone/management/rating-detail"],
  ["Quan sát công trình", "/ui-clone/management/site-observer"],
  ["VA-VR mặt bằng", "/ui-clone/management/va-vr"],
] as const;

const stateAndComponents = [
  ["State loading", "/ui-clone/states/loading"],
  ["State empty", "/ui-clone/states/empty"],
  ["State error", "/ui-clone/states/error"],
  ["State success", "/ui-clone/states/success"],
  ["State locked", "/ui-clone/states/locked"],
  ["State pending", "/ui-clone/states/pending"],
  ["Components preview", "/ui-clone/components-preview"],
] as const;

function RouteGroup({
  title,
  items,
}: {
  title: string;
  items: readonly (readonly [string, string])[];
}) {
  return (
    <View>
      <SectionHeading title={title} />
      <BaseCard style={styles.groupCard}>
        {items.map(([label, path], idx) => (
          <Pressable
            key={path}
            onPress={() => router.push(path as never)}
            style={({ pressed }) => [
              styles.groupRow,
              idx === items.length - 1 ? { borderBottomWidth: 0 } : null,
              pressed ? { opacity: 0.85 } : null,
            ]}
          >
            <Text style={styles.groupLabel}>{label}</Text>
            <Text style={styles.itemArrow}>›</Text>
          </Pressable>
        ))}
      </BaseCard>
    </View>
  );
}

export default function UICloneIndexScreen() {
  return (
    <ScreenContainer>
      <ScreenScroll>
        <AppHeader
          title="UI Clone - Pixel Refactor"
          subtitle="Main Screens + Full Flows + States"
          showBack={false}
        />

        <BaseCard>
          <Text style={styles.cardTitle}>Bộ màn hình chuẩn hoá UX/UI</Text>
          <Text style={styles.cardSub}>
            Mô-đun dựng theo Expo Router + TypeScript với design token và
            component reuse đồng nhất.
          </Text>
          <View style={styles.kpiRow}>
            <View>
              <Text style={styles.kpiLabel}>Main Screens</Text>
              <PriceText value="10" tone="normal" size="md" />
            </View>
            <View>
              <Text style={styles.kpiLabel}>Sub Flows</Text>
              <PriceText value="52" tone="brand" size="md" />
            </View>
          </View>
          <View style={{ marginTop: t.spacing.s5 }}>
            <PrimaryButton
              label="Mở Components Preview"
              leftIcon="apps-outline"
              onPress={() => router.push("/ui-clone/components-preview")}
            />
          </View>
        </BaseCard>

        <SectionHeading title="Main Screens" />
        {mainScreens.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(item.route as never)}
            style={({ pressed }) => [
              styles.itemBtn,
              pressed ? { opacity: 0.88 } : null,
            ]}
          >
            <Text style={styles.itemText}>{item.title}</Text>
            <Text style={styles.itemArrow}>›</Text>
          </Pressable>
        ))}

        <RouteGroup title="Profile Flows" items={profileFlows} />
        <RouteGroup title="Order Flows" items={orderFlows} />
        <RouteGroup title="Delivery Flows" items={deliveryFlows} />
        <RouteGroup title="Referral Flows" items={referralFlows} />
        <RouteGroup title="Management Flows" items={managementFlows} />
        <RouteGroup title="States & Components" items={stateAndComponents} />
      </ScreenScroll>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
  },
  cardSub: {
    ...t.typography.bodyMd,
    color: t.colors.textSecondary,
    marginTop: t.spacing.s2,
  },
  kpiRow: {
    marginTop: t.spacing.s6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  kpiLabel: {
    ...t.typography.caption,
    color: t.colors.textTertiary,
  },
  itemBtn: {
    minHeight: 58,
    borderRadius: t.radius.r6,
    borderWidth: 1,
    borderColor: t.colors.borderSoft,
    backgroundColor: t.colors.bgSurface,
    paddingHorizontal: t.spacing.s6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemText: {
    ...t.typography.bodyLg,
    color: t.colors.textPrimary,
    fontWeight: "700",
    flex: 1,
    paddingRight: t.spacing.s4,
  },
  itemArrow: {
    fontSize: 24,
    color: t.colors.brandStrong,
  },
  groupCard: {
    paddingVertical: t.spacing.s2,
  },
  groupRow: {
    minHeight: 46,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: t.spacing.s3,
  },
  groupLabel: {
    ...t.typography.bodyMd,
    color: t.colors.textPrimary,
    fontWeight: "700",
    flex: 1,
    marginRight: t.spacing.s4,
  },
});
