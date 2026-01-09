import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Safe import for Slider
let Slider: any;
try {
  Slider = require('@react-native-community/slider').default;
} catch (e) {
  console.warn('[VideoPlayer] Slider not available, using fallback');
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VideoPlayerProps {
  url?: string; // URL from API
  asset?: any; // Local asset from require()
  thumbnail?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onPress?: () => void;
  style?: any;
  compact?: boolean; // For home screen compact view
  showSeekBar?: boolean; // Show seek/progress bar
  enableGestures?: boolean; // Enable swipe gestures for volume/brightness
}

export function VideoPlayer({
  url,
  asset,
  thumbnail,
  title,
  autoPlay = true, // Auto-play by default
  muted = false, // Unmuted by default
  loop = true,
  onPress,
  style,
  compact = false,
  showSeekBar = true,
  enableGestures = true,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Animation refs
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Determine video source (URL or local asset)
  const videoSource = asset || url || '';

  // Use new expo-video API
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = loop;
    player.muted = muted;
    player.volume = volume;
    player.playbackRate = playbackSpeed;
    if (autoPlay) {
      player.play();
    }
  });

  // Update current time and duration
  useEffect(() => {
    const interval = setInterval(() => {
      if (player && !isSeeking) {
        setCurrentTime(player.currentTime || 0);
        setDuration(player.duration || 0);
      }
    }, 100); // Update every 100ms for smooth progress

    return () => clearInterval(interval);
  }, [player, isSeeking]);

  useEffect(() => {
    // Simulate loading complete
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [videoSource]);

  // Auto-hide controls after 3 seconds
  const resetControlsTimer = useCallback(() => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    hideControlsTimer.current = setTimeout(() => {
      hideControls();
    }, 3000);
  }, []);

  const showControlsWithTimer = useCallback(() => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    resetControlsTimer();
  }, [controlsOpacity, resetControlsTimer]);

  const hideControls = useCallback(() => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowControls(false));
  }, [controlsOpacity]);

  const handlePlayPause = useCallback(() => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
    showControlsWithTimer();
  }, [player, showControlsWithTimer]);

  const handleVideoPress = () => {
    if (onPress) {
      onPress();
    } else {
      if (showControls) {
        hideControls();
      } else {
        showControlsWithTimer();
      }
    }
  };

  // Seek to specific time
  const handleSeek = useCallback((value: number) => {
    setIsSeeking(true);
    setCurrentTime(value);
  }, []);

  const handleSeekComplete = useCallback((value: number) => {
    if (player) {
      player.currentTime = value;
      setIsSeeking(false);
      showControlsWithTimer();
    }
  }, [player, showControlsWithTimer]);

  // Skip forward/backward
  const skipForward = useCallback(() => {
    if (player) {
      player.currentTime = Math.min((player.currentTime || 0) + 10, duration);
      showControlsWithTimer();
    }
  }, [player, duration, showControlsWithTimer]);

  const skipBackward = useCallback(() => {
    if (player) {
      player.currentTime = Math.max((player.currentTime || 0) - 10, 0);
      showControlsWithTimer();
    }
  }, [player, showControlsWithTimer]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    player.muted = !player.muted;
    showControlsWithTimer();
  }, [player, showControlsWithTimer]);

  // Change playback speed
  const cyclePlaybackSpeed = useCallback(() => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    player.playbackRate = nextSpeed;
    showControlsWithTimer();
  }, [playbackSpeed, player, showControlsWithTimer]);

  // Gesture handler for swipe controls
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enableGestures,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return enableGestures && (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10);
      },
      onPanResponderMove: (_, gestureState) => {
        // Swipe left/right to seek
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          const seekDelta = (gestureState.dx / SCREEN_WIDTH) * duration;
          const newTime = Math.max(0, Math.min(currentTime + seekDelta, duration));
          setCurrentTime(newTime);
        }
        // Swipe up/down on left side to adjust volume
        else if (gestureState.moveX < SCREEN_WIDTH / 2) {
          const volumeDelta = -gestureState.dy / 200;
          const newVolume = Math.max(0, Math.min(volume + volumeDelta, 1));
          setVolume(newVolume);
          player.volume = newVolume;
        }
      },
      onPanResponderRelease: () => {
        if (isSeeking && player) {
          player.currentTime = currentTime;
          setIsSeeking(false);
        }
      },
    })
  ).current;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasError) {
    return (
      <View style={[styles.container, style]}>
        {thumbnail && (
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} resizeMode="cover" />
        )}
        <View style={styles.errorOverlay}>
          <Ionicons name="alert-circle-outline" size={32} color="#fff" />
          <Text style={styles.errorText}>Không thể tải video</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      activeOpacity={0.9}
      onPress={handleVideoPress}
      {...(enableGestures ? panResponder.panHandlers : {})}
    >
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      )}

      {/* Controls Overlay with Animation */}
      {!compact && showControls && !isLoading && (
        <Animated.View style={[styles.controlsOverlay, { opacity: controlsOpacity }]}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <Text style={styles.videoTitle}>{title || 'Video'}</Text>
            <TouchableOpacity onPress={cyclePlaybackSpeed}>
              <Text style={styles.speedText}>{playbackSpeed}x</Text>
            </TouchableOpacity>
          </View>

          {/* Center Play/Pause Button */}
          <View style={styles.centerControls}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipBackward}
              activeOpacity={0.8}
            >
              <Ionicons name="play-back" size={28} color="#fff" />
              <Text style={styles.skipText}>10s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
              activeOpacity={0.8}
            >
              <Ionicons
                name={player.playing ? 'pause' : 'play'}
                size={36}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipForward}
              activeOpacity={0.8}
            >
              <Ionicons name="play-forward" size={28} color="#fff" />
              <Text style={styles.skipText}>10s</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Bar with Progress */}
          {showSeekBar && (
            <View style={styles.bottomBar}>
              <View style={styles.progressRow}>
                <Text style={styles.timeText}>{formatDuration(currentTime)}</Text>
                {Slider ? (
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration || 1}
                    value={currentTime}
                    onValueChange={handleSeek}
                    onSlidingComplete={handleSeekComplete}
                    minimumTrackTintColor="#0066CC"
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor="#0066CC"
                  />
                ) : (
                  <View style={styles.slider}>
                    <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                            backgroundColor: '#0066CC' 
                          }
                        ]} 
                      />
                    </View>
                  </View>
                )}
                <Text style={styles.timeText}>{formatDuration(duration)}</Text>
              </View>
              
              <View style={styles.bottomControls}>
                <TouchableOpacity onPress={toggleMute} style={styles.controlButton}>
                  <Ionicons
                    name={player.muted ? 'volume-mute' : 'volume-high'}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
                
                {enableGestures && (
                  <Text style={styles.gestureHint}>
                    Vuốt để tua | Vuốt trái để điều chỉnh âm lượng
                  </Text>
                )}
              </View>
            </View>
          )}
        </Animated.View>
      )}

      {/* Title Overlay (for compact view) */}
      {compact && title && (
        <View style={styles.titleOverlay}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}

      {/* Play Icon (when paused in compact view) */}
      {compact && !player.playing && !isLoading && (
        <View style={styles.compactPlayIcon}>
          <View style={styles.playIconBackground}>
            <Ionicons name="play" size={20} color="#fff" />
          </View>
        </View>
      )}

      {/* Simple Mute Button (compact mode) */}
      {compact && (
        <TouchableOpacity
          style={styles.muteButton}
          onPress={toggleMute}
        >
          <Ionicons
            name={player.muted ? 'volume-mute' : 'volume-high'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      )}

      {/* Volume Indicator (gesture feedback) */}
      {enableGestures && !compact && volume !== 1 && (
        <View style={styles.volumeIndicator}>
          <Ionicons name="volume-high" size={16} color="#fff" />
          <View style={styles.volumeBar}>
            <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
          </View>
          <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  errorText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  speedText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(0,102,204,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,102,204,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  skipText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  bottomBar: {
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
  },
  gestureHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontStyle: 'italic',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066CC',
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
  },
  titleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  compactPlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  playIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,102,204,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeIndicator: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{ translateY: -25 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  volumeBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#0066CC',
  },
  volumeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    minWidth: 35,
  },
});
