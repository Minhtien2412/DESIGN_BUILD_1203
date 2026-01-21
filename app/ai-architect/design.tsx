/**
 * AI Design Generator Screen
 * Tạo thiết kế kiến trúc với AI từ mô tả hoặc ảnh tham khảo
 */

import { Container } from '@/components/ui/container';
import { TappableImage } from '@/components/ui/full-media-viewer';
import { ARCHITECTURE_STYLES, geminiArchitectService } from '@/services/geminiArchitectService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type DesignType = 'villa' | 'resort' | 'apartment' | 'office' | 'interior';

const DESIGN_TYPES: { id: DesignType; label: string; icon: string }[] = [
  { id: 'villa', label: 'Biệt thự', icon: '🏡' },
  { id: 'resort', label: 'Resort', icon: '🏨' },
  { id: 'apartment', label: 'Căn hộ', icon: '🏢' },
  { id: 'office', label: 'Văn phòng', icon: '🏛️' },
  { id: 'interior', label: 'Nội thất', icon: '🛋️' },
];

const DESIGN_FEATURES = [
  { id: 'pool', label: 'Hồ bơi', icon: '🏊' },
  { id: 'garden', label: 'Sân vườn', icon: '🌳' },
  { id: 'garage', label: 'Garage', icon: '🚗' },
  { id: 'rooftop', label: 'Sân thượng', icon: '🌅' },
  { id: 'basement', label: 'Tầng hầm', icon: '🚪' },
  { id: 'smart-home', label: 'Smart Home', icon: '🏠' },
  { id: 'elevator', label: 'Thang máy', icon: '🛗' },
  { id: 'gym', label: 'Phòng gym', icon: '💪' },
];

