import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

export default function TermsOfServiceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Điều Khoản Dịch Vụ',
          headerBackTitle: 'Quay lại',
        }}
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Last Updated */}
        <View style={styles.updateInfo}>
          <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.updateText, { color: colors.textMuted }]}>
            Cập nhật lần cuối: 29 tháng 10, 2025
          </Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={[styles.intro, { color: colors.text }]}>
            Chào mừng bạn đến với ứng dụng quản lý dự án xây dựng. Bằng cách sử dụng ứng dụng này, 
            bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây.
          </Text>
        </View>

        {/* 1. Chấp nhận điều khoản */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Chấp Nhận Điều Khoản
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Khi truy cập và sử dụng ứng dụng, bạn xác nhận rằng:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Bạn đã đủ 18 tuổi hoặc có sự đồng ý của người giám hộ</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Bạn đồng ý tuân theo các điều khoản này</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Thông tin bạn cung cấp là chính xác và trung thực</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Bạn sẽ không sử dụng ứng dụng cho mục đích bất hợp pháp</Text>
          </View>
        </View>

        {/* 2. Mô tả dịch vụ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. Mô Tả Dịch Vụ
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Ứng dụng của chúng tôi cung cấp các dịch vụ sau:
          </Text>
          
          <Text style={[styles.subsectionTitle, { color: colors.text }]}>
            2.1. Quản lý dự án xây dựng
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Tạo và quản lý thông tin công trình</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Theo dõi tiến độ thi công</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Lưu trữ hình ảnh, video, tài liệu</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Quản lý lịch làm việc</Text>
          </View>

          <Text style={[styles.subsectionTitle, { color: colors.text }]}>
            2.2. Kế hoạch thiết kế
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Xem mẫu nhà đẹp đa dạng</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Lưu thiết kế yêu thích</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Tải bản vẽ và sơ đồ</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Tư vấn thiết kế theo nhu cầu</Text>
          </View>

          <Text style={[styles.subsectionTitle, { color: colors.text }]}>
            2.3. Đặt dịch vụ thi công
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Đặt thuê thợ (xây, sắt, coffa, điện nước, sơn...)</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Đặt vật liệu xây dựng</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Đặt dịch vụ thi công (ép cọc, đào đất...)</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Xem báo giá và so sánh</Text>
          </View>

          <Text style={[styles.subsectionTitle, { color: colors.text }]}>
            2.4. Trao đổi ý tưởng
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Chat trực tiếp với nhà thầu</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Chia sẻ hình ảnh và tài liệu</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Ghi chú và comment</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Diễn đàn cộng đồng</Text>
          </View>

          <Text style={[styles.subsectionTitle, { color: colors.text }]}>
            2.5. Live Stream công trình
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Video call xem tiến độ từ xa</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Live stream trực tiếp công trình</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Ghi hình và lưu trữ</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Họp nhóm trực tuyến</Text>
          </View>

          <Text style={[styles.subsectionTitle, { color: colors.text }]}>
            2.6. Quản lý thanh toán
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Theo dõi chi phí dự án</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Lịch sử giao dịch</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Hóa đơn điện tử</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Báo cáo tài chính</Text>
          </View>
        </View>

        {/* 3. Trách nhiệm người dùng */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. Trách Nhiệm Người Dùng
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Bạn cam kết:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Bảo mật tài khoản:</Text> Giữ bí mật thông tin đăng nhập
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Nội dung hợp pháp:</Text> Không tải lên nội dung vi phạm pháp luật
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Tôn trọng:</Text> Không spam, quấy rối người dùng khác
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Thông tin chính xác:</Text> Cung cấp thông tin trung thực
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Thanh toán:</Text> Thanh toán đúng hạn cho dịch vụ đã đặt
            </Text>
          </View>
        </View>

        {/* 4. Các hành vi bị cấm */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Các Hành Vi Bị Cấm
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Bạn KHÔNG được phép:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>❌ Sử dụng ứng dụng cho mục đích bất hợp pháp</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>❌ Hack, phá hoại hệ thống</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>❌ Sao chép, bán lại nội dung của ứng dụng</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>❌ Tải lên virus, malware</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>❌ Giả mạo danh tính</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>❌ Spam hoặc quảng cáo trái phép</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>❌ Thu thập dữ liệu người dùng khác</Text>
          </View>
        </View>

        {/* 5. Quyền sở hữu trí tuệ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Quyền Sở Hữu Trí Tuệ
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            <Text style={styles.bold}>5.1. Nội dung của chúng tôi:</Text> Logo, thiết kế, mã nguồn, 
            mẫu nhà là tài sản của chúng tôi. Bạn không được sao chép, phân phối mà không có phép.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            <Text style={styles.bold}>5.2. Nội dung của bạn:</Text> Bạn giữ quyền sở hữu nội dung 
            bạn tải lên (hình ảnh, video, tài liệu). Bằng cách tải lên, bạn cấp cho chúng tôi quyền 
            sử dụng, lưu trữ, hiển thị nội dung đó để cung cấp dịch vụ.
          </Text>
        </View>

        {/* 6. Giới hạn trách nhiệm */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Giới Hạn Trách Nhiệm
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Chúng tôi cố gắng cung cấp dịch vụ tốt nhất, nhưng:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • Ứng dụng được cung cấp &quot;nguyên trạng&quot;, không đảm bảo 100% không lỗi
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • Chúng tôi không chịu trách nhiệm về chất lượng dịch vụ của nhà thầu
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • Chúng tôi không chịu trách nhiệm về tranh chấp giữa bạn và nhà thầu
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • Chúng tôi không bồi thường thiệt hại gián tiếp (mất doanh thu, lợi nhuận...)
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Trách nhiệm tối đa của chúng tôi giới hạn ở số tiền bạn đã thanh toán cho ứng dụng.
          </Text>
        </View>

        {/* 7. Phí dịch vụ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Phí Dịch Vụ và Thanh Toán
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Tải ứng dụng:</Text> Miễn phí
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Quản lý dự án:</Text> Miễn phí
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Đặt dịch vụ:</Text> Thu phí hoa hồng từ nhà thầu (người dùng không trả thêm)
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Tính năng Premium:</Text> Có thể có phí trong tương lai (sẽ thông báo trước)
            </Text>
          </View>
        </View>

        {/* 8. Hủy bỏ và chấm dứt */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Hủy Bỏ và Chấm Dứt
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            <Text style={styles.bold}>8.1. Bạn có thể:</Text> Xóa tài khoản bất cứ lúc nào trong phần cài đặt. 
            Dữ liệu sẽ được xóa hoàn toàn sau 30 ngày.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            <Text style={styles.bold}>8.2. Chúng tôi có thể:</Text> Tạm ngưng hoặc hủy tài khoản của bạn nếu:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Vi phạm điều khoản này</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Hoạt động gian lận hoặc bất hợp pháp</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Không thanh toán dịch vụ</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Gây hại cho người dùng khác</Text>
          </View>
        </View>

        {/* 9. Thay đổi điều khoản */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. Thay Đổi Điều Khoản
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Chúng tôi có thể cập nhật điều khoản này. Thay đổi quan trọng sẽ được thông báo qua:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Email đến địa chỉ đăng ký</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Thông báo trong ứng dụng</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Popup khi mở ứng dụng</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Nếu không đồng ý, bạn có thể ngừng sử dụng và xóa tài khoản.
          </Text>
        </View>

        {/* 10. Luật áp dụng */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            10. Luật Áp Dụng và Giải Quyết Tranh Chấp
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Điều khoản này tuân theo pháp luật Việt Nam. Mọi tranh chấp sẽ được giải quyết thông qua:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>1. Thương lượng trực tiếp</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>2. Hòa giải</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>3. Tòa án có thẩm quyền tại Việt Nam (nếu cần)</Text>
          </View>
        </View>

        {/* 11. Liên hệ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            11. Liên Hệ
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Câu hỏi về điều khoản dịch vụ? Liên hệ chúng tôi:
          </Text>
          <View style={[styles.contactBox, { backgroundColor: colors.surface }]}>
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                support@thietkeresort.com.vn
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Hotline: 0123 456 789 (8:00 - 22:00)
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="chatbubbles-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Chat trong ứng dụng
              </Text>
            </View>
          </View>
        </View>

        {/* Acceptance */}
        <View style={[styles.disclaimer, { backgroundColor: colors.surfaceMuted }]}>
          <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
          <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
            Bằng cách sử dụng ứng dụng, bạn xác nhận đã đọc, hiểu và đồng ý với tất cả 
            các điều khoản và điều kiện trên.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  updateText: {
    fontSize: 14,
  },
  intro: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletList: {
    marginTop: 8,
    gap: 8,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 22,
    paddingLeft: 8,
  },
  bold: {
    fontWeight: '600',
  },
  contactBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 15,
  },
  disclaimer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
