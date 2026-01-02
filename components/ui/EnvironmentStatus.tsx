import { useThemeColor } from '@/hooks/use-theme-color';
import Constants from 'expo-constants';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Component to display environment and API key status
 * Helps debug configuration issues
 * Only shows when there are issues or when running in Expo Go/dev mode
 */
export function EnvironmentStatus() {
  const [showDetails, setShowDetails] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // Environment detection
  const isExpoGo = Constants.appOwnership === 'expo';     // Expo Go
  const isDev = __DEV__;                                  // Metro dev
  const env = Constants.expoConfig?.extra?.EXPO_PUBLIC_ENV || (isDev ? 'development' : 'production');
  const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_KEY || '';
  const apiBaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL;

  // Check for issues
  const hasApiKey = !!apiKey && apiKey.length > 10;
  const isProduction = env === 'production';
  const hasIssues = !hasApiKey || env === 'unknown';

  // Flag to completely hide the panel (configurable via .env)
  const SHOW_ENV_CARD = Constants.expoConfig?.extra?.EXPO_PUBLIC_SHOW_ENV_CARD === 'true';
  if (!SHOW_ENV_CARD) return null;

  // Only show when there are issues, or when running in Expo Go/dev
  const shouldShowEnvCard =
    isExpoGo || isDev || !apiKey || env !== "production";

  if (!shouldShowEnvCard) {
    return null; // Hide panel
  }

  const getStatusColor = () => {
    if (!hasApiKey) return '#dc3545'; // red
    if (env === 'unknown') return '#0A6847'; // emerald
    return '#28a745'; // green
  };

  const getStatusText = () => {
    if (!hasApiKey) return 'API Key Missing';
    if (env === 'unknown') return 'Environment Unknown';
    return 'Environment OK';
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <TouchableOpacity
        style={[styles.header, { borderLeftColor: getStatusColor() }]}
        onPress={() => setShowDetails(!showDetails)}
      >
        <Text style={[styles.status, { color: getStatusColor() }]}>
          ⚙️ {getStatusText()}
        </Text>
        <Text style={[styles.toggle, { color: tintColor }]}>
          {showDetails ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {showDetails && (
        <View style={styles.details}>
          <Text style={[styles.detailText, { color: textColor }]}>
            Environment: <Text style={styles.value}>{env}</Text>
          </Text>
          <Text style={[styles.detailText, { color: textColor }]}>
            API Key: <Text style={styles.value}>
              {hasApiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET'}
            </Text>
          </Text>
          <Text style={[styles.detailText, { color: textColor }]}>
            API Base URL: <Text style={styles.value}>{apiBaseUrl || 'NOT SET'}</Text>
          </Text>
          <Text style={[styles.detailText, { color: textColor }]}>
            Development Mode: <Text style={styles.value}>{isDev ? 'Yes' : 'No'}</Text>
          </Text>
          <Text style={[styles.detailText, { color: textColor }]}>
            Expo Go: <Text style={styles.value}>
              {Constants.appOwnership === 'expo' ? 'Yes' : 'No (Dev Build)'}
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    borderRadius: 8,
    overflow: 'hidden',
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
    padding: 12,
    borderLeftWidth: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    padding: 12,
    paddingTop: 0,
  },
  detailText: {
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});
