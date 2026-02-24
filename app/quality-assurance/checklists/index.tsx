/**
 * QA Checklists Screen - Danh sách kiểm tra chất lượng
 * @updated 2026-02-04
 */
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const COLORS = {
  primary: "#7CB342",
  secondary: "#2196F3",
  accent: "#FF9800",
  danger: "#F44336",
  success: "#4CAF50",
  purple: "#9C27B0",
  text: "#212121",
  textLight: "#757575",
};

const categories = [
  { id: "all", label: "Tất cả" },
  { id: "foundation", label: "Móng" },
  { id: "structure", label: "Kết cấu" },
  { id: "mep", label: "MEP" },
  { id: "finishing", label: "Hoàn thiện" },
];

const checklists = [
  {
    id: "1",
    name: "Kiểm tra đổ bê tông móng",
    category: "foundation",
    totalItems: 15,
    completedItems: 15,
    status: "completed",
    project: "Nhà phố Q7",
    lastUpdated: "08/01/2026",
  },
  {
    id: "2",
    name: "Nghiệm thu cốt thép sàn T2",
    category: "structure",
    totalItems: 12,
    completedItems: 10,
    status: "in_progress",
    project: "Biệt thự TD",
    lastUpdated: "07/01/2026",
  },
  {
    id: "3",
    name: "Kiểm tra hệ thống điện T1",
    category: "mep",
    totalItems: 20,
    completedItems: 0,
    status: "pending",
    project: "Căn hộ Sala",
    lastUpdated: "06/01/2026",
  },
  {
    id: "4",
    name: "Nghiệm thu sơn hoàn thiện",
    category: "finishing",
    totalItems: 8,
    completedItems: 5,
    status: "in_progress",
    project: "Nhà phố Q7",
    lastUpdated: "05/01/2026",
  },
];

export default function QAChecklistsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchText, setSearchText] = useState("");

  const filteredChecklists = checklists.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    if (activeCategory === "all") return matchesSearch;
    return matchesSearch && item.category === activeCategory;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return { color: COLORS.success, label: "Hoàn thành", bg: "#E8F5E9" };
      case "in_progress":
        return { color: COLORS.secondary, label: "Đang làm", bg: "#E3F2FD" };
      case "pending":
        return { color: COLORS.textLight, label: "Chờ", bg: "#F5F5F5" };
      default:
        return { color: COLORS.textLight, label: status, bg: "#F5F5F5" };
    }
  };

  const renderChecklist = ({ item }: { item: (typeof checklists)[0] }) => {
    const status = getStatusStyle(item.status);
    const progress = Math.round((item.completedItems / item.totalItems) * 100);

    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <View
              style={[styles.statusDot, { backgroundColor: status.color }]}
            />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.checklistName, { color: textColor }]}>
          {item.name}
        </Text>

        <View style={styles.projectRow}>
          <Ionicons name="home-outline" size={14} color={COLORS.textLight} />
          <Text style={styles.projectText}>{item.project}</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {item.completedItems}/{item.totalItems} hạng mục
            </Text>
            <Text style={[styles.progressPercent, { color: status.color }]}>
              {progress}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: status.color },
              ]}
            />
          </View>
        </View>

        <Text style={styles.lastUpdated}>Cập nhật: {item.lastUpdated}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Checklists QC/QA",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.success },
          headerTintColor: "#fff",
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 12 }}>
              <Ionicons name="add-circle" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm checklist..."
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                activeCategory === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat.id && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredChecklists}
        keyExtractor={(item) => item.id}
        renderItem={renderChecklist}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  categoriesContainer: { paddingHorizontal: 12, marginBottom: 8 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  categoryChipActive: { backgroundColor: COLORS.success },
  categoryChipText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  categoryChipTextActive: { color: "#fff" },
  listContent: { padding: 12, paddingBottom: 100 },
  card: { padding: 14, borderRadius: 12, marginBottom: 12 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },
  checklistName: { fontSize: 15, fontWeight: "600", marginBottom: 8 },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  projectText: { fontSize: 12, color: COLORS.textLight },
  progressSection: { marginBottom: 10 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: { fontSize: 12, color: COLORS.textLight },
  progressPercent: { fontSize: 12, fontWeight: "600" },
  progressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  lastUpdated: { fontSize: 11, color: COLORS.textLight },
});
