/**
 * Paint Calculator - Tính lượng sơn cho tường
 */
import { Container } from '@/components/ui/container';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const PAINT_TYPES = [
  { id: 'interior', label: 'Sơn nội thất', coverage: 12, emoji: '🏠' },
  { id: 'exterior', label: 'Sơn ngoại thất', coverage: 10, emoji: '🏢' },
  { id: 'primer', label: 'Sơn lót', coverage: 14, emoji: '🎨' },
  { id: 'waterproof', label: 'Sơn chống thấm', coverage: 8, emoji: '💧' },
];

const COAT_OPTIONS = [
  { id: 1, label: '1 lớp', multiplier: 1 },
  { id: 2, label: '2 lớp', multiplier: 2 },
  { id: 3, label: '3 lớp', multiplier: 3 },
];

export default function PaintCalculatorScreen() {
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [doors, setDoors] = useState('1');
  const [windows, setWindows] = useState('2');
  const [paintType, setPaintType] = useState('interior');
  const [coats, setCoats] = useState(2);
  const [result, setResult] = useState<{
    totalArea: number;
    deductArea: number;
    netArea: number;
    paintLiters: number;
    paintCans: number;
  } | null>(null);

  const calculate = () => {
    const l = parseFloat(length) || 0;
    const h = parseFloat(height) || 0;
    const d = parseInt(doors) || 0;
    const w = parseInt(windows) || 0;

    if (l <= 0 || h <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập chiều dài và chiều cao hợp lệ');
      return;
    }

    // Tổng diện tích tường (4 mặt)
    const totalArea = 2 * (l + l) * h; // Giả sử phòng vuông
    
    // Diện tích cửa (trung bình 2m²/cửa) và cửa sổ (1.5m²/cửa sổ)
    const deductArea = d * 2 + w * 1.5;
    
    // Diện tích cần sơn
    const netArea = Math.max(0, totalArea - deductArea);
    
    // Lượng sơn cần (m²/lít)
    const selectedPaint = PAINT_TYPES.find(p => p.id === paintType);
    const coverage = selectedPaint?.coverage || 12;
    const paintLiters = (netArea / coverage) * coats;
    
    // Số thùng sơn (18 lít/thùng hoặc 5 lít/thùng)
    const paintCans = Math.ceil(paintLiters / 5); // Tính theo lon 5 lít

    setResult({
      totalArea: Math.round(totalArea * 10) / 10,
      deductArea: Math.round(deductArea * 10) / 10,
      netArea: Math.round(netArea * 10) / 10,
      paintLiters: Math.round(paintLiters * 10) / 10,
      paintCans,
    });
  };

  return (
    <Container>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#e74c3c" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>🎨 Tính lượng Sơn</Text>
            <Text style={styles.headerSubtitle}>Ước tính số lít sơn cần dùng</Text>
          </View>
        </View>

        {/* Paint Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại sơn</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PAINT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeChip,
                  paintType === type.id && styles.typeChipActive,
                ]}
                onPress={() => setPaintType(type.id)}
              >
                <Text style={styles.typeEmoji}>{type.emoji}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    paintType === type.id && styles.typeLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
                <Text style={styles.typeCoverage}>{type.coverage} m²/lít</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kích thước phòng</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Chiều dài (m)</Text>
              <TextInput
                style={styles.input}
                value={length}
                onChangeText={setLength}
                keyboardType="decimal-pad"
                placeholder="VD: 5"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Chiều cao (m)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
                placeholder="VD: 3"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số cửa ra vào</Text>
              <TextInput
                style={styles.input}
                value={doors}
                onChangeText={setDoors}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số cửa sổ</Text>
              <TextInput
                style={styles.input}
                value={windows}
                onChangeText={setWindows}
                keyboardType="number-pad"
                placeholder="2"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* Coats Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số lớp sơn</Text>
          <View style={styles.coatsRow}>
            {COAT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.coatBtn,
                  coats === opt.id && styles.coatBtnActive,
                ]}
                onPress={() => setCoats(opt.id)}
              >
                <Text
                  style={[
                    styles.coatText,
                    coats === opt.id && styles.coatTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity style={styles.calcBtn} onPress={calculate}>
          <Ionicons name="calculator" size={20} color="#fff" />
          <Text style={styles.calcBtnText}>Tính toán</Text>
        </TouchableOpacity>

        {/* Result */}
        {result && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>📊 Kết quả</Text>
            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Tổng diện tích tường:</Text>
                <Text style={styles.resultValue}>{result.totalArea} m²</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Trừ cửa/cửa sổ:</Text>
                <Text style={styles.resultValue}>-{result.deductArea} m²</Text>
              </View>
              <View style={styles.resultDivider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Diện tích cần sơn:</Text>
                <Text style={[styles.resultValue, { color: '#e74c3c' }]}>
                  {result.netArea} m²
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Lượng sơn cần:</Text>
                <Text style={[styles.resultValue, { color: '#e74c3c', fontWeight: '700' }]}>
                  {result.paintLiters} lít
                </Text>
              </View>
              <View style={styles.resultHighlight}>
                <Text style={styles.highlightText}>
                  ≈ {result.paintCans} lon (5 lít/lon)
                </Text>
              </View>
            </View>
            
            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>📌 Lưu ý</Text>
              <Text style={styles.noteText}>
                • Nên mua thêm 10-15% để dự phòng{'\n'}
                • Độ phủ thực tế phụ thuộc vào bề mặt tường{'\n'}
                • Tường mới cần sơn lót trước
              </Text>
            </View>
          </View>
        )}

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
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  typeChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 100,
  },
  typeChipActive: {
    backgroundColor: '#e74c3c',
  },
  typeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  typeLabelActive: {
    color: '#fff',
  },
  typeCoverage: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  coatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  coatBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  coatBtnActive: {
    backgroundColor: '#e74c3c',
  },
  coatText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  coatTextActive: {
    color: '#fff',
  },
  calcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  calcBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultSection: {
    padding: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  resultValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  resultHighlight: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  highlightText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D97706',
  },
  noteCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 20,
  },
});
