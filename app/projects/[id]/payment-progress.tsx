/**
 * Payment Progress Screen
 * 🔥 UPDATED: Now uses real data from Perfex CRM Invoices
 */

import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PerfexInvoice, PerfexInvoicesService } from '@/services/perfexCRM';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface PaymentPhase {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  conditions: string;
  videoUrl?: string;
  checklist: ChecklistItem[];
  approver?: string;
  approvalDate?: string;
  paymentStatus: 'approved' | 'pending' | 'rejected';
}

interface ChecklistItem {
  id: string;
  name: string;
  completed: boolean;
}

// Fallback data khi CRM không khả dụng
const FALLBACK_PAYMENT_PHASES: PaymentPhase[] = [
  {
    id: '1',
    name: 'P-Wall (Sơn tường bao)',
    percentage: 30,
    amount: 90000000,
    conditions: 'Điều kiện đền hạn (Sơn xong lẫu 1)',
    videoUrl: 'https://example.com/video1.mp4',
    checklist: [
      { id: '1', name: 'Bả bột', completed: true },
      { id: '2', name: 'Sơn lót', completed: true },
      { id: '3', name: 'Sơn phủ', completed: true },
    ],
    approver: 'Hiệu Nguyễn',
    approvalDate: '12/05/2024',
    paymentStatus: 'pending',
  },
  {
    id: '2',
    name: 'Lần 2',
    percentage: 20,
    amount: 60000000,
    conditions: '',
    checklist: [],
    paymentStatus: 'pending',
  },
  {
    id: '3',
    name: 'Lần 3',
    percentage: 20,
    amount: 60000000,
    conditions: '',
    checklist: [],
    paymentStatus: 'pending',
  },
];

// Map Perfex invoice status to payment status
function mapInvoiceStatus(status: number): 'approved' | 'pending' | 'rejected' {
  switch (status) {
    case 2: return 'approved'; // Paid
    case 3: return 'approved'; // Partially Paid  
    case 4: return 'rejected'; // Overdue
    case 5: return 'rejected'; // Cancelled
    default: return 'pending'; // Unpaid, Draft
  }
}

// Format date from CRM
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Convert Perfex Invoice to PaymentPhase
function mapInvoiceToPhase(invoice: PerfexInvoice, index: number, total: number): PaymentPhase {
  const amount = parseFloat(invoice.total) || 0;
  const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
  
  return {
    id: invoice.id,
    name: `Đợt ${index + 1} - ${invoice.number || `INV-${invoice.id}`}`,
    percentage,
    amount,
    conditions: invoice.adminnote || '',
    checklist: [],
    approver: invoice.sale_agent_name || undefined,
    approvalDate: invoice.datepaid ? formatDate(invoice.datepaid) : undefined,
    paymentStatus: mapInvoiceStatus(invoice.status),
  };
}

