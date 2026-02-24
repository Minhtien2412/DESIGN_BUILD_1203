/**
 * Safety Management List Screen
 */

import { ThemedText } from "@/components/themed-text";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useIncidents, useSafetyStats } from "@/hooks/useSafety";
import type {
    IncidentSeverity,
    IncidentStatus,
    IncidentType,
} from "@/types/safety";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const INCIDENT_TYPE_ICONS: Record<
  IncidentType,
  keyof typeof Ionicons.glyphMap
> = {
  FALL: "trending-down",
  STRUCK_BY: "hand-left-outline",
  CAUGHT_IN_BETWEEN: "contract-outline",
  ELECTRICAL: "flash-outline",
  EQUIPMENT_FAILURE: "construct-outline",
  CHEMICAL_EXPOSURE: "beaker-outline",
  FIRE: "flame-outline",
  EXPLOSION: "nuclear-outline",
  COLLAPSE: "warning-outline",
  SLIP_TRIP: "footsteps-outline",
  CUT_LACERATION: "cut-outline",
  BURN: "flame",
  STRAIN_SPRAIN: "fitness-outline",
  NEAR_MISS: "alert-circle-outline",
  ENVIRONMENTAL: "leaf-outline",
  OTHER: "ellipsis-horizontal-circle-outline",
};

const MOCK_INSPECTIONS = [
  {
    id: "insp-1",
    title: "Kiểm tra giàn giáo khu A",
    inspector: "Nguyễn Văn An",
    date: "2025-01-15",
    status: "PASSED" as const,
    type: "Giàn giáo",
    score: 92,
  },
  {
    id: "insp-2",
    title: "Kiểm tra PCCC tầng 5",
    inspector: "Trần Thị Bình",
    date: "2025-01-14",
    status: "FAILED" as const,
    type: "PCCC",
    score: 65,
  },
  {
    id: "insp-3",
    title: "Kiểm tra PPE công nhân",
    inspector: "Phạm Minh Đức",
    date: "2025-01-13",
    status: "PASSED" as const,
    type: "PPE",
    score: 88,
  },
  {
    id: "insp-4",
    title: "Kiểm tra hệ thống điện tạm",
    inspector: "Hoàng Văn Hải",
    date: "2025-01-12",
    status: "WARNING" as const,
    type: "Điện",
    score: 75,
  },
  {
    id: "insp-5",
    title: "Kiểm tra an toàn cẩu tháp",
    inspector: "Ngô Thanh Tùng",
    date: "2025-01-11",
    status: "PASSED" as const,
    type: "Thiết bị",
    score: 95,
  },
];

const MOCK_HAZARDS = [
  {
    id: "haz-1",
    title: "Dây điện hở khu vực B2",
    location: "Tầng 3 - Khu B",
    riskLevel: "CRITICAL" as const,
    status: "OPEN" as const,
    reportedBy: "Lê Văn Cường",
    date: "2025-01-15",
  },
  {
    id: "haz-2",
    title: "Thiếu lan can bảo vệ cầu thang",
    location: "Tầng 7 - Khu A",
    riskLevel: "HIGH" as const,
    status: "IN_PROGRESS" as const,
    reportedBy: "Trần Minh Tuấn",
    date: "2025-01-14",
  },
  {
    id: "haz-3",
    title: "Vật liệu chắn lối thoát hiểm",
    location: "Tầng 1 - Hầm B",
    riskLevel: "MEDIUM" as const,
    status: "RESOLVED" as const,
    reportedBy: "Nguyễn Thị Mai",
    date: "2025-01-13",
  },
  {
    id: "haz-4",
    title: "Rò rỉ hóa chất khu vực kho",
    location: "Kho vật tư",
    riskLevel: "HIGH" as const,
    status: "OPEN" as const,
    reportedBy: "Đỗ Hồng Phúc",
    date: "2025-01-12",
  },
  {
    id: "haz-5",
    title: "Nền đất yếu khu vực đào móng",
    location: "Khu C - Móng",
    riskLevel: "CRITICAL" as const,
    status: "IN_PROGRESS" as const,
    reportedBy: "Vũ Đức Mạnh",
    date: "2025-01-11",
  },
];

