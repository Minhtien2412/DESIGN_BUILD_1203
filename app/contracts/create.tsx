import { useTemplates } from '@/hooks/useContracts';
import type { ContractType } from '@/types/contracts';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const CONTRACT_TYPE_ICONS: Record<ContractType, string> = {
  CONSTRUCTION: 'construct',
  DESIGN: 'color-palette',
  CONSULTING: 'chatbubbles',
  SUPPLY: 'cube',
  MAINTENANCE: 'build',
};

const CONTRACT_TYPE_COLORS: Record<ContractType, string> = {
  CONSTRUCTION: '#0D9488',
  DESIGN: '#999999',
  CONSULTING: '#0D9488',
  SUPPLY: '#0D9488',
  MAINTENANCE: '#000000',
};

const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  CONSTRUCTION: 'Thi công xây dựng',
  DESIGN: 'Thiết kế',
  CONSULTING: 'Tư vấn',
  SUPPLY: 'Cung cấp vật tư',
  MAINTENANCE: 'Bảo trì',
};

export default function CreateContractScreen() {
  const { templates, loading } = useTemplates();
  const [selectedType, setSelectedType] = useState<ContractType | null>(null);

  const filteredTemplates = selectedType
    ? templates.filter((t) => t.type === selectedType)
    : templates;

  const handleSelectTemplate = (templateId: string) => {
    router.push(`/contracts/create/from-template?templateId=${templateId}`);
  };

  const handleCreateFromScratch = () => {
    Alert.alert(
      'Tạo hợp đồng mới',
      'Chọn loại hợp đồng để bắt đầu',
      [
        ...CONTRACT_TYPES.map((type) => ({
          text: CONTRACT_TYPE_LABELS[type],
          onPress: () => router.push(`/contracts/create/form?type=${type}`),
        })),
        { text: 'Hủy', style: 'cancel' } as any,
      ]
    );
  };

  const CONTRACT_TYPES: ContractType[] = [
    'CONSTRUCTION',
    'DESIGN',
    'CONSULTING',
    'SUPPLY',
    'MAINTENANCE',
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tạo hợp đồng mới</Text>
          <Text style={styles.headerSubtitle}>
            Chọn mẫu có sẵn hoặc tạo hợp đồng từ đầu
          </Text>
        </View>

        {/* Create from Scratch Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateFromScratch}
          >
            <View style={styles.createButtonIcon}>
              <Ionicons name="add-circle" size={32} color="#0D9488" />
            </View>
            <View style={styles.createButtonContent}>
              <Text style={styles.createButtonTitle}>Tạo hợp đồng từ đầu</Text>
              <Text style={styles.createButtonSubtitle}>
                Tự thiết lập các điều khoản và nội dung
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Type Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lọc theo loại hợp đồng</Text>
          <View style={styles.typeGrid}>
            <TouchableOpacity
              style={[
                styles.typeCard,
                !selectedType && styles.typeCardActive,
              ]}
              onPress={() => setSelectedType(null)}
            >
              <Ionicons name="apps" size={28} color="#666" />
              <Text
                style={[
                  styles.typeLabel,
                  !selectedType && styles.typeLabelActive,
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            {CONTRACT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeCard,
                  selectedType === type && styles.typeCardActive,
                  {
                    borderColor:
                      selectedType === type
                        ? CONTRACT_TYPE_COLORS[type]
                        : '#E0E0E0',
                  },
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Ionicons
                  name={CONTRACT_TYPE_ICONS[type] as any}
                  size={28}
                  color={
                    selectedType === type
                      ? CONTRACT_TYPE_COLORS[type]
                      : '#666'
                  }
                />
                <Text
                  style={[
                    styles.typeLabel,
                    selectedType === type && styles.typeLabelActive,
                  ]}
                >
                  {CONTRACT_TYPE_LABELS[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Mẫu hợp đồng ({filteredTemplates.length})
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tải mẫu hợp đồng...</Text>
            </View>
          ) : filteredTemplates.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                Chưa có mẫu hợp đồng nào
              </Text>
            </View>
          ) : (
            filteredTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateCard}
                onPress={() => handleSelectTemplate(template.id)}
              >
                <View
                  style={[
                    styles.templateIcon,
                    {
                      backgroundColor:
                        CONTRACT_TYPE_COLORS[template.type] + '20',
                    },
                  ]}
                >
                  <Ionicons
                    name={CONTRACT_TYPE_ICONS[template.type] as any}
                    size={24}
                    color={CONTRACT_TYPE_COLORS[template.type]}
                  />
                </View>
                <View style={styles.templateContent}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateDescription} numberOfLines={2}>
                    {template.description}
                  </Text>
                  <View style={styles.templateMeta}>
                    <View style={styles.templateMetaItem}>
                      <Ionicons name="time-outline" size={14} color="#999" />
                      <Text style={styles.templateMetaText}>
                        {template.defaultDuration} ngày
                      </Text>
                    </View>
                    <View style={styles.templateMetaItem}>
                      <Ionicons
                        name="people-outline"
                        size={14}
                        color="#999"
                      />
                      <Text style={styles.templateMetaText}>
                        {template.requiredParties.length} bên
                      </Text>
                    </View>
                    <View style={styles.templateMetaItem}>
                      <Ionicons name="download-outline" size={14} color="#999" />
                      <Text style={styles.templateMetaText}>
                        {template.usageCount} lần sử dụng
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0D9488',
    borderStyle: 'dashed',
  },
  createButtonIcon: {
    marginRight: 16,
  },
  createButtonContent: {
    flex: 1,
  },
  createButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D9488',
    marginBottom: 4,
  },
  createButtonSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  typeCardActive: {
    backgroundColor: '#f8f9fa',
  },
  typeLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  typeLabelActive: {
    fontWeight: '600',
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  templateContent: {
    flex: 1,
  },
  templateName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  templateMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  templateMetaText: {
    fontSize: 11,
    color: '#999',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
});
