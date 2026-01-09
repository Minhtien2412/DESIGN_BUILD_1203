import { Container } from '@/components/ui/container';
import { Colors } from '@/constants/theme';
import { aiService, ProgressAnalysisResponse } from '@/services/aiService';
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

export default function PhotoAnalysisScreen() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ProgressAnalysisResponse | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setSelectedImages((prev) => [...prev, ...uris]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const analyzeImages = async () => {
    if (selectedImages.length === 0) return;

    setAnalyzing(true);
    try {
      const response = await aiService.analyzeProgress({
        projectId: 1, // Replace with actual project ID
        imageUrls: selectedImages,
        description: 'Phân tích tiến độ công trình từ ảnh',
      });
      setResult(response);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Có lỗi xảy ra khi phân tích ảnh');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Container fullWidth>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Phân tích ảnh công trình</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Upload ảnh</Text>
          <Text style={styles.sectionDesc}>
            Chụp hoặc chọn ảnh công trình để AI phân tích tiến độ, chất lượng thi công
          </Text>

          <View style={styles.uploadButtons}>
            <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
              <Ionicons name="camera" size={32} color={Colors.light.primary} />
              <Text style={styles.uploadButtonText}>Chụp ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="images" size={32} color={Colors.light.primary} />
              <Text style={styles.uploadButtonText}>Thư viện</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Images */}
        {selectedImages.length > 0 && (
          <View style={styles.imagesSection}>
            <Text style={styles.sectionTitle}>
              Đã chọn {selectedImages.length} ảnh
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesScroll}
            >
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imageCard}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#000000" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.analyzeButton,
                analyzing && styles.analyzeButtonDisabled,
              ]}
              onPress={analyzeImages}
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.analyzeButtonText}>Đang phân tích...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="flash" size={20} color="#fff" />
                  <Text style={styles.analyzeButtonText}>Phân tích bằng AI</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Analysis Result */}
        {result && (
          <View style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
              <Text style={styles.resultTitle}>Kết quả phân tích</Text>
            </View>

            {/* Completion Percentage */}
            <View style={styles.progressCard}>
              <Text style={styles.progressLabel}>Tiến độ hoàn thành</Text>
              <Text style={styles.progressValue}>{result.completionPercentage}%</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${result.completionPercentage}%` },
                  ]}
                />
              </View>
            </View>

            {/* Quality Assessment */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Đánh giá chất lượng</Text>
              <Text style={styles.cardValue}>{result.quality}</Text>
            </View>

            {/* Estimated Time */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Dự kiến hoàn thành</Text>
              <View style={styles.estimateRow}>
                <Ionicons name="time" size={20} color={Colors.light.primary} />
                <Text style={styles.estimateText}>
                  {result.estimatedDaysToComplete} ngày nữa
                </Text>
              </View>
            </View>

            {/* Issues */}
            {result.issues.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Vấn đề phát hiện</Text>
                {result.issues.map((issue, index) => (
                  <View key={index} style={styles.issueItem}>
                    <Ionicons name="warning" size={16} color="#0066CC" />
                    <Text style={styles.issueText}>{issue}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Đề xuất cải thiện</Text>
                {result.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recItem}>
                    <Ionicons name="bulb" size={16} color={Colors.light.primary} />
                    <Text style={styles.recText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}
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
  uploadSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 8,
  },
  imagesSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  imagesScroll: {
    gap: 12,
    paddingVertical: 12,
  },
  imageCard: {
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultSection: {
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 16,
    color: '#374151',
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  estimateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
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
});
