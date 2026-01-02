/**
 * Warranty Items List Screen
 * Lists warranties with filtering and expiry tracking
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useWarrantyItems } from '@/hooks/useWarranty';
import type { WarrantyItem, WarrantyStatus } from '@/types/warranty';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const STATUS_FILTERS = [
  { label: 'All', value: null },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Expiring Soon', value: null, expiringWithinDays: 90 },
  { label: 'Expired', value: 'EXPIRED' },
];

export default function WarrantyListScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');
  const [selectedFilter, setSelectedFilter] = useState(0);
  const filter = STATUS_FILTERS[selectedFilter];
  const { warranties, loading } = useWarrantyItems({
    status: filter.value as WarrantyStatus | undefined,
    expiringWithinDays: filter.expiringWithinDays,
  });

  // Calculate overall stats
  const activeWarranties = warranties.filter(w => w.status === 'ACTIVE').length;
  const expiringSoon = warranties.filter(
    w => w.remainingDays !== undefined && w.remainingDays <= 90 && w.remainingDays > 0
  ).length;
  const totalClaims = warranties.reduce((sum, w) => sum + w.claimCount, 0);

  const getStatusColor = (status: WarrantyStatus) => {
    switch (status) {
      case 'ACTIVE':
        return '#10B981';
      case 'EXPIRED':
        return '#6B7280';
      case 'CANCELLED':
        return '#EF4444';
      case 'PENDING':
        return '#F59E0B';
      case 'SUSPENDED':
        return '#F59E0B';
      default:
        return '#9CA3AF';
    }
  };

  const getExpiryColor = (remainingDays?: number) => {
    if (remainingDays === undefined) return '#9CA3AF';
    if (remainingDays <= 0) return '#EF4444';
    if (remainingDays <= 30) return '#EF4444';
    if (remainingDays <= 90) return '#F59E0B';
    return '#10B981';
  };

  const renderStats = () => (
    <View style={[styles.statsContainer, { backgroundColor: surfaceColor }]}>
      <View style={styles.statItem}>
        <Ionicons name="shield-checkmark-outline" size={24} color="#10B981" />
        <Text style={[styles.statValue, { color: textColor }]}>{warranties.length}</Text>
        <Text style={[styles.statLabel, { color: textMutedColor }]}>Total</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
        <Text style={[styles.statValue, { color: textColor }]}>{activeWarranties}</Text>
        <Text style={[styles.statLabel, { color: textMutedColor }]}>Active</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name="time-outline" size={24} color="#F59E0B" />
        <Text style={[styles.statValue, { color: textColor }]}>{expiringSoon}</Text>
        <Text style={[styles.statLabel, { color: textMutedColor }]}>Expiring</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name="alert-circle-outline" size={24} color="#3B82F6" />
        <Text style={[styles.statValue, { color: textColor }]}>{totalClaims}</Text>
        <Text style={[styles.statLabel, { color: textMutedColor }]}>Claims</Text>
      </View>
    </View>
  );

  const renderFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filtersContainer}
      contentContainerStyle={styles.filtersContent}
    >
      {STATUS_FILTERS.map((filter, index) => {
        const isSelected = index === selectedFilter;
        return (
          <TouchableOpacity
            key={filter.label}
            style={[
              styles.filterButton,
              { borderColor },
              isSelected && { backgroundColor: tintColor, borderColor: tintColor },
            ]}
            onPress={() => setSelectedFilter(index)}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: textColor },
                isSelected && { color: '#fff' },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderWarrantyCard = (warranty: WarrantyItem) => {
    const statusColor = getStatusColor(warranty.status);
    const expiryColor = getExpiryColor(warranty.remainingDays);

    return (
      <TouchableOpacity
        key={warranty.id}
        style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
        onPress={() => router.push(`/warranty/${warranty.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={[styles.warrantyNumber, { color: textMutedColor }]}>
              {warranty.warrantyNumber}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusBadgeText}>{warranty.status}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.itemName, { color: textColor }]}>{warranty.itemName}</Text>

        {warranty.manufacturer && (
          <View style={styles.manufacturerRow}>
            <Ionicons name="business-outline" size={14} color={textMutedColor} />
            <Text style={[styles.manufacturerText, { color: textMutedColor }]}>
              {warranty.manufacturer}
              {warranty.model && ` - ${warranty.model}`}
            </Text>
          </View>
        )}

        {warranty.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={textMutedColor} />
            <Text style={[styles.locationText, { color: textMutedColor }]}>
              {warranty.location}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: textMutedColor }]}>Type</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {warranty.warrantyType.replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: textMutedColor }]}>Provider</Text>
            <Text style={[styles.infoValue, { color: textColor }]} numberOfLines={1}>
              {warranty.providedBy.company}
            </Text>
          </View>
        </View>

        <View style={styles.datesRow}>
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={14} color={textMutedColor} />
            <Text style={[styles.dateText, { color: textMutedColor }]}>
              Start: {new Date(warranty.startDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={14} color={expiryColor} />
            <Text style={[styles.dateText, { color: expiryColor }]}>
              End: {new Date(warranty.endDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {warranty.remainingDays !== undefined && warranty.remainingDays > 0 && (
          <View style={[styles.remainingBadge, { backgroundColor: expiryColor + '20' }]}>
            <Ionicons name="time-outline" size={16} color={expiryColor} />
            <Text style={[styles.remainingText, { color: expiryColor }]}>
              {warranty.remainingDays} days remaining
            </Text>
          </View>
        )}

        {warranty.remainingDays !== undefined && warranty.remainingDays <= 0 && (
          <View style={[styles.expiredBadge, { backgroundColor: '#EF444420' }]}>
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <Text style={[styles.expiredText, { color: '#EF4444' }]}>
              Expired {Math.abs(warranty.remainingDays)} days ago
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.cardFooterItem}>
            <Ionicons name="document-text-outline" size={14} color={textMutedColor} />
            <Text style={[styles.cardFooterText, { color: textMutedColor }]}>
              {warranty.documents?.length || 0} docs
            </Text>
          </View>
          {warranty.claimCount > 0 && (
            <View style={styles.claimsBadge}>
              <Ionicons name="alert-circle-outline" size={14} color="#3B82F6" />
              <Text style={[styles.claimsText, { color: '#3B82F6' }]}>
                {warranty.claimCount} claims
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }, styles.centerContent]}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView}>
        {renderStats()}
        {renderFilters()}

        <View style={styles.listContainer}>
          {warranties.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="shield-outline" size={64} color={textMutedColor} />
              <Text style={[styles.emptyStateText, { color: textMutedColor }]}>
                No warranties found
              </Text>
            </View>
          ) : (
            warranties.map(renderWarrantyCard)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  filtersContainer: {
    marginTop: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warrantyNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  manufacturerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  manufacturerText: {
    fontSize: 13,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
  remainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  expiredText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardFooterText: {
    fontSize: 12,
  },
  claimsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
  },
});
