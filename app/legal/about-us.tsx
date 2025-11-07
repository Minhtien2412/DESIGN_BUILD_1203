import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

export default function AboutUsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Về Chúng Tôi',
          headerBackTitle: 'Quay lại',
        }}
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Hero Section */}
        <View style={[styles.hero, { backgroundColor: colors.accent + '15' }]}>
          <View style={[styles.logoContainer, { backgroundColor: colors.accent }]}>
            <Ionicons name="home" size={48} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>
            Quản Lý Xây Dựng
          </Text>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            Xây dựng thông minh, quản lý dễ dàng
          </Text>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🎯 Sứ Mệnh
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Giúp người Việt Nam xây dựng ngôi nhà mơ ước một cách dễ dàng, minh bạch và tiết kiệm. 
            Chúng tôi kết nối chủ nhà với các nhà thầu uy tín, cung cấp công cụ quản lý dự án hiện đại 
            và mang đến trải nghiệm xây dựng tuyệt vời.
          </Text>
        </View>

        {/* Vision */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            👁️ Tầm Nhìn
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Trở thành nền tảng số 1 Việt Nam về quản lý dự án xây dựng, nơi mọi người đều có thể 
            tự tin kiểm soát công trình của mình từ lên ý tưởng đến hoàn thiện.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ✨ Tính Năng Nổi Bật
          </Text>
          
          <View style={styles.featureGrid}>
            <View style={[styles.featureCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="document-text" size={32} color={colors.accent} />
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Kế hoạch thiết kế
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textMuted }]}>
                1000+ mẫu nhà đẹp, bản vẽ chuyên nghiệp
              </Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="hammer" size={32} color={colors.accent} />
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Đặt dịch vụ
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textMuted }]}>
                19 dịch vụ thi công, báo giá minh bạch
              </Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="videocam" size={32} color={colors.accent} />
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Live Stream
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textMuted }]}>
                Xem công trình từ xa mọi lúc mọi nơi
              </Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="chatbubbles" size={32} color={colors.accent} />
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Trao đổi ý tưởng
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textMuted }]}>
                Chat trực tiếp với nhà thầu, chia sẻ tài liệu
              </Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="stats-chart" size={32} color={colors.accent} />
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Tiến độ
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textMuted }]}>
                Theo dõi từng giai đoạn thi công
              </Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="card" size={32} color={colors.accent} />
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Thanh toán
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textMuted }]}>
                Quản lý chi phí, lịch sử giao dịch
              </Text>
            </View>
          </View>
        </View>

        {/* Why Choose Us */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            💪 Tại Sao Chọn Chúng Tôi?
          </Text>
          
          <View style={styles.reasonList}>
            <View style={styles.reasonItem}>
              <View style={[styles.reasonIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="shield-checkmark" size={24} color={colors.accent} />
              </View>
              <View style={styles.reasonContent}>
                <Text style={[styles.reasonTitle, { color: colors.text }]}>
                  Nhà thầu uy tín
                </Text>
                <Text style={[styles.reasonDesc, { color: colors.textMuted }]}>
                  Tất cả đều được xác minh, có giấy phép và đánh giá tốt
                </Text>
              </View>
            </View>

            <View style={styles.reasonItem}>
              <View style={[styles.reasonIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="eye" size={24} color={colors.accent} />
              </View>
              <View style={styles.reasonContent}>
                <Text style={[styles.reasonTitle, { color: colors.text }]}>
                  Minh bạch 100%
                </Text>
                <Text style={[styles.reasonDesc, { color: colors.textMuted }]}>
                  Báo giá rõ ràng, không phát sinh chi phí ngầm
                </Text>
              </View>
            </View>

            <View style={styles.reasonItem}>
              <View style={[styles.reasonIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="flash" size={24} color={colors.accent} />
              </View>
              <View style={styles.reasonContent}>
                <Text style={[styles.reasonTitle, { color: colors.text }]}>
                  Nhanh chóng
                </Text>
                <Text style={[styles.reasonDesc, { color: colors.textMuted }]}>
                  Nhà thầu liên hệ trong vòng 1-2 giờ sau khi đặt
                </Text>
              </View>
            </View>

            <View style={styles.reasonItem}>
              <View style={[styles.reasonIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="headset" size={24} color={colors.accent} />
              </View>
              <View style={styles.reasonContent}>
                <Text style={[styles.reasonTitle, { color: colors.text }]}>
                  Hỗ trợ 24/7
                </Text>
                <Text style={[styles.reasonDesc, { color: colors.textMuted }]}>
                  Luôn sẵn sàng giải đáp mọi thắc mắc của bạn
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>10K+</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Người dùng</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>500+</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Nhà thầu</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>5K+</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Dự án</Text>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📞 Liên Hệ
          </Text>
          <View style={[styles.contactBox, { backgroundColor: colors.surface }]}>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                info@thietkeresort.com.vn
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Hotline: 0123 456 789
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="location" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Việt Nam
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="globe" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                www.thietkeresort.com.vn
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            © 2025 Quản Lý Xây Dựng
          </Text>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Version 1.0.0
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
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 16,
    marginBottom: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  reasonList: {
    gap: 16,
  },
  reasonItem: {
    flexDirection: 'row',
    gap: 12,
  },
  reasonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonContent: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reasonDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
  },
  contactBox: {
    padding: 16,
    borderRadius: 12,
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
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
});
