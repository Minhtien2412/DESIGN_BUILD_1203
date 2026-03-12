import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ActivityFilter = "all" | "finding" | "working" | "scheduled";

const FILTERS: { key: ActivityFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "finding", label: "Đang tìm" },
  { key: "working", label: "Đang tiến hành" },
  { key: "scheduled", label: "Đặt lịch" },
];

export default function ActivityTabScreen() {
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>("all");

  const history = useMemo(
    () => [
      {
        id: "1",
        title: "Bảo trì điện lạnh",
        subtitle: "Đã hoàn thành • Hôm qua",
        icon: "construct-outline" as const,
      },
      {
        id: "2",
        title: "Sơn lại phòng ngủ",
        subtitle: "Đã hủy • 3 ngày trước",
        icon: "color-fill-outline" as const,
      },
    ],
    [],
  );

  return (
    <LinearGradient
      colors={["#020617", "#0F172A", "#111827"]}
      style={styles.bg}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Hoạt động</Text>
          <Text style={styles.subtitle}>
            Theo dõi mọi đơn và lịch hẹn của bạn
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map((filter) => {
              const active = activeFilter === filter.key;
              return (
                <Pressable
                  key={filter.key}
                  onPress={() => setActiveFilter(filter.key)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="time-outline" size={30} color="#60A5FA" />
            </View>
            <Text style={styles.emptyTitle}>Bạn chưa có công việc đang mở</Text>
            <Text style={styles.emptyDescription}>
              Tạo yêu cầu mới để hệ thống gợi ý thợ phù hợp theo khu vực và thời
              gian.
            </Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/quote-request" as any)}
            >
              <Text style={styles.primaryButtonText}>Tạo yêu cầu mới</Text>
            </Pressable>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sử gần đây</Text>
            <Pressable onPress={() => router.push("/profile/history" as any)}>
              <Text style={styles.sectionLink}>Xem tất cả</Text>
            </Pressable>
          </View>

          {history.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyIconWrap}>
                <Ionicons name={item.icon} size={18} color="#C4B5FD" />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <Text style={styles.historySubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#64748B" />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 14,
    marginBottom: 6,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.15)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.3)",
  },
  filterChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#60A5FA",
  },
  filterChipText: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#EFF6FF",
  },
  emptyCard: {
    backgroundColor: "rgba(15,23,42,0.8)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.25)",
    padding: 18,
    gap: 10,
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(37,99,235,0.25)",
  },
  emptyTitle: {
    color: "#F8FAFC",
    fontWeight: "700",
    fontSize: 18,
  },
  emptyDescription: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
  },
  sectionHeader: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionLink: {
    color: "#60A5FA",
    fontSize: 13,
    fontWeight: "600",
  },
  historyCard: {
    backgroundColor: "rgba(30,41,59,0.72)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  historyIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(76,29,149,0.35)",
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    color: "#E2E8F0",
    fontWeight: "700",
    fontSize: 14,
  },
  historySubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
});
