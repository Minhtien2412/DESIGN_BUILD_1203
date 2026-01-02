import { Stack } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function TermsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Điều khoản sử dụng',
          headerBackTitle: 'Quay lại',
        }}
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Điều khoản sử dụng</Text>
          <Text style={styles.updateDate}>Cập nhật lần cuối: 03/11/2024</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Chấp nhận điều khoản</Text>
            <Text style={styles.paragraph}>
              Bằng việc truy cập và sử dụng ứng dụng này, bạn đồng ý bị ràng buộc bởi các điều khoản và điều kiện sau đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng ứng dụng.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Mô tả dịch vụ</Text>
            <Text style={styles.paragraph}>
              Ứng dụng cung cấp nền tảng quản lý dự án thiết kế và xây dựng, bao gồm:
            </Text>
            <Text style={styles.bulletPoint}>• Quản lý hồ sơ năng lực</Text>
            <Text style={styles.bulletPoint}>• Theo dõi tiến độ dự án</Text>
            <Text style={styles.bulletPoint}>• Quản lý tài liệu và bản vẽ</Text>
            <Text style={styles.bulletPoint}>• Thanh toán và báo giá</Text>
            <Text style={styles.bulletPoint}>• Giao tiếp và hợp tác nhóm</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Tài khoản người dùng</Text>
            <Text style={styles.paragraph}>
              Bạn có trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu của mình. Bạn chấp nhận chịu trách nhiệm cho tất cả các hoạt động xảy ra dưới tài khoản của bạn.
            </Text>
            <Text style={styles.paragraph}>
              Bạn phải thông báo ngay cho chúng tôi về bất kỳ việc sử dụng trái phép tài khoản của bạn hoặc bất kỳ vi phạm bảo mật nào khác.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Quyền sở hữu trí tuệ</Text>
            <Text style={styles.paragraph}>
              Tất cả nội dung, tính năng và chức năng của ứng dụng (bao gồm nhưng không giới hạn ở thông tin, phần mềm, văn bản, hình ảnh, đồ họa, logo) thuộc sở hữu của chúng tôi hoặc các bên cấp phép và được bảo vệ bởi luật bản quyền, thương hiệu và các luật sở hữu trí tuệ khác.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Nội dung người dùng</Text>
            <Text style={styles.paragraph}>
              Bạn giữ quyền sở hữu đối với nội dung mà bạn tạo, tải lên hoặc chia sẻ trên ứng dụng. Tuy nhiên, bằng cách tải lên nội dung, bạn cấp cho chúng tôi giấy phép không độc quyền, miễn phí, có thể chuyển nhượng để sử dụng, sao chép, phân phối và hiển thị nội dung đó.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Hành vi bị cấm</Text>
            <Text style={styles.paragraph}>Bạn không được:</Text>
            <Text style={styles.bulletPoint}>• Sử dụng ứng dụng cho mục đích bất hợp pháp</Text>
            <Text style={styles.bulletPoint}>• Vi phạm bất kỳ luật địa phương, quốc gia hoặc quốc tế nào</Text>
            <Text style={styles.bulletPoint}>• Xâm phạm hoặc vi phạm quyền sở hữu trí tuệ của chúng tôi hoặc người khác</Text>
            <Text style={styles.bulletPoint}>• Truyền tải bất kỳ nội dung độc hại, spam hoặc phần mềm độc hại nào</Text>
            <Text style={styles.bulletPoint}>• Cố gắng truy cập trái phép vào hệ thống của chúng tôi</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Thanh toán và hoàn tiền</Text>
            <Text style={styles.paragraph}>
              Các dịch vụ trả phí sẽ được tính theo giá niêm yết tại thời điểm mua. Tất cả các khoản thanh toán là không hoàn lại trừ khi có quy định khác trong chính sách hoàn tiền cụ thể.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Giới hạn trách nhiệm</Text>
            <Text style={styles.paragraph}>
              Ứng dụng được cung cấp &quot;như hiện có&quot; và &quot;như có sẵn&quot;. Chúng tôi không đảm bảo rằng ứng dụng sẽ không bị gián đoạn, an toàn hoặc không có lỗi. Trong phạm vi tối đa được pháp luật cho phép, chúng tôi từ chối mọi trách nhiệm đối với bất kỳ thiệt hại nào phát sinh từ việc sử dụng ứng dụng.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Thay đổi điều khoản</Text>
            <Text style={styles.paragraph}>
              Chúng tôi có quyền sửa đổi các điều khoản này bất kỳ lúc nào. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng các điều khoản mới trên trang này. Việc bạn tiếp tục sử dụng ứng dụng sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Chấm dứt</Text>
            <Text style={styles.paragraph}>
              Chúng tôi có thể chấm dứt hoặc tạm ngừng quyền truy cập của bạn vào ứng dụng ngay lập tức, không cần thông báo trước, vì bất kỳ lý do nào, bao gồm nhưng không giới hạn ở việc vi phạm các Điều khoản này.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Luật điều chỉnh</Text>
            <Text style={styles.paragraph}>
              Các điều khoản này sẽ được điều chỉnh và giải thích theo luật pháp của Việt Nam, không xét đến các quy định về xung đột pháp luật.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Liên hệ</Text>
            <Text style={styles.paragraph}>
              Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng này, vui lòng liên hệ với chúng tôi qua:
            </Text>
            <Text style={styles.bulletPoint}>Email: support@example.com</Text>
            <Text style={styles.bulletPoint}>Điện thoại: +84 123 456 789</Text>
            <Text style={styles.bulletPoint}>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Bằng việc sử dụng ứng dụng, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý với các Điều khoản sử dụng này.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  updateDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
    marginLeft: 16,
    marginBottom: 8,
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
