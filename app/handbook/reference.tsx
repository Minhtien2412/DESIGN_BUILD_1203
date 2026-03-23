/**
 * Handbook Reference/Guide/Checklist Screen
 * Displays reference content, guides, and checklists
 */
import type { ChecklistItem } from "@/data/handbook";
import { getHandbookItem } from "@/data/handbook";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  light: {
    bg: "#F0F9F6",
    card: "#FFFFFF",
    text: "#1A2B3C",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    tableBg: "#F8FAFC",
    tableHeaderBg: "#0D9488",
  },
  dark: {
    bg: "#0A0F1A",
    card: "#1A2332",
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    border: "#2D3A4A",
    tableBg: "#0F1A28",
    tableHeaderBg: "#065F56",
  },
};

const TEAL = "#0D9488";

// Simple markdown renderer for reference content
function MarkdownContent({
  content,
  C,
}: {
  content: string;
  C: typeof COLORS.light;
}) {
  const lines = content.split("\n");
  const elements: React.JSX.Element[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableKey = 0;

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        <View key={`table-${tableKey++}`} style={mdStyles.table}>
          {tableRows.map((row, idx) => {
            // Skip separator row (---|---|---)
            if (row.every((cell) => cell.replace(/-/g, "").trim() === "")) {
              return null;
            }
            const isHeader = idx === 0;
            return (
              <View
                key={idx}
                style={[
                  mdStyles.tableRow,
                  isHeader && { backgroundColor: C.tableHeaderBg },
                  !isHeader && idx % 2 === 0 && { backgroundColor: C.tableBg },
                ]}
              >
                {row.map((cell, ci) => (
                  <View
                    key={ci}
                    style={[
                      mdStyles.tableCell,
                      ci > 0 && {
                        borderLeftWidth: 0.5,
                        borderLeftColor: C.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        mdStyles.tableCellText,
                        { color: isHeader ? "#FFF" : C.text },
                        isHeader && { fontWeight: "700" },
                      ]}
                    >
                      {cell.trim()}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>,
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Table row detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed
        .split("|")
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      tableRows.push(cells);
      inTable = true;
      return;
    }

    if (inTable) flushTable();

    if (!trimmed) {
      elements.push(<View key={i} style={{ height: 8 }} />);
    } else if (trimmed.startsWith("# ")) {
      elements.push(
        <Text key={i} style={[mdStyles.h1, { color: C.text }]}>
          {trimmed.replace("# ", "")}
        </Text>,
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <Text key={i} style={[mdStyles.h2, { color: C.text }]}>
          {trimmed.replace("## ", "")}
        </Text>,
      );
    } else if (trimmed.startsWith("### ")) {
      elements.push(
        <Text key={i} style={[mdStyles.h3, { color: C.text }]}>
          {trimmed.replace("### ", "")}
        </Text>,
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const text = trimmed.replace(/^[-*]\s+/, "");
      const isBold = text.startsWith("**");
      elements.push(
        <View key={i} style={mdStyles.listItem}>
          <Text style={[mdStyles.bullet, { color: TEAL }]}>•</Text>
          <Text style={[mdStyles.listText, { color: C.text }]}>
            {isBold ? (
              <Text>
                <Text style={{ fontWeight: "700" }}>
                  {text.replace(/\*\*/g, "").split(" - ")[0]}
                </Text>
                {text.includes(" - ")
                  ? " - " + text.split(" - ").slice(1).join(" - ")
                  : ""}
              </Text>
            ) : (
              text.replace(/\*\*/g, "")
            )}
          </Text>
        </View>,
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)\./)?.[1] || "";
      const text = trimmed.replace(/^\d+\.\s+/, "");
      const isBold = text.startsWith("**");
      elements.push(
        <View key={i} style={mdStyles.listItem}>
          <Text style={[mdStyles.numBullet, { color: TEAL }]}>{num}.</Text>
          <Text style={[mdStyles.listText, { color: C.text }]}>
            {isBold ? (
              <Text>
                <Text style={{ fontWeight: "700" }}>
                  {text.replace(/\*\*/g, "").split(":")[0]}
                </Text>
                {text.includes(":")
                  ? ": " +
                    text.split(":").slice(1).join(":").replace(/\*\*/g, "")
                  : ""}
              </Text>
            ) : (
              text.replace(/\*\*/g, "")
            )}
          </Text>
        </View>,
      );
    } else {
      elements.push(
        <Text key={i} style={[mdStyles.paragraph, { color: C.text }]}>
          {trimmed.replace(/\*\*/g, "")}
        </Text>,
      );
    }
  });

  if (inTable) flushTable();

  return <View>{elements}</View>;
}

export default function HandbookReferenceScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? COLORS.dark : COLORS.light;

  const item = useMemo(() => getHandbookItem(itemId), [itemId]);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = useCallback((id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Group checklist items by category
  const groupedChecklist = useMemo(() => {
    if (!item?.checklist) return null;
    const groups: Record<string, ChecklistItem[]> = {};
    item.checklist.forEach((ci) => {
      const cat = ci.category || "Chung";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(ci);
    });
    return groups;
  }, [item?.checklist]);

  const progress = item?.checklist
    ? Math.round((checkedItems.size / item.checklist.length) * 100)
    : 0;

  if (!item) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: C.bg, paddingTop: insets.top },
        ]}
      >
        <Text style={{ color: C.text, textAlign: "center", marginTop: 40 }}>
          Không tìm thấy nội dung
        </Text>
      </View>
    );
  }

  const typeInfo: Record<
    string,
    { label: string; color: string; gradient: [string, string] }
  > = {
    reference: {
      label: "📚 Bảng tra cứu",
      color: "#10B981",
      gradient: isDark ? ["#0A2215", "#0D3320"] : ["#065F46", "#10B981"],
    },
    guide: {
      label: "📖 Hướng dẫn",
      color: "#8B5CF6",
      gradient: isDark ? ["#1A0A2A", "#2D1050"] : ["#5B21B6", "#8B5CF6"],
    },
    checklist: {
      label: "✅ Checklist",
      color: "#F59E0B",
      gradient: isDark ? ["#2A1A0A", "#3D2510"] : ["#B45309", "#F59E0B"],
    },
  };

  const info = typeInfo[item.type] || typeInfo.guide;

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <LinearGradient
        colors={info.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerBadgeText}>{info.label}</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.tags && (
          <View style={styles.tagsRow}>
            {item.tags.map((tag) => (
              <View key={tag} style={styles.headerTag}>
                <Text style={styles.headerTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Reference/Guide content */}
        {item.content && (
          <View
            style={[
              styles.contentCard,
              { backgroundColor: C.card, borderColor: C.border },
            ]}
          >
            <MarkdownContent content={item.content} C={C} />
          </View>
        )}

        {/* Checklist content */}
        {item.type === "checklist" && groupedChecklist && (
          <>
            {/* Progress bar */}
            <View
              style={[
                styles.progressCard,
                { backgroundColor: C.card, borderColor: C.border },
              ]}
            >
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: C.text }]}>
                  Tiến độ hoàn thành
                </Text>
                <Text style={[styles.progressValue, { color: TEAL }]}>
                  {checkedItems.size}/{item.checklist!.length} ({progress}%)
                </Text>
              </View>
              <View
                style={[styles.progressBarBg, { backgroundColor: C.border }]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progress}%`, backgroundColor: TEAL },
                  ]}
                />
              </View>
            </View>

            {/* Grouped checklist */}
            {Object.entries(groupedChecklist).map(([category, items]) => (
              <View
                key={category}
                style={[
                  styles.checkGroup,
                  { backgroundColor: C.card, borderColor: C.border },
                ]}
              >
                <Text style={[styles.checkGroupTitle, { color: C.text }]}>
                  {category}
                </Text>
                {items.map((ci) => {
                  const isChecked = checkedItems.has(ci.id);
                  return (
                    <TouchableOpacity
                      key={ci.id}
                      style={[styles.checkItem, { borderColor: C.border }]}
                      onPress={() => toggleCheck(ci.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isChecked ? "checkbox" : "square-outline"}
                        size={22}
                        color={isChecked ? TEAL : C.textSecondary}
                      />
                      <Text
                        style={[
                          styles.checkText,
                          { color: C.text },
                          isChecked && styles.checkedText,
                        ]}
                      >
                        {ci.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const mdStyles = StyleSheet.create({
  h1: { fontSize: 20, fontWeight: "800", marginBottom: 12, marginTop: 4 },
  h2: { fontSize: 16, fontWeight: "700", marginBottom: 8, marginTop: 12 },
  h3: { fontSize: 14, fontWeight: "700", marginBottom: 6, marginTop: 8 },
  paragraph: { fontSize: 13, lineHeight: 20, marginBottom: 4 },
  listItem: { flexDirection: "row", marginBottom: 4, paddingRight: 8 },
  bullet: { fontSize: 14, marginRight: 8, lineHeight: 20 },
  numBullet: {
    fontSize: 13,
    fontWeight: "700",
    marginRight: 6,
    lineHeight: 20,
    minWidth: 18,
  },
  listText: { flex: 1, fontSize: 13, lineHeight: 20 },
  table: {
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 8,
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
  },
  tableRow: { flexDirection: "row" },
  tableCell: { flex: 1, padding: 8 },
  tableCellText: { fontSize: 12, lineHeight: 16 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerBadgeText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  headerTag: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  headerTagText: { fontSize: 11, color: "#FFF" },
  // Content
  contentCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  // Checklist
  progressCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: { fontSize: 14, fontWeight: "600" },
  progressValue: { fontSize: 14, fontWeight: "800" },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  checkGroup: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  checkGroupTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  checkText: { flex: 1, fontSize: 13, lineHeight: 20 },
  checkedText: { textDecorationLine: "line-through", opacity: 0.5 },
});
