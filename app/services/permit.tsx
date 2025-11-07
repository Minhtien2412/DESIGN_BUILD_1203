import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const PERMIT_STEPS = [
  {
    id: 1,
    title: 'Chuẩn bị hồ sơ',
    duration: '1-2 tuần',
    status: 'completed',
    description: 'Thu thập và chuẩn bị đầy đủ giấy tờ cần thiết',
    details: [
      'Đơn xin phép xây dựng (theo mẫu)',
      'Bản vẽ thiết kế kiến trúc (bản chính)',
      'Giấy tờ về quyền sử dụng đất',
      'Giấy phép khác (nếu có)',
    ],
    documents: [
      { name: 'Mẫu đơn xin phép.pdf', size: '2.5 MB' },
      { name: 'Hướng dẫn chuẩn bị hồ sơ.docx', size: '1.2 MB' },
    ],
  },
  {
    id: 2,
    title: 'Nộp hồ sơ',
    duration: '1-3 ngày',
    status: 'active',
    description: 'Nộp hồ sơ tại Phòng Quản lý đô thị hoặc Sở Xây dựng',
    details: [
      'Nộp trực tiếp tại cơ quan có thẩm quyền',
      'Hoặc nộp online qua Cổng dịch vụ công',
      'Nhận biên nhận và mã hồ sơ',
      'Theo dõi tiến độ xử lý',
    ],
    documents: [
      { name: 'Danh sách cơ quan tiếp nhận.pdf', size: '0.8 MB' },
      { name: 'Hướng dẫn nộp online.pdf', size: '1.5 MB' },
    ],
  },
  {
    id: 3,
    title: 'Thẩm định',
    duration: '20-30 ngày',
    status: 'pending',
    description: 'Cơ quan có thẩm quyền thẩm định hồ sơ',
    details: [
      'Kiểm tra tính hợp lệ của hồ sơ',
      'Thẩm định thiết kế về quy hoạch, PCCC',
      'Yêu cầu bổ sung hồ sơ (nếu cần)',
      'Khảo sát thực địa (nếu cần)',
    ],
    documents: [],
  },
  {
    id: 4,
    title: 'Phê duyệt',
    duration: '5-7 ngày',
    status: 'pending',
    description: 'Ban hành giấy phép xây dựng',
    details: [
      'Nhận thông báo kết quả',
      'Đóng phí cấp giấy phép',
      'Nhận giấy phép xây dựng',
      'Bắt đầu triển khai thi công',
    ],
    documents: [
      { name: 'Biểu phí giấy phép.pdf', size: '0.5 MB' },
    ],
  },
];

const PERMIT_TYPES = [
  {
    id: 1,
    title: 'Nhà ở riêng lẻ',
    description: 'Dưới 7 tầng, diện tích < 250m²',
    icon: 'home-outline',
    color: '#4caf50',
  },
  {
    id: 2,
    title: 'Nhà ở liên kế',
    description: 'Nhà phố, liền kề',
    icon: 'business-outline',
    color: '#2196f3',
  },
  {
    id: 3,
    title: 'Công trình lớn',
    description: 'Từ 7 tầng trở lên, công trình công cộng',
    icon: 'business',
    color: '#ff9800',
  },
  {
    id: 4,
    title: 'Sửa chữa, cải tạo',
    description: 'Thay đổi kết cấu, nâng tầng',
    icon: 'construct-outline',
    color: '#9c27b0',
  },
];

const FAQ_ITEMS = [
  {
    id: 1,
    question: 'Những trường hợp nào cần xin phép xây dựng?',
    answer:
      'Tất cả công trình xây dựng mới, sửa chữa nâng tầng hoặc cải tạo có thay đổi kết cấu đều cần xin phép theo Luật Xây dựng 2014.',
  },
  {
    id: 2,
    question: 'Thời gian cấp giấy phép mất bao lâu?',
    answer:
      'Tùy loại công trình: Nhà ở riêng lẻ 20-30 ngày, công trình lớn 30-45 ngày kể từ ngày nhận đủ hồ sơ hợp lệ.',
  },
  {
    id: 3,
    question: 'Chi phí xin phép là bao nhiêu?',
    answer:
      'Phí cấp giấy phép: 50.000-500.000đ tùy quy mô. Chi phí làm hồ sơ thiết kế: 5-15 triệu đồng.',
  },
  {
    id: 4,
    question: 'Nếu không xin phép có bị xử phạt không?',
    answer:
      'Có. Phạt từ 50-100 triệu đồng hoặc buộc tháo dỡ công trình theo Nghị định 139/2017/NĐ-CP.',
  },
];

interface TimelineStepProps {
  step: any;
  isLast: boolean;
}

