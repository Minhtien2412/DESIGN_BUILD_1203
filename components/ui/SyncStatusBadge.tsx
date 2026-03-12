/**
 * Component hiển thị trạng thái đồng bộ với Perfex CRM
 * 
 * @description Hiển thị badge/status cho biết tài khoản có được liên kết với CRM không
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import { useDataSync } from '../../hooks/useDataSync';

interface SyncStatusBadgeProps {
  /** Hiển thị dạng compact (chỉ icon) */
  compact?: boolean;
  /** Cho phép tap để refresh */
  onRefresh?: () => void;
  /** Style tùy chỉnh */
  style?: object;
}

/**
 * Badge hiển thị trạng thái đồng bộ
 * 
 * @example
 * ```tsx
 * // Compact mode - chỉ hiện icon
 * <SyncStatusBadge compact />
 * 
 * // Full mode - hiện text
 * <SyncStatusBadge onRefresh={() => refetch()} />
 * ```
 */
export function SyncStatusBadge({ compact = false, onRefresh, style }: SyncStatusBadgeProps) {
  const { isLinked, loading, checkSyncStatus, fetchCRMData } = useDataSync();
  
  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const successColor = '#22c55e';
  const warningColor = '#f59e0b';

  useEffect(() => {
    checkSyncStatus();
  }, [checkSyncStatus]);

  const handlePress = async () => {
    if (onRefresh) {
      onRefresh();
    } else if (isLinked) {
      await fetchCRMData(true);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" color={primaryColor} />
        {!compact && <Text style={[styles.text, { color: textColor }]}>Đang đồng bộ...</Text>}
      </View>
    );
  }

  const statusColor = isLinked ? successColor : warningColor;
  const statusIcon = isLinked ? 'cloud-done' : 'cloud-offline';
  const statusText = isLinked ? 'Đã liên kết CRM' : 'Chưa liên kết CRM';

  if (compact) {
    return (
      <TouchableOpacity 
        style={[styles.compactContainer, { backgroundColor: statusColor + '20' }, style]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons name={statusIcon} size={16} color={statusColor} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: statusColor + '15' }, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name={statusIcon} size={18} color={statusColor} />
      <Text style={[styles.text, { color: statusColor }]}>{statusText}</Text>
      {isLinked && (
        <Ionicons name="refresh-outline" size={14} color={statusColor} style={styles.refreshIcon} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  compactContainer: {
    padding: 8,
    borderRadius: 20,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  refreshIcon: {
    marginLeft: 2,
  },
});

export default SyncStatusBadge;
