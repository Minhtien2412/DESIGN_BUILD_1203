/**
 * AdvancedVideoPlayer - Full-Featured Video Player with Gestures
 * ==============================================================
 *
 * Features:
 * - Double tap left/right: Skip backward/forward 10s
 * - Horizontal swipe: Seek through video
 * - Vertical swipe left: Brightness control
 * - Vertical swipe right: Volume control
 * - Pinch zoom: Zoom in/out video
 * - Long press: 2x speed playback
 * - Single tap: Show/hide controls
 * - Progress bar drag: Seek to position
 *
 * @author ThietKeResort Team
 * @created 2026-01-24
 */

import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { VideoView, useVideoPlayer } from "expo-video";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
    FadeIn,
    FadeOut,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================
// Types
// ============================================
export interface VideoData {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  author?: {
    id?: string;
    name: string;
    avatar?: string;
  };
  duration?: number;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

export interface AdvancedVideoPlayerProps {
  video: VideoData;
  isVisible: boolean;
  autoPlay?: boolean;
  onClose?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showOverlay?: boolean;
}

export interface AdvancedVideoPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (positionMs: number) => void;
  setMuted: (muted: boolean) => void;
}

// ============================================
// Seek Indicator Component
// ============================================
const SeekIndicator = memo(
  ({
    direction,
    seconds,
  }: {
    direction: "left" | "right";
    seconds: number;
  }) => (
    <Animated.View
      style={[
        styles.seekIndicator,
        direction === "left"
          ? styles.seekIndicatorLeft
          : styles.seekIndicatorRight,
      ]}
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
    >
      <Ionicons
        name={direction === "left" ? "play-back" : "play-forward"}
        size={32}
        color="white"
      />
      <Text style={styles.seekText}>{seconds}s</Text>
    </Animated.View>
  ),
);

// ============================================
// Speed Indicator Component
// ============================================
const SpeedIndicator = memo(({ speed }: { speed: number }) => (
  <Animated.View
    style={styles.speedIndicator}
    entering={FadeIn.duration(150)}
    exiting={FadeOut.duration(150)}
  >
    <Ionicons name="speedometer" size={20} color="white" />
    <Text style={styles.speedText}>{speed}x</Text>
  </Animated.View>
));

// ============================================
// Volume/Brightness Indicator
// ============================================
const VerticalIndicator = memo(
  ({ type, value }: { type: "volume" | "brightness"; value: number }) => (
    <Animated.View
      style={[
        styles.verticalIndicator,
        type === "brightness"
          ? styles.verticalIndicatorLeft
          : styles.verticalIndicatorRight,
      ]}
      entering={FadeIn.duration(100)}
      exiting={FadeOut.duration(100)}
    >
      <Ionicons
        name={type === "volume" ? "volume-high" : "sunny"}
        size={24}
        color="white"
      />
      <View style={styles.verticalBarContainer}>
        <View style={[styles.verticalBarFill, { height: `${value * 100}%` }]} />
      </View>
      <Text style={styles.verticalText}>{Math.round(value * 100)}%</Text>
    </Animated.View>
  ),
);

