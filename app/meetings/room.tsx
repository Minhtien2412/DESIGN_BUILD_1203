/**
 * Meeting Room Screen
 * Video conference room with participants grid, chat, and controls
 * Uses useMeeting hook + LiveKit for video
 *
 * @created 19/01/2026
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useMeeting } from "@/hooks/useMeeting";
import type {
    MeetingChatMessage,
    MeetingParticipant,
} from "@/services/communication/meetingSocket.service";

const { width, height } = Dimensions.get("window");

export default function MeetingRoomScreen() {
  const { roomId, action } = useLocalSearchParams<{
    roomId?: string;
    action?: "create" | "join";
  }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Meeting hook
  const {
    meetingState,
    currentRoom,
    participants,
    chatMessages,
    raisedHands,
    error,
    connected,
    connecting,
    livekitCredentials,
    isMuted,
    isVideoOn,
    isScreenSharing,
    isRecording,
    createMeeting,
    joinMeeting,
    leaveMeeting,
    endMeeting,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    startRecording,
    stopRecording,
    sendMessage,
    raiseHand,
    lowerHand,
    sendReaction,
    kickParticipant,
    muteParticipant,
  } = useMeeting({
    onMeetingEnded: (reason) => {
      console.log("[MeetingRoom] Meeting ended:", reason);
      setTimeout(() => router.back(), 1500);
    },
    onParticipantJoined: (participant) => {
      console.log("[MeetingRoom] Participant joined:", participant.name);
    },
  });

  // Local UI state
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [selectedLayout, setSelectedLayout] = useState<"grid" | "speaker">(
    "grid"
  );

  // Join/Create meeting on mount
  React.useEffect(() => {
    if (action === "create") {
      createMeeting(`Meeting ${Date.now()}`);
    } else if (roomId) {
      joinMeeting(roomId);
    }
  }, [action, roomId]);

  // Handle send chat message
  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim());
    setChatInput("");
  }, [chatInput, sendMessage]);

  // Handle leave meeting
  const handleLeaveMeeting = useCallback(() => {
    leaveMeeting();
    router.back();
  }, [leaveMeeting]);

  // Render participant video tile
  const renderParticipantTile = ({
    item,
    index,
  }: {
    item: MeetingParticipant;
    index: number;
  }) => {
    const isRaised = raisedHands.includes(item.id);
    const tileSize =
      participants.length <= 2
        ? { width: width - 32, height: (height - 200) / 2 }
        : participants.length <= 4
          ? { width: (width - 48) / 2, height: (height - 200) / 2 }
          : { width: (width - 48) / 2, height: (height - 200) / 3 };

    return (
      <View style={[styles.participantTile, tileSize]}>
        {/* Video placeholder - would integrate with LiveKit RTCView */}
        {item.isVideoOn ? (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoPlaceholderText}>Video</Text>
          </View>
        ) : (
          <View style={styles.avatarContainer}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Participant info overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.participantOverlay}
        >
          <View style={styles.participantInfo}>
            <Text style={styles.participantName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.participantBadges}>
              {item.role === "host" && (
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>Host</Text>
                </View>
              )}
              {item.isMuted && (
                <Ionicons name="mic-off" size={14} color="#F44336" />
              )}
              {isRaised && (
                <Ionicons name="hand-left" size={14} color="#FFEB3B" />
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Connection quality indicator */}
        {item.connectionQuality && (
          <View
            style={[
              styles.connectionIndicator,
              item.connectionQuality === "excellent" &&
                styles.connectionExcellent,
              item.connectionQuality === "good" && styles.connectionGood,
              item.connectionQuality === "fair" && styles.connectionFair,
              item.connectionQuality === "poor" && styles.connectionPoor,
            ]}
          />
        )}
      </View>
    );
  };

  // Render chat message
  const renderChatMessage = ({ item }: { item: MeetingChatMessage }) => (
    <View style={styles.chatMessage}>
      <Text style={styles.chatSender}>{item.userName}</Text>
      <Text style={styles.chatContent}>{item.content}</Text>
      <Text style={styles.chatTime}>
        {new Date(item.timestamp).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  // Loading/Connecting state
  if (meetingState === "creating" || meetingState === "joining" || connecting) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="videocam" size={64} color="#4A90D9" />
        <Text style={styles.loadingText}>
          {meetingState === "creating"
            ? "Đang tạo phòng họp..."
            : "Đang tham gia..."}
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.meetingName} numberOfLines={1}>
            {currentRoom?.name || "Phòng họp"}
          </Text>
          <Text style={styles.participantCount}>
            {participants.length} người tham gia
          </Text>
        </View>

        <View style={styles.headerRight}>
          {isRecording && (
            <View style={styles.recordingBadge}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>REC</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              setSelectedLayout(selectedLayout === "grid" ? "speaker" : "grid")
            }
          >
            <Ionicons
              name={selectedLayout === "grid" ? "grid" : "expand"}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content area */}
      <View style={styles.mainContent}>
        {/* Participants grid */}
        <FlatList
          data={participants}
          renderItem={renderParticipantTile}
          keyExtractor={(item) => String(item.id)}
          numColumns={participants.length > 2 ? 2 : 1}
          key={participants.length > 2 ? "2col" : "1col"}
          contentContainerStyle={styles.participantsGrid}
          showsVerticalScrollIndicator={false}
        />

        {/* Chat panel (slide in from right) */}
        {showChat && (
          <View style={styles.chatPanel}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatHeaderTitle}>Tin nhắn</Text>
              <TouchableOpacity onPress={() => setShowChat(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={chatMessages}
              renderItem={renderChatMessage}
              keyExtractor={(item) => item.id}
              style={styles.chatList}
              contentContainerStyle={styles.chatListContent}
            />

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.chatInput}
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Nhập tin nhắn..."
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.chatSendButton}
                  onPress={handleSendChat}
                >
                  <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        )}

        {/* Participants panel */}
        {showParticipants && (
          <View style={styles.participantsPanel}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatHeaderTitle}>
                Người tham gia ({participants.length})
              </Text>
              <TouchableOpacity onPress={() => setShowParticipants(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={participants}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.participantListItem}>
                  <View style={styles.participantListAvatar}>
                    <Text style={styles.participantListAvatarText}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.participantListInfo}>
                    <Text style={styles.participantListName}>{item.name}</Text>
                    <Text style={styles.participantListRole}>
                      {item.role === "host"
                        ? "Host"
                        : item.role === "co-host"
                          ? "Co-host"
                          : ""}
                    </Text>
                  </View>
                  <View style={styles.participantListActions}>
                    {item.isMuted ? (
                      <Ionicons name="mic-off" size={18} color="#F44336" />
                    ) : (
                      <Ionicons name="mic" size={18} color="#4CAF50" />
                    )}
                  </View>
                </View>
              )}
            />
          </View>
        )}
      </View>

      {/* Bottom controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 12 }]}>
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
              color={isMuted ? "#F44336" : "#fff"}
            />
            <Text style={styles.controlLabel}>
              {isMuted ? "Bật mic" : "Tắt mic"}
            </Text>
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
              size={24}
              color={!isVideoOn ? "#F44336" : "#fff"}
            />
            <Text style={styles.controlLabel}>
              {isVideoOn ? "Tắt cam" : "Bật cam"}
            </Text>
          </Pressable>

          {/* Screen share */}
          <Pressable
            style={[
              styles.controlButton,
              isScreenSharing && styles.controlButtonSharing,
            ]}
            onPress={toggleScreenShare}
          >
            <Ionicons
              name="laptop"
              size={24}
              color={isScreenSharing ? "#4CAF50" : "#fff"}
            />
            <Text style={styles.controlLabel}>Chia sẻ</Text>
          </Pressable>

          {/* Raise hand */}
          <Pressable
            style={styles.controlButton}
            onPress={
              raisedHands.includes(Number(user?.id) || 0)
                ? lowerHand
                : raiseHand
            }
          >
            <Ionicons
              name="hand-left"
              size={24}
              color={
                raisedHands.includes(Number(user?.id) || 0) ? "#FFEB3B" : "#fff"
              }
            />
            <Text style={styles.controlLabel}>Giơ tay</Text>
          </Pressable>

          {/* Chat */}
          <Pressable
            style={[
              styles.controlButton,
              showChat && styles.controlButtonActive,
            ]}
            onPress={() => {
              setShowChat(!showChat);
              setShowParticipants(false);
            }}
          >
            <Ionicons name="chatbubble" size={24} color="#fff" />
            <Text style={styles.controlLabel}>Chat</Text>
          </Pressable>

          {/* Participants */}
          <Pressable
            style={[
              styles.controlButton,
              showParticipants && styles.controlButtonActive,
            ]}
            onPress={() => {
              setShowParticipants(!showParticipants);
              setShowChat(false);
            }}
          >
            <Ionicons name="people" size={24} color="#fff" />
            <Text style={styles.controlLabel}>Người</Text>
          </Pressable>
        </View>

        {/* Leave/End button */}
        <Pressable style={styles.leaveButton} onPress={handleLeaveMeeting}>
          <Ionicons name="exit" size={24} color="#fff" />
          <Text style={styles.leaveButtonText}>Rời phòng</Text>
        </Pressable>
      </View>

      {/* Reactions overlay */}
      <View style={styles.reactionsBar}>
        {["👍", "👏", "😀", "❤️", "🎉"].map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={styles.reactionButton}
            onPress={() => sendReaction(emoji)}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: "#F44336",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#4A90D9",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flex: 1,
  },
  meetingName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  participantCount: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recordingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(244, 67, 54, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F44336",
  },
  recordingText: {
    color: "#F44336",
    fontSize: 12,
    fontWeight: "700",
  },
  headerButton: {
    padding: 8,
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
  },
  participantsGrid: {
    padding: 8,
    alignItems: "center",
  },
  participantTile: {
    backgroundColor: "#2a2a3e",
    borderRadius: 12,
    margin: 4,
    overflow: "hidden",
    position: "relative",
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlaceholderText: {
    color: "#666",
    fontSize: 14,
  },
  avatarContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4A90D9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "600",
  },
  participantOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  participantInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  participantBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hostBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#333",
  },
  connectionIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connectionExcellent: {
    backgroundColor: "#4CAF50",
  },
  connectionGood: {
    backgroundColor: "#8BC34A",
  },
  connectionFair: {
    backgroundColor: "#FFC107",
  },
  connectionPoor: {
    backgroundColor: "#F44336",
  },
  chatPanel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  participantsPanel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    padding: 12,
  },
  chatMessage: {
    marginBottom: 12,
  },
  chatSender: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  chatContent: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  chatTime: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  chatInputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  chatSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4A90D9",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  participantListItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  participantListAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4A90D9",
    justifyContent: "center",
    alignItems: "center",
  },
  participantListAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  participantListInfo: {
    flex: 1,
    marginLeft: 12,
  },
  participantListName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  participantListRole: {
    fontSize: 12,
    color: "#666",
  },
  participantListActions: {
    flexDirection: "row",
    gap: 8,
  },
  controls: {
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 50,
  },
  controlButtonActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  controlButtonSharing: {
    backgroundColor: "rgba(76, 175, 80, 0.3)",
  },
  controlLabel: {
    color: "#fff",
    fontSize: 10,
    marginTop: 4,
  },
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  leaveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  reactionsBar: {
    position: "absolute",
    left: 16,
    bottom: 180,
    flexDirection: "column",
    gap: 8,
  },
  reactionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  reactionEmoji: {
    fontSize: 20,
  },
});
