/**
 * Video Room Screen - Active video call room
 * Route: /meetings/room/[roomId]
 */

import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function VideoRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    bg: "#000000",
    card: "#1a1a1a",
    text: "#FFFFFF",
    textSecondary: "#999999",
    textMuted: "#666666",
    accent: "#FFFFFF",
    accentSoft: "rgba(255,255,255,0.1)",
    error: "#FF3B30",
    success: "#34C759",
  };

  useEffect(() => {
    // Initialize video room connection
    initializeRoom();
    return () => {
      // Cleanup on unmount
      leaveRoom();
    };
  }, [roomId]);

  const initializeRoom = async () => {
    try {
      setLoading(true);
      // TODO: Connect to video service (Agora, Twilio, etc.)
      console.log("[VideoRoom] Connecting to room:", roomId);

      // Simulate connection
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setParticipants([
        { id: user?.id, name: user?.name || "Bạn", isLocal: true },
      ]);

      setLoading(false);
    } catch (error) {
      console.error("[VideoRoom] Init error:", error);
      Alert.alert("Lỗi", "Không thể kết nối phòng họp");
      router.back();
    }
  };

  const leaveRoom = () => {
    console.log("[VideoRoom] Leaving room:", roomId);
    // TODO: Disconnect from video service
  };

  const handleEndCall = () => {
    Alert.alert("Rời cuộc họp", "Bạn có chắc muốn rời khỏi cuộc họp?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Rời đi",
        style: "destructive",
        onPress: () => {
          leaveRoom();
          router.back();
        },
      },
    ]);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Đang kết nối...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Video Grid */}
      <View style={styles.videoGrid}>
        {participants.map((participant) => (
          <View
            key={participant.id}
            style={[styles.videoContainer, { backgroundColor: colors.card }]}
          >
            {isVideoOff && participant.isLocal ? (
              <View style={styles.videoOff}>
                <View
                  style={[
                    styles.avatarCircle,
                    { backgroundColor: colors.accentSoft },
                  ]}
                >
                  <Text style={[styles.avatarText, { color: colors.text }]}>
                    {participant.name?.[0]?.toUpperCase() || "?"}
                  </Text>
                </View>
                <Text style={[styles.participantName, { color: colors.text }]}>
                  {participant.name}
                </Text>
              </View>
            ) : (
              <View style={styles.videoPlaceholder}>
                {/* Video stream would go here */}
                <View
                  style={[
                    styles.avatarCircle,
                    { backgroundColor: colors.accentSoft },
                  ]}
                >
                  <Ionicons
                    name="videocam"
                    size={40}
                    color={colors.textMuted}
                  />
                </View>
                <Text style={[styles.participantName, { color: colors.text }]}>
                  {participant.isLocal ? "Bạn" : participant.name}
                </Text>
              </View>
            )}

            {/* Mute indicator */}
            {isMuted && participant.isLocal && (
              <View style={styles.mutedBadge}>
                <Ionicons name="mic-off" size={14} color="#fff" />
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Room Info */}
      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <View style={styles.roomInfo}>
          <Text style={[styles.roomTitle, { color: colors.text }]}>
            Phòng: {roomId?.substring(0, 8)}...
          </Text>
          <View style={styles.participantCount}>
            <Ionicons name="people" size={16} color={colors.textSecondary} />
            <Text style={[styles.countText, { color: colors.textSecondary }]}>
              {participants.length}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Controls */}
      <SafeAreaView style={styles.controls} edges={["bottom"]}>
        <View style={styles.controlsRow}>
          <Pressable
            style={[
              styles.controlButton,
              { backgroundColor: isMuted ? colors.error : colors.card },
            ]}
            onPress={toggleMute}
          >
            <Ionicons
              name={isMuted ? "mic-off" : "mic"}
              size={24}
              color={colors.text}
            />
          </Pressable>

          <Pressable
            style={[
              styles.controlButton,
              { backgroundColor: isVideoOff ? colors.error : colors.card },
            ]}
            onPress={toggleVideo}
          >
            <Ionicons
              name={isVideoOff ? "videocam-off" : "videocam"}
              size={24}
              color={colors.text}
            />
          </Pressable>

          <Pressable
            style={[styles.controlButton, { backgroundColor: colors.card }]}
            onPress={() => {
              /* Toggle speaker */
            }}
          >
            <Ionicons name="volume-high" size={24} color={colors.text} />
          </Pressable>

          <Pressable
            style={[styles.controlButton, { backgroundColor: colors.card }]}
            onPress={() => {
              /* Flip camera */
            }}
          >
            <Ionicons name="camera-reverse" size={24} color={colors.text} />
          </Pressable>

          <Pressable
            style={[styles.endCallButton, { backgroundColor: colors.error }]}
            onPress={handleEndCall}
          >
            <Ionicons name="call" size={28} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  videoGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    gap: 8,
  },
  videoContainer: {
    flex: 1,
    minWidth: SCREEN_WIDTH / 2 - 16,
    minHeight: SCREEN_HEIGHT / 3,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  videoOff: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "600",
  },
  participantName: {
    fontSize: 14,
    fontWeight: "500",
  },
  mutedBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  roomInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 12,
  },
  roomTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  participantCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  countText: {
    fontSize: 14,
    fontWeight: "500",
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 16,
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  endCallButton: {
    width: 60,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "135deg" }],
  },
});
