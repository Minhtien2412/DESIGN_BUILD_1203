/**
 * Environmental Management List Screen
 */

import { ThemedText } from '@/components/themed-text';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    useEnvironmentalMonitoring,
    useEnvironmentalSummary,
    useWasteRecords,
} from '@/hooks/useEnvironmental';
import type { MonitoringStatus, MonitoringType, WasteType } from '@/types/environmental';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const MONITORING_TYPE_ICONS: Record<MonitoringType, keyof typeof Ionicons.glyphMap> = {
  AIR_QUALITY: 'cloud-outline',
  WATER_QUALITY: 'water-outline',
  SOIL_QUALITY: 'earth-outline',
  NOISE_LEVEL: 'volume-high-outline',
  VIBRATION: 'pulse-outline',
  DUST: 'cloudy-outline',
  TEMPERATURE: 'thermometer-outline',
  HUMIDITY: 'rainy-outline',
  RADIATION: 'radio-outline',
  LIGHT: 'sunny-outline',
};

const WASTE_TYPE_ICONS: Record<WasteType, keyof typeof Ionicons.glyphMap> = {
  GENERAL: 'trash-outline',
  RECYCLABLE: 'refresh-outline',
  HAZARDOUS: 'warning-outline',
  CONSTRUCTION: 'construct-outline',
  DEMOLITION: 'hammer-outline',
  EXCAVATION: 'business-outline',
  ELECTRONIC: 'hardware-chip-outline',
  ORGANIC: 'leaf-outline',
  LIQUID: 'water',
  CHEMICAL: 'flask-outline',
  MEDICAL: 'medkit-outline',
  ASBESTOS: 'alert-circle-outline',
};

