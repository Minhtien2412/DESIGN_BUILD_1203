/**
 * Document Control List Screen
 * Displays all controlled documents with filters and statistics
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    useControlledDocuments,
    useDocumentControlSummary,
} from '@/hooks/useDocumentControl';
import { AccessLevel, DocumentCategory, DocumentStatus } from '@/types/document-control';

const CATEGORY_ICONS: Record<DocumentCategory, keyof typeof Ionicons.glyphMap> = {
  CONTRACT: 'document-text',
  SPECIFICATION: 'list',
  DRAWING: 'image',
  REPORT: 'bar-chart',
  PROCEDURE: 'git-compare',
  POLICY: 'shield-checkmark',
  MANUAL: 'book',
  CORRESPONDENCE: 'mail',
  SUBMITTAL: 'send',
  RFI: 'help-circle',
  CHANGE_ORDER: 'swap-horizontal',
  MEETING_MINUTES: 'people',
  PERMIT: 'shield',
  CERTIFICATE: 'ribbon',
  WARRANTY: 'shield-checkmark',
  OTHER: 'document',
};

const STATUS_COLORS: Record<
  DocumentStatus,
  { bg: string; text: string; border: string }
> = {
  DRAFT: { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' },
  IN_REVIEW: { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' },
  APPROVED: { bg: '#D1FAE5', text: '#0D9488', border: '#6EE7B7' },
  ISSUED: { bg: '#F0FDFA', text: '#0D9488', border: '#14B8A6' },
  SUPERSEDED: { bg: '#E0E7FF', text: '#666666', border: '#C7D2FE' },
  ARCHIVED: { bg: '#F3F4F6', text: '#4B5563', border: '#D1D5DB' },
  VOID: { bg: '#FEE2E2', text: '#000000', border: '#FCA5A5' },
};

const ACCESS_LEVEL_COLORS: Record<
  AccessLevel,
  { bg: string; text: string }
> = {
  PUBLIC: { bg: '#D1FAE5', text: '#0D9488' },
  INTERNAL: { bg: '#F0FDFA', text: '#0D9488' },
  CONFIDENTIAL: { bg: '#FEF3C7', text: '#D97706' },
  RESTRICTED: { bg: '#FED7AA', text: '#EA580C' },
  HIGHLY_CONFIDENTIAL: { bg: '#FEE2E2', text: '#000000' },
};

export default function DocumentControlListScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const surfaceColor = useThemeColor('surface');
  const borderColor = useThemeColor('border');
  const mutedColor = useThemeColor('textMuted');
  const tintColor = useThemeColor('tint');

  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const projectId = 'project-1';

  const { documents, loading, error } = useControlledDocuments({
    projectId,
    category: selectedCategory === 'ALL' ? undefined : selectedCategory,
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    search: search || undefined,
  });

  const { summary } = useDocumentControlSummary(projectId);

  const handleDocumentPress = (documentId: string) => {
    router.push(`/document-control/${documentId}`);
  };

  const stats = [
    { label: 'Total Documents', value: summary?.totalDocuments || 0, icon: 'documents' as const },
    { label: 'In Review', value: summary?.documentsByStatus.IN_REVIEW || 0, icon: 'eye' as const },
    { label: 'Approved', value: summary?.documentsByStatus.APPROVED || 0, icon: 'checkmark-circle' as const },
    { label: 'Issued', value: summary?.documentsByStatus.ISSUED || 0, icon: 'send' as const },
  ];

  const statusFilters: (DocumentStatus | 'ALL')[] = [
    'ALL',
    'DRAFT' as DocumentStatus,
    'IN_REVIEW' as DocumentStatus,
    'APPROVED' as DocumentStatus,
    'ISSUED' as DocumentStatus,
  ];

  if (loading && !documents.length) {
    return (
      <Container style={{ backgroundColor }}>
        <Loader />
      </Container>
    );
  }

  return (
    <Container style={{ backgroundColor }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Section>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>
              Document Control
            </Text>
          </View>
        </Section>

        {/* Statistics Grid */}
        <Section>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View
                key={index}
                style={[
                  styles.statCard,
                  { backgroundColor: surfaceColor, borderColor },
                ]}
              >
                <Ionicons name={stat.icon} size={24} color={tintColor} />
                <Text style={[styles.statValue, { color: textColor }]}>
                  {stat.value.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: mutedColor }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Status Filters */}
        <Section>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {statusFilters.map((status) => {
              const isActive = selectedStatus === status;
              return (
                <Pressable
                  key={status}
                  onPress={() => setSelectedStatus(status)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? tintColor : surfaceColor,
                      borderColor: isActive ? tintColor : borderColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: isActive ? '#FFFFFF' : textColor },
                    ]}
                  >
                    {status === 'ALL' ? 'All' : status.replace(/_/g, ' ')}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Section>

        {/* Documents List */}
        <Section>
          {documents.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: surfaceColor }]}>
              <Ionicons name="documents-outline" size={48} color={mutedColor} />
              <Text style={[styles.emptyText, { color: mutedColor }]}>
                No documents found
              </Text>
            </View>
          ) : (
            <View style={styles.documentsList}>
              {documents.map((document) => {
                const statusStyle = STATUS_COLORS[document.status];
                const categoryIcon = CATEGORY_ICONS[document.category];
                const accessStyle = ACCESS_LEVEL_COLORS[document.accessLevel];

                return (
                  <Pressable
                    key={document.id}
                    onPress={() => handleDocumentPress(document.id)}
                    style={({ pressed }) => [
                      styles.documentCard,
                      {
                        backgroundColor: surfaceColor,
                        borderColor,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    {/* Header */}
                    <View style={styles.cardHeader}>
                      <View style={styles.headerLeft}>
                        <Ionicons name={categoryIcon} size={20} color={tintColor} />
                        <Text style={[styles.documentNumber, { color: textColor }]}>
                          {document.documentNumber}
                        </Text>
                      </View>
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

                    {/* Title */}
                    <Text style={[styles.documentTitle, { color: textColor }]}>
                      {document.title}
                    </Text>

                    {/* Info Grid */}
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Ionicons name="folder" size={14} color={mutedColor} />
                        <Text style={[styles.infoText, { color: mutedColor }]}>
                          {document.category.replace(/_/g, ' ')}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Ionicons name="code-working" size={14} color={mutedColor} />
                        <Text style={[styles.infoText, { color: mutedColor }]}>
                          v{document.version} (Rev. {document.revisionNumber})
                        </Text>
                      </View>
                    </View>

                    {/* Metadata Row */}
                    <View style={styles.metadataRow}>
                      {document.isConfidential && (
                        <View
                          style={[
                            styles.accessBadge,
                            {
                              backgroundColor: accessStyle.bg,
                              borderColor: accessStyle.text,
                            },
                          ]}
                        >
                          <Ionicons name="lock-closed" size={12} color={accessStyle.text} />
                          <Text style={[styles.accessText, { color: accessStyle.text }]}>
                            {document.accessLevel.replace(/_/g, ' ')}
                          </Text>
                        </View>
                      )}
                      {document.reviewRequired && document.reviews.length > 0 && (
                        <View style={styles.reviewBadge}>
                          <Ionicons name="eye" size={12} color="#0D9488" />
                          <Text style={[styles.reviewCount, { color: '#0D9488' }]}>
                            {document.reviews.length}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Footer */}
                    <View style={styles.cardFooter}>
                      <View style={styles.footerItem}>
                        <Ionicons name="person" size={14} color={mutedColor} />
                        <Text style={[styles.footerText, { color: mutedColor }]}>
                          {document.author.name}
                        </Text>
                      </View>
                      <Text style={[styles.footerDate, { color: mutedColor }]}>
                        {new Date(document.createdDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Section>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  documentsList: {
    gap: 12,
  },
  documentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  documentNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    textTransform: 'capitalize',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  accessText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
  },
  reviewCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  footerText: {
    fontSize: 13,
  },
  footerDate: {
    fontSize: 12,
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
