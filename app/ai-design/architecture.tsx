/**
 * Architecture Diagram Generator
 * Tạo sơ đồ kiến trúc hệ thống SVG
 */

import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import { generateArchitectureDiagram } from '@/services/geminiService';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import { Stack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

const diagramStyles = [
  { id: 'modern', label: 'Modern', icon: 'rocket' },
  { id: 'classic', label: 'Classic', icon: 'document' },
  { id: 'minimal', label: 'Minimal', icon: 'remove' },
];

const commonComponents = [
  'API Gateway',
  'Load Balancer',
  'Web Server',
  'App Server',
  'Database',
  'Cache (Redis)',
  'Message Queue',
  'File Storage',
  'CDN',
  'Authentication',
];

export default function ArchitectureScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'tint');

  const [description, setDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('modern');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [svgCode, setSvgCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleComponent = (component: string) => {
    setSelectedComponents(prev =>
      prev.includes(component)
        ? prev.filter(c => c !== component)
        : [...prev, component]
    );
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mô tả hệ thống');
      return;
    }

    setIsGenerating(true);
    try {
      const svg = await generateArchitectureDiagram({
        description: description.trim(),
        style: selectedStyle as any,
        components: selectedComponents.length > 0 ? selectedComponents : undefined,
      });
      setSvgCode(svg);
    } catch (error) {
      console.error('Error generating diagram:', error);
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tạo sơ đồ',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!svgCode) return;

    try {
      const fileName = `architecture_${Date.now()}.svg`;
      const file = new File(Paths.document, fileName);
      file.write(svgCode);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'image/svg+xml',
          dialogTitle: 'Export Architecture Diagram',
        });
      } else {
        Alert.alert('Thành công', `Đã lưu tại: ${file.uri}`);
      }
    } catch (error) {
      console.error('Error exporting:', error);
      Alert.alert('Lỗi', 'Không thể export file');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn reset và tạo sơ đồ mới?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSvgCode(null);
            setDescription('');
            setSelectedComponents([]);
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Architecture Diagram',
          headerStyle: { backgroundColor: cardBg },
          headerTintColor: textColor,
          headerRight: () =>
            svgCode ? (
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleExport}
                >
                  <Ionicons name="download" size={22} color={primaryColor} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleReset}
                >
                  <Ionicons name="refresh" size={22} color={primaryColor} />
                </TouchableOpacity>
              </View>
            ) : null,
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.content}
      >
        <Container>
          {!svgCode ? (
            <>
              {/* Description Input */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  Mô tả hệ thống
                </Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: cardBg, color: textColor }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Ví dụ: Hệ thống quản lý dự án xây dựng với microservices, sử dụng React Native, Node.js, PostgreSQL..."
                  placeholderTextColor={textColor + '80'}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              {/* Style Selection */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  Style
                </Text>
                <View style={styles.chipContainer}>
                  {diagramStyles.map((style) => (
                    <TouchableOpacity
                      key={style.id}
                      style={[
                        styles.chip,
                        { backgroundColor: cardBg },
                        selectedStyle === style.id && {
                          backgroundColor: primaryColor,
                        },
                      ]}
                      onPress={() => setSelectedStyle(style.id)}
                    >
                      <Ionicons
                        name={style.icon as any}
                        size={16}
                        color={selectedStyle === style.id ? '#fff' : textColor}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color:
                              selectedStyle === style.id ? '#fff' : textColor,
                          },
                        ]}
                      >
                        {style.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Components Selection */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  Components (tùy chọn)
                </Text>
                <View style={styles.chipContainer}>
                  {commonComponents.map((component) => (
                    <TouchableOpacity
                      key={component}
                      style={[
                        styles.chip,
                        { backgroundColor: cardBg },
                        selectedComponents.includes(component) && {
                          backgroundColor: primaryColor + '30',
                          borderColor: primaryColor,
                          borderWidth: 1,
                        },
                      ]}
                      onPress={() => toggleComponent(component)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: selectedComponents.includes(component)
                              ? primaryColor
                              : textColor,
                          },
                        ]}
                      >
                        {component}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Generate Button */}
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  { backgroundColor: primaryColor },
                  (!description.trim() || isGenerating) && styles.buttonDisabled,
                ]}
                onPress={handleGenerate}
                disabled={!description.trim() || isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Ionicons name="create" size={20} color="#fff" />
                )}
                <Text style={styles.generateButtonText}>
                  {isGenerating ? 'Đang tạo...' : 'Tạo sơ đồ'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            // Display SVG
            <View style={styles.svgContainer}>
              <WebView
                source={{
                  html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
                      <style>
                        body { margin: 0; padding: 16px; background: ${backgroundColor}; }
                        svg { width: 100%; height: auto; }
                      </style>
                    </head>
                    <body>${svgCode}</body>
                    </html>
                  `,
                }}
                style={styles.webView}
                scalesPageToFit
                scrollEnabled
              />
            </View>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginRight: 8,
  },
  headerButton: {
    padding: 4,
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
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  svgContainer: {
    marginTop: 16,
    minHeight: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    minHeight: 400,
  },
});
