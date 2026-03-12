/**
 * Perfex CRM Dashboard
 * Route: /crm
 * Migrated to DS tokens + layout
 */

import { ScreenHeader } from "@/components/ds/layouts";
import {
    CustomerList,
    DashboardCards,
    ProjectList,
    SyncStatusBanner,
} from "@/components/PerfexCrmComponents";
import { PerfexSyncProvider, usePerfexSync } from "@/context/PerfexSyncContext";
import { useDS } from "@/hooks/useDS";
import {
    Customer,
    formatDate,
    formatVND,
    getProjectStatusName,
    Project,
} from "@/services/perfexSync";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

// ── Quick Action Data ──────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    route: "/crm/tasks",
    icon: "checkbox-outline" as const,
    label: "Tasks",
    color: "#0D9488",
  },
  {
    route: "/crm/leads",
    icon: "funnel-outline" as const,
    label: "Leads",
    color: "#666666",
  },
  {
    route: "/crm/invoices",
    icon: "receipt-outline" as const,
    label: "Hóa đơn",
    color: "#0D9488",
  },
  {
    route: "/crm/customers",
    icon: "people-outline" as const,
    label: "Khách hàng",
    color: "#0D9488",
  },
];

const ADVANCED_ACTIONS = [
  {
    route: "/crm/time-tracking",
    icon: "time-outline" as const,
    label: "Chấm công",
    color: "#22c55e",
  },
  {
    route: "/crm/milestones",
    icon: "flag-outline" as const,
    label: "Mốc dự án",
    color: "#f59e0b",
  },
  {
    route: "/crm/expenses",
    icon: "wallet-outline" as const,
    label: "Chi phí",
    color: "#ef4444",
  },
  {
    route: "/crm/project-management",
    icon: "briefcase-outline" as const,
    label: "Dự án +",
    color: "#8b5cf6",
  },
];

const PERFEX_FEATURES = [
  {
    route: "/crm/gantt-chart",
    icon: "bar-chart-outline" as const,
    label: "Gantt Chart",
    color: "#0D9488",
  },
  {
    route: "/crm/discussions",
    icon: "chatbubbles-outline" as const,
    label: "Trao đổi",
    color: "#22c55e",
  },
  {
    route: "/crm/files",
    icon: "folder-outline" as const,
    label: "Tập tin",
    color: "#8b5cf6",
  },
  {
    route: "/crm/notes",
    icon: "document-text-outline" as const,
    label: "Ghi chú",
    color: "#f59e0b",
  },
  {
    route: "/crm/contracts",
    icon: "document-attach-outline" as const,
    label: "Hợp đồng",
    color: "#06b6d4",
  },
  {
    route: "/crm/sales",
    icon: "trending-up-outline" as const,
    label: "Doanh số",
    color: "#10b981",
  },
  {
    route: "/crm/activity",
    icon: "pulse-outline" as const,
    label: "Hoạt động",
    color: "#ec4899",
  },
  {
    route: "/crm/tickets",
    icon: "ticket-outline" as const,
    label: "Yêu cầu",
    color: "#f43333",
  },
  {
    route: "/crm/mind-map",
    icon: "git-network-outline" as const,
    label: "Sơ đồ TĐ",
    color: "#a855f7",
  },
  {
    route: "/crm/reports",
    icon: "analytics-outline" as const,
    label: "Báo cáo",
    color: "#14B8A6",
  },
  {
    route: "/crm/settings",
    icon: "settings-outline" as const,
    label: "Cài đặt",
    color: "#6b7280",
  },
];

// ── QuickActionCard ────────────────────────────────────────────────────
function QuickActionCard({
  item,
}: {
  item: {
    route: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
  };
}) {
  const { colors, radius, shadow } = useDS();
  return (
    <Pressable
      style={[
        st.qaCard,
        shadow.xs,
        { backgroundColor: colors.bgSurface, borderRadius: radius.lg },
      ]}
      onPress={() => router.push(item.route as any)}
    >
      <View
        style={[
          st.qaIcon,
          { backgroundColor: item.color + "20", borderRadius: radius.full },
        ]}
      >
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={[st.qaLabel, { color: colors.text }]}>{item.label}</Text>
    </Pressable>
  );
}

