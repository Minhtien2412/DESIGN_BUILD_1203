/**
 * RFI Details & Response Screen
 */

import { useRFI, useRFIs } from '@/hooks/useRFI';
import { ResponseType } from '@/types/rfi';
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

const RESPONSE_TYPE_OPTIONS: { value: ResponseType; label: string; color: string; icon: string }[] = [
  {
    value: ResponseType.ANSWER,
    label: 'Provide Answer',
    color: '#0066CC',
    icon: 'chatbox-ellipses',
  },
  {
    value: ResponseType.CLARIFICATION_REQUEST,
    label: 'Request Clarification',
    color: '#0066CC',
    icon: 'help-circle',
  },
  {
    value: ResponseType.SEE_ATTACHED,
    label: 'See Attached',
    color: '#3B82F6',
    icon: 'attach',
  },
  {
    value: ResponseType.REDIRECT,
    label: 'Redirect to Others',
    color: '#666666',
    icon: 'arrow-redo',
  },
];

export default function RFIDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rfi, loading, error } = useRFI(id);
  const { respondToRFI, closeRFI, reopenRFI } = useRFIs();

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedResponseType, setSelectedResponseType] = useState<ResponseType>(ResponseType.ANSWER);
  const [answer, setAnswer] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [technicalJustification, setTechnicalJustification] = useState('');

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error || !rfi) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load RFI</Text>
      </View>
    );
  }

  const handleRespond = async () => {
    try {
      await respondToRFI(rfi.id, {
        responseType: selectedResponseType,
        answer,
        recommendation: recommendation || undefined,
        technicalJustification: technicalJustification || undefined,
      });
      setShowResponseModal(false);
      setAnswer('');
      setRecommendation('');
      setTechnicalJustification('');
    } catch (err) {
      console.error('Failed to respond:', err);
    }
  };

  const handleClose = async () => {
    try {
      await closeRFI(rfi.id);
    } catch (err) {
      console.error('Failed to close:', err);
    }
  };

  const daysToRespond = rfi.responseDueDate
    ? Math.ceil(
        (new Date(rfi.responseDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.rfiNumber}>
            {rfi.rfiNumber}
            {rfi.revisionNumber !== '0' && ` Rev ${rfi.revisionNumber}`}
          </Text>
          <View style={styles.badges}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    rfi.status === 'ANSWERED'
                      ? '#0066CC'
                      : rfi.status === 'CLOSED'
                      ? '#0066CC'
                      : rfi.status === 'UNDER_REVIEW'
                      ? '#0066CC'
                      : '#3B82F6',
                },
              ]}
            >
              <Text style={styles.statusBadgeText}>{rfi.status.replace(/_/g, ' ')}</Text>
            </View>
            {rfi.priority !== 'MEDIUM' && (
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor:
                      rfi.priority === 'CRITICAL'
                        ? '#000000'
                        : rfi.priority === 'URGENT'
                        ? '#0066CC'
                        : rfi.priority === 'HIGH'
                        ? '#0066CC'
                        : '#0066CC',
                  },
                ]}
              >
                <Text style={styles.priorityBadgeText}>{rfi.priority}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.subject}>{rfi.subject}</Text>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{rfi.category.replace(/_/g, ' ')}</Text>
        </View>
      </View>

      {/* Overdue Alert */}
      {rfi.isOverdue && (
        <View style={styles.alertCard}>
          <Ionicons name="warning" size={24} color="#000000" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.alertTitle}>Overdue RFI</Text>
            <Text style={styles.alertText}>
              This RFI is {rfi.daysOverdue} day(s) overdue. Immediate response required.
            </Text>
          </View>
        </View>
      )}

      {/* Key Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Information</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{rfi.category.replace(/_/g, ' ')}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Created Date</Text>
            <Text style={styles.infoValue}>{new Date(rfi.createdDate).toLocaleDateString()}</Text>
          </View>

          {rfi.submittedDate && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Submitted</Text>
              <Text style={styles.infoValue}>
                {new Date(rfi.submittedDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Required Date</Text>
            <Text style={styles.infoValue}>
              {new Date(rfi.requiredDate).toLocaleDateString()}
            </Text>
          </View>

          {rfi.responseDueDate && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Response Due</Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: daysToRespond && daysToRespond < 0 ? '#000000' : '#1F2937',
                  },
                ]}
              >
                {new Date(rfi.responseDueDate).toLocaleDateString()}
                {daysToRespond !== null && (
                  <Text style={styles.daysText}>
                    {' '}
                    ({daysToRespond < 0 ? `${Math.abs(daysToRespond)}d late` : `${daysToRespond}d left`})
                  </Text>
                )}
              </Text>
            </View>
          )}

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Response Days</Text>
            <Text style={styles.infoValue}>{rfi.responseDays} days</Text>
          </View>

          {rfi.respondedDate && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Responded</Text>
              <Text style={styles.infoValue}>
                {new Date(rfi.respondedDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          {rfi.responseDuration && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{rfi.responseDuration} days</Text>
            </View>
          )}
        </View>
      </View>

      {/* Initiator & Assignee */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Initiator & Assignee</Text>

        <View style={styles.contactCard}>
          <Ionicons name="person-outline" size={20} color="#6B7280" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.contactLabel}>From</Text>
            <Text style={styles.contactName}>{rfi.createdBy.name}</Text>
            <Text style={styles.contactCompany}>{rfi.createdBy.company}</Text>
            <Text style={styles.contactRole}>{rfi.createdBy.role}</Text>
            <Text style={styles.contactEmail}>{rfi.createdBy.email}</Text>
          </View>
        </View>

        <View style={[styles.contactCard, { marginTop: 12 }]}>
          <Ionicons name="person-circle-outline" size={20} color="#6B7280" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.contactLabel}>To</Text>
            <Text style={styles.contactName}>{rfi.assignedTo.name}</Text>
            <Text style={styles.contactCompany}>{rfi.assignedTo.company}</Text>
            <Text style={styles.contactRole}>{rfi.assignedTo.role}</Text>
            <Text style={styles.contactEmail}>{rfi.assignedTo.email}</Text>
          </View>
        </View>
      </View>

      {/* Question */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Question</Text>
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>{rfi.question}</Text>
        </View>

        {rfi.backgroundInfo && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Background Information</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>{rfi.backgroundInfo}</Text>
            </View>
          </>
        )}

        {rfi.proposedSolution && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Proposed Solution</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>{rfi.proposedSolution}</Text>
            </View>
          </>
        )}
      </View>

      {/* Location */}
      {rfi.location && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationGrid}>
            {rfi.location.building && (
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Building</Text>
                <Text style={styles.locationValue}>{rfi.location.building}</Text>
              </View>
            )}
            {rfi.location.floor && (
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Floor</Text>
                <Text style={styles.locationValue}>{rfi.location.floor}</Text>
              </View>
            )}
            {rfi.location.zone && (
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Zone</Text>
                <Text style={styles.locationValue}>{rfi.location.zone}</Text>
              </View>
            )}
            {rfi.location.gridLine && (
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Grid Line</Text>
                <Text style={styles.locationValue}>{rfi.location.gridLine}</Text>
              </View>
            )}
            {rfi.location.room && (
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Room</Text>
                <Text style={styles.locationValue}>{rfi.location.room}</Text>
              </View>
            )}
            {rfi.location.specificLocation && (
              <View style={[styles.locationItem, { width: '100%' }]}>
                <Text style={styles.locationLabel}>Specific Location</Text>
                <Text style={styles.locationValue}>{rfi.location.specificLocation}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Impact Analysis */}
      {rfi.impact.level !== 'NO_IMPACT' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact Analysis</Text>

          <View
            style={[
              styles.impactLevelBadge,
              {
                backgroundColor:
                  rfi.impact.level === 'CRITICAL'
                    ? '#FEE2E2'
                    : rfi.impact.level === 'SIGNIFICANT'
                    ? '#FED7AA'
                    : rfi.impact.level === 'MODERATE'
                    ? '#FEF3C7'
                    : '#E8F4FF',
              },
            ]}
          >
            <Ionicons
              name="warning"
              size={20}
              color={
                rfi.impact.level === 'CRITICAL'
                  ? '#000000'
                  : rfi.impact.level === 'SIGNIFICANT'
                  ? '#EA580C'
                  : rfi.impact.level === 'MODERATE'
                  ? '#D97706'
                  : '#0066CC'
              }
            />
            <Text
              style={[
                styles.impactLevelText,
                {
                  color:
                    rfi.impact.level === 'CRITICAL'
                      ? '#000000'
                      : rfi.impact.level === 'SIGNIFICANT'
                      ? '#EA580C'
                      : rfi.impact.level === 'MODERATE'
                      ? '#D97706'
                      : '#0066CC',
                },
              ]}
            >
              {rfi.impact.level} Impact
            </Text>
          </View>

          {rfi.impact.schedule.affectsSchedule && (
            <View style={styles.impactCard}>
              <View style={styles.impactCardHeader}>
                <Ionicons name="calendar" size={18} color="#0066CC" />
                <Text style={styles.impactCardTitle}>Schedule Impact</Text>
              </View>
              <View style={styles.impactCardBody}>
                <View style={styles.impactRow}>
                  <Text style={styles.impactRowLabel}>Delay Days:</Text>
                  <Text style={styles.impactRowValue}>{rfi.impact.schedule.delayDays} days</Text>
                </View>
                {rfi.impact.schedule.criticalPath && (
                  <View style={styles.criticalBadge}>
                    <Ionicons name="alert-circle" size={14} color="#000000" />
                    <Text style={styles.criticalBadgeText}>Critical Path Affected</Text>
                  </View>
                )}
                {rfi.impact.schedule.affectedActivities &&
                  rfi.impact.schedule.affectedActivities.length > 0 && (
                    <View style={styles.activityList}>
                      <Text style={styles.activityListTitle}>Affected Activities:</Text>
                      {rfi.impact.schedule.affectedActivities.map((activity, index) => (
                        <Text key={index} style={styles.activityItem}>
                          • {activity}
                        </Text>
                      ))}
                    </View>
                  )}
              </View>
            </View>
          )}

          {rfi.impact.cost.affectsCost && (
            <View style={styles.impactCard}>
              <View style={styles.impactCardHeader}>
                <Ionicons name="cash" size={18} color="#0066CC" />
                <Text style={styles.impactCardTitle}>Cost Impact</Text>
              </View>
              <View style={styles.impactCardBody}>
                <View style={styles.impactRow}>
                  <Text style={styles.impactRowLabel}>Estimated Amount:</Text>
                  <Text style={styles.impactRowValue}>
                    {rfi.impact.cost.currency} {rfi.impact.cost.estimatedAmount?.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.impactRow}>
                  <Text style={styles.impactRowLabel}>Type:</Text>
                  <Text
                    style={[
                      styles.impactRowValue,
                      {
                        color:
                          rfi.impact.cost.costType === 'INCREASE'
                            ? '#000000'
                            : rfi.impact.cost.costType === 'DECREASE'
                            ? '#0066CC'
                            : '#6B7280',
                      },
                    ]}
                  >
                    {rfi.impact.cost.costType}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {rfi.impact.safety.affectsSafety && (
            <View style={styles.impactCard}>
              <View style={styles.impactCardHeader}>
                <Ionicons name="shield-checkmark" size={18} color="#000000" />
                <Text style={styles.impactCardTitle}>Safety Impact</Text>
              </View>
              <View style={styles.impactCardBody}>
                <Text style={styles.impactDescription}>{rfi.impact.safety.description}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Response */}
      {rfi.response && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Response</Text>

          <View style={styles.responseCard}>
            <View style={styles.responseHeader}>
              <View
                style={[
                  styles.responseTypeBadge,
                  {
                    backgroundColor:
                      rfi.responseType === 'ANSWER'
                        ? '#D1FAE5'
                        : rfi.responseType === 'CLARIFICATION_REQUEST'
                        ? '#FEF3C7'
                        : '#E8F4FF',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.responseTypeBadgeText,
                    {
                      color:
                        rfi.responseType === 'ANSWER'
                          ? '#0066CC'
                          : rfi.responseType === 'CLARIFICATION_REQUEST'
                          ? '#D97706'
                          : '#0066CC',
                    },
                  ]}
                >
                  {rfi.responseType?.replace(/_/g, ' ')}
                </Text>
              </View>
              <Text style={styles.responseDate}>
                {new Date(rfi.response.respondedDate).toLocaleDateString()}
              </Text>
            </View>

            <Text style={styles.responseAnswerTitle}>Answer:</Text>
            <Text style={styles.responseAnswerText}>{rfi.response.answer}</Text>

            {rfi.response.recommendation && (
              <>
                <Text style={styles.responseAnswerTitle}>Recommendation:</Text>
                <Text style={styles.responseAnswerText}>{rfi.response.recommendation}</Text>
              </>
            )}

            {rfi.response.technicalJustification && (
              <>
                <Text style={styles.responseAnswerTitle}>Technical Justification:</Text>
                <Text style={styles.responseAnswerText}>{rfi.response.technicalJustification}</Text>
              </>
            )}

            <View style={styles.responseFooter}>
              <Text style={styles.responseBy}>
                Responded by: {rfi.responseBy?.name} ({rfi.responseBy?.company})
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Attachments */}
      {rfi.attachments && rfi.attachments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attachments ({rfi.totalAttachments})</Text>

          {rfi.attachments.map((attachment, index) => (
            <View key={index} style={styles.attachmentCard}>
              <Ionicons
                name={
                  attachment.type === 'PDF'
                    ? 'document-text'
                    : attachment.type === 'DWG'
                    ? 'layers'
                    : attachment.type === 'IMAGE'
                    ? 'image'
                    : 'document'
                }
                size={32}
                color="#6B7280"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.attachmentName}>{attachment.name}</Text>
                <View style={styles.attachmentMeta}>
                  <Text style={styles.attachmentMetaText}>
                    {attachment.type} • {(attachment.size / 1024).toFixed(0)} KB
                  </Text>
                  <View
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor:
                          attachment.category === 'QUESTION'
                            ? '#E8F4FF'
                            : attachment.category === 'RESPONSE'
                            ? '#D1FAE5'
                            : attachment.category === 'REFERENCE'
                            ? '#FEF3C7'
                            : '#F3F4F6',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color:
                            attachment.category === 'QUESTION'
                              ? '#1E40AF'
                              : attachment.category === 'RESPONSE'
                              ? '#047857'
                              : attachment.category === 'REFERENCE'
                              ? '#92400E'
                              : '#4B5563',
                        },
                      ]}
                    >
                      {attachment.category}
                    </Text>
                  </View>
                </View>
                <Text style={styles.attachmentUploader}>
                  Uploaded by {attachment.uploadedBy} on{' '}
                  {new Date(attachment.uploadedAt).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity style={styles.downloadButton}>
                <Ionicons name="download-outline" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {rfi.status === 'DRAFT' && (
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
            <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Submit</Text>
          </TouchableOpacity>
        )}

        {(rfi.status === 'SUBMITTED' || rfi.status === 'UNDER_REVIEW') && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSuccess]}
            onPress={() => setShowResponseModal(true)}
          >
            <Ionicons name="chatbox-ellipses" size={20} color="#FFFFFF" />
            <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Respond</Text>
          </TouchableOpacity>
        )}

        {rfi.status === 'ANSWERED' && (
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSuccess]} onPress={handleClose}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Close</Text>
          </TouchableOpacity>
        )}

        {rfi.status === 'CLOSED' && (
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnWarning]}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Reopen</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="download" size={20} color="#3B82F6" />
          <Text style={styles.actionBtnText}>Download Package</Text>
        </TouchableOpacity>
      </View>

      {/* Response Modal */}
      <Modal visible={showResponseModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Respond to RFI</Text>
              <TouchableOpacity onPress={() => setShowResponseModal(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalLabel}>Response Type</Text>
              {RESPONSE_TYPE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.responseTypeOption,
                    selectedResponseType === option.value && {
                      backgroundColor: `${option.color}26`,
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() => setSelectedResponseType(option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={option.color}
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={[
                      styles.responseTypeOptionText,
                      selectedResponseType === option.value && { color: option.color },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.modalLabel, { marginTop: 20 }]}>Answer *</Text>
              <TextInput
                style={styles.modalTextarea}
                placeholder="Provide your response..."
                value={answer}
                onChangeText={setAnswer}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={[styles.modalLabel, { marginTop: 20 }]}>Recommendation (Optional)</Text>
              <TextInput
                style={styles.modalTextarea}
                placeholder="Provide recommendations..."
                value={recommendation}
                onChangeText={setRecommendation}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={[styles.modalLabel, { marginTop: 20 }]}>
                Technical Justification (Optional)
              </Text>
              <TextInput
                style={styles.modalTextarea}
                placeholder="Provide technical justification..."
                value={technicalJustification}
                onChangeText={setTechnicalJustification}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={() => setShowResponseModal(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleRespond}>
                <Text style={styles.modalBtnPrimaryText}>Submit Response</Text>
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
  rfiNumber: {
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
  subject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'capitalize',
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
  contactLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 4,
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
  questionBox: {
    backgroundColor: '#E8F4FF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  questionText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  infoBoxText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  locationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  locationItem: {
    width: '48%',
  },
  locationLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  impactLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  impactLevelText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  impactCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  impactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  impactCardBody: {
    gap: 8,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactRowLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  impactRowValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  criticalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  criticalBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 4,
  },
  activityList: {
    marginTop: 4,
  },
  activityListTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  activityItem: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 8,
  },
  impactDescription: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  responseCard: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  responseTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  responseTypeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  responseDate: {
    fontSize: 11,
    color: '#0066CC',
  },
  responseAnswerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
    marginTop: 12,
    marginBottom: 6,
  },
  responseAnswerText: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 20,
  },
  responseFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#A7F3D0',
  },
  responseBy: {
    fontSize: 11,
    color: '#0066CC',
    fontStyle: 'italic',
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  attachmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachmentMetaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  categoryChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryChipText: {
    fontSize: 9,
    fontWeight: '600',
  },
  attachmentUploader: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  downloadButton: {
    padding: 8,
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
    backgroundColor: '#3B82F6',
  },
  actionBtnSuccess: {
    backgroundColor: '#0066CC',
  },
  actionBtnWarning: {
    backgroundColor: '#0066CC',
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
  responseTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  responseTypeOptionText: {
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
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  modalBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
