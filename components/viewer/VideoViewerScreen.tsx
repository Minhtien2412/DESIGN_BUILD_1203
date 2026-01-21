/**
 * VideoViewerScreen.tsx
 *
 * Full-featured video viewer with playback controls, playlist, and PiP support
 *
 * Story: VIEW-003 - Video Viewer (from File Manager)
 */

import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    clampVolume,
    formatDuration,
    PLAYBACK_SPEEDS,
    PlaylistItem,
    shouldResumePlayback,
    useOfflineVideos,
    usePlaybackPosition,
    usePlaylist,
    useVideoSettings,
    VideoSource
} from "../../services/VideoViewerService";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// =============================================================================
// Types
// =============================================================================

interface VideoViewerScreenProps {
  video: VideoSource;
  playlist?: PlaylistItem[];
  onClose?: () => void;
  onVideoChange?: (video: VideoSource) => void;
}

// =============================================================================
// Main Component
// =============================================================================

export default function VideoViewerScreen({
  video,
  playlist = [],
  onClose,
  onVideoChange,
}: VideoViewerScreenProps) {
  const videoRef = useRef<Video>(null);
  const { settings, updateSettings } = useVideoSettings();
  const { position: savedPosition, savePosition } = usePlaybackPosition(
    video.id
  );
  const {
    playlist: userPlaylist,
    addVideo,
    removeVideo,
    getNext,
    getPrevious,
  } = usePlaylist();
  const { isOffline, download } = useOfflineVideos();

  // Playback state
  const [isPlaying, setIsPlaying] = useState(settings.autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(
    settings.defaultPlaybackSpeed
  );
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // UI state
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(
    settings.fullscreenByDefault
  );
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // =============================================================================
  // Effects
  // =============================================================================

  useEffect(() => {
    // Resume from saved position
    if (
      savedPosition &&
      shouldResumePlayback(
        savedPosition.position,
        savedPosition.duration,
        settings.resumeThreshold
      )
    ) {
      videoRef.current?.setPositionAsync(savedPosition.position * 1000);
    }

    return () => {
      // Save position on unmount
      if (settings.savePlaybackPosition && duration > 0) {
        savePosition(currentTime, duration);
      }
    };
  }, []);

  useEffect(() => {
    // Auto-hide controls
    if (showControls && isPlaying) {
      resetControlsTimeout();
    }
  }, [showControls, isPlaying]);

  // =============================================================================
  // Handlers
  // =============================================================================

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, settings.autoHideControlsDelay);
  }, [settings.autoHideControlsDelay]);

  const handlePlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (status.isLoaded) {
        setCurrentTime(status.positionMillis / 1000);
        setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
        setIsPlaying(status.isPlaying);
        setIsBuffering(status.isBuffering);

        // Handle end of video
        if (status.didJustFinish) {
          if (settings.loopVideo) {
            videoRef.current?.replayAsync();
          } else if (playlist.length > 0 || userPlaylist.length > 0) {
            handleNext();
          }
        }
      }
    },
    [settings.loopVideo, playlist, userPlaylist]
  );

  const togglePlayPause = async () => {
    if (isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      await videoRef.current?.playAsync();
    }
    setShowControls(true);
    resetControlsTimeout();
  };

  const handleSeek = async (value: number) => {
    await videoRef.current?.setPositionAsync(value * 1000);
    setShowControls(true);
    resetControlsTimeout();
  };

  const handleSeekBackward = async () => {
    const newTime = Math.max(0, currentTime - settings.seekIntervalSeconds);
    await handleSeek(newTime);
  };

  const handleSeekForward = async () => {
    const newTime = Math.min(
      duration,
      currentTime + settings.seekIntervalSeconds
    );
    await handleSeek(newTime);
  };

  const handleVolumeChange = async (value: number) => {
    const clamped = clampVolume(value);
    setVolume(clamped);
    await videoRef.current?.setVolumeAsync(clamped);
    if (clamped > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    await videoRef.current?.setIsMutedAsync(newMuted);
  };

  const handleSpeedChange = async (speed: number) => {
    setPlaybackSpeed(speed);
    await videoRef.current?.setRateAsync(speed, true);
    updateSettings({ defaultPlaybackSpeed: speed });
    setShowSpeedModal(false);
  };

  const handleNext = useCallback(() => {
    const activePlaylist = playlist.length > 0 ? playlist : userPlaylist;
    const next = getNext(video.id, settings.loopPlaylist);
    if (next) {
      onVideoChange?.(next);
    }
  }, [
    playlist,
    userPlaylist,
    video.id,
    settings.loopPlaylist,
    getNext,
    onVideoChange,
  ]);

  const handlePrevious = useCallback(() => {
    const activePlaylist = playlist.length > 0 ? playlist : userPlaylist;
    const prev = getPrevious(video.id, settings.loopPlaylist);
    if (prev) {
      onVideoChange?.(prev);
    }
  }, [
    playlist,
    userPlaylist,
    video.id,
    settings.loopPlaylist,
    getPrevious,
    onVideoChange,
  ]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownloadOffline = async () => {
    if (isOffline(video.id)) {
      Alert.alert("Thông báo", "Video đã được tải xuống");
      return;
    }

    setIsDownloading(true);
    const result = await download(video, (progress) => {
      setDownloadProgress(progress);
    });

    setIsDownloading(false);
    if (result) {
      Alert.alert("Thành công", "Đã tải video để xem offline");
    } else {
      Alert.alert("Lỗi", "Không thể tải video");
    }
  };

  const handleShare = async () => {
    const { shareVideo } = await import("../../services/VideoViewerService");
    const success = await shareVideo(video.uri);
    if (!success) {
      Alert.alert("Lỗi", "Không thể chia sẻ video");
    }
  };

  const handleSaveToGallery = async () => {
    const { saveVideoToGallery } =
      await import("../../services/VideoViewerService");
    const success = await saveVideoToGallery(video.uri);
    if (success) {
      Alert.alert("Thành công", "Đã lưu video vào thư viện");
    } else {
      Alert.alert("Lỗi", "Không thể lưu video");
    }
  };

  const handleAddToPlaylist = async () => {
    await addVideo(video);
    Alert.alert("Thành công", "Đã thêm vào playlist");
  };

  // =============================================================================
  // Render Components
  // =============================================================================

  const renderControls = () => {
    if (!showControls) return null;

    return (
      <View style={styles.controlsOverlay}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {video.title || "Video"}
          </Text>
          <TouchableOpacity
            onPress={() => setShowInfoModal(true)}
            style={styles.iconButton}
          >
            <Ionicons
              name="information-circle-outline"
              size={28}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Center controls */}
        <View style={styles.centerControls}>
          <TouchableOpacity
            onPress={handlePrevious}
            style={styles.controlButton}
          >
            <Ionicons name="play-skip-back" size={40} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSeekBackward}
            style={styles.controlButton}
          >
            <Ionicons name="play-back" size={36} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={50}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSeekForward}
            style={styles.controlButton}
          >
            <Ionicons name="play-forward" size={36} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={40} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatDuration(currentTime)}</Text>
            <Slider
              style={styles.progressSlider}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onValueChange={handleSeek}
              minimumTrackTintColor="#FF6B00"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor="#fff"
            />
            <Text style={styles.timeText}>{formatDuration(duration)}</Text>
          </View>

          {/* Control buttons */}
          <View style={styles.bottomControls}>
            <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
              <Ionicons
                name={
                  isMuted
                    ? "volume-mute"
                    : volume > 0.5
                      ? "volume-high"
                      : "volume-low"
                }
                size={24}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowSpeedModal(true)}
              style={styles.iconButton}
            >
              <Text style={styles.speedText}>{playbackSpeed}x</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPlaylistModal(true)}
              style={styles.iconButton}
            >
              <Ionicons name="list" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleFullscreen}
              style={styles.iconButton}
            >
              <Ionicons
                name={isFullscreen ? "contract" : "expand"}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Buffering indicator */}
        {isBuffering && (
          <View style={styles.bufferingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>
    );
  };

  const renderPlaylistModal = () => (
    <Modal
      visible={showPlaylistModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowPlaylistModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Playlist</Text>
            <TouchableOpacity onPress={() => setShowPlaylistModal(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.playlistScroll}>
            {(playlist.length > 0 ? playlist : userPlaylist).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.playlistItem,
                  item.id === video.id && styles.playlistItemActive,
                ]}
                onPress={() => {
                  onVideoChange?.(item);
                  setShowPlaylistModal(false);
                }}
              >
                <Ionicons
                  name={item.id === video.id ? "play-circle" : "videocam"}
                  size={24}
                  color={item.id === video.id ? "#FF6B00" : "#666"}
                />
                <Text
                  style={[
                    styles.playlistItemText,
                    item.id === video.id && styles.playlistItemTextActive,
                  ]}
                  numberOfLines={2}
                >
                  {item.title || "Video"}
                </Text>
              </TouchableOpacity>
            ))}

            {playlist.length === 0 && userPlaylist.length === 0 && (
              <Text style={styles.emptyText}>Chưa có video trong playlist</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSpeedModal = () => (
    <Modal
      visible={showSpeedModal}
      animationType="fade"
      transparent
      onRequestClose={() => setShowSpeedModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowSpeedModal(false)}
      >
        <View style={styles.speedModalContent}>
          <Text style={styles.modalTitle}>Tốc độ phát</Text>
          {PLAYBACK_SPEEDS.map((speed) => (
            <TouchableOpacity
              key={speed.value}
              style={[
                styles.speedItem,
                playbackSpeed === speed.value && styles.speedItemActive,
              ]}
              onPress={() => handleSpeedChange(speed.value)}
            >
              <Text
                style={[
                  styles.speedItemText,
                  playbackSpeed === speed.value && styles.speedItemTextActive,
                ]}
              >
                {speed.label}
              </Text>
              {playbackSpeed === speed.value && (
                <Ionicons name="checkmark" size={20} color="#FF6B00" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderInfoModal = () => (
    <Modal
      visible={showInfoModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowInfoModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thông tin video</Text>
            <TouchableOpacity onPress={() => setShowInfoModal(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.infoScroll}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tiêu đề:</Text>
              <Text style={styles.infoValue}>
                {video.title || "Không có tiêu đề"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thời lượng:</Text>
              <Text style={styles.infoValue}>{formatDuration(duration)}</Text>
            </View>

            {video.size && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kích thước:</Text>
                <Text style={styles.infoValue}>
                  {(video.size / (1024 * 1024)).toFixed(1)} MB
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tốc độ phát:</Text>
              <Text style={styles.infoValue}>{playbackSpeed}x</Text>
            </View>

            {/* Action buttons */}
            <View style={styles.infoActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Chia sẻ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSaveToGallery}
              >
                <Ionicons name="download-outline" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Lưu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDownloadOffline}
              >
                <Ionicons
                  name="cloud-download-outline"
                  size={24}
                  color="#fff"
                />
                <Text style={styles.actionButtonText}>
                  {isOffline(video.id) ? "Đã tải" : "Offline"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAddToPlaylist}
              >
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Playlist</Text>
              </TouchableOpacity>
            </View>

            {isDownloading && (
              <View style={styles.downloadProgress}>
                <Text style={styles.downloadText}>
                  Đang tải: {downloadProgress.toFixed(0)}%
                </Text>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${downloadProgress}%` },
                    ]}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // =============================================================================
  // Main Render
  // =============================================================================

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={() => {
          setShowControls(!showControls);
          if (!showControls) {
            resetControlsTimeout();
          }
        }}
      >
        <Video
          ref={videoRef}
          source={{ uri: video.uri }}
          style={styles.video}
          resizeMode={
            settings.maintainAspectRatio ? ResizeMode.CONTAIN : ResizeMode.COVER
          }
          shouldPlay={settings.autoPlay}
          isLooping={settings.loopVideo}
          volume={volume}
          isMuted={isMuted}
          rate={playbackSpeed}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls={false}
        />

        {renderControls()}
      </TouchableOpacity>

      {renderPlaylistModal()}
      {renderSpeedModal()}
      {renderInfoModal()}
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginHorizontal: 12,
  },
  centerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  controlButton: {
    padding: 12,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressSlider: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#fff",
    minWidth: 45,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  iconButton: {
    padding: 8,
  },
  speedText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
    paddingBottom: Platform.OS === "ios" ? 34 : 0,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  playlistScroll: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  playlistItemActive: {
    backgroundColor: "#FFF5F0",
  },
  playlistItemText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  playlistItemTextActive: {
    color: "#FF6B00",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    padding: 32,
    fontSize: 14,
  },

  // Speed modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  speedModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
  },
  speedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
  },
  speedItemActive: {
    backgroundColor: "#FFF5F0",
  },
  speedItemText: {
    fontSize: 16,
    color: "#333",
  },
  speedItemTextActive: {
    color: "#FF6B00",
    fontWeight: "600",
  },

  // Info modal
  infoScroll: {
    padding: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
  },
  infoActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FF6B00",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  downloadProgress: {
    marginTop: 24,
  },
  downloadText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF6B00",
  },
});
