import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HelpItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  action: () => void;
}

export default function HelpScreen() {
  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');

  const helpItems: HelpItem[] = [
    {
      icon: 'chatbubble-outline',
      title: 'Chat với hỗ trợ',
      description: 'Nhận trợ giúp trực tiếp từ đội ngũ của chúng tôi',
      action: () => console.log('Open chat'),
    },
    {
      icon: 'call-outline',
      title: 'Hotline',
      description: '1900-xxxx (8:00 - 22:00)',
      action: () => console.log('Call hotline'),
    },
    {
      icon: 'mail-outline',
      title: 'Email hỗ trợ',
      description: 'support@thietkeresort.com.vn',
      action: () => console.log('Send email'),
    },
    {
      icon: 'book-outline',
      title: 'Hướng dẫn sử dụng',
      description: 'Tài liệu chi tiết về tính năng',
      action: () => console.log('Open guide'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Câu hỏi thường gặp',
      description: 'Tìm câu trả lời nhanh chóng',
      action: () => console.log('Open FAQ'),
    },
    {
      icon: 'document-text-outline',
      title: 'Điều khoản dịch vụ',
      description: 'Xem các điều khoản và chính sách',
      action: () => console.log('Open terms'),
    },
  ];

  const quickActions = [
    {
      icon: 'flash-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Báo lỗi',
      color: '#000000',
    },
    {
      icon: 'star-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Đánh giá',
      color: '#0066CC',
    },
    {
      icon: 'bulb-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Góp ý',
      color: '#3B82F6',
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Trợ giúp & Hỗ trợ',
          headerBackTitle: 'Quay lại',
        }}
      />
      
      <View style={[styles.container, { backgroundColor: background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${primary}20` }]}>
              <Ionicons name="help-circle-outline" size={48} color={primary} />
            </View>
            <Text style={[styles.title, { color: text }]}>
              Chúng tôi sẵn sàng giúp bạn
            </Text>
            <Text style={[styles.subtitle, { color: textMuted }]}>
              Chọn cách bạn muốn được hỗ trợ
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickAction, { backgroundColor: surface, borderColor: border }]}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={[styles.quickActionLabel, { color: text }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Help Items */}
          <View style={styles.helpList}>
            {helpItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.helpCard, { backgroundColor: surface, borderColor: border }]}
                onPress={item.action}
              >
                <View style={[styles.helpIcon, { backgroundColor: `${primary}20` }]}>
                  <Ionicons name={item.icon} size={24} color={primary} />
                </View>
                <View style={styles.helpContent}>
                  <Text style={[styles.helpTitle, { color: text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.helpDescription, { color: textMuted }]}>
                    {item.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* App Version */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: textMuted }]}>
              Phiên bản 1.0.0
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  helpList: {
    gap: 12,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  helpIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 32,
  },
  footerText: {
    fontSize: 13,
  },
});
