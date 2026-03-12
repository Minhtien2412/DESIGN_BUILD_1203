/**
 * ProjectsScreen — Quản lý Dự án Phân cấp theo Role
 *
 * Role-based project management with progress tracking:
 * - Admin: Full access (CRUD all projects, manage teams, approve milestones)
 * - Contractor: Create/manage projects, progress reports, budget tracking
 * - Architect/Designer: View assigned, update design progress, add documents
 * - Company: Create & manage company projects, assign teams
 * - Supplier: View material needs, supply status
 * - Buyer/Client: View own projects, approve milestones, track progress
 * - Seller: View assigned tasks, update task status
 *
 * Accessible via navigation (not in bottom tab bar)
 */

import ProjectQuickActions from "@/components/projects/quick-actions";
import TopPlusMenu from "@/components/projects/top-plus-menu";
import { ROLE_BADGES } from "@/constants/roles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useProjectData } from "@/context/project-data-context";
import { useSmartBackHandler } from "@/hooks/useBackHandler";
import {
    Project,
    ProjectStatus,
    ProjectType,
    useProjects,
} from "@/hooks/useProjects";
import type { UserType } from "@/types/auth";
import { getItem, setItem } from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

// ═══════════════════════════════════════════════════════════════════════
// ROLE PERMISSION CONFIG
// ═══════════════════════════════════════════════════════════════════════

type ProjectPermission =
  | "project.create"
  | "project.edit_all"
  | "project.edit_own"
  | "project.delete"
  | "project.view_all"
  | "project.view_assigned"
  | "project.view_own"
  | "project.manage_team"
  | "project.approve_progress"
  | "project.update_progress"
  | "project.manage_budget"
  | "project.view_budget"
  | "project.manage_documents"
  | "project.manage_tasks"
  | "project.update_task_status";

const ROLE_PROJECT_PERMISSIONS: Record<UserType, ProjectPermission[]> = {
  admin: [
    "project.create",
    "project.edit_all",
    "project.delete",
    "project.view_all",
    "project.manage_team",
    "project.approve_progress",
    "project.update_progress",
    "project.manage_budget",
    "project.view_budget",
    "project.manage_documents",
    "project.manage_tasks",
    "project.update_task_status",
  ],
  contractor: [
    "project.create",
    "project.edit_own",
    "project.view_all",
    "project.manage_team",
    "project.update_progress",
    "project.manage_budget",
    "project.view_budget",
    "project.manage_documents",
    "project.manage_tasks",
    "project.update_task_status",
  ],
  company: [
    "project.create",
    "project.edit_own",
    "project.view_all",
    "project.manage_team",
    "project.update_progress",
    "project.manage_budget",
    "project.view_budget",
    "project.manage_documents",
    "project.manage_tasks",
  ],
  architect: [
    "project.view_assigned",
    "project.update_progress",
    "project.view_budget",
    "project.manage_documents",
    "project.update_task_status",
  ],
  designer: [
    "project.view_assigned",
    "project.update_progress",
    "project.view_budget",
    "project.manage_documents",
    "project.update_task_status",
  ],
  supplier: ["project.view_assigned", "project.view_budget"],
  buyer: [
    "project.view_own",
    "project.approve_progress",
    "project.view_budget",
  ],
  seller: ["project.view_assigned", "project.update_task_status"],
};

function hasProjectPermission(
  userType: UserType | undefined,
  perm: ProjectPermission,
): boolean {
  if (!userType) return false;
  const perms = ROLE_PROJECT_PERMISSIONS[userType] || [];
  return perms.includes(perm);
}

// ═══════════════════════════════════════════════════════════════════════
// ROLE DASHBOARD SECTIONS
// ═══════════════════════════════════════════════════════════════════════

interface RoleDashboardConfig {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  showStats: boolean;
  showGantt: boolean;
  showCreateButton: boolean;
  showBudgetOverview: boolean;
  showMilestones: boolean;
  defaultFilter: "all" | "mine" | "assigned";
  filterOptions: ("all" | "mine" | "assigned" | ProjectStatus)[];
}

