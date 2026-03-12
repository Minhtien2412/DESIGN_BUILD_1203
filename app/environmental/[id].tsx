/**
 * Environmental Detail Screen
 * Supports: Monitoring, Waste Records, Emission Records, Environmental Incidents, Environmental Permits
 */

import { ThemedText } from '@/components/themed-text';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useMonitoring, useWasteRecord } from '@/hooks/useEnvironmental';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function EnvironmentalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor('background');
  const surfaceColor = useThemeColor('surface');
  const textColor = useThemeColor('text');
  const textMutedColor = useThemeColor('textMuted');
  const borderColor = useThemeColor('border');
  const tintColor = useThemeColor('tint');

  const [selectedTab, setSelectedTab] = useState<'details' | 'measurements' | 'actions'>('details');

  // Try loading as monitoring first
  const { monitoring, loading: monitoringLoading } = useMonitoring(id);
  const { wasteRecord, loading: wasteLoading } = useWasteRecord(id);

  const loading = monitoringLoading || wasteLoading;
  const record = monitoring || wasteRecord;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText variant="body" style={{ color: textMutedColor, marginTop: 16 }}>
          Loading details...
        </ThemedText>
      </View>
    );
  }

  if (!record) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <Ionicons name="alert-circle-outline" size={48} color={textMutedColor} />
        <ThemedText variant="body" style={{ color: textMutedColor, marginTop: 16 }}>
          Record not found
        </ThemedText>
      </View>
    );
  }

  const isMonitoring = 'monitoringType' in record;
  const isWaste = 'wasteType' in record;

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      COMPLIANT: '#0D9488',
      NON_COMPLIANT: '#000000',
      REQUIRES_ACTION: '#0D9488',
      COMPLETED: '#0D9488',
      IN_PROGRESS: '#666666',
      SCHEDULED: '#a855f7',
      OVERDUE: '#000000',
      GENERATED: '#6b7280',
      STORED: '#0D9488',
      COLLECTED: '#0D9488',
      IN_TRANSIT: '#666666',
      DISPOSED: '#0D9488',
      RECYCLED: '#0D9488',
    };
    return statusMap[status] || textMutedColor;
  };

  const getResultColor = (result?: 'PASS' | 'FAIL' | 'WARNING') => {
    switch (result) {
      case 'PASS': return '#0D9488';
      case 'FAIL': return '#000000';
      case 'WARNING': return '#0D9488';
      default: return textMutedColor;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Container>
        {/* Header */}
        <Section>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
            <ThemedText variant="body" style={{ marginLeft: 8 }}>Back</ThemedText>
          </TouchableOpacity>

          <ThemedText variant="h2" style={styles.title}>
            {isMonitoring ? (record as any).monitoringNumber : (record as any).wasteNumber}
          </ThemedText>

          <View style={styles.headerBadges}>
            {isMonitoring && (
              <>
                {(record as any).result && (
                  <View style={[styles.badge, { backgroundColor: getResultColor((record as any).result) }]}>
                    <ThemedText variant="caption" style={styles.badgeText}>
                      {(record as any).result}
                    </ThemedText>
                  </View>
                )}
                <View style={[styles.badge, { backgroundColor: getStatusColor((record as any).status) }]}>
                  <ThemedText variant="caption" style={styles.badgeText}>
                    {(record as any).status}
                  </ThemedText>
                </View>
              </>
            )}
            {isWaste && (
              <View style={[styles.badge, { backgroundColor: getStatusColor((record as any).status) }]}>
                <ThemedText variant="caption" style={styles.badgeText}>
                  {(record as any).status}
                </ThemedText>
              </View>
            )}
          </View>
        </Section>

        {/* Tab Selector */}
        <Section>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                { 
                  borderColor, 
                  backgroundColor: selectedTab === 'details' ? tintColor : surfaceColor,
                  borderBottomWidth: selectedTab === 'details' ? 2 : 0,
                  borderBottomColor: tintColor
                }
              ]}
              onPress={() => setSelectedTab('details')}
            >
              <ThemedText
                variant="body"
                style={[styles.tabText, { color: selectedTab === 'details' ? (selectedTab === 'details' ? '#fff' : tintColor) : textColor }]}
              >
                Details
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { 
                  borderColor, 
                  backgroundColor: selectedTab === 'measurements' ? tintColor : surfaceColor,
                  borderBottomWidth: selectedTab === 'measurements' ? 2 : 0,
                  borderBottomColor: tintColor
                }
              ]}
              onPress={() => setSelectedTab('measurements')}
            >
              <ThemedText
                variant="body"
                style={[styles.tabText, { color: selectedTab === 'measurements' ? (selectedTab === 'measurements' ? '#fff' : tintColor) : textColor }]}
              >
                {isMonitoring ? 'Measurements' : 'Documents'}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { 
                  borderColor, 
                  backgroundColor: selectedTab === 'actions' ? tintColor : surfaceColor,
                  borderBottomWidth: selectedTab === 'actions' ? 2 : 0,
                  borderBottomColor: tintColor
                }
              ]}
              onPress={() => setSelectedTab('actions')}
            >
              <ThemedText
                variant="body"
                style={[styles.tabText, { color: selectedTab === 'actions' ? (selectedTab === 'actions' ? '#fff' : tintColor) : textColor }]}
              >
                Actions
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Details Tab */}
        {selectedTab === 'details' && (
          <>
            {isMonitoring && (
              <>
                <Section>
                  <ThemedText variant="h3" style={styles.sectionTitle}>Monitoring Information</ThemedText>
                  <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                    <View style={styles.infoRow}>
                      <ThemedText variant="body" style={{ color: textMutedColor }}>Type</ThemedText>
                      <ThemedText variant="body">{(record as any).monitoringType}</ThemedText>
                    </View>
                    <View style={styles.infoRow}>
                      <ThemedText variant="body" style={{ color: textMutedColor }}>Parameter</ThemedText>
                      <ThemedText variant="body">{(record as any).parameter}</ThemedText>
                    </View>
                    <View style={styles.infoRow}>
                      <ThemedText variant="body" style={{ color: textMutedColor }}>Location</ThemedText>
                      <ThemedText variant="body">{(record as any).location}</ThemedText>
                    </View>
                    <View style={styles.infoRow}>
                      <ThemedText variant="body" style={{ color: textMutedColor }}>Scheduled Date</ThemedText>
                      <ThemedText variant="body">
                        {new Date((record as any).scheduledDate).toLocaleString()}
                      </ThemedText>
                    </View>
                  </View>
                </Section>

                <Section>
                  <ThemedText variant="h3" style={styles.sectionTitle}>Measurement Results</ThemedText>
                  <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                    <View style={styles.infoRow}>
                      <ThemedText variant="body" style={{ color: textMutedColor }}>Regulatory Limit</ThemedText>
                      <ThemedText variant="body">{(record as any).regulatoryLimit} {(record as any).unit}</ThemedText>
                    </View>
                    <View style={styles.infoRow}>
                      <ThemedText variant="body" style={{ color: textMutedColor }}>Target Value</ThemedText>
                      <ThemedText variant="body">{(record as any).targetValue} {(record as any).unit}</ThemedText>
                    </View>
                    <View style={styles.infoRow}>
                      <ThemedText variant="body" style={{ color: textMutedColor }}>Measured Value</ThemedText>
                      <View style={styles.valueWithBadge}>
                        <ThemedText variant="body">
                          {(record as any).measuredValue?.toFixed(2) || 'N/A'} {(record as any).unit}
                        </ThemedText>
                        {(record as any).result && (
                          <View style={[styles.smallBadge, { backgroundColor: getResultColor((record as any).result) }]}>
                            <ThemedText variant="caption" style={styles.badgeText}>
                              {(record as any).result}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </View>
                    {(record as any).exceedancePercentage !== undefined && (
                      <View style={styles.infoRow}>
                        <ThemedText variant="body" style={{ color: textMutedColor }}>Exceedance</ThemedText>
                        <ThemedText variant="body" style={{ color: (record as any).exceedancePercentage > 0 ? '#000000' : '#0D9488' }}>
                          {(record as any).exceedancePercentage.toFixed(1)}%
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </Section>

                {(record as any).equipment && (
                  <Section>
                    <ThemedText variant="h3" style={styles.sectionTitle}>Equipment</ThemedText>
                    <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                      <View style={styles.infoRow}>
                        <ThemedText variant="body" style={{ color: textMutedColor }}>Equipment ID</ThemedText>
                        <ThemedText variant="body">{(record as any).equipment.equipmentId}</ThemedText>
                      </View>
                      {(record as any).equipment.calibrationDate && (
                        <View style={styles.infoRow}>
                          <ThemedText variant="body" style={{ color: textMutedColor }}>Calibration Date</ThemedText>
                          <ThemedText variant="body">
                            {new Date((record as any).equipment.calibrationDate).toLocaleDateString()}
                          </ThemedText>
                        </View>
                      )}
                      {(record as any).equipment.calibrationDue && (
                        <View style={styles.infoRow}>
                          <ThemedText variant="body" style={{ color: textMutedColor }}>Calibration Due</ThemedText>
                          <ThemedText variant="body">
                            {new Date((record as any).equipment.calibrationDue).toLocaleDateString()}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </Section>
                )}

                {(record as any).weatherConditions && (
                  <Section>
                    <ThemedText variant="h3" style={styles.sectionTitle}>Weather Conditions</ThemedText>
                    <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                      <View style={styles.weatherGrid}>
                        <View style={styles.weatherItem}>
                          <Ionicons name="thermometer-outline" size={20} color={tintColor} />
                          <ThemedText variant="caption" style={{ color: textMutedColor, marginTop: 4 }}>Temperature</ThemedText>
                          <ThemedText variant="body">{(record as any).weatherConditions.temperature}°C</ThemedText>
                        </View>
                        <View style={styles.weatherItem}>
                          <Ionicons name="water-outline" size={20} color={tintColor} />
                          <ThemedText variant="caption" style={{ color: textMutedColor, marginTop: 4 }}>Humidity</ThemedText>
                          <ThemedText variant="body">{(record as any).weatherConditions.humidity}%</ThemedText>
                        </View>
                        {(record as any).weatherConditions.windSpeed && (
                          <View style={styles.weatherItem}>
                            <Ionicons name="speedometer-outline" size={20} color={tintColor} />
                            <ThemedText variant="caption" style={{ color: textMutedColor, marginTop: 4 }}>Wind Speed</ThemedText>
                            <ThemedText variant="body">{(record as any).weatherConditions.windSpeed} km/h</ThemedText>
                          </View>
                        )}
                      </View>
                    </View>
                  </Section>
                )}
              </>
            )}

            {isWaste && (
              <>
                <Section>
                  <ThemedText variant="h3" style={styles.sectionTitle}>Waste Information</ThemedText>
                  <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                    <View style={styles.infoRow}>
                      <ThemedText variant="body" style={{ color: textMutedColor }}>Type</ThemedText>
                      <ThemedText variant="body">{(record as any).wasteType}</ThemedText>
                    </View>
                    <View style={styles.infoRow}>
                      <ThemedText variant="body" style={{ color: textMutedColor }}>Description</ThemedText>
                      <ThemedText variant="body">{(record as any).description}</ThemedText>
                    </View>
                    <View style={styles.infoRow}>
                      <ThemedText variant="body" style={{ color: textMutedColor }}>Quantity</ThemedText>
                      <ThemedText variant="body">{(record as any).quantity} {(record as any).unit}</ThemedText>
                    </View>
                    <View style={styles.infoRow}>
                      <ThemedText variant="body" style={{ color: textMutedColor }}>Generated Date</ThemedText>
                      <ThemedText variant="body">
                        {new Date((record as any).generatedDate).toLocaleDateString()}
                      </ThemedText>
                    </View>
                    <View style={styles.infoRow}>
                      <ThemedText variant="body" style={{ color: textMutedColor }}>Generation Location</ThemedText>
                      <ThemedText variant="body">{(record as any).generationLocation}</ThemedText>
                    </View>
                  </View>
                </Section>

                {(record as any).storage && (
                  <Section>
                    <ThemedText variant="h3" style={styles.sectionTitle}>Storage Details</ThemedText>
                    <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                      {(record as any).storage.containerType && (
                        <View style={styles.infoRow}>
                          <ThemedText variant="body" style={{ color: textMutedColor }}>Container Type</ThemedText>
                          <ThemedText variant="body">{(record as any).storage.containerType}</ThemedText>
                        </View>
                      )}
                      {(record as any).storage.containerQuantity && (
                        <View style={styles.infoRow}>
                          <ThemedText variant="body" style={{ color: textMutedColor }}>Container Quantity</ThemedText>
                          <ThemedText variant="body">{(record as any).storage.containerQuantity}</ThemedText>
                        </View>
                      )}
                      {(record as any).storage.storageDuration && (
                        <View style={styles.infoRow}>
                          <ThemedText variant="body" style={{ color: textMutedColor }}>Storage Duration</ThemedText>
                          <ThemedText variant="body">{(record as any).storage.storageDuration} days</ThemedText>
                        </View>
                      )}
                      {(record as any).storage.storageConditions && (
                        <View style={styles.infoRow}>
                          <ThemedText variant="body" style={{ color: textMutedColor }}>Conditions</ThemedText>
                          <ThemedText variant="body">{(record as any).storage.storageConditions}</ThemedText>
                        </View>
                      )}
                    </View>
                  </Section>
                )}

                {(record as any).disposal && (
                  <Section>
                    <ThemedText variant="h3" style={styles.sectionTitle}>Disposal Details</ThemedText>
                    <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                      <View style={styles.infoRow}>
                        <ThemedText variant="body" style={{ color: textMutedColor }}>Method</ThemedText>
                        <ThemedText variant="body">{(record as any).disposal.disposalMethod}</ThemedText>
                      </View>
                      {(record as any).disposal.disposalFacility && (
                        <>
                          <View style={styles.infoRow}>
                            <ThemedText variant="body" style={{ color: textMutedColor }}>Facility</ThemedText>
                            <ThemedText variant="body">{(record as any).disposal.disposalFacility.name}</ThemedText>
                          </View>
                          {(record as any).disposal.disposalFacility.licenseNumber && (
                            <View style={styles.infoRow}>
                              <ThemedText variant="body" style={{ color: textMutedColor }}>License #</ThemedText>
                              <ThemedText variant="body">{(record as any).disposal.disposalFacility.licenseNumber}</ThemedText>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  </Section>
                )}

                {(record as any).costs && (
                  <Section>
                    <ThemedText variant="h3" style={styles.sectionTitle}>Cost Summary</ThemedText>
                    <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                      {(record as any).costs.disposalCost && (
                        <View style={styles.infoRow}>
                          <ThemedText variant="body" style={{ color: textMutedColor }}>Disposal Cost</ThemedText>
                          <ThemedText variant="body">
                            {(record as any).costs.disposalCost} {(record as any).costs.currency}
                          </ThemedText>
                        </View>
                      )}
                      {(record as any).costs.transportCost && (
                        <View style={styles.infoRow}>
                          <ThemedText variant="body" style={{ color: textMutedColor }}>Transport Cost</ThemedText>
                          <ThemedText variant="body">
                            {(record as any).costs.transportCost} {(record as any).costs.currency}
                          </ThemedText>
                        </View>
                      )}
                      {(record as any).costs.totalCost && (
                        <View style={[styles.infoRow, styles.totalRow]}>
                          <ThemedText variant="h4">Total Cost</ThemedText>
                          <ThemedText variant="h4" style={{ color: tintColor }}>
                            {(record as any).costs.totalCost} {(record as any).costs.currency}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </Section>
                )}
              </>
            )}
          </>
        )}

        {/* Measurements/Documents Tab */}
        {selectedTab === 'measurements' && (
          <Section>
            {isMonitoring && (record as any).measurements && (record as any).measurements.length > 0 ? (
              (record as any).measurements.map((measurement: any, index: number) => (
                <View key={index} style={[styles.measurementCard, { backgroundColor: surfaceColor, borderColor }]}>
                  <View style={styles.measurementHeader}>
                    <ThemedText variant="body" style={{ fontWeight: '600' }}>{measurement.parameter}</ThemedText>
                    {measurement.compliant !== undefined && (
                      <View style={[styles.smallBadge, { backgroundColor: measurement.compliant ? '#0D9488' : '#000000' }]}>
                        <ThemedText variant="caption" style={styles.badgeText}>
                          {measurement.compliant ? 'PASS' : 'FAIL'}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <View style={styles.measurementDetails}>
                    <View style={styles.measurementItem}>
                      <ThemedText variant="caption" style={{ color: textMutedColor }}>Value</ThemedText>
                      <ThemedText variant="body">{measurement.value} {measurement.unit}</ThemedText>
                    </View>
                    {measurement.limit && (
                      <View style={styles.measurementItem}>
                        <ThemedText variant="caption" style={{ color: textMutedColor }}>Limit</ThemedText>
                        <ThemedText variant="body">{measurement.limit} {measurement.unit}</ThemedText>
                      </View>
                    )}
                    {measurement.timestamp && (
                      <View style={styles.measurementItem}>
                        <ThemedText variant="caption" style={{ color: textMutedColor }}>Time</ThemedText>
                        <ThemedText variant="caption">
                          {new Date(measurement.timestamp).toLocaleTimeString()}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
                <Ionicons name="document-outline" size={48} color={textMutedColor} />
                <ThemedText variant="body" style={{ color: textMutedColor, marginTop: 12 }}>
                  {isMonitoring ? 'No measurements recorded' : 'No documents available'}
                </ThemedText>
              </View>
            )}
          </Section>
        )}

        {/* Actions Tab */}
        {selectedTab === 'actions' && (
          <Section>
            {isMonitoring && (record as any).correctiveActions && (record as any).correctiveActions.length > 0 ? (
              (record as any).correctiveActions.map((action: string, index: number) => (
                <View key={index} style={[styles.actionCard, { backgroundColor: surfaceColor, borderColor }]}>
                  <View style={styles.actionHeader}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={tintColor} />
                    <ThemedText variant="body" style={{ marginLeft: 8, flex: 1 }}>
                      {action}
                    </ThemedText>
                  </View>
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
                <Ionicons name="list-outline" size={48} color={textMutedColor} />
                <ThemedText variant="body" style={{ color: textMutedColor, marginTop: 12 }}>
                  No actions required
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
  },
  valueWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  weatherItem: {
    flex: 1,
    alignItems: 'center',
  },
  measurementCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  measurementDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  measurementItem: {
    flex: 1,
  },
  actionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
});
