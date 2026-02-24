import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const comingSoonFeatures = [
  {
    id: '1',
    title: 'AR Xem Phòng',
    description: 'Xem trước vật liệu ngay trong không gian thực tế của bạn',
    icon: 'cube-outline',
    color: '#14B8A6',
    progress: 75,
  },
  {
    id: '2',
    title: 'VR Tour Showroom',
    description: 'Tham quan showroom 360° từ nhà',
    icon: 'glasses-outline',
    color: '#4CAF50',
    progress: 60,
  },
  {
    id: '3',
    title: 'AI Tư Vấn Thiết Kế',
    description: 'AI phân tích và gợi ý thiết kế phù hợp',
    icon: 'sparkles-outline',
    color: '#2196F3',
    progress: 85,
  },
  {
    id: '4',
    title: 'Marketplace Thợ',
    description: 'Kết nối với hàng ngàn thợ chuyên nghiệp',
    icon: 'people-outline',
    color: '#9C27B0',
    progress: 90,
  },
  {
    id: '5',
    title: 'Smart Home Hub',
    description: 'Điều khiển thiết bị thông minh trong nhà',
    icon: 'home-outline',
    color: '#FF9800',
    progress: 40,
  },
  {
    id: '6',
    title: 'Thanh toán trả góp',
    description: 'Mua trước trả sau với lãi suất 0%',
    icon: 'card-outline',
    color: '#F44336',
    progress: 95,
  },
];

export default function ComingSoonScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Sắp ra mắt', headerShown: true }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🚀</Text>
          <Text style={[styles.heroTitle, { color: textColor }]}>Tính năng mới sắp ra mắt</Text>
          <Text style={styles.heroSubtitle}>
            Chúng tôi đang phát triển những tính năng tuyệt vời để nâng cao trải nghiệm của bạn
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          {comingSoonFeatures.map((feature) => (
            <View key={feature.id} style={[styles.featureCard, { backgroundColor: cardBg }]}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                <Ionicons name={feature.icon as any} size={28} color={feature.color} />
              </View>
              <Text style={[styles.featureTitle, { color: textColor }]}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.description}</Text>
              
              {/* Progress */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Tiến độ</Text>
                  <Text style={[styles.progressPercent, { color: feature.color }]}>{feature.progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${feature.progress}%`, backgroundColor: feature.color }
                    ]} 
                  />
                </View>
              </View>

              <TouchableOpacity style={[styles.notifyBtn, { borderColor: feature.color }]}>
                <Ionicons name="notifications-outline" size={16} color={feature.color} />
                <Text style={[styles.notifyBtnText, { color: feature.color }]}>Nhận thông báo</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Newsletter */}
        <View style={[styles.newsletterCard, { backgroundColor: '#14B8A6' }]}>
          <Ionicons name="mail-outline" size={32} color="#fff" />
          <Text style={styles.newsletterTitle}>Đăng ký nhận tin</Text>
          <Text style={styles.newsletterDesc}>
            Nhận thông báo ngay khi tính năng mới được ra mắt
          </Text>
          <TouchableOpacity style={styles.subscribeBtn}>
            <Text style={styles.subscribeBtnText}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>

        {/* Feedback */}
        <View style={[styles.feedbackCard, { backgroundColor: cardBg }]}>
          <View style={styles.feedbackContent}>
            <Text style={styles.feedbackEmoji}>💡</Text>
            <View style={styles.feedbackText}>
              <Text style={[styles.feedbackTitle, { color: textColor }]}>Có ý tưởng mới?</Text>
              <Text style={styles.feedbackDesc}>Chia sẻ góp ý để chúng tôi cải thiện</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.feedbackBtn}>
            <Text style={styles.feedbackBtnText}>Góp ý</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: { alignItems: 'center', padding: 24 },
  heroEmoji: { fontSize: 48, marginBottom: 16 },
  heroTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  heroSubtitle: { color: '#666', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  featuresContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    padding: 16,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  featureDesc: { color: '#666', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  progressSection: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { color: '#999', fontSize: 11 },
  progressPercent: { fontSize: 12, fontWeight: '600' },
  progressBar: { height: 6, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  notifyBtnText: { fontSize: 12, fontWeight: '500' },
  newsletterCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  newsletterTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 12 },
  newsletterDesc: { color: '#fff', opacity: 0.9, textAlign: 'center', marginTop: 8 },
  subscribeBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  subscribeBtnText: { color: '#14B8A6', fontWeight: '600' },
  feedbackCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  feedbackEmoji: { fontSize: 32 },
  feedbackText: { marginLeft: 12 },
  feedbackTitle: { fontSize: 14, fontWeight: '600' },
  feedbackDesc: { color: '#666', fontSize: 12, marginTop: 2 },
  feedbackBtn: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  feedbackBtnText: { color: '#fff', fontWeight: '500', fontSize: 13 },
});