const MOCK_PERMITS = [
  {
    id: "perm-1",
    title: "Giấy phép làm việc trên cao",
    type: "Trên cao",
    status: "ACTIVE" as const,
    issuedDate: "2025-01-10",
    expiryDate: "2025-02-10",
    issuedBy: "Phòng An toàn",
  },
  {
    id: "perm-2",
    title: "Giấy phép hàn cắt nóng",
    type: "Hàn cắt",
    status: "ACTIVE" as const,
    issuedDate: "2025-01-08",
    expiryDate: "2025-01-22",
    issuedBy: "Phòng PCCC",
  },
  {
    id: "perm-3",
    title: "Giấy phép khai quật đất",
    type: "Đào đất",
    status: "EXPIRED" as const,
    issuedDate: "2024-12-01",
    expiryDate: "2025-01-01",
    issuedBy: "Ban QLDA",
  },
  {
    id: "perm-4",
    title: "Giấy phép vận hành cẩu tháp",
    type: "Thiết bị nặng",
    status: "ACTIVE" as const,
    issuedDate: "2025-01-05",
    expiryDate: "2025-07-05",
    issuedBy: "Sở Xây dựng",
  },
  {
    id: "perm-5",
    title: "Giấy phép làm việc ban đêm",
    type: "Ca đêm",
    status: "PENDING" as const,
    issuedDate: "",
    expiryDate: "",
    issuedBy: "UBND Quận",
  },
];

const getInspectionStatusColor = (status: string) => {
  switch (status) {
    case "PASSED":
      return "#10b981";
    case "FAILED":
      return "#ef4444";
    case "WARNING":
      return "#f59e0b";
    default:
      return "#6b7280";
  }
};

const getHazardRiskColor = (level: string) => {
  switch (level) {
    case "CRITICAL":
      return "#7f1d1d";
    case "HIGH":
      return "#ef4444";
    case "MEDIUM":
      return "#f59e0b";
    case "LOW":
      return "#10b981";
    default:
      return "#6b7280";
  }
};

const getHazardStatusColor = (status: string) => {
  switch (status) {
    case "OPEN":
      return "#ef4444";
    case "IN_PROGRESS":
      return "#f59e0b";
    case "RESOLVED":
      return "#10b981";
    default:
      return "#6b7280";
  }
};

const getPermitStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "#10b981";
    case "EXPIRED":
      return "#ef4444";
    case "PENDING":
      return "#f59e0b";
    default:
      return "#6b7280";
  }
};

