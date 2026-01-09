import { CallButton } from '@/components/call';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface UserProfileCardProps {
  userId: number;
  userName: string;
  userEmail?: string;
  userRole?: string;
  userPhone?: string;
  userAvatar?: string;
  showCallButtons?: boolean;
  onMessagePress?: () => void;
}

export function UserProfileCard({
  userId,
  userName,
  userEmail,
  userRole,
  userPhone,
  userAvatar,
  showCallButtons = true,
  onMessagePress,
}: UserProfileCardProps) {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      {/* Avatar & Basic Info */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: tintColor + '20' }]}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={48} color={tintColor} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
            {userName}
          </Text>
          
          {userRole && (
            <View style={[styles.roleBadge, { backgroundColor: tintColor + '20' }]}>
              <Text style={[styles.roleText, { color: tintColor }]}>
                {userRole}
              </Text>
            </View>
          )}

          {userEmail && (
            <Text style={[styles.email, { color: textColor + '80' }]} numberOfLines={1}>
              {userEmail}
            </Text>
          )}

          {userPhone && (
            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={14} color={textColor + '80'} />
              <Text style={[styles.phone, { color: textColor + '80' }]}>
                {userPhone}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      {showCallButtons && (
        <View style={styles.actions}>
          {/* Message Button */}
          {onMessagePress && (
            <Pressable
              onPress={onMessagePress}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: '#0066CC' },
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
              <Text style={styles.actionLabel}>Nhắn tin</Text>
            </Pressable>
          )}

          {/* Video Call Button */}
          <View style={styles.callButtons}>
            <CallButton
              userId={userId}
              userName={userName}
              type="video"
              size="medium"
            />
            <Text style={[styles.callLabel, { color: textColor + '80' }]}>
              Video
            </Text>
          </View>

          {/* Audio Call Button */}
          <View style={styles.callButtons}>
            <CallButton
              userId={userId}
              userName={userName}
              type="audio"
              size="medium"
            />
            <Text style={[styles.callLabel, { color: textColor + '80' }]}>
              Gọi
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  email: {
    fontSize: 14,
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phone: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  callButtons: {
    alignItems: 'center',
    gap: 4,
  },
  callLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
