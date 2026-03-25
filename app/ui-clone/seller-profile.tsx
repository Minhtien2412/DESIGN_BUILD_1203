import {
    LivePreviewRow,
    ProductGrid,
    UtilityGrid,
} from "@/components/ui-clone/blocks";
import {
    AppHeader,
    AvatarCircle,
    BaseCard,
    InfoRow,
    ScreenContainer,
    ScreenScroll,
    SectionHeading,
    SoftBadge,
} from "@/components/ui-clone/primitives";
import { uiCloneTheme } from "@/constants/uiCloneTheme";
import {
    liveCardsMock,
    productsMock,
    profilesMock,
    utilitiesMock,
} from "@/data/uiCloneMock";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const t = uiCloneTheme;
const avatar = require("../../assets/banner/banner-home-1.jpg");

export default function SellerProfileScreen() {
  const seller = profilesMock.seller;

  return (
    <ScreenContainer>
      <ScreenScroll>
        <AppHeader
          title="Hồ sơ Bán hàng"
          rightIcons={[
            { icon: "share-social-outline" },
            { icon: "ellipsis-vertical" },
          ]}
        />

        <BaseCard>
          <View style={styles.heroRow}>
            <AvatarCircle source={avatar} size={66} />
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>{seller.storeName}</Text>
              <Text style={styles.storeSub}>{seller.storeTagline}</Text>
              <View style={styles.badgeRow}>
                <SoftBadge label="OFFICIAL STORE" tone="brand" />
                <Text style={styles.storeCode}>ID: {seller.storeCode}</Text>
              </View>
            </View>
            <View style={styles.pencilBtn}>
              <Ionicons
                name="create-outline"
                size={16}
                color={t.colors.brandStrong}
              />
            </View>
          </View>
        </BaseCard>

        <SectionHeading title="Tài khoản bán hàng" />
        <BaseCard>
          <InfoRow label="Họ và tên" value={seller.managerName} />
          <InfoRow label="Số CCCD" value={seller.cccd} />
          <InfoRow label="Số điện thoại" value={seller.phone} />
          <InfoRow
            label="Email"
            value={seller.email}
            valueColor={t.colors.brandStrong}
          />
          <InfoRow
            label="Địa chỉ thường trú"
            value={seller.residence}
            borderBottom={false}
          />
        </BaseCard>

        <SectionHeading title="Thông tin cửa hàng" />
        <BaseCard>
          <InfoRow label="Địa chỉ lấy hàng" value={seller.warehouseAddress} />
          <InfoRow
            label="Mô tả cửa hàng"
            value={seller.storeDesc}
            borderBottom={false}
          />
        </BaseCard>

        <SectionHeading title="Năng lực doanh nghiệp" />
        <BaseCard style={styles.enterpriseCard}>
          <View style={styles.enterpriseTop}>
            <BaseCard style={styles.enterpriseCell} shadow="none">
              <Text style={styles.enterpriseLabel}>MÃ SỐ THUẾ</Text>
              <Text style={styles.enterpriseValue}>{seller.taxCode}</Text>
            </BaseCard>
            <BaseCard style={styles.enterpriseCell} shadow="none">
              <Text style={styles.enterpriseLabel}>GIẤY PHÉP KD</Text>
              <Text style={styles.enterpriseValue}>
                {seller.businessLicense}
              </Text>
            </BaseCard>
          </View>
          <BaseCard style={styles.qrPayRow} shadow="none">
            <View>
              <Text style={styles.enterpriseValue}>Thanh toán QR</Text>
              <Text style={styles.enterpriseLabel}>
                Quét để nhận thanh toán
              </Text>
            </View>
            <View style={styles.qrBox}>
              <Ionicons
                name="qr-code-outline"
                size={20}
                color={t.colors.warning}
              />
            </View>
          </BaseCard>
        </BaseCard>

        <SectionHeading title="Tiện ích quản lý" />
        <UtilityGrid items={utilitiesMock} />

        <SectionHeading title="Xem Live" actionLabel="Xem tất cả" />
        <LivePreviewRow items={liveCardsMock} />

        <SectionHeading title="Sản phẩm nổi bật" />
        <ProductGrid items={productsMock} />
      </ScreenScroll>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.s4,
  },
  storeName: {
    ...t.typography.titleMd,
    color: t.colors.textPrimary,
  },
  storeSub: {
    ...t.typography.bodyMd,
    color: t.colors.textSecondary,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.s3,
    marginTop: t.spacing.s3,
  },
  storeCode: {
    ...t.typography.bodySm,
    color: t.colors.textSecondary,
    fontWeight: "700",
  },
  pencilBtn: {
    width: 32,
    height: 32,
    borderRadius: t.radius.rPill,
    backgroundColor: t.colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  enterpriseCard: {
    backgroundColor: t.colors.bgSurfaceTint,
  },
  enterpriseTop: {
    flexDirection: "row",
    gap: t.spacing.s4,
  },
  enterpriseCell: {
    flex: 1,
    minHeight: 62,
  },
  enterpriseLabel: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
  },
  enterpriseValue: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
    marginTop: 2,
  },
  qrPayRow: {
    marginTop: t.spacing.s4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qrBox: {
    width: 42,
    height: 42,
    borderRadius: t.radius.r4,
    borderWidth: 1,
    borderColor: t.colors.borderBrand,
    backgroundColor: t.colors.warningSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
