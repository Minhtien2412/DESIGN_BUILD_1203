import { useCart } from '@/context/cart-context';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
    AlertProvider,
    Button,
    Card,
    CardContent,
    Input,
    RadioGroup,
    SectionHeader,
    Select,
    useAlert,
} from '../../components/ui';
import { SpacingSemantic } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';

// ============================================
// SHIPPING ADDRESS SCREEN
// ============================================

function ShippingAddressContent() {
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');

  const { items, totalPrice } = useCart();
  const { showAlert } = useAlert();

  // Saved addresses (mock data)
  const savedAddresses = [
    { value: 'new', label: 'Add New Address' },
    { value: '1', label: 'Home - 123 Main St, City, 12345' },
    { value: '2', label: 'Work - 456 Office Blvd, City, 67890' },
  ];

  // Shipping methods
  const shippingMethods = [
    { value: 'standard', label: 'Standard Delivery', description: '3-5 business days • FREE' },
    { value: 'express', label: 'Express Delivery', description: '1-2 business days • $9.99' },
  ];

  // State
  const [selectedAddress, setSelectedAddress] = useState('new');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (selectedAddress === 'new') {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

      // Phone validation (simple)
      if (formData.phone && !/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Invalid phone number';
      }

      // ZIP code validation
      if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
        newErrors.zipCode = 'Invalid ZIP code';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle continue
  const handleContinue = () => {
    if (items.length === 0) {
      showAlert({
        type: 'error',
        message: 'Your cart is empty',
      });
      router.push('/shopping/cart');
      return;
    }

    if (!validateForm()) {
      showAlert({
        type: 'error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    // Calculate shipping cost
    const shippingCost = shippingMethod === 'express' ? 9.99 : 0;

    // Navigate to payment with shipping data
    router.push({
      pathname: '/checkout/payment',
      params: {
        shippingMethod,
        shippingCost: shippingCost.toString(),
        addressId: selectedAddress,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      },
    });
  };

  const shippingCost = shippingMethod === 'express' ? 9.99 : 0;
  const finalTotal = totalPrice + shippingCost;

  return (
    <ScrollView style={[styles.container, { backgroundColor: background }]}>
      <View style={styles.content}>
        {/* Select Saved Address */}
        <Card variant="elevated">
          <CardContent>
            <SectionHeader title="Select Address" />
            <Select
              value={selectedAddress}
              onChange={(value) => setSelectedAddress(String(value))}
              options={savedAddresses}
              placeholder="Choose an address"
            />
          </CardContent>
        </Card>

        {/* New Address Form */}
        {selectedAddress === 'new' && (
          <Card variant="elevated" style={{ marginTop: SpacingSemantic.md }}>
            <CardContent>
              <SectionHeader title="Delivery Address" />

              <Input
                label="Full Name"
                value={formData.fullName}
                onChangeText={(value) => setFormData({ ...formData, fullName: value })}
                placeholder="Enter your full name"
                error={errors.fullName}
              />

              <Input
                label="Phone Number"
                value={formData.phone}
                onChangeText={(value) => setFormData({ ...formData, phone: value })}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                error={errors.phone}
              />

              <Input
                label="Address"
                value={formData.address}
                onChangeText={(value) => setFormData({ ...formData, address: value })}
                placeholder="Street address, apartment, suite"
                error={errors.address}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="City"
                    value={formData.city}
                    onChangeText={(value) => setFormData({ ...formData, city: value })}
                    placeholder="City"
                    error={errors.city}
                  />
                </View>
                <View style={{ width: SpacingSemantic.md }} />
                <View style={{ flex: 1 }}>
                  <Input
                    label="State"
                    value={formData.state}
                    onChangeText={(value) => setFormData({ ...formData, state: value })}
                    placeholder="State"
                    error={errors.state}
                  />
                </View>
              </View>

              <Input
                label="ZIP Code"
                value={formData.zipCode}
                onChangeText={(value) => setFormData({ ...formData, zipCode: value })}
                placeholder="ZIP Code"
                keyboardType="number-pad"
                error={errors.zipCode}
              />
            </CardContent>
          </Card>
        )}

        {/* Shipping Method */}
        <Card variant="elevated" style={{ marginTop: SpacingSemantic.md }}>
          <CardContent>
            <SectionHeader title="Shipping Method" />
            <RadioGroup
              options={shippingMethods.map((method) => ({
                value: method.value,
                label: method.label,
                description: method.description,
              }))}
              value={shippingMethod}
              onChange={(value) => setShippingMethod(String(value))}
            />
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card variant="outlined" style={{ marginTop: SpacingSemantic.md }}>
          <CardContent>
            <SectionHeader title="Order Summary" />
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
              <Text style={[TextVariants.h3, { color: text }]}>Total</Text>
              <Text style={[TextVariants.h2, { color: text }]}>${finalTotal.toFixed(2)}</Text>
            </View>
          </CardContent>
        </Card>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </View>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomActions, { backgroundColor: background, borderTopColor: border }]}>
        <Button title="Continue to Payment" onPress={handleContinue} />
      </View>
    </ScrollView>
  );
}

// ============================================
// ROOT COMPONENT
// ============================================

export default function ShippingAddressScreen() {
  return (
    <AlertProvider>
      <Stack.Screen
        options={{
          title: 'Shipping Address',
          headerShown: true,
        }}
      />
      <ShippingAddressContent />
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
