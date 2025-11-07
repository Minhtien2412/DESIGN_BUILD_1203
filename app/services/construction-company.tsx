import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
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
const CARD_WIDTH = width - 32;

// Mock data - Construction Companies
const COMPANIES = [
  {
    id: 1,
    name: 'Coteccons',
    logo: 'https://via.placeholder.com/100x100/ee4d2d/ffffff?text=CTEC',
    scale: 'Lớn',
    region: 'TP.HCM',
    specialties: ['Cao ốc', 'Khu đô thị', 'Công nghiệp'],
    rating: 4.9,
    reviews: 256,
    projects: 180,
    yearEstablished: 2004,
    featured: true,
    featuredProjects: [
      { id: 1, image: 'https://via.placeholder.com/400x300/ee4d2d/ffffff?text=Project+1' },
      { id: 2, image: 'https://via.placeholder.com/400x300/2196f3/ffffff?text=Project+2' },
      { id: 3, image: 'https://via.placeholder.com/400x300/4caf50/ffffff?text=Project+3' },
    ],
    contact: {
      phone: '1900 6595',
      email: 'contact@coteccons.vn',
      website: 'www.coteccons.vn',
    },
    certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
  },
  {
    id: 2,
    name: 'Hòa Bình Construction',
    logo: 'https://via.placeholder.com/100x100/4caf50/ffffff?text=HBC',
    scale: 'Lớn',
    region: 'Hà Nội',
    specialties: ['Nhà cao tầng', 'Văn phòng', 'Khách sạn'],
    rating: 4.8,
    reviews: 198,
    projects: 150,
    yearEstablished: 1983,
    featured: true,
    featuredProjects: [
      { id: 1, image: 'https://via.placeholder.com/400x300/4caf50/ffffff?text=HN+Tower' },
      { id: 2, image: 'https://via.placeholder.com/400x300/ff9800/ffffff?text=Office' },
    ],
    contact: {
      phone: '024 3974 3368',
      email: 'info@hbc.com.vn',
      website: 'www.hbc.com.vn',
    },
    certifications: ['ISO 9001', 'ISO 14001'],
  },
  {
    id: 3,
    name: 'Ricons',
    logo: 'https://via.placeholder.com/100x100/2196f3/ffffff?text=RCN',
    scale: 'Trung bình',
    region: 'TP.HCM',
    specialties: ['Nhà ở', 'Công trình dân dụng', 'Cải tạo'],
    rating: 4.7,
    reviews: 142,
    projects: 95,
    yearEstablished: 1993,
    featured: false,
    featuredProjects: [
      { id: 1, image: 'https://via.placeholder.com/400x300/2196f3/ffffff?text=Residential' },
      { id: 2, image: 'https://via.placeholder.com/400x300/9c27b0/ffffff?text=Villa' },
      { id: 3, image: 'https://via.placeholder.com/400x300/ff5722/ffffff?text=Apartment' },
    ],
    contact: {
      phone: '028 3930 3668',
      email: 'contact@ricons.com.vn',
      website: 'www.ricons.com.vn',
    },
    certifications: ['ISO 9001'],
  },
  {
    id: 4,
    name: 'Phúc Khang Corporation',
    logo: 'https://via.placeholder.com/100x100/ff9800/ffffff?text=PKC',
    scale: 'Trung bình',
    region: 'TP.HCM',
    specialties: ['Biệt thự', 'Nhà phố', 'Khu resort'],
    rating: 4.8,
    reviews: 118,
    projects: 72,
    yearEstablished: 2000,
    featured: false,
    featuredProjects: [
      { id: 1, image: 'https://via.placeholder.com/400x300/ff9800/ffffff?text=Diamond+Island' },
    ],
    contact: {
      phone: '028 3622 3666',
      email: 'info@phuckhang.vn',
      website: 'www.phuckhang.vn',
    },
    certifications: ['ISO 9001', 'Green Building'],
  },
  {
    id: 5,
    name: 'Xây Dựng Trường Thành',
    logo: 'https://via.placeholder.com/100x100/9c27b0/ffffff?text=TTG',
    scale: 'Nhỏ',
    region: 'Đà Nẵng',
    specialties: ['Nhà ở riêng lẻ', 'Sửa chữa', 'Nhà xưởng'],
    rating: 4.6,
    reviews: 87,
    projects: 58,
    yearEstablished: 2010,
    featured: false,
    featuredProjects: [
      { id: 1, image: 'https://via.placeholder.com/400x300/9c27b0/ffffff?text=House+1' },
      { id: 2, image: 'https://via.placeholder.com/400x300/00bcd4/ffffff?text=House+2' },
    ],
    contact: {
      phone: '0236 3850 123',
      email: 'truongthanh@gmail.com',
      website: 'www.xdtruongthanh.vn',
    },
    certifications: ['Giấy phép xây dựng'],
  },
];

