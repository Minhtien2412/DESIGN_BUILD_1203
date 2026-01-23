/**
 * FeedVideoPlayer - Auto-play Video Player for Social Feed
 * =========================================================
 *
 * Features:
 * - Auto-play when visible in viewport (>50% visible)
 * - Auto-pause when scrolled away
 * - Preload next videos for smooth playback
 * - Muted by default with tap to unmute
 * - Progress indicator
 * - Tap to open full-screen viewer
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { Ionicons } from "@expo/vector-icons";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import {
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    Dimensions,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================
// Types
// ============================================
export interface FeedVideoPlayerProps {
  /** Unique ID for this video */
  videoId: string;
  /** Video source URL */
  videoUrl: string;
  /** Thumbnail/poster image URL */
  thumbnailUrl?: string;
  /** Video title */
  title?: string;
  /** Video duration in seconds */
  duration?: number;
  /** View count */
  views?: number;
  /** Whether this video is currently visible in viewport */
  isVisible?: boolean;
  /** Callback when video is tapped for full-screen */
  onPress?: () => void;
  /** Callback when video starts playing */
  onPlay?: () => void;
  /** Callback when video is paused */
  onPause?: () => void;
  /** Aspect ratio (default: 16/9) */
  aspectRatio?: number;
  /** Auto-play when visible (default: true) */
  autoPlay?: boolean;
  /** Start muted (default: true for feed) */
  startMuted?: boolean;
  /** Show controls overlay */
  showControls?: boolean;
  /** Index in list for preloading priority */
  index?: number;
}

export interface FeedVideoPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (position: number) => void;
  setMuted: (muted: boolean) => void;
}

// ============================================
// Video Preloader Manager (Singleton)
// ============================================
class VideoPreloader {
  private static instance: VideoPreloader;
  private preloadedUrls: Set<string> = new Set();
  private preloadQueue: string[] = [];
  private isPreloading: boolean = false;
  private maxPreloaded: number = 3;

  static getInstance(): VideoPreloader {
    if (!VideoPreloader.instance) {
      VideoPreloader.instance = new VideoPreloader();
    }
    return VideoPreloader.instance;
  }

  /**
   * Queue videos for preloading
   * @param urls Array of video URLs to preload
   * @param currentIndex Current visible video index
   */
  queuePreload(urls: string[], currentIndex: number): void {
    // Preload next 2 and previous 1 videos
    const toPreload: string[] = [];

    for (
      let i = currentIndex + 1;
      i <= currentIndex + 2 && i < urls.length;
      i++
    ) {
      if (urls[i] && !this.preloadedUrls.has(urls[i])) {
        toPreload.push(urls[i]);
      }
    }

    if (
      currentIndex > 0 &&
      urls[currentIndex - 1] &&
      !this.preloadedUrls.has(urls[currentIndex - 1])
    ) {
      toPreload.push(urls[currentIndex - 1]);
    }

    this.preloadQueue = toPreload;
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.length === 0) return;

    this.isPreloading = true;
    const url = this.preloadQueue.shift();

    if (url) {
      try {
        // For web, we use link preload
        if (Platform.OS === "web") {
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "video";
          link.href = url;
          document.head.appendChild(link);
        }
        // For native, the Video component handles caching

        this.preloadedUrls.add(url);

        // Limit cached URLs
        if (this.preloadedUrls.size > this.maxPreloaded * 2) {
          const oldest = Array.from(this.preloadedUrls)[0];
          this.preloadedUrls.delete(oldest);
        }

        console.log("[VideoPreloader] Preloaded:", url.substring(0, 50));
      } catch (error) {
        console.warn("[VideoPreloader] Failed to preload:", url);
      }
    }

    this.isPreloading = false;

