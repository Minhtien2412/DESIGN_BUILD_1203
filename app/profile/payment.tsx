import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import * as React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'ewallet';
  name: string;
  details: string;
  isDefault: boolean;
  logo: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'payment' | 'refund';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function PaymentScreen() {
  const [loading, setLoading] = React.useState(false);
  const [walletBalance, setWalletBalance] = React.useState(2500000); // VND
  
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa',
      details: '**** **** **** 4532',
      isDefault: true,
      logo: 'card',
    },
    {
      id: '2',
      type: 'bank',
      name: 'Vietcombank',
      details: 'TK: 1234567890',
      isDefault: false,
      logo: 'business',
    },
    {
      id: '3',
      type: 'ewallet',
      name: 'MoMo',
      details: '0912345678',
      isDefault: false,
      logo: 'wallet',
    },
  ]);

  const [transactions, setTransactions] = React.useState<Transaction[]>([
    {
      id: '1',
      type: 'payment',
      amount: -500000,
      description: 'Thanh toán dự án #1234',
      date: '2025-02-09 14:30',
      status: 'completed',
    },
    {
      id: '2',
      type: 'deposit',
      amount: 1000000,
      description: 'Nạp tiền vào ví',
      date: '2025-02-08 10:15',
      status: 'completed',
    },
    {
      id: '3',
      type: 'refund',
      amount: 200000,
      description: 'Hoàn tiền dự án #1220',
      date: '2025-02-07 16:45',
      status: 'completed',
    },
    {
      id: '4',
      type: 'payment',
      amount: -300000,
      description: 'Thanh toán dịch vụ thiết kế',
      date: '2025-02-06 09:20',
      status: 'completed',
    },
    {
      id: '5',
      type: 'withdraw',
      amount: -100000,
      description: 'Rút tiền về tài khoản ngân hàng',
      date: '2025-02-05 11:00',
      status: 'pending',
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return 'arrow-down-circle';
      case 'withdraw': return 'arrow-up-circle';
      case 'payment': return 'card';
      case 'refund': return 'refresh-circle';
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return '#10B981';
      case 'withdraw': return '#EF4444';
      case 'payment': return '#F59E0B';
      case 'refund': return '#0891B2';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
    }
  };

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Đang xử lý';
      case 'failed': return 'Thất bại';
    }
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Thêm phương thức thanh toán',
      'Chọn loại thanh toán',
      [
        { text: 'Thẻ ngân hàng', onPress: () => router.push('/profile/payment/add-card' as any) },
        { text: 'Tài khoản ngân hàng', onPress: () => router.push('/profile/payment/add-bank' as any) },
        { text: 'Ví điện tử', onPress: () => router.push('/profile/payment/add-wallet' as any) },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === methodId,
    })));
    Alert.alert('Thành công', 'Đã đặt phương thức thanh toán mặc định');
  };

  const handleRemoveMethod = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method?.isDefault) {
      Alert.alert('Lỗi', 'Không thể xóa phương thức thanh toán mặc định');
      return;
    }
    
    Alert.alert(
      'Xóa phương thức thanh toán',
      'Bạn có chắc muốn xóa phương thức này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(paymentMethods.filter(m => m.id !== methodId));
          }
        }
      ]
    );
  };

  const handleDeposit = () => {
    Alert.prompt(
      'Nạp tiền vào ví',
      'Nhập số tiền muốn nạp (VND)',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Nạp',
          onPress: (value?: string) => {
            const amount = parseInt(value || '0');
            if (amount > 0) {
              setWalletBalance(walletBalance + amount);
              Alert.alert('Thành công', `Đã nạp ${formatCurrency(amount)}`);
            }
          }
        }
      ],
      'plain-text',
      '',
      'number-pad'
    );
  };

  const handleWithdraw = () => {
    Alert.prompt(
      'Rút tiền từ ví',
      `Số dư hiện tại: ${formatCurrency(walletBalance)}`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Rút',
          onPress: (value?: string) => {
            const amount = parseInt(value || '0');
            if (amount > walletBalance) {
              Alert.alert('Lỗi', 'Số dư không đủ');
            } else if (amount > 0) {
              setWalletBalance(walletBalance - amount);
              Alert.alert('Thành công', `Đã rút ${formatCurrency(amount)}`);
            }
          }
        }
      ],
      'plain-text',
      '',
      'number-pad'
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen 
        options={{ 
          title: 'Thanh toán',
          headerBackTitle: 'Quay lại',
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Wallet Balance Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIconContainer}>
              <Ionicons name="wallet" size={32} color="#fff" />
            </View>
            <Text style={styles.walletLabel}>Số dư ví</Text>
          </View>
          <Text style={styles.walletBalance}>{formatCurrency(walletBalance)}</Text>
          <View style={styles.walletActions}>
            <TouchableOpacity style={styles.walletButton} onPress={handleDeposit}>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.walletButtonText}>Nạp tiền</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.walletButton, styles.walletButtonSecondary]} onPress={handleWithdraw}>
              <Ionicons name="arrow-up-circle-outline" size={20} color="#0891B2" />
              <Text style={[styles.walletButtonText, styles.walletButtonTextSecondary]}>Rút tiền</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={24} color="#0891B2" />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          
          <View style={styles.card}>
            {paymentMethods.map((method, index) => (
              <React.Fragment key={method.id}>
                <View style={styles.methodItem}>
                  <View style={styles.methodIcon}>
                    <Ionicons name={method.logo as any} size={24} color="#6B7280" />
                  </View>
                  <View style={styles.methodInfo}>
                    <View style={styles.methodHeader}>
                      <Text style={styles.methodName}>{method.name}</Text>
                      {method.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Mặc định</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.methodDetails}>{method.details}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => {
                      Alert.alert(
                        'Quản lý phương thức',
                        method.name,
                        [
                          !method.isDefault && { text: 'Đặt làm mặc định', onPress: () => handleSetDefault(method.id) },
                          { text: 'Xóa', onPress: () => handleRemoveMethod(method.id), style: 'destructive' },
                          { text: 'Hủy', style: 'cancel' }
                        ].filter(Boolean) as any[]
                      );
                    }}
                  >
                    <Ionicons name="ellipsis-horizontal" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                {index < paymentMethods.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
            
            <TouchableOpacity 
              style={styles.addMethodButton}
              onPress={handleAddPaymentMethod}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={24} color="#0891B2" />
              <Text style={styles.addMethodText}>Thêm phương thức mới</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
          </View>
          
          <View style={styles.card}>
            {transactions.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                <TouchableOpacity 
                  style={styles.transactionItem}
                  onPress={() => {
                    Alert.alert(
                      'Chi tiết giao dịch',
                      `Mã GD: ${transaction.id}\n${transaction.description}\n\nThời gian: ${transaction.date}\nTrạng thái: ${getStatusText(transaction.status)}`,
                      [{ text: 'Đóng' }]
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.transactionIcon, { backgroundColor: getTransactionColor(transaction.type) + '20' }]}>
                    <Ionicons 
                      name={getTransactionIcon(transaction.type) as any} 
                      size={24} 
                      color={getTransactionColor(transaction.type)} 
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                    <View style={styles.transactionMeta}>
                      <Text style={styles.transactionDate}>{transaction.date}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                          {getStatusText(transaction.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text 
                    style={[
                      styles.transactionAmount,
                      { color: transaction.amount > 0 ? '#10B981' : '#EF4444' }
                    ]}
                  >
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </Text>
                </TouchableOpacity>
                {index < transactions.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.securityTitle}>Thanh toán an toàn</Text>
          </View>
          <Text style={styles.securityText}>
            Mọi giao dịch được bảo mật với tiêu chuẩn quốc tế PCI DSS. 
            Thông tin thanh toán của bạn luôn được mã hóa và bảo vệ.
          </Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  walletCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#0891B2',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  walletIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  walletBalance: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 12,
  },
  walletButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  walletButtonSecondary: {
    backgroundColor: '#fff',
  },
  walletButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  walletButtonTextSecondary: {
    color: '#0891B2',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  defaultBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  methodDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 76,
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  addMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0891B2',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  securityCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#047857',
  },
  securityText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
});