// ── ActionGrid ─────────────────────────────────────────────────────────
function ActionGrid({
  title,
  items,
}: {
  title: string;
  items: ReadonlyArray<{
    route: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
  }>;
}) {
  const { colors, spacing } = useDS();
  return (
    <View style={[st.section, { marginHorizontal: spacing.md }]}>
      <Text style={[st.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={[st.grid, { gap: spacing.sm, marginTop: spacing.sm }]}>
        {items.map((item) => (
          <QuickActionCard key={item.route} item={item} />
        ))}
      </View>
    </View>
  );
}

// ── Tab Button ─────────────────────────────────────────────────────────
function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useDS();
  return (
    <Pressable
      style={[
        st.tab,
        active && { borderBottomWidth: 2, borderBottomColor: colors.primary },
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color={active ? colors.primary : colors.textTertiary}
      />
      <Text
        style={[
          st.tabLabel,
          {
            color: active ? colors.primary : colors.textTertiary,
            fontWeight: active ? "600" : "400",
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ── Modals ─────────────────────────────────────────────────────────────
function ProjectDetailModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const { colors, radius } = useDS();
  if (!project) return null;
  return (
    <Modal
      visible={!!project}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[st.modal, { backgroundColor: colors.bgSurface }]}>
        <View style={[st.modalHead, { borderBottomColor: colors.divider }]}>
          <Text style={[st.modalTitle, { color: colors.text }]}>
            Chi tiết dự án
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.textTertiary} />
          </Pressable>
        </View>
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text style={[st.detailName, { color: colors.text }]}>
            {project.name}
          </Text>
          <DetailRow
            label="Trạng thái"
            value={getProjectStatusName(project.status)}
            colors={colors}
          />
          <DetailRow
            label="Khách hàng"
            value={project.company}
            colors={colors}
          />
          <DetailRow
            label="Giá trị"
            value={formatVND(parseFloat(project.project_cost || "0"))}
            colors={colors}
            large
            accent
          />
          <DetailRow
            label="Ngày bắt đầu"
            value={formatDate(project.start_date)}
            colors={colors}
          />
          <DetailRow
            label="Hạn hoàn thành"
            value={
              project.deadline ? formatDate(project.deadline) : "Chưa xác định"
            }
            colors={colors}
          />
          <View style={st.detailRow}>
            <Text style={[st.dLabel, { color: colors.textTertiary }]}>
              Tiến độ
            </Text>
            <View style={st.progressWrap}>
              <View
                style={[
                  st.progressBar,
                  { backgroundColor: colors.bgMuted, borderRadius: radius.xs },
                ]}
              >
                <View
                  style={[
                    st.progressFill,
                    {
                      width:
                        `${project.progress}%` as unknown as import("react-native").DimensionValue,
                      backgroundColor: colors.primary,
                      borderRadius: radius.xs,
                    },
                  ]}
                />
              </View>
              <Text style={[st.progressPct, { color: colors.primary }]}>
                {project.progress}%
              </Text>
            </View>
          </View>
          {project.description ? (
            <View style={[st.descSection, { borderTopColor: colors.divider }]}>
              <Text style={[st.dLabel, { color: colors.textTertiary }]}>
                Mô tả
              </Text>
              <Text style={[st.descText, { color: colors.textSecondary }]}>
                {project.description}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

function CustomerDetailModal({
  customer,
  onClose,
}: {
  customer: Customer | null;
  onClose: () => void;
}) {
  const { colors, radius } = useDS();
  const { getProjectsByCustomer } = usePerfexSync();
  if (!customer) return null;
  const projects = getProjectsByCustomer(customer.userid);
  return (
    <Modal
      visible={!!customer}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[st.modal, { backgroundColor: colors.bgSurface }]}>
        <View style={[st.modalHead, { borderBottomColor: colors.divider }]}>
          <Text style={[st.modalTitle, { color: colors.text }]}>
            Chi tiết khách hàng
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.textTertiary} />
          </Pressable>
        </View>
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <View style={st.avatarWrap}>
            <View
              style={[
                st.avatarLg,
                { backgroundColor: colors.primary, borderRadius: radius.full },
              ]}
            >
              <Text style={st.avatarText}>
                {customer.company.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[st.custName, { color: colors.text }]}>
              {customer.company}
            </Text>
          </View>
          <DetailRow
            label="Điện thoại"
            value={customer.phonenumber}
            colors={colors}
          />
          <DetailRow label="Thành phố" value={customer.city} colors={colors} />
          <DetailRow
            label="Địa chỉ"
            value={customer.address?.replace(/<br \/>/g, "\n")}
            colors={colors}
          />
          <DetailRow
            label="Website"
            value={customer.website}
            colors={colors}
            accent
          />
          <DetailRow
            label="Ngày tạo"
            value={formatDate(customer.datecreated)}
            colors={colors}
          />
          {projects.length > 0 && (
            <View style={[st.projSection, { borderTopColor: colors.divider }]}>
              <Text style={[st.sectionTitle, { color: colors.text }]}>
                Dự án ({projects.length})
              </Text>
              {projects.map((p) => (
                <View
                  key={p.id}
                  style={[st.miniProj, { borderBottomColor: colors.divider }]}
                >
                  <Text style={[st.miniProjName, { color: colors.text }]}>
                    {p.name}
                  </Text>
                  <Text style={[st.miniProjVal, { color: colors.primary }]}>
                    {formatVND(parseFloat(p.project_cost || "0"))}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function DetailRow({
  label,
  value,
  colors,
  large,
  accent,
}: {
  label: string;
  value: string;
  colors: any;
  large?: boolean;
  accent?: boolean;
}) {
  return (
    <View style={st.detailRow}>
      <Text style={[st.dLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text
        style={[
          large ? st.dValLg : st.dVal,
          { color: accent ? colors.primary : colors.text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// ── Main Content ───────────────────────────────────────────────────────
function CrmDashboardContent() {
  const { colors, spacing, isDark } = useDS();
  const { isLoading, error } = usePerfexSync();
  const [tab, setTab] = useState<"dashboard" | "projects" | "customers">(
    "dashboard",
  );
  const [selProject, setSelProject] = useState<Project | null>(null);
  const [selCustomer, setSelCustomer] = useState<Customer | null>(null);

  return (
    <View style={[st.screen, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScreenHeader
        title="Perfex CRM"
        rightActions={
          <Pressable
            onPress={() => router.push("/crm/admin" as any)}
            hitSlop={8}
            style={{ padding: 4 }}
          >
            <Ionicons
              name="shield-checkmark"
              size={22}
              color={colors.primary}
            />
          </Pressable>
        }
      />

      {/* Sync Status */}
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <SyncStatusBanner />
      </View>

      {/* Tabs */}
      <View
        style={[
          st.tabBar,
          {
            backgroundColor: colors.bgSurface,
            borderBottomColor: colors.divider,
          },
        ]}
      >
        <TabButton
          label="Tổng quan"
          icon="grid"
          active={tab === "dashboard"}
          onPress={() => setTab("dashboard")}
        />
        <TabButton
          label="Dự án"
          icon="folder"
          active={tab === "projects"}
          onPress={() => setTab("projects")}
        />
        <TabButton
          label="Khách hàng"
          icon="people"
          active={tab === "customers"}
          onPress={() => setTab("customers")}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1, padding: spacing.md }}>
        {tab === "dashboard" && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <DashboardCards />
            <ActionGrid title="Truy cập nhanh" items={QUICK_ACTIONS} />
            <ActionGrid title="Quản lý nâng cao" items={ADVANCED_ACTIONS} />
            <ActionGrid title="Tính năng Perfex CRM" items={PERFEX_FEATURES} />
            <View style={{ marginTop: spacing.lg }}>
              <Text
                style={[
                  st.sectionTitle,
                  { color: colors.text, marginHorizontal: spacing.md },
                ]}
              >
                Dự án gần đây
              </Text>
              <ProjectList onProjectPress={setSelProject} showHeader={false} />
            </View>
          </ScrollView>
        )}
        {tab === "projects" && <ProjectList onProjectPress={setSelProject} />}
        {tab === "customers" && (
          <CustomerList onCustomerPress={setSelCustomer} />
        )}
      </View>

      <ProjectDetailModal
        project={selProject}
        onClose={() => setSelProject(null)}
      />
      <CustomerDetailModal
        customer={selCustomer}
        onClose={() => setSelCustomer(null)}
      />
    </View>
  );
}

// ── Exported Screen ────────────────────────────────────────────────────
export default function PerfexCrmDashboard() {
  return (
    <PerfexSyncProvider>
      <CrmDashboardContent />
    </PerfexSyncProvider>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  screen: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },
  tabLabel: { fontSize: 13 },

  section: { marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  qaCard: { width: "47%", padding: 16, alignItems: "center" },
  qaIcon: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  qaLabel: { fontSize: 13, fontWeight: "600" },

  // Modals
  modal: { flex: 1 },
  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: "600" },
  detailName: { fontSize: 24, fontWeight: "700", marginBottom: 24 },
  detailRow: { marginBottom: 16 },
  dLabel: { fontSize: 13, marginBottom: 4 },
  dVal: { fontSize: 16 },
  dValLg: { fontSize: 20, fontWeight: "600" },
  progressWrap: { flexDirection: "row", alignItems: "center", gap: 12 },
  progressBar: { flex: 1, height: 8, overflow: "hidden" },
  progressFill: { height: "100%" },
  progressPct: { fontSize: 14, fontWeight: "600", width: 40 },
  descSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  descText: { fontSize: 15, lineHeight: 22 },

  // Customer modal
  avatarWrap: { alignItems: "center", marginBottom: 24 },
  avatarLg: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: "600", color: "#FFF" },
  custName: { fontSize: 24, fontWeight: "700" },
  projSection: { marginTop: 24, paddingTop: 24, borderTopWidth: 1 },
  miniProj: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  miniProjName: { flex: 1, fontSize: 15 },
  miniProjVal: { fontSize: 14, fontWeight: "500" },
});