function getRoleDashboardConfig(
  userType: UserType | undefined,
): RoleDashboardConfig {
  switch (userType) {
    case "admin":
      return {
        title: "Quản lý Dự án",
        subtitle: "Tổng quan toàn bộ dự án hệ thống",
        icon: "shield-checkmark-outline",
        showStats: true,
        showGantt: true,
        showCreateButton: true,
        showBudgetOverview: true,
        showMilestones: true,
        defaultFilter: "all",
        filterOptions: ["all", "active", "planning", "completed", "paused"],
      };
    case "contractor":
      return {
        title: "Dự án Thi công",
        subtitle: "Quản lý dự án nhà thầu",
        icon: "construct-outline",
        showStats: true,
        showGantt: true,
        showCreateButton: true,
        showBudgetOverview: true,
        showMilestones: true,
        defaultFilter: "all",
        filterOptions: [
          "all",
          "mine",
          "active",
          "planning",
          "completed",
          "paused",
        ],
      };
    case "company":
      return {
        title: "Dự án Công ty",
        subtitle: "Quản lý dự án công ty",
        icon: "business-outline",
        showStats: true,
        showGantt: true,
        showCreateButton: true,
        showBudgetOverview: true,
        showMilestones: true,
        defaultFilter: "all",
        filterOptions: ["all", "mine", "active", "planning", "completed"],
      };
    case "architect":
      return {
        title: "Dự án Thiết kế",
        subtitle: "Giám sát thiết kế kiến trúc",
        icon: "shapes-outline",
        showStats: true,
        showGantt: false,
        showCreateButton: false,
        showBudgetOverview: false,
        showMilestones: true,
        defaultFilter: "assigned",
        filterOptions: ["assigned", "active", "planning", "completed"],
      };
    case "designer":
      return {
        title: "Dự án Nội thất",
        subtitle: "Theo dõi thiết kế nội thất",
        icon: "color-palette-outline",
        showStats: true,
        showGantt: false,
        showCreateButton: false,
        showBudgetOverview: false,
        showMilestones: true,
        defaultFilter: "assigned",
        filterOptions: ["assigned", "active", "completed"],
      };
    case "supplier":
      return {
        title: "Dự án Cung ứng",
        subtitle: "Theo dõi nhu cầu vật liệu",
        icon: "cube-outline",
        showStats: false,
        showGantt: false,
        showCreateButton: false,
        showBudgetOverview: false,
        showMilestones: false,
        defaultFilter: "assigned",
        filterOptions: ["assigned", "active"],
      };
    case "buyer":
      return {
        title: "Dự án của tôi",
        subtitle: "Theo dõi tiến độ dự án",
        icon: "home-outline",
        showStats: true,
        showGantt: false,
        showCreateButton: false,
        showBudgetOverview: true,
        showMilestones: true,
        defaultFilter: "mine",
        filterOptions: ["mine", "active", "planning", "completed"],
      };
    case "seller":
      return {
        title: "Công việc",
        subtitle: "Theo dõi nhiệm vụ được giao",
        icon: "hammer-outline",
        showStats: false,
        showGantt: false,
        showCreateButton: false,
        showBudgetOverview: false,
        showMilestones: false,
        defaultFilter: "assigned",
        filterOptions: ["assigned", "active", "completed"],
      };
    default:
      return {
        title: "Dự án",
        subtitle: "Quản lý dự án",
        icon: "briefcase-outline",
        showStats: true,
        showGantt: false,
        showCreateButton: false,
        showBudgetOverview: false,
        showMilestones: false,
        defaultFilter: "all",
        filterOptions: ["all", "active", "completed"],
      };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

/** Role badge shown next to user name */
const RoleBadge = ({ userType }: { userType?: UserType }) => {
  if (!userType) return null;
  const badge = ROLE_BADGES[userType];
  if (!badge) return null;
  return (
    <View style={[styles.roleBadge, { backgroundColor: badge.bgColor }]}>
      <Ionicons name={badge.icon as any} size={12} color={badge.textColor} />
      <Text style={[styles.roleBadgeText, { color: badge.textColor }]}>
        {badge.text}
      </Text>
    </View>
  );
};

/** Compact filter chip */
const FilterChip = ({
  label,
  active,
  onPress,
  count,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  count?: number;
}) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? "light"];
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        { backgroundColor: active ? "#fff" : "rgba(255,255,255,0.3)" },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: active ? colors.accent : "#fff" },
        ]}
      >
        {label}
      </Text>
      {typeof count === "number" && (
        <View
          style={[
            styles.countBadge,
            { backgroundColor: active ? colors.accent : "#fff" },
          ]}
        >
          <Text
            style={[
              styles.countBadgeText,
              { color: active ? "#fff" : colors.accent },
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

/** Progress milestone tracker */
const MilestoneTracker = ({
  project,
  canApprove,
}: {
  project: Project;
  canApprove: boolean;
}) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? "light"];
  const milestones = [
    { label: "Khởi công", pct: 0, icon: "flag-outline" as const },
    { label: "Nền móng", pct: 20, icon: "layers-outline" as const },
    { label: "Kết cấu", pct: 40, icon: "git-branch-outline" as const },
    { label: "Hoàn thiện", pct: 70, icon: "color-fill-outline" as const },
    { label: "Nghiệm thu", pct: 90, icon: "checkmark-done-outline" as const },
    { label: "Bàn giao", pct: 100, icon: "home-outline" as const },
  ];
  const progress = project.progress ?? 0;

  return (
    <View style={styles.milestoneContainer}>
      <View style={styles.milestoneHeader}>
        <Text style={[styles.milestoneTitleText, { color: colors.text }]}>
          Tiến độ mốc
        </Text>
        <Text style={[styles.milestoneProgress, { color: colors.accent }]}>
          {progress}%
        </Text>
      </View>
      <View style={styles.milestoneTrack}>
        <View
          style={[styles.milestoneTrackBg, { backgroundColor: colors.border }]}
        />
        <View
          style={[
            styles.milestoneTrackFill,
            { backgroundColor: colors.accent, width: `${progress}%` },
          ]}
        />
        {milestones.map((m, i) => {
          const reached = progress >= m.pct;
          const isCurrent =
            i < milestones.length - 1
              ? progress >= m.pct && progress < milestones[i + 1].pct
              : progress >= m.pct;
          return (
            <View
              key={m.label}
              style={[styles.milestoneNode, { left: `${m.pct}%` }]}
            >
              <View
                style={[
                  styles.milestoneCircle,
                  {
                    backgroundColor: reached ? colors.accent : "#E5E7EB",
                    borderColor: isCurrent ? "#FCD34D" : "transparent",
                    borderWidth: isCurrent ? 2 : 0,
                  },
                ]}
              >
                <Ionicons
                  name={m.icon}
                  size={12}
                  color={reached ? "#fff" : "#9CA3AF"}
                />
              </View>
              <Text
                style={[
                  styles.milestoneLabel,
                  {
                    color: reached ? colors.text : colors.textMuted,
                    fontWeight: isCurrent ? "700" : "400",
                  },
                ]}
                numberOfLines={1}
              >
                {m.label}
              </Text>
            </View>
          );
        })}
      </View>
      {canApprove && progress > 0 && progress < 100 && (
        <TouchableOpacity
          style={[styles.approveButton, { backgroundColor: "#10B981" }]}
          onPress={() =>
            Alert.alert(
              "Duyệt tiến độ",
              `Xác nhận tiến độ ${progress}% cho dự án?`,
            )
          }
        >
          <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
          <Text style={styles.approveButtonText}>Duyệt tiến độ</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/** Project card with role-aware actions */
const ProjectCard = ({
  project,
  onPress,
  onMenuPress,
  budgetData,
  projectTasks,
  userType,
  showMilestones,
}: {
  project: Project;
  onPress: () => void;
  onMenuPress: () => void;
  budgetData?: { totalBudget: number; totalSpent: number };
  projectTasks?: ({ status: string } | any)[];
  userType?: UserType;
  showMilestones?: boolean;
}) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? "light"];
  const getStatusColor = () => {
    switch (project.status) {
      case "active":
        return "#007AFF";
      case "completed":
        return "#34C759";
      case "planning":
        return "#FF9500";
      case "paused":
        return "#FF3B30";
      default:
        return colors.textMuted;
    }
  };
  const getStatusLabel = () => {
    switch (project.status) {
      case "active":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "planning":
        return "Lên kế hoạch";
      case "paused":
        return "Tạm dừng";
      default:
        return "Khác";
    }
  };
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };
  const budgetStat = (() => {
    if (!budgetData) return null;
    const percentage =
      budgetData.totalBudget > 0
        ? (budgetData.totalSpent / budgetData.totalBudget) * 100
        : 0;
    const color =
      percentage > 100 ? "#EF4444" : percentage > 80 ? "#F59E0B" : "#10B981";
    return { percentage, color };
  })();
  const taskStat = (() => {
    if (!projectTasks || projectTasks.length === 0) return null;
    const completed = projectTasks.filter(
      (t: any) => t.status === "completed",
    ).length;
    return { completed, total: projectTasks.length };
  })();
  const typeLabel = (() => {
    switch (project.type) {
      case "residential":
        return "Nhà ở";
      case "commercial":
        return "Thương mại";
      case "landscape":
        return "Cảnh quan";
      case "interior":
        return "Nội thất";
      case "renovation":
        return "Cải tạo";
      default:
        return project.type;
    }
  })();
  const formatCurrency = (v?: number) => {
    if (!v && v !== 0) return undefined;
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(v);
    } catch {
      return `₫${(v || 0).toLocaleString("vi-VN")}`;
    }
  };
  const canViewBudget = hasProjectPermission(userType, "project.view_budget");
  const canApprove = hasProjectPermission(userType, "project.approve_progress");
  const canEdit =
    hasProjectPermission(userType, "project.edit_all") ||
    hasProjectPermission(userType, "project.edit_own");

  return (
    <TouchableOpacity
      style={[styles.projectCard, { backgroundColor: colors.chipBackground }]}
      onPress={onPress}
      onLongPress={canEdit ? onMenuPress : undefined}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.projectHeader}>
        <View style={styles.projectTitleContainer}>
          <Text style={[styles.projectTitle, { color: colors.text }]}>
            {project.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor() + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusLabel()}
            </Text>
          </View>
        </View>
        {canEdit && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenuPress}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {project.description ? (
        <Text
          style={[styles.projectDescription, { color: colors.textMuted }]}
          numberOfLines={2}
        >
          {project.description}
        </Text>
      ) : null}

      {project.location ? (
        <View style={styles.projectLocation}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.textMuted}
          />
          <Text
            style={[styles.projectLocationText, { color: colors.textMuted }]}
          >
            {project.location}
          </Text>
        </View>
      ) : null}

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="cube-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {typeLabel}
          </Text>
        </View>
        {project.client?.name ? (
          <View style={styles.metaItem}>
            <Ionicons
              name="person-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {project.client.name}
            </Text>
          </View>
        ) : null}
        {canViewBudget && (budgetData?.totalBudget || project.budget) ? (
          <View style={styles.metaItem}>
            <Ionicons
              name="wallet-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {formatCurrency(budgetData?.totalBudget ?? project.budget ?? 0)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
            Tiến độ
          </Text>
          <Text style={[styles.progressValue, { color: colors.accent }]}>
            {project.progress ?? 0}%
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.accent,
                width: `${project.progress ?? 0}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Milestones */}
      {showMilestones && project.status === "active" && (
        <MilestoneTracker project={project} canApprove={canApprove} />
      )}

      {/* Footer */}
      <View style={styles.projectFooter}>
        <View style={styles.projectInfo}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.projectInfoText, { color: colors.textMuted }]}>
            {project.start_date
              ? `${formatDate(project.start_date)} → ${formatDate(project.end_date ?? undefined)}`
              : formatDate(project.end_date ?? undefined)}
          </Text>
        </View>
        <View style={styles.projectStats}>
          {project.client?.phone ? (
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={[
                  styles.contactButton,
                  { backgroundColor: colors.border },
                ]}
                onPress={() => Linking.openURL(`tel:${project.client?.phone}`)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="call-outline" size={16} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.contactButton,
                  { backgroundColor: colors.border },
                ]}
                onPress={() => router.push("/messages" as const)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={16}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          ) : null}
          {canViewBudget && budgetStat ? (
            <View style={styles.projectStat}>
              <Ionicons
                name="wallet-outline"
                size={14}
                color={budgetStat.color}
              />
              <Text
                style={[styles.projectStatText, { color: budgetStat.color }]}
              >
                {budgetStat.percentage.toFixed(0)}%
              </Text>
            </View>
          ) : null}
          {taskStat ? (
            <View style={styles.projectStat}>
              <Ionicons
                name="checkmark-circle-outline"
                size={14}
                color={colors.textMuted}
              />
              <Text
                style={[styles.projectStatText, { color: colors.textMuted }]}
              >
                {taskStat.completed}/{taskStat.total}
              </Text>
            </View>
          ) : null}
          <View style={styles.projectStat}>
            <Ionicons
              name="people-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text style={[styles.projectStatText, { color: colors.textMuted }]}>
              {project.team?.length || 0}
            </Text>
          </View>
          <View style={styles.projectStat}>
            <Ionicons
              name="document-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text style={[styles.projectStatText, { color: colors.textMuted }]}>
              {Array.isArray(project.documents)
                ? project.documents.length
                : project.documents || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Role-specific quick action bar */}
      {project.status === "active" && (
        <View style={styles.quickActionBar}>
          {hasProjectPermission(userType, "project.update_progress") && (
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: "#0D948815" }]}
              onPress={() =>
                router.push(`/construction-progress/${project.id}` as any)
              }
            >
              <Ionicons name="trending-up-outline" size={14} color="#0D9488" />
              <Text style={[styles.quickActionText, { color: "#0D9488" }]}>
                Cập nhật
              </Text>
            </TouchableOpacity>
          )}
          {hasProjectPermission(userType, "project.manage_tasks") && (
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: "#3B82F615" }]}
              onPress={() => router.push(`/projects/${project.id}` as any)}
            >
              <Ionicons name="list-outline" size={14} color="#3B82F6" />
              <Text style={[styles.quickActionText, { color: "#3B82F6" }]}>
                Công việc
              </Text>
            </TouchableOpacity>
          )}
          {hasProjectPermission(userType, "project.manage_documents") && (
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: "#F59E0B15" }]}
              onPress={() => router.push(`/projects/${project.id}` as any)}
            >
              <Ionicons
                name="document-attach-outline"
                size={14}
                color="#F59E0B"
              />
              <Text style={[styles.quickActionText, { color: "#F59E0B" }]}>
                Tài liệu
              </Text>
            </TouchableOpacity>
          )}
          {hasProjectPermission(userType, "project.update_task_status") &&
            !hasProjectPermission(userType, "project.manage_tasks") && (
              <TouchableOpacity
                style={[
                  styles.quickActionBtn,
                  { backgroundColor: "#10B98115" },
                ]}
                onPress={() => router.push(`/projects/${project.id}` as any)}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={14}
                  color="#10B981"
                />
                <Text style={[styles.quickActionText, { color: "#10B981" }]}>
                  Hoàn thành
                </Text>
              </TouchableOpacity>
            )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════

export default function ProjectsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? "light"];
  const { user } = useAuth();
  const userType = (user?.userType ?? "buyer") as UserType;
  const dashConfig = useMemo(
    () => getRoleDashboardConfig(userType),
    [userType],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "mine" | "assigned" | ProjectStatus
  >(dashConfig.defaultFilter);
  const [activeType, setActiveType] = useState<"all" | ProjectType>("all");
  const [sortKey, setSortKey] = useState<"newest" | "budget" | "progress">(
    "newest",
  );
  const [showAdvFilter, setShowAdvFilter] = useState(false);
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "gantt">("list");

  useSmartBackHandler();

  const { budgets, tasks: allTasks } = useProjectData();
  const { projects, loading, error, refresh, fetchMore, hasMore } = useProjects(
    {
      status: ["all", "mine", "assigned"].includes(activeFilter)
        ? undefined
        : (activeFilter as ProjectStatus),
      mine: activeFilter === "mine",
      type: activeType === "all" ? undefined : activeType,
      search: debouncedSearch || undefined,
      limit: 20,
    },
  );

  // Filter labels
  const filterLabels: Record<string, string> = {
    all: "Tất cả",
    mine: "Của tôi",
    assigned: "Được giao",
    active: "Đang thực hiện",
    completed: "Hoàn thành",
    planning: "Lên kế hoạch",
    paused: "Tạm dừng",
  };

  const projectCounts = useMemo(
    () => ({
      all: projects.length,
      mine: projects.length,
      assigned: projects.length,
      active: projects.filter((p) => p.status === "active").length,
      completed: projects.filter((p) => p.status === "completed").length,
      planning: projects.filter((p) => p.status === "planning").length,
      paused: projects.filter((p) => p.status === "paused").length,
    }),
    [projects],
  );

  const displayedProjects = useMemo(() => {
    let arr = [...projects];
    const min = budgetMin ? parseFloat(budgetMin) : undefined;
    const max = budgetMax ? parseFloat(budgetMax) : undefined;
    if (min != null || max != null) {
      arr = arr.filter((p) => {
        const b = p.budget ?? 0;
        if (min != null && b < min) return false;
        if (max != null && b > max) return false;
        return true;
      });
    }
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : undefined;
    const toTs = dateTo ? new Date(dateTo).getTime() : undefined;
    if (fromTs != null || toTs != null) {
      arr = arr.filter((p) => {
        const dStr = p.created_at || p.start_date || p.end_date;
        if (!dStr) return false;
        const ts = new Date(dStr).getTime();
        if (Number.isNaN(ts)) return false;
        if (fromTs != null && ts < fromTs) return false;
        if (toTs != null && ts > toTs) return false;
        return true;
      });
    }
    switch (sortKey) {
      case "budget":
        return arr.sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0));
      case "progress":
        return arr.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
      default:
        return arr.sort((a, b) => {
          const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
          const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
          return tb - ta;
        });
    }
  }, [projects, sortKey, budgetMin, budgetMax, dateFrom, dateTo]);

  const typeCounts = useMemo(() => {
    const c: Record<ProjectType, number> = {
      residential: 0,
      commercial: 0,
      landscape: 0,
      interior: 0,
      renovation: 0,
    };
    projects.forEach((p) => {
      if (p?.type && c[p.type as ProjectType] != null)
        c[p.type as ProjectType] += 1;
    });
    return c;
  }, [projects]);

  // Persist filters
  const PREF_STATUS = "projects_filter_status";
  const PREF_TYPE = "projects_filter_type";
  const PREF_SORT = "projects_sort_key";
  const PREF_SEARCH = "projects_search_query";
  const PREF_BUDGET_MIN = "projects_budget_min";
  const PREF_BUDGET_MAX = "projects_budget_max";
  const PREF_DATE_FROM = "projects_date_from";
  const PREF_DATE_TO = "projects_date_to";

  useEffect(() => {
    (async () => {
      const [s, t, k, q, bmin, bmax, df, dt] = await Promise.all([
        getItem(PREF_STATUS),
        getItem(PREF_TYPE),
        getItem(PREF_SORT),
        getItem(PREF_SEARCH),
        getItem(PREF_BUDGET_MIN),
        getItem(PREF_BUDGET_MAX),
        getItem(PREF_DATE_FROM),
        getItem(PREF_DATE_TO),
      ]);
      if (
        s &&
        [
          "all",
          "mine",
          "assigned",
          "active",
          "completed",
          "planning",
          "paused",
        ].includes(s)
      )
        setActiveFilter(s as any);
      if (
        t &&
        [
          "all",
          "residential",
          "commercial",
          "landscape",
          "interior",
          "renovation",
        ].includes(t)
      )
        setActiveType(t as any);
      if (k && ["newest", "budget", "progress"].includes(k))
        setSortKey(k as any);
      if (typeof q === "string") setSearchQuery(q);
      if (typeof bmin === "string") setBudgetMin(bmin);
      if (typeof bmax === "string") setBudgetMax(bmax);
      if (typeof df === "string") setDateFrom(df);
      if (typeof dt === "string") setDateTo(dt);
    })();
  }, []);

  useEffect(() => {
    setItem(PREF_STATUS, String(activeFilter));
  }, [activeFilter]);
  useEffect(() => {
    setItem(PREF_TYPE, String(activeType));
  }, [activeType]);
  useEffect(() => {
    setItem(PREF_SORT, String(sortKey));
  }, [sortKey]);
  useEffect(() => {
    setItem(PREF_SEARCH, String(searchQuery));
  }, [searchQuery]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);
  useEffect(() => {
    setItem(PREF_BUDGET_MIN, String(budgetMin));
  }, [budgetMin]);
  useEffect(() => {
    setItem(PREF_BUDGET_MAX, String(budgetMax));
  }, [budgetMax]);
  useEffect(() => {
    setItem(PREF_DATE_FROM, String(dateFrom));
  }, [dateFrom]);
  useEffect(() => {
    setItem(PREF_DATE_TO, String(dateTo));
  }, [dateTo]);

  const overviewStats = useMemo(() => {
    let totalBudget = 0,
      totalSpent = 0,
      totalTasks = 0,
      completedTasks = 0;
    projects.forEach((project) => {
      const budget = budgets[project.id];
      if (budget) {
        totalBudget += budget.totalBudget;
        totalSpent += budget.totalSpent;
      }
      const tasks = allTasks[project.id];
      if (tasks) {
        totalTasks += tasks.length;
        completedTasks += tasks.filter(
          (t: any) => t.status === "completed",
        ).length;
      }
    });
    return {
      budgetPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      taskPercentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      totalBudget,
      totalSpent,
      totalTasks,
      completedTasks,
    };
  }, [projects, budgets, allTasks]);

  const handleProjectPress = useCallback((project: Project) => {
    router.push(`/projects/${project.id}` as any);
  }, []);

  const handleMenuPress = useCallback((project: Project) => {
    setSelectedProject(project);
    setShowQuickActions(true);
  }, []);

  const handleQuickAction = useCallback(
    (action: "edit" | "share" | "archive" | "delete") => {
      if (!selectedProject) return;
      if (
        action === "delete" &&
        !hasProjectPermission(userType, "project.delete")
      ) {
        Alert.alert("Không có quyền", "Bạn không có quyền xóa dự án.");
        return;
      }
      switch (action) {
        case "edit":
          router.push(`/projects/edit/${selectedProject.id}` as any);
          break;
        case "share":
          Alert.alert("Chia sẻ", `Chia sẻ dự án: ${selectedProject.name}`);
          break;
        case "archive":
          Alert.alert(
            "Đã lưu trữ",
            `Dự án "${selectedProject.name}" đã được lưu trữ`,
          );
          break;
        case "delete":
          Alert.alert("Đã xóa", `Dự án "${selectedProject.name}" đã được xóa`);
          refresh();
          break;
      }
    },
    [selectedProject, userType, refresh],
  );

  const handleCreateProject = useCallback(() => {
    if (!hasProjectPermission(userType, "project.create")) {
      Alert.alert(
        "Không có quyền",
        "Vai trò của bạn không được phép tạo dự án mới.",
      );
      return;
    }
    router.push("/projects/create" as const);
  }, [userType]);

  const renderProjectCard = useCallback(
    ({ item }: { item: Project }) => (
      <ProjectCard
        project={item}
        onPress={() => handleProjectPress(item)}
        onMenuPress={() => handleMenuPress(item)}
        budgetData={budgets[item.id]}
        projectTasks={allTasks[item.id]}
        userType={userType}
        showMilestones={dashConfig.showMilestones}
      />
    ),
    [
      budgets,
      allTasks,
      userType,
      dashConfig.showMilestones,
      handleProjectPress,
      handleMenuPress,
    ],
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={64} color={colors.textMuted} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        {searchQuery ? "Không tìm thấy dự án" : "Chưa có dự án"}
      </Text>
      <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
        {searchQuery
          ? "Thử tìm kiếm với từ khóa khác"
          : dashConfig.showCreateButton
            ? "Tạo dự án mới để bắt đầu"
            : "Chưa có dự án nào được giao cho bạn"}
      </Text>
      {!searchQuery && dashConfig.showCreateButton && (
        <TouchableOpacity
          style={[styles.emptyStateButton, { backgroundColor: colors.accent }]}
          onPress={handleCreateProject}
        >
          <Text style={styles.emptyStateButtonText}>Tạo dự án mới</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  };

  /** Gantt-like timeline view */
  const renderGanttView = () => {
    if (displayedProjects.length === 0) return renderEmptyState();
    return (
      <ScrollView style={styles.ganttContainer} horizontal={false}>
        <View style={styles.ganttHeader}>
          <Text style={[styles.ganttHeaderText, { color: colors.text }]}>
            Biểu đồ Gantt - Timeline dự án
          </Text>
        </View>
        {displayedProjects.map((p) => {
          const startDate = p.start_date ? new Date(p.start_date) : new Date();
          const endDate = p.end_date ? new Date(p.end_date) : new Date();
          const totalDays = Math.max(
            1,
            Math.ceil(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
            ),
          );
          const elapsed = Math.max(
            0,
            Math.ceil(
              (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24),
            ),
          );
          const timeProgress = Math.min(100, (elapsed / totalDays) * 100);
          const statusColor =
            p.status === "active"
              ? "#007AFF"
              : p.status === "completed"
                ? "#34C759"
                : p.status === "planning"
                  ? "#FF9500"
                  : "#FF3B30";

          return (
            <TouchableOpacity
              key={String(p.id)}
              style={styles.ganttRow}
              onPress={() => handleProjectPress(p)}
            >
              <View style={styles.ganttLabel}>
                <Text
                  style={[styles.ganttProjectName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {p.name}
                </Text>
                <Text style={[styles.ganttDates, { color: colors.textMuted }]}>
                  {p.start_date
                    ? new Date(p.start_date).toLocaleDateString("vi-VN", {
                        month: "short",
                        day: "numeric",
                      })
                    : "?"}{" "}
                  —{" "}
                  {p.end_date
                    ? new Date(p.end_date).toLocaleDateString("vi-VN", {
                        month: "short",
                        day: "numeric",
                      })
                    : "?"}
                </Text>
              </View>
              <View style={styles.ganttBarContainer}>
                <View
                  style={[
                    styles.ganttBarBg,
                    { backgroundColor: colors.border },
                  ]}
                />
                <View
                  style={[
                    styles.ganttBarTime,
                    {
                      width: `${timeProgress}%`,
                      backgroundColor: `${statusColor}30`,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.ganttBarProgress,
                    {
                      width: `${p.progress ?? 0}%`,
                      backgroundColor: statusColor,
                    },
                  ]}
                />
                <Text style={styles.ganttBarLabel}>{p.progress ?? 0}%</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  // ── Render ────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with role info */}
      <View style={[styles.header, { backgroundColor: colors.accent }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View>
              <View style={styles.headerTitleRow}>
                <Ionicons
                  name={dashConfig.icon}
                  size={22}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.headerTitle}>{dashConfig.title}</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                {dashConfig.subtitle} • {displayedProjects.length}/
                {projects.length}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <RoleBadge userType={userType} />
            {dashConfig.showCreateButton && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowTopMenu(true)}
              >
                <Ionicons name="add" size={28} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: "#f5f5f5",
              borderWidth: 1,
              borderColor: Colors.light.border,
              borderRadius: 20,
              paddingVertical: 10,
              paddingHorizontal: 14,
            },
          ]}
        >
          <Ionicons name="search-outline" size={18} color="#999" />
          <TextInput
            style={[
              styles.searchInput,
              { color: "#333", fontSize: 13, marginLeft: 10 },
            ]}
            placeholder="Tìm kiếm dự án..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status filters (role-based) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {dashConfig.filterOptions.map((f) => (
            <FilterChip
              key={f}
              label={filterLabels[f] ?? f}
              active={activeFilter === f}
              onPress={() => setActiveFilter(f)}
              count={projectCounts[f as keyof typeof projectCounts]}
            />
          ))}
        </ScrollView>

        {/* Type filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filterScrollContent, { marginTop: 8 }]}
        >
          <FilterChip
            label="Tất cả loại"
            active={activeType === "all"}
            onPress={() => setActiveType("all")}
          />
          <FilterChip
            label="Nhà ở"
            active={activeType === "residential"}
            onPress={() => setActiveType("residential")}
            count={typeCounts.residential}
          />
          <FilterChip
            label="Thương mại"
            active={activeType === "commercial"}
            onPress={() => setActiveType("commercial")}
            count={typeCounts.commercial}
          />
          <FilterChip
            label="Cảnh quan"
            active={activeType === "landscape"}
            onPress={() => setActiveType("landscape")}
            count={typeCounts.landscape}
          />
          <FilterChip
            label="Nội thất"
            active={activeType === "interior"}
            onPress={() => setActiveType("interior")}
            count={typeCounts.interior}
          />
          <FilterChip
            label="Cải tạo"
            active={activeType === "renovation"}
            onPress={() => setActiveType("renovation")}
            count={typeCounts.renovation}
          />
        </ScrollView>

        {/* Sort + View mode */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ color: "#fff", fontSize: 12, opacity: 0.9 }}>
              Sắp xếp:
            </Text>
            {(["newest", "budget", "progress"] as const).map((key) => {
              const icons: Record<string, any> = {
                newest: "time-outline",
                budget: "wallet-outline",
                progress: "trending-up-outline",
              };
              const labels: Record<string, string> = {
                newest: "Mới nhất",
                budget: "Ngân sách",
                progress: "Tiến độ",
              };
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSortKey(key)}
                  style={[
                    styles.sortPill,
                    {
                      backgroundColor:
                        sortKey === key
                          ? "rgba(255,255,255,0.9)"
                          : "rgba(255,255,255,0.3)",
                    },
                  ]}
                >
                  <Ionicons
                    name={icons[key]}
                    size={14}
                    color={sortKey === key ? "#000" : "#fff"}
                  />
                  <Text
                    style={[
                      styles.sortPillText,
                      { color: sortKey === key ? "#000" : "#fff" },
                    ]}
                  >
                    {labels[key]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {dashConfig.showGantt && (
              <TouchableOpacity
                onPress={() =>
                  setViewMode(viewMode === "list" ? "gantt" : "list")
                }
                style={[
                  styles.sortPill,
                  {
                    backgroundColor:
                      viewMode === "gantt"
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.3)",
                  },
                ]}
              >
                <Ionicons
                  name={
                    viewMode === "gantt" ? "list-outline" : "bar-chart-outline"
                  }
                  size={14}
                  color={viewMode === "gantt" ? "#000" : "#fff"}
                />
                <Text
                  style={[
                    styles.sortPillText,
                    { color: viewMode === "gantt" ? "#000" : "#fff" },
                  ]}
                >
                  {viewMode === "gantt" ? "Danh sách" : "Gantt"}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setShowAdvFilter(true)}
              style={[
                styles.sortPill,
                { backgroundColor: "rgba(255,255,255,0.3)" },
              ]}
            >
              <Ionicons name="options-outline" size={14} color="#fff" />
              <Text style={[styles.sortPillText, { color: "#fff" }]}>
                Bộ lọc
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setActiveFilter(dashConfig.defaultFilter);
                setActiveType("all");
                setSortKey("newest");
                setSearchQuery("");
                setBudgetMin("");
                setBudgetMax("");
                setDateFrom("");
                setDateTo("");
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 12,
                  textDecorationLine: "underline",
                  opacity: 0.9,
                }}
              >
                Xóa lọc
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Active filters summary */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row", gap: 8 }}
        >
          {activeFilter !== dashConfig.defaultFilter && (
            <TouchableOpacity
              style={styles.activeFilterChip}
              onPress={() => setActiveFilter(dashConfig.defaultFilter)}
            >
              <Ionicons name="filter" size={12} color="#fff" />
              <Text style={styles.activeFilterText}>
                {filterLabels[activeFilter]}
              </Text>
              <Ionicons name="close" size={12} color="#fff" />
            </TouchableOpacity>
          )}
          {activeType !== "all" && (
            <TouchableOpacity
              style={styles.activeFilterChip}
              onPress={() => setActiveType("all")}
            >
              <Ionicons name="cube-outline" size={12} color="#fff" />
              <Text style={styles.activeFilterText}>
                {activeType === "residential"
                  ? "Nhà ở"
                  : activeType === "commercial"
                    ? "Thương mại"
                    : activeType === "landscape"
                      ? "Cảnh quan"
                      : activeType === "interior"
                        ? "Nội thất"
                        : "Cải tạo"}
              </Text>
              <Ionicons name="close" size={12} color="#fff" />
            </TouchableOpacity>
          )}
          {(budgetMin || budgetMax) && (
            <TouchableOpacity
              style={styles.activeFilterChip}
              onPress={() => {
                setBudgetMin("");
                setBudgetMax("");
              }}
            >
              <Ionicons name="wallet-outline" size={12} color="#fff" />
              <Text style={styles.activeFilterText}>
                ₫{budgetMin || "0"} - ₫{budgetMax || "∞"}
              </Text>
              <Ionicons name="close" size={12} color="#fff" />
            </TouchableOpacity>
          )}
          {(dateFrom || dateTo) && (
            <TouchableOpacity
              style={styles.activeFilterChip}
              onPress={() => {
                setDateFrom("");
                setDateTo("");
              }}
            >
              <Ionicons name="calendar-outline" size={12} color="#fff" />
              <Text style={styles.activeFilterText}>
                {dateFrom || "..."} → {dateTo || "..."}
              </Text>
              <Ionicons name="close" size={12} color="#fff" />
            </TouchableOpacity>
          )}
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.activeFilterChip}
              onPress={() => setSearchQuery("")}
            >
              <Ionicons name="search-outline" size={12} color="#fff" />
              <Text style={styles.activeFilterText}>{searchQuery}</Text>
              <Ionicons name="close" size={12} color="#fff" />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Quick Stats Overview (role-based) */}
      {dashConfig.showStats && projects.length > 0 && (
        <View
          style={[
            styles.statsOverview,
            {
              backgroundColor: colors.chipBackground,
              borderBottomColor: colors.border,
            },
          ]}
        >
          {dashConfig.showBudgetOverview && (
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#0D948820" },
                ]}
              >
                <Ionicons name="wallet-outline" size={20} color="#0D9488" />
              </View>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Ngân sách
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {overviewStats.budgetPercentage.toFixed(0)}%
              </Text>
              <Text style={[styles.statSubtext, { color: colors.textMuted }]}>
                ₫{(overviewStats.totalSpent / 1_000_000_000).toFixed(1)}B / ₫
                {(overviewStats.totalBudget / 1_000_000_000).toFixed(1)}B
              </Text>
            </View>
          )}
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: "#10b98120" },
              ]}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={20}
                color="#10b981"
              />
            </View>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Công việc
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {overviewStats.taskPercentage.toFixed(0)}%
            </Text>
            <Text style={[styles.statSubtext, { color: colors.textMuted }]}>
              {overviewStats.completedTasks}/{overviewStats.totalTasks} hoàn
              thành
            </Text>
          </View>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: "#f59e0b20" },
              ]}
            >
              <Ionicons name="trending-up-outline" size={20} color="#f59e0b" />
            </View>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Tiến độ TB
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {projects.length > 0
                ? (
                    projects.reduce((sum, p) => sum + (p.progress ?? 0), 0) /
                    projects.length
                  ).toFixed(0)
                : 0}
              %
            </Text>
            <Text style={[styles.statSubtext, { color: colors.textMuted }]}>
              Trung bình {projectCounts.active} dự án
            </Text>
          </View>
        </View>
      )}

      {/* Error banner */}
      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color="#FF3B30" />
          <Text style={styles.errorText}>{error.message}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Content: List or Gantt */}
      {viewMode === "gantt" && dashConfig.showGantt ? (
        renderGanttView()
      ) : (
        <FlatList
          data={displayedProjects}
          renderItem={renderProjectCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading && !hasMore}
              onRefresh={refresh}
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={!loading ? renderEmptyState : null}
          ListFooterComponent={renderFooter}
          onEndReached={() => {
            if (hasMore && !loading) fetchMore();
          }}
          onEndReachedThreshold={0.5}
        />
      )}

      {loading && projects.length === 0 ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Đang tải dự án...
          </Text>
        </View>
      ) : null}

      <ProjectQuickActions
        visible={showQuickActions}
        projectName={selectedProject?.name || ""}
        onClose={() => setShowQuickActions(false)}
        onAction={handleQuickAction}
      />
      <TopPlusMenu
        visible={showTopMenu}
        onClose={() => setShowTopMenu(false)}
      />

      {/* Advanced Filter Modal */}
      <Modal
        visible={showAdvFilter}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAdvFilter(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Bộ lọc nâng cao</Text>
            <View style={{ gap: 12 }}>
              <Text style={styles.modalSectionTitle}>Ngân sách (VND)</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Tối thiểu</Text>
                  <TextInput
                    value={budgetMin}
                    onChangeText={setBudgetMin}
                    keyboardType="numeric"
                    placeholder="vd 50000000"
                    style={styles.modalInput}
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Tối đa</Text>
                  <TextInput
                    value={budgetMax}
                    onChangeText={setBudgetMax}
                    keyboardType="numeric"
                    placeholder="vd 500000000"
                    style={styles.modalInput}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              <Text style={[styles.modalSectionTitle, { marginTop: 8 }]}>
                Thời gian
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Từ ngày</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <TextInput
                      value={dateFrom}
                      onChangeText={setDateFrom}
                      placeholder="YYYY-MM-DD"
                      style={[styles.modalInput, { flex: 1 }]}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      onPress={() => setShowFromPicker(true)}
                      style={[styles.sortPill, { backgroundColor: "#eee" }]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#111"
                      />
                      <Text style={[styles.sortPillText, { color: "#111" }]}>
                        Chọn
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Đến ngày</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <TextInput
                      value={dateTo}
                      onChangeText={setDateTo}
                      placeholder="YYYY-MM-DD"
                      style={[styles.modalInput, { flex: 1 }]}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      onPress={() => setShowToPicker(true)}
                      style={[styles.sortPill, { backgroundColor: "#eee" }]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#111"
                      />
                      <Text style={[styles.sortPillText, { color: "#111" }]}>
                        Chọn
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#e5e5e5" }]}
                onPress={() => {
                  setBudgetMin("");
                  setBudgetMax("");
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                <Text style={[styles.modalButtonText, { color: "#111" }]}>
                  Xóa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: Colors.light.accent, flex: 1 },
                ]}
                onPress={() => setShowAdvFilter(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  Áp dụng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showFromPicker && (
        <DateTimePicker
          value={dateFrom ? new Date(dateFrom) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, d) => {
            setShowFromPicker(Platform.OS === "ios");
            if (d) {
              setDateFrom(
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
              );
            }
          }}
        />
      )}
      {showToPicker && (
        <DateTimePicker
          value={dateTo ? new Date(dateTo) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, d) => {
            setShowToPicker(Platform.OS === "ios");
            if (d) {
              setDateTo(
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
              );
            }
          }}
        />
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 42, paddingBottom: 16, paddingHorizontal: 16 },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitleRow: { flexDirection: "row", alignItems: "center" },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  createButton: { padding: 6 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: { fontSize: 11, fontWeight: "600" },
  searchBar: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  searchInput: { flex: 1 },
  filterScrollContent: { flexDirection: "row", gap: 8, paddingRight: 4 },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterChipText: { fontSize: 12, fontWeight: "600" },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  countBadgeText: { fontSize: 11, fontWeight: "700" },
  sortPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  sortPillText: { fontSize: 12, fontWeight: "600" },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#9CA3AF",
  },
  activeFilterText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  statsOverview: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  statCard: { flex: 1, alignItems: "center", gap: 4 },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  statLabel: { fontSize: 11, textAlign: "center" },
  statValue: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  statSubtext: { fontSize: 10, textAlign: "center" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  errorText: { flex: 1, fontSize: 14, color: "#FF3B30" },
  retryText: { fontSize: 14, color: "#007AFF", fontWeight: "600" },
  listContent: { padding: 16, paddingBottom: 32 },
  projectCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  projectTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    flex: 1,
  },
  projectTitle: { fontSize: 18, fontWeight: "700", flex: 1 },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "600" },
  projectDescription: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  projectLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  projectLocationText: { fontSize: 13 },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12 },
  progressContainer: { marginBottom: 12 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: { fontSize: 12 },
  progressValue: { fontSize: 12, fontWeight: "700" },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  milestoneContainer: {
    backgroundColor: "rgba(13,148,136,0.04)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  milestoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  milestoneTitleText: { fontSize: 13, fontWeight: "600" },
  milestoneProgress: { fontSize: 13, fontWeight: "700" },
  milestoneTrack: { height: 60, position: "relative", marginBottom: 4 },
  milestoneTrackBg: {
    position: "absolute",
    top: 12,
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
  },
  milestoneTrackFill: {
    position: "absolute",
    top: 12,
    left: 0,
    height: 4,
    borderRadius: 2,
  },
  milestoneNode: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -16 }],
  },
  milestoneCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  milestoneLabel: { fontSize: 9, marginTop: 4, width: 48, textAlign: "center" },
  approveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  approveButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  quickActionBar: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  quickActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
  },
  quickActionText: { fontSize: 11, fontWeight: "600" },
  projectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  projectInfoText: { fontSize: 12 },
  projectStats: { flexDirection: "row", gap: 12, alignItems: "center" },
  contactActions: { flexDirection: "row", gap: 8, marginRight: 4 },
  contactButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  projectStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  projectStatText: { fontSize: 12 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: { fontSize: 14, textAlign: "center", marginBottom: 24 },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  emptyStateButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  footerLoader: { paddingVertical: 20, alignItems: "center" },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 12, fontSize: 14 },
  ganttContainer: { flex: 1, padding: 16 },
  ganttHeader: { marginBottom: 12 },
  ganttHeaderText: { fontSize: 16, fontWeight: "700" },
  ganttRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  ganttLabel: { width: 120 },
  ganttProjectName: { fontSize: 13, fontWeight: "600" },
  ganttDates: { fontSize: 10, marginTop: 2 },
  ganttBarContainer: {
    flex: 1,
    height: 24,
    position: "relative",
    justifyContent: "center",
  },
  ganttBarBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
  },
  ganttBarTime: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 4,
  },
  ganttBarProgress: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 4,
  },
  ganttBarLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111",
  },
  modalSectionTitle: { fontSize: 14, fontWeight: "700", color: "#111" },
  modalLabel: { fontSize: 12, color: "#666", marginBottom: 6, marginTop: 6 },
  modalInput: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: { fontSize: 16, fontWeight: "700" },
});
