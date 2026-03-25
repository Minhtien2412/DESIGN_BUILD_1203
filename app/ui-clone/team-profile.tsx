import {
    LivePreviewRow,
    ProfileHeroCard,
    ProjectGallery,
    UtilityGrid,
} from "@/components/ui-clone/blocks";
import {
    AppHeader,
    BaseCard,
    EmptyQR,
    InfoRow,
    ScreenContainer,
    ScreenScroll,
    SectionHeading,
} from "@/components/ui-clone/primitives";
import { uiCloneTheme } from "@/constants/uiCloneTheme";
import {
    liveCardsMock,
    profilesMock,
    projectsMock,
    utilitiesMock,
} from "@/data/uiCloneMock";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const t = uiCloneTheme;
const teamAvatar = require("../../assets/banner/banner-home-3.jpg");

export default function TeamProfileScreen() {
  const profile = profilesMock.teamLead;

  return (
    <ScreenContainer>
      <ScreenScroll>
        <AppHeader
          title="Tài khoản Đội trưởng, thợ"
          rightIcons={[{ icon: "ellipsis-horizontal" }]}
        />

        <ProfileHeroCard
          avatar={teamAvatar}
          name={profile.fullName}
          role={profile.role}
          idLabel={`ID: ${profile.workerId}`}
        />

        <SectionHeading title="Thông tin cá nhân" />
        <BaseCard>
          <InfoRow label="CCCD" value={profile.workerId} />
          <InfoRow label="Số điện thoại" value={profile.phone} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow
            label="Địa chỉ"
            value={profile.address}
            borderBottom={false}
          />
          <View style={{ marginTop: t.spacing.s5 }}>
            <EmptyQR />
          </View>
        </BaseCard>

        <SectionHeading title="Chuyên ngành" />
        <BaseCard>
          <InfoRow
            label="Kỹ năng"
            value={profile.skills}
            valueColor={t.colors.brandStrong}
          />
          <InfoRow label="Kinh nghiệm" value={profile.expYears} />
          <InfoRow label="Cấp bậc" value={profile.rank} />
          <InfoRow
            label="Lương NV"
            value={profile.salaryPerDay}
            valueColor={t.colors.brandStrong}
            borderBottom={false}
          />

          <View style={styles.rankTable}>
            <View style={styles.rankRowActive}>
              <Text style={styles.rankNameActive}>Đội trưởng</Text>
              <Text style={styles.rankValueActive}>1.2tr/ngày</Text>
            </View>
            <View style={styles.rankRow}>
              <Text style={styles.rankName}>Thợ tay nghề cao</Text>
              <Text style={styles.rankValue}>900k/ngày</Text>
            </View>
            <View style={styles.rankRow}>
              <Text style={styles.rankName}>Thợ thông dụng</Text>
              <Text style={styles.rankValue}>700k/ngày</Text>
            </View>
            <View style={styles.rankRow}>
              <Text style={styles.rankName}>Thợ phụ</Text>
              <Text style={styles.rankValue}>500k/ngày</Text>
            </View>
          </View>
        </BaseCard>

        <SectionHeading title="Dự án thực hiện" actionLabel="Thêm mới" />
        <ProjectGallery items={projectsMock} />

        <SectionHeading title="Tiện ích quản lý" />
        <UtilityGrid items={utilitiesMock} />

        <SectionHeading title="Xem live" actionLabel="Tất cả" />
        <LivePreviewRow items={liveCardsMock.slice(0, 2)} />

        <BaseCard style={styles.darkActionCard}>
          <View style={styles.actionCardRow}>
            <Text style={styles.darkActionText}>5. Quan sát công trình</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={t.colors.textOnDark}
            />
          </View>
        </BaseCard>

        <BaseCard>
          <View style={styles.actionCardRow}>
            <Text style={styles.lightActionText}>6. VA-VR mặt bằng</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={t.colors.textSecondary}
            />
          </View>
        </BaseCard>
      </ScreenScroll>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  rankTable: {
    marginTop: t.spacing.s5,
    borderRadius: t.radius.r5,
    borderWidth: 1,
    borderColor: t.colors.borderSoft,
    overflow: "hidden",
  },
  rankRowActive: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: t.spacing.s6,
    paddingVertical: t.spacing.s4,
    backgroundColor: t.colors.bgSurfaceTint,
  },
  rankNameActive: {
    ...t.typography.bodyMd,
    color: t.colors.textPrimary,
    fontWeight: "700",
  },
  rankValueActive: {
    ...t.typography.bodyMd,
    color: t.colors.brandStrong,
    fontWeight: "800",
  },
  rankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: t.spacing.s6,
    paddingVertical: t.spacing.s4,
    borderTopWidth: 1,
    borderTopColor: t.colors.borderSoft,
    backgroundColor: t.colors.bgSurface,
  },
  rankName: {
    ...t.typography.bodyMd,
    color: t.colors.textSecondary,
  },
  rankValue: {
    ...t.typography.bodyMd,
    color: t.colors.textSecondary,
    fontWeight: "700",
  },
  darkActionCard: {
    backgroundColor: "#0F1A34",
    borderColor: "#0F1A34",
  },
  actionCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  darkActionText: {
    ...t.typography.titleSm,
    color: t.colors.textOnDark,
  },
  lightActionText: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
  },
});
