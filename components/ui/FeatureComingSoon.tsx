import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FeatureComingSoonProps {
  feature: string;
  description?: string;
  estimatedDate?: string;
  onBack?: () => void;
}

/**
 * Coming Soon Screen
 * 
 * Shows when a feature's backend endpoint is not yet available
 * Used for graceful degradation of missing API endpoints
 * 
 * Usage:
 * ```tsx
 * <FeatureComingSoon 
 *   feature="Products" 
 *   description="Browse and purchase building materials"
 *   estimatedDate="Tháng 12, 2025"
 * />
 * ```
 */
export function FeatureComingSoon({
  feature,
  description,
  estimatedDate,
  onBack,
}: FeatureComingSoonProps) {
  const colors = {
    background: useThemeColor({}, 'background'),
    text: useThemeColor({}, 'text'),
    textMuted: useThemeColor({}, 'textMuted'),
    primary: useThemeColor({}, 'primary'),
    border: useThemeColor({}, 'border'),
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Icon */}
      <View style={[styles.iconContainer, { borderColor: colors.border }]}>
        <Ionicons name="construct-outline" size={64} color={colors.primary} />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>
        {feature} - Đang Phát Triển
      </Text>

      {/* Description */}
      {description && (
        <Text style={[styles.description, { color: colors.textMuted }]}>
          {description}
        </Text>
      )}

      {/* Status */}
      <View style={[styles.statusCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
        <Ionicons name="time-outline" size={20} color={colors.primary} />
        <Text style={[styles.statusText, { color: colors.primary }]}>
          Tính năng này đang được phát triển
        </Text>
      </View>

      {/* Estimated Date */}
      {estimatedDate && (
        <Text style={[styles.estimatedDate, { color: colors.textMuted }]}>
          Dự kiến ra mắt: {estimatedDate}
        </Text>
      )}

      {/* Info Box */}
      <View style={[styles.infoBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>
          Trong thời gian chờ đợi:
        </Text>
        <View style={styles.infoItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Bạn có thể sử dụng các tính năng khác
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Chúng tôi sẽ thông báo khi sẵn sàng
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Liên hệ hỗ trợ nếu cần trợ giúp
          </Text>
        </View>
      </View>

      {/* Back Button */}
      {onBack && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  estimatedDate: {
    fontSize: 14,
    marginBottom: 24,
  },
  infoBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
