/**
 * Phone Actions Utilities
 * Mở native calling và messaging như Zalo
 */

import { Alert, Linking, Platform } from 'react-native';

/**
 * Gọi điện trực tiếp đến số điện thoại
 */
export async function makePhoneCall(phoneNumber: string): Promise<void> {
  try {
    // Remove spaces and special characters
    const cleanPhone = phoneNumber.replace(/[\s()-]/g, '');
    
    // tel: URL scheme works on both iOS and Android
    const phoneUrl = `tel:${cleanPhone}`;
    
    // Check if device can make calls
    const supported = await Linking.canOpenURL(phoneUrl);
    
    if (supported) {
      await Linking.openURL(phoneUrl);
    } else {
      Alert.alert(
        'Không thể gọi điện',
        'Thiết bị không hỗ trợ chức năng gọi điện',
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    console.error('Error making phone call:', error);
    Alert.alert(
      'Lỗi',
      'Không thể thực hiện cuộc gọi. Vui lòng thử lại.',
      [{ text: 'OK' }]
    );
  }
}

/**
 * Mở ứng dụng tin nhắn với số điện thoại
 */
export async function sendSMS(phoneNumber: string, message: string = ''): Promise<void> {
  try {
    // Remove spaces and special characters
    const cleanPhone = phoneNumber.replace(/[\s()-]/g, '');
    
    // sms: URL scheme with optional message body
    let smsUrl = `sms:${cleanPhone}`;
    
    // Add message body if provided
    if (message) {
      const separator = Platform.OS === 'ios' ? '&' : '?';
      smsUrl += `${separator}body=${encodeURIComponent(message)}`;
    }
    
    // Check if device can send SMS
    const supported = await Linking.canOpenURL(smsUrl);
    
    if (supported) {
      await Linking.openURL(smsUrl);
    } else {
      Alert.alert(
        'Không thể nhắn tin',
        'Thiết bị không hỗ trợ chức năng nhắn tin',
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    Alert.alert(
      'Lỗi',
      'Không thể mở ứng dụng nhắn tin. Vui lòng thử lại.',
      [{ text: 'OK' }]
    );
  }
}

/**
 * Hiển thị menu lựa chọn: Gọi điện hoặc Nhắn tin
 */
export function showContactOptions(phoneNumber: string, name?: string): void {
  const displayName = name ? name : 'liên hệ này';
  
  Alert.alert(
    'Liên hệ',
    `Chọn cách liên hệ với ${displayName}`,
    [
      {
        text: 'Gọi điện',
        onPress: () => makePhoneCall(phoneNumber),
      },
      {
        text: 'Nhắn tin',
        onPress: () => sendSMS(phoneNumber),
      },
      {
        text: 'Hủy',
        style: 'cancel',
      },
    ],
    { cancelable: true }
  );
}

/**
 * Mở WhatsApp/Zalo với số điện thoại (nếu cài đặt)
 */
export async function openInMessagingApp(
  phoneNumber: string,
  app: 'whatsapp' | 'zalo' = 'zalo'
): Promise<void> {
  try {
    const cleanPhone = phoneNumber.replace(/[\s()-]/g, '');
    
    let url = '';
    if (app === 'whatsapp') {
      // WhatsApp URL scheme (requires country code, e.g., 84 for Vietnam)
      url = `whatsapp://send?phone=${cleanPhone}`;
    } else if (app === 'zalo') {
      // Zalo URL scheme (may vary based on Zalo version)
      url = `zalo://conversation?phone=${cleanPhone}`;
    }
    
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      // Fallback to regular SMS
      Alert.alert(
        `${app === 'whatsapp' ? 'WhatsApp' : 'Zalo'} chưa cài đặt`,
        'Bạn có muốn gửi tin nhắn thông thường không?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Nhắn tin', onPress: () => sendSMS(cleanPhone) },
        ]
      );
    }
  } catch (error) {
    console.error(`Error opening ${app}:`, error);
    // Fallback to SMS
    sendSMS(phoneNumber);
  }
}
