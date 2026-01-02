/**
 * Server Connection Status Banner
 * Shows which server is being used (Production, SSH Tunnel, Mock, or Offline)
 */

import { useConnection } from '@/context/ConnectionContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ConnectionStatusModal } from './ConnectionStatusModal';

export function ServerStatusBanner() {
  const [showModal, setShowModal] = useState(false);
  const { currentServer } = useConnection();

  const primary = useThemeColor({}, 'primary');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');
  const error = useThemeColor({}, 'error');
  const surface = useThemeColor({}, 'surface');

  const getBackgroundColor = (): string => {
    if (currentServer.status === 'checking') return primary;
    if (currentServer.status === 'connected' && currentServer.isProduction) return success;
    if (currentServer.status === 'connected' && !currentServer.isProduction) return warning;
    return error;
  };

  const getIcon = () => {
    if (currentServer.status === 'checking') return 'sync-outline';
    if (currentServer.status === 'connected') return 'cloud-done-outline';
    return 'cloud-offline-outline';
  };

  // Auto-hide when production connected (AFTER all hooks)
  if (currentServer.status === 'connected' && currentServer.isProduction) {
    return null;
  }

  return (
    <>
      <Pressable
        onPress={() => setShowModal(true)}
        style={[
          styles.banner,
          { backgroundColor: getBackgroundColor() + '15' },
        ]}
      >
        <View style={styles.content}>
          <Ionicons name={getIcon() as any} size={20} color={getBackgroundColor()} />
          <View style={styles.textContainer}>
            <Text style={[styles.text, { color: getBackgroundColor() }]}>
              {currentServer.name}
            </Text>
            {currentServer.status === 'checking' && (
              <Text style={[styles.subtext, { color: getBackgroundColor() }]}>
                Đang kiểm tra kết nối...
              </Text>
            )}
            {currentServer.status === 'offline' && (
              <Text style={[styles.subtext, { color: getBackgroundColor() }]}>
                Chế độ offline - Nhấn để xem thông tin
              </Text>
            )}
            {currentServer.status === 'connected' && !currentServer.isProduction && (
              <Text style={[styles.subtext, { color: getBackgroundColor() }]}>
                Không phải production - Nhấn để xem chi tiết
              </Text>
            )}
          </View>
          <Ionicons name="information-circle-outline" size={20} color={getBackgroundColor()} />
        </View>
      </Pressable>

      <ConnectionStatusModal visible={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtext: {
    fontSize: 12,
    marginTop: 2,
  },
});
