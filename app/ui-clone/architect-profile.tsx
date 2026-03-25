import {
    CertificateList,
    LivePreviewRow,
    ProjectGallery,
    SalarySelector,
    UtilityGrid,
} from "@/components/ui-clone/blocks";
import {
    AppHeader,
    BaseCard,
    InfoRow,
    PrimaryButton,
    ScreenContainer,
    ScreenScroll,
    SecondaryButton,
    SectionHeading,
    SoftBadge,
} from "@/components/ui-clone/primitives";
import { uiCloneTheme } from "@/constants/uiCloneTheme";
import {
    certificatesMock,
    liveCardsMock,
    profileSalaryOptions,
    profilesMock,
    projectsMock,
    utilitiesMock,
} from "@/data/uiCloneMock";
import { StyleSheet, Text, View } from "react-native";

const t = uiCloneTheme;

export default function ArchitectProfileScreen() {
  const profile = profilesMock.architect;

  return (
    <ScreenContainer>
      <ScreenScroll>
        <AppHeader
          title="Hồ sơ KTS"
          subtitle={`ID: ${profile.architectId}`}
          rightIcons={[{ icon: "briefcase-outline" }]}
        />

        <BaseCard>
          <View style={styles.topRow}>
            <SoftBadge label="Gói dịch vụ" tone="brand" />
          </View>
          <InfoRow label="Họ và tên" value={profile.fullName} />
          <InfoRow label="Số điện thoại" value={profile.phone} />
          <InfoRow label="CCCD" value={profile.cccd} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Địa chỉ" value={profile.address} />
          <InfoRow
            label="Mã QR cá nhân"
            value={profile.qrCode}
            borderBottom={false}
          />
        </BaseCard>

        <SectionHeading title="2. Chuyên ngành & Kinh nghiệm" />
        <BaseCard>
          <Text style={styles.blockLabel}>KỸ NĂNG CHUYÊN MÔN</Text>
          <View style={styles.chipRow}>
            {profile.skills.map((item) => (
              <SoftBadge key={item} label={item} tone="neutral" />
            ))}
          </View>

          <View style={styles.twoColRow}>
            <BaseCard style={styles.cellCard} shadow="none">
              <Text style={styles.cellLabel}>KINH NGHIỆM</Text>
              <Text style={styles.cellValue}>{profile.expYears}</Text>
            </BaseCard>
            <BaseCard style={styles.cellCard} shadow="none">
              <Text style={styles.cellLabel}>CẤP BẬC</Text>
              <Text style={styles.cellValue}>{profile.role}</Text>
            </BaseCard>
          </View>

          <Text style={[styles.blockLabel, { marginTop: t.spacing.s4 }]}>
            MỨC LƯƠNG NGUYỆN VỌNG
          </Text>
          <SalarySelector options={profileSalaryOptions} selected={1} />
        </BaseCard>

        <SectionHeading title="3. Năng lực & Chứng chỉ" />
        <BaseCard
          style={{
            backgroundColor: t.colors.bgSurfaceTint,
            borderColor: t.colors.borderBrand,
          }}
        >
          <Text style={styles.currentCompanyLabel}>ĐANG CÔNG TÁC TẠI</Text>
          <Text style={styles.currentCompanyValue}>
            CTCP Kiến trúc Xây dựng An Phương
          </Text>
        </BaseCard>
        <CertificateList items={certificatesMock.slice(0, 3)} />

        <SectionHeading title="4. Dự án thực hiện" actionLabel="Thêm mới" />
        <ProjectGallery items={projectsMock} />

        <SectionHeading title="Tiện ích quản lý" />
        <UtilityGrid items={utilitiesMock.slice(0, 8)} />

        <SectionHeading title="4. Live Preview" />
        <LivePreviewRow items={liveCardsMock.slice(0, 2)} />

        <PrimaryButton
          label="5. Quan sát công trình"
          leftIcon="videocam-outline"
          style={styles.darkPrimaryBtn}
        />
        <SecondaryButton label="6. VA-VR mặt bằng" leftIcon="scan-outline" />
      </ScreenScroll>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: "flex-end",
    marginBottom: t.spacing.s3,
  },
  blockLabel: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
    fontWeight: "700",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.spacing.s3,
    marginTop: t.spacing.s3,
  },
  twoColRow: {
    flexDirection: "row",
    gap: t.spacing.s4,
    marginTop: t.spacing.s4,
  },
  cellCard: {
    flex: 1,
    minHeight: 66,
  },
  cellLabel: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
  },
  cellValue: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
    marginTop: 2,
  },
  currentCompanyLabel: {
    ...t.typography.caption,
    color: t.colors.brandDark,
    fontWeight: "700",
  },
  currentCompanyValue: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
    marginTop: t.spacing.s2,
  },
  darkPrimaryBtn: {
    backgroundColor: "#0F1A34",
    borderColor: "#0F1A34",
  },
});
