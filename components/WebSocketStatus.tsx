/**
 * WebSocket Connection Test Component
 * Use this to verify WebSocket connection is working
 */

import { useWebSocket } from '@/context/WebSocketContext';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function WebSocketStatus() {
  const { connected, connecting, error } = useWebSocket();

  useEffect(() => {
    console.log('[WebSocketStatus] Connection state:', { connected, connecting, error });
  }, [connected, connecting, error]);

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, connected ? styles.connected : styles.disconnected]} />
      <Text style={styles.text}>
        {connecting ? 'Connecting...' : connected ? 'Connected' : 'Disconnected'}
      </Text>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#0080FF',
  },
  disconnected: {
    backgroundColor: '#1A1A1A',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  error: {
    fontSize: 10,
    color: '#1A1A1A',
    marginLeft: 8,
  },
});
