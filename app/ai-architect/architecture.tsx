/**
 * AI Architect - Architecture Diagram Generator
 * Tạo sơ đồ kiến trúc hệ thống
 */

import { Container } from '@/components/ui/container';
import { geminiArchitectService } from '@/services/geminiArchitectService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const PRESET_TEMPLATES = [
  {
    id: 'crm-ai',
    title: 'CRM + AI Chatbot',
    description: 'Hệ thống CRM tích hợp AI chatbot cho kiến trúc',
  },
  {
    id: 'project-mgmt',
    title: 'Quản Lý Dự Án',
    description: 'Workflow quản lý dự án xây dựng end-to-end',
  },
  {
    id: 'client-portal',
    title: 'Client Portal',
    description: 'Portal cho khách hàng xem tiến độ dự án',
  },
  {
    id: 'doc-processing',
    title: 'Document Processing',
    description: 'Hệ thống xử lý hồ sơ tự động với AI',
  },
];

export default function ArchitectureDiagramScreen() {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả hệ thống');
      return;
    }

    setLoading(true);
    try {
      const diagramResult = await geminiArchitectService.generateArchitectureDiagram(
        description
      );
      setResult(diagramResult.svg);
    } catch (error) {
      console.error('Generate error:', error);
      Alert.alert('Lỗi', 'Không thể tạo sơ đồ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: typeof PRESET_TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    setDescription(template.description);
  };

  const handleCopy = () => {
    if (result) {
      // Copy to clipboard logic
      Alert.alert('Đã sao chép', 'Mermaid code đã được sao chép');
    }
  };

  return (
    <Container>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🏗️ Sơ Đồ Kiến Trúc</Text>
            <Text style={styles.headerSubtitle}>
              Tạo sơ đồ hệ thống từ mô tả text
            </Text>
          </View>
        </View>

        {/* Preset Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Templates Có Sẵn</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.templatesScroll}
          >
            {PRESET_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateCard,
                  selectedTemplate === template.id && styles.templateCardSelected,
                ]}
                onPress={() => handleTemplateSelect(template)}
              >
                <Text style={styles.templateTitle}>{template.title}</Text>
                <Text style={styles.templateDesc}>{template.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✏️ Mô Tả Hệ Thống</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Mô tả hệ thống bạn muốn thiết kế..."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={[styles.generateButton, loading && styles.buttonDisabled]}
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="flash" size={20} color="#fff" />
                <Text style={styles.buttonText}>Tạo Sơ Đồ</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Result */}
        {result && (
          <View style={styles.section}>
            <View style={styles.resultHeader}>
              <Text style={styles.sectionTitle}>📐 Kết Quả</Text>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                <Ionicons name="copy-outline" size={18} color="#14B8A6" />
                <Text style={styles.copyText}>Sao chép</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.resultContainer}>
              <Text style={styles.resultCode}>{result}</Text>
            </View>
            <Text style={styles.helpText}>
              💡 Copy code trên và paste vào{' '}
              <Text style={styles.linkText}>mermaid.live</Text> để xem sơ đồ
            </Text>
          </View>
        )}

        {/* Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Hướng Dẫn</Text>
          <View style={styles.guideCard}>
            <Text style={styles.guideText}>
              1. Chọn template có sẵn hoặc nhập mô tả tùy chỉnh{'\n'}
              2. Nhấn "Tạo Sơ Đồ" để AI sinh code Mermaid{'\n'}
              3. Copy code và paste vào mermaid.live để xem{'\n'}
              4. Export PNG/SVG để sử dụng trong tài liệu
            </Text>
          </View>
        </View>

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
  templatesScroll: {
    marginHorizontal: -4,
  },
  templateCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    width: 180,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardSelected: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(3, 169, 244, 0.1)',
  },
  templateTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDesc: {
    color: '#94a3b8',
    fontSize: 12,
  },
  textInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#334155',
  },
  generateButton: {
    backgroundColor: '#14B8A6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
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
    color: '#14B8A6',
    fontSize: 14,
  },
  resultContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
  },
  resultCode: {
    color: '#4ade80',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  helpText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 8,
  },
  linkText: {
    color: '#14B8A6',
  },
  guideCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
  },
  guideText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 22,
  },
});
