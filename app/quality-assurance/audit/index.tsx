/**
 * Audit Screen - Quản lý kiểm toán chất lượng
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
  text: "#212121",
  textLight: "#757575",
};

const STATUS = {
  scheduled: {
    color: COLORS.secondary,
    label: "Đã lên lịch",
    icon: "calendar",
  },
  in_progress: {
    color: COLORS.accent,
    label: "Đang thực hiện",
    icon: "play-circle",
  },
  completed: {
    color: COLORS.success,
    label: "Hoàn thành",
    icon: "checkmark-circle",
  },
  overdue: { color: COLORS.danger, label: "Quá hạn", icon: "alert-circle" },
};

const audits = [
  {
    id: "AUD-2026-001",
    title: "Kiểm toán ISO 9001",
    type: "Bên ngoài",
    scope: "Hệ thống quản lý chất lượng toàn công ty",
    status: "scheduled",
    scheduledDate: "15/01/2026",
    auditor: "TUV Rheinland",
    project: "Toàn công ty",
    checklist: 45,
    priority: "Cao",
  },
  {
    id: "AUD-2026-002",
    title: "Kiểm tra an toàn công trường",
    type: "Nội bộ",
    scope: "An toàn lao động, PCCC, thiết bị",
    status: "in_progress",
    scheduledDate: "08/01/2026",
    auditor: "An toàn - Nguyễn Văn A",
    project: "Nhà phố Q7",
    checklist: 32,
    completedItems: 18,
    priority: "Trung bình",
  },
  {
    id: "AUD-2025-028",
    title: "Kiểm tra chất lượng bê tông",
    type: "Nội bộ",
    scope: "Quy trình đổ bê tông, bảo dưỡng, nghiệm thu",
    status: "completed",
    scheduledDate: "28/12/2025",
    completedDate: "29/12/2025",
    auditor: "QC - Trần Văn B",
    project: "Biệt thự TD",
    checklist: 25,
    completedItems: 25,
    findings: 3,
    score: 92,
  },
  {
    id: "AUD-2025-025",
    title: "Đánh giá nhà thầu phụ",
    type: "Nội bộ",
    scope: "Đánh giá năng lực, tuân thủ hợp đồng",
    status: "overdue",
    scheduledDate: "31/12/2025",
    auditor: "PM - Lê Văn C",
    project: "Căn hộ Sala",
    checklist: 20,
    completedItems: 8,
    priority: "Cao",
  },
  {
    id: "AUD-2026-003",
    title: "Kiểm tra hệ thống MEP",
    type: "Bên ngoài",
    scope: "Điện, nước, HVAC, PCCC",
    status: "scheduled",
    scheduledDate: "20/01/2026",
    auditor: "QUATEST 3",
    project: "Căn hộ Sala",
    checklist: 50,
    priority: "Cao",
  },
];

const tabs = ["Tất cả", "Sắp tới", "Đang làm", "Hoàn thành"];

export default function AuditScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [searchText, setSearchText] = useState("");

  const filteredAudits = audits.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    if (activeTab === "Tất cả") return matchesSearch;
    if (activeTab === "Sắp tới")
      return matchesSearch && item.status === "scheduled";
    if (activeTab === "Đang làm")
      return (
        matchesSearch &&
        (item.status === "in_progress" || item.status === "overdue")
      );
    if (activeTab === "Hoàn thành")
      return matchesSearch && item.status === "completed";
    return matchesSearch;
  });

  const renderAudit = ({ item }: { item: (typeof audits)[0] }) => {
    const status = STATUS[item.status as keyof typeof STATUS];
    const progress =
      item.completedItems && item.checklist
        ? Math.round((item.completedItems / item.checklist) * 100)
        : 0;

    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.cardHeader}>
          <View style={styles.idBadge}>
            <Ionicons name="clipboard" size={14} color={COLORS.teal} />
            <Text style={styles.idText}>{item.id}</Text>
          </View>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  item.type === "Bên ngoài"
                    ? COLORS.purple + "15"
                    : COLORS.teal + "15",
              },
            ]}
          >
            <Text
              style={[
                styles.typeText,
                {
                  color:
                    item.type === "Bên ngoài" ? COLORS.purple : COLORS.teal,
                },
              ]}
            >
              {item.type}
            </Text>
          </View>
        </View>

        <Text style={[styles.auditTitle, { color: textColor }]}>
          {item.title}
        </Text>
        <Text style={styles.auditScope} numberOfLines={2}>
          {item.scope}
        </Text>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: status.color + "15" },
            ]}
          >
            <Ionicons
              name={status.icon as any}
              size={14}
              color={status.color}
            />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          {item.score && (
            <View
              style={[
                styles.scoreBadge,
                {
                  backgroundColor:
                    item.score >= 90
                      ? COLORS.success + "15"
                      : COLORS.accent + "15",
                },
              ]}
            >
              <Ionicons
                name="star"
                size={12}
                color={item.score >= 90 ? COLORS.success : COLORS.accent}
              />
              <Text
                style={[
                  styles.scoreText,
                  { color: item.score >= 90 ? COLORS.success : COLORS.accent },
                ]}
              >
                {item.score}%
              </Text>
            </View>
          )}
        </View>

        {item.status === "in_progress" && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Tiến độ: {item.completedItems}/{item.checklist} mục
              </Text>
              <Text
                style={[styles.progressPercent, { color: COLORS.secondary }]}
              >
                {progress}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: COLORS.secondary },
                ]}
              />
            </View>
          </View>
        )}

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="person" size={14} color={COLORS.textLight} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.auditor}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={14} color={COLORS.textLight} />
            <Text style={styles.infoText}>{item.scheduledDate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkbox" size={14} color={COLORS.textLight} />
            <Text style={styles.infoText}>{item.checklist} mục kiểm tra</Text>
          </View>
          {item.findings !== undefined && (
            <View style={styles.infoItem}>
              <Ionicons name="alert-circle" size={14} color={COLORS.accent} />
              <Text style={[styles.infoText, { color: COLORS.accent }]}>
                {item.findings} phát hiện
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.projectBadge}>
            <Ionicons name="business" size={12} color={COLORS.secondary} />
            <Text style={styles.projectText}>{item.project}</Text>
          </View>
          <TouchableOpacity style={styles.viewBtn}>
            <Text style={styles.viewBtnText}>Chi tiết</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.teal} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Kiểm toán Chất lượng",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.teal },
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
          style={[styles.statBox, { backgroundColor: COLORS.secondary + "15" }]}
        >
          <Ionicons name="calendar" size={20} color={COLORS.secondary} />
          <Text style={[styles.statValue, { color: COLORS.secondary }]}>
            {audits.filter((a) => a.status === "scheduled").length}
          </Text>
          <Text style={styles.statLabel}>Sắp tới</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.accent + "15" }]}
        >
          <Ionicons name="play-circle" size={20} color={COLORS.accent} />
          <Text style={[styles.statValue, { color: COLORS.accent }]}>
            {audits.filter((a) => a.status === "in_progress").length}
          </Text>
          <Text style={styles.statLabel}>Đang làm</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.success + "15" }]}
        >
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {audits.filter((a) => a.status === "completed").length}
          </Text>
          <Text style={styles.statLabel}>Hoàn thành</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.danger + "15" }]}
        >
          <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
          <Text style={[styles.statValue, { color: COLORS.danger }]}>
            {audits.filter((a) => a.status === "overdue").length}
          </Text>
          <Text style={styles.statLabel}>Quá hạn</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm kiểm toán..."
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
        data={filteredAudits}
        keyExtractor={(item) => item.id}
        renderItem={renderAudit}
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
  statValue: { fontSize: 18, fontWeight: "bold", marginTop: 4 },
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
  tabsContainer: { paddingHorizontal: 12, paddingVertical: 10 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  tabActive: { backgroundColor: COLORS.teal },
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
  idText: { fontSize: 12, fontWeight: "600", color: COLORS.teal },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  typeText: { fontSize: 11, fontWeight: "600" },
  auditTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  auditScope: { fontSize: 12, color: COLORS.textLight, marginBottom: 10 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  scoreText: { fontSize: 12, fontWeight: "600" },
  progressSection: { marginBottom: 10 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: { fontSize: 12, color: COLORS.textLight },
  progressPercent: { fontSize: 12, fontWeight: "600" },
  progressBar: { height: 6, backgroundColor: "#E0E0E0", borderRadius: 3 },
  progressFill: { height: "100%", borderRadius: 3 },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 10,
  },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  infoText: { fontSize: 11, color: COLORS.textLight },
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
  viewBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  viewBtnText: { fontSize: 12, color: COLORS.teal, fontWeight: "500" },
});
