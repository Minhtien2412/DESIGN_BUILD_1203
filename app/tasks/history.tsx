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

interface HistoryTask {
  id: string;
  title: string;
  project: string;
  completedDate: string;
  rating?: number;
}

export default function TaskHistoryScreen() {
  const router = useRouter();
  const colors = useThemeColor();
  const [refreshing, setRefreshing] = useState(false);
  const [tasks] = useState<HistoryTask[]>([]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: fetch task history from API
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderTask = ({ item }: { item: HistoryTask }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/tasks/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.taskTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
      </View>
      <Text style={[styles.project, { color: colors.textSecondary }]}>
        <Ionicons name="business-outline" size={14} /> {item.project}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          <Ionicons name="calendar-outline" size={14} /> {item.completedDate}
        </Text>
        {item.rating != null && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating}/5</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Lịch sử việc</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="time-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Chưa có lịch sử việc
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
  project: { fontSize: 13, marginBottom: 6 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { fontSize: 12 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 12, color: "#F59E0B", fontWeight: "600" },
  empty: { alignItems: "center", marginTop: 80 },
  emptyText: { marginTop: 12, fontSize: 15 },
});
