import { MeetingMapView } from '@/components/meeting/MeetingMapView';
import { ParticipantCard } from '@/components/meeting/ParticipantCard';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { useMeeting } from '@/context/MeetingContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Participant } from '@/types/meeting';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type TabType = 'map' | 'participants' | 'details';

export default function MeetingTrackingScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const {
    getMeetingById,
    userLocation,
    locationPermission,
    refreshLocation,
    checkInToMeeting,
    getParticipantRoute
  } = useMeeting();

  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [focusedParticipant, setFocusedParticipant] = useState<Participant | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const meeting = getMeetingById(params.id);

  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor('textMuted');
  const cardBg = useThemeColor({}, 'card');

  useEffect(() => {
    if (!locationPermission) {
      Alert.alert(
        'Quyền truy cập vị trí',
        'Ứng dụng cần quyền truy cập vị trí để theo dõi tiến độ cuộc họp',
        [{ text: 'OK' }]
      );
    }
  }, [locationPermission]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshLocation();
    setRefreshing(false);
  };

  const handleCheckIn = async () => {
    if (!meeting) return;

    const success = await checkInToMeeting(meeting.id);
    if (success) {
      Alert.alert('Thành công', 'Bạn đã check-in vào cuộc họp');
    } else {
      Alert.alert('Lỗi', 'Không thể check-in. Vui lòng thử lại.');
    }
  };

  const handleParticipantPress = (participant: Participant) => {
    setFocusedParticipant(participant);
    setActiveTab('map');
  };

  if (!meeting) {
    return (
      <Container style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={mutedColor} />
          <Text style={[styles.errorText, { color: mutedColor }]}>
            Không tìm thấy cuộc họp
          </Text>
          <Button title="Quay lại" onPress={() => router.back()} />
        </View>
      </Container>
    );
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const arrivedCount = meeting.participants.filter(p => p.status === 'arrived').length;
  const onTheWayCount = meeting.participants.filter(p => p.status === 'on-the-way').length;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBg }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
            {meeting.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: mutedColor }]}>
            {formatDateTime(meeting.scheduledTime)}
          </Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={22} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Status Summary */}
      <View style={[styles.statusSummary, { backgroundColor: cardBg }]}>
        <View style={styles.statusItem}>
          <Ionicons name="people-outline" size={20} color={mutedColor} />
          <Text style={[styles.statusValue, { color: textColor }]}>
            {meeting.participants.length}
          </Text>
          <Text style={[styles.statusLabel, { color: mutedColor }]}>Người tham gia</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statusItem}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
          <Text style={[styles.statusValue, { color: '#10B981' }]}>{arrivedCount}</Text>
          <Text style={[styles.statusLabel, { color: mutedColor }]}>Đã tới</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statusItem}>
          <Ionicons name="navigate-outline" size={20} color="#F59E0B" />
          <Text style={[styles.statusValue, { color: '#F59E0B' }]}>{onTheWayCount}</Text>
          <Text style={[styles.statusLabel, { color: mutedColor }]}>Đang đến</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: cardBg }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'map' && styles.activeTab]}
          onPress={() => setActiveTab('map')}
        >
          <Ionicons
            name="map-outline"
            size={20}
            color={activeTab === 'map' ? '#3B82F6' : mutedColor}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'map' ? '#3B82F6' : mutedColor }
            ]}
          >
            Bản đồ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'participants' && styles.activeTab]}
          onPress={() => setActiveTab('participants')}
        >
          <Ionicons
            name="people-outline"
            size={20}
            color={activeTab === 'participants' ? '#3B82F6' : mutedColor}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'participants' ? '#3B82F6' : mutedColor }
            ]}
          >
            Người tham gia
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={activeTab === 'details' ? '#3B82F6' : mutedColor}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'details' ? '#3B82F6' : mutedColor }
            ]}
          >
            Chi tiết
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'map' && (
          <View style={styles.mapContainer}>
            <MeetingMapView
              meeting={meeting}
              userLocation={userLocation}
              focusedParticipant={focusedParticipant}
            />
          </View>
        )}

        {activeTab === 'participants' && (
          <View style={styles.participantsList}>
            {meeting.participants.map(participant => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                onPress={() => handleParticipantPress(participant)}
                showRoute
              />
            ))}
          </View>
        )}

        {activeTab === 'details' && (
          <View style={[styles.detailsContainer, { backgroundColor: cardBg }]}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color={mutedColor} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: mutedColor }]}>Địa điểm</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {meeting.location.name}
                </Text>
                <Text style={[styles.detailSubtext, { color: mutedColor }]}>
                  {meeting.location.address}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color={mutedColor} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: mutedColor }]}>Thời gian</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {formatDateTime(meeting.scheduledTime)}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="briefcase-outline" size={20} color={mutedColor} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: mutedColor }]}>Người tổ chức</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {meeting.organizer.name}
                </Text>
              </View>
            </View>

            {meeting.description && (
              <View style={styles.detailRow}>
                <Ionicons name="document-text-outline" size={20} color={mutedColor} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: mutedColor }]}>Mô tả</Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {meeting.description}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      {meeting.checkInRequired && meeting.status !== 'completed' && (
        <View style={[styles.bottomActions, { backgroundColor: cardBg }]}>
          <Button
            title="Check-in"
            onPress={handleCheckIn}
            {...({ leftIcon: <Ionicons name="checkmark-circle-outline" size={20} color="white" /> } as any)}
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerContent: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2
  },
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 1
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '700'
  },
  statusLabel: {
    fontSize: 11
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB'
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    marginTop: 1
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8
  },
  activeTab: {
    backgroundColor: '#EFF6FF'
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  mapContainer: {
    height: 500,
    padding: 16
  },
  participantsList: {
    padding: 16,
    gap: 12
  },
  detailsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 20
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12
  },
  detailContent: {
    flex: 1,
    gap: 4
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500'
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600'
  },
  detailSubtext: {
    fontSize: 13
  },
  bottomActions: {
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500'
  }
});
