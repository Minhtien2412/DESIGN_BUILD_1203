/**
 * Voice Input/Output Components for AI Chat
 * - VoiceInput: Speech-to-Text using Web Speech API
 * - VoiceOutput: Text-to-Speech using Web Speech Synthesis
 * @author AI Assistant
 * @date 13/01/2026
 */

import { Colors } from '@/constants/theme';
import {
    VoiceState,
    cleanTextForSpeech,
    formatDuration,
    isVoiceSupported,
    voiceAIService,
} from '@/services/voiceAIService';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// =====================================================
// VOICE INPUT COMPONENT
// =====================================================

interface VoiceInputProps {
  onTextReceived: (text: string) => void;
  language?: string;
  disabled?: boolean;
}

export default function VoiceInput({ 
  onTextReceived, 
  language = 'vi-VN',
  disabled = false 
}: VoiceInputProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [modalVisible, setModalVisible] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const support = isVoiceSupported();

  // Setup voice config
  useEffect(() => {
    voiceAIService.setConfig({ language });
    voiceAIService.setStateChangeListener(setVoiceState);
    return () => {
      voiceAIService.cleanup();
    };
  }, [language]);

  // Animations when recording
  useEffect(() => {
    if (voiceState === 'recording') {
      // Pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      // Wave animation
      const wave = Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      wave.start();

      return () => {
        pulse.stop();
        wave.stop();
        pulseAnim.setValue(1);
        waveAnim.setValue(0);
      };
    }
  }, [voiceState, pulseAnim, waveAnim]);

  // Duration counter when recording
  useEffect(() => {
    if (voiceState === 'recording') {
      setDuration(0);
      durationInterval.current = setInterval(() => {
        setDuration((d) => d + 1000);
      }, 1000);
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [voiceState]);

  const startListening = useCallback(async () => {
    if (disabled || voiceState === 'processing') return;

    setTranscript('');
    setModalVisible(true);

    // Use Web Speech Recognition on web platform
    if (Platform.OS === 'web' && support.speechRecognition) {
      const result = await voiceAIService.startSpeechRecognition();
      
      if (result.success && result.text) {
        setTranscript(result.text);
      } else if (result.error) {
        setTranscript('');
        // Show error briefly then close
        setTimeout(() => {
          setModalVisible(false);
        }, 2000);
      }
    } else {
      // For native platforms, start audio recording
      const started = await voiceAIService.startRecording();
      if (!started) {
        setModalVisible(false);
      }
    }
  }, [disabled, voiceState, support.speechRecognition]);

  const stopListening = useCallback(async () => {
    if (Platform.OS === 'web') {
      // Web speech recognition stops automatically
      if (transcript) {
        onTextReceived(transcript);
      }
      setModalVisible(false);
    } else {
      // Stop native recording
      const result = await voiceAIService.stopRecording();
      
      if (result.success && result.uri) {
        // In production, send to STT service
        // For demo, use transcript if available
        if (transcript) {
          onTextReceived(transcript);
        }
      }
      setModalVisible(false);
    }
    setTranscript('');
  }, [transcript, onTextReceived]);

  const cancelListening = useCallback(async () => {
    await voiceAIService.cancelRecording();
    setModalVisible(false);
    setTranscript('');
  }, []);

  const isRecording = voiceState === 'recording';
  const isProcessing = voiceState === 'processing';

  return (
    <>
      {/* Voice Input Button */}
      <TouchableOpacity
        style={[
          styles.voiceButton,
          isRecording && styles.voiceButtonActive,
          disabled && styles.voiceButtonDisabled,
        ]}
        onPress={startListening}
        disabled={disabled || isProcessing}
        activeOpacity={0.7}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color={Colors.light.primary} />
        ) : (
          <Ionicons 
            name={isRecording ? 'mic' : 'mic-outline'} 
            size={24} 
            color={isRecording ? '#DC2626' : Colors.light.primary} 
          />
        )}
      </TouchableOpacity>

      {/* Voice Input Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={cancelListening}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Animated Waves */}
            <View style={styles.wavesContainer}>
              {[1, 2, 3].map((i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.wave,
                    {
                      opacity: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6 - i * 0.15, 0],
                      }),
                      transform: [
                        {
                          scale: waveAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.5 + i * 0.3],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              ))}
              
              {/* Animated Mic Icon */}
              <Animated.View
                style={[
                  styles.micCircle,
                  { transform: [{ scale: isRecording ? pulseAnim : 1 }] },
                ]}
              >
                <Ionicons name="mic" size={48} color="#fff" />
              </Animated.View>
            </View>

            {/* Status Text */}
            <Text style={styles.statusText}>
              {isRecording ? 'Đang nghe...' : isProcessing ? 'Đang xử lý...' : 'Sẵn sàng'}
            </Text>

            {/* Duration */}
            {isRecording && (
              <Text style={styles.durationText}>{formatDuration(duration)}</Text>
            )}

            {/* Transcript */}
            {transcript && (
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptText}>{transcript}</Text>
              </View>
            )}

            {/* Hint Text */}
            <Text style={styles.hintText}>
              {Platform.OS === 'web'
                ? 'Nói vào microphone của bạn'
                : isRecording
                ? 'Nói rõ ràng, từ từ...'
                : 'Nhấn nút micro để bắt đầu'}
            </Text>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={cancelListening}
              >
                <Ionicons name="close" size={24} color="#DC2626" />
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              {(transcript || (isRecording && Platform.OS !== 'web')) && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.confirmButton]}
                  onPress={stopListening}
                >
                  <Ionicons name={isRecording ? 'stop' : 'checkmark'} size={24} color="#fff" />
                  <Text style={styles.confirmButtonText}>
                    {isRecording ? 'Dừng' : 'Xác nhận'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Platform Info */}
            <View style={styles.infoNote}>
              <Ionicons name="information-circle" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                {Platform.OS === 'web' && support.speechRecognition
                  ? 'Sử dụng Web Speech API'
                  : 'Ghi âm giọng nói'}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// =====================================================
