import { Container } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePayment } from '@/hooks/usePayment';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PaymentDetailScreenProps {
  paymentId: string;
  onBack?: () => void;
}

export default function PaymentDetailScreen({ paymentId, onBack }: PaymentDetailScreenProps) {
  const { payment, loading, error, refetch, confirmPayment, confirming } = usePayment(paymentId);
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'canceled': return '#FF9800';
      default: return '#2196F3';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'failed': return 'Thất bại';
      case 'canceled': return 'Đã hủy';
      case 'pending': return 'Đang chờ';
      default: return status;
    }
  };

  const handleConfirmPayment = async () => {
    await confirmPayment({ status: 'paid', meta: { confirmed_at: new Date().toISOString() } });
  };

  if (loading) {
    return (
      <Container style={styles.container}>
        <Text style={[styles.loading, { color: textColor }]}>Đang tải...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={styles.container}>
        <View style={styles.error}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  if (!payment) {
    return (
      <Container style={styles.container}>
        <Text style={[styles.notFound, { color: textColor }]}>Không tìm thấy giao dịch</Text>
      </Container>
    );
  }

  return (
    <Container style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, { color: textColor }]}>Chi tiết giao dịch</Text>
        </View>

        {/* Payment Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Thông tin thanh toán</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
              <Text style={styles.statusText}>{getStatusText(payment.status)}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: textColor + 'B0' }]}>ID giao dịch</Text>
              <Text style={[styles.infoValue, { color: textColor }]} selectable>
                {payment.id}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: textColor + 'B0' }]}>Mã đơn hàng</Text>
              <Text style={[styles.infoValue, { color: textColor }]} selectable>
                {payment.order_code}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: textColor + 'B0' }]}>Số tiền</Text>
              <Text style={[styles.infoValueAmount, { color: tintColor }]}>
                {payment.amount.toLocaleString()} {payment.currency}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: textColor + 'B0' }]}>Phương thức</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {payment.provider}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: textColor + 'B0' }]}>Ngày tạo</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {formatDate(payment.created_at)}
              </Text>
            </View>

            {payment.updated_at && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: textColor + 'B0' }]}>Cập nhật</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  {formatDate(payment.updated_at)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        {payment.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.confirmButton, confirming && styles.buttonDisabled]}
              onPress={handleConfirmPayment}
              disabled={confirming}
            >
              <Text style={styles.confirmButtonText}>
                {confirming ? 'Đang xác nhận...' : 'Xác nhận đã thanh toán'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Meta Info */}
        {payment.meta_json && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Thông tin bổ sung</Text>
            <Text style={[styles.metaText, { color: textColor + 'B0' }]}>
              {JSON.stringify(payment.meta_json, null, 2)}
            </Text>
          </View>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loading: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  notFound: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  error: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  errorText: {
    color: '#C62828',
    fontSize: 16,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  infoValueAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  actions: {
    marginVertical: 16,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 8,
  },
});
