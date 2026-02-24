import { Coordinates, Meeting, Participant } from '@/types/meeting';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

/**
 * MeetingMapView Component
 * Hiển thị bản đồ với route tracking tương tự Shopee delivery
 * 
 * Note: Hiện tại sử dụng mock component vì react-native-maps được mock trong package.json
 * Khi deploy thực tế, cần cài đặt react-native-maps thật và remove mock
 */

interface MeetingMapViewProps {
  meeting: Meeting;
  userLocation?: Coordinates | null;
  focusedParticipant?: Participant | null;
  showAllRoutes?: boolean;
}

export function MeetingMapView({
  meeting,
  userLocation,
  focusedParticipant,
  showAllRoutes = true
}: MeetingMapViewProps) {
  
  // Mock map view cho development
  // Trong production, sẽ sử dụng MapView từ react-native-maps
  
  return (
    <View style={styles.container}>
      <View style={styles.mockMap}>
        {/* Destination marker */}
        <View style={[styles.marker, styles.destinationMarker]}>
          <Ionicons name="location" size={32} color="#EF4444" />
          <Text style={styles.markerLabel}>{meeting.location.name}</Text>
        </View>

        {/* Route polyline visualization */}
        {meeting.participants
          .filter(p => p.currentLocation)
          .map((participant, index) => (
            <View
              key={participant.id}
              style={[
                styles.routeLine,
                { 
                  top: `${20 + index * 15}%`,
                  opacity: focusedParticipant 
                    ? (focusedParticipant.id === participant.id ? 1 : 0.3)
                    : 1
                }
              ]}
            />
          ))}

        {/* Participant markers */}
        {meeting.participants
          .filter(p => p.currentLocation && p.status !== 'arrived')
          .map((participant, index) => (
            <View
              key={participant.id}
              style={[
                styles.marker,
                styles.participantMarker,
                { 
                  top: `${25 + index * 20}%`,
                  left: `${30 + index * 15}%`,
                  opacity: focusedParticipant 
                    ? (focusedParticipant.id === participant.id ? 1 : 0.5)
                    : 1
                }
              ]}
            >
              <Ionicons name="car" size={24} color="#0D9488" />
              <Text style={styles.participantName} numberOfLines={1}>
                {participant.name.split(' ')[0]}
              </Text>
            </View>
          ))}

        {/* User location marker */}
        {userLocation && (
          <View style={[styles.marker, styles.userMarker]}>
            <View style={styles.userDot} />
            <Text style={styles.markerLabel}>Vị trí của bạn</Text>
          </View>
        )}

        {/* Map info overlay */}
        <View style={styles.mapInfo}>
          <Text style={styles.mapInfoText}>
            📍 {meeting.location.address}
          </Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Điểm đến</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0D9488' }]} />
            <Text style={styles.legendText}>Đang di chuyển</Text>
          </View>
        </View>
      </View>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={20} color="#6366F1" />
        <Text style={styles.infoBannerText}>
          Bản đồ thực tế sẽ hiển thị khi deploy với react-native-maps
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  mockMap: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden'
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    gap: 4
  },
  destinationMarker: {
    top: '70%',
    left: '60%',
    transform: [{ translateX: -16 }, { translateY: -32 }]
  },
  participantMarker: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  userMarker: {
    bottom: '20%',
    left: '20%'
  },
  userDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: 'white'
  },
  markerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden'
  },
  participantName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#0D9488'
  },
  routeLine: {
    position: 'absolute',
    left: '25%',
    right: '35%',
    height: 3,
    backgroundColor: '#0D9488',
    opacity: 0.6,
    borderRadius: 2
  },
  mapInfo: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  mapInfoText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500'
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280'
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    padding: 12,
    marginTop: 12,
    borderRadius: 8
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#4F46E5'
  }
});
