/**
 * Voice Recorder Component (MSG-005)
 * ===================================
 *
 * Record voice messages for chat
 * - Record with waveform visualization
 * - Playback preview before sending
 * - Duration limit (default 2 min)
 *
 * Uses audioWrapper for compatibility with future expo-audio migration
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 * @updated 2026-01-26 - Migrated to audioWrapper
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import {
    AudioPlayer,
    AudioRecorder as AudioRecorderUtil,
} from "@/utils/audioWrapper";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================================================
// Types
// ============================================================================

interface VoiceRecorderProps {
  visible: boolean;
  onClose: () => void;
  onRecorded: (recording: {
    uri: string;
    duration: number;
    waveform?: number[];
  }) => void;
  maxDuration?: number; // in seconds
}

type RecordingState = "idle" | "recording" | "paused" | "recorded";

// ============================================================================
// Component
// ============================================================================

export function VoiceRecorder({
  visible,
  onClose,
  onRecorded,
  maxDuration = 120,
}: VoiceRecorderProps) {
  const colors = useThemeColor();

  // State
  const [state, setState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);

  // Refs
  const recorderRef = useRef<AudioRecorderUtil | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const recordingUriRef = useRef<string | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const waveformIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ============================================
  // Recording Logic
  // ============================================

  const startRecording = useCallback(async () => {
    try {
      // Create new recorder
      recorderRef.current = new AudioRecorderUtil({
        maxDuration,
        onRecordingStatusUpdate: (status) => {
          setDuration(Math.floor(status.durationMillis / 1000));
        },
      });

      const started = await recorderRef.current.start();
      if (!started) {
        Alert.alert(
          "Cần quyền truy cập",
          "Vui lòng cấp quyền microphone để ghi âm",
          [{ text: "OK" }],
        );
        return;
      }

      setState("recording");
      setDuration(0);
      setWaveform([]);

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Start pulse animation
      startPulseAnimation();

      // Update waveform (mock - real implementation needs metering)
      waveformIntervalRef.current = setInterval(() => {
        setWaveform((w) => {
          const newLevel = Math.random() * 0.6 + 0.2;
          return [...w.slice(-39), newLevel];
        });
      }, 100);
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert("Lỗi", "Không thể bắt đầu ghi âm");
    }
  }, [maxDuration]);

  const stopRecording = useCallback(async () => {
    if (!recorderRef.current) return;

    try {
      clearIntervals();
      stopPulseAnimation();

      const uri = await recorderRef.current.stop();

      if (uri) {
        recordingUriRef.current = uri;
        setState("recorded");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setState("idle");
        Alert.alert("Lỗi", "Không thể lưu bản ghi âm");
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      setState("idle");
    }
  }, []);

  const cancelRecording = useCallback(async () => {
    try {
      clearIntervals();
      stopPulseAnimation();

      if (recorderRef.current) {
        await recorderRef.current.cancel();
        recorderRef.current = null;
      }

      if (playerRef.current) {
        await playerRef.current.unload();
        playerRef.current = null;
      }

      recordingUriRef.current = null;
      setState("idle");
      setDuration(0);
      setWaveform([]);
      onClose();
    } catch (error) {
      console.error("Error canceling recording:", error);
      onClose();
    }
  }, [onClose]);

  const sendRecording = useCallback(async () => {
    const uri = recordingUriRef.current;
    if (!uri) {
      Alert.alert("Lỗi", "Không tìm thấy bản ghi âm");
      return;
    }

    onRecorded({
      uri,
      duration,
      waveform,
    });

    // Reset state
    recorderRef.current = null;
    recordingUriRef.current = null;
    setState("idle");
    setDuration(0);
    setWaveform([]);
  }, [duration, waveform, onRecorded]);

  // ============================================
  // Playback
  // ============================================

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);

  const playPreview = useCallback(async () => {
    const uri = recordingUriRef.current;
    if (!uri) return;

    try {
      if (playerRef.current) {
        const status = await playerRef.current.getStatus();
        if (status?.isLoaded) {
          if (status.isPlaying) {
            await playerRef.current.pause();
            setIsPlaying(false);
            return;
          } else {
            await playerRef.current.play();
            setIsPlaying(true);
            return;
          }
        }
      }

      // Create new player
      playerRef.current = new AudioPlayer({
        uri,
        shouldPlay: true,
        onPlaybackStatusUpdate: (status) => {
          if (status.isLoaded) {
            setPlaybackPosition(status.positionMillis / 1000);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPlaybackPosition(0);
            }
          }
        },
      });
      await playerRef.current.load();
      await playerRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing preview:", error);
    }
  }, []);

  // ============================================
  // Animations
  // ============================================

  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const stopPulseAnimation = useCallback(() => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  // ============================================
  // Helpers
  // ============================================

  const clearIntervals = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = null;
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearIntervals();
      if (recorderRef.current) {
        recorderRef.current.cancel().catch(() => {});
      }
      if (playerRef.current) {
        playerRef.current.unload().catch(() => {});
      }
    };
  }, []);

  // ============================================
  // Render
  // ============================================

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={cancelRecording}
    >
      <Pressable style={styles.overlay} onPress={cancelRecording}>
        <Pressable
          style={[styles.container, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />

          <Text style={[styles.title, { color: colors.text }]}>
            {state === "recorded" ? "Xác nhận ghi âm" : "Ghi âm tin nhắn"}
          </Text>

          {/* Duration */}
          <Text style={[styles.duration, { color: colors.primary }]}>
            {formatDuration(
              state === "recorded" ? Math.round(playbackPosition) : duration,
            )}
            {state === "recording" && (
              <Text style={{ color: colors.textSecondary }}>
                {" "}
                / {formatDuration(maxDuration)}
              </Text>
            )}
          </Text>

          {/* Waveform */}
          <View style={styles.waveformContainer}>
            {waveform.map((level, index) => (
              <View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    height: level * 40 + 4,
                    backgroundColor:
                      state === "recording"
                        ? colors.primary
                        : colors.textSecondary,
                    opacity: state === "recording" ? 1 : 0.5,
                  },
                ]}
              />
            ))}
            {waveform.length === 0 && (
              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                Nhấn nút để bắt đầu ghi âm
              </Text>
            )}
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {state === "idle" && (
              <TouchableOpacity
                style={[styles.recordButton, { backgroundColor: "#E91E63" }]}
                onPress={startRecording}
              >
                <Ionicons name="mic" size={32} color="#FFF" />
              </TouchableOpacity>
            )}

            {state === "recording" && (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={[styles.recordButton, { backgroundColor: "#E91E63" }]}
                  onPress={stopRecording}
                >
                  <Ionicons name="stop" size={32} color="#FFF" />
                </TouchableOpacity>
              </Animated.View>
            )}

            {state === "recorded" && (
              <View style={styles.recordedControls}>
                <TouchableOpacity
                  style={[styles.controlButton, { borderColor: colors.border }]}
                  onPress={cancelRecording}
                >
                  <Ionicons name="trash-outline" size={24} color="#F44336" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.playButton,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                  onPress={playPreview}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={28}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={sendRecording}
                >
                  <Ionicons name="send" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Cancel button */}
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={cancelRecording}
          >
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
              Hủy
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    paddingTop: 12,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  duration: {
    fontSize: 36,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    marginBottom: 20,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    width: "100%",
    marginBottom: 24,
    gap: 2,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 4,
  },
  hint: {
    fontSize: 14,
  },
  controls: {
    marginBottom: 20,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  recordedControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    paddingVertical: 14,
    borderTopWidth: 1,
    width: "100%",
    marginTop: 10,
  },
  cancelText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default VoiceRecorder;
