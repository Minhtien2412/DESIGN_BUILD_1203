import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const helpCategories = [
  { id: '1', icon: 'person-outline', title: 'Tài khoản', desc: 'Đăng ký, đăng nhập, bảo mật' },
  { id: '2', icon: 'cart-outline', title: 'Đặt hàng', desc: 'Cách đặt hàng, thanh toán' },
  { id: '3', icon: 'car-outline', title: 'Vận chuyển', desc: 'Giao hàng, theo dõi đơn' },
  { id: '4', icon: 'return-down-back-outline', title: 'Đổi trả', desc: 'Chính sách hoàn tiền' },
  { id: '5', icon: 'construct-outline', title: 'Dự án', desc: 'Quản lý dự án xây dựng' },
  { id: '6', icon: 'people-outline', title: 'Thợ & Dịch vụ', desc: 'Thuê thợ, đánh giá' },
];

const faqs = [
  { q: 'Làm sao để đặt hàng?', a: 'Chọn sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán.' },
  { q: 'Phí vận chuyển như thế nào?', a: 'Miễn phí cho đơn hàng trên 500.000đ, các đơn khác tính theo khu vực.' },
  { q: 'Tôi có thể hủy đơn không?', a: 'Có, bạn có thể hủy đơn trước khi đơn được giao cho đơn vị vận chuyển.' },
  { q: 'Làm sao liên hệ hỗ trợ?', a: 'Gọi hotline 1900-xxxx hoặc chat trực tiếp trong app.' },
];

export default function HelpScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Trung tâm trợ giúp', headerShown: true }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: cardBg }]}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Tìm kiếm câu hỏi..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.quickBtn, { backgroundColor: '#FF6B35' }]}
            onPress={() => router.push('/chat')}
          >
            <Ionicons name="chatbubbles" size={24} color="#fff" />
            <Text style={styles.quickBtnText}>Chat hỗ trợ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickBtn, { backgroundColor: '#4CAF50' }]}
            onPress={() => router.push('/contact' as any)}
          >
            <Ionicons name="call" size={24} color="#fff" />
            <Text style={styles.quickBtnText}>Gọi hotline</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Danh mục hỗ trợ</Text>
          <View style={styles.categoriesGrid}>
            {helpCategories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                <View style={[styles.categoryIcon, { backgroundColor: '#FF6B3520' }]}>
                  <Ionicons name={cat.icon as any} size={24} color="#FF6B35" />
                </View>
                <Text style={[styles.categoryTitle, { color: textColor }]}>{cat.title}</Text>
                <Text style={styles.categoryDesc}>{cat.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Câu hỏi thường gặp</Text>
          {faqs.map((faq, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.faqItem}
              onPress={() => setExpandedFaq(expandedFaq === faq.q ? null : faq.q)}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, { color: textColor }]}>{faq.q}</Text>
                <Ionicons 
                  name={expandedFaq === faq.q ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#666" 
                />
              </View>
              {expandedFaq === faq.q && (
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Liên hệ khác</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color="#FF6B35" />
            <Text style={[styles.contactText, { color: textColor }]}>support@baotienweb.cloud</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="time-outline" size={20} color="#FF6B35" />
            <Text style={[styles.contactText, { color: textColor }]}>8:00 - 22:00 (T2-CN)</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },
  quickActions: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  section: { margin: 16, marginTop: 0, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryItem: { width: '47%', alignItems: 'center', padding: 12 },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  categoryDesc: { fontSize: 12, color: '#666', textAlign: 'center' },
  faqItem: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 15, fontWeight: '500', flex: 1, marginRight: 8 },
  faqAnswer: { color: '#666', fontSize: 14, marginTop: 8, lineHeight: 20 },
  contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  contactText: { marginLeft: 12, fontSize: 14 },
});
