import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PlusAction = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: Href;
};

const ACTIONS: PlusAction[] = [
  { id: 'create', label: 'Tạo dự án mới', icon: 'add-circle-outline', color: '#0D9488', route: '/projects/create' },
  { id: 'messages', label: 'Tin nhắn', icon: 'chatbubble-ellipses-outline', color: '#0D9488', route: '/messages' },
  { id: 'call', label: 'Cuộc gọi', icon: 'call-outline', color: '#0D9488', route: '/call/history' },
  { id: 'contact', label: 'Liên hệ', icon: 'people-outline', color: '#000000', route: '/communications' },
  { id: 'help', label: 'Hướng dẫn & Trợ giúp', icon: 'help-circle-outline', color: '#6B7280', route: '/intro' },
];

export interface TopPlusMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function TopPlusMenu({ visible, onClose }: TopPlusMenuProps) {
  const handlePress = (route: Href) => {
    onClose();
    setTimeout(() => router.push(route), 200);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.menu, { pointerEvents: 'box-none' }]}>
          <View style={styles.card}>
            {ACTIONS.map((a, idx) => (
              <TouchableOpacity
                key={a.id}
                style={[styles.item, idx < ACTIONS.length - 1 && styles.itemBorder]}
                activeOpacity={0.7}
                onPress={() => handlePress(a.route)}
              >
                <View style={[styles.iconCircle, { backgroundColor: `${a.color}15` }]}>
                  <Ionicons name={a.icon} size={20} color={a.color} />
                </View>
                <Text style={styles.label} numberOfLines={1}>{a.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  menu: {
    flex: 1,
    alignItems: 'flex-end',
  },
  card: {
    marginTop: 70,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    width: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: '#fff',
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});
