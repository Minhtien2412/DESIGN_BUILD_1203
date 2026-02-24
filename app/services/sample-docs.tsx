import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Mock data - Document templates
const DOCUMENTS = [
  {
    id: 1,
    title: 'Đơn xin phép xây dựng',
    category: 'Giấy tờ pháp lý',
    type: 'PDF',
    size: '2.5 MB',
    downloads: 1250,
    description: 'Mẫu đơn xin cấp giấy phép xây dựng theo quy định mới nhất',
    date: '15/10/2024',
    featured: true,
  },
  {
    id: 2,
    title: 'Hợp đồng xây dựng',
    category: 'Hợp đồng',
    type: 'DOC',
    size: '1.8 MB',
    downloads: 980,
    description: 'Hợp đồng thi công xây dựng trọn gói',
    date: '12/10/2024',
    featured: true,
  },
  {
    id: 3,
    title: 'Biên bản nghiệm thu',
    category: 'Nghiệm thu',
    type: 'PDF',
    size: '1.2 MB',
    downloads: 750,
    description: 'Mẫu biên bản nghiệm thu công trình xây dựng',
    date: '08/10/2024',
    featured: false,
  },
  {
    id: 4,
    title: 'Bản vẽ thiết kế mẫu',
    category: 'Thiết kế',
    type: 'DWG',
    size: '5.2 MB',
    downloads: 2100,
    description: 'Bản vẽ thiết kế nhà phố 3 tầng mẫu',
    date: '05/10/2024',
    featured: true,
  },
  {
    id: 5,
    title: 'Dự toán công trình',
    category: 'Dự toán',
    type: 'XLSX',
    size: '0.8 MB',
    downloads: 1450,
    description: 'Mẫu bảng dự toán chi phí xây dựng chi tiết',
    date: '01/10/2024',
    featured: false,
  },
  {
    id: 6,
    title: 'Hợp đồng thiết kế',
    category: 'Hợp đồng',
    type: 'DOC',
    size: '1.5 MB',
    downloads: 620,
    description: 'Hợp đồng thiết kế kiến trúc và nội thất',
    date: '28/09/2024',
    featured: false,
  },
  {
    id: 7,
    title: 'Biên bản bàn giao',
    category: 'Nghiệm thu',
    type: 'PDF',
    size: '1.0 MB',
    downloads: 880,
    description: 'Mẫu biên bản bàn giao công trình hoàn thành',
    date: '25/09/2024',
    featured: false,
  },
  {
    id: 8,
    title: 'Quy trình PCCC',
    category: 'Giấy tờ pháp lý',
    type: 'PDF',
    size: '3.2 MB',
    downloads: 540,
    description: 'Hồ sơ thẩm duyệt phòng cháy chữa cháy',
    date: '20/09/2024',
    featured: false,
  },
];

const CATEGORIES = [
  'Tất cả',
  'Giấy tờ pháp lý',
  'Hợp đồng',
  'Thiết kế',
  'Dự toán',
  'Nghiệm thu',
];

const FILE_TYPES = ['Tất cả', 'PDF', 'DOC', 'DWG', 'XLSX'];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'PDF':
      return { name: 'document-text', color: '#000000' };
    case 'DOC':
      return { name: 'document', color: '#0D9488' };
    case 'DWG':
      return { name: 'cube', color: '#0D9488' };
    case 'XLSX':
      return { name: 'stats-chart', color: '#0D9488' };
    default:
      return { name: 'document-outline', color: '#999' };
  }
};

