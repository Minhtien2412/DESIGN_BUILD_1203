import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Chính Sách Bảo Mật',
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
            Chúng tôi cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn. 
            Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn 
            khi sử dụng ứng dụng quản lý xây dựng.
          </Text>
        </View>

        {/* 1. Thông tin chúng tôi thu thập */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Thông Tin Chúng Tôi Thu Thập
          </Text>
          
          <Text style={[styles.subsectionTitle, { color: colors.text }]}>
            1.1. Thông tin cá nhân
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Khi bạn đăng ký tài khoản, chúng tôi thu thập:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Họ và tên</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Địa chỉ email</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Số điện thoại</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Địa chỉ công trình (nếu có)</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Ảnh đại diện (tùy chọn)</Text>
          </View>

          <Text style={[styles.subsectionTitle, { color: colors.text }]}>
            1.2. Thông tin dự án
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Thông tin công trình xây dựng</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Hình ảnh/video tiến độ thi công</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Tài liệu thiết kế và bản vẽ</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Lịch sử thanh toán</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Nhật ký trao đổi với nhà thầu</Text>
          </View>

          <Text style={[styles.subsectionTitle, { color: colors.text }]}>
            1.3. Thông tin kỹ thuật
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Địa chỉ IP</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Loại thiết bị và hệ điều hành</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Thông tin trình duyệt</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Thời gian sử dụng ứng dụng</Text>
          </View>
        </View>

        {/* 2. Cách chúng tôi sử dụng thông tin */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. Cách Chúng Tôi Sử Dụng Thông Tin
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Chúng tôi sử dụng thông tin của bạn để:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Quản lý dự án:</Text> Lưu trữ và tổ chức thông tin công trình của bạn
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Giao tiếp:</Text> Gửi thông báo về tiến độ, thanh toán, và cập nhật
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Live stream:</Text> Kết nối video call để xem công trình từ xa
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Đặt dịch vụ:</Text> Xử lý yêu cầu thuê thợ và vật liệu
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Thanh toán:</Text> Theo dõi và quản lý các giao dịch
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Cải thiện dịch vụ:</Text> Phân tích sử dụng để nâng cao trải nghiệm
            </Text>
          </View>
        </View>

        {/* 3. Bảo mật thông tin */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. Bảo Mật Thông Tin
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Chúng tôi áp dụng các biện pháp bảo mật tiên tiến:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Mã hóa SSL/TLS:</Text> Tất cả dữ liệu truyền tải được mã hóa
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Lưu trữ an toàn:</Text> Dữ liệu được lưu trên server bảo mật cao
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Xác thực 2 yếu tố:</Text> Tùy chọn bảo mật nâng cao cho tài khoản
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Sao lưu định kỳ:</Text> Dữ liệu được backup để tránh mất mát
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Kiểm soát truy cập:</Text> Chỉ nhân viên được ủy quyền mới xem dữ liệu
            </Text>
          </View>
        </View>

        {/* 4. Chia sẻ thông tin */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Chia Sẻ Thông Tin
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Chúng tôi <Text style={styles.bold}>KHÔNG bán</Text> thông tin cá nhân của bạn. 
            Thông tin chỉ được chia sẻ với:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Nhà thầu/Thợ:</Text> Khi bạn đặt dịch vụ (tên, SĐT, địa chỉ công trình)
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Nhà cung cấp dịch vụ:</Text> Google OAuth (đăng nhập), Agora (video call)
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Cơ quan pháp luật:</Text> Khi được yêu cầu hợp pháp
            </Text>
          </View>
        </View>

        {/* 5. Quyền của bạn */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Quyền Của Bạn
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Bạn có quyền:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Truy cập:</Text> Xem dữ liệu cá nhân của bạn bất cứ lúc nào
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Chỉnh sửa:</Text> Cập nhật thông tin không chính xác
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Xóa:</Text> Yêu cầu xóa tài khoản và dữ liệu (trong vòng 30 ngày)
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Xuất dữ liệu:</Text> Tải về bản sao dữ liệu của bạn
            </Text>
            <Text style={[styles.bullet, { color: colors.text }]}>
              • <Text style={styles.bold}>Từ chối:</Text> Không nhận email marketing (vẫn nhận thông báo quan trọng)
            </Text>
          </View>
        </View>

        {/* 6. Cookie và theo dõi */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Cookie và Công Nghệ Theo Dõi
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Chúng tôi sử dụng cookie và công nghệ tương tự để:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Duy trì phiên đăng nhập của bạn</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Ghi nhớ tùy chọn cá nhân</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Phân tích cách sử dụng ứng dụng</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Cải thiện hiệu suất</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Bạn có thể tắt cookie trong cài đặt trình duyệt, nhưng một số tính năng có thể bị ảnh hưởng.
          </Text>
        </View>

        {/* 7. Trẻ em */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Quyền Riêng Tư Của Trẻ Em
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Ứng dụng này dành cho người trên 18 tuổi. Chúng tôi không cố ý thu thập thông tin 
            từ trẻ em dưới 18 tuổi. Nếu phát hiện, chúng tôi sẽ xóa ngay lập tức.
          </Text>
        </View>

        {/* 8. Thay đổi chính sách */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Thay Đổi Chính Sách
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Chúng tôi có thể cập nhật chính sách này theo thời gian. Thay đổi quan trọng sẽ được 
            thông báo qua email hoặc thông báo trong ứng dụng. Việc bạn tiếp tục sử dụng sau khi 
            thay đổi có nghĩa là bạn chấp nhận chính sách mới.
          </Text>
        </View>

        {/* 9. Liên hệ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. Liên Hệ Chúng Tôi
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:
          </Text>
          <View style={[styles.contactBox, { backgroundColor: colors.surface }]}>
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                privacy@thietkeresort.com.vn
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Hotline: 0123 456 789
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="location-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Việt Nam
              </Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.surfaceMuted }]}>
          <Ionicons name="shield-checkmark" size={24} color={colors.accent} />
          <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
            Chúng tôi cam kết bảo vệ quyền riêng tư của bạn và không bao giờ sử dụng 
            thông tin cho mục đích xấu. Dữ liệu của bạn được mã hóa và lưu trữ an toàn.
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
