/**
 * AI Architect - PHP Code Generator
 * Sinh code PHP cho Perfex CRM
 */

import { Container } from '@/components/ui/container';
import {
    CODE_TEMPLATES,
    geminiArchitectService,
} from '@/services/geminiArchitectService';
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

type CodeType = 'hook' | 'controller' | 'model' | 'helper' | 'api';

const CODE_TYPES: { id: CodeType; label: string; icon: string; color: string }[] = [
  { id: 'hook', label: 'Hook', icon: '🪝', color: '#14B8A6' },
  { id: 'controller', label: 'Controller', icon: '🎮', color: '#8e44ad' },
  { id: 'model', label: 'Model', icon: '📦', color: '#27ae60' },
  { id: 'helper', label: 'Helper', icon: '🔧', color: '#f39c12' },
  { id: 'api', label: 'API', icon: '🔗', color: '#e74c3c' },
];

const PERFEX_STRUCTURE = [
  { path: 'modules/[name]/', desc: 'Thư mục module chính' },
  { path: 'modules/[name]/controllers/', desc: 'Controllers' },
  { path: 'modules/[name]/models/', desc: 'Models' },
  { path: 'modules/[name]/helpers/', desc: 'Helper functions' },
  { path: 'modules/[name]/hooks/', desc: 'Hooks system' },
  { path: 'modules/[name]/views/', desc: 'View templates' },
];

export default function ImplementationScreen() {
  const [codeType, setCodeType] = useState<CodeType>('hook');
  const [requirements, setRequirements] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!requirements.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập yêu cầu');
      return;
    }

    setLoading(true);
    try {
      const result = await geminiArchitectService.generatePHPCode(
        codeType,
        requirements
      );
      setGeneratedCode(result.code);
      setFilename(result.filename);
    } catch (error) {
      console.error('Generate error:', error);
      Alert.alert('Lỗi', 'Không thể sinh code. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedCode) {
      Alert.alert('Đã sao chép', 'Code đã được sao chép vào clipboard');
    }
  };

  const handleTemplateSelect = (template: typeof CODE_TEMPLATES[0]) => {
    setRequirements(template.description);
    setCodeType(template.type as CodeType);
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
            <Text style={styles.headerTitle}>💻 Sinh Code PHP</Text>
            <Text style={styles.headerSubtitle}>
              Code generator cho Perfex CRM
            </Text>
          </View>
        </View>

        {/* Code Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Templates</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.templatesScroll}
          >
            {CODE_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateCard}
                onPress={() => handleTemplateSelect(template)}
              >
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDesc}>{template.description}</Text>
                <View style={styles.templateBadge}>
                  <Text style={styles.templateBadgeText}>{template.type}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Code Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Loại Code</Text>
          <View style={styles.codeTypesGrid}>
            {CODE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.codeTypeCard,
                  codeType === type.id && styles.codeTypeCardSelected,
                  codeType === type.id && { borderColor: type.color },
                ]}
                onPress={() => setCodeType(type.id)}
              >
                <Text style={styles.codeTypeIcon}>{type.icon}</Text>
                <Text style={styles.codeTypeLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Requirements Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Yêu Cầu</Text>
          <TextInput
            style={styles.textInput}
            value={requirements}
            onChangeText={setRequirements}
            placeholder="Mô tả chi tiết yêu cầu code..."
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
                <Ionicons name="code-slash" size={20} color="#fff" />
                <Text style={styles.buttonText}>Sinh Code</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Generated Code */}
        {generatedCode && (
          <View style={styles.section}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.sectionTitle}>📄 Code</Text>
                {filename && (
                  <Text style={styles.filename}>{filename}</Text>
                )}
              </View>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                <Ionicons name="copy-outline" size={18} color="#14B8A6" />
                <Text style={styles.copyText}>Sao chép</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              style={styles.codeScroll}
              showsHorizontalScrollIndicator={false}
            >
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>{generatedCode}</Text>
              </View>
            </ScrollView>
          </View>
        )}

        {/* Perfex Structure Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📁 Cấu Trúc Perfex CRM</Text>
          <View style={styles.structureContainer}>
            {PERFEX_STRUCTURE.map((item, index) => (
              <View key={index} style={styles.structureItem}>
                <Ionicons name="folder-outline" size={16} color="#14B8A6" />
                <View style={styles.structureContent}>
                  <Text style={styles.structurePath}>{item.path}</Text>
                  <Text style={styles.structureDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
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
    width: 200,
  },
  templateName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  templateBadge: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  templateBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  codeTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  codeTypeCard: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  codeTypeCardSelected: {
    backgroundColor: 'rgba(3, 169, 244, 0.1)',
  },
  codeTypeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  codeTypeLabel: {
    color: '#fff',
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
    backgroundColor: '#8e44ad',
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  filename: {
    color: '#14B8A6',
    fontSize: 12,
    marginTop: 2,
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
  codeScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  codeContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    minWidth: '100%',
  },
  codeText: {
    color: '#4ade80',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  structureContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
  },
  structureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  structureContent: {
    flex: 1,
  },
  structurePath: {
    color: '#14B8A6',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  structureDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
});
