/**
 * AI Analysis History Screen
 * View past AI analyses with filtering
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useAIReports } from '@/hooks/useAI';
import type { AIReport } from '@/types/ai';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AIHistoryScreen() {
  const params = useLocalSearchParams<{ projectId: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const [filter, setFilter] = useState<string | undefined>();
  const { reports, loading, error, pagination, loadReports } = useAIReports(
    params.projectId
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
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        Chưa có báo cáo
      </Text>
      <Text style={styles.emptyText}>
        Các báo cáo AI sẽ xuất hiện ở đây
      </Text>
    </View>
  );

  const renderReport = ({ item }: { item: AIReport }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => handleReportPress(item.id)}
    >
      <View style={styles.reportHeader}>
        <Text style={[styles.reportTitle, { color: textColor }]}>
          {item.title}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>

      <Text style={styles.reportSummary} numberOfLines={2}>
        {item.summary}
      </Text>

      <View style={styles.reportFooter}>
        <View style={styles.reportMeta}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.reportMetaText}>
            {new Date(item.generatedAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: tintColor + '20' }]}>
          <Text style={[styles.typeBadgeText, { color: tintColor }]}>
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
          title: 'Lịch sử phân tích AI',
        }}
      />
      <View style={[styles.container, { backgroundColor }]}>
        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              !filter && { backgroundColor: tintColor },
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
              filter === 'progress' && { backgroundColor: tintColor },
            ]}
            onPress={() => handleFilterChange('progress')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'progress' && styles.filterChipTextActive,
              ]}
            >
              Tiến độ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === 'quality' && { backgroundColor: tintColor },
            ]}
            onPress={() => handleFilterChange('quality')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'quality' && styles.filterChipTextActive,
              ]}
            >
              Chất lượng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === 'safety' && { backgroundColor: tintColor },
            ]}
            onPress={() => handleFilterChange('safety')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'safety' && styles.filterChipTextActive,
              ]}
            >
              An toàn
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reports List */}
        {loading && reports.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  reportSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportMetaText: {
    fontSize: 13,
    color: '#666',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paginationContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 13,
    color: '#666',
  },
});
