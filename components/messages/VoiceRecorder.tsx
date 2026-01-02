/**
 * Voice Message Recorder Component
 * Records, plays, and uploads voice messages
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

interface VoiceRecorderProps {
  onSend: (audioUri: string, duration: number) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);

  const primary = useThemeColor({}, 'primary');
  const error = useThemeColor({}, 'error');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  /**
   * Start recording
   */
  const startRecording = async () => {
    try {
      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        alert('Cần quyền truy cập microphone để ghi âm');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setDuration(0);

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      console.log('[VoiceRecorder] Recording started');

    } catch (error) {
      console.error('[VoiceRecorder] Failed to start recording:', error);
      alert('Không thể bắt đầu ghi âm');
    }
  };

  /**
   * Stop recording and send
   */
  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      pulseAnim.stopAnimation();
      if (timerRef.current) clearInterval(timerRef.current);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        console.log('[VoiceRecorder] Recording saved:', uri);
        onSend(uri, duration);
      }

      setRecording(null);
      setDuration(0);

    } catch (error) {
      console.error('[VoiceRecorder] Failed to stop recording:', error);
    }
  };

  /**
   * Cancel recording
   */
  const cancelRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      pulseAnim.stopAnimation();
      if (timerRef.current) clearInterval(timerRef.current);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // Delete the file
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

      setRecording(null);
      setDuration(0);
      onCancel();

      console.log('[VoiceRecorder] Recording cancelled');

    } catch (error) {
      console.error('[VoiceRecorder] Failed to cancel recording:', error);
    }
  };

  /**
   * Pause/Resume recording
   */
  const togglePause = async () => {
    if (!recording) return;

    try {
      if (isPaused) {
        await recording.startAsync();
        setIsPaused(false);
        // Resume timer
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } else {
        await recording.pauseAsync();
        setIsPaused(true);
        // Pause timer
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch (error) {
      console.error('[VoiceRecorder] Failed to toggle pause:', error);
    }
  };

  /**
   * Format duration (MM:SS)
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-start recording on mount
  React.useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Waveform animation */}
      <View style={styles.waveform}>
        <Animated.View
          style={[
            styles.pulse,
            {
              backgroundColor: primary,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <Ionicons
          name={isPaused ? 'mic-off' : 'mic'}
          size={32}
          color="#fff"
          style={styles.micIcon}
        />
      </View>

      {/* Duration */}
      <Text style={[styles.duration, { color: textColor }]}>
        {formatDuration(duration)}
      </Text>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Cancel */}
        <Pressable
          onPress={cancelRecording}
          style={({ pressed }) => [
            styles.button,
            styles.cancelButton,
            { backgroundColor: error },
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </Pressable>

        {/* Pause/Resume */}
        <Pressable
          onPress={togglePause}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: '#6b7280' },
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons
            name={isPaused ? 'play' : 'pause'}
            size={24}
            color="#fff"
          />
        </Pressable>

        {/* Send */}
        <Pressable
          onPress={stopRecording}
          style={({ pressed }) => [
            styles.button,
            styles.sendButton,
            { backgroundColor: primary },
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="send" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Helper text */}
      <Text style={[styles.helper, { color: textColor + '80' }]}>
        {isPaused ? 'Đã tạm dừng' : 'Đang ghi âm...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    gap: 20,
  },
  waveform: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
  },
  micIcon: {
    zIndex: 1,
  },
  duration: {
    fontSize: 32,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  cancelButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sendButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  helper: {
    fontSize: 14,
    marginTop: 8,
  },
});
