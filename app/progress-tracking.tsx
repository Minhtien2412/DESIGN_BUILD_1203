/**
 * Progress Tracking Screen
 * Real-time progress tracking với Bull Queue
 */

import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

export default function ProgressTrackingScreen() {
  const mockProjects = [
    { id: '1', name: 'Vinhomes Ocean Park', progress: 0.75, phase: 'Foundation Complete' },
    { id: '2', name: 'FPT Software Building', progress: 0.45, phase: 'Structure Work' },
    { id: '3', name: 'Hanoi Metro Line 3', progress: 0.90, phase: 'Final Inspection' },
  ];

  const mockTasks = [
    { id: '1', name: 'Upload construction photos', status: 'active', progress: 65 },
    { id: '2', name: 'Generate weekly report', status: 'completed', progress: 100 },
    { id: '3', name: 'Process payment invoices', status: 'active', progress: 30 },
  ];

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#0066CC', '#0066CC']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Ionicons name="stats-chart-outline" size={60} color="#fff" />
          <Text style={styles.headerTitle}>Theo dõi tiến độ</Text>
          <Text style={styles.headerSubtitle}>Real-time progress tracking với Bull Queue</Text>
        </LinearGradient>

        <Section title="Tiến độ dự án">
          {mockProjects.map(project => (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectPercent}>{Math.round(project.progress * 100)}%</Text>
              </View>
              <Progress.Bar
                progress={project.progress}
                width={null}
                height={8}
                color="#0066CC"
                unfilledColor="#e5e7eb"
                borderWidth={0}
                borderRadius={4}
                style={styles.progressBar}
              />
              <Text style={styles.projectPhase}>{project.phase}</Text>
            </View>
          ))}
        </Section>

        <Section title="Background Tasks">
          {mockTasks.map(task => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={styles.taskInfo}>
                  <Ionicons
                    name={task.status === 'completed' ? 'checkmark-circle' : 'time-outline'}
                    size={24}
                    color={task.status === 'completed' ? '#0066CC' : '#0066CC'}
                  />
                  <Text style={styles.taskName}>{task.name}</Text>
                </View>
                <Text style={styles.taskPercent}>{task.progress}%</Text>
              </View>
              <Progress.Bar
                progress={task.progress / 100}
                width={null}
                height={6}
                color={task.status === 'completed' ? '#0066CC' : '#3b82f6'}
                unfilledColor="#e5e7eb"
                borderWidth={0}
                borderRadius={3}
                style={styles.taskProgress}
              />
            </View>
          ))}
        </Section>

        <Section title="Tính năng">
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
            <Text style={styles.featureText}>Real-time progress updates qua WebSocket</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
            <Text style={styles.featureText}>Track background jobs với Bull Queue</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
            <Text style={styles.featureText}>Tiến độ theo phases & milestones</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
            <Text style={styles.featureText}>Export báo cáo PDF/Excel</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
            <Text style={styles.featureText}>Subscribe to progress events</Text>
          </View>
        </Section>

        <Section title="Backend Integration">
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📊 Sử dụng Bull Queue</Text>
            <Text style={styles.infoText}>
              Backend đã cài @nestjs/bull để quản lý background jobs.{'\n\n'}
              Endpoints cần:{'\n'}
              • GET /api/v1/tasks/:id/progress{'\n'}
              • GET /api/v1/projects/:id/progress{'\n'}
              • POST /api/v1/tasks/create{'\n'}
              • WebSocket: task:progress, project:progress
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
  projectCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  projectPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0066CC',
  },
  progressBar: {
    marginVertical: 8,
  },
  projectPhase: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  taskCard: {
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskName: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  taskPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  taskProgress: {
    marginTop: 4,
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
    backgroundColor: '#E8F4FF',
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 20,
  },
});
