import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TaskStatus = "pending" | "in_progress" | "completed";

interface Task {
  id: string;
  title: string;
  project: string;
  status: TaskStatus;
  dueDate: string;
  priority: "low" | "medium" | "high";
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Chờ xử lý",
  in_progress: "Đang làm",
  completed: "Hoàn thành",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: "#F59E0B",
  in_progress: "#3B82F6",
  completed: "#10B981",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#6B7280",
  medium: "#F59E0B",
  high: "#EF4444",
};

export default function AssignedTasksScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colors = useThemeColor();
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [tasks] = useState<Task[]>([]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: fetch assigned tasks from API
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filtered =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/tasks/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.taskTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: STATUS_COLORS[item.status] },
          ]}
        >
          <Text style={styles.badgeText}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>
      <Text style={[styles.project, { color: colors.textSecondary }]}>
        <Ionicons name="business-outline" size={14} /> {item.project}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={[styles.due, { color: colors.textSecondary }]}>
          <Ionicons name="calendar-outline" size={14} /> {item.dueDate}
        </Text>
        <View
          style={[
            styles.dot,
            { backgroundColor: PRIORITY_COLORS[item.priority] },
          ]}
        />
      </View>
    </TouchableOpacity>
  );

  const filters: Array<TaskStatus | "all"> = [
    "all",
    "pending",
    "in_progress",
    "completed",
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Việc được giao
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === "all" ? "Tất cả" : STATUS_LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="clipboard-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Chưa có việc nào được giao
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: "700" },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  filterActive: { backgroundColor: "#1F2937" },
  filterText: { fontSize: 13, color: "#6B7280" },
  filterTextActive: { color: "#fff" },
  list: { padding: 16, gap: 12 },
  card: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  taskTitle: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  project: { fontSize: 13, marginBottom: 6 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  due: { fontSize: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyText: { marginTop: 12, fontSize: 15 },
});
