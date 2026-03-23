/**
 * ContractorCompanyHomeScreen — Homepage for role "Nhà thầu / Công ty"
 *
 * Sections:
 *  1. Dashboard KPIs (4 stat cards)
 *  2. Quick actions grid (8 icons)
 *  3. Active projects with progress
 *  4. Team overview
 *  5. Recent alerts
 *
 * @created 2026-03-21
 */

import {
    HomeHeader,
    RoleHomeSectionTitle,
    RoleSwitcher,
    ShortcutGrid,
    StatCard,
} from "@/components/role-home/common";
import { ROLE_THEME } from "@/constants/roleTheme";
import { useRole } from "@/context/RoleContext";
import {
    contractorActions,
    contractorAlerts,
    contractorProjects,
    contractorStats,
    contractorTeam,
} from "@/data/role-home/contractorHomeData";
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
import { FindWorkerBanner } from "./sections/FindWorkerBanner";

const { width: SW } = Dimensions.get("window");
const STAT_WIDTH = (SW - 40 - 12) / 2;

const PROJECT_STATUS_MAP = {
  on_track: { color: "#10B981", label: "Đúng tiến độ" },
  at_risk: { color: "#F59E0B", label: "Rủi ro trễ" },
  delayed: { color: "#EF4444", label: "Đã trễ" },
} as const;

const TEAM_STATUS_MAP = {
  active: { color: "#10B981", label: "Đang làm" },
  busy: { color: "#F59E0B", label: "Bận" },
  off: { color: "#9CA3AF", label: "Nghỉ" },
} as const;

