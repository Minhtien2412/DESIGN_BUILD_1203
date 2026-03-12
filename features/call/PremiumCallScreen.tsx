/**
 * Premium Call Screen - European Design with AI Ringtones
 * Features: AI-generated hold music, Custom ringtones, Animated UI
 * Updated: 24/01/2026
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { setAudioModeAsync } from "expo-audio";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ==================== TYPES ====================
export type CallState =
  | "idle"
  | "ringing"
  | "connecting"
  | "connected"
  | "ended"
  | "declined";
export type CallType = "voice" | "video";

export interface CallUser {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  isOnline?: boolean;
}

export interface RingtoneOption {
  id: string;
  name: string;
  file: string;
  isAI?: boolean;
  icon: string;
  color: string;
}

export interface HoldMusicOption {
  id: string;
  name: string;
  file: string;
  isAI?: boolean;
  mood: string;
  icon: string;
}

// ==================== RINGTONE & MUSIC OPTIONS ====================
const RINGTONE_OPTIONS: RingtoneOption[] = [
  {
    id: "classic",
    name: "Cổ điển",
    file: "ringtone_classic.mp3",
    icon: "musical-notes",
    color: "#0D9488",
  },
  {
    id: "modern",
    name: "Hiện đại",
    file: "ringtone_modern.mp3",
    icon: "pulse",
    color: "#8B5CF6",
  },
  {
    id: "soft",
    name: "Nhẹ nhàng",
    file: "ringtone_soft.mp3",
    icon: "leaf",
    color: "#10B981",
  },
  {
    id: "ai_calm",
    name: "AI Bình yên",
    file: "ai_ringtone_calm.mp3",
    isAI: true,
    icon: "sparkles",
    color: "#EC4899",
  },
  {
    id: "ai_energy",
    name: "AI Năng động",
    file: "ai_ringtone_energy.mp3",
    isAI: true,
    icon: "flash",
    color: "#F59E0B",
  },
  {
    id: "ai_nature",
    name: "AI Thiên nhiên",
    file: "ai_ringtone_nature.mp3",
    isAI: true,
    icon: "earth",
    color: "#14B8A6",
  },
];

const HOLD_MUSIC_OPTIONS: HoldMusicOption[] = [
  {
    id: "jazz",
    name: "Jazz",
    file: "hold_jazz.mp3",
    mood: "Thư giãn",
    icon: "musical-note",
  },
  {
    id: "classical",
    name: "Cổ điển",
    file: "hold_classical.mp3",
    mood: "Thanh lịch",
    icon: "piano",
  },
  {
    id: "lofi",
    name: "Lo-Fi",
    file: "hold_lofi.mp3",
    mood: "Tập trung",
    icon: "headset",
  },
  {
    id: "ai_adaptive",
    name: "AI Thích ứng",
    file: "ai_hold_adaptive.mp3",
    isAI: true,
    mood: "Tự động",
    icon: "sparkles",
  },
  {
    id: "ai_mood",
    name: "AI Cảm xúc",
    file: "ai_hold_mood.mp3",
    isAI: true,
    mood: "Theo tâm trạng",
    icon: "heart",
  },
];

// ==================== COMPONENTS ====================

// Animated Wave Background
const WaveBackground = React.memo(({ isActive }: { isActive: boolean }) => {
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      const createWaveAnimation = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        );

      const animations = [
        createWaveAnimation(wave1Anim, 0),
        createWaveAnimation(wave2Anim, 400),
        createWaveAnimation(wave3Anim, 800),
      ];

      animations.forEach((a) => a.start());
      return () => animations.forEach((a) => a.stop());
    }
  }, [isActive]);

  const createWaveStyle = (anim: Animated.Value) => ({
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2.5],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.6, 0.3, 0],
    }),
  });

  return (
    <View style={styles.waveContainer}>
      <Animated.View style={[styles.wave, createWaveStyle(wave1Anim)]} />
      <Animated.View style={[styles.wave, createWaveStyle(wave2Anim)]} />
      <Animated.View style={[styles.wave, createWaveStyle(wave3Anim)]} />
    </View>
  );
});

// Pulsing Avatar
const PulsingAvatar = React.memo(
  ({
    user,
    isRinging,
    size = 140,
  }: {
    user: CallUser;
    isRinging: boolean;
    size?: number;
  }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (isRinging) {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: 1.08,
                duration: 600,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 600,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(glowAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.timing(glowAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ).start();
      }
    }, [isRinging]);

    const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    });

    return (
      <View
        style={[styles.avatarWrapper, { width: size + 40, height: size + 40 }]}
      >
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.avatarGlow,
            {
              width: size + 40,
              height: size + 40,
              borderRadius: (size + 40) / 2,
              opacity: glowOpacity,
            },
          ]}
        />

        {/* Avatar */}
        <Animated.View
          style={[
            styles.avatarContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <LinearGradient
              colors={["#667EEA", "#764BA2"]}
              style={styles.avatarPlaceholder}
            >
              <Text style={[styles.avatarText, { fontSize: size / 3 }]}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          )}
        </Animated.View>

        {/* Online indicator */}
        {user.isOnline && (
          <View style={[styles.onlineIndicator, { right: 10, bottom: 10 }]} />
        )}
      </View>
    );
  },
);