export default function EnvironmentalScreen() {
  const backgroundColor = useThemeColor('background');
  const surfaceColor = useThemeColor('surface');
  const textColor = useThemeColor('text');
  const textMutedColor = useThemeColor('textMuted');
  const borderColor = useThemeColor('border');
  const tintColor = useThemeColor('tint');

  const [selectedTab, setSelectedTab] = useState<'monitoring' | 'waste' | 'emissions' | 'permits'>('monitoring');
  const [monitoringStatusFilter, setMonitoringStatusFilter] = useState<MonitoringStatus | 'ALL'>('ALL');

  // Mock project ID - replace with actual context
  const projectId = 'project-1';

  const { summary } = useEnvironmentalSummary(projectId);
  const { monitoring, loading: monitoringLoading } = useEnvironmentalMonitoring({ projectId });
  const { wasteRecords, loading: wasteLoading } = useWasteRecords({ projectId });

  const getMonitoringStatusColor = (status: MonitoringStatus) => {
    switch (status) {
      case 'COMPLIANT': return '#22c55e';
      case 'NON_COMPLIANT': return '#ef4444';
      case 'REQUIRES_ACTION': return '#f59e0b';
      case 'COMPLETED': return '#3b82f6';
      case 'IN_PROGRESS': return '#8b5cf6';
      case 'SCHEDULED': return '#a855f7';
      case 'OVERDUE': return '#dc2626';
      default: return textMutedColor;
    }
  };

  const getResultColor = (result?: 'PASS' | 'FAIL' | 'WARNING') => {
    switch (result) {
      case 'PASS': return '#22c55e';
      case 'FAIL': return '#ef4444';
      case 'WARNING': return '#f59e0b';
      default: return textMutedColor;
    }
  };

  const filteredMonitoring = monitoring.filter(item =>
    monitoringStatusFilter === 'ALL' || item.status === monitoringStatusFilter
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Container>
        {/* Header Stats */}
        <Section>
          <ThemedText variant="h2" style={styles.title}>Environmental</ThemedText>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText variant="caption" style={styles.statLabel}>Compliance Rate</ThemedText>
              <ThemedText variant="h3" style={[styles.statValue, { color: '#22c55e' }]}>
                {summary?.complianceRate?.toFixed(0) || 0}%
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText variant="caption" style={styles.statLabel}>Waste Recycled</ThemedText>
              <ThemedText variant="h3" style={[styles.statValue, { color: '#3b82f6' }]}>
                {summary?.wasteDiversionRate?.toFixed(0) || 0}%
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText variant="caption" style={styles.statLabel}>Emissions (CO₂e)</ThemedText>
              <ThemedText variant="h3" style={styles.statValue}>
                {summary?.totalEmissions?.toFixed(1) || 0}t
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText variant="caption" style={styles.statLabel}>Incidents</ThemedText>
              <ThemedText variant="h3" style={[styles.statValue, { color: summary?.incidents ? '#f59e0b' : '#22c55e' }]}>
                {summary?.incidents || 0}
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
                  { borderColor, backgroundColor: selectedTab === 'monitoring' ? tintColor : surfaceColor }
                ]}
                onPress={() => setSelectedTab('monitoring')}
              >
                <ThemedText
                  variant="body"
                  style={[styles.tabText, { color: selectedTab === 'monitoring' ? '#fff' : textColor }]}
                >
                  Monitoring
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  { borderColor, backgroundColor: selectedTab === 'waste' ? tintColor : surfaceColor }
                ]}
                onPress={() => setSelectedTab('waste')}
              >
                <ThemedText
                  variant="body"
                  style={[styles.tabText, { color: selectedTab === 'waste' ? '#fff' : textColor }]}
                >
                  Waste
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  { borderColor, backgroundColor: selectedTab === 'emissions' ? tintColor : surfaceColor }
                ]}
                onPress={() => setSelectedTab('emissions')}
              >
                <ThemedText
                  variant="body"
                  style={[styles.tabText, { color: selectedTab === 'emissions' ? '#fff' : textColor }]}
                >
                  Emissions
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  { borderColor, backgroundColor: selectedTab === 'permits' ? tintColor : surfaceColor }
                ]}
                onPress={() => setSelectedTab('permits')}
              >
                <ThemedText
                  variant="body"
                  style={[styles.tabText, { color: selectedTab === 'permits' ? '#fff' : textColor }]}
                >
                  Permits
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Section>

        {/* Monitoring Tab */}
        {selectedTab === 'monitoring' && (
          <>
            {/* Status Filters */}
            <Section>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                {(['ALL', 'COMPLIANT', 'NON_COMPLIANT', 'REQUIRES_ACTION', 'COMPLETED'] as ('ALL' | MonitoringStatus)[]).map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterChip,
                      { 
                        backgroundColor: monitoringStatusFilter === status ? tintColor : surfaceColor,
                        borderColor 
                      }
                    ]}
                    onPress={() => setMonitoringStatusFilter(status)}
                  >
                    <ThemedText
                      variant="caption"
                      style={[
                        styles.filterText,
                        { color: monitoringStatusFilter === status ? '#fff' : textColor }
                      ]}
                    >
                      {status.replace('_', ' ')}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Section>

            {/* Monitoring List */}
            <Section>
              {monitoringLoading ? (
                <ThemedText variant="body" style={{ color: textMutedColor }}>Loading monitoring...</ThemedText>
              ) : filteredMonitoring.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
                  <Ionicons name="analytics-outline" size={48} color={textMutedColor} />
                  <ThemedText variant="body" style={{ color: textMutedColor, marginTop: 12 }}>
                    No monitoring records found
                  </ThemedText>
                </View>
              ) : (
                filteredMonitoring.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
                    onPress={() => router.push(`/environmental/${item.id}`)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Ionicons
                          name={MONITORING_TYPE_ICONS[item.monitoringType]}
                          size={20}
                          color={tintColor}
                        />
                        <ThemedText variant="body" style={[styles.itemNumber, { color: textMutedColor }]}>
                          {item.monitoringNumber}
                        </ThemedText>
                      </View>
                      <View style={styles.badges}>
                        {item.result && (
                          <View style={[styles.resultBadge, { backgroundColor: getResultColor(item.result) }]}>
                            <ThemedText variant="caption" style={styles.badgeText}>
                              {item.result}
                            </ThemedText>
                          </View>
                        )}
                        <View style={[styles.statusBadge, { backgroundColor: getMonitoringStatusColor(item.status) }]}>
                          <ThemedText variant="caption" style={styles.badgeText}>
                            {item.status}
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    <View style={[styles.typeBadge, { backgroundColor: tintColor + '20', borderColor: tintColor }]}>
                      <ThemedText variant="caption" style={{ color: tintColor, fontWeight: '600' }}>
                        {item.monitoringType}
                      </ThemedText>
                    </View>

                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <ThemedText variant="caption" style={{ color: textMutedColor }}>Parameter</ThemedText>
                        <ThemedText variant="body">{item.parameter}</ThemedText>
                      </View>
                      <View style={styles.infoItem}>
                        <ThemedText variant="caption" style={{ color: textMutedColor }}>Value</ThemedText>
                        <ThemedText variant="body">
                          {item.measuredValue?.toFixed(2) || 'N/A'} {item.unit}
                        </ThemedText>
                      </View>
                      <View style={styles.infoItem}>
                        <ThemedText variant="caption" style={{ color: textMutedColor }}>Location</ThemedText>
                        <ThemedText variant="body">{item.location}</ThemedText>
                      </View>
                    </View>

                    {item.projectName && (
                      <View style={styles.cardFooter}>
                        <Ionicons name="briefcase-outline" size={14} color={textMutedColor} />
                        <ThemedText variant="caption" style={{ color: textMutedColor, marginLeft: 6 }}>
                          {item.projectName}
                        </ThemedText>
                        <Ionicons name="calendar-outline" size={14} color={textMutedColor} style={{ marginLeft: 12 }} />
                        <ThemedText variant="caption" style={{ color: textMutedColor, marginLeft: 6 }}>
                          {new Date(item.scheduledDate).toLocaleDateString()}
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </Section>
          </>
        )}

        {/* Waste Tab */}
        {selectedTab === 'waste' && (
          <Section>
            {wasteLoading ? (
              <ThemedText variant="body" style={{ color: textMutedColor }}>Loading waste records...</ThemedText>
            ) : wasteRecords.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
                <Ionicons name="trash-outline" size={48} color={textMutedColor} />
                <ThemedText variant="body" style={{ color: textMutedColor, marginTop: 12 }}>
                  No waste records found
                </ThemedText>
              </View>
            ) : (
              wasteRecords.map(waste => (
                <TouchableOpacity
                  key={waste.id}
                  style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
                  onPress={() => router.push(`/environmental/${waste.id}`)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <Ionicons
                        name={WASTE_TYPE_ICONS[waste.wasteType]}
                        size={20}
                        color={tintColor}
                      />
                      <ThemedText variant="body" style={[styles.itemNumber, { color: textMutedColor }]}>
                        {waste.wasteNumber}
                      </ThemedText>
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: tintColor + '20', borderColor: tintColor }]}>
                      <ThemedText variant="caption" style={{ color: tintColor, fontWeight: '600' }}>
                        {waste.wasteType}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText variant="h4" style={styles.cardTitle}>{waste.description}</ThemedText>

                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <ThemedText variant="caption" style={{ color: textMutedColor }}>Quantity</ThemedText>
                      <ThemedText variant="body">{waste.quantity} {waste.unit}</ThemedText>
                    </View>
                    <View style={styles.infoItem}>
                      <ThemedText variant="caption" style={{ color: textMutedColor }}>Status</ThemedText>
                      <ThemedText variant="body">{waste.status}</ThemedText>
                    </View>
                    <View style={styles.infoItem}>
                      <ThemedText variant="caption" style={{ color: textMutedColor }}>Generated</ThemedText>
                      <ThemedText variant="body">
                        {new Date(waste.generatedDate).toLocaleDateString()}
                      </ThemedText>
                    </View>
                  </View>

                  {waste.disposalMethod && (
                    <View style={[styles.infoBox, { backgroundColor, borderColor, marginTop: 12 }]}>
                      <ThemedText variant="caption" style={{ color: textMutedColor }}>
                        Disposal: {waste.disposalMethod}
                      </ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </Section>
        )}

        {/* Emissions Tab */}
        {selectedTab === 'emissions' && (
          <Section>
            <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
              <Ionicons name="cloud-outline" size={48} color={textMutedColor} />
              <ThemedText variant="body" style={{ color: textMutedColor, marginTop: 12 }}>
                Emissions tracking coming soon
              </ThemedText>
            </View>
          </Section>
        )}

        {/* Permits Tab */}
        {selectedTab === 'permits' && (
          <Section>
            <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
              <Ionicons name="document-text-outline" size={48} color={textMutedColor} />
              <ThemedText variant="body" style={{ color: textMutedColor, marginTop: 12 }}>
                Environmental permits coming soon
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
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
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
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardTitle: {
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  infoItem: {
    flex: 1,
  },
  infoBox: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
});
