import { Container } from '@/components/ui/container';
import { Colors } from '@/constants/theme';
import { aiService, ProgressReportResponse } from '@/services/aiService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type ReportType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export default function GenerateReportScreen() {
  const [reportType, setReportType] = useState<ReportType>('DAILY');
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<ProgressReportResponse | null>(null);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await aiService.generateProgressReport({
        projectId: 1, // Replace with actual project ID
        reportType,
        includeImages: true,
      });
      setReport(response);
    } catch (error) {
      console.error('Generate report error:', error);
      alert('Có lỗi xảy ra khi tạo báo cáo');
    } finally {
      setGenerating(false);
    }
  };

  const getReportTypeLabel = (type: ReportType) => {
    switch (type) {
      case 'DAILY':
        return 'Ngày';
      case 'WEEKLY':
        return 'Tuần';
      case 'MONTHLY':
        return 'Tháng';
    }
  };

  const getProgressColor = (progress: number | undefined) => {
    const p = progress ?? 0;
    if (p >= 80) return '#0D9488';
    if (p >= 50) return '#0D9488';
    return '#0D9488';
  };

  return (
    <Container fullWidth>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo báo cáo tiến độ</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="document-text" size={32} color={Colors.light.primary} />
          </View>
          <Text style={styles.infoTitle}>AI tạo báo cáo tự động</Text>
          <Text style={styles.infoDesc}>
            Hệ thống AI sẽ phân tích tiến độ, so sánh kế hoạch và tự động tạo báo cáo chi tiết với biểu đồ, ảnh và khuyến nghị
          </Text>
        </View>

        {/* Report Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Loại báo cáo</Text>
          <View style={styles.typeButtons}>
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as ReportType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  reportType === type && styles.typeButtonActive,
                ]}
                onPress={() => setReportType(type)}
              >
                <Ionicons
                  name={
                    type === 'DAILY'
                      ? 'today'
                      : type === 'WEEKLY'
                      ? 'calendar'
                      : 'calendar-outline'
                  }
                  size={24}
                  color={reportType === type ? '#fff' : Colors.light.primary}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    reportType === type && styles.typeButtonTextActive,
                  ]}
                >
                  Báo cáo {getReportTypeLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        {!report && (
          <TouchableOpacity
            style={[styles.generateButton, generating && styles.generateButtonDisabled]}
            onPress={generateReport}
            disabled={generating}
          >
            {generating ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.generateButtonText}>Đang tạo báo cáo...</Text>
              </>
            ) : (
              <>
                <Ionicons name="flash" size={20} color="#fff" />
                <Text style={styles.generateButtonText}>Tạo báo cáo</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Report Result */}
        {report && (
          <View style={styles.reportSection}>
            {/* Progress Overview */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="trending-up" size={20} color={Colors.light.primary} />
                <Text style={styles.cardTitle}>Tổng quan tiến độ</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${report.progress ?? 0}%`,
                        backgroundColor: getProgressColor(report.progress),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{report.progress ?? 0}%</Text>
              </View>
              <Text style={styles.progressLabel}>Hoàn thành dự án</Text>
            </View>

            {/* Summary */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="document-text" size={20} color={Colors.light.primary} />
                <Text style={styles.cardTitle}>Tóm tắt</Text>
              </View>
              <Text style={styles.summaryText}>{report.summary}</Text>
            </View>

            {/* Highlights */}
            {report.highlights && report.highlights.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="star" size={20} color="#0D9488" />
                  <Text style={styles.cardTitle}>Điểm nổi bật</Text>
                </View>
                {report.highlights.map((highlight: string, index: number) => (
                  <View key={index} style={styles.highlightItem}>
                    <View style={styles.highlightDot} />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Issues */}
            {report.issues && report.issues.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="alert-circle" size={20} color="#000000" />
                  <Text style={styles.cardTitle}>Vấn đề cần giải quyết</Text>
                </View>
                {report.issues.map((issue: string, index: number) => (
                  <View key={index} style={styles.issueItem}>
                    <Ionicons name="warning" size={18} color="#000000" />
                    <Text style={styles.issueText}>{issue}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Next Steps */}
            {report.nextSteps && report.nextSteps.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="footsteps" size={20} color="#0D9488" />
                  <Text style={styles.cardTitle}>Bước tiếp theo</Text>
                </View>
                {report.nextSteps.map((step: string, index: number) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recommendations */}
            {report.recommendations && report.recommendations.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="bulb" size={20} color="#666666" />
                  <Text style={styles.cardTitle}>Khuyến nghị từ AI</Text>
                </View>
                {report.recommendations.map((rec: string, index: number) => (
                  <View key={index} style={styles.recItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#0D9488" />
                    <Text style={styles.recText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="download" size={20} color={Colors.light.primary} />
                <Text style={styles.actionText}>Tải PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-social" size={20} color={Colors.light.primary} />
                <Text style={styles.actionText}>Chia sẻ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryActionButton]}
                onPress={() => setReport(null)}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={[styles.actionText, styles.primaryActionText]}>
                  Tạo báo cáo mới
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  infoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  typeButtons: {
    gap: 12,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  typeButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  reportSection: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    minWidth: 50,
  },
  progressLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  highlightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D9488',
    marginTop: 6,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  issueText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 2,
  },
  recItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  recText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  primaryActionButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  primaryActionText: {
    color: '#fff',
  },
});
