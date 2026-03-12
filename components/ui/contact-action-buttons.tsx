/**
 * Contact Action Buttons Component
 * 2 nút Gọi điện và Liên hệ ngay như Shopee/Zalo
 */

import { makePhoneCall, sendSMS } from '@/utils/phone-actions';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ContactActionButtonsProps {
  phoneNumber: string;
  name?: string;
  smsMessage?: string;
  buttonSize?: 'small' | 'medium' | 'large';
  containerStyle?: any;
}

export function ContactActionButtons({
  phoneNumber,
  name,
  smsMessage,
  buttonSize = 'medium',
  containerStyle,
}: ContactActionButtonsProps) {
  const defaultSmsMessage = smsMessage || `Xin chào${name ? ` ${name}` : ''}, tôi muốn tư vấn về dịch vụ.`;

  const sizes = {
    small: { paddingH: 10, paddingV: 6, fontSize: 11, iconSize: 16 },
    medium: { paddingH: 12, paddingV: 8, fontSize: 12, iconSize: 20 },
    large: { paddingH: 16, paddingV: 10, fontSize: 14, iconSize: 24 },
  };

  const currentSize = sizes[buttonSize];

  return (
    <View style={[styles.actionButtons, containerStyle]}>
      <TouchableOpacity
        style={[
          styles.callButton,
          {
            paddingHorizontal: currentSize.paddingH,
            paddingVertical: currentSize.paddingV,
          },
        ]}
        onPress={() => makePhoneCall(phoneNumber)}
        activeOpacity={0.7}
      >
        <Ionicons name="call-outline" size={currentSize.iconSize} color="#0D9488" />
        <Text style={[styles.callButtonText, { fontSize: currentSize.fontSize }]}>
          Gọi điện
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.contactButton,
          {
            paddingHorizontal: currentSize.paddingH,
            paddingVertical: currentSize.paddingV,
          },
        ]}
        onPress={() => sendSMS(phoneNumber, defaultSmsMessage)}
        activeOpacity={0.7}
      >
        <Ionicons name="chatbubble" size={currentSize.iconSize} color="#fff" />
        <Text style={[styles.contactButtonText, { fontSize: currentSize.fontSize }]}>
          Liên hệ ngay
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0D9488',
    gap: 4,
  },
  callButtonText: {
    fontWeight: '600',
    color: '#0D9488',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 8,
    gap: 4,
  },
  contactButtonText: {
    fontWeight: '600',
    color: '#fff',
  },
});
