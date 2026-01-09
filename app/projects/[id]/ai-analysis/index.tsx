import { Container } from '@/components/ui/container';
import { useAIReports } from '@/hooks/useAI';
import { formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ProjectAIAnalysisScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { reports, loading, error, loadReports } = useAIReports();

  React.useEffect(() => {
    if (projectId) {
      loadReports(projectId);
    }
  }, [projectId]);

  const handleQuickAnalyze = () => {
    router.push('/services/ai-assistant/photo-analysis');
  };

  const handleViewAllReports = () => {
    router.push(`/services/ai-assistant/history?projectId=${projectId}`);
  };

  const handleViewReport = (reportId: string) => {
    router.push(`/services/ai-assistant/progress-report?reportId=${reportId}`);
  };

  const handleChatWithAI = () => {
    router.push('/services/ai-assistant' as any);
  };

  const handleErrorDetection = () => {
    router.push('/services/ai-assistant/error-detection' as any);
  };

  const handleMaterialEstimation = () => {
    router.push(`/services/ai-assistant/material-estimation?projectId=${projectId}`);
  };

  const recentReports = reports.slice(0, 3);

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

  return (
    <Container>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Trợ lý AI</Text>
          <Text style={styles.subtitle}>
            Phân tích thông minh cho dự án của bạn
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hành động nhanh</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: '#3b82f6' }]}
              onPress={handleQuickAnalyze}
            >
              <Ionicons name="camera-outline" size={32} color="#fff" />
              <Text style={styles.quickActionTitle}>Phân tích ảnh</Text>
              <Text style={styles.quickActionSubtitle}>
                Upload ảnh công trình
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: '#0066CC' }]}
              onPress={handleChatWithAI}
            >
              <Ionicons name="chatbubbles-outline" size={32} color="#fff" />
              <Text style={styles.quickActionTitle}>Chat với AI</Text>
              <Text style={styles.quickActionSubtitle}>
                Hỏi về dự án
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: '#0066CC' }]}
              onPress={handleErrorDetection}
            >
              <Ionicons name="warning-outline" size={32} color="#fff" />
              <Text style={styles.quickActionTitle}>Phát hiện lỗi</Text>
              <Text style={styles.quickActionSubtitle}>
                Kiểm tra chất lượng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: '#666666' }]}
              onPress={handleMaterialEstimation}
            >
              <Ionicons name="calculator-outline" size={32} color="#fff" />
              <Text style={styles.quickActionTitle}>Ước tính VL</Text>
              <Text style={styles.quickActionSubtitle}>
                Tính vật liệu
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Insights Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin AI</Text>
          <View style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Ionicons name="bulb" size={24} color="#0066CC" />
              <Text style={styles.insightsTitle}>
                Phân tích từ GPT-4 Vision
              </Text>
            </View>
            <Text style={styles.insightsText}>
              AI có thể giúp bạn phân tích tiến độ, phát hiện lỗi thi công, ước
              tính vật liệu và đưa ra khuyến nghị để cải thiện chất lượng công
              trình.
            </Text>
            <View style={styles.insightsStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{reports.length}</Text>
                <Text style={styles.statLabel}>Báo cáo</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {
                    reports.filter((r) => r.reportType === 'PROGRESS')
                      .length
                  }
                </Text>
                <Text style={styles.statLabel}>Tiến độ</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {
                    reports.filter((r) => r.reportType === 'QUALITY')
                      .length
                  }
                </Text>
                <Text style={styles.statLabel}>Chất lượng</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Reports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Báo cáo gần đây</Text>
            <TouchableOpacity onPress={handleViewAllReports}>
              <Text style={styles.viewAllButton}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.emptyState}>
              <Ionicons name="refresh-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>Đang tải báo cáo...</Text>
            </View>
          )}

          {error && (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={48} color="#000000" />
              <Text style={styles.emptyText}>Lỗi tải báo cáo</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => loadReports(projectId!)}
              >
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && recentReports.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>
                Chưa có báo cáo AI nào
              </Text>
              <Text style={styles.emptySubtext}>
                Bắt đầu bằng cách phân tích ảnh công trình
              </Text>
            </View>
          )}

          {!loading &&
            !error &&
            recentReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.reportCard}
                onPress={() => handleViewReport(report.id)}
              >
                <View style={styles.reportHeader}>
                  <View style={styles.reportTitleRow}>
                    <Text style={styles.reportTitle} numberOfLines={1}>
                      {report.title}
                    </Text>
                    <View
                      style={[
                        styles.reportTypeBadge,
                        {
                          backgroundColor: getReportTypeColor(
                            report.reportType
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.reportTypeBadgeText}>
                        {getReportTypeLabel(report.reportType)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reportDate}>
                    {formatDate(report.generatedAt)}
                  </Text>
                </View>
                {report.summary && (
                  <Text style={styles.reportSummary} numberOfLines={2}>
                    {report.summary}
                  </Text>
                )}
                <View style={styles.reportFooter}>
                  <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
                </View>
              </TouchableOpacity>
            ))}
        </View>

        {/* Features List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tính năng AI</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#0066CC" />
              <Text style={styles.featureText}>
                Phân tích tiến độ công trình tự động
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#0066CC" />
              <Text style={styles.featureText}>
                Phát hiện lỗi thi công qua ảnh
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#0066CC" />
              <Text style={styles.featureText}>
                Ước tính vật liệu cần thiết
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#0066CC" />
              <Text style={styles.featureText}>
                Tư vấn giải pháp kỹ thuật
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#0066CC" />
              <Text style={styles.featureText}>
                Đánh giá chất lượng công trình
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  viewAllButton: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickActionCard: {
    width: '47%',
    margin: '1.5%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  insightsCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 8,
  },
  insightsText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
    marginBottom: 16,
  },
  insightsStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400e',
  },
  statLabel: {
    fontSize: 12,
    color: '#78350f',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#fbbf24',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reportHeader: {
    marginBottom: 8,
  },
  reportTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  reportTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reportTypeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  reportDate: {
    fontSize: 13,
    color: '#6b7280',
  },
  reportSummary: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  reportFooter: {
    alignItems: 'flex-end',
  },
  featuresList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 12,
    flex: 1,
  },
});
