/**
 * ConnectionStatus Component
 * Displays WebSocket connection status indicator
 *
 * Features:
 * - Shows connected/disconnected/reconnecting states
 * - Animated status indicator
 * - Auto-hide when connected (optional)
 * - Tap to reconnect
 */

import { useWebSocket } from "@/context/WebSocketContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ConnectionStatusProps {
  /** Show even when connected (default: false - auto-hide when connected) */
  showWhenConnected?: boolean;
  /** Position on screen */
  position?: "top" | "bottom";
  /** Custom style */
  style?: object;
  /** Compact mode - just show dot */
  compact?: boolean;
}

type ConnectionState = "connected" | "connecting" | "disconnected" | "error";

const STATUS_CONFIG: Record<
  ConnectionState,
  {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
    text: string;
  }
> = {
  connected: {
    icon: "checkmark-circle",
    color: "#10B981",
    bgColor: "#ECFDF5",
    text: "Đã kết nối",
  },
  connecting: {
    icon: "sync",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    text: "Đang kết nối...",
  },
  disconnected: {
    icon: "cloud-offline",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    text: "Mất kết nối",
  },
  error: {
    icon: "alert-circle",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    text: "Lỗi kết nối",
  },
};

export function ConnectionStatus({
  showWhenConnected = false,
  position = "top",
  style,
  compact = false,
}: ConnectionStatusProps) {
  const { connected, connecting, error, reconnect } = useWebSocket();
  const [visible, setVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Determine current state
  const getState = (): ConnectionState => {
    if (error) return "error";
    if (connecting) return "connecting";
    if (connected) return "connected";
    return "disconnected";
  };

  const state = getState();
  const config = STATUS_CONFIG[state];

  // Handle visibility
  useEffect(() => {
    const shouldShow = !connected || showWhenConnected || connecting || !!error;

    if (shouldShow) {
      setVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Auto-hide after 2 seconds when connected
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [connected, connecting, error, showWhenConnected, fadeAnim]);

  // Rotate animation for connecting state
  useEffect(() => {
    if (connecting) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [connecting, rotateAnim]);

  // Pulse animation for connected state
  useEffect(() => {
    if (connected && !connecting) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [connected, connecting, pulseAnim]);

  const handlePress = () => {
    if (!connected && !connecting) {
      reconnect();
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!visible) return null;

  // Compact mode - just a dot indicator
  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactDot,
          { backgroundColor: config.color, opacity: fadeAnim },
          style,
        ]}
      />
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        position === "top" ? styles.positionTop : styles.positionBottom,
        { opacity: fadeAnim },
        style,
      ]}
    >
      <TouchableOpacity
        style={[styles.badge, { backgroundColor: config.bgColor }]}
        onPress={handlePress}
        activeOpacity={connected ? 1 : 0.7}
        disabled={connected || connecting}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            connecting && { transform: [{ rotate: spin }] },
            connected && { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Ionicons name={config.icon} size={16} color={config.color} />
        </Animated.View>

        <Text style={[styles.text, { color: config.color }]}>
          {config.text}
        </Text>

        {!connected && !connecting && (
          <View style={styles.retryHint}>
            <Ionicons name="refresh" size={12} color={config.color} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Inline connection indicator (for headers, etc.)
 */
export function ConnectionDot({ size = 8 }: { size?: number }) {
  const { connected, connecting } = useWebSocket();

  const color = connecting ? "#F59E0B" : connected ? "#10B981" : "#EF4444";

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
}

/**
 * Hook to get connection status for custom UI
 */
export function useConnectionStatus() {
  const { connected, connecting, error, reconnect } = useWebSocket();

  const state: ConnectionState = error
    ? "error"
    : connecting
      ? "connecting"
      : connected
        ? "connected"
        : "disconnected";

  return {
    state,
    config: STATUS_CONFIG[state],
    isOnline: connected,
    isReconnecting: connecting,
    hasError: !!error,
    errorMessage: error,
    reconnect,
  };
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  positionTop: {
    top: 50,
  },
  positionBottom: {
    bottom: 100,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
  },
  retryHint: {
    marginLeft: 6,
    opacity: 0.7,
  },
  compactDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dot: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default ConnectionStatus;
