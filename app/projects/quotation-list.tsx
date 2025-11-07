import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Quotation {
  id: string;
  companyName: string;
  rating: number;
  capability: string;
  price: number;
  stars: number;
}

const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: '1',
    companyName: 'Công ty A',
    rating: 5,
    capability: 'Xem PDF',
    price: 100000,
    stars: 5,
  },
  {
    id: '2',
    companyName: 'Công ty B',
    rating: 4,
    capability: 'Xem PDF',
    price: 150000,
    stars: 4,
  },
  {
    id: '3',
    companyName: 'Công ty C',
    rating: 4.5,
    capability: 'Xem PDF',
    price: 200000,
    stars: 4.5,
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

  const handleRandomize = () => {
    // Shuffle quotations
    const shuffled = [...quotations].sort(() => Math.random() - 0.5);
    setQuotations(shuffled);
  };

  const handleViewPDF = (quotation: Quotation) => {
    // TODO: Open PDF viewer
    alert(`Xem năng lực của ${quotation.companyName}`);
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
                <Text style={[styles.cellText, { color: textColor }]}>
                  {quotation.companyName}
                </Text>
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
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            onPress={() => {
              // TODO: Submit selected quotation
              alert('Chọn báo giá thành công');
              router.back();
            }}
          >
            <Text style={[styles.actionButtonText, { color: inverseText }]}>
              Chọn báo giá
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
});
