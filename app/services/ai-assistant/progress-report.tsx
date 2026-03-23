/**
 * AI Progress Report Viewer
 * View detailed AI-generated reports
 */

import { useAIReports } from "@/hooks/useAI";
import { useDS } from "@/hooks/useDS";
import type { ReportSection } from "@/types/ai";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProgressReportScreen() {
  const params = useLocalSearchParams<{ reportId: string }>();
  const { colors, spacing, radius } = useDS();

  const { selectedReport, loading, error, loadReportById } = useAIReports();

  useEffect(() => {
    if (params.reportId) {
      loadReportById(params.reportId);
    }
  }, [params.reportId]);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Đang tải báo cáo...
        </Text>
      </View>
    );
  }

  if (error || !selectedReport) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Không thể tải báo cáo
        </Text>
        <Text style={styles.errorText}>{error || "Báo cáo không tồn tại"}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Báo cáo AI",
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* Report Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {selectedReport.title}
          </Text>
          <Text style={styles.date}>
            {new Date(selectedReport.generatedAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons
              name="analytics-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.metaText}>{selectedReport.reportType}</Text>
          </View>
        </View>

        {/* Executive Summary */}
        {selectedReport.summary && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Tóm tắt điều hành
            </Text>
            <Text style={[styles.summaryText, { color: colors.text }]}>
              {selectedReport.summary}
            </Text>
          </View>
        )}

        {/* Report Sections */}
        {selectedReport.sections && selectedReport.sections.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Nội dung chi tiết
            </Text>
            {selectedReport.sections.map((section, index) => (
              <ReportSectionCard key={index} section={section} />
            ))}
          </View>
        )}

        {/* Metadata */}
        <View style={styles.metadata}>
          <Text style={styles.metadataLabel}>Thông tin báo cáo</Text>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataKey}>Dự án:</Text>
            <Text style={[styles.metadataValue, { color: colors.text }]}>
              {selectedReport.projectId}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataKey}>Loại báo cáo:</Text>
            <Text style={[styles.metadataValue, { color: colors.text }]}>
              {selectedReport.reportType}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataKey}>Ngày tạo:</Text>
            <Text style={[styles.metadataValue, { color: colors.text }]}>
              {new Date(selectedReport.generatedAt).toLocaleString("vi-VN")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function ReportSectionCard({ section }: { section: ReportSection }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionCardTitle}>{section.title}</Text>
      <Text style={styles.sectionCardContent}>{section.content}</Text>

      {/* Charts if available */}
      {section.charts && section.charts.length > 0 && (
        <View style={styles.chartsContainer}>
          <Text style={styles.chartsLabel}>Biểu đồ:</Text>
          {section.charts.map((chart, idx) => (
            <View key={idx} style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart-outline" size={32} color="#9CA3AF" />
              <Text style={styles.chartLabel}>{chart.title}</Text>
              <Text style={styles.chartType}>{chart.type}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center" as const,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
    textTransform: "uppercase" as const,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
  },
  sectionCardContent: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  chartsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  chartsLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 12,
  },
  chartPlaceholder: {
    alignItems: "center" as const,
    padding: 24,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed" as const,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
    marginTop: 8,
  },
  chartType: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  metadata: {
    padding: 16,
    backgroundColor: "#F3F4F6",
    marginTop: 16,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#9CA3AF",
    textTransform: "uppercase" as const,
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 8,
  },
  metadataKey: {
    fontSize: 14,
    color: "#6B7280",
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
};
