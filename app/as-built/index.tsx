/**
 * As-Built Drawings List Screen
 * Displays all as-built drawings with filters and statistics
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAsBuiltDrawings, useAsBuiltSummary } from '@/hooks/useAsBuilt';
import { DrawingStatus, DrawingType } from '@/types/as-built';

const DRAWING_TYPE_ICONS: Record<DrawingType, keyof typeof Ionicons.glyphMap> = {
  ARCHITECTURAL: 'business',
  STRUCTURAL: 'construct',
  MECHANICAL: 'settings',
  ELECTRICAL: 'flash',
  PLUMBING: 'water',
  HVAC: 'thermometer',
  FIRE_PROTECTION: 'flame',
  SITE_PLAN: 'map',
  LANDSCAPE: 'leaf',
  DETAIL: 'search',
  SECTION: 'cut',
  ELEVATION: 'trending-up',
  FLOOR_PLAN: 'grid',
  OTHER: 'document',
};

const STATUS_COLORS: Record<
  DrawingStatus,
  { bg: string; text: string; border: string }
> = {
  DRAFT: { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' },
  IN_REVIEW: { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' },
  APPROVED: { bg: '#D1FAE5', text: '#0066CC', border: '#6EE7B7' },
  ISSUED: { bg: '#E8F4FF', text: '#0066CC', border: '#0080FF' },
  SUPERSEDED: { bg: '#E0E7FF', text: '#666666', border: '#C7D2FE' },
  ARCHIVED: { bg: '#F3F4F6', text: '#4B5563', border: '#D1D5DB' },
};

export default function AsBuiltDrawingsListScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'textMuted');
  const tintColor = useThemeColor({}, 'tint');

  const [selectedType, setSelectedType] = useState<DrawingType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<DrawingStatus | 'ALL'>(
    'ALL'
  );
  const [search, setSearch] = useState('');

  // Mock project ID - replace with actual project context
  const projectId = 'project-1';

  const { drawings, loading, error } = useAsBuiltDrawings({
    projectId,
    drawingType: selectedType === 'ALL' ? undefined : selectedType,
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    search: search || undefined,
  });

  const { summary } = useAsBuiltSummary(projectId);

  const handleDrawingPress = (drawingId: string) => {
    router.push(`/as-built/${drawingId}`);
  };

  const stats = [
    { label: 'Total Drawings', value: summary?.totalDrawings || 0, icon: 'documents' as const },
    { label: 'Approved', value: summary?.drawingsByStatus.APPROVED || 0, icon: 'checkmark-circle' as const },
    { label: 'In Review', value: summary?.drawingsByStatus.IN_REVIEW || 0, icon: 'eye' as const },
    { label: 'Open Redlines', value: summary?.totalRedlines || 0, icon: 'create' as const },
  ];

  const statusFilters: Array<DrawingStatus | 'ALL'> = [
    'ALL',
    'DRAFT' as DrawingStatus,
    'IN_REVIEW' as DrawingStatus,
    'APPROVED' as DrawingStatus,
    'ISSUED' as DrawingStatus,
  ];

  if (loading && !drawings.length) {
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
              As-Built Drawings
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

        {/* Drawings List */}
        <Section>
          {drawings.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: surfaceColor }]}>
              <Ionicons name="documents-outline" size={48} color={mutedColor} />
              <Text style={[styles.emptyText, { color: mutedColor }]}>
                No drawings found
              </Text>
            </View>
          ) : (
            <View style={styles.drawingsList}>
              {drawings.map((drawing) => {
                const statusStyle = STATUS_COLORS[drawing.status];
                const typeIcon = DRAWING_TYPE_ICONS[drawing.drawingType];

                return (
                  <Pressable
                    key={drawing.id}
                    onPress={() => handleDrawingPress(drawing.id)}
                    style={({ pressed }) => [
                      styles.drawingCard,
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
                        <Ionicons name={typeIcon} size={20} color={tintColor} />
                        <Text style={[styles.drawingNumber, { color: textColor }]}>
                          {drawing.drawingNumber}
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
                          {drawing.status.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </View>

                    {/* Title */}
                    <Text style={[styles.drawingTitle, { color: textColor }]}>
                      {drawing.title}
                    </Text>

                    {/* Info Grid */}
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Ionicons name="layers" size={14} color={mutedColor} />
                        <Text style={[styles.infoText, { color: mutedColor }]}>
                          {drawing.drawingType.replace(/_/g, ' ')}
                        </Text>
                      </View>
                      {drawing.buildingName && (
                        <View style={styles.infoItem}>
                          <Ionicons name="business" size={14} color={mutedColor} />
                          <Text style={[styles.infoText, { color: mutedColor }]}>
                            {drawing.buildingName}
                            {drawing.floor ? ` - ${drawing.floor}` : ''}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Metadata */}
                    <View style={styles.metadataRow}>
                      <View style={styles.metadataItem}>
                        <Ionicons name="swap-horizontal" size={14} color={mutedColor} />
                        <Text style={[styles.metadataText, { color: mutedColor }]}>
                          Rev. {drawing.revisionNumber}
                        </Text>
                      </View>
                      {drawing.hasRedlines && drawing.totalRedlines > 0 && (
                        <View
                          style={[
                            styles.redlineBadge,
                            { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' },
                          ]}
                        >
                          <Ionicons name="create" size={12} color="#D97706" />
                          <Text style={[styles.redlineCount, { color: '#D97706' }]}>
                            {drawing.totalRedlines}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Footer */}
                    <View style={styles.cardFooter}>
                      <View style={styles.footerItem}>
                        <Ionicons name="person" size={14} color={mutedColor} />
                        <Text style={[styles.footerText, { color: mutedColor }]}>
                          {drawing.preparedBy.name}
                        </Text>
                      </View>
                      <Text style={[styles.footerDate, { color: mutedColor }]}>
                        {new Date(drawing.asBuiltDate).toLocaleDateString()}
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
  drawingsList: {
    gap: 12,
  },
  drawingCard: {
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
  drawingNumber: {
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
  drawingTitle: {
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
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 13,
  },
  redlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  redlineCount: {
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
