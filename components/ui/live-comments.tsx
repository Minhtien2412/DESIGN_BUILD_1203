import { useLive } from '@/features/live';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type LiveCommentsProps = {
  onClose?: () => void;
  streamId?: string; // optional: show comments for specific stream/video id
};

export default function LiveComments({ onClose, streamId }: LiveCommentsProps) {
  const { comments, addComment, getComments, addCommentFor } = useLive();
  const [text, setText] = React.useState('');

  const onSend = () => {
    if (streamId) addCommentFor(streamId, text);
    else addComment(text);
    setText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.overlay, { pointerEvents: 'box-none' }]}
    >
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Bình luận</Text>
          {onClose ? (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.list}>
          {(
            streamId ? getComments(streamId) : comments
          ).length === 0 ? (
            <Text style={styles.empty}>Chưa có bình luận nào.</Text>
          ) : (
            (streamId ? getComments(streamId) : comments).map((c: any) => (
              <View key={c.id} style={styles.commentRow}>
                <Text style={styles.commentUser}>@{c.user}</Text>
                <Text style={styles.commentText}>{c.text}</Text>
              </View>
            ))
          )}
        </View>
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Nhập bình luận..."
            placeholderTextColor="#999"
            style={styles.input}
            onSubmitEditing={onSend}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={onSend} style={styles.sendBtn}>
            <Text style={styles.sendText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

LiveComments.displayName = 'LiveComments';

const SHEET_HEIGHT = 360;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
    maxHeight: SHEET_HEIGHT,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontWeight: '700' },
  closeBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  closeText: { color: '#007aff', fontWeight: '600' },
  list: { paddingVertical: 6 },
  empty: { color: '#666', textAlign: 'center', paddingVertical: 8 },
  commentRow: { flexDirection: 'row', gap: 6, paddingVertical: 6 },
  commentUser: { fontWeight: '700', color: '#111' },
  commentText: { color: '#333', flexShrink: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f9fafb' },
  sendBtn: { backgroundColor: '#0a7ea4', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  sendText: { color: '#fff', fontWeight: '800' },
});
