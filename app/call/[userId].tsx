/**
 * Voice/Video Call Screen
 * Real-time audio/video calling with Zalo-style UI
 *
 * Call Flow:
 * 1. checking - Kiểm tra trạng thái người dùng
 * 2. offline - Người dùng offline, không thể kết nối
 * 3. ringing - Đang đổ chuông chờ trả lời
 * 4. no_answer - Không trả lời sau timeout
 * 5. busy - Người dùng đang bận
 * 6. connected - Cuộc gọi đã kết nối
 * 7. ended - Cuộc gọi kết thúc
 *
 * Updated: 03/02/2026
 */

import { CallHeader } from "@/components/navigation/CallHeader";
import Avatar from "@/components/ui/avatar";
import { canReceiveCalls, getUserById, type DemoUser } from "@/data/demoUsers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    Vibration,
    View,
} from "react-native";

import {
    notifyCallEnded,
    notifyCallStarted,
    notifyIncomingCall,
} from "@/services/call-notification";

const { width, height } = Dimensions.get("window");

type CallTypeParam = "audio" | "video" | "voice";
type CallStatus =
  | "checking"
  | "offline"
  | "ringing"
  | "no_answer"
  | "busy"
  | "connected"
  | "ended";

// Timeout constants
const RING_TIMEOUT = 30000; // 30 giây đổ chuông
const CHECK_TIMEOUT = 2000; // 2 giây kiểm tra

