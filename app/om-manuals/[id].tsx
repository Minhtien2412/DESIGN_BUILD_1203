/**
 * O&M Manual Package Detail Screen
 * Shows package details with equipment and documentation
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import {
    useEquipmentItems,
    useManualReviews,
    useOMManualPackage,
} from '@/hooks/useOMManuals';
import type { EquipmentCategory } from '@/types/om-manuals';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function OMManualDetailScreen() {
  const { id } = useLocalSearchParams();
  const packageId = Array.isArray(id) ? id[0] : id;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');

  const { package: pkg, loading: packageLoading } = useOMManualPackage(packageId);
  const { equipment, loading: equipmentLoading } = useEquipmentItems(packageId);
  const { reviews } = useManualReviews(packageId);

  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | null>(null);

  const getCategoryIcon = (category: EquipmentCategory) => {
    switch (category) {
      case 'MECHANICAL':
        return 'cog-outline';
      case 'ELECTRICAL':
        return 'flash-outline';
      case 'PLUMBING':
        return 'water-outline';
      case 'HVAC':
        return 'thermometer-outline';
      case 'FIRE_PROTECTION':
        return 'flame-outline';
      case 'LIFE_SAFETY':
        return 'shield-checkmark-outline';
      case 'SECURITY':
        return 'lock-closed-outline';
      case 'BUILDING_AUTOMATION':
        return 'analytics-outline';
      case 'COMMUNICATIONS':
        return 'wifi-outline';
      case 'ELEVATORS':
        return 'arrow-up-outline';
      case 'LANDSCAPING':
        return 'leaf-outline';
      case 'ARCHITECTURAL':
        return 'home-outline';
      default:
        return 'cube-outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return '#9CA3AF';
      case 'IN_REVIEW':
        return '#0066CC';
      case 'APPROVED':
        return '#0066CC';
      case 'SUBMITTED':
        return '#3B82F6';
      case 'REJECTED':
        return '#000000';
      case 'COMPLETED':
        return '#0066CC';
      case 'ACTIVE':
        return '#0066CC';
      case 'INACTIVE':
        return '#6B7280';
      case 'MAINTENANCE':
        return '#0066CC';
      default:
        return '#6B7280';
    }
  };

  const getCriticalityColor = (criticality?: string) => {
    switch (criticality) {
      case 'CRITICAL':
        return '#000000';
      case 'HIGH':
        return '#0066CC';
      case 'MEDIUM':
        return '#3B82F6';
      case 'LOW':
        return '#0066CC';
      default:
        return '#9CA3AF';
    }
  };

  if (packageLoading) {
    return (
      <View style={[styles.container, { backgroundColor }, styles.centerContent]}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  if (!pkg) {
    return (
      <View style={[styles.container, { backgroundColor }, styles.centerContent]}>
        <Text style={[styles.errorText, { color: textMutedColor }]}>Package not found</Text>
      </View>
    );
  }

  const statusColor = getStatusColor(pkg.status);
  const filteredEquipment = selectedCategory
    ? equipment.filter(e => e.category === selectedCategory)
    : equipment;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.packageNumber, { color: textMutedColor }]}>
              {pkg.packageNumber}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusBadgeText}>{pkg.status}</Text>
            </View>
          </View>
          <Text style={[styles.packageTitle, { color: textColor }]}>{pkg.title}</Text>
        </View>

        {/* Info Grid */}
        <View style={[styles.infoGrid, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: textMutedColor }]}>Project</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {pkg.projectName || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: textMutedColor }]}>Contractor</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {pkg.contractorName || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: textMutedColor }]}>Prepared By</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {pkg.preparedBy?.name || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={[styles.statsGrid, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#3B82F6' }]}>
              {pkg.totalEquipment || 0}
            </Text>
            <Text style={[styles.statLabel, { color: textMutedColor }]}>Equipment</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#666666' }]}>
              {pkg.totalDocuments || 0}
            </Text>
            <Text style={[styles.statLabel, { color: textMutedColor }]}>Documents</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#0066CC' }]}>
              {reviews.filter(r => r.status === 'APPROVED').length}
            </Text>
            <Text style={[styles.statLabel, { color: textMutedColor }]}>Approved</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#0066CC' }]}>
              {reviews.filter(r => r.status === 'PENDING').length}
            </Text>
            <Text style={[styles.statLabel, { color: textMutedColor }]}>Pending</Text>
          </View>
        </View>

        {/* Equipment Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Equipment</Text>

          {equipmentLoading ? (
            <ActivityIndicator size="small" color={tintColor} />
          ) : filteredEquipment.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: surfaceColor, borderColor }]}>
              <Text style={[styles.emptyText, { color: textMutedColor }]}>
                No equipment found
              </Text>
            </View>
          ) : (
            filteredEquipment.map(item => {
              const itemStatusColor = getStatusColor(item.status);
              const criticalityColor = getCriticalityColor(item.criticality);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.equipmentCard, { backgroundColor: surfaceColor, borderColor }]}
                >
                  <View style={styles.equipmentHeader}>
                    <View style={styles.equipmentHeaderLeft}>
                      <Ionicons
                        name={getCategoryIcon(item.category) as any}
                        size={20}
                        color={tintColor}
                      />
                      <Text style={[styles.equipmentNumber, { color: textMutedColor }]}>
                        {item.equipmentNumber}
                      </Text>
                    </View>
                    <View style={styles.badges}>
                      <View style={[styles.statusBadge, { backgroundColor: itemStatusColor }]}>
                        <Text style={styles.statusBadgeText}>{item.status}</Text>
                      </View>
                      {item.criticality && (
                        <View
                          style={[styles.criticalityBadge, { backgroundColor: criticalityColor }]}
                        >
                          <Text style={styles.criticalityBadgeText}>{item.criticality}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Text style={[styles.equipmentName, { color: textColor }]}>
                    {item.equipmentName}
                  </Text>

                  <View style={styles.equipmentInfo}>
                    <View style={styles.equipmentInfoRow}>
                      <Ionicons name="business-outline" size={14} color={textMutedColor} />
                      <Text style={[styles.equipmentInfoText, { color: textMutedColor }]}>
                        {item.manufacturer}
                      </Text>
                    </View>
                    <View style={styles.equipmentInfoRow}>
                      <Ionicons name="cube-outline" size={14} color={textMutedColor} />
                      <Text style={[styles.equipmentInfoText, { color: textMutedColor }]}>
                        {item.model}
                      </Text>
                    </View>
                  </View>

                  {item.location && (
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color={textMutedColor} />
                      <Text style={[styles.locationText, { color: textMutedColor }]}>
                        {item.location}
                        {item.building && ` - ${item.building}`}
                        {item.floor && `, Floor ${item.floor}`}
                      </Text>
                    </View>
                  )}

                  <View style={styles.equipmentStats}>
                    <View style={styles.equipmentStat}>
                      <Ionicons name="document-text-outline" size={16} color="#666666" />
                      <Text style={[styles.equipmentStatText, { color: textColor }]}>
                        {item.documents?.length || 0} docs
                      </Text>
                    </View>
                    <View style={styles.equipmentStat}>
                      <Ionicons name="image-outline" size={16} color="#3B82F6" />
                      <Text style={[styles.equipmentStatText, { color: textColor }]}>
                        {item.photos?.length || 0} photos
                      </Text>
                    </View>
                    <View style={styles.equipmentStat}>
                      <Ionicons name="calendar-outline" size={16} color="#0066CC" />
                      <Text style={[styles.equipmentStatText, { color: textColor }]}>
                        {item.maintenanceSchedule?.length || 0} schedules
                      </Text>
                    </View>
                  </View>

                  {item.warrantyEndDate && (
                    <View style={styles.warrantyRow}>
                      <Ionicons name="shield-checkmark-outline" size={14} color="#0066CC" />
                      <Text style={[styles.warrantyText, { color: textMutedColor }]}>
                        Warranty until {new Date(item.warrantyEndDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Reviews</Text>
            {reviews.map(review => {
              const reviewStatusColor = getStatusColor(review.status);

              return (
                <View
                  key={review.id}
                  style={[styles.reviewCard, { backgroundColor: surfaceColor, borderColor }]}
                >
                  <View style={styles.reviewHeader}>
                    <Text style={[styles.reviewNumber, { color: textMutedColor }]}>
                      Review #{review.reviewNumber}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: reviewStatusColor }]}>
                      <Text style={styles.statusBadgeText}>{review.status}</Text>
                    </View>
                  </View>

                  <View style={styles.reviewerRow}>
                    <Ionicons name="person-outline" size={14} color={textMutedColor} />
                    <Text style={[styles.reviewerText, { color: textColor }]}>
                      {review.reviewedBy.name} - {review.reviewedBy.role}
                    </Text>
                  </View>

                  <View style={styles.reviewDateRow}>
                    <Ionicons name="calendar-outline" size={14} color={textMutedColor} />
                    <Text style={[styles.reviewDateText, { color: textMutedColor }]}>
                      {new Date(review.reviewDate).toLocaleDateString()}
                    </Text>
                  </View>

                  {review.deficienciesFound > 0 && (
                    <View style={styles.deficienciesRow}>
                      <Ionicons name="warning-outline" size={14} color="#0066CC" />
                      <Text style={[styles.deficienciesText, { color: '#0066CC' }]}>
                        {review.deficienciesFound} deficiencies found
                      </Text>
                    </View>
                  )}

                  {review.overallComments && (
                    <Text
                      style={[styles.reviewComments, { color: textMutedColor }]}
                      numberOfLines={2}
                    >
                      {review.overallComments}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
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
  header: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageNumber: {
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
  packageTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  equipmentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipmentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  equipmentNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  criticalityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  criticalityBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  equipmentInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  equipmentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  equipmentInfoText: {
    fontSize: 13,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    flex: 1,
  },
  equipmentStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  equipmentStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  equipmentStatText: {
    fontSize: 12,
    fontWeight: '600',
  },
  warrantyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  warrantyText: {
    fontSize: 12,
  },
  reviewCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewNumber: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  reviewerText: {
    fontSize: 13,
  },
  reviewDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  reviewDateText: {
    fontSize: 12,
  },
  deficienciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  deficienciesText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reviewComments: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
  },
});
