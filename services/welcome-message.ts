/**
 * Welcome Message Service
 * Gửi tin nhắn chào mừng tự động từ CSKH khi user mới đăng ký
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api';

const CSKH_INFO = {
  id: 'cskh-design-build',
  name: 'CSKH Design Build',
  avatar: 'https://i.pravatar.cc/150?img=1',
  role: 'Chăm sóc khách hàng',
};

const WELCOME_MESSAGES = [
  {
    id: 'welcome-1',
    content: '👋 Xin chào! Chào mừng bạn đến với Design Build - nền tảng xây dựng & thiết kế hàng đầu Việt Nam!',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'welcome-2',
    content: '🏠 Chúng tôi cung cấp:\n✅ Thiết kế nhà đẹp\n✅ Thi công xây dựng\n✅ Nội thất cao cấp\n✅ Vật liệu chính hãng',
    timestamp: new Date(Date.now() + 2000).toISOString(),
  },
  {
    id: 'welcome-3',
    content: '🎁 Ưu đãi đặc biệt cho khách hàng mới:\n- Giảm 15% thiết kế\n- Tư vấn miễn phí\n- Khảo sát công trình free',
    timestamp: new Date(Date.now() + 4000).toISOString(),
  },
  {
    id: 'welcome-4',
    content: '💬 Nếu cần hỗ trợ, đừng ngần ngại nhắn tin cho tôi nhé! Chúc bạn có trải nghiệm tuyệt vời! 🌟',
    timestamp: new Date(Date.now() + 6000).toISOString(),
  },
];

interface WelcomeMessageStatus {
  sent: boolean;
  timestamp: string;
  userId: string;
}

/**
 * Kiểm tra xem đã gửi tin nhắn chào mừng chưa
 */
export async function hasWelcomeMessageSent(userId: string): Promise<boolean> {
  try {
    const key = `welcome_message_sent_${userId}`;
    const value = await AsyncStorage.getItem(key);
    return value === 'true';
  } catch (error) {
    console.error('Error checking welcome message status:', error);
    return false;
  }
}

/**
 * Đánh dấu đã gửi tin nhắn chào mừng
 */
export async function markWelcomeMessageSent(userId: string): Promise<void> {
  try {
    const key = `welcome_message_sent_${userId}`;
    const status: WelcomeMessageStatus = {
      sent: true,
      timestamp: new Date().toISOString(),
      userId,
    };
    await AsyncStorage.setItem(key, 'true');
    await AsyncStorage.setItem(`${key}_data`, JSON.stringify(status));
  } catch (error) {
    console.error('Error marking welcome message sent:', error);
  }
}

/**
 * Gửi tin nhắn chào mừng (delay giữa các tin)
 */
export async function sendWelcomeMessages(userId: string): Promise<void> {
  try {
    // Kiểm tra đã gửi chưa
    const alreadySent = await hasWelcomeMessageSent(userId);
    if (alreadySent) {
      console.log('Welcome messages already sent to user:', userId);
      return;
    }

    console.log('Sending welcome messages to user:', userId);

    // Gửi từng tin nhắn với delay
    for (let i = 0; i < WELCOME_MESSAGES.length; i++) {
      const message = WELCOME_MESSAGES[i];
      
      await new Promise(resolve => setTimeout(resolve, i * 2000)); // Delay 2s giữa mỗi tin

      // Gửi tin nhắn qua API
      await apiFetch('/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          fromUserId: CSKH_INFO.id,
          toUserId: userId,
          content: message.content,
          type: 'text',
          metadata: {
            isWelcomeMessage: true,
            messageIndex: i + 1,
            totalMessages: WELCOME_MESSAGES.length,
          },
        }),
      }).catch(err => {
        // Fallback: lưu local nếu API fail
        console.warn('Failed to send via API, saving locally:', err);
        saveWelcomeMessageLocally(userId, message);
      });
    }

    // Đánh dấu đã gửi
    await markWelcomeMessageSent(userId);
    
    console.log('All welcome messages sent successfully');
  } catch (error) {
    console.error('Error sending welcome messages:', error);
  }
}

/**
 * Lưu tin nhắn chào mừng vào local storage (fallback)
 */
async function saveWelcomeMessageLocally(userId: string, message: any): Promise<void> {
  try {
    const key = `local_messages_${userId}`;
    const existing = await AsyncStorage.getItem(key);
    const messages = existing ? JSON.parse(existing) : [];
    
    messages.push({
      ...message,
      from: CSKH_INFO,
      to: userId,
      read: false,
      createdAt: message.timestamp,
    });

    await AsyncStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving message locally:', error);
  }
}

/**
 * Lấy thông tin CSKH
 */
export function getCSKHInfo() {
  return CSKH_INFO;
}

/**
 * Gửi tin nhắn chào mừng ngay lập tức (trigger manual)
 */
export async function sendWelcomeMessageNow(userId: string): Promise<void> {
  // Reset trạng thái
  const key = `welcome_message_sent_${userId}`;
  await AsyncStorage.removeItem(key);
  await AsyncStorage.removeItem(`${key}_data`);
  
  // Gửi lại
  await sendWelcomeMessages(userId);
}
