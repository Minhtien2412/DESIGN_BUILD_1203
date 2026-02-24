/**
 * Standards Screen - Tiêu chuẩn chất lượng
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
    View,
} from "react-native";

const COLORS = {
  primary: "#7CB342",
  secondary: "#2196F3",
  accent: "#FF9800",
  danger: "#F44336",
  success: "#4CAF50",
  purple: "#9C27B0",
  teal: "#009688",
  indigo: "#3F51B5",
  text: "#212121",
  textLight: "#757575",
};

const categories = ["Tất cả", "TCVN", "ISO", "TCXD", "Quy chuẩn", "Nội bộ"];

const standards = [
  {
    id: "ISO-9001",
    code: "ISO 9001:2015",
    title: "Hệ thống quản lý chất lượng - Các yêu cầu",
    category: "ISO",
    description:
      "Tiêu chuẩn về hệ thống quản lý chất lượng, áp dụng cho mọi tổ chức",
    status: "Áp dụng",
    version: "2015",
    appliedDate: "01/2020",
    documents: 5,
    checklists: 3,
  },
  {
    id: "TCVN-4453",
    code: "TCVN 4453:1995",
    title:
      "Kết cấu bê tông và BTCT toàn khối - Quy phạm thi công và nghiệm thu",
    category: "TCVN",
    description:
      "Quy phạm về thi công bê tông cốt thép toàn khối trong xây dựng",
    status: "Áp dụng",
    version: "1995",
    appliedDate: "06/2018",
    documents: 8,
    checklists: 6,
  },
  {
    id: "TCVN-5574",
    code: "TCVN 5574:2018",
    title: "Thiết kế kết cấu bê tông và bê tông cốt thép",
    category: "TCVN",
    description:
      "Tiêu chuẩn thiết kế kết cấu bê tông và BTCT trong công trình xây dựng",
    status: "Áp dụng",
    version: "2018",
    appliedDate: "01/2019",
    documents: 4,
    checklists: 2,
  },
  {
    id: "QCVN-06",
    code: "QCVN 06:2022/BXD",
    title: "Quy chuẩn kỹ thuật quốc gia về An toàn cháy cho nhà và công trình",
    category: "Quy chuẩn",
    description: "Quy định về an toàn cháy áp dụng trong thiết kế và thi công",
    status: "Áp dụng",
    version: "2022",
    appliedDate: "07/2022",
    documents: 6,
    checklists: 4,
  },
  {
    id: "TCXD-3993",
    code: "TCXDVN 3993:1985",
    title: "Chống ồn trong các công trình công nghiệp",
    category: "TCXD",
    description: "Tiêu chuẩn về thiết kế chống ồn trong xây dựng",
    status: "Tham khảo",
    version: "1985",
    documents: 2,
    checklists: 1,
  },
  {
    id: "NB-QT-001",
    code: "NB-QT-001",
    title: "Quy trình kiểm soát chất lượng công trình nội bộ",
    category: "Nội bộ",
    description:
      "Quy trình nội bộ về kiểm tra chất lượng cho các dự án của công ty",
    status: "Áp dụng",
    version: "v3.0",
    appliedDate: "01/2025",
    documents: 10,
    checklists: 8,
  },
  {
    id: "ISO-14001",
    code: "ISO 14001:2015",
    title: "Hệ thống quản lý môi trường - Các yêu cầu",
    category: "ISO",
    description: "Tiêu chuẩn quốc tế về hệ thống quản lý môi trường",
    status: "Đang triển khai",
    version: "2015",
    documents: 3,
    checklists: 2,
  },
];

export default function StandardsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchText, setSearchText] = useState("");

  const filteredStandards = standards.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code.toLowerCase().includes(searchText.toLowerCase());
    if (activeCategory === "Tất cả") return matchesSearch;
    return matchesSearch && item.category === activeCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Áp dụng":
        return COLORS.success;
      case "Đang triển khai":
        return COLORS.accent;
      case "Tham khảo":
        return COLORS.textLight;
      default:
        return COLORS.textLight;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "TCVN":
        return COLORS.secondary;
      case "ISO":
        return COLORS.indigo;
      case "TCXD":
        return COLORS.teal;
      case "Quy chuẩn":
        return COLORS.danger;
      case "Nội bộ":
        return COLORS.purple;
      default:
        return COLORS.textLight;
    }
  };

  const renderStandard = ({ item }: { item: (typeof standards)[0] }) => {
    const statusColor = getStatusColor(item.status);
    const categoryColor = getCategoryColor(item.category);

    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: categoryColor + "15" },
            ]}
          >
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {item.category}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "15" },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={[styles.standardCode, { color: categoryColor }]}>
          {item.code}
        </Text>
        <Text style={[styles.standardTitle, { color: textColor }]}>
          {item.title}
        </Text>
        <Text style={styles.standardDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={COLORS.textLight}
            />
            <Text style={styles.metaText}>Phiên bản: {item.version}</Text>
          </View>
          {item.appliedDate && (
            <View style={styles.metaItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={14}
                color={COLORS.textLight}
              />
              <Text style={styles.metaText}>Áp dụng: {item.appliedDate}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.resourcesRow}>
            <TouchableOpacity style={styles.resourceBtn}>
              <Ionicons
                name="document-text"
                size={16}
                color={COLORS.secondary}
              />
              <Text style={[styles.resourceText, { color: COLORS.secondary }]}>
                {item.documents} Tài liệu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceBtn}>
              <Ionicons name="checkbox" size={16} color={COLORS.teal} />
              <Text style={[styles.resourceText, { color: COLORS.teal }]}>
                {item.checklists} Checklist
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.viewBtn}>
            <Ionicons name="eye" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const statsData = [
    {
      label: "TCVN",
      count: standards.filter((s) => s.category === "TCVN").length,
      color: COLORS.secondary,
    },
    {
      label: "ISO",
      count: standards.filter((s) => s.category === "ISO").length,
      color: COLORS.indigo,
    },
    {
      label: "Quy chuẩn",
      count: standards.filter((s) => s.category === "Quy chuẩn").length,
      color: COLORS.danger,
    },
    {
      label: "Nội bộ",
      count: standards.filter((s) => s.category === "Nội bộ").length,
      color: COLORS.purple,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Tiêu chuẩn Chất lượng",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.indigo },
          headerTintColor: "#fff",
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 12 }}>
              <Ionicons name="download" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Stats */}
      <View style={styles.statsRow}>
        {statsData.map((stat) => (
          <View
            key={stat.label}
            style={[styles.statBox, { backgroundColor: stat.color + "15" }]}
          >
            <Text style={[styles.statValue, { color: stat.color }]}>
              {stat.count}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm tiêu chuẩn..."
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat && { backgroundColor: COLORS.indigo },
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat && { color: "#fff" },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredStandards}
        keyExtractor={(item) => item.id}
        renderItem={renderStandard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsRow: { flexDirection: "row", padding: 12, gap: 8 },
  statBox: { flex: 1, padding: 10, borderRadius: 10, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 10, color: COLORS.textLight, marginTop: 2 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  categoriesContainer: { paddingHorizontal: 12, paddingVertical: 10 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  listContent: { padding: 12, paddingBottom: 100 },
  card: { padding: 14, borderRadius: 12, marginBottom: 12 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: { fontSize: 11, fontWeight: "600" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "500" },
  standardCode: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  standardTitle: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  standardDesc: { fontSize: 12, color: COLORS.textLight, marginBottom: 10 },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 12,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 11, color: COLORS.textLight },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  resourcesRow: { flexDirection: "row", gap: 16 },
  resourceBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  resourceText: { fontSize: 12, fontWeight: "500" },
  viewBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
});
