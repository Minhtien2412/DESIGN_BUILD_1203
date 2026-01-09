import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Phong thủy calculation logic (simplified)
const ELEMENTS = {
  Kim: { color: '#ffffff', lucky: ['Thổ', 'Kim'], unlucky: ['Hỏa'] },
  Mộc: { color: '#0066CC', lucky: ['Thủy', 'Mộc'], unlucky: ['Kim'] },
  Thủy: { color: '#0066CC', lucky: ['Kim', 'Thủy'], unlucky: ['Thổ'] },
  Hỏa: { color: '#000000', lucky: ['Mộc', 'Hỏa'], unlucky: ['Thủy'] },
  Thổ: { color: '#0066CC', lucky: ['Hỏa', 'Thổ'], unlucky: ['Mộc'] },
};

const DIRECTIONS = [
  'Đông',
  'Tây',
  'Nam',
  'Bắc',
  'Đông Bắc',
  'Đông Nam',
  'Tây Bắc',
  'Tây Nam',
];

const DESTINY_ELEMENTS: Record<number, string> = {
  0: 'Kim', 1: 'Kim',
  2: 'Thủy', 3: 'Thủy',
  4: 'Hỏa', 5: 'Hỏa',
  6: 'Thổ', 7: 'Thổ',
  8: 'Mộc', 9: 'Mộc',
};

const getDestinyElement = (year: number): string => {
  const lastDigit = year % 10;
  return DESTINY_ELEMENTS[lastDigit] || 'Thổ';
};

const LUCKY_COLORS: Record<string, string[]> = {
  Kim: ['Trắng', 'Vàng', 'Nâu đất'],
  Mộc: ['Xanh lá', 'Xanh lam', 'Đen'],
  Thủy: ['Đen', 'Xanh lam', 'Trắng'],
  Hỏa: ['Đỏ', 'Tím', 'Xanh lá'],
  Thổ: ['Vàng', 'Nâu', 'Đỏ'],
};

const LUCKY_ITEMS: Record<string, string[]> = {
  Kim: ['Đồ kim loại', 'Tranh phong cảnh', 'Đá quý'],
  Mộc: ['Cây xanh', 'Tranh rừng', 'Đồ gỗ'],
  Thủy: ['Bể cá', 'Tranh biển', 'Đài phun nước'],
  Hỏa: ['Đèn sáng', 'Tranh mặt trời', 'Nến thơm'],
  Thổ: ['Gốm sứ', 'Tranh núi', 'Đá tự nhiên'],
};

const DIRECTION_ADVICE: Record<string, any> = {
  'Đông': { element: 'Mộc', goodFor: 'Sức khỏe, gia đình', rating: 4 },
  'Tây': { element: 'Kim', goodFor: 'Con cái, sáng tạo', rating: 3 },
  'Nam': { element: 'Hỏa', goodFor: 'Danh tiếng, sự nghiệp', rating: 5 },
  'Bắc': { element: 'Thủy', goodFor: 'Tài lộc, sự nghiệp', rating: 4 },
  'Đông Bắc': { element: 'Thổ', goodFor: 'Học vấn, trí tuệ', rating: 3 },
  'Đông Nam': { element: 'Mộc', goodFor: 'Tài lộc, may mắn', rating: 5 },
  'Tây Bắc': { element: 'Kim', goodFor: 'Quý nhân, lãnh đạo', rating: 4 },
  'Tây Nam': { element: 'Thổ', goodFor: 'Tình duyên, hôn nhân', rating: 3 },
};

