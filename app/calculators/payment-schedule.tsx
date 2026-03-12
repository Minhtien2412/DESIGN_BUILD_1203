/**
 * Payment Schedule Screen — Lịch thanh toán theo giai đoạn
 * ===========================================================
 * Breaks total project cost into construction phases with timeline.
 * Users select a project → see phase-by-phase payment schedule.
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    type EstimateProject,
    type PaymentPhase,
    type ProjectResult,
    calculateProject,
    formatVND,
    formatVNDFull,
    generatePaymentSchedule,
    getAllProjects,
    getProjectById,
    seqLabel,
} from "../../services/constructionEstimateEngine";

const C = {
  bg: "#F3F4F6",
  card: "#FFFFFF",
  primary: "#0D9488",
  primaryDark: "#0F766E",
  primaryLight: "#CCFBF1",
  accent: "#F59E0B",
  text: "#111827",
  textSec: "#6B7280",
  textTer: "#9CA3AF",
  border: "#E5E7EB",
  success: "#10B981",
};

const PHASE_COLORS = ["#0D9488", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981"];

export default function PaymentScheduleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const [projects, setProjects] = useState<EstimateProject[]>([]);
  const [selectedProject, setSelectedProject] =
    useState<EstimateProject | null>(null);
  const [phases, setPhases] = useState<PaymentPhase[]>([]);
  const [projectResult, setProjectResult] = useState<ProjectResult | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const all = await getAllProjects();
    setProjects(all);

    if (params.id) {
      const proj = await getProjectById(params.id);
      if (proj) selectProject(proj);
    }
    setLoading(false);
  };

  const selectProject = useCallback((proj: EstimateProject) => {
    Haptics.selectionAsync();
    setSelectedProject(proj);
    const result = proj.lastResult
      ? (proj.lastResult as ProjectResult)
      : calculateProject(proj);
    setProjectResult(result);
    const schedule = generatePaymentSchedule(result, proj.name);
    setPhases(schedule);
  }, []);

  const handleShare = useCallback(async () => {
    if (!selectedProject || !phases.length || !projectResult) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let text = `📅 LỊCH THANH TOÁN\n`;
    text += `Dự án: ${selectedProject.name}\n`;
    text += `Mã: ${seqLabel(selectedProject.seq)}\n`;
    text += `Tổng: ${formatVNDFull(projectResult.grandTotal)}\n`;
    text += `${"─".repeat(40)}\n\n`;

    for (const p of phases) {
      text += `${p.name}\n`;
      text += `  ${p.description}\n`;
      text += `  Thanh toán: ${formatVNDFull(p.amount)} (${p.percentage}%)\n`;
      text += `  Lũy kế: ${formatVNDFull(p.cumulativeAmount)} (${p.cumulativePercent}%)\n`;
      text += `  Thời gian: ~${p.estimatedDays} ngày\n\n`;
    }

    try {
      await Share.share({
        message: text,
        title: `Lịch thanh toán - ${selectedProject.name}`,
      });
    } catch {
      // cancelled
    }
  }, [selectedProject, phases, projectResult]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator
          size="large"
          color={C.primary}
          style={{ marginTop: 100 }}
        />
      </View>
    );
  }

  // Project picker
  if (!selectedProject) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[C.primaryDark, C.primary]}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.headerTitle}>Lịch thanh toán</Text>
            <Ionicons
              name="calendar-outline"
              size={22}
              color="rgba(255,255,255,0.7)"
            />
          </View>
          <Text style={styles.headerSub}>
            Chọn dự toán để xem lịch thanh toán theo giai đoạn
          </Text>
        </LinearGradient>

        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={C.textTer} />
              <Text style={styles.emptyText}>Chưa có dự toán nào</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.projectCard}
              onPress={() => selectProject(item)}
            >
              <View style={styles.projectRow}>
                <View style={styles.seqBadge}>
                  <Text style={styles.seqText}>{seqLabel(item.seq)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.projectName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.projectMeta}>
                    {item.floors.length} tầng · {item.landArea} m²
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.textTer} />
              </View>
            </Pressable>
          )}
        />
      </View>
    );
  }

  // Payment schedule view
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={[C.primaryDark, C.primary]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => {
              setSelectedProject(null);
              setPhases([]);
              setProjectResult(null);
            }}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Lịch thanh toán</Text>
            <Text style={styles.headerSub}>
              {seqLabel(selectedProject.seq)} — {selectedProject.name}
            </Text>
          </View>
          <Pressable onPress={handleShare} hitSlop={12}>
            <Ionicons name="share-outline" size={22} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Total summary */}
        {projectResult && (
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>TỔNG CHI PHÍ</Text>
            <Text style={styles.totalValue}>
              {formatVNDFull(projectResult.grandTotal)}
            </Text>
            <View style={styles.totalMeta}>
              <Text style={styles.totalMetaText}>
                {projectResult.totalArea} m² · {formatVND(projectResult.perM2)}
                /m² · {projectResult.laborDays} ngày thi công
              </Text>
            </View>
          </View>
        )}

        {/* Progress bar */}
        <View style={styles.progressBar}>
          {phases.map((phase, idx) => (
            <View
              key={phase.id}
              style={[
                styles.progressSegment,
                {
                  flex: phase.percentage,
                  backgroundColor: PHASE_COLORS[idx % PHASE_COLORS.length],
                  borderTopLeftRadius: idx === 0 ? 4 : 0,
                  borderBottomLeftRadius: idx === 0 ? 4 : 0,
                  borderTopRightRadius: idx === phases.length - 1 ? 4 : 0,
                  borderBottomRightRadius: idx === phases.length - 1 ? 4 : 0,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.legendRow}>
          {phases.map((phase, idx) => (
            <View key={phase.id} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: PHASE_COLORS[idx % PHASE_COLORS.length],
                  },
                ]}
              />
              <Text style={styles.legendText}>{phase.percentage}%</Text>
            </View>
          ))}
        </View>

        {/* Phase cards */}
        {phases.map((phase, idx) => (
          <View key={phase.id} style={styles.phaseCard}>
            {/* Phase header */}
            <View style={styles.phaseHeader}>
              <View
                style={[
                  styles.phaseIcon,
                  {
                    backgroundColor:
                      PHASE_COLORS[idx % PHASE_COLORS.length] + "20",
                  },
                ]}
              >
                <Ionicons
                  name={phase.icon as any}
                  size={20}
                  color={PHASE_COLORS[idx % PHASE_COLORS.length]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.phaseName}>{phase.name}</Text>
                <Text style={styles.phaseDesc}>{phase.description}</Text>
              </View>
            </View>

            {/* Phase details */}
            <View style={styles.phaseDetails}>
              <View style={styles.phaseDetailItem}>
                <Text style={styles.phaseDetailLabel}>Thanh toán</Text>
                <Text style={styles.phaseDetailValue}>
                  {formatVNDFull(phase.amount)}
                </Text>
                <Text style={styles.phaseDetailPct}>({phase.percentage}%)</Text>
              </View>

              <View style={styles.phaseDetailItem}>
                <Text style={styles.phaseDetailLabel}>Lũy kế</Text>
                <Text style={[styles.phaseDetailValue, { color: C.primary }]}>
                  {formatVND(phase.cumulativeAmount)}
                </Text>
                <Text style={[styles.phaseDetailPct, { color: C.primary }]}>
                  ({phase.cumulativePercent}%)
                </Text>
              </View>

              <View style={styles.phaseDetailItem}>
                <Text style={styles.phaseDetailLabel}>Thời gian</Text>
                <Text style={styles.phaseDetailValue}>
                  ~{phase.estimatedDays} ngày
                </Text>
                <Text style={styles.phaseDetailPct}>
                  (tổng {phase.cumulativeDays} ngày)
                </Text>
              </View>
            </View>

            {/* Cumulative progress */}
            <View style={styles.cumBar}>
              <View
                style={[
                  styles.cumBarFill,
                  {
                    width: `${phase.cumulativePercent}%`,
                    backgroundColor: PHASE_COLORS[idx % PHASE_COLORS.length],
                  },
                ]}
              />
            </View>
          </View>
        ))}

        {/* Summary table */}
        <View style={[styles.card, { marginTop: 8 }]}>
          <Text style={styles.cardTitle}>Tóm tắt lịch thanh toán</Text>
          {phases.map((phase, idx) => (
            <View key={phase.id} style={styles.summaryRow}>
              <View
                style={[
                  styles.summaryDot,
                  {
                    backgroundColor: PHASE_COLORS[idx % PHASE_COLORS.length],
                  },
                ]}
              />
              <Text style={styles.summaryLabel} numberOfLines={1}>
                GĐ {phase.id}
              </Text>
              <Text style={styles.summaryPct}>{phase.percentage}%</Text>
              <Text style={styles.summaryAmount}>
                {formatVND(phase.amount)}
              </Text>
              <Text style={styles.summaryDays}>{phase.estimatedDays} ngày</Text>
            </View>
          ))}
          <View
            style={[
              styles.summaryRow,
              {
                borderTopWidth: 1.5,
                borderTopColor: C.primaryDark,
                marginTop: 4,
                paddingTop: 10,
              },
            ]}
          >
            <View style={styles.summaryDot} />
            <Text style={[styles.summaryLabel, { fontWeight: "700" }]}>
              Tổng
            </Text>
            <Text style={[styles.summaryPct, { fontWeight: "700" }]}>100%</Text>
            <Text
              style={[
                styles.summaryAmount,
                { fontWeight: "700", color: C.primary },
              ]}
            >
              {projectResult ? formatVND(projectResult.grandTotal) : "—"}
            </Text>
            <Text style={[styles.summaryDays, { fontWeight: "700" }]}>
              {projectResult?.laborDays || 0} ngày
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },

  totalCard: {
    backgroundColor: C.primaryDark,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1,
  },
  totalValue: { fontSize: 26, fontWeight: "800", color: "#fff", marginTop: 6 },
  totalMeta: { marginTop: 10 },
  totalMetaText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },

  progressBar: {
    flexDirection: "row",
    height: 8,
    gap: 2,
    marginBottom: 6,
  },
  progressSegment: { height: 8 },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: C.textSec },

  phaseCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  phaseHeader: { flexDirection: "row", gap: 12, marginBottom: 14 },
  phaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseName: { fontSize: 14, fontWeight: "700", color: C.text },
  phaseDesc: { fontSize: 12, color: C.textSec, marginTop: 2 },

  phaseDetails: { flexDirection: "row", gap: 8, marginBottom: 12 },
  phaseDetailItem: { flex: 1, alignItems: "center" },
  phaseDetailLabel: { fontSize: 10, color: C.textTer, fontWeight: "600" },
  phaseDetailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
    marginTop: 2,
  },
  phaseDetailPct: { fontSize: 10, color: C.textSec },

  cumBar: {
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  cumBarFill: { height: 4, borderRadius: 2 },

  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  summaryDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  summaryLabel: {
    flex: 1,
    fontSize: 12,
    color: C.text,
    fontWeight: "500",
  },
  summaryPct: {
    fontSize: 12,
    color: C.textSec,
    width: 38,
    textAlign: "right",
  },
  summaryAmount: {
    fontSize: 12,
    color: C.text,
    fontWeight: "600",
    width: 70,
    textAlign: "right",
  },
  summaryDays: {
    fontSize: 11,
    color: C.textTer,
    width: 55,
    textAlign: "right",
  },

  // Project picker
  projectCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  projectRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  seqBadge: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  seqText: { fontSize: 11, fontWeight: "700", color: C.primary },
  projectName: { fontSize: 14, fontWeight: "600", color: C.text },
  projectMeta: { fontSize: 12, color: C.textSec, marginTop: 2 },

  emptyContainer: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "600", color: C.textSec },
});
