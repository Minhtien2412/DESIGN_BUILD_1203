import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'project' | 'service' | 'payment' | 'technical';
}

const FAQ_DATA: FAQItem[] = [
  // General
  {
    id: '1',
    category: 'general',
    question: 'Ứng dụng này dùng để làm gì?',
    answer: 'Ứng dụng giúp bạn quản lý dự án xây dựng từ A-Z: lập kế hoạch, xem mẫu nhà đẹp, đặt dịch vụ thi công, theo dõi tiến độ qua live stream, quản lý thanh toán và trao đổi với nhà thầu. Tất cả trong một ứng dụng duy nhất!'
  },
  {
    id: '2',
    category: 'general',
    question: 'Ứng dụng có miễn phí không?',
    answer: 'Có! Tải ứng dụng, đăng ký tài khoản và sử dụng các tính năng quản lý dự án hoàn toàn MIỄN PHÍ. Chúng tôi chỉ thu phí hoa hồng nhỏ từ nhà thầu khi bạn đặt dịch vụ, bạn không phải trả thêm gì.'
  },
  {
    id: '3',
    category: 'general',
    question: 'Tôi có thể sử dụng trên điện thoại và máy tính không?',
    answer: 'Hiện tại ứng dụng có phiên bản di động (iOS và Android). Phiên bản web đang được phát triển và sẽ ra mắt sớm.'
  },

  // Project Management
  {
    id: '4',
    category: 'project',
    question: 'Làm thế nào để tạo dự án mới?',
    answer: 'Vào tab "Dự án" → nhấn nút "+" → điền thông tin công trình (tên, địa chỉ, diện tích, ngân sách) → Lưu. Bạn có thể thêm hình ảnh, tài liệu sau khi tạo xong.'
  },
  {
    id: '5',
    category: 'project',
    question: 'Tôi có thể quản lý bao nhiêu dự án?',
    answer: 'Không giới hạn! Bạn có thể tạo và quản lý nhiều dự án cùng lúc. Mỗi dự án có thể có nhiều giai đoạn, nhiều nhà thầu khác nhau.'
  },
  {
    id: '6',
    category: 'project',
    question: 'Làm sao theo dõi tiến độ công trình?',
    answer: 'Có 3 cách: (1) Xem hình ảnh/video nhà thầu tải lên hàng ngày, (2) Sử dụng tính năng Live Stream để xem trực tiếp, (3) Kiểm tra checklist và timeline trong dự án.'
  },
  {
    id: '7',
    category: 'project',
    question: 'Tôi có thể mời người khác cùng xem dự án không?',
    answer: 'Có! Vào Cài đặt dự án → Chia sẻ → Nhập email người muốn mời. Họ sẽ nhận được lời mời và có thể xem (chỉ xem) dự án của bạn.'
  },

  // Services
  {
    id: '8',
    category: 'service',
    question: 'Có những dịch vụ nào?',
    answer: 'Chúng tôi cung cấp 19 dịch vụ: Ép cọc, Đào đất, Vật liệu, Bê tông, Nhân công, Thợ xây, Thợ sắt, Thợ coffa, Thợ cơ khí, Thợ tô tường, Thợ điện nước, Lát gạch, Thạch cao, Thợ sơn, Thợ đá, Làm cửa, Lan can, Thợ cơng, Camera.'
  },
  {
    id: '9',
    category: 'service',
    question: 'Làm thế nào để đặt dịch vụ?',
    answer: 'Vào tab "Trang chủ" → Chọn dịch vụ cần thuê → Xem bảng giá → Nhấn "Đặt dịch vụ ngay" → Điền thông tin (tên, SĐT, địa chỉ, ngày) → Gửi. Nhà thầu sẽ liên hệ bạn trong 1-2 giờ.'
  },
  {
    id: '10',
    category: 'service',
    question: 'Tôi có thể hủy dịch vụ đã đặt không?',
    answer: 'Có, bạn có thể hủy MIỄN PHÍ nếu hủy trước 24 giờ. Sau 24 giờ, có thể phát sinh phí hủy tùy từng nhà thầu. Liên hệ chúng tôi nếu có vấn đề.'
  },
  {
    id: '11',
    category: 'service',
    question: 'Chất lượng dịch vụ có đảm bảo không?',
    answer: 'Tất cả nhà thầu trên ứng dụng đều được xác minh (có giấy phép, kinh nghiệm, đánh giá tốt). Chúng tôi có chế độ bảo hành và giải quyết khiếu nại nếu có vấn đề.'
  },

  // Payment
  {
    id: '12',
    category: 'payment',
    question: 'Thanh toán như thế nào?',
    answer: 'Bạn thanh toán trực tiếp cho nhà thầu (tiền mặt hoặc chuyển khoản). Ứng dụng chỉ là nơi kết nối, không giữ tiền. Trong tương lai sẽ có tính năng thanh toán qua ví điện tử.'
  },
  {
    id: '13',
    category: 'payment',
    question: 'Làm sao quản lý chi phí dự án?',
    answer: 'Vào Dự án → Tab "Thanh toán" → Nhập các khoản chi (vật liệu, công, dịch vụ) → Ứng dụng tự động tính tổng và hiển thị biểu đồ chi tiêu. Bạn có thể xuất báo cáo PDF.'
  },
  {
    id: '14',
    category: 'payment',
    question: 'Có được xuất hóa đơn không?',
    answer: 'Nhà thầu sẽ xuất hóa đơn cho bạn nếu yêu cầu. Nếu cần hóa đơn VAT, vui lòng thông báo trước khi đặt dịch vụ.'
  },

  // Technical
  {
    id: '15',
    category: 'technical',
    question: 'Ứng dụng có hoạt động offline không?',
    answer: 'Một số tính năng hoạt động offline (xem dự án đã lưu, hình ảnh đã tải). Nhưng để đặt dịch vụ, live stream, chat cần có internet.'
  },
  {
    id: '16',
    category: 'technical',
    question: 'Dữ liệu của tôi có an toàn không?',
    answer: 'Rất an toàn! Chúng tôi mã hóa SSL/TLS, lưu trữ trên server bảo mật, sao lưu định kỳ. Chỉ bạn (và người được chia sẻ) mới xem được dự án của bạn. Xem thêm Chính sách bảo mật.'
  },
  {
    id: '17',
    category: 'technical',
    question: 'Live stream có tốn nhiều dung lượng không?',
    answer: 'Trung bình 100MB/giờ. Bạn có thể chọn chất lượng thấp hơn (360p) để tiết kiệm dung lượng. Khuyến nghị dùng wifi khi live stream.'
  },
  {
    id: '18',
    category: 'technical',
    question: 'Tôi quên mật khẩu, làm sao lấy lại?',
    answer: 'Màn hình đăng nhập → "Quên mật khẩu?" → Nhập email → Kiểm tra email (kể cả spam) → Click link reset → Đặt mật khẩu mới. Còn vấn đề? Liên hệ: support@thietkeresort.com.vn'
  },

  // Support
  {
    id: '19',
    category: 'technical',
    question: 'Làm sao liên hệ hỗ trợ?',
    answer: 'Nhiều cách: (1) Chat trong ứng dụng (tab Profile → Hỗ trợ), (2) Gọi hotline: 0123 456 789 (8:00-22:00), (3) Email: support@thietkeresort.com.vn. Chúng tôi phản hồi trong vòng 2 giờ.'
  },
  {
    id: '20',
    category: 'technical',
    question: 'Tôi có ý kiến đóng góp, gửi ở đâu?',
    answer: 'Chúng tôi rất trân trọng ý kiến của bạn! Vào Profile → Phản hồi → Viết ý kiến → Gửi. Hoặc email: feedback@thietkeresort.com.vn. Mỗi tháng chúng tôi chọn 5 ý kiến hay nhất tặng quà!'
  }
];

