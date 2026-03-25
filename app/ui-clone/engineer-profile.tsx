import {
    CertificateList,
    LivePreviewRow,
    ProfileHeroCard,
    ProjectGallery,
    SalarySelector,
    UtilityGrid,
} from "@/components/ui-clone/blocks";
import {
    AppHeader,
    BaseCard,
    InfoRow,
    ScreenContainer,
    ScreenScroll,
    SectionHeading,
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
const engineerAvatar = require("../../assets/banner/banner-home-5.jpg");

export default function EngineerProfileScreen() {
  const profile = profilesMock.engineer;

  return (
    <ScreenContainer>
      <ScreenScroll>
        <AppHeader
          title="Hồ sơ Kỹ sư"
          rightIcons={[{ icon: "settings-outline" }]}
        />

        <ProfileHeroCard
          avatar={engineerAvatar}
          name={profile.fullName}
          role={profile.role}
          idLabel={`ID: ${profile.engineerId}`}
        />

        <SectionHeading title="Tài khoản Kỹ sư" actionLabel="Chỉnh sửa" />
        <BaseCard>
          <InfoRow label="CCCD" value={profile.cccd} />
          <InfoRow label="Điện thoại" value={profile.phone} />
          <InfoRow label="Địa chỉ" value={profile.address} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow
            label="Mã QR nhận tiền"
            value={profile.qrBank}
            borderBottom={false}
          />
        </BaseCard>

        <SectionHeading title="Chuyên ngành" />
        <BaseCard>
          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>Kinh nghiệm</Text>
              <Text style={styles.statValue}>{profile.expYears}</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>Cấp bậc</Text>
              <Text style={styles.statValue}>{profile.rank}</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>Kỹ năng</Text>
              <Text style={styles.statValue}>{profile.skill}</Text>
            </View>
          </View>

          <Text style={styles.salaryLabel}>Mức lương nguyện vọng</Text>
          <SalarySelector options={profileSalaryOptions} selected={1} />
        </BaseCard>

        <SectionHeading title="Năng lực" />
        <BaseCard style={{ backgroundColor: t.colors.bgSurfaceSoft }}>
          <Text style={styles.companyLabel}>Công ty hiện tại</Text>
          <Text style={styles.companyValue}>
            CTCP Kiến trúc Xây dựng Nhà Xinh
          </Text>
        </BaseCard>
        <CertificateList items={certificatesMock} />

        <SectionHeading title="Dự án thực hiện" actionLabel="Xem tất cả" />
        <ProjectGallery items={projectsMock.slice(0, 3)} />

        <SectionHeading title="Tiện ích" />
        <UtilityGrid items={utilitiesMock} />

        <SectionHeading
          title="Xem Live công trình"
          actionLabel="● TRỰC TIẾP"
          actionColor={t.colors.danger}
        />
        <LivePreviewRow items={liveCardsMock.slice(0, 2)} />
      </ScreenScroll>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: t.spacing.s4,
    marginBottom: t.spacing.s6,
  },
  statCell: {
    flex: 1,
    borderRadius: t.radius.r4,
    borderWidth: 1,
    borderColor: t.colors.borderSoft,
    backgroundColor: t.colors.bgSurfaceSoft,
    padding: t.spacing.s4,
  },
  statLabel: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
  },
  statValue: {
    ...t.typography.titleSm,
    color: t.colors.brandStrong,
    marginTop: t.spacing.s1,
  },
  salaryLabel: {
    ...t.typography.bodyMd,
    color: t.colors.textSecondary,
    marginBottom: t.spacing.s3,
  },
  companyLabel: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
  },
  companyValue: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
    marginTop: t.spacing.s2,
  },
});
