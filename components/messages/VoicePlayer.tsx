/**
 * Voice Message Player Component
 * Plays voice messages with waveform visualization
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface VoicePlayerProps {
  audioUri: string;
  duration: number;
  isFromMe: boolean;
  onError?: () => void;
}

export function VoicePlayer({ audioUri, duration, isFromMe, onError }: VoicePlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const primary = useThemeColor({}, 'primary');
  const baseTextColor = useThemeColor({}, 'text');
  const textColor = isFromMe ? '#fff' : baseTextColor;

  /**
   * Load and play audio
   */
  const playAudio = async () => {
    try {
      setIsLoading(true);

      // Stop current sound if playing
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Load audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);

      console.log('[VoicePlayer] Playing:', audioUri);

    } catch (error) {
      console.error('[VoicePlayer] Playback error:', error);
      setIsLoading(false);
      onError?.();
    }
  };

  /**
   * Pause audio
   */
  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  /**
   * Toggle play/pause
   */
  const togglePlayback = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  /**
   * Handle playback status updates
   */
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);

      // Auto-stop when finished
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  /**
   * Format time (MM:SS)
   */
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Calculate progress percentage
   */
  const getProgress = (): number => {
    if (duration === 0) return 0;
    return (position / (duration * 1000)) * 100;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <View style={styles.container}>
      {/* Play/Pause button */}
      <Pressable
        onPress={togglePlayback}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.playButton,
          pressed && styles.playButtonPressed,
        ]}
      >
        {isLoading ? (
          <Ionicons name="hourglass-outline" size={20} color={textColor} />
        ) : (
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={20}
            color={textColor}
          />
        )}
      </Pressable>

      {/* Waveform visualization */}
      <View style={styles.waveformContainer}>
        {/* Background waveform */}
        <View style={styles.waveform}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: Math.random() * 20 + 10,
                  backgroundColor: textColor + '40',
                },
              ]}
            />
          ))}
        </View>

        {/* Progress overlay */}
        <View
          style={[
            styles.waveformProgress,
            { width: `${getProgress()}%` },
          ]}
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: Math.random() * 20 + 10,
                  backgroundColor: isFromMe ? '#fff' : primary,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Duration */}
      <Text style={[styles.duration, { color: textColor }]}>
        {isPlaying ? formatTime(position) : formatTime(duration * 1000)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    minWidth: 200,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  playButtonPressed: {
    opacity: 0.7,
  },
  waveformContainer: {
    flex: 1,
    height: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  waveform: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 30,
  },
  waveformProgress: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 30,
    overflow: 'hidden',
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
  },
  duration: {
    fontSize: 12,
    minWidth: 40,
    textAlign: 'right',
  },
});
