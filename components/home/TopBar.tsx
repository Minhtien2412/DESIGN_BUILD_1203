import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TopBarProps {
  title?: string;
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
  style?: any;
}

export const TopBar = memo(function TopBar({
  title = "ThietKe Resort",
  onNotificationPress,
  onMenuPress,
  style
}: TopBarProps) {
  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push('/notifications');
    }
  };

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      router.push('/(tabs)/profile' as any);
    }
  };

  return (
    <View style={[styles.topBar, style]}>
      <View style={styles.brandSection}>
        <Ionicons name="business-outline" size={24} color="#0D9488" />
        <Text style={styles.brandText}>{title}</Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          onPress={handleNotificationPress}
          style={styles.iconButton}
        >
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleMenuPress}
          style={styles.iconButton}
        >
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D9488',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    padding: 4,
  },
});
