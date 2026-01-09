/**
 * Photo Analysis Card Component
 * Displays analysis results with progress percentage and issues
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { getConfidenceColor, getSeverityColor } from '@/services/ai';
import type { DetectedIssue, ProgressAnalysisResult } from '@/types/ai';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface PhotoAnalysisCardProps {
  result: ProgressAnalysisResult;
}

export function PhotoAnalysisCard({ result }: PhotoAnalysisCardProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>
          Kết quả phân tích
        </Text>
        <Text style={styles.subtitle}>
          {new Date(result.analyzedAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {/* Progress Percentage */}
      <View style={styles.progressSection}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercentage}>
            {Math.round(result.progressPercentage || result.completionPercentage)}%
          </Text>
          <Text style={styles.progressLabel}>Hoàn thành</Text>
        </View>
        <View style={styles.progressDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="checkmark-circle" size={20} color="#0066CC" />
            <Text style={[styles.detailText, { color: textColor }]}>
              Tiến độ: {result.completedTasks || 0}/{result.totalTasks || result.tasks.length} công việc
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="information-circle"
              size={20}
              color={getConfidenceColor(result.confidenceScore || 0.8)}
            />
            <Text style={[styles.detailText, { color: textColor }]}>
              Độ tin cậy: {Math.round((result.confidenceScore || 0.8) * 100)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Tóm tắt
        </Text>
        <Text style={[styles.summaryText, { color: textColor }]}>
          {result.summary || 'Phân tích tiến độ công trình'}
        </Text>
      </View>

      {/* Detected Issues */}
      {(result.detectedIssues || result.issues) && (result.detectedIssues || result.issues).length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Vấn đề phát hiện ({(result.detectedIssues || result.issues).length})
          </Text>
          {(result.detectedIssues || result.issues).map((issue, index) => (
            <IssueCard key={index} issue={issue} />
          ))}
        </View>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Khuyến nghị
          </Text>
          {result.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="bulb-outline" size={18} color="#0066CC" />
              <Text style={[styles.recommendationText, { color: textColor }]}>
                {rec}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function IssueCard({ issue }: { issue: DetectedIssue }) {
  const severityColor = getSeverityColor(issue.severity);
  const severityLabels: Record<string, string> = {
    CRITICAL: 'Nghiêm trọng',
    HIGH: 'Cao',
    MEDIUM: 'Trung bình',
    LOW: 'Thấp',
    INFO: 'Thông tin',
  };

  return (
    <View style={[styles.issueCard, { borderLeftColor: severityColor }]}>
      <View style={styles.issueHeader}>
        <Text style={styles.issueTitle}>{issue.title || issue.type}</Text>
        <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
          <Text style={styles.severityText}>
            {severityLabels[issue.severity] || issue.severity}
          </Text>
        </View>
      </View>
      <Text style={styles.issueDescription}>{issue.description}</Text>
      {issue.location && (
        <Text style={styles.issueLocation}>Vị trí: {issue.location}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#0066CC',
  },
  progressPercentage: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0066CC',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  progressDetails: {
    flex: 1,
    marginLeft: 20,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  section: {
    marginBottom: 24,
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
  issueCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: '#333',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  issueDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  issueLocation: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
    paddingLeft: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
