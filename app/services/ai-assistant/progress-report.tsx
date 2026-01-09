/**
 * AI Progress Report Viewer
 * View detailed AI-generated reports
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useAIReports } from '@/hooks/useAI';
import type { ReportSection } from '@/types/ai';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProgressReportScreen() {
  const params = useLocalSearchParams<{ reportId: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const { selectedReport, loading, error, loadReportById } = useAIReports();

  useEffect(() => {
    if (params.reportId) {
      loadReportById(params.reportId);
    }
  }, [params.reportId]);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Đang tải báo cáo...
        </Text>
      </View>
    );
  }

  if (error || !selectedReport) {
    return (
      <View style={[styles.centerContainer, { backgroundColor }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#000000" />
        <Text style={[styles.errorTitle, { color: textColor }]}>
          Không thể tải báo cáo
        </Text>
        <Text style={styles.errorText}>{error || 'Báo cáo không tồn tại'}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: tintColor }]}
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
          title: 'Báo cáo AI',
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor }]}>
        {/* Report Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>
            {selectedReport.title}
          </Text>
          <Text style={styles.date}>
            {new Date(selectedReport.generatedAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="analytics-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{selectedReport.reportType}</Text>
          </View>
        </View>

        {/* Executive Summary */}
        {selectedReport.summary && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Tóm tắt điều hành
            </Text>
            <Text style={[styles.summaryText, { color: textColor }]}>
              {selectedReport.summary}
            </Text>
          </View>
        )}

        {/* Report Sections */}
        {selectedReport.sections && selectedReport.sections.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
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
            <Text style={[styles.metadataValue, { color: textColor }]}>
              {selectedReport.projectId}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataKey}>Loại báo cáo:</Text>
            <Text style={[styles.metadataValue, { color: textColor }]}>
              {selectedReport.reportType}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataKey}>Ngày tạo:</Text>
            <Text style={[styles.metadataValue, { color: textColor }]}>
              {new Date(selectedReport.generatedAt).toLocaleString('vi-VN')}
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
              <Ionicons name="bar-chart-outline" size={32} color="#999" />
              <Text style={styles.chartLabel}>{chart.title}</Text>
              <Text style={styles.chartType}>{chart.type}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    textTransform: 'uppercase',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionCardContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  chartsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  chartsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chartPlaceholder: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 8,
  },
  chartType: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  metadata: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    marginTop: 16,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metadataKey: {
    fontSize: 14,
    color: '#666',
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
