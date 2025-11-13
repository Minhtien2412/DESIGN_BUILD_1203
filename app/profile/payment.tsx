import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'ewallet';
  name: string;
  details: string;
  isDefault: boolean;
  logo: string;
  brand?: 'visa' | 'mastercard' | 'momo' | 'zalopay';
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'payment' | 'refund';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const { width } = Dimensions.get('window');

export default function PaymentScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(2500000);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa',
      details: '**** **** **** 4532',
      isDefault: true,
      logo: 'card',
      brand: 'visa',
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
      brand: 'momo',
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
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
    {
      id: '6',
      type: 'payment',
      amount: -150000,
      description: 'Thanh toán phí dịch vụ',
      date: '2025-02-04 15:30',
      status: 'failed',
    },
  ]);

  // Mock 7-day balance history for chart
  const balanceHistory = [
    { day: 'T2', amount: 2200000 },
    { day: 'T3', amount: 2400000 },
    { day: 'T4', amount: 2100000 },
    { day: 'T5', amount: 2600000 },
    { day: 'T6', amount: 2300000 },
    { day: 'T7', amount: 2700000 },
    { day: 'CN', amount: 2500000 },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

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

  const getTypeText = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return 'Nạp tiền';
      case 'withdraw': return 'Rút tiền';
      case 'payment': return 'Thanh toán';
      case 'refund': return 'Hoàn tiền';
    }
  };

  const getBrandColor = (brand?: string) => {
    switch (brand) {
      case 'visa': return '#1A1F71';
      case 'mastercard': return '#EB001B';
      case 'momo': return '#A50064';
      case 'zalopay': return '#008FE5';
      default: return '#6B7280';
    }
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Thêm phương thức thanh toán',
      'Chọn loại thanh toán',
      [
        { text: 'Thẻ ngân hàng', onPress: () => {} },
        { text: 'Tài khoản ngân hàng', onPress: () => {} },
        { text: 'Ví điện tử', onPress: () => {} },
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

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesType = selectedTypeFilter === 'all' || t.type === selectedTypeFilter;
    const matchesStatus = selectedStatusFilter === 'all' || t.status === selectedStatusFilter;
    return matchesType && matchesStatus;
  });

  // Calculate stats
  const maxBalance = Math.max(...balanceHistory.map(h => h.amount));
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen 
        options={{ 
          title: 'Thanh toán',
          headerBackTitle: 'Quay lại',
        }} 
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Wallet Balance Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIconContainer}>
              <Ionicons name="wallet" size={32} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.walletLabel}>Số dư ví</Text>
              <Text style={styles.walletBalance}>{formatCurrency(walletBalance)}</Text>
            </View>
          </View>
          
          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="arrow-down" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statLabel}>Thu nhập</Text>
              <Text style={styles.statValue}>{formatCurrency(totalIncome)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="arrow-up" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statLabel}>Chi tiêu</Text>
              <Text style={styles.statValue}>{formatCurrency(totalExpense)}</Text>
            </View>
          </View>

          {/* Balance Chart (Simple) */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Biến động số dư (7 ngày)</Text>
            <View style={styles.chart}>
              {balanceHistory.map((item, index) => {
                const height = (item.amount / maxBalance) * 60;
                return (
                  <View key={index} style={styles.chartBar}>
                    <View style={[styles.chartBarFill, { height }]} />
                    <Text style={styles.chartLabel}>{item.day}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleDeposit}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="add-circle" size={28} color="#3B82F6" />
            </View>
            <Text style={styles.quickActionText}>Nạp tiền</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={handleWithdraw}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="arrow-up-circle" size={28} color="#EF4444" />
            </View>
            <Text style={styles.quickActionText}>Rút tiền</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="receipt" size={28} color="#10B981" />
            </View>
            <Text style={styles.quickActionText}>Lịch sử</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="settings" size={28} color="#F59E0B" />
            </View>
            <Text style={styles.quickActionText}>Cài đặt</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={24} color="#0891B2" />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          
          <View style={styles.card}>
            {paymentMethods.map((method, index) => (
              <View key={method.id}>
                <View style={styles.methodItem}>
                  <View style={[styles.methodIcon, method.brand && { 
                    backgroundColor: getBrandColor(method.brand) + '20',
                    borderWidth: 2,
                    borderColor: getBrandColor(method.brand),
                  }]}>
                    <Ionicons 
                      name={method.logo as any} 
                      size={24} 
                      color={method.brand ? getBrandColor(method.brand) : '#6B7280'} 
                    />
                  </View>
                  <View style={styles.methodInfo}>
                    <View style={styles.methodHeader}>
                      <Text style={styles.methodName}>{method.name}</Text>
                      {method.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Ionicons name="checkmark-circle" size={12} color="#1E40AF" />
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
              </View>
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

        {/* Transaction History with Filters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
          </View>

          {/* Type Filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[styles.filterChip, selectedTypeFilter === 'all' && styles.filterChipActive]}
              onPress={() => setSelectedTypeFilter('all')}
            >
              <Text style={[styles.filterText, selectedTypeFilter === 'all' && styles.filterTextActive]}>
                Tất cả
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedTypeFilter === 'deposit' && styles.filterChipActive]}
              onPress={() => setSelectedTypeFilter('deposit')}
            >
              <Ionicons name="arrow-down-circle" size={16} color={selectedTypeFilter === 'deposit' ? '#FFFFFF' : '#10B981'} />
              <Text style={[styles.filterText, selectedTypeFilter === 'deposit' && styles.filterTextActive]}>
                Nạp tiền
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedTypeFilter === 'withdraw' && styles.filterChipActive]}
              onPress={() => setSelectedTypeFilter('withdraw')}
            >
              <Ionicons name="arrow-up-circle" size={16} color={selectedTypeFilter === 'withdraw' ? '#FFFFFF' : '#EF4444'} />
              <Text style={[styles.filterText, selectedTypeFilter === 'withdraw' && styles.filterTextActive]}>
                Rút tiền
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedTypeFilter === 'payment' && styles.filterChipActive]}
              onPress={() => setSelectedTypeFilter('payment')}
            >
              <Ionicons name="card" size={16} color={selectedTypeFilter === 'payment' ? '#FFFFFF' : '#F59E0B'} />
              <Text style={[styles.filterText, selectedTypeFilter === 'payment' && styles.filterTextActive]}>
                Thanh toán
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedTypeFilter === 'refund' && styles.filterChipActive]}
              onPress={() => setSelectedTypeFilter('refund')}
            >
              <Ionicons name="refresh-circle" size={16} color={selectedTypeFilter === 'refund' ? '#FFFFFF' : '#0891B2'} />
              <Text style={[styles.filterText, selectedTypeFilter === 'refund' && styles.filterTextActive]}>
                Hoàn tiền
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Status Filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[styles.filterChip, selectedStatusFilter === 'all' && styles.filterChipActive]}
              onPress={() => setSelectedStatusFilter('all')}
            >
              <Text style={[styles.filterText, selectedStatusFilter === 'all' && styles.filterTextActive]}>
                Tất cả
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedStatusFilter === 'completed' && styles.filterChipActive]}
              onPress={() => setSelectedStatusFilter('completed')}
            >
              <Ionicons name="checkmark-circle" size={16} color={selectedStatusFilter === 'completed' ? '#FFFFFF' : '#10B981'} />
              <Text style={[styles.filterText, selectedStatusFilter === 'completed' && styles.filterTextActive]}>
                Hoàn thành
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedStatusFilter === 'pending' && styles.filterChipActive]}
              onPress={() => setSelectedStatusFilter('pending')}
            >
              <Ionicons name="time" size={16} color={selectedStatusFilter === 'pending' ? '#FFFFFF' : '#F59E0B'} />
              <Text style={[styles.filterText, selectedStatusFilter === 'pending' && styles.filterTextActive]}>
                Đang xử lý
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedStatusFilter === 'failed' && styles.filterChipActive]}
              onPress={() => setSelectedStatusFilter('failed')}
            >
              <Ionicons name="close-circle" size={16} color={selectedStatusFilter === 'failed' ? '#FFFFFF' : '#EF4444'} />
              <Text style={[styles.filterText, selectedStatusFilter === 'failed' && styles.filterTextActive]}>
                Thất bại
              </Text>
            </TouchableOpacity>
          </ScrollView>
          
          {/* Transactions List */}
          <View style={styles.card}>
            {filteredTransactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Không có giao dịch</Text>
                <Text style={styles.emptySubtitle}>Chưa có giao dịch nào phù hợp với bộ lọc</Text>
              </View>
            ) : (
              <>
                {filteredTransactions.map((transaction, index) => (
                  <View key={transaction.id}>
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
                      <View style={styles.transactionRight}>
                        <Text 
                          style={[
                            styles.transactionAmount,
                            { color: transaction.amount > 0 ? '#10B981' : '#EF4444' }
                          ]}
                        >
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                      </View>
                    </TouchableOpacity>
                    {index < filteredTransactions.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </>
            )}
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
    marginBottom: 20,
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
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  chartContainer: {
    marginTop: 8,
  },
  chartTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    fontWeight: '600',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 4,
    marginBottom: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
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
  filterContainer: {
    marginBottom: 12,
  },
  filterContent: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#0891B2',
    borderColor: '#0891B2',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
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
  transactionRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 4,
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
