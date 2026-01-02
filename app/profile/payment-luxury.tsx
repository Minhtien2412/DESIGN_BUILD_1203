/**
 * Payment Methods Screen - Luxury Redesign
 * Card management with elegant design
 */

import { LuxuryBadge } from '@/components/ui/luxury-badge';
import { LuxuryButton } from '@/components/ui/luxury-button';
import { LuxuryCard } from '@/components/ui/luxury-card';
import { LuxuryModal } from '@/components/ui/luxury-modal';
import { SafeScrollView } from '@/components/ui/safe-area';
import { Animations } from '@/constants/animations';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    RefreshControl,
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
  brand?: 'visa' | 'mastercard' | 'momo' | 'zalopay';
}

export default function PaymentMethodsLuxury() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa',
      details: '**** **** **** 4532',
      isDefault: true,
      brand: 'visa',
    },
    {
      id: '2',
      type: 'bank',
      name: 'Vietcombank',
      details: 'TK: 1234567890',
      isDefault: false,
    },
    {
      id: '3',
      type: 'ewallet',
      name: 'MoMo',
      details: '0912345678',
      isDefault: false,
      brand: 'momo',
    },
  ]);

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Animations.timing.elegant,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 15,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods =>
      methods.map(m => ({ ...m, isDefault: m.id === id }))
    );
  };

  const handleDelete = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    Alert.alert(
      'Xóa phương thức',
      `Bạn có chắc muốn xóa ${method?.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(methods => methods.filter(m => m.id !== id));
          },
        },
      ]
    );
  };

  const getMethodIcon = (type: string, brand?: string) => {
    if (brand === 'visa') return 'card';
    if (brand === 'mastercard') return 'card';
    if (brand === 'momo') return 'wallet';
    if (brand === 'zalopay') return 'wallet';
    if (type === 'bank') return 'business';
    return 'card';
  };

  const getMethodColor = (type: string, brand?: string) => {
    if (brand === 'visa') return '#1A1F71';
    if (brand === 'mastercard') return '#EB001B';
    if (brand === 'momo') return '#A50064';
    if (brand === 'zalopay') return '#0068FF';
    if (type === 'bank') return Colors.light.primary;
    return Colors.light.accent;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Phương thức thanh toán',
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: Colors.light.surface,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />

      <SafeScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.accent}
            colors={[Colors.light.accent]}
          />
        }
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Header Card */}
          <LinearGradient
            colors={[Colors.light.primary, Colors.light.secondary]}
            style={styles.headerCard}
          >
            <View style={styles.headerContent}>
              <Ionicons name="wallet" size={48} color={Colors.light.accent} />
              <Text style={styles.headerTitle}>{paymentMethods.length} phương thức</Text>
              <Text style={styles.headerSubtitle}>Quản lý thanh toán của bạn</Text>
            </View>
          </LinearGradient>

          {/* Payment Methods List */}
          <View style={styles.listContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.goldBar} />
              <Text style={styles.sectionTitle}>Phương thức đã lưu</Text>
            </View>

            {paymentMethods.map((method, index) => {
              const color = getMethodColor(method.type, method.brand);
              return (
                <LuxuryCard key={method.id} style={styles.methodCard}>
                  <View style={styles.methodContent}>
                    <View style={[styles.methodIcon, { backgroundColor: color + '15' }]}>
                      <Ionicons
                        name={getMethodIcon(method.type, method.brand) as any}
                        size={28}
                        color={color}
                      />
                    </View>

                    <View style={styles.methodInfo}>
                      <View style={styles.methodHeader}>
                        <Text style={styles.methodName}>{method.name}</Text>
                        {method.isDefault && (
                          <LuxuryBadge
                            variant="text"
                            value="Mặc định"
                            size="small"
                            color="success"
                          />
                        )}
                      </View>
                      <Text style={styles.methodDetails}>{method.details}</Text>
                    </View>
                  </View>

                  <View style={styles.methodActions}>
                    {!method.isDefault && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(method.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="star-outline" size={20} color={Colors.light.accent} />
                        <Text style={styles.actionText}>Đặt mặc định</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(method.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
                      <Text style={[styles.actionText, styles.deleteText]}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </LuxuryCard>
              );
            })}
          </View>

          {/* Add Button */}
          <View style={styles.addButtonContainer}>
            <LuxuryButton
              variant="outline"
              size="large"
              icon="add-circle"
              onPress={() => setShowAddModal(true)}
              title="Thêm phương thức mới"
            />
          </View>

          {/* Info Card */}
          <LuxuryCard style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.light.success} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Bảo mật thông tin</Text>
              <Text style={styles.infoText}>
                Thông tin thanh toán được mã hóa và bảo mật theo tiêu chuẩn PCI DSS.
              </Text>
            </View>
          </LuxuryCard>

          <View style={{ height: 40 }} />
        </Animated.View>
      </SafeScrollView>

      {/* Add Payment Modal */}
      <LuxuryModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm phương thức thanh toán"
        size="large"
        footerActions={[
          {
            label: 'Hủy',
            variant: 'outline',
            onPress: () => setShowAddModal(false),
          },
          {
            label: 'Thêm',
            variant: 'primary',
            onPress: () => {
              setShowAddModal(false);
              Alert.alert('Thành công', 'Đã thêm phương thức thanh toán');
            },
          },
        ]}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.methodOption} activeOpacity={0.7}>
            <View style={[styles.optionIcon, { backgroundColor: Colors.light.primary + '15' }]}>
              <Ionicons name="card" size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Thẻ tín dụng/ghi nợ</Text>
              <Text style={styles.optionDesc}>Visa, Mastercard, JCB</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodOption} activeOpacity={0.7}>
            <View style={[styles.optionIcon, { backgroundColor: Colors.light.info + '15' }]}>
              <Ionicons name="business" size={24} color={Colors.light.info} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Tài khoản ngân hàng</Text>
              <Text style={styles.optionDesc}>Chuyển khoản trực tiếp</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodOption} activeOpacity={0.7}>
            <View style={[styles.optionIcon, { backgroundColor: Colors.light.accent + '15' }]}>
              <Ionicons name="wallet" size={24} color={Colors.light.accent} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Ví điện tử</Text>
              <Text style={styles.optionDesc}>MoMo, ZaloPay, VNPay</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
          </TouchableOpacity>
        </View>
      </LuxuryModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerCard: {
    margin: 16,
    borderRadius: 20,
    padding: 32,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.surface,
    letterSpacing: 0.5,
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.goldLight,
    letterSpacing: 0.3,
    marginTop: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  goldBar: {
    width: 4,
    height: 20,
    backgroundColor: Colors.light.accent,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  methodCard: {
    marginBottom: 12,
    padding: 16,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: 0.3,
  },
  methodDetails: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
  },
  methodActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.goldLight + '20',
  },
  deleteButton: {
    backgroundColor: Colors.light.error + '10',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.accent,
    letterSpacing: 0.3,
  },
  deleteText: {
    color: Colors.light.error,
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  modalContent: {
    gap: 12,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.light.textMuted,
    letterSpacing: 0.2,
  },
});
