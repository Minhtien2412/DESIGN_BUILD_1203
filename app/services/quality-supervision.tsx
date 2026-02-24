import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Package data
const PACKAGES = [
  {
    id: 'basic',
    name: 'Cơ bản',
    price: '15.000.000₫',
    priceUnit: '/ dự án',
    color: '#0D9488',
    popular: false,
    features: [
      { included: true, text: 'Giám sát 2 lần/tuần' },
      { included: true, text: 'Báo cáo tiến độ hàng tuần' },
      { included: true, text: 'Kiểm tra chất lượng vật liệu' },
      { included: true, text: 'Hỗ trợ qua điện thoại' },
      { included: false, text: 'Kiểm tra kỹ thuật chuyên sâu' },
      { included: false, text: 'Báo cáo ảnh/video chi tiết' },
      { included: false, text: 'Đội ngũ giám sát chuyên nghiệp' },
      { included: false, text: 'Bảo hành sau nghiệm thu' },
    ],
    description: 'Phù hợp với dự án nhỏ, nhà ở riêng lẻ dưới 100m²',
  },
  {
    id: 'standard',
    name: 'Tiêu chuẩn',
    price: '30.000.000₫',
    priceUnit: '/ dự án',
    color: Colors.light.primary,
    popular: true,
    features: [
      { included: true, text: 'Giám sát 3-4 lần/tuần' },
      { included: true, text: 'Báo cáo tiến độ 2 lần/tuần' },
      { included: true, text: 'Kiểm tra chất lượng vật liệu' },
      { included: true, text: 'Hỗ trợ 24/7' },
      { included: true, text: 'Kiểm tra kỹ thuật chuyên sâu' },
      { included: true, text: 'Báo cáo ảnh/video chi tiết' },
      { included: false, text: 'Đội ngũ giám sát chuyên nghiệp' },
      { included: false, text: 'Bảo hành sau nghiệm thu' },
    ],
    description: 'Phù hợp với nhà phố, biệt thự 100-300m²',
  },
  {
    id: 'premium',
    name: 'Cao cấp',
    price: '50.000.000₫',
    priceUnit: '/ dự án',
    color: '#0D9488',
    popular: false,
    features: [
      { included: true, text: 'Giám sát toàn thời gian' },
      { included: true, text: 'Báo cáo tiến độ hàng ngày' },
      { included: true, text: 'Kiểm tra chất lượng vật liệu' },
      { included: true, text: 'Hỗ trợ 24/7' },
      { included: true, text: 'Kiểm tra kỹ thuật chuyên sâu' },
      { included: true, text: 'Báo cáo ảnh/video chi tiết' },
      { included: true, text: 'Đội ngũ giám sát chuyên nghiệp' },
      { included: true, text: 'Bảo hành sau nghiệm thu 12 tháng' },
    ],
    description: 'Phù hợp với biệt thự cao cấp, công trình lớn trên 300m²',
  },
];

