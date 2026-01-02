/**
 * Error Detection Screen
 * View AI-detected construction errors with severity levels
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useErrorDetection } from '@/hooks/useAI';
import { getSeverityColor } from '@/services/ai';
import type { DetectedIssue, IssueSeverity } from '@/types/ai';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ErrorDetectionScreen() {
  const params = useLocalSearchParams<{ projectId: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const [selectedIssue, setSelectedIssue] = useState<DetectedIssue | null>(null);
  const { result, loading, error } = useErrorDetection();

  const severityLabels: Record<IssueSeverity, string> = {
    CRITICAL: 'Nghiêm trọng',
    HIGH: 'Cao',
    MEDIUM: 'Trung bình',
    LOW: 'Thấp',
    INFO: 'Thông tin',
  };

  const renderIssue = ({ item }: { item: DetectedIssue }) => {
    const severityColor = getSeverityColor(item.severity);

    return (
      <TouchableOpacity
        style={[styles.issueCard, { borderLeftColor: severityColor }]}
        onPress={() => setSelectedIssue(item)}
      >
        <View style={styles.issueHeader}>
          <View style={styles.issueTitleRow}>
            <Ionicons
              name={
                item.severity === 'CRITICAL' || item.severity === 'HIGH'
                  ? 'warning'
                  : 'alert-circle'
              }
              size={20}
              color={severityColor}
            />
            <Text style={[styles.issueTitle, { color: textColor }]}>
              {item.title || item.type}
            </Text>
          </View>
          <View
            style={[styles.severityBadge, { backgroundColor: severityColor }]}
          >
            <Text style={styles.severityText}>
              {severityLabels[item.severity]}
            </Text>
          </View>
        </View>

        <Text style={styles.issueDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {item.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        )}

        {item.recommendations && item.recommendations.length > 0 && (
          <View style={styles.recommendationPreview}>
            <Ionicons name="bulb-outline" size={14} color="#ff9800" />
            <Text style={styles.recommendationText} numberOfLines={1}>
              {item.recommendations[0]}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="checkmark-circle-outline" size={64} color="#4caf50" />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        Không phát hiện lỗi
      </Text>
      <Text style={styles.emptyText}>
        AI chưa phát hiện vấn đề nào trong dự án
      </Text>
    </View>
  );

  const detectedIssues = result?.detectedIssues || result?.issues || [];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Phát hiện lỗi AI',
        }}
      />
      <View style={[styles.container, { backgroundColor }]}>
        {/* Summary Stats */}
        {detectedIssues.length > 0 && (
          <View style={styles.statsContainer}>
            <StatCard
              icon="alert-circle"
              label="Tổng số"
              value={detectedIssues.length}
              color="#666"
            />
            <StatCard
              icon="warning"
              label="Nghiêm trọng"
              value={
                detectedIssues.filter(
                  (i) => i.severity === 'CRITICAL' || i.severity === 'HIGH'
                ).length
              }
              color="#f44336"
            />
            <StatCard
              icon="information-circle"
              label="Khác"
              value={
                detectedIssues.filter(
                  (i) => i.severity === 'MEDIUM' || i.severity === 'LOW'
                ).length
              }
              color="#ff9800"
            />
          </View>
        )}

        {/* Issues List */}
        <FlatList
          data={detectedIssues}
          renderItem={renderIssue}
          keyExtractor={(item, index) => `issue-${index}`}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
        />

        {/* Issue Detail Modal */}
        <Modal
          visible={!!selectedIssue}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedIssue(null)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor }]}>
              {selectedIssue && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: textColor }]}>
                      Chi tiết vấn đề
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedIssue(null)}>
                      <Ionicons name="close" size={28} color={textColor} />
                    </TouchableOpacity>
                  </View>

                  <View
                    style={[
                      styles.severityBadge,
                      {
                        backgroundColor: getSeverityColor(
                          selectedIssue.severity
                        ),
                        alignSelf: 'flex-start',
                      },
                    ]}
                  >
                    <Text style={styles.severityText}>
                      {severityLabels[selectedIssue.severity]}
                    </Text>
                  </View>

                  <Text style={[styles.detailTitle, { color: textColor }]}>
                    {selectedIssue.title}
                  </Text>
                  <Text style={[styles.detailDescription, { color: textColor }]}>
                    {selectedIssue.description}
                  </Text>

                  {selectedIssue.location && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Vị trí:</Text>
                      <Text style={[styles.detailText, { color: textColor }]}>
                        {selectedIssue.location}
                      </Text>
                    </View>
                  )}

                  {selectedIssue.recommendations &&
                    selectedIssue.recommendations.length > 0 && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Khuyến nghị:</Text>
                        {selectedIssue.recommendations.map((rec, idx) => (
                          <View key={idx} style={styles.recommendationItem}>
                            <Ionicons
                              name="bulb-outline"
                              size={16}
                              color="#ff9800"
                            />
                            <Text
                              style={[
                                styles.recommendationFullText,
                                { color: textColor },
                              ]}
                            >
                              {rec}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  issueCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  issueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
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
    lineHeight: 20,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  recommendationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: '#ff9800',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  detailSection: {
    marginTop: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  recommendationFullText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
