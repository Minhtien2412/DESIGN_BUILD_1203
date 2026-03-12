/**
 * WebSocket Connection Test Component
 * Use this to verify WebSocket connection is working
 */

import { useWebSocket } from "@/context/WebSocketContext";
import { runDiagnostics } from "@/utils/websocketTest";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export function WebSocketStatus({
  showDiagnostics = false,
}: {
  showDiagnostics?: boolean;
}) {
  const { connected, connecting, error } = useWebSocket();
  const [diagRunning, setDiagRunning] = useState(false);

  useEffect(() => {
    console.log("[WebSocketStatus] Connection state:", {
      connected,
      connecting,
      error,
    });
  }, [connected, connecting, error]);

  const handlePress = async () => {
    if (!showDiagnostics) return;

    setDiagRunning(true);
    try {
      const result = await runDiagnostics();
      const passedTests = result.tests.filter((t) => t.success).length;
      const totalTests = result.tests.length;

      Alert.alert(
        "WebSocket Diagnostics",
        `Passed: ${passedTests}/${totalTests} tests\n\n` +
          `Platform: ${result.platform}\n` +
          `WS URL: ${result.wsUrl}\n\n` +
          (result.recommendations.length > 0
            ? `Recommendations:\n${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
            : "✅ All tests passed!"),
      );
    } catch (err) {
      Alert.alert("Error", "Failed to run diagnostics");
    } finally {
      setDiagRunning(false);
    }
  };

  return (
    <Pressable onPress={handlePress} disabled={!showDiagnostics || diagRunning}>
      <View style={styles.container}>
        <View
          style={[
            styles.indicator,
            connected
              ? styles.connected
              : connecting
                ? styles.connecting
                : styles.disconnected,
          ]}
        />
        <Text style={styles.text}>
          {diagRunning
            ? "Testing..."
            : connecting
              ? "Connecting..."
              : connected
                ? "Connected"
                : "Disconnected"}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {showDiagnostics ? (
          <Text style={styles.hint}>(Tap to test)</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  connected: {
    backgroundColor: "#22C55E",
  },
  connecting: {
    backgroundColor: "#F59E0B",
  },
  disconnected: {
    backgroundColor: "#EF4444",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  error: {
    fontSize: 10,
    color: "#EF4444",
    marginLeft: 8,
  },
  hint: {
    fontSize: 10,
    color: "#6B7280",
    marginLeft: 8,
  },
});
