/**
 * AI Architect - Project Templates
 * Thư viện templates dự án kiến trúc
 */

import { Container } from '@/components/ui/container';
import { geminiArchitectService } from '@/services/geminiArchitectService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ProjectTemplate {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  category: string;
  image: string;
  specs: {
    area: string;
    floors: string;
    rooms: string;
    budget: string;
  };
  features: string[];
  popular?: boolean;
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'villa-modern',
    name: 'Modern Villa',
    nameVi: 'Biệt Thự Hiện Đại',
    description: 'Thiết kế biệt thự hiện đại với không gian mở, ánh sáng tự nhiên',
    category: 'villa',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    specs: {
      area: '300-500 m²',
      floors: '2-3 tầng',
      rooms: '4-6 phòng ngủ',
      budget: '8-15 tỷ',
    },
    features: ['Hồ bơi', 'Sân vườn', 'Smart Home', 'Garage'],
    popular: true,
  },
  {
    id: 'villa-neoclassic',
    name: 'Neoclassical Villa',
    nameVi: 'Biệt Thự Tân Cổ Điển',
    description: 'Kiến trúc tân cổ điển Châu Âu sang trọng, đẳng cấp',
    category: 'villa',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    specs: {
      area: '400-800 m²',
      floors: '2-4 tầng',
      rooms: '5-8 phòng ngủ',
      budget: '15-30 tỷ',
    },
    features: ['Cột trụ', 'Mái vòm', 'Sảnh lớn', 'Thang máy'],
    popular: true,
  },
  {
    id: 'resort-tropical',
    name: 'Tropical Resort',
    nameVi: 'Resort Nhiệt Đới',
    description: 'Khu nghỉ dưỡng hòa quyện với thiên nhiên nhiệt đới',
    category: 'resort',
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400',
    specs: {
      area: '1000-5000 m²',
      floors: '1-2 tầng',
      rooms: '10-50 phòng',
      budget: '50-200 tỷ',
    },
    features: ['Beach Access', 'Spa', 'Restaurant', 'Pool Bar'],
  },
  {
    id: 'apartment-luxury',
    name: 'Luxury Apartment',
    nameVi: 'Căn Hộ Cao Cấp',
    description: 'Căn hộ penthouse với view toàn cảnh thành phố',
    category: 'apartment',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
    specs: {
      area: '150-300 m²',
      floors: '1-2 tầng',
      rooms: '3-4 phòng ngủ',
      budget: '5-12 tỷ',
    },
    features: ['Sky Garden', 'Smart Home', 'Wine Cellar', 'Home Theater'],
  },
  {
    id: 'office-modern',
    name: 'Modern Office',
    nameVi: 'Văn Phòng Hiện Đại',
    description: 'Không gian làm việc sáng tạo, linh hoạt',
    category: 'office',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    specs: {
      area: '500-2000 m²',
      floors: '1-5 tầng',
      rooms: '10-50 phòng',
      budget: '10-50 tỷ',
    },
    features: ['Open Space', 'Meeting Rooms', 'Cafeteria', 'Green Area'],
  },
  {
    id: 'townhouse-minimalist',
    name: 'Minimalist Townhouse',
    nameVi: 'Nhà Phố Tối Giản',
    description: 'Thiết kế tối giản cho không gian đô thị hạn chế',
    category: 'townhouse',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400',
    specs: {
      area: '60-120 m²',
      floors: '3-5 tầng',
      rooms: '3-4 phòng ngủ',
      budget: '3-6 tỷ',
    },
    features: ['Sân thượng', 'Giếng trời', 'Tầng hầm', 'Thang máy'],
    popular: true,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: 'grid' },
  { id: 'villa', label: 'Biệt thự', icon: 'home' },
  { id: 'resort', label: 'Resort', icon: 'bed' },
  { id: 'apartment', label: 'Căn hộ', icon: 'business' },
  { id: 'office', label: 'Văn phòng', icon: 'briefcase' },
  { id: 'townhouse', label: 'Nhà phố', icon: 'home-outline' },
];

