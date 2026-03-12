/**
 * Electrical Calculator - Tính công suất điện
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

const APPLIANCES = [
  { id: 'ac', label: 'Điều hòa', power: 1500, emoji: '❄️' },
  { id: 'fridge', label: 'Tủ lạnh', power: 150, emoji: '🧊' },
  { id: 'washer', label: 'Máy giặt', power: 500, emoji: '🧺' },
  { id: 'heater', label: 'Bình nóng lạnh', power: 2500, emoji: '🔥' },
  { id: 'microwave', label: 'Lò vi sóng', power: 1000, emoji: '📦' },
  { id: 'rice', label: 'Nồi cơm điện', power: 700, emoji: '🍚' },
  { id: 'tv', label: 'TV', power: 100, emoji: '📺' },
  { id: 'computer', label: 'Máy tính', power: 300, emoji: '💻' },
  { id: 'light', label: 'Đèn LED (mỗi bóng)', power: 10, emoji: '💡' },
  { id: 'fan', label: 'Quạt', power: 70, emoji: '🌀' },
  { id: 'pump', label: 'Máy bơm nước', power: 750, emoji: '💧' },
  { id: 'iron', label: 'Bàn ủi', power: 1000, emoji: '👔' },
];

const WIRE_SIZES = [
  { size: '1.5mm²', maxPower: 2400, color: '#3498db' },
  { size: '2.5mm²', maxPower: 4000, color: '#27ae60' },
  { size: '4mm²', maxPower: 6400, color: '#f39c12' },
  { size: '6mm²', maxPower: 9600, color: '#e74c3c' },
  { size: '10mm²', maxPower: 16000, color: '#9b59b6' },
];

export default function ElectricalCalculatorScreen() {
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [customPower, setCustomPower] = useState('');

  const updateQuantity = (id: string, value: string) => {
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const calculateTotal = () => {
    let total = 0;
    APPLIANCES.forEach(app => {
      const qty = parseInt(quantities[app.id] || '0') || 0;
      total += app.power * qty;
    });
    total += parseFloat(customPower) || 0;
    return total;
  };

  const getRecommendedWire = (power: number) => {
    for (const wire of WIRE_SIZES) {
      if (power <= wire.maxPower) {
        return wire;
      }
    }
    return WIRE_SIZES[WIRE_SIZES.length - 1];
  };

  const totalPower = calculateTotal();
  const recommendedWire = getRecommendedWire(totalPower);
  const currentAmp = totalPower / 220;

  return (
    <Container>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#3498db" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>⚡ Tính công suất Điện</Text>
            <Text style={styles.headerSubtitle}>Tính tổng tải và chọn dây điện</Text>
          </View>
        </View>

        {/* Total Power Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tổng công suất</Text>
              <Text style={styles.summaryValue}>{totalPower.toLocaleString()} W</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Dòng điện</Text>
              <Text style={styles.summaryValue}>{currentAmp.toFixed(1)} A</Text>
            </View>
          </View>
          <View style={styles.wireRecommend}>
            <Text style={styles.wireLabel}>Dây điện đề xuất:</Text>
            <View style={[styles.wireBadge, { backgroundColor: recommendedWire.color }]}>
              <Text style={styles.wireText}>{recommendedWire.size}</Text>
            </View>
          </View>
        </View>

        {/* Appliances Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔌 Thiết bị điện</Text>
          <View style={styles.appliancesList}>
            {APPLIANCES.map((app) => (
              <View key={app.id} style={styles.applianceItem}>
                <View style={styles.applianceInfo}>
                  <Text style={styles.applianceEmoji}>{app.emoji}</Text>
                  <View>
                    <Text style={styles.applianceLabel}>{app.label}</Text>
                    <Text style={styles.appliancePower}>{app.power}W</Text>
                  </View>
                </View>
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => {
                      const current = parseInt(quantities[app.id] || '0') || 0;
                      if (current > 0) updateQuantity(app.id, String(current - 1));
                    }}
                  >
                    <Ionicons name="remove" size={18} color="#6B7280" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.qtyInput}
                    value={quantities[app.id] || '0'}
                    onChangeText={(v) => updateQuantity(app.id, v)}
                    keyboardType="number-pad"
                  />
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => {
                      const current = parseInt(quantities[app.id] || '0') || 0;
                      updateQuantity(app.id, String(current + 1));
                    }}
                  >
                    <Ionicons name="add" size={18} color="#3498db" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Custom Power Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>➕ Thiết bị khác</Text>
          <TextInput
            style={styles.customInput}
            value={customPower}
            onChangeText={setCustomPower}
            keyboardType="decimal-pad"
            placeholder="Nhập tổng công suất thiết bị khác (W)"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Wire Size Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Bảng tra dây điện</Text>
          <View style={styles.wireTable}>
            {WIRE_SIZES.map((wire, index) => (
              <View
                key={wire.size}
                style={[
                  styles.wireRow,
                  recommendedWire.size === wire.size && styles.wireRowActive,
                ]}
              >
                <View style={[styles.wireDot, { backgroundColor: wire.color }]} />
                <Text style={styles.wireSize}>{wire.size}</Text>
                <Text style={styles.wireMaxPower}>
                  ≤ {wire.maxPower.toLocaleString()}W
                </Text>
                {recommendedWire.size === wire.size && (
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
          <Text style={styles.noteTitle}>💡 Lưu ý an toàn</Text>
          <Text style={styles.noteText}>
            • CB/Aptomat phải phù hợp với dây dẫn{'\n'}
            • Không sử dụng quá 80% công suất tối đa{'\n'}
            • Tách riêng mạch điện cho thiết bị công suất lớn{'\n'}
            • Nên có ổ cắm chống giật cho nhà vệ sinh
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
    color: '#3498db',
  },
  wireRecommend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  wireLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  wireBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  wireText: {
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
  appliancesList: {},
  applianceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  applianceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  applianceEmoji: {
    fontSize: 24,
  },
  applianceLabel: {
    fontSize: 14,
    color: '#1F2937',
  },
  appliancePower: {
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
  customInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  wireTable: {
    gap: 8,
  },
  wireRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    gap: 12,
  },
  wireRowActive: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  wireDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  wireSize: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    width: 70,
  },
  wireMaxPower: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  checkIcon: {},
  noteCard: {
    margin: 16,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 16,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C2410C',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#EA580C',
    lineHeight: 20,
  },
});
