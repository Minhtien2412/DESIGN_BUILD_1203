import { PricingTable, VerificationBlock } from "@/components/ui-clone/blocks";
import {
    AppHeader,
    BaseCard,
    PrimaryButton,
    ScreenContainer,
    ScreenScroll,
    SectionHeading,
    StickyActionBar,
    TabPill,
} from "@/components/ui-clone/primitives";
import { uiCloneTheme } from "@/constants/uiCloneTheme";
import { ordersMock } from "@/data/uiCloneMock";
import { StyleSheet, Text, View } from "react-native";

const t = uiCloneTheme;

export default function CoffaOrderDetailScreen() {
  const data = ordersMock.coffaDetail;

  return (
    <ScreenContainer>
      <ScreenScroll>
        <AppHeader title="Chi tiết đơn hàng Coffa" />

        <BaseCard>
          <View style={styles.summaryTopRow}>
            <TabPill label={data.orderCode} active />
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.summaryDateLabel}>NGÀY GIAO</Text>
              <Text style={styles.summaryDateValue}>{data.deliveryDate}</Text>
            </View>
          </View>
          <Text style={styles.projectName}>{data.project}</Text>
          <Text style={styles.projectSub}>{data.summaryJob}</Text>

          <View style={{ marginTop: t.spacing.s6 }}>
            <Text style={styles.groupTitle}>Danh mục vật tư:</Text>
            <View style={styles.tagWrap}>
              {data.materialTags.map((tag) => (
                <View key={tag} style={styles.tagCell}>
                  <Text style={styles.tagCellText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </BaseCard>

        <SectionHeading title="Báo giá chi tiết" actionLabel="Xem tất cả" />
        <PricingTable
          rows={data.quoteLines}
          headers={["HẠNG MỤC", "ĐƠN GIÁ"]}
          showAmount
        />

        <SectionHeading title="Kiểm tra mẫu & Chất lượng" />
        <BaseCard>
          <View style={styles.checkRow}>
            <Text style={styles.checkLabel}>Chất lượng đạt yêu cầu?</Text>
            <View style={styles.checkActions}>
              <TabPill label="Đạt" active />
              <TabPill label="Không" />
            </View>
          </View>
        </BaseCard>

        <VerificationBlock
          supplierName="Nguyễn Văn A"
          supervisorName="Trần Thị B"
          supplierStatus="XÁC THỰC FACEID"
          supervisorStatus="XÁC THỰC FACEID"
        />

        <SectionHeading title="Chi tiết vật tư đặt hàng" />
        <BaseCard
          style={{
            backgroundColor: t.colors.bgSurfaceTint,
            borderColor: t.colors.borderBrand,
          }}
        >
          {Array.from(
            new Set(data.selectedDetail.map((line) => line.group)),
          ).map((group) => (
            <View key={group} style={{ marginBottom: t.spacing.s5 }}>
              <Text style={styles.detailGroupTitle}>{group}</Text>
              {data.selectedDetail
                .filter((line) => line.group === group)
                .map((line, index, arr) => (
                  <View
                    key={line.id}
                    style={[
                      styles.detailLineRow,
                      index === arr.length - 1
                        ? { borderBottomWidth: 0 }
                        : null,
                    ]}
                  >
                    <Text style={styles.detailLineName}>{line.name}</Text>
                    <Text style={styles.detailLineQty}>
                      {line.quantity} {line.unit.toLowerCase()}
                    </Text>
                  </View>
                ))}
            </View>
          ))}
        </BaseCard>
      </ScreenScroll>

      <StickyActionBar
        left={
          <View>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{data.total}</Text>
          </View>
        }
        right={<PrimaryButton label="Đặt hàng ngay" />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryDateLabel: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
  },
  summaryDateValue: {
    ...t.typography.titleSm,
    color: t.colors.brandStrong,
  },
  projectName: {
    ...t.typography.titleLg,
    color: t.colors.textPrimary,
    marginTop: t.spacing.s5,
  },
  projectSub: {
    ...t.typography.bodyLg,
    color: t.colors.textSecondary,
    marginTop: 2,
  },
  groupTitle: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
    marginBottom: t.spacing.s4,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.spacing.s4,
  },
  tagCell: {
    width: "48.5%",
    borderRadius: t.radius.r4,
    borderWidth: 1,
    borderColor: t.colors.borderSoft,
    backgroundColor: t.colors.bgSurfaceSoft,
    padding: t.spacing.s4,
  },
  tagCellText: {
    ...t.typography.bodyMd,
    color: t.colors.textPrimary,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: t.spacing.s4,
  },
  checkLabel: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
    flex: 1,
  },
  checkActions: {
    flexDirection: "row",
    gap: t.spacing.s3,
  },
  detailGroupTitle: {
    ...t.typography.label,
    color: t.colors.brandStrong,
    marginBottom: t.spacing.s2,
  },
  detailLineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: t.spacing.s3,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderBrand,
  },
  detailLineName: {
    ...t.typography.bodyLg,
    color: t.colors.textPrimary,
  },
  detailLineQty: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
  },
  totalLabel: {
    ...t.typography.bodySm,
    color: t.colors.textSecondary,
  },
  totalValue: {
    ...t.typography.titleLg,
    color: t.colors.brandStrong,
  },
});
