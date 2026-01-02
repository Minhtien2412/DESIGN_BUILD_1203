/**
 * Safety Management List Screen
 */

import { ThemedText } from '@/components/themed-text';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useIncidents, useSafetyStats } from '@/hooks/useSafety';
import type { IncidentSeverity, IncidentStatus, IncidentType } from '@/types/safety';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const INCIDENT_TYPE_ICONS: Record<IncidentType, keyof typeof Ionicons.glyphMap> = {
  FALL: 'trending-down',
  STRUCK_BY: 'hand-left-outline',
  CAUGHT_IN_BETWEEN: 'contract-outline',
  ELECTRICAL: 'flash-outline',
  EQUIPMENT_FAILURE: 'construct-outline',
  CHEMICAL_EXPOSURE: 'beaker-outline',
  FIRE: 'flame-outline',
  EXPLOSION: 'nuclear-outline',
  COLLAPSE: 'warning-outline',
  SLIP_TRIP: 'footsteps-outline',
  CUT_LACERATION: 'cut-outline',
  BURN: 'flame',
  STRAIN_SPRAIN: 'fitness-outline',
  NEAR_MISS: 'alert-circle-outline',
  ENVIRONMENTAL: 'leaf-outline',
  OTHER: 'ellipsis-horizontal-circle-outline',
};

