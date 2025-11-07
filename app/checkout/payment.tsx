import { useCart } from '@/context/cart-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
    AlertProvider,
    Badge,
    Button,
    Card,
    CardContent,
    Input,
    RadioGroup,
    SectionHeader,
    useAlert,
} from '../../components/ui';
import { SpacingSemantic } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';

// ============================================
// PAYMENT METHOD SCREEN
// ============================================

function PaymentMethodContent() {
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');

  const params = useLocalSearchParams();
  const { items, totalPrice } = useCart();
  const { showAlert } = useAlert();

  // Payment methods
  const paymentMethods = [
    {
      value: 'cash',
      label: 'Cash on Delivery',
      description: 'Pay when you receive the order',
    },
    {
      value: 'card',
      label: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express',
    },
    {
      value: 'transfer',
      label: 'Bank Transfer',
      description: 'Direct bank transfer',
    },
  ];

  // State
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals
  const shippingCost = parseFloat(params.shippingCost as string) || 0;
  const finalTotal = totalPrice + shippingCost;

  // Validation for card payment
  const validateCardForm = () => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === 'card') {
      if (!cardData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(cardData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Invalid card number (16 digits required)';
      }

      if (!cardData.cardName.trim()) {
        newErrors.cardName = 'Cardholder name is required';
      }

      if (!cardData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardData.expiryDate)) {
        newErrors.expiryDate = 'Invalid format (MM/YY)';
      }

      if (!cardData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(cardData.cvv)) {
        newErrors.cvv = 'Invalid CVV';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // Handle continue
  const handleContinue = () => {
    if (items.length === 0) {
      showAlert({
        type: 'error',
        message: 'Your cart is empty',
      });
      router.push('/cart');
      return;
    }

    if (!validateCardForm()) {
      showAlert({
        type: 'error',
        message: 'Please fill in all required payment details',
      });
      return;
    }

    // Navigate to order review
    router.push({
      pathname: '/checkout/review',
      params: {
        ...params,
        paymentMethod,
        cardNumber: paymentMethod === 'card' ? cardData.cardNumber.slice(-4) : '',
      },
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: background }]}>
      <View style={styles.content}>
        {/* Payment Methods */}
        <Card variant="elevated">
          <CardContent>
            <SectionHeader title="Select Payment Method" />
            <RadioGroup
              options={paymentMethods}
              value={paymentMethod}
              onChange={(value) => setPaymentMethod(String(value))}
            />
          </CardContent>
        </Card>

        {/* Card Details Form (shown only when card is selected) */}
        {paymentMethod === 'card' && (
          <Card variant="elevated" style={{ marginTop: SpacingSemantic.md }}>
            <CardContent>
              <SectionHeader title="Card Details" />

              <Input
                label="Card Number"
                value={cardData.cardNumber}
                onChangeText={(value) => {
                  const formatted = formatCardNumber(value);
                  if (formatted.replace(/\s/g, '').length <= 16) {
                    setCardData({ ...cardData, cardNumber: formatted });
                  }
                }}
                placeholder="1234 5678 9012 3456"
                keyboardType="number-pad"
                error={errors.cardNumber}
                maxLength={19}
              />

              <Input
                label="Cardholder Name"
                value={cardData.cardName}
                onChangeText={(value) => setCardData({ ...cardData, cardName: value })}
                placeholder="Name on card"
                error={errors.cardName}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Expiry Date"
                    value={cardData.expiryDate}
                    onChangeText={(value) => {
                      const formatted = formatExpiryDate(value);
                      if (formatted.length <= 5) {
                        setCardData({ ...cardData, expiryDate: formatted });
                      }
                    }}
                    placeholder="MM/YY"
                    keyboardType="number-pad"
                    error={errors.expiryDate}
                    maxLength={5}
                  />
                </View>
                <View style={{ width: SpacingSemantic.md }} />
                <View style={{ flex: 1 }}>
                  <Input
                    label="CVV"
                    value={cardData.cvv}
                    onChangeText={(value) => {
                      if (/^\d*$/.test(value) && value.length <= 4) {
                        setCardData({ ...cardData, cvv: value });
                      }
                    }}
                    placeholder="123"
                    keyboardType="number-pad"
                    error={errors.cvv}
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              {/* Security badges */}
              <View style={styles.securityRow}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={[TextVariants.caption, { color: textMuted, marginLeft: SpacingSemantic.xs }]}>
                  Your payment information is encrypted and secure
                </Text>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Bank Transfer Instructions */}
        {paymentMethod === 'transfer' && (
          <Card variant="outlined" style={{ marginTop: SpacingSemantic.md }}>
            <CardContent>
              <SectionHeader title="Bank Transfer Details" />
              <Text style={[TextVariants.body2, { color: textMuted, marginBottom: SpacingSemantic.md }]}>
                Please transfer to the following account:
              </Text>
              <View style={styles.bankDetail}>
                <Text style={[TextVariants.caption, { color: textMuted }]}>Bank Name</Text>
                <Text style={[TextVariants.body1, { color: text }]}>Premium Bank</Text>
              </View>
              <View style={styles.bankDetail}>
                <Text style={[TextVariants.caption, { color: textMuted }]}>Account Number</Text>
                <Text style={[TextVariants.body1, { color: text }]}>1234567890</Text>
              </View>
              <View style={styles.bankDetail}>
                <Text style={[TextVariants.caption, { color: textMuted }]}>Account Name</Text>
                <Text style={[TextVariants.body1, { color: text }]}>Premium Store Ltd.</Text>
              </View>
              <Badge variant="warning" style={{ marginTop: SpacingSemantic.sm }}>
                Order will be processed after payment confirmation
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        <Card variant="outlined" style={{ marginTop: SpacingSemantic.md }}>
          <CardContent>
            <SectionHeader title="Payment Summary" />
            <View style={styles.summaryRow}>
              <Text style={[TextVariants.body1, { color: textMuted }]}>Subtotal ({items.length} items)</Text>
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
              <Text style={[TextVariants.h2, { color: text }]}>${finalTotal.toFixed(2)}</Text>
            </View>
          </CardContent>
        </Card>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </View>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomActions, { backgroundColor: background, borderTopColor: border }]}>
        <Button title="Continue to Review" onPress={handleContinue} />
      </View>
    </ScrollView>
  );
}

// ============================================
// ROOT COMPONENT
// ============================================

export default function PaymentMethodScreen() {
  return (
    <AlertProvider>
      <Stack.Screen
        options={{
          title: 'Payment Method',
          headerShown: true,
        }}
      />
      <PaymentMethodContent />
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
  row: {
    flexDirection: 'row',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SpacingSemantic.md,
    padding: SpacingSemantic.sm,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  bankDetail: {
    marginBottom: SpacingSemantic.sm,
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
});
