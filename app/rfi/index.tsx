/**
 * RFIs List Screen
 */

import { useRFIAnalytics, useRFIs } from "@/hooks/useRFI";
import { RFICategory, RFIPriority, RFIStatus } from "@/types/rfi";
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

const CATEGORY_FILTERS: {
  value: RFICategory | "ALL";
  label: string;
  icon: string;
}[] = [
  { value: "ALL", label: "All", icon: "list-outline" },
  {
    value: RFICategory.DESIGN_CLARIFICATION,
    label: "Design",
    icon: "color-palette-outline",
  },
  {
    value: RFICategory.DRAWING_DISCREPANCY,
    label: "Drawing",
    icon: "document-text-outline",
  },
  {
    value: RFICategory.MATERIAL_SUBSTITUTION,
    label: "Material",
    icon: "cube-outline",
  },
  {
    value: RFICategory.CONSTRUCTION_METHOD,
    label: "Method",
    icon: "hammer-outline",
  },
  {
    value: RFICategory.COORDINATION,
    label: "Coordination",
    icon: "people-outline",
  },
  {
    value: RFICategory.FIELD_CONDITION,
    label: "Field",
    icon: "location-outline",
  },
];

const STATUS_FILTERS: { value: RFIStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: RFIStatus.DRAFT, label: "Draft" },
  { value: RFIStatus.SUBMITTED, label: "Submitted" },
  { value: RFIStatus.UNDER_REVIEW, label: "Under Review" },
  { value: RFIStatus.ANSWERED, label: "Answered" },
  { value: RFIStatus.CLOSED, label: "Closed" },
];

const STATUS_COLORS: Record<RFIStatus, string> = {
  DRAFT: "#6B7280",
  SUBMITTED: "#0D9488",
  UNDER_REVIEW: "#0D9488",
  ANSWERED: "#0D9488",
  CLARIFICATION_REQUIRED: "#666666",
  CLOSED: "#0D9488",
  CANCELLED: "#9CA3AF",
  REOPENED: "#0D9488",
};

const PRIORITY_COLORS: Record<RFIPriority, string> = {
  LOW: "#0D9488",
  MEDIUM: "#0D9488",
  HIGH: "#0D9488",
  URGENT: "#0D9488",
  CRITICAL: "#000000",
};