// ============================================
// Main Component
// ============================================
export const AdvancedVideoPlayer = memo(
  forwardRef<AdvancedVideoPlayerRef, AdvancedVideoPlayerProps>(
    (
      {
        video,
        isVisible,
        autoPlay = true,
        onClose,
        onLike,
        onComment,
        onShare,
        onNext,
        onPrevious,
        showOverlay = true,
      },
      ref,
    ) => {
      const insets = useSafeAreaInsets();

      // Playback state
      const [isPlaying, setIsPlaying] = useState(false);
      const [isMuted, setIsMuted] = useState(false);
      const [isLoaded, setIsLoaded] = useState(false);
      const [duration, setDuration] = useState(0);
      const [position, setPosition] = useState(0);
      const [isLiked, setIsLiked] = useState(false);
      const [playbackSpeed, setPlaybackSpeed] = useState(1);

      // UI state
      const [showControls, setShowControls] = useState(true);
      const [showSeekIndicator, setShowSeekIndicator] = useState<
        "left" | "right" | null
      >(null);
      const [seekSeconds, setSeekSeconds] = useState(10);
      const [showSpeedIndicator, setShowSpeedIndicator] = useState(false);
      const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
      const [showBrightnessIndicator, setShowBrightnessIndicator] =
        useState(false);
      const [volumeLevel, setVolumeLevel] = useState(1);
      const [brightnessLevel, setBrightnessLevel] = useState(0.5);

      const player = useVideoPlayer(video.videoUrl, (player) => {
        player.loop = true;
        player.muted = isMuted;
        player.volume = volumeLevel;
        player.playbackRate = playbackSpeed;
        player.preservesPitch = true;
        player.timeUpdateEventInterval = 0.2;
      });
      const status = useEvent(player, "statusChange", { status: player.status });
      const playing = useEvent(player, "playingChange", {
        isPlaying: player.playing,
      });
      const timeUpdate = useEvent(player, "timeUpdate", {
        currentTime: player.currentTime,
        bufferedPosition: player.bufferedPosition,
        currentLiveTimestamp: null,
        currentOffsetFromLive: null,
      });

      // Animation values
      const scale = useSharedValue(1);
      const translateX = useSharedValue(0);
      const translateY = useSharedValue(0);
      const progressWidth = useSharedValue(0);
      const controlsOpacity = useSharedValue(1);

      // Gesture tracking
      const savedScale = useSharedValue(1);
      const savedTranslateX = useSharedValue(0);
      const savedTranslateY = useSharedValue(0);
      const lastTapTime = useRef(0);
      const lastTapX = useRef(0);
      const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
      const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
      const isLongPressing = useRef(false);
      const seekStartPosition = useRef(0);

      // ==================== Imperative Handle ====================
      useImperativeHandle(ref, () => ({
        play: () => player.play(),
        pause: () => player.pause(),
        seek: (positionMs: number) => {
          player.currentTime = positionMs / 1000;
        },
        setMuted: (muted: boolean) => {
          setIsMuted(muted);
          player.muted = muted;
        },
      }));

      // ==================== Auto-play Effect ====================
      useEffect(() => {
        if (isVisible && autoPlay && isLoaded) {
          player.play();
        } else if (!isVisible) {
          player.pause();
        }
      }, [isVisible, autoPlay, isLoaded, player]);

      // ==================== Controls Auto-hide ====================
      useEffect(() => {
        if (isPlaying && showControls) {
          controlsTimer.current = setTimeout(() => {
            setShowControls(false);
            controlsOpacity.value = withTiming(0, { duration: 300 });
          }, 3000);
        }

        return () => {
          if (controlsTimer.current) {
            clearTimeout(controlsTimer.current);
          }
        };
      }, [isPlaying, showControls]);

      // ==================== Player State Sync ====================
      useEffect(() => {
        setIsLoaded(status.status === "readyToPlay");
        if (status.status === "error") {
          console.warn(
            "[AdvancedVideoPlayer] Video error:",
            status.error?.message || "Unknown error",
          );
        }
      }, [status.status]);

      useEffect(() => {
        setIsPlaying(playing.isPlaying);
      }, [playing.isPlaying]);

      useEffect(() => {
        const durationMs = player.duration ? player.duration * 1000 : 0;
        if (durationMs > 0) {
          setDuration(durationMs);
        }

        const positionMs = timeUpdate.currentTime * 1000;
        setPosition(positionMs);

        if (durationMs > 0) {
          const progress = positionMs / durationMs;
          progressWidth.value = withTiming(progress * 100, { duration: 100 });
        }
      }, [timeUpdate.currentTime, player.duration, progressWidth]);

      useEffect(() => {
        player.muted = isMuted;
        player.volume = volumeLevel;
      }, [isMuted, volumeLevel, player]);

      useEffect(() => {
        player.playbackRate = playbackSpeed;
        player.preservesPitch = true;
      }, [playbackSpeed, player]);

      // ==================== Control Functions ====================
      const togglePlay = useCallback(() => {
        if (isPlaying) {
          player.pause();
        } else {
          player.play();
        }
      }, [isPlaying, player]);

      const toggleMute = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        player.muted = newMuted;
      }, [isMuted, player]);

      const seekBy = useCallback(
        (seconds: number) => {
          const newPosition = Math.max(
            0,
            Math.min(duration, position + seconds * 1000),
          );
          player.currentTime = newPosition / 1000;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        [position, duration, player],
      );

      const seekToPercent = useCallback(
        (percent: number) => {
          const newPosition = Math.max(
            0,
            Math.min(duration, duration * percent),
          );
          player.currentTime = newPosition / 1000;
        },
        [duration, player],
      );

      const setSpeed = useCallback((speed: number) => {
        setPlaybackSpeed(speed);
        player.playbackRate = speed;
        player.preservesPitch = true;
      }, [player]);

      const handleLike = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsLiked(!isLiked);
        onLike?.();
      }, [isLiked, onLike]);

      // ==================== Gesture Handlers ====================

      // Show controls on tap
      const showControlsUI = useCallback(() => {
        setShowControls(true);
        controlsOpacity.value = withTiming(1, { duration: 200 });

        if (controlsTimer.current) {
          clearTimeout(controlsTimer.current);
        }
      }, [controlsOpacity]);

      // Handle double tap to seek
      const handleDoubleTap = useCallback(
        (x: number) => {
          const isLeftSide = x < SCREEN_WIDTH / 2;

          if (isLeftSide) {
            seekBy(-10);
            setShowSeekIndicator("left");
            setSeekSeconds(10);
          } else {
            seekBy(10);
            setShowSeekIndicator("right");
            setSeekSeconds(10);
          }

          setTimeout(() => setShowSeekIndicator(null), 500);
        },
        [seekBy],
      );

      // Single tap gesture
      const tapGesture = Gesture.Tap()
        .maxDuration(250)
        .onStart((event) => {
          const now = Date.now();
          const timeSinceLastTap = now - lastTapTime.current;
          const xDistance = Math.abs(event.x - lastTapX.current);

          if (timeSinceLastTap < 300 && xDistance < 50) {
            // Double tap
            runOnJS(handleDoubleTap)(event.x);
          } else {
            // Single tap - toggle controls
            if (showControls) {
              runOnJS(togglePlay)();
            } else {
              runOnJS(showControlsUI)();
            }
          }

          lastTapTime.current = now;
          lastTapX.current = event.x;
        });

      // Long press for speed
      const longPressGesture = Gesture.LongPress()
        .minDuration(500)
        .onStart(() => {
          isLongPressing.current = true;
          runOnJS(setSpeed)(2);
          runOnJS(setShowSpeedIndicator)(true);
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        })
        .onEnd(() => {
          if (isLongPressing.current) {
            isLongPressing.current = false;
            runOnJS(setSpeed)(1);
            runOnJS(setShowSpeedIndicator)(false);
          }
        });

      // Pinch to zoom
      const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
          scale.value = Math.max(
            0.5,
            Math.min(3, savedScale.value * event.scale),
          );
        })
        .onEnd(() => {
          savedScale.value = scale.value;

          // Snap back if too small
          if (scale.value < 1) {
            scale.value = withSpring(1);
            savedScale.value = 1;
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            savedTranslateX.value = 0;
            savedTranslateY.value = 0;
          }
        });

      // Pan gesture for seek and volume/brightness
      const panGesture = Gesture.Pan()
        .onStart((event) => {
          seekStartPosition.current = position;
        })
        .onUpdate((event) => {
          // Only handle if zoomed in for panning
          if (scale.value > 1) {
            translateX.value = savedTranslateX.value + event.translationX;
            translateY.value = savedTranslateY.value + event.translationY;
            return;
          }

          const isHorizontal =
            Math.abs(event.translationX) > Math.abs(event.translationY);
          const isLeftSide = event.x < SCREEN_WIDTH / 3;
          const isRightSide = event.x > (SCREEN_WIDTH * 2) / 3;

          if (isHorizontal && Math.abs(event.translationX) > 20) {
            // Horizontal swipe - seek
            const seekDelta =
              (event.translationX / SCREEN_WIDTH) * duration * 0.5;
            const newPosition = Math.max(
              0,
              Math.min(duration, seekStartPosition.current + seekDelta),
            );
            runOnJS(setPosition)(newPosition);
            progressWidth.value = (newPosition / duration) * 100;

            const seekSecs = Math.abs(Math.round(seekDelta / 1000));
            runOnJS(setSeekSeconds)(seekSecs);
            runOnJS(setShowSeekIndicator)(
              event.translationX > 0 ? "right" : "left",
            );
          } else if (!isHorizontal && Math.abs(event.translationY) > 20) {
            // Vertical swipe
            const deltaPercent = -event.translationY / (SCREEN_HEIGHT * 0.5);

            if (isLeftSide) {
              // Brightness
              const newBrightness = Math.max(
                0,
                Math.min(1, brightnessLevel + deltaPercent * 0.5),
              );
              runOnJS(setBrightnessLevel)(newBrightness);
              runOnJS(setShowBrightnessIndicator)(true);
            } else if (isRightSide) {
              // Volume
              const newVolume = Math.max(
                0,
                Math.min(1, volumeLevel + deltaPercent * 0.5),
              );
              runOnJS(setVolumeLevel)(newVolume);
              runOnJS(setShowVolumeIndicator)(true);
              player.volume = newVolume;
            }
          }
        })
        .onEnd((event) => {
          if (scale.value > 1) {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
          } else {
            // Apply seek
            if (Math.abs(event.translationX) > 20) {
              player.currentTime = position / 1000;
            }
          }

          runOnJS(setShowSeekIndicator)(null);
          runOnJS(setShowVolumeIndicator)(false);
          runOnJS(setShowBrightnessIndicator)(false);
        });

      // Combine gestures
      const composedGestures = Gesture.Race(
        pinchGesture,
        Gesture.Exclusive(longPressGesture, tapGesture),
        panGesture,
      );

      // ==================== Animated Styles ====================
      const videoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
          { scale: scale.value },
          { translateX: translateX.value },
          { translateY: translateY.value },
        ],
      }));

      const progressStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`,
      }));

      const controlsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: controlsOpacity.value,
      }));

      // ==================== Format Helpers ====================
      const formatTime = (ms: number): string => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      };

      const formatNumber = (num?: number): string => {
        if (!num) return "0";
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
      };

      // ==================== Render ====================
      return (
        <GestureHandlerRootView style={styles.container}>
          <View style={styles.videoWrapper}>
            {/* Video */}
            <GestureDetector gesture={composedGestures}>
              <Animated.View
                style={[styles.videoContainer, videoAnimatedStyle]}
              >
                <VideoView
                  player={player}
                  style={styles.video}
                  contentFit="contain"
                  nativeControls={false}
                  onFirstFrameRender={() => setIsLoaded(true)}
                />
                {!isLoaded && video.thumbnailUrl && (
                  <Image
                    source={{ uri: video.thumbnailUrl }}
                    style={styles.poster}
                    contentFit="contain"
                  />
                )}
              </Animated.View>
            </GestureDetector>

            {/* Seek Indicators */}
            {showSeekIndicator === "left" && (
              <SeekIndicator direction="left" seconds={seekSeconds} />
            )}
            {showSeekIndicator === "right" && (
              <SeekIndicator direction="right" seconds={seekSeconds} />
            )}

            {/* Speed Indicator */}
            {showSpeedIndicator && <SpeedIndicator speed={playbackSpeed} />}

            {/* Volume/Brightness Indicators */}
            {showBrightnessIndicator && (
              <VerticalIndicator type="brightness" value={brightnessLevel} />
            )}
            {showVolumeIndicator && (
              <VerticalIndicator type="volume" value={volumeLevel} />
            )}

            {/* Play/Pause Indicator */}
            {!isPlaying && showControls && (
              <Animated.View
                style={styles.playIndicator}
                entering={FadeIn.duration(150)}
                exiting={FadeOut.duration(150)}
              >
                <View style={styles.playButton}>
                  <Ionicons name="play" size={50} color="white" />
                </View>
              </Animated.View>
            )}

            {/* Top Overlay */}
            {showOverlay && (
              <Animated.View style={[styles.topOverlay, controlsAnimatedStyle]}>
                <LinearGradient
                  colors={["rgba(0,0,0,0.6)", "transparent"]}
                  style={[styles.topGradient, { paddingTop: insets.top }]}
                >
                  <View style={styles.header}>
                    <TouchableOpacity
                      style={styles.headerButton}
                      onPress={onClose}
                    >
                      <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle} numberOfLines={1}>
                      {video.title || "Video"}
                    </Text>

                    <TouchableOpacity
                      style={styles.headerButton}
                      onPress={toggleMute}
                    >
                      <Ionicons
                        name={isMuted ? "volume-mute" : "volume-high"}
                        size={24}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Bottom Overlay */}
            {showOverlay && (
              <Animated.View
                style={[styles.bottomOverlay, controlsAnimatedStyle]}
              >
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.7)"]}
                  style={[
                    styles.bottomGradient,
                    { paddingBottom: insets.bottom + 20 },
                  ]}
                >
                  {/* Video Info */}
                  <View style={styles.videoInfo}>
                    {video.author && (
                      <View style={styles.authorRow}>
                        {video.author.avatar ? (
                          <Image
                            source={{ uri: video.author.avatar }}
                            style={styles.authorAvatar}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={styles.authorAvatarPlaceholder}>
                            <Ionicons name="person" size={16} color="white" />
                          </View>
                        )}
                        <Text style={styles.authorName}>
                          {video.author.name}
                        </Text>
                      </View>
                    )}

                    {video.description && (
                      <Text style={styles.description} numberOfLines={2}>
                        {video.description}
                      </Text>
                    )}
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <Text style={styles.timeText}>{formatTime(position)}</Text>
                    <View style={styles.progressBar}>
                      <Animated.View
                        style={[styles.progressFill, progressStyle]}
                      />
                    </View>
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                  </View>

                  {/* Gesture Hints */}
                  <View style={styles.gestureHints}>
                    <Text style={styles.hintText}>
                      Double tap: ±10s • Long press: 2x • Pinch: Zoom
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Right Side Actions */}
            {showOverlay && (
              <View
                style={[styles.actionsColumn, { bottom: insets.bottom + 120 }]}
              >
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleLike}
                >
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={32}
                    color={isLiked ? "#FF2D55" : "white"}
                  />
                  <Text style={styles.actionText}>
                    {formatNumber(video.likes)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onComment}
                >
                  <Ionicons name="chatbubble-outline" size={30} color="white" />
                  <Text style={styles.actionText}>
                    {formatNumber(video.comments)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={onShare}>
                  <Ionicons
                    name="share-social-outline"
                    size={30}
                    color="white"
                  />
                  <Text style={styles.actionText}>
                    {formatNumber(video.shares)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </GestureHandlerRootView>
      );
    },
  ),
);

AdvancedVideoPlayer.displayName = "AdvancedVideoPlayer";

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
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

  // Seek Indicator
  seekIndicator: {
    position: "absolute",
    top: "40%",
    alignItems: "center",
    padding: 20,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  seekIndicatorLeft: {
    left: SCREEN_WIDTH * 0.15,
  },
  seekIndicatorRight: {
    right: SCREEN_WIDTH * 0.15,
  },
  seekText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },

  // Speed Indicator
  speedIndicator: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  speedText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  // Vertical Indicator
  verticalIndicator: {
    position: "absolute",
    top: "30%",
    height: 150,
    width: 50,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 25,
    paddingVertical: 12,
  },
  verticalIndicatorLeft: {
    left: 20,
  },
  verticalIndicatorRight: {
    right: 20,
  },
  verticalBarContainer: {
    flex: 1,
    width: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginVertical: 8,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  verticalBarFill: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  verticalText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },

  // Play Indicator
  playIndicator: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 6,
  },

  // Top Overlay
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  topGradient: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginHorizontal: 12,
  },

  // Bottom Overlay
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomGradient: {
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  videoInfo: {
    marginBottom: 12,
    paddingRight: 70,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "white",
  },
  authorAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  authorName: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
    marginLeft: 10,
  },
  description: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },

  // Progress Bar
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1877F2",
    borderRadius: 2,
  },
  timeText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
    minWidth: 40,
  },

  // Gesture Hints
  gestureHints: {
    alignItems: "center",
    paddingTop: 8,
  },
  hintText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },

  // Actions Column
  actionsColumn: {
    position: "absolute",
    right: 12,
    alignItems: "center",
    gap: 20,
  },
  actionButton: {
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
});

export default AdvancedVideoPlayer;
