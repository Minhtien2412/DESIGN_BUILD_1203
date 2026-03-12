/**
 * Change Orders List Screen
 */

import {
    useChangeOrderAnalytics,
    useChangeOrders,
} from "@/hooks/useChangeOrder";
import type {
    ChangeOrderStatus,
    ChangeOrderType,
    CostImpactType,
} from "@/types/change-order";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const TYPE_FILTERS: {
  value: ChangeOrderType | "ALL";
  label: string;
  icon: string;
}[] = [
  { value: "ALL", label: "All", icon: "list-outline" },
  {
    value: "SCOPE_CHANGE" as ChangeOrderType,
    label: "Scope",
    icon: "resize-outline",
  },
  {
    value: "DESIGN_CHANGE" as ChangeOrderType,
    label: "Design",
    icon: "color-palette-outline",
  },
  {
    value: "MATERIAL_SUBSTITUTION" as ChangeOrderType,
    label: "Material",
    icon: "cube-outline",
  },
  {
    value: "FIELD_CONDITION" as ChangeOrderType,
    label: "Field",
    icon: "location-outline",
  },
  {
    value: "OWNER_REQUEST" as ChangeOrderType,
    label: "Owner",
    icon: "person-outline",
  },
  {
    value: "VALUE_ENGINEERING" as ChangeOrderType,
    label: "VE",
    icon: "trending-down-outline",
  },
];

const STATUS_FILTERS: { value: ChangeOrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "DRAFT" as ChangeOrderStatus, label: "Draft" },
  { value: "SUBMITTED" as ChangeOrderStatus, label: "Submitted" },
  { value: "UNDER_REVIEW" as ChangeOrderStatus, label: "Review" },
  { value: "APPROVED" as ChangeOrderStatus, label: "Approved" },
  { value: "IMPLEMENTED" as ChangeOrderStatus, label: "Implemented" },
];

const STATUS_COLORS: Record<ChangeOrderStatus, string> = {
  DRAFT: "#666666",
  SUBMITTED: "#14B8A6",
  UNDER_REVIEW: "#0D9488",
  PENDING_APPROVAL: "#14B8A6",
  APPROVED: "#000000",
  REJECTED: "#999999",
  IMPLEMENTED: "#0D9488",
  CLOSED: "#666666",
  CANCELLED: "#CCCCCC",
};

const COST_IMPACT_COLORS: Record<CostImpactType, string> = {
  INCREASE: "#000000",
  DECREASE: "#0D9488",
  NO_IMPACT: "#666666",
};

