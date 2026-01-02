/**
 * Project Guide Component
 * Comprehensive instructions and tutorials for project management
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface GuideStep {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}

interface GuideSection {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: [string, string];
  steps: GuideStep[];
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    title: 'Bắt đầu với Dự án',
    icon: 'rocket',
    color: ['#667eea', '#764ba2'],
    steps: [
      {
        icon: 'add-circle',
        title: 'Tạo dự án mới',
        description: 'Nhấn nút "+" ở góc trên phải để tạo dự án. Điền tên, mô tả, chọn loại dự án và khách hàng.',
        action: () => router.push('/projects/create' as const),
        actionLabel: 'Tạo ngay',
      },
      {
        icon: 'folder',
        title: 'Chọn loại dự án phù hợp',
        description: 'Chọn loại: Nhà ở (residential), Thương mại (commercial), Cảnh quan (landscape), Nội thất (interior), hoặc Cải tạo (renovation).',
      },
      {
        icon: 'people',
        title: 'Thêm thành viên',
        description: 'Vào chi tiết dự án > Tab "Đội ngũ" để thêm kiến trúc sư, kỹ sư, thợ xây và các thành viên khác.',
      },
      {
        icon: 'calendar',
        title: 'Đặt mốc thời gian',
        description: 'Xác định ngày bắt đầu và kết thúc dự kiến để theo dõi tiến độ hiệu quả.',
      },
    ],
  },
  {
    title: 'Quản lý Tiến độ',
    icon: 'analytics',
    color: ['#11998e', '#38ef7d'],
    steps: [
      {
        icon: 'checkmark-done',
        title: 'Tạo công việc',
        description: 'Chia dự án thành các công việc nhỏ. Mỗi công việc có người phụ trách, deadline và trạng thái riêng.',
      },
      {
        icon: 'trending-up',
        title: 'Cập nhật tiến độ',
        description: 'Thường xuyên cập nhật % hoàn thành. Hệ thống tự động tính toán tiến độ tổng thể.',
      },
      {
        icon: 'notifications',
        title: 'Theo dõi cảnh báo',
        description: 'Nhận thông báo khi công việc trễ deadline hoặc tiến độ chậm so với kế hoạch.',
      },
      {
        icon: 'time',
        title: 'Timeline dự án',
        description: 'Xem timeline chi tiết các mốc quan trọng, công việc đang làm và sắp tới.',
      },
    ],
  },
  {
    title: 'Quản lý Ngân sách',
    icon: 'cash',
    color: ['#f093fb', '#f5576c'],
    steps: [
      {
        icon: 'wallet',
        title: 'Thiết lập ngân sách',
        description: 'Nhập tổng ngân sách dự án. Chia nhỏ theo hạng mục: vật liệu, nhân công, thiết bị, chi phí khác.',
      },
      {
        icon: 'receipt',
        title: 'Ghi nhận chi tiêu',
        description: 'Mỗi lần phát sinh chi phí, ghi nhận ngay vào hệ thống với hóa đơn đính kèm.',
      },
      {
        icon: 'stats-chart',
        title: 'Theo dõi chi tiêu',
        description: 'Xem biểu đồ chi tiêu thực tế so với ngân sách. Nhận cảnh báo khi vượt 80% ngân sách.',
      },
      {
        icon: 'document-text',
        title: 'Báo cáo tài chính',
        description: 'Xuất báo cáo tài chính chi tiết theo tháng, quý để trình khách hàng hoặc lưu trữ.',
      },
    ],
  },
  {
    title: 'Tài liệu & Hình ảnh',
    icon: 'document',
    color: ['#fa709a', '#fee140'],
    steps: [
      {
        icon: 'cloud-upload',
        title: 'Upload tài liệu',
        description: 'Upload bản vẽ, hợp đồng, giấy phép xây dựng, dự toán... Hỗ trợ PDF, DWG, Excel, Word.',
      },
      {
        icon: 'images',
        title: 'Thư viện hình ảnh',
        description: 'Chụp và upload ảnh hiện trường, ảnh tiến độ thi công, ảnh hoàn thành. Tự động sắp xếp theo ngày.',
      },
      {
        icon: 'folder-open',
        title: 'Phân loại tài liệu',
        description: 'Tổ chức tài liệu theo folder: Thiết kế, Pháp lý, Thi công, Nghiệm thu, Bảo hành.',
      },
      {
        icon: 'share-social',
        title: 'Chia sẻ an toàn',
        description: 'Chia sẻ tài liệu với khách hàng, đối tác qua link bảo mật. Kiểm soát quyền xem/tải.',
      },
    ],
  },
  {
    title: 'Giao tiếp & Báo cáo',
    icon: 'chatbubbles',
    color: ['#667eea', '#764ba2'],
    steps: [
      {
        icon: 'chatbox',
        title: 'Nhóm chat dự án',
        description: 'Mỗi dự án có nhóm chat riêng. Tất cả thành viên có thể trao đổi, chia sẻ file, hình ảnh.',
      },
      {
        icon: 'megaphone',
        title: 'Thông báo quan trọng',
        description: 'Gửi thông báo khẩn cấp tới toàn bộ team: thay đổi thiết kế, cảnh báo an toàn, nghỉ thi công...',
      },
      {
        icon: 'document-attach',
        title: 'Báo cáo tiến độ',
        description: 'Tạo báo cáo tiến độ tự động theo tuần/tháng. Gửi email cho khách hàng với 1 cú nhấp chuột.',
      },
      {
        icon: 'videocam',
        title: 'Họp online',
        description: 'Tích hợp cuộc gọi video để họp team, họp khách hàng mà không cần rời ứng dụng.',
      },
    ],
  },
  {
    title: 'Mẹo Nâng cao',
    icon: 'bulb',
    color: ['#FF6B35', '#F7931E'],
    steps: [
      {
        icon: 'copy',
        title: 'Sao chép dự án',
        description: 'Dự án tương tự? Sao chép dự án cũ để tái sử dụng cấu trúc công việc, team, ngân sách.',
      },
      {
        icon: 'archive',
        title: 'Lưu trữ dự án',
        description: 'Dự án hoàn thành? Lưu trữ để giữ lịch sử mà không làm rối danh sách dự án đang làm.',
      },
      {
        icon: 'filter',
        title: 'Bộ lọc thông minh',
        description: 'Lọc dự án theo trạng thái, loại, ngân sách, thời gian để tìm kiếm nhanh chóng.',
      },
      {
        icon: 'download',
        title: 'Xuất dữ liệu',
        description: 'Xuất toàn bộ dữ liệu dự án ra Excel/PDF để backup hoặc trình bày cho ban giám đốc.',
      },
      {
        icon: 'star',
        title: 'Dự án ưu tiên',
        description: 'Đánh dấu sao dự án quan trọng để luôn hiển thị ở đầu danh sách.',
      },
      {
        icon: 'speedometer',
        title: 'Dashboard tùy chỉnh',
        description: 'Tùy chỉnh dashboard hiển thị các chỉ số quan trọng nhất cho bạn: tiến độ, ngân sách, deadline...',
      },
    ],
  },
];

interface ProjectGuideProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProjectGuide({ visible, onClose }: ProjectGuideProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Hướng dẫn Dự án</Text>
              <Text style={styles.headerSubtitle}>Tất cả những gì bạn cần biết</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Introduction Banner */}
          <View style={styles.introBanner}>
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.introBannerGradient}
            >
              <Ionicons name="book" size={48} color="#fff" style={{ marginBottom: 12 }} />
              <Text style={styles.introBannerTitle}>Chào mừng đến với Quản lý Dự án!</Text>
              <Text style={styles.introBannerText}>
                Hệ thống giúp bạn quản lý mọi khía cạnh của dự án xây dựng: từ thiết kế, thi công, đến nghiệm thu và
                bảo hành. Khám phá các tính năng bên dưới!
              </Text>
            </LinearGradient>
          </View>

          {/* Guide Sections */}
          {GUIDE_SECTIONS.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.sectionContainer}>
              <TouchableOpacity
                style={[styles.sectionHeader, { backgroundColor: '#fff' }]}
                onPress={() => toggleSection(sectionIndex)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={section.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sectionIconWrapper}
                >
                  <Ionicons name={section.icon} size={24} color="#fff" />
                </LinearGradient>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                <Ionicons
                  name={expandedSection === sectionIndex ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textMuted}
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>

              {expandedSection === sectionIndex && (
                <View style={[styles.stepsContainer, { backgroundColor: '#fff' }]}>
                  {section.steps.map((step, stepIndex) => (
                    <View key={stepIndex} style={styles.stepItem}>
                      <View style={styles.stepIconWrapper}>
                        <Ionicons name={step.icon} size={20} color={section.color[0]} />
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                        <Text style={[styles.stepDescription, { color: colors.textMuted }]}>
                          {step.description}
                        </Text>
                        {step.action && step.actionLabel && (
                          <TouchableOpacity
                            style={styles.stepAction}
                            onPress={() => {
                              onClose();
                              step.action?.();
                            }}
                          >
                            <LinearGradient
                              colors={section.color}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.stepActionGradient}
                            >
                              <Text style={styles.stepActionText}>{step.actionLabel}</Text>
                              <Ionicons name="arrow-forward" size={14} color="#fff" />
                            </LinearGradient>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Quick Tips Card */}
          <View style={[styles.tipsCard, { backgroundColor: '#fff' }]}>
            <View style={styles.tipsHeader}>
              <Ionicons name="flash" size={24} color="#F59E0B" />
              <Text style={[styles.tipsTitle, { color: colors.text }]}>Mẹo nhanh</Text>
            </View>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={[styles.tipText, { color: colors.textMuted }]}>
                  Cập nhật tiến độ hàng ngày để team luôn đồng bộ
                </Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={[styles.tipText, { color: colors.textMuted }]}>
                  Chụp ảnh hiện trường thường xuyên để có bằng chứng thi công
                </Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={[styles.tipText, { color: colors.textMuted }]}>
                  Ghi nhận chi phí ngay khi phát sinh tránh quên hoặc nhầm lẫn
                </Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={[styles.tipText, { color: colors.textMuted }]}>
                  Sử dụng bộ lọc và tìm kiếm để quản lý nhiều dự án hiệu quả
                </Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={[styles.tipText, { color: colors.textMuted }]}>
                  Backup dữ liệu dự án định kỳ để tránh mất mát thông tin quan trọng
                </Text>
              </View>
            </View>
          </View>

          {/* Support Card */}
          <View style={[styles.supportCard, { backgroundColor: '#fff' }]}>
            <Ionicons name="help-circle" size={32} color="#667eea" style={{ marginBottom: 8 }} />
            <Text style={[styles.supportTitle, { color: colors.text }]}>Cần hỗ trợ thêm?</Text>
            <Text style={[styles.supportText, { color: colors.textMuted }]}>
              Liên hệ đội ngũ hỗ trợ 24/7 qua hotline hoặc email
            </Text>
            <View style={styles.supportActions}>
              <TouchableOpacity style={styles.supportButton}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.supportButtonGradient}
                >
                  <Ionicons name="call" size={18} color="#fff" />
                  <Text style={styles.supportButtonText}>1900-xxxx</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.supportButton}>
                <LinearGradient
                  colors={['#11998e', '#38ef7d']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.supportButtonGradient}
                >
                  <Ionicons name="mail" size={18} color="#fff" />
                  <Text style={styles.supportButtonText}>support@app.vn</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  introBanner: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  introBannerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  introBannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  introBannerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionContainer: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  stepsContainer: {
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
  stepAction: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  stepActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  stepActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  tipsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginTop: 7,
    marginRight: 10,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  supportCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  supportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  supportButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  supportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  supportButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});
