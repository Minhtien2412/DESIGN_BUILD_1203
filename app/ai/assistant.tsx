/**
 * AI Assistant Screen
 * Full-screen AI chat interface
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { ChatBot } from '@/components/ai';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const CONSTRUCTION_SYSTEM_PROMPT = `Bạn là AI Trợ Lý Xây Dựng - một chuyên gia thông minh về quản lý dự án xây dựng.

Khả năng của bạn:
- Phân tích tiến độ thi công và đề xuất cải thiện
- Tư vấn về vật liệu xây dựng, chi phí, và kỹ thuật
- Hỗ trợ lập kế hoạch công việc và phân bổ nguồn lực
- Giải đáp quy định an toàn lao động và tiêu chuẩn xây dựng
- Phân tích báo cáo và đưa ra khuyến nghị

Nguyên tắc trả lời:
- Ngắn gọn, rõ ràng, chuyên nghiệp
- Sử dụng tiếng Việt
- Đưa ra lời khuyên thực tế, áp dụng được ngay
- Nếu cần thêm thông tin, hãy hỏi cụ thể
- Khi đề xuất giải pháp, giải thích lý do

Bạn được kết nối với hệ thống quản lý dự án và có thể truy vấn dữ liệu thực khi cần.`;

const SUGGESTIONS = [
  '📊 Phân tích tiến độ dự án',
  '📋 Danh sách công việc hôm nay',
  '💰 Báo cáo chi phí vật liệu',
  '⚠️ Cảnh báo an toàn lao động',
  '📈 Dự báo hoàn thành dự án',
  '🛠️ Tư vấn kỹ thuật thi công',
];

export default function AIAssistantScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'AI Trợ Lý',
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#050505" />
          </TouchableOpacity>
        </View>

        {/* Chat Interface */}
        <ChatBot
          systemPrompt={CONSTRUCTION_SYSTEM_PROMPT}
          placeholder="Hỏi về dự án xây dựng..."
          welcomeMessage="Xin chào! Tôi là AI Trợ Lý Xây Dựng 🏗️\n\nTôi có thể giúp bạn phân tích tiến độ, tư vấn kỹ thuật, quản lý chi phí và nhiều hơn nữa.\n\nBạn cần hỗ trợ gì hôm nay?"
          suggestions={SUGGESTIONS}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
