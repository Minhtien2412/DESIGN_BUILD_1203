import { StyleSheet, Text, View } from 'react-native';

export type DefectStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED' | 'CLOSED';
export type ChecklistStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

interface StatusBadgeProps {
  status: DefectStatus | ChecklistStatus;
  size?: 'small' | 'medium' | 'large';
}

const STATUS_CONFIG: Record<DefectStatus | ChecklistStatus, { label: string; color: string; backgroundColor: string }> = {
  // Defect statuses
  OPEN: {
    label: 'Chưa xử lý',
    color: '#D32F2F',
    backgroundColor: '#FFEBEE',
  },
  IN_PROGRESS: {
    label: 'Đang xử lý',
    color: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  RESOLVED: {
    label: 'Đã sửa',
    color: '#388E3C',
    backgroundColor: '#E8F5E9',
  },
  VERIFIED: {
    label: 'Đã kiểm tra',
    color: '#1976D2',
    backgroundColor: '#F0FDFA',
  },
  CLOSED: {
    label: 'Đã đóng',
    color: '#616161',
    backgroundColor: '#F5F5F5',
  },
  // Checklist statuses
  DRAFT: {
    label: 'Nháp',
    color: '#757575',
    backgroundColor: '#FAFAFA',
  },
  PENDING_APPROVAL: {
    label: 'Chờ duyệt',
    color: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  APPROVED: {
    label: 'Đã duyệt',
    color: '#388E3C',
    backgroundColor: '#E8F5E9',
  },
  REJECTED: {
    label: 'Từ chối',
    color: '#D32F2F',
    backgroundColor: '#FFEBEE',
  },
};

export default function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeStyles = {
    small: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 3 },
    medium: { fontSize: 12, paddingHorizontal: 10, paddingVertical: 5 },
    large: { fontSize: 14, paddingHorizontal: 12, paddingVertical: 7 },
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.color,
          ...sizeStyles[size],
        },
      ]}
    >
      <Text style={[styles.text, { color: config.color, fontSize: sizeStyles[size].fontSize }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
