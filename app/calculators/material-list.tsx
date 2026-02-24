/**
 * Material BOQ Screen — Bảng vật tư (Bill of Quantities)
 * ========================================================
 * Displays a comprehensive material shopping list for a project.
 * Users select a saved project → view aggregated material list.
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
    Share,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    type BOQLine,
    type BOQResult,
    calculateProject,
    type EstimateProject,
    formatVND,
    formatVNDFull,
    generateBOQ,
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
  warn: "#F59E0B",
};

const CATEGORY_ICONS: Record<string, string> = {
  "Bê tông": "cube-outline",
  Thép: "construct-outline",
  "Gạch xây": "grid-outline",
  "Xi măng": "briefcase-outline",
  Cát: "ellipse-outline",
  Mái: "home-outline",
  "Chống thấm": "water-outline",
  "Trát tường": "layers-outline",
  Sơn: "color-palette-outline",
  "Ốp lát": "apps-outline",
  Cửa: "log-in-outline",
  Điện: "flash-outline",
  Nước: "water-outline",
  "Thiết bị WC": "medkit-outline",
  "Hàng rào": "shield-outline",
  "Sân vườn": "leaf-outline",
};

export default function MaterialListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const [projects, setProjects] = useState<EstimateProject[]>([]);
  const [selectedProject, setSelectedProject] =
    useState<EstimateProject | null>(null);
  const [boq, setBOQ] = useState<BOQResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupMode, setGroupMode] = useState<"category" | "flat">("category");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const all = await getAllProjects();
    setProjects(all);

    if (params.id) {
      const proj = await getProjectById(params.id);
      if (proj) {
        selectProject(proj);
      }
    }
    setLoading(false);
  };

  const selectProject = useCallback((proj: EstimateProject) => {
    Haptics.selectionAsync();
    setSelectedProject(proj);
    const result = proj.lastResult
      ? (proj.lastResult as any)
      : calculateProject(proj);
    const boqResult = generateBOQ(proj, result);
    setBOQ(boqResult);
  }, []);

  const handleShare = useCallback(async () => {
    if (!boq) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let text = `📋 BẢNG VẬT TƯ - ${boq.projectName}\n`;
    text += `Mã: ${boq.projectSeq}\n`;
    text += `Ngày: ${new Date(boq.generatedAt).toLocaleDateString("vi-VN")}\n`;
    text += `${"─".repeat(40)}\n\n`;

    // Group by category
    const cats = new Map<string, BOQLine[]>();
    for (const l of boq.lines) {
      if (!cats.has(l.category)) cats.set(l.category, []);
      cats.get(l.category)!.push(l);
    }

    for (const [cat, items] of cats) {
      text += `▸ ${cat}\n`;
      for (const item of items) {
        text += `  ${item.item}: ${item.quantity.toLocaleString("vi-VN")} ${item.unit} × ${formatVND(item.unitPrice)} = ${formatVND(item.total)}\n`;
      }
      text += "\n";
    }

    text += `${"─".repeat(40)}\n`;
    text += `Vật tư: ${formatVNDFull(boq.totalMaterial)}\n`;
    text += `Nhân công: ${formatVNDFull(boq.totalLabor)}\n`;
    text += `Dự phòng: ${formatVNDFull(boq.contingency)}\n`;
    text += `TỔNG: ${formatVNDFull(boq.grandTotal)}\n`;

    try {
      await Share.share({ message: text, title: `BOQ - ${boq.projectName}` });
    } catch {
      // cancelled
    }
  }, [boq]);

  // Group lines by category
  const groupedData = useCallback(() => {
    if (!boq) return [];
    if (groupMode === "flat") return boq.lines;

    const cats = new Map<string, BOQLine[]>();
    for (const l of boq.lines) {
      if (!cats.has(l.category)) cats.set(l.category, []);
      cats.get(l.category)!.push(l);
    }
    type GroupedItem =
      | { type: "header"; category: string; count: number; total: number }
      | { type: "line"; data: BOQLine };
    const result: GroupedItem[] = [];
    for (const [cat, items] of cats) {
      const catTotal = items.reduce((s, m) => s + m.total, 0);
      result.push({
        type: "header",
        category: cat,
        count: items.length,
        total: catTotal,
      });
      for (const item of items) {
        result.push({ type: "line", data: item });
      }
    }
    return result;
  }, [boq, groupMode]);

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

  // Project picker if none selected
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
            <Text style={styles.headerTitle}>Bảng vật tư</Text>
            <Ionicons
              name="list-outline"
              size={22}
              color="rgba(255,255,255,0.7)"
            />
          </View>
          <Text style={styles.headerSub}>
            Chọn dự toán để xem danh sách vật tư
          </Text>
        </LinearGradient>

        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color={C.textTer} />
              <Text style={styles.emptyText}>Chưa có dự toán nào</Text>
              <Text style={styles.emptySubText}>
                Hãy tạo dự toán trước để xem bảng vật tư
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.projectCard}
              onPress={() => selectProject(item)}
            >
              <View style={styles.projectHeader}>
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

  // BOQ view
  const data = groupedData();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={[C.primaryDark, C.primary]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => {
              setSelectedProject(null);
              setBOQ(null);
            }}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Bảng vật tư</Text>
            <Text style={styles.headerSub}>
              {boq?.projectSeq} — {boq?.projectName}
            </Text>
          </View>
          <Pressable onPress={handleShare} hitSlop={12}>
            <Ionicons name="share-outline" size={22} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Summary card */}
      {boq && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Vật tư</Text>
            <Text style={styles.summaryValue}>
              {formatVND(boq.totalMaterial)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Nhân công</Text>
            <Text style={styles.summaryValue}>{formatVND(boq.totalLabor)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tổng</Text>
            <Text style={[styles.summaryValue, { color: C.primary }]}>
              {formatVND(boq.grandTotal)}
            </Text>
          </View>
        </View>
      )}

      {/* Group mode toggle */}
      <View style={styles.toggleRow}>
        <Pressable
          style={[
            styles.toggleBtn,
            groupMode === "category" && styles.toggleBtnActive,
          ]}
          onPress={() => setGroupMode("category")}
        >
          <Ionicons
            name="albums-outline"
            size={14}
            color={groupMode === "category" ? "#fff" : C.textSec}
          />
          <Text
            style={[
              styles.toggleText,
              groupMode === "category" && styles.toggleTextActive,
            ]}
          >
            Nhóm
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleBtn,
            groupMode === "flat" && styles.toggleBtnActive,
          ]}
          onPress={() => setGroupMode("flat")}
        >
          <Ionicons
            name="list-outline"
            size={14}
            color={groupMode === "flat" ? "#fff" : C.textSec}
          />
          <Text
            style={[
              styles.toggleText,
              groupMode === "flat" && styles.toggleTextActive,
            ]}
          >
            Danh sách
          </Text>
        </Pressable>
        <Text style={styles.lineCount}>{boq?.lines.length || 0} hạng mục</Text>
      </View>

      {/* Material list */}
      <FlatList
        data={data as any[]}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        renderItem={({ item }: { item: any }) => {
          if (item.type === "header") {
            return (
              <View style={styles.catHeader}>
                <View style={styles.catIcon}>
                  <Ionicons
                    name={
                      (CATEGORY_ICONS[item.category] || "cube-outline") as any
                    }
                    size={16}
                    color={C.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.catTitle}>{item.category}</Text>
                  <Text style={styles.catCount}>{item.count} hạng mục</Text>
                </View>
                <Text style={styles.catTotal}>{formatVND(item.total)}</Text>
              </View>
            );
          }

          const line: BOQLine = item.data || item;
          return (
            <View style={styles.matRow}>
              <View style={styles.matStt}>
                <Text style={styles.matSttText}>{line.stt}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.matName} numberOfLines={1}>
                  {line.item}
                </Text>
                <Text style={styles.matQty}>
                  {line.quantity.toLocaleString("vi-VN")} {line.unit} ×{" "}
                  {formatVND(line.unitPrice)}
                </Text>
              </View>
              <Text style={styles.matTotal}>{formatVND(line.total)}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },

  summaryCard: {
    flexDirection: "row",
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryLabel: { fontSize: 10, color: C.textTer, fontWeight: "600" },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    marginTop: 2,
  },
  summaryDivider: { width: 1, height: 30, backgroundColor: C.border },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  toggleBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  toggleText: { fontSize: 12, color: C.textSec, fontWeight: "600" },
  toggleTextActive: { color: "#fff" },
  lineCount: {
    flex: 1,
    textAlign: "right",
    fontSize: 12,
    color: C.textTer,
  },

  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.primaryLight,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  catTitle: { fontSize: 13, fontWeight: "700", color: C.primaryDark },
  catCount: { fontSize: 10, color: C.primary },
  catTotal: { fontSize: 13, fontWeight: "700", color: C.primaryDark },

  matRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    gap: 10,
  },
  matStt: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  matSttText: { fontSize: 10, fontWeight: "600", color: C.textTer },
  matName: { fontSize: 13, color: C.text, fontWeight: "500" },
  matQty: { fontSize: 11, color: C.textSec, marginTop: 2 },
  matTotal: { fontSize: 13, fontWeight: "700", color: C.text },

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
  projectHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
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
  emptySubText: { fontSize: 13, color: C.textTer, textAlign: "center" },
});
