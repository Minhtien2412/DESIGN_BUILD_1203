import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ArchitectureProject {
  id: string;
  title: string;
  location: string;
  district: string;
  city: string;
  rating: number;
  reviews: number;
  image: string;
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  kitchens: number;
  area: number;
}

const CATEGORIES = ['Biệt thự', 'Nhà phố', 'Văn phòng', 'Nhà xưởng', 'Căn hộ dịch vụ'];

const MOCK_PROJECTS: ArchitectureProject[] = [
  {
    id: '1',
    title: 'Mẫu thiết kế biệt thự tân cổ điển 3 tầng - Phú Mỹ Hưng',
    location: 'Phú Mỹ Hưng',
    district: 'Quận 7',
    city: 'Thành Phố Hồ Chí Minh',
    rating: 4.9,
    reviews: 139,
    image: 'https://via.placeholder.com/400x300',
    bedrooms: 4,
    bathrooms: 4,
    livingRooms: 1,
    kitchens: 1,
    area: 350,
  },
  {
    id: '2',
    title: 'Mẫu thiết kế nhà phố hiện đại 4 tầng',
    location: 'Bình Thạnh',
    district: 'Quận Bình Thạnh',
    city: 'TP Hồ Chí Minh',
    rating: 4.7,
    reviews: 98,
    image: 'https://via.placeholder.com/400x300',
    bedrooms: 3,
    bathrooms: 3,
    livingRooms: 1,
    kitchens: 1,
    area: 250,
  },
];

export default function ArchitecturePortfolioScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({}, 'textMuted');
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceMuted = useThemeColor({}, 'surfaceMuted');
  const surfaceAlt = useThemeColor({}, 'surfaceAlt');
  const warningColor = useThemeColor({}, 'warning');
  const inverseText = useThemeColor({}, 'textInverse');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Biệt thự');
  const [projects, setProjects] = useState<ArchitectureProject[]>(MOCK_PROJECTS);

  const renderProjectCard = ({ item }: { item: ArchitectureProject }) => (
    <TouchableOpacity
      style={[styles.projectCard, { borderColor: borderColor, backgroundColor: surfaceColor }]}
      onPress={() => {
        // Navigate to project detail
        router.push(`/projects/architecture/${item.id}`);
      }}
    >
      <Image source={{ uri: item.image }} style={[styles.projectImage, { backgroundColor: surfaceAlt }]} />
      
      <View style={styles.projectInfo}>
        <Text style={[styles.projectTitle, { color: textColor }]}>
          {item.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={mutedColor} />
          <Text style={[styles.locationText, { color: mutedColor }]}>
            {item.location} - {item.district}, {item.city}
          </Text>
        </View>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color={warningColor} />
          <Text style={[styles.ratingText, { color: textColor }]}>
            {item.rating}
          </Text>
          <Text style={[styles.reviewsText, { color: mutedColor }]}>
            ({item.reviews} Đánh giá)
          </Text>
        </View>

        {/* Specs */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="bed-outline" size={20} color={primaryColor} />
            <Text style={[styles.specText, { color: textColor }]}>
              {item.bedrooms} Phòng ngủ
            </Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="water-outline" size={20} color={primaryColor} />
            <Text style={[styles.specText, { color: textColor }]}>
              {item.bathrooms} Phòng tắm
            </Text>
          </View>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="tv-outline" size={20} color={primaryColor} />
            <Text style={[styles.specText, { color: textColor }]}>
              {item.livingRooms} Phòng khách
            </Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="restaurant-outline" size={20} color={primaryColor} />
            <Text style={[styles.specText, { color: textColor }]}>
              {item.kitchens} Phòng bếp
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Container style={{ backgroundColor }}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { borderColor: borderColor, backgroundColor: surfaceMuted }]}>
          <Ionicons name="search" size={20} color={mutedColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Tìm loại công trình/ dự án..."
            placeholderTextColor={mutedColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.searchIconButton}>
          <Ionicons name="funnel-outline" size={24} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Category Tabs */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesRow}>
              {CATEGORIES.map(category => {
                const isSelected = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryTab,
                      {
                        backgroundColor: isSelected ? primaryColor : 'transparent',
                        borderBottomWidth: isSelected ? 3 : 0,
                        borderBottomColor: primaryColor,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color: isSelected ? inverseText : textColor,
                          fontWeight: isSelected ? '600' : '400',
                        },
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Projects List */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Nổi bật trong tuần
        </Text>

        <FlatList
          data={projects}
          renderItem={renderProjectCard}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />

        <TouchableOpacity
          style={[styles.viewMoreButton, { borderColor: primaryColor }]}
        >
          <Text style={[styles.viewMoreText, { color: primaryColor }]}>
            Xem thêm
          </Text>
          <Ionicons name="chevron-down" size={20} color={primaryColor} />
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  searchIconButton: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  categoryTab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  categoryText: {
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  projectCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  projectImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#E0E0E0',
  },
  projectInfo: {
    padding: 16,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 13,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  specText: {
    fontSize: 13,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 8,
    gap: 4,
  },
  viewMoreText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
