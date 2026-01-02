/**
 * Fleet Management List Screen
 */

import { ThemedText } from '@/components/themed-text';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFleetSummary, useVehicles } from '@/hooks/useFleet';
import type { VehicleStatus, VehicleType } from '@/types/fleet';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const VEHICLE_TYPE_ICONS: Record<VehicleType, keyof typeof Ionicons.glyphMap> = {
  CAR: 'car-outline',
  TRUCK: 'bus-outline',
  VAN: 'car-sport-outline',
  PICKUP: 'car-outline',
  CRANE: 'construct-outline',
  EXCAVATOR: 'hammer-outline',
  BULLDOZER: 'construct-outline',
  LOADER: 'business-outline',
  FORKLIFT: 'construct-outline',
  DUMP_TRUCK: 'bus-outline',
  CONCRETE_MIXER: 'business-outline',
  TRAILER: 'bus-outline',
  MOTORCYCLE: 'bicycle-outline',
  OTHER: 'ellipse-outline',
};

export default function FleetScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const [selectedTab, setSelectedTab] = useState<'vehicles' | 'maintenance' | 'fuel' | 'trips'>('vehicles');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'ALL'>('ALL');

  const { summary } = useFleetSummary();
  const { vehicles, loading } = useVehicles();

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case 'ACTIVE': return '#22c55e';
      case 'INACTIVE': return '#6b7280';
      case 'IN_MAINTENANCE': return '#f59e0b';
      case 'IN_REPAIR': return '#ef4444';
      case 'RESERVED': return '#3b82f6';
      case 'OUT_OF_SERVICE': return '#dc2626';
      case 'RETIRED': return '#9ca3af';
      default: return textMutedColor;
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    statusFilter === 'ALL' || v.status === statusFilter
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Container>
        {/* Header Stats */}
        <Section>
          <ThemedText type="title" style={styles.title}>Fleet Management</ThemedText>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText type="default" style={styles.statLabel}>Total Vehicles</ThemedText>
              <ThemedText type="title" style={styles.statValue}>
                {summary?.totalVehicles || 0}
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText type="default" style={styles.statLabel}>Active</ThemedText>
              <ThemedText type="title" style={[styles.statValue, { color: '#22c55e' }]}>
                {summary?.activeVehicles || 0}
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText type="default" style={styles.statLabel}>In Maintenance</ThemedText>
              <ThemedText type="title" style={[styles.statValue, { color: '#f59e0b' }]}>
                {summary?.inMaintenanceVehicles || 0}
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText type="default" style={styles.statLabel}>Utilization</ThemedText>
              <ThemedText type="title" style={[styles.statValue, { color: tintColor }]}>
                {summary?.utilizationRate?.toFixed(0) || 0}%
              </ThemedText>
            </View>
          </View>
        </Section>

        {/* Tab Selector */}
        <Section>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  { borderColor, backgroundColor: selectedTab === 'vehicles' ? tintColor : surfaceColor }
                ]}
                onPress={() => setSelectedTab('vehicles')}
              >
                <ThemedText
                  type="default"
                  style={[styles.tabText, { color: selectedTab === 'vehicles' ? '#fff' : textColor }]}
                >
                  Vehicles
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  { borderColor, backgroundColor: selectedTab === 'maintenance' ? tintColor : surfaceColor }
                ]}
                onPress={() => setSelectedTab('maintenance')}
              >
                <ThemedText
                  type="default"
                  style={[styles.tabText, { color: selectedTab === 'maintenance' ? '#fff' : textColor }]}
                >
                  Maintenance
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  { borderColor, backgroundColor: selectedTab === 'fuel' ? tintColor : surfaceColor }
                ]}
                onPress={() => setSelectedTab('fuel')}
              >
                <ThemedText
                  type="default"
                  style={[styles.tabText, { color: selectedTab === 'fuel' ? '#fff' : textColor }]}
                >
                  Fuel
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  { borderColor, backgroundColor: selectedTab === 'trips' ? tintColor : surfaceColor }
                ]}
                onPress={() => setSelectedTab('trips')}
              >
                <ThemedText
                  type="default"
                  style={[styles.tabText, { color: selectedTab === 'trips' ? '#fff' : textColor }]}
                >
                  Trips
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Section>

        {/* Vehicles Tab */}
        {selectedTab === 'vehicles' && (
          <>
            {/* Status Filters */}
            <Section>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                {(['ALL', 'ACTIVE', 'IN_MAINTENANCE', 'RESERVED', 'INACTIVE'] as const).map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterChip,
                      { 
                        backgroundColor: statusFilter === status ? tintColor : surfaceColor,
                        borderColor 
                      }
                    ]}
                    onPress={() => setStatusFilter(status as VehicleStatus | 'ALL')}
                  >
                    <ThemedText
                      type="default"
                      style={[
                        styles.filterText,
                        { color: statusFilter === status ? '#fff' : textColor }
                      ]}
                    >
                      {status}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Section>

            {/* Vehicles List */}
            <Section>
              {loading ? (
                <ThemedText type="default" style={{ color: textMutedColor }}>Loading vehicles...</ThemedText>
              ) : filteredVehicles.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
                  <Ionicons name="car-outline" size={48} color={textMutedColor} />
                  <ThemedText type="default" style={{ color: textMutedColor, marginTop: 12 }}>
                    No vehicles found
                  </ThemedText>
                </View>
              ) : (
                filteredVehicles.map(vehicle => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
                    onPress={() => router.push(`/fleet/${vehicle.id}`)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Ionicons
                          name={VEHICLE_TYPE_ICONS[vehicle.type]}
                          size={24}
                          color={tintColor}
                        />
                        <View style={{ marginLeft: 12 }}>
                          <ThemedText type="title">{vehicle.vehicleNumber}</ThemedText>
                          <ThemedText type="default" style={{ color: textMutedColor }}>
                            {vehicle.make} {vehicle.model}
                          </ThemedText>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) }]}>
                        <ThemedText type="default" style={styles.badgeText}>
                          {vehicle.status}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Ionicons name="speedometer-outline" size={16} color={textMutedColor} />
                        <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 6 }}>
                          {vehicle.currentOdometer.toLocaleString()} km
                        </ThemedText>
                      </View>
                      <View style={styles.infoItem}>
                        <Ionicons name="flame-outline" size={16} color={textMutedColor} />
                        <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 6 }}>
                          {vehicle.fuelType}
                        </ThemedText>
                      </View>
                      {vehicle.assignedDriverName && (
                        <View style={styles.infoItem}>
                          <Ionicons name="person-outline" size={16} color={textMutedColor} />
                          <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 6 }}>
                            {vehicle.assignedDriverName}
                          </ThemedText>
                        </View>
                      )}
                    </View>

                    {vehicle.nextMaintenanceDate && (
                      <View style={[styles.maintenanceAlert, { backgroundColor, borderColor, marginTop: 12 }]}>
                        <Ionicons name="build-outline" size={14} color={tintColor} />
                        <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 6 }}>
                          Next maintenance: {new Date(vehicle.nextMaintenanceDate).toLocaleDateString()}
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </Section>
          </>
        )}

        {/* Maintenance Tab */}
        {selectedTab === 'maintenance' && (
          <Section>
            <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
              <Ionicons name="build-outline" size={48} color={textMutedColor} />
              <ThemedText type="default" style={{ color: textMutedColor, marginTop: 12 }}>
                Maintenance records coming soon
              </ThemedText>
            </View>
          </Section>
        )}

        {/* Fuel Tab */}
        {selectedTab === 'fuel' && (
          <Section>
            <View style={[styles.summaryCard, { backgroundColor: surfaceColor, borderColor, marginBottom: 16 }]}>
              <View style={styles.summaryRow}>
                <ThemedText type="default" style={{ color: textMutedColor }}>This Month</ThemedText>
                <ThemedText type="title">
                  {summary?.fuelConsumptionThisMonth?.toLocaleString() || 0} L
                </ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText type="default" style={{ color: textMutedColor }}>Cost</ThemedText>
                <ThemedText type="title" style={{ color: tintColor }}>
                  {summary?.fuelCostThisMonth?.toLocaleString() || 0} {summary?.currency}
                </ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText type="default" style={{ color: textMutedColor }}>Avg Efficiency</ThemedText>
                <ThemedText type="title">
                  {summary?.averageFuelEfficiency?.toFixed(2) || 0} km/L
                </ThemedText>
              </View>
            </View>

            <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
              <Ionicons name="flame-outline" size={48} color={textMutedColor} />
              <ThemedText type="default" style={{ color: textMutedColor, marginTop: 12 }}>
                Fuel entries coming soon
              </ThemedText>
            </View>
          </Section>
        )}

        {/* Trips Tab */}
        {selectedTab === 'trips' && (
          <Section>
            <View style={[styles.summaryCard, { backgroundColor: surfaceColor, borderColor, marginBottom: 16 }]}>
              <View style={styles.summaryRow}>
                <ThemedText type="default" style={{ color: textMutedColor }}>Trips This Month</ThemedText>
                <ThemedText type="title">{summary?.tripsThisMonth || 0}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText type="default" style={{ color: textMutedColor }}>Total Distance</ThemedText>
                <ThemedText type="title">
                  {summary?.distanceThisMonth?.toLocaleString() || 0} km
                </ThemedText>
              </View>
            </View>

            <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
              <Ionicons name="navigate-outline" size={48} color={textMutedColor} />
              <ThemedText type="default" style={{ color: textMutedColor, marginTop: 12 }}>
                Trip records coming soon
              </ThemedText>
            </View>
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
  title: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statLabel: {
    marginBottom: 4,
  },
  statValue: {
    marginTop: 4,
  },
  tabScrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
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
  filterContainer: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontWeight: '500',
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maintenanceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
});
