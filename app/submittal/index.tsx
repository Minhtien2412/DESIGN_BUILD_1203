/**
 * Submittals List Screen
 */

import { useSubmittalAnalytics, useSubmittals } from '@/hooks/useSubmittal';
import { SubmittalPriority, SubmittalStatus, SubmittalType } from '@/types/submittal';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const TYPE_FILTERS: { value: SubmittalType | 'ALL'; label: string; icon: string }[] = [
  { value: 'ALL', label: 'All', icon: 'list-outline' },
  { value: SubmittalType.SHOP_DRAWING, label: 'Shop Drawing', icon: 'document-text-outline' },
  { value: SubmittalType.PRODUCT_DATA, label: 'Product Data', icon: 'information-circle-outline' },
  { value: SubmittalType.SAMPLE, label: 'Sample', icon: 'cube-outline' },
  { value: SubmittalType.TEST_REPORT, label: 'Test Report', icon: 'flask-outline' },
  { value: SubmittalType.MATERIAL_CERTIFICATE, label: 'Certificate', icon: 'ribbon-outline' },
  { value: SubmittalType.AS_BUILT_DRAWING, label: 'As-Built', icon: 'copy-outline' },
];

const STATUS_FILTERS: { value: SubmittalStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: SubmittalStatus.DRAFT, label: 'Draft' },
  { value: SubmittalStatus.SUBMITTED, label: 'Submitted' },
  { value: SubmittalStatus.UNDER_REVIEW, label: 'Under Review' },
  { value: SubmittalStatus.APPROVED, label: 'Approved' },
  { value: SubmittalStatus.REVISE_AND_RESUBMIT, label: 'Revise' },
];

const STATUS_COLORS: Record<SubmittalStatus, string> = {
  DRAFT: '#6B7280',
  SUBMITTED: '#3B82F6',
  UNDER_REVIEW: '#F59E0B',
  APPROVED: '#10B981',
  APPROVED_AS_NOTED: '#059669',
  REVISE_AND_RESUBMIT: '#F97316',
  REJECTED: '#EF4444',
  SUPERSEDED: '#9CA3AF',
  WITHDRAWN: '#6B7280',
};

const PRIORITY_COLORS: Record<SubmittalPriority, string> = {
  LOW: '#10B981',
  MEDIUM: '#3B82F6',
  HIGH: '#F59E0B',
  URGENT: '#F97316',
  CRITICAL: '#EF4444',
};

