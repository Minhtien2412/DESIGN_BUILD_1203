/**
 * Voice Input Component - Speech recognition for AI chat
 * Uses expo-speech for voice input
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Note: expo-speech only supports speech synthesis (text-to-speech)
// For speech recognition (speech-to-text), we need to use native modules
// or web speech API (for web platform only)

interface VoiceInputProps {
  onTextReceived: (text: string) => void;
  language?: string;
}

export default function VoiceInput({ onTextReceived, language = 'vi-VN' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [transcript, setTranscript] = useState('');
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const startListening = async () => {
    try {
      setModalVisible(true);
      setIsListening(true);
      setTranscript('');

      // Note: This is a placeholder implementation
      // For real speech recognition, you need to:
      // 1. Use expo-av with native modules
      // 2. Use react-native-voice (requires native configuration)
      // 3. Use Web Speech API (web only)
      // 4. Use cloud services (Google Speech-to-Text, Azure Speech, etc.)

      Alert.alert(
        'Tính năng Voice Input',
        'Để sử dụng nhập giọng nói, bạn cần:\n\n' +
        '• Cài đặt react-native-voice\n' +
        '• Hoặc tích hợp Google Speech-to-Text API\n' +
        '• Hoặc sử dụng Azure Speech Service\n\n' +
        'Hiện tại đây là demo placeholder.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Simulate voice input for demo
              simulateVoiceInput();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error starting voice input:', error);
      Alert.alert('Lỗi', 'Không thể khởi động nhận dạng giọng nói');
      setIsListening(false);
      setModalVisible(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (transcript) {
      onTextReceived(transcript);
    }
    setModalVisible(false);
    setTranscript('');
  };

  // Simulate voice input for demo purposes
  const simulateVoiceInput = () => {
    const demoTexts = [
      'Dự án của tôi đang ở đâu?',
      'Phân tích tiến độ công trình hôm nay',
      'Tạo báo cáo tuần này',
      'Kiểm tra chất lượng vật liệu',
    ];
    const randomText = demoTexts[Math.floor(Math.random() * demoTexts.length)];

    // Simulate typing effect
    let currentText = '';
    let index = 0;

    const interval = setInterval(() => {
      if (index < randomText.length) {
        currentText += randomText[index];
        setTranscript(currentText);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsListening(false);
        }, 500);
      }
    }, 50);
  };

  const cancelListening = () => {
    setIsListening(false);
    setModalVisible(false);
    setTranscript('');
  };

  return (
    <>
      {/* Voice Input Button */}
      <TouchableOpacity
        style={styles.voiceButton}
        onPress={startListening}
        disabled={isListening}
      >
        <Ionicons name="mic" size={24} color={Colors.light.primary} />
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
            {/* Animated Mic Icon */}
            <Animated.View
              style={[
                styles.micContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View style={styles.micCircle}>
                <Ionicons name="mic" size={48} color="#fff" />
              </View>
            </Animated.View>

            {/* Status Text */}
            <Text style={styles.statusText}>
              {isListening ? 'Đang nghe...' : 'Sẵn sàng'}
            </Text>

            {/* Transcript */}
            {transcript && (
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptText}>{transcript}</Text>
              </View>
            )}

            {/* Loading Indicator */}
            {isListening && (
              <ActivityIndicator
                size="small"
                color={Colors.light.primary}
                style={styles.loader}
              />
            )}

            {/* Hint Text */}
            <Text style={styles.hintText}>
              {isListening
                ? 'Nói rõ ràng, từ từ...'
                : 'Nhấn nút micro để bắt đầu'}
            </Text>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={cancelListening}
              >
                <Ionicons name="close" size={24} color="#EF4444" />
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              {transcript && !isListening && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.confirmButton]}
                  onPress={stopListening}
                >
                  <Ionicons name="checkmark" size={24} color="#fff" />
                  <Text style={styles.confirmButtonText}>Xác nhận</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Info Note */}
            <View style={styles.infoNote}>
              <Ionicons name="information-circle" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                Tính năng demo - cần tích hợp Speech Recognition API
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  micContainer: {
    marginBottom: 24,
  },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  statusText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
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
  loader: {
    marginVertical: 12,
  },
  hintText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
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
    color: '#EF4444',
  },
  confirmButton: {
    backgroundColor: Colors.light.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
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
});
