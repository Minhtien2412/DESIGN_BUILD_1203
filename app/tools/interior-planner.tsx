/**
 * Interior Planner Tool - Bố trí nội thất
 */
import { Container } from '@/components/ui/container';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const ROOM_TYPES = [
  {
    id: 'living',
    name: 'Phòng khách',
    emoji: '🛋️',
    tips: [
      'Sofa nên đặt đối diện TV, cách 2.5-3m',
      'Bàn trà ở giữa, cách sofa 40-50cm',
      'Kệ TV nên đặt sát tường, hướng không bị chói nắng',
      'Thảm trải dưới bàn trà, rộng hơn bàn 50cm mỗi bên',
      'Đèn cây đặt góc sofa tạo ánh sáng ấm',
    ],
    furniture: ['Sofa', 'Bàn trà', 'Kệ TV', 'Tủ decor', 'Thảm', 'Đèn cây'],
  },
  {
    id: 'bedroom',
    name: 'Phòng ngủ',
    emoji: '🛏️',
    tips: [
      'Giường đặt đầu sát tường, không đối diện cửa',
      'Tủ quần áo đặt góc phòng, cửa mở không chắn lối đi',
      'Bàn trang điểm gần cửa sổ để lấy ánh sáng tự nhiên',
      'Tab đầu giường 2 bên, cao ngang mặt đệm',
      'Chừa lối đi tối thiểu 60cm quanh giường',
    ],
    furniture: ['Giường', 'Tủ quần áo', 'Tab đầu giường', 'Bàn trang điểm', 'Ghế'],
  },
  {
    id: 'kitchen',
    name: 'Phòng bếp',
    emoji: '🍳',
    tips: [
      'Tam giác vàng: Bếp - Bồn rửa - Tủ lạnh tạo tam giác',
      'Bồn rửa đặt gần cửa sổ để thông thoáng',
      'Khoảng cách giữa các thiết bị: 1-2m',
      'Tủ treo cao 45-50cm từ mặt bàn bếp',
      'Hút mùi đặt cao 65-75cm từ mặt bếp',
    ],
    furniture: ['Tủ bếp trên', 'Tủ bếp dưới', 'Bồn rửa', 'Bếp nấu', 'Tủ lạnh', 'Bàn đảo'],
  },
  {
    id: 'bathroom',
    name: 'Phòng tắm',
    emoji: '🚿',
    tips: [
      'Bồn cầu đặt góc kín, không đối diện cửa',
      'Bồn rửa mặt gần cửa ra vào',
      'Khu tắm tách biệt bằng vách kính/rèm',
      'Gương đặt trên bồn rửa, có đèn LED 2 bên',
      'Kệ đồ cao 120-150cm để tiện lấy',
    ],
    furniture: ['Bồn cầu', 'Bồn rửa mặt', 'Buồng tắm', 'Gương', 'Kệ đồ', 'Máy giặt'],
  },
  {
    id: 'dining',
    name: 'Phòng ăn',
    emoji: '🍽️',
    tips: [
      'Bàn ăn đặt giữa phòng, cách tường 80cm mỗi bên',
      'Đèn treo thả cách mặt bàn 75-85cm',
      'Ghế ăn chừa 50cm phía sau để kéo ra',
      'Tủ đựng chén bát đặt gần bàn ăn',
      'Nên có cửa sổ hoặc lấy sáng tự nhiên',
    ],
    furniture: ['Bàn ăn', 'Ghế ăn', 'Đèn thả', 'Tủ chén', 'Kệ trang trí'],
  },
  {
    id: 'office',
    name: 'Phòng làm việc',
    emoji: '💼',
    tips: [
      'Bàn làm việc đặt vuông góc với cửa sổ (ánh sáng chiếu ngang)',
      'Ghế có thể xoay và điều chỉnh độ cao',
      'Kệ sách đặt trong tầm với khi ngồi',
      'Đèn bàn đặt bên tay không viết',
      'Máy tính cách mắt 50-70cm',
    ],
    furniture: ['Bàn làm việc', 'Ghế văn phòng', 'Kệ sách', 'Tủ hồ sơ', 'Đèn bàn'],
  },
];

const LAYOUT_RULES = [
  { icon: '📏', label: 'Lối đi', value: 'Tối thiểu 80cm' },
  { icon: '🚪', label: 'Trước cửa', value: 'Không đặt đồ cản' },
  { icon: '💡', label: 'Ánh sáng', value: 'Không che cửa sổ' },
  { icon: '🔌', label: 'Ổ điện', value: 'Đặt đồ gần nguồn' },
];