const TimelineStep: React.FC<TimelineStepProps> = ({ step, isLast }) => {
  const [expanded, setExpanded] = useState(step.status === 'active');

  const getStatusColor = () => {
    switch (step.status) {
      case 'completed':
        return '#4caf50';
      case 'active':
        return '#ee4d2d';
      case 'pending':
        return '#e0e0e0';
      default:
        return '#e0e0e0';
    }
  };

  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return 'checkmark-circle';
      case 'active':
        return 'radio-button-on';
      case 'pending':
        return 'radio-button-off-outline';
      default:
        return 'radio-button-off-outline';
    }
  };

  return (
    <View style={styles.timelineStep}>
      {/* Timeline Line */}
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineIcon, { backgroundColor: getStatusColor() }]}>
          <Ionicons name={getStatusIcon()} size={24} color="#fff" />
        </View>
        {!isLast && <View style={[styles.timelineLine, { backgroundColor: getStatusColor() }]} />}
      </View>

      {/* Content */}
      <View style={styles.timelineContent}>
        <TouchableOpacity
          style={styles.stepHeader}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <View style={styles.stepHeaderLeft}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={12} color="#666" />
              <Text style={styles.durationText}>{step.duration}</Text>
            </View>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#999"
          />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.stepDetails}>
            <Text style={styles.stepDescription}>{step.description}</Text>

            {/* Details List */}
            <View style={styles.detailsList}>
              {step.details.map((detail: string, idx: number) => (
                <View key={idx} style={styles.detailItem}>
                  <Ionicons name="checkmark" size={16} color="#4caf50" />
                  <Text style={styles.detailText}>{detail}</Text>
                </View>
              ))}
            </View>

            {/* Documents */}
            {step.documents.length > 0 && (
              <View style={styles.documentsSection}>
                <Text style={styles.documentsTitle}>Tài liệu tham khảo:</Text>
                {step.documents.map((doc: any, idx: number) => (
                  <TouchableOpacity key={idx} style={styles.documentItem}>
                    <Ionicons name="document-text" size={20} color="#ee4d2d" />
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentName}>{doc.name}</Text>
                      <Text style={styles.documentSize}>{doc.size}</Text>
                    </View>
                    <Ionicons name="download-outline" size={20} color="#ee4d2d" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default function PermitScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleConsultation = () => {
    Linking.openURL('tel:1900xxxx');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Xin phép xây dựng',
          headerStyle: { backgroundColor: '#ee4d2d' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={styles.headerCard}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="document-text" size={32} color="#ee4d2d" />
          </View>
          <Text style={styles.headerTitle}>Quy trình xin giấy phép xây dựng</Text>
          <Text style={styles.headerDescription}>
            Hướng dẫn chi tiết 4 bước để xin giấy phép xây dựng hợp pháp
          </Text>
        </View>

        {/* Permit Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại giấy phép</Text>
          <View style={styles.permitTypes}>
            {PERMIT_TYPES.map((type) => (
              <TouchableOpacity key={type.id} style={styles.permitTypeCard}>
                <View style={[styles.permitTypeIcon, { backgroundColor: `${type.color}20` }]}>
                  <Ionicons name={type.icon as any} size={24} color={type.color} />
                </View>
                <Text style={styles.permitTypeTitle}>{type.title}</Text>
                <Text style={styles.permitTypeDesc}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quy trình chi tiết</Text>
          <View style={styles.timeline}>
            {PERMIT_STEPS.map((step, index) => (
              <TimelineStep
                key={step.id}
                step={step}
                isLast={index === PERMIT_STEPS.length - 1}
              />
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
          <View style={styles.faqList}>
            {FAQ_ITEMS.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqItem}
                onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
              >
                <View style={styles.faqQuestion}>
                  <Ionicons name="help-circle" size={20} color="#2196f3" />
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Ionicons
                    name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#999"
                  />
                </View>
                {expandedFaq === faq.id && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Cần hỗ trợ tư vấn?</Text>
          <Text style={styles.ctaDescription}>
            Đội ngũ chuyên gia sẵn sàng tư vấn và hỗ trợ bạn hoàn thiện hồ sơ
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={handleConsultation}>
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.ctaButtonText}>Liên hệ tư vấn ngay</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  permitTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  permitTypeCard: {
    width: '48%',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  permitTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  permitTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  permitTypeDesc: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
  timeline: {
    paddingTop: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 8,
  },
  stepHeaderLeft: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  stepDetails: {
    marginTop: 12,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsList: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  documentsSection: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  documentsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 10,
  },
  documentName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  documentSize: {
    fontSize: 11,
    color: '#999',
  },
  faqList: {},
  faqItem: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    marginRight: 8,
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    marginLeft: 28,
    lineHeight: 20,
  },
  ctaSection: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});
