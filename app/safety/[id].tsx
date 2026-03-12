/**
 * Safety Incident Detail Screen
 */

import { ThemedText } from '@/components/themed-text';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useIncident } from '@/hooks/useSafety';
import type { IncidentSeverity, IncidentStatus } from '@/types/safety';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SafetyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedTab, setSelectedTab] = useState<'details' | 'investigation' | 'actions'>('details');

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const { incident, loading } = useIncident(id as string);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Container>
          <ThemedText style={{ color: textMutedColor }}>Loading...</ThemedText>
        </Container>
      </View>
    );
  }

  if (!incident) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Container>
          <ThemedText style={{ color: textMutedColor }}>
            Incident not found
          </ThemedText>
        </Container>
      </View>
    );
  }

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'FATAL': return '#7f1d1d';
      case 'CRITICAL': return '#000000';
      case 'SERIOUS': return '#ea580c';
      case 'MODERATE': return '#0D9488';
      case 'MINOR': return '#0D9488';
      default: return textMutedColor;
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'RESOLVED': return '#0D9488';
      case 'INVESTIGATING': return '#0D9488';
      case 'UNDER_REVIEW': return '#0D9488';
      case 'REPORTED': return '#6b7280';
      case 'CLOSED': return '#0D9488';
      default: return textMutedColor;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Container>
        {/* Header */}
        <Section>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <ThemedText style={[styles.incidentNumber, { color: textMutedColor }]}>
                {incident.incidentNumber}
              </ThemedText>
              <View style={styles.badges}>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(incident.severity) }]}>
                  <ThemedText style={styles.badgeText}>
                    {incident.severity}
                  </ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
                  <ThemedText style={styles.badgeText}>
                    {incident.status}
                  </ThemedText>
                </View>
              </View>
            </View>
            <ThemedText type="title" style={styles.title}>{incident.title}</ThemedText>
            {incident.description && (
              <ThemedText style={[styles.description, { color: textMutedColor }]}>
                {incident.description}
              </ThemedText>
            )}
          </View>

          {/* Critical Alerts */}
          {incident.injuredPerson && (
            <View style={[styles.alertBanner, { backgroundColor: '#fee2e2', borderColor: '#000000' }]}>
              <Ionicons name="medical" size={16} color="#000000" />
              <ThemedText style={{ color: '#000000', marginLeft: 8, fontWeight: '600' }}>
                Injury Reported - {incident.injuredPerson.name} ({incident.injuredPerson.role})
              </ThemedText>
            </View>
          )}
          {incident.regulatoryReported && (
            <View style={[styles.alertBanner, { backgroundColor: '#fef3c7', borderColor: '#0D9488', marginTop: 8 }]}>
              <Ionicons name="alert-circle" size={16} color="#0D9488" />
              <ThemedText style={{ color: '#0D9488', marginLeft: 8, fontWeight: '600' }}>
                Reportable to Authority
              </ThemedText>
            </View>
          )}
        </Section>

        {/* Tabs */}
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
                style={[styles.tabText, { color: selectedTab === 'details' ? '#fff' : textColor }]}
              >
                Details
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { borderColor, backgroundColor: selectedTab === 'investigation' ? tintColor : surfaceColor }
              ]}
              onPress={() => setSelectedTab('investigation')}
            >
              <ThemedText
                style={[styles.tabText, { color: selectedTab === 'investigation' ? '#fff' : textColor }]}
              >
                Investigation
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { borderColor, backgroundColor: selectedTab === 'actions' ? tintColor : surfaceColor }
              ]}
              onPress={() => setSelectedTab('actions')}
            >
              <ThemedText
                style={[styles.tabText, { color: selectedTab === 'actions' ? '#fff' : textColor }]}
              >
                Actions
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Details Tab */}
        {selectedTab === 'details' && (
          <>
            {/* Basic Information */}
            <Section title="Incident Information">
              <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <ThemedText style={{ color: textMutedColor }}>Type</ThemedText>
                    <ThemedText>{incident.type}</ThemedText>
                  </View>
                  <View style={styles.infoItem}>
                    <ThemedText style={{ color: textMutedColor }}>Date & Time</ThemedText>
                    <ThemedText>
                      {new Date(incident.occurredAt).toLocaleDateString()}
                    </ThemedText>
                    <ThemedText style={{ color: textMutedColor }}>
                      {new Date(incident.occurredAt).toLocaleTimeString()}
                    </ThemedText>
                  </View>
                  <View style={styles.infoItem}>
                    <ThemedText style={{ color: textMutedColor }}>Location</ThemedText>
                    <ThemedText>{incident.location}</ThemedText>
                    {incident.area && (
                      <ThemedText style={{ color: textMutedColor }}>
                        Area: {incident.area}
                      </ThemedText>
                    )}
                  </View>
                  <View style={styles.infoItem}>
                    <ThemedText style={{ color: textMutedColor }}>Reported</ThemedText>
                    <ThemedText>
                      {new Date(incident.reportedAt).toLocaleDateString()}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </Section>

            {/* Injury Details */}
            {incident.injuredPerson && (
              <Section title="Injury Details">
                <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                  <View style={styles.injuryHeader}>
                    <Ionicons name="medical" size={24} color="#000000" />
                    <View style={styles.injuryInfo}>
                      <ThemedText type="subtitle">{incident.injuredPerson.name}</ThemedText>
                      <ThemedText style={{ color: textMutedColor }}>
                        Role: {incident.injuredPerson.role}
                      </ThemedText>
                      {incident.injuredPerson.company && (
                        <ThemedText style={{ color: textMutedColor }}>
                          Company: {incident.injuredPerson.company}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                  {incident.bodyPartsAffected && incident.bodyPartsAffected.length > 0 && (
                    <View style={styles.treatmentBox}>
                      <ThemedText style={{ color: textMutedColor, fontWeight: '600', marginBottom: 4 }}>
                        Body Parts Affected:
                      </ThemedText>
                      <ThemedText>{incident.bodyPartsAffected.join(', ')}</ThemedText>
                    </View>
                  )}
                  {incident.medicalTreatment && (
                    <View style={[styles.alertBox, { backgroundColor: '#fee2e2', borderColor: '#000000', marginTop: 12 }]}>
                      <Ionicons name="warning" size={16} color="#000000" />
                      <ThemedText style={{ color: '#000000', marginLeft: 6 }}>
                        Medical treatment required
                      </ThemedText>
                    </View>
                  )}
                </View>
              </Section>
            )}

            {/* People Involved */}
            {incident.witnesses && incident.witnesses.length > 0 && (
              <Section title="Witnesses">
                <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                  {incident.witnesses.map((witness, index) => (
                    <View key={index} style={[styles.personCard, index > 0 && { marginTop: 12 }]}>
                      <Ionicons name="person-circle-outline" size={24} color={tintColor} />
                      <View style={styles.personInfo}>
                        <ThemedText style={{ fontWeight: '600' }}>
                          {witness}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              </Section>
            )}

            {/* Reported By */}
            <Section title="Reported By">
              <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                <View style={styles.personCard}>
                  <Ionicons name="person-circle-outline" size={24} color={tintColor} />
                  <View style={styles.personInfo}>
                    <ThemedText style={{ fontWeight: '600' }}>
                      {incident.reportedBy || 'Unknown'}
                    </ThemedText>
                    <ThemedText style={{ color: textMutedColor }}>
                      {new Date(incident.reportedAt).toLocaleDateString()}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </Section>

          </>
        )}

        {/* Investigation Tab */}
        {selectedTab === 'investigation' && (
          <>
            {incident.status === 'RESOLVED' || incident.status === 'CLOSED' ? (
              <>
                <Section title="Investigation Findings">
                  <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                    {incident.rootCause && (
                      <>
                        <ThemedText style={{ color: textMutedColor, fontWeight: '600', marginBottom: 8 }}>
                          Root Cause:
                        </ThemedText>
                        <ThemedText style={{ lineHeight: 22 }}>
                          {incident.rootCause}
                        </ThemedText>
                      </>
                    )}
                    {incident.immediateAction && (
                      <>
                        <ThemedText style={{ color: textMutedColor, fontWeight: '600', marginBottom: 8, marginTop: 16 }}>
                          Immediate Action:
                        </ThemedText>
                        <ThemedText style={{ lineHeight: 22 }}>
                          {incident.immediateAction}
                        </ThemedText>
                      </>
                    )}
                  </View>
                </Section>

                {incident.investigatedBy && (
                  <Section title="Investigated By">
                    <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                      <View style={styles.personCard}>
                        <Ionicons name="person-circle-outline" size={24} color={tintColor} />
                        <View style={styles.personInfo}>
                          <ThemedText style={{ fontWeight: '600' }}>
                            {incident.investigatedBy}
                          </ThemedText>
                          {incident.investigationDate && (
                            <ThemedText style={{ color: textMutedColor }}>
                              Completed: {new Date(incident.investigationDate).toLocaleDateString()}
                            </ThemedText>
                          )}
                        </View>
                      </View>
                    </View>
                  </Section>
                )}
              </>
            ) : (
              <Section>
                <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
                  <Ionicons 
                    name={incident.status === 'REPORTED' ? "time-outline" : "search-outline"} 
                    size={48} 
                    color={textMutedColor} 
                  />
                  <ThemedText style={{ color: textMutedColor, marginTop: 12 }}>
                    {incident.status === 'REPORTED' 
                      ? 'Investigation pending'
                      : 'Investigation in progress'}
                  </ThemedText>
                </View>
              </Section>
            )}
          </>
        )}

        {/* Actions Tab */}
        {selectedTab === 'actions' && (
          <>
            {incident.correctiveActions && incident.correctiveActions.length > 0 ? (
              <Section title="Corrective Actions">
                {incident.correctiveActions.map((action, index) => (
                  <View key={index} style={[styles.actionCard, { backgroundColor: surfaceColor, borderColor }]}>
                    <View style={styles.actionHeader}>
                      <View style={[styles.actionStatusBadge, { backgroundColor: '#0D948820' }]}>  
                        <ThemedText style={{ color: '#0D9488', fontWeight: '600' }}>
                          Action #{index + 1}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText style={{ lineHeight: 20, marginBottom: 12 }}>
                      {action}
                    </ThemedText>
                  </View>
                ))}
              </Section>
            ) : (
              <Section>
                <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
                  <Ionicons name="clipboard-outline" size={48} color={textMutedColor} />
                  <ThemedText style={{ color: textMutedColor, marginTop: 12 }}>
                    No corrective actions recorded
                  </ThemedText>
                </View>
              </Section>
            )}

            {/* Preventive Measures */}
            {incident.preventiveMeasures && incident.preventiveMeasures.length > 0 && (
              <Section title="Preventive Measures">
                {incident.preventiveMeasures.map((measure, index) => (
                  <View key={index} style={[styles.actionCard, { backgroundColor: surfaceColor, borderColor }]}>
                    <View style={styles.actionHeader}>
                      <View style={[styles.actionStatusBadge, { backgroundColor: '#0D948820' }]}>  
                        <ThemedText style={{ color: '#0D9488', fontWeight: '600' }}>
                          Measure #{index + 1}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText style={{ lineHeight: 20 }}>
                      {measure}
                    </ThemedText>
                  </View>
                ))}
              </Section>
            )}
          </>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 22,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    gap: 4,
  },
  injuryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  injuryInfo: {
    flex: 1,
    gap: 4,
  },
  treatmentBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  personInfo: {
    flex: 1,
    gap: 2,
  },
  actionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionHeader: {
    marginBottom: 8,
  },
  actionStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionFooter: {
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
