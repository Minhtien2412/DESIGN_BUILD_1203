import { Ionicons } from '@expo/vector-icons';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

interface LivePlayerProps {
  source: string;
  autoPlay?: boolean;
  onError?: (message: string) => void;
}

export function LivePlayer({ source, autoPlay = true, onError }: LivePlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isBuffering, setIsBuffering] = useState(false);

  const togglePlay = async () => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const handleStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsBuffering(status.isBuffering ?? false);
  };

  const handleError = (error: string) => {
    onError?.(error);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: source }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={autoPlay}
        onPlaybackStatusUpdate={handleStatusUpdate}
        onError={(error) => handleError(String(error))}
      />

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={togglePlay}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
        </Pressable>
        {isBuffering && (
          <View style={styles.buffering}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.bufferingText}>Buffering...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buffering: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bufferingText: {
    color: '#fff',
    fontSize: 12,
  },
});
