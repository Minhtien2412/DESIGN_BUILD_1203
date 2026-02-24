import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Container } from "../ui/container";
import { Loader } from "../ui/loader";
import { Section } from "../ui/section";

const MODERN_COLORS = Colors.light;
const MODERN_SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export interface SafetyDashboardTemplateProps {
  projectId?: string;
  showIncidents?: boolean;
  showInspections?: boolean;
}

interface IncidentStats {
  total: number;
  critical: number;
  major: number;
  minor: number;
  resolved: number;
}

interface Incident {
  id: string;
  type: "critical" | "major" | "minor";
  description: string;
  location: string;
  reportedAt: string;
  status: "open" | "investigating" | "resolved";
}

export default function SafetyDashboardTemplate({
  projectId,
  showIncidents = true,
  showInspections = true,
}: SafetyDashboardTemplateProps) {
  const [loading, setLoading] = useState(false);
  const [safetyScore, setSafetyScore] = useState(87);
  const [stats] = useState<IncidentStats>({
    total: 12,
    critical: 1,
    major: 3,
    minor: 8,
    resolved: 10,
  });

  const [recentIncidents] = useState<Incident[]>([
    {
      id: "1",
      type: "major",
      description: "Công nhân không đội mũ bảo hộ",
      location: "Tầng 3 - Khu vực A",
      reportedAt: "2025-12-18 09:30",
      status: "investigating",
    },
    {
      id: "2",
      type: "minor",
      description: "Thiếu rào chắn khu vực nguy hiểm",
      location: "Tầng 2 - Khu vực B",
      reportedAt: "2025-12-17 14:15",
      status: "resolved",
    },
  ]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#0D9488";
    if (score >= 60) return "#0D9488";
    return "#000000";
  };

  const getIncidentColor = (type: Incident["type"]) => {
    switch (type) {
      case "critical":
        return "#000000";
      case "major":
        return "#0D9488";
      case "minor":
        return "#0D9488";
    }
  };

  const getStatusBadge = (status: Incident["status"]) => {
    const config = {
      open: { label: "Mới", color: "#000000" },
      investigating: { label: "Đang xử lý", color: "#0D9488" },
      resolved: { label: "Đã giải quyết", color: "#0D9488" },
    };
    return config[status];
  };

  if (loading) {
    return <Loader text="Đang tải dữ liệu an toàn..." />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Container>
        {/* Safety Score */}
        <Section>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Điểm An Toàn</Text>
            <View style={styles.scoreCircle}>
              <Text
                style={[
                  styles.scoreValue,
                  { color: getScoreColor(safetyScore) },
                ]}
              >
                {safetyScore}
              </Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <Text style={styles.scoreDescription}>
              {safetyScore >= 80
                ? "Xuất sắc - Duy trì công tác an toàn tốt"
                : safetyScore >= 60
                  ? "Tốt - Cần cải thiện một số điểm"
                  : "Cảnh báo - Cần tăng cường ngay"}
            </Text>
          </View>
        </Section>

        {/* Incident Statistics */}
        <Section title="Thống kê sự cố">
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: "#6B7280" }]}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Tổng số</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: "#000000" }]}>
              <Text style={[styles.statValue, { color: "#000000" }]}>
                {stats.critical}
              </Text>
              <Text style={styles.statLabel}>Nghiêm trọng</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: "#0D9488" }]}>
              <Text style={[styles.statValue, { color: "#0D9488" }]}>
                {stats.major}
              </Text>
              <Text style={styles.statLabel}>Quan trọng</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: "#0D9488" }]}>
              <Text style={[styles.statValue, { color: "#0D9488" }]}>
                {stats.minor}
              </Text>
              <Text style={styles.statLabel}>Nhỏ</Text>
            </View>
          </View>

          {/* Resolution Rate */}
          <View style={styles.resolutionCard}>
            <View style={styles.resolutionHeader}>
              <Text style={styles.resolutionLabel}>Tỷ lệ giải quyết</Text>
              <Text style={styles.resolutionValue}>
                {Math.round((stats.resolved / stats.total) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(stats.resolved / stats.total) * 100}%` },
                ]}
              />
            </View>
          </View>
        </Section>

        {/* Recent Incidents */}
        {showIncidents && (
          <Section title="Sự cố gần đây">
            {recentIncidents.map((incident) => (
              <Pressable key={incident.id} style={styles.incidentCard}>
                {/* Type Indicator */}
                <View
                  style={[
                    styles.incidentIndicator,
                    { backgroundColor: getIncidentColor(incident.type) },
                  ]}
                />

                <View style={styles.incidentContent}>
                  {/* Header */}
                  <View style={styles.incidentHeader}>
                    <Text style={styles.incidentDescription}>
                      {incident.description}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusBadge(incident.status).color + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusBadge(incident.status).color },
                        ]}
                      >
                        {getStatusBadge(incident.status).label}
                      </Text>
                    </View>
                  </View>

                  {/* Location */}
                  <View style={styles.incidentMeta}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={MODERN_COLORS.textMuted}
                    />
                    <Text style={styles.metaText}>{incident.location}</Text>
                  </View>

                  {/* Time */}
                  <View style={styles.incidentMeta}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={MODERN_COLORS.textMuted}
                    />
                    <Text style={styles.metaText}>{incident.reportedAt}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </Section>
        )}

        {/* Safety Checklist */}
        <Section title="Checklist An Toàn">
          <View style={styles.checklistCard}>
            <ChecklistItem text="Kiểm tra thiết bị bảo hộ" checked={true} />
            <ChecklistItem text="Rào chắn khu vực nguy hiểm" checked={true} />
            <ChecklistItem text="Biển cảnh báo an toàn" checked={false} />
            <ChecklistItem text="Đào tạo an toàn lao động" checked={true} />
            <ChecklistItem text="Kiểm tra dây điện" checked={false} />
          </View>
        </Section>

        {/* Emergency Contacts */}
        <Section title="Liên hệ khẩn cấp">
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <Ionicons name="call" size={20} color="#000000" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Cấp cứu</Text>
                <Text style={styles.contactNumber}>115</Text>
              </View>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call" size={20} color="#0D9488" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Giám sát an toàn</Text>
                <Text style={styles.contactNumber}>0909 123 456</Text>
              </View>
            </View>
          </View>
        </Section>
      </Container>
    </ScrollView>
  );
}

function ChecklistItem({ text, checked }: { text: string; checked: boolean }) {
  return (
    <View style={styles.checklistItem}>
      <Ionicons
        name={checked ? "checkmark-circle" : "ellipse-outline"}
        size={20}
        color={checked ? "#0D9488" : MODERN_COLORS.border}
      />
      <Text
        style={[styles.checklistText, checked && styles.checklistTextChecked]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  scoreCard: {
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    ...MODERN_SHADOWS.md,
  },
  scoreLabel: {
    fontSize: 16,
    color: MODERN_COLORS.textMuted,
    marginBottom: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: MODERN_COLORS.accentSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: "700",
  },
  scoreMax: {
    fontSize: 16,
    color: MODERN_COLORS.textMuted,
  },
  scoreDescription: {
    fontSize: 14,
    color: MODERN_COLORS.textMuted,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderLeftWidth: 4,
    ...MODERN_SHADOWS.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: MODERN_COLORS.textMuted,
  },
  resolutionCard: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    ...MODERN_SHADOWS.sm,
  },
  resolutionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resolutionLabel: {
    fontSize: 15,
    color: MODERN_COLORS.text,
  },
  resolutionValue: {
    fontSize: 20,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: MODERN_COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0D9488",
    borderRadius: 4,
  },
  incidentCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    ...MODERN_SHADOWS.sm,
  },
  incidentIndicator: {
    width: 4,
  },
  incidentContent: {
    flex: 1,
    padding: 16,
  },
  incidentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  incidentDescription: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  incidentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 13,
    color: MODERN_COLORS.textMuted,
  },
  checklistCard: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    ...MODERN_SHADOWS.sm,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  checklistText: {
    flex: 1,
    fontSize: 15,
    color: MODERN_COLORS.text,
  },
  checklistTextChecked: {
    color: MODERN_COLORS.textMuted,
    textDecorationLine: "line-through",
  },
  contactCard: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    gap: 16,
    ...MODERN_SHADOWS.sm,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    color: MODERN_COLORS.textMuted,
  },
  contactNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.text,
  },
});
