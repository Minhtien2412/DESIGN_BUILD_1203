import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SeverityBadge, { DefectSeverity } from './SeverityBadge';
import StatusBadge, { DefectStatus } from './StatusBadge';

interface DefectCardProps {
  id: string;
  projectId: string;
  title: string;
  description: string;
  location: string;
  severity: DefectSeverity;
  status: DefectStatus;
  photosCount?: number;
  reporterName?: string;
  createdAt: Date;
  onPress?: () => void;
}

export default function DefectCard({
  id,
  projectId,
  title,
  description,
  location,
  severity,
  status,
  photosCount = 0,
  reporterName,
  createdAt,
  onPress,
}: DefectCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/projects/${projectId}/qc-qa/defects/${id}` as any);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.header}>
        <SeverityBadge severity={severity} size="small" />
        <StatusBadge status={status} size="small" />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="#666" />
          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        </View>

        {photosCount > 0 && (
          <View style={styles.photosRow}>
            <Ionicons name="images" size={14} color="#666" />
            <Text style={styles.photosCount}>{photosCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.metaRow}>
        {reporterName && (
          <View style={styles.reporterRow}>
            <Ionicons name="person" size={14} color="#999" />
            <Text style={styles.metaText}>{reporterName}</Text>
          </View>
        )}
        <View style={styles.dateRow}>
          <Ionicons name="calendar" size={14} color="#999" />
          <Text style={styles.metaText}>{formatDate(createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  location: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photosCount: {
    fontSize: 13,
    color: '#666',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
});
