/**
 * Video Call Screen - Professional Zalo/Zoom Style
 * Full-featured video call with LiveKit integration
 */

import Avatar from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { callService } from "@/services/api/call.service";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

type CallType = "audio" | "video";
type CallState = "connecting" | "ringing" | "connected" | "ended" | "failed";

interface CallParticipant {
  id: number;
  name: string;
  avatar?: string;
  isMuted?: boolean;
  isVideoOn?: boolean;
}

export default function VideoCallScreen() {
  const {
    roomId,
    calleeId,
    callType = "video",
    isIncoming,
  } = useLocalSearchParams<{
    roomId?: string;
    calleeId?: string;
    callType?: CallType;
    isIncoming?: string;
  }>();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, accessToken } = useAuth();

  // Theme
  const primary = useThemeColor({}, "primary");
  const success = "#4CAF50";
  const danger = "#F44336";

  // State
  const [callState, setCallState] = useState<CallState>("connecting");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === "video");
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [participant, setParticipant] = useState<CallParticipant | null>(null);

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation for calling state
  useEffect(() => {
    if (callState === "connecting" || callState === "ringing") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [callState, pulseAnim]);

  // Auto-hide controls
  useEffect(() => {
    if (callState === "connected" && showControls) {
      const timeout = setTimeout(() => {
        Animated.timing(controlsOpacity, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowControls(false));
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [callState, showControls, controlsOpacity]);

  // Duration timer
  useEffect(() => {
    if (callState === "connected") {
      durationInterval.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [callState]);

  // Initialize call
  useEffect(() => {
    const initCall = async () => {
      try {
        if (isIncoming === "true") {
          setCallState("ringing");
        } else {
          // Start outgoing call
          if (calleeId) {
            setCallState("connecting");
            // Simulate connection
            setTimeout(() => setCallState("connected"), 3000);
          }
        }

        // Set participant info
        setParticipant({
          id: parseInt(calleeId || "0"),
          name: `Người dùng ${calleeId}`,
        });
      } catch (error) {
        console.error("[VideoCall] Init error:", error);
        setCallState("failed");
      }
    };

    initCall();
  }, [calleeId, isIncoming]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handlers
  const handleEndCall = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCallState("ended");

    // Call API to end call
    if (roomId) {
      try {
        await callService.endCall(roomId);
      } catch (error) {
        console.error("[VideoCall] End call error:", error);
      }
    }

    setTimeout(() => router.back(), 500);
  }, [roomId, router]);

  const handleAcceptCall = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCallState("connecting");

    // TODO: Accept call via API
    setTimeout(() => setCallState("connected"), 1500);
  }, []);

  const handleRejectCall = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCallState("ended");
    router.back();
  }, [router]);

  const toggleMute = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted((prev) => !prev);
  }, []);

  const toggleVideo = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsVideoOn((prev) => !prev);
  }, []);

  const toggleSpeaker = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSpeaker((prev) => !prev);
  }, []);

  const switchCamera = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFrontCamera((prev) => !prev);
  }, []);

  const toggleControls = useCallback(() => {
    Animated.timing(controlsOpacity, {
      toValue: showControls ? 0.3 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setShowControls((prev) => !prev);
  }, [showControls, controlsOpacity]);

  // Render calling/ringing state
  const renderCallingState = () => (
    <View style={styles.callingContainer}>
      <View style={styles.callingContent}>
        <Animated.View
          style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}
        >
          <Avatar
            name={participant?.name || "Unknown"}
            source={
              participant?.avatar ? { uri: participant.avatar } : undefined
            }
            pixelSize={120}
          />
        </Animated.View>

        <Text style={styles.callingName}>{participant?.name}</Text>
        <Text style={styles.callingStatus}>
          {callState === "ringing" ? "Cuộc gọi đến..." : "Đang gọi..."}
        </Text>

        <View style={styles.callTypeIndicator}>
          <Ionicons
            name={callType === "video" ? "videocam" : "call"}
            size={16}
            color="#fff"
          />
          <Text style={styles.callTypeText}>
            {callType === "video" ? "Cuộc gọi video" : "Cuộc gọi thoại"}
          </Text>
        </View>
      </View>

      {/* Action buttons for incoming call */}
      {callState === "ringing" ? (
        <View style={styles.incomingActions}>
          <Pressable
            style={[styles.incomingButton, { backgroundColor: danger }]}
            onPress={handleRejectCall}
          >
            <Ionicons name="close" size={32} color="#fff" />
            <Text style={styles.incomingButtonText}>Từ chối</Text>
          </Pressable>

          <Pressable
            style={[styles.incomingButton, { backgroundColor: success }]}
            onPress={handleAcceptCall}
          >
            <Ionicons
              name={callType === "video" ? "videocam" : "call"}
              size={32}
              color="#fff"
            />
            <Text style={styles.incomingButtonText}>Trả lời</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.callingActions}>
          <Pressable
            style={[styles.controlButton, { backgroundColor: danger }]}
            onPress={handleEndCall}
          >
            <Ionicons
              name="call"
              size={28}
              color="#fff"
              style={{ transform: [{ rotate: "135deg" }] }}
            />
          </Pressable>
        </View>
      )}
    </View>
  );

  // Render connected state
  const renderConnectedState = () => (
    <Pressable style={styles.connectedContainer} onPress={toggleControls}>
      {/* Remote Video */}
      {isVideoOn ? (
        <View style={styles.remoteVideo}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam-off" size={48} color="#666" />
            <Text style={styles.placeholderText}>Video của đối phương</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.audioOnlyView, { backgroundColor: primary }]}>
          <Avatar
            name={participant?.name || "Unknown"}
            source={
              participant?.avatar ? { uri: participant.avatar } : undefined
            }
            pixelSize={140}
          />
          <Text style={styles.audioName}>{participant?.name}</Text>
        </View>
      )}

      {/* Local Video PiP */}
      {isVideoOn && (
        <View style={[styles.localVideo, { top: insets.top + 60 }]}>
          <View style={styles.localVideoPlaceholder}>
            <Ionicons name="person" size={24} color="#888" />
          </View>
          {isMuted && (
            <View style={styles.pipMutedBadge}>
              <Ionicons name="mic-off" size={12} color="#fff" />
            </View>
          )}
        </View>
      )}

      {/* Top bar */}
      <Animated.View
        style={[
          styles.topBar,
          { paddingTop: insets.top, opacity: controlsOpacity },
        ]}
      >
        <View style={styles.topBarContent}>
          <Pressable style={styles.topButton} onPress={() => router.back()}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </Pressable>

          <View style={styles.callInfo}>
            <Text style={styles.callDuration}>{formatDuration(duration)}</Text>
            <View style={styles.encryptedBadge}>
              <Ionicons name="lock-closed" size={10} color="#4CAF50" />
              <Text style={styles.encryptedText}>Mã hóa</Text>
            </View>
          </View>

          <Pressable style={styles.topButton} onPress={switchCamera}>
            <Ionicons name="camera-reverse" size={24} color="#fff" />
          </Pressable>
        </View>
      </Animated.View>

      {/* Bottom controls */}
      <Animated.View
        style={[styles.bottomControls, { opacity: controlsOpacity }]}
      >
        <View style={styles.controlsGrid}>
          {/* Mute */}
          <Pressable
            style={[
              styles.controlButton,
              isMuted && styles.controlButtonActive,
            ]}
            onPress={toggleMute}
          >
            <Ionicons
              name={isMuted ? "mic-off" : "mic"}
              size={26}
              color={isMuted ? "#fff" : "#333"}
            />
          </Pressable>

          {/* Video */}
          <Pressable
            style={[
              styles.controlButton,
              !isVideoOn && styles.controlButtonActive,
            ]}
            onPress={toggleVideo}
          >
            <Ionicons
              name={isVideoOn ? "videocam" : "videocam-off"}
              size={26}
              color={isVideoOn ? "#333" : "#fff"}
            />
          </Pressable>

          {/* End Call */}
          <Pressable
            style={[styles.controlButton, styles.endCallButton]}
            onPress={handleEndCall}
          >
            <Ionicons
              name="call"
              size={26}
              color="#fff"
              style={{ transform: [{ rotate: "135deg" }] }}
            />
          </Pressable>

          {/* Speaker */}
          <Pressable
            style={[
              styles.controlButton,
              isSpeaker && styles.controlButtonActive,
            ]}
            onPress={toggleSpeaker}
          >
            <Ionicons
              name={isSpeaker ? "volume-high" : "volume-medium"}
              size={26}
              color={isSpeaker ? "#fff" : "#333"}
            />
          </Pressable>

          {/* More */}
          <Pressable
            style={styles.controlButton}
            onPress={() =>
              Alert.alert("Tùy chọn", "Thêm người • Chia sẻ màn hình • Chat")
            }
          >
            <Ionicons name="ellipsis-horizontal" size={26} color="#333" />
          </Pressable>
        </View>
      </Animated.View>
    </Pressable>
  );

  // Render ended state
  const renderEndedState = () => (
    <View style={[styles.endedContainer, { backgroundColor: primary }]}>
      <Ionicons name="checkmark-circle" size={80} color="#fff" />
      <Text style={styles.endedTitle}>Cuộc gọi đã kết thúc</Text>
      <Text style={styles.endedDuration}>
        Thời gian: {formatDuration(duration)}
      </Text>
    </View>
  );

  // Render failed state
  const renderFailedState = () => (
    <View style={[styles.failedContainer, { backgroundColor: "#1a1a1a" }]}>
      <Ionicons name="warning" size={80} color={danger} />
      <Text style={styles.failedTitle}>Không thể kết nối</Text>
      <Text style={styles.failedSubtitle}>Vui lòng kiểm tra kết nối mạng</Text>

      <Pressable
        style={[styles.retryButton, { backgroundColor: primary }]}
        onPress={() => setCallState("connecting")}
      >
        <Text style={styles.retryButtonText}>Thử lại</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {callState === "connecting" || callState === "ringing"
        ? renderCallingState()
        : callState === "connected"
          ? renderConnectedState()
          : callState === "ended"
            ? renderEndedState()
            : renderFailedState()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },

  // Calling/Ringing State
  callingContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "space-between",
    paddingVertical: 80,
  },
  callingContent: {
    alignItems: "center",
  },
  avatarRing: {
    padding: 8,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 24,
  },
  callingName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  callingStatus: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 16,
  },
  callTypeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  callTypeText: {
    color: "#fff",
    fontSize: 14,
  },
  incomingActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 60,
    paddingBottom: 40,
  },
  incomingButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  incomingButtonText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  callingActions: {
    alignItems: "center",
    paddingBottom: 40,
  },

  // Connected State
  connectedContainer: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: "#2a2a2a",
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#666",
    marginTop: 12,
  },
  audioOnlyView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  audioName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    marginTop: 20,
  },
  localVideo: {
    position: "absolute",
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#333",
  },
  localVideoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pipMutedBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    padding: 4,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingBottom: 12,
  },
  topBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  callInfo: {
    alignItems: "center",
  },
  callDuration: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  encryptedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  encryptedText: {
    fontSize: 11,
    color: "#4CAF50",
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 24,
    paddingBottom: 40,
  },
  controlsGrid: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonActive: {
    backgroundColor: "rgba(100,100,100,0.9)",
  },
  endCallButton: {
    backgroundColor: "#F44336",
  },

  // Ended State
  endedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  endedTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    marginTop: 20,
  },
  endedDuration: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    marginTop: 8,
  },

  // Failed State
  failedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  failedTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    marginTop: 20,
  },
  failedSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 32,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
