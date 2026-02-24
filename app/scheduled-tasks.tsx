/**
 * Scheduled Tasks Screen
 * Quản lý công việc định kỳ, nhắc nhở, báo cáo tự động
 */

import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function ScheduledTasksScreen() {
  const mockTasks = [
    {
      id: '1',
      name: 'Daily Site Inspection Reminder',
      schedule: 'Every day at 9:00 AM',
      type: 'reminder',
      isActive: true,
      nextRun: '2025-12-17 09:00',
    },
    {
      id: '2',
      name: 'Weekly Progress Report',
      schedule: 'Every Monday at 9:00 AM',
      type: 'report',
      isActive: true,
      nextRun: '2025-12-23 09:00',
    },
    {
      id: '3',
      name: 'Daily Database Backup',
      schedule: 'Every day at 2:00 AM',
      type: 'backup',
      isActive: true,
      nextRun: '2025-12-17 02:00',
    },
    {
      id: '4',
      name: 'Project Deadline: Vinhomes',
      schedule: 'Once on 2025-12-24',
      type: 'reminder',
      isActive: true,
      nextRun: '2025-12-24 08:00',
    },
  ];

  const getIconForType = (type: string) => {
    switch (type) {
      case 'reminder': return 'alarm-outline';
      case 'report': return 'document-text-outline';
      case 'backup': return 'save-outline';
      default: return 'time-outline';
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'reminder': return '#0D9488';
      case 'report': return '#0D9488';
      case 'backup': return '#0D9488';
      default: return '#6b7280';
    }
  };

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#0D9488', '#d97706']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Ionicons name="time-outline" size={60} color="#fff" />
          <Text style={styles.headerTitle}>Công việc định kỳ</Text>
          <Text style={styles.headerSubtitle}>Nhắc nhở tự động & báo cáo theo lịch</Text>
        </LinearGradient>

        <Section title="Active Scheduled Tasks">
          {mockTasks.map(task => (
            <View key={task.id} style={styles.taskCard}>
              <View style={[styles.taskIcon, { backgroundColor: getColorForType(task.type) + '20' }]}>
                <Ionicons
                  name={getIconForType(task.type) as any}
                  size={24}
                  color={getColorForType(task.type)}
                />
              </View>
              <View style={styles.taskInfo}>
                <Text style={styles.taskName}>{task.name}</Text>
                <Text style={styles.taskSchedule}>
                  <Ionicons name="repeat-outline" size={12} /> {task.schedule}
                </Text>
                <Text style={styles.taskNextRun}>
                  <Ionicons name="calendar-outline" size={12} /> Next: {task.nextRun}
                </Text>
              </View>
              <Switch
                value={task.isActive}
                trackColor={{ false: '#d1d5db', true: getColorForType(task.type) + '40' }}
                thumbColor={task.isActive ? getColorForType(task.type) : '#9ca3af'}
              />
            </View>
          ))}
        </Section>

        <Section title="Quick Actions">
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#0D9488' }]}>
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>Tạo nhắc nhở hàng ngày</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#0D9488' }]}>
            <Ionicons name="document-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>Tạo báo cáo tuần tự động</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#0D9488' }]}>
            <Ionicons name="save-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>Thiết lập backup hàng ngày</Text>
          </TouchableOpacity>
        </Section>

        <Section title="Tính năng">
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0D9488" />
            <Text style={styles.featureText}>Cron job scheduling với @nestjs/schedule</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0D9488" />
            <Text style={styles.featureText}>Daily, weekly, monthly patterns</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0D9488" />
            <Text style={styles.featureText}>Custom cron expressions</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0D9488" />
            <Text style={styles.featureText}>Nhắc nhở deadline dự án</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0D9488" />
            <Text style={styles.featureText}>Báo cáo tự động (PDF/Excel)</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0D9488" />
            <Text style={styles.featureText}>Manual trigger ngay lập tức</Text>
          </View>
        </Section>

        <Section title="Backend Integration">
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>⏰ Sử dụng @nestjs/schedule</Text>
            <Text style={styles.infoText}>
              Backend đã cài module scheduling.{'\n\n'}
              Endpoints cần:{'\n'}
              • POST /api/v1/scheduled-tasks{'\n'}
              • GET /api/v1/scheduled-tasks{'\n'}
              • PATCH /api/v1/scheduled-tasks/:id{'\n'}
              • DELETE /api/v1/scheduled-tasks/:id{'\n'}
              • POST /api/v1/scheduled-tasks/:id/run
            </Text>
          </View>
        </Section>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  taskSchedule: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  taskNextRun: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 20,
  },
});
