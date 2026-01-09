import { useAIReports } from '@/hooks/useAI';
import { formatDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface QuickReportsViewerProps {
  projectId: string;
  maxItems?: number;
}

export default function QuickReportsViewer({
  projectId,
  maxItems = 5,
}: QuickReportsViewerProps) {
  const { reports, loading, error, loadReports } = useAIReports();

  React.useEffect(() => {
    if (projectId) {
      loadReports(projectId);
    }
  }, [projectId]);

  const handleViewReport = (reportId: string) => {
    router.push(`/services/ai-assistant/progress-report?reportId=${reportId}`);
  };

  const handleViewAll = () => {
    router.push(`/services/ai-assistant/history?projectId=${projectId}`);
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'PROGRESS':
        return '#3b82f6';
      case 'QUALITY':
        return '#0066CC';
      case 'SAFETY':
        return '#0066CC';
      default:
        return '#6b7280';
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'PROGRESS':
        return 'Tiến độ';
      case 'QUALITY':
        return 'Chất lượng';
      case 'SAFETY':
        return 'An toàn';
      default:
        return type;
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'PROGRESS':
        return 'bar-chart';
      case 'QUALITY':
        return 'checkmark-circle';
      case 'SAFETY':
        return 'shield-checkmark';
      default:
        return 'document';
    }
  };

  const displayReports = reports.slice(0, maxItems);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Báo cáo AI gần đây</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Báo cáo AI gần đây</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={40} color="#000000" />
          <Text style={styles.errorText}>Lỗi tải báo cáo</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadReports(projectId)}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Báo cáo AI gần đây</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>Chưa có báo cáo nào</Text>
          <Text style={styles.emptySubtext}>
            Phân tích ảnh để tạo báo cáo đầu tiên
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Báo cáo AI gần đây</Text>
        {reports.length > maxItems && (
          <TouchableOpacity onPress={handleViewAll}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={displayReports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.reportCard}
            onPress={() => handleViewReport(item.id)}
          >
            <View style={styles.reportIconContainer}>
              <View
                style={[
                  styles.reportIconBg,
                  { backgroundColor: `${getReportTypeColor(item.reportType)}20` },
                ]}
              >
                <Ionicons
                  name={getReportTypeIcon(item.reportType) as any}
                  size={20}
                  color={getReportTypeColor(item.reportType)}
                />
              </View>
            </View>

            <View style={styles.reportContent}>
              <View style={styles.reportTitleRow}>
                <Text style={styles.reportTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: getReportTypeColor(item.reportType) },
                  ]}
                >
                  <Text style={styles.typeBadgeText}>
                    {getReportTypeLabel(item.reportType)}
                  </Text>
                </View>
              </View>

              {item.summary && (
                <Text style={styles.reportSummary} numberOfLines={2}>
                  {item.summary}
                </Text>
              )}

              <View style={styles.reportFooter}>
                <Ionicons name="time-outline" size={14} color="#9ca3af" />
                <Text style={styles.reportDate}>
                  {formatDate(item.generatedAt)}
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
        )}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  reportIconContainer: {
    marginRight: 12,
  },
  reportIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportContent: {
    flex: 1,
  },
  reportTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  reportSummary: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 4,
  },
  reportFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginLeft: 4,
  },
});
