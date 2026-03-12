/**
 * Safety Incident Detail Screen
 * Comprehensive view of incident with investigation and corrective actions
 */

import { Loader } from '@/components/ui/loader';
import { useIncident } from '@/hooks/useSafety';
import {
    IncidentSeverity,
    IncidentStatus,
    IncidentType
} from '@/types/safety';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { incident, loading, error } = useIncident(id || null);
  const [refreshing, setRefreshing] = useState(false);

  if (loading && !incident) {
    return <Loader />;
  }

  if (error || !incident) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#000000" />
        <Text style={styles.errorText}>Không thể tải thông tin sự cố</Text>
      </View>
    );
  }

  const severityColor = getSeverityColor(incident.severity);

  return (
    <>
      <Stack.Screen
        options={{
          title: incident.incidentNumber,
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                router.push(`/safety/incidents/edit?id=${incident.id}`)
              }
            >
              <Ionicons name="create" size={24} color="#0D9488" style={{ marginRight: 8 }} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        {/* Header Card */}
        <View style={[styles.headerCard, { borderLeftColor: severityColor, borderLeftWidth: 4 }]}>
          <View style={styles.headerRow}>
            <View style={[styles.severityBadge, { backgroundColor: `${severityColor}15` }]}>
              <Ionicons name="alert-circle" size={32} color={severityColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.incidentTitle}>{incident.title}</Text>
              <View style={styles.headerMeta}>
                <View style={[styles.severityTag, { backgroundColor: severityColor }]}>
                  <Text style={styles.severityTagText}>{getSeverityLabel(incident.severity)}</Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: getStatusColor(incident.status) }]}>
                  <Text style={styles.statusTagText}>{getStatusLabel(incident.status)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          <View style={styles.infoTable}>
            <InfoRow icon="calendar" label="Thời gian xảy ra" value={new Date(incident.occurredAt).toLocaleString('vi-VN')} />
            <InfoRow icon="location" label="Vị trí" value={incident.location} />
            {incident.area && <InfoRow icon="map" label="Khu vực" value={incident.area} />}
            <InfoRow icon="apps" label="Loại sự cố" value={getIncidentTypeLabel(incident.type)} />
            <InfoRow icon="person" label="Người phụ trách" value={incident.responsiblePerson} />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả sự cố</Text>
          <Text style={styles.description}>{incident.description}</Text>
        </View>

        {/* Injured Person */}
        {incident.injuredPerson && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Người bị thương</Text>
            <View style={styles.injuredCard}>
              <View style={styles.injuredHeader}>
                <Ionicons name="medical" size={24} color="#000000" />
                <Text style={styles.injuredName}>{incident.injuredPerson.name}</Text>
              </View>
              <View style={styles.injuredInfo}>
                <InfoRow icon="briefcase" label="Vai trò" value={incident.injuredPerson.role} />
                {incident.injuredPerson.company && (
                  <InfoRow icon="business" label="Công ty" value={incident.injuredPerson.company} />
                )}
                {incident.injuredPerson.age && (
                  <InfoRow icon="person" label="Tuổi" value={`${incident.injuredPerson.age}`} />
                )}
                {incident.injuredPerson.experience && (
                  <InfoRow icon="time" label="Kinh nghiệm" value={`${incident.injuredPerson.experience} năm`} />
                )}
              </View>
              
              {incident.bodyPartsAffected && incident.bodyPartsAffected.length > 0 && (
                <View style={styles.bodyParts}>
                  <Text style={styles.bodyPartsLabel}>Bộ phận bị thương:</Text>
                  <View style={styles.bodyPartsTags}>
                    {incident.bodyPartsAffected.map((part, index) => (
                      <View key={index} style={styles.bodyPartTag}>
                        <Text style={styles.bodyPartText}>{getBodyPartLabel(part)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.medicalInfo}>
                {incident.medicalTreatment && (
                  <View style={styles.medicalBadge}>
                    <Ionicons name="medical" size={14} color="#FFF" />
                    <Text style={styles.medicalBadgeText}>Điều trị y tế</Text>
                  </View>
                )}
                {incident.hospitalRequired && (
                  <View style={[styles.medicalBadge, { backgroundColor: '#000000' }]}>
                    <Ionicons name="fitness" size={14} color="#FFF" />
                    <Text style={styles.medicalBadgeText}>Nhập viện</Text>
                  </View>
                )}
                {incident.lostWorkDays && incident.lostWorkDays > 0 && (
                  <View style={[styles.medicalBadge, { backgroundColor: '#0D9488' }]}>
                    <Ionicons name="calendar" size={14} color="#FFF" />
                    <Text style={styles.medicalBadgeText}>{incident.lostWorkDays} ngày nghỉ</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Immediate Action */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hành động ngay lập tức</Text>
          <View style={styles.actionBox}>
            <Text style={styles.actionText}>{incident.immediateAction}</Text>
          </View>
        </View>

        {/* Investigation */}
        {incident.rootCause && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nguyên nhân gốc rễ</Text>
            <View style={styles.investigationBox}>
              <Text style={styles.investigationText}>{incident.rootCause}</Text>
              {incident.investigatedBy && (
                <Text style={styles.investigationMeta}>
                  Điều tra bởi {incident.investigatedBy} -{' '}
                  {incident.investigationDate &&
                    new Date(incident.investigationDate).toLocaleDateString('vi-VN')}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Corrective Actions */}
        {incident.correctiveActions && incident.correctiveActions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hành động khắc phục</Text>
            {incident.correctiveActions.map((action, index) => (
              <View key={index} style={styles.actionItem}>
                <Ionicons name="checkmark-circle" size={20} color="#0D9488" />
                <Text style={styles.actionItemText}>{action}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Preventive Measures */}
        {incident.preventiveMeasures && incident.preventiveMeasures.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Biện pháp phòng ngừa</Text>
            {incident.preventiveMeasures.map((measure, index) => (
              <View key={index} style={styles.actionItem}>
                <Ionicons name="shield-checkmark" size={20} color="#0D9488" />
                <Text style={styles.actionItemText}>{measure}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Witnesses */}
        {incident.witnesses && incident.witnesses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nhân chứng</Text>
            {incident.witnesses.map((witness, index) => (
              <View key={index} style={styles.witnessItem}>
                <Ionicons name="person-circle" size={18} color="#666" />
                <Text style={styles.witnessText}>{witness}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin bổ sung</Text>
          <View style={styles.additionalInfo}>
            {incident.propertyDamage && incident.propertyDamage > 0 && (
              <View style={styles.additionalItem}>
                <Ionicons name="cash" size={18} color="#000000" />
                <Text style={styles.additionalText}>
                  Thiệt hại tài sản: {incident.propertyDamage.toLocaleString('vi-VN')} VNĐ
                </Text>
              </View>
            )}
            {incident.environmentalImpact && (
              <View style={styles.additionalItem}>
                <Ionicons name="leaf" size={18} color="#0D9488" />
                <Text style={styles.additionalText}>Có tác động môi trường</Text>
              </View>
            )}
            {incident.osha300Required && (
              <View style={styles.additionalItem}>
                <Ionicons name="document-text" size={18} color="#0D9488" />
                <Text style={styles.additionalText}>Yêu cầu OSHA 300</Text>
              </View>
            )}
            {incident.regulatoryReported && (
              <View style={styles.additionalItem}>
                <Ionicons name="shield" size={18} color="#0D9488" />
                <Text style={styles.additionalText}>Đã báo cáo cơ quan quản lý</Text>
              </View>
            )}
            {incident.insuranceClaim && (
              <View style={styles.additionalItem}>
                <Ionicons name="shield-checkmark" size={18} color="#999999" />
                <Text style={styles.additionalText}>Yêu cầu bảo hiểm</Text>
              </View>
            )}
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dòng thời gian</Text>
          <View style={styles.timeline}>
            <TimelineItem
              icon="create"
              color="#0D9488"
              title="Báo cáo"
              subtitle={`${incident.reportedBy} - ${new Date(incident.reportedAt).toLocaleString('vi-VN')}`}
            />
            {incident.investigatedBy && incident.investigationDate && (
              <TimelineItem
                icon="search"
                color="#0D9488"
                title="Điều tra"
                subtitle={`${incident.investigatedBy} - ${new Date(incident.investigationDate).toLocaleString('vi-VN')}`}
              />
            )}
            {incident.reviewedBy && incident.reviewedAt && (
              <TimelineItem
                icon="eye"
                color="#999999"
                title="Xem xét"
                subtitle={`${incident.reviewedBy} - ${new Date(incident.reviewedAt).toLocaleString('vi-VN')}`}
              />
            )}
            {incident.closedBy && incident.closedAt && (
              <TimelineItem
                icon="checkmark-circle"
                color="#0D9488"
                title="Đóng"
                subtitle={`${incident.closedBy} - ${new Date(incident.closedAt).toLocaleString('vi-VN')}`}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        <Ionicons name={icon as any} size={16} color="#666" />
        <Text style={styles.infoLabelText}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

interface TimelineItemProps {
  icon: string;
  color: string;
  title: string;
  subtitle: string;
}

function TimelineItem({ icon, color, title, subtitle }: TimelineItemProps) {
  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineDot, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={16} color="#FFF" />
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

// Helper functions
function getSeverityColor(severity: IncidentSeverity): string {
  switch (severity) {
    case IncidentSeverity.FATAL:
      return '#000000';
    case IncidentSeverity.CRITICAL:
      return '#B71C1C';
    case IncidentSeverity.SERIOUS:
      return '#000000';
    case IncidentSeverity.MODERATE:
      return '#0D9488';
    case IncidentSeverity.MINOR:
      return '#0D9488';
    default:
      return '#999999';
  }
}

function getSeverityLabel(severity: IncidentSeverity): string {
  const labels: Record<IncidentSeverity, string> = {
    [IncidentSeverity.FATAL]: 'TỬ VONG',
    [IncidentSeverity.CRITICAL]: 'CỰC KỲ NGHIÊM TRỌNG',
    [IncidentSeverity.SERIOUS]: 'NGHIÊM TRỌNG',
    [IncidentSeverity.MODERATE]: 'TRUNG BÌNH',
    [IncidentSeverity.MINOR]: 'NHẸ',
  };
  return labels[severity] || severity;
}

function getStatusColor(status: IncidentStatus): string {
  switch (status) {
    case IncidentStatus.REPORTED:
      return '#000000';
    case IncidentStatus.INVESTIGATING:
      return '#0D9488';
    case IncidentStatus.UNDER_REVIEW:
      return '#0D9488';
    case IncidentStatus.RESOLVED:
      return '#0D9488';
    case IncidentStatus.CLOSED:
      return '#999999';
    default:
      return '#666';
  }
}

function getStatusLabel(status: IncidentStatus): string {
  const labels: Record<IncidentStatus, string> = {
    [IncidentStatus.REPORTED]: 'ĐÃ BÁO CÁO',
    [IncidentStatus.INVESTIGATING]: 'ĐANG ĐIỀU TRA',
    [IncidentStatus.UNDER_REVIEW]: 'ĐANG XEM XÉT',
    [IncidentStatus.RESOLVED]: 'ĐÃ GIẢI QUYẾT',
    [IncidentStatus.CLOSED]: 'ĐÃ ĐÓNG',
  };
  return labels[status] || status;
}

function getIncidentTypeLabel(type: IncidentType): string {
  const labels: Partial<Record<IncidentType, string>> = {
    [IncidentType.FALL]: 'Rơi/Ngã',
    [IncidentType.STRUCK_BY]: 'Bị va chạm',
    [IncidentType.CAUGHT_IN_BETWEEN]: 'Bị kẹp',
    [IncidentType.ELECTRICAL]: 'Điện giật',
    [IncidentType.EQUIPMENT_FAILURE]: 'Thiết bị hỏng',
    [IncidentType.CHEMICAL_EXPOSURE]: 'Tiếp xúc hóa chất',
    [IncidentType.FIRE]: 'Hỏa hoạn',
    [IncidentType.NEAR_MISS]: 'Suýt xảy ra',
  };
  return labels[type] || type;
}

function getBodyPartLabel(part: string): string {
  const labels: Record<string, string> = {
    HEAD: 'Đầu',
    EYES: 'Mắt',
    FACE: 'Mặt',
    NECK: 'Cổ',
    SHOULDER: 'Vai',
    ARM: 'Cánh tay',
    HAND: 'Tay',
    FINGER: 'Ngón tay',
    CHEST: 'Ngực',
    BACK: 'Lưng',
    LEG: 'Chân',
    FOOT: 'Bàn chân',
    MULTIPLE: 'Nhiều bộ phận',
  };
  return labels[part] || part;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  headerCard: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 16,
  },
  severityBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incidentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  headerMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  severityTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityTagText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoTable: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  infoLabelText: {
    fontSize: 13,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  injuredCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  injuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  injuredName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C62828',
  },
  injuredInfo: {
    gap: 8,
    marginBottom: 12,
  },
  bodyParts: {
    marginBottom: 12,
  },
  bodyPartsLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  bodyPartsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  bodyPartTag: {
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bodyPartText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: 'bold',
  },
  medicalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  medicalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  medicalBadgeText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: 'bold',
  },
  actionBox: {
    backgroundColor: '#F0FDFA',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0D9488',
  },
  actionText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  investigationBox: {
    backgroundColor: '#F0FDFA',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0D9488',
  },
  investigationText: {
    fontSize: 14,
    color: '#004499',
    lineHeight: 20,
    marginBottom: 8,
  },
  investigationMeta: {
    fontSize: 12,
    color: '#0D9488',
  },
  actionItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  actionItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  witnessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  witnessText: {
    fontSize: 14,
    color: '#333',
  },
  additionalInfo: {
    gap: 10,
  },
  additionalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  additionalText: {
    fontSize: 14,
    color: '#333',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  timelineSubtitle: {
    fontSize: 12,
    color: '#666',
  },
});
