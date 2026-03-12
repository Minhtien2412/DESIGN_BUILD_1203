/**
 * Risk Register Screen
 * List and manage project risks with filtering
 */

import { useRisks } from '@/hooks/useRisk';
import { RiskCategory, RiskImpact, RiskLevel, RiskProbability, RiskStatus } from '@/types/risk';
import { Ionicons } from '@expo/vector-icons';
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

const CATEGORIES: { value: RiskCategory; label: string; icon: string }[] = [
  { value: RiskCategory.SAFETY, label: 'An toàn', icon: 'shield-checkmark' },
  { value: RiskCategory.TECHNICAL, label: 'Kỹ thuật', icon: 'construct' },
  { value: RiskCategory.FINANCIAL, label: 'Tài chính', icon: 'cash' },
  { value: RiskCategory.SCHEDULE, label: 'Tiến độ', icon: 'time' },
  { value: RiskCategory.QUALITY, label: 'Chất lượng', icon: 'star' },
  { value: RiskCategory.ENVIRONMENTAL, label: 'Môi trường', icon: 'leaf' },
  { value: RiskCategory.LEGAL, label: 'Pháp lý', icon: 'document-text' },
  { value: RiskCategory.RESOURCE, label: 'Nguồn lực', icon: 'people' },
  { value: RiskCategory.SUPPLY_CHAIN, label: 'Chuỗi cung ứng', icon: 'git-network' },
  { value: RiskCategory.WEATHER, label: 'Thời tiết', icon: 'rainy' },
  { value: RiskCategory.STAKEHOLDER, label: 'Bên liên quan', icon: 'people-circle' },
  { value: RiskCategory.REGULATORY, label: 'Quy định', icon: 'shield' },
];

