/**
 * Submittal Details & Review Screen
 */

import { useSubmittal, useSubmittals } from '@/hooks/useSubmittal';
import type { ReviewStatus } from '@/types/submittal';
import { ActionCode } from '@/types/submittal';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const ACTION_CODE_OPTIONS: { value: ActionCode; label: string; color: string; icon: string }[] = [
  {
    value: ActionCode.NO_EXCEPTION,
    label: 'No Exception',
    color: '#0D9488',
    icon: 'checkmark-circle',
  },
  {
    value: ActionCode.AS_NOTED,
    label: 'As Noted',
    color: '#0D9488',
    icon: 'checkmark-circle-outline',
  },
  {
    value: ActionCode.REVISE_RESUBMIT,
    label: 'Revise & Resubmit',
    color: '#0D9488',
    icon: 'refresh-circle',
  },
  {
    value: ActionCode.REJECTED,
    label: 'Rejected',
    color: '#000000',
    icon: 'close-circle',
  },
  {
    value: ActionCode.FOR_INFORMATION,
    label: 'For Information Only',
    color: '#0D9488',
    icon: 'information-circle',
  },
];

const REVIEW_STATUS_COLORS: Record<ReviewStatus, string> = {
  PENDING: '#6B7280',
  IN_PROGRESS: '#0D9488',
  COMPLETED: '#0D9488',
  OVERDUE: '#000000',
};

