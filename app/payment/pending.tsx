/**
 * Payment Pending Screen
 * Hiển thị khi thanh toán đang chờ xử lý (chuyển khoản)
 */

import ModernButton from '@/components/ui/modern-button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
    Alert,
    Clipboard,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// Bank transfer info
const BANK_INFO = {
  bankName: 'Vietcombank',
  accountNumber: '1234567890',
  accountName: 'CONG TY TNHH XAY DUNG ABC',
  branch: 'Hồ Chí Minh',
};

export default function PaymentPendingScreen() {
  const params = useLocalSearchParams<{ orderId?: string; amount?: string }>();
  
  // Theme
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'tabIconDefault');
  const warningColor = '#f59e0b';
  
  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Đã sao chép', `${label} đã được sao chép vào clipboard`);
  };

  const formatAmount = (amount: string | undefined) => {
    if (!amount) return '0đ';
    return parseInt(amount).toLocaleString('vi-VN') + 'đ';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.content}>
        {/* Warning Icon */}
        <View style={[styles.iconContainer, { backgroundColor: warningColor }]}>
          <Ionicons name="time-outline" size={48} color="#fff" />
        </View>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Text style={[styles.title, { color: textColor }]}>
            Đang chờ thanh toán
          </Text>
          <Text style={[styles.subtitle, { color: secondaryText }]}>
            Vui lòng chuyển khoản theo thông tin bên dưới để hoàn tất đơn hàng
          </Text>
        </View>

        {/* Bank Info Card */}
        <View style={[styles.bankCard, { backgroundColor: cardColor }]}>
          <View style={styles.bankHeader}>
            <Ionicons name="business-outline" size={24} color={warningColor} />
            <Text style={[styles.bankName, { color: textColor }]}>
              {BANK_INFO.bankName}
            </Text>
          </View>

          {/* Account Number */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: secondaryText }]}>Số tài khoản:</Text>
            <View style={styles.infoValue}>
              <Text style={[styles.infoValueText, { color: textColor }]}>
                {BANK_INFO.accountNumber}
              </Text>
              <Ionicons
                name="copy-outline"
                size={18}
                color={secondaryText}
                onPress={() => copyToClipboard(BANK_INFO.accountNumber, 'Số tài khoản')}
                style={styles.copyIcon}
              />
            </View>
          </View>

          {/* Account Name */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: secondaryText }]}>Tên tài khoản:</Text>
            <Text style={[styles.infoValueText, { color: textColor }]}>
              {BANK_INFO.accountName}
            </Text>
          </View>

          {/* Branch */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: secondaryText }]}>Chi nhánh:</Text>
            <Text style={[styles.infoValueText, { color: textColor }]}>
              {BANK_INFO.branch}
            </Text>
          </View>

          {/* Transfer Content */}
          {params.orderId && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: secondaryText }]}>Nội dung CK:</Text>
              <View style={styles.infoValue}>
                <Text style={[styles.infoValueText, { color: textColor }]}>
                  {params.orderId}
                </Text>
                <Ionicons
                  name="copy-outline"
                  size={18}
                  color={secondaryText}
                  onPress={() => copyToClipboard(params.orderId || '', 'Nội dung CK')}
                  style={styles.copyIcon}
                />
              </View>
            </View>
          )}

          {/* Amount */}
          <View style={[styles.amountRow, { borderTopColor: '#e5e7eb' }]}>
            <Text style={[styles.amountLabel, { color: textColor }]}>Số tiền:</Text>
            <Text style={[styles.amountValue, { color: warningColor }]}>
              {formatAmount(params.amount)}
            </Text>
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <Ionicons name="information-circle-outline" size={20} color={secondaryText} />
          <Text style={[styles.noteText, { color: secondaryText }]}>
            Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được thanh toán (thường trong vòng 24h làm việc)
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <ModernButton
            variant="primary"
            size="large"
            onPress={() => router.replace('/(tabs)')}
            icon="home-outline"
            iconPosition="left"
            fullWidth
          >
            Về trang chủ
          </ModernButton>

          <ModernButton
            variant="outline"
            size="large"
            onPress={() => router.push('/order')}
            icon="receipt-outline"
            iconPosition="left"
            fullWidth
            style={{ marginTop: 12 }}
          >
            Xem đơn hàng
          </ModernButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  bankCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  bankName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValueText: {
    fontSize: 14,
    fontWeight: '500',
  },
  copyIcon: {
    marginLeft: 8,
    padding: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 8,
  },
  actions: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
});