export default function SafetyScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const [selectedTab, setSelectedTab] = useState<'incidents' | 'inspections' | 'hazards' | 'permits'>('incidents');
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'ALL'>('ALL');

  // Mock project ID - replace with actual context
  const projectId = 'project-1';

  // Default date range: last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const { stats: summary } = useSafetyStats({ projectId, startDate, endDate });
  const { incidents, loading } = useIncidents({ projectId });

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'FATAL': return '#7f1d1d';
      case 'CRITICAL': return '#dc2626';
      case 'SERIOUS': return '#ea580c';
      case 'MODERATE': return '#f59e0b';
      case 'MINOR': return '#3b82f6';
      default: return textMutedColor;
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'RESOLVED': return '#22c55e';
      case 'INVESTIGATING': return '#f59e0b';
      case 'UNDER_REVIEW': return '#3b82f6';
      case 'REPORTED': return '#6b7280';
      case 'CLOSED': return '#10b981';
      default: return textMutedColor;
    }
  };

  const filteredIncidents = incidents.filter(incident =>
    severityFilter === 'ALL' || incident.severity === severityFilter
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Container>
        {/* Header Stats */}
        <Section>
          <ThemedText type="title" style={styles.title}>Safety Management</ThemedText>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText  style={styles.statLabel}>Total Incidents</ThemedText>
              <ThemedText  style={styles.statValue}>{summary?.incidents?.total || 0}</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText  style={styles.statLabel}>Safe Days</ThemedText>
              <ThemedText  style={[styles.statValue, { color: '#22c55e' }]}>
                {summary?.safety?.daysSinceLastIncident || 0}
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText  style={styles.statLabel}>LTIFR</ThemedText>
              <ThemedText  style={styles.statValue}>
                {summary?.safety?.lostTimeRate?.toFixed(2) || '0.00'}
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText  style={styles.statLabel}>Near Misses</ThemedText>
              <ThemedText  style={[styles.statValue, { color: '#f59e0b' }]}>
                {summary?.incidents?.nearMisses || 0}
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
                  { borderColor, backgroundColor: selectedTab === 'incidents' ? tintColor : surfaceColor }
                ]}
                onPress={() => setSelectedTab('incidents')}
              >
                <ThemedText
                  
                  style={[styles.tabText, { color: selectedTab === 'incidents' ? '#fff' : textColor }]}
                >
                  Incidents
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  { borderColor, backgroundColor: selectedTab === 'inspections' ? tintColor : surfaceColor }
                ]}
                onPress={() => setSelectedTab('inspections')}
              >
                <ThemedText
                  
                  style={[styles.tabText, { color: selectedTab === 'inspections' ? '#fff' : textColor }]}
                >
                  Inspections
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  { borderColor, backgroundColor: selectedTab === 'hazards' ? tintColor : surfaceColor }
                ]}
                onPress={() => setSelectedTab('hazards')}
              >
                <ThemedText
                  
                  style={[styles.tabText, { color: selectedTab === 'hazards' ? '#fff' : textColor }]}
                >
                  Hazards
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
                  
                  style={[styles.tabText, { color: selectedTab === 'permits' ? '#fff' : textColor }]}
                >
                  Permits
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Section>

        {/* Incidents Tab */}
        {selectedTab === 'incidents' && (
          <>
            {/* Severity Filters */}
            <Section>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                {(['ALL', 'FATAL', 'CRITICAL', 'SERIOUS', 'MODERATE', 'MINOR'] as const).map(severity => (
                  <TouchableOpacity
                    key={severity}
                    style={[
                      styles.filterChip,
                      { 
                        backgroundColor: severityFilter === severity ? tintColor : surfaceColor,
                        borderColor 
                      }
                    ]}
                    onPress={() => setSeverityFilter(severity as IncidentSeverity | 'ALL')}
                  >
                    <ThemedText
                      
                      style={[
                        styles.filterText,
                        { color: severityFilter === severity ? '#fff' : textColor }
                      ]}
                    >
                      {severity}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Section>

            {/* Incident List */}
            <Section>
              {loading ? (
                <ThemedText  style={{ color: textMutedColor }}>Loading incidents...</ThemedText>
              ) : filteredIncidents.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
                  <Ionicons name="shield-checkmark-outline" size={48} color={textMutedColor} />
                  <ThemedText  style={{ color: textMutedColor, marginTop: 12 }}>
                    No incidents found
                  </ThemedText>
                </View>
              ) : (
                filteredIncidents.map((incident: any) => (
                  <TouchableOpacity
                    key={incident.id}
                    style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
                    onPress={() => router.push(`/safety/${incident.id}`)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Ionicons
                          name={INCIDENT_TYPE_ICONS[incident.type as IncidentType]}
                          size={20}
                          color={tintColor}
                        />
                        <ThemedText  style={[styles.incidentNumber, { color: textMutedColor }]}>
                          {incident.incidentNumber}
                        </ThemedText>
                      </View>
                      <View style={styles.badges}>
                        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(incident.severity) }]}>
                          <ThemedText  style={styles.badgeText}>
                            {incident.severity}
                          </ThemedText>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
                          <ThemedText  style={styles.badgeText}>
                            {incident.status}
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    <ThemedText  style={styles.cardTitle}>{incident.title}</ThemedText>
                    
                    {incident.description && (
                      <ThemedText 
                         
                        style={[styles.description, { color: textMutedColor }]}
                        numberOfLines={2}
                      >
                        {incident.description}
                      </ThemedText>
                    )}

                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <ThemedText  style={{ color: textMutedColor }}>Type</ThemedText>
                        <ThemedText >{incident.type}</ThemedText>
                      </View>
                      <View style={styles.infoItem}>
                        <ThemedText  style={{ color: textMutedColor }}>Date</ThemedText>
                        <ThemedText >
                          {new Date(incident.incidentDate).toLocaleDateString()}
                        </ThemedText>
                      </View>
                      <View style={styles.infoItem}>
                        <ThemedText  style={{ color: textMutedColor }}>Location</ThemedText>
                        <ThemedText >{incident.location}</ThemedText>
                      </View>
                    </View>

                    {incident.injuryOccurred && (
                      <View style={[styles.alertBanner, { backgroundColor: '#fee2e2', borderColor: '#dc2626' }]}>
                        <Ionicons name="medical" size={14} color="#dc2626" />
                        <ThemedText  style={{ color: '#dc2626', marginLeft: 6, fontWeight: '600' }}>
                          Injury Reported
                        </ThemedText>
                      </View>
                    )}

                    {incident.projectName && (
                      <View style={styles.cardFooter}>
                        <Ionicons name="briefcase-outline" size={14} color={textMutedColor} />
                        <ThemedText  style={{ color: textMutedColor, marginLeft: 6 }}>
                          {incident.projectName}
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </Section>
          </>
        )}

        {/* Inspections Tab */}
        {selectedTab === 'inspections' && (
          <Section>
            <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
              <Ionicons name="clipboard-outline" size={48} color={textMutedColor} />
              <ThemedText  style={{ color: textMutedColor, marginTop: 12 }}>
                Safety inspections coming soon
              </ThemedText>
            </View>
          </Section>
        )}

        {/* Hazards Tab */}
        {selectedTab === 'hazards' && (
          <Section>
            <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
              <Ionicons name="warning-outline" size={48} color={textMutedColor} />
              <ThemedText  style={{ color: textMutedColor, marginTop: 12 }}>
                Hazard management coming soon
              </ThemedText>
            </View>
          </Section>
        )}

        {/* Permits Tab */}
        {selectedTab === 'permits' && (
          <Section>
            <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
              <Ionicons name="document-text-outline" size={48} color={textMutedColor} />
              <ThemedText  style={{ color: textMutedColor, marginTop: 12 }}>
                Work permits coming soon
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
  incidentNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  severityBadge: {
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
  cardTitle: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 20,
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  infoItem: {
    flex: 1,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 12,
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

