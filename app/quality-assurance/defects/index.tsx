/**
 * QA Defects Screen - Quản lý lỗi/khuyết tật
 * @updated 2026-02-04
 */
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Image,
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

const SEVERITY = {
  critical: {
    color: COLORS.danger,
    label: "Nghiêm trọng",
    icon: "alert-circle",
  },
  major: { color: COLORS.accent, label: "Lớn", icon: "warning" },
  minor: { color: COLORS.secondary, label: "Nhỏ", icon: "information-circle" },
};

const STATUS = {
  open: { color: COLORS.danger, label: "Mở", bg: "#FFEBEE" },
  in_progress: { color: COLORS.accent, label: "Đang sửa", bg: "#FFF3E0" },
  resolved: { color: COLORS.success, label: "Đã sửa", bg: "#E8F5E9" },
  verified: { color: COLORS.purple, label: "Đã nghiệm thu", bg: "#F3E5F5" },
};

const defects = [
  {
    id: "1",
    title: "Nứt tường phòng khách",
    description: "Vết nứt dọc theo mạch vữa, chiều dài ~50cm",
    severity: "major",
    status: "open",
    location: "Tầng 1 - Phòng khách",
    project: "Nhà phố Q7",
    reportedBy: "Giám sát A",
    reportedDate: "08/01/2026",
    image: "https://picsum.photos/200/150?random=1",
  },
  {
    id: "2",
    title: "Rò rỉ đường ống nước",
    description: "Rỉ nước tại khớp nối ống PVC toilet T2",
    severity: "critical",
    status: "in_progress",
    location: "Tầng 2 - WC",
    project: "Biệt thự TD",
    reportedBy: "KS. Điện nước",
    reportedDate: "07/01/2026",
    assignee: "Đội MEP",
    image: "https://picsum.photos/200/150?random=2",
  },
  {
    id: "3",
    title: "Sơn bong tróc cửa sổ",
    description: "Lớp sơn lót không đều, bong tại khung cửa sổ phòng ngủ",
    severity: "minor",
    status: "resolved",
    location: "Tầng 2 - Phòng ngủ",
    project: "Nhà phố Q7",
    reportedBy: "Chủ nhà",
    reportedDate: "05/01/2026",
    resolvedDate: "06/01/2026",
    image: "https://picsum.photos/200/150?random=3",
  },
  {
    id: "4",
    title: "Gạch lát không đều",
    description: "Mạch gạch sàn bếp không đều, chênh lệch 3mm",
    severity: "minor",
    status: "verified",
    location: "Tầng 1 - Bếp",
    project: "Căn hộ Sala",
    reportedBy: "QC Manager",
    reportedDate: "03/01/2026",
    resolvedDate: "04/01/2026",
    verifiedDate: "05/01/2026",
    image: "https://picsum.photos/200/150?random=4",
  },
];

const tabs = ["Tất cả", "Mở", "Đang sửa", "Đã sửa"];

export default function QADefectsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [searchText, setSearchText] = useState("");

  const filteredDefects = defects.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    if (activeTab === "Tất cả") return matchesSearch;
    if (activeTab === "Mở") return matchesSearch && item.status === "open";
    if (activeTab === "Đang sửa")
      return matchesSearch && item.status === "in_progress";
    if (activeTab === "Đã sửa")
      return (
        matchesSearch &&
        (item.status === "resolved" || item.status === "verified")
      );
    return matchesSearch;
  });

  const renderDefect = ({ item }: { item: (typeof defects)[0] }) => {
    const severity = SEVERITY[item.severity as keyof typeof SEVERITY];
    const status = STATUS[item.status as keyof typeof STATUS];

    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.cardHeader}>
          <View style={styles.severityBadge}>
            <Ionicons
              name={severity.icon as any}
              size={16}
              color={severity.color}
            />
            <Text style={[styles.severityText, { color: severity.color }]}>
              {severity.label}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.defectImage} />
          </View>
          <View style={styles.defectInfo}>
            <Text
              style={[styles.defectTitle, { color: textColor }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text style={styles.defectDesc} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={12}
                color={COLORS.textLight}
              />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.projectBadge}>
            <Ionicons name="home" size={12} color={COLORS.secondary} />
            <Text style={styles.projectText}>{item.project}</Text>
          </View>
          <Text style={styles.dateText}>{item.reportedDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Stats
  const openCount = defects.filter((d) => d.status === "open").length;
  const inProgressCount = defects.filter(
    (d) => d.status === "in_progress",
  ).length;
  const resolvedCount = defects.filter(
    (d) => d.status === "resolved" || d.status === "verified",
  ).length;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Quản lý Defects",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.danger },
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
            {openCount}
          </Text>
          <Text style={styles.statLabel}>Mở</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.accent + "15" }]}
        >
          <Text style={[styles.statValue, { color: COLORS.accent }]}>
            {inProgressCount}
          </Text>
          <Text style={styles.statLabel}>Đang sửa</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.success + "15" }]}
        >
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {resolvedCount}
          </Text>
          <Text style={styles.statLabel}>Đã sửa</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm defect..."
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
        data={filteredDefects}
        keyExtractor={(item) => item.id}
        renderItem={renderDefect}
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
  tabActive: { backgroundColor: COLORS.danger },
  tabText: { fontSize: 13, color: COLORS.textLight, fontWeight: "500" },
  tabTextActive: { color: "#fff" },
  listContent: { padding: 12, paddingBottom: 100 },
  card: { padding: 14, borderRadius: 12, marginBottom: 12 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  severityBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  severityText: { fontSize: 12, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "600" },
  cardBody: { flexDirection: "row", marginBottom: 12 },
  imageContainer: {
    width: 80,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
  },
  defectImage: { width: "100%", height: "100%" },
  defectInfo: { flex: 1, marginLeft: 12 },
  defectTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  defectDesc: { fontSize: 12, color: COLORS.textLight, marginBottom: 6 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 11, color: COLORS.textLight },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  dateText: { fontSize: 11, color: COLORS.textLight },
});
