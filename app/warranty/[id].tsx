/**
 * Warranty Detail Screen
 * Shows warranty details with claims tracking
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useWarrantyClaims, useWarrantyItem } from '@/hooks/useWarranty';
import type { ClaimPriority } from '@/types/warranty';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function WarrantyDetailScreen() {
  const { id } = useLocalSearchParams();
  const warrantyId = Array.isArray(id) ? id[0] : id;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');

  const { warranty, loading: warrantyLoading } = useWarrantyItem(warrantyId);
  const { claims } = useWarrantyClaims({ warrantyId });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#10B981';
      case 'EXPIRED':
        return '#6B7280';
      case 'CANCELLED':
        return '#EF4444';
      case 'PENDING':
      case 'UNDER_REVIEW':
        return '#F59E0B';
      case 'APPROVED':
      case 'COMPLETED':
        return '#10B981';
      case 'REJECTED':
        return '#EF4444';
      case 'SUBMITTED':
      case 'IN_PROGRESS':
        return '#3B82F6';
      default:
        return '#9CA3AF';
    }
  };

  const getPriorityColor = (priority: ClaimPriority) => {
    switch (priority) {
      case 'EMERGENCY':
        return '#DC2626';
      case 'URGENT':
        return '#EF4444';
      case 'HIGH':
        return '#F59E0B';
      case 'MEDIUM':
        return '#3B82F6';
      case 'LOW':
        return '#10B981';
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

  if (warrantyLoading) {
    return (
      <View style={[styles.container, { backgroundColor }, styles.centerContent]}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  if (!warranty) {
    return (
      <View style={[styles.container, { backgroundColor }, styles.centerContent]}>
        <Text style={[styles.errorText, { color: textMutedColor }]}>Warranty not found</Text>
      </View>
    );
  }

  const statusColor = getStatusColor(warranty.status);
  const expiryColor = getExpiryColor(warranty.remainingDays);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.warrantyNumber, { color: textMutedColor }]}>
              {warranty.warrantyNumber}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusBadgeText}>{warranty.status}</Text>
            </View>
          </View>
          <Text style={[styles.itemName, { color: textColor }]}>{warranty.itemName}</Text>
        </View>

        {/* Expiry Alert */}
        {warranty.remainingDays !== undefined && warranty.remainingDays <= 90 && (
          <View
            style={[
              styles.expiryAlert,
              { backgroundColor: expiryColor + '20', borderColor: expiryColor },
            ]}
          >
            <Ionicons name="time-outline" size={20} color={expiryColor} />
            <Text style={[styles.expiryAlertText, { color: expiryColor }]}>
              {warranty.remainingDays > 0
                ? `Expires in ${warranty.remainingDays} days`
                : `Expired ${Math.abs(warranty.remainingDays)} days ago`}
            </Text>
          </View>
        )}

        {/* Item Info */}
        <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Item Information</Text>
          <View style={styles.infoGrid}>
            {warranty.manufacturer && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: textMutedColor }]}>Manufacturer</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  {warranty.manufacturer}
                </Text>
              </View>
            )}
            {warranty.model && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: textMutedColor }]}>Model</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>{warranty.model}</Text>
              </View>
            )}
            {warranty.serialNumber && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: textMutedColor }]}>Serial Number</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  {warranty.serialNumber}
                </Text>
              </View>
            )}
            {warranty.location && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: textMutedColor }]}>Location</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>{warranty.location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Warranty Details */}
        <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Warranty Details</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: textMutedColor }]}>Type</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {warranty.warrantyType.replace(/_/g, ' ')}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: textMutedColor }]}>Provider</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {warranty.providedBy.company}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: textMutedColor }]}>Start Date</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {new Date(warranty.startDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: textMutedColor }]}>End Date</Text>
              <Text style={[styles.infoValue, { color: expiryColor }]}>
                {new Date(warranty.endDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: textMutedColor }]}>Period</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {warranty.warrantyPeriod} months
              </Text>
            </View>
            {warranty.warrantyValue && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: textMutedColor }]}>Value</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  ${warranty.warrantyValue.toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          {warranty.coverageType && warranty.coverageType.length > 0 && (
            <View style={styles.coverageSection}>
              <Text style={[styles.coverageLabel, { color: textMutedColor }]}>Coverage</Text>
              <View style={styles.coverageTags}>
                {warranty.coverageType.map(type => (
                  <View key={type} style={[styles.coverageTag, { borderColor }]}>
                    <Text style={[styles.coverageTagText, { color: textColor }]}>
                      {type.replace(/_/g, ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Provider Contact */}
        {warranty.providedBy.phone || warranty.providedBy.email && (
          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Provider Contact</Text>
            {warranty.providedBy.contactPerson && (
              <View style={styles.contactRow}>
                <Ionicons name="person-outline" size={16} color={textMutedColor} />
                <Text style={[styles.contactText, { color: textColor }]}>
                  {warranty.providedBy.contactPerson}
                </Text>
              </View>
            )}
            {warranty.providedBy.phone && (
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={16} color={textMutedColor} />
                <Text style={[styles.contactText, { color: textColor }]}>
                  {warranty.providedBy.phone}
                </Text>
              </View>
            )}
            {warranty.providedBy.email && (
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={16} color={textMutedColor} />
                <Text style={[styles.contactText, { color: textColor }]}>
                  {warranty.providedBy.email}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Claims Section */}
        <View style={styles.claimsSection}>
          <View style={styles.claimsSectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Claims History</Text>
            <Text style={[styles.claimsCount, { color: textMutedColor }]}>
              {claims.length} total
            </Text>
          </View>

          {claims.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: surfaceColor, borderColor }]}>
              <Text style={[styles.emptyText, { color: textMutedColor }]}>No claims filed</Text>
            </View>
          ) : (
            claims.map(claim => {
              const claimStatusColor = getStatusColor(claim.status);
              const priorityColor = getPriorityColor(claim.priority);

              return (
                <TouchableOpacity
                  key={claim.id}
                  style={[styles.claimCard, { backgroundColor: surfaceColor, borderColor }]}
                  onPress={() => router.push(`/warranty/claims/${claim.id}`)}
                >
                  <View style={styles.claimHeader}>
                    <Text style={[styles.claimNumber, { color: textMutedColor }]}>
                      {claim.claimNumber}
                    </Text>
                    <View style={styles.claimBadges}>
                      <View style={[styles.statusBadge, { backgroundColor: claimStatusColor }]}>
                        <Text style={styles.statusBadgeText}>{claim.status}</Text>
                      </View>
                      <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                        <Text style={styles.priorityBadgeText}>{claim.priority}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={[styles.claimTitle, { color: textColor }]}>{claim.title}</Text>

                  <View style={styles.claimInfo}>
                    <View style={styles.claimInfoRow}>
                      <Ionicons name="calendar-outline" size={14} color={textMutedColor} />
                      <Text style={[styles.claimInfoText, { color: textMutedColor }]}>
                        {new Date(claim.issueDate).toLocaleDateString()}
                      </Text>
                    </View>
                    {claim.estimatedCost && (
                      <View style={styles.claimInfoRow}>
                        <Ionicons name="cash-outline" size={14} color={textMutedColor} />
                        <Text style={[styles.claimInfoText, { color: textMutedColor }]}>
                          ${claim.estimatedCost.toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Documents */}
        {warranty.documents && warranty.documents.length > 0 && (
          <View style={styles.documentsSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Documents</Text>
            {warranty.documents.map(doc => (
              <View
                key={doc.id}
                style={[styles.documentCard, { backgroundColor: surfaceColor, borderColor }]}
              >
                <Ionicons name="document-text-outline" size={20} color={tintColor} />
                <View style={styles.documentInfo}>
                  <Text style={[styles.documentName, { color: textColor }]}>{doc.name}</Text>
                  <Text style={[styles.documentType, { color: textMutedColor }]}>
                    {doc.documentType.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>
            ))}
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
    fontSize: 18,
    fontWeight: '700',
  },
  expiryAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  expiryAlertText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  coverageSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  coverageLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  coverageTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  coverageTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  coverageTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
  },
  claimsSection: {
    padding: 16,
  },
  claimsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  claimsCount: {
    fontSize: 14,
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
  claimCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  claimNumber: {
    fontSize: 13,
    fontWeight: '600',
  },
  claimBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  claimTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  claimInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  claimInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimInfoText: {
    fontSize: 12,
  },
  documentsSection: {
    padding: 16,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  documentType: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 16,
  },
});