    // Process next in queue
    if (this.preloadQueue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  isPreloaded(url: string): boolean {
    return this.preloadedUrls.has(url);
  }
}

// ============================================
// Main Component
// ============================================
export const FeedVideoPlayer = memo(
  forwardRef<FeedVideoPlayerRef, FeedVideoPlayerProps>(
    (
      {
        videoId,
        videoUrl,
        thumbnailUrl,
        title,
        duration,
        views,
        isVisible = false,
        onPress,
        onPlay,
        onPause,
        aspectRatio = 16 / 9,
        autoPlay = true,
        startMuted = true,
        showControls = true,
        index = 0,
      },
      ref,
    ) => {
      const videoRef = useRef<Video>(null);
      const [isPlaying, setIsPlaying] = useState(false);
      const [isMuted, setIsMuted] = useState(startMuted);
      const [isLoaded, setIsLoaded] = useState(false);
      const [isBuffering, setIsBuffering] = useState(false);
      const [progress, setProgress] = useState(0);
      const [showThumbnail, setShowThumbnail] = useState(true);
      const [controlsVisible, setControlsVisible] = useState(true);
      const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
      const wasVisible = useRef(false);

      // Animation values
      const playIconOpacity = useSharedValue(1);
      const progressWidth = useSharedValue(0);

      // ==================== Imperative Handle ====================
      useImperativeHandle(ref, () => ({
        play: () => handlePlay(),
        pause: () => handlePause(),
        seek: (position: number) => {
          videoRef.current?.setPositionAsync(position * 1000);
        },
        setMuted: (muted: boolean) => {
          setIsMuted(muted);
          videoRef.current?.setIsMutedAsync(muted);
        },
      }));

      // ==================== Auto-play on Visibility ====================
      useEffect(() => {
        if (isVisible && !wasVisible.current && autoPlay) {
          // Became visible - start playing
          handlePlay();
          // Preload nearby videos
          VideoPreloader.getInstance().queuePreload([videoUrl], index);
        } else if (!isVisible && wasVisible.current) {
          // Became invisible - pause
          handlePause();
        }

        wasVisible.current = isVisible;
      }, [isVisible, autoPlay, index, videoUrl]);

      // ==================== Controls Auto-hide ====================
      useEffect(() => {
        if (isPlaying && controlsVisible) {
          controlsTimer.current = setTimeout(() => {
            setControlsVisible(false);
          }, 3000);
        }

        return () => {
          if (controlsTimer.current) {
            clearTimeout(controlsTimer.current);
          }
        };
      }, [isPlaying, controlsVisible]);

      // ==================== Playback Status Handler ====================
      const handlePlaybackStatusUpdate = useCallback(
        (status: AVPlaybackStatus) => {
          if (!status.isLoaded) {
            setIsBuffering(true);
            return;
          }

          setIsLoaded(true);
          setIsBuffering(status.isBuffering);
          setIsPlaying(status.isPlaying);

          if (status.durationMillis && status.positionMillis) {
            const newProgress = status.positionMillis / status.durationMillis;
            setProgress(newProgress);
            progressWidth.value = withTiming(newProgress * 100, {
              duration: 100,
            });
          }

          // Hide thumbnail once video starts playing
          if (status.isPlaying && showThumbnail) {
            setShowThumbnail(false);
          }

          // Loop video
          if (status.didJustFinish) {
            videoRef.current?.setPositionAsync(0);
            videoRef.current?.playAsync();
          }
        },
        [progressWidth, showThumbnail],
      );

      // ==================== Play/Pause Handlers ====================
      const handlePlay = useCallback(async () => {
        try {
          if (videoRef.current) {
            await videoRef.current.playAsync();
            setIsPlaying(true);
            playIconOpacity.value = withTiming(0, { duration: 200 });
            onPlay?.();
          }
        } catch (error) {
          console.warn("[FeedVideoPlayer] Play error:", error);
        }
      }, [onPlay, playIconOpacity]);

      const handlePause = useCallback(async () => {
        try {
          if (videoRef.current) {
            await videoRef.current.pauseAsync();
            setIsPlaying(false);
            playIconOpacity.value = withTiming(1, { duration: 200 });
            onPause?.();
          }
        } catch (error) {
          console.warn("[FeedVideoPlayer] Pause error:", error);
        }
      }, [onPause, playIconOpacity]);

      // ==================== Tap Handlers ====================
      const handleTap = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (showControls) {
          setControlsVisible(true);

          // Reset auto-hide timer
          if (controlsTimer.current) {
            clearTimeout(controlsTimer.current);
          }

          if (isPlaying) {
            handlePause();
          } else {
            handlePlay();
          }
        }
      }, [isPlaying, showControls, handlePlay, handlePause]);

      const handleMuteToggle = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        videoRef.current?.setIsMutedAsync(newMuted);
      }, [isMuted]);

      const handleFullscreen = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        handlePause();
        onPress?.();
      }, [handlePause, onPress]);

      // ==================== Format Helpers ====================
      const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
      };

      const formatViews = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
      };

      // ==================== Animated Styles ====================
      const playIconStyle = useAnimatedStyle(() => ({
        opacity: playIconOpacity.value,
      }));

      const progressStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`,
      }));

      // ==================== Render ====================
      // Use aspectRatio style instead of fixed height for responsive sizing
      return (
        <View style={[styles.container, { aspectRatio }]}>
          {/* Video Player - CONTAIN to show full frame without cropping */}
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            isLooping
            isMuted={isMuted}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            posterSource={thumbnailUrl ? { uri: thumbnailUrl } : undefined}
            usePoster={!!thumbnailUrl}
            posterStyle={styles.poster}
          />

          {/* Thumbnail Overlay (shown until video starts) */}
          {showThumbnail && thumbnailUrl && (
            <View style={styles.thumbnailOverlay}>
              <Image
                source={{ uri: thumbnailUrl }}
                style={styles.thumbnail}
                contentFit="contain"
                transition={200}
              />
            </View>
          )}

          {/* Tap Area */}
          <Pressable style={styles.tapArea} onPress={handleTap}>
            {/* Controls Overlay */}
            {(controlsVisible || !isPlaying) && (
              <Animated.View
                style={styles.controlsOverlay}
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
              >
                {/* Play/Pause Button */}
                <Animated.View style={[styles.playButton, playIconStyle]}>
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={40}
                    color="white"
                  />
                </Animated.View>

                {/* Buffering Indicator */}
                {isBuffering && (
                  <View style={styles.bufferingIndicator}>
                    <Ionicons name="reload" size={24} color="white" />
                  </View>
                )}
              </Animated.View>
            )}
          </Pressable>

          {/* Bottom Controls Bar */}
          <View style={styles.bottomBar}>
            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>

            {/* Controls Row */}
            <View style={styles.controlsRow}>
              {/* Left: Mute/Unmute */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleMuteToggle}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={isMuted ? "volume-mute" : "volume-high"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>

              {/* Center: Views & Duration */}
              <View style={styles.statsRow}>
                {views !== undefined && (
                  <View style={styles.statItem}>
                    <Ionicons name="eye" size={12} color="white" />
                    <Text style={styles.statText}>{formatViews(views)}</Text>
                  </View>
                )}
                {duration !== undefined && (
                  <View style={styles.statItem}>
                    <Ionicons name="time" size={12} color="white" />
                    <Text style={styles.statText}>
                      {formatDuration(duration)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Right: Fullscreen */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleFullscreen}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="expand" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    },
  ),
);

FeedVideoPlayer.displayName = "FeedVideoPlayer";

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  poster: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  tapArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4, // Visual centering for play icon
  },
  bufferingIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 8,
  },
  progressBar: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1877F2",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default FeedVideoPlayer;
