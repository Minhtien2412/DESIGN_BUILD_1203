/**
 * LocationStatusBar Component - Zalo-style Location Status
 * 
 * Displays current location in greeting/status bar with real-time updates
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { formatLocationStatus, useRealtimeLocation } from '@/hooks/useRealtimeLocation';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface LocationStatusBarProps {
  userName?: string;
  autoStart?: boolean;
  showToggle?: boolean;
}

export function LocationStatusBar({
  userName = 'Bạn',
  autoStart = false,
  showToggle = true,
}: LocationStatusBarProps) {
  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const surface = useThemeColor({}, 'surface');

  const [enabled, setEnabled] = useState(autoStart);
  const pulseAnim = useState(new Animated.Value(1))[0];

  const {
    location,
    isTracking,
    error,
    startTracking,
    stopTracking,
    updateNow,
  } = useRealtimeLocation({
    enabled,
    updateInterval: 30000, // 30s
    distanceInterval: 50, // 50m
    broadcastToServer: true,
  });

  // Pulse animation for location icon
  useEffect(() => {
    if (isTracking && location?.isMoving) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTracking, location?.isMoving]);

  const handleToggle = async () => {
    if (isTracking) {
      stopTracking();
      setEnabled(false);
    } else {
      const success = await startTracking();
      setEnabled(success);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      {/* Greeting */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: textMuted }]}>
          {getGreeting()}, <Text style={[styles.userName, { color: text }]}>{userName}</Text>
        </Text>
      </View>

      {/* Location Status */}
      <TouchableOpacity
        style={styles.locationRow}
        onPress={updateNow}
        disabled={!isTracking}
        activeOpacity={0.7}
      >
        <View style={styles.locationContent}>
          {/* Location Icon */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Ionicons
              name={location?.isMoving ? 'navigate' : 'location'}
              size={18}
              color={isTracking ? primary : textMuted}
            />
          </Animated.View>

          {/* Location Text */}
          <View style={styles.locationTextContainer}>
            {isTracking ? (
              location ? (
                <>
                  <Text style={[styles.locationText, { color: text }]} numberOfLines={1}>
                    {formatLocationStatus(location)}
                  </Text>
                  <Text style={[styles.locationDetail, { color: textMuted }]} numberOfLines={1}>
                    {location.address}
                  </Text>
                </>
              ) : (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={primary} />
                  <Text style={[styles.locationText, { color: textMuted, marginLeft: 8 }]}>
                    Đang lấy vị trí...
                  </Text>
                </View>
              )
            ) : (
              <Text style={[styles.locationText, { color: textMuted }]}>
                Nhấn để bật định vị
              </Text>
            )}
          </View>
        </View>

        {/* Toggle Switch */}
        {showToggle && (
          <TouchableOpacity
            style={[
              styles.toggle,
              {
                backgroundColor: isTracking ? `${primary}20` : '#f0f0f0',
              },
            ]}
            onPress={handleToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View
              style={[
                styles.toggleThumb,
                {
                  backgroundColor: isTracking ? primary : '#999',
                  transform: [
                    {
                      translateX: isTracking ? 16 : 0,
                    },
                  ],
                },
              ]}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
        </View>
      )}

      {/* Live Indicator */}
      {isTracking && (
        <View style={styles.liveIndicator}>
          <View style={[styles.liveDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.liveText, { color: '#10B981' }]}>LIVE</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    marginBottom: 8,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontWeight: '700',
    fontSize: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  locationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
  },
  locationDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
  },
  liveIndicator: {
    position: 'absolute',
    top: 8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
