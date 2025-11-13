import { useCart } from '@/context/cart-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
    AlertProvider,
    Button,
    Card,
    CardContent,
    Modal,
    SectionHeader,
    useAlert
} from '../../components/ui';
import { SpacingSemantic } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';

// ============================================
// ORDER REVIEW SCREEN
// ============================================

function OrderReviewContent() {
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');

  const params = useLocalSearchParams();
  const { items, totalPrice, clearCart } = useCart();
  const { showAlert } = useAlert();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Calculate totals
  const shippingCost = parseFloat(params.shippingCost as string) || 0;
  const finalTotal = totalPrice + shippingCost;

  // Get payment method label
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Cash on Delivery';
      case 'card':
        return `Card ending in ${params.cardNumber}`;
      case 'transfer':
        return 'Bank Transfer';
      default:
        return method;
    }
  };

  // Get shipping method label
  const getShippingMethodLabel = (method: string) => {
    switch (method) {
      case 'standard':
        return 'Standard Delivery (3-5 business days)';
      case 'express':
        return 'Express Delivery (1-2 business days)';
      default:
        return method;
    }
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      // Clear cart after successful order
      clearCart();

      setIsProcessing(false);

      // Generate random order number
      const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

      // Navigate to success screen
      router.replace({
        pathname: '/checkout/success',
        params: {
          orderNumber,
          total: finalTotal.toFixed(2),
        },
      });
    }, 2000);
  };

  if (items.length === 0) {
    router.replace('/shopping/cart');
    return null;
  }

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: background }]}>
        <View style={styles.content}>
          {/* Delivery Address */}
          <Card variant="elevated">
            <CardContent>
              <SectionHeader title="Delivery Address" />
              {params.addressId === 'new' ? (
                <View>
                  <Text style={[TextVariants.h3, { color: text }]}>{params.fullName}</Text>
                  <Text style={[TextVariants.body2, { color: textMuted, marginTop: SpacingSemantic.xs }]}>
                    {params.phone}
                  </Text>
                  <Text style={[TextVariants.body2, { color: textMuted, marginTop: SpacingSemantic.xs }]}>
                    {params.address}, {params.city}, {params.state} {params.zipCode}
                  </Text>
                </View>
              ) : (
                <Text style={[TextVariants.body1, { color: text }]}>
                  {params.addressId === '1' ? 'Home - 123 Main St, City, 12345' : 'Work - 456 Office Blvd, City, 67890'}
                </Text>
              )}
            </CardContent>
          </Card>

          {/* Shipping Method */}
          <Card variant="elevated" style={{ marginTop: SpacingSemantic.md }}>
            <CardContent>
              <SectionHeader title="Shipping Method" />
              <Text style={[TextVariants.body1, { color: text }]}>
                {getShippingMethodLabel(params.shippingMethod as string)}
              </Text>
              <Text style={[TextVariants.body2, { color: textMuted, marginTop: SpacingSemantic.xs }]}>
                {shippingCost === 0 ? 'FREE Shipping' : `Shipping cost: $${shippingCost.toFixed(2)}`}
              </Text>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card variant="elevated" style={{ marginTop: SpacingSemantic.md }}>
            <CardContent>
              <SectionHeader title="Payment Method" />
              <View style={styles.paymentRow}>
                <Ionicons
                  name={
                    params.paymentMethod === 'cash'
                      ? 'cash-outline'
                      : params.paymentMethod === 'card'
                      ? 'card-outline'
                      : 'business-outline'
                  }
                  size={24}
                  color={primary}
                />
                <Text style={[TextVariants.body1, { color: text, marginLeft: SpacingSemantic.sm }]}>
                  {getPaymentMethodLabel(params.paymentMethod as string)}
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card variant="elevated" style={{ marginTop: SpacingSemantic.md }}>
            <CardContent>
              <SectionHeader title={`Order Items (${items.length})`} />
              {items.map((item: any, index: number) => {
                const price = parseFloat(item.product.price.replace(/[^0-9.]/g, ''));
                const totalPrice = (price * item.quantity).toFixed(2);

                return (
                  <View key={item.id}>
                    <View style={styles.orderItemRow}>
                      <Image source={item.product.image} style={styles.orderItemImage} resizeMode="contain" />
                      <View style={styles.orderItemInfo}>
                        <Text style={[TextVariants.body1, { color: text }]} numberOfLines={2}>
                          {item.product.name}
                        </Text>
                        {(item.selectedSize || item.selectedColor) && (
                          <View style={styles.variantsRow}>
                            {item.selectedSize && (
                              <Text style={[TextVariants.caption, { color: textMuted }]}>Size: {item.selectedSize}</Text>
                            )}
                            {item.selectedColor && (
                              <Text style={[TextVariants.caption, { color: textMuted }]}>
                                {item.selectedSize && ' • '}Color: {item.selectedColor}
                              </Text>
                            )}
                          </View>
                        )}
                        <View style={styles.priceQtyRow}>
                          <Text style={[TextVariants.body2, { color: textMuted }]}>Qty: {item.quantity}</Text>
                          <Text style={[TextVariants.h3, { color: text }]}>${totalPrice}</Text>
                        </View>
                      </View>
                    </View>
                    {index < items.length - 1 && <View style={[styles.divider, { backgroundColor: border }]} />}
                  </View>
                );
              })}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card variant="outlined" style={{ marginTop: SpacingSemantic.md }}>
            <CardContent>
              <SectionHeader title="Order Summary" />
              <View style={styles.summaryRow}>
                <Text style={[TextVariants.body1, { color: textMuted }]}>Subtotal</Text>
                <Text style={[TextVariants.body1, { color: text }]}>${totalPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[TextVariants.body1, { color: textMuted }]}>Shipping</Text>
                <Text style={[TextVariants.body1, { color: text }]}>
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: border }]} />
              <View style={styles.summaryRow}>
                <Text style={[TextVariants.h3, { color: text }]}>Total Amount</Text>
                <Text style={[TextVariants.h2, { color: primary }]}>${finalTotal.toFixed(2)}</Text>
              </View>
            </CardContent>
          </Card>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomActions, { backgroundColor: background, borderTopColor: border }]}>
        <Button
          title={isProcessing ? 'Processing Order...' : 'Place Order'}
          onPress={() => setShowConfirmModal(true)}
          loading={isProcessing}
          disabled={isProcessing}
        />
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Order" size="sm">
        <Text style={[TextVariants.body1, { color: text, marginBottom: SpacingSemantic.md }]}>
          Are you sure you want to place this order?
        </Text>
        <View style={styles.confirmSummary}>
          <Text style={[TextVariants.h3, { color: text }]}>Total Amount: ${finalTotal.toFixed(2)}</Text>
          <Text style={[TextVariants.body2, { color: textMuted, marginTop: SpacingSemantic.xs }]}>
            Payment: {getPaymentMethodLabel(params.paymentMethod as string)}
          </Text>
        </View>
        <View style={styles.modalActions}>
          <Button
            title="Cancel"
            onPress={() => setShowConfirmModal(false)}
            variant="ghost"
            style={{ flex: 1 }}
            disabled={isProcessing}
          />
          <Button title="Confirm" onPress={handlePlaceOrder} style={{ flex: 1 }} loading={isProcessing} />
        </View>
      </Modal>
    </>
  );
}

// ============================================
// ROOT COMPONENT
// ============================================

export default function OrderReviewScreen() {
  return (
    <AlertProvider>
      <Stack.Screen
        options={{
          title: 'Order Review',
          headerShown: true,
        }}
      />
      <OrderReviewContent />
    </AlertProvider>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SpacingSemantic.md,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderItemRow: {
    flexDirection: 'row',
    gap: SpacingSemantic.sm,
    paddingVertical: SpacingSemantic.sm,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  orderItemInfo: {
    flex: 1,
    gap: SpacingSemantic.xs,
  },
  variantsRow: {
    flexDirection: 'row',
  },
  priceQtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SpacingSemantic.sm,
  },
  divider: {
    height: 1,
    marginVertical: SpacingSemantic.sm,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SpacingSemantic.md,
    borderTopWidth: 1,
  },
  confirmSummary: {
    backgroundColor: '#F3F4F6',
    padding: SpacingSemantic.md,
    borderRadius: 8,
    marginBottom: SpacingSemantic.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SpacingSemantic.md,
  },
});
