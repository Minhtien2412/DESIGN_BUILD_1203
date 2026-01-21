/**
 * Livestream Broadcaster Screen
 * Create and manage livestreams
 *
 * @created 19/01/2026
 */

import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import livestreamSocketService, {
    LivestreamComment,
    LivestreamInfo,
    LivestreamPoll,
    StreamCredentials,
} from "@/services/communication/livestreamSocket.service";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================================================
// Types
// ============================================================================

type BroadcasterStatus = "setup" | "preview" | "starting" | "live" | "ending";

// ============================================================================
// Main Component
// ============================================================================

export default function LivestreamBroadcasterScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Stream setup state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Broadcast state
  const [status, setStatus] = useState<BroadcasterStatus>("setup");
  const [streamInfo, setStreamInfo] = useState<LivestreamInfo | null>(null);
  const [credentials, setCredentials] = useState<StreamCredentials | null>(
    null
  );
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live stats
  const [viewerCount, setViewerCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [comments, setComments] = useState<LivestreamComment[]>([]);
  const [activePoll, setActivePoll] = useState<LivestreamPoll | null>(null);

  // Poll creation
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDuration, setPollDuration] = useState(60);

  // Refs
  const cleanupRef = useRef<(() => void)[]>([]);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const commentsListRef = useRef<FlatList>(null);

  // =========================================================================
  // Connection & Event Setup
  // =========================================================================

  const connectSocket = useCallback(async () => {
    if (connected || connecting) return;

    try {
      setConnecting(true);
      setError(null);

      await livestreamSocketService.connect();
      setConnected(true);

      setupEventListeners();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setConnecting(false);
    }
  }, [connected, connecting]);

  const setupEventListeners = () => {
    // Stream created
    const unsubCreated = livestreamSocketService.onStreamCreated(
      ({ stream, credentials: creds }) => {
        console.log("[Broadcaster] Stream created:", stream.id);
        setStreamInfo(stream);
        setCredentials(creds);
        setStatus("preview");
      }
    );
    cleanupRef.current.push(unsubCreated);

    // Stream started
    const unsubStarted = livestreamSocketService.onStreamStarted(
      ({ streamId }) => {
        console.log("[Broadcaster] Stream started:", streamId);
        setStatus("live");
        startDurationTimer();
      }
    );
    cleanupRef.current.push(unsubStarted);

    // Stream ended
    const unsubEnded = livestreamSocketService.onStreamEnded(({ reason }) => {
      console.log("[Broadcaster] Stream ended:", reason);
      setStatus("ending");
      stopDurationTimer();
    });
    cleanupRef.current.push(unsubEnded);

    // Viewer count
    const unsubViewerCount = livestreamSocketService.onViewerCount(
      ({ count }) => {
        setViewerCount(count);
      }
    );
    cleanupRef.current.push(unsubViewerCount);

    // New comment
    const unsubComment = livestreamSocketService.onNewComment((comment) => {
      setComments((prev) => [...prev.slice(-99), comment]);
    });
    cleanupRef.current.push(unsubComment);

    // Like received
    const unsubLike = livestreamSocketService.onLikeReceived(
      ({ totalLikes }) => {
        setLikeCount(totalLikes);
      }
    );
    cleanupRef.current.push(unsubLike);

    // Poll events
    const unsubPollCreated = livestreamSocketService.onPollCreated((poll) => {
      setActivePoll(poll);
    });
    cleanupRef.current.push(unsubPollCreated);

    const unsubPollUpdated = livestreamSocketService.onPollUpdated((poll) => {
      setActivePoll(poll);
    });
    cleanupRef.current.push(unsubPollUpdated);

    // Error
    const unsubError = livestreamSocketService.onError(({ message }) => {
      setError(message);
    });
    cleanupRef.current.push(unsubError);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDurationTimer();
      cleanupRef.current.forEach((cleanup) => cleanup());
      livestreamSocketService.disconnect();
    };
  }, []);

  // =========================================================================
  // Duration Timer
  // =========================================================================

  const startDurationTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // =========================================================================
  // Actions
  // =========================================================================

  const handleCreateStream = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tiêu đề stream");
      return;
    }

    if (!connected) {
      await connectSocket();
    }

    livestreamSocketService.createStream({
      title: title.trim(),
      description: description.trim() || undefined,
      isPrivate,
      tags: tags.length > 0 ? tags : undefined,
    });
  }, [title, description, isPrivate, tags, connected, connectSocket]);

  const handleStartStream = useCallback(() => {
    if (!streamInfo) return;

    setStatus("starting");
    livestreamSocketService.startStream(streamInfo.id);
  }, [streamInfo]);

  const handleEndStream = useCallback(() => {
    Alert.alert(
      "Kết thúc livestream?",
      "Bạn có chắc muốn kết thúc livestream này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Kết thúc",
          style: "destructive",
          onPress: () => {
            if (streamInfo) {
              livestreamSocketService.endStream(streamInfo.id);
            }
          },
        },
      ]
    );
  }, [streamInfo]);

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback(
    (tag: string) => {
      setTags(tags.filter((t) => t !== tag));
    },
    [tags]
  );

  const handleCreatePoll = useCallback(() => {
    if (!streamInfo || !pollQuestion.trim()) return;

    const validOptions = pollOptions.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      Alert.alert("Lỗi", "Cần ít nhất 2 lựa chọn");
      return;
    }

    livestreamSocketService.createPoll(
      streamInfo.id,
      pollQuestion.trim(),
      validOptions.map((opt) => opt.trim()),
      pollDuration
    );

    // Reset form
    setPollQuestion("");
    setPollOptions(["", ""]);
    setShowPollCreator(false);
  }, [streamInfo, pollQuestion, pollOptions, pollDuration]);

  const handleEndPoll = useCallback(() => {
    if (!activePoll) return;
    livestreamSocketService.endPoll(activePoll.id);
    setActivePoll(null);
  }, [activePoll]);

  const handlePinComment = useCallback(
    (commentId: string) => {
      if (!streamInfo) return;
      livestreamSocketService.pinComment(streamInfo.id, commentId);
    },
    [streamInfo]
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      if (!streamInfo) return;
      livestreamSocketService.deleteComment(streamInfo.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    },
    [streamInfo]
  );

  const handleClose = useCallback(() => {
    if (status === "live") {
      Alert.alert(
        "Thoát?",
        "Stream đang diễn ra. Bạn có chắc muốn thoát và kết thúc stream?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Thoát",
            style: "destructive",
            onPress: () => {
              if (streamInfo) {
                livestreamSocketService.endStream(streamInfo.id);
              }
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  }, [status, streamInfo, router]);

  // =========================================================================
  // Render Functions
  // =========================================================================

  const renderSetupScreen = () => (
    <ScrollView
      style={styles.setupContainer}
      contentContainerStyle={styles.setupContent}
    >
      <Text style={styles.sectionTitle}>Thông tin livestream</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Tiêu đề *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Nhập tiêu đề stream..."
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Mô tả</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Mô tả về nội dung stream..."
          placeholderTextColor="#666"
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={500}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Tags (tối đa 5)</Text>
        <View style={styles.tagInputRow}>
          <TextInput
            style={[styles.textInput, styles.tagInput]}
            placeholder="Thêm tag..."
            placeholderTextColor="#666"
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={handleAddTag}
          />
          <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tag}
                onPress={() => handleRemoveTag(tag)}
              >
                <Text style={styles.tagText}>{tag}</Text>
                <Ionicons name="close" size={16} color="#FFF" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => setIsPrivate(!isPrivate)}
      >
        <View style={styles.toggleInfo}>
          <Ionicons
            name={isPrivate ? "lock-closed" : "lock-open"}
            size={24}
            color={isPrivate ? "#FF4444" : "#888"}
          />
          <View style={styles.toggleText}>
            <Text style={styles.toggleTitle}>
              {isPrivate ? "Stream riêng tư" : "Stream công khai"}
            </Text>
            <Text style={styles.toggleDesc}>
              {isPrivate
                ? "Chỉ người có link mới xem được"
                : "Mọi người đều có thể xem"}
            </Text>
          </View>
        </View>
        <View
          style={[styles.toggleSwitch, isPrivate && styles.toggleSwitchActive]}
        >
          <View
            style={[styles.toggleThumb, isPrivate && styles.toggleThumbActive]}
          />
        </View>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={20} color="#FF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.startButton,
          !title.trim() && styles.startButtonDisabled,
        ]}
        onPress={handleCreateStream}
        disabled={!title.trim() || connecting}
      >
        {connecting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons name="videocam" size={24} color="#FFF" />
            <Text style={styles.startButtonText}>Tạo livestream</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPreviewScreen = () => (
    <View style={styles.previewContainer}>
      <View style={styles.previewVideo}>
        <Ionicons name="videocam" size={64} color="#666" />
        <Text style={styles.previewText}>Camera preview</Text>
      </View>

      {credentials && (
        <View style={styles.streamKeyContainer}>
          <Text style={styles.streamKeyLabel}>RTMP URL</Text>
          <View style={styles.streamKeyBox}>
            <Text style={styles.streamKeyValue} numberOfLines={1}>
              {credentials.rtmpUrl}
            </Text>
          </View>
          <Text style={styles.streamKeyLabel}>Stream Key</Text>
          <View style={styles.streamKeyBox}>
            <Text style={styles.streamKeyValue}>{"•".repeat(20)}</Text>
            <TouchableOpacity>
              <Ionicons name="copy" size={20} color="#888" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.previewActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.goLiveButton}
          onPress={handleStartStream}
          disabled={status === "starting"}
        >
          {status === "starting" ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="radio" size={20} color="#FFF" />
              <Text style={styles.goLiveText}>Bắt đầu LIVE</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLiveScreen = () => (
    <View style={styles.liveContainer}>
      {/* Video Area */}
      <View style={styles.liveVideo}>
        <Text style={styles.liveVideoPlaceholder}>📹 Camera</Text>

        {/* Live Badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
          <Text style={styles.liveDuration}>{formatDuration(duration)}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="eye" size={16} color="#FFF" />
            <Text style={styles.statValue}>{viewerCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={16} color="#FF4444" />
            <Text style={styles.statValue}>{likeCount}</Text>
          </View>
        </View>
      </View>

      {/* Comments Section */}
      <View style={styles.liveBottom}>
        <FlatList
          ref={commentsListRef}
          data={comments}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.liveComment}
              onLongPress={() => {
                Alert.alert("Tùy chọn", "", [
                  {
                    text: "Ghim bình luận",
                    onPress: () => handlePinComment(item.id),
                  },
                  {
                    text: "Xóa bình luận",
                    style: "destructive",
                    onPress: () => handleDeleteComment(item.id),
                  },
                  { text: "Hủy", style: "cancel" },
                ]);
              }}
            >
              {item.isPinned && (
                <Ionicons name="pin" size={12} color="#FFD700" />
              )}
              <Text style={styles.liveCommentUser}>{item.userName}: </Text>
              <Text style={styles.liveCommentText}>{item.content}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          style={styles.liveCommentsList}
          inverted
        />

        {/* Poll Display */}
        {activePoll && (
          <View style={styles.activePollContainer}>
            <View style={styles.pollHeader}>
              <Text style={styles.pollQuestion}>{activePoll.question}</Text>
              <TouchableOpacity onPress={handleEndPoll}>
                <Text style={styles.endPollText}>Kết thúc</Text>
              </TouchableOpacity>
            </View>
            {activePoll.options.map((opt) => (
              <View key={opt.id} style={styles.pollResultOption}>
                <Text style={styles.pollResultText}>{opt.text}</Text>
                <Text style={styles.pollResultVotes}>
                  {opt.voteCount} votes
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Controls */}
        <View style={styles.liveControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowPollCreator(true)}
          >
            <Ionicons name="stats-chart" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.endLiveButton}
            onPress={handleEndStream}
          >
            <Ionicons name="stop" size={24} color="#FFF" />
            <Text style={styles.endLiveText}>Kết thúc</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Poll Creator Modal */}
      {showPollCreator && (
        <View style={styles.pollCreatorOverlay}>
          <View style={styles.pollCreatorModal}>
            <View style={styles.pollCreatorHeader}>
              <Text style={styles.pollCreatorTitle}>Tạo bình chọn</Text>
              <TouchableOpacity onPress={() => setShowPollCreator(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.pollInput}
              placeholder="Câu hỏi..."
              placeholderTextColor="#666"
              value={pollQuestion}
              onChangeText={setPollQuestion}
            />

            {pollOptions.map((opt, index) => (
              <View key={index} style={styles.pollOptionInputRow}>
                <TextInput
                  style={[styles.pollInput, styles.pollOptionInput]}
                  placeholder={`Lựa chọn ${index + 1}`}
                  placeholderTextColor="#666"
                  value={opt}
                  onChangeText={(text) => {
                    const newOptions = [...pollOptions];
                    newOptions[index] = text;
                    setPollOptions(newOptions);
                  }}
                />
                {pollOptions.length > 2 && (
                  <TouchableOpacity
                    onPress={() => {
                      setPollOptions(pollOptions.filter((_, i) => i !== index));
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {pollOptions.length < 4 && (
              <TouchableOpacity
                style={styles.addOptionButton}
                onPress={() => setPollOptions([...pollOptions, ""])}
              >
                <Ionicons name="add" size={20} color="#FF4444" />
                <Text style={styles.addOptionText}>Thêm lựa chọn</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.createPollButton}
              onPress={handleCreatePoll}
            >
              <Text style={styles.createPollText}>Tạo bình chọn</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderEndingScreen = () => (
    <View style={styles.endingContainer}>
      <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
      <Text style={styles.endingTitle}>Livestream đã kết thúc</Text>

      <View style={styles.finalStats}>
        <View style={styles.finalStatItem}>
          <Ionicons name="time" size={24} color="#888" />
          <Text style={styles.finalStatValue}>{formatDuration(duration)}</Text>
          <Text style={styles.finalStatLabel}>Thời lượng</Text>
        </View>
        <View style={styles.finalStatItem}>
          <Ionicons name="eye" size={24} color="#888" />
          <Text style={styles.finalStatValue}>{viewerCount}</Text>
          <Text style={styles.finalStatLabel}>Lượt xem cao nhất</Text>
        </View>
        <View style={styles.finalStatItem}>
          <Ionicons name="heart" size={24} color="#888" />
          <Text style={styles.finalStatValue}>{likeCount}</Text>
          <Text style={styles.finalStatLabel}>Lượt thích</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
        <Text style={styles.doneButtonText}>Xong</Text>
      </TouchableOpacity>
    </View>
  );

  // =========================================================================
  // Main Render
  // =========================================================================

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {status === "setup" && "Tạo livestream"}
          {status === "preview" && "Chuẩn bị"}
          {status === "starting" && "Đang bắt đầu..."}
          {status === "live" && "Đang LIVE"}
          {status === "ending" && "Kết thúc"}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      {status === "setup" && renderSetupScreen()}
      {status === "preview" && renderPreviewScreen()}
      {(status === "live" || status === "starting") && renderLiveScreen()}
      {status === "ending" && renderEndingScreen()}
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },

  // Setup Screen
  setupContainer: {
    flex: 1,
  },
  setupContent: {
    padding: 20,
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#888",
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 14,
    color: "#FFF",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  tagInputRow: {
    flexDirection: "row",
    gap: 10,
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    color: "#FFF",
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleText: {
    gap: 2,
  },
  toggleTitle: {
    color: "#FFF",
    fontSize: 16,
  },
  toggleDesc: {
    color: "#666",
    fontSize: 12,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#333",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleSwitchActive: {
    backgroundColor: "#FF4444",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,68,68,0.2)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    flex: 1,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF4444",
    padding: 16,
    borderRadius: 12,
    gap: 10,
    marginTop: 10,
  },
  startButtonDisabled: {
    backgroundColor: "#444",
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },

  // Preview Screen
  previewContainer: {
    flex: 1,
  },
  previewVideo: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  previewText: {
    color: "#666",
    fontSize: 16,
    marginTop: 12,
  },
  streamKeyContainer: {
    padding: 16,
    backgroundColor: "#111",
  },
  streamKeyLabel: {
    color: "#888",
    fontSize: 12,
    marginBottom: 4,
    marginTop: 8,
  },
  streamKeyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  streamKeyValue: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  previewActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#111",
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  goLiveButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF4444",
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  goLiveText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Live Screen
  liveContainer: {
    flex: 1,
  },
  liveVideo: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  liveVideoPlaceholder: {
    color: "#666",
    fontSize: 24,
  },
  liveBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4444",
  },
  liveText: {
    color: "#FF4444",
    fontSize: 14,
    fontWeight: "700",
  },
  liveDuration: {
    color: "#FFF",
    fontSize: 14,
  },
  statsRow: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statValue: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  liveBottom: {
    height: SCREEN_HEIGHT * 0.35,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  liveCommentsList: {
    flex: 1,
    padding: 12,
  },
  liveComment: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
    alignSelf: "flex-start",
    maxWidth: "85%",
    gap: 4,
  },
  liveCommentUser: {
    color: "#FF4444",
    fontSize: 13,
    fontWeight: "600",
  },
  liveCommentText: {
    color: "#FFF",
    fontSize: 13,
    flexShrink: 1,
  },
  activePollContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    margin: 12,
    padding: 12,
    borderRadius: 12,
  },
  pollHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pollQuestion: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  endPollText: {
    color: "#FF4444",
    fontSize: 14,
  },
  pollResultOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  pollResultText: {
    color: "#FFF",
    fontSize: 13,
  },
  pollResultVotes: {
    color: "#888",
    fontSize: 13,
  },
  liveControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  endLiveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4444",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  endLiveText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Poll Creator
  pollCreatorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },
  pollCreatorModal: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
  },
  pollCreatorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pollCreatorTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  pollInput: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
    color: "#FFF",
    fontSize: 16,
    marginBottom: 12,
  },
  pollOptionInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pollOptionInput: {
    flex: 1,
  },
  addOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    gap: 6,
  },
  addOptionText: {
    color: "#FF4444",
    fontSize: 14,
  },
  createPollButton: {
    backgroundColor: "#FF4444",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  createPollText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Ending Screen
  endingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  endingTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 32,
  },
  finalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 40,
  },
  finalStatItem: {
    alignItems: "center",
    gap: 4,
  },
  finalStatValue: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700",
  },
  finalStatLabel: {
    color: "#666",
    fontSize: 12,
  },
  doneButton: {
    backgroundColor: "#FF4444",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  doneButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
