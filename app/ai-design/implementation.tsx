/**
 * Code Implementation Generator
 * Tạo code tự động với best practices
 */

import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import { generateCodeImplementation } from '@/services/geminiService';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { File, Paths } from 'expo-file-system';
import { Stack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert, Platform, ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const languages = [
  { id: 'typescript', label: 'TypeScript', icon: '📘' },
  { id: 'javascript', label: 'JavaScript', icon: '📙' },
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'php', label: 'PHP', icon: '🐘' },
];

const frameworks = {
  typescript: ['React Native', 'Next.js', 'NestJS', 'Express'],
  javascript: ['React', 'Vue', 'Node.js', 'Express'],
  python: ['Django', 'Flask', 'FastAPI', 'Pandas'],
  php: ['Laravel', 'Symfony', 'CodeIgniter', 'Perfex CRM'],
};

export default function ImplementationScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'tint');

  const [feature, setFeature] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('typescript');
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [includeTests, setIncludeTests] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!feature.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng mô tả tính năng cần implement');
      return;
    }

    setIsGenerating(true);
    try {
      const code = await generateCodeImplementation({
        feature: feature.trim(),
        language: selectedLanguage as any,
        framework: selectedFramework || undefined,
        includeTests,
      });
      setGeneratedCode(code);
    } catch (error) {
      console.error('Error generating code:', error);
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể tạo code',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedCode) return;
    await Clipboard.setStringAsync(generatedCode);
    Alert.alert('Thành công', 'Đã copy code vào clipboard');
  };

  const handleExport = async () => {
    if (!generatedCode) return;

    try {
      const extension = selectedLanguage === 'python' ? 'py' : selectedLanguage === 'php' ? 'php' : 'ts';
      const fileName = `generated_${Date.now()}.${extension}`;
      const file = new File(Paths.document, fileName);
      file.write(generatedCode);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/plain',
          dialogTitle: 'Export Code',
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
    setGeneratedCode(null);
    setFeature('');
    setSelectedFramework('');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Code Generator',
          headerStyle: { backgroundColor: cardBg },
          headerTintColor: textColor,
          headerRight: () =>
            generatedCode ? (
              <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.headerButton} onPress={handleCopy}>
                  <Ionicons name="copy" size={22} color={primaryColor} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton} onPress={handleExport}>
                  <Ionicons name="download" size={22} color={primaryColor} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton} onPress={handleReset}>
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
          {!generatedCode ? (
            <>
              {/* Feature Description */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  Mô tả tính năng cần implement
                </Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: cardBg, color: textColor }]}
                  value={feature}
                  onChangeText={setFeature}
                  placeholder="Ví dụ: API endpoint để upload và quản lý documents, với validation, storage trên S3, và thumbnail generation"
                  placeholderTextColor={textColor + '80'}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              {/* Language Selection */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  Ngôn ngữ lập trình
                </Text>
                <View style={styles.chipContainer}>
                  {languages.map((lang) => (
                    <TouchableOpacity
                      key={lang.id}
                      style={[
                        styles.chip,
                        { backgroundColor: cardBg },
                        selectedLanguage === lang.id && {
                          backgroundColor: primaryColor,
                        },
                      ]}
                      onPress={() => {
                        setSelectedLanguage(lang.id);
                        setSelectedFramework('');
                      }}
                    >
                      <Text style={styles.emoji}>{lang.icon}</Text>
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color:
                              selectedLanguage === lang.id ? '#fff' : textColor,
                          },
                        ]}
                      >
                        {lang.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Framework Selection */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  Framework (tùy chọn)
                </Text>
                <View style={styles.chipContainer}>
                  {frameworks[selectedLanguage as keyof typeof frameworks]?.map((fw) => (
                    <TouchableOpacity
                      key={fw}
                      style={[
                        styles.chip,
                        { backgroundColor: cardBg },
                        selectedFramework === fw && {
                          backgroundColor: primaryColor + '30',
                          borderColor: primaryColor,
                          borderWidth: 1,
                        },
                      ]}
                      onPress={() => setSelectedFramework(fw)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: selectedFramework === fw ? primaryColor : textColor,
                          },
                        ]}
                      >
                        {fw}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Options */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setIncludeTests(!includeTests)}
                >
                  <Ionicons
                    name={includeTests ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={includeTests ? primaryColor : textColor}
                  />
                  <Text style={[styles.checkboxLabel, { color: textColor }]}>
                    Bao gồm unit tests
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Generate Button */}
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  { backgroundColor: primaryColor },
                  (!feature.trim() || isGenerating) && styles.buttonDisabled,
                ]}
                onPress={handleGenerate}
                disabled={!feature.trim() || isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Ionicons name="code-slash" size={20} color="#fff" />
                )}
                <Text style={styles.generateButtonText}>
                  {isGenerating ? 'Đang tạo code...' : 'Generate Code'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            // Display Generated Code
            <View style={styles.codeContainer}>
              <View style={[styles.codeHeader, { backgroundColor: cardBg }]}>
                <View style={styles.languageBadge}>
                  <Text style={[styles.languageText, { color: primaryColor }]}>
                    {selectedLanguage}
                    {selectedFramework && ` • ${selectedFramework}`}
                  </Text>
                </View>
              </View>
              
              <ScrollView 
                style={[styles.codeScroll, { backgroundColor: '#1e1e1e' }]}
                horizontal
              >
                <ScrollView>
                  <Text style={styles.codeText}>{generatedCode}</Text>
                </ScrollView>
              </ScrollView>
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
  emoji: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxLabel: {
    fontSize: 15,
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
  codeContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  codeHeader: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  codeScroll: {
    maxHeight: 500,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#d4d4d4',
    padding: 16,
    lineHeight: 20,
  },
});
