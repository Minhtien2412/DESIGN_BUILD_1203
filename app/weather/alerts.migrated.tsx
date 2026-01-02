/**
 * Weather Alerts Screen - Migrated to Universal Components
 * Using ModuleLayout + UniversalList pattern
 */

import { ModuleLayout } from '@/components/layouts/ModuleLayout';
import { Loader } from '@/components/ui/loader';
import { UniversalList } from '@/components/universal/UniversalList';
import { useWeatherAlerts } from '@/hooks/useWeather';
import {
    WeatherAlertSeverity,
    WeatherAlertType,
    type WeatherAlert,
} from '@/types/weather';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function WeatherAlertsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [filter, setFilter] = useState<'all' | 'active' | 'unacknowledged'>('active');
  
  const { alerts, loading, error, acknowledge, dismiss, refetch } = useWeatherAlerts({
    projectId: projectId || '',
    activeOnly: filter === 'active',
    unacknowledgedOnly: filter === 'unacknowledged',
  });

  const handleAcknowledge = async (alert: WeatherAlert) => {
    Alert.alert(
      'Xác nhận cảnh báo',
      `Bạn đã đọc và hiểu cảnh báo "${alert.headline}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await acknowledge(alert.id, 'Current User', 'Đã đọc');
              Alert.alert('Thành công', 'Đã xác nhận cảnh báo');
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xác nhận cảnh báo');
            }
          },
        },
      ]
    );
  };

  const handleDismiss = async (alert: WeatherAlert) => {
    Alert.alert('Bỏ qua cảnh báo', 'Bạn có chắc muốn bỏ qua cảnh báo này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Bỏ qua',
        style: 'destructive',
        onPress: async () => {
          try {
            await dismiss(alert.id);
            Alert.alert('Thành công', 'Đã bỏ qua cảnh báo');
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể bỏ qua cảnh báo');
          }
        },
      },
    ]);
  };

  if (loading && alerts.length === 0) {
    return <Loader />;
  }

  const activeAlerts = alerts.filter((a) => a.isActive);
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged && a.isActive);

  return (
    <>
      <Stack.Screen options={{ title: 'Cảnh báo thời tiết', headerShown: false }} />

      <ModuleLayout
        title="Cảnh báo thời tiết"
        subtitle={`${activeAlerts.length} đang hoạt động • ${unacknowledgedAlerts.length} chưa xác nhận • ${alerts.length} tổng`}
        showBackButton
        scrollable={false}
        padding={false}
      >
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
            onPress={() => setFilter('active')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'active' && styles.filterTabTextActive,
              ]}
            >
              Đang hoạt động
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'unacknowledged' && styles.filterTabActive]}
            onPress={() => setFilter('unacknowledged')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'unacknowledged' && styles.filterTabTextActive,
              ]}
            >
              Chưa xác nhận
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
        </View>

        {/* Universal List with custom alert cards */}
        <UniversalList<WeatherAlert>
          config={{
            data: alerts,
            keyExtractor: (item) => item.id,
            renderItem: (item) => (
              <AlertCard
                alert={item}
                onAcknowledge={() => handleAcknowledge(item)}
                onDismiss={() => handleDismiss(item)}
              />
            ),
            onRefresh: refetch,
            emptyIcon: 'checkmark-circle',
            emptyMessage: 'Không có cảnh báo nào',
          }}
        />
      </ModuleLayout>
    </>
  );
}

// Custom AlertCard component (complex layout with actions)
interface AlertCardProps {
  alert: WeatherAlert;
  onAcknowledge: () => void;
  onDismiss: () => void;
}

function AlertCard({ alert, onAcknowledge, onDismiss }: AlertCardProps) {
  const severityColor = getSeverityColor(alert.severity);
  const severityBg = `${severityColor}15`;
  const typeIcon = getAlertTypeIcon(alert.type);

  return (
    <View style={[styles.alertCard, { borderLeftColor: severityColor, borderLeftWidth: 4 }]}>
      {/* Header */}
      <View style={styles.alertHeader}>
        <View style={styles.alertHeaderLeft}>
          <View style={[styles.severityBadge, { backgroundColor: severityBg }]}>
            <Ionicons name={typeIcon as any} size={20} color={severityColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertHeadline} numberOfLines={2}>
              {alert.headline}
            </Text>
            <View style={styles.alertMeta}>
              <View style={[styles.severityTag, { backgroundColor: severityBg }]}>
                <Text style={[styles.severityText, { color: severityColor }]}>
                  {getSeverityLabel(alert.severity)}
                </Text>
              </View>
              <Text style={styles.alertSource}>• {alert.source}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.alertDescription}>{alert.description}</Text>

      {/* Instruction */}
      {alert.instruction && (
        <View style={styles.instructionBox}>
          <Ionicons name="information-circle" size={16} color="#2196F3" />
          <Text style={styles.instructionText}>{alert.instruction}</Text>
        </View>
      )}

      {/* Time Info */}
      <View style={styles.timeInfo}>
        <View style={styles.timeItem}>
          <Ionicons name="time" size={14} color="#666" />
          <Text style={styles.timeText}>
            Bắt đầu: {new Date(alert.startTime).toLocaleString('vi-VN')}
          </Text>
        </View>
        <View style={styles.timeItem}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.timeText}>
            Kết thúc: {new Date(alert.endTime).toLocaleString('vi-VN')}
          </Text>
        </View>
      </View>

      {/* Affected Areas */}
      {alert.affectedAreas && alert.affectedAreas.length > 0 && (
        <View style={styles.areasContainer}>
          <Ionicons name="location" size={14} color="#666" />
          <Text style={styles.areasText}>Khu vực: {alert.affectedAreas.join(', ')}</Text>
        </View>
      )}

      {/* Acknowledged Status */}
      {alert.acknowledged && alert.acknowledgedBy && (
        <View style={styles.acknowledgedBox}>
          <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
          <Text style={styles.acknowledgedText}>
            Đã xác nhận bởi {alert.acknowledgedBy} • Đã đọc
          </Text>
        </View>
      )}

      {/* Actions */}
      {alert.isActive && !alert.acknowledged && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.acknowledgeButton} onPress={onAcknowledge}>
            <Ionicons name="checkmark" size={16} color="#FFF" />
            <Text style={styles.acknowledgeText}>Xác nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Ionicons name="close" size={16} color="#F44336" />
            <Text style={styles.dismissText}>Bỏ qua</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Helper functions
function getSeverityColor(severity: WeatherAlertSeverity): string {
  switch (severity) {
    case WeatherAlertSeverity.EXTREME:
      return '#B71C1C';
    case WeatherAlertSeverity.SEVERE:
      return '#F44336';
    case WeatherAlertSeverity.MODERATE:
      return '#FF9800';
    case WeatherAlertSeverity.MINOR:
      return '#FDD835';
    default:
      return '#9E9E9E';
  }
}

function getSeverityLabel(severity: WeatherAlertSeverity): string {
  switch (severity) {
    case WeatherAlertSeverity.EXTREME:
      return 'CỰC ĐOAN';
    case WeatherAlertSeverity.SEVERE:
      return 'NGHIÊM TRỌNG';
    case WeatherAlertSeverity.MODERATE:
      return 'TRUNG BÌNH';
    case WeatherAlertSeverity.MINOR:
      return 'NHẸ';
    default:
      return severity;
  }
}

function getAlertTypeIcon(type: WeatherAlertType): string {
  switch (type) {
    case WeatherAlertType.THUNDERSTORM:
      return 'thunderstorm';
    case WeatherAlertType.TYPHOON:
      return 'cloud';
    case WeatherAlertType.FLOOD:
      return 'water';
    case WeatherAlertType.HEAVY_RAIN:
      return 'rainy';
    case WeatherAlertType.EXTREME_HEAT:
      return 'sunny';
    case WeatherAlertType.EXTREME_COLD:
      return 'snow';
    case WeatherAlertType.HIGH_WIND:
      return 'leaf';
    case WeatherAlertType.LIGHTNING:
      return 'flash';
    default:
      return 'alert-circle';
  }
}

const styles = StyleSheet.create({
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#FF9800',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  // Custom alert card styles
  alertCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alertHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  severityBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertHeadline: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  alertSource: {
    fontSize: 12,
    color: '#999',
  },
  alertDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  instructionBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  timeInfo: {
    gap: 6,
    marginBottom: 12,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  areasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  areasText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  acknowledgedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 6,
    gap: 8,
    marginBottom: 12,
  },
  acknowledgedText: {
    fontSize: 12,
    color: '#2E7D32',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  acknowledgeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  acknowledgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dismissButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  dismissText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
