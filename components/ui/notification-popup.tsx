import { useThemeColor } from '@/hooks/use-theme-color';
import { pushRoute, type AppKnownRoute } from '@/services/nav';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type NotificationPopupProps = {
  visible: boolean;
  title: string;
  body?: string;
  createdAt?: number;
  route?: AppKnownRoute;
  params?: Record<string, string>;
  onClose: () => void;
};

export function NotificationPopup({ visible, title, body, createdAt, route, params, onClose }: NotificationPopupProps) {
  const bg = useThemeColor({}, 'background');
  if (!visible) return null;
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: `${bg}AA` }]}> 
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {body ? <Text style={styles.body}>{body}</Text> : null}
          {createdAt ? <Text style={styles.time}>{new Date(createdAt).toLocaleString('vi-VN')}</Text> : null}
          <View style={styles.row}>
            {route ? (
              <TouchableOpacity style={[styles.btn, styles.primary]} onPress={() => { onClose(); pushRoute(route!, params); }}>
                <Text style={styles.btnText}>Xem nguồn</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={[styles.btn, styles.ghost]} onPress={onClose}>
              <Text style={[styles.btnText, { color: '#111' }]}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { width: '86%', maxWidth: 520, backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#ccc' },
  title: { fontWeight: '800', fontSize: 16 },
  body: { marginTop: 8 },
  time: { marginTop: 6, fontSize: 12, opacity: 0.6 },
  row: { flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'flex-end' },
  btn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  primary: { backgroundColor: '#111' },
  ghost: { backgroundColor: '#f5f5f5' },
  btnText: { color: '#fff', fontWeight: '700' },
});

export default NotificationPopup;
