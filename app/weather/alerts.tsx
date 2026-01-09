/**
 * Weather Alerts Screen
 * Extreme weather notifications and warnings for construction projects
 */

import { Loader } from '@/components/ui/loader';
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
    FlatList,
    RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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
      <Stack.Screen
        options={{
          title: 'Cảnh báo thời tiết',
        }}
      />

      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activeAlerts.length}</Text>
          <Text style={styles.statLabel}>Đang hoạt động</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.statValueWarning]}>
            {unacknowledgedAlerts.length}
          </Text>
          <Text style={styles.statLabel}>Chưa xác nhận</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{alerts.length}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
      </View>

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

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertCard
            alert={item}
            onAcknowledge={() => handleAcknowledge(item)}
            onDismiss={() => handleDismiss(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#0066CC" />
            <Text style={styles.emptyText}>Không có cảnh báo nào</Text>
            <Text style={styles.emptyHint}>Hệ thống sẽ thông báo khi có cảnh báo mới</Text>
          </View>
        }
      />
    </>
  );
}

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
            <Ionicons name={typeIcon} size={20} color={severityColor} />
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
          <Ionicons name="information-circle" size={16} color="#0066CC" />
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

      {/* Acknowledged Info */}
      {alert.acknowledged && (
        <View style={styles.acknowledgedBox}>
          <Ionicons name="checkmark-circle" size={16} color="#0066CC" />
          <Text style={styles.acknowledgedText}>
            Đã xác nhận bởi {alert.acknowledgedBy} -{' '}
            {alert.acknowledgedAt
              ? new Date(alert.acknowledgedAt).toLocaleString('vi-VN')
              : ''}
          </Text>
        </View>
      )}

      {/* Actions */}
      {alert.isActive && (
        <View style={styles.actions}>
          {!alert.acknowledged && (
            <TouchableOpacity style={styles.acknowledgeButton} onPress={onAcknowledge}>
              <Ionicons name="checkmark" size={18} color="#FFF" />
              <Text style={styles.acknowledgeText}>Xác nhận</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Ionicons name="close" size={18} color="#000000" />
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
      return '#000000';
    case WeatherAlertSeverity.MODERATE:
      return '#0066CC';
    case WeatherAlertSeverity.MINOR:
      return '#0066CC';
    case WeatherAlertSeverity.INFO:
      return '#0066CC';
    default:
      return '#999999';
  }
}

function getSeverityLabel(severity: WeatherAlertSeverity): string {
  const labels: Record<WeatherAlertSeverity, string> = {
    [WeatherAlertSeverity.EXTREME]: 'CỰC KỲ NGUY HIỂM',
    [WeatherAlertSeverity.SEVERE]: 'NGHIÊM TRỌNG',
    [WeatherAlertSeverity.MODERATE]: 'VỪA PHẢI',
    [WeatherAlertSeverity.MINOR]: 'NHỎ',
    [WeatherAlertSeverity.INFO]: 'THÔNG TIN',
  };
  return labels[severity] || 'KHÔNG XÁC ĐỊNH';
}

function getAlertTypeIcon(type: WeatherAlertType): any {
  const iconMap: Record<WeatherAlertType, string> = {
    [WeatherAlertType.HEAVY_RAIN]: 'rainy',
    [WeatherAlertType.THUNDERSTORM]: 'thunderstorm',
    [WeatherAlertType.HIGH_WIND]: 'leaf',
    [WeatherAlertType.EXTREME_HEAT]: 'sunny',
    [WeatherAlertType.EXTREME_COLD]: 'snow',
    [WeatherAlertType.FLOOD]: 'water',
    [WeatherAlertType.TYPHOON]: 'thunderstorm',
    [WeatherAlertType.STORM_SURGE]: 'water',
    [WeatherAlertType.LIGHTNING]: 'flash',
    [WeatherAlertType.HAIL]: 'snow',
    [WeatherAlertType.TORNADO]: 'thunderstorm',
    [WeatherAlertType.DENSE_FOG]: 'cloudy',
    [WeatherAlertType.AIR_QUALITY]: 'alert-circle',
  };
  return iconMap[type] || 'warning';
}

const styles = StyleSheet.create({
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statValueWarning: {
    color: '#000000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: '#0066CC',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
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
    backgroundColor: '#E8F4FF',
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
    backgroundColor: '#0066CC',
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
    borderColor: '#000000',
  },
  dismissText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
