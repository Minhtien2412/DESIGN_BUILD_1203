import { CallButton } from '@/components/call';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

interface TeamMember {
  id: number;
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'busy';
}

interface TeamMembersListProps {
  members: TeamMember[];
  onMemberPress?: (member: TeamMember) => void;
  showCallButtons?: boolean;
}

export function TeamMembersList({
  members,
  onMemberPress,
  showCallButtons = true,
}: TeamMembersListProps) {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return '#10B981';
      case 'busy':
        return '#F59E0B';
      default:
        return '#9CA3AF';
    }
  };

  const renderMember = ({ item }: { item: TeamMember }) => (
    <Pressable
      onPress={() => onMemberPress?.(item)}
      style={({ pressed }) => [
        styles.memberCard,
        { backgroundColor, borderColor },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.memberInfo}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: tintColor + '20' }]}>
            <Ionicons name="person" size={24} color={tintColor} />
          </View>
          
          {item.status && (
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
          )}
        </View>

        {/* Details */}
        <View style={styles.details}>
          <Text style={[styles.memberName, { color: textColor }]} numberOfLines={1}>
            {item.name}
          </Text>
          
          {item.role && (
            <Text style={[styles.memberRole, { color: textColor + '80' }]} numberOfLines={1}>
              {item.role}
            </Text>
          )}
          
          {item.email && (
            <Text style={[styles.memberEmail, { color: textColor + '60' }]} numberOfLines={1}>
              {item.email}
            </Text>
          )}
        </View>
      </View>

      {/* Call Actions */}
      {showCallButtons && (
        <View style={styles.actions}>
          <CallButton
            userId={item.id}
            userName={item.name}
            type="video"
            size="small"
          />
          <CallButton
            userId={item.id}
            userName={item.name}
            type="audio"
            size="small"
          />
        </View>
      )}
    </Pressable>
  );

  return (
    <FlatList
      data={members}
      renderItem={renderMember}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  details: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 13,
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
