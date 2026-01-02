import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export type ChatMessage = {
  id: string;
  text: string;
  from: 'user' | 'agent';
  at: number;
};

type Props = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  onSend?: (text: string) => Promise<string | void> | (string | void);
  initialMessages?: ChatMessage[];
};

export function ChatPopup({ visible, title = 'Tư vấn trực tuyến', onClose, onSend, initialMessages }: Props) {
  const bg = useThemeColor({}, 'background');
  const cardBg = '#fff';
  const border = '#555';
  const muted = '#777';
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? [
      { id: 'hello', text: 'Xin chào! Mình có thể hỗ trợ gì cho bạn?', from: 'agent', at: Date.now() },
    ]
  );
  const inputRef = useRef<TextInput>(null);

  const containerStyle = useMemo(() => [styles.overlay, { backgroundColor: `${bg}AA` }], [bg]);
  const [sending, setSending] = useState(false);

  if (!visible) return null;
  async function handleSend() {
    const text = msg.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: String(Date.now()), text, from: 'user', at: Date.now() };
    setMessages((arr) => [...arr, userMsg]);
    setMsg('');
    if (!onSend) return;
    try {
      setSending(true);
      const response = await onSend(text);
      if (typeof response === 'string' && response.length > 0) {
        const agentMsg: ChatMessage = { id: String(Date.now() + 1), text: response, from: 'agent', at: Date.now() };
        setMessages((arr) => [...arr, agentMsg]);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={[containerStyle, { pointerEvents: 'auto' }]}>
      {/* Backdrop: tap to close */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.kb}
      >
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="account-tie" size={18} color="#111" />
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={20} color="#111" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {messages.map((m) => (
              <View
                key={m.id}
                style={[styles.bubble, m.from === 'user' ? styles.bubbleUser : styles.bubbleAgent]}
              >
                <Text style={styles.msgText}>{m.text}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.inputRow, { borderTopColor: border }]}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={muted}
              value={msg}
              onChangeText={setMsg}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity style={[styles.sendBtn, sending && { opacity: 0.6 }]} onPress={handleSend} disabled={sending}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000066',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  kb: { width: '100%' },
  card: {
    marginTop: 8,
    width: '100%',
    maxWidth: 540,
    borderRadius: 12,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontWeight: '700' },
  body: {
    maxHeight: 360,
    padding: 12,
    gap: 8,
    backgroundColor: '#fafafa',
  },
  bubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#555',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    maxWidth: '90%',
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#dbeafe',
  },
  bubbleAgent: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  msgText: { fontSize: 14 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 0.5,
    backgroundColor: '#fff',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#555',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  sendBtn: {
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
});

export default ChatPopup;