export default function RFIsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<RFICategory | "ALL">(
    "ALL",
  );
  const [selectedStatus, setSelectedStatus] = useState<RFIStatus | "ALL">(
    "ALL",
  );

  const { rfis, loading, error, refresh, submitRFI, respondToRFI, closeRFI } =
    useRFIs({
      category: selectedCategory !== "ALL" ? selectedCategory : undefined,
      status: selectedStatus !== "ALL" ? selectedStatus : undefined,
    });

  const { analytics } = useRFIAnalytics();

  const filteredRFIs = rfis.filter(
    (rfi) =>
      rfi.rfiNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfi.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfi.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSubmit = async (id: string) => {
    try {
      await submitRFI(id);
    } catch (err) {
      console.error("Failed to submit:", err);
    }
  };

  const handleClose = async (id: string) => {
    try {
      await closeRFI(id);
    } catch (err) {
      console.error("Failed to close:", err);
    }
  };

  if (loading && !rfis.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  const submittedCount = rfis.filter((r) => r.status === "SUBMITTED").length;
  const underReviewCount = rfis.filter(
    (r) => r.status === "UNDER_REVIEW",
  ).length;
  const answeredCount = rfis.filter((r) => r.status === "ANSWERED").length;
  const overdueCount = rfis.filter((r) => r.isOverdue).length;

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
      >
        <View style={[styles.statCard, { backgroundColor: "#F0FDFA" }]}>
          <Text style={styles.statValue}>{rfis.length}</Text>
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
            {answeredCount}
          </Text>
          <Text style={styles.statLabel}>Answered</Text>
        </View>

        {overdueCount > 0 && (
          <View style={[styles.statCard, { backgroundColor: "#FEE2E2" }]}>
            <Text style={[styles.statValue, { color: "#000000" }]}>
              {overdueCount}
            </Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        )}
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
          placeholder="Search by RFI number, subject..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {CATEGORY_FILTERS.map((category) => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.filterChip,
              selectedCategory === category.value && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(category.value)}
          >
            <Ionicons
              name={category.icon as any}
              size={16}
              color={
                selectedCategory === category.value ? "#FFFFFF" : "#6B7280"
              }
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === category.value &&
                  styles.filterChipTextActive,
              ]}
            >
              {category.label}
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

      {/* RFIs List */}
      <ScrollView style={styles.listContainer}>
        {filteredRFIs.map((rfi) => {
          const statusColor = STATUS_COLORS[rfi.status];
          const priorityColor = PRIORITY_COLORS[rfi.priority];
          const daysToRespond = rfi.responseDueDate
            ? Math.ceil(
                (new Date(rfi.responseDueDate).getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : null;

          return (
            <View key={rfi.id} style={styles.card}>
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
                      rfi.category === "DESIGN_CLARIFICATION"
                        ? "color-palette"
                        : rfi.category === "DRAWING_DISCREPANCY"
                          ? "document-text"
                          : rfi.category === "MATERIAL_SUBSTITUTION"
                            ? "cube"
                            : rfi.category === "CONSTRUCTION_METHOD"
                              ? "hammer"
                              : rfi.category === "COORDINATION"
                                ? "people"
                                : "help-circle"
                    }
                    size={28}
                    color={statusColor}
                  />
                </View>

                <View style={styles.cardHeaderText}>
                  <View style={styles.headerRow}>
                    <Text style={styles.rfiNumber}>
                      {rfi.rfiNumber}
                      {rfi.revisionNumber !== "0" &&
                        ` Rev ${rfi.revisionNumber}`}
                    </Text>
                    <View style={styles.badges}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusColor },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {rfi.status.replace(/_/g, " ")}
                        </Text>
                      </View>
                      {rfi.priority !== "MEDIUM" && (
                        <View
                          style={[
                            styles.priorityBadge,
                            { backgroundColor: priorityColor },
                          ]}
                        >
                          <Text style={styles.priorityBadgeText}>
                            {rfi.priority}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Text style={styles.subject} numberOfLines={1}>
                    {rfi.subject}
                  </Text>

                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                      {rfi.category.replace(/_/g, " ")}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Info Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    From: {rfi.createdBy.name} ({rfi.createdBy.company})
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name="person-circle-outline"
                    size={14}
                    color="#6B7280"
                  />
                  <Text style={styles.infoText}>
                    To: {rfi.assignedTo.name} ({rfi.assignedTo.company})
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    Created: {new Date(rfi.createdDate).toLocaleDateString()}
                  </Text>
                </View>

                {rfi.responseDueDate && (
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>
                      Response due:{" "}
                      {new Date(rfi.responseDueDate).toLocaleDateString()}
                      {daysToRespond !== null && (
                        <Text
                          style={{
                            color:
                              daysToRespond < 0
                                ? "#000000"
                                : daysToRespond < 3
                                  ? "#0D9488"
                                  : "#6B7280",
                          }}
                        >
                          {" "}
                          (
                          {daysToRespond < 0
                            ? `${Math.abs(daysToRespond)} days late`
                            : `${daysToRespond} days left`}
                          )
                        </Text>
                      )}
                    </Text>
                  </View>
                )}

                {rfi.location.specificLocation && (
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text style={styles.infoText}>
                      {rfi.location.specificLocation}
                    </Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Ionicons name="attach-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    {rfi.totalAttachments} attachment(s)
                  </Text>
                </View>
              </View>

              {/* Impact Section */}
              {rfi.impact.level !== "NO_IMPACT" && (
                <View style={styles.impactSection}>
                  <View
                    style={[
                      styles.impactBadge,
                      {
                        backgroundColor:
                          rfi.impact.level === "CRITICAL"
                            ? "#FEE2E2"
                            : rfi.impact.level === "SIGNIFICANT"
                              ? "#FED7AA"
                              : rfi.impact.level === "MODERATE"
                                ? "#FEF3C7"
                                : "#F0FDFA",
                      },
                    ]}
                  >
                    <Ionicons
                      name="warning"
                      size={14}
                      color={
                        rfi.impact.level === "CRITICAL"
                          ? "#000000"
                          : rfi.impact.level === "SIGNIFICANT"
                            ? "#EA580C"
                            : rfi.impact.level === "MODERATE"
                              ? "#D97706"
                              : "#0D9488"
                      }
                    />
                    <Text
                      style={[
                        styles.impactBadgeText,
                        {
                          color:
                            rfi.impact.level === "CRITICAL"
                              ? "#000000"
                              : rfi.impact.level === "SIGNIFICANT"
                                ? "#EA580C"
                                : rfi.impact.level === "MODERATE"
                                  ? "#D97706"
                                  : "#0D9488",
                        },
                      ]}
                    >
                      {rfi.impact.level} Impact
                    </Text>
                  </View>

                  <View style={styles.impactDetails}>
                    {rfi.impact.schedule.affectsSchedule && (
                      <View style={styles.impactItem}>
                        <Ionicons name="calendar" size={12} color="#0D9488" />
                        <Text style={styles.impactItemText}>
                          Schedule: {rfi.impact.schedule.delayDays} days
                          {rfi.impact.schedule.criticalPath
                            ? " (Critical)"
                            : ""}
                        </Text>
                      </View>
                    )}
                    {rfi.impact.cost.affectsCost && (
                      <View style={styles.impactItem}>
                        <Ionicons name="cash" size={12} color="#0D9488" />
                        <Text style={styles.impactItemText}>
                          Cost: {rfi.impact.cost.currency}{" "}
                          {rfi.impact.cost.estimatedAmount?.toLocaleString()}
                        </Text>
                      </View>
                    )}
                    {rfi.impact.safety.affectsSafety && (
                      <View style={styles.impactItem}>
                        <Ionicons
                          name="shield-checkmark"
                          size={12}
                          color="#000000"
                        />
                        <Text style={styles.impactItemText}>Safety Impact</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Response Preview */}
              {rfi.response && (
                <View style={styles.responsePreview}>
                  <View style={styles.responseHeader}>
                    <Ionicons
                      name="chatbox-ellipses"
                      size={16}
                      color="#0D9488"
                    />
                    <Text style={styles.responseHeaderText}>
                      Response Received
                    </Text>
                  </View>
                  <Text style={styles.responseText} numberOfLines={2}>
                    {rfi.response.answer}
                  </Text>
                  <Text style={styles.responseBy}>
                    by {rfi.responseBy?.name} on{" "}
                    {new Date(rfi.respondedDate!).toLocaleDateString()}
                  </Text>
                </View>
              )}

              {/* Overdue Warning */}
              {rfi.isOverdue && (
                <View style={styles.overdueWarning}>
                  <Ionicons name="warning" size={16} color="#000000" />
                  <Text style={styles.overdueWarningText}>
                    {rfi.daysOverdue} day(s) overdue - Immediate action required
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={18} color="#0D9488" />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>

                {rfi.status === "DRAFT" && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => handleSubmit(rfi.id)}
                  >
                    <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                    <Text
                      style={[styles.actionButtonText, { color: "#FFFFFF" }]}
                    >
                      Submit
                    </Text>
                  </TouchableOpacity>
                )}

                {(rfi.status === "SUBMITTED" ||
                  rfi.status === "UNDER_REVIEW") && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonSuccess]}
                  >
                    <Ionicons
                      name="chatbox-ellipses-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text
                      style={[styles.actionButtonText, { color: "#FFFFFF" }]}
                    >
                      Respond
                    </Text>
                  </TouchableOpacity>
                )}

                {rfi.status === "ANSWERED" && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonSuccess]}
                    onPress={() => handleClose(rfi.id)}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text
                      style={[styles.actionButtonText, { color: "#FFFFFF" }]}
                    >
                      Close
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

        {filteredRFIs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="help-circle-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No RFIs found</Text>
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
  rfiNumber: {
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subject: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#EDE9FE",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  categoryBadgeText: {
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
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
  },
  impactBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  impactBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  impactDetails: {
    gap: 4,
  },
  impactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  impactItemText: {
    fontSize: 11,
    color: "#4B5563",
    marginLeft: 6,
  },
  responsePreview: {
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#0D9488",
  },
  responseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  responseHeaderText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0D9488",
    marginLeft: 6,
  },
  responseText: {
    fontSize: 12,
    color: "#065F46",
    marginBottom: 4,
  },
  responseBy: {
    fontSize: 10,
    color: "#0D9488",
    fontStyle: "italic",
  },
  overdueWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  overdueWarningText: {
    fontSize: 11,
    color: "#000000",
    fontWeight: "600",
    marginLeft: 6,
    flex: 1,
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
