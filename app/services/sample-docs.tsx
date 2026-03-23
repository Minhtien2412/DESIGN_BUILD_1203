import { DSEmptyState } from '@/components/ds';
import { DSModuleScreen } from '@/components/ds/layouts';
import { useDS } from '@/hooks/useDS';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ScrollView,
    Share,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

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

export default function SampleDocsScreen() {
  const { colors, spacing, radius, text: textStyles, shadow, screen } = useDS();
  const CARD_WIDTH = (screen.width - spacing.xl * 2 - spacing.md) / 2;

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return { name: 'document-text', color: colors.text };
      case 'DOC':
        return { name: 'document', color: colors.primary };
      case 'DWG':
        return { name: 'cube', color: colors.primary };
      case 'XLSX':
        return { name: 'stats-chart', color: colors.primary };
      default:
        return { name: 'document-outline', color: colors.textTertiary };
    }
  };

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
    <DSModuleScreen title="Hồ sơ mẫu" gradientHeader>
        {/* Search Bar */}
        <View style={{
          backgroundColor: colors.card,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bgInput,
            borderRadius: radius.md,
            paddingHorizontal: spacing.sm,
            height: 40,
          }}>
            <Ionicons name="search" size={20} color={colors.textTertiary} />
            <TextInput
              style={{
                flex: 1,
                marginLeft: spacing.xs,
                fontSize: 14,
                color: colors.text,
              }}
              placeholder="Tìm hồ sơ, tài liệu..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Section */}
        <View style={{
          backgroundColor: colors.card,
          paddingVertical: spacing.xs,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        }}>
          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingHorizontal: spacing.sm, marginBottom: spacing.xs }}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  borderRadius: radius.full,
                  backgroundColor: selectedCategory === category ? colors.primary : colors.chipBg,
                  marginHorizontal: 4,
                }}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    textStyles.caption,
                    {
                      color: selectedCategory === category ? colors.textInverse : colors.chipText,
                      fontWeight: '500',
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* File Type Filter */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.sm,
          }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              {FILE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={{
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 4,
                    borderRadius: radius.lg,
                    backgroundColor: selectedFileType === type ? colors.primaryBg : colors.chipBg,
                    marginHorizontal: 4,
                    borderWidth: 1,
                    borderColor: selectedFileType === type ? colors.primary : 'transparent',
                  }}
                  onPress={() => setSelectedFileType(type)}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: selectedFileType === type ? colors.primary : colors.textSecondary,
                      fontWeight: '600',
                    }}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Sort Button */}
            <TouchableOpacity
              style={{
                width: 32,
                height: 32,
                borderRadius: radius.full,
                backgroundColor: colors.bgMuted,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: spacing.xs,
              }}
              onPress={() => setSortBy(sortBy === 'downloads' ? 'date' : 'downloads')}
            >
              <Ionicons
                name={sortBy === 'downloads' ? 'arrow-down' : 'calendar-outline'}
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        }}>
          <Text style={[textStyles.bodySemibold, { color: colors.text, fontSize: 13 }]}>
            Tìm thấy {filteredDocs.length} tài liệu
          </Text>
          <Text style={[textStyles.caption, { color: colors.textTertiary }]}>
            {sortBy === 'downloads' ? 'Phổ biến nhất' : 'Mới nhất'}
          </Text>
        </View>

        {/* Document Grid */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: spacing.sm,
            gap: spacing.sm,
          }}>
            {filteredDocs.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={{
                  width: CARD_WIDTH,
                  backgroundColor: colors.card,
                  borderRadius: radius.lg,
                  padding: spacing.sm,
                  ...shadow.sm,
                }}
                onPress={() => handlePreview(doc)}
              >
                {/* Featured Badge */}
                {doc.featured && (
                  <View style={{
                    position: 'absolute',
                    top: spacing.xs,
                    right: spacing.xs,
                    backgroundColor: colors.primary,
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10,
                  }}>
                    <Ionicons name="star" size={10} color={colors.textInverse} />
                  </View>
                )}

                {/* File Icon */}
                <View
                  style={{
                    width: '100%',
                    height: 80,
                    borderRadius: radius.md,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: spacing.sm,
                    position: 'relative',
                    backgroundColor: `${getFileIcon(doc.type).color}15`,
                  }}
                >
                  <Ionicons
                    name={getFileIcon(doc.type).name as any}
                    size={32}
                    color={getFileIcon(doc.type).color}
                  />
                  <View style={{
                    position: 'absolute',
                    bottom: 6,
                    right: 6,
                    backgroundColor: colors.overlay,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: radius.xs,
                  }}>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: colors.textInverse }}>
                      {doc.type}
                    </Text>
                  </View>
                </View>

                {/* Doc Info */}
                <View style={{ marginBottom: spacing.sm }}>
                  <Text
                    style={[textStyles.bodySemibold, {
                      color: colors.text,
                      fontSize: 13,
                      marginBottom: 4,
                      lineHeight: 18,
                      minHeight: 36,
                    }]}
                    numberOfLines={2}
                  >
                    {doc.title}
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.textTertiary, marginBottom: spacing.xs }]}>
                    {doc.category}
                  </Text>

                  {/* Stats Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="download-outline" size={12} color={colors.textTertiary} />
                      <Text style={[textStyles.caption, { color: colors.textTertiary, marginLeft: 4 }]}>
                        {doc.downloads > 1000
                          ? `${(doc.downloads / 1000).toFixed(1)}k`
                          : doc.downloads}
                      </Text>
                    </View>
                    <View style={{
                      width: 1,
                      height: 10,
                      backgroundColor: colors.divider,
                      marginHorizontal: spacing.xs,
                    }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="document-outline" size={12} color={colors.textTertiary} />
                      <Text style={[textStyles.caption, { color: colors.textTertiary, marginLeft: 4 }]}>
                        {doc.size}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.bgMuted,
                      paddingVertical: spacing.xs,
                      borderRadius: radius.sm,
                    }}
                    onPress={() => handleShare(doc)}
                  >
                    <Ionicons name="share-social-outline" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 2,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.primary,
                      paddingVertical: spacing.xs,
                      borderRadius: radius.sm,
                    }}
                    onPress={() => handleDownload(doc)}
                  >
                    <Ionicons name="download" size={16} color={colors.textInverse} />
                    <Text style={[textStyles.buttonSmall, { color: colors.textInverse, marginLeft: 4 }]}>
                      Tải về
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Empty State */}
          {filteredDocs.length === 0 && (
            <DSEmptyState
              icon="folder-open-outline"
              title="Không tìm thấy tài liệu"
              description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              actionLabel="Đặt lại bộ lọc"
              onAction={() => {
                setSelectedCategory('Tất cả');
                setSelectedFileType('Tất cả');
                setSearchQuery('');
              }}
            />
          )}

          <View style={{ height: spacing.lg }} />
        </ScrollView>

        {/* Bottom Info */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.primaryBg,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
        }}>
          <Ionicons name="information-circle" size={16} color={colors.primary} />
          <Text style={[textStyles.caption, {
            flex: 1,
            color: colors.info,
            marginLeft: spacing.xs,
            lineHeight: 16,
          }]}>
            Tài liệu mang tính tham khảo. Vui lòng kiểm tra quy định mới nhất.
          </Text>
        </View>
    </DSModuleScreen>
  );
}
