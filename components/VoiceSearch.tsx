/**
 * VoiceSearch Component
 * Reusable voice search UI with recording visualization and processing states
 * Features: Pulse animation, waveform, recording timer, error handling
 * @author AI Assistant
 * @date 2025-01-13
 */

import {
    RecordingStatus,
    VoiceSearchConfig,
    VoiceSearchResult,
    voiceSearchService,
} from "@/services/voiceSearchService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// =====================================================
// TYPES
// =====================================================

interface VoiceSearchProps {
  visible: boolean;
  onClose: () => void;
  onResult: (result: VoiceSearchResult) => void;
  onTextResult?: (text: string) => void;
  config?: VoiceSearchConfig;
  title?: string;
  subtitle?: string;
  maxDuration?: number;
  autoStart?: boolean;
}

// =====================================================
// COMPONENT
// =====================================================

export function VoiceSearch({
  visible,
  onClose,
  onResult,
  onTextResult,
  config = {},
  title = "Đang nghe...",
  subtitle = "Nói để tìm kiếm",
  maxDuration = 15000,
  autoStart = true,
}: VoiceSearchProps) {
  // State
  const [status, setStatus] = useState<RecordingStatus>({
    state: "idle",
    duration: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.5),
    new Animated.Value(0.4),
    new Animated.Value(0.6),
    new Animated.Value(0.35),
  ]).current;

  // =====================================================
  // ANIMATION EFFECTS
  // =====================================================

  useEffect(() => {
    if (status.state === "recording") {
      // Pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();

      // Wave animations
      const waves = waveAnims.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.8 + Math.random() * 0.2,
              duration: 200 + index * 50,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3 + Math.random() * 0.2,
              duration: 200 + index * 50,
              useNativeDriver: true,
            }),
          ]),
        ),
      );
      waves.forEach((w) => w.start());

      return () => {
        pulse.stop();
        waves.forEach((w) => w.stop());
        pulseAnim.setValue(1);
        waveAnims.forEach((a) => a.setValue(0.4));
      };
    }
  }, [status.state]);

  // =====================================================
  // RECORDING LOGIC
  // =====================================================

  // Subscribe to status updates
  useEffect(() => {
    const unsubscribe = voiceSearchService.addStateListener(setStatus);
    return unsubscribe;
  }, []);

  // Auto-start when modal opens
  useEffect(() => {
    if (visible && autoStart) {
      startRecording();
    } else if (!visible) {
      voiceSearchService.cancelRecording();
    }
  }, [visible, autoStart]);

  const startRecording = useCallback(async () => {
    setError(null);
    const success = await voiceSearchService.startRecording(maxDuration);
    if (!success) {
      setError("Không thể truy cập microphone");
    }
  }, [maxDuration]);

  const stopRecording = useCallback(async () => {
    const result = await voiceSearchService.processRecordingForSearch(config);

    if (result.success) {
      if (onTextResult && result.query) {
        onTextResult(result.query);
      }
      onResult(result);
      onClose();
    } else {
      setError(result.error || "Không thể nhận dạng giọng nói");
    }
  }, [config, onResult, onTextResult, onClose]);

  const handleCancel = useCallback(() => {
    voiceSearchService.cancelRecording();
    onClose();
  }, [onClose]);

  const handleRetry = useCallback(() => {
    setError(null);
    startRecording();
  }, [startRecording]);

  // =====================================================
  // RENDER HELPERS
  // =====================================================

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderWaveform = () => (
    <View style={styles.waveformContainer}>
      {waveAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            {
              transform: [{ scaleY: anim }],
            },
          ]}
        />
      ))}
    </View>
  );

  const renderContent = () => {
    // Error state
    if (error) {
      return (
        <View style={styles.content}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Processing state
    if (status.state === "processing") {
      return (
        <View style={styles.content}>
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.processingText}>Đang xử lý...</Text>
          </View>
        </View>
      );
    }

    // Recording state
    return (
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* Microphone with pulse */}
        <Animated.View
          style={[styles.micContainer, { transform: [{ scale: pulseAnim }] }]}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.micGradient}
          >
            <Ionicons name="mic" size={40} color="#fff" />
          </LinearGradient>
        </Animated.View>

        {/* Waveform */}
        {status.state === "recording" && renderWaveform()}

        {/* Duration */}
        <Text style={styles.duration}>
          {formatDuration(status.duration)} / {formatDuration(maxDuration)}
        </Text>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Ionicons name="close" size={24} color="#666" />
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopRecording}
            disabled={status.state !== "recording"}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.stopGradient}
            >
              <Ionicons name="checkmark" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.placeholderButton} />
        </View>
      </View>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>{renderContent()}</View>
      </View>
    </Modal>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    maxWidth: 340,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  micContainer: {
    marginBottom: 20,
  },
  micGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    gap: 4,
    marginBottom: 16,
  },
  waveBar: {
    width: 4,
    height: 40,
    backgroundColor: "#667eea",
    borderRadius: 2,
  },
  duration: {
    fontSize: 16,
    color: "#999",
    fontVariant: ["tabular-nums"],
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
  },
  cancelButton: {
    flexDirection: "column",
    alignItems: "center",
    padding: 12,
  },
  cancelText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  stopButton: {
    marginHorizontal: 16,
  },
  stopGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderButton: {
    width: 48,
  },
  // Error state
  errorIconContainer: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Processing state
  processingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});

export default VoiceSearch;
