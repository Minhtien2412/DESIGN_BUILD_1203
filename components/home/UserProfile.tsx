import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface UserProfileProps {
  userName?: string;
  greeting?: string;
  onPress?: () => void;
  style?: any;
}

export const UserProfile = memo(function UserProfile({
  userName = "Trần Thị A",
  greeting = "Xin chào,",
  onPress,
  style
}: UserProfileProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Pressable style={[styles.container, style]} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(userName)}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.userName}>{userName}</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    backgroundColor: '#f6f9d0',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0A6847',
  },
  avatarText: {
    fontWeight: '700',
    color: '#0A6847',
    fontSize: 12,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    color: '#6b7280',
    fontSize: 12,
  },
  userName: {
    color: '#1b1b1b',
    fontWeight: '700',
    fontSize: 14,
  },
});
