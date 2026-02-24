/**
 * NCR (Non-Conformance Report) Screen - Báo cáo sự không phù hợp
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
  text: "#212121",
  textLight: "#757575",
};

const STATUS = {
  open: { color: COLORS.danger, label: "Mở", bg: "#FFEBEE" },
  investigating: {
    color: COLORS.accent,
    label: "Đang điều tra",
    bg: "#FFF3E0",
  },
  corrective_action: {
    color: COLORS.secondary,
    label: "Đang khắc phục",
    bg: "#E3F2FD",
  },
  closed: { color: COLORS.success, label: "Đã đóng", bg: "#E8F5E9" },
};

const ncrs = [
  {
    id: "NCR-2026-001",
    title: "Bê tông không đạt cường độ",
    description: "Mẫu bê tông sàn T3 chỉ đạt 85% cường độ thiết kế sau 28 ngày",
    category: "Vật liệu",
    status: "investigating",
    severity: "Cao",
    project: "Nhà phố Q7",
    raisedBy: "KS. Kết cấu",
    raisedDate: "05/01/2026",
    dueDate: "15/01/2026",
    rootCause: "Đang xác định",
  },
  {
    id: "NCR-2026-002",
    title: "Thi công sai bản vẽ",
    description: "Vị trí cột C3 lệch 5cm so với bản vẽ thiết kế",
    category: "Thi công",
    status: "corrective_action",
    severity: "Trung bình",
    project: "Biệt thự TD",
    raisedBy: "Giám sát",
    raisedDate: "03/01/2026",
    dueDate: "10/01/2026",
    rootCause: "Đọc sai tọa độ định vị",
    correctiveAction: "Dịch chuyển vị trí cột, gia cường móng",
  },
  {
    id: "NCR-2025-045",
    title: "Hệ thống PCCC không đạt",
    description: "Áp lực nước hệ thống chữa cháy thấp hơn tiêu chuẩn",
    category: "MEP",
    status: "closed",
    severity: "Cao",
    project: "Căn hộ Sala",
    raisedBy: "Thanh tra PCCC",
    raisedDate: "20/12/2025",
    dueDate: "30/12/2025",
    closedDate: "28/12/2025",
    rootCause: "Bơm PCCC công suất không đủ",
    correctiveAction: "Thay bơm công suất lớn hơn",
  },
  {
    id: "NCR-2026-003",
    title: "Cốt thép thiếu lớp bảo vệ",
    description: "Lớp bê tông bảo vệ cốt thép dầm chỉ 15mm (yêu cầu 25mm)",
    category: "Thi công",
    status: "open",
    severity: "Cao",
    project: "Nhà phố Q7",
    raisedBy: "QC Manager",
    raisedDate: "08/01/2026",
    dueDate: "18/01/2026",
  },
];

const tabs = ["Tất cả", "Mở", "Đang xử lý", "Đã đóng"];

export default function NCRScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [searchText, setSearchText] = useState("");

  const filteredNCRs = ncrs.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.id.toLowerCase().includes(searchText.toLowerCase());
    if (activeTab === "Tất cả") return matchesSearch;
    if (activeTab === "Mở") return matchesSearch && item.status === "open";
    if (activeTab === "Đang xử lý")
      return (
        matchesSearch &&
        (item.status === "investigating" || item.status === "corrective_action")
      );
    if (activeTab === "Đã đóng")
      return matchesSearch && item.status === "closed";
    return matchesSearch;
  });

  const renderNCR = ({ item }: { item: (typeof ncrs)[0] }) => {
    const status = STATUS[item.status as keyof typeof STATUS];
    const isHighSeverity = item.severity === "Cao";

    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.cardHeader}>
          <View style={styles.idBadge}>
            <Ionicons name="document-text" size={14} color={COLORS.purple} />
            <Text style={styles.idText}>{item.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <Text style={[styles.ncrTitle, { color: textColor }]}>
          {item.title}
        </Text>
        <Text style={styles.ncrDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="folder" size={14} color={COLORS.textLight} />
            <Text style={styles.metaText}>{item.category}</Text>
          </View>
          <View
            style={[
              styles.severityBadge,
              {
                backgroundColor: isHighSeverity
                  ? COLORS.danger + "15"
                  : COLORS.accent + "15",
              },
            ]}
          >
            <Ionicons
              name="warning"
              size={12}
              color={isHighSeverity ? COLORS.danger : COLORS.accent}
            />
            <Text
              style={[
                styles.severityText,
                { color: isHighSeverity ? COLORS.danger : COLORS.accent },
              ]}
            >
              {item.severity}
            </Text>
          </View>
        </View>

        {item.rootCause && (
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Nguyên nhân gốc:</Text>
            <Text style={styles.infoValue}>{item.rootCause}</Text>
          </View>
        )}

        {item.correctiveAction && (
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Hành động khắc phục:</Text>
            <Text style={styles.infoValue}>{item.correctiveAction}</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.projectBadge}>
            <Ionicons name="home" size={12} color={COLORS.secondary} />
            <Text style={styles.projectText}>{item.project}</Text>
          </View>
          <View style={styles.dateInfo}>
            <Ionicons name="calendar" size={12} color={COLORS.textLight} />
            <Text style={styles.dateText}>Hạn: {item.dueDate}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "NCR - Sự không phù hợp",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.purple },
          headerTintColor: "#fff",
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 12 }}>
              <Ionicons name="add-circle" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Stats */}
      <View style={styles.statsRow}>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.danger + "15" }]}
        >
          <Text style={[styles.statValue, { color: COLORS.danger }]}>
            {ncrs.filter((n) => n.status === "open").length}
          </Text>
          <Text style={styles.statLabel}>Mở</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.accent + "15" }]}
        >
          <Text style={[styles.statValue, { color: COLORS.accent }]}>
            {
              ncrs.filter(
                (n) =>
                  n.status === "investigating" ||
                  n.status === "corrective_action",
              ).length
            }
          </Text>
          <Text style={styles.statLabel}>Đang xử lý</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.success + "15" }]}
        >
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {ncrs.filter((n) => n.status === "closed").length}
          </Text>
          <Text style={styles.statLabel}>Đã đóng</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm NCR..."
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredNCRs}
        keyExtractor={(item) => item.id}
        renderItem={renderNCR}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsRow: { flexDirection: "row", padding: 12, gap: 10 },
  statBox: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "bold" },
  statLabel: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
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
  tabsContainer: { paddingHorizontal: 12, paddingVertical: 10 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  tabActive: { backgroundColor: COLORS.purple },
  tabText: { fontSize: 13, color: COLORS.textLight, fontWeight: "500" },
  tabTextActive: { color: "#fff" },
  listContent: { padding: 12, paddingBottom: 100 },
  card: { padding: 14, borderRadius: 12, marginBottom: 12 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  idBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  idText: { fontSize: 12, fontWeight: "600", color: COLORS.purple },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "600" },
  ncrTitle: { fontSize: 15, fontWeight: "600", marginBottom: 6 },
  ncrDesc: { fontSize: 13, color: COLORS.textLight, marginBottom: 10 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: COLORS.textLight },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  severityText: { fontSize: 11, fontWeight: "500" },
  infoSection: { marginBottom: 8 },
  infoLabel: { fontSize: 11, color: COLORS.textLight, marginBottom: 2 },
  infoValue: { fontSize: 12, color: COLORS.text },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  projectBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  projectText: { fontSize: 11, color: COLORS.secondary, fontWeight: "500" },
  dateInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  dateText: { fontSize: 11, color: COLORS.textLight },
});
