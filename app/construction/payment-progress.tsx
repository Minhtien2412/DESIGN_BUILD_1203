import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import { PaymentMilestone, PaymentPhase, PaymentProgress } from '../../types/payment-progress';

// Realistic mock data for construction payment tracking
const MOCK_PAYMENT_DATA: PaymentProgress = {
  projectId: '1',
  totalAmount: 796478500,
  totalPercentage: 35,
  currentPhase: 'Tầng trệt',
  paidAmount: 278810000,
  phases: [
    {
      id: 'foundation',
      name: 'Móng',
      totalAmount: 87975000,
      status: 'completed',
      milestones: [
        {
          id: 'm1',
          title: 'Xây móng, lắp đặt thép, đổ bê tông sàn',
          amount: 70380000,
          percentage: 80,
          status: 'paid',
          images: [
            'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
          ],
          approvedBy: 'KS. Hiếu Nguyễn',
          approvedDate: '15/03/2024',
          accountantApproved: true,
        },
        {
          id: 'm2',
          title: 'Hoàn thiện móng và kiểm tra chất lượng',
          amount: 17595000,
          percentage: 20,
          status: 'paid',
          images: [
            'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
            'https://images.unsplash.com/photo-1597476370687-f8a027efb6cf?w=400',
          ],
          approvedBy: 'KS. Hiếu Nguyễn',
          approvedDate: '28/03/2024',
          accountantApproved: true,
        },
      ],
    },
    {
      id: 'ground-floor',
      name: 'Tầng trệt',
      totalAmount: 157435000,
      status: 'in-progress',
      milestones: [
        {
          id: 'gf1',
          title: 'Đổ cột, dầm tầng trệt',
          amount: 62974000,
          percentage: 40,
          status: 'approved',
          images: [
            'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
            'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
          ],
          videos: ['video1.mp4'],
          approvedBy: 'KS. Minh Trần',
          approvedDate: '10/04/2024',
          accountantApproved: true,
        },
        {
          id: 'gf2',
          title: 'Xây tường, đổ sàn tầng trệt',
          amount: 62974000,
          percentage: 40,
          status: 'approved',
          images: [
            'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400',
            'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
          ],
          videos: ['video2.mp4'],
          approvedBy: 'KS. Minh Trần',
          approvedDate: '22/04/2024',
          accountantApproved: false,
        },
        {
          id: 'gf3',
          title: 'Lắp điện nước, hoàn thiện tầng trệt',
          amount: 31487000,
          percentage: 20,
          status: 'pending',
          images: [],
        },
      ],
    },
    {
      id: 'floor-1',
      name: 'Tầng 1',
      totalAmount: 142485000,
      status: 'pending',
      milestones: [
        {
          id: 'f1-1',
          title: 'Đổ cột, dầm tầng 1',
          amount: 56994000,
          percentage: 40,
          status: 'pending',
          images: [],
        },
        {
          id: 'f1-2',
          title: 'Xây tường, đổ sàn tầng 1',
          amount: 56994000,
          percentage: 40,
          status: 'pending',
          images: [],
        },
        {
          id: 'f1-3',
          title: 'Lắp điện nước, hoàn thiện tầng 1',
          amount: 28497000,
          percentage: 20,
          status: 'pending',
          images: [],
        },
      ],
    },
    {
      id: 'floor-2',
      name: 'Tầng 2',
      totalAmount: 137873500,
      status: 'pending',
      milestones: [
        {
          id: 'f2-1',
          title: 'Đổ cột, dầm tầng 2',
          amount: 55149400,
          percentage: 40,
          status: 'pending',
          images: [],
        },
        {
          id: 'f2-2',
          title: 'Xây tường, đổ sàn tầng 2',
          amount: 55149400,
          percentage: 40,
          status: 'pending',
          images: [],
        },
        {
          id: 'f2-3',
          title: 'Lắp điện nước, hoàn thiện tầng 2',
          amount: 27574700,
          percentage: 20,
          status: 'pending',
          images: [],
        },
      ],
    },
    {
      id: 'floor-3',
      name: 'Tầng 3',
      totalAmount: 136033500,
      status: 'pending',
      milestones: [
        {
          id: 'f3-1',
          title: 'Đổ cột, dầm tầng 3',
          amount: 54413400,
          percentage: 40,
          status: 'pending',
          images: [],
        },
        {
          id: 'f3-2',
          title: 'Xây tường, đổ sàn tầng 3',
          amount: 54413400,
          percentage: 40,
          status: 'pending',
          images: [],
        },
        {
          id: 'f3-3',
          title: 'Lắp điện nước, hoàn thiện tầng 3',
          amount: 27206700,
          percentage: 20,
          status: 'pending',
          images: [],
        },
      ],
    },
    {
      id: 'floor-4',
      name: 'Tầng 4',
      totalAmount: 100395000,
      status: 'pending',
      milestones: [
        {
          id: 'f4-1',
          title: 'Đổ cột, dầm tầng 4',
          amount: 40158000,
          percentage: 40,
          status: 'pending',
          images: [],
        },
        {
          id: 'f4-2',
          title: 'Xây tường, đổ sàn tầng 4',
          amount: 40158000,
          percentage: 40,
          status: 'pending',
          images: [],
        },
        {
          id: 'f4-3',
          title: 'Lắp điện nước, hoàn thiện tầng 4',
          amount: 20079000,
          percentage: 20,
          status: 'pending',
          images: [],
        },
      ],
    },
    {
      id: 'roof',
      name: 'Mái Bằng',
      totalAmount: 34281500,
      status: 'pending',
      milestones: [
        {
          id: 'rf1',
          title: 'Đổ sàn mái, chống thấm',
          amount: 20568900,
          percentage: 60,
          status: 'pending',
          images: [],
        },
        {
          id: 'rf2',
          title: 'Hoàn thiện mái, bàn giao',
          amount: 13712600,
          percentage: 40,
          status: 'pending',
          images: [],
        },
      ],
    },
  ],
};

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}đ`;
}

function MilestoneCard({ milestone }: { milestone: PaymentMilestone }) {
  const getStatusColor = () => {
    switch (milestone.status) {
      case 'paid': return { bg: '#F0FDF4', border: '#22c55e', text: '#22c55e' };
      case 'approved': return { bg: '#FEF3C7', border: '#F59E0B', text: '#F59E0B' };
      default: return { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280' };
    }
  };
  
  const statusColors = getStatusColor();

  return (
    <View style={[styles.milestoneCard, { backgroundColor: statusColors.bg, borderColor: statusColors.border }]}>
      <View style={styles.milestoneHeader}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.milestoneTitle, { color: statusColors.text }]}>{milestone.title}</Text>
          {milestone.status === 'paid' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
              <Text style={{ fontSize: 11, color: '#22c55e', fontWeight: '500' }}>Đã thanh toán</Text>
            </View>
          )}
          {milestone.status === 'approved' && milestone.accountantApproved && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Ionicons name="time-outline" size={14} color="#F59E0B" />
              <Text style={{ fontSize: 11, color: '#F59E0B', fontWeight: '500' }}>Chờ thanh toán</Text>
            </View>
          )}
        </View>
        <Text style={[styles.milestoneAmount, { color: statusColors.text }]}>
          {formatCurrency(milestone.amount)}
        </Text>
      </View>

      <Text style={[styles.milestonePercentage, { color: statusColors.text }]}>{milestone.percentage}%</Text>

      {milestone.images && milestone.images.length > 0 && (
        <View style={styles.mediaRow}>
          {milestone.images.slice(0, 2).map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.thumbnail} />
          ))}
          {milestone.videos && milestone.videos.length > 0 && (
            <View style={styles.playOverlay}>
              <Ionicons name="play-circle" size={42} color={statusColors.border} />
            </View>
          )}
        </View>
      )}

      {milestone.approvedBy && (
        <View style={styles.approvalInfo}>
          <View>
            <Text style={styles.approvalLabel}>Giám sát duyệt</Text>
            <Text style={styles.approvalLabel}>Ngày duyệt</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.approvalValue, { color: statusColors.text }]}>{milestone.approvedBy}</Text>
            <Text style={styles.approvalDate}>Ngày {milestone.approvedDate}</Text>
            {milestone.accountantApproved && (
              <Text style={[styles.accountantApproved, { color: statusColors.text }]}>Kế toán đã duyệt</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function PhaseRow({ phase, onPress }: { phase: PaymentPhase; onPress: () => void }) {
  const border = useThemeColor({}, 'border');
  const hasContent = phase.milestones && phase.milestones.length > 0;

  return (
    <TouchableOpacity
      style={[styles.phaseRow, { borderColor: border }]}
      onPress={onPress}
      disabled={!hasContent}
    >
      <Text style={styles.phaseName}>{phase.name}</Text>
      <View style={styles.phaseRight}>
        <Text style={styles.phaseAmount}>{formatCurrency(phase.totalAmount)}</Text>
        {hasContent && <Ionicons name="chevron-forward" size={16} color="#1F1F39" />}
      </View>
    </TouchableOpacity>
  );
}

export default function PaymentProgressScreen() {
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');

  const params = useLocalSearchParams<{ id?: string }>();
  const projectId = params.id || '1';

  // In real app, fetch data based on projectId
  const data = MOCK_PAYMENT_DATA;

  const [expandedPhase, setExpandedPhase] = useState<string>('foundation');

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: background }]}>
      <Stack.Screen
        options={{
          title: 'Tiến độ thanh toán',
          headerStyle: { backgroundColor: background },
          headerTintColor: text,
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={[styles.pageTitle, { color: text }]}>
          TIẾN ĐỘ THANH TOÁN THI CÔNG{'\n'}BIỆT THỰ
        </Text>

        <Text style={styles.sectionLabel}>Tổng hợp tiến độ</Text>

        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng số tiền:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(data.totalAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng tỷ lệ:</Text>
            <Text style={[styles.summaryPercentage, { color: '#13B157' }]}>{data.totalPercentage}%</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Đã ứng đến:</Text>
            <Text style={styles.summaryValue}>{data.currentPhase}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Số tiền đã ứng:</Text>
            <Text style={[styles.summaryHighlight, { color: '#FEB052' }]}>
              {formatCurrency(data.paidAmount)}
            </Text>
          </View>
        </View>

        {/* Completed & In-Progress Phases with Milestones */}
        {data.phases
          .filter(p => p.status === 'completed' || p.status === 'in-progress')
          .map(phase => (
            <View key={phase.id} style={styles.activePhaseSection}>
              <View style={styles.phaseHeader}>
                <Text style={styles.activePhaseTitle}>{phase.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {phase.status === 'completed' && (
                    <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                  )}
                  <Text style={[styles.activePhaseTotalAmount, { color: phase.status === 'completed' ? '#22c55e' : '#13B157' }]}>
                    {formatCurrency(phase.totalAmount)}
                  </Text>
                </View>
              </View>
              {phase.milestones.map(milestone => (
                <MilestoneCard key={milestone.id} milestone={milestone} />
              ))}
            </View>
          ))}

        {/* Other Phases */}
        {data.phases
          .filter(p => p.status === 'pending')
          .map(phase => (
            <PhaseRow
              key={phase.id}
              phase={phase}
              onPress={() => {
                if (phase.milestones.length > 0) {
                  setExpandedPhase(expandedPhase === phase.id ? '' : phase.id);
                }
              }}
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  pageTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#646464',
    marginBottom: 8,
  },
  summaryCard: {
    borderRadius: 5,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 12, color: '#000' },
  summaryValue: { fontSize: 10, fontWeight: '600', color: '#000' },
  summaryPercentage: { fontSize: 10, fontWeight: '600' },
  summaryHighlight: { fontSize: 10, fontWeight: '600' },
  activePhaseSection: { marginBottom: 20 },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activePhaseTitle: { fontSize: 14, fontWeight: '500', color: '#000' },
  activePhaseTotalAmount: { fontSize: 14, fontWeight: '600' },
  milestoneCard: {
    borderRadius: 5,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  milestoneTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#13B157',
    marginRight: 8,
  },
  milestoneAmount: { fontSize: 13, fontWeight: '600' },
  milestonePercentage: { fontSize: 12, color: '#000', marginBottom: 12 },
  mediaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    position: 'relative',
  },
  thumbnail: {
    width: 78,
    height: 72,
    borderRadius: 5,
    backgroundColor: '#e2e8f0',
  },
  playOverlay: {
    position: 'absolute',
    left: 130,
    top: 15,
  },
  approvalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approvalLabel: { fontSize: 12, color: '#000', marginBottom: 4 },
  approvalValue: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  approvalDate: { fontSize: 12, color: '#000', marginBottom: 4 },
  accountantApproved: { fontSize: 12, fontWeight: '500' },
  phaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  phaseName: { fontSize: 14, fontWeight: '500', color: '#000' },
  phaseRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phaseAmount: { fontSize: 14, fontWeight: '600', color: '#000' },
});
