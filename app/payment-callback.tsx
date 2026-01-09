/**
 * Payment Callback Screen
 * Handles payment success/failure callbacks from gateways
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { paymentService } from '@/services/payments/paymentService';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentCallbackScreen() {
  const params = useLocalSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<
    'success' | 'failed' | 'pending'
  >('pending');
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState(0);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = '#0066CC';

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const txId = params.transactionId as string;
      const gateway = params.gateway as any;

      if (!txId || !gateway) {
        setPaymentStatus('failed');
        setVerifying(false);
        return;
      }

      const result = await paymentService.verifyPayment(txId, gateway);

      setTransactionId(result.transactionId);
      setAmount(result.amount);

      if (result.status === 'completed') {
        setPaymentStatus('success');
      } else if (result.status === 'failed') {
        setPaymentStatus('failed');
      } else {
        setPaymentStatus('pending');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleContinue = () => {
    if (params.returnTo) {
      router.push(params.returnTo as any);
    } else {
      router.push('/');
    }
  };

  const renderVerifying = () => (
    <View style={styles.statusContainer}>
      <ActivityIndicator size="large" color={primaryColor} />
      <Text style={[styles.statusTitle, { color: textColor }]}>
        Verifying Payment...
      </Text>
      <Text style={[styles.statusSubtitle, { color: '#999' }]}>
        Please wait while we confirm your payment
      </Text>
    </View>
  );

  const renderSuccess = () => (
    <Animated.View entering={FadeInUp.springify()} style={styles.statusContainer}>
      <View style={[styles.iconContainer, { backgroundColor: '#34C75920' }]}>
        <Ionicons name="checkmark-circle" size={64} color="#34C759" />
      </View>
      <Text style={[styles.statusTitle, { color: textColor }]}>
        Payment Successful!
      </Text>
      <Text style={[styles.statusSubtitle, { color: '#999' }]}>
        Your payment has been processed successfully
      </Text>

      {amount > 0 && (
        <View style={styles.amountContainer}>
          <Text style={[styles.amountLabel, { color: '#999' }]}>Amount Paid</Text>
          <Text style={[styles.amountValue, { color: textColor }]}>
            {paymentService.formatAmount(amount)}
          </Text>
        </View>
      )}

      {transactionId && (
        <View style={styles.transactionContainer}>
          <Text style={[styles.transactionLabel, { color: '#999' }]}>
            Transaction ID
          </Text>
          <Text
            style={[styles.transactionId, { color: textColor }]}
            selectable
          >
            {transactionId}
          </Text>
        </View>
      )}

      <Pressable
        style={[styles.button, { backgroundColor: primaryColor }]}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </Animated.View>
  );

  const renderFailed = () => (
    <Animated.View entering={FadeInUp.springify()} style={styles.statusContainer}>
      <View style={[styles.iconContainer, { backgroundColor: '#FF3B3020' }]}>
        <Ionicons name="close-circle" size={64} color="#FF3B30" />
      </View>
      <Text style={[styles.statusTitle, { color: textColor }]}>
        Payment Failed
      </Text>
      <Text style={[styles.statusSubtitle, { color: '#999' }]}>
        Your payment could not be processed. Please try again.
      </Text>

      <View style={styles.buttonGroup}>
        <Pressable
          style={[
            styles.button,
            styles.buttonSecondary,
            { borderColor: primaryColor },
          ]}
          onPress={handleContinue}
        >
          <Text style={[styles.buttonTextSecondary, { color: primaryColor }]}>
            Go Back
          </Text>
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={['top', 'bottom']}
    >
      {verifying && renderVerifying()}
      {!verifying && paymentStatus === 'success' && renderSuccess()}
      {!verifying && paymentStatus === 'failed' && renderFailed()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusContainer: {
    alignItems: 'center',
    gap: 20,
    maxWidth: 400,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statusSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  amountContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  transactionContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  transactionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionId: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 24,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
  },
});
