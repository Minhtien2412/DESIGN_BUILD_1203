import { useContract, useMilestones, useSignatures } from '@/hooks/useContracts';
import type { ContractStatus } from '@/types/contracts';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const STATUS_CONFIG: Record<
  ContractStatus,
  { label: string; color: string; icon: string }
> = {
  DRAFT: { label: 'Nháp', color: '#999999', icon: 'document-outline' },
  PENDING_SIGNATURE: {
    label: 'Chờ ký',
    color: '#0066CC',
    icon: 'create-outline',
  },
  ACTIVE: { label: 'Đang thực hiện', color: '#0066CC', icon: 'checkmark-circle' },
  COMPLETED: { label: 'Hoàn thành', color: '#0066CC', icon: 'checkmark-done' },
  TERMINATED: { label: 'Chấm dứt', color: '#000000', icon: 'close-circle' },
  EXPIRED: { label: 'Hết hạn', color: '#757575', icon: 'time-outline' },
};

export default function ContractDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contract, loading } = useContract(id!);
  const { signatures } = useSignatures(id!);
  const { milestones } = useMilestones(id!);

  if (loading || !contract) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  const statusConfig = STATUS_CONFIG[contract.status];
  const signedCount = signatures.filter((s) => s.status === 'SIGNED').length;
  const completedMilestones = milestones.filter((m) => m.status === 'COMPLETED').length;
  const totalMilestoneValue = milestones.reduce((sum, m) => sum + m.value, 0);
  const paidValue = milestones
    .filter((m) => m.paymentStatus === 'PAID')
    .reduce((sum, m) => sum + m.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const handleEdit = () => {
    router.push(`/contracts/${id}/edit`);
  };

  const handleSign = () => {
    router.push(`/contracts/${id}/sign`);
  };

  const handleViewMilestones = () => {
    router.push(`/contracts/${id}/milestones`);
  };

  const handleDownloadPDF = () => {
    Alert.alert(
      'Tải xuống PDF',
      'Tính năng xuất PDF sẽ được triển khai sau',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.contractNumber}>{contract.contractNumber}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.color + '20' },
              ]}
            >
              <Ionicons
                name={statusConfig.icon as any}
                size={14}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{contract.title}</Text>
          <Text style={styles.description}>{contract.description}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={24} color="#0066CC" />
            <Text style={styles.statValue}>{formatCurrency(contract.totalValue)}</Text>
            <Text style={styles.statLabel}>Giá trị hợp đồng</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#0066CC" />
            <Text style={styles.statValue}>
              {Math.ceil(
                (new Date(contract.endDate).getTime() -
                  new Date(contract.startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{' '}
              ngày
            </Text>
            <Text style={styles.statLabel}>Thời gian thực hiện</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thời gian</Text>
          <View style={styles.timelineRow}>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Ngày bắt đầu</Text>
              <Text style={styles.timelineValue}>
                {formatDate(contract.startDate)}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#999" />
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Ngày kết thúc</Text>
              <Text style={styles.timelineValue}>{formatDate(contract.endDate)}</Text>
            </View>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Các bên tham gia</Text>
          {contract.parties.map((party, index) => (
            <View key={party.id} style={styles.partyCard}>
              <View style={styles.partyHeader}>
                <View style={styles.partyRole}>
                  <Ionicons name="person" size={16} color="#0066CC" />
                  <Text style={styles.partyRoleText}>{party.role}</Text>
                </View>
              </View>
              <Text style={styles.partyName}>{party.name}</Text>
              <Text style={styles.partyCompany}>{party.companyName}</Text>
              <View style={styles.partyInfo}>
                <Ionicons name="mail-outline" size={14} color="#666" />
                <Text style={styles.partyInfoText}>{party.email}</Text>
              </View>
              <View style={styles.partyInfo}>
                <Ionicons name="call-outline" size={14} color="#666" />
                <Text style={styles.partyInfoText}>{party.phone}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Signatures */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chữ ký</Text>
            <Text style={styles.sectionSubtitle}>
              {signedCount}/{signatures.length} đã ký
            </Text>
          </View>
          <TouchableOpacity style={styles.actionCard} onPress={handleSign}>
            <Ionicons name="create" size={24} color="#0066CC" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Quản lý chữ ký</Text>
              <Text style={styles.actionSubtitle}>
                Ký hoặc xem trạng thái chữ ký
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cột mốc thanh toán</Text>
            <Text style={styles.sectionSubtitle}>
              {completedMilestones}/{milestones.length} hoàn thành
            </Text>
          </View>
          <View style={styles.milestoneStats}>
            <View style={styles.milestoneStatItem}>
              <Text style={styles.milestoneStatLabel}>Tổng giá trị</Text>
              <Text style={styles.milestoneStatValue}>
                {formatCurrency(totalMilestoneValue)}
              </Text>
            </View>
            <View style={styles.milestoneStatItem}>
              <Text style={styles.milestoneStatLabel}>Đã thanh toán</Text>
              <Text style={[styles.milestoneStatValue, { color: '#0066CC' }]}>
                {formatCurrency(paidValue)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.actionCard} onPress={handleViewMilestones}>
            <Ionicons name="flag" size={24} color="#0066CC" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Xem chi tiết cột mốc</Text>
              <Text style={styles.actionSubtitle}>
                Quản lý và theo dõi tiến độ thanh toán
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Documents */}
        {contract.documents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tài liệu đính kèm</Text>
            {contract.documents.map((doc) => (
              <View key={doc.id} style={styles.documentCard}>
                <Ionicons name="document-text" size={24} color="#666" />
                <View style={styles.documentContent}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  <Text style={styles.documentMeta}>
                    {doc.type} • {(doc.size / 1024).toFixed(0)} KB
                  </Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="download-outline" size={24} color="#0066CC" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleDownloadPDF}>
          <Ionicons name="download" size={20} color="#0066CC" />
          <Text style={styles.secondaryButtonText}>Tải PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleEdit}>
          <Ionicons name="create" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contractNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066CC',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  timelineItem: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  timelineValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  partyCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  partyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  partyRole: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partyRoleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066CC',
  },
  partyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  partyCompany: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  partyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  partyInfoText: {
    fontSize: 12,
    color: '#666',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  milestoneStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  milestoneStatItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  milestoneStatLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  milestoneStatValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentContent: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  documentMeta: {
    fontSize: 11,
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#0066CC',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
