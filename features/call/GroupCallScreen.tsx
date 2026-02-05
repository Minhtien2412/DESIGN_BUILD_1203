/**
 * Group Call Screen - Advanced Group Video/Voice Calls
 * Features: Multi-participant calls, Screen sharing, Virtual backgrounds, AI noise cancellation
 * Updated: 24/01/2026
 */

import Avatar from "@/components/ui/avatar";
import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from "@/constants/modern-theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ==================== TYPES ====================
interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaking: boolean;
  isScreenSharing: boolean;
  isHost: boolean;
  isModerator: boolean;
  connectionQuality: "excellent" | "good" | "poor" | "disconnected";
  joinedAt: string;
}

interface GroupCallInfo {
  id: string;
  groupId: string;
  groupName: string;
  groupAvatar?: string;
  type: "voice" | "video";
  status: "connecting" | "active" | "ended";
  startedAt: string;
  participants: CallParticipant[];
  maxParticipants: number;
  settings: CallSettings;
}

interface CallSettings {
  allowScreenShare: boolean;
  allowVirtualBg: boolean;
  muteOnJoin: boolean;
  videoOffOnJoin: boolean;
  waitingRoom: boolean;
  recordCall: boolean;
}

interface VirtualBackground {
  id: string;
  name: string;
  type: "blur" | "image" | "ai";
  source?: string;
  preview: string;
}

// ==================== MOCK DATA ====================
const MOCK_PARTICIPANTS: CallParticipant[] = [
  {
    id: "1",
    name: "Nguyễn Văn Admin",
    avatar: "https://i.pravatar.cc/150?img=1",
    isMuted: false,
    isVideoOn: true,
    isSpeaking: true,
    isScreenSharing: false,
    isHost: true,
    isModerator: false,
    connectionQuality: "excellent",
    joinedAt: "2026-01-24T08:00:00Z",
  },
  {
    id: "2",
    name: "Trần Thị Designer",
    avatar: "https://i.pravatar.cc/150?img=2",
    isMuted: true,
    isVideoOn: true,
    isSpeaking: false,
    isScreenSharing: false,
    isHost: false,
    isModerator: true,
    connectionQuality: "good",
    joinedAt: "2026-01-24T08:01:00Z",
  },
  {
    id: "3",
    name: "Lê Văn Developer",
    avatar: "https://i.pravatar.cc/150?img=3",
    isMuted: false,
    isVideoOn: false,
    isSpeaking: false,
    isScreenSharing: false,
    isHost: false,
    isModerator: false,
    connectionQuality: "excellent",
    joinedAt: "2026-01-24T08:02:00Z",
  },
  {
    id: "4",
    name: "Phạm Minh PM",
    isMuted: true,
    isVideoOn: true,
    isSpeaking: false,
    isScreenSharing: true,
    isHost: false,
    isModerator: false,
    connectionQuality: "poor",
    joinedAt: "2026-01-24T08:03:00Z",
  },
];

const VIRTUAL_BACKGROUNDS: VirtualBackground[] = [
  { id: "none", name: "Không", type: "image", preview: "" },
  { id: "blur-light", name: "Mờ nhẹ", type: "blur", preview: "" },
  { id: "blur-heavy", name: "Mờ đậm", type: "blur", preview: "" },
  {
    id: "office",
    name: "Văn phòng",
    type: "image",
    source:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    preview:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200",
  },
  {
    id: "nature",
    name: "Thiên nhiên",
    type: "image",
    source:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
    preview:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200",
  },
  {
    id: "beach",
    name: "Bãi biển",
    type: "image",
    source:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    preview:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200",
  },
  { id: "ai-studio", name: "AI Studio", type: "ai", preview: "" },
];

// ==================== COMPONENTS ====================

