/**
 * Enhanced Call Screen
 * Voice/Video calling with WebSocket signaling and LiveKit integration
 *
 * @created 19/01/2026
 */

import { useVoiceCall, CallState } from "@/hooks/useVoiceCall";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

type CallType = "audio" | "video";

interface CallerInfo {
  id: string;
  name: string;
  avatar?: string;
}

export default function EnhancedCallScreen() {
  const {
    userId,
    type: callTypeParam,
    isIncoming,
    callId: incomingCallId,
  } = useLocalSearchParams<{
    userId: string;
    type: CallType;
    isIncoming?: string;
    callId?: string;
  }>();

  const router = useRouter();
  const { user } = useAuth();

  // Call hook
  const {
    callState,
    currentCall,
    isMuted,
    isVideoEnabled,
    isSpeakerOn,
    error,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
  } = useVoiceCall({
    onCallEnded: () => {
      console.log("[EnhancedCall] Call ended, navigating back");
      setTimeout(() => router.back(), 1000);
    },
  });

  // Local UI state
  const [showControls, setShowControls] = useState(true);
  const [callerInfo, setCallerInfo] = useState<CallerInfo>({
    id: userId || "",
    name: `Người dùng ${userId || "Unknown"}`,
    avatar: undefined,
  });
  const callType: CallType = (callTypeParam as CallType) || "audio";

  // Animations
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const controlsOpacity = React.useRef(new Animated.Value(1)).current;

  // Start call when screen loads
  useEffect(() => {
    if (isIncoming === "true") {
      // Answer incoming call
      answerCall();
    } else if (userId) {
      // Initiate outgoing call
      initiateCall(parseInt(userId) || 0, callType);
    }
  }, [userId, callType, isIncoming]);

  // Pulse animation for calling state
  useEffect(() => {
    if (callState === "initiating" || callState === "ringing") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [callState]);

  // Auto-hide controls during connected call
  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;

    if (callState === "connected" && showControls) {
      hideTimer = setTimeout(() => {
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowControls(false));
      }, 5000);
    }

    return () => clearTimeout(hideTimer);
  }, [callState, showControls]);

  const toggleControlsVisibility = () => {
    if (callState !== "connected") return;

    if (showControls) {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
    } else {
      setShowControls(true);
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  // Get status text based on call state
  const getStatusText = (): string => {
    switch (callState) {
      case "idle":
        return "Chuẩn bị gọi...";
      case "initiating":
        return "Đang kết nối...";
      case "ringing":
        return "Đang đổ chuông...";
      case "connecting":
        return "Đang kết nối cuộc gọi...";
      case "connected":
        return formatDuration(currentCall?.duration || 0);
      case "ended":
        return "Cuộc gọi đã kết thúc";
      default:
        return "";
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    endCall();
    router.back();
  };

  const handleDeclineCall = () => {
    declineCall();
    router.back();
  };

  // Render avatar or video
  const renderMainView = () => {
    if (callType === "video" && callState === "connected") {
      // Video call - show remote video
      return (
        <View style={styles.videoContainer}>
          {/* Remote video would go here with RTCView/LiveKit */}
          <View style={styles.remoteVideo}>
            <Text style={styles.videoPlaceholder}>Remote Video</Text>
          </View>

          {/* Local video preview */}
          <View style={styles.localVideoPreview}>
            <Text style={styles.videoPlaceholder}>You</Text>
          </View>
        </View>
      );
    }

    // Audio call or waiting state - show avatar
    return (
      <View style={styles.avatarSection}>
        <Animated.View
          style={[styles.avatarWrapper, { transform: [{ scale: pulseAnim }] }]}
        >
          <View style={styles.avatarRing}>
            {callerInfo.avatar ? (
              <Image
                source={{ uri: callerInfo.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {callerInfo.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        <Text style={styles.callerName}>{callerInfo.name}</Text>
        <Text style={styles.statusText}>{getStatusText()}</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  // Render call controls
  const renderControls = () => {
    const isCallActive =
      callState === "connected" || callState === "connecting";
    const isRinging = callState === "ringing" && isIncoming === "true";

    if (isRinging) {
      // Incoming call controls
      return (
        <View style={styles.incomingControls}>
          <Pressable
            style={[styles.controlButton, styles.declineButton]}
            onPress={handleDeclineCall}
          >
            <Ionicons
              name="call"
              size={32}
              color="#fff"
              style={styles.declineIcon}
            />
          </Pressable>

          <Pressable
            style={[styles.controlButton, styles.acceptButton]}
            onPress={() => answerCall()}
          >
            <Ionicons name="call" size={32} color="#fff" />
          </Pressable>
        </View>
      );
    }

    // Active call controls
    return (
      <Animated.View
        style={[styles.controlsContainer, { opacity: controlsOpacity }]}
      >
        <View style={styles.controlsRow}>
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
              size={24}
              color={isMuted ? "#333" : "#fff"}
            />
            <Text
              style={[
                styles.controlLabel,
                isMuted && styles.controlLabelActive,
              ]}
            >
              {isMuted ? "Bật mic" : "Tắt mic"}
            </Text>
          </Pressable>

          {/* Video toggle (for video calls) */}
          {callType === "video" && (
            <Pressable
              style={[
                styles.controlButton,
                !isVideoEnabled && styles.controlButtonActive,
              ]}
              onPress={toggleVideo}
            >
              <Ionicons
                name={isVideoEnabled ? "videocam" : "videocam-off"}
                size={24}
                color={!isVideoEnabled ? "#333" : "#fff"}
              />
              <Text
                style={[
                  styles.controlLabel,
                  !isVideoEnabled && styles.controlLabelActive,
                ]}
              >
                {isVideoEnabled ? "Tắt cam" : "Bật cam"}
              </Text>
            </Pressable>
          )}

          {/* Speaker */}
          <Pressable
            style={[
              styles.controlButton,
              isSpeakerOn && styles.controlButtonActive,
            ]}
            onPress={toggleSpeaker}
          >
            <Ionicons
              name={isSpeakerOn ? "volume-high" : "volume-medium"}
              size={24}
              color={isSpeakerOn ? "#333" : "#fff"}
            />
            <Text
              style={[
                styles.controlLabel,
                isSpeakerOn && styles.controlLabelActive,
              ]}
            >
              {isSpeakerOn ? "Tắt loa" : "Loa ngoài"}
            </Text>
          </Pressable>
        </View>

        {/* End call button */}
        <Pressable
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCall}
        >
          <Ionicons
            name="call"
            size={32}
            color="#fff"
            style={styles.endCallIcon}
          />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Pressable style={styles.container} onPress={toggleControlsVisibility}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={
          callState === "connected" && callType === "video"
            ? ["transparent", "transparent"]
            : ["#1a1a2e", "#16213e", "#0f3460"]
        }
        style={StyleSheet.absoluteFill}
      />

      {/* Back button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </Pressable>

      {/* Call type badge */}
      <View style={styles.callTypeBadge}>
        <Ionicons
          name={callType === "video" ? "videocam" : "call"}
          size={16}
          color="#fff"
        />
        <Text style={styles.callTypeText}>
          {callType === "video" ? "Video Call" : "Voice Call"}
        </Text>
      </View>

      {/* Main content */}
      {renderMainView()}

      {/* Controls */}
      {renderControls()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  callTypeBadge: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
  },
  callTypeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  avatarSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  avatarWrapper: {
    marginBottom: 24,
  },
  avatarRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: "#4A90D9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 56,
    fontWeight: "700",
    color: "#fff",
  },
  callerName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
  errorText: {
    fontSize: 14,
    color: "#F44336",
    marginTop: 12,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  localVideoPreview: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 80,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  videoPlaceholder: {
    color: "#fff",
    fontSize: 12,
  },
  controlsContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginBottom: 30,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  controlButtonActive: {
    backgroundColor: "#fff",
  },
  controlLabel: {
    color: "#fff",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  controlLabelActive: {
    color: "#333",
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F44336",
  },
  endCallIcon: {
    transform: [{ rotate: "135deg" }],
  },
  incomingControls: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 80 : 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 60,
  },
  declineButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F44336",
  },
  declineIcon: {
    transform: [{ rotate: "135deg" }],
  },
  acceptButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4CAF50",
  },
});
