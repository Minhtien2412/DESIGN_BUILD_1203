import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
}

export function VideoPlayer({
  url,
  asset,
  thumbnail,
  title,
  autoPlay = false,
  muted = true,
  loop = true,
  onPress,
  style,
  compact = false
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Determine video source (URL or local asset)
  const videoSource = asset || url || '';

  // Use new expo-video API
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = loop;
    player.muted = muted;
    if (autoPlay) {
      player.play();
    }
  });

  useEffect(() => {
    // Simulate loading complete
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [videoSource]);

  const handlePlayPause = useCallback(() => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);

  const handleVideoPress = () => {
    if (onPress) {
      onPress();
    } else {
      setShowControls(!showControls);
      setTimeout(() => setShowControls(false), 3000);
    }
  };

  const formatDuration = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
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
          <ActivityIndicator size="large" color="#90b44c" />
        </View>
      )}

      {/* Controls Overlay */}
      {!compact && showControls && !isLoading && (
        <View style={styles.controlsOverlay}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <Ionicons
              name={player.playing ? 'pause' : 'play'}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
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

      {/* Mute/Unmute Button */}
      {!compact && (
        <TouchableOpacity
          style={styles.muteButton}
          onPress={() => {
            player.muted = !player.muted;
          }}
        >
          <Ionicons
            name={player.muted ? 'volume-mute' : 'volume-high'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(144,180,76,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
    backgroundColor: '#90b44c',
  },
  timeText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
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
    backgroundColor: 'rgba(144,180,76,0.9)',
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
});
