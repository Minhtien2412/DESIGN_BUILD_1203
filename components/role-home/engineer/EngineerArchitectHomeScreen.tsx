/**
 * EngineerArchitectHomeScreen — Homepage for role "Kỹ sư / Kiến trúc sư"
 *
 * Sections:
 *  1. Profile card chuyên nghiệp
 *  2. Chứng chỉ / Năng lực
 *  3. Grid công cụ chuyên môn
 *  4. Dự án đã/đang làm
 *  5. Action cards chuyên sâu (VR/AR, Camera, Bản vẽ)
 *
 * @created 2026-03-21
 */

import {
    HomeHeader,
    RoleHomeSectionTitle,
    RoleSwitcher,
    ShortcutGrid,
} from "@/components/role-home/common";
import { ROLE_THEME } from "@/constants/roleTheme";
import { useRole } from "@/context/RoleContext";
import {
    engineerActions,
    engineerCerts,
    engineerProfile,
    engineerProjects,
    engineerTools,
} from "@/data/role-home/engineerHomeData";
import { navigateByFeatureId, safeNavigate } from "@/utils/safeNavigation";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SW } = Dimensions.get("window");

const STATUS_COLORS = {
  completed: "#10B981",
  ongoing: "#3B82F6",
  pending: "#F59E0B",
} as const;

const STATUS_LABELS = {
  completed: "Hoàn thành",
  ongoing: "Đang chạy",
  pending: "Chờ duyệt",
} as const;

