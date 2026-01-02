/**
 * Health Check Screen
 * Giám sát hệ thống - Database, Memory, Disk
 */

import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

export default function HealthCheckScreen() {
  const systemHealth = {
    status: 'ok' as const,
    uptime: 864000, // 10 days in seconds
    timestamp: new Date().toISOString(),
  };

  const services = [
    { name: 'Database', status: 'up', responseTime: 12 },
    { name: 'Redis Cache', status: 'up', responseTime: 5 },
    { name: 'S3 Storage', status: 'up', responseTime: 45 },
    { name: 'Email Service', status: 'up', responseTime: 120 },
  ];

  const database = {
    status: 'connected',
    connections: { active: 12, idle: 8, total: 20 },
    responseTime: 12,
  };

  const memory = {
    used: 2.4,
    total: 8,
    percentage: 30,
    status: 'ok' as const,
  };

  const disk = {
    used: 45,
    total: 100,
    percentage: 45,
    status: 'ok' as const,
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
      case 'up':
      case 'connected':
        return '#10b981';
      case 'degraded':
        return '#f59e0b';
      default:
        return '#ef4444';
    }
  };

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#ef4444', '#dc2626']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Ionicons name="pulse-outline" size={60} color="#fff" />
          <Text style={styles.headerTitle}>Giám sát hệ thống</Text>
          <Text style={styles.headerSubtitle}>Monitor database, memory, disk với Terminus</Text>
        </LinearGradient>

        <Section title="System Status">
          <View style={[styles.statusCard, { backgroundColor: '#ecfdf5' }]}>
            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={32} color="#10b981" />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Status</Text>
                <Text style={[styles.statusValue, { color: '#10b981' }]}>
                  {systemHealth.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <Ionicons name="time-outline" size={32} color="#6b7280" />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Uptime</Text>
                <Text style={styles.statusValue}>{formatUptime(systemHealth.uptime)}</Text>
              </View>
            </View>
          </View>
        </Section>

        <Section title="Services">
          {services.map(service => (
            <View key={service.name} style={styles.serviceCard}>
              <Ionicons
                name={service.status === 'up' ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={getStatusColor(service.status)}
              />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceResponse}>{service.responseTime}ms</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(service.status) + '20' }]}>
                <Text style={[styles.statusBadgeText, { color: getStatusColor(service.status) }]}>
                  {service.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </Section>

        <Section title="Database">
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Status</Text>
            <Text style={[styles.metricValue, { color: '#10b981' }]}>
              {database.status.toUpperCase()}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Connections</Text>
            <Text style={styles.metricValue}>
              {database.connections.active} active / {database.connections.total} total
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Response Time</Text>
            <Text style={styles.metricValue}>{database.responseTime}ms</Text>
          </View>
        </Section>

        <Section title="Memory">
          <View style={styles.resourceCard}>
            <View style={styles.resourceHeader}>
              <Text style={styles.resourceLabel}>Memory Usage</Text>
              <Text style={styles.resourcePercent}>{memory.percentage}%</Text>
            </View>
            <Progress.Bar
              progress={memory.percentage / 100}
              width={null}
              height={10}
              color={getStatusColor(memory.status)}
              unfilledColor="#e5e7eb"
              borderWidth={0}
              borderRadius={5}
              style={styles.progressBar}
            />
            <Text style={styles.resourceDetails}>
              {memory.used} GB / {memory.total} GB
            </Text>
          </View>
        </Section>

        <Section title="Disk">
          <View style={styles.resourceCard}>
            <View style={styles.resourceHeader}>
              <Text style={styles.resourceLabel}>Disk Usage</Text>
              <Text style={styles.resourcePercent}>{disk.percentage}%</Text>
            </View>
            <Progress.Bar
              progress={disk.percentage / 100}
              width={null}
              height={10}
              color={getStatusColor(disk.status)}
              unfilledColor="#e5e7eb"
              borderWidth={0}
              borderRadius={5}
              style={styles.progressBar}
            />
            <Text style={styles.resourceDetails}>
              {disk.used} GB / {disk.total} GB
            </Text>
          </View>
        </Section>

        <Section title="Tính năng">
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.featureText}>Real-time health monitoring với @nestjs/terminus</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.featureText}>Database connection checks</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.featureText}>Memory & disk usage tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.featureText}>Service availability checks</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.featureText}>Auto alert khi có vấn đề</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.featureText}>WebSocket updates real-time</Text>
          </View>
        </Section>

        <Section title="Backend Integration">
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💓 Sử dụng @nestjs/terminus</Text>
            <Text style={styles.infoText}>
              Backend đã cài module health check.{'\n\n'}
              Endpoints cần:{'\n'}
              • GET /api/v1/health{'\n'}
              • GET /api/v1/health/database{'\n'}
              • GET /api/v1/health/service/:name{'\n'}
              • GET /api/v1/health/metrics{'\n'}
              • WebSocket: health:update
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
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusInfo: {
    marginLeft: 12,
  },
  statusLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  serviceResponse: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  resourceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resourceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  resourcePercent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  progressBar: {
    marginVertical: 8,
  },
  resourceDetails: {
    fontSize: 13,
    color: '#6b7280',
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
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#7f1d1d',
    lineHeight: 20,
  },
});