export default function CallScreen() {
  const {
    userId,
    type: callType,
    isIncoming,
  } = useLocalSearchParams<{
    userId: string;
    type: CallTypeParam;
    isIncoming?: string;
  }>();
  const router = useRouter();

  // Normalize call type (voice -> audio)
  const normalizedCallType =
    callType === "voice" ? "audio" : callType || "audio";

  const [status, setStatus] = useState<CallStatus>("checking");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(normalizedCallType === "video");
  const [ringTime, setRingTime] = useState(0);

  // Refs for timers
  const ringTimerRef = useRef<NodeJS.Timeout>();
  const ringCounterRef = useRef<NodeJS.Timeout>();

  // Get user info
  const userInfo: DemoUser | undefined = getUserById(Number(userId));
  const callerName = userInfo?.name || `Người dùng ${userId}`;

  // Gửi notification khi có cuộc gọi đến
  useEffect(() => {
    if (isIncoming === "true") {
      notifyIncomingCall(userId, callerName, normalizedCallType).catch(
        console.error,
      );
      // Đổ chuông cho cuộc gọi đến
      setStatus("ringing");
      Vibration.vibrate([500, 500, 500, 500], true);
    }

    return () => {
      Vibration.cancel();
    };
  }, []);

  // Kiểm tra trạng thái người dùng trước khi gọi
  useEffect(() => {
    if (isIncoming === "true") return; // Bỏ qua nếu là cuộc gọi đến

    const checkUserStatus = async () => {
      // Kiểm tra xem người dùng có online không
      const callCheck = canReceiveCalls(Number(userId));

      await new Promise((resolve) => setTimeout(resolve, CHECK_TIMEOUT));

      if (!callCheck.canCall) {
        // Người dùng offline hoặc bận
        if (callCheck.reason?.includes("offline")) {
          setStatus("offline");
        } else if (
          callCheck.reason?.includes("bận") ||
          callCheck.reason?.includes("cuộc gọi khác")
        ) {
          setStatus("busy");
        } else {
          setStatus("offline");
        }
      } else {
        // Bắt đầu đổ chuông
        setStatus("ringing");
        startRinging();
      }
    };

    checkUserStatus();

    return () => {
      if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
      if (ringCounterRef.current) clearInterval(ringCounterRef.current);
    };
  }, [userId, isIncoming]);

  // Bắt đầu đổ chuông
  const startRinging = useCallback(() => {
    setRingTime(0);

    // Đếm thời gian đổ chuông
    ringCounterRef.current = setInterval(() => {
      setRingTime((prev) => prev + 1);
    }, 1000);

    // Timeout nếu không trả lời
    ringTimerRef.current = setTimeout(() => {
      if (ringCounterRef.current) clearInterval(ringCounterRef.current);
      setStatus("no_answer");
    }, RING_TIMEOUT);

    // Giả lập: 50% cơ hội được trả lời sau 5-15 giây
    const answerDelay = 5000 + Math.random() * 10000;
    const willAnswer = Math.random() > 0.3; // 70% cơ hội trả lời

    if (willAnswer) {
      setTimeout(() => {
        if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
        if (ringCounterRef.current) clearInterval(ringCounterRef.current);
        handleCallConnected();
      }, answerDelay);
    }
  }, []);

  // Khi cuộc gọi được kết nối
  const handleCallConnected = useCallback(() => {
    setStatus("connected");
    Vibration.cancel();

    // Gửi notification khi cuộc gọi bắt đầu
    notifyCallStarted(userId, callerName, normalizedCallType).catch(
      console.error,
    );
  }, [userId, callerName, normalizedCallType]);

  // Đếm thời gian cuộc gọi
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (status === "connected") {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get background color based on status
  const getBackgroundStyle = useCallback(() => {
    switch (status) {
      case "checking":
        return { backgroundColor: "#4A5568" }; // Gray
      case "offline":
        return { backgroundColor: "#E53E3E" }; // Red
      case "busy":
        return { backgroundColor: "#DD6B20" }; // Orange
      case "ringing":
        return { backgroundColor: "#3182CE" }; // Blue
      case "no_answer":
        return { backgroundColor: "#805AD5" }; // Purple
      case "connected":
        return { backgroundColor: "#22C55E" }; // Green
      case "ended":
        return { backgroundColor: "#718096" }; // Gray
      default:
        return { backgroundColor: "#22C55E" };
    }
  }, [status]);

  // Người nhận cuộc gọi ấn trả lời
  const handleAnswerCall = useCallback(() => {
    Vibration.cancel();
    handleCallConnected();
  }, [handleCallConnected]);

  // Từ chối cuộc gọi
  const handleDeclineCall = useCallback(() => {
    Vibration.cancel();
    setStatus("ended");
    setTimeout(() => router.back(), 500);
  }, [router]);

  // Gọi lại
  const handleRetry = useCallback(() => {
    setStatus("checking");
    setRingTime(0);

    // Kiểm tra lại trạng thái
    setTimeout(() => {
      const callCheck = canReceiveCalls(Number(userId));
      if (!callCheck.canCall) {
        setStatus("offline");
      } else {
        setStatus("ringing");
        startRinging();
      }
    }, CHECK_TIMEOUT);
  }, [userId, startRinging]);

  const handleEndCall = () => {
    setStatus("ended");
    Vibration.cancel();
    if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
    if (ringCounterRef.current) clearInterval(ringCounterRef.current);

    // Gửi notification khi cuộc gọi kết thúc
    notifyCallEnded(userId, callerName, normalizedCallType).catch(
      console.error,
    );

    setTimeout(() => router.back(), 500);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleSpeaker = () => {
    setIsSpeaker(!isSpeaker);
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Call Header */}
      <CallHeader
        callerName={callerName}
        userId={userId}
        callType={normalizedCallType === "video" ? "video" : "voice"}
        status={status}
        duration={duration}
        onBackPress={() => router.back()}
      />

      {/* Video View */}
      {normalizedCallType === "video" && isVideoOn ? (
        <>
          {/* Remote Video (Full Screen) */}
          <View style={styles.remoteVideo}>
            <View
              style={[styles.videoPlaceholder, { backgroundColor: "#1a1a1a" }]}
            >
              <Ionicons name="videocam-off" size={48} color="#666" />
              <Text style={styles.placeholderText}>Đang kết nối video...</Text>
            </View>
          </View>

          {/* Local Video (PiP) */}
          <View style={[styles.localVideo, { backgroundColor: "#1a1a1a" }]}>
            <View
              style={[styles.videoPlaceholder, { backgroundColor: "#2a2a2a" }]}
            >
              <Ionicons name="person" size={32} color="#888" />
            </View>
          </View>
        </>
      ) : (
        /* Audio Only View */
        <View style={[styles.audioView, getBackgroundStyle()]}>
          <View style={styles.avatarContainer}>
            <Avatar
              avatar={userInfo?.avatar || null}
              userId={userId || "0"}
              name={callerName}
              pixelSize={140}
              showBadge={false}
            />
          </View>

          <Text style={styles.callerName}>{callerName}</Text>
          {userInfo?.title && (
            <Text style={styles.userTitle}>{userInfo.title}</Text>
          )}

          {/* Status Messages */}
          {status === "checking" && (
            <Text style={styles.statusText}>Đang kiểm tra kết nối...</Text>
          )}

          {status === "offline" && (
            <View style={styles.offlineContainer}>
              <Ionicons name="cloud-offline" size={32} color="#fff" />
              <Text style={styles.offlineText}>Người dùng đang offline</Text>
              <Text style={styles.offlineSubtext}>
                Không thể kết nối cuộc gọi
              </Text>
            </View>
          )}

          {status === "busy" && (
            <View style={styles.offlineContainer}>
              <Ionicons name="call" size={32} color="#fff" />
              <Text style={styles.offlineText}>Người dùng đang bận</Text>
              <Text style={styles.offlineSubtext}>Vui lòng thử lại sau</Text>
            </View>
          )}

          {status === "ringing" && (
            <View style={styles.ringingContainer}>
              <Text style={styles.statusText}>Đang đổ chuông...</Text>
              <Text style={styles.ringTimeText}>
                {formatDuration(ringTime)}
              </Text>
            </View>
          )}

          {status === "no_answer" && (
            <View style={styles.offlineContainer}>
              <Ionicons name="call-outline" size={32} color="#fff" />
              <Text style={styles.offlineText}>Không trả lời</Text>
              <Text style={styles.offlineSubtext}>
                Người dùng không nhấc máy
              </Text>
            </View>
          )}

          {status === "connected" && (
            <Text style={styles.durationText}>{formatDuration(duration)}</Text>
          )}

          {status === "ended" && (
            <Text style={styles.statusText}>Cuộc gọi kết thúc</Text>
          )}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {/* Incoming Call Controls */}
        {isIncoming === "true" && status === "ringing" && (
          <View style={styles.incomingControlsRow}>
            {/* Decline */}
            <Pressable
              style={[styles.controlButton, styles.declineButton]}
              onPress={handleDeclineCall}
            >
              <Ionicons name="close" size={32} color="#fff" />
              <Text style={styles.controlLabel}>Từ chối</Text>
            </Pressable>

            {/* Answer */}
            <Pressable
              style={[styles.controlButton, styles.answerButton]}
              onPress={handleAnswerCall}
            >
              <Ionicons name="call" size={32} color="#fff" />
              <Text style={styles.controlLabel}>Trả lời</Text>
            </Pressable>
          </View>
        )}

        {/* Outgoing Call - Ringing/Checking */}
        {isIncoming !== "true" &&
          (status === "ringing" || status === "checking") && (
            <View style={styles.controlsRow}>
              <Pressable
                style={[styles.controlButton, styles.endCallButton]}
                onPress={handleEndCall}
              >
                <Ionicons name="call" size={28} color="#fff" />
              </Pressable>
            </View>
          )}

        {/* Offline/Busy/No Answer - Show retry and back */}
        {(status === "offline" ||
          status === "busy" ||
          status === "no_answer") && (
          <View style={styles.controlsRow}>
            <Pressable
              style={[styles.controlButton, { backgroundColor: "#3182CE" }]}
              onPress={handleRetry}
            >
              <Ionicons name="refresh" size={28} color="#fff" />
            </Pressable>

            <Pressable
              style={[styles.controlButton, styles.endCallButton]}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* Connected - Full controls */}
        {status === "connected" && (
          <View style={styles.controlsRow}>
            {/* Mute */}
            <Pressable
              style={[
                styles.controlButton,
                isMuted && styles.controlButtonActive,
              ]}
              onPress={handleToggleMute}
            >
              <Ionicons
                name={isMuted ? "mic-off" : "mic"}
                size={28}
                color={isMuted ? "#fff" : "#333"}
              />
            </Pressable>

            {/* Video Toggle (only for video calls) */}
            {normalizedCallType === "video" && (
              <Pressable
                style={[
                  styles.controlButton,
                  !isVideoOn && styles.controlButtonActive,
                ]}
                onPress={handleToggleVideo}
              >
                <Ionicons
                  name={isVideoOn ? "videocam" : "videocam-off"}
                  size={28}
                  color={isVideoOn ? "#333" : "#fff"}
                />
              </Pressable>
            )}

            {/* Speaker */}
            <Pressable
              style={[
                styles.controlButton,
                isSpeaker && styles.controlButtonActive,
              ]}
              onPress={handleToggleSpeaker}
            >
              <Ionicons
                name={isSpeaker ? "volume-high" : "volume-medium"}
                size={28}
                color={isSpeaker ? "#fff" : "#333"}
              />
            </Pressable>

            {/* End Call */}
            <Pressable
              style={[styles.controlButton, styles.endCallButton]}
              onPress={handleEndCall}
            >
              <Ionicons name="call" size={28} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* Info Row */}
        <View style={styles.infoRow}>
          <Ionicons
            name={normalizedCallType === "video" ? "videocam" : "call"}
            size={16}
            color="#fff"
          />
          <Text style={styles.infoText}>
            {status === "checking" && "Đang kiểm tra..."}
            {status === "offline" && "Không thể kết nối"}
            {status === "busy" && "Người dùng bận"}
            {status === "ringing" && "Đang đổ chuông"}
            {status === "no_answer" && "Không trả lời"}
            {status === "connected" && "Đã kết nối"}
            {status === "ended" && "Đã kết thúc"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  remoteVideo: {
    flex: 1,
  },
  localVideo: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#888",
    fontSize: 14,
    marginTop: 12,
  },
  audioView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#22C55E",
  },
  avatarContainer: {
    marginBottom: 32,
  },
  callerName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  userTitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.7,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
  },
  durationText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },

  // Offline/Error states
  offlineContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  offlineText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginTop: 12,
  },
  offlineSubtext: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.7,
    marginTop: 4,
  },

  // Ringing state
  ringingContainer: {
    alignItems: "center",
  },
  ringTimeText: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.6,
    marginTop: 8,
  },

  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  incomingControlsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonActive: {
    backgroundColor: "#555",
  },
  controlLabel: {
    fontSize: 12,
    color: "#fff",
    marginTop: 8,
    position: "absolute",
    bottom: -24,
  },
  endCallButton: {
    backgroundColor: "#E53E3E",
    transform: [{ rotate: "135deg" }],
  },
  declineButton: {
    backgroundColor: "#E53E3E",
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  answerButton: {
    backgroundColor: "#22C55E",
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.7,
  },
});
