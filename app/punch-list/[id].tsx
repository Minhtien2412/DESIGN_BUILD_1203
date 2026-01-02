/**
 * Punch List Detail Screen
 * Complete punch list view with all items
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePunchList, usePunchLists } from '@/hooks/usePunchList';
import type {
    PunchItemCategory,
    PunchItemPriority,
    PunchItemStatus,
    PunchListItem,
    PunchListStatus
} from '@/types/punch-list';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PunchListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { punchList, loading, error } = usePunchList(id);
  const {
    markItemReadyForReview,
    verifyPunchItem,
    rejectPunchItem,
    closePunchItem,
  } = usePunchLists({});

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PunchListItem | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [inspectionResult, setInspectionResult] = useState<'PASS' | 'FAIL'>('PASS');

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');
  const secondaryText = useThemeColor({}, 'textMuted');

  // Status colors
  const getStatusColor = (status: PunchListStatus): { bg: string; text: string } => {
    const colors: Record<PunchListStatus, { bg: string; text: string }> = {
      DRAFT: { bg: '#F3F4F6', text: '#374151' },
      SUBMITTED: { bg: '#DBEAFE', text: '#1E40AF' },
      IN_PROGRESS: { bg: '#FEF3C7', text: '#92400E' },
      COMPLETED: { bg: '#D1FAE5', text: '#065F46' },
      CLOSED: { bg: '#E5E7EB', text: '#6B7280' },
    };
    return colors[status];
  };

  const getItemStatusColor = (status: PunchItemStatus): { bg: string; text: string } => {
    const colors: Record<PunchItemStatus, { bg: string; text: string }> = {
      OPEN: { bg: '#DBEAFE', text: '#1E40AF' },
      IN_PROGRESS: { bg: '#FEF3C7', text: '#92400E' },
      READY_FOR_REVIEW: { bg: '#E0E7FF', text: '#3730A3' },
      REJECTED: { bg: '#FEE2E2', text: '#991B1B' },
      COMPLETED: { bg: '#D1FAE5', text: '#065F46' },
      VERIFIED: { bg: '#D1FAE5', text: '#047857' },
      CLOSED: { bg: '#F3F4F6', text: '#6B7280' },
    };
    return colors[status];
  };

  const getPriorityColor = (priority: PunchItemPriority): { bg: string; text: string } => {
    const colors: Record<PunchItemPriority, { bg: string; text: string }> = {
      LOW: { bg: '#E5E7EB', text: '#6B7280' },
      MEDIUM: { bg: '#FEF3C7', text: '#92400E' },
      HIGH: { bg: '#FED7AA', text: '#C2410C' },
      CRITICAL: { bg: '#FEE2E2', text: '#991B1B' },
    };
    return colors[priority];
  };

  const getCategoryIcon = (category: PunchItemCategory): string => {
    const icons: Record<PunchItemCategory, string> = {
      ARCHITECTURAL: 'home-outline',
      STRUCTURAL: 'construct-outline',
      MECHANICAL: 'cog-outline',
      ELECTRICAL: 'flash-outline',
      PLUMBING: 'water-outline',
      HVAC: 'snow-outline',
      FIRE_PROTECTION: 'flame-outline',
      FINISHES: 'color-palette-outline',
      LANDSCAPING: 'leaf-outline',
      SAFETY: 'shield-outline',
      QUALITY: 'checkmark-circle-outline',
      OTHER: 'ellipsis-horizontal-outline',
    };
    return icons[category];
  };

  // Format date
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Handle verify item
  const handleVerifyItem = async () => {
    if (!punchList || !selectedItem) return;

    try {
      await verifyPunchItem(punchList.id, selectedItem.id, {
        verificationMethod: 'VISUAL_INSPECTION',
        inspectionResult: inspectionResult,
        verificationNotes,
      });
      setShowVerifyModal(false);
      setSelectedItem(null);
      setVerificationNotes('');
    } catch (err) {
      console.error('Failed to verify item:', err);
    }
  };

  if (loading || !punchList) {
    return (
      <Container>
        <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 40 }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Section>
          <ThemedText style={{ color: '#EF4444', textAlign: 'center' }}>
            Error: {error.message}
          </ThemedText>
        </Section>
      </Container>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Container>
        {/* Header */}
        <Section>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <ThemedText style={styles.listNumber}>#{punchList.listNumber}</ThemedText>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      punchList.listType === 'FINAL'
                        ? '#FEE2E2'
                        : punchList.listType === 'SUBSTANTIAL_COMPLETION'
                          ? '#DBEAFE'
                          : '#FEF3C7',
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.typeBadgeText,
                    {
                      color:
                        punchList.listType === 'FINAL'
                          ? '#991B1B'
                          : punchList.listType === 'SUBSTANTIAL_COMPLETION'
                            ? '#1E40AF'
                            : '#92400E',
                    },
                  ]}
                >
                  {punchList.listType.replace(/_/g, ' ')}
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(punchList.status).bg },
              ]}
            >
              <ThemedText
                style={[
                  styles.statusBadgeText,
                  { color: getStatusColor(punchList.status).text },
                ]}
              >
                {punchList.status}
              </ThemedText>
            </View>
          </View>

          <ThemedText type="title" style={{ marginTop: 12, marginBottom: 16 }}>
            {punchList.title}
          </ThemedText>

          {/* Info Grid */}
          <View style={[styles.infoCard, { backgroundColor: cardBackground, borderColor }]}>
            {(punchList.area || punchList.building) && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color={primaryColor} />
                <ThemedText style={styles.infoLabel}>Location:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {punchList.area || punchList.building}
                </ThemedText>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={primaryColor} />
              <ThemedText style={styles.infoLabel}>Created:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDate(punchList.createdDate)}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color={primaryColor} />
              <ThemedText style={styles.infoLabel}>Prepared by:</ThemedText>
              <ThemedText style={styles.infoValue}>{punchList.preparedBy.name}</ThemedText>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}>
              <ThemedText style={styles.statValue}>{punchList.totalItems}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryText }]}>
                Total Items
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}>
              <ThemedText style={[styles.statValue, { color: '#3B82F6' }]}>
                {punchList.openItems}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryText }]}>Open</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}>
              <ThemedText style={[styles.statValue, { color: '#F59E0B' }]}>
                {punchList.inProgressItems}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryText }]}>
                In Progress
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}>
              <ThemedText style={[styles.statValue, { color: '#10B981' }]}>
                {punchList.completedItems}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryText }]}>
                Completed
              </ThemedText>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${punchList.completionRate}%`,
                  backgroundColor:
                    punchList.completionRate === 100
                      ? '#10B981'
                      : punchList.completionRate >= 50
                        ? '#3B82F6'
                        : '#F59E0B',
                },
              ]}
            />
          </View>
          <ThemedText style={[styles.progressText, { color: secondaryText }]}>
            {punchList.completionRate}% Complete
          </ThemedText>
        </Section>

        {/* Punch Items */}
        <Section>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={20} color={primaryColor} />
            <ThemedText type="subtitle">Punch Items ({punchList.items.length})</ThemedText>
          </View>

          {punchList.items.length === 0 ? (
            <ThemedView style={{ padding: 20, alignItems: 'center' }}>
              <Ionicons name="checkmark-circle-outline" size={48} color={secondaryText} />
              <ThemedText style={{ marginTop: 8, color: secondaryText }}>
                No items in this list
              </ThemedText>
            </ThemedView>
          ) : (
            punchList.items.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemCard, { backgroundColor: cardBackground, borderColor }]}
                onPress={() => {
                  if (item.status === 'READY_FOR_REVIEW') {
                    setSelectedItem(item);
                    setShowVerifyModal(true);
                  }
                }}
              >
                {/* Item Header */}
                <View style={styles.itemHeader}>
                  <View style={styles.itemHeaderLeft}>
                    <Ionicons
                      name={getCategoryIcon(item.category) as any}
                      size={20}
                      color={primaryColor}
                    />
                    <ThemedText style={styles.itemNumber}>#{item.itemNumber}</ThemedText>
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(item.priority).bg },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.priorityBadgeText,
                          { color: getPriorityColor(item.priority).text },
                        ]}
                      >
                        {item.priority}
                      </ThemedText>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.itemStatusBadge,
                      { backgroundColor: getItemStatusColor(item.status).bg },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.itemStatusText,
                        { color: getItemStatusColor(item.status).text },
                      ]}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </ThemedText>
                  </View>
                </View>

                {/* Title & Description */}
                <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                <ThemedText style={[styles.itemDescription, { color: secondaryText }]}>
                  {item.description}
                </ThemedText>

                {/* Location */}
                <View style={styles.itemInfo}>
                  <Ionicons name="location-outline" size={14} color={secondaryText} />
                  <ThemedText style={[styles.itemInfoText, { color: secondaryText }]}>
                    {item.location}
                    {item.room && ` - ${item.room}`}
                  </ThemedText>
                </View>

                {/* Assigned To */}
                {item.assignedTo && (
                  <View style={styles.itemInfo}>
                    <Ionicons name="person-outline" size={14} color={secondaryText} />
                    <ThemedText style={[styles.itemInfoText, { color: secondaryText }]}>
                      Assigned: {item.assignedTo.name} ({item.assignedTo.company})
                    </ThemedText>
                  </View>
                )}

                {/* Due Date */}
                {item.dueDate && (
                  <View style={styles.itemInfo}>
                    <Ionicons name="calendar-outline" size={14} color={secondaryText} />
                    <ThemedText
                      style={[
                        styles.itemInfoText,
                        {
                          color:
                            new Date(item.dueDate) < new Date() && item.status !== 'COMPLETED'
                              ? '#EF4444'
                              : secondaryText,
                        },
                      ]}
                    >
                      Due: {formatDate(item.dueDate)}
                    </ThemedText>
                  </View>
                )}

                {/* Progress */}
                {item.percentComplete !== undefined && item.status === 'IN_PROGRESS' && (
                  <View style={styles.itemProgressContainer}>
                    <View style={styles.itemProgressBarContainer}>
                      <View
                        style={[
                          styles.itemProgressBar,
                          {
                            width: `${item.percentComplete}%`,
                            backgroundColor:
                              item.percentComplete >= 75
                                ? '#10B981'
                                : item.percentComplete >= 50
                                  ? '#3B82F6'
                                  : '#F59E0B',
                          },
                        ]}
                      />
                    </View>
                    <ThemedText style={[styles.itemProgressText, { color: secondaryText }]}>
                      {item.percentComplete}%
                    </ThemedText>
                  </View>
                )}

                {/* Photos Count */}
                {item.photos && item.photos.length > 0 && (
                  <View style={styles.itemInfo}>
                    <Ionicons name="images-outline" size={14} color={secondaryText} />
                    <ThemedText style={[styles.itemInfoText, { color: secondaryText }]}>
                      {item.photos.length} photo{item.photos.length > 1 ? 's' : ''}
                    </ThemedText>
                  </View>
                )}

                {/* Rejection Count */}
                {item.rejectionCount > 0 && (
                  <View style={styles.rejectionBadge}>
                    <Ionicons name="alert-circle" size={14} color="#EF4444" />
                    <ThemedText style={{ color: '#EF4444', fontSize: 11, fontWeight: '600' }}>
                      Rejected {item.rejectionCount} time{item.rejectionCount > 1 ? 's' : ''}
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </Section>
      </Container>

      {/* Verification Modal */}
      <Modal visible={showVerifyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
              Verify Punch Item
            </ThemedText>
            {selectedItem && (
              <>
                <ThemedText style={{ marginBottom: 12 }}>#{selectedItem.itemNumber}</ThemedText>
                <ThemedText style={{ marginBottom: 12, fontWeight: '600' }}>
                  {selectedItem.title}
                </ThemedText>

                <ThemedText style={{ marginBottom: 8, fontWeight: '600' }}>
                  Inspection Result
                </ThemedText>
                <View style={styles.resultButtons}>
                  <TouchableOpacity
                    style={[
                      styles.resultButton,
                      inspectionResult === 'PASS' && { backgroundColor: '#10B981' },
                      { borderColor },
                    ]}
                    onPress={() => setInspectionResult('PASS')}
                  >
                    <ThemedText
                      style={[
                        styles.resultButtonText,
                        inspectionResult === 'PASS' && { color: '#FFFFFF' },
                      ]}
                    >
                      Pass
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.resultButton,
                      inspectionResult === 'FAIL' && { backgroundColor: '#EF4444' },
                      { borderColor },
                    ]}
                    onPress={() => setInspectionResult('FAIL')}
                  >
                    <ThemedText
                      style={[
                        styles.resultButtonText,
                        inspectionResult === 'FAIL' && { color: '#FFFFFF' },
                      ]}
                    >
                      Fail
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                <ThemedText style={{ marginTop: 12, marginBottom: 4, fontWeight: '600' }}>
                  Verification Notes
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    { backgroundColor, borderColor, color: secondaryText },
                  ]}
                  value={verificationNotes}
                  onChangeText={setVerificationNotes}
                  multiline
                  numberOfLines={3}
                  placeholder="Add verification notes..."
                  placeholderTextColor={secondaryText}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#E5E7EB' }]}
                    onPress={() => {
                      setShowVerifyModal(false);
                      setSelectedItem(null);
                      setVerificationNotes('');
                    }}
                  >
                    <ThemedText style={{ color: '#374151' }}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: primaryColor }]}
                    onPress={handleVerifyItem}
                  >
                    <ThemedText style={{ color: '#FFFFFF' }}>Verify</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontWeight: '600',
    minWidth: 90,
  },
  infoValue: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '22%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  itemCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemNumber: {
    fontWeight: '700',
    fontSize: 13,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemStatusText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  itemInfoText: {
    fontSize: 12,
  },
  itemProgressContainer: {
    marginTop: 8,
  },
  itemProgressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 2,
  },
  itemProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  itemProgressText: {
    fontSize: 10,
  },
  rejectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 12,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resultButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  resultButtonText: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
