/**
 * Decision Log Screen
 * Track and manage project decisions
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type DecisionCategory = 'DESIGN' | 'TECHNICAL' | 'BUDGET' | 'SCHEDULE' | 'SAFETY' | 'QUALITY' | 'OTHER';
type DecisionImpact = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type DecisionStatus = 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED' | 'REVIEWED';

interface Decision {
  id: string;
  title: string;
  description: string;
  category: DecisionCategory;
  impact: DecisionImpact;
  status: DecisionStatus;
  context: string;
  rationale: string;
  alternatives?: string[];
  decisionMaker: { id: string; name: string; role: string };
  stakeholders: { id: string; name: string; role: string }[];
  dateProposed: string;
  dateDecided?: string;
  dateImplemented?: string;
  relatedRisks?: { id: string; title: string }[];
  relatedDocuments?: { name: string; url: string }[];
  estimatedCost?: number;
  estimatedTime?: number; // days
}

const CATEGORY_CONFIG: Record<DecisionCategory, { label: string; icon: string; color: string }> = {
  DESIGN: { label: 'Thiết kế', icon: 'color-palette', color: '#666666' },
  TECHNICAL: { label: 'Kỹ thuật', icon: 'construct', color: '#0D9488' },
  BUDGET: { label: 'Ngân sách', icon: 'cash', color: '#0D9488' },
  SCHEDULE: { label: 'Tiến độ', icon: 'time', color: '#0D9488' },
  SAFETY: { label: 'An toàn', icon: 'shield-checkmark', color: '#000000' },
  QUALITY: { label: 'Chất lượng', icon: 'star', color: '#06B6D4' },
  OTHER: { label: 'Khác', icon: 'ellipsis-horizontal', color: '#6B7280' },
};

const IMPACT_CONFIG: Record<DecisionImpact, { label: string; color: string }> = {
  LOW: { label: 'Thấp', color: '#0D9488' },
  MEDIUM: { label: 'Trung bình', color: '#0D9488' },
  HIGH: { label: 'Cao', color: '#0D9488' },
  CRITICAL: { label: 'Nghiêm trọng', color: '#000000' },
};

const STATUS_CONFIG: Record<DecisionStatus, { label: string; color: string }> = {
  PROPOSED: { label: 'Đề xuất', color: '#6B7280' },
  APPROVED: { label: 'Phê duyệt', color: '#0D9488' },
  REJECTED: { label: 'Từ chối', color: '#000000' },
  IMPLEMENTED: { label: 'Đã triển khai', color: '#0D9488' },
  REVIEWED: { label: 'Đã đánh giá', color: '#666666' },
};

export default function DecisionLogScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DecisionCategory | 'ALL'>('ALL');

  useEffect(() => {
    loadDecisions();
  }, []);

  const loadDecisions = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockDecisions: Decision[] = [
        {
          id: '1',
          title: 'Thay đổi thiết kế móng từ móng băng sang móng bè',
          description: 'Đất nền yếu hơn dự kiến, cần thay đổi thiết kế móng',
          category: 'DESIGN',
          impact: 'CRITICAL',
          status: 'APPROVED',
          context: 'Kết quả khảo sát địa chất cho thấy đất nền có độ chịu tải thấp hơn 30% so với báo cáo ban đầu',
          rationale: 'Móng bè sẽ phân bố tải trọng đều hơn, giảm ứng suất lên nền đất yếu',
          alternatives: [
            'Cải tạo nền đất bằng đầm nén sâu',
            'Sử dụng móng cọc',
          ],
          decisionMaker: {
            id: '1',
            name: 'Nguyễn Văn A',
            role: 'Giám đốc dự án',
          },
          stakeholders: [
            { id: '2', name: 'Trần Thị B', role: 'KTS thiết kế' },
            { id: '3', name: 'Lê Văn C', role: 'Kỹ sư kết cấu' },
          ],
          dateProposed: new Date(Date.now() - 86400000 * 10).toISOString(),
          dateDecided: new Date(Date.now() - 86400000 * 7).toISOString(),
          relatedRisks: [
            { id: 'r1', title: 'Rủi ro chất lượng nền móng' },
          ],
          estimatedCost: 150000000,
          estimatedTime: 14,
        },
        {
          id: '2',
          title: 'Tăng ngân sách cho vật liệu chống thấm',
          description: 'Sử dụng vật liệu chống thấm cao cấp cho tầng hầm',
          category: 'BUDGET',
          impact: 'HIGH',
          status: 'IMPLEMENTED',
          context: 'Mực nước ngầm cao hơn dự kiến, cần tăng cường chống thấm',
          rationale: 'Đầu tư ban đầu cao hơn nhưng giảm chi phí bảo trì lâu dài',
          decisionMaker: {
            id: '1',
            name: 'Nguyễn Văn A',
            role: 'Giám đốc dự án',
          },
          stakeholders: [
            { id: '4', name: 'Phạm Thị D', role: 'Quản lý ngân sách' },
          ],
          dateProposed: new Date(Date.now() - 86400000 * 5).toISOString(),
          dateDecided: new Date(Date.now() - 86400000 * 3).toISOString(),
          dateImplemented: new Date(Date.now() - 86400000).toISOString(),
          estimatedCost: 50000000,
        },
        {
          id: '3',
          title: 'Áp dụng công nghệ BIM cho dự án',
          description: 'Sử dụng Building Information Modeling để quản lý dự án',
          category: 'TECHNICAL',
          impact: 'MEDIUM',
          status: 'PROPOSED',
          context: 'Dự án có quy mô lớn, nhiều bên tham gia, cần công cụ quản lý hiện đại',
          rationale: 'BIM giúp phối hợp tốt hơn giữa các bên, giảm sai sót thiết kế',
          alternatives: [
            'Sử dụng phương pháp truyền thống với AutoCAD',
            'Thuê tư vấn BIM bên ngoài',
          ],
          decisionMaker: {
            id: '1',
            name: 'Nguyễn Văn A',
            role: 'Giám đốc dự án',
          },
          stakeholders: [
            { id: '5', name: 'Hoàng Văn E', role: 'Trưởng phòng kỹ thuật' },
          ],
          dateProposed: new Date(Date.now() - 86400000 * 2).toISOString(),
          estimatedCost: 80000000,
          estimatedTime: 30,
        },
      ];

      setDecisions(mockDecisions);
    } catch (error: any) {
      console.error('Load decisions failed:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách quyết định');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDecisions();
    setRefreshing(false);
  };

  const filteredDecisions =
    selectedCategory === 'ALL' ? decisions : decisions.filter(d => d.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderDecision = ({ item }: { item: Decision }) => {
    const categoryConfig = CATEGORY_CONFIG[item.category];
    const impactConfig = IMPACT_CONFIG[item.impact];
    const statusConfig = STATUS_CONFIG[item.status];

    return (
      <Pressable
        style={[styles.decisionCard, { backgroundColor: surface, borderColor: border }]}
        onPress={() => router.push(`/projects/${projectId}/decisions/${item.id}` as any)}
      >
        <View style={[styles.categoryStripe, { backgroundColor: categoryConfig.color }]} />
        <View style={styles.decisionContent}>
          {/* Header */}
          <View style={styles.decisionHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color + '20' }]}>
              <Ionicons name={categoryConfig.icon as any} size={14} color={categoryConfig.color} />
              <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
                {categoryConfig.label}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.decisionTitle, { color: text }]} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Description */}
          <Text style={[styles.decisionDescription, { color: textMuted }]} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Impact */}
          <View style={[styles.impactBadge, { backgroundColor: impactConfig.color + '15', borderColor: impactConfig.color }]}>
            <Ionicons name="flash" size={14} color={impactConfig.color} />
            <Text style={[styles.impactText, { color: impactConfig.color }]}>
              Tác động: {impactConfig.label}
            </Text>
          </View>

          {/* Meta */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={14} color={textMuted} />
              <Text style={[styles.metaText, { color: textMuted }]}>
                {item.decisionMaker.name} ({item.decisionMaker.role})
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color={textMuted} />
              <Text style={[styles.metaText, { color: textMuted }]}>
                {formatDate(item.dateProposed)}
              </Text>
            </View>
          </View>

          {/* Stats */}
          {(item.estimatedCost || item.estimatedTime) && (
            <View style={styles.statsRow}>
              {item.estimatedCost && (
                <View style={styles.statItem}>
                  <Ionicons name="cash-outline" size={16} color={primary} />
                  <Text style={[styles.statText, { color: text }]}>
                    {formatCurrency(item.estimatedCost)}
                  </Text>
                </View>
              )}
              {item.estimatedTime && (
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color={primary} />
                  <Text style={[styles.statText, { color: text }]}>
                    {item.estimatedTime} ngày
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Pressable>
    );
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
        <Text style={[styles.headerTitle, { color: text }]}>Nhật ký quyết định</Text>
        <Pressable
          onPress={() => router.push(`/projects/${projectId}/create-decision` as any)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={primary} />
        </Pressable>
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={['ALL', ...Object.keys(CATEGORY_CONFIG)] as (DecisionCategory | 'ALL')[]}
        renderItem={({ item }) => {
          const isAll = item === 'ALL';
          const config = isAll ? null : CATEGORY_CONFIG[item];
          const count = isAll
            ? decisions.length
            : decisions.filter(d => d.category === item).length;

          return (
            <Pressable
              style={[
                styles.filterChip,
                { borderColor: border },
                selectedCategory === item && {
                  backgroundColor: isAll ? primary : config!.color,
                  borderColor: isAll ? primary : config!.color,
                },
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              {!isAll && (
                <Ionicons
                  name={config!.icon as any}
                  size={16}
                  color={selectedCategory === item ? '#fff' : config!.color}
                />
              )}
              <Text
                style={[styles.filterText, { color: selectedCategory === item ? '#fff' : text }]}
              >
                {isAll ? 'Tất cả' : config!.label} ({count})
              </Text>
            </Pressable>
          );
        }}
        keyExtractor={item => item}
        contentContainerStyle={styles.filterList}
        showsHorizontalScrollIndicator={false}
      />

      {/* Decision List */}
      <FlatList
        data={filteredDecisions}
        renderItem={renderDecision}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.decisionList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={textMuted} />
            <Text style={[styles.emptyText, { color: textMuted }]}>Chưa có quyết định nào</Text>
          </View>
        }
      />
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
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  decisionList: {
    padding: 16,
    gap: 12,
  },
  decisionCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  decisionContent: {
    padding: 16,
    paddingLeft: 20,
  },
  decisionHeader: {
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  decisionTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 6,
  },
  decisionDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    marginBottom: 12,
  },
  impactText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaContainer: {
    gap: 6,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});
