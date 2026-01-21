/**
 * AI Architect - Style Visualizer
 * Thư viện phong cách kiến trúc
 */

import { Container } from '@/components/ui/container';
import { ARCHITECTURE_STYLES } from '@/services/geminiArchitectService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function VisualizerScreen() {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags
  const allTags = [...new Set(ARCHITECTURE_STYLES.flatMap((s) => s.tags))];

  // Filter styles
  const filteredStyles = ARCHITECTURE_STYLES.filter((style) => {
    const matchesSearch =
      style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.nameVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => style.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const selectedStyleData = ARCHITECTURE_STYLES.find(
    (s) => s.id === selectedStyle
  );

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
            <Text style={styles.headerTitle}>🎨 Thư Viện Phong Cách</Text>
            <Text style={styles.headerSubtitle}>
              {ARCHITECTURE_STYLES.length} phong cách kiến trúc
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm kiếm phong cách..."
              placeholderTextColor="#64748b"
            />
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsScroll}
          >
            {allTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagChip,
                  selectedTags.includes(tag) && styles.tagChipSelected,
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.tagTextSelected,
                  ]}
                >
                  #{tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selected Style Detail */}
        {selectedStyleData && (
          <View style={styles.section}>
            <View style={styles.detailCard}>
              <Image
                source={{ uri: selectedStyleData.image }}
                style={styles.detailImage}
              />
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>{selectedStyleData.nameVi}</Text>
                <Text style={styles.detailSubtitle}>{selectedStyleData.name}</Text>
                <Text style={styles.detailDescription}>
                  {selectedStyleData.description}
                </Text>
                <View style={styles.detailTags}>
                  {selectedStyleData.tags.map((tag) => (
                    <View key={tag} style={styles.detailTag}>
                      <Text style={styles.detailTagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.consultButton}
                  onPress={() => router.push('/ai-architect/consultant' as any)}
                >
                  <Text style={styles.consultButtonText}>
                    💬 Tư vấn phong cách này
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedStyle(null)}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Styles Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🏛️ {filteredStyles.length} Phong Cách
          </Text>
          <View style={styles.stylesGrid}>
            {filteredStyles.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleCard,
                  selectedStyle === style.id && styles.styleCardSelected,
                ]}
                onPress={() => setSelectedStyle(style.id)}
              >
                <Image source={{ uri: style.image }} style={styles.styleImage} />
                <View style={styles.styleOverlay}>
                  <Text style={styles.styleName}>{style.nameVi}</Text>
                  <Text style={styles.styleNameEn}>{style.name}</Text>
                </View>
                {selectedStyle === style.id && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#03a9f4" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Cách sử dụng</Text>
              <Text style={styles.infoText}>
                1. Chọn phong cách kiến trúc bạn thích{'\n'}
                2. Xem chi tiết và các đặc điểm{'\n'}
                3. Tư vấn AI về phong cách đó{'\n'}
                4. Áp dụng vào dự án của bạn
              </Text>
            </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 14,
  },
  tagsScroll: {
    marginHorizontal: -4,
  },
  tagChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  tagChipSelected: {
    backgroundColor: '#03a9f4',
  },
  tagText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  tagTextSelected: {
    color: '#fff',
  },
  detailCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  detailImage: {
    width: '100%',
    height: 200,
  },
  detailContent: {
    padding: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailSubtitle: {
    fontSize: 14,
    color: '#03a9f4',
    marginTop: 2,
  },
  detailDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    lineHeight: 20,
  },
  detailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  detailTag: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailTagText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  consultButton: {
    backgroundColor: '#03a9f4',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  consultButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  styleCard: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  styleCardSelected: {
    borderColor: '#03a9f4',
  },
  styleImage: {
    width: '100%',
    height: '100%',
  },
  styleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  styleName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  styleNameEn: {
    color: '#94a3b8',
    fontSize: 10,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#03a9f4',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 20,
  },
});
