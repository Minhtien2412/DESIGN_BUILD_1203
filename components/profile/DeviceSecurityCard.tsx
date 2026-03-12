import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface DeviceSecurityCardProps {
  onPress?: () => void;
}

export function DeviceSecurityCard({ onPress }: DeviceSecurityCardProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = textColor + '20';
  const primaryColor = '#007AFF';

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/profile/security' as any);
    }
  };

  return (
    <Pressable 
      style={[styles.card, { borderColor }]}
      onPress={handlePress}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark-outline" size={24} color={primaryColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: textColor }]}>
            Bảo mật thiết bị
          </Text>
          <Text style={[styles.description, { color: textColor + '80' }]}>
            Quản lý các thiết bị có thể truy cập tài khoản
          </Text>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color={textColor + '60'} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
  },
  arrowContainer: {
    marginLeft: 8,
  },
});
