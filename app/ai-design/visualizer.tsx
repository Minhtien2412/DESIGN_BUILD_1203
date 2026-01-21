/**
 * Design Visualizer Screen
 * Tạo hình ảnh thiết kế từ text prompt
 * TODO: Cần tích hợp Imagen API hoặc alternative service
 */

import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import { optimizeImagePrompt } from '@/services/geminiService';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
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

const aspectRatios = [
  { id: '1:1', label: 'Square', icon: 'square' },
  { id: '16:9', label: 'Landscape', icon: 'tablet-landscape' },
  { id: '9:16', label: 'Portrait', icon: 'phone-portrait' },
  { id: '4:3', label: 'Standard', icon: 'desktop' },
];

const designStyles = [
  '🏠 Modern',
  '🏛️ Classic',
  '⬜ Minimal',
  '🌲 Scandinavian',
  '🏭 Industrial',
  '🎨 Bohemian',
  '🌴 Tropical',
  '🏰 Victorian',
];

export default function VisualizerScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'tint');

  const [prompt, setPrompt] = useState('');
  const [selectedAspect, setSelectedAspect] = useState<string>('16:9');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [optimizedPrompt, setOptimizedPrompt] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    if (!prompt.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mô tả thiết kế');
      return;
    }

    setIsOptimizing(true);
    try {
      const enhanced = await optimizeImagePrompt(prompt.trim(), selectedStyle);
      setOptimizedPrompt(enhanced);
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      Alert.alert('Lỗi', 'Không thể tối ưu prompt');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerate = () => {
    Alert.alert(
      'Tính năng đang phát triển',
      'Image generation cần tích hợp với:\n\n' +
      '• Google Imagen API\n' +
      '• Midjourney API\n' +
      '• Stable Diffusion\n' +
      '• DALL-E API\n\n' +
      'Hiện tại bạn có thể sử dụng AI Consultant để nhận gợi ý prompt tối ưu.',
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Design Visualizer',
          headerStyle: { backgroundColor: cardBg },
          headerTintColor: textColor,
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.content}
      >
        <Container>
          {/* Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="construct" size={20} color="#f59e0b" />
            <Text style={[styles.infoText, { color: '#92400e' }]}>
              Tính năng đang phát triển. Cần tích hợp Imagen API.
            </Text>
          </View>

          {/* Prompt Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Mô tả thiết kế
            </Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: cardBg, color: textColor }]}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Ví dụ: Phòng khách hiện đại với cửa sổ lớn, nội thất gỗ tự nhiên, ánh sáng tự nhiên, phong cách Scandinavian..."
              placeholderTextColor={textColor + '80'}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Design Style */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Phong cách
            </Text>
            <View style={styles.chipContainer}>
              {designStyles.map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.chip,
                    { backgroundColor: cardBg },
                    selectedStyle === style && {
                      backgroundColor: primaryColor + '30',
                      borderColor: primaryColor,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setSelectedStyle(style)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: selectedStyle === style ? primaryColor : textColor,
                      },
                    ]}
                  >
                    {style}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Aspect Ratio */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Tỷ lệ khung hình
            </Text>
            <View style={styles.chipContainer}>
              {aspectRatios.map((ratio) => (
                <TouchableOpacity
                  key={ratio.id}
                  style={[
                    styles.chip,
                    { backgroundColor: cardBg },
                    selectedAspect === ratio.id && {
                      backgroundColor: primaryColor,
                    },
                  ]}
                  onPress={() => setSelectedAspect(ratio.id)}
                >
                  <Ionicons
                    name={ratio.icon as any}
                    size={16}
                    color={selectedAspect === ratio.id ? '#fff' : textColor}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: selectedAspect === ratio.id ? '#fff' : textColor,
                      },
                    ]}
                  >
                    {ratio.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Optimize Prompt Button */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: cardBg },
              !prompt.trim() && styles.buttonDisabled,
            ]}
            onPress={handleOptimize}
            disabled={!prompt.trim() || isOptimizing}
          >
            <Ionicons name="sparkles" size={20} color={primaryColor} />
            <Text style={[styles.buttonText, { color: primaryColor }]}>
              {isOptimizing ? 'Đang tối ưu...' : 'Tối ưu prompt với AI'}
            </Text>
          </TouchableOpacity>

          {/* Optimized Prompt Display */}
          {optimizedPrompt && (
            <View style={[styles.resultBox, { backgroundColor: cardBg }]}>
              <View style={styles.resultHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={[styles.resultTitle, { color: textColor }]}>
                  Prompt đã tối ưu
                </Text>
              </View>
              <Text style={[styles.resultText, { color: textColor }]}>
                {optimizedPrompt}
              </Text>
            </View>
          )}

          {/* Generate Button */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              { backgroundColor: primaryColor },
              !prompt.trim() && styles.buttonDisabled,
            ]}
            onPress={handleGenerate}
            disabled={!prompt.trim()}
          >
            <Ionicons name="color-wand" size={20} color="#fff" />
            <Text style={styles.generateButtonText}>
              Generate Image (Coming Soon)
            </Text>
          </TouchableOpacity>

          {/* Features List */}
          <View style={[styles.featuresBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.featuresTitle, { color: textColor }]}>
              Tính năng sắp ra mắt:
            </Text>
            {[
              'Generate hình ảnh từ text prompt',
              'Multiple aspect ratios & quality settings',
              'Crop, zoom, pan controls',
              'Video animation from images',
              'Export với metadata',
              'Batch generation',
            ].map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <Ionicons name="chevron-forward" size={16} color={primaryColor} />
                <Text style={[styles.featureText, { color: textColor }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 120,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  resultBox: {
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresBox: {
    marginTop: 32,
    borderRadius: 12,
    padding: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
});