export default function AIDesignScreen() {
  const [designType, setDesignType] = useState<DesignType>('villa');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [floors, setFloors] = useState('2');
  const [budget, setBudget] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((f) => f !== featureId)
        : [...prev, featureId]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReferenceImage(result.assets[0].uri);
    }
  };

  const generateDesign = async () => {
    if (!description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả thiết kế');
      return;
    }

    setLoading(true);

    try {
      const styleInfo = ARCHITECTURE_STYLES.find((s) => s.id === selectedStyle);
      const featureLabels = selectedFeatures
        .map((f) => DESIGN_FEATURES.find((df) => df.id === f)?.label)
        .filter(Boolean)
        .join(', ');

      const prompt = `Tạo mô tả thiết kế kiến trúc chi tiết cho:

**Loại công trình:** ${DESIGN_TYPES.find((d) => d.id === designType)?.label}
**Phong cách:** ${styleInfo?.nameVi || 'Tự do'}
**Diện tích:** ${area || 'Chưa xác định'} m²
**Số tầng:** ${floors}
**Ngân sách:** ${budget || 'Chưa xác định'} VND
**Tính năng đặc biệt:** ${featureLabels || 'Không'}

**Yêu cầu của khách hàng:**
${description}

Hãy tạo:
1. Mô tả tổng quan thiết kế
2. Bố trí các tầng chi tiết
3. Vật liệu đề xuất
4. Điểm nhấn kiến trúc
5. Ước tính chi phí sơ bộ
6. Lịch trình thi công dự kiến`;

      const result = await geminiArchitectService.sendMessage(prompt);
      setGeneratedDesign(result.text || result.error || 'Không thể tạo thiết kế');
    } catch (error) {
      console.error('Generate design error:', error);
      Alert.alert('Lỗi', 'Không thể tạo thiết kế. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🎨 AI Design Generator</Text>
            <Text style={styles.headerSubtitle}>
              Tạo thiết kế kiến trúc thông minh
            </Text>
          </View>
        </View>

        {/* Design Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Loại Công Trình</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DESIGN_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  designType === type.id && styles.typeCardSelected,
                ]}
                onPress={() => setDesignType(type.id)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={styles.typeLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Style Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏛️ Phong Cách</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ARCHITECTURE_STYLES.slice(0, 5).map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleCard,
                  selectedStyle === style.id && styles.styleCardSelected,
                ]}
                onPress={() => setSelectedStyle(style.id)}
              >
                <Image source={{ uri: style.image }} style={styles.styleImage} />
                <View style={styles.styleOverlay}>
                  <Text style={styles.styleName}>{style.nameVi}</Text>
                </View>
                {selectedStyle === style.id && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Tính Năng Đặc Biệt</Text>
          <View style={styles.featuresGrid}>
            {DESIGN_FEATURES.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={[
                  styles.featureChip,
                  selectedFeatures.includes(feature.id) && styles.featureChipSelected,
                ]}
                onPress={() => toggleFeature(feature.id)}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text
                  style={[
                    styles.featureLabel,
                    selectedFeatures.includes(feature.id) && styles.featureLabelSelected,
                  ]}
                >
                  {feature.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Parameters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📐 Thông Số</Text>
          <View style={styles.paramsGrid}>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>Diện tích (m²)</Text>
              <TextInput
                style={styles.paramInput}
                value={area}
                onChangeText={setArea}
                placeholder="200"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>Số tầng</Text>
              <TextInput
                style={styles.paramInput}
                value={floors}
                onChangeText={setFloors}
                placeholder="2"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>Ngân sách (tỷ)</Text>
              <TextInput
                style={styles.paramInput}
                value={budget}
                onChangeText={setBudget}
                placeholder="5"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Reference Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📷 Ảnh Tham Khảo</Text>
          <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
            {referenceImage ? (
              <TappableImage 
                source={{ uri: referenceImage }} 
                style={styles.uploadedImage}
                title="Ảnh tham khảo"
                allowDelete
                onDelete={() => setReferenceImage(null)}
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="cloud-upload-outline" size={40} color="#64748b" />
                <Text style={styles.uploadText}>Chọn ảnh tham khảo</Text>
                <Text style={styles.uploadHint}>Không bắt buộc</Text>
              </View>
            )}
          </TouchableOpacity>
          {referenceImage && (
            <TouchableOpacity
              style={styles.removeImage}
              onPress={() => setReferenceImage(null)}
            >
              <Text style={styles.removeImageText}>Xóa ảnh</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Mô Tả Yêu Cầu</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Mô tả chi tiết yêu cầu thiết kế của bạn...&#10;Ví dụ: Biệt thự 3 tầng cho gia đình 4 người, phòng khách rộng view sân vườn, 4 phòng ngủ có toilet riêng..."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Generate Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.generateButton, loading && styles.buttonDisabled]}
            onPress={generateDesign}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.buttonText}>Tạo Thiết Kế AI</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Generated Result */}
        {generatedDesign && (
          <View style={styles.section}>
            <View style={styles.resultHeader}>
              <Text style={styles.sectionTitle}>📋 Kết Quả Thiết Kế</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Ionicons name="copy-outline" size={18} color="#03a9f4" />
                <Text style={styles.copyText}>Sao chép</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>{generatedDesign}</Text>
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="download-outline" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Tải PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Chia sẻ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => router.push('/ai-architect/consultant' as never)}
              >
                <Ionicons name="chatbubbles-outline" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Tư vấn thêm</Text>
              </TouchableOpacity>
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
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  typeCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
    minWidth: 90,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    borderColor: '#03a9f4',
    backgroundColor: 'rgba(3, 169, 244, 0.1)',
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  typeLabel: {
    color: '#fff',
    fontSize: 12,
  },
  styleCard: {
    width: 120,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  styleCardSelected: {
    borderColor: '#03a9f4',
  },
  styleImage: {
    width: '100%',
    height: '100%',
  },
  styleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  styleName: {
    color: '#fff',
    fontSize: 11,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#03a9f4',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  featureChipSelected: {
    backgroundColor: '#03a9f4',
  },
  featureIcon: {
    fontSize: 16,
  },
  featureLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  featureLabelSelected: {
    color: '#fff',
  },
  paramsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  paramItem: {
    flex: 1,
  },
  paramLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
  },
  paramInput: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  uploadArea: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#334155',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    padding: 30,
    alignItems: 'center',
  },
  uploadText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 10,
  },
  uploadHint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  uploadedImage: {
    width: '100%',
    height: 180,
  },
  removeImage: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  removeImageText: {
    color: '#ef4444',
    fontSize: 12,
  },
  textArea: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: '#8e44ad',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyText: {
    color: '#03a9f4',
    fontSize: 14,
  },
  resultContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
  },
  resultText: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 22,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 10,
  },
  actionButtonPrimary: {
    backgroundColor: '#03a9f4',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