// Participant Video Tile
const ParticipantTile = React.memo(
  ({
    participant,
    size,
    isActive,
    onPress,
  }: {
    participant: CallParticipant;
    size: "small" | "medium" | "large" | "full";
    isActive: boolean;
    onPress: () => void;
  }) => {
    const speakingAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (participant.isSpeaking) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(speakingAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(speakingAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      } else {
        speakingAnim.setValue(0);
      }
    }, [participant.isSpeaking]);

    const borderWidth = speakingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 3],
    });

    const getTileSize = () => {
      switch (size) {
        case "small":
          return {
            width: SCREEN_WIDTH / 3 - 12,
            height: SCREEN_WIDTH / 3 - 12,
          };
        case "medium":
          return {
            width: SCREEN_WIDTH / 2 - 12,
            height: SCREEN_WIDTH / 2 - 12,
          };
        case "large":
          return { width: SCREEN_WIDTH - 24, height: SCREEN_HEIGHT * 0.35 };
        case "full":
          return { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 };
      }
    };

    const tileSize = getTileSize();

    const getQualityColor = () => {
      switch (participant.connectionQuality) {
        case "excellent":
          return "#10B981";
        case "good":
          return "#F59E0B";
        case "poor":
          return "#EF4444";
        default:
          return "#6B7280";
      }
    };

    return (
      <Pressable onPress={onPress}>
        <Animated.View
          style={[
            styles.participantTile,
            tileSize,
            isActive && styles.participantTileActive,
            {
              borderWidth: participant.isSpeaking ? 2 : 0,
              borderColor: "#10B981",
            },
          ]}
        >
          {participant.isVideoOn ? (
            <View style={styles.videoPlaceholder}>
              <Image
                source={{
                  uri:
                    participant.avatar ||
                    `https://i.pravatar.cc/300?u=${participant.id}`,
                }}
                style={styles.videoFeed}
              />
              {/* Simulated video overlay for demo */}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.5)"]}
                style={styles.videoGradient}
              />
            </View>
          ) : (
            <View style={styles.noVideoContainer}>
              <LinearGradient
                colors={["#1F2937", "#111827"]}
                style={StyleSheet.absoluteFill}
              />
              <Avatar
                avatar={participant.avatar || null}
                userId={participant.id}
                name={participant.name}
                pixelSize={size === "small" ? 48 : size === "medium" ? 64 : 80}
                showBadge={false}
              />
            </View>
          )}

          {/* Participant Info Overlay */}
          <View style={styles.participantOverlay}>
            {/* Top badges */}
            <View style={styles.topBadges}>
              {participant.isHost && (
                <View style={styles.hostBadge}>
                  <Ionicons name="star" size={10} color="#fff" />
                  <Text style={styles.badgeText}>Host</Text>
                </View>
              )}
              {participant.isScreenSharing && (
                <View style={styles.screenShareBadge}>
                  <Ionicons name="desktop" size={10} color="#fff" />
                </View>
              )}
            </View>

            {/* Bottom info */}
            <View style={styles.bottomInfo}>
              <View style={styles.participantName}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {participant.name}
                </Text>
                {participant.isMuted && (
                  <View style={styles.mutedIcon}>
                    <Ionicons name="mic-off" size={12} color="#EF4444" />
                  </View>
                )}
              </View>

              {/* Connection quality indicator */}
              <View
                style={[
                  styles.qualityIndicator,
                  { backgroundColor: getQualityColor() },
                ]}
              >
                <View style={styles.qualityBars}>
                  <View style={[styles.qualityBar, { height: 4 }]} />
                  <View
                    style={[
                      styles.qualityBar,
                      {
                        height: 6,
                        opacity:
                          participant.connectionQuality === "poor" ? 0.3 : 1,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.qualityBar,
                      {
                        height: 8,
                        opacity:
                          participant.connectionQuality !== "excellent"
                            ? 0.3
                            : 1,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    );
  },
);

// Control Button
const ControlButton = React.memo(
  ({
    icon,
    label,
    isActive,
    isDestructive,
    onPress,
    badge,
  }: {
    icon: string;
    label: string;
    isActive?: boolean;
    isDestructive?: boolean;
    onPress: () => void;
    badge?: number;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.controlButton,
            isActive && styles.controlButtonActive,
            isDestructive && styles.controlButtonDestructive,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Ionicons
            name={icon as any}
            size={24}
            color={
              isDestructive ? "#fff" : isActive ? MODERN_COLORS.primary : "#fff"
            }
          />
          {badge !== undefined && badge > 0 && (
            <View style={styles.controlBadge}>
              <Text style={styles.controlBadgeText}>{badge}</Text>
            </View>
          )}
        </Animated.View>
        <Text style={styles.controlLabel}>{label}</Text>
      </Pressable>
    );
  },
);

// ==================== MAIN COMPONENT ====================
export default function GroupCallScreen() {
  const { callId, groupId } = useLocalSearchParams<{
    callId: string;
    groupId: string;
  }>();

  const [callInfo, setCallInfo] = useState<GroupCallInfo>({
    id: callId || "call-1",
    groupId: groupId || "group-1",
    groupName: "Dự án Resort Đà Nẵng",
    type: "video",
    status: "active",
    startedAt: new Date().toISOString(),
    participants: MOCK_PARTICIPANTS,
    maxParticipants: 25,
    settings: {
      allowScreenShare: true,
      allowVirtualBg: true,
      muteOnJoin: false,
      videoOffOnJoin: false,
      waitingRoom: false,
      recordCall: false,
    },
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isNoiseCancel, setIsNoiseCancel] = useState(true);
  const [selectedParticipant, setSelectedParticipant] =
    useState<CallParticipant | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVirtualBg, setShowVirtualBg] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<string>("none");
  const [layout, setLayout] = useState<"grid" | "speaker" | "gallery">("grid");

  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Call duration timer
  useEffect(() => {
    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, []);

  // Format duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  // Handlers
  const toggleMute = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsMuted((prev) => !prev);
  }, []);

  const toggleVideo = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsVideoOn((prev) => !prev);
  }, []);

  const toggleScreenShare = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsScreenSharing((prev) => !prev);
  }, []);

  const toggleSpeaker = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSpeakerOn((prev) => !prev);
  }, []);

  const toggleNoiseCancel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsNoiseCancel((prev) => !prev);
  }, []);

  const endCall = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.back();
  }, []);

  const switchLayout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLayout((prev) => {
      switch (prev) {
        case "grid":
          return "speaker";
        case "speaker":
          return "gallery";
        case "gallery":
          return "grid";
      }
    });
  }, []);

  // Render participants based on layout
  const renderParticipants = () => {
    const participants = callInfo.participants;

    if (layout === "speaker") {
      const speaker =
        selectedParticipant ||
        participants.find((p) => p.isSpeaking) ||
        participants[0];
      const others = participants.filter((p) => p.id !== speaker.id);

      return (
        <View style={styles.speakerLayout}>
          <ParticipantTile
            participant={speaker}
            size="full"
            isActive={true}
            onPress={() => setSelectedParticipant(speaker)}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.speakerStrip}
            contentContainerStyle={styles.speakerStripContent}
          >
            {others.map((participant) => (
              <ParticipantTile
                key={participant.id}
                participant={participant}
                size="small"
                isActive={false}
                onPress={() => setSelectedParticipant(participant)}
              />
            ))}
          </ScrollView>
        </View>
      );
    }

    if (layout === "gallery") {
      return (
        <ScrollView
          style={styles.galleryLayout}
          contentContainerStyle={styles.galleryContent}
          showsVerticalScrollIndicator={false}
        >
          {participants.map((participant) => (
            <ParticipantTile
              key={participant.id}
              participant={participant}
              size="medium"
              isActive={selectedParticipant?.id === participant.id}
              onPress={() => setSelectedParticipant(participant)}
            />
          ))}
        </ScrollView>
      );
    }

    // Grid layout
    const gridSize =
      participants.length <= 2
        ? "large"
        : participants.length <= 4
          ? "medium"
          : "small";

    return (
      <View style={styles.gridLayout}>
        <View style={styles.gridContainer}>
          {participants.map((participant) => (
            <ParticipantTile
              key={participant.id}
              participant={participant}
              size={gridSize}
              isActive={selectedParticipant?.id === participant.id}
              onPress={() => setSelectedParticipant(participant)}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background */}
      <LinearGradient
        colors={["#1F2937", "#111827", "#0F172A"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.groupNameHeader}>{callInfo.groupName}</Text>
          <View style={styles.callInfoRow}>
            <View style={styles.durationBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.durationText}>
                {formatDuration(callDuration)}
              </Text>
            </View>
            <View style={styles.participantCountBadge}>
              <Ionicons name="people" size={14} color="#fff" />
              <Text style={styles.participantCountText}>
                {callInfo.participants.length}/{callInfo.maxParticipants}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={switchLayout} style={styles.headerButton}>
            <Ionicons
              name={
                layout === "grid"
                  ? "grid"
                  : layout === "speaker"
                    ? "person"
                    : "albums"
              }
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            style={styles.headerButton}
          >
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content - Participants */}
      <View style={styles.mainContent}>{renderParticipants()}</View>

      {/* AI Features Bar */}
      <View style={styles.aiFeaturesBar}>
        <TouchableOpacity
          style={[
            styles.aiFeatureButton,
            isNoiseCancel && styles.aiFeatureActive,
          ]}
          onPress={toggleNoiseCancel}
        >
          <Ionicons
            name="ear"
            size={18}
            color={isNoiseCancel ? MODERN_COLORS.primary : "#9CA3AF"}
          />
          <Text
            style={[
              styles.aiFeatureText,
              isNoiseCancel && styles.aiFeatureTextActive,
            ]}
          >
            AI Noise Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.aiFeatureButton}
          onPress={() => setShowVirtualBg(true)}
        >
          <Ionicons name="image" size={18} color="#9CA3AF" />
          <Text style={styles.aiFeatureText}>Background</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.aiFeatureButton}>
          <Ionicons name="sparkles" size={18} color="#9CA3AF" />
          <Text style={styles.aiFeatureText}>AI Enhance</Text>
        </TouchableOpacity>
      </View>

      {/* Control Bar */}
      <SafeAreaView edges={["bottom"]} style={styles.controlBar}>
        <View style={styles.controlsRow}>
          <ControlButton
            icon={isMuted ? "mic-off" : "mic"}
            label={isMuted ? "Bật mic" : "Tắt mic"}
            isActive={!isMuted}
            onPress={toggleMute}
          />

          <ControlButton
            icon={isVideoOn ? "videocam" : "videocam-off"}
            label={isVideoOn ? "Tắt cam" : "Bật cam"}
            isActive={isVideoOn}
            onPress={toggleVideo}
          />

          <ControlButton
            icon="desktop"
            label="Chia sẻ"
            isActive={isScreenSharing}
            onPress={toggleScreenShare}
          />

          <ControlButton
            icon="people"
            label="Thành viên"
            onPress={() => setShowParticipants(true)}
            badge={callInfo.participants.length}
          />

          <ControlButton
            icon="chatbubble-ellipses"
            label="Chat"
            onPress={() => {}}
          />

          <ControlButton
            icon="call"
            label="Kết thúc"
            isDestructive
            onPress={endCall}
          />
        </View>

        {/* Secondary controls */}
        <View style={styles.secondaryControls}>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              isSpeakerOn && styles.secondaryButtonActive,
            ]}
            onPress={toggleSpeaker}
          >
            <Ionicons
              name={isSpeakerOn ? "volume-high" : "volume-off"}
              size={20}
              color={isSpeakerOn ? MODERN_COLORS.primary : "#6B7280"}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="hand-left" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="happy" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Participants Modal */}
      <Modal
        visible={showParticipants}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowParticipants(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Thành viên ({callInfo.participants.length})
            </Text>
            <TouchableOpacity onPress={() => setShowParticipants(false)}>
              <Ionicons name="close" size={24} color={MODERN_COLORS.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={callInfo.participants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.participantRow}>
                <View style={styles.participantInfo}>
                  <Avatar
                    avatar={item.avatar || null}
                    userId={item.id}
                    name={item.name}
                    pixelSize={44}
                    showBadge={false}
                  />
                  <View style={styles.participantDetails}>
                    <View style={styles.nameRow}>
                      <Text style={styles.participantNameText}>
                        {item.name}
                      </Text>
                      {item.isHost && (
                        <View style={styles.roleBadge}>
                          <Text style={styles.roleBadgeText}>Host</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.statusRow}>
                      <Ionicons
                        name={item.isMuted ? "mic-off" : "mic"}
                        size={14}
                        color={item.isMuted ? "#EF4444" : "#10B981"}
                      />
                      <Ionicons
                        name={item.isVideoOn ? "videocam" : "videocam-off"}
                        size={14}
                        color={item.isVideoOn ? "#10B981" : "#EF4444"}
                        style={{ marginLeft: 8 }}
                      />
                      {item.isScreenSharing && (
                        <View style={styles.screenShareIndicator}>
                          <Ionicons name="desktop" size={12} color="#3B82F6" />
                          <Text style={styles.screenShareText}>
                            Đang chia sẻ
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.participantAction}>
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color={MODERN_COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.participantsList}
          />

          <View style={styles.inviteSection}>
            <TouchableOpacity style={styles.inviteButton}>
              <LinearGradient
                colors={["#667EEA", "#764BA2"]}
                style={styles.inviteButtonGradient}
              >
                <Ionicons name="person-add" size={20} color="#fff" />
                <Text style={styles.inviteButtonText}>Mời thêm thành viên</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Virtual Background Modal */}
      <Modal
        visible={showVirtualBg}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVirtualBg(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Phông nền ảo</Text>
            <TouchableOpacity onPress={() => setShowVirtualBg(false)}>
              <Ionicons name="close" size={24} color={MODERN_COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.bgPreviewContainer}>
            <View style={styles.bgPreview}>
              {selectedBackground !== "none" ? (
                <Image
                  source={{
                    uri:
                      VIRTUAL_BACKGROUNDS.find(
                        (bg) => bg.id === selectedBackground,
                      )?.source ||
                      VIRTUAL_BACKGROUNDS.find(
                        (bg) => bg.id === selectedBackground,
                      )?.preview,
                  }}
                  style={styles.bgPreviewImage}
                />
              ) : (
                <View style={styles.bgPreviewPlaceholder}>
                  <Avatar
                    avatar={null}
                    userId="me"
                    name="Me"
                    pixelSize={80}
                    showBadge={false}
                  />
                </View>
              )}
            </View>
          </View>

          <ScrollView
            style={styles.bgOptions}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.bgSectionTitle}>Làm mờ</Text>
            <View style={styles.bgGrid}>
              {VIRTUAL_BACKGROUNDS.filter(
                (bg) => bg.type === "blur" || bg.id === "none",
              ).map((bg) => (
                <TouchableOpacity
                  key={bg.id}
                  style={[
                    styles.bgOption,
                    selectedBackground === bg.id && styles.bgOptionSelected,
                  ]}
                  onPress={() => setSelectedBackground(bg.id)}
                >
                  <View style={styles.bgOptionPreview}>
                    {bg.id === "none" ? (
                      <Ionicons
                        name="close"
                        size={24}
                        color={MODERN_COLORS.textSecondary}
                      />
                    ) : (
                      <Ionicons
                        name="water"
                        size={24}
                        color={MODERN_COLORS.primary}
                      />
                    )}
                  </View>
                  <Text style={styles.bgOptionName}>{bg.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.bgSectionTitle}>Hình ảnh</Text>
            <View style={styles.bgGrid}>
              {VIRTUAL_BACKGROUNDS.filter(
                (bg) => bg.type === "image" && bg.id !== "none",
              ).map((bg) => (
                <TouchableOpacity
                  key={bg.id}
                  style={[
                    styles.bgOption,
                    selectedBackground === bg.id && styles.bgOptionSelected,
                  ]}
                  onPress={() => setSelectedBackground(bg.id)}
                >
                  <Image
                    source={{ uri: bg.preview }}
                    style={styles.bgOptionImage}
                  />
                  <Text style={styles.bgOptionName}>{bg.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.bgSectionTitle}>AI tạo sinh</Text>
            <View style={styles.bgGrid}>
              {VIRTUAL_BACKGROUNDS.filter((bg) => bg.type === "ai").map(
                (bg) => (
                  <TouchableOpacity
                    key={bg.id}
                    style={[
                      styles.bgOption,
                      selectedBackground === bg.id && styles.bgOptionSelected,
                    ]}
                    onPress={() => setSelectedBackground(bg.id)}
                  >
                    <LinearGradient
                      colors={["#667EEA", "#764BA2"]}
                      style={styles.bgOptionPreview}
                    >
                      <Ionicons name="sparkles" size={24} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.bgOptionName}>{bg.name}</Text>
                  </TouchableOpacity>
                ),
              )}

              <TouchableOpacity style={styles.bgOption}>
                <View style={[styles.bgOptionPreview, styles.bgOptionAdd]}>
                  <Ionicons
                    name="add"
                    size={24}
                    color={MODERN_COLORS.primary}
                  />
                </View>
                <Text style={styles.bgOptionName}>Thêm mới</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cài đặt cuộc gọi</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Ionicons name="close" size={24} color={MODERN_COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.settingsList}>
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Âm thanh</Text>

              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Ionicons
                    name="volume-high"
                    size={22}
                    color={MODERN_COLORS.primary}
                  />
                  <Text style={styles.settingsItemText}>Loa ngoài</Text>
                </View>
                <View
                  style={[
                    styles.settingsToggle,
                    isSpeakerOn && styles.settingsToggleActive,
                  ]}
                >
                  <View
                    style={[
                      styles.settingsToggleDot,
                      isSpeakerOn && styles.settingsToggleDotActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Ionicons
                    name="ear"
                    size={22}
                    color={MODERN_COLORS.primary}
                  />
                  <Text style={styles.settingsItemText}>AI khử tiếng ồn</Text>
                </View>
                <View
                  style={[
                    styles.settingsToggle,
                    isNoiseCancel && styles.settingsToggleActive,
                  ]}
                >
                  <View
                    style={[
                      styles.settingsToggleDot,
                      isNoiseCancel && styles.settingsToggleDotActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Video</Text>

              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Ionicons
                    name="sync"
                    size={22}
                    color={MODERN_COLORS.primary}
                  />
                  <Text style={styles.settingsItemText}>Đảo camera</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={MODERN_COLORS.textTertiary}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Ionicons
                    name="sunny"
                    size={22}
                    color={MODERN_COLORS.primary}
                  />
                  <Text style={styles.settingsItemText}>
                    AI cải thiện ánh sáng
                  </Text>
                </View>
                <View
                  style={[styles.settingsToggle, styles.settingsToggleActive]}
                >
                  <View
                    style={[
                      styles.settingsToggleDot,
                      styles.settingsToggleDotActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Bố cục</Text>

              <View style={styles.layoutOptions}>
                <TouchableOpacity
                  style={[
                    styles.layoutOption,
                    layout === "grid" && styles.layoutOptionActive,
                  ]}
                  onPress={() => setLayout("grid")}
                >
                  <Ionicons
                    name="grid"
                    size={24}
                    color={
                      layout === "grid"
                        ? MODERN_COLORS.primary
                        : MODERN_COLORS.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.layoutOptionText,
                      layout === "grid" && styles.layoutOptionTextActive,
                    ]}
                  >
                    Lưới
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.layoutOption,
                    layout === "speaker" && styles.layoutOptionActive,
                  ]}
                  onPress={() => setLayout("speaker")}
                >
                  <Ionicons
                    name="person"
                    size={24}
                    color={
                      layout === "speaker"
                        ? MODERN_COLORS.primary
                        : MODERN_COLORS.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.layoutOptionText,
                      layout === "speaker" && styles.layoutOptionTextActive,
                    ]}
                  >
                    Diễn giả
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.layoutOption,
                    layout === "gallery" && styles.layoutOptionActive,
                  ]}
                  onPress={() => setLayout("gallery")}
                >
                  <Ionicons
                    name="albums"
                    size={24}
                    color={
                      layout === "gallery"
                        ? MODERN_COLORS.primary
                        : MODERN_COLORS.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.layoutOptionText,
                      layout === "gallery" && styles.layoutOptionTextActive,
                    ]}
                  >
                    Gallery
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Ghi hình</Text>

              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="radio-button-on" size={22} color="#EF4444" />
                  <Text style={styles.settingsItemText}>Bắt đầu ghi hình</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={MODERN_COLORS.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.xs,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  groupNameHeader: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: "600",
    color: "#fff",
  },
  callInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
    marginTop: 4,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.full,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 6,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
  },
  participantCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.full,
    gap: 4,
  },
  participantCountText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
  },

  // Main Content
  mainContent: {
    flex: 1,
  },

  // Layouts
  gridLayout: {
    flex: 1,
    justifyContent: "center",
    padding: MODERN_SPACING.sm,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  speakerLayout: {
    flex: 1,
  },
  speakerStrip: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
  },
  speakerStripContent: {
    paddingHorizontal: MODERN_SPACING.md,
    gap: 8,
  },
  galleryLayout: {
    flex: 1,
  },
  galleryContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: MODERN_SPACING.sm,
    gap: 8,
  },

  // Participant Tile
  participantTile: {
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    backgroundColor: "#1F2937",
  },
  participantTileActive: {
    borderWidth: 2,
    borderColor: MODERN_COLORS.primary,
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: "#374151",
  },
  videoFeed: {
    width: "100%",
    height: "100%",
  },
  videoGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  participantOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    padding: MODERN_SPACING.xs,
  },
  topBadges: {
    flexDirection: "row",
    gap: 4,
  },
  hostBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.sm,
    gap: 2,
  },
  screenShareBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    padding: 4,
    borderRadius: MODERN_RADIUS.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  bottomInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  participantName: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.sm,
    gap: 4,
  },
  nameText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
    maxWidth: 80,
  },
  mutedIcon: {
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    padding: 2,
    borderRadius: 4,
  },
  qualityIndicator: {
    padding: 4,
    borderRadius: 4,
  },
  qualityBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 1,
  },
  qualityBar: {
    width: 3,
    backgroundColor: "#fff",
    borderRadius: 1,
  },

  // AI Features Bar
  aiFeaturesBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm,
    paddingHorizontal: MODERN_SPACING.md,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  aiFeatureButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 6,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  aiFeatureActive: {
    backgroundColor: `${MODERN_COLORS.primary}20`,
  },
  aiFeatureText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  aiFeatureTextActive: {
    color: MODERN_COLORS.primary,
  },

  // Control Bar
  controlBar: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingTop: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.sm,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: MODERN_SPACING.md,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  controlButtonDestructive: {
    backgroundColor: "#EF4444",
  },
  controlLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
  controlBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: MODERN_COLORS.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  controlBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  secondaryControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  secondaryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonActive: {
    backgroundColor: `${MODERN_COLORS.primary}20`,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  modalTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },

  // Participants List
  participantsList: {
    paddingHorizontal: MODERN_SPACING.md,
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  participantDetails: {
    marginLeft: MODERN_SPACING.sm,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.xs,
  },
  participantNameText: {
    fontSize: 14,
    fontWeight: "500",
    color: MODERN_COLORS.text,
  },
  roleBadge: {
    backgroundColor: `${MODERN_COLORS.primary}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  screenShareIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    gap: 4,
  },
  screenShareText: {
    fontSize: 11,
    color: "#3B82F6",
  },
  participantAction: {
    padding: MODERN_SPACING.xs,
  },
  inviteSection: {
    padding: MODERN_SPACING.md,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.divider,
  },
  inviteButton: {
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
  },
  inviteButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  // Virtual Background
  bgPreviewContainer: {
    alignItems: "center",
    paddingVertical: MODERN_SPACING.lg,
  },
  bgPreview: {
    width: 200,
    height: 150,
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    backgroundColor: "#1F2937",
  },
  bgPreviewImage: {
    width: "100%",
    height: "100%",
  },
  bgPreviewPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#374151",
  },
  bgOptions: {
    flex: 1,
    paddingHorizontal: MODERN_SPACING.md,
  },
  bgSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
  },
  bgGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  bgOption: {
    alignItems: "center",
    width: (SCREEN_WIDTH - 64) / 4,
  },
  bgOptionSelected: {
    opacity: 1,
  },
  bgOptionPreview: {
    width: 60,
    height: 60,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  bgOptionImage: {
    width: 60,
    height: 60,
    borderRadius: MODERN_RADIUS.md,
  },
  bgOptionAdd: {
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: MODERN_COLORS.primary,
    backgroundColor: `${MODERN_COLORS.primary}10`,
  },
  bgOptionName: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },

  // Settings
  settingsList: {
    flex: 1,
  },
  settingsSection: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.lg,
  },
  settingsSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
    textTransform: "uppercase",
    marginBottom: MODERN_SPACING.sm,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
  },
  settingsItemText: {
    fontSize: 15,
    color: MODERN_COLORS.text,
  },
  settingsToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.divider,
    padding: 2,
  },
  settingsToggleActive: {
    backgroundColor: MODERN_COLORS.primary,
  },
  settingsToggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  settingsToggleDotActive: {
    alignSelf: "flex-end",
  },
  layoutOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: MODERN_SPACING.md,
  },
  layoutOption: {
    alignItems: "center",
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    backgroundColor: MODERN_COLORS.surface,
    minWidth: 80,
  },
  layoutOptionActive: {
    backgroundColor: `${MODERN_COLORS.primary}15`,
    borderWidth: 2,
    borderColor: MODERN_COLORS.primary,
  },
  layoutOptionText: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 4,
  },
  layoutOptionTextActive: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },
});
