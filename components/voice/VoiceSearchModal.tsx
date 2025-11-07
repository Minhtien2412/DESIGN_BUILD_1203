import { Colors } from '@/constants/theme';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
}

export const VoiceSearchModal: React.FC<Props> = ({ visible, onClose, onResult }) => {
  const { supported, state, transcript, error, start, stop, reset } = useVoiceSearch('vi-VN');
  const isListening = state === 'listening';

  const handleConfirm = () => {
    if (transcript.trim().length > 0) {
      onResult(transcript.trim());
      reset();
      onClose();
    }
  };

  const disabled = !supported && Platform.OS !== 'web';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Tìm kiếm bằng giọng nói</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }}>
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          {disabled ? (
            <View style={styles.center}>
              <Ionicons name="mic-off" size={40} color="#999" />
              <Text style={styles.desc}>Thiết bị hiện tại chưa hỗ trợ nhận diện giọng nói trực tiếp.</Text>
              <Text style={styles.note}>Dùng trình duyệt web hoặc bật bản Dev Build có tích hợp STT.</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={isListening ? stop : start}
                style={[styles.micButton, isListening && styles.micActive]}
              >
                <Ionicons name={isListening ? 'stop' : 'mic'} size={28} color={isListening ? '#fff' : Colors.light.primary} />
              </TouchableOpacity>
              <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
                <Text style={styles.hint}>{isListening ? 'Đang nghe...' : 'Chạm để bắt đầu nói'}</Text>
                {!!transcript && (
                  <View style={styles.transcriptBox}>
                    <Text style={styles.transcript}>{transcript}</Text>
                  </View>
                )}
                {!!error && <Text style={styles.error}>Lỗi: {error}</Text>}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => { reset(); onClose(); }} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirm}
                  style={[styles.primaryBtn, (!transcript || transcript.trim().length === 0) && { opacity: 0.5 }]}
                  disabled={!transcript || transcript.trim().length === 0}
                >
                  <Text style={styles.primaryText}>Dùng kết quả</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 16, fontWeight: '700', color: '#111' },
  center: { alignItems: 'center', padding: 24, gap: 8 },
  desc: { color: '#555', textAlign: 'center' },
  note: { color: '#888', fontSize: 12, textAlign: 'center' },
  micButton: { alignSelf: 'center', marginTop: 18, width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: Colors.light.primary, alignItems: 'center', justifyContent: 'center' },
  micActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  hint: { textAlign: 'center', color: '#666' },
  transcriptBox: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 12, marginTop: 10 },
  transcript: { color: '#111' },
  error: { color: '#b91c1c', textAlign: 'center', marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, paddingHorizontal: 16, marginTop: 12 },
  secondaryBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  secondaryText: { color: '#555', fontWeight: '600' },
  primaryBtn: { backgroundColor: Colors.light.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  primaryText: { color: '#fff', fontWeight: '700' },
});

export default VoiceSearchModal;