export default function SubmittalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { submittal, loading, error } = useSubmittal(id);
  const { reviewSubmittal, approveSubmittal, requestRevision, withdrawSubmittal } = useSubmittals();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedActionCode, setSelectedActionCode] = useState<ActionCode>(ActionCode.NO_EXCEPTION);
  const [reviewComments, setReviewComments] = useState('');
  const [specificChanges, setSpecificChanges] = useState<string[]>(['']);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  if (error || !submittal) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load submittal</Text>
      </View>
    );
  }

  const handleReview = async () => {
    try {
      await reviewSubmittal({
        id: submittal.id,
        actionCode: selectedActionCode,
        comments: reviewComments,
        requiresResubmission: selectedActionCode === ActionCode.REVISE_RESUBMIT,
        notifySubmitter: true,
      });
      setShowReviewModal(false);
      setReviewComments('');
    } catch (err) {
      console.error('Failed to review:', err);
    }
  };

  const handleApprove = async () => {
    try {
      await approveSubmittal(submittal.id, reviewComments);
      setReviewComments('');
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleRequestRevision = async () => {
    try {
      const cleanedChanges = specificChanges.filter(c => c.trim() !== '');
      await requestRevision(submittal.id, {
        comments: reviewComments,
        specificChanges: cleanedChanges,
        resubmitByDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      });
      setShowReviewModal(false);
      setReviewComments('');
      setSpecificChanges(['']);
    } catch (err) {
      console.error('Failed to request revision:', err);
    }
  };

  const addChangeField = () => {
    setSpecificChanges([...specificChanges, '']);
  };

  const updateChange = (index: number, value: string) => {
    const updated = [...specificChanges];
    updated[index] = value;
    setSpecificChanges(updated);
  };

  const removeChange = (index: number) => {
    setSpecificChanges(specificChanges.filter((_, i) => i !== index));
  };

  const daysToReview = submittal.reviewDueDate
    ? Math.ceil(
        (new Date(submittal.reviewDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.submittalNumber}>
            {submittal.submittalNumber}
            {submittal.revisionNumber !== 'A' && ` Rev ${submittal.revisionNumber}`}
          </Text>
          <View style={styles.badges}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    submittal.status === 'APPROVED'
                      ? '#0D9488'
                      : submittal.status === 'REJECTED'
                      ? '#000000'
                      : submittal.status === 'UNDER_REVIEW'
                      ? '#0D9488'
                      : '#0D9488',
                },
              ]}
            >
              <Text style={styles.statusBadgeText}>{submittal.status.replace(/_/g, ' ')}</Text>
            </View>
            {submittal.priority !== 'MEDIUM' && (
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor:
                      submittal.priority === 'CRITICAL'
                        ? '#000000'
                        : submittal.priority === 'URGENT'
                        ? '#0D9488'
                        : submittal.priority === 'HIGH'
                        ? '#0D9488'
                        : '#0D9488',
                  },
                ]}
              >
                <Text style={styles.priorityBadgeText}>{submittal.priority}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.title}>{submittal.title}</Text>

        <View style={styles.specBadge}>
          <Ionicons name="book-outline" size={14} color="#666666" style={{ marginRight: 6 }} />
          <Text style={styles.specBadgeText}>{submittal.specSection}</Text>
        </View>

        {submittal.description && (
          <Text style={styles.description}>{submittal.description}</Text>
        )}
      </View>

      {/* Overdue Alert */}
      {submittal.isOverdue && (
        <View style={styles.alertCard}>
          <Ionicons name="warning" size={24} color="#000000" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.alertTitle}>Overdue Submittal</Text>
            <Text style={styles.alertText}>
              This submittal is {submittal.daysOverdue} day(s) overdue. Immediate action required.
            </Text>
          </View>
        </View>
      )}

      {/* Key Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Information</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{submittal.type.replace(/_/g, ' ')}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{submittal.category}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Submitted Date</Text>
            <Text style={styles.infoValue}>
              {submittal.submittedDate
                ? new Date(submittal.submittedDate).toLocaleDateString()
                : 'Not submitted'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Required Date</Text>
            <Text style={styles.infoValue}>
              {new Date(submittal.requiredDate).toLocaleDateString()}
            </Text>
          </View>

          {submittal.reviewDueDate && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Review Due</Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: daysToReview && daysToReview < 0 ? '#000000' : '#1F2937',
                  },
                ]}
              >
                {new Date(submittal.reviewDueDate).toLocaleDateString()}
                {daysToReview !== null && (
                  <Text style={styles.daysText}>
                    {' '}
                    ({daysToReview < 0 ? `${Math.abs(daysToReview)}d late` : `${daysToReview}d left`})
                  </Text>
                )}
              </Text>
            </View>
          )}

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Lead Time</Text>
            <Text style={styles.infoValue}>{submittal.leadTime} days</Text>
          </View>
        </View>
      </View>

      {/* Submitter Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Submitter</Text>
        <View style={styles.contactCard}>
          <Ionicons name="business-outline" size={20} color="#6B7280" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.contactName}>{submittal.submittedBy.name}</Text>
            <Text style={styles.contactCompany}>{submittal.submittedBy.company}</Text>
            <Text style={styles.contactRole}>{submittal.submittedBy.role}</Text>
            <Text style={styles.contactEmail}>{submittal.submittedBy.email}</Text>
          </View>
        </View>
      </View>

      {/* Reviewers */}
      {submittal.reviewers && submittal.reviewers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Review Workflow ({submittal.reviewers.length})</Text>

          {submittal.reviewers.map((reviewer, index) => {
            const statusColor = REVIEW_STATUS_COLORS[reviewer.status];
            const daysToReview = reviewer.dueDate
              ? Math.ceil(
                  (new Date(reviewer.dueDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;

            return (
              <View key={index} style={styles.reviewerCard}>
                <View style={styles.reviewerHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={[styles.reviewerOrder, { backgroundColor: statusColor }]}>
                      <Text style={styles.reviewerOrderText}>{reviewer.order}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewerName}>
                        {reviewer.name}
                        {reviewer.isRequired && (
                          <Text style={styles.requiredIndicator}> *</Text>
                        )}
                      </Text>
                      <Text style={styles.reviewerRole}>
                        {reviewer.role} - {reviewer.company}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.reviewerStatusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.reviewerStatusText}>
                      {reviewer.status.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>

                <View style={styles.reviewerDetails}>
                  {reviewer.assignedDate && (
                    <View style={styles.reviewerDetailRow}>
                      <Text style={styles.reviewerDetailLabel}>Assigned:</Text>
                      <Text style={styles.reviewerDetailValue}>
                        {new Date(reviewer.assignedDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  {reviewer.dueDate && (
                    <View style={styles.reviewerDetailRow}>
                      <Text style={styles.reviewerDetailLabel}>Due:</Text>
                      <Text
                        style={[
                          styles.reviewerDetailValue,
                          {
                            color:
                              daysToReview && daysToReview < 0
                                ? '#000000'
                                : daysToReview && daysToReview < 3
                                ? '#0D9488'
                                : '#1F2937',
                          },
                        ]}
                      >
                        {new Date(reviewer.dueDate).toLocaleDateString()}
                        {daysToReview !== null && (
                          <Text style={styles.daysText}>
                            {' '}
                            ({daysToReview < 0 ? `${Math.abs(daysToReview)}d late` : `${daysToReview}d`})
                          </Text>
                        )}
                      </Text>
                    </View>
                  )}

                  {reviewer.reviewedDate && (
                    <View style={styles.reviewerDetailRow}>
                      <Text style={styles.reviewerDetailLabel}>Reviewed:</Text>
                      <Text style={styles.reviewerDetailValue}>
                        {new Date(reviewer.reviewedDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  {reviewer.actionCode && (
                    <View style={styles.reviewerDetailRow}>
                      <Text style={styles.reviewerDetailLabel}>Action:</Text>
                      <View
                        style={[
                          styles.actionCodeBadge,
                          {
                            backgroundColor:
                              reviewer.actionCode === 'NO_EXCEPTION'
                                ? '#0D9488'
                                : reviewer.actionCode === 'REJECTED'
                                ? '#000000'
                                : reviewer.actionCode === 'REVISE_RESUBMIT'
                                ? '#0D9488'
                                : '#0D9488',
                          },
                        ]}
                      >
                        <Text style={styles.actionCodeText}>
                          {reviewer.actionCode.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </View>
                  )}

                  {reviewer.comments && (
                    <View style={styles.reviewerComments}>
                      <Text style={styles.reviewerCommentsTitle}>Comments:</Text>
                      <Text style={styles.reviewerCommentsText}>{reviewer.comments}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Documents */}
      {submittal.documents && submittal.documents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents ({submittal.totalDocuments})</Text>

          {submittal.documents.map((doc, index) => (
            <View key={index} style={styles.documentCard}>
              <Ionicons
                name={
                  doc.type === 'PDF'
                    ? 'document-text'
                    : doc.type === 'DWG'
                    ? 'layers'
                    : doc.type === 'IMAGE'
                    ? 'image'
                    : 'document'
                }
                size={32}
                color="#6B7280"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <View style={styles.documentMeta}>
                  <Text style={styles.documentMetaText}>
                    {doc.type} • {(doc.size / 1024).toFixed(0)} KB
                  </Text>
                  {doc.isMarkedUp && (
                    <View style={styles.markupBadge}>
                      <Ionicons name="create" size={10} color="#666666" />
                      <Text style={styles.markupBadgeText}>Has Markups</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.documentUploader}>
                  Uploaded by {doc.uploadedBy} on{' '}
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity style={styles.downloadButton}>
                <Ionicons name="download-outline" size={20} color="#0D9488" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Workflow Steps */}
      {submittal.workflow && submittal.workflow.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workflow Progress</Text>

          {submittal.workflow.map((step, index) => (
            <View key={index} style={styles.workflowStep}>
              <View
                style={[
                  styles.stepIndicator,
                  {
                    backgroundColor:
                      step.status === 'COMPLETED'
                        ? '#0D9488'
                        : step.status === 'IN_PROGRESS'
                        ? '#0D9488'
                        : step.status === 'SKIPPED'
                        ? '#9CA3AF'
                        : '#E5E7EB',
                  },
                ]}
              >
                <Ionicons
                  name={
                    step.status === 'COMPLETED'
                      ? 'checkmark'
                      : step.status === 'IN_PROGRESS'
                      ? 'time'
                      : step.status === 'SKIPPED'
                      ? 'remove'
                      : 'ellipse-outline'
                  }
                  size={16}
                  color="#FFFFFF"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepName}>{step.name}</Text>
                {step.description && (
                  <Text style={styles.stepDescription}>{step.description}</Text>
                )}
                <View style={styles.stepMeta}>
                  <Text style={styles.stepMetaText}>
                    {step.assigneeRole}
                    {step.assignee && ` - ${step.assignee}`}
                  </Text>
                  {step.completedAt && (
                    <Text style={styles.stepMetaText}>
                      • Completed {new Date(step.completedAt).toLocaleDateString()}
                    </Text>
                  )}
                  {step.duration && (
                    <Text style={styles.stepMetaText}>• {step.duration} hours</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {submittal.status === 'DRAFT' && (
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
            <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Submit</Text>
          </TouchableOpacity>
        )}

        {(submittal.status === 'SUBMITTED' || submittal.status === 'UNDER_REVIEW') && (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSuccess]}
              onPress={handleApprove}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnWarning]}
              onPress={() => setShowReviewModal(true)}
            >
              <Ionicons name="create" size={20} color="#FFFFFF" />
              <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Review</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDanger]}
              onPress={() => {
                setSelectedActionCode(ActionCode.REVISE_RESUBMIT);
                setShowReviewModal(true);
              }}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Request Revision</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="download" size={20} color="#0D9488" />
          <Text style={styles.actionBtnText}>Download Package</Text>
        </TouchableOpacity>
      </View>

      {/* Review Modal */}
      <Modal visible={showReviewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Review</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalLabel}>Action Code</Text>
              {ACTION_CODE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.actionCodeOption,
                    selectedActionCode === option.value && {
                      backgroundColor: `${option.color}26`,
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() => setSelectedActionCode(option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={option.color}
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={[
                      styles.actionCodeOptionText,
                      selectedActionCode === option.value && { color: option.color },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.modalLabel, { marginTop: 20 }]}>Comments</Text>
              <TextInput
                style={styles.modalTextarea}
                placeholder="Enter your review comments..."
                value={reviewComments}
                onChangeText={setReviewComments}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {selectedActionCode === 'REVISE_RESUBMIT' && (
                <>
                  <Text style={[styles.modalLabel, { marginTop: 20 }]}>
                    Specific Changes Required
                  </Text>
                  {specificChanges.map((change, index) => (
                    <View key={index} style={styles.changeInputRow}>
                      <TextInput
                        style={styles.changeInput}
                        placeholder={`Change ${index + 1}`}
                        value={change}
                        onChangeText={value => updateChange(index, value)}
                      />
                      {specificChanges.length > 1 && (
                        <TouchableOpacity
                          style={styles.removeChangeBtn}
                          onPress={() => removeChange(index)}
                        >
                          <Ionicons name="close-circle" size={24} color="#000000" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  <TouchableOpacity style={styles.addChangeBtn} onPress={addChangeField}>
                    <Ionicons name="add-circle-outline" size={20} color="#0D9488" />
                    <Text style={styles.addChangeBtnText}>Add Change</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnPrimary}
                onPress={
                  selectedActionCode === 'REVISE_RESUBMIT' ? handleRequestRevision : handleReview
                }
              >
                <Text style={styles.modalBtnPrimaryText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  errorText: {
    fontSize: 14,
    color: '#000000',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  submittalNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  specBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B21A8',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#000000',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 12,
    color: '#991B1B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  daysText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactCompany: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  contactRole: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  contactEmail: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  reviewerCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerOrder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerOrderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  requiredIndicator: {
    color: '#000000',
  },
  reviewerRole: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  reviewerStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reviewerStatusText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  reviewerDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  reviewerDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerDetailLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  reviewerDetailValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionCodeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionCodeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  reviewerComments: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  reviewerCommentsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reviewerCommentsText: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentMetaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  markupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  markupBadgeText: {
    fontSize: 9,
    color: '#6B21A8',
    marginLeft: 4,
  },
  documentUploader: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  downloadButton: {
    padding: 8,
  },
  workflowStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  stepMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stepMetaText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  actionSection: {
    padding: 16,
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  actionBtnPrimary: {
    backgroundColor: '#0D9488',
  },
  actionBtnSuccess: {
    backgroundColor: '#0D9488',
  },
  actionBtnWarning: {
    backgroundColor: '#0D9488',
  },
  actionBtnDanger: {
    backgroundColor: '#000000',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  actionCodeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  actionCodeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  modalTextarea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
  changeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  changeInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  removeChangeBtn: {
    padding: 4,
  },
  addChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0D9488',
    borderStyle: 'dashed',
    gap: 8,
  },
  addChangeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalBtnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0D9488',
    alignItems: 'center',
  },
  modalBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
