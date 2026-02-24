import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export type StatusType = 
  | 'pending' 
  | 'active' 
  | 'completed' 
  | 'cancelled' 
  | 'approved' 
  | 'rejected'
  | 'in-progress'
  | 'on-hold';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const STATUS_CONFIG: Record<StatusType, {
  color: string;
  bgColor: string;
  icon: string;
  defaultLabel: string;
}> = {
  pending: {
    color: '#0D9488',
    bgColor: '#FEF3C7',
    icon: 'time-outline',
    defaultLabel: 'Chờ xử lý',
  },
  active: {
    color: '#0D9488',
    bgColor: '#F0FDFA',
    icon: 'play-circle-outline',
    defaultLabel: 'Đang thực hiện',
  },
  'in-progress': {
    color: '#0D9488',
    bgColor: '#F0FDFA',
    icon: 'sync-outline',
    defaultLabel: 'Đang tiến hành',
  },
  completed: {
    color: '#0D9488',
    bgColor: '#D1FAE5',
    icon: 'checkmark-circle-outline',
    defaultLabel: 'Hoàn thành',
  },
  cancelled: {
    color: '#6B7280',
    bgColor: '#F3F4F6',
    icon: 'close-circle-outline',
    defaultLabel: 'Đã hủy',
  },
  approved: {
    color: '#0D9488',
    bgColor: '#D1FAE5',
    icon: 'checkmark-done-outline',
    defaultLabel: 'Đã duyệt',
  },
  rejected: {
    color: '#000000',
    bgColor: '#FEE2E2',
    icon: 'close-outline',
    defaultLabel: 'Từ chối',
  },
  'on-hold': {
    color: '#666666',
    bgColor: '#EDE9FE',
    icon: 'pause-circle-outline',
    defaultLabel: 'Tạm dừng',
  },
};

export default function StatusBadge({
  status,
  label,
  showIcon = true,
  size = 'medium',
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const displayLabel = label || config.defaultLabel;

  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      text: styles.textSmall,
      icon: 12,
    },
    medium: {
      container: styles.containerMedium,
      text: styles.textMedium,
      icon: 16,
    },
    large: {
      container: styles.containerLarge,
      text: styles.textLarge,
      icon: 20,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        currentSize.container,
        { backgroundColor: config.bgColor },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={config.icon as any}
          size={currentSize.icon}
          color={config.color}
          style={styles.icon}
        />
      )}
      <Text style={[currentSize.text, { color: config.color }]}>
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 12,
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  containerMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  icon: {
    marginRight: 4,
  },
  textSmall: {
    fontSize: 11,
    fontWeight: '600',
  },
  textMedium: {
    fontSize: 13,
    fontWeight: '600',
  },
  textLarge: {
    fontSize: 15,
    fontWeight: '600',
  },
});
