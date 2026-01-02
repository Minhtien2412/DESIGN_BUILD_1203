/**
 * Connection Status Modal
 * Shows detailed server connection information
 */

import { useConnection } from '@/context/ConnectionContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getSSHTunnelInstructions } from '@/services/authWithFallback';
import { Ionicons } from '@expo/vector-icons';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ConnectionStatusModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ConnectionStatusModal({ visible, onClose }: ConnectionStatusModalProps) {
  const primary = useThemeColor({}, 'primary');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');
  const error = useThemeColor({}, 'error');

  const { currentServer, allServers, checkAllServers } = useConnection();

  const getStatusColor = (status: string) => {
    if (status === 'connected') return success;
    if (status === 'checking') return warning;
    return error;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'connected') return 'checkmark-circle';
    if (status === 'checking') return 'sync';
    return 'close-circle';
  };

  const handleRefresh = async () => {
    await checkAllServers();
  };

  const handleSSHGuide = () => {
    Alert.alert('SSH Tunnel Guide', getSSHTunnelInstructions());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={[styles.modal, { backgroundColor: surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="cloud-outline" size={24} color={primary} />
              <Text style={[styles.title, { color: text }]}>Server Status</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textMuted} />
            </TouchableOpacity>
          </View>

          {/* Current Connection */}
          <View style={[styles.currentCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.label, { color: textMuted }]}>Current Connection</Text>
            <View style={styles.currentInfo}>
              <Ionicons
                name={getStatusIcon(currentServer.status) as any}
                size={32}
                color={getStatusColor(currentServer.status)}
              />
              <View style={styles.currentText}>
                <Text style={[styles.serverName, { color: text }]}>{currentServer.name}</Text>
                {currentServer.responseTime && (
                  <Text style={[styles.responseTime, { color: textMuted }]}>
                    {currentServer.responseTime}ms
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* All Servers */}
          <Text style={[styles.sectionTitle, { color: text }]}>All Servers</Text>
          <ScrollView style={styles.serverList}>
            {allServers.map((server, index) => (
              <View
                key={index}
                style={[styles.serverCard, { backgroundColor: surface, borderColor: border }]}
              >
                <View style={styles.serverInfo}>
                  <Ionicons
                    name={getStatusIcon(server.status) as any}
                    size={20}
                    color={getStatusColor(server.status)}
                  />
                  <View style={styles.serverDetails}>
                    <Text style={[styles.serverNameSmall, { color: text }]}>
                      {server.name}
                    </Text>
                    <Text style={[styles.serverUrl, { color: textMuted }]} numberOfLines={1}>
                      {server.url || 'Built-in'}
                    </Text>
                  </View>
                </View>
                <View style={styles.serverMeta}>
                  {server.responseTime && (
                    <Text style={[styles.metaText, { color: textMuted }]}>
                      {server.responseTime}ms
                    </Text>
                  )}
                  <Text style={[styles.statusText, { color: getStatusColor(server.status) }]}>
                    {server.status}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: primary }]}
              onPress={handleRefresh}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonSecondary, { borderColor: border }]}
              onPress={handleSSHGuide}
            >
              <Ionicons name="help-circle-outline" size={20} color={primary} />
              <Text style={[styles.buttonTextSecondary, { color: primary }]}>SSH Guide</Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={[styles.info, { backgroundColor: `${primary}10` }]}>
            <Ionicons name="information-circle" size={16} color={primary} />
            <Text style={[styles.infoText, { color: text }]}>
              App auto-connects to best available server. Offline mode activates if all fail.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  currentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  currentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  currentText: {
    flex: 1,
  },
  serverName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  responseTime: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  serverList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  serverCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  serverDetails: {
    flex: 1,
  },
  serverNameSmall: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  serverUrl: {
    fontSize: 12,
  },
  serverMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
  },
  info: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});
