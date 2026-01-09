import { Container } from '@/components/ui/container';
import { Colors } from '@/constants/theme';
import { aiService, MaterialCheckResponse } from '@/services/aiService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function MaterialCheckScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<MaterialCheckResponse | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const checkMaterial = async () => {
    if (!selectedImage) return;

    setChecking(true);
    try {
      const response = await aiService.checkMaterials({
        projectId: 1, // Replace with actual project ID
        imageUrl: selectedImage,
        description: 'Kiểm tra chất lượng vật liệu xây dựng',
      });
      setResult(response);
    } catch (error) {
      console.error('Material check error:', error);
      alert('Có lỗi xảy ra khi kiểm tra vật liệu');
    } finally {
      setChecking(false);
    }
  };

  const getQualityColor = (quality: string) => {
    if (quality.includes('Tốt') || quality.includes('Xuất sắc')) return '#0066CC';
    if (quality.includes('Trung bình')) return '#0066CC';
    return '#000000';
  };

  return (
    <Container fullWidth>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kiểm tra vật liệu</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="cube" size={32} color={Colors.light.primary} />
          </View>
          <Text style={styles.infoTitle}>AI kiểm tra vật liệu xây dựng</Text>
          <Text style={styles.infoDesc}>
            Upload ảnh vật liệu (gạch, xi măng, cát, sỏi, thép...) để AI phân tích chất lượng, độ đạt chuẩn và đưa ra đề xuất
          </Text>
        </View>

        {/* Upload Section */}
        {!selectedImage ? (
          <View style={styles.uploadSection}>
            <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
              <Ionicons name="camera" size={48} color={Colors.light.primary} />
              <Text style={styles.uploadText}>Chụp ảnh vật liệu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="images" size={48} color={Colors.light.primary} />
              <Text style={styles.uploadText}>Chọn từ thư viện</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageSection}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
                <Ionicons name="images" size={20} color={Colors.light.primary} />
                <Text style={styles.changeButtonText}>Đổi ảnh</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.checkButton, checking && styles.checkButtonDisabled]}
                onPress={checkMaterial}
                disabled={checking}
              >
                {checking ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.checkButtonText}>Đang kiểm tra...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="flash" size={20} color="#fff" />
                    <Text style={styles.checkButtonText}>Kiểm tra ngay</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Result */}
        {result && (
          <View style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <Ionicons
                name={result.isCompliant ? 'checkmark-circle' : 'warning'}
                size={24}
                color={result.isCompliant ? '#0066CC' : '#0066CC'}
              />
              <Text style={styles.resultTitle}>
                {result.isCompliant ? 'Đạt chuẩn' : 'Cần kiểm tra thêm'}
              </Text>
            </View>

            {/* Material Type */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Loại vật liệu</Text>
              <Text style={styles.cardValue}>{result.materialType}</Text>
            </View>

            {/* Quality */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Đánh giá chất lượng</Text>
              <View style={styles.qualityBadge}>
                <View
                  style={[
                    styles.qualityDot,
                    { backgroundColor: getQualityColor(result.quality) },
                  ]}
                />
                <Text
                  style={[
                    styles.qualityText,
                    { color: getQualityColor(result.quality) },
                  ]}
                >
                  {result.quality}
                </Text>
              </View>
            </View>

            {/* Issues */}
            {result.issues.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Vấn đề phát hiện</Text>
                {result.issues.map((issue, index) => (
                  <View key={index} style={styles.issueItem}>
                    <Ionicons name="alert-circle" size={18} color="#000000" />
                    <Text style={styles.issueText}>{issue}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Khuyến nghị</Text>
                {result.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#0066CC" />
                    <Text style={styles.recText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="download" size={20} color={Colors.light.primary} />
                <Text style={styles.actionText}>Lưu báo cáo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-social" size={20} color={Colors.light.primary} />
                <Text style={styles.actionText}>Chia sẻ</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  infoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
  },
  uploadSection: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  uploadButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 12,
  },
  imageSection: {
    padding: 16,
  },
  selectedImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  changeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  changeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  checkButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 14,
  },
  checkButtonDisabled: {
    opacity: 0.6,
  },
  checkButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  resultSection: {
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  qualityText: {
    fontSize: 16,
    fontWeight: '600',
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  issueText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  recItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  recText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.primary,
  },
});
