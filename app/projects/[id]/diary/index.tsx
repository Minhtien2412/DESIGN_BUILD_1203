/**
 * Construction Diary - List View
 * Timeline view của nhật ký công trình
 */

import { MetricCard, TimelineItem } from '@/components/construction';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { DiaryEntry, DiaryService } from '@/services/api/diary.mock';
import { Ionicons } from '@expo/vector-icons';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const WEATHER_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  sunny: 'sunny',
  cloudy: 'cloudy',
  rainy: 'rainy',
  windy: 'cloudy-night',
};

export default function DiaryListScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [projectId, period]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesData, statsData] = await Promise.all([
        DiaryService.getEntriesByProject(projectId),
        DiaryService.getStats(projectId, period),
      ]);

      // Filter by period
      let filtered = entriesData;
      if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = entriesData.filter(e => new Date(e.date) >= weekAgo);
      } else if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = entriesData.filter(e => new Date(e.date) >= monthAgo);
      }

      setEntries(filtered);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load diary:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit',
    });
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading && !refreshing) {
    return (
      <Container fullWidth>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Đang tải nhật ký...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container fullWidth>
      <StatusBar style="dark" />
      
      {/* Header */}
      <Section>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Nhật ký công trình</Text>
            <Text style={styles.subtitle}>{stats?.totalEntries || 0} bản ghi</Text>
          </View>
          <Link href={`/projects/${projectId}/diary/create`} asChild>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add-circle" size={28} color="#0D9488" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Period Filter */}
        <View style={styles.filterContainer}>
          {(['week', 'month', 'all'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.filterButton, period === p && styles.filterButtonActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.filterText, period === p && styles.filterTextActive]}>
                {p === 'week' ? '7 ngày' : p === 'month' ? '30 ngày' : 'Tất cả'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Section>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Stats Cards */}
        {stats && (
          <Section>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
              <MetricCard
                icon="people"
                label="Nhân công TB"
                value={stats.avgDailyWorkforce}
                subtitle="người/ngày"
                gradientColors={['#0D9488', '#0D9488']}
                style={styles.statCard}
              />
              <MetricCard
                icon="images"
                label="Tổng ảnh"
                value={stats.totalPhotos}
                subtitle="ảnh"
                gradientColors={['#666666', '#666666']}
                style={styles.statCard}
              />
              <MetricCard
                icon="alert-circle"
                label="Sự cố"
                value={`${stats.resolvedIncidents}/${stats.totalIncidents}`}
                subtitle="đã xử lý"
                gradientColors={['#0D9488', '#d97706']}
                style={styles.statCard}
              />
            </ScrollView>
          </Section>
        )}

        {/* Timeline */}
        <Section>
          <Text style={styles.sectionTitle}>Dòng thời gian</Text>
          
          {entries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Chưa có nhật ký nào</Text>
              <Link href={`/projects/${projectId}/diary/create`} asChild>
                <TouchableOpacity style={styles.emptyButton}>
                  <Text style={styles.emptyButtonText}>Tạo nhật ký đầu tiên</Text>
                </TouchableOpacity>
              </Link>
            </View>
          ) : (
            <View style={styles.timeline}>
              {entries.map((entry, index) => {
                const hasIncidents = entry.incidents.length > 0;
                const unresolved = entry.incidents.filter(i => !i.resolved).length;

                return (
                  <TimelineItem
                    key={entry.id}
                    title={formatFullDate(entry.date)}
                    description={`${entry.workforce.total} nhân công • ${entry.workCompleted.length} công việc • ${entry.photos.length} ảnh${hasIncidents ? ` • ${unresolved} sự cố chưa xử lý` : ''}`}
                    date={formatDate(entry.date)}
                    time={`${entry.weather.temperature || '--'}°C`}
                    status={hasIncidents && unresolved > 0 ? 'failed' : 'completed'}
                    icon={WEATHER_ICONS[entry.weather.condition] || 'sunny'}
                    isFirst={index === 0}
                    isLast={index === entries.length - 1}
                    onPress={() => router.push(`/projects/${projectId}/diary/${entry.id}/edit`)}
                  />
                );
              })}
            </View>
          )}
        </Section>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  addButton: {
    marginLeft: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#0D9488',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  statsRow: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  statCard: {
    width: 160,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  timeline: {
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