export default function SafetyScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const textMutedColor = useThemeColor({}, "textMuted");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");

  const [selectedTab, setSelectedTab] = useState<
    "incidents" | "inspections" | "hazards" | "permits"
  >("incidents");
  const [severityFilter, setSeverityFilter] = useState<
    IncidentSeverity | "ALL"
  >("ALL");

  // Mock project ID - replace with actual context
  const projectId = "project-1";

  // Default date range: last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const { stats: summary } = useSafetyStats({ projectId, startDate, endDate });
  const { incidents, loading } = useIncidents({ projectId });

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case "FATAL":
        return "#7f1d1d";
      case "CRITICAL":
        return "#000000";
      case "SERIOUS":
        return "#ea580c";
      case "MODERATE":
        return "#0D9488";
      case "MINOR":
        return "#0D9488";
      default:
        return textMutedColor;
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case "RESOLVED":
        return "#0D9488";
      case "INVESTIGATING":
        return "#0D9488";
      case "UNDER_REVIEW":
        return "#0D9488";
      case "REPORTED":
        return "#6b7280";
      case "CLOSED":
        return "#0D9488";
      default:
        return textMutedColor;
    }
  };

  const filteredIncidents = incidents.filter(
    (incident) =>
      severityFilter === "ALL" || incident.severity === severityFilter,
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Container>
        {/* Header Stats */}
        <Section>
          <ThemedText type="title" style={styles.title}>
            Safety Management
          </ThemedText>

          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: surfaceColor, borderColor },
              ]}
            >
              <ThemedText style={styles.statLabel}>Total Incidents</ThemedText>
              <ThemedText style={styles.statValue}>
                {summary?.incidents?.total || 0}
              </ThemedText>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: surfaceColor, borderColor },
              ]}
            >
              <ThemedText style={styles.statLabel}>Safe Days</ThemedText>
              <ThemedText style={[styles.statValue, { color: "#0D9488" }]}>
                {summary?.safety?.daysSinceLastIncident || 0}
              </ThemedText>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: surfaceColor, borderColor },
              ]}
            >
              <ThemedText style={styles.statLabel}>LTIFR</ThemedText>
              <ThemedText style={styles.statValue}>
                {summary?.safety?.lostTimeRate?.toFixed(2) || "0.00"}
              </ThemedText>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: surfaceColor, borderColor },
              ]}
            >
              <ThemedText style={styles.statLabel}>Near Misses</ThemedText>
              <ThemedText style={[styles.statValue, { color: "#0D9488" }]}>
                {summary?.incidents?.nearMisses || 0}
              </ThemedText>
            </View>
          </View>
        </Section>

        {/* Tab Selector */}
        <Section>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabScrollView}
          >
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  {
                    borderColor,
                    backgroundColor:
                      selectedTab === "incidents" ? tintColor : surfaceColor,
                  },
                ]}
                onPress={() => setSelectedTab("incidents")}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    { color: selectedTab === "incidents" ? "#fff" : textColor },
                  ]}
                >
                  Incidents
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  {
                    borderColor,
                    backgroundColor:
                      selectedTab === "inspections" ? tintColor : surfaceColor,
                  },
                ]}
                onPress={() => setSelectedTab("inspections")}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    {
                      color: selectedTab === "inspections" ? "#fff" : textColor,
                    },
                  ]}
                >
                  Inspections
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  {
                    borderColor,
                    backgroundColor:
                      selectedTab === "hazards" ? tintColor : surfaceColor,
                  },
                ]}
                onPress={() => setSelectedTab("hazards")}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    { color: selectedTab === "hazards" ? "#fff" : textColor },
                  ]}
                >
                  Hazards
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  {
                    borderColor,
                    backgroundColor:
                      selectedTab === "permits" ? tintColor : surfaceColor,
                  },
                ]}
                onPress={() => setSelectedTab("permits")}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    { color: selectedTab === "permits" ? "#fff" : textColor },
                  ]}
                >
                  Permits
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Section>

        {/* Incidents Tab */}
        {selectedTab === "incidents" && (
          <>
            {/* Severity Filters */}
            <Section>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
              >
                {(
                  [
                    "ALL",
                    "FATAL",
                    "CRITICAL",
                    "SERIOUS",
                    "MODERATE",
                    "MINOR",
                  ] as const
                ).map((severity) => (
                  <TouchableOpacity
                    key={severity}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          severityFilter === severity
                            ? tintColor
                            : surfaceColor,
                        borderColor,
                      },
                    ]}
                    onPress={() =>
                      setSeverityFilter(severity as IncidentSeverity | "ALL")
                    }
                  >
                    <ThemedText
                      style={[
                        styles.filterText,
                        {
                          color:
                            severityFilter === severity ? "#fff" : textColor,
                        },
                      ]}
                    >
                      {severity}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Section>

            {/* Incident List */}
            <Section>
              {loading ? (
                <ThemedText style={{ color: textMutedColor }}>
                  Loading incidents...
                </ThemedText>
              ) : filteredIncidents.length === 0 ? (
                <View
                  style={[
                    styles.emptyState,
                    { backgroundColor: surfaceColor, borderColor },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={48}
                    color={textMutedColor}
                  />
                  <ThemedText style={{ color: textMutedColor, marginTop: 12 }}>
                    No incidents found
                  </ThemedText>
                </View>
              ) : (
                filteredIncidents.map((incident: any) => (
                  <TouchableOpacity
                    key={incident.id}
                    style={[
                      styles.card,
                      { backgroundColor: surfaceColor, borderColor },
                    ]}
                    onPress={() => router.push(`/safety/${incident.id}`)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Ionicons
                          name={
                            INCIDENT_TYPE_ICONS[incident.type as IncidentType]
                          }
                          size={20}
                          color={tintColor}
                        />
                        <ThemedText
                          style={[
                            styles.incidentNumber,
                            { color: textMutedColor },
                          ]}
                        >
                          {incident.incidentNumber}
                        </ThemedText>
                      </View>
                      <View style={styles.badges}>
                        <View
                          style={[
                            styles.severityBadge,
                            {
                              backgroundColor: getSeverityColor(
                                incident.severity,
                              ),
                            },
                          ]}
                        >
                          <ThemedText style={styles.badgeText}>
                            {incident.severity}
                          </ThemedText>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: getStatusColor(incident.status),
                            },
                          ]}
                        >
                          <ThemedText style={styles.badgeText}>
                            {incident.status}
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    <ThemedText style={styles.cardTitle}>
                      {incident.title}
                    </ThemedText>

                    {incident.description && (
                      <ThemedText
                        style={[styles.description, { color: textMutedColor }]}
                        numberOfLines={2}
                      >
                        {incident.description}
                      </ThemedText>
                    )}

                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <ThemedText style={{ color: textMutedColor }}>
                          Type
                        </ThemedText>
                        <ThemedText>{incident.type}</ThemedText>
                      </View>
                      <View style={styles.infoItem}>
                        <ThemedText style={{ color: textMutedColor }}>
                          Date
                        </ThemedText>
                        <ThemedText>
                          {new Date(incident.incidentDate).toLocaleDateString()}
                        </ThemedText>
                      </View>
                      <View style={styles.infoItem}>
                        <ThemedText style={{ color: textMutedColor }}>
                          Location
                        </ThemedText>
                        <ThemedText>{incident.location}</ThemedText>
                      </View>
                    </View>

                    {incident.injuryOccurred && (
                      <View
                        style={[
                          styles.alertBanner,
                          {
                            backgroundColor: "#fee2e2",
                            borderColor: "#000000",
                          },
                        ]}
                      >
                        <Ionicons name="medical" size={14} color="#000000" />
                        <ThemedText
                          style={{
                            color: "#000000",
                            marginLeft: 6,
                            fontWeight: "600",
                          }}
                        >
                          Injury Reported
                        </ThemedText>
                      </View>
                    )}

                    {incident.projectName && (
                      <View style={styles.cardFooter}>
                        <Ionicons
                          name="briefcase-outline"
                          size={14}
                          color={textMutedColor}
                        />
                        <ThemedText
                          style={{ color: textMutedColor, marginLeft: 6 }}
                        >
                          {incident.projectName}
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </Section>
          </>
        )}

        {/* Inspections Tab */}
        {selectedTab === "inspections" && (
          <>
            <Section>
              <View style={styles.sectionHeader}>
                <ThemedText type="subtitle">Lịch kiểm tra an toàn</ThemedText>
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: tintColor }]}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                  <ThemedText
                    style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}
                  >
                    Tạo mới
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </Section>
            <Section>
              {MOCK_INSPECTIONS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.card,
                    { backgroundColor: surfaceColor, borderColor },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[
                          styles.scoreCircle,
                          {
                            borderColor: getInspectionStatusColor(item.status),
                          },
                        ]}
                      >
                        <ThemedText
                          style={{
                            fontWeight: "700",
                            fontSize: 16,
                            color: getInspectionStatusColor(item.status),
                          }}
                        >
                          {item.score}
                        </ThemedText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={{ fontWeight: "600", fontSize: 15 }}>
                          {item.title}
                        </ThemedText>
                        <ThemedText
                          style={{
                            color: textMutedColor,
                            fontSize: 13,
                            marginTop: 2,
                          }}
                        >
                          {item.type}
                        </ThemedText>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.severityBadge,
                        {
                          backgroundColor: getInspectionStatusColor(
                            item.status,
                          ),
                        },
                      ]}
                    >
                      <ThemedText style={styles.badgeText}>
                        {item.status}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={[styles.infoGrid, { marginTop: 12 }]}>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="person-outline"
                        size={14}
                        color={textMutedColor}
                      />
                      <ThemedText
                        style={{
                          color: textMutedColor,
                          fontSize: 13,
                          marginLeft: 4,
                        }}
                      >
                        {item.inspector}
                      </ThemedText>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={textMutedColor}
                      />
                      <ThemedText
                        style={{
                          color: textMutedColor,
                          fontSize: 13,
                          marginLeft: 4,
                        }}
                      >
                        {item.date}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </Section>
          </>
        )}

        {/* Hazards Tab */}
        {selectedTab === "hazards" && (
          <>
            <Section>
              <View style={styles.sectionHeader}>
                <ThemedText type="subtitle">Quản lý mối nguy</ThemedText>
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: "#ef4444" }]}
                >
                  <Ionicons name="alert-circle" size={18} color="#fff" />
                  <ThemedText
                    style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}
                  >
                    Báo cáo
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </Section>
            <Section>
              {MOCK_HAZARDS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.card,
                    { backgroundColor: surfaceColor, borderColor },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardHeaderLeft, { flex: 1 }]}>
                      <Ionicons
                        name="warning"
                        size={20}
                        color={getHazardRiskColor(item.riskLevel)}
                      />
                      <ThemedText
                        style={{ fontWeight: "600", fontSize: 15, flex: 1 }}
                      >
                        {item.title}
                      </ThemedText>
                    </View>
                    <View style={styles.badges}>
                      <View
                        style={[
                          styles.severityBadge,
                          {
                            backgroundColor: getHazardRiskColor(item.riskLevel),
                          },
                        ]}
                      >
                        <ThemedText style={styles.badgeText}>
                          {item.riskLevel}
                        </ThemedText>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: getHazardStatusColor(item.status),
                          },
                        ]}
                      >
                        <ThemedText style={styles.badgeText}>
                          {item.status.replace("_", " ")}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.infoGrid, { marginTop: 12 }]}>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={textMutedColor}
                      />
                      <ThemedText
                        style={{
                          color: textMutedColor,
                          fontSize: 13,
                          marginLeft: 4,
                        }}
                      >
                        {item.location}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={[styles.infoGrid, { marginTop: 6 }]}>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="person-outline"
                        size={14}
                        color={textMutedColor}
                      />
                      <ThemedText
                        style={{
                          color: textMutedColor,
                          fontSize: 13,
                          marginLeft: 4,
                        }}
                      >
                        {item.reportedBy}
                      </ThemedText>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={textMutedColor}
                      />
                      <ThemedText
                        style={{
                          color: textMutedColor,
                          fontSize: 13,
                          marginLeft: 4,
                        }}
                      >
                        {item.date}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </Section>
          </>
        )}

        {/* Permits Tab */}
        {selectedTab === "permits" && (
          <>
            <Section>
              <View style={styles.sectionHeader}>
                <ThemedText type="subtitle">Giấy phép công trường</ThemedText>
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: tintColor }]}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                  <ThemedText
                    style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}
                  >
                    Yêu cầu
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </Section>
            <Section>
              {MOCK_PERMITS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.card,
                    { backgroundColor: surfaceColor, borderColor },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardHeaderLeft, { flex: 1 }]}>
                      <Ionicons
                        name="document-text"
                        size={20}
                        color={tintColor}
                      />
                      <View style={{ flex: 1 }}>
                        <ThemedText style={{ fontWeight: "600", fontSize: 15 }}>
                          {item.title}
                        </ThemedText>
                        <ThemedText
                          style={{
                            color: textMutedColor,
                            fontSize: 13,
                            marginTop: 2,
                          }}
                        >
                          {item.type}
                        </ThemedText>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.severityBadge,
                        { backgroundColor: getPermitStatusColor(item.status) },
                      ]}
                    >
                      <ThemedText style={styles.badgeText}>
                        {item.status}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={[styles.infoGrid, { marginTop: 12 }]}>
                    <View style={styles.infoItem}>
                      <ThemedText
                        style={{ color: textMutedColor, fontSize: 12 }}
                      >
                        Cấp bởi
                      </ThemedText>
                      <ThemedText style={{ fontSize: 13, fontWeight: "500" }}>
                        {item.issuedBy}
                      </ThemedText>
                    </View>
                    {item.issuedDate ? (
                      <View style={styles.infoItem}>
                        <ThemedText
                          style={{ color: textMutedColor, fontSize: 12 }}
                        >
                          Ngày cấp
                        </ThemedText>
                        <ThemedText style={{ fontSize: 13, fontWeight: "500" }}>
                          {item.issuedDate}
                        </ThemedText>
                      </View>
                    ) : null}
                    {item.expiryDate ? (
                      <View style={styles.infoItem}>
                        <ThemedText
                          style={{ color: textMutedColor, fontSize: 12 }}
                        >
                          Hết hạn
                        </ThemedText>
                        <ThemedText
                          style={{
                            fontSize: 13,
                            fontWeight: "500",
                            color:
                              item.status === "EXPIRED" ? "#ef4444" : textColor,
                          }}
                        >
                          {item.expiryDate}
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </Section>
          </>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statLabel: {
    marginBottom: 4,
  },
  statValue: {
    marginTop: 4,
  },
  tabScrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  tabText: {
    fontWeight: "600",
    fontSize: 14,
  },
  filterContainer: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontWeight: "500",
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  incidentNumber: {
    fontSize: 14,
    fontWeight: "500",
  },
  badges: {
    flexDirection: "row",
    gap: 6,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  cardTitle: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 20,
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  infoItem: {
    flex: 1,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
});
