/**
 * CRM Leads Pipeline Screen
 * ==========================
 *
 * Quản lý lead pipeline từ Perfex CRM
 * Hiển thị funnel stages: New → Contacted → Qualified → Won/Lost
 *
 * @author ThietKeResort Team
 * @since 2025-01-03
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-theme";
import { useLeads } from "@/hooks/usePerfexAPI";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Lead status colors
const STATUS_COLORS = {
  new: "#666666", // Purple
  contacted: "#0D9488", // Blue
  qualified: "#0D9488", // Amber
  won: "#0D9488", // Green
  lost: "#000000", // Red
};

const STATUS_LABELS = {
  new: "Mới",
  contacted: "Đã liên hệ",
  qualified: "Tiềm năng",
  won: "Thành công",
  lost: "Mất",
};

// Lead source icons
const SOURCE_ICONS: Record<string, string> = {
  website: "globe-outline",
  facebook: "logo-facebook",
  referral: "people-outline",
  call: "call-outline",
  email: "mail-outline",
  other: "ellipsis-horizontal-outline",
};

export default function CRMLeadsScreen() {
  const {
    leads,
    stats,
    loading,
    error,
    refresh,
    createLead,
    updateLead,
    deleteLead,
  } = useLeads();

  const [viewMode, setViewMode] = useState<"pipeline" | "list">("pipeline");
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // Form state
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleCreateLead = async () => {
    if (!newLeadName.trim()) return;
    try {
      await createLead({
        name: newLeadName,
        email: newLeadEmail,
        phonenumber: newLeadPhone,
        source: "app",
      });
      setNewLeadName("");
      setNewLeadEmail("");
      setNewLeadPhone("");
      setShowCreateModal(false);
    } catch (err) {
      console.error("Create lead error:", err);
    }
  };

  const handleConvertLead = async (leadId: string) => {
    try {
      // Convert lead to customer by updating its status to won
      await updateLead(leadId, { status: "won" });
      setSelectedLead(null);
    } catch (err) {
      console.error("Convert lead error:", err);
    }
  };

  // Loading state
  if (loading && leads.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Leads</Text>
        </View>
        <View style={[styles.emptyState, { flex: 1 }]}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>
            Đang tải dữ liệu...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Leads</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.headerAction}>
            <Ionicons name="refresh" size={22} color={MODERN_COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.emptyState, { flex: 1 }]}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={MODERN_COLORS.error}
          />
          <Text
            style={[
              styles.emptyText,
              { marginTop: 16, color: MODERN_COLORS.error },
            ]}
          >
            Lỗi tải dữ liệu
          </Text>
          <TouchableOpacity onPress={handleRefresh} style={{ marginTop: 12 }}>
            <Text style={{ color: MODERN_COLORS.primary, fontWeight: "600" }}>
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Filter leads
  const filteredLeads = filterStatus
    ? leads.filter((l) => l.status === filterStatus)
    : leads;

  // Group by status for pipeline view
  const newLeads = leads.filter((l) => l.status === "new");
  const contactedLeads = leads.filter((l) => l.status === "contacted");
  const qualifiedLeads = leads.filter((l) => l.status === "qualified");
  const wonLeads = leads.filter((l) => l.status === "won");

  const renderStatCard = (
    label: string,
    value: number,
    color: string,
    icon: string,
  ) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={() =>
        setFilterStatus(
          filterStatus === label.toLowerCase() ? null : label.toLowerCase(),
        )
      }
    >
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderLeadCard = (lead: any, compact = false) => {
    const statusColor =
      STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS] || "#6B7280";
    const sourceIcon =
      SOURCE_ICONS[lead.source?.toLowerCase()] || SOURCE_ICONS.other;

    return (
      <TouchableOpacity
        key={lead.id}
        style={[styles.leadCard, compact && styles.leadCardCompact]}
        onPress={() => setSelectedLead(lead)}
        activeOpacity={0.8}
      >
        {/* Avatar */}
        <View
          style={[styles.leadAvatar, { backgroundColor: statusColor + "20" }]}
        >
          <Text style={[styles.leadAvatarText, { color: statusColor }]}>
            {lead.name?.[0]?.toUpperCase() || "?"}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.leadContent}>
          <Text style={styles.leadName} numberOfLines={1}>
            {lead.name || "Chưa có tên"}
          </Text>

          {lead.company && (
            <Text style={styles.leadCompany} numberOfLines={1}>
              {lead.company}
            </Text>
          )}

          <View style={styles.leadMeta}>
            {lead.email && (
              <View style={styles.leadMetaItem}>
                <Ionicons name="mail-outline" size={12} color="#666" />
                <Text style={styles.leadMetaText} numberOfLines={1}>
                  {lead.email}
                </Text>
              </View>
            )}
            {lead.phone && (
              <View style={styles.leadMetaItem}>
                <Ionicons name="call-outline" size={12} color="#666" />
                <Text style={styles.leadMetaText}>{lead.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Status & Source */}
        <View style={styles.leadRight}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {STATUS_LABELS[lead.status as keyof typeof STATUS_LABELS] ||
                lead.status}
            </Text>
          </View>
          {lead.source && (
            <View style={styles.sourceIcon}>
              <Ionicons name={sourceIcon as any} size={14} color="#9CA3AF" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderPipelineColumn = (
    title: string,
    columnLeads: any[],
    color: string,
  ) => (
    <View style={styles.pipelineColumn}>
      <View style={[styles.pipelineHeader, { borderBottomColor: color }]}>
        <View style={[styles.pipelineDot, { backgroundColor: color }]} />
        <Text style={styles.pipelineTitle}>{title}</Text>
        <View style={[styles.pipelineBadge, { backgroundColor: color + "20" }]}>
          <Text style={[styles.pipelineBadgeText, { color }]}>
            {columnLeads.length}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.pipelineScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pipelineContent}
      >
        {columnLeads.length === 0 ? (
          <View style={styles.emptyColumn}>
            <Ionicons name="person-outline" size={28} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có leads</Text>
          </View>
        ) : (
          columnLeads.map((lead) => renderLeadCard(lead, true))
        )}
      </ScrollView>
    </View>
  );

  const renderFunnelChart = () => {
    const total = stats.total;
    if (total === 0) return null;

    const stages = [
      { label: "Tổng", value: stats.total, color: STATUS_COLORS.new },
      {
        label: "Đã chuyển đổi",
        value: stats.converted,
        color: STATUS_COLORS.won,
      },
      {
        label: "Chưa chuyển đổi",
        value: stats.notConverted,
        color: STATUS_COLORS.contacted,
      },
    ];

    const maxValue = Math.max(...stages.map((s) => s.value), 1);

    return (
      <View style={styles.funnelContainer}>
        <Text style={styles.funnelTitle}>Sales Funnel</Text>
        {stages.map((stage, index) => (
          <View key={stage.label} style={styles.funnelStage}>
            <View style={styles.funnelLabelContainer}>
              <Text style={styles.funnelLabel}>{stage.label}</Text>
              <Text style={styles.funnelValue}>{stage.value}</Text>
            </View>
            <View style={styles.funnelBarContainer}>
              <View
                style={[
                  styles.funnelBar,
                  {
                    width: `${(stage.value / maxValue) * 100}%`,
                    backgroundColor: stage.color,
                  },
                ]}
              />
            </View>
          </View>
        ))}

        <View style={styles.funnelStats}>
          <View style={styles.funnelStatItem}>
            <Text style={styles.funnelStatLabel}>Tỷ lệ chuyển đổi</Text>
            <Text
              style={[styles.funnelStatValue, { color: MODERN_COLORS.success }]}
            >
              {total > 0 ? ((stats.converted / total) * 100).toFixed(1) : 0}%
            </Text>
          </View>
          <View style={styles.funnelStatItem}>
            <Text style={styles.funnelStatLabel}>Chưa chuyển đổi</Text>
            <Text
              style={[styles.funnelStatValue, { color: MODERN_COLORS.danger }]}
            >
              {stats.notConverted}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && leads.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải leads...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Lead Pipeline</Text>
          <View
            style={[styles.dataSourceBadge, { backgroundColor: "#0D948820" }]}
          >
            <View
              style={[styles.dataSourceDot, { backgroundColor: "#0D9488" }]}
            />
            <Text style={[styles.dataSourceText, { color: "#0D9488" }]}>
              Live CRM
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="person-add" size={24} color={MODERN_COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        {renderStatCard(
          "Tổng",
          stats.total,
          STATUS_COLORS.new,
          "people-outline",
        )}
        {renderStatCard(
          "Đã chuyển đổi",
          stats.converted,
          STATUS_COLORS.won,
          "checkmark-circle-outline",
        )}
        {renderStatCard(
          "Chưa chuyển đổi",
          stats.notConverted,
          STATUS_COLORS.contacted,
          "time-outline",
        )}
      </ScrollView>

      {/* Funnel Chart */}
      {renderFunnelChart()}

      {/* View Mode Tabs */}
      <View style={styles.viewTabs}>
        <TouchableOpacity
          style={[
            styles.viewTab,
            viewMode === "pipeline" && styles.viewTabActive,
          ]}
          onPress={() => setViewMode("pipeline")}
        >
          <Ionicons
            name="git-network-outline"
            size={18}
            color={viewMode === "pipeline" ? MODERN_COLORS.primary : "#666"}
          />
          <Text
            style={[
              styles.viewTabText,
              viewMode === "pipeline" && styles.viewTabTextActive,
            ]}
          >
            Pipeline
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewTab, viewMode === "list" && styles.viewTabActive]}
          onPress={() => setViewMode("list")}
        >
          <Ionicons
            name="list-outline"
            size={18}
            color={viewMode === "list" ? MODERN_COLORS.primary : "#666"}
          />
          <Text
            style={[
              styles.viewTabText,
              viewMode === "list" && styles.viewTabTextActive,
            ]}
          >
            Danh sách
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === "pipeline" ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pipelineContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {renderPipelineColumn("Mới", newLeads, STATUS_COLORS.new)}
          {renderPipelineColumn(
            "Đã liên hệ",
            contactedLeads,
            STATUS_COLORS.contacted,
          )}
          {renderPipelineColumn(
            "Tiềm năng",
            qualifiedLeads,
            STATUS_COLORS.qualified,
          )}
          {renderPipelineColumn("Thành công", wonLeads, STATUS_COLORS.won)}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredLeads}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderLeadCard(item)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Ionicons name="people-outline" size={64} color="#CCC" />
              <Text style={styles.emptyListText}>Chưa có leads nào</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Ionicons name="add" size={20} color="#FFF" />
                <Text style={styles.createButtonText}>Thêm Lead Mới</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Create Lead Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm Lead Mới</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Họ và tên *"
              value={newLeadName}
              onChangeText={setNewLeadName}
              autoFocus
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              value={newLeadEmail}
              onChangeText={setNewLeadEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Số điện thoại"
              value={newLeadPhone}
              onChangeText={setNewLeadPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  !newLeadName.trim() && styles.modalButtonDisabled,
                ]}
                onPress={handleCreateLead}
                disabled={!newLeadName.trim()}
              >
                <Text style={styles.modalConfirmText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Lead Detail Modal */}
      <Modal
        visible={!!selectedLead}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedLead(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết Lead</Text>
              <TouchableOpacity onPress={() => setSelectedLead(null)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedLead && (
              <ScrollView style={styles.detailContent}>
                {/* Lead Avatar & Name */}
                <View style={styles.detailHeader}>
                  <View
                    style={[
                      styles.detailAvatar,
                      {
                        backgroundColor:
                          (STATUS_COLORS[
                            selectedLead.status as keyof typeof STATUS_COLORS
                          ] || "#6B7280") + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.detailAvatarText,
                        {
                          color:
                            STATUS_COLORS[
                              selectedLead.status as keyof typeof STATUS_COLORS
                            ] || "#6B7280",
                        },
                      ]}
                    >
                      {selectedLead.name?.[0]?.toUpperCase() || "?"}
                    </Text>
                  </View>
                  <View style={styles.detailHeaderInfo}>
                    <Text style={styles.detailName}>
                      {selectedLead.name || "Chưa có tên"}
                    </Text>
                    {selectedLead.company && (
                      <Text style={styles.detailCompany}>
                        {selectedLead.company}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Contact Info */}
                {selectedLead.email && (
                  <TouchableOpacity style={styles.detailRow}>
                    <Ionicons name="mail-outline" size={20} color="#666" />
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{selectedLead.email}</Text>
                  </TouchableOpacity>
                )}

                {selectedLead.phone && (
                  <TouchableOpacity style={styles.detailRow}>
                    <Ionicons name="call-outline" size={20} color="#666" />
                    <Text style={styles.detailLabel}>Điện thoại:</Text>
                    <Text style={styles.detailValue}>{selectedLead.phone}</Text>
                  </TouchableOpacity>
                )}

                {/* Status */}
                <View style={styles.detailRow}>
                  <Ionicons name="flag-outline" size={20} color="#666" />
                  <Text style={styles.detailLabel}>Trạng thái:</Text>
                  <View
                    style={[
                      styles.statusBadgeLarge,
                      {
                        backgroundColor:
                          (STATUS_COLORS[
                            selectedLead.status as keyof typeof STATUS_COLORS
                          ] || "#6B7280") + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTextLarge,
                        {
                          color:
                            STATUS_COLORS[
                              selectedLead.status as keyof typeof STATUS_COLORS
                            ] || "#6B7280",
                        },
                      ]}
                    >
                      {STATUS_LABELS[
                        selectedLead.status as keyof typeof STATUS_LABELS
                      ] || selectedLead.status}
                    </Text>
                  </View>
                </View>

                {/* Source */}
                {selectedLead.source && (
                  <View style={styles.detailRow}>
                    <Ionicons name="compass-outline" size={20} color="#666" />
                    <Text style={styles.detailLabel}>Nguồn:</Text>
                    <Text style={styles.detailValue}>
                      {selectedLead.source}
                    </Text>
                  </View>
                )}

                {/* Value */}
                {selectedLead.value && (
                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={20} color="#666" />
                    <Text style={styles.detailLabel}>Giá trị:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: MODERN_COLORS.success, fontWeight: "600" },
                      ]}
                    >
                      {selectedLead.value.toLocaleString("vi-VN")}đ
                    </Text>
                  </View>
                )}

                {/* Created Date */}
                {selectedLead.createdAt && (
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                    <Text style={styles.detailLabel}>Ngày tạo:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedLead.createdAt).toLocaleDateString(
                        "vi-VN",
                      )}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.detailActions}>
                  {selectedLead.status === "qualified" && (
                    <TouchableOpacity
                      style={styles.convertButton}
                      onPress={() => handleConvertLead(selectedLead.id)}
                    >
                      <Ionicons name="person-add" size={20} color="#FFF" />
                      <Text style={styles.convertButtonText}>
                        Chuyển thành Khách hàng
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickActionButton}>
                      <Ionicons
                        name="call"
                        size={22}
                        color={MODERN_COLORS.success}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton}>
                      <Ionicons
                        name="mail"
                        size={22}
                        color={MODERN_COLORS.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton}>
                      <Ionicons
                        name="chatbubble"
                        size={22}
                        color={MODERN_COLORS.warning}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: MODERN_SPACING.md,
    fontSize: 14,
    color: "#666",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: MODERN_SPACING.xs,
  },
  headerCenter: {
    flex: 1,
    marginLeft: MODERN_SPACING.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  dataSourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  dataSourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  dataSourceText: {
    fontSize: 11,
    fontWeight: "500",
  },
  addButton: {
    padding: MODERN_SPACING.xs,
  },

  // Stats
  statsContainer: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    gap: MODERN_SPACING.xs,
  },
  statCard: {
    backgroundColor: "#FFF",
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    width: 95,
    borderLeftWidth: 3,
    ...MODERN_SHADOWS.sm,
    marginRight: MODERN_SPACING.xs,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  statLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },

  // Funnel Chart
  funnelContainer: {
    backgroundColor: "#FFF",
    marginHorizontal: MODERN_SPACING.md,
    marginVertical: MODERN_SPACING.sm,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    ...MODERN_SHADOWS.sm,
  },
  funnelTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: MODERN_SPACING.sm,
  },
  funnelStage: {
    marginBottom: MODERN_SPACING.xs,
  },
  funnelLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  funnelLabel: {
    fontSize: 12,
    color: "#666",
  },
  funnelValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111",
  },
  funnelBarContainer: {
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
  },
  funnelBar: {
    height: "100%",
    borderRadius: 4,
  },
  funnelStats: {
    flexDirection: "row",
    marginTop: MODERN_SPACING.sm,
    paddingTop: MODERN_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  funnelStatItem: {
    flex: 1,
    alignItems: "center",
  },
  funnelStatLabel: {
    fontSize: 11,
    color: "#666",
  },
  funnelStatValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },

  // View Tabs
  viewTabs: {
    flexDirection: "row",
    paddingHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    gap: MODERN_SPACING.sm,
  },
  viewTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  viewTabActive: {
    backgroundColor: MODERN_COLORS.primary + "10",
    borderColor: MODERN_COLORS.primary,
  },
  viewTabText: {
    fontSize: 13,
    color: "#666",
  },
  viewTabTextActive: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },

  // Pipeline View
  pipelineContainer: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.lg,
  },
  pipelineColumn: {
    width: width * 0.42,
    backgroundColor: "#F1F5F9",
    borderRadius: MODERN_RADIUS.md,
    marginRight: MODERN_SPACING.sm,
    maxHeight: 400,
  },
  pipelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: MODERN_SPACING.sm,
    borderBottomWidth: 2,
    gap: 6,
  },
  pipelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pipelineTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  pipelineBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pipelineBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  pipelineScroll: {
    flex: 1,
  },
  pipelineContent: {
    padding: MODERN_SPACING.xs,
    gap: MODERN_SPACING.xs,
  },
  emptyColumn: {
    padding: MODERN_SPACING.lg,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  headerAction: {
    padding: MODERN_SPACING.xs,
  },

  // Lead Card
  leadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
    marginBottom: MODERN_SPACING.xs,
  },
  leadCardCompact: {
    padding: MODERN_SPACING.xs,
  },
  leadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: MODERN_SPACING.sm,
  },
  leadAvatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  leadContent: {
    flex: 1,
    marginRight: MODERN_SPACING.sm,
  },
  leadName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  leadCompany: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  leadMeta: {
    marginTop: 4,
    gap: 2,
  },
  leadMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  leadMetaText: {
    fontSize: 11,
    color: "#666",
    flex: 1,
  },
  leadRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  sourceIcon: {
    padding: 4,
  },

  // List View
  listContent: {
    padding: MODERN_SPACING.md,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyListText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.lg,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    gap: 8,
  },
  createButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: MODERN_RADIUS.xl,
    borderTopRightRadius: MODERN_RADIUS.xl,
    padding: MODERN_SPACING.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  modalInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: MODERN_SPACING.sm,
  },
  modalActions: {
    flexDirection: "row",
    gap: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.sm,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },

  // Detail Modal
  detailModalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: MODERN_RADIUS.xl,
    borderTopRightRadius: MODERN_RADIUS.xl,
    padding: MODERN_SPACING.lg,
    maxHeight: "75%",
  },
  detailContent: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: MODERN_SPACING.lg,
  },
  detailAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: MODERN_SPACING.md,
  },
  detailAvatarText: {
    fontSize: 24,
    fontWeight: "700",
  },
  detailHeaderInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  detailCompany: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: MODERN_SPACING.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: "#111",
  },
  statusBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTextLarge: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailActions: {
    marginTop: MODERN_SPACING.lg,
    gap: MODERN_SPACING.md,
  },
  convertButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MODERN_COLORS.success,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    gap: MODERN_SPACING.sm,
  },
  convertButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: MODERN_SPACING.lg,
  },
  quickActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
});
