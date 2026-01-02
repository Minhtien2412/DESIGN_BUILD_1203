/**
 * QC Inspections List Screen
 * Displays all quality control inspections with filters
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Inspection, qcApi } from '@/services/qcApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type InspectionType = 'all' | 'initial' | 'progress' | 'final' | 'safety' | 'quality';
type InspectionStatus = 'all' | 'scheduled' | 'in-progress' | 'completed' | 'approved' | 'rejected';

export default function InspectionsListScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedType, setSelectedType] = useState<InspectionType>('all');
  const [selectedStatus, setSelectedStatus] = useState<InspectionStatus>('all');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = '#EE4D2D';

  useEffect(() => {
    loadInspections();
  }, [selectedType, selectedStatus]);

  const loadInspections = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const filters: any = {};
      if (selectedType !== 'all') filters.type = selectedType;
      if (selectedStatus !== 'all') filters.status = selectedStatus;

      const result = await qcApi.getInspections(filters);
      setInspections(result.inspections);
    } catch (error) {
      console.error('Failed to load inspections:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      case 'in-progress':
        return '#007AFF';
      case 'completed':
        return '#5AC8FA';
      default:
        return '#999';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'initial':
        return 'play-circle-outline';
      case 'progress':
        return 'hourglass-outline';
      case 'final':
        return 'checkmark-circle-outline';
      case 'safety':
        return 'shield-checkmark-outline';
      case 'quality':
        return 'star-outline';
      default:
        return 'document-text-outline';
    }
  };

  const renderFilterChip = (
    label: string,
    value: string,
    selected: boolean,
    onPress: () => void
  ) => (
    <Pressable
      style={[
        styles.filterChip,
        {
          backgroundColor: selected ? primaryColor : cardColor,
          borderColor: selected ? primaryColor : '#E5E5E5',
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: selected ? '#fff' : textColor },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  const renderInspectionCard = (inspection: Inspection, index: number) => (
    <Animated.View
      key={inspection.id}
      entering={FadeInUp.delay(index * 50).springify()}
    >
      <Pressable
        style={[styles.card, { backgroundColor: cardColor }]}
        onPress={() => router.push(`/quality-assurance/inspections/${inspection.id}`)}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.typeIcon,
              { backgroundColor: `${primaryColor}20` },
            ]}
          >
            <Ionicons
              name={getTypeIcon(inspection.type) as any}
              size={20}
              color={primaryColor}
            />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              {inspection.title}
            </Text>
            <Text style={[styles.cardProject, { color: '#999' }]}>
              Project #{inspection.projectId}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(inspection.status)}20` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(inspection.status) },
              ]}
            >
              {inspection.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color="#999" />
            <Text style={[styles.metaText, { color: '#999' }]}>
              {new Date(inspection.scheduledDate).toLocaleDateString()}
            </Text>
          </View>

          {inspection.inspector && (
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={14} color="#999" />
              <Text style={[styles.metaText, { color: '#999' }]}>
                {inspection.inspector.name}
              </Text>
            </View>
          )}

          {inspection.defectCount !== undefined && inspection.defectCount > 0 && (
            <View style={styles.metaRow}>
              <Ionicons name="alert-circle-outline" size={14} color="#FF9500" />
              <Text style={[styles.metaText, { color: '#FF9500' }]}>
                {inspection.defectCount} defects
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.cardType, { color: primaryColor }]}>
            {inspection.type.toUpperCase()}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Quality Inspections
        </Text>
        <Pressable
          onPress={() => router.push('/quality-assurance/inspections/create')}
          hitSlop={8}
        >
          <Ionicons name="add-circle-outline" size={24} color={primaryColor} />
        </Pressable>
      </View>

      {/* Type Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {renderFilterChip('All', 'all', selectedType === 'all', () =>
          setSelectedType('all')
        )}
        {renderFilterChip('Initial', 'initial', selectedType === 'initial', () =>
          setSelectedType('initial')
        )}
        {renderFilterChip('Progress', 'progress', selectedType === 'progress', () =>
          setSelectedType('progress')
        )}
        {renderFilterChip('Final', 'final', selectedType === 'final', () =>
          setSelectedType('final')
        )}
        {renderFilterChip('Safety', 'safety', selectedType === 'safety', () =>
          setSelectedType('safety')
        )}
        {renderFilterChip('Quality', 'quality', selectedType === 'quality', () =>
          setSelectedType('quality')
        )}
      </ScrollView>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {renderFilterChip('All Status', 'all', selectedStatus === 'all', () =>
          setSelectedStatus('all')
        )}
        {renderFilterChip(
          'Scheduled',
          'scheduled',
          selectedStatus === 'scheduled',
          () => setSelectedStatus('scheduled')
        )}
        {renderFilterChip(
          'In Progress',
          'in-progress',
          selectedStatus === 'in-progress',
          () => setSelectedStatus('in-progress')
        )}
        {renderFilterChip(
          'Completed',
          'completed',
          selectedStatus === 'completed',
          () => setSelectedStatus('completed')
        )}
        {renderFilterChip(
          'Approved',
          'approved',
          selectedStatus === 'approved',
          () => setSelectedStatus('approved')
        )}
      </ScrollView>

      {/* Inspections List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadInspections(true)}
            tintColor={primaryColor}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={[styles.loadingText, { color: textColor }]}>
              Loading inspections...
            </Text>
          </View>
        ) : inspections.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: cardColor }]}>
            <Ionicons name="clipboard-outline" size={48} color="#999" />
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              No Inspections
            </Text>
            <Text style={[styles.emptySubtitle, { color: '#999' }]}>
              Create your first quality inspection
            </Text>
            <Pressable
              style={[styles.createButton, { backgroundColor: primaryColor }]}
              onPress={() =>
                router.push('/quality-assurance/inspections/create')
              }
            >
              <Text style={styles.createButtonText}>Create Inspection</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {inspections.map((inspection, index) =>
              renderInspectionCard(inspection, index)
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: primaryColor }]}
        onPress={() => router.push('/quality-assurance/inspections/create')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  filtersContainer: {
    maxHeight: 50,
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  cardProject: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  cardType: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  emptyState: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
