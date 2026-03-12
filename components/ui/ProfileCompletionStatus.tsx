import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getProfile } from '@/services/profile';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export function ProfileCompletionStatus() {
  const { user } = useAuth();
  const tintColor = useThemeColor({}, 'tint');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');
  const error = useThemeColor({}, 'error');
  const textInverse = useThemeColor({}, 'textInverse');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    calculateCompletion();
  }, [user]);

  const calculateCompletion = async () => {
    try {
      const profile = await getProfile(user?.id || 'guest');

      const fields = [
        { key: 'name', label: 'Tên', value: profile?.name || user?.name },
        { key: 'email', label: 'Email', value: profile?.email || user?.email },
        { key: 'bio', label: 'Giới thiệu', value: profile?.bio },
        { key: 'avatar', label: 'Ảnh đại diện', value: profile?.avatar },
      ];

      const completedFields = fields.filter(field => field.value && field.value.trim() !== '');
      const percentage = Math.round((completedFields.length / fields.length) * 100);

      const missing = fields
        .filter(field => !field.value || field.value.trim() === '')
        .map(field => field.label);

      setCompletionPercentage(percentage);
      setMissingFields(missing);
    } catch (error) {
      console.log('Failed to calculate profile completion:', error);
    }
  };

  const getStatusColor = () => {
    if (completionPercentage >= 80) return success;
    if (completionPercentage >= 60) return warning;
    return error;
  };

  const getStatusText = () => {
    if (completionPercentage >= 80) return 'Hoàn thiện';
    if (completionPercentage >= 60) return 'Tốt';
    return 'Cần bổ sung';
  };

  const getProgressBarColor = () => {
    if (completionPercentage >= 80) return success;
    if (completionPercentage >= 60) return warning;
    return error;
  };

  if (completionPercentage === 100) {
    return null; // Hide if profile is complete
  }

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={20} color={tintColor} />
        <ThemedText style={styles.title}>Hoàn thiện hồ sơ</ThemedText>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <ThemedText style={[styles.statusText, { color: textInverse }]}>{getStatusText()}</ThemedText>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${completionPercentage}%`,
                backgroundColor: getProgressBarColor(),
              },
            ]}
          />
        </View>
        <ThemedText style={[styles.percentage, { color: textMuted }]}>{completionPercentage}%</ThemedText>
      </View>

      {missingFields.length > 0 && (
        <View style={[styles.missingFields, { borderTopColor: border }]}>
          <ThemedText style={[styles.missingTitle, { color: textMuted }]}>Thiếu thông tin:</ThemedText>
          <ThemedText style={[styles.missingList, { color: textMuted }]}>
            {missingFields.join(', ')}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 35,
    textAlign: 'right',
  },
  missingFields: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  missingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  missingList: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
