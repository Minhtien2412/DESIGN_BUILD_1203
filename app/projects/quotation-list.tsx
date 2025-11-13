import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert, Modal, ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Quotation {
  id: string;
  companyName: string;
  rating: number;
  capability: string; // label for capability action
  price: number;
  stars: number; // star rating visual
  pdfUrl?: string; // mock pdf url
  selected?: boolean; // UI state
}

const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: '1',
    companyName: 'Công ty A',
    rating: 5,
    capability: 'Năng lực',
    price: 100000,
    stars: 5,
    pdfUrl: 'https://example.com/a.pdf'
  },
  {
    id: '2',
    companyName: 'Công ty B',
    rating: 4,
    capability: 'Năng lực',
    price: 150000,
    stars: 4,
    pdfUrl: 'https://example.com/b.pdf'
  },
  {
    id: '3',
    companyName: 'Công ty C',
    rating: 4.5,
    capability: 'Năng lực',
    price: 200000,
    stars: 4.5,
    pdfUrl: 'https://example.com/c.pdf'
  },
];

export default function QuotationListScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({}, 'textMuted');
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceMuted = useThemeColor({}, 'surfaceMuted');
  const borderStrong = useThemeColor({}, 'borderStrong');
  const warningColor = useThemeColor({}, 'warning');
  const inverseText = useThemeColor({}, 'textInverse');

  const [quotations, setQuotations] = useState<Quotation[]>(MOCK_QUOTATIONS);
  const [preview, setPreview] = useState<{ visible: boolean; quotation?: Quotation }>({ visible: false });
  const [submitting, setSubmitting] = useState(false);

  const handleRandomize = () => {
    // Shuffle quotations
    const shuffled = [...quotations].sort(() => Math.random() - 0.5);
    setQuotations(shuffled);
  };

  const handleViewPDF = (quotation: Quotation) => {
    setPreview({ visible: true, quotation });
  };

  const toggleSelect = (qid: string) => {
    setQuotations(qs => qs.map(q => q.id === qid ? { ...q, selected: !q.selected } : q));
  };

  const selectedQuotations = quotations.filter(q => q.selected);

  const handleSubmitSelection = async () => {
    if (selectedQuotations.length === 0) {
      Alert.alert('Chưa chọn', 'Vui lòng chọn ít nhất một báo giá');
      return;
    }
    setSubmitting(true);
    try {
      // Fake API submit — replace with apiFetch('/quotations/accept', { method:'POST', body: JSON.stringify(...) })
      await new Promise(r => setTimeout(r, 800));
      Alert.alert('Thành công', `Đã chọn ${selectedQuotations.length} báo giá`);
      router.back();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể gửi lựa chọn. Thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`full-${i}`} name="star" size={16} color={warningColor} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color={warningColor} />
      );
    }

    return <View style={styles.starsRow}>{stars}</View>;
  };

  return (
    <Container style={{ backgroundColor }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Nhận báo giá
          </Text>
          <TouchableOpacity onPress={handleRandomize}>
            <View
              style={[
                styles.randomButton,
                { backgroundColor: primaryColor + '20', borderColor: primaryColor },
              ]}
            >
              <Text style={[styles.randomButtonText, { color: primaryColor }]}>
                Random Mới
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Table */}
  <View style={[styles.tableContainer, { borderColor: borderColor, backgroundColor: surfaceColor }]}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: surfaceMuted, borderBottomColor: borderStrong }]}>
            <Text style={[styles.tableHeaderCell, styles.colRating, { color: textColor }]}>
              Hạng
            </Text>
            <Text
              style={[
                styles.tableHeaderCell,
                styles.colCompany,
                { color: textColor },
              ]}
            >
              Tài khoản nhận việc
            </Text>
            <Text
              style={[
                styles.tableHeaderCell,
                styles.colCapability,
                { color: textColor },
              ]}
            >
              Năng lực
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice, { color: textColor }]}>
              Báo giá
            </Text>
          </View>

          {/* Table Rows */}
          {quotations.map((quotation, index) => (
            <View
              key={quotation.id}
              style={[
                styles.tableRow,
                {
                  backgroundColor:
                    index % 2 === 0 ? 'transparent' : surfaceMuted,
                  borderBottomWidth: 1,
                  borderBottomColor: borderColor,
                },
              ]}
            >
              {/* Rating Column */}
              <View style={[styles.tableCell, styles.colRating]}>
                {renderStars(quotation.stars)}
              </View>

              {/* Company Column */}
              <View style={[styles.tableCell, styles.colCompany]}>
                <TouchableOpacity onPress={() => toggleSelect(quotation.id)} style={{ flexDirection: 'row', alignItems:'center', gap:6 }}>
                  <Ionicons name={quotation.selected ? 'checkbox' : 'square-outline'} size={18} color={primaryColor} />
                  <Text style={[styles.cellText, { color: textColor, fontWeight: quotation.selected ? '600':'400' }]}>
                    {quotation.companyName}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Capability Column */}
              <View style={[styles.tableCell, styles.colCapability]}>
                <TouchableOpacity
                  onPress={() => handleViewPDF(quotation)}
                  style={styles.pdfButton}
                >
                  <Ionicons name="document-text" size={16} color={primaryColor} />
                  <Text style={[styles.pdfButtonText, { color: primaryColor }]}>
                    {quotation.capability}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Price Column */}
              <View style={[styles.tableCell, styles.colPrice]}>
                <Text style={[styles.cellText, styles.priceText, { color: textColor }]}>
                  {quotation.price.toLocaleString('vi-VN')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: surfaceMuted }]}
            onPress={() => router.back()}
          >
            <Text style={styles.actionButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: primaryColor, opacity: submitting ? 0.7 : 1 }]}
            disabled={submitting}
            onPress={handleSubmitSelection}
          >
            <Text style={[styles.actionButtonText, { color: inverseText }]}>
              {submitting ? 'Đang gửi...' : selectedQuotations.length ? `Chọn (${selectedQuotations.length})` : 'Chọn báo giá'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* PDF Preview Modal (mock) */}
      <Modal
        visible={preview.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreview({ visible: false })}
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Năng lực: {preview.quotation?.companyName}</Text>
              <TouchableOpacity onPress={() => setPreview({ visible: false })}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.previewBody}>
              <Ionicons name="document-text" size={48} color={primaryColor} />
              <Text style={styles.previewHint}>Giả lập xem PDF (URL)</Text>
              <Text style={styles.previewUrl} numberOfLines={2}>{preview.quotation?.pdfUrl}</Text>
              <Text style={styles.previewNote}>Tích hợp viewer thật: dùng WebView (pdf.js) hoặc chuyển sang backend tạo ảnh preview.</Text>
            </View>
            <View style={styles.previewFooter}>
              <TouchableOpacity style={styles.previewButton} onPress={() => {
                Alert.alert('Tải xuống', 'Giả lập tải PDF');
              }}>
                <Ionicons name="download" size={18} color="#fff" />
                <Text style={styles.previewButtonText}>Tải PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.previewButton, { backgroundColor: '#64748b' }]} onPress={() => setPreview({ visible: false })}>
                <Text style={styles.previewButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  randomButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  randomButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tableContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 48,
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 2,
    borderBottomColor: '#DDD',
  },
  tableHeaderCell: {
    padding: 12,
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableCell: {
    padding: 12,
    justifyContent: 'center',
  },
  colRating: {
    width: '15%',
  },
  colCompany: {
    width: '30%',
  },
  colCapability: {
    width: '25%',
  },
  colPrice: {
    width: '30%',
  },
  cellText: {
    fontSize: 14,
  },
  priceText: {
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pdfButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    flex: 1,
    marginRight: 12,
  },
  previewBody: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  previewHint: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  previewUrl: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },
  previewNote: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  previewFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0f766e',
    paddingVertical: 12,
    borderRadius: 10,
  },
  previewButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
