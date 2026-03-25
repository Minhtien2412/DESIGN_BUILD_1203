import {
    GalleryRow,
    PricingTable,
    VerificationBlock,
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
} from "@/components/ui-clone/primitives";
import { uiCloneTheme } from "@/constants/uiCloneTheme";
import { ordersMock } from "@/data/uiCloneMock";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const t = uiCloneTheme;

export default function MaterialOrderDetailScreen() {
  const data = ordersMock.materialOrder;

  return (
    <ScreenContainer>
      <ScreenScroll>
        <AppHeader
          title={data.headerTitle}
          rightIcons={[
            { icon: "share-social-outline" },
            { icon: "ellipsis-vertical" },
          ]}
        />

        <SectionHeading title="Thông tin đặt hàng" step={1} />
        <BaseCard>
          <View style={styles.orderHeaderRow}>
            <Text style={styles.orderCodeText}>
              Mã đơn hàng: {data.orderCode}
            </Text>
            <Ionicons
              name="location-outline"
              size={19}
              color={t.colors.brandStrong}
            />
          </View>
          {data.infoFields.slice(1).map((field, idx) => (
            <InfoRow
              key={field.key}
              label={field.label}
              value={field.value}
              borderBottom={idx !== data.infoFields.slice(1).length - 1}
            />
          ))}
        </BaseCard>

        <GalleryRow images={data.materialThumbs} extraLabel="+5" />

        <SectionHeading title="Báo giá nhà cung cấp" step={2} />
        <BaseCard>
          <View style={styles.supplierTitleRow}>
            <Ionicons
              name="storefront-outline"
              size={16}
              color={t.colors.brandStrong}
            />
            <Text style={styles.supplierTitle}>
              {data.quotationSupplierName}
            </Text>
          </View>
          <View style={{ marginTop: t.spacing.s4 }}>
            <PricingTable
              rows={data.quotationItems}
              headers={["Danh mục vật tư", "Đơn giá"]}
            />
          </View>
          <Text style={styles.moreText}>XEM THÊM 12 MẶT HÀNG</Text>
        </BaseCard>

        <SectionHeading title="Trình mẫu - lưu mẫu" step={3} />
        <BaseCard>
          <View style={styles.qualityHead}>
            <Text style={[styles.qualityHeadText, { flex: 1.4 }]}>
              Hạng mục
            </Text>
            <Text
              style={[
                styles.qualityHeadText,
                { flex: 0.8, textAlign: "right" },
              ]}
            >
              Chất lượng
            </Text>
          </View>
          {data.qualityChecklist.map((item) => (
            <View key={item} style={styles.qualityRow}>
              <Text style={styles.qualityLabel}>{item}</Text>
              <Ionicons
                name="checkbox"
                size={18}
                color={t.colors.brandStrong}
              />
            </View>
          ))}
        </BaseCard>

        <VerificationBlock
          supplierName={data.verification.supplierName}
          supervisorName={data.verification.engineerName}
        />

        <SectionHeading title="Chọn nhà cung cấp" step={4} />
        <BaseCard style={styles.selectedCard}>
          <View style={styles.selectedTop}>
            <Text style={styles.selectedTitle}>{data.selectedOrder.title}</Text>
            <SoftBadge label={data.selectedOrder.status} tone="brand" />
          </View>
          <Text style={styles.selectedUnit}>{data.selectedOrder.unitName}</Text>
        </BaseCard>

        <PricingTable
          rows={data.selectedOrder.lines}
          headers={["Vật tư", "Đơn giá"]}
          showQuantity
          showAmount
          totalLabel="TỔNG CỘNG"
          totalValue={data.selectedOrder.totalText}
        />

        <PrimaryButton
          label="XÁC NHẬN ĐƠN HÀNG"
          leftIcon="checkmark-circle-outline"
        />
      </ScreenScroll>

      <BottomNav activeKey="orders" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  orderHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: t.spacing.s2,
  },
  orderCodeText: {
    ...t.typography.titleSm,
    color: t.colors.brandStrong,
  },
  supplierTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.s2,
  },
  supplierTitle: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
  },
  moreText: {
    ...t.typography.label,
    color: t.colors.brandStrong,
    textAlign: "center",
    marginTop: t.spacing.s4,
  },
  qualityHead: {
    flexDirection: "row",
    paddingBottom: t.spacing.s3,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
  },
  qualityHeadText: {
    ...t.typography.label,
    color: t.colors.textSecondary,
  },
  qualityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: t.spacing.s4,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
  },
  qualityLabel: {
    ...t.typography.bodyLg,
    color: t.colors.textPrimary,
  },
  selectedCard: {
    backgroundColor: t.colors.bgSurfaceTint,
    borderColor: t.colors.borderBrand,
  },
  selectedTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedTitle: {
    ...t.typography.titleSm,
    color: t.colors.brandStrong,
  },
  selectedUnit: {
    ...t.typography.bodyMd,
    color: t.colors.textPrimary,
    marginTop: t.spacing.s3,
  },
});
