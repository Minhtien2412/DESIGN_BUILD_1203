import { useThemeColor } from '@/hooks/use-theme-color';
import { ParticipantStatus } from '@/types/meeting';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface StatusBadgeProps {
  status: ParticipantStatus;
  compact?: boolean;
}

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');
  const mutedColor = useThemeColor('textMuted');

  const statusConfig = {
    'not-started': {
      label: 'Chưa bắt đầu',
      icon: 'time-outline' as const,
      color: mutedColor
    },
    'on-the-way': {
      label: 'Đang di chuyển',
      icon: 'navigate-outline' as const,
      color: warningColor
    },
    'arrived': {
      label: 'Đã tới',
      icon: 'checkmark-circle' as const,
      color: successColor
    },
    'cancelled': {
      label: 'Đã hủy',
      icon: 'close-circle' as const,
      color: errorColor
    }
  };

  const config = statusConfig[status];

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: config.color + '20' }]}>
        <Ionicons name={config.icon} size={14} color={config.color} />
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
      <Ionicons name={config.icon} size={16} color={config.color} />
      <Text style={[styles.badgeText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600'
  },
  compactBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
