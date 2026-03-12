import { EventNotificationCard } from '@/components/notifications/EventNotificationCard';
import { LiveNotificationCard } from '@/components/notifications/LiveNotificationCard';
import { MessageNotificationCard } from '@/components/notifications/MessageNotificationCard';
import { SystemNotificationCard } from '@/components/notifications/SystemNotificationCard';
import { Colors } from '@/constants/theme';
import { resolveAvatar } from '@/utils/avatar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

export default function NotificationDemoScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewerCount, setViewerCount] = useState(1234);

  // Simulate live viewer count changes
  React.useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 20) - 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationPress = (id: string, type: string) => {
    console.log(`Notification pressed: ${id} (${type})`);
    alert(`Đã nhấn thông báo: ${type}\nID: ${id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Demo Thông Báo
        </Text>
        <TouchableOpacity onPress={() => setRefreshKey(k => k + 1)}>
          <Ionicons name="refresh" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          🔴 Live Notifications (Đang diễn ra)
        </Text>

        <LiveNotificationCard
          key={`live-active-${refreshKey}`}
          id="live-001"
          title="🎥 Live: Hướng dẫn tính năng mới"
          message="CEO đang chia sẻ về các tính năng sắp ra mắt trong Q4 2025"
          liveType="webinar"
          priority="high"
          read={false}
          createdAt={new Date(Date.now() - 1800000).toISOString()} // 30 min ago
          isActive={true}
          viewerCount={viewerCount}
          startedAt={new Date(Date.now() - 1800000).toISOString()}
          onPress={() => handleNotificationPress('live-001', 'Live Webinar')}
        />

        <LiveNotificationCard
          key={`live-call-${refreshKey}`}
          id="live-002"
          title="📞 Cuộc gọi video nhóm"
          message="Minh Tiến và 3 người khác đang trong cuộc gọi"
          liveType="video_call"
          priority="urgent"
          read={false}
          createdAt={new Date(Date.now() - 300000).toISOString()} // 5 min ago
          isActive={true}
          viewerCount={4}
          startedAt={new Date(Date.now() - 300000).toISOString()}
          onPress={() => handleNotificationPress('live-002', 'Video Call')}
        />

        <LiveNotificationCard
          key={`live-ended-${refreshKey}`}
          id="live-003"
          title="📺 Phát trực tiếp đã kết thúc"
          message="Buổi streaming của Nguyễn Văn A đã kết thúc"
          liveType="stream"
          priority="normal"
          read={true}
          createdAt={new Date(Date.now() - 3600000).toISOString()} // 1 hour ago
          isActive={false}
          viewerCount={856}
          startedAt={new Date(Date.now() - 7200000).toISOString()}
          onPress={() => handleNotificationPress('live-003', 'Stream Ended')}
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          🔔 System Notifications (Hệ thống)
        </Text>

        <SystemNotificationCard
          id="sys-001"
          title="⚠️ Bảo trì hệ thống khẩn cấp"
          message="Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày mai để nâng cấp cơ sở dữ liệu và API"
          systemType="maintenance"
          priority="urgent"
          read={false}
          createdAt={new Date(Date.now() - 600000).toISOString()} // 10 min ago
          affectedServices={['API', 'Database', 'Storage', 'Push Notifications']}
          onPress={() => handleNotificationPress('sys-001', 'System Maintenance')}
        />

        <SystemNotificationCard
          id="sys-002"
          title="✨ Cập nhật phiên bản mới"
          message="Phiên bản 2.5.0 đã có sẵn với nhiều tính năng mới và cải tiến hiệu suất"
          systemType="update"
          priority="high"
          read={false}
          createdAt={new Date(Date.now() - 1800000).toISOString()}
          onPress={() => handleNotificationPress('sys-002', 'Update Available')}
        />

        <SystemNotificationCard
          id="sys-003"
          title="📢 Thông báo quan trọng"
          message="Chúng tôi đã cập nhật điều khoản sử dụng và chính sách bảo mật"
          systemType="policy"
          priority="normal"
          read={true}
          createdAt={new Date(Date.now() - 86400000).toISOString()} // 1 day ago
          onPress={() => handleNotificationPress('sys-003', 'Policy Update')}
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          📅 Event Notifications (Sự kiện)
        </Text>

        <EventNotificationCard
          id="evt-001"
          title="🚨 Deadline sắp đến hạn"
          message="Dự án ABC cần hoàn thành và nộp báo cáo trong vòng 2 giờ nữa"
          eventType="deadline"
          priority="urgent"
          read={false}
          createdAt={new Date(Date.now() - 120000).toISOString()} // 2 min ago
          eventDate={new Date(Date.now() + 7200000).toISOString()} // 2 hours from now
          location="Online submission"
          onPress={() => handleNotificationPress('evt-001', 'Deadline')}
        />

        <EventNotificationCard
          id="evt-002"
          title="👥 Cuộc họp dự án quan trọng"
          message="Họp review tiến độ dự án ABC và lên kế hoạch sprint tiếp theo"
          eventType="meeting"
          priority="high"
          read={false}
          createdAt={new Date(Date.now() - 3600000).toISOString()}
          eventDate={new Date(Date.now() + 3600000).toISOString()} // 1 hour from now
          location="Phòng họp A, Tầng 5, Tòa nhà văn phòng"
          participants={['Minh Tiến', 'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D']}
          onPress={() => handleNotificationPress('evt-002', 'Meeting')}
        />

        <EventNotificationCard
          id="evt-003"
          title="🏆 Hoàn thành cột mốc quan trọng"
          message="Chúc mừng! Dự án đã đạt 75% tiến độ"
          eventType="milestone"
          priority="normal"
          read={true}
          createdAt={new Date(Date.now() - 7200000).toISOString()}
          eventDate={new Date().toISOString()}
          onPress={() => handleNotificationPress('evt-003', 'Milestone')}
        />

        <EventNotificationCard
          id="evt-004"
          title="💼 Dự án mới được giao"
          message="Bạn được thêm vào dự án 'Website Redesign 2025'"
          eventType="project"
          priority="normal"
          read={false}
          createdAt={new Date(Date.now() - 10800000).toISOString()} // 3 hours ago
          eventDate={new Date(Date.now() + 604800000).toISOString()} // 7 days from now
          location="Remote work"
          participants={['Team Lead', 'Designer', 'Developer 1', 'Developer 2']}
          onPress={() => handleNotificationPress('evt-004', 'New Project')}
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          💬 Message Notifications (Tin nhắn)
        </Text>

        <MessageNotificationCard
          id="msg-001"
          title="Tin nhắn mới"
          message="Bạn có tin nhắn mới từ Minh Tiến"
          messageType="chat"
          priority="normal"
          read={false}
          createdAt={new Date(Date.now() - 180000).toISOString()} // 3 min ago
          senderName="Minh Tiến"
          senderAvatar={resolveAvatar(undefined, { userId: 'user-12', nameFallback: 'Minh Tiến', size: 150 })}
          preview="Hey! Đã xem báo cáo mới nhất chưa? Có một số điểm cần thảo luận thêm về phần marketing..."
          conversationId="conv-123"
          onPress={() => handleNotificationPress('msg-001', 'Chat Message')}
        />

        <MessageNotificationCard
          id="msg-002"
          title="Email quan trọng"
          message="Bạn có email mới từ CEO"
          messageType="email"
          priority="high"
          read={false}
          createdAt={new Date(Date.now() - 900000).toISOString()} // 15 min ago
          senderName="Nguyễn CEO"
          senderAvatar={resolveAvatar(undefined, { userId: 'user-33', nameFallback: 'Nguyễn CEO', size: 150 })}
          preview="Subject: Kế hoạch chiến lược Q1 2026\n\nXin chào team, tôi muốn chia sẻ về định hướng phát triển..."
          onPress={() => handleNotificationPress('msg-002', 'Email')}
        />

        <MessageNotificationCard
          id="msg-003"
          title="Bình luận mới"
          message="Trần Thị B đã bình luận trong bài viết của bạn"
          messageType="comment"
          priority="low"
          read={true}
          createdAt={new Date(Date.now() - 3600000).toISOString()}
          senderName="Trần Thị B"
          senderAvatar={resolveAvatar(undefined, { userId: 'user-45', nameFallback: 'Trần Thị B', size: 150 })}
          preview="Ý tưởng rất hay! Tôi nghĩ chúng ta nên implement ngay trong sprint này 👍"
          onPress={() => handleNotificationPress('msg-003', 'Comment')}
        />

        <MessageNotificationCard
          id="msg-004"
          title="SMS mới"
          message="Mã xác thực OTP"
          messageType="sms"
          priority="normal"
          read={true}
          createdAt={new Date(Date.now() - 1200000).toISOString()} // 20 min ago
          senderName="Hệ thống OTP"
          preview="Mã xác thực của bạn là: 123456. Mã có hiệu lực trong 5 phút."
          onPress={() => handleNotificationPress('msg-004', 'SMS')}
        />

        <MessageNotificationCard
          id="msg-005"
          title="Nhóm chat"
          message="5 tin nhắn mới trong nhóm 'Team Development'"
          messageType="chat"
          priority="normal"
          read={false}
          createdAt={new Date(Date.now() - 600000).toISOString()} // 10 min ago
          senderName="Team Development"
          senderAvatar={resolveAvatar(undefined, { userId: 'team-dev-68', nameFallback: 'Team Development', size: 150 })}
          preview="Lê Văn C: Mọi người đã test tính năng mới chưa?\nPhạm Thị D: Tôi thấy có bug nhỏ ở phần login\nLê Văn C: OK, mình sẽ fix ngay..."
          conversationId="conv-team-dev"
          onPress={() => handleNotificationPress('msg-005', 'Group Chat')}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Demo notification system with 4 types
          </Text>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            System • Event • Live • Message
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
});
