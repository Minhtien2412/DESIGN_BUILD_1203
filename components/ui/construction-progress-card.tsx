import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConstructionProgressCardProps {
  projectName?: string;
  progress?: number;
  totalTasks?: number;
  completedTasks?: number;
}

/**
 * Card component hiển thị tóm tắt tiến độ thi công
 * Có thể dùng trong trang chủ hoặc dashboard
 */
export function ConstructionProgressCard({
  projectName = 'Tiến độ thi công biệt thự',
  progress = 0,
  totalTasks = 0,
  completedTasks = 0,
}: ConstructionProgressCardProps) {
  const progressColor = progress < 40 ? '#e53935' : progress < 80 ? '#ffb300' : '#4caf50';
  const progressBg = progress < 40 ? '#ffebee' : progress < 80 ? '#fff8e1' : '#e8f5e9';

  const handlePress = () => {
    router.push('/construction-progress' as any);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="construct" size={24} color="#1f912c" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{projectName}</Text>
          <Text style={styles.subtitle}>
            {completedTasks}/{totalTasks} hạng mục
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Tiến độ tổng thể</Text>
          <View style={[styles.progressBadge, { backgroundColor: progressBg }]}>
            <Text style={[styles.progressText, { color: progressColor }]}>{progress}%</Text>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: progressColor }]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Ionicons name="checkbox" size={16} color="#4caf50" />
          <Text style={styles.statText}>{completedTasks} hoàn thành</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="time" size={16} color="#ffb300" />
          <Text style={styles.statText}>{totalTasks - completedTasks} đang làm</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e1e4eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  progressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 6,
  },
});
