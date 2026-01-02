/**
 * Decision Log Detail Screen
 * Comprehensive view of project decision with full context
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// Types
interface DecisionDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: string;
  status: string;
  context: string;
  rationale: string;
  alternatives?: Array<{
    option: string;
    pros: string[];
    cons: string[];
    reason: string;
  }>;
  decisionMaker: {
    id: string;
    name: string;
    role: string;
  };
  stakeholders: Array<{
    id: string;
    name: string;
    role: string;
    influence: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  dateProposed: string;
  dateDecided?: string;
  dateImplemented?: string;
  relatedRisks?: Array<{
    id: string;
    title: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    mitigation?: string;
  }>;
  relatedDocuments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  estimatedCost?: number;
  estimatedTime?: number;
  actualCost?: number;
  actualTime?: number;
  statusHistory: Array<{
    status: string;
    date: string;
    changedBy: string;
    comments?: string;
  }>;
}

export default function DecisionDetailScreen() {
  const { id: projectId, decisionId } = useLocalSearchParams<{
    id: string;
    decisionId: string;
  }>();
  const router = useRouter();

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');

  const [decision, setDecision] = useState<DecisionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{
    context: boolean;
    rationale: boolean;
  }>({
    context: false,
    rationale: false,
  });

  useEffect(() => {
    loadDecisionDetail();
  }, [decisionId]);

  const loadDecisionDetail = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with real API when available
      // const response = await communicationService.getDecision(parseInt(decisionId));
      
      // Mock data for now
      const mockDecision: DecisionDetail = {
        id: decisionId,
        title: 'Thay đổi thiết kế móng từ móng băng sang móng bè',
        description: 'Thay đổi hệ thống móng căn cứ vào kết quả khảo sát địa chất cập nhật',
        category: 'DESIGN',
        impact: 'CRITICAL',
        status: 'IMPLEMENTED',
        context:
          'Kết quả khảo sát địa chất bổ sung cho thấy đất nền có độ chịu tải thấp hơn 30% so với báo cáo ban đầu. Tầng đất sét yếu xuất hiện ở độ sâu 2-4m với chỉ số N-SPT < 5. Việc tiếp tục sử dụng móng băng như thiết kế ban đầu sẽ gây nguy cơ lún không đều nghiêm trọng, ảnh hưởng đến an toàn kết cấu công trình.',
        rationale:
          'Móng bè giúp phân bố tải trọng đều hơn lên toàn bộ diện tích, giảm ứng suất trên nền đất yếu xuống còn 0.8 kg/cm² (trong khả năng chịu tải). Giải pháp này đã được tính toán kỹ lưỡng bởi tư vấn kết cấu và được chủ đầu tư chấp thuận. Mặc dù chi phí tăng 15% nhưng đảm bảo an toàn tuyệt đối và giảm rủi ro lún công trình trong tương lai.',
        alternatives: [
          {
            option: 'Cải tạo nền đất bằng đầm nén sâu',
            pros: [
              'Giữ nguyên thiết kế móng ban đầu',
              'Chi phí thấp hơn móng bè khoảng 5%',
            ],
            cons: [
              'Thời gian thi công kéo dài 3-4 tuần',
              'Hiệu quả không đảm bảo 100% do tầng sét sâu',
              'Cần thiết bị chuyên dụng, khó thuê tại địa phương',
            ],
            reason:
              'Không khả thi do thời gian và thiết bị hạn chế. Độ tin cậy thấp với điều kiện địa chất phức tạp.',
          },
          {
            option: 'Sử dụng móng cọc khoan nhồi',
            pros: [
              'Truyền tải trọng xuống tầng đất tốt sâu hơn',
              'Giải pháp lâu dài, ổn định cao',
            ],
            cons: [
              'Chi phí tăng 40-50% so với móng bè',
              'Cần khảo sát địa chất sâu thêm',
              'Thời gian thi công dài hơn 6-8 tuần',
              'Phụ thuộc vào tầng đất tốt ở độ sâu lớn',
            ],
            reason:
              'Chi phí quá cao, vượt ngân sách dự án. Thời gian thi công kéo dài ảnh hưởng tiến độ tổng thể.',
          },
          {
            option: 'Giữ nguyên móng băng với gia cường thêm dầm nối',
            pros: ['Thay đổi tối thiểu so với thiết kế ban đầu', 'Chi phí thấp nhất'],
            cons: [
              'Không giải quyết được vấn đề nền yếu',
              'Rủi ro lún cao, có thể gây nứt tường sau này',
              'Không được tư vấn kết cấu khuyến nghị',
            ],
            reason:
              'Giải pháp chữa cháy, không đảm bảo an toàn dài hạn. Bị từ chối bởi tư vấn giám sát.',
          },
        ],
        decisionMaker: {
          id: '1',
          name: 'Nguyễn Văn A',
          role: 'Giám đốc dự án',
        },
        stakeholders: [
          { id: '2', name: 'Trần Thị B', role: 'KTS thiết kế', influence: 'HIGH' },
          { id: '3', name: 'Lê Văn C', role: 'Kỹ sư kết cấu', influence: 'HIGH' },
          { id: '4', name: 'Phạm Thị D', role: 'Chủ đầu tư', influence: 'HIGH' },
          { id: '5', name: 'Hoàng Văn E', role: 'Kỹ sư giám sát', influence: 'MEDIUM' },
          { id: '6', name: 'Đặng Thị F', role: 'Kế toán dự án', influence: 'MEDIUM' },
        ],
        dateProposed: new Date(Date.now() - 86400000 * 25).toISOString(),
        dateDecided: new Date(Date.now() - 86400000 * 18).toISOString(),
        dateImplemented: new Date(Date.now() - 86400000 * 5).toISOString(),
        relatedRisks: [
          {
            id: 'r1',
            title: 'Rủi ro chất lượng nền móng do địa chất yếu',
            severity: 'CRITICAL',
            mitigation: 'Đã giải quyết bằng việc chuyển sang móng bè',
          },
          {
            id: 'r2',
            title: 'Nguy cơ lún không đều gây nứt kết cấu',
            severity: 'HIGH',
            mitigation: 'Móng bè phân bố đều tải trọng, giảm thiểu lún không đều',
          },
          {
            id: 'r3',
            title: 'Vượt ngân sách do thay đổi thiết kế',
            severity: 'MEDIUM',
            mitigation: 'Đã được chủ đầu tư phê duyệt bổ sung 150 triệu',
          },
        ],
        relatedDocuments: [
          { name: 'Báo cáo địa chất cập nhật - Tháng 11.2025.pdf', url: '#', type: 'pdf' },
          { name: 'Bản vẽ thiết kế móng bè - Rev.02.dwg', url: '#', type: 'dwg' },
          { name: 'Biên bản họp với chủ đầu tư.docx', url: '#', type: 'docx' },
          { name: 'Tính toán kết cấu móng bè.xlsx', url: '#', type: 'xlsx' },
        ],
        estimatedCost: 150000000,
        estimatedTime: 14,
        actualCost: 145000000,
        actualTime: 12,
        statusHistory: [
          {
            status: 'PROPOSED',
            date: new Date(Date.now() - 86400000 * 25).toISOString(),
            changedBy: 'Lê Văn C',
            comments:
              'Đề xuất thay đổi thiết kế móng sau khi phát hiện đất nền yếu hơn dự kiến từ báo cáo địa chất bổ sung',
          },
          {
            status: 'UNDER_REVIEW',
            date: new Date(Date.now() - 86400000 * 20).toISOString(),
            changedBy: 'Nguyễn Văn A',
            comments: 'Chuyển sang xem xét. Yêu cầu tư vấn kết cấu đánh giá các phương án',
          },
          {
            status: 'APPROVED',
            date: new Date(Date.now() - 86400000 * 18).toISOString(),
            changedBy: 'Phạm Thị D',
            comments:
              'Chủ đầu tư chấp thuận phương án móng bè. Phê duyệt bổ sung ngân sách 150 triệu đồng',
          },
          {
            status: 'IN_PROGRESS',
            date: new Date(Date.now() - 86400000 * 15).toISOString(),
            changedBy: 'Trần Thị B',
            comments: 'Bắt đầu thiết kế chi tiết móng bè. Dự kiến hoàn thành sau 1 tuần',
          },
          {
            status: 'IMPLEMENTED',
            date: new Date(Date.now() - 86400000 * 5).toISOString(),
            changedBy: 'Hoàng Văn E',
            comments:
              'Hoàn thành thi công móng bè. Đạt chất lượng theo thiết kế, tiết kiệm 5 triệu so với dự toán',
          },
        ],
      };

      setDecision(mockDecision);
    } catch (error) {
      console.error('Load decision detail failed:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết quyết định');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, { bg: string; text: string; icon: string }> = {
      DESIGN: { bg: '#DBEAFE', text: '#1E40AF', icon: 'color-palette' },
      TECHNICAL: { bg: '#FEF3C7', text: '#92400E', icon: 'construct' },
      BUDGET: { bg: '#D1FAE5', text: '#065F46', icon: 'cash' },
      SCHEDULE: { bg: '#FCE7F3', text: '#9F1239', icon: 'time' },
      SAFETY: { bg: '#FEE2E2', text: '#991B1B', icon: 'shield-checkmark' },
      QUALITY: { bg: '#E0E7FF', text: '#3730A3', icon: 'ribbon' },
      OTHER: { bg: '#F3F4F6', text: '#374151', icon: 'ellipsis-horizontal' },
    };
    return styles[category] || styles.OTHER;
  };

  const getImpactStyle = (impact: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      CRITICAL: { bg: '#FEE2E2', text: '#991B1B' },
      HIGH: { bg: '#FED7AA', text: '#9A3412' },
      MEDIUM: { bg: '#FEF3C7', text: '#92400E' },
      LOW: { bg: '#D1FAE5', text: '#065F46' },
    };
    return styles[impact] || styles.MEDIUM;
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: string }> = {
      PROPOSED: { bg: '#E0E7FF', text: '#3730A3', icon: 'bulb' },
      UNDER_REVIEW: { bg: '#FEF3C7', text: '#92400E', icon: 'eye' },
      APPROVED: { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle' },
      REJECTED: { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle' },
      IN_PROGRESS: { bg: '#DBEAFE', text: '#1E40AF', icon: 'play-circle' },
      IMPLEMENTED: { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-done-circle' },
    };
    return styles[status] || styles.PROPOSED;
  };

  const getRiskSeverityStyle = (severity: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      CRITICAL: { bg: '#FEE2E2', text: '#991B1B' },
      HIGH: { bg: '#FED7AA', text: '#9A3412' },
      MEDIUM: { bg: '#FEF3C7', text: '#92400E' },
      LOW: { bg: '#DBEAFE', text: '#1E40AF' },
    };
    return styles[severity] || styles.MEDIUM;
  };

  const getInfluenceBadge = (influence: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      HIGH: { bg: '#FEE2E2', text: '#991B1B' },
      MEDIUM: { bg: '#FEF3C7', text: '#92400E' },
      LOW: { bg: '#E5E7EB', text: '#374151' },
    };
    return styles[influence] || styles.MEDIUM;
  };

  const toggleSection = (section: 'context' | 'rationale') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={[styles.loadingText, { color: textMuted }]}>
          Đang tải chi tiết quyết định...
        </Text>
      </View>
    );
  }

  if (!decision) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: background }]}>
        <Ionicons name="document-text-outline" size={64} color={textMuted} />
        <Text style={[styles.emptyText, { color: textMuted }]}>
          Không tìm thấy quyết định
        </Text>
        <Pressable
          style={[styles.backButton, { backgroundColor: primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  const categoryStyle = getCategoryStyle(decision.category);
  const impactStyle = getImpactStyle(decision.impact);
  const statusStyle = getStatusStyle(decision.status);

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: text }]} numberOfLines={1}>
          Chi tiết quyết định
        </Text>
        <Pressable style={styles.headerMenuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={text} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Decision Header Card */}
        <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: categoryStyle.bg }]}>
              <Ionicons name={categoryStyle.icon as any} size={14} color={categoryStyle.text} />
              <Text style={[styles.badgeText, { color: categoryStyle.text }]}>
                {decision.category}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: impactStyle.bg }]}>
              <Text style={[styles.badgeText, { color: impactStyle.text }]}>
                Impact: {decision.impact}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
              <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.text} />
              <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                {decision.status}
              </Text>
            </View>
          </View>

          <Text style={[styles.decisionTitle, { color: text }]}>{decision.title}</Text>
          <Text style={[styles.decisionDescription, { color: textMuted }]}>
            {decision.description}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="person-circle-outline" size={20} color={primary} />
              <View style={styles.metaTextContainer}>
                <Text style={[styles.metaLabel, { color: textMuted }]}>Quyết định bởi</Text>
                <Text style={[styles.metaValue, { color: text }]}>
                  {decision.decisionMaker.name}
                </Text>
                <Text style={[styles.metaSubtext, { color: textMuted }]}>
                  {decision.decisionMaker.role}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, { color: textMuted }]}>Đề xuất</Text>
              <Text style={[styles.dateValue, { color: text }]}>
                {formatDate(decision.dateProposed)}
              </Text>
            </View>
            {decision.dateDecided && (
              <View style={styles.dateItem}>
                <Text style={[styles.dateLabel, { color: textMuted }]}>Phê duyệt</Text>
                <Text style={[styles.dateValue, { color: text }]}>
                  {formatDate(decision.dateDecided)}
                </Text>
              </View>
            )}
            {decision.dateImplemented && (
              <View style={styles.dateItem}>
                <Text style={[styles.dateLabel, { color: textMuted }]}>Thực hiện</Text>
                <Text style={[styles.dateValue, { color: text }]}>
                  {formatDate(decision.dateImplemented)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Context & Rationale */}
        <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
          <Pressable
            style={styles.expandableHeader}
            onPress={() => toggleSection('context')}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons name="information-circle-outline" size={20} color={primary} />
              <Text style={[styles.sectionTitle, { color: text }]}>Bối cảnh & Lý do</Text>
            </View>
            <Ionicons
              name={expandedSections.context ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={textMuted}
            />
          </Pressable>

          {expandedSections.context && (
            <>
              <View style={styles.subsection}>
                <Text style={[styles.subsectionTitle, { color: text }]}>📋 Bối cảnh</Text>
                <Text style={[styles.bodyText, { color: text }]}>{decision.context}</Text>
              </View>

              <View style={styles.subsection}>
                <Text style={[styles.subsectionTitle, { color: text }]}>💡 Lý do chọn</Text>
                <Text style={[styles.bodyText, { color: text }]}>{decision.rationale}</Text>
              </View>
            </>
          )}
        </View>

        {/* Alternatives Considered */}
        {decision.alternatives && decision.alternatives.length > 0 && (
          <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="git-branch-outline" size={20} color={primary} />
              <Text style={[styles.sectionTitle, { color: text }]}>
                Phương án đã xem xét ({decision.alternatives.length})
              </Text>
            </View>

            {decision.alternatives.map((alt, index) => (
              <View key={index} style={[styles.alternativeCard, { borderColor: border }]}>
                <Text style={[styles.alternativeTitle, { color: text }]}>
                  {index + 1}. {alt.option}
                </Text>

                <View style={styles.prosConsContainer}>
                  <View style={styles.prosConsColumn}>
                    <View style={styles.prosConsHeader}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={[styles.prosConsLabel, { color: '#10B981' }]}>Ưu điểm</Text>
                    </View>
                    {alt.pros.map((pro, i) => (
                      <Text key={i} style={[styles.prosConsItem, { color: text }]}>
                        • {pro}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.prosConsColumn}>
                    <View style={styles.prosConsHeader}>
                      <Ionicons name="close-circle" size={16} color="#EF4444" />
                      <Text style={[styles.prosConsLabel, { color: '#EF4444' }]}>Nhược điểm</Text>
                    </View>
                    {alt.cons.map((con, i) => (
                      <Text key={i} style={[styles.prosConsItem, { color: text }]}>
                        • {con}
                      </Text>
                    ))}
                  </View>
                </View>

                <View style={[styles.reasonBox, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                  <Ionicons name="warning" size={16} color="#92400E" />
                  <Text style={[styles.reasonText, { color: '#92400E' }]}>
                    Lý do không chọn: {alt.reason}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Stakeholders */}
        <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="people-outline" size={20} color={primary} />
            <Text style={[styles.sectionTitle, { color: text }]}>
              Các bên liên quan ({decision.stakeholders.length})
            </Text>
          </View>

          <View style={styles.stakeholderGrid}>
            {decision.stakeholders.map((stakeholder) => {
              const influenceStyle = getInfluenceBadge(stakeholder.influence);
              return (
                <View key={stakeholder.id} style={[styles.stakeholderCard, { borderColor: border }]}>
                  <View style={[styles.stakeholderAvatar, { backgroundColor: primary + '15' }]}>
                    <Text style={[styles.stakeholderAvatarText, { color: primary }]}>
                      {stakeholder.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.stakeholderInfo}>
                    <Text style={[styles.stakeholderName, { color: text }]} numberOfLines={1}>
                      {stakeholder.name}
                    </Text>
                    <Text style={[styles.stakeholderRole, { color: textMuted }]} numberOfLines={1}>
                      {stakeholder.role}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.influenceBadge,
                      { backgroundColor: influenceStyle.bg },
                    ]}
                  >
                    <Text style={[styles.influenceText, { color: influenceStyle.text }]}>
                      {stakeholder.influence}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Related Risks */}
        {decision.relatedRisks && decision.relatedRisks.length > 0 && (
          <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="warning-outline" size={20} color={primary} />
              <Text style={[styles.sectionTitle, { color: text }]}>
                Rủi ro liên quan ({decision.relatedRisks.length})
              </Text>
            </View>

            {decision.relatedRisks.map((risk) => {
              const severityStyle = getRiskSeverityStyle(risk.severity);
              return (
                <View key={risk.id} style={[styles.riskCard, { borderColor: border }]}>
                  <View style={styles.riskHeader}>
                    <Text style={[styles.riskTitle, { color: text }]}>{risk.title}</Text>
                    <View style={[styles.severityBadge, { backgroundColor: severityStyle.bg }]}>
                      <Text style={[styles.severityText, { color: severityStyle.text }]}>
                        {risk.severity}
                      </Text>
                    </View>
                  </View>
                  {risk.mitigation && (
                    <View style={styles.mitigationBox}>
                      <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                      <Text style={[styles.mitigationText, { color: text }]}>
                        {risk.mitigation}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Cost & Time Impact */}
        {(decision.estimatedCost || decision.estimatedTime) && (
          <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="analytics-outline" size={20} color={primary} />
              <Text style={[styles.sectionTitle, { color: text }]}>Tác động Chi phí & Thời gian</Text>
            </View>

            <View style={styles.impactGrid}>
              {decision.estimatedCost && (
                <View style={styles.impactCard}>
                  <Text style={[styles.impactLabel, { color: textMuted }]}>Chi phí</Text>
                  <View style={styles.impactComparison}>
                    <View style={styles.impactItem}>
                      <Text style={[styles.impactSubLabel, { color: textMuted }]}>Ước tính</Text>
                      <Text style={[styles.impactValue, { color: text }]}>
                        {formatCurrency(decision.estimatedCost)}
                      </Text>
                    </View>
                    {decision.actualCost && (
                      <View style={styles.impactItem}>
                        <Text style={[styles.impactSubLabel, { color: textMuted }]}>Thực tế</Text>
                        <Text style={[styles.impactValue, { color: text }]}>
                          {formatCurrency(decision.actualCost)}
                        </Text>
                      </View>
                    )}
                  </View>
                  {decision.actualCost && (
                    <View style={styles.varianceBox}>
                      <Text
                        style={[
                          styles.varianceText,
                          {
                            color:
                              decision.actualCost <= decision.estimatedCost
                                ? '#10B981'
                                : '#EF4444',
                          },
                        ]}
                      >
                        {decision.actualCost <= decision.estimatedCost ? '✓' : '⚠'} Chênh lệch:{' '}
                        {formatCurrency(Math.abs(decision.actualCost - decision.estimatedCost))}
                        {decision.actualCost <= decision.estimatedCost ? ' (tiết kiệm)' : ' (vượt)'}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {decision.estimatedTime && (
                <View style={styles.impactCard}>
                  <Text style={[styles.impactLabel, { color: textMuted }]}>Thời gian</Text>
                  <View style={styles.impactComparison}>
                    <View style={styles.impactItem}>
                      <Text style={[styles.impactSubLabel, { color: textMuted }]}>Ước tính</Text>
                      <Text style={[styles.impactValue, { color: text }]}>
                        {decision.estimatedTime} ngày
                      </Text>
                    </View>
                    {decision.actualTime && (
                      <View style={styles.impactItem}>
                        <Text style={[styles.impactSubLabel, { color: textMuted }]}>Thực tế</Text>
                        <Text style={[styles.impactValue, { color: text }]}>
                          {decision.actualTime} ngày
                        </Text>
                      </View>
                    )}
                  </View>
                  {decision.actualTime && (
                    <View style={styles.varianceBox}>
                      <Text
                        style={[
                          styles.varianceText,
                          {
                            color:
                              decision.actualTime <= decision.estimatedTime
                                ? '#10B981'
                                : '#EF4444',
                          },
                        ]}
                      >
                        {decision.actualTime <= decision.estimatedTime ? '✓' : '⚠'} Chênh lệch:{' '}
                        {Math.abs(decision.actualTime - decision.estimatedTime)} ngày
                        {decision.actualTime <= decision.estimatedTime ? ' (sớm hơn)' : ' (chậm hơn)'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Related Documents */}
        {decision.relatedDocuments && decision.relatedDocuments.length > 0 && (
          <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="folder-open-outline" size={20} color={primary} />
              <Text style={[styles.sectionTitle, { color: text }]}>
                Tài liệu liên quan ({decision.relatedDocuments.length})
              </Text>
            </View>

            {decision.relatedDocuments.map((doc, index) => (
              <Pressable key={index} style={[styles.documentItem, { borderColor: border }]}>
                <Ionicons name="document-outline" size={24} color={primary} />
                <View style={styles.documentInfo}>
                  <Text style={[styles.documentName, { color: text }]} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <Text style={[styles.documentType, { color: textMuted }]}>
                    {doc.type.toUpperCase()}
                  </Text>
                </View>
                <Ionicons name="download-outline" size={20} color={primary} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Status History Timeline */}
        <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="time-outline" size={20} color={primary} />
            <Text style={[styles.sectionTitle, { color: text }]}>
              Lịch sử trạng thái ({decision.statusHistory.length})
            </Text>
          </View>

          <View style={styles.timeline}>
            {decision.statusHistory.map((item, index) => {
              const itemStatusStyle = getStatusStyle(item.status);
              const isLast = index === decision.statusHistory.length - 1;

              return (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineDot}>
                    <View
                      style={[
                        styles.dotInner,
                        { backgroundColor: itemStatusStyle.text },
                      ]}
                    />
                  </View>
                  {!isLast && <View style={[styles.timelineLine, { backgroundColor: border }]} />}

                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <View
                        style={[
                          styles.timelineStatusBadge,
                          { backgroundColor: itemStatusStyle.bg },
                        ]}
                      >
                        <Ionicons
                          name={itemStatusStyle.icon as any}
                          size={14}
                          color={itemStatusStyle.text}
                        />
                        <Text style={[styles.timelineStatusText, { color: itemStatusStyle.text }]}>
                          {item.status}
                        </Text>
                      </View>
                      <Text style={[styles.timelineDate, { color: textMuted }]}>
                        {formatDate(item.date)}
                      </Text>
                    </View>

                    <Text style={[styles.timelineChangedBy, { color: textMuted }]}>
                      bởi {item.changedBy}
                    </Text>

                    {item.comments && (
                      <Text style={[styles.timelineComments, { color: text }]}>
                        {item.comments}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 32 }} />
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
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBackButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  headerMenuButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  decisionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 28,
  },
  decisionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  metaRow: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    gap: 12,
  },
  metaTextContainer: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  metaSubtext: {
    fontSize: 13,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  subsection: {
    marginTop: 16,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  alternativeCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  alternativeTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  prosConsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  prosConsColumn: {
    flex: 1,
  },
  prosConsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  prosConsLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  prosConsItem: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  reasonBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  stakeholderGrid: {
    gap: 12,
  },
  stakeholderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  stakeholderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stakeholderAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stakeholderInfo: {
    flex: 1,
  },
  stakeholderName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  stakeholderRole: {
    fontSize: 12,
  },
  influenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  influenceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  riskCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  riskTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  mitigationBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  mitigationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  impactGrid: {
    gap: 16,
  },
  impactCard: {
    gap: 12,
  },
  impactLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  impactComparison: {
    flexDirection: 'row',
    gap: 16,
  },
  impactItem: {
    flex: 1,
  },
  impactSubLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  varianceBox: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
  },
  varianceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  documentType: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 32,
    paddingBottom: 24,
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineLine: {
    position: 'absolute',
    left: 9.5,
    top: 24,
    width: 1,
    bottom: 0,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timelineStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timelineStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timelineDate: {
    fontSize: 12,
  },
  timelineChangedBy: {
    fontSize: 13,
    marginBottom: 6,
  },
  timelineComments: {
    fontSize: 13,
    lineHeight: 20,
  },
});
