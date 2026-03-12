/**
 * Handbook Category Detail Screen
 * Shows all items within a specific handbook category
 */
import type { HandbookItem } from "@/data/handbook";
import { getHandbookCategory } from "@/data/handbook";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
    FlatList,
    Platform,
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
  },
  dark: {
    bg: "#0A0F1A",
    card: "#1A2332",
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    border: "#2D3A4A",
  },
};

const TYPE_LABELS: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  calculator: {
    label: "Tính toán",
    color: "#14B8A6",
    icon: "calculator-outline",
  },
  reference: { label: "Tra cứu", color: "#10B981", icon: "book-outline" },
  checklist: { label: "Checklist", color: "#F59E0B", icon: "checkbox-outline" },
  guide: {
    label: "Hướng dẫn",
    color: "#8B5CF6",
    icon: "document-text-outline",
  },
};

export default function HandbookCategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? COLORS.dark : COLORS.light;

  const category = useMemo(() => getHandbookCategory(categoryId), [categoryId]);

  if (!category) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: C.bg, paddingTop: insets.top },
        ]}
      >
        <Text style={{ color: C.text, textAlign: "center", marginTop: 40 }}>
          Không tìm thấy danh mục
        </Text>
      </View>
    );
  }

  const handleItemPress = (item: HandbookItem) => {
    if (item.type === "calculator" && item.formula) {
      router.push({
        pathname: "/handbook/calculator",
        params: { itemId: item.id },
      });
    } else {
      router.push({
        pathname: "/handbook/reference",
        params: { itemId: item.id },
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <LinearGradient
        colors={
          isDark
            ? ["#0A2A2A", "#0D4444"]
            : [category.color, category.color + "DD"]
        }
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
            <Text style={styles.headerTitle} numberOfLines={1}>
              {category.title}
            </Text>
          </View>
          <View style={{ width: 38 }} />
        </View>
        <Text style={styles.headerDesc}>{category.description}</Text>
        <View style={styles.headerBadge}>
          <Ionicons name={category.icon as any} size={16} color="#FFF" />
          <Text style={styles.headerBadgeText}>
            {category.items.length} mục
          </Text>
        </View>
      </LinearGradient>

      {/* Items list */}
      <FlatList
        data={category.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 20,
        }}
        renderItem={({ item, index }) => {
          const typeInfo = TYPE_LABELS[item.type] || TYPE_LABELS.guide;
          return (
            <TouchableOpacity
              style={[
                styles.itemCard,
                { backgroundColor: C.card, borderColor: C.border },
              ]}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.itemLeft}>
                <View style={styles.indexBadge}>
                  <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <View style={styles.itemContent}>
                  <Text
                    style={[styles.itemTitle, { color: C.text }]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  {item.description && (
                    <Text
                      style={[styles.itemDesc, { color: C.textSecondary }]}
                      numberOfLines={1}
                    >
                      {item.description}
                    </Text>
                  )}
                  <View style={styles.itemMeta}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: typeInfo.color + "15" },
                      ]}
                    >
                      <Ionicons
                        name={typeInfo.icon as any}
                        size={10}
                        color={typeInfo.color}
                      />
                      <Text
                        style={[
                          styles.typeBadgeText,
                          { color: typeInfo.color },
                        ]}
                      >
                        {typeInfo.label}
                      </Text>
                    </View>
                    {item.tags &&
                      item.tags.slice(0, 2).map((tag) => (
                        <View
                          key={tag}
                          style={[
                            styles.tagBadge,
                            { backgroundColor: C.border },
                          ]}
                        >
                          <Text
                            style={[styles.tagText, { color: C.textSecondary }]}
                          >
                            {tag}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={C.textSecondary}
              />
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  headerDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 10,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  headerBadgeText: { fontSize: 12, color: "#FFF", fontWeight: "600" },
  // Items
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  itemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#0D9488" + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  indexText: { fontSize: 12, fontWeight: "800", color: "#0D9488" },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  itemDesc: { fontSize: 12, marginTop: 2 },
  itemMeta: { flexDirection: "row", marginTop: 6, gap: 6, flexWrap: "wrap" },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: { fontSize: 10, fontWeight: "700" },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: { fontSize: 10 },
});
