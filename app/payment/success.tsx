/**
 * Payment Success Screen
 * Hiển thị khi thanh toán thành công
 */

import ModernButton from '@/components/ui/modern-button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function PaymentSuccessScreen() {
  const params = useLocalSearchParams<{ orderId?: string; transactionId?: string }>();
  
  // Theme
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'tabIconDefault');
  const successColor = '#10b981';
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animate success icon
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: successColor,
            },
          ]}
        >
          <Ionicons name="checkmark" size={64} color="#fff" />
        </Animated.View>

        {/* Success Message */}
        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.title, { color: textColor }]}>
            Thanh toán thành công!
          </Text>
          <Text style={[styles.subtitle, { color: secondaryText }]}>
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
          </Text>

          {params.orderId && (
            <View style={styles.orderInfo}>
              <Text style={[styles.orderLabel, { color: secondaryText }]}>
                Mã đơn hàng:
              </Text>
              <Text style={[styles.orderValue, { color: textColor }]}>
                {params.orderId}
              </Text>
            </View>
          )}

          {params.transactionId && (
            <View style={styles.orderInfo}>
              <Text style={[styles.orderLabel, { color: secondaryText }]}>
                Mã giao dịch:
              </Text>
              <Text style={[styles.orderValue, { color: textColor }]}>
                {params.transactionId}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Actions */}
        <Animated.View
          style={[
            styles.actions,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
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
        </Animated.View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  orderLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    paddingHorizontal: 20,
  },
});