export default function TemplatesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredTemplates = PROJECT_TEMPLATES.filter(
    (t) => selectedCategory === 'all' || t.category === selectedCategory
  );

  const handleUseTemplate = async (template: ProjectTemplate) => {
    setLoading(true);
    try {
      const prompt = `Tạo bản mô tả chi tiết cho dự án "${template.nameVi}":

Thông số:
- Diện tích: ${template.specs.area}
- Số tầng: ${template.specs.floors}
- Số phòng: ${template.specs.rooms}
- Ngân sách: ${template.specs.budget}
- Tính năng: ${template.features.join(', ')}

Yêu cầu:
1. Mô tả kiến trúc tổng thể
2. Bố trí không gian từng tầng
3. Vật liệu đề xuất
4. Timeline thi công
5. Lưu ý kỹ thuật`;

      const result = await geminiArchitectService.sendMessage(prompt);
      
      Alert.alert(
        template.nameVi,
        'Đã tạo bản mô tả chi tiết. Bạn muốn xem ngay?',
        [
          { text: 'Để sau', style: 'cancel' },
          {
            text: 'Tư vấn AI',
            onPress: () => router.push('/ai-architect/consultant' as never),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo mô tả. Vui lòng thử lại.');
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
            <Text style={styles.headerTitle}>📋 Project Templates</Text>
            <Text style={styles.headerSubtitle}>
              {PROJECT_TEMPLATES.length} mẫu thiết kế có sẵn
            </Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipSelected,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={selectedCategory === cat.id ? '#fff' : '#94a3b8'}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === cat.id && styles.categoryLabelSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selected Template Detail */}
        {selectedTemplate && (
          <View style={styles.section}>
            <View style={styles.detailCard}>
              <Image
                source={{ uri: selectedTemplate.image }}
                style={styles.detailImage}
              />
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>{selectedTemplate.nameVi}</Text>
                <Text style={styles.detailDesc}>{selectedTemplate.description}</Text>
                
                <View style={styles.specsGrid}>
                  <View style={styles.specItem}>
                    <Ionicons name="resize" size={16} color="#14B8A6" />
                    <Text style={styles.specText}>{selectedTemplate.specs.area}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Ionicons name="layers" size={16} color="#14B8A6" />
                    <Text style={styles.specText}>{selectedTemplate.specs.floors}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Ionicons name="bed" size={16} color="#14B8A6" />
                    <Text style={styles.specText}>{selectedTemplate.specs.rooms}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Ionicons name="cash" size={16} color="#14B8A6" />
                    <Text style={styles.specText}>{selectedTemplate.specs.budget}</Text>
                  </View>
                </View>

                <View style={styles.featuresList}>
                  {selectedTemplate.features.map((f, i) => (
                    <View key={i} style={styles.featureTag}>
                      <Text style={styles.featureTagText}>{f}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.detailActions}>
                  <TouchableOpacity
                    style={styles.useButton}
                    onPress={() => handleUseTemplate(selectedTemplate)}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="sparkles" size={18} color="#fff" />
                        <Text style={styles.useButtonText}>Sử dụng Template</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeDetail}
                    onPress={() => setSelectedTemplate(null)}
                  >
                    <Ionicons name="close" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Templates Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🏠 {filteredTemplates.length} Templates
          </Text>
          <View style={styles.templatesGrid}>
            {filteredTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateCard}
                onPress={() => setSelectedTemplate(template)}
              >
                <Image
                  source={{ uri: template.image }}
                  style={styles.templateImage}
                />
                {template.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>🔥 Hot</Text>
                  </View>
                )}
                <View style={styles.templateOverlay}>
                  <Text style={styles.templateName}>{template.nameVi}</Text>
                  <Text style={styles.templateSpecs}>
                    {template.specs.area} • {template.specs.budget}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.section}>
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>💡 Không tìm thấy mẫu phù hợp?</Text>
            <Text style={styles.ctaDesc}>
              Sử dụng AI Design Generator để tạo thiết kế tùy chỉnh theo yêu cầu riêng của bạn
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/ai-architect/design' as never)}
            >
              <Text style={styles.ctaButtonText}>🎨 Tạo Thiết Kế Mới</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  categoryChipSelected: {
    backgroundColor: '#14B8A6',
  },
  categoryLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  categoryLabelSelected: {
    color: '#fff',
  },
  detailCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    overflow: 'hidden',
  },
  detailImage: {
    width: '100%',
    height: 180,
  },
  detailContent: {
    padding: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailDesc: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    color: '#e2e8f0',
    fontSize: 12,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  featureTag: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureTagText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  detailActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  useButton: {
    flex: 1,
    backgroundColor: '#8e44ad',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
  },
  useButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeDetail: {
    padding: 10,
    backgroundColor: '#334155',
    borderRadius: 10,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateCard: {
    width: '48%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  templateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  templateName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  templateSpecs: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2,
  },
  ctaCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ctaDesc: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