export function EngineerArchitectHomeScreen() {
  const { role, setRole } = useRole();
  const [switcherVisible, setSwitcherVisible] = useState(false);

  const handleRoleSwitch = useCallback(
    async (newRole: any) => {
      await setRole(newRole);
    },
    [setRole],
  );

  return (
    <View style={s.container}>
      <HomeHeader
        role="engineer"
        userName={engineerProfile.name}
        onRoleSwitcherPress={() => setSwitcherVisible(true)}
        onSearchPress={() => safeNavigate("/search")}
        onNotificationPress={() => safeNavigate("/(tabs)/notifications")}
        notifCount={5}
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Ionicons name="person" size={36} color="#6366F1" />
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{engineerProfile.name}</Text>
            <Text style={s.profileTitle}>{engineerProfile.title}</Text>
            <View style={s.profileBadges}>
              <View style={s.levelBadge}>
                <Text style={s.levelText}>{engineerProfile.level}</Text>
              </View>
              <Text style={s.expText}>
                {engineerProfile.experience} kinh nghiệm
              </Text>
            </View>
          </View>
          <View style={s.profileStats}>
            <View style={s.profileStatItem}>
              <Text style={s.profileStatValue}>
                {engineerProfile.projectCount}
              </Text>
              <Text style={s.profileStatLabel}>Dự án</Text>
            </View>
            <View style={s.profileStatItem}>
              <Text style={s.profileStatValue}>
                {engineerProfile.certCount}
              </Text>
              <Text style={s.profileStatLabel}>Chứng chỉ</Text>
            </View>
            <View style={s.profileStatItem}>
              <View style={s.ratingRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={s.profileStatValue}>{engineerProfile.rating}</Text>
              </View>
              <Text style={s.profileStatLabel}>Đánh giá</Text>
            </View>
          </View>
        </View>

        {/* Chứng chỉ */}
        <RoleHomeSectionTitle
          title="Chứng chỉ & Năng lực"
          actionLabel="Quản lý"
          onAction={() =>
            safeNavigate("/(tabs)/profile", { section: "certifications" })
          }
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.certScroll}
        >
          {engineerCerts.map((cert) => (
            <View key={cert.id} style={s.certCard}>
              <View style={s.certIcon}>
                <Ionicons
                  name={cert.verified ? "shield-checkmark" : "ribbon-outline"}
                  size={20}
                  color={cert.verified ? "#10B981" : "#F59E0B"}
                />
              </View>
              <Text style={s.certName} numberOfLines={2}>
                {cert.name}
              </Text>
              <Text style={s.certIssuer}>{cert.issuer}</Text>
              <Text style={s.certYear}>{cert.year}</Text>
              {cert.verified && (
                <View style={s.verifiedBadge}>
                  <Text style={s.verifiedText}>Đã xác minh</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Professional Tools */}
        <RoleHomeSectionTitle title="Công cụ chuyên môn" />
        <ShortcutGrid
          items={engineerTools}
          onPress={(item) => navigateByFeatureId(item.id)}
        />

        {/* Recent Projects */}
        <RoleHomeSectionTitle
          title="Dự án"
          actionLabel="Tất cả"
          onAction={() => safeNavigate("/(tabs)/projects")}
        />
        <View style={s.projectList}>
          {engineerProjects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={s.projectCard}
              activeOpacity={0.7}
              onPress={() => safeNavigate(`/projects/${project.id}`)}
            >
              <View style={s.projectTop}>
                <View style={s.projectInfo}>
                  <Text style={s.projectName}>{project.name}</Text>
                  <Text style={s.projectType}>
                    {project.type} • {project.value}
                  </Text>
                </View>
                <View
                  style={[
                    s.statusBadge,
                    { backgroundColor: STATUS_COLORS[project.status] + "15" },
                  ]}
                >
                  <View
                    style={[
                      s.statusDot,
                      { backgroundColor: STATUS_COLORS[project.status] },
                    ]}
                  />
                  <Text
                    style={[
                      s.statusText,
                      { color: STATUS_COLORS[project.status] },
                    ]}
                  >
                    {STATUS_LABELS[project.status]}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Cards */}
        <RoleHomeSectionTitle title="Công cụ nâng cao" />
        <View style={s.actionGrid}>
          {engineerActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[s.actionCard, { backgroundColor: action.bgColor }]}
              activeOpacity={0.7}
              onPress={() => navigateByFeatureId(action.id)}
            >
              <Ionicons
                name={action.icon as any}
                size={28}
                color={action.color}
              />
              <Text style={[s.actionLabel, { color: action.color }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <RoleSwitcher
        visible={switcherVisible}
        currentRole={role || "engineer"}
        onSelect={handleRoleSwitch}
        onClose={() => setSwitcherVisible(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: ROLE_THEME.bgSoft },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Profile card
  profileCard: {
    backgroundColor: ROLE_THEME.card,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: ROLE_THEME.radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: ROLE_THEME.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileInfo: { marginBottom: 16 },
  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: ROLE_THEME.textPrimary,
  },
  profileTitle: { fontSize: 13, color: ROLE_THEME.textSecondary, marginTop: 2 },
  profileBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  levelBadge: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: ROLE_THEME.radius.full,
  },
  levelText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },
  expText: { fontSize: 12, color: ROLE_THEME.textSecondary },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: ROLE_THEME.borderLight,
    paddingTop: 14,
  },
  profileStatItem: { alignItems: "center", gap: 2 },
  profileStatValue: {
    fontSize: 18,
    fontWeight: "800",
    color: ROLE_THEME.textPrimary,
  },
  profileStatLabel: { fontSize: 11, color: ROLE_THEME.textSecondary },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },

  // Certs
  certScroll: { paddingHorizontal: 20, gap: 10 },
  certCard: {
    backgroundColor: ROLE_THEME.card,
    borderRadius: ROLE_THEME.radius.lg,
    padding: 14,
    width: 150,
    borderWidth: 1,
    borderColor: ROLE_THEME.borderLight,
    gap: 4,
  },
  certIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: ROLE_THEME.bgMuted,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  certName: {
    fontSize: 13,
    fontWeight: "700",
    color: ROLE_THEME.textPrimary,
    lineHeight: 18,
  },
  certIssuer: { fontSize: 11, color: ROLE_THEME.textSecondary },
  certYear: { fontSize: 11, color: ROLE_THEME.textMuted },
  verifiedBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  verifiedText: { fontSize: 10, fontWeight: "700", color: "#10B981" },

  // Projects
  projectList: { paddingHorizontal: 20, gap: 10 },
  projectCard: {
    backgroundColor: ROLE_THEME.card,
    borderRadius: ROLE_THEME.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: ROLE_THEME.borderLight,
  },
  projectTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectInfo: { flex: 1 },
  projectName: {
    fontSize: 15,
    fontWeight: "700",
    color: ROLE_THEME.textPrimary,
  },
  projectType: { fontSize: 12, color: ROLE_THEME.textSecondary, marginTop: 3 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: ROLE_THEME.radius.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },

  // Action grid
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    width: (SW - 40 - 12) / 2,
    borderRadius: ROLE_THEME.radius.lg,
    padding: 20,
    gap: 10,
    alignItems: "center",
  },
  actionLabel: { fontSize: 13, fontWeight: "700", textAlign: "center" },
});