const SCALES = ['Tất cả', 'Lớn', 'Trung bình', 'Nhỏ'];
const REGIONS = ['Tất cả', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Khác'];
const SPECIALTIES = [
  'Tất cả',
  'Cao ốc',
  'Nhà ở',
  'Công nghiệp',
  'Khách sạn',
  'Văn phòng',
  'Biệt thự',
  'Cải tạo',
];

interface CompanyCardProps {
  company: any;
  onPress: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onPress }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? company.featuredProjects.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === company.featuredProjects.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <TouchableOpacity
      style={styles.companyCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {company.featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={12} color="#fff" />
          <Text style={styles.featuredText}>Đối tác</Text>
        </View>
      )}

      {/* Project Carousel */}
      {company.featuredProjects.length > 0 && (
        <View style={styles.carouselContainer}>
          <Image
            source={{ uri: company.featuredProjects[currentImageIndex].image }}
            style={styles.projectImage}
            resizeMode="cover"
          />
          
          {/* Carousel Controls */}
          {company.featuredProjects.length > 1 && (
            <>
              <TouchableOpacity
                style={[styles.carouselButton, styles.carouselButtonLeft]}
                onPress={handlePrevImage}
              >
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.carouselButton, styles.carouselButtonRight]}
                onPress={handleNextImage}
              >
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>

              {/* Pagination Dots */}
              <View style={styles.paginationDots}>
                {company.featuredProjects.map((_: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentImageIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {/* Company Info */}
      <View style={styles.companyInfo}>
        {/* Header */}
        <View style={styles.companyHeader}>
          <Image source={{ uri: company.logo }} style={styles.companyLogo} />
          
          <View style={styles.companyHeaderText}>
            <Text style={styles.companyName}>{company.name}</Text>
            
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#ffa41c" />
              <Text style={styles.ratingText}>{company.rating}</Text>
              <Text style={styles.reviewsText}>({company.reviews})</Text>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="business-outline" size={12} color="#999" />
                <Text style={styles.metaText}>{company.scale}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={12} color="#999" />
                <Text style={styles.metaText}>{company.region}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Specialties */}
        <View style={styles.specialtiesSection}>
          <Text style={styles.sectionLabel}>Chuyên môn:</Text>
          <View style={styles.specialtyTags}>
            {company.specialties.slice(0, 3).map((specialty: string, index: number) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Ionicons name="briefcase" size={16} color="#ee4d2d" />
            <Text style={styles.statValue}>{company.projects}+</Text>
            <Text style={styles.statLabel}>Dự án</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={16} color="#2196f3" />
            <Text style={styles.statValue}>{new Date().getFullYear() - company.yearEstablished}</Text>
            <Text style={styles.statLabel}>Năm KN</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="shield-checkmark" size={16} color="#4caf50" />
            <Text style={styles.statValue}>{company.certifications.length}</Text>
            <Text style={styles.statLabel}>Chứng chỉ</Text>
          </View>
        </View>

        {/* Contact Button */}
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.contactButtonText}>Liên hệ báo giá</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function ConstructionCompanyScreen() {
  const [selectedScale, setSelectedScale] = useState('Tất cả');
  const [selectedRegion, setSelectedRegion] = useState('Tất cả');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = COMPANIES.filter((company) => {
    const matchScale = selectedScale === 'Tất cả' || company.scale === selectedScale;
    const matchRegion = selectedRegion === 'Tất cả' || company.region === selectedRegion;
    const matchSpecialty =
      selectedSpecialty === 'Tất cả' ||
      company.specialties.some((s: string) =>
        s.toLowerCase().includes(selectedSpecialty.toLowerCase())
      );
    const matchSearch =
      searchQuery === '' ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.specialties.some((s: string) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchScale && matchRegion && matchSpecialty && matchSearch;
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Công ty xây dựng',
          headerStyle: { backgroundColor: '#ee4d2d' },
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
              placeholder="Tìm công ty, chuyên môn..."
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
          {/* Scale Filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Quy mô:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {SCALES.map((scale) => (
                <TouchableOpacity
                  key={scale}
                  style={[
                    styles.filterChip,
                    selectedScale === scale && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedScale(scale)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedScale === scale && styles.filterChipTextActive,
                    ]}
                  >
                    {scale}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Region Filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Khu vực:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {REGIONS.map((region) => (
                <TouchableOpacity
                  key={region}
                  style={[
                    styles.filterChip,
                    selectedRegion === region && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedRegion(region)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedRegion === region && styles.filterChipTextActive,
                    ]}
                  >
                    {region}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Specialty Filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Chuyên môn:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {SPECIALTIES.map((specialty) => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.filterChip,
                    selectedSpecialty === specialty && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedSpecialty(specialty)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedSpecialty === specialty && styles.filterChipTextActive,
                    ]}
                  >
                    {specialty}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Results Count */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>
            Tìm thấy {filteredCompanies.length} công ty
          </Text>
        </View>

        {/* Companies List */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        >
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onPress={() => router.push(`/services/company-detail?id=${company.id}` as any)}
            />
          ))}

          {/* Empty State */}
          {filteredCompanies.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy công ty phù hợp</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedScale('Tất cả');
                  setSelectedRegion('Tất cả');
                  setSelectedSpecialty('Tất cả');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.resetButtonText}>Đặt lại bộ lọc</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={16} color="#2196f3" />
          <Text style={styles.infoBannerText}>
            Tất cả công ty đều được xác thực giấy phép kinh doanh
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    width: 85,
    paddingLeft: 16,
  },
  filterScroll: {
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
  },
  filterChipActive: {
    backgroundColor: '#ee4d2d',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  resultsBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  companyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
    gap: 4,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  carouselContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  carouselButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  carouselButtonLeft: {
    left: 8,
  },
  carouselButtonRight: {
    right: 8,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 18,
  },
  companyInfo: {
    padding: 16,
  },
  companyHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  companyHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  reviewsText: {
    fontSize: 12,
    color: '#999',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  specialtiesSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  specialtyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specialtyTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#2196f3',
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ee4d2d',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  infoBannerText: {
    fontSize: 12,
    color: '#2196f3',
    flex: 1,
  },
});