export default function ChangeOrdersScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ChangeOrderType | "ALL">(
    "ALL",
  );
  const [selectedStatus, setSelectedStatus] = useState<
    ChangeOrderStatus | "ALL"
  >("ALL");

  const {
    changeOrders,
    loading,
    error,
    refresh,
    submitChangeOrder,
    approveChangeOrder,
    implementChangeOrder,
  } = useChangeOrders({
    type: selectedType !== "ALL" ? selectedType : undefined,
    status: selectedStatus !== "ALL" ? selectedStatus : undefined,
  });

  const { analytics } = useChangeOrderAnalytics();

  const filteredChangeOrders = changeOrders.filter(
    (co) =>
      co.changeOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      co.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      co.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSubmit = async (id: string) => {
    try {
      await submitChangeOrder(id);
    } catch (err) {
      console.error("Failed to submit:", err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveChangeOrder(id, { decision: "APPROVE" });
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  };

  if (loading && !changeOrders.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  const submittedCount = changeOrders.filter(
    (co) => co.status === "SUBMITTED",
  ).length;
  const underReviewCount = changeOrders.filter(
    (co) => co.status === "UNDER_REVIEW",
  ).length;
  const approvedCount = changeOrders.filter(
    (co) => co.status === "APPROVED",
  ).length;
  const totalCostIncrease = changeOrders
    .filter((co) => co.costImpact.type === "INCREASE")
    .reduce((sum, co) => sum + co.costImpact.changeAmount, 0);

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
      >
        <View style={[styles.statCard, { backgroundColor: "#F0FDFA" }]}>
          <Text style={styles.statValue}>{changeOrders.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#F0FDFA" }]}>
          <Text style={[styles.statValue, { color: "#0D9488" }]}>
            {submittedCount}
          </Text>
          <Text style={styles.statLabel}>Submitted</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#FEF3C7" }]}>
          <Text style={[styles.statValue, { color: "#0D9488" }]}>
            {underReviewCount}
          </Text>
          <Text style={styles.statLabel}>Under Review</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#D1FAE5" }]}>
          <Text style={[styles.statValue, { color: "#0D9488" }]}>
            {approvedCount}
          </Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: "#FEE2E2", minWidth: 140 },
          ]}
        >
          <Text style={[styles.statValue, { color: "#000000", fontSize: 18 }]}>
            ${(totalCostIncrease / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.statLabel}>Cost Increase</Text>
        </View>
      </ScrollView>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by CO number, title..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Type Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {TYPE_FILTERS.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.filterChip,
              selectedType === type.value && styles.filterChipActive,
            ]}
            onPress={() => setSelectedType(type.value)}
          >
            <Ionicons
              name={type.icon as any}
              size={16}
              color={selectedType === type.value ? "#FFFFFF" : "#6B7280"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedType === type.value && styles.filterChipTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {STATUS_FILTERS.map((status) => (
          <TouchableOpacity
            key={status.value}
            style={[
              styles.filterChip,
              selectedStatus === status.value && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus(status.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === status.value && styles.filterChipTextActive,
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Change Orders List */}
      <ScrollView style={styles.listContainer}>
        {filteredChangeOrders.map((co) => {
          const statusColor = STATUS_COLORS[co.status];
          const costImpactColor = COST_IMPACT_COLORS[co.costImpact.type];

          return (
            <View key={co.id} style={styles.card}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${statusColor}26` },
                  ]}
                >
                  <Ionicons
                    name={
                      co.type === "SCOPE_CHANGE"
                        ? "resize"
                        : co.type === "DESIGN_CHANGE"
                          ? "color-palette"
                          : co.type === "MATERIAL_SUBSTITUTION"
                            ? "cube"
                            : co.type === "FIELD_CONDITION"
                              ? "location"
                              : co.type === "VALUE_ENGINEERING"
                                ? "trending-down"
                                : "document-text"
                    }
                    size={28}
                    color={statusColor}
                  />
                </View>

                <View style={styles.cardHeaderText}>
                  <View style={styles.headerRow}>
                    <Text style={styles.coNumber}>
                      {co.changeOrderNumber}
                      {co.revisionNumber !== "0" && ` Rev ${co.revisionNumber}`}
                    </Text>
                    <View style={styles.badges}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusColor },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {co.status.replace(/_/g, " ")}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.title} numberOfLines={1}>
                    {co.title}
                  </Text>

                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {co.type.replace(/_/g, " ")}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Info Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    Requested by: {co.requestedBy.name} (
                    {co.requestedBy.company})
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    Requested: {new Date(co.requestedDate).toLocaleDateString()}
                  </Text>
                </View>

                {co.approvedDate && (
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text style={styles.infoText}>
                      Approved: {new Date(co.approvedDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {co.currentApprover && (
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="person-circle-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text style={styles.infoText}>
                      Pending: {co.currentApprover.name} (
                      {co.currentApprover.role})
                    </Text>
                  </View>
                )}
              </View>

              {/* Cost & Schedule Impact */}
              <View style={styles.impactSection}>
                <View style={styles.impactRow}>
                  <View style={styles.impactItem}>
                    <View style={styles.impactHeader}>
                      <Ionicons
                        name="cash-outline"
                        size={16}
                        color={costImpactColor}
                      />
                      <Text style={styles.impactLabel}>Cost Impact</Text>
                    </View>
                    <Text
                      style={[
                        styles.impactValue,
                        {
                          color: costImpactColor,
                        },
                      ]}
                    >
                      {co.costImpact.type === "INCREASE" ? "+" : ""}
                      {co.costImpact.type === "DECREASE" ? "-" : ""}
                      {co.costImpact.currency}{" "}
                      {Math.abs(co.costImpact.changeAmount).toLocaleString()}
                    </Text>
                    <Text style={styles.impactSubtext}>
                      {co.costImpact.type.replace(/_/g, " ")}
                    </Text>
                  </View>

                  <View style={styles.impactDivider} />

                  <View style={styles.impactItem}>
                    <View style={styles.impactHeader}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={
                          co.scheduleImpact.type === "DELAY"
                            ? "#0D9488"
                            : co.scheduleImpact.type === "ACCELERATION"
                              ? "#0D9488"
                              : "#6B7280"
                        }
                      />
                      <Text style={styles.impactLabel}>Schedule Impact</Text>
                    </View>
                    <Text
                      style={[
                        styles.impactValue,
                        {
                          color:
                            co.scheduleImpact.type === "DELAY"
                              ? "#0D9488"
                              : co.scheduleImpact.type === "ACCELERATION"
                                ? "#0D9488"
                                : "#6B7280",
                        },
                      ]}
                    >
                      {co.scheduleImpact.type === "DELAY" ? "+" : ""}
                      {co.scheduleImpact.type === "ACCELERATION" ? "-" : ""}
                      {Math.abs(co.scheduleImpact.changeDuration)} days
                    </Text>
                    <Text style={styles.impactSubtext}>
                      {co.scheduleImpact.type.replace(/_/g, " ")}
                      {co.scheduleImpact.criticalPath ? " (Critical)" : ""}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Approval Progress */}
              {co.approvalWorkflow && co.approvalWorkflow.length > 0 && (
                <View style={styles.approvalSection}>
                  <Text style={styles.approvalTitle}>
                    Approval Progress (
                    {
                      co.approvalWorkflow.filter((a) => a.status === "APPROVED")
                        .length
                    }
                    /{co.approvalWorkflow.length})
                  </Text>
                  <View style={styles.approvalList}>
                    {co.approvalWorkflow.slice(0, 3).map((approval, index) => (
                      <View key={index} style={styles.approvalItem}>
                        <View
                          style={[
                            styles.approvalStatus,
                            {
                              backgroundColor:
                                approval.status === "APPROVED"
                                  ? "#0D9488"
                                  : approval.status === "REJECTED"
                                    ? "#000000"
                                    : approval.status === "IN_PROGRESS"
                                      ? "#0D9488"
                                      : "#6B7280",
                            },
                          ]}
                        />
                        <Text style={styles.approvalName} numberOfLines={1}>
                          {approval.approver.name} (
                          {approval.level.replace(/_/g, " ")})
                        </Text>
                      </View>
                    ))}
                    {co.approvalWorkflow.length > 3 && (
                      <Text style={styles.moreApprovals}>
                        +{co.approvalWorkflow.length - 3} more
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Implementation Progress */}
              {co.implementation && (
                <View style={styles.implementationSection}>
                  <View style={styles.implementationHeader}>
                    <Ionicons
                      name="construct-outline"
                      size={16}
                      color="#666666"
                    />
                    <Text style={styles.implementationTitle}>
                      Implementation
                    </Text>
                    <Text style={styles.implementationStatus}>
                      {co.implementation.status.replace(/_/g, " ")}
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${co.implementation.progress}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {co.implementation.progress}% Complete
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={18} color="#0D9488" />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>

                {co.status === "DRAFT" && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => handleSubmit(co.id)}
                  >
                    <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                    <Text
                      style={[styles.actionButtonText, { color: "#FFFFFF" }]}
                    >
                      Submit
                    </Text>
                  </TouchableOpacity>
                )}

                {(co.status === "SUBMITTED" ||
                  co.status === "UNDER_REVIEW") && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonSuccess]}
                    onPress={() => handleApprove(co.id)}
                  >
                    <Ionicons
                      name="checkmark-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text
                      style={[styles.actionButtonText, { color: "#FFFFFF" }]}
                    >
                      Approve
                    </Text>
                  </TouchableOpacity>
                )}

                {co.status === "APPROVED" && !co.implementation && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonWarning]}
                  >
                    <Ionicons
                      name="construct-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text
                      style={[styles.actionButtonText, { color: "#FFFFFF" }]}
                    >
                      Implement
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="download-outline" size={18} color="#6B7280" />
                  <Text style={styles.actionButtonText}>Export</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filteredChangeOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No change orders found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2937",
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  filterChipText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  coNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1F2937",
  },
  badges: {
    flexDirection: "row",
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#EDE9FE",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666666",
    textTransform: "capitalize",
  },
  infoSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 6,
    flex: 1,
  },
  impactSection: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  impactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  impactItem: {
    flex: 1,
  },
  impactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  impactLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 4,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  impactSubtext: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  impactDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
  },
  approvalSection: {
    marginBottom: 12,
  },
  approvalTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  approvalList: {
    gap: 6,
  },
  approvalItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  approvalStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  approvalName: {
    fontSize: 11,
    color: "#4B5563",
    flex: 1,
  },
  moreApprovals: {
    fontSize: 11,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 4,
  },
  implementationSection: {
    backgroundColor: "#F5F3FF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  implementationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  implementationTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B21A8",
    marginLeft: 6,
    flex: 1,
  },
  implementationStatus: {
    fontSize: 10,
    color: "#666666",
    textTransform: "capitalize",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#DDD6FE",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#666666",
  },
  progressText: {
    fontSize: 10,
    color: "#6B21A8",
    textAlign: "right",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  actionButtonPrimary: {
    backgroundColor: "#0D9488",
  },
  actionButtonSuccess: {
    backgroundColor: "#0D9488",
  },
  actionButtonWarning: {
    backgroundColor: "#0D9488",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 12,
  },
});