export default function PaymentProgressScreen() {
  const params = useLocalSearchParams();
  const projectId = params.id as string;
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceMuted = useThemeColor({}, 'surfaceMuted');
  const borderStrong = useThemeColor({}, 'borderStrong');
  const mutedColor = useThemeColor({}, 'textMuted');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');
  const inverseText = useThemeColor({}, 'textInverse');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [phases, setPhases] = useState<PaymentPhase[]>(FALLBACK_PAYMENT_PHASES);
  const [dataSource, setDataSource] = useState<'crm' | 'mock'>('mock');
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);

  const totalAmount = phases.reduce((sum, p) => sum + p.amount, 0);
  const totalPercentage = 100;

  // Load invoices from CRM
  const loadPayments = useCallback(async () => {
    try {
      const response = await PerfexInvoicesService.getByProject(projectId);
      
      if (response.success && response.data && response.data.length > 0) {
        const totalValue = response.data.reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
        const mappedPhases = response.data.map((inv, idx) => 
          mapInvoiceToPhase(inv, idx, totalValue)
        );
        setPhases(mappedPhases);
        setExpandedPhaseId(mappedPhases[0]?.id || null);
        setDataSource('crm');
        console.log(`✅ Loaded ${mappedPhases.length} payment phases from CRM`);
      } else {
        throw new Error('Không có dữ liệu hóa đơn');
      }
    } catch (error) {
      console.warn('⚠️ CRM không khả dụng, sử dụng dữ liệu mẫu:', error);
      setPhases(FALLBACK_PAYMENT_PHASES);
      setExpandedPhaseId('1');
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const togglePhase = (phaseId: string) => {
    setExpandedPhaseId(expandedPhaseId === phaseId ? null : phaseId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return successColor;
      case 'pending':
        return warningColor;
      case 'rejected':
        return errorColor;
      default:
        return mutedColor;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Kế toán chưa duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return 'Chưa xác định';
    }
  };

  if (loading) {
    return (
      <Container style={{ backgroundColor }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: mutedColor }]}>Đang tải tiến độ thanh toán...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container style={{ backgroundColor }}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Tiến độ thanh toán
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Data Source Indicator */}
        {dataSource === 'mock' && (
          <View style={styles.mockIndicator}>
            <Text style={styles.mockIndicatorText}>📋 Dữ liệu mẫu - CRM không khả dụng</Text>
          </View>
        )}

        {/* Total Summary */}
        <View style={[styles.summaryCard, { backgroundColor: primaryColor + '20' }]}>
          <View style={styles.summaryRow}>
            <Ionicons name="checkmark-circle" size={24} color={primaryColor} />
            <View style={styles.summaryText}>
              <Text style={[styles.summaryLabel, { color: textColor }]}>
                Tổng số tiền:{' '}
                <Text style={[styles.summaryValue, { color: primaryColor }]}>
                  {totalAmount.toLocaleString('vi-VN')}đ
                </Text>
              </Text>
              <Text style={[styles.summaryLabel, { color: textColor }]}>
                Tổng tỷ lệ: {totalPercentage}%
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Phases */}
        {phases.map(phase => {
          const isExpanded = expandedPhaseId === phase.id;
          const statusColor = getStatusColor(phase.paymentStatus);
          const statusText = getStatusText(phase.paymentStatus);

          return (
            <View
              key={phase.id}
              style={[styles.phaseCard, { borderColor: borderColor, backgroundColor: surfaceColor }]}
            >
              {/* Phase Header */}
              <TouchableOpacity
                style={styles.phaseHeader}
                onPress={() => togglePhase(phase.id)}
              >
                <View style={styles.phaseInfo}>
                  <Text style={[styles.phaseName, { color: textColor }]}>
                    {phase.name}
                  </Text>
                  <Text style={[styles.phaseAmount, { color: mutedColor }]}>
                    Lần {phase.id} - {phase.percentage}% ({' '}
                    {phase.amount.toLocaleString('vi-VN')}đ)
                  </Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={textColor}
                />
              </TouchableOpacity>

              {/* Phase Details (Expanded) */}
              {isExpanded && (
                <View style={[styles.phaseDetails, { borderTopColor: borderStrong }]}>
                  {/* Conditions */}
                  {phase.conditions && (
                    <View style={styles.detailSection}>
                      <Text style={[styles.detailLabel, { color: textColor }]}>
                        {phase.conditions}
                      </Text>
                    </View>
                  )}

                  {/* Video Thumbnail */}
                  {phase.videoUrl && (
                    <View style={styles.videoSection}>
                      <View style={[styles.videoPlaceholder, { backgroundColor: surfaceMuted }]}>
                        <Ionicons name="play-circle" size={48} color={inverseText} />
                      </View>
                    </View>
                  )}

                  {/* Checklist */}
                  {phase.checklist.length > 0 && (
                    <View style={styles.checklistSection}>
                      {phase.checklist.map(item => (
                        <View key={item.id} style={styles.checklistItem}>
                          <Ionicons
                            name={
                              item.completed
                                ? 'checkmark-circle'
                                : 'ellipse-outline'
                            }
                            size={20}
                            color={item.completed ? successColor : mutedColor}
                          />
                          <Text
                            style={[
                              styles.checklistText,
                              {
                                color: item.completed ? textColor : mutedColor,
                                textDecorationLine: item.completed
                                  ? 'none'
                                  : 'none',
                              },
                            ]}
                          >
                            {item.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Approval Info */}
                  {phase.approver && (
                    <View style={styles.approvalSection}>
                      <View style={styles.approvalRow}>
                        <Text style={[styles.approvalLabel, { color: mutedColor }]}>
                          Giám sát duyệt
                        </Text>
                        <Text style={[styles.approvalValue, { color: primaryColor }]}>
                          {phase.approver}
                        </Text>
                      </View>
                      <View style={styles.approvalRow}>
                        <Text style={[styles.approvalLabel, { color: mutedColor }]}>
                          Ngày {phase.approvalDate}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Payment Status */}
                  <View style={[styles.statusSection, { borderTopColor: borderStrong }]}>
                    <Text style={[styles.statusLabel, { color: mutedColor }]}>
                      Trạng thái thanh toán
                    </Text>
                    <Text style={[styles.statusValue, { color: statusColor }]}>
                      {statusText}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  mockIndicator: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  mockIndicatorText: {
    color: '#92400E',
    fontSize: 12,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 15,
    marginBottom: 4,
  },
  summaryValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  phaseCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  phaseAmount: {
    fontSize: 14,
  },
  phaseDetails: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  detailSection: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  videoSection: {
    marginBottom: 12,
  },
  videoPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistSection: {
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  checklistText: {
    fontSize: 14,
    flex: 1,
  },
  approvalSection: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  approvalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  approvalLabel: {
    fontSize: 13,
  },
  approvalValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statusLabel: {
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
