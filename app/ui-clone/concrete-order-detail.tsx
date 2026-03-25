import {
    DeliveryDriverCard,
    TransportTimeline,
    VerificationBlock
} from "@/components/ui-clone/blocks";
import {
    AppHeader,
    BaseCard,
    BottomNav,
    InfoRow,
    PrimaryButton,
    ScreenContainer,
    ScreenScroll,
    SectionHeading,
    SoftBadge,
    TabPill,
} from "@/components/ui-clone/primitives";
import { uiCloneTheme } from "@/constants/uiCloneTheme";
import { ordersMock, transportMock } from "@/data/uiCloneMock";
import { StyleSheet, Text, View } from "react-native";

const t = uiCloneTheme;

export default function ConcreteOrderDetailScreen() {
  const data = ordersMock.concreteDetail;

  return (
    <ScreenContainer>
      <ScreenScroll>
        <AppHeader
          title="Chi tiết Đơn hàng Bê tông"
          rightIcons={[
            { icon: "share-social-outline" },
            { icon: "ellipsis-vertical" },
          ]}
        />

        <BaseCard>
          <SectionHeading title="Thông tin đặt hàng" />
          {data.infoFields.map((field, index) => (
            <InfoRow
              key={field.key}
              label={field.label}
              value={field.value}
              borderBottom={index !== data.infoFields.length - 1}
            />
          ))}
        </BaseCard>

        <BaseCard>
          <SectionHeading title="Báo giá vbt tq (NCC1-4)" />
          <View style={styles.markHeadRow}>
            <Text style={[styles.markHeadCell, { flex: 1 }]}>Vbt tq</Text>
            {data.concreteTable.map((line) => (
              <Text
                key={line.id}
                style={[styles.markHeadCell, { flex: 1, textAlign: "center" }]}
              >
                {line.name}
              </Text>
            ))}
            <Text
              style={[styles.markHeadCell, { flex: 1, textAlign: "center" }]}
            >
              Phụ gia
            </Text>
          </View>
          <View style={styles.markBodyRow}>
            <Text style={[styles.markBodyCell, { flex: 1 }]}>Đơn giá</Text>
            {data.concreteTable.map((line) => (
              <Text
                key={`${line.id}-p`}
                style={[styles.markBodyCell, { flex: 1, textAlign: "center" }]}
              >
                {`${Math.round(line.unitPrice / 100000) / 10}M`}
              </Text>
            ))}
            <Text
              style={[styles.markBodyCell, { flex: 1, textAlign: "center" }]}
            >
              {data.additives}
            </Text>
          </View>

          <View style={styles.pumpRow}>
            <BaseCard style={styles.pumpCell} shadow="none">
              <Text style={styles.pumpText}>
                Bơm ngang: {data.pumpHorizontal}
              </Text>
            </BaseCard>
            <BaseCard style={styles.pumpCell} shadow="none">
              <Text style={styles.pumpText}>Bơm cần: {data.pumpBoom}</Text>
            </BaseCard>
          </View>
        </BaseCard>

        <SectionHeading title="Trình mẫu - Lưu mẫu" />
        <BaseCard>
          <View style={styles.checkItemRow}>
            <Text style={styles.checkItemText}>Kiểm tra độ sụt</Text>
            <View style={styles.checkTabs}>
              <TabPill label="Đạt" active />
              <TabPill label="K.Đạt" />
            </View>
          </View>
          <View style={styles.checkItemRow}>
            <Text style={styles.checkItemText}>Lấy mẫu nén (R7/R28)</Text>
            <View style={styles.checkTabs}>
              <TabPill label="Đạt" active />
              <TabPill label="K.Đạt" />
            </View>
          </View>
        </BaseCard>

        <VerificationBlock
          supplierName="NHÀ CUNG CẤP - Đã xác thực"
          supervisorName="KỸ SƯ GIÁM SÁT - Chờ Face ID"
        />

        <BaseCard style={styles.selectedSupplierCard}>
          <View style={styles.selectedHeader}>
            <SoftBadge
              label={`NCC Được chọn: ${data.selectedSupplier.name}`}
              tone="success"
            />
          </View>
          <InfoRow label="Bê tông" value={data.selectedSupplier.product} />
          <InfoRow label="Khối lượng" value={data.selectedSupplier.quantity} />
          <InfoRow label="Đơn giá" value={data.selectedSupplier.unitPrice} />
          <InfoRow
            label="Thành tiền"
            value={data.selectedSupplier.amount}
            valueColor={t.colors.brandStrong}
            borderBottom={false}
          />
        </BaseCard>

        <SectionHeading title="Thực hiện vận chuyển" />
        <DeliveryDriverCard
          driverName={transportMock.driver.name}
          plate={transportMock.driver.plate}
          rating={transportMock.driver.rating}
          avatar={transportMock.driver.avatar}
        />
        <TransportTimeline nodes={transportMock.timeline} />

        <PrimaryButton label="XUẤT LỆNH GIAO HÀNG" leftIcon="play-outline" />
      </ScreenScroll>

      <BottomNav activeKey="orders" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  markHeadRow: {
    flexDirection: "row",
    paddingVertical: t.spacing.s3,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
  },
  markHeadCell: {
    ...t.typography.label,
    color: t.colors.textSecondary,
  },
  markBodyRow: {
    flexDirection: "row",
    paddingVertical: t.spacing.s4,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
  },
  markBodyCell: {
    ...t.typography.bodyLg,
    color: t.colors.textPrimary,
    fontWeight: "700",
  },
  pumpRow: {
    marginTop: t.spacing.s5,
    flexDirection: "row",
    gap: t.spacing.s4,
  },
  pumpCell: {
    flex: 1,
    backgroundColor: t.colors.bgSurfaceSoft,
  },
  pumpText: {
    ...t.typography.bodyLg,
    color: t.colors.textSecondary,
    fontWeight: "700",
  },
  checkItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: t.spacing.s4,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
  },
  checkItemText: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
    flex: 1,
  },
  checkTabs: {
    flexDirection: "row",
    gap: t.spacing.s3,
  },
  selectedSupplierCard: {
    backgroundColor: t.colors.bgSurfaceTint,
    borderColor: t.colors.borderBrand,
  },
  selectedHeader: {
    marginBottom: t.spacing.s3,
  },
});
