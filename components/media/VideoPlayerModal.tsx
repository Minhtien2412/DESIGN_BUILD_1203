/**
 * Universal Video Player Modal
 * ==============================
 *
 * Trình phát video đa năng theo chuẩn quốc tế:
 * - Hỗ trợ MP4/HLS/DASH streams từ server (expo-video)
 * - Hỗ trợ YouTube links (WebView fallback)
 * - Range request streaming cho video lớn
 * - Controls: play/pause, seekbar, fullscreen, volume
 * - Caching & buffering indicators
 *
 * Pipeline: Server upload → Storage → Cache → Stream → Player
 *
 * @author ThietKeResort Team
 * @created 2026-02-26
 */

import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync } from "expo-audio";
import type { VideoPlayerStatus } from "expo-video";
import { useVideoPlayer, VideoView } from "expo-video";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================
// Helpers
// ============================================

/** Detect if URL is a YouTube link */
function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be|youtube-nocookie\.com)/i.test(url);
}

/** Extract YouTube video ID */
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /m\.youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/** Format seconds to mm:ss or hh:mm:ss */
function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  if (s < 0) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/** Generate YouTube embed HTML */
function generateYouTubeEmbed(videoId: string): string {
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;background:#000;overflow:hidden}
iframe{width:100%;height:100%;border:none}</style></head><body>
<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1"
allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share"
allowfullscreen></iframe></body></html>`;
}

// ============================================
// Types
// ============================================

export interface VideoPlayerModalProps {
  visible: boolean;
  url: string;
  title?: string;
  onClose: () => void;
  /** Optional poster/thumbnail image */
  poster?: string;
  /** Auto-play when opened (default: true) */
  autoPlay?: boolean;
}

// ============================================
// Native Video Player (expo-video) for MP4/HLS/DASH
// ============================================

const NativeVideoPlayer = memo(
  ({
    url,
    title,
    poster,
    autoPlay = true,
    onClose,
  }: Omit<VideoPlayerModalProps, "visible">) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isBuffering, setIsBuffering] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const progress = duration > 0 ? position / duration : 0;
    const bufferProgress = duration > 0 ? buffered / duration : 0;

    const player = useVideoPlayer(url, (p) => {
      p.loop = false;
      p.timeUpdateEventInterval = 0.25;
      if (autoPlay) {
        p.play();
      }
    });

    useEffect(() => {
      // Enable audio in silent mode
      setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: "duckOthers",
      });
    }, []);

    // Subscribe to player events
    useEffect(() => {
      const statusSub = player.addListener(
        "statusChange",
        ({
          status,
          error: playerError,
        }: {
          status: VideoPlayerStatus;
          error?: { message: string };
        }) => {
          if (status === "readyToPlay") {
            setIsBuffering(false);
            setError(null);
            setDuration(player.duration);
          } else if (status === "loading") {
            setIsBuffering(true);
          } else if (status === "error") {
            setError(
              playerError?.message || "Không thể phát video. Vui lòng thử lại.",
            );
            setIsBuffering(false);
          } else if (status === "idle") {
            setIsBuffering(false);
          }
        },
      );

      const playingSub = player.addListener(
        "playingChange",
        ({ isPlaying: playing }: { isPlaying: boolean }) => {
          setIsPlaying(playing);
        },
      );

      const timeSub = player.addListener(
        "timeUpdate",
        ({
          currentTime,
          bufferedPosition,
        }: {
          currentTime: number;
          bufferedPosition?: number;
        }) => {
          setPosition(currentTime);
          if (bufferedPosition != null) {
            setBuffered(bufferedPosition);
          }
          // Also update duration in case it wasn't set yet
          if (player.duration > 0 && duration === 0) {
            setDuration(player.duration);
          }
        },
      );

      return () => {
        statusSub.remove();
        playingSub.remove();
        timeSub.remove();
      };
    }, [player, duration]);

    // Auto-hide controls after 3s
    const resetControlsTimer = useCallback(() => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    }, [isPlaying]);

    useEffect(() => {
      if (showControls && isPlaying) resetControlsTimer();
      return () => {
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      };
    }, [showControls, isPlaying, resetControlsTimer]);

    const toggleControls = useCallback(() => {
      setShowControls((prev) => !prev);
    }, []);

    const togglePlayPause = useCallback(() => {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
      resetControlsTimer();
    }, [isPlaying, player, resetControlsTimer]);

    const seekTo = useCallback(
      (fraction: number) => {
        if (duration <= 0) return;
        player.currentTime = fraction * duration;
        resetControlsTimer();
      },
      [duration, player, resetControlsTimer],
    );

    const skip = useCallback(
      (seconds: number) => {
        player.seekBy(seconds);
        resetControlsTimer();
      },
      [player, resetControlsTimer],
    );

    const handleRetry = useCallback(() => {
      setError(null);
      setIsBuffering(true);
      try {
        player.currentTime = 0;
        player.play();
      } catch {
        setError("Không thể kết nối đến server video");
      }
    }, [player]);

    if (error) {
      return (
        <View style={s.errorContainer}>
          <Ionicons name="videocam-off" size={48} color="#ff4444" />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={handleRetry}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={s.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={s.playerWrapper}>
        {/* Video */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleControls}
          style={s.videoTouchable}
        >
          <VideoView
            player={player}
            contentFit="contain"
            nativeControls={false}
            style={s.video}
          />
        </TouchableOpacity>

        {/* Buffering indicator */}
        {isBuffering && (
          <View style={s.bufferingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={s.bufferingText}>Đang tải...</Text>
          </View>
        )}

        {/* Controls overlay */}
        {showControls && (
          <View style={s.controlsOverlay}>
            {/* Top bar */}
            <View style={s.topBar}>
              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={s.titleText} numberOfLines={1}>
                {title || "Video"}
              </Text>
              <View style={s.topBarRight}>
                <TouchableOpacity style={s.topBtn}>
                  <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Center controls */}
            <View style={s.centerControls}>
              <TouchableOpacity onPress={() => skip(-10)} style={s.skipBtn}>
                <Ionicons
                  name="play-back"
                  size={28}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={s.skipLabel}>10s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={togglePlayPause}
                style={s.playPauseBtn}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={40}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => skip(10)} style={s.skipBtn}>
                <Ionicons
                  name="play-forward"
                  size={28}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={s.skipLabel}>10s</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom bar with seekbar */}
            <View style={s.bottomBar}>
              <Text style={s.timeText}>{formatTime(position)}</Text>

              {/* Seekbar */}
              <TouchableOpacity
                style={s.seekbarContainer}
                activeOpacity={1}
                onPress={(e) => {
                  const { locationX } = e.nativeEvent;
                  const barWidth = SCREEN_WIDTH - 130;
                  if (barWidth > 0) {
                    seekTo(Math.max(0, Math.min(1, locationX / barWidth)));
                  }
                }}
              >
                <View style={s.seekbarTrack}>
                  {/* Buffered */}
                  <View
                    style={[
                      s.seekbarBuffer,
                      { width: `${bufferProgress * 100}%` },
                    ]}
                  />
                  {/* Progress */}
                  <View
                    style={[s.seekbarProgress, { width: `${progress * 100}%` }]}
                  />
                  {/* Thumb */}
                  <View
                    style={[s.seekbarThumb, { left: `${progress * 100}%` }]}
                  />
                </View>
              </TouchableOpacity>

              <Text style={s.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </View>
    );
  },
);

// ============================================
// YouTube Player (WebView fallback)
// ============================================

const YouTubeVideoPlayer = memo(
  ({
    url,
    title,
    onClose,
  }: {
    url: string;
    title?: string;
    onClose: () => void;
  }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const videoId = extractYouTubeId(url);

    if (!videoId) {
      return (
        <View style={s.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ff4444" />
          <Text style={s.errorText}>URL video YouTube không hợp lệ</Text>
          <Text style={s.errorSubText}>{url}</Text>
        </View>
      );
    }

    const embedHtml = generateYouTubeEmbed(videoId);

    return (
      <View style={s.playerWrapper}>
        {loading && (
          <View style={s.bufferingOverlay}>
            <ActivityIndicator size="large" color="#ff0000" />
            <Text style={s.bufferingText}>Đang tải YouTube...</Text>
          </View>
        )}
        {error ? (
          <View style={s.errorContainer}>
            <Ionicons name="videocam-off" size={48} color="#ff4444" />
            <Text style={s.errorText}>Không thể phát video YouTube</Text>
            <TouchableOpacity
              style={s.retryBtn}
              onPress={() => setError(false)}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={s.retryBtnText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{ html: embedHtml }}
            style={s.webview}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={["*"]}
          />
        )}

        {/* Overlay header for YouTube */}
        <View
          style={[
            s.topBar,
            { position: "absolute", top: 0, left: 0, right: 0 },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.titleText} numberOfLines={1}>
            {title || "YouTube Video"}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>
    );
  },
);

// ============================================
// Main Exported Component
// ============================================

export const VideoPlayerModal = memo(
  ({
    visible,
    url,
    title,
    onClose,
    poster,
    autoPlay = true,
  }: VideoPlayerModalProps) => {
    const insets = useSafeAreaInsets();

    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    const isYT = isYouTubeUrl(url);

    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={handleClose}
        statusBarTranslucent
        supportedOrientations={["portrait", "landscape"]}
      >
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={[s.modalContainer, { paddingTop: insets.top }]}>
          {isYT ? (
            <YouTubeVideoPlayer url={url} title={title} onClose={handleClose} />
          ) : (
            <NativeVideoPlayer
              url={url}
              title={title}
              poster={poster}
              autoPlay={autoPlay}
              onClose={handleClose}
            />
          )}

          {/* Video info bar */}
          {title && (
            <View style={s.infoBar}>
              <Text style={s.infoTitle}>{title}</Text>
              <View style={s.infoActions}>
                <TouchableOpacity style={s.infoActionBtn}>
                  <Ionicons name="heart-outline" size={22} color="#fff" />
                  <Text style={s.infoActionText}>Thích</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.infoActionBtn}>
                  <Ionicons
                    name="share-social-outline"
                    size={22}
                    color="#fff"
                  />
                  <Text style={s.infoActionText}>Chia sẻ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.infoActionBtn}>
                  <Ionicons name="download-outline" size={22} color="#fff" />
                  <Text style={s.infoActionText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    );
  },
);

// ============================================
// Styles
// ============================================

const s = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },

  // Player wrapper
  playerWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
    justifyContent: "center",
  },
  videoTouchable: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },

  // Buffering
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 20,
  },
  bufferingText: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 8,
  },

  // Controls overlay
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "space-between",
    zIndex: 10,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    zIndex: 30,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginHorizontal: 8,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  topBarRight: {
    width: 40,
    alignItems: "center",
  },
  topBtn: {
    padding: 8,
  },

  // Center playback controls
  centerControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },
  skipBtn: {
    alignItems: "center",
    gap: 2,
  },
  skipLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Bottom bar / seekbar
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#fff",
    fontVariant: ["tabular-nums"],
    minWidth: 40,
    textAlign: "center",
  },
  seekbarContainer: {
    flex: 1,
    height: 30,
    justifyContent: "center",
  },
  seekbarTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1.5,
    position: "relative",
  },
  seekbarBuffer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 1.5,
  },
  seekbarProgress: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: "#ff4444",
    borderRadius: 1.5,
  },
  seekbarThumb: {
    position: "absolute",
    top: -5,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#ff4444",
    marginLeft: -6,
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  errorSubText: {
    color: "#888",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
    gap: 8,
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  // Info bar
  infoBar: {
    padding: 16,
    backgroundColor: "#111",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    lineHeight: 22,
  },
  infoActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  infoActionBtn: {
    alignItems: "center",
    gap: 4,
  },
  infoActionText: {
    color: "#888",
    fontSize: 12,
  },
});

export default VideoPlayerModal;