export default function RiskRegisterScreen() {
  const [projectId] = useState('project-1'); // From context in real app
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RiskCategory | 'ALL'>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<RiskLevel | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<RiskStatus | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { risks, loading, error, create } = useRisks({
    projectId,
    category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
    level: selectedLevel !== 'ALL' ? selectedLevel : undefined,
  });

  const [newRisk, setNewRisk] = useState({
    category: RiskCategory.TECHNICAL as RiskCategory,
    title: '',
    description: '',
    probability: RiskProbability.MEDIUM,
    impact: RiskImpact.MODERATE,
  });

  const filteredRisks = risks.filter((risk) =>
    risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    risk.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: risks.length,
    critical: risks.filter((r) => r.riskLevel === 'CRITICAL').length,
    high: risks.filter((r) => r.riskLevel === 'HIGH').length,
    medium: risks.filter((r) => r.riskLevel === 'MEDIUM').length,
  };

  const handleCreateRisk = async () => {
    if (!newRisk.title.trim()) {
      return;
    }

    try {
      await create({
        projectId,
        ...newRisk,
      });
      setShowCreateModal(false);
      setNewRisk({
        category: RiskCategory.TECHNICAL,
        title: '',
        description: '',
        probability: RiskProbability.MEDIUM,
        impact: RiskImpact.MODERATE,
      });
    } catch (err) {
      console.error('Failed to create risk:', err);
    }
  };

  const getLevelColor = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return '#B71C1C';
      case 'HIGH':
        return '#000000';
      case 'MEDIUM':
        return '#0D9488';
      case 'LOW':
        return '#0D9488';
      default:
        return '#999999';
    }
  };

  const getLevelLabel = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'NGHIÊM TRỌNG';
      case 'HIGH':
        return 'CAO';
      case 'MEDIUM':
        return 'TRUNG BÌNH';
      case 'LOW':
        return 'THẤP';
      default:
        return level;
    }
  };

  const getStatusColor = (status: RiskStatus) => {
    switch (status) {
      case 'IDENTIFIED':
        return '#0D9488';
      case 'ANALYZING':
        return '#0D9488';
      case 'PLANNING':
        return '#0D9488';
      case 'MONITORING':
        return '#0D9488';
      case 'MITIGATING':
        return '#0D9488';
      case 'RESOLVED':
        return '#0D9488';
      case 'OCCURRED':
        return '#000000';
      case 'CLOSED':
        return '#999999';
      default:
        return '#999999';
    }
  };

  const getStatusLabel = (status: RiskStatus) => {
    switch (status) {
      case 'IDENTIFIED':
        return 'ĐÃ XÁC ĐỊNH';
      case 'ANALYZING':
        return 'ĐANG PHÂN TÍCH';
      case 'PLANNING':
        return 'LÊN KẾ HOẠCH';
      case 'MONITORING':
        return 'THEO DÕI';
      case 'MITIGATING':
        return 'GIẢM THIỂU';
      case 'RESOLVED':
        return 'ĐÃ GIẢI QUYẾT';
      case 'OCCURRED':
        return 'ĐÃ XẢY RA';
      case 'CLOSED':
        return 'ĐÃ ĐÓNG';
      default:
        return status;
    }
  };

  const getCategoryIcon = (category: RiskCategory) => {
    const found = CATEGORIES.find((c) => c.value === category);
    return found?.icon || 'help-circle';
  };

  const getCategoryLabel = (category: RiskCategory) => {
    const found = CATEGORIES.find((c) => c.value === category);
    return found?.label || category;
  };

  const renderRiskCard = ({ item }: { item: any }) => (
    <View style={styles.riskCard}>
      {/* Level indicator */}
      <View style={[styles.levelIndicator, { backgroundColor: getLevelColor(item.riskLevel) }]} />

      {/* Icon & header */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: `${getLevelColor(item.riskLevel)}15` },
          ]}
        >
          <Ionicons name={getCategoryIcon(item.category) as any} size={28} color={getLevelColor(item.riskLevel)} />
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.riskNumber}>{item.riskNumber}</Text>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.riskLevel) }]}>
              <Text style={styles.levelBadgeText}>{getLevelLabel(item.riskLevel)}</Text>
            </View>
          </View>
          <Text style={styles.riskTitle}>{item.title}</Text>
          <Text style={styles.categoryLabel}>{getCategoryLabel(item.category)}</Text>
        </View>
      </View>

      {/* Description */}
      {item.description && (
        <Text style={styles.riskDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {/* Status & Score */}
      <View style={styles.metaRow}>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
        <View style={styles.scoreInfo}>
          <Ionicons name="analytics" size={14} color="#666" />
          <Text style={styles.scoreText}>Điểm rủi ro: {item.riskScore}</Text>
        </View>
      </View>

      {/* Owner & Date */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="person" size={14} color="#666" />
          <Text style={styles.footerText}>{item.ownerName}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="calendar" size={14} color="#666" />
          <Text style={styles.footerText}>
            {new Date(item.identifiedDate).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>

      {/* Escalation warning */}
      {item.escalationRequired && (
        <View style={styles.escalationWarning}>
          <Ionicons name="warning" size={16} color="#000000" />
          <Text style={styles.escalationText}>Cần báo cáo cấp trên</Text>
        </View>
      )}
    </View>
  );

  if (loading && risks.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Đang tải danh sách rủi ro...</Text>
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
        <View style={[styles.statCard, { backgroundColor: '#F5F5F5' }]}>
          <Text style={[styles.statValue, { color: '#B71C1C' }]}>{stats.critical}</Text>
          <Text style={styles.statLabel}>Nghiêm trọng</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F0FDFA' }]}>
          <Text style={[styles.statValue, { color: '#000000' }]}>{stats.high}</Text>
          <Text style={styles.statLabel}>Cao</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F0F8FF' }]}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{stats.medium}</Text>
          <Text style={styles.statLabel}>Trung bình</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm rủi ro..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterChip, selectedCategory === 'ALL' && styles.filterChipActive]}
          onPress={() => setSelectedCategory('ALL')}
        >
          <Text style={[styles.filterChipText, selectedCategory === 'ALL' && styles.filterChipTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        {CATEGORIES.slice(0, 8).map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.filterChip, selectedCategory === cat.value && styles.filterChipActive]}
            onPress={() => setSelectedCategory(cat.value)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={selectedCategory === cat.value ? '#0D9488' : '#666'}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === cat.value && styles.filterChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Level filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelFilterScroll}>
        <TouchableOpacity
          style={[styles.levelChip, selectedLevel === 'ALL' && styles.levelChipActive]}
          onPress={() => setSelectedLevel('ALL')}
        >
          <Text style={[styles.levelChipText, selectedLevel === 'ALL' && styles.levelChipTextActive]}>
            Tất cả mức độ
          </Text>
        </TouchableOpacity>
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RiskLevel[]).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.levelChip,
              { borderColor: getLevelColor(level) },
              selectedLevel === level && { backgroundColor: `${getLevelColor(level)}15` },
            ]}
            onPress={() => setSelectedLevel(level)}
          >
            <Text style={[styles.levelChipText, { color: getLevelColor(level) }]}>
              {getLevelLabel(level)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Risk list */}
      <FlatList
        data={filteredRisks}
        keyExtractor={(item) => item.id}
        renderItem={renderRiskCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>Chưa có rủi ro nào</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setShowCreateModal(true)}>
              <Text style={styles.emptyButtonText}>Thêm rủi ro</Text>
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
              <Text style={styles.modalTitle}>Thêm rủi ro mới</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Category selection */}
              <Text style={styles.inputLabel}>Loại rủi ro</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryChips}>
                {CATEGORIES.slice(0, 6).map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryChip,
                      newRisk.category === cat.value && styles.categoryChipSelected,
                    ]}
                    onPress={() => setNewRisk({ ...newRisk, category: cat.value })}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={20}
                      color={newRisk.category === cat.value ? '#0D9488' : '#666'}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        newRisk.category === cat.value && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Title */}
              <Text style={styles.inputLabel}>Tiêu đề</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tiêu đề rủi ro"
                value={newRisk.title}
                onChangeText={(text) => setNewRisk({ ...newRisk, title: text })}
              />

              {/* Description */}
              <Text style={styles.inputLabel}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả chi tiết rủi ro"
                value={newRisk.description}
                onChangeText={(text) => setNewRisk({ ...newRisk, description: text })}
                multiline
                numberOfLines={4}
              />
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
                onPress={handleCreateRisk}
              >
                <Text style={styles.modalButtonTextPrimary}>Tạo rủi ro</Text>
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
  levelFilterScroll: {
    maxHeight: 50,
    marginBottom: 12,
    paddingLeft: 16,
  },
  levelChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  levelChipActive: {
    borderWidth: 2,
  },
  levelChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  levelChipTextActive: {
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  riskCard: {
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
  levelIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
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
  riskNumber: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 13,
    color: '#666',
  },
  riskDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
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
  escalationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFE0E0',
  },
  escalationText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
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
  categoryChips: {
    marginBottom: 12,
  },
  categoryChip: {
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
  categoryChipSelected: {
    borderColor: '#0D9488',
    borderWidth: 2,
    backgroundColor: '#F0FDFA',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#666',
  },
  categoryChipTextSelected: {
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
    minHeight: 100,
    textAlignVertical: 'top',
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