export default function SampleDocsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedFileType, setSelectedFileType] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('downloads'); // downloads, date

  const filteredDocs = DOCUMENTS.filter((doc) => {
    const matchCategory =
      selectedCategory === 'Tất cả' || doc.category === selectedCategory;
    const matchFileType = selectedFileType === 'Tất cả' || doc.type === selectedFileType;
    const matchSearch =
      searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchFileType && matchSearch;
  }).sort((a, b) => {
    if (sortBy === 'downloads') {
      return b.downloads - a.downloads;
    } else {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const handleDownload = (doc: any) => {
    // TODO: Implement actual download
    console.log('Downloading:', doc.title);
  };

  const handlePreview = (doc: any) => {
    // TODO: Open preview modal or navigate to viewer
    console.log('Preview:', doc.title);
  };

  const handleShare = async (doc: any) => {
    try {
      await Share.share({
        message: `Tài liệu: ${doc.title}\n${doc.description}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Hồ sơ mẫu',
          headerStyle: { backgroundColor: '#0D9488' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm hồ sơ, tài liệu..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === category && styles.filterChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* File Type Filter */}
          <View style={styles.fileTypeRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.fileTypeScroll}
            >
              {FILE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.fileTypeChip,
                    selectedFileType === type && styles.fileTypeChipActive,
                  ]}
                  onPress={() => setSelectedFileType(type)}
                >
                  <Text
                    style={[
                      styles.fileTypeText,
                      selectedFileType === type && styles.fileTypeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Sort Button */}
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setSortBy(sortBy === 'downloads' ? 'date' : 'downloads')}
            >
              <Ionicons
                name={sortBy === 'downloads' ? 'arrow-down' : 'calendar-outline'}
                size={16}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            Tìm thấy {filteredDocs.length} tài liệu
          </Text>
          <Text style={styles.sortLabel}>
            {sortBy === 'downloads' ? 'Phổ biến nhất' : 'Mới nhất'}
          </Text>
        </View>

        {/* Document Grid */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {filteredDocs.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.docCard}
                onPress={() => handlePreview(doc)}
              >
                {/* Featured Badge */}
                {doc.featured && (
                  <View style={styles.featuredBadge}>
                    <Ionicons name="star" size={10} color="#fff" />
                  </View>
                )}

                {/* File Icon */}
                <View
                  style={[
                    styles.fileIconContainer,
                    { backgroundColor: `${getFileIcon(doc.type).color}15` },
                  ]}
                >
                  <Ionicons
                    name={getFileIcon(doc.type).name as any}
                    size={32}
                    color={getFileIcon(doc.type).color}
                  />
                  <View style={styles.fileTypeBadge}>
                    <Text style={styles.fileTypeBadgeText}>{doc.type}</Text>
                  </View>
                </View>

                {/* Doc Info */}
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle} numberOfLines={2}>
                    {doc.title}
                  </Text>
                  <Text style={styles.docCategory}>{doc.category}</Text>

                  {/* Stats Row */}
                  <View style={styles.docStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="download-outline" size={12} color="#999" />
                      <Text style={styles.statText}>
                        {doc.downloads > 1000
                          ? `${(doc.downloads / 1000).toFixed(1)}k`
                          : doc.downloads}
                      </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Ionicons name="document-outline" size={12} color="#999" />
                      <Text style={styles.statText}>{doc.size}</Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionButtonSecondary}
                    onPress={() => handleShare(doc)}
                  >
                    <Ionicons name="share-social-outline" size={16} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButtonPrimary}
                    onPress={() => handleDownload(doc)}
                  >
                    <Ionicons name="download" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Tải về</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Empty State */}
          {filteredDocs.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy tài liệu</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedCategory('Tất cả');
                  setSelectedFileType('Tất cả');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.resetButtonText}>Đặt lại bộ lọc</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <Ionicons name="information-circle" size={16} color="#0D9488" />
          <Text style={styles.bottomInfoText}>
            Tài liệu mang tính tham khảo. Vui lòng kiểm tra quy định mới nhất.
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterScroll: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
  },
  filterChipActive: {
    backgroundColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  fileTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  fileTypeScroll: {
    flex: 1,
  },
  fileTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fileTypeChipActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  fileTypeText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  fileTypeTextActive: {
    color: '#0D9488',
  },
  sortButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  sortLabel: {
    fontSize: 12,
    color: '#999',
  },
  content: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  docCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0D9488',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fileIconContainer: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  fileTypeBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fileTypeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  docInfo: {
    marginBottom: 10,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
    minHeight: 36,
  },
  docCategory: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  docStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  statDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonPrimary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bottomInfoText: {
    flex: 1,
    fontSize: 11,
    color: '#1976d2',
    marginLeft: 8,
    lineHeight: 16,
  },
});
