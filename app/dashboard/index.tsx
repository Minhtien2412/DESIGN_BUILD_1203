/**
 * Dashboard Index - Role-based Dashboard Router
 * Automatically redirects to appropriate dashboard based on user role
 * @route /dashboard/index
 */

import { Container } from '@/components/ui/container';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardIndexScreen() {
  const { user } = useAuth();

  // Auto-redirect based on user role
  useEffect(() => {
    if (user?.role === 'admin') {
      router.replace('/dashboard/admin');
    } else if (user?.role === 'engineer' || user?.role === 'employee') {
      router.replace('/dashboard/engineer');
    }
    // For regular users, show the selection screen below
  }, [user]);

  const dashboards = [
    {
      id: 'admin',
      title: 'Admin Dashboard',
      titleVi: 'Bảng điều khiển Admin',
      desc: 'Quản lý hệ thống, người dùng, báo cáo tổng hợp',
      icon: 'shield-checkmark-outline',
      route: '/dashboard/admin',
      color: '#EE4D2D',
      roles: ['admin'],
    },
    {
      id: 'engineer',
      title: 'Engineer Dashboard',
      titleVi: 'Bảng điều khiển Kỹ sư',
      desc: 'Quản lý dự án, tiến độ, chất lượng công trình',
      icon: 'construct-outline',
      route: '/dashboard/engineer',
      color: '#4ECDC4',
      roles: ['engineer', 'employee'],
    },
    {
      id: 'client',
      title: 'Client Dashboard',
      titleVi: 'Bảng điều khiển Khách hàng',
      desc: 'Theo dõi dự án, tiến độ, thanh toán',
      icon: 'home-outline',
      route: '/dashboard/client',
      color: '#45B7D1',
      roles: ['user', 'client'],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Container>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Bảng điều khiển</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Dashboard Options */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>Chọn bảng điều khiển phù hợp với bạn</Text>
          
          <View style={styles.dashboardList}>
            {dashboards.map((dashboard) => (
              <TouchableOpacity
                key={dashboard.id}
                style={styles.dashboardCard}
                onPress={() => router.push(dashboard.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: dashboard.color + '20' }]}>
                  <Ionicons name={dashboard.icon as any} size={32} color={dashboard.color} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{dashboard.titleVi}</Text>
                  <Text style={styles.cardDesc}>{dashboard.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#CCC" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Access */}
          <View style={styles.quickAccess}>
            <Text style={styles.quickTitle}>Truy cập nhanh</Text>
            <View style={styles.quickGrid}>
              <TouchableOpacity 
                style={styles.quickItem}
                onPress={() => router.push('/(tabs)/projects')}
              >
                <Ionicons name="folder-outline" size={24} color="#6C5CE7" />
                <Text style={styles.quickLabel}>Dự án</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickItem}
                onPress={() => router.push('/reports/index' as any)}
              >
                <Ionicons name="stats-chart-outline" size={24} color="#00B894" />
                <Text style={styles.quickLabel}>Báo cáo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickItem}
                onPress={() => router.push('/timeline/index' as any)}
              >
                <Ionicons name="time-outline" size={24} color="#E17055" />
                <Text style={styles.quickLabel}>Timeline</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickItem}
                onPress={() => router.push('/budget/index' as any)}
              >
                <Ionicons name="wallet-outline" size={24} color="#FDCB6E" />
                <Text style={styles.quickLabel}>Ngân sách</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  dashboardList: {
    gap: 12,
  },
  dashboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  quickAccess: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickItem: {
    width: '22%',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});
