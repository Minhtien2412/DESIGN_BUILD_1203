/**
 * Risk Management Dashboard
 * Track and manage project risks with likelihood/impact matrix
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

type RiskCategory = 'SAFETY' | 'SCHEDULE' | 'COST' | 'QUALITY' | 'LEGAL' | 'ENVIRONMENTAL';
type RiskLikelihood = 'RARE' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'ALMOST_CERTAIN';
type RiskImpact = 'NEGLIGIBLE' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'CATASTROPHIC';
type RiskStatus = 'IDENTIFIED' | 'ANALYZING' | 'PLANNED' | 'MITIGATING' | 'MONITORING' | 'CLOSED';

interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  riskScore: number;
  status: RiskStatus;
  owner: { id: string; name: string };
  identifiedDate: string;
  mitigations?: {
    id: string;
    action: string;
    responsible: string;
    deadline: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }[];
}

const CATEGORY_CONFIG: Record<RiskCategory, { label: string; icon: string; color: string }> = {
  SAFETY: { label: 'An toàn', icon: 'shield-checkmark', color: '#000000' },
  SCHEDULE: { label: 'Tiến độ', icon: 'time', color: '#0066CC' },
  COST: { label: 'Chi phí', icon: 'cash', color: '#0066CC' },
  QUALITY: { label: 'Chất lượng', icon: 'star', color: '#3B82F6' },
  LEGAL: { label: 'Pháp lý', icon: 'document-text', color: '#666666' },
  ENVIRONMENTAL: { label: 'Môi trường', icon: 'leaf', color: '#0066CC' },
};

const LIKELIHOOD_VALUES: Record<RiskLikelihood, number> = {
  RARE: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  ALMOST_CERTAIN: 5,
};

const IMPACT_VALUES: Record<RiskImpact, number> = {
  NEGLIGIBLE: 1,
  MINOR: 2,
  MODERATE: 3,
  MAJOR: 4,
  CATASTROPHIC: 5,
};

const getRiskLevel = (score: number): { label: string; color: string } => {
  if (score >= 15) return { label: 'Cực cao', color: '#000000' };
  if (score >= 10) return { label: 'Cao', color: '#EA580C' };
  if (score >= 6) return { label: 'Trung bình', color: '#0066CC' };
  if (score >= 3) return { label: 'Thấp', color: '#0066CC' };
  return { label: 'Rất thấp', color: '#6B7280' };
};

export default function RiskManagementScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');

  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RiskCategory | 'ALL'>('ALL');

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockRisks: Risk[] = [
        {
          id: '1',
          title: 'Mưa lớn kéo dài ảnh hưởng đến đổ bê tông',
          description: 'Dự báo mưa liên tục trong tuần tới có thể trì hoãn công việc đổ móng',
          category: 'SCHEDULE',
          likelihood: 'LIKELY',
          impact: 'MAJOR',
          riskScore: 16,
          status: 'MITIGATING',
          owner: { id: '1', name: 'Nguyễn Văn A' },
          identifiedDate: new Date().toISOString(),
          mitigations: [
            {
              id: '1',
              action: 'Chuẩn bị kế hoạch dự phòng với nhà thầu',
              responsible: 'Trần Thị B',
              deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
              status: 'IN_PROGRESS',
            },
          ],
        },
        {
          id: '2',
          title: 'Thiếu nhân công có tay nghề',
          description: 'Khó tuyển thợ điện và thợ hàn có kinh nghiệm',
          category: 'SCHEDULE',
          likelihood: 'POSSIBLE',
          impact: 'MODERATE',
          riskScore: 9,
          status: 'PLANNED',
          owner: { id: '2', name: 'Lê Văn C' },
          identifiedDate: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          id: '3',
          title: 'Giá thép tăng cao',
          description: 'Giá thép tăng 15% so với dự toán ban đầu',
          category: 'COST',
          likelihood: 'ALMOST_CERTAIN',
          impact: 'MAJOR',
          riskScore: 20,
          status: 'ANALYZING',
          owner: { id: '3', name: 'Phạm Thị D' },
          identifiedDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: '4',
          title: 'Làm việc trên cao không đúng quy định',
          description: 'Một số công nhân chưa được tập huấn đầy đủ về an toàn',
          category: 'SAFETY',
          likelihood: 'UNLIKELY',
          impact: 'CATASTROPHIC',
          riskScore: 10,
          status: 'MITIGATING',
          owner: { id: '4', name: 'Hoàng Văn E' },
          identifiedDate: new Date(Date.now() - 86400000 * 10).toISOString(),
          mitigations: [
            {
              id: '2',
              action: 'Tổ chức khóa đào tạo an toàn lao động',
              responsible: 'Nguyễn Văn F',
              deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
              status: 'PENDING',
            },
            {
              id: '3',
              action: 'Kiểm tra dây đai an toàn hàng ngày',
              responsible: 'Trần Thị G',
              deadline: new Date(Date.now() + 86400000).toISOString(),
              status: 'COMPLETED',
            },
          ],
        },
      ];

      setRisks(mockRisks);
    } catch (error: any) {
      console.error('Load risks failed:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách rủi ro');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRisks();
    setRefreshing(false);
  };

  const filteredRisks =
    selectedCategory === 'ALL' ? risks : risks.filter(r => r.category === selectedCategory);

  const riskStats = {
    total: risks.length,
    critical: risks.filter(r => r.riskScore >= 15).length,
    high: risks.filter(r => r.riskScore >= 10 && r.riskScore < 15).length,
    medium: risks.filter(r => r.riskScore >= 6 && r.riskScore < 10).length,
    low: risks.filter(r => r.riskScore < 6).length,
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: text }]}>Quản lý rủi ro</Text>
        <Pressable
          onPress={() => router.push(`/projects/${projectId}/create-risk` as any)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={primary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primary} />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: surface, borderColor: border }]}>
              <Text style={[styles.statValue, { color: text }]}>{riskStats.total}</Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>Tổng số</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#00000010', borderColor: '#000000' }]}>
              <Text style={[styles.statValue, { color: '#000000' }]}>{riskStats.critical}</Text>
              <Text style={[styles.statLabel, { color: '#000000' }]}>Cực cao</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#EA580C10', borderColor: '#EA580C' }]}>
              <Text style={[styles.statValue, { color: '#EA580C' }]}>{riskStats.high}</Text>
              <Text style={[styles.statLabel, { color: '#EA580C' }]}>Cao</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#0066CC10', borderColor: '#0066CC' }]}>
              <Text style={[styles.statValue, { color: '#0066CC' }]}>{riskStats.medium}</Text>
              <Text style={[styles.statLabel, { color: '#0066CC' }]}>Trung bình</Text>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <Pressable
            style={[
              styles.filterChip,
              { borderColor: border },
              selectedCategory === 'ALL' && { backgroundColor: primary, borderColor: primary },
            ]}
            onPress={() => setSelectedCategory('ALL')}
          >
            <Text
              style={[
                styles.filterText,
                { color: selectedCategory === 'ALL' ? '#fff' : text },
              ]}
            >
              Tất cả ({risks.length})
            </Text>
          </Pressable>
          {(Object.keys(CATEGORY_CONFIG) as RiskCategory[]).map(cat => {
            const count = risks.filter(r => r.category === cat).length;
            const config = CATEGORY_CONFIG[cat];
            return (
              <Pressable
                key={cat}
                style={[
                  styles.filterChip,
                  { borderColor: border },
                  selectedCategory === cat && {
                    backgroundColor: config.color,
                    borderColor: config.color,
                  },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Ionicons
                  name={config.icon as any}
                  size={16}
                  color={selectedCategory === cat ? '#fff' : config.color}
                />
                <Text
                  style={[
                    styles.filterText,
                    { color: selectedCategory === cat ? '#fff' : text },
                  ]}
                >
                  {config.label} ({count})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Risk List */}
        <View style={styles.riskList}>
          {filteredRisks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark-outline" size={64} color={textMuted} />
              <Text style={[styles.emptyText, { color: textMuted }]}>Không có rủi ro nào</Text>
            </View>
          ) : (
            filteredRisks.map(risk => {
              const riskLevel = getRiskLevel(risk.riskScore);
              const categoryConfig = CATEGORY_CONFIG[risk.category];
              return (
                <Pressable
                  key={risk.id}
                  style={[styles.riskCard, { backgroundColor: surface, borderColor: border }]}
                  onPress={() => router.push(`/projects/${projectId}/risks/${risk.id}` as any)}
                >
                  {/* Risk Score Badge */}
                  <View
                    style={[
                      styles.scoreStripe,
                      { backgroundColor: riskLevel.color },
                    ]}
                  />
                  <View style={styles.riskContent}>
                    {/* Header */}
                    <View style={styles.riskHeader}>
                      <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color + '20' }]}>
                        <Ionicons name={categoryConfig.icon as any} size={14} color={categoryConfig.color} />
                        <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
                          {categoryConfig.label}
                        </Text>
                      </View>
                      <View style={[styles.scoreBadge, { backgroundColor: riskLevel.color + '20' }]}>
                        <Text style={[styles.scoreText, { color: riskLevel.color }]}>
                          {risk.riskScore}
                        </Text>
                      </View>
                    </View>

                    {/* Title */}
                    <Text style={[styles.riskTitle, { color: text }]} numberOfLines={2}>
                      {risk.title}
                    </Text>

                    {/* Description */}
                    <Text style={[styles.riskDescription, { color: textMuted }]} numberOfLines={2}>
                      {risk.description}
                    </Text>

                    {/* Meta */}
                    <View style={styles.riskMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="person-outline" size={14} color={textMuted} />
                        <Text style={[styles.metaText, { color: textMuted }]}>
                          {risk.owner.name}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={14} color={textMuted} />
                        <Text style={[styles.metaText, { color: textMuted }]}>
                          {new Date(risk.identifiedDate).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                    </View>

                    {/* Mitigations Count */}
                    {risk.mitigations && risk.mitigations.length > 0 && (
                      <View style={styles.mitigationCount}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={primary} />
                        <Text style={[styles.mitigationText, { color: primary }]}>
                          {risk.mitigations.filter(m => m.status === 'COMPLETED').length}/{risk.mitigations.length} biện pháp đã hoàn thành
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        {/* Risk Matrix Link */}
        <Pressable
          style={[styles.matrixButton, { backgroundColor: surface, borderColor: border }]}
          onPress={() => router.push(`/projects/${projectId}/risk-matrix` as any)}
        >
          <View style={styles.matrixContent}>
            <View style={[styles.matrixIcon, { backgroundColor: primary + '20' }]}>
              <Ionicons name="grid-outline" size={24} color={primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.matrixTitle, { color: text }]}>Ma trận rủi ro</Text>
              <Text style={[styles.matrixSubtitle, { color: textMuted }]}>
                Xem ma trận khả năng xảy ra / tác động
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={textMuted} />
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  addButton: {
    padding: 4,
  },
  statsSection: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  riskList: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  riskCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  scoreStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  riskContent: {
    padding: 16,
    paddingLeft: 20,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 6,
  },
  riskDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  riskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  mitigationCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  mitigationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  matrixButton: {
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  matrixContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  matrixIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matrixTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  matrixSubtitle: {
    fontSize: 13,
  },
});