export default function SubmittalsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<SubmittalType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<SubmittalStatus | 'ALL'>('ALL');

  const {
    submittals,
    loading,
    error,
    refresh,
    submitSubmittal,
    approveSubmittal,
    requestRevision,
  } = useSubmittals({
    type: selectedType !== 'ALL' ? selectedType : undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
  });

  const { analytics } = useSubmittalAnalytics();

  const filteredSubmittals = submittals.filter(
    submittal =>
      submittal.submittalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submittal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submittal.specSection.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (id: string) => {
    try {
      await submitSubmittal(id);
    } catch (err) {
      console.error('Failed to submit:', err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveSubmittal(id);
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  if (loading && !submittals.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const submittedCount = submittals.filter(s => s.status === 'SUBMITTED').length;
  const underReviewCount = submittals.filter(s => s.status === 'UNDER_REVIEW').length;
  const approvedCount = submittals.filter(s => s.status === 'APPROVED').length;
  const overdueCount = submittals.filter(s => s.isOverdue).length;

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
          <Text style={styles.statValue}>{submittals.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
          <Text style={[styles.statValue, { color: '#3B82F6' }]}>{submittedCount}</Text>
          <Text style={styles.statLabel}>Submitted</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{underReviewCount}</Text>
          <Text style={styles.statLabel}>Under Review</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{approvedCount}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>

        {overdueCount > 0 && (
          <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{overdueCount}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        )}
      </ScrollView>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by number, title, spec section..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Type Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {TYPE_FILTERS.map(type => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.filterChip,
              selectedType === type.value && styles.filterChipActive,
            ]}
            onPress={() => setSelectedType(type.value)}
          >
            <Ionicons
              name={type.icon as any}
              size={16}
              color={selectedType === type.value ? '#FFFFFF' : '#6B7280'}
              style={{ marginRight: 4 }}
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

      {/* Status Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {STATUS_FILTERS.map(status => (
          <TouchableOpacity
            key={status.value}
            style={[
              styles.filterChip,
              selectedStatus === status.value && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus(status.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === status.value && styles.filterChipTextActive,
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Submittals List */}
      <ScrollView style={styles.listContainer}>
        {filteredSubmittals.map(submittal => {
          const statusColor = STATUS_COLORS[submittal.status];
          const priorityColor = PRIORITY_COLORS[submittal.priority];
          const daysToReview = submittal.reviewDueDate
            ? Math.ceil(
                (new Date(submittal.reviewDueDate).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : null;

          return (
            <View key={submittal.id} style={styles.card}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${statusColor}26` }]}>
                  <Ionicons
                    name={
                      submittal.type === 'SHOP_DRAWING'
                        ? 'document-text'
                        : submittal.type === 'SAMPLE'
                        ? 'cube'
                        : submittal.type === 'TEST_REPORT'
                        ? 'flask'
                        : 'document'
                    }
                    size={28}
                    color={statusColor}
                  />
                </View>

                <View style={styles.cardHeaderText}>
                  <View style={styles.headerRow}>
                    <Text style={styles.submittalNumber}>
                      {submittal.submittalNumber}
                      {submittal.revisionNumber !== 'A' && ` Rev ${submittal.revisionNumber}`}
                    </Text>
                    <View style={styles.badges}>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusBadgeText}>
                          {submittal.status.replace(/_/g, ' ')}
                        </Text>
                      </View>
                      {submittal.priority !== 'MEDIUM' && (
                        <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                          <Text style={styles.priorityBadgeText}>{submittal.priority}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Text style={styles.title} numberOfLines={1}>
                    {submittal.title}
                  </Text>

                  <View style={styles.specBadge}>
                    <Ionicons name="book-outline" size={12} color="#8B5CF6" style={{ marginRight: 4 }} />
                    <Text style={styles.specBadgeText}>{submittal.specSection}</Text>
                  </View>
                </View>
              </View>

              {/* Info Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="business-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    {submittal.submittedBy.name} ({submittal.submittedBy.company})
                  </Text>
                </View>

                {submittal.submittedDate && (
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>
                      Submitted: {new Date(submittal.submittedDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    Required by: {new Date(submittal.requiredDate).toLocaleDateString()}
                  </Text>
                </View>

                {submittal.reviewDueDate && (
                  <View style={styles.infoRow}>
                    <Ionicons name="hourglass-outline" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>
                      Review due: {new Date(submittal.reviewDueDate).toLocaleDateString()}
                      {daysToReview !== null && (
                        <Text
                          style={{
                            color: daysToReview < 0 ? '#EF4444' : daysToReview < 3 ? '#F59E0B' : '#6B7280',
                          }}
                        >
                          {' '}
                          ({daysToReview < 0 ? `${Math.abs(daysToReview)} days late` : `${daysToReview} days left`})
                        </Text>
                      )}
                    </Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Ionicons name="document-attach-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{submittal.totalDocuments} document(s)</Text>
                </View>
              </View>

              {/* Reviewers Section */}
              {submittal.reviewers && submittal.reviewers.length > 0 && (
                <View style={styles.reviewersSection}>
                  <Text style={styles.reviewersTitle}>Reviewers ({submittal.reviewers.length})</Text>
                  <View style={styles.reviewersList}>
                    {submittal.reviewers.slice(0, 3).map((reviewer, index) => (
                      <View key={index} style={styles.reviewerItem}>
                        <View
                          style={[
                            styles.reviewerStatus,
                            {
                              backgroundColor:
                                reviewer.status === 'COMPLETED'
                                  ? '#10B981'
                                  : reviewer.status === 'IN_PROGRESS'
                                  ? '#F59E0B'
                                  : reviewer.status === 'OVERDUE'
                                  ? '#EF4444'
                                  : '#6B7280',
                            },
                          ]}
                        />
                        <Text style={styles.reviewerName} numberOfLines={1}>
                          {reviewer.name} ({reviewer.role})
                        </Text>
                      </View>
                    ))}
                    {submittal.reviewers.length > 3 && (
                      <Text style={styles.moreReviewers}>+{submittal.reviewers.length - 3} more</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Overdue Warning */}
              {submittal.isOverdue && (
                <View style={styles.overdueWarning}>
                  <Ionicons name="warning" size={16} color="#DC2626" />
                  <Text style={styles.overdueWarningText}>
                    {submittal.daysOverdue} day(s) overdue - Immediate attention required
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={18} color="#3B82F6" />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>

                {submittal.status === 'DRAFT' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => handleSubmit(submittal.id)}
                  >
                    <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Submit</Text>
                  </TouchableOpacity>
                )}

                {(submittal.status === 'SUBMITTED' || submittal.status === 'UNDER_REVIEW') && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonSuccess]}
                      onPress={() => handleApprove(submittal.id)}
                    >
                      <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
                      <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.actionButtonWarning]}>
                      <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                      <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Review</Text>
                    </TouchableOpacity>
                  </>
                )}

                {submittal.status === 'REVISE_AND_RESUBMIT' && (
                  <TouchableOpacity style={[styles.actionButton, styles.actionButtonWarning]}>
                    <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Revise</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="download-outline" size={18} color="#6B7280" />
                  <Text style={styles.actionButtonText}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filteredSubmittals.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No submittals found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  submittalNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3E8FF',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  specBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B21A8',
  },
  infoSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  reviewersSection: {
    marginBottom: 12,
  },
  reviewersTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  reviewersList: {
    gap: 6,
  },
  reviewerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  reviewerName: {
    fontSize: 11,
    color: '#4B5563',
    flex: 1,
  },
  moreReviewers: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  overdueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  overdueWarningText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  actionButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  actionButtonSuccess: {
    backgroundColor: '#10B981',
  },
  actionButtonWarning: {
    backgroundColor: '#F59E0B',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});