export function ContractorCompanyHomeScreen() {
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
        role="contractor"
        userName="Công ty ABC"
        onRoleSwitcherPress={() => setSwitcherVisible(true)}
        onSearchPress={() => safeNavigate("/search")}
        onNotificationPress={() => safeNavigate("/(tabs)/notifications")}
        notifCount={8}
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard KPIs */}
        <RoleHomeSectionTitle title="Tổng quan" />
        <View style={s.statsGrid}>
          {contractorStats.map((stat) => (
            <View key={stat.id} style={{ width: STAT_WIDTH }}>
              <StatCard
                label={stat.label}
                value={stat.value}
                change={stat.change}
                isPositive={stat.isPositive}
                icon={stat.icon}
                color={stat.color}
              />
            </View>
          ))}
        </View>

        {/* Alerts bar */}
        <View style={s.alertsBar}>
          {contractorAlerts.slice(0, 1).map((alert) => (
            <View key={alert.id} style={s.alertItem}>
              <Ionicons
                name={
                  alert.type === "warning"
                    ? "alert-circle"
                    : alert.type === "success"
                      ? "checkmark-circle"
                      : "information-circle"
                }
                size={18}
                color={
                  alert.type === "warning"
                    ? "#F59E0B"
                    : alert.type === "success"
                      ? "#10B981"
                      : "#3B82F6"
                }
              />
              <Text style={s.alertText} numberOfLines={1}>
                {alert.message}
              </Text>
              <Text style={s.alertTime}>{alert.time}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <RoleHomeSectionTitle title="Quản lý nhanh" />
        <ShortcutGrid
          items={contractorActions}
          onPress={(item) => navigateByFeatureId(item.id)}
        />

        {/* Find Workers CTA */}
        <FindWorkerBanner
          onFindWorkerList={() => safeNavigate("/find-workers")}
          onFindWorkerMap={() => safeNavigate("/service-booking/worker-map")}
        />

        {/* Active Projects */}
        <RoleHomeSectionTitle
          title="Dự án đang chạy"
          actionLabel={`${contractorProjects.length} dự án`}
          onAction={() => safeNavigate("/(tabs)/projects")}
        />
        <View style={s.projectList}>
          {contractorProjects.map((project) => {
            const statusInfo = PROJECT_STATUS_MAP[project.status];
            return (
              <TouchableOpacity
                key={project.id}
                style={s.projectCard}
                activeOpacity={0.7}
                onPress={() => safeNavigate(`/projects/${project.id}`)}
              >
                <View style={s.projectHeader}>
                  <Text style={s.projectName}>{project.name}</Text>
                  <View
                    style={[
                      s.projectStatusBadge,
                      { backgroundColor: statusInfo.color + "15" },
                    ]}
                  >
                    <Text
                      style={[s.projectStatusText, { color: statusInfo.color }]}
                    >
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={s.progressContainer}>
                  <View style={s.progressBar}>
                    <View
                      style={[
                        s.progressFill,
                        {
                          width: `${project.progress}%`,
                          backgroundColor: statusInfo.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={s.progressText}>{project.progress}%</Text>
                </View>

                <View style={s.projectMeta}>
                  <View style={s.projectMetaItem}>
                    <Ionicons
                      name="people-outline"
                      size={14}
                      color={ROLE_THEME.textSecondary}
                    />
                    <Text style={s.projectMetaText}>{project.team} người</Text>
                  </View>
                  <View style={s.projectMetaItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={ROLE_THEME.textSecondary}
                    />
                    <Text style={s.projectMetaText}>{project.dueDate}</Text>
                  </View>
                  <Text style={s.projectBudget}>{project.budget}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Team Overview */}
        <RoleHomeSectionTitle
          title="Đội ngũ"
          actionLabel="Tất cả"
          onAction={() => safeNavigate("/workers", { view: "team" })}
        />
        <View style={s.teamList}>
          {contractorTeam.map((member) => {
            const teamStatus = TEAM_STATUS_MAP[member.status];
            return (
              <View key={member.id} style={s.teamItem}>
                <View style={s.teamAvatar}>
                  <Text style={s.teamAvatarText}>{member.name.charAt(0)}</Text>
                </View>
                <View style={s.teamInfo}>
                  <Text style={s.teamName}>{member.name}</Text>
                  <Text style={s.teamRole}>{member.role}</Text>
                </View>
                <View
                  style={[
                    s.teamStatusBadge,
                    { backgroundColor: teamStatus.color + "15" },
                  ]}
                >
                  <View
                    style={[
                      s.teamStatusDot,
                      { backgroundColor: teamStatus.color },
                    ]}
                  />
                  <Text style={[s.teamStatusText, { color: teamStatus.color }]}>
                    {teamStatus.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <RoleSwitcher
        visible={switcherVisible}
        currentRole={role || "contractor"}
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

  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },

  // Alerts
  alertsBar: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "#FEF3C7",
    borderRadius: ROLE_THEME.radius.md,
    padding: 12,
  },
  alertItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  alertText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: ROLE_THEME.textPrimary,
  },
  alertTime: { fontSize: 10, color: ROLE_THEME.textMuted },

  // Projects
  projectList: { paddingHorizontal: 20, gap: 12 },
  projectCard: {
    backgroundColor: ROLE_THEME.card,
    borderRadius: ROLE_THEME.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: ROLE_THEME.borderLight,
    gap: 12,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectName: {
    fontSize: 15,
    fontWeight: "700",
    color: ROLE_THEME.textPrimary,
    flex: 1,
  },
  projectStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: ROLE_THEME.radius.full,
  },
  projectStatusText: { fontSize: 11, fontWeight: "700" },
  progressContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: ROLE_THEME.bgMuted,
    overflow: "hidden",
  },
  progressFill: { height: 8, borderRadius: 4 },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
    color: ROLE_THEME.textPrimary,
    minWidth: 36,
    textAlign: "right",
  },
  projectMeta: { flexDirection: "row", alignItems: "center", gap: 16 },
  projectMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  projectMetaText: { fontSize: 12, color: ROLE_THEME.textSecondary },
  projectBudget: {
    fontSize: 13,
    fontWeight: "700",
    color: ROLE_THEME.primary,
    marginLeft: "auto",
  },

  // Team
  teamList: { paddingHorizontal: 20, gap: 8 },
  teamItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ROLE_THEME.card,
    borderRadius: ROLE_THEME.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: ROLE_THEME.borderLight,
    gap: 12,
  },
  teamAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ROLE_THEME.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  teamAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: ROLE_THEME.primary,
  },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 14, fontWeight: "600", color: ROLE_THEME.textPrimary },
  teamRole: { fontSize: 12, color: ROLE_THEME.textSecondary },
  teamStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROLE_THEME.radius.full,
  },
  teamStatusDot: { width: 6, height: 6, borderRadius: 3 },
  teamStatusText: { fontSize: 11, fontWeight: "600" },
});