// Control Button
const ControlButton = React.memo(
  ({
    icon,
    label,
    onPress,
    variant = "default",
    size = 60,
    disabled = false,
  }: {
    icon: string;
    label?: string;
    onPress: () => void;
    variant?: "default" | "primary" | "danger" | "success" | "active";
    size?: number;
    disabled?: boolean;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      if (!disabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
        }).start();
      }
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    const getBackgroundColor = (): readonly [string, string] => {
      switch (variant) {
        case "primary":
          return ["#667EEA", "#764BA2"] as const;
        case "danger":
          return ["#EF4444", "#DC2626"] as const;
        case "success":
          return ["#10B981", "#059669"] as const;
        case "active":
          return ["#6B7280", "#4B5563"] as const;
        default:
          return ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"] as const;
      }
    };

    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View
          style={[styles.controlWrapper, { transform: [{ scale: scaleAnim }] }]}
        >
          <LinearGradient
            colors={getBackgroundColor()}
            style={[
              styles.controlButton,
              { width: size, height: size, borderRadius: size / 2 },
              disabled && styles.controlDisabled,
            ]}
          >
            <Ionicons name={icon as any} size={size * 0.45} color="#fff" />
          </LinearGradient>
          {label && <Text style={styles.controlLabel}>{label}</Text>}
        </Animated.View>
      </Pressable>
    );
  },
);

// Call Timer
const CallTimer = React.memo(({ startTime }: { startTime: number }) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.timerContainer}>
      <View style={styles.timerDot} />
      <Text style={styles.timerText}>{formatDuration(duration)}</Text>
    </View>
  );
});

// Sound Visualizer
const SoundVisualizer = React.memo(({ isActive }: { isActive: boolean }) => {
  // Initialize refs individually to comply with hooks rules
  const bar0 = useRef(new Animated.Value(0.3)).current;
  const bar1 = useRef(new Animated.Value(0.3)).current;
  const bar2 = useRef(new Animated.Value(0.3)).current;
  const bar3 = useRef(new Animated.Value(0.3)).current;
  const bar4 = useRef(new Animated.Value(0.3)).current;
  const bars = [bar0, bar1, bar2, bar3, bar4];

  useEffect(() => {
    if (isActive) {
      const animations = bars.map((bar, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 100),
            Animated.timing(bar, {
              toValue: Math.random() * 0.7 + 0.3,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(bar, {
              toValue: 0.3,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
        ),
      );

      animations.forEach((a) => a.start());
      return () => animations.forEach((a) => a.stop());
    }
  }, [isActive]);

  return (
    <View style={styles.visualizer}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[styles.visualizerBar, { transform: [{ scaleY: bar }] }]}
        />
      ))}
    </View>
  );
});

// ==================== MAIN COMPONENT ====================
interface PremiumCallScreenProps {
  user: CallUser;
  callType: CallType;
  isIncoming?: boolean;
  onAnswer?: () => void;
  onDecline?: () => void;
  onEndCall?: () => void;
}

