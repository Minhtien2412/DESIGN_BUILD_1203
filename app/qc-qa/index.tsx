/**
 * QC/QA Hub Screen
 * Quản lý chất lượng công trình
 *
 * @author AI Assistant
 * @date 19/01/2026
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const QC_FEATURES = [
  {
    id: "inspections",
    icon: "search",
    title: "Kiểm tra nghiệm thu",
    description: "Tạo và quản lý biên bản nghiệm thu",
    color: "#3b82f6",
    route: "/qc-qa/inspections",
    count: 12,
  },
  {
    id: "checklists",
    icon: "checkbox",
    title: "Checklist QC",
    description: "Danh mục kiểm tra chất lượng",
    color: "#10b981",
    route: "/qc-qa/checklists",
    count: 8,
  },
  {
    id: "defects",
    icon: "warning",
    title: "Quản lý lỗi/sai phạm",
    description: "Theo dõi và xử lý các lỗi phát sinh",
    color: "#ef4444",
    route: "/qc-qa/defects",
    count: 5,
  },
  {
    id: "reports",
    icon: "document-text",
    title: "Báo cáo QC",
    description: "Tổng hợp báo cáo chất lượng",
    color: "#8b5cf6",
    route: "/qc-qa/reports",
    count: 24,
  },
  {
    id: "standards",
    icon: "ribbon",
    title: "Tiêu chuẩn áp dụng",
    description: "TCVN, QCVN, ISO standards",
    color: "#f59e0b",
    route: "/qc-qa/standards",
    count: 15,
  },
];

const RECENT_INSPECTIONS = [
  {
    id: "1",
    name: "Nghiệm thu bê tông cột C1-C4",
    status: "passed",
    date: "Hôm nay",
  },
  {
    id: "2",
    name: "Kiểm tra thép sàn tầng 3",
    status: "pending",
    date: "Hôm qua",
  },
  {
    id: "3",
    name: "Nghiệm thu hệ thống điện",
    status: "failed",
    date: "2 ngày trước",
  },
];

export default function QCQAScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "passed":
        return "Đạt";
      case "pending":
        return "Chờ duyệt";
      case "failed":
        return "Không đạt";
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#0066CC", "#0080FF"]} style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Ionicons name="shield-checkmark" size={64} color="#fff" />
          <Text style={styles.headerTitle}>✅ QC/QA Management</Text>
          <Text style={styles.headerSubtitle}>
            Quản lý chất lượng công trình
          </Text>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#dcfce7" }]}>
            <Text style={[styles.statNumber, { color: "#10b981" }]}>28</Text>
            <Text style={styles.statLabel}>Đạt</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#fef3c7" }]}>
            <Text style={[styles.statNumber, { color: "#f59e0b" }]}>5</Text>
            <Text style={styles.statLabel}>Chờ duyệt</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#fee2e2" }]}>
            <Text style={[styles.statNumber, { color: "#ef4444" }]}>3</Text>
            <Text style={styles.statLabel}>Không đạt</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            🔧 Chức năng
          </Text>
          {QC_FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[styles.featureCard, { backgroundColor: cardBg }]}
              onPress={() => router.push(feature.route as any)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: feature.color + "20" },
                ]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={24}
                  color={feature.color}
                />
              </View>
              <View style={styles.featureInfo}>
                <Text style={[styles.featureTitle, { color: textColor }]}>
                  {feature.title}
                </Text>
                <Text style={styles.featureDesc}>{feature.description}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: feature.color + "20" },
                ]}
              >
                <Text style={[styles.badgeText, { color: feature.color }]}>
                  {feature.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Inspections */}
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              📋 Kiểm tra gần đây
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {RECENT_INSPECTIONS.map((inspection) => (
            <TouchableOpacity
              key={inspection.id}
              style={[styles.inspectionCard, { backgroundColor: cardBg }]}
            >
              <View style={styles.inspectionInfo}>
                <Text style={[styles.inspectionName, { color: textColor }]}>
                  {inspection.name}
                </Text>
                <Text style={styles.inspectionDate}>{inspection.date}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(inspection.status) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(inspection.status) },
                  ]}
                >
                  {getStatusLabel(inspection.status)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  seeAll: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: "#6b7280",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  inspectionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  inspectionInfo: {
    flex: 1,
  },
  inspectionName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  inspectionDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
