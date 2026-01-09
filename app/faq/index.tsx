import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const faqData = [
  {
    category: 'Tài khoản',
    icon: 'person-circle-outline',
    questions: [
      { q: 'Làm sao để đăng ký tài khoản?', a: 'Bạn có thể đăng ký bằng email, số điện thoại hoặc tài khoản Google/Facebook.' },
      { q: 'Quên mật khẩu phải làm sao?', a: 'Nhấn "Quên mật khẩu" tại màn hình đăng nhập, nhập email để nhận link đặt lại.' },
      { q: 'Làm sao thay đổi thông tin cá nhân?', a: 'Vào Hồ sơ > Chỉnh sửa hồ sơ để cập nhật thông tin.' },
    ],
  },
  {
    category: 'Đặt hàng & Thanh toán',
    icon: 'cart-outline',
    questions: [
      { q: 'Các hình thức thanh toán?', a: 'Chúng tôi hỗ trợ: COD, chuyển khoản, Momo, VNPay, thẻ tín dụng.' },
      { q: 'Làm sao để áp dụng mã giảm giá?', a: 'Nhập mã vào ô "Mã giảm giá" tại trang thanh toán trước khi đặt hàng.' },
      { q: 'Có thể thay đổi địa chỉ giao hàng không?', a: 'Có, liên hệ hotline ngay sau khi đặt nếu đơn chưa được xử lý.' },
    ],
  },
  {
    category: 'Vận chuyển',
    icon: 'car-outline',
    questions: [
      { q: 'Phí vận chuyển tính như thế nào?', a: 'Miễn phí cho đơn từ 500.000đ. Đơn nhỏ hơn phí từ 15.000-50.000đ tùy khu vực.' },
      { q: 'Thời gian giao hàng bao lâu?', a: 'Nội thành HCM: 1-2 ngày. Tỉnh thành khác: 3-5 ngày làm việc.' },
      { q: 'Làm sao theo dõi đơn hàng?', a: 'Vào Đơn hàng của tôi, chọn đơn cần xem để theo dõi trạng thái.' },
    ],
  },
  {
    category: 'Đổi trả & Hoàn tiền',
    icon: 'return-down-back-outline',
    questions: [
      { q: 'Chính sách đổi trả như thế nào?', a: 'Đổi trả trong 7 ngày với sản phẩm còn nguyên tem, hộp. Một số mặt hàng không áp dụng.' },
      { q: 'Bao lâu nhận được tiền hoàn?', a: 'Hoàn tiền trong 5-7 ngày làm việc sau khi xác nhận đủ điều kiện.' },
      { q: 'Hàng lỗi được xử lý như thế nào?', a: 'Chụp ảnh/video sản phẩm lỗi, gửi qua chat để được hỗ trợ đổi mới 1-1.' },
    ],
  },
  {
    category: 'Dự án & Thiết kế',
    icon: 'construct-outline',
    questions: [
      { q: 'Làm sao tạo dự án mới?', a: 'Vào tab Dự án > nhấn nút (+) để tạo dự án và nhập thông tin cần thiết.' },
      { q: 'AI thiết kế hoạt động như thế nào?', a: 'Upload ảnh phòng, chọn phong cách, AI sẽ tạo gợi ý thiết kế phù hợp.' },
      { q: 'Chi phí dịch vụ thiết kế?', a: 'Thiết kế AI miễn phí. Thuê designer chuyên nghiệp từ 2.000.000đ/phòng.' },
    ],
  },
  {
    category: 'Thuê thợ',
    icon: 'people-outline',
    questions: [
      { q: 'Làm sao tìm thợ phù hợp?', a: 'Vào Dịch vụ > chọn loại công việc > lọc theo đánh giá, giá, khu vực.' },
      { q: 'Thợ có được kiểm tra không?', a: 'Tất cả thợ đều được xác minh CMND/CCCD và có đánh giá từ khách hàng.' },
      { q: 'Bảo hành công trình thế nào?', a: 'Bảo hành 6-12 tháng tùy loại công việc. Chi tiết xem trong hợp đồng.' },
    ],
  },
];

export default function FAQScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const filteredFaq = searchQuery
    ? faqData.map(cat => ({
        ...cat,
        questions: cat.questions.filter(
          q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
               q.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(cat => cat.questions.length > 0)
    : faqData;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Câu hỏi thường gặp', headerShown: true }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: cardBg }]}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Tìm câu hỏi..."
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

        {/* FAQ Categories */}
        {filteredFaq.map((category) => (
          <View key={category.category} style={[styles.categoryCard, { backgroundColor: cardBg }]}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => setExpandedCategory(
                expandedCategory === category.category ? null : category.category
              )}
            >
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: '#FF6B3520' }]}>
                  <Ionicons name={category.icon as any} size={24} color="#FF6B35" />
                </View>
                <Text style={[styles.categoryTitle, { color: textColor }]}>{category.category}</Text>
              </View>
              <View style={styles.categoryRight}>
                <Text style={styles.questionCount}>{category.questions.length} câu hỏi</Text>
                <Ionicons
                  name={expandedCategory === category.category ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666"
                />
              </View>
            </TouchableOpacity>

            {(expandedCategory === category.category || searchQuery) && (
              <View style={styles.questionsContainer}>
                {category.questions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.questionItem}
                    onPress={() => setExpandedQuestion(
                      expandedQuestion === item.q ? null : item.q
                    )}
                  >
                    <View style={styles.questionHeader}>
                      <Ionicons
                        name="help-circle-outline"
                        size={18}
                        color="#FF6B35"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[styles.questionText, { color: textColor }]}>{item.q}</Text>
                      <Ionicons
                        name={expandedQuestion === item.q ? 'remove' : 'add'}
                        size={20}
                        color="#666"
                      />
                    </View>
                    {expandedQuestion === item.q && (
                      <View style={styles.answerContainer}>
                        <Text style={styles.answerText}>{item.a}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Still need help */}
        <View style={[styles.helpCard, { backgroundColor: '#FF6B35' }]}>
          <Ionicons name="chatbubbles" size={32} color="#fff" />
          <Text style={styles.helpTitle}>Vẫn cần hỗ trợ?</Text>
          <Text style={styles.helpDesc}>Liên hệ đội ngũ CSKH của chúng tôi</Text>
          <TouchableOpacity style={styles.helpBtn}>
            <Text style={styles.helpBtnText}>Chat ngay</Text>
          </TouchableOpacity>
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
  categoryCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  categoryLeft: { flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  categoryTitle: { fontSize: 16, fontWeight: '600' },
  categoryRight: { flexDirection: 'row', alignItems: 'center' },
  questionCount: { color: '#666', fontSize: 13, marginRight: 8 },
  questionsContainer: { borderTopWidth: 1, borderTopColor: '#eee' },
  questionItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  questionHeader: { flexDirection: 'row', alignItems: 'center' },
  questionText: { flex: 1, fontSize: 14, fontWeight: '500' },
  answerContainer: { marginTop: 12, marginLeft: 26, padding: 12, backgroundColor: '#f8f8f8', borderRadius: 8 },
  answerText: { color: '#666', fontSize: 14, lineHeight: 22 },
  helpCard: { margin: 16, padding: 24, borderRadius: 16, alignItems: 'center' },
  helpTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 12 },
  helpDesc: { color: '#fff', opacity: 0.9, marginTop: 4 },
  helpBtn: { marginTop: 16, backgroundColor: '#fff', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  helpBtnText: { color: '#FF6B35', fontWeight: '600' },
});
