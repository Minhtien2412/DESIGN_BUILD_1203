import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, CardContent } from '../../components/ui';
import { SpacingSemantic } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';

// ============================================
// ORDER SUCCESS SCREEN
// ============================================

export default function OrderSuccessScreen() {
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');

  const params = useLocalSearchParams();
  const orderNumber = params.orderNumber as string;
  const total = params.total as string;

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Stack.Screen
        options={{
          title: 'Order Confirmed',
          headerShown: true,
          headerBackVisible: false,
        }}
      />

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
        </View>

        {/* Success Message */}
        <Text style={[TextVariants.h1, { color: text, textAlign: 'center', marginTop: SpacingSemantic.lg }]}>
          Order Placed Successfully!
        </Text>
        <Text
          style={[
            TextVariants.body1,
            { color: textMuted, textAlign: 'center', marginTop: SpacingSemantic.sm, marginHorizontal: SpacingSemantic.xl },
          ]}
        >
          Thank you for your purchase. Your order has been confirmed and will be processed soon.
        </Text>

        {/* Order Details Card */}
        <Card variant="elevated" style={{ marginTop: SpacingSemantic.xl, width: '100%' }}>
          <CardContent>
            <View style={styles.detailRow}>
              <Text style={[TextVariants.body1, { color: textMuted }]}>Order Number</Text>
              <Text style={[TextVariants.h3, { color: primary }]}>{orderNumber}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: '#E5E7EB' }]} />
            <View style={styles.detailRow}>
              <Text style={[TextVariants.body1, { color: textMuted }]}>Total Amount</Text>
              <Text style={[TextVariants.h3, { color: text }]}>${total}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: '#E5E7EB' }]} />
            <View style={styles.detailRow}>
              <Text style={[TextVariants.body1, { color: textMuted }]}>Estimated Delivery</Text>
              <Text style={[TextVariants.body1, { color: text }]}>3-5 business days</Text>
            </View>
          </CardContent>
        </Card>

        {/* Info Message */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={primary} />
          <Text style={[TextVariants.body2, { color: textMuted, marginLeft: SpacingSemantic.sm, flex: 1 }]}>
            You will receive a confirmation email with tracking details shortly.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Track Order"
            onPress={() => {
              // TODO: Navigate to order tracking screen
              router.push('/(tabs)');
            }}
            style={{ marginBottom: SpacingSemantic.md }}
          />
          <Button
            title="Continue Shopping"
            onPress={() => router.push('/(tabs)/projects')}
            variant="secondary"
          />
        </View>
      </View>
    </View>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SpacingSemantic.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SpacingSemantic.xs,
  },
  divider: {
    height: 1,
    marginVertical: SpacingSemantic.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: SpacingSemantic.md,
    borderRadius: 8,
    marginTop: SpacingSemantic.xl,
  },
  actions: {
    width: '100%',
    marginTop: SpacingSemantic.xl,
  },
});
