/**
 * Compare Projects Screen — So sánh dự toán
 * ============================================
 * Side-by-side comparison of 2–3 saved projects.
 * Users pick projects → see a comparison table with key metrics.
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    BUILDING_TYPE_META,
    compareProjects,
    type CompareResult,
    type EstimateProject,
    formatVND,
    getAllProjects,
    seqLabel
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
  danger: "#EF4444",
};

const PROJECT_COLORS = ["#0D9488", "#8B5CF6", "#F59E0B"];
const MAX_COMPARE = 3;

export default function CompareScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [projects, setProjects] = useState<EstimateProject[]>([]);
  const [selected, setSelected] = useState<EstimateProject[]>([]);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const all = await getAllProjects();
    setProjects(all);
    setLoading(false);
  };

  const toggleProject = useCallback(
    (proj: EstimateProject) => {
      Haptics.selectionAsync();
      const exists = selected.find((s) => s.id === proj.id);
      if (exists) {
        setSelected(selected.filter((s) => s.id !== proj.id));
      } else if (selected.length < MAX_COMPARE) {
        setSelected([...selected, proj]);
      }
    },
    [selected],
  );

  const doCompare = useCallback(() => {
    if (selected.length < 2) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = compareProjects(selected);
    setResult(res);
    setShowPicker(false);
  }, [selected]);

  const resetCompare = useCallback(() => {
    setResult(null);
    setSelected([]);
    setShowPicker(true);
  }, []);

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

  // Picker mode
  if (showPicker) {
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
            <Text style={styles.headerTitle}>So sánh dự toán</Text>
            <Ionicons
              name="git-compare-outline"
              size={22}
              color="rgba(255,255,255,0.7)"
            />
          </View>
          <Text style={styles.headerSub}>
            Chọn 2–3 dự toán để so sánh ({selected.length}/{MAX_COMPARE})
          </Text>
        </LinearGradient>

        {/* Selected chips */}
        {selected.length > 0 && (
          <View style={styles.selectedRow}>
            {selected.map((p, idx) => (
              <View
                key={p.id}
                style={[
                  styles.selectedChip,
                  {
                    borderColor: PROJECT_COLORS[idx % PROJECT_COLORS.length],
                  },
                ]}
              >
                <View
                  style={[
                    styles.selectedDot,
                    {
                      backgroundColor:
                        PROJECT_COLORS[idx % PROJECT_COLORS.length],
                    },
                  ]}
                />
                <Text style={styles.selectedText} numberOfLines={1}>
                  {seqLabel(p.seq)}
                </Text>
                <Pressable onPress={() => toggleProject(p)} hitSlop={8}>
                  <Ionicons name="close" size={14} color={C.textSec} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons
                name="git-compare-outline"
                size={48}
                color={C.textTer}
              />
              <Text style={styles.emptyText}>
                Cần ít nhất 2 dự toán để so sánh
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = selected.some((s) => s.id === item.id);
            const selectedIdx = selected.findIndex((s) => s.id === item.id);
            return (
              <Pressable
                style={[
                  styles.projectCard,
                  isSelected && styles.projectCardSelected,
                ]}
                onPress={() => toggleProject(item)}
              >
                <View style={styles.projectRow}>
                  {isSelected ? (
                    <View
                      style={[
                        styles.checkCircle,
                        {
                          backgroundColor:
                            PROJECT_COLORS[selectedIdx % PROJECT_COLORS.length],
                        },
                      ]}
                    >
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  ) : (
                    <View style={styles.uncheckCircle} />
                  )}
                  <View style={styles.seqBadge}>
                    <Text style={styles.seqText}>{seqLabel(item.seq)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.projectName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.projectMeta}>
                      {BUILDING_TYPE_META[item.buildingType].label} ·{" "}
                      {item.floors.length} tầng · {item.landArea} m²
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />

        {/* Compare button */}
        {selected.length >= 2 && (
          <View
            style={[
              styles.bottomBar,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <Pressable style={styles.compareBtn} onPress={doCompare}>
              <Ionicons name="git-compare-outline" size={20} color="#fff" />
              <Text style={styles.compareBtnText}>
                So sánh {selected.length} dự toán
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  // Comparison result
  if (!result) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={[C.primaryDark, C.primary]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={resetCompare} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Kết quả so sánh</Text>
          <View />
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Project headers */}
        <View style={styles.compareHeaderRow}>
          <View style={styles.labelCol}>
            <Text style={styles.labelColText}>Hạng mục</Text>
          </View>
          {result.projectNames.map((name, idx) => (
            <View key={idx} style={styles.valueCol}>
              <View
                style={[
                  styles.colDot,
                  {
                    backgroundColor:
                      PROJECT_COLORS[idx % PROJECT_COLORS.length],
                  },
                ]}
              />
              <Text style={styles.colSeq}>{result.projectSeqs[idx]}</Text>
              <Text style={styles.colName} numberOfLines={2}>
                {name}
              </Text>
            </View>
          ))}
        </View>

        {/* Comparison rows */}
        {result.fields.map((field, rowIdx) => {
          const values = field.values.map((v) =>
            field.isCurrency
              ? formatVND(v as number)
              : field.unit
                ? `${typeof v === "number" ? v.toLocaleString("vi-VN") : v} ${field.unit}`
                : String(v),
          );

          // Highlight best value for numeric fields
          let bestIdx = -1;
          if (field.isCurrency && field.key === "grandTotal") {
            const nums = field.values as number[];
            bestIdx = nums.indexOf(Math.min(...nums));
          } else if (field.isCurrency && field.key === "perM2") {
            const nums = field.values as number[];
            bestIdx = nums.indexOf(Math.min(...nums));
          }

          return (
            <View
              key={field.key}
              style={[
                styles.compareRow,
                rowIdx % 2 === 0 && styles.compareRowAlt,
              ]}
            >
              <View style={styles.labelCol}>
                <Text style={styles.rowLabel}>{field.label}</Text>
              </View>
              {values.map((val, colIdx) => (
                <View key={colIdx} style={styles.valueCol}>
                  <Text
                    style={[
                      styles.rowValue,
                      colIdx === bestIdx && styles.rowValueBest,
                    ]}
                    numberOfLines={2}
                  >
                    {val}
                  </Text>
                  {colIdx === bestIdx && (
                    <View style={styles.bestBadge}>
                      <Ionicons name="star" size={8} color={C.accent} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          );
        })}

        {/* Action */}
        <Pressable style={styles.resetBtn} onPress={resetCompare}>
          <Ionicons name="refresh" size={18} color={C.primary} />
          <Text style={styles.resetBtnText}>So sánh lại</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: "#fff" },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 6,
    marginLeft: 36,
  },

  selectedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: C.bg,
  },
  selectedDot: { width: 8, height: 8, borderRadius: 4 },
  selectedText: { fontSize: 12, fontWeight: "600", color: C.text },

  projectCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  projectCardSelected: { borderColor: C.primary, backgroundColor: "#F0FDFA" },
  projectRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uncheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.border,
  },
  seqBadge: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  seqText: { fontSize: 11, fontWeight: "700", color: C.primary },
  projectName: { fontSize: 14, fontWeight: "600", color: C.text },
  projectMeta: { fontSize: 12, color: C.textSec, marginTop: 2 },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.card,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  compareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  compareBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  // Compare result
  compareHeaderRow: {
    flexDirection: "row",
    backgroundColor: C.primaryDark,
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  labelCol: { flex: 1 },
  labelColText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  valueCol: { flex: 1, alignItems: "center" },
  colDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  colSeq: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.8)" },
  colName: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginTop: 2,
  },

  compareRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  compareRowAlt: { backgroundColor: "#FAFAFA" },
  rowLabel: { fontSize: 12, color: C.textSec, fontWeight: "500" },
  rowValue: {
    fontSize: 12,
    fontWeight: "600",
    color: C.text,
    textAlign: "center",
  },
  rowValueBest: { color: C.success, fontWeight: "700" },
  bestBadge: { marginTop: 2 },

  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    marginTop: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.primary,
    backgroundColor: C.card,
  },
  resetBtnText: { fontSize: 14, fontWeight: "600", color: C.primary },

  emptyBox: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 14, color: C.textSec, textAlign: "center" },
});
