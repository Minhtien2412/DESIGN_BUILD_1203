/**
 * As-Built Drawing Details Screen
 * Displays drawing details, revisions, redlines, and reviews
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
    useAsBuiltDrawing,
    useDrawingReviews,
    useDrawingRevisions,
    useRedlines,
} from '@/hooks/useAsBuilt';
import { DrawingStatus, MarkupType, ReviewStatus } from '@/types/as-built';

const STATUS_COLORS: Record<
  DrawingStatus,
  { bg: string; text: string; border: string }
> = {
  DRAFT: { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' },
  IN_REVIEW: { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' },
  APPROVED: { bg: '#D1FAE5', text: '#0D9488', border: '#6EE7B7' },
  ISSUED: { bg: '#F0FDFA', text: '#0D9488', border: '#14B8A6' },
  SUPERSEDED: { bg: '#E0E7FF', text: '#666666', border: '#C7D2FE' },
  ARCHIVED: { bg: '#F3F4F6', text: '#4B5563', border: '#D1D5DB' },
};

const MARKUP_TYPE_COLORS: Record<MarkupType, { bg: string; text: string }> = {
  REDLINE: { bg: '#FEE2E2', text: '#000000' },
  COMMENT: { bg: '#F0FDFA', text: '#0D9488' },
  DIMENSION: { bg: '#E0E7FF', text: '#666666' },
  ANNOTATION: { bg: '#FEF3C7', text: '#D97706' },
  HIGHLIGHT: { bg: '#FEF08A', text: '#CA8A04' },
  PHOTO_REFERENCE: { bg: '#D1FAE5', text: '#0D9488' },
};

const REVIEW_STATUS_COLORS: Record<
  ReviewStatus,
  { bg: string; text: string; border: string }
> = {
  PENDING: { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' },
  IN_PROGRESS: { bg: '#F0FDFA', text: '#0D9488', border: '#14B8A6' },
  APPROVED: { bg: '#D1FAE5', text: '#0D9488', border: '#6EE7B7' },
  APPROVED_WITH_COMMENTS: { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' },
  REJECTED: { bg: '#FEE2E2', text: '#000000', border: '#FCA5A5' },
  ON_HOLD: { bg: '#E0E7FF', text: '#666666', border: '#C7D2FE' },
};

export default function AsBuiltDrawingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'textMuted');
  const tintColor = useThemeColor({}, 'tint');

  const [activeTab, setActiveTab] = useState<'info' | 'revisions' | 'redlines' | 'reviews'>('info');

  const { drawing, loading } = useAsBuiltDrawing(id);
  const { revisions } = useDrawingRevisions(id);
  const { redlines } = useRedlines(id);
  const { reviews } = useDrawingReviews(id);

  if (loading || !drawing) {
    return (
      <Container style={{ backgroundColor }}>
        <Loader />
      </Container>
    );
  }

  const statusStyle = STATUS_COLORS[drawing.status];

  const tabs = [
    { key: 'info' as const, label: 'Info', icon: 'information-circle' as const },
    { key: 'revisions' as const, label: 'Revisions', icon: 'swap-horizontal' as const, count: revisions.length },
    { key: 'redlines' as const, label: 'Redlines', icon: 'create' as const, count: redlines.length },
    { key: 'reviews' as const, label: 'Reviews', icon: 'checkmark-done' as const, count: reviews.length },
  ];

  return (
    <Container style={{ backgroundColor }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Section>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={[styles.drawingNumber, { color: textColor }]}>
                {drawing.drawingNumber}
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
                  {drawing.status.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
            <Text style={[styles.title, { color: textColor }]}>
              {drawing.title}
            </Text>
            {drawing.description && (
              <Text style={[styles.description, { color: mutedColor }]}>
                {drawing.description}
              </Text>
            )}
          </View>
        </Section>

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
            {/* Drawing Information */}
            <Section title="Drawing Information">
              <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: mutedColor }]}>Type</Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    {drawing.drawingType.replace(/_/g, ' ')}
                  </Text>
                </View>
                {drawing.buildingName && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: mutedColor }]}>Building</Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>
                      {drawing.buildingName}
                      {drawing.floor ? ` - ${drawing.floor}` : ''}
                      {drawing.zone ? ` (${drawing.zone})` : ''}
                    </Text>
                  </View>
                )}
                {drawing.discipline && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: mutedColor }]}>Discipline</Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>
                      {drawing.discipline}
                    </Text>
                  </View>
                )}
                {drawing.consultant && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: mutedColor }]}>Consultant</Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>
                      {drawing.consultant}
                    </Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: mutedColor }]}>Revision</Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    {drawing.revisionNumber}
                  </Text>
                </View>
                {drawing.scale && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: mutedColor }]}>Scale</Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>
                      {drawing.scale}
                    </Text>
                  </View>
                )}
              </View>
            </Section>

            {/* Prepared By */}
            <Section title="Prepared By">
              <View style={[styles.personCard, { backgroundColor: surfaceColor, borderColor }]}>
                <Ionicons name="person-circle" size={40} color={tintColor} />
                <View style={styles.personInfo}>
                  <Text style={[styles.personName, { color: textColor }]}>
                    {drawing.preparedBy.name}
                  </Text>
                  {drawing.preparedBy.company && (
                    <Text style={[styles.personCompany, { color: mutedColor }]}>
                      {drawing.preparedBy.company}
                    </Text>
                  )}
                  <Text style={[styles.personDate, { color: mutedColor }]}>
                    {new Date(drawing.asBuiltDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </Section>

            {/* Approval */}
            {drawing.approvedBy && (
              <Section title="Approved By">
                <View style={[styles.personCard, { backgroundColor: surfaceColor, borderColor }]}>
                  <Ionicons name="checkmark-circle" size={40} color="#0D9488" />
                  <View style={styles.personInfo}>
                    <Text style={[styles.personName, { color: textColor }]}>
                      {drawing.approvedBy.name}
                    </Text>
                    {drawing.approvedBy.role && (
                      <Text style={[styles.personCompany, { color: mutedColor }]}>
                        {drawing.approvedBy.role}
                      </Text>
                    )}
                    {drawing.approvalDate && (
                      <Text style={[styles.personDate, { color: mutedColor }]}>
                        {new Date(drawing.approvalDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
              </Section>
            )}

            {/* Statistics */}
            <Section title="Statistics">
              <View style={styles.statsGrid}>
                <View
                  style={[
                    styles.statCard,
                    { backgroundColor: surfaceColor, borderColor },
                  ]}
                >
                  <Ionicons name="swap-horizontal" size={24} color={tintColor} />
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {drawing.totalRevisions}
                  </Text>
                  <Text style={[styles.statLabel, { color: mutedColor }]}>
                    Revisions
                  </Text>
                </View>
                <View
                  style={[
                    styles.statCard,
                    { backgroundColor: surfaceColor, borderColor },
                  ]}
                >
                  <Ionicons name="create" size={24} color={tintColor} />
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {drawing.totalRedlines}
                  </Text>
                  <Text style={[styles.statLabel, { color: mutedColor }]}>
                    Redlines
                  </Text>
                </View>
              </View>
            </Section>
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
                        <View
                          style={[
                            styles.revisionTypeBadge,
                            { backgroundColor: '#F0FDFA', borderColor: '#14B8A6' },
                          ]}
                        >
                          <Text style={[styles.revisionTypeText, { color: '#0D9488' }]}>
                            {revision.revisionType.replace(/_/g, ' ')}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.revisionDate, { color: mutedColor }]}>
                        {new Date(revision.revisionDate).toLocaleDateString()}
                      </Text>
                    </View>

                    <Text style={[styles.revisionDescription, { color: textColor }]}>
                      {revision.description}
                    </Text>

                    <View style={styles.revisionFooter}>
                      <View style={styles.revisionAuthor}>
                        <Ionicons name="person" size={14} color={mutedColor} />
                        <Text style={[styles.revisionAuthorText, { color: mutedColor }]}>
                          {revision.revisedBy.name}
                        </Text>
                      </View>
                      {revision.approvedBy && (
                        <View style={styles.revisionApproval}>
                          <Ionicons name="checkmark-circle" size={14} color="#0D9488" />
                          <Text style={[styles.revisionApprovedText, { color: '#0D9488' }]}>
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

        {/* Redlines Tab */}
        {activeTab === 'redlines' && (
          <Section title={`Redlines (${redlines.length})`}>
            {redlines.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: surfaceColor }]}>
                <Ionicons name="create" size={48} color={mutedColor} />
                <Text style={[styles.emptyText, { color: mutedColor }]}>
                  No redlines yet
                </Text>
              </View>
            ) : (
              <View style={styles.redlinesList}>
                {redlines.map((redline) => {
                  const typeStyle = MARKUP_TYPE_COLORS[redline.markupType];
                  const statusColors = {
                    OPEN: { bg: '#FEE2E2', text: '#000000' },
                    ADDRESSED: { bg: '#FEF3C7', text: '#D97706' },
                    INCORPORATED: { bg: '#D1FAE5', text: '#0D9488' },
                    REJECTED: { bg: '#F3F4F6', text: '#6B7280' },
                  };
                  const statusStyle = statusColors[redline.status];

                  return (
                    <View
                      key={redline.id}
                      style={[
                        styles.redlineCard,
                        { backgroundColor: surfaceColor, borderColor },
                      ]}
                    >
                      <View style={styles.redlineHeader}>
                        <View
                          style={[
                            styles.redlineTypeBadge,
                            {
                              backgroundColor: typeStyle.bg,
                              borderColor: typeStyle.text,
                            },
                          ]}
                        >
                          <Text style={[styles.redlineTypeText, { color: typeStyle.text }]}>
                            {redline.markupType.replace(/_/g, ' ')}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.redlineStatusBadge,
                            {
                              backgroundColor: statusStyle.bg,
                              borderColor: statusStyle.text,
                            },
                          ]}
                        >
                          <Text
                            style={[styles.redlineStatusText, { color: statusStyle.text }]}
                          >
                            {redline.status}
                          </Text>
                        </View>
                      </View>

                      {redline.title && (
                        <Text style={[styles.redlineTitle, { color: textColor }]}>
                          {redline.title}
                        </Text>
                      )}
                      <Text style={[styles.redlineDescription, { color: textColor }]}>
                        {redline.description}
                      </Text>

                      {redline.location && (
                        <View style={styles.redlineLocation}>
                          <Ionicons name="location" size={14} color={mutedColor} />
                          <Text style={[styles.redlineLocationText, { color: mutedColor }]}>
                            {redline.location}
                          </Text>
                        </View>
                      )}

                      <View style={styles.redlineFooter}>
                        <View style={styles.redlineAuthor}>
                          <Ionicons name="person" size={14} color={mutedColor} />
                          <Text style={[styles.redlineAuthorText, { color: mutedColor }]}>
                            {redline.createdBy.name}
                          </Text>
                        </View>
                        <Text style={[styles.redlineDate, { color: mutedColor }]}>
                          {new Date(redline.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </Section>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <Section title={`Reviews (${reviews.length})`}>
            {reviews.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: surfaceColor }]}>
                <Ionicons name="checkmark-done" size={48} color={mutedColor} />
                <Text style={[styles.emptyText, { color: mutedColor }]}>
                  No reviews yet
                </Text>
              </View>
            ) : (
              <View style={styles.reviewsList}>
                {reviews.map((review) => {
                  const statusStyle = REVIEW_STATUS_COLORS[review.status];

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
                              borderColor: statusStyle.border,
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

                      <View style={styles.reviewerInfo}>
                        <Ionicons name="person-circle" size={32} color={tintColor} />
                        <View style={styles.reviewerText}>
                          <Text style={[styles.reviewerName, { color: textColor }]}>
                            {review.reviewer.name}
                          </Text>
                          <Text style={[styles.reviewerRole, { color: mutedColor }]}>
                            {review.reviewer.role}
                            {review.reviewer.company
                              ? ` • ${review.reviewer.company}`
                              : ''}
                          </Text>
                        </View>
                      </View>

                      {review.overallComments && (
                        <Text style={[styles.reviewComments, { color: textColor }]}>
                          {review.overallComments}
                        </Text>
                      )}

                      {review.markups.length > 0 && (
                        <View style={styles.reviewMarkups}>
                          <Text style={[styles.reviewMarkupsCount, { color: mutedColor }]}>
                            {review.markups.length} markup{review.markups.length !== 1 ? 's' : ''}
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
  drawingNumber: {
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
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
  revisionTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  revisionTypeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  revisionDate: {
    fontSize: 13,
  },
  revisionDescription: {
    fontSize: 14,
    lineHeight: 20,
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
  redlinesList: {
    gap: 12,
  },
  redlineCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  redlineHeader: {
    flexDirection: 'row',
    gap: 8,
  },
  redlineTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  redlineTypeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  redlineStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  redlineStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  redlineTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  redlineDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  redlineLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  redlineLocationText: {
    fontSize: 13,
  },
  redlineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  redlineAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  redlineAuthorText: {
    fontSize: 13,
  },
  redlineDate: {
    fontSize: 13,
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
  reviewComments: {
    fontSize: 14,
    lineHeight: 20,
  },
  reviewMarkups: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  reviewMarkupsCount: {
    fontSize: 13,
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