export default function InteriorPlannerScreen() {
  const [selectedRoom, setSelectedRoom] = useState('living');

  const currentRoom = ROOM_TYPES.find((r) => r.id === selectedRoom);

  return (
    <Container>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#9C27B0" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>🛋️ Bố trí Nội thất</Text>
            <Text style={styles.headerSubtitle}>Hướng dẫn sắp xếp đồ nội thất</Text>
          </View>
        </View>

        {/* Room Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.roomScroll}
          contentContainerStyle={styles.roomScrollContent}
        >
          {ROOM_TYPES.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={[
                styles.roomBtn,
                selectedRoom === room.id && styles.roomBtnActive,
              ]}
              onPress={() => setSelectedRoom(room.id)}
            >
              <Text style={styles.roomEmoji}>{room.emoji}</Text>
              <Text
                style={[
                  styles.roomText,
                  selectedRoom === room.id && styles.roomTextActive,
                ]}
              >
                {room.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Room Tips */}
        {currentRoom && (
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Text style={styles.tipsEmoji}>{currentRoom.emoji}</Text>
              <Text style={styles.tipsTitle}>{currentRoom.name}</Text>
            </View>
            <View style={styles.tipsList}>
              {currentRoom.tips.map((tip, idx) => (
                <View key={idx} style={styles.tipItem}>
                  <View style={styles.tipBullet}>
                    <Text style={styles.tipNumber}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Furniture List */}
        {currentRoom && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🪑 Đồ nội thất cần có</Text>
            <View style={styles.furnitureGrid}>
              {currentRoom.furniture.map((item, idx) => (
                <View key={idx} style={styles.furnitureItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#9C27B0" />
                  <Text style={styles.furnitureText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* General Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📐 Quy tắc bố trí chung</Text>
          <View style={styles.rulesGrid}>
            {LAYOUT_RULES.map((rule, idx) => (
              <View key={idx} style={styles.ruleCard}>
                <Text style={styles.ruleIcon}>{rule.icon}</Text>
                <Text style={styles.ruleLabel}>{rule.label}</Text>
                <Text style={styles.ruleValue}>{rule.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Feng Shui Tips */}
        <View style={styles.fengshuiCard}>
          <Text style={styles.fengshuiTitle}>☯️ Lưu ý Phong thủy</Text>
          <Text style={styles.fengshuiText}>
            • Giường không đặt đối diện cửa (vị trí "chân ra cửa"){'\n'}
            • Sofa nên tựa lưng vào tường, không quay lưng ra cửa{'\n'}
            • Gương không đặt đối diện giường ngủ{'\n'}
            • Bếp không đặt đối diện bồn rửa (xung khắc thủy hỏa){'\n'}
            • Cây xanh đặt góc Đông Nam để đón tài lộc
          </Text>
        </View>

        {/* Measurement Guide */}
        <View style={styles.measureCard}>
          <Text style={styles.measureTitle}>📏 Khoảng cách tiêu chuẩn</Text>
          <View style={styles.measureList}>
            <View style={styles.measureItem}>
              <Text style={styles.measureLabel}>Lối đi chính</Text>
              <Text style={styles.measureValue}>≥ 90cm</Text>
            </View>
            <View style={styles.measureItem}>
              <Text style={styles.measureLabel}>Lối đi phụ</Text>
              <Text style={styles.measureValue}>≥ 60cm</Text>
            </View>
            <View style={styles.measureItem}>
              <Text style={styles.measureLabel}>Ghế - Bàn</Text>
              <Text style={styles.measureValue}>30-45cm</Text>
            </View>
            <View style={styles.measureItem}>
              <Text style={styles.measureLabel}>TV - Sofa</Text>
              <Text style={styles.measureValue}>2.5-3.5m</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  roomScroll: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  roomScrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  roomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  roomBtnActive: {
    backgroundColor: '#F3E5F5',
  },
  roomEmoji: {
    fontSize: 16,
  },
  roomText: {
    fontSize: 13,
    color: '#6B7280',
  },
  roomTextActive: {
    color: '#9C27B0',
    fontWeight: '600',
  },
  tipsCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tipsEmoji: {
    fontSize: 28,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 12,
  },
  tipBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3E5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9C27B0',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  furnitureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  furnitureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  furnitureText: {
    fontSize: 13,
    color: '#7B1FA2',
  },
  rulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ruleCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  ruleIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  ruleLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  ruleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  fengshuiCard: {
    margin: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
  },
  fengshuiTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 8,
  },
  fengshuiText: {
    fontSize: 13,
    color: '#EF6C00',
    lineHeight: 20,
  },
  measureCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
  },
  measureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 12,
  },
  measureList: {
    gap: 8,
  },
  measureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },
  measureLabel: {
    fontSize: 13,
    color: '#1976D2',
  },
  measureValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D47A1',
  },
});
