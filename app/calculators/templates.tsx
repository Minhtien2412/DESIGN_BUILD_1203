/**
 * Templates Screen — Mẫu dự toán
 * =========================================
 * Pre-built project templates for common Vietnamese house types.
 * Users pick a template → auto-filled project opens in the wizard.
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    GRADE_META,
    PROJECT_TEMPLATES,
    type ProjectTemplate,
    calculateProject,
    createProject,
    createProjectFromTemplate,
    formatVND
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

const TAG_COLORS: Record<string, string> = {
  "phổ biến": "#0D9488",
  "tiết kiệm": "#10B981",
  "cao cấp": "#F59E0B",
  luxury: "#EF4444",
  "kinh doanh": "#8B5CF6",
  "biệt thự": "#EC4899",
  penthouse: "#F59E0B",
  "nhà vườn": "#22C55E",
  mini: "#6366F1",
  "thôn quê": "#84CC16",
};

export default function TemplatesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleSelect = useCallback(
    (tpl: ProjectTemplate) => {
      Haptics.selectionAsync();
      setSelectedId(selectedId === tpl.id ? null : tpl.id);
    },
    [selectedId],
  );

  const handleUseTemplate = useCallback(
    async (tpl: ProjectTemplate) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCreating(true);
      try {
        const partial = createProjectFromTemplate(tpl);
        const project = await createProject(partial);
        router.push(`/calculators/project-estimate?id=${project.id}` as any);
      } catch {
        Alert.alert("Lỗi", "Không thể tạo dự toán từ mẫu");
      } finally {
        setCreating(false);
      }
    },
    [router],
  );

  const getQuickCost = (tpl: ProjectTemplate): string => {
    const partial = createProjectFromTemplate(tpl);
    const result = calculateProject({
      ...partial,
      id: "tpl",
      seq: 0,
      createdAt: "",
      updatedAt: "",
    });
    return formatVND(result.grandTotal);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={[C.primaryDark, C.primary]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Mẫu dự toán</Text>
          <Ionicons
            name="albums-outline"
            size={22}
            color="rgba(255,255,255,0.7)"
          />
        </View>
        <Text style={styles.headerSub}>
          {PROJECT_TEMPLATES.length} mẫu sẵn có — chọn mẫu để tạo dự toán nhanh
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {PROJECT_TEMPLATES.map((tpl) => {
          const isSelected = selectedId === tpl.id;
          return (
            <Pressable
              key={tpl.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => handleSelect(tpl)}
            >
              {/* Header */}
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconCircle,
                    isSelected && styles.iconCircleActive,
                  ]}
                >
                  <Ionicons
                    name={tpl.icon as any}
                    size={22}
                    color={isSelected ? "#fff" : C.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{tpl.name}</Text>
                  <Text style={styles.cardDesc}>{tpl.description}</Text>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.tagRow}>
                {tpl.tags.map((tag) => (
                  <View
                    key={tag}
                    style={[
                      styles.tagChip,
                      {
                        backgroundColor: (TAG_COLORS[tag] || C.primary) + "15",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        { color: TAG_COLORS[tag] || C.primary },
                      ]}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Specs */}
              <View style={styles.specRow}>
                <View style={styles.specItem}>
                  <Ionicons name="resize-outline" size={14} color={C.textTer} />
                  <Text style={styles.specText}>{tpl.landArea} m²</Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="layers-outline" size={14} color={C.textTer} />
                  <Text style={styles.specText}>{tpl.numFloors} tầng</Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="star-outline" size={14} color={C.textTer} />
                  <Text style={styles.specText}>
                    {GRADE_META[tpl.grade].label}
                  </Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="cash-outline" size={14} color={C.primary} />
                  <Text
                    style={[
                      styles.specText,
                      { color: C.primary, fontWeight: "700" },
                    ]}
                  >
                    ~{getQuickCost(tpl)}
                  </Text>
                </View>
              </View>

              {/* Expanded action */}
              {isSelected && (
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => handleUseTemplate(tpl)}
                    disabled={creating}
                  >
                    <Ionicons name="create-outline" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>
                      {creating ? "Đang tạo..." : "Sử dụng mẫu này"}
                    </Text>
                  </Pressable>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: "#fff" },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 6,
    marginLeft: 36,
  },

  body: { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 80 },

  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardSelected: {
    borderColor: C.primary,
    backgroundColor: "#F0FDFA",
  },

  cardHeader: { flexDirection: "row", gap: 12, marginBottom: 10 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleActive: { backgroundColor: C.primary },
  cardName: { fontSize: 15, fontWeight: "700", color: C.text },
  cardDesc: { fontSize: 12, color: C.textSec, marginTop: 2 },

  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: { fontSize: 10, fontWeight: "600" },

  specRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  specText: { fontSize: 12, color: C.textSec },

  actionRow: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 14,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