const CATEGORIES = [
  { key: 'all', label: 'Tất cả', icon: 'apps-outline' },
  { key: 'general', label: 'Chung', icon: 'information-circle-outline' },
  { key: 'project', label: 'Dự án', icon: 'briefcase-outline' },
  { key: 'service', label: 'Dịch vụ', icon: 'hammer-outline' },
  { key: 'payment', label: 'Thanh toán', icon: 'card-outline' },
  { key: 'technical', label: 'Kỹ thuật', icon: 'settings-outline' },
];

export default function FAQScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQs = selectedCategory === 'all' 
    ? FAQ_DATA 
    : FAQ_DATA.filter(faq => faq.category === selectedCategory);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Câu Hỏi Thường Gặp',
          headerBackTitle: 'Quay lại',
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                { 
                  backgroundColor: selectedCategory === cat.key 
                    ? colors.accent 
                    : colors.surface 
                }
              ]}
              onPress={() => setSelectedCategory(cat.key)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={cat.icon as any} 
                size={18} 
                color={selectedCategory === cat.key ? '#fff' : colors.text} 
              />
              <Text 
                style={[
                  styles.categoryText,
                  { color: selectedCategory === cat.key ? '#fff' : colors.text }
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ List */}
        <ScrollView 
          style={styles.faqList}
          contentContainerStyle={styles.faqContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.resultText, { color: colors.textMuted }]}>
            {filteredFAQs.length} câu hỏi
          </Text>

          {filteredFAQs.map((faq, index) => (
            <TouchableOpacity
              key={faq.id}
              style={[
                styles.faqCard,
                { 
                  backgroundColor: colors.surface,
                  borderColor: expandedId === faq.id ? colors.accent : colors.border,
                }
              ]}
              onPress={() => toggleExpand(faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <View style={styles.questionRow}>
                  <View style={[styles.numberBadge, { backgroundColor: colors.accent + '20' }]}>
                    <Text style={[styles.numberText, { color: colors.accent }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[styles.question, { color: colors.text }]}>
                    {faq.question}
                  </Text>
                </View>
                <Ionicons
                  name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={colors.textMuted}
                />
              </View>

              {expandedId === faq.id && (
                <View style={styles.answerContainer}>
                  <View style={[styles.answerDivider, { backgroundColor: colors.border }]} />
                  <Text style={[styles.answer, { color: colors.text }]}>
                    {faq.answer}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Still have questions */}
          <View style={[styles.helpCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="help-circle" size={48} color={colors.accent} />
            <Text style={[styles.helpTitle, { color: colors.text }]}>
              Vẫn còn thắc mắc?
            </Text>
            <Text style={[styles.helpText, { color: colors.textMuted }]}>
              Chúng tôi luôn sẵn sàng hỗ trợ bạn!
            </Text>
            <View style={styles.helpButtons}>
              <View style={[styles.helpButton, { backgroundColor: colors.accent + '15' }]}>
                <Ionicons name="chatbubbles" size={20} color={colors.accent} />
                <Text style={[styles.helpButtonText, { color: colors.accent }]}>
                  Chat ngay
                </Text>
              </View>
              <View style={[styles.helpButton, { backgroundColor: colors.accent + '15' }]}>
                <Ionicons name="call" size={20} color={colors.accent} />
                <Text style={[styles.helpButtonText, { color: colors.accent }]}>
                  Gọi hotline
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryScroll: {
    maxHeight: 60,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  faqList: {
    flex: 1,
  },
  faqContent: {
    padding: 20,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 12,
  },
  faqCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  questionRow: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  answerContainer: {
    marginTop: 12,
  },
  answerDivider: {
    height: 1,
    marginBottom: 12,
  },
  answer: {
    fontSize: 15,
    lineHeight: 22,
    paddingLeft: 40,
  },
  helpCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginTop: 24,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 15,
    marginBottom: 20,
  },
  helpButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
