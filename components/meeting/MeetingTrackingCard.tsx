import { useMeeting } from '@/context/MeetingContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Quick Access Card for Meeting Tracking
 * Component hiển thị trên trang chủ để truy cập nhanh vào tính năng theo dõi cuộc họp
 */
export function MeetingTrackingCard() {
  const { meetings } = useMeeting();
  const cardBg = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor('textMuted');

  const activeMeetings = meetings.filter(m => m.status === 'in-progress');
  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled');

  const handlePress = () => {
    router.push('/progress-meetings');
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="navigate-circle" size={32} color="#0D9488" />
        </View>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: textColor }]}>
            Theo dõi Tiến độ
          </Text>
          <Text style={[styles.subtitle, { color: mutedColor }]}>
            Cuộc họp & công trình
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={mutedColor} />
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <View style={styles.statBadge}>
            <Ionicons name="time" size={16} color="#F59E0B" />
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>
            {activeMeetings.length}
          </Text>
          <Text style={[styles.statLabel, { color: mutedColor }]}>
            Đang diễn ra
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statBadge, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="calendar" size={16} color="#6366F1" />
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>
            {upcomingMeetings.length}
          </Text>
          <Text style={[styles.statLabel, { color: mutedColor }]}>
            Sắp tới
          </Text>
        </View>
      </View>

      {/* Feature highlights */}
      <View style={styles.features}>
        <View style={styles.featureItem}>
          <Ionicons name="location" size={14} color="#10B981" />
          <Text style={[styles.featureText, { color: mutedColor }]}>
            Theo dõi vị trí thời gian thực
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="map" size={14} color="#0D9488" />
          <Text style={[styles.featureText, { color: mutedColor }]}>
            Hiển thị lộ trình trên bản đồ
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 16,
    marginVertical: 8
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerContent: {
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2
  },
  subtitle: {
    fontSize: 13
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6
  },
  statBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700'
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center'
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4
  },
  features: {
    gap: 8
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  featureText: {
    fontSize: 12,
    flex: 1
  }
});