export default function PremiumCallScreen({
  user,
  callType,
  isIncoming = false,
  onAnswer,
  onDecline,
  onEndCall,
}: PremiumCallScreenProps) {
  const [callState, setCallState] = useState<CallState>(
    isIncoming ? "ringing" : "connecting",
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === "video");
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [selectedRingtone, setSelectedRingtone] = useState(RINGTONE_OPTIONS[0]);
  const [selectedHoldMusic, setSelectedHoldMusic] = useState(
    HOLD_MUSIC_OPTIONS[0],
  );

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Animations
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Audio setup
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: "duckOthers",
        });
      } catch (error) {
        console.error("Audio setup error:", error);
      }
    };

    setupAudio();
  }, []);

  // Simulate call connection
  useEffect(() => {
    if (!isIncoming && callState === "connecting") {
      const timeout = setTimeout(() => {
        setCallState("connected");
        setCallStartTime(Date.now());
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [callState, isIncoming]);

  // Handlers
  const handleAnswer = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCallState("connected");
    setCallStartTime(Date.now());
    onAnswer?.();
  }, [onAnswer]);

  const handleDecline = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCallState("declined");
    onDecline?.();
    setTimeout(() => router.back(), 500);
  }, [onDecline]);

  const handleEndCall = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCallState("ended");
    onEndCall?.();
    setTimeout(() => router.back(), 500);
  }, [onEndCall]);

  const handleToggleMute = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted((prev) => !prev);
  }, []);

  const handleToggleSpeaker = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSpeakerOn((prev) => !prev);
  }, []);

  const handleToggleVideo = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsVideoEnabled((prev) => !prev);
  }, []);

  // Get status text
  const getStatusText = () => {
    switch (callState) {
      case "ringing":
        return isIncoming
          ? `${callType === "video" ? "📹 Cuộc gọi video" : "📞 Cuộc gọi thoại"} đến...`
          : "Đang đổ chuông...";
      case "connecting":
        return "Đang kết nối...";
      case "connected":
        return callType === "video" ? "📹 Cuộc gọi video" : "📞 Cuộc gọi thoại";
      case "ended":
        return "Cuộc gọi đã kết thúc";
      case "declined":
        return "Đã từ chối cuộc gọi";
      default:
        return "";
    }
  };

  // Render incoming call UI
  const renderIncomingCall = () => (
    <View style={styles.incomingContainer}>
      {/* Waves */}
      <WaveBackground isActive={true} />

      {/* Avatar */}
      <PulsingAvatar user={user} isRinging={true} />

      {/* Info */}
      <Text style={styles.callerName}>{user.name}</Text>
      {user.phone && <Text style={styles.callerPhone}>{user.phone}</Text>}
      <Text style={styles.callStatus}>{getStatusText()}</Text>

      {/* Ringtone indicator */}
      <View style={styles.ringtoneIndicator}>
        <Ionicons
          name={selectedRingtone.icon as any}
          size={16}
          color={selectedRingtone.color}
        />
        <Text style={styles.ringtoneText}>{selectedRingtone.name}</Text>
        {selectedRingtone.isAI && (
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.incomingActions}>
        <ControlButton
          icon="close"
          label="Từ chối"
          onPress={handleDecline}
          variant="danger"
          size={70}
        />
        <ControlButton
          icon={callType === "video" ? "videocam" : "call"}
          label="Trả lời"
          onPress={handleAnswer}
          variant="success"
          size={70}
        />
      </View>
    </View>
  );

  // Render connected call UI
  const renderConnectedCall = () => (
    <View style={styles.connectedContainer}>
      {/* Header */}
      <View style={styles.callHeader}>
        {callStartTime && <CallTimer startTime={callStartTime} />}
        <Text style={styles.callQuality}>
          <Ionicons name="wifi" size={14} color="#10B981" /> Chất lượng tốt
        </Text>
      </View>

      {/* Avatar & Info */}
      <View style={styles.callContent}>
        <PulsingAvatar user={user} isRinging={false} size={120} />
        <Text style={styles.connectedName}>{user.name}</Text>
        <Text style={styles.connectedStatus}>{getStatusText()}</Text>

        {/* Sound visualizer */}
        <SoundVisualizer isActive={!isMuted} />
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          <ControlButton
            icon={isMuted ? "mic-off" : "mic"}
            label={isMuted ? "Bật mic" : "Tắt mic"}
            onPress={handleToggleMute}
            variant={isMuted ? "active" : "default"}
          />
          <ControlButton
            icon={isSpeakerOn ? "volume-high" : "volume-medium"}
            label={isSpeakerOn ? "Loa ngoài" : "Tai nghe"}
            onPress={handleToggleSpeaker}
            variant={isSpeakerOn ? "active" : "default"}
          />
          <ControlButton
            icon={isVideoEnabled ? "videocam" : "videocam-off"}
            label={isVideoEnabled ? "Tắt video" : "Bật video"}
            onPress={handleToggleVideo}
            variant={!isVideoEnabled ? "active" : "default"}
          />
        </View>

        <View style={styles.controlsRow}>
          <ControlButton icon="keypad" label="Bàn phím" onPress={() => {}} />
          <ControlButton
            icon="call"
            onPress={handleEndCall}
            variant="danger"
            size={70}
          />
          <ControlButton
            icon="ellipsis-horizontal"
            label="Thêm"
            onPress={() => {}}
          />
        </View>
      </View>

      {/* Hold Music indicator (when on hold) */}
      <View style={styles.holdMusicIndicator}>
        <MaterialCommunityIcons
          name="music-note"
          size={16}
          color={MODERN_COLORS.primary}
        />
        <Text style={styles.holdMusicText}>
          Nhạc chờ: {selectedHoldMusic.name}
          {selectedHoldMusic.isAI ? " ✨ AI" : ""}
        </Text>
      </View>
    </View>
  );

  // Render outgoing/connecting call UI
  const renderConnectingCall = () => (
    <View style={styles.connectingContainer}>
      <WaveBackground isActive={true} />

      <PulsingAvatar user={user} isRinging={true} />

      <Text style={styles.callerName}>{user.name}</Text>
      <Text style={styles.callStatus}>{getStatusText()}</Text>

      {/* Connecting animation */}
      <View style={styles.connectingDots}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[styles.connectingDot, { opacity: fadeAnim }]}
          />
        ))}
      </View>

      <View style={styles.connectingActions}>
        <ControlButton
          icon="call"
          label="Kết thúc"
          onPress={handleEndCall}
          variant="danger"
          size={70}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0F172A", "#1E293B", "#0F172A"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {callState === "ringing" && isIncoming && renderIncomingCall()}
          {callState === "connecting" && renderConnectingCall()}
          {callState === "connected" && renderConnectedCall()}
          {(callState === "ended" || callState === "declined") && (
            <View style={styles.endedContainer}>
              <Ionicons name="call" size={64} color="#EF4444" />
              <Text style={styles.endedText}>{getStatusText()}</Text>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },

  // Wave background
  waveContainer: {
    position: "absolute",
    top: "25%",
    left: "50%",
    marginLeft: -90,
    alignItems: "center",
    justifyContent: "center",
  },
  wave: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(102, 126, 234, 0.3)",
  },

  // Avatar
  avatarWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: MODERN_SPACING.xl,
  },
  avatarGlow: {
    position: "absolute",
    backgroundColor: "rgba(102, 126, 234, 0.4)",
  },
  avatarContainer: {
    overflow: "hidden",
    ...MODERN_SHADOWS.xl,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "700",
    color: "#fff",
  },
  onlineIndicator: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    borderWidth: 3,
    borderColor: "#0F172A",
  },

  // Incoming call
  incomingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.xl,
  },
  callerName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: MODERN_SPACING.xs,
    textAlign: "center",
  },
  callerPhone: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    marginBottom: MODERN_SPACING.sm,
  },
  callStatus: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    marginBottom: MODERN_SPACING.lg,
  },
  ringtoneIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.full,
    marginBottom: MODERN_SPACING.xxl,
    gap: 8,
  },
  ringtoneText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  aiBadge: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  incomingActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 60,
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
  },

  // Connecting call
  connectingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.xl,
  },
  connectingDots: {
    flexDirection: "row",
    gap: 8,
    marginTop: MODERN_SPACING.lg,
    marginBottom: MODERN_SPACING.xxl,
  },
  connectingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  connectingActions: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  // Connected call
  connectedContainer: {
    flex: 1,
    paddingHorizontal: MODERN_SPACING.lg,
  },
  callHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.lg,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.full,
    gap: 8,
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  timerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  callQuality: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  callContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  connectedName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginTop: MODERN_SPACING.md,
  },
  connectedStatus: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: MODERN_SPACING.xs,
  },
  visualizer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 40,
    gap: 4,
    marginTop: MODERN_SPACING.lg,
  },
  visualizerBar: {
    width: 4,
    height: 40,
    backgroundColor: "#667EEA",
    borderRadius: 2,
  },

  // Controls
  controlsContainer: {
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    gap: MODERN_SPACING.lg,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
  },
  controlWrapper: {
    alignItems: "center",
  },
  controlButton: {
    justifyContent: "center",
    alignItems: "center",
    ...MODERN_SHADOWS.md,
  },
  controlDisabled: {
    opacity: 0.5,
  },
  controlLabel: {
    marginTop: MODERN_SPACING.xs,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },

  // Hold music
  holdMusicIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    gap: 8,
    marginTop: MODERN_SPACING.md,
  },
  holdMusicText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },

  // Ended call
  endedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  endedText: {
    marginTop: MODERN_SPACING.lg,
    fontSize: 18,
    color: "rgba(255,255,255,0.7)",
  },
});
