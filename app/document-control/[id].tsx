/**
 * Document Control Details Screen
 * Displays document details, revisions, reviews, and distribution
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    useControlledDocument,
    useDistributionRecords,
    useDocumentReviews,
    useDocumentRevisions,
} from '@/hooks/useDocumentControl';
import { AccessLevel, DocumentStatus } from '@/types/document-control';

const STATUS_COLORS: Record<
  DocumentStatus,
  { bg: string; text: string; border: string }
> = {
  DRAFT: { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' },
  IN_REVIEW: { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' },
  APPROVED: { bg: '#D1FAE5', text: '#059669', border: '#6EE7B7' },
  ISSUED: { bg: '#DBEAFE', text: '#2563EB', border: '#93C5FD' },
  SUPERSEDED: { bg: '#E0E7FF', text: '#6366F1', border: '#C7D2FE' },
  ARCHIVED: { bg: '#F3F4F6', text: '#4B5563', border: '#D1D5DB' },
  VOID: { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' },
};

const ACCESS_LEVEL_COLORS: Record<
  AccessLevel,
  { bg: string; text: string }
> = {
  PUBLIC: { bg: '#D1FAE5', text: '#059669' },
  INTERNAL: { bg: '#DBEAFE', text: '#2563EB' },
  CONFIDENTIAL: { bg: '#FEF3C7', text: '#D97706' },
  RESTRICTED: { bg: '#FED7AA', text: '#EA580C' },
  HIGHLY_CONFIDENTIAL: { bg: '#FEE2E2', text: '#DC2626' },
};

export default function DocumentControlDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const surfaceColor = useThemeColor('surface');
  const borderColor = useThemeColor('border');
  const mutedColor = useThemeColor('textMuted');
  const tintColor = useThemeColor('tint');

  const [activeTab, setActiveTab] = useState<'info' | 'revisions' | 'reviews' | 'distribution'>('info');

  const { document, loading } = useControlledDocument(id);
  const { revisions } = useDocumentRevisions(id);
  const { reviews } = useDocumentReviews(id);
  const { distributions } = useDistributionRecords(id);

  if (loading || !document) {
    return (
      <Container style={{ backgroundColor }}>
        <Loader />
      </Container>
    );
  }

  const statusStyle = STATUS_COLORS[document.status];
  const accessStyle = ACCESS_LEVEL_COLORS[document.accessLevel];

  const tabs = [
    { key: 'info' as const, label: 'Info', icon: 'information-circle' as const },
    { key: 'revisions' as const, label: 'Revisions', icon: 'swap-horizontal' as const, count: revisions.length },
    { key: 'reviews' as const, label: 'Reviews', icon: 'eye' as const, count: reviews.length },
    { key: 'distribution' as const, label: 'Distribution', icon: 'send' as const, count: distributions.length },
  ];

  return (
    <Container style={{ backgroundColor }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Section>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={[styles.documentNumber, { color: textColor }]}>
                {document.documentNumber}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusStyle.bg,
                    borderColor: statusStyle.border,
                  },
                ]}
              >
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {document.status.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
            <Text style={[styles.title, { color: textColor }]}>
              {document.title}
            </Text>
            {document.description && (
              <Text style={[styles.description, { color: mutedColor }]}>
                {document.description}
              </Text>
            )}
          </View>
        </Section>

        {/* Access Level Alert */}
        {document.isConfidential && (
          <Section>
            <View
              style={[
                styles.accessAlert,
                {
                  backgroundColor: accessStyle.bg,
                  borderColor: accessStyle.text,
                },
              ]}
            >
              <Ionicons name="lock-closed" size={20} color={accessStyle.text} />
              <View style={styles.accessAlertContent}>
                <Text style={[styles.accessAlertTitle, { color: accessStyle.text }]}>
                  {document.accessLevel.replace(/_/g, ' ')}
                </Text>
                <Text style={[styles.accessAlertText, { color: accessStyle.text }]}>
                  This document contains sensitive information
                </Text>
              </View>
            </View>
          </Section>
        )}

        {/* Tabs */}
        <Section>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[
                    styles.tab,
                    {
                      backgroundColor: isActive ? tintColor : surfaceColor,
                      borderColor: isActive ? tintColor : borderColor,
                    },
                  ]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={18}
                    color={isActive ? '#FFFFFF' : textColor}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      { color: isActive ? '#FFFFFF' : textColor },
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {tab.count !== undefined && tab.count > 0 && (
                    <View
                      style={[
                        styles.tabBadge,
                        {
                          backgroundColor: isActive ? '#FFFFFF' : tintColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabBadgeText,
                          { color: isActive ? tintColor : '#FFFFFF' },
                        ]}
                      >
                        {tab.count}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </Section>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <>
            {/* Document Information */}
            <Section title="Document Information">
              <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: mutedColor }]}>Category</Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    {document.category.replace(/_/g, ' ')}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: mutedColor }]}>Version</Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    {document.version} (Rev. {document.revisionNumber})
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: mutedColor }]}>File Type</Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    {document.fileType.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: mutedColor }]}>File Size</Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </View>
                {document.pageCount && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: mutedColor }]}>Pages</Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>
                      {document.pageCount}
                    </Text>
                  </View>
                )}
              </View>
            </Section>

            {/* Author */}
            <Section title="Author">
              <View style={[styles.personCard, { backgroundColor: surfaceColor, borderColor }]}>
                <Ionicons name="person-circle" size={40} color={tintColor} />
                <View style={styles.personInfo}>
                  <Text style={[styles.personName, { color: textColor }]}>
                    {document.author.name}
                  </Text>
                  {document.author.company && (
                    <Text style={[styles.personCompany, { color: mutedColor }]}>
                      {document.author.company}
                    </Text>
                  )}
                  <Text style={[styles.personDate, { color: mutedColor }]}>
                    {new Date(document.createdDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </Section>

            {/* Owner */}
            <Section title="Document Owner">
              <View style={[styles.personCard, { backgroundColor: surfaceColor, borderColor }]}>
                <Ionicons name="briefcase" size={40} color={tintColor} />
                <View style={styles.personInfo}>
                  <Text style={[styles.personName, { color: textColor }]}>
                    {document.owner.name}
                  </Text>
                  {document.owner.department && (
                    <Text style={[styles.personCompany, { color: mutedColor }]}>
                      {document.owner.department}
                    </Text>
                  )}
                </View>
              </View>
            </Section>

            {/* Approval */}
            {document.approvedBy && (
              <Section title="Approved By">
                <View style={[styles.personCard, { backgroundColor: surfaceColor, borderColor }]}>
                  <Ionicons name="checkmark-circle" size={40} color="#059669" />
                  <View style={styles.personInfo}>
                    <Text style={[styles.personName, { color: textColor }]}>
                      {document.approvedBy.name}
                    </Text>
                    {document.approvedBy.role && (
                      <Text style={[styles.personCompany, { color: mutedColor }]}>
                        {document.approvedBy.role}
                      </Text>
                    )}
                    {document.approvalDate && (
                      <Text style={[styles.personDate, { color: mutedColor }]}>
                        {new Date(document.approvalDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
              </Section>
            )}

            {/* Dates */}
            {(document.issuedDate || document.effectiveDate || document.expiryDate) && (
              <Section title="Important Dates">
                <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                  {document.issuedDate && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: mutedColor }]}>Issued</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>
                        {new Date(document.issuedDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {document.effectiveDate && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: mutedColor }]}>Effective</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>
                        {new Date(document.effectiveDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {document.expiryDate && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: mutedColor }]}>Expires</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>
                        {new Date(document.expiryDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              </Section>
            )}
          </>
        )}

        {/* Revisions Tab */}
        {activeTab === 'revisions' && (
          <Section title={`Revisions (${revisions.length})`}>
            {revisions.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: surfaceColor }]}>
                <Ionicons name="swap-horizontal" size={48} color={mutedColor} />
                <Text style={[styles.emptyText, { color: mutedColor }]}>
                  No revisions yet
                </Text>
              </View>
            ) : (
              <View style={styles.revisionsList}>
                {revisions.map((revision) => (
                  <View
                    key={revision.id}
                    style={[
                      styles.revisionCard,
                      { backgroundColor: surfaceColor, borderColor },
                    ]}
                  >
                    <View style={styles.revisionHeader}>
                      <View style={styles.revisionLeft}>
                        <Text style={[styles.revisionNumber, { color: textColor }]}>
                          Rev. {revision.revisionNumber}
                        </Text>
                        <Text style={[styles.revisionVersion, { color: mutedColor }]}>
                          v{revision.version}
                        </Text>
                      </View>
                      <Text style={[styles.revisionDate, { color: mutedColor }]}>
                        {new Date(revision.revisionDate).toLocaleDateString()}
                      </Text>
                    </View>

                    <Text style={[styles.revisionDescription, { color: textColor }]}>
                      {revision.changeDescription}
                    </Text>

                    {revision.impactLevel && (
                      <View
                        style={[
                          styles.impactBadge,
                          {
                            backgroundColor:
                              revision.impactLevel === 'CRITICAL'
                                ? '#FEE2E2'
                                : revision.impactLevel === 'MAJOR'
                                ? '#FEF3C7'
                                : '#F3F4F6',
                            borderColor:
                              revision.impactLevel === 'CRITICAL'
                                ? '#DC2626'
                                : revision.impactLevel === 'MAJOR'
                                ? '#D97706'
                                : '#6B7280',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.impactText,
                            {
                              color:
                                revision.impactLevel === 'CRITICAL'
                                  ? '#DC2626'
                                  : revision.impactLevel === 'MAJOR'
                                  ? '#D97706'
                                  : '#6B7280',
                            },
                          ]}
                        >
                          {revision.impactLevel}
                        </Text>
                      </View>
                    )}

                    <View style={styles.revisionFooter}>
                      <View style={styles.revisionAuthor}>
                        <Ionicons name="person" size={14} color={mutedColor} />
                        <Text style={[styles.revisionAuthorText, { color: mutedColor }]}>
                          {revision.revisedBy.name}
                        </Text>
                      </View>
                      {revision.approvedBy && (
                        <View style={styles.revisionApproval}>
                          <Ionicons name="checkmark-circle" size={14} color="#059669" />
                          <Text style={[styles.revisionApprovedText, { color: '#059669' }]}>
                            Approved
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Section>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <Section title={`Reviews (${reviews.length})`}>
            {reviews.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: surfaceColor }]}>
                <Ionicons name="eye" size={48} color={mutedColor} />
                <Text style={[styles.emptyText, { color: mutedColor }]}>
                  No reviews yet
                </Text>
              </View>
            ) : (
              <View style={styles.reviewsList}>
                {reviews.map((review) => {
                  const statusColors = {
                    PENDING: { bg: '#F3F4F6', text: '#6B7280' },
                    IN_PROGRESS: { bg: '#DBEAFE', text: '#2563EB' },
                    COMPLETED: { bg: '#D1FAE5', text: '#059669' },
                    CANCELLED: { bg: '#FEE2E2', text: '#DC2626' },
                  };
                  const statusStyle = statusColors[review.status];

                  return (
                    <View
                      key={review.id}
                      style={[
                        styles.reviewCard,
                        { backgroundColor: surfaceColor, borderColor },
                      ]}
                    >
                      <View style={styles.reviewHeader}>
                        <Text style={[styles.reviewNumber, { color: textColor }]}>
                          Review #{review.reviewNumber}
                        </Text>
                        <View
                          style={[
                            styles.reviewStatusBadge,
                            {
                              backgroundColor: statusStyle.bg,
                              borderColor: statusStyle.text,
                            },
                          ]}
                        >
                          <Text
                            style={[styles.reviewStatusText, { color: statusStyle.text }]}
                          >
                            {review.status.replace(/_/g, ' ')}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.reviewTypeBadge,
                          { backgroundColor: '#E0E7FF', borderColor: '#6366F1' },
                        ]}
                      >
                        <Text style={[styles.reviewTypeText, { color: '#6366F1' }]}>
                          {review.reviewType.replace(/_/g, ' ')}
                        </Text>
                      </View>

                      <View style={styles.reviewerInfo}>
                        <Ionicons name="person-circle" size={32} color={tintColor} />
                        <View style={styles.reviewerText}>
                          <Text style={[styles.reviewerName, { color: textColor }]}>
                            {review.reviewer.name}
                          </Text>
                          <Text style={[styles.reviewerRole, { color: mutedColor }]}>
                            {review.reviewer.role}
                            {review.reviewer.department
                              ? ` • ${review.reviewer.department}`
                              : ''}
                          </Text>
                        </View>
                      </View>

                      {review.decision && (
                        <View style={styles.reviewDecision}>
                          <Text style={[styles.reviewDecisionLabel, { color: mutedColor }]}>
                            Decision:
                          </Text>
                          <Text
                            style={[
                              styles.reviewDecisionText,
                              {
                                color:
                                  review.decision === 'APPROVE'
                                    ? '#059669'
                                    : review.decision === 'REJECT'
                                    ? '#DC2626'
                                    : '#D97706',
                              },
                            ]}
                          >
                            {review.decision.replace(/_/g, ' ')}
                          </Text>
                        </View>
                      )}

                      <View style={styles.reviewFooter}>
                        <Text style={[styles.reviewDate, { color: mutedColor }]}>
                          {new Date(review.assignedDate).toLocaleDateString()}
                        </Text>
                        {review.dueDate && (
                          <Text style={[styles.reviewDueDate, { color: '#D97706' }]}>
                            Due: {new Date(review.dueDate).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </Section>
        )}

        {/* Distribution Tab */}
        {activeTab === 'distribution' && (
          <Section title={`Distribution (${distributions.length})`}>
            {distributions.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: surfaceColor }]}>
                <Ionicons name="send" size={48} color={mutedColor} />
                <Text style={[styles.emptyText, { color: mutedColor }]}>
                  No distribution records
                </Text>
              </View>
            ) : (
              <View style={styles.distributionsList}>
                {distributions.map((distribution) => {
                  const statusColors = {
                    SENT: { bg: '#DBEAFE', text: '#2563EB' },
                    DELIVERED: { bg: '#FEF3C7', text: '#D97706' },
                    READ: { bg: '#E0E7FF', text: '#6366F1' },
                    ACKNOWLEDGED: { bg: '#D1FAE5', text: '#059669' },
                    FAILED: { bg: '#FEE2E2', text: '#DC2626' },
                  };
                  const statusStyle = statusColors[distribution.deliveryStatus];

                  return (
                    <View
                      key={distribution.id}
                      style={[
                        styles.distributionCard,
                        { backgroundColor: surfaceColor, borderColor },
                      ]}
                    >
                      <View style={styles.distributionHeader}>
                        <Ionicons name="person" size={32} color={tintColor} />
                        <View style={styles.distributionRecipient}>
                          <Text style={[styles.recipientName, { color: textColor }]}>
                            {distribution.recipientName}
                          </Text>
                          {distribution.recipientCompany && (
                            <Text style={[styles.recipientCompany, { color: mutedColor }]}>
                              {distribution.recipientCompany}
                            </Text>
                          )}
                        </View>
                        <View
                          style={[
                            styles.distributionStatusBadge,
                            {
                              backgroundColor: statusStyle.bg,
                              borderColor: statusStyle.text,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.distributionStatusText,
                              { color: statusStyle.text },
                            ]}
                          >
                            {distribution.deliveryStatus}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.distributionInfo}>
                        <View style={styles.distributionInfoItem}>
                          <Ionicons name="calendar" size={14} color={mutedColor} />
                          <Text style={[styles.distributionInfoText, { color: mutedColor }]}>
                            {new Date(distribution.distributedDate).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.distributionInfoItem}>
                          <Ionicons name="paper-plane" size={14} color={mutedColor} />
                          <Text style={[styles.distributionInfoText, { color: mutedColor }]}>
                            {distribution.distributionMethod}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </Section>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentNumber: {
    fontSize: 20,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  accessAlert: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
    alignItems: 'center',
  },
  accessAlertContent: {
    flex: 1,
    gap: 2,
  },
  accessAlertTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  accessAlertText: {
    fontSize: 13,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  personCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  personInfo: {
    flex: 1,
    gap: 4,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
  },
  personCompany: {
    fontSize: 14,
  },
  personDate: {
    fontSize: 13,
  },
  revisionsList: {
    gap: 12,
  },
  revisionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  revisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revisionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  revisionNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  revisionVersion: {
    fontSize: 14,
  },
  revisionDate: {
    fontSize: 13,
  },
  revisionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  impactBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  impactText: {
    fontSize: 11,
    fontWeight: '600',
  },
  revisionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revisionAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  revisionAuthorText: {
    fontSize: 13,
  },
  revisionApproval: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  revisionApprovedText: {
    fontSize: 13,
    fontWeight: '500',
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  reviewStatusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reviewTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  reviewTypeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reviewerInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewerText: {
    flex: 1,
    gap: 4,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewerRole: {
    fontSize: 13,
  },
  reviewDecision: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  reviewDecisionLabel: {
    fontSize: 14,
  },
  reviewDecisionText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 13,
  },
  reviewDueDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  distributionsList: {
    gap: 12,
  },
  distributionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distributionRecipient: {
    flex: 1,
    gap: 4,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '600',
  },
  recipientCompany: {
    fontSize: 13,
  },
  distributionStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  distributionStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  distributionInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  distributionInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distributionInfoText: {
    fontSize: 13,
  },
  emptyState: {
    padding: 48,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
});