// VOICE OUTPUT COMPONENT (Text-to-Speech)
// =====================================================

interface VoiceOutputProps {
  text: string;
  disabled?: boolean;
  size?: number;
  color?: string;
  activeColor?: string;
}

export function VoiceOutput({
  text,
  disabled = false,
  size = 20,
  color = '#666',
  activeColor = '#3B82F6',
}: VoiceOutputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const support = isVoiceSupported();

  const handlePress = useCallback(async () => {
    if (disabled || !text) return;

    if (isSpeaking) {
      await voiceAIService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const cleanedText = cleanTextForSpeech(text);
      await voiceAIService.speak(cleanedText);
      setIsSpeaking(false);
    }
  }, [disabled, isSpeaking, text]);

  // Don't render if TTS not supported
  if (Platform.OS === 'web' && !support.textToSpeech) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || !text}
      style={styles.voiceOutputButton}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
        size={size}
        color={isSpeaking ? activeColor : color}
      />
    </TouchableOpacity>
  );
}

// =====================================================
// VOICE SETTINGS MODAL
// =====================================================

interface VoiceSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export function VoiceSettings({ visible, onClose }: VoiceSettingsProps) {
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    voiceAIService.setConfig({ rate: newRate });
  };

  const handlePitchChange = (newPitch: number) => {
    setPitch(newPitch);
    voiceAIService.setConfig({ pitch: newPitch });
  };

  const testVoice = async () => {
    await voiceAIService.speak('Xin chào! Đây là giọng nói AI tư vấn xây dựng.');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.settingsOverlay}>
        <View style={styles.settingsContent}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>🔊 Cài đặt giọng nói</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Rate Selection */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Tốc độ đọc</Text>
            <View style={styles.optionsRow}>
              {[
                { label: 'Chậm', value: 0.75, icon: '🐢' },
                { label: 'Bình thường', value: 1.0, icon: '🚶' },
                { label: 'Nhanh', value: 1.25, icon: '🏃' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    rate === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => handleRateChange(option.value)}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.optionText,
                      rate === option.value && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pitch Selection */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Cao độ giọng</Text>
            <View style={styles.optionsRow}>
              {[
                { label: 'Trầm', value: 0.8, icon: '🔉' },
                { label: 'Bình thường', value: 1.0, icon: '🔊' },
                { label: 'Cao', value: 1.2, icon: '📢' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    pitch === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => handlePitchChange(option.value)}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.optionText,
                      pitch === option.value && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Test Voice Button */}
          <TouchableOpacity style={styles.testVoiceButton} onPress={testVoice}>
            <Ionicons name="play-circle" size={24} color="#fff" />
            <Text style={styles.testVoiceText}>Thử giọng nói</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  // Voice Input Button
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  voiceButtonDisabled: {
    opacity: 0.5,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  
  // Waves Animation
  wavesContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  wave: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DC2626',
  },
  micCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  
  // Status
  statusText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 16,
  },
  
  // Transcript
  transcriptContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    minHeight: 60,
    marginBottom: 16,
  },
  transcriptText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  
  // Hints
  hintText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  
  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  confirmButton: {
    backgroundColor: Colors.light.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Info Note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  
  // Voice Output
  voiceOutputButton: {
    padding: 6,
    borderRadius: 12,
  },
  
  // Voice Settings
  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  settingsContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  settingItem: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  optionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
  },
  testVoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  testVoiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
