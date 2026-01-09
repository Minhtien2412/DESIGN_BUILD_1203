/**
 * Message Status Indicator
 * Shows sending/sent/delivered/read/failed status for messages
 */

import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

interface MessageStatusProps {
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
  isRead?: boolean;
  onRetry?: () => void;
}

export function MessageStatus({ status, isRead, onRetry }: MessageStatusProps) {
  if (status === 'sending') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.6)" />
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <TouchableOpacity style={styles.container} onPress={onRetry}>
        <Ionicons name="alert-circle" size={14} color="#000000" />
      </TouchableOpacity>
    );
  }

  // Sent/delivered/read
  return (
    <View style={styles.container}>
      <Ionicons
        name={isRead ? 'checkmark-done' : 'checkmark'}
        size={14}
        color={isRead ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
  },
});
