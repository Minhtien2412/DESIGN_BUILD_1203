/**
 * Design Analyzer Screen
 * Upload và phân tích hình ảnh thiết kế với AI
 */

import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import { analyzeDesignImage } from '@/services/geminiService';
import { Ionicons } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function AnalyzerScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'tint');

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setAnalysis(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      // Convert image to base64
      const file = new File(selectedImage);
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const result = await analyzeDesignImage(`data:image/jpeg;base64,${base64}`);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể phân tích hình ảnh',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysis(null);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Design Analyzer',
          headerStyle: { backgroundColor: cardBg },
          headerTintColor: textColor,
          headerRight: () =>
            selectedImage ? (
              <TouchableOpacity style={styles.headerButton} onPress={handleReset}>
                <Ionicons name="refresh" size={22} color={primaryColor} />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.content}
      >
        <Container>
          {!selectedImage ? (
            // Upload Options
            <View style={styles.uploadContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="image" size={48} color={primaryColor} />
              </View>

              <Text style={[styles.title, { color: textColor }]}>
                Upload hình ảnh thiết kế
              </Text>
              <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
                AI sẽ phân tích và đưa ra đánh giá chi tiết
              </Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.uploadButton, { backgroundColor: primaryColor }]}
                  onPress={pickImage}
                >
                  <Ionicons name="images" size={24} color="#fff" />
                  <Text style={styles.uploadButtonText}>Chọn từ thư viện</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.uploadButton, { backgroundColor: cardBg }]}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera" size={24} color={textColor} />
                  <Text style={[styles.uploadButtonText, { color: textColor }]}>
                    Chụp ảnh
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.infoBox, { backgroundColor: cardBg }]}>
                <Ionicons name="information-circle" size={20} color={primaryColor} />
                <Text style={[styles.infoText, { color: textColor }]}>
                  Hỗ trợ phân tích: Thiết kế kiến trúc, nội thất, landscape, floor plans, elevations
                </Text>
              </View>
            </View>
          ) : (
            // Image Preview & Analysis
            <>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>

              {!analysis && !isAnalyzing && (
                <TouchableOpacity
                  style={[styles.analyzeButton, { backgroundColor: primaryColor }]}
                  onPress={handleAnalyze}
                >
                  <Ionicons name="analytics" size={20} color="#fff" />
                  <Text style={styles.analyzeButtonText}>Phân tích thiết kế</Text>
                </TouchableOpacity>
              )}

              {isAnalyzing && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={primaryColor} />
                  <Text style={[styles.loadingText, { color: textColor }]}>
                    AI đang phân tích hình ảnh...
                  </Text>
                </View>
              )}

              {analysis && (
                <View style={[styles.analysisContainer, { backgroundColor: cardBg }]}>
                  <View style={styles.analysisHeader}>
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                    <Text style={[styles.analysisTitle, { color: textColor }]}>
                      Kết quả phân tích
                    </Text>
                  </View>
                  
                  <ScrollView style={styles.analysisScroll}>
                    <Text style={[styles.analysisText, { color: textColor }]}>
                      {analysis}
                    </Text>
                  </ScrollView>

                  <TouchableOpacity
                    style={[styles.newAnalysisButton, { backgroundColor: primaryColor + '20' }]}
                    onPress={handleReset}
                  >
                    <Ionicons name="add" size={20} color={primaryColor} />
                    <Text style={[styles.newAnalysisText, { color: primaryColor }]}>
                      Phân tích ảnh khác
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </Container>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  uploadContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  imageContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: width * 0.75,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
  },
  analysisContainer: {
    marginTop: 24,
    borderRadius: 12,
    padding: 20,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  analysisScroll: {
    maxHeight: 400,
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 24,
  },
  newAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    gap: 8,
  },
  newAnalysisText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
