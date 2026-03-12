/**
 * Plumbing Calculator - Tính đường ống nước
 */
import { Container } from '@/components/ui/container';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const FIXTURES = [
  { id: 'toilet', label: 'Bồn cầu', flowRate: 6, emoji: '🚽' },
  { id: 'sink', label: 'Chậu rửa mặt', flowRate: 4, emoji: '🚰' },
  { id: 'shower', label: 'Vòi sen', flowRate: 10, emoji: '🚿' },
  { id: 'bathtub', label: 'Bồn tắm', flowRate: 15, emoji: '🛁' },
  { id: 'kitchen', label: 'Chậu rửa bếp', flowRate: 8, emoji: '🍳' },
  { id: 'washer', label: 'Máy giặt', flowRate: 12, emoji: '🧺' },
  { id: 'dishwasher', label: 'Máy rửa bát', flowRate: 6, emoji: '🍽️' },
  { id: 'garden', label: 'Vòi tưới vườn', flowRate: 20, emoji: '🌱' },
];

const PIPE_SIZES = [
  { size: 'Ø21 (1/2")', diameter: 21, maxFlow: 15, color: '#3498db' },
  { size: 'Ø27 (3/4")', diameter: 27, maxFlow: 25, color: '#27ae60' },
  { size: 'Ø34 (1")', diameter: 34, maxFlow: 45, color: '#f39c12' },
  { size: 'Ø42 (1.25")', diameter: 42, maxFlow: 70, color: '#e74c3c' },
  { size: 'Ø48 (1.5")', diameter: 48, maxFlow: 100, color: '#9b59b6' },
  { size: 'Ø60 (2")', diameter: 60, maxFlow: 150, color: '#1abc9c' },
];

const FLOORS = [
  { id: 1, label: '1 tầng', multiplier: 1 },
  { id: 2, label: '2 tầng', multiplier: 1.2 },
  { id: 3, label: '3 tầng', multiplier: 1.4 },
  { id: 4, label: '4+ tầng', multiplier: 1.6 },
];

export default function PlumbingCalculatorScreen() {
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [floors, setFloors] = useState(1);

  const updateQuantity = (id: string, value: string) => {
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const calculateTotalFlow = () => {
    let total = 0;
    FIXTURES.forEach(fix => {
      const qty = parseInt(quantities[fix.id] || '0') || 0;
      total += fix.flowRate * qty;
    });
    const floorMultiplier = FLOORS.find(f => f.id === floors)?.multiplier || 1;
    return total * floorMultiplier * 0.7; // 70% simultaneity factor
  };

  const getRecommendedPipe = (flow: number) => {
    for (const pipe of PIPE_SIZES) {
      if (flow <= pipe.maxFlow) {
        return pipe;
      }
    }
    return PIPE_SIZES[PIPE_SIZES.length - 1];
  };

  const totalFlow = calculateTotalFlow();
  const recommendedPipe = getRecommendedPipe(totalFlow);

  const getFixtureCount = () => {
    let count = 0;
    FIXTURES.forEach(fix => {
      count += parseInt(quantities[fix.id] || '0') || 0;
    });
    return count;
  };

  return (
    <Container>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1abc9c" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>💧 Tính đường ống Nước</Text>
            <Text style={styles.headerSubtitle}>Tính kích thước ống cấp nước</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tổng thiết bị</Text>
              <Text style={styles.summaryValue}>{getFixtureCount()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Lưu lượng</Text>
              <Text style={styles.summaryValue}>{totalFlow.toFixed(1)} L/phút</Text>
            </View>
          </View>
          <View style={styles.pipeRecommend}>
            <Text style={styles.pipeLabel}>Ống cấp chính đề xuất:</Text>
            <View style={[styles.pipeBadge, { backgroundColor: recommendedPipe.color }]}>
              <Text style={styles.pipeText}>{recommendedPipe.size}</Text>
            </View>
          </View>
        </View>

        {/* Floor Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Số tầng</Text>
          <View style={styles.floorsRow}>
            {FLOORS.map((floor) => (
              <TouchableOpacity
                key={floor.id}
                style={[
                  styles.floorBtn,
                  floors === floor.id && styles.floorBtnActive,
                ]}
                onPress={() => setFloors(floor.id)}
              >
                <Text
                  style={[
                    styles.floorText,
                    floors === floor.id && styles.floorTextActive,
                  ]}
                >
                  {floor.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fixtures Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚿 Thiết bị vệ sinh</Text>
          <View style={styles.fixturesList}>
            {FIXTURES.map((fix) => (
              <View key={fix.id} style={styles.fixtureItem}>
                <View style={styles.fixtureInfo}>
                  <Text style={styles.fixtureEmoji}>{fix.emoji}</Text>
                  <View>
                    <Text style={styles.fixtureLabel}>{fix.label}</Text>
                    <Text style={styles.fixtureFlow}>{fix.flowRate} L/phút</Text>
                  </View>
                </View>
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => {
                      const current = parseInt(quantities[fix.id] || '0') || 0;
                      if (current > 0) updateQuantity(fix.id, String(current - 1));
                    }}
                  >
                    <Ionicons name="remove" size={18} color="#6B7280" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.qtyInput}
                    value={quantities[fix.id] || '0'}
                    onChangeText={(v) => updateQuantity(fix.id, v)}
                    keyboardType="number-pad"
                  />
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => {
                      const current = parseInt(quantities[fix.id] || '0') || 0;
                      updateQuantity(fix.id, String(current + 1));
                    }}
                  >
                    <Ionicons name="add" size={18} color="#1abc9c" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Pipe Size Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Bảng tra ống nước</Text>
          <View style={styles.pipeTable}>
            {PIPE_SIZES.map((pipe) => (
              <View
                key={pipe.size}
                style={[
                  styles.pipeRow,
                  recommendedPipe.size === pipe.size && styles.pipeRowActive,
                ]}
              >
                <View style={[styles.pipeDot, { backgroundColor: pipe.color }]} />
                <Text style={styles.pipeSize}>{pipe.size}</Text>
                <Text style={styles.pipeMaxFlow}>
                  ≤ {pipe.maxFlow} L/phút
                </Text>
                {recommendedPipe.size === pipe.size && (
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>💡 Lưu ý khi lắp đặt</Text>
          <Text style={styles.noteText}>
            • Ống cấp nước nóng nên dùng ống PPR chịu nhiệt{'\n'}
            • Đặt van khóa cho mỗi thiết bị để bảo trì{'\n'}
            • Ống thoát phải có độ dốc tối thiểu 2%{'\n'}
            • Nên có bể chứa nước dự phòng cho nhà cao tầng
          </Text>
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
  summaryCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1abc9c',
  },
  pipeRecommend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pipeLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  pipeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pipeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
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
  floorsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  floorBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  floorBtnActive: {
    backgroundColor: '#1abc9c',
  },
  floorText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  floorTextActive: {
    color: '#fff',
  },
  fixturesList: {},
  fixtureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  fixtureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fixtureEmoji: {
    fontSize: 24,
  },
  fixtureLabel: {
    fontSize: 14,
    color: '#1F2937',
  },
  fixtureFlow: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyInput: {
    width: 40,
    height: 32,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  pipeTable: {
    gap: 8,
  },
  pipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    gap: 12,
  },
  pipeRowActive: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  pipeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pipeSize: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    width: 100,
  },
  pipeMaxFlow: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  checkIcon: {},
  noteCard: {
    margin: 16,
    backgroundColor: '#E0F2F1',
    borderRadius: 12,
    padding: 16,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00695C',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#00897B',
    lineHeight: 20,
  },
});
