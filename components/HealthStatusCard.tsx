import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_BASE } from '../services/api';
import { useHealthMonitor } from '../services/healthMonitor';

// Simple component to display and test health monitoring
export function HealthStatusCard() {
  const { status, checkNow, start, stop } = useHealthMonitor();

  const getStatusColor = () => {
    if (status.isOnline) return '#0066CC'; // Green
    return status.errorCount > 3 ? '#000000' : '#0066CC'; // Red or Orange
  };

  const getStatusText = () => {
    if (status.isOnline) return 'Online';
    if (status.errorCount > 3) return 'Offline';
    return 'Connecting...';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Health Status</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      </View>
      
      <View style={styles.info}>
        <Text style={styles.infoText}>Status: {getStatusText()}</Text>
        <Text style={styles.infoText}>Errors: {status.errorCount}</Text>
        <Text style={styles.infoText}>Last Check: {status.lastCheck.toLocaleTimeString()}</Text>
        <Text style={styles.infoText}>API Base: {API_BASE}</Text>
      </View>
      
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={checkNow}>
          <Text style={styles.buttonText}>Check Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={start}>
          <Text style={styles.buttonText}>Start Monitor</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stop}>
          <Text style={styles.buttonText}>Stop Monitor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  info: {
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