export default function FengShuiScreen() {
  const [birthYear, setBirthYear] = useState('');
  const [direction, setDirection] = useState('');
  const [area, setArea] = useState('');
  const [showDirectionPicker, setShowDirectionPicker] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    if (!birthYear || !direction || !area) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const year = parseInt(birthYear);
    if (year < 1900 || year > 2100) {
      alert('Năm sinh không hợp lệ');
      return;
    }

    const element = getDestinyElement(year);
    const directionInfo = DIRECTION_ADVICE[direction];
    const compatible = ELEMENTS[element as keyof typeof ELEMENTS].lucky.includes(
      directionInfo.element
    );

    setResult({
      element,
      elementColor: ELEMENTS[element as keyof typeof ELEMENTS].color,
      direction,
      directionInfo,
      compatible,
      luckyColors: LUCKY_COLORS[element],
      luckyItems: LUCKY_ITEMS[element],
      area: parseInt(area),
    });
  };

  const handleReset = () => {
    setBirthYear('');
    setDirection('');
    setArea('');
    setResult(null);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#ffa726"
          />
        ))}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Phong thủy nhà ở',
          headerStyle: { backgroundColor: '#0066CC' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="compass" size={32} color="#0066CC" />
          </View>
          <Text style={styles.headerTitle}>Tư vấn phong thủy</Text>
          <Text style={styles.headerDescription}>
            Tính toán mệnh và hướng nhà phù hợp theo phong thủy Đông phương
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin của bạn</Text>

          {/* Birth Year Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Năm sinh</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="VD: 1990"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={4}
                value={birthYear}
                onChangeText={setBirthYear}
              />
            </View>
          </View>

          {/* Direction Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hướng nhà</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setShowDirectionPicker(true)}
            >
              <Ionicons name="navigate-outline" size={20} color="#999" />
              <Text style={[styles.input, !direction && styles.placeholder]}>
                {direction || 'Chọn hướng nhà'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Area Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Diện tích (m²)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="resize-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="VD: 120"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={area}
                onChangeText={setArea}
              />
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
            <Ionicons name="calculator" size={20} color="#fff" />
            <Text style={styles.calculateButtonText}>Tính phong thủy</Text>
          </TouchableOpacity>
        </View>

        {/* Result Section */}
        {result && (
          <>
            {/* Element Card */}
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>Mệnh của bạn</Text>
              <View style={styles.elementCard}>
                <View
                  style={[
                    styles.elementCircle,
                    { backgroundColor: result.elementColor },
                  ]}
                >
                  <Text style={styles.elementText}>{result.element}</Text>
                </View>
                <View style={styles.elementInfo}>
                  <Text style={styles.elementTitle}>Mệnh {result.element}</Text>
                  <Text style={styles.elementDescription}>
                    Sinh năm {birthYear}
                  </Text>
                </View>
              </View>
            </View>

            {/* Direction Compatibility */}
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>Hướng nhà</Text>
              <View style={styles.compatibilityCard}>
                <View style={styles.compatibilityHeader}>
                  <View>
                    <Text style={styles.directionText}>{result.direction}</Text>
                    <Text style={styles.directionElement}>
                      Hành {result.directionInfo.element}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.compatibilityBadge,
                      result.compatible
                        ? styles.compatibleBadge
                        : styles.incompatibleBadge,
                    ]}
                  >
                    <Ionicons
                      name={result.compatible ? 'checkmark-circle' : 'alert-circle'}
                      size={16}
                      color="#fff"
                    />
                    <Text style={styles.compatibilityBadgeText}>
                      {result.compatible ? 'Hợp mệnh' : 'Cần lưu ý'}
                    </Text>
                  </View>
                </View>
                <View style={styles.directionDetails}>
                  <Text style={styles.detailLabel}>Tốt cho:</Text>
                  <Text style={styles.detailValue}>{result.directionInfo.goodFor}</Text>
                </View>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>Đánh giá:</Text>
                  {renderStars(result.directionInfo.rating)}
                </View>
              </View>
            </View>

            {/* Lucky Colors */}
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>Màu sắc phù hợp</Text>
              <View style={styles.colorsGrid}>
                {result.luckyColors.map((color: string, idx: number) => (
                  <View key={idx} style={styles.colorCard}>
                    <View style={styles.colorSwatch}>
                      <Ionicons name="color-palette" size={24} color="#0066CC" />
                    </View>
                    <Text style={styles.colorName}>{color}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Lucky Items */}
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>Vật phẩm nên dùng</Text>
              <View style={styles.itemsList}>
                {result.luckyItems.map((item: string, idx: number) => (
                  <View key={idx} style={styles.itemCard}>
                    <Ionicons name="checkmark-circle" size={20} color="#0066CC" />
                    <Text style={styles.itemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Ionicons name="refresh" size={18} color="#0066CC" />
              <Text style={styles.resetButtonText}>Tính lại</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle" size={20} color="#0066CC" />
          <Text style={styles.infoNoteText}>
            Kết quả mang tính chất tham khảo. Phong thủy là một phần trong quyết định,
            hãy cân nhắc kỹ các yếu tố khác.
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Direction Picker Modal */}
      <Modal
        visible={showDirectionPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDirectionPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDirectionPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn hướng nhà</Text>
              <TouchableOpacity onPress={() => setShowDirectionPicker(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.directionList}>
              {DIRECTIONS.map((dir) => (
                <TouchableOpacity
                  key={dir}
                  style={styles.directionOption}
                  onPress={() => {
                    setDirection(dir);
                    setShowDirectionPicker(false);
                  }}
                >
                  <Ionicons name="navigate" size={20} color="#0066CC" />
                  <View style={styles.directionOptionInfo}>
                    <Text style={styles.directionOptionText}>{dir}</Text>
                    <Text style={styles.directionOptionSub}>
                      Hành {DIRECTION_ADVICE[dir].element}
                    </Text>
                  </View>
                  {direction === dir && (
                    <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  calculateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  resultSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  elementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 12,
  },
  elementCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  elementText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  elementInfo: {
    marginLeft: 16,
  },
  elementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  elementDescription: {
    fontSize: 13,
    color: '#666',
  },
  compatibilityCard: {
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 12,
  },
  compatibilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  directionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  directionElement: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  compatibleBadge: {
    backgroundColor: '#0066CC',
  },
  incompatibleBadge: {
    backgroundColor: '#0066CC',
  },
  compatibilityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  directionDetails: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginRight: 8,
  },
  starsRow: {
    flexDirection: 'row',
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCard: {
    width: '30%',
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  itemsList: {},
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0066CC',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
    marginLeft: 6,
  },
  infoNote: {
    flexDirection: 'row',
    backgroundColor: '#F0F8FF',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#0066CC',
    marginLeft: 10,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  directionList: {
    padding: 16,
  },
  directionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom: 8,
  },
  directionOptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  directionOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  directionOptionSub: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
