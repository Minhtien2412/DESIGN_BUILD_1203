/**
 * AI Analysis History Screen
 * View past AI analyses with filtering
 */

import { useAIReports } from "@/hooks/useAI";
import { useDS } from "@/hooks/useDS";
import type { AIReport } from "@/types/ai";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function AIHistoryScreen() {
  const params = useLocalSearchParams<{ projectId: string }>();
  const { colors, spacing, radius } = useDS();

  const [filter, setFilter] = useState<string | undefined>();
  const { reports, loading, error, pagination, loadReports } = useAIReports(
    params.projectId,
  );

  useEffect(() => {
    if (params.projectId) {
      loadReports(params.projectId, { reportType: filter });
    }
  }, [params.projectId, filter]);

  const handleFilterChange = (reportType: string | undefined) => {
    setFilter(reportType);
  };

  const handleReportPress = (reportId: string) => {
    router.push(`/services/ai-assistant/progress-report?reportId=${reportId}`);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color={colors.border} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Chưa có báo cáo
      </Text>
      <Text style={styles.emptyText}>Các báo cáo AI sẽ xuất hiện ở đây</Text>
    </View>
  );

  const renderReport = ({ item }: { item: AIReport }) => (
    <TouchableOpacity
      style={[styles.reportCard, { backgroundColor: colors.card }]}
      onPress={() => handleReportPress(item.id)}
    >
      <View style={styles.reportHeader}>
        <Text style={[styles.reportTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textTertiary}
        />
      </View>

      <Text style={styles.reportSummary} numberOfLines={2}>
        {item.summary}
      </Text>

      <View style={styles.reportFooter}>
        <View style={styles.reportMeta}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={styles.reportMetaText}>
            {new Date(item.generatedAt).toLocaleDateString("vi-VN")}
          </Text>
        </View>
        <View
          style={[styles.typeBadge, { backgroundColor: colors.primary + "20" }]}
        >
          <Text style={[styles.typeBadgeText, { color: colors.primary }]}>
            {item.reportType}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Lịch sử phân tích AI",
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              !filter && { backgroundColor: colors.primary },
            ]}
            onPress={() => handleFilterChange(undefined)}
          >
            <Text
              style={[
                styles.filterChipText,
                !filter && styles.filterChipTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === "progress" && { backgroundColor: colors.primary },
            ]}
            onPress={() => handleFilterChange("progress")}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === "progress" && styles.filterChipTextActive,
              ]}
            >
              Tiến độ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === "quality" && { backgroundColor: colors.primary },
            ]}
            onPress={() => handleFilterChange("quality")}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === "quality" && styles.filterChipTextActive,
              ]}
            >
              Chất lượng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === "safety" && { backgroundColor: colors.primary },
            ]}
            onPress={() => handleFilterChange("safety")}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === "safety" && styles.filterChipTextActive,
              ]}
            >
              An toàn
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reports List */}
        {loading && reports.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={reports}
            renderItem={renderReport}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Pagination Info */}
        {pagination.total > 0 && (
          <View style={styles.paginationContainer}>
            <Text style={styles.paginationText}>
              Hiển thị {reports.length} / {pagination.total} báo cáo
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row" as const,
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterChipText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
  reportCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    flex: 1,
  },
  reportSummary: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  reportMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  reportMetaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  paginationContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center" as const,
  },
  paginationText: {
    fontSize: 13,
    color: "#6B7280",
  },
};