interface PackageCardProps {
  package: any;
  onSelect: () => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ package: pkg, onSelect }) => {
  return (
    <View style={[styles.packageCard, pkg.popular && styles.packageCardPopular]}>
      {pkg.popular && (
        <View style={styles.popularBadge}>
          <Ionicons name="star" size={12} color="#fff" />
          <Text style={styles.popularText}>Phổ biến nhất</Text>
        </View>
      )}

      {/* Header */}
      <View style={[styles.packageHeader, { backgroundColor: pkg.color }]}>
        <Text style={styles.packageName}>{pkg.name}</Text>
        <Text style={styles.packagePrice}>{pkg.price}</Text>
        <Text style={styles.packagePriceUnit}>{pkg.priceUnit}</Text>
      </View>

      {/* Description */}
      <View style={styles.packageBody}>
        <Text style={styles.packageDescription}>{pkg.description}</Text>

        {/* Features List */}
        <View style={styles.featuresList}>
          {pkg.features.map((feature: any, index: number) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name={feature.included ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={feature.included ? '#0D9488' : '#e0e0e0'}
              />
              <Text
                style={[
                  styles.featureText,
                  !feature.included && styles.featureTextDisabled,
                ]}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Select Button */}
        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: pkg.color }]}
          onPress={onSelect}
        >
          <Text style={styles.selectButtonText}>Chọn gói này</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function QualitySupervisionScreen() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    area: '',
    startDate: '',
    notes: '',
  });

  const handleSelectPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setShowBookingModal(true);
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.phone || !formData.address) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Submit logic here
    Alert.alert(
      'Đăng ký thành công',
      'Chúng tôi sẽ liên hệ với bạn trong vòng 24h để xác nhận thông tin.',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowBookingModal(false);
            setFormData({
              name: '',
              phone: '',
              email: '',
              address: '',
              area: '',
              startDate: '',
              notes: '',
            });
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Giám sát chất lượng',
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIcon}>
              <Ionicons name="shield-checkmark" size={48} color={Colors.light.primary} />
            </View>
            <Text style={styles.heroTitle}>Dịch vụ giám sát thi công</Text>
            <Text style={styles.heroSubtitle}>
              Đảm bảo chất lượng công trình từ móng đến hoàn thiện
            </Text>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Lợi ích khi sử dụng dịch vụ</Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="checkmark-done" size={24} color={Colors.light.success} />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Chất lượng đảm bảo</Text>
                  <Text style={styles.benefitDesc}>
                    Kiểm tra kỹ lưỡng từng công đoạn, phát hiện sớm sai sót
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="time" size={24} color={Colors.light.info} />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Tiết kiệm thời gian</Text>
                  <Text style={styles.benefitDesc}>
                    Tránh các rủi ro phải sửa chữa, làm lại tốn thời gian
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="cash" size={24} color="#0D9488" />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Tiết kiệm chi phí</Text>
                  <Text style={styles.benefitDesc}>
                    Tránh lãng phí vật liệu, chi phí sửa chữa không đúng quy cách
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="document-text" size={24} color="#0D9488" />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Báo cáo minh bạch</Text>
                  <Text style={styles.benefitDesc}>
                    Cập nhật tiến độ định kỳ với ảnh, video chi tiết
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Packages Section */}
          <View style={styles.packagesSection}>
            <Text style={styles.sectionTitle}>Chọn gói phù hợp</Text>
            
            {PACKAGES.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onSelect={() => handleSelectPackage(pkg)}
              />
            ))}
          </View>

          {/* Comparison Table */}
          <View style={styles.comparisonSection}>
            <Text style={styles.sectionTitle}>So sánh chi tiết</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.comparisonTable}>
                {/* Header Row */}
                <View style={styles.comparisonRow}>
                  <View style={[styles.comparisonCell, styles.comparisonHeaderCell]}>
                    <Text style={styles.comparisonHeaderText}>Tính năng</Text>
                  </View>
                  {PACKAGES.map((pkg) => (
                    <View
                      key={pkg.id}
                      style={[styles.comparisonCell, styles.comparisonHeaderCell]}
                    >
                      <Text style={styles.comparisonHeaderText}>{pkg.name}</Text>
                    </View>
                  ))}
                </View>

                {/* Feature Rows */}
                {PACKAGES[0].features.map((feature: any, index: number) => (
                  <View key={index} style={styles.comparisonRow}>
                    <View style={styles.comparisonCell}>
                      <Text style={styles.comparisonFeatureText}>{feature.text}</Text>
                    </View>
                    {PACKAGES.map((pkg) => (
                      <View key={pkg.id} style={styles.comparisonCell}>
                        <Ionicons
                          name={
                            pkg.features[index].included
                              ? 'checkmark-circle'
                              : 'close-circle'
                          }
                          size={20}
                          color={pkg.features[index].included ? '#0D9488' : '#e0e0e0'}
                        />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* FAQ Section */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>
                Thời gian giám sát một dự án là bao lâu?
              </Text>
              <Text style={styles.faqAnswer}>
                Thời gian giám sát phụ thuộc vào quy mô công trình, thường từ 3-6 tháng
                cho nhà ở riêng lẻ.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>
                Có thể thay đổi gói dịch vụ giữa chừng không?
              </Text>
              <Text style={styles.faqAnswer}>
                Có thể nâng cấp gói dịch vụ bất cứ lúc nào, bạn chỉ cần thanh toán
                phần chênh lệch.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>
                Giám sát viên có kinh nghiệm như thế nào?
              </Text>
              <Text style={styles.faqAnswer}>
                Tất cả giám sát viên đều là kỹ sư xây dựng có tối thiểu 5 năm kinh
                nghiệm và được đào tạo chuyên sâu.
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* CTA Footer */}
        <View style={styles.ctaFooter}>
          <View style={styles.ctaInfo}>
            <Text style={styles.ctaText}>Tư vấn miễn phí</Text>
            <Text style={styles.ctaSubtext}>Hotline: 1900 123 456</Text>
          </View>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => {
              setSelectedPackage(PACKAGES[1]); // Default to Standard
              setShowBookingModal(true);
            }}
          >
            <Text style={styles.ctaButtonText}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đăng ký dịch vụ</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Selected Package Info */}
              {selectedPackage && (
                <View style={styles.selectedPackageInfo}>
                  <Text style={styles.selectedPackageLabel}>Gói đã chọn:</Text>
                  <View style={styles.selectedPackageCard}>
                    <Text style={styles.selectedPackageName}>{selectedPackage.name}</Text>
                    <Text style={styles.selectedPackagePrice}>
                      {selectedPackage.price}
                    </Text>
                  </View>
                </View>
              )}

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Họ và tên <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Số điện thoại <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0901234567"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Email</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="email@example.com"
                    keyboardType="email-address"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Địa chỉ công trình <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    placeholder="Địa chỉ đầy đủ"
                    multiline
                    numberOfLines={3}
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Diện tích (m²)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="100"
                    keyboardType="numeric"
                    value={formData.area}
                    onChangeText={(text) => setFormData({ ...formData, area: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Ngày dự kiến khởi công</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="DD/MM/YYYY"
                    value={formData.startDate}
                    onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Ghi chú</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    placeholder="Yêu cầu hoặc ghi chú thêm..."
                    multiline
                    numberOfLines={4}
                    value={formData.notes}
                    onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Gửi đăng ký</Text>
              </TouchableOpacity>

              <Text style={styles.formNote}>
                * Thông tin của bạn sẽ được bảo mật tuyệt đối
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.chipBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  benefitsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    gap: 12,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  packagesSection: {
    padding: 16,
    marginTop: 12,
  },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  packageCardPopular: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
    gap: 4,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  packageHeader: {
    padding: 20,
    alignItems: 'center',
  },
  packageName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  packagePriceUnit: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  packageBody: {
    padding: 20,
  },
  packageDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  featureTextDisabled: {
    color: '#ccc',
  },
  selectButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  comparisonSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  comparisonTable: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  comparisonCell: {
    width: 120,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonHeaderCell: {
    backgroundColor: '#f5f5f5',
  },
  comparisonHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  comparisonFeatureText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  faqSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  ctaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ctaInfo: {},
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ctaSubtext: {
    fontSize: 12,
    color: Colors.light.primary,
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  selectedPackageInfo: {
    marginBottom: 20,
  },
  selectedPackageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  selectedPackageCard: {
    backgroundColor: '#fff5f0',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedPackageName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  selectedPackagePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  form: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: Colors.light.primary,
  },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  formNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
});
