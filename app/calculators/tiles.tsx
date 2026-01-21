/**
 * Tiles Calculator - Tính số gạch lát nền/ốp tường
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

const TILE_SIZES = [
  { id: '30x30', label: '30x30', width: 30, height: 30, emoji: '⬜' },
  { id: '40x40', label: '40x40', width: 40, height: 40, emoji: '🔲' },
  { id: '60x60', label: '60x60', width: 60, height: 60, emoji: '⬛' },
  { id: '80x80', label: '80x80', width: 80, height: 80, emoji: '🟫' },
  { id: '30x60', label: '30x60', width: 30, height: 60, emoji: '📦' },
  { id: '60x120', label: '60x120', width: 60, height: 120, emoji: '🧱' },
];

const TILE_TYPES = [
  { id: 'floor', label: 'Lát nền', extra: 5 },
  { id: 'wall', label: 'Ốp tường', extra: 8 },
  { id: 'diagonal', label: 'Lát chéo', extra: 15 },
];

export default function TilesCalculatorScreen() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [tileSize, setTileSize] = useState('60x60');
  const [tileType, setTileType] = useState('floor');
  const [result, setResult] = useState<{
    area: number;
    tilesPerSqm: number;
    totalTiles: number;
    extraTiles: number;
    finalTiles: number;
    boxes: number;
  } | null>(null);

  const calculate = () => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;

    if (l <= 0 || w <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập chiều dài và chiều rộng hợp lệ');
      return;
    }

    const selectedTile = TILE_SIZES.find(t => t.id === tileSize);
    const selectedType = TILE_TYPES.find(t => t.id === tileType);
    
    if (!selectedTile || !selectedType) return;

    // Diện tích cần lát (m²)
    const area = l * w;
    
    // Diện tích 1 viên gạch (m²)
    const tileArea = (selectedTile.width / 100) * (selectedTile.height / 100);
    
    // Số gạch/m²
    const tilesPerSqm = 1 / tileArea;
    
    // Tổng số gạch cần
    const totalTiles = Math.ceil(area * tilesPerSqm);
    
    // Số gạch dự phòng (theo % hao hụt)
    const extraTiles = Math.ceil(totalTiles * (selectedType.extra / 100));
    
    // Tổng cộng
    const finalTiles = totalTiles + extraTiles;
    
    // Số hộp (4-6 viên/hộp tùy size)
    const tilesPerBox = selectedTile.width >= 60 ? 4 : 6;
    const boxes = Math.ceil(finalTiles / tilesPerBox);

    setResult({
      area: Math.round(area * 100) / 100,
      tilesPerSqm: Math.round(tilesPerSqm * 100) / 100,
      totalTiles,
      extraTiles,
      finalTiles,
      boxes,
    });
  };

  return (
    <Container>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#f39c12" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>🧱 Tính số Gạch</Text>
            <Text style={styles.headerSubtitle}>Ước tính số viên gạch cần mua</Text>
          </View>
        </View>

        {/* Tile Size Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kích thước gạch (cm)</Text>
          <View style={styles.tileSizeGrid}>
            {TILE_SIZES.map((tile) => (
              <TouchableOpacity
                key={tile.id}
                style={[
                  styles.tileSizeBtn,
                  tileSize === tile.id && styles.tileSizeBtnActive,
                ]}
                onPress={() => setTileSize(tile.id)}
              >
                <Text style={styles.tileSizeEmoji}>{tile.emoji}</Text>
                <Text
                  style={[
                    styles.tileSizeLabel,
                    tileSize === tile.id && styles.tileSizeLabelActive,
                  ]}
                >
                  {tile.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tile Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kiểu lát</Text>
          <View style={styles.typeRow}>
            {TILE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeBtn,
                  tileType === type.id && styles.typeBtnActive,
                ]}
                onPress={() => setTileType(type.id)}
              >
                <Text
                  style={[
                    styles.typeLabel,
                    tileType === type.id && styles.typeLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
                <Text style={styles.typeExtra}>+{type.extra}% hao hụt</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Input Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kích thước khu vực (m)</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Chiều dài</Text>
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
              <Text style={styles.inputLabel}>Chiều rộng</Text>
              <TextInput
                style={styles.input}
                value={width}
                onChangeText={setWidth}
                keyboardType="decimal-pad"
                placeholder="VD: 4"
                placeholderTextColor="#9CA3AF"
              />
            </View>
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
                <Text style={styles.resultLabel}>Diện tích cần lát:</Text>
                <Text style={styles.resultValue}>{result.area} m²</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Số gạch/m²:</Text>
                <Text style={styles.resultValue}>{result.tilesPerSqm} viên</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Số gạch cần:</Text>
                <Text style={styles.resultValue}>{result.totalTiles} viên</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Dự phòng hao hụt:</Text>
                <Text style={styles.resultValue}>+{result.extraTiles} viên</Text>
              </View>
              <View style={styles.resultDivider} />
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { fontWeight: '600' }]}>TỔNG CỘNG:</Text>
                <Text style={[styles.resultValue, { color: '#f39c12', fontWeight: '700' }]}>
                  {result.finalTiles} viên
                </Text>
              </View>
              <View style={styles.resultHighlight}>
                <Text style={styles.highlightText}>
                  ≈ {result.boxes} hộp gạch
                </Text>
              </View>
            </View>
            
            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>📌 Lưu ý</Text>
              <Text style={styles.noteText}>
                • Gạch lát chéo hao hụt nhiều hơn{'\n'}
                • Kiểm tra gạch cùng lô màu trước khi mua{'\n'}
                • Đặt dư 1-2 hộp để thay thế sau này
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
  tileSizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tileSizeBtn: {
    width: '31%',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  tileSizeBtnActive: {
    backgroundColor: '#f39c12',
  },
  tileSizeEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  tileSizeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  tileSizeLabelActive: {
    color: '#fff',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#f39c12',
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  typeLabelActive: {
    color: '#fff',
  },
  typeExtra: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
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
  calcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f39c12',
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
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
