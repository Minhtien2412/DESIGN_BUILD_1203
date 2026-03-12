/**
 * Reports List Screen
 * View and manage project reports
 */

import { useReports, useReportTemplates } from '@/hooks/useReporting';
import { ReportFormat, ReportStatus, ReportType } from '@/types/reporting';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const REPORT_TYPES: { value: ReportType; label: string; icon: string }[] = [
  { value: ReportType.PROJECT_SUMMARY, label: 'Tổng quan', icon: 'document-text' },
  { value: ReportType.FINANCIAL, label: 'Tài chính', icon: 'cash' },
  { value: ReportType.PROGRESS, label: 'Tiến độ', icon: 'trending-up' },
  { value: ReportType.RESOURCE, label: 'Nguồn lực', icon: 'people' },
  { value: ReportType.QUALITY, label: 'Chất lượng', icon: 'star' },
  { value: ReportType.SAFETY, label: 'An toàn', icon: 'shield-checkmark' },
  { value: ReportType.RISK, label: 'Rủi ro', icon: 'warning' },
  { value: ReportType.SCHEDULE, label: 'Lịch trình', icon: 'calendar' },
];

export default function ReportsListScreen() {
  const [projectId] = useState('project-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ReportType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  const { reports, loading, create, generate } = useReports({
    projectId,
    type: selectedType !== 'ALL' ? selectedType : undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
  });

  const { templates } = useReportTemplates(projectId);

  const [newReport, setNewReport] = useState({
    templateId: '',
    name: '',
    description: '',
    period: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
  });

  const filteredReports = reports.filter((report) =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: reports.length,
    ready: reports.filter((r) => r.status === 'READY').length,
    generating: reports.filter((r) => r.status === 'GENERATING').length,
    failed: reports.filter((r) => r.status === 'FAILED').length,
  };

  const handleCreateReport = async () => {
    if (!newReport.templateId || !newReport.name.trim()) {
      return;
    }

    try {
      const report = await create({
        projectId,
        templateId: newReport.templateId,
        name: newReport.name,
        description: newReport.description,
        period: {
          startDate: newReport.period.startDate.toISOString(),
          endDate: newReport.period.endDate.toISOString(),
        },
      });
      
      // Auto-generate after creation
      await generate(report.id);
      
      setShowCreateModal(false);
      setNewReport({
        templateId: '',
        name: '',
        description: '',
        period: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
        },
      });
    } catch (err) {
      console.error('Failed to create report:', err);
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'DRAFT':
        return '#999999';
      case 'GENERATING':
        return '#0D9488';
      case 'READY':
        return '#0D9488';
      case 'DELIVERED':
        return '#0D9488';
      case 'ARCHIVED':
        return '#757575';
      case 'FAILED':
        return '#000000';
      default:
        return '#999999';
    }
  };

  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'NHÁP';
      case 'GENERATING':
        return 'ĐANG TẠO';
      case 'READY':
        return 'SẴN SÀNG';
      case 'DELIVERED':
        return 'ĐÃ GỬI';
      case 'ARCHIVED':
        return 'LƯU TRỮ';
      case 'FAILED':
        return 'THẤT BẠI';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: ReportType) => {
    const found = REPORT_TYPES.find((t) => t.value === type);
    return found?.icon || 'document';
  };

  const getTypeLabel = (type: ReportType) => {
    const found = REPORT_TYPES.find((t) => t.value === type);
    return found?.label || type;
  };

  const renderReportCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.reportCard}>
      {/* Icon & header */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: `${getStatusColor(item.status)}15` },
          ]}
        >
          <Ionicons name={getTypeIcon(item.type) as any} size={28} color={getStatusColor(item.status)} />
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.reportNumber}>{item.reportNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusBadgeText}>{getStatusLabel(item.status)}</Text>
            </View>
          </View>
          <Text style={styles.reportName}>{item.name}</Text>
          <Text style={styles.typeLabel}>{getTypeLabel(item.type)}</Text>
        </View>
      </View>

      {/* Description */}
      {item.description && (
        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {/* Period */}
      <View style={styles.periodRow}>
        <Ionicons name="calendar" size={14} color="#666" />
        <Text style={styles.periodText}>
          {new Date(item.period.startDate).toLocaleDateString('vi-VN')} -{' '}
          {new Date(item.period.endDate).toLocaleDateString('vi-VN')}
        </Text>
      </View>

      {/* Formats */}
      {item.formats && item.formats.length > 0 && (
        <View style={styles.formatsRow}>
          {item.formats.map((format: ReportFormat, index: number) => (
            <View key={index} style={styles.formatBadge}>
              <Ionicons name="document-outline" size={12} color="#0D9488" />
              <Text style={styles.formatText}>{format}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="person" size={14} color="#666" />
          <Text style={styles.footerText}>{item.generatedByName}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="time" size={14} color="#666" />
          <Text style={styles.footerText}>
            {new Date(item.generatedAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      {item.status === 'READY' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="eye" size={18} color="#0D9488" />
            <Text style={styles.actionButtonText}>Xem</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download" size={18} color="#0D9488" />
            <Text style={styles.actionButtonText}>Tải về</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="send" size={18} color="#0D9488" />
            <Text style={styles.actionButtonText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Generating indicator */}
      {item.status === 'GENERATING' && (
        <View style={styles.generatingRow}>
          <ActivityIndicator size="small" color="#0D9488" />
          <Text style={styles.generatingText}>Đang tạo báo cáo...</Text>
        </View>
      )}

      {/* Error */}
      {item.status === 'FAILED' && item.error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={16} color="#000000" />
          <Text style={styles.errorText}>{item.error}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && reports.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Đang tải báo cáo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats header */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{stats.ready}</Text>
          <Text style={styles.statLabel}>Sẵn sàng</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F0FDFA' }]}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{stats.generating}</Text>
          <Text style={styles.statLabel}>Đang tạo</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F5F5F5' }]}>
          <Text style={[styles.statValue, { color: '#000000' }]}>{stats.failed}</Text>
          <Text style={styles.statLabel}>Thất bại</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm báo cáo..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Type filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterChip, selectedType === 'ALL' && styles.filterChipActive]}
          onPress={() => setSelectedType('ALL')}
        >
          <Text style={[styles.filterChipText, selectedType === 'ALL' && styles.filterChipTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        {REPORT_TYPES.slice(0, 8).map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[styles.filterChip, selectedType === type.value && styles.filterChipActive]}
            onPress={() => setSelectedType(type.value)}
          >
            <Ionicons
              name={type.icon as any}
              size={16}
              color={selectedType === type.value ? '#0D9488' : '#666'}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedType === type.value && styles.filterChipTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Reports list */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={renderReportCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>Chưa có báo cáo nào</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setShowCreateModal(true)}>
              <Text style={styles.emptyButtonText}>Tạo báo cáo</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create button */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Create modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo báo cáo mới</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Template selection */}
              <Text style={styles.inputLabel}>Mẫu báo cáo</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateChips}>
                {templates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={[
                      styles.templateChip,
                      newReport.templateId === template.id && styles.templateChipSelected,
                    ]}
                    onPress={() => setNewReport({ ...newReport, templateId: template.id })}
                  >
                    <Ionicons
                      name={getTypeIcon(template.type) as any}
                      size={20}
                      color={newReport.templateId === template.id ? '#0D9488' : '#666'}
                    />
                    <Text
                      style={[
                        styles.templateChipText,
                        newReport.templateId === template.id && styles.templateChipTextSelected,
                      ]}
                    >
                      {template.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Name */}
              <Text style={styles.inputLabel}>Tên báo cáo</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên báo cáo"
                value={newReport.name}
                onChangeText={(text) => setNewReport({ ...newReport, name: text })}
              />

              {/* Description */}
              <Text style={styles.inputLabel}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả báo cáo (tùy chọn)"
                value={newReport.description}
                onChangeText={(text) => setNewReport({ ...newReport, description: text })}
                multiline
                numberOfLines={3}
              />

              {/* Period */}
              <Text style={styles.inputLabel}>Thời gian báo cáo</Text>
              <View style={styles.dateRow}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker('start')}
                >
                  <Ionicons name="calendar" size={18} color="#666" />
                  <Text style={styles.dateButtonText}>
                    {newReport.period.startDate.toLocaleDateString('vi-VN')}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.dateSeparator}>-</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker('end')}
                >
                  <Ionicons name="calendar" size={18} color="#666" />
                  <Text style={styles.dateButtonText}>
                    {newReport.period.endDate.toLocaleDateString('vi-VN')}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={showDatePicker === 'start' ? newReport.period.startDate : newReport.period.endDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(null);
                    if (selectedDate) {
                      setNewReport({
                        ...newReport,
                        period: {
                          ...newReport.period,
                          [showDatePicker === 'start' ? 'startDate' : 'endDate']: selectedDate,
                        },
                      });
                    }
                  }}
                />
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreateReport}
              >
                <Text style={styles.modalButtonTextPrimary}>Tạo và chạy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterScroll: {
    maxHeight: 50,
    marginBottom: 12,
    paddingLeft: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#F0FDFA',
    borderBottomWidth: 2,
    borderBottomColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#0D9488',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportNumber: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  reportName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 13,
    color: '#666',
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  periodText: {
    fontSize: 13,
    color: '#666',
  },
  formatsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  formatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0FDFA',
    borderRadius: 4,
  },
  formatText: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  actionButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0FDFA',
  },
  generatingText: {
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '600',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#000000',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  templateChips: {
    marginBottom: 12,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  templateChipSelected: {
    borderColor: '#0D9488',
    borderWidth: 2,
    backgroundColor: '#F0FDFA',
  },
  templateChipText: {
    fontSize: 13,
    color: '#666',
  },
  templateChipTextSelected: {
    color: '#0D9488',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
    gap: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
  },
  dateSeparator: {
    fontSize: 14,
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#F5F5F5',
  },
  modalButtonPrimary: {
    backgroundColor: '#0D9488',
  },
  modalButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
