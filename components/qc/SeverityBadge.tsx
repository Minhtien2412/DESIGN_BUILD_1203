import { StyleSheet, Text, View } from 'react-native';

export type DefectSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'COSMETIC';

interface SeverityBadgeProps {
  severity: DefectSeverity;
  size?: 'small' | 'medium' | 'large';
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    label: 'Nghiêm trọng',
    color: '#D32F2F',
    backgroundColor: '#FFEBEE',
  },
  MAJOR: {
    label: 'Quan trọng',
    color: '#0066CC',
    backgroundColor: '#E8F4FF',
  },
  MINOR: {
    label: 'Nhỏ',
    color: '#FBC02D',
    backgroundColor: '#FFFDE7',
  },
  COSMETIC: {
    label: 'Thẩm mỹ',
    color: '#689F38',
    backgroundColor: '#F1F8E9',
  },
};

export default function SeverityBadge({ severity, size = 'medium' }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];
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
