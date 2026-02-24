/**
 * Fleet Detail Screen
 * Supports: Vehicle, Maintenance, Trip, Inspection details
 */

import { ThemedText } from '@/components/themed-text';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useVehicle } from '@/hooks/useFleet';
import type { VehicleStatus } from '@/types/fleet';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function FleetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const [selectedTab, setSelectedTab] = useState<'details' | 'history' | 'documents'>('details');

  // Try to fetch as vehicle first (most common case)
  const { vehicle, loading: vehicleLoading } = useVehicle(id || '');

  if (vehicleLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Container>
          <ThemedText type="default" style={{ color: textMutedColor }}>Loading...</ThemedText>
        </Container>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Container>
          <Section>
            <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
              <Ionicons name="alert-circle-outline" size={48} color={textMutedColor} />
              <ThemedText type="default" style={{ color: textMutedColor, marginTop: 12 }}>
                Vehicle not found
              </ThemedText>
            </View>
          </Section>
        </Container>
      </View>
    );
  }

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case 'ACTIVE': return '#0D9488';
      case 'INACTIVE': return '#6b7280';
      case 'IN_MAINTENANCE': return '#0D9488';
      case 'IN_REPAIR': return '#000000';
      case 'RESERVED': return '#0D9488';
      case 'OUT_OF_SERVICE': return '#000000';
      case 'RETIRED': return '#9ca3af';
      default: return textMutedColor;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Container>
        {/* Header */}
        <Section>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>

          <View style={[styles.header, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={styles.headerTop}>
              <View>
                <ThemedText type="title">{vehicle.vehicleNumber}</ThemedText>
                <ThemedText type="default" style={{ color: textMutedColor, marginTop: 4 }}>
                  {vehicle.make} {vehicle.model} • {vehicle.year}
                </ThemedText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) }]}>
                <ThemedText type="default" style={styles.badgeText}>
                  {vehicle.status}
                </ThemedText>
              </View>
            </View>

            <View style={styles.headerStats}>
              <View style={styles.headerStatItem}>
                <ThemedText type="default" style={{ color: textMutedColor }}>Odometer</ThemedText>
                <ThemedText type="title">{vehicle.currentOdometer.toLocaleString()} km</ThemedText>
              </View>
              <View style={styles.headerStatItem}>
                <ThemedText type="default" style={{ color: textMutedColor }}>Fuel Type</ThemedText>
                <ThemedText type="title">{vehicle.fuelType}</ThemedText>
              </View>
              <View style={styles.headerStatItem}>
                <ThemedText type="default" style={{ color: textMutedColor }}>Ownership</ThemedText>
                <ThemedText type="title">{vehicle.ownershipType}</ThemedText>
              </View>
            </View>
          </View>
        </Section>

        {/* Tab Selector */}
        <Section>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                { borderColor, backgroundColor: selectedTab === 'details' ? tintColor : surfaceColor }
              ]}
              onPress={() => setSelectedTab('details')}
            >
              <ThemedText
                type="default"
                style={[styles.tabText, { color: selectedTab === 'details' ? '#fff' : textColor }]}
              >
                Details
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { borderColor, backgroundColor: selectedTab === 'history' ? tintColor : surfaceColor }
              ]}
              onPress={() => setSelectedTab('history')}
            >
              <ThemedText
                type="default"
                style={[styles.tabText, { color: selectedTab === 'history' ? '#fff' : textColor }]}
              >
                History
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { borderColor, backgroundColor: selectedTab === 'documents' ? tintColor : surfaceColor }
              ]}
              onPress={() => setSelectedTab('documents')}
            >
              <ThemedText
                type="default"
                style={[styles.tabText, { color: selectedTab === 'documents' ? '#fff' : textColor }]}
              >
                Documents
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Details Tab */}
        {selectedTab === 'details' && (
          <>
            {/* Specifications */}
            <Section>
              <ThemedText type="title" style={styles.sectionTitle}>Specifications</ThemedText>
              <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Ionicons name="pricetag-outline" size={16} color={textMutedColor} />
                    <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                      VIN
                    </ThemedText>
                  </View>
                  <ThemedText type="default">{vehicle.vin || '-'}</ThemedText>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Ionicons name="card-outline" size={16} color={textMutedColor} />
                    <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                      License Plate
                    </ThemedText>
                  </View>
                  <ThemedText type="default">{vehicle.licensePlate}</ThemedText>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Ionicons name="color-palette-outline" size={16} color={textMutedColor} />
                    <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                      Color
                    </ThemedText>
                  </View>
                  <ThemedText type="default">{vehicle.color || '-'}</ThemedText>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Ionicons name="speedometer-outline" size={16} color={textMutedColor} />
                    <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                      Engine
                    </ThemedText>
                  </View>
                  <ThemedText type="default">{vehicle.engineCapacity || '-'} cc</ThemedText>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Ionicons name="people-outline" size={16} color={textMutedColor} />
                    <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                      Seats
                    </ThemedText>
                  </View>
                  <ThemedText type="default">{vehicle.seats || '-'}</ThemedText>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Ionicons name="barbell-outline" size={16} color={textMutedColor} />
                    <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                      Load Capacity
                    </ThemedText>
                  </View>
                  <ThemedText type="default">{vehicle.loadCapacity || '-'} kg</ThemedText>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Ionicons name="flash-outline" size={16} color={textMutedColor} />
                    <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                      Fuel Capacity
                    </ThemedText>
                  </View>
                  <ThemedText type="default">{vehicle.fuelCapacity || '-'} L</ThemedText>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Ionicons name="stats-chart-outline" size={16} color={textMutedColor} />
                    <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                      Avg Consumption
                    </ThemedText>
                  </View>
                  <ThemedText type="default">
                    {vehicle.averageFuelConsumption || '-'} km/L
                  </ThemedText>
                </View>
              </View>
            </Section>

            {/* Assignment */}
            <Section>
              <ThemedText type="title" style={styles.sectionTitle}>Assignment</ThemedText>
              <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
                {vehicle.assignedDriverName && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                      <Ionicons name="person-outline" size={16} color={textMutedColor} />
                      <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                        Driver
                      </ThemedText>
                    </View>
                    <ThemedText type="default">{vehicle.assignedDriverName}</ThemedText>
                  </View>
                )}

                {vehicle.assignedProjectName && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                      <Ionicons name="briefcase-outline" size={16} color={textMutedColor} />
                      <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                        Project
                      </ThemedText>
                    </View>
                    <ThemedText type="default">{vehicle.assignedProjectName}</ThemedText>
                  </View>
                )}

                {vehicle.location && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                      <Ionicons name="location-outline" size={16} color={textMutedColor} />
                      <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                        Location
                      </ThemedText>
                    </View>
                    <ThemedText type="default">{vehicle.location}</ThemedText>
                  </View>
                )}

                {!vehicle.assignedDriverName && !vehicle.assignedProjectName && !vehicle.location && (
                  <ThemedText type="default" style={{ color: textMutedColor, textAlign: 'center' }}>
                    Not currently assigned
                  </ThemedText>
                )}
              </View>
            </Section>

            {/* Insurance & Registration */}
            <Section>
              <ThemedText type="title" style={styles.sectionTitle}>Insurance & Registration</ThemedText>
              <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
                {vehicle.insuranceProvider && (
                  <>
                    <View style={styles.detailRow}>
                      <View style={styles.detailLabel}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={textMutedColor} />
                        <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                          Insurance Provider
                        </ThemedText>
                      </View>
                      <ThemedText type="default">{vehicle.insuranceProvider}</ThemedText>
                    </View>

                    {vehicle.insurancePolicyNumber && (
                      <View style={styles.detailRow}>
                        <View style={styles.detailLabel}>
                          <Ionicons name="document-text-outline" size={16} color={textMutedColor} />
                          <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                            Policy Number
                          </ThemedText>
                        </View>
                        <ThemedText type="default">{vehicle.insurancePolicyNumber}</ThemedText>
                      </View>
                    )}

                    {vehicle.insuranceExpiryDate && (
                      <View style={styles.detailRow}>
                        <View style={styles.detailLabel}>
                          <Ionicons name="calendar-outline" size={16} color={textMutedColor} />
                          <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                            Insurance Expiry
                          </ThemedText>
                        </View>
                        <ThemedText type="default">
                          {new Date(vehicle.insuranceExpiryDate).toLocaleDateString()}
                        </ThemedText>
                      </View>
                    )}
                  </>
                )}

                {vehicle.registrationExpiryDate && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                      <Ionicons name="calendar-outline" size={16} color={textMutedColor} />
                      <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                        Registration Expiry
                      </ThemedText>
                    </View>
                    <ThemedText type="default">
                      {new Date(vehicle.registrationExpiryDate).toLocaleDateString()}
                    </ThemedText>
                  </View>
                )}
              </View>
            </Section>

            {/* Maintenance */}
            {vehicle.nextMaintenanceDate && (
              <Section>
                <ThemedText type="title" style={styles.sectionTitle}>Maintenance</ThemedText>
                <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                      <Ionicons name="build-outline" size={16} color={textMutedColor} />
                      <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                        Last Maintenance
                      </ThemedText>
                    </View>
                    <ThemedText type="default">
                      {vehicle.lastMaintenanceDate
                        ? new Date(vehicle.lastMaintenanceDate).toLocaleDateString()
                        : '-'}
                    </ThemedText>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                      <Ionicons name="calendar-outline" size={16} color={tintColor} />
                      <ThemedText type="default" style={{ color: tintColor, marginLeft: 8 }}>
                        Next Maintenance
                      </ThemedText>
                    </View>
                    <ThemedText type="default" style={{ color: tintColor, fontWeight: '600' }}>
                      {new Date(vehicle.nextMaintenanceDate).toLocaleDateString()}
                    </ThemedText>
                  </View>

                  {vehicle.nextMaintenanceOdometer && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailLabel}>
                        <Ionicons name="speedometer-outline" size={16} color={textMutedColor} />
                        <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 8 }}>
                          Next at Odometer
                        </ThemedText>
                      </View>
                      <ThemedText type="default">
                        {vehicle.nextMaintenanceOdometer.toLocaleString()} km
                      </ThemedText>
                    </View>
                  )}
                </View>
              </Section>
            )}
          </>
        )}

        {/* History Tab */}
        {selectedTab === 'history' && (
          <Section>
            <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
              <Ionicons name="time-outline" size={48} color={textMutedColor} />
              <ThemedText type="default" style={{ color: textMutedColor, marginTop: 12 }}>
                Maintenance and trip history coming soon
              </ThemedText>
            </View>
          </Section>
        )}

        {/* Documents Tab */}
        {selectedTab === 'documents' && (
          <Section>
            {vehicle.documents && vehicle.documents.length > 0 ? (
              vehicle.documents.map((doc, index) => (
                <View
                  key={index}
                  style={[styles.documentCard, { backgroundColor: surfaceColor, borderColor }]}
                >
                  <View style={styles.documentHeader}>
                    <Ionicons name="document-outline" size={20} color={tintColor} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <ThemedText type="default">{doc.name}</ThemedText>
                      <ThemedText type="default" style={{ color: textMutedColor }}>
                        {doc.type}
                      </ThemedText>
                    </View>
                  </View>
                  {doc.expiryDate && (
                    <ThemedText type="default" style={{ color: textMutedColor, marginTop: 8 }}>
                      Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                    </ThemedText>
                  )}
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
                <Ionicons name="document-outline" size={48} color={textMutedColor} />
                <ThemedText type="default" style={{ color: textMutedColor, marginTop: 12 }}>
                  No documents uploaded
                </ThemedText>
              </View>
            )}
          </Section>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginBottom: 16,
  },
  header: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerStatItem: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  documentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
