import { useThemeColor } from '@/hooks/use-theme-color';
import { Participant } from '@/types/meeting';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBadge } from './StatusBadge';

interface ParticipantCardProps {
  participant: Participant;
  onPress?: () => void;
  showRoute?: boolean;
}

export function ParticipantCard({ participant, onPress, showRoute }: ParticipantCardProps) {
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor('textMuted');
  const cardBg = useThemeColor({}, 'card');

  const formatETA = (isoString?: string) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    const now = new Date();
    const diffMinutes = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes <= 0) return 'Sắp tới';
    if (diffMinutes < 60) return `Còn ${diffMinutes} phút`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `Còn ${hours}h ${minutes}ph`;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {participant.avatar ? (
          <Image source={{ uri: participant.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color={mutedColor} />
          </View>
        )}
        <View style={styles.statusBadgePosition}>
          <StatusBadge status={participant.status} compact />
        </View>
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
          {participant.name}
        </Text>
        <Text style={[styles.role, { color: mutedColor }]} numberOfLines={1}>
          {participant.role}
        </Text>

        {participant.status !== 'arrived' && participant.distance !== undefined && (
          <View style={styles.distanceRow}>
            <Ionicons name="location-outline" size={14} color={mutedColor} />
            <Text style={[styles.distanceText, { color: mutedColor }]}>
              Cách {participant.distance.toFixed(1)} km
            </Text>
            {participant.estimatedArrival && (
              <>
                <Text style={[styles.separator, { color: mutedColor }]}>•</Text>
                <Text style={[styles.etaText, { color: mutedColor }]}>
                  {formatETA(participant.estimatedArrival)}
                </Text>
              </>
            )}
          </View>
        )}

        {participant.status === 'arrived' && (
          <View style={styles.distanceRow}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={[styles.arrivedText, { color: '#10B981' }]}>
              Đã có mặt tại địa điểm
            </Text>
          </View>
        )}
      </View>

      {showRoute && participant.currentLocation && (
        <TouchableOpacity style={styles.routeButton} onPress={onPress}>
          <Ionicons name="navigate" size={20} color="#0D9488" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  avatarContainer: {
    position: 'relative'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  avatarPlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusBadgePosition: {
    position: 'absolute',
    bottom: -2,
    right: -2
  },
  info: {
    flex: 1,
    gap: 2
  },
  name: {
    fontSize: 15,
    fontWeight: '600'
  },
  role: {
    fontSize: 13
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2
  },
  distanceText: {
    fontSize: 12
  },
  separator: {
    fontSize: 12,
    marginHorizontal: 2
  },
  etaText: {
    fontSize: 12,
    fontWeight: '500'
  },
  arrivedText: {
    fontSize: 12,
    fontWeight: '500'
  },
  routeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
