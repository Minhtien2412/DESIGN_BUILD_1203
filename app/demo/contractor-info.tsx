/**
 * Contractor Profile Demo Screen
 * Shows different variants of ContractorInfoCard component
 */
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Container, Section } from '@/components/ui';
import { ContractorInfoCard } from '@/components/ui/contractor-info-card';
import type { UserProfile } from '@/services/api/users.service';

// Mock contractor data for demo
const MOCK_CONTRACTORS: UserProfile[] = [
  {
    id: 'contractor-001',
    email: 'nguyenvana@example.com',
    name: 'Nguyễn Văn A',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    phone: '0912 345 678',
    role: 'CONTRACTOR',
    verified: true,
    bio: 'Chuyên gia xây dựng nhà phố, biệt thự với hơn 15 năm kinh nghiệm. Đảm bảo chất lượng và tiến độ.',
    company: 'Công ty TNHH Xây dựng Thịnh Vượng',
    position: 'Giám đốc điều hành',
    address: 'Quận 7, TP.HCM',
    rating: 4.8,
    reviewCount: 156,
    projectsCount: 89,
    yearsExperience: 15,
    followersCount: 1250,
    online: true,
    skills: ['Xây dựng dân dụng', 'Biệt thự', 'Nhà phố', 'Nội thất', 'Thiết kế'],
  },
  {
    id: 'contractor-002',
    email: 'tranb@example.com',
    name: 'Trần Thị B',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    phone: '0987 654 321',
    role: 'ENGINEER', // Kiến trúc sư
    verified: true,
    bio: 'Kiến trúc sư với phong cách thiết kế hiện đại, tối giản và bền vững.',
    company: 'Studio Kiến Trúc B Design',
    position: 'Kiến trúc sư trưởng',
    rating: 4.9,
    reviewCount: 89,
    projectsCount: 45,
    yearsExperience: 10,
    followersCount: 856,
    online: false,
    skills: ['Thiết kế kiến trúc', 'Nội thất', '3D Rendering', 'BIM'],
  },
  {
    id: 'contractor-003',
    email: 'phac@example.com',
    name: 'Phan Minh C',
    phone: '0905 111 222',
    role: 'ENGINEER',
    verified: false,
    bio: 'Kỹ sư xây dựng chuyên về kết cấu và móng công trình.',
    company: 'Công ty Tư vấn Xây dựng Đông Á',
    rating: 4.5,
    reviewCount: 42,
    projectsCount: 28,
    yearsExperience: 8,
    followersCount: 320,
    online: true,
    skills: ['Kết cấu', 'Móng cọc', 'Thi công'],
  },
  {
    id: 'contractor-004',
    email: 'led@example.com',
    name: 'Lê Văn D',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    phone: '0918 333 444',
    role: 'SELLER',
    verified: true,
    bio: 'Chuyên cung cấp vật liệu xây dựng chính hãng, giá tốt nhất thị trường.',
    company: 'Đại lý Vật liệu Xây dựng D',
    position: 'Chủ cửa hàng',
    rating: 4.7,
    reviewCount: 234,
    projectsCount: 0,
    yearsExperience: 12,
    followersCount: 567,
    online: true,
    skills: ['Xi măng', 'Thép', 'Gạch', 'Sơn', 'Thiết bị vệ sinh'],
  },
];

export default function ContractorDemoScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Nhà thầu / Người bán',
          headerBackTitle: 'Quay lại',
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Container>
          {/* Header Section */}
          <Section title="Đối tác đáng tin cậy" style={styles.section}>
            <Text style={styles.subtitle}>
              Kết nối với nhà thầu, kiến trúc sư và nhà cung cấp uy tín
            </Text>
          </Section>

          {/* Full Card Variant */}
          <Section title="📋 Thông tin đầy đủ" style={styles.section}>
            <ContractorInfoCard
              userId={MOCK_CONTRACTORS[0].id}
              userData={MOCK_CONTRACTORS[0]}
              variant="card"
              showContactBar={true}
            />
          </Section>

          {/* Card Without Stats */}
          <Section title="👤 Hiển thị đơn giản" style={styles.section}>
            <ContractorInfoCard
              userId={MOCK_CONTRACTORS[1].id}
              userData={MOCK_CONTRACTORS[1]}
              variant="card"
              hideStats={true}
              hideSkills={true}
            />
          </Section>

          {/* Compact Variants */}
          <Section title="📱 Compact View" style={styles.section}>
            <View style={styles.compactList}>
              {MOCK_CONTRACTORS.map((contractor) => (
                <ContractorInfoCard
                  key={contractor.id}
                  userId={contractor.id}
                  userData={contractor}
                  compact={true}
                  showContactBar={true}
                  onPress={() => router.push(`/profile/${contractor.id}`)}
                />
              ))}
            </View>
          </Section>

          {/* Compact Without Actions */}
          <Section title="🔗 Compact (No Actions)" style={styles.section}>
            <View style={styles.compactList}>
              {MOCK_CONTRACTORS.slice(0, 2).map((contractor) => (
                <ContractorInfoCard
                  key={contractor.id}
                  userId={contractor.id}
                  userData={contractor}
                  compact={true}
                  showContactBar={false}
                />
              ))}
            </View>
          </Section>

          {/* Usage Examples Info */}
          <Section title="💡 Hướng dẫn sử dụng" style={styles.section}>
            <View style={styles.usageBox}>
              <View style={styles.usageItem}>
                <Ionicons name="code-slash" size={20} color="#EE4D2D" />
                <Text style={styles.usageText}>
                  Import: {`import { ContractorInfoCard } from '@/components/ui'`}
                </Text>
              </View>
              
              <View style={styles.usageItem}>
                <Ionicons name="options" size={20} color="#0A6847" />
                <Text style={styles.usageText}>
                  Props: userId, userData?, compact?, showContactBar?, variant?
                </Text>
              </View>
              
              <View style={styles.usageItem}>
                <Ionicons name="layers" size={20} color="#3b82f6" />
                <Text style={styles.usageText}>
                  Variants: 'default' | 'card' | 'minimal'
                </Text>
              </View>

              <View style={styles.usageItem}>
                <Ionicons name="eye-off" size={20} color="#6b7280" />
                <Text style={styles.usageText}>
                  Hide: hideStats?, hideSkills?
                </Text>
              </View>
            </View>
          </Section>

          <View style={{ height: 40 }} />
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  compactList: {
    gap: 12,
  },
  usageBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  usageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  usageText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
