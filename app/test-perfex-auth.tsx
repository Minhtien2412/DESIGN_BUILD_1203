/**
 * Màn hình Test Perfex CRM Authentication
 * Để kiểm tra login, register, data fetching
 * 
 * @route /test-perfex-auth
 */

import { usePerfexAuth } from '@/context/PerfexAuthContext';
import { useMyDashboardStats, useMyEstimates, useMyInvoices, useMyProjects } from '@/hooks/usePerfexUserData';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#EE4D2D',
  success: '#00C853',
  error: '#D32F2F',
  text: '#222',
  textMuted: '#757575',
  background: '#F5F5F5',
  surface: '#FFF',
  border: '#E0E0E0',
};

export default function TestPerfexAuthScreen() {
  const { user, isAuthenticated, loading, signIn, signOut, isStaff, isCustomer, getCustomerId } = usePerfexAuth();
  
  // Test login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  // Data hooks
  const { projects, loading: projectsLoading, error: projectsError } = useMyProjects({ limit: 10 });
  const { invoices, loading: invoicesLoading, error: invoicesError, totalAmount, unpaidAmount } = useMyInvoices({ limit: 10 });
  const { estimates, loading: estimatesLoading, error: estimatesError } = useMyEstimates({ limit: 10 });
  const { stats, loading: statsLoading, error: statsError } = useMyDashboardStats();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoginLoading(true);
    setTestResult('');
    
    try {
      await signIn(email, password);
      setTestResult('✅ Đăng nhập thành công!');
    } catch (error: any) {
      setTestResult(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setTestResult('✅ Đăng xuất thành công!');
    } catch (error: any) {
      setTestResult(`❌ Lỗi: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={40} color={COLORS.primary} />
          <Text style={styles.title}>Test Perfex CRM Auth</Text>
        </View>

        {/* Auth Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái Authentication</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, isAuthenticated ? styles.statusSuccess : styles.statusError]}>
              <Text style={styles.statusText}>
                {isAuthenticated ? 'Đã đăng nhập' : 'Chưa đăng nhập'}
              </Text>
            </View>
          </View>
        </View>

        {/* User Info */}
        {isAuthenticated && user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin User</Text>
            <View style={styles.infoCard}>
              <InfoRow label="ID" value={user.id} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Họ tên" value={user.fullName} />
              <InfoRow label="Loại" value={isStaff() ? 'Staff' : 'Customer'} />
              {isCustomer() && <InfoRow label="Customer ID" value={getCustomerId() || 'N/A'} />}
              {isStaff() && <InfoRow label="Staff ID" value={user.staffId || 'N/A'} />}
              <InfoRow label="Role" value={user.role || 'N/A'} />
            </View>
          </View>
        )}

        {/* Login Form (if not logged in) */}
        {!isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đăng nhập thử</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity 
              style={[styles.button, loginLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loginLoading}
            >
              {loginLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Button (if logged in) */}
        {isAuthenticated && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonOutline]}
              onPress={handleLogout}
            >
              <Text style={[styles.buttonText, { color: COLORS.primary }]}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Test Result */}
        {testResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kết quả</Text>
            <Text style={styles.resultText}>{testResult}</Text>
          </View>
        )}

        {/* Dashboard Stats (if logged in) */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thống kê Dashboard</Text>
            {statsLoading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : statsError ? (
              <Text style={styles.errorText}>{statsError}</Text>
            ) : stats ? (
              <View style={styles.statsGrid}>
                <StatBox label="Dự án" value={stats.totalProjects} color="#2196F3" />
                <StatBox label="Đang làm" value={stats.activeProjects} color="#4CAF50" />
                <StatBox label="Hoàn thành" value={stats.completedProjects} color="#9E9E9E" />
                <StatBox label="Tasks" value={stats.totalTasks} color="#FF9800" />
                <StatBox label="Hóa đơn" value={stats.totalInvoices} color="#E91E63" />
                <StatBox label="Báo giá" value={stats.totalEstimates} color="#9C27B0" />
              </View>
            ) : null}
          </View>
        )}

        {/* Projects */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dự án ({projects.length})</Text>
            {projectsLoading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : projectsError ? (
              <Text style={styles.errorText}>{projectsError}</Text>
            ) : projects.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có dự án</Text>
            ) : (
              projects.slice(0, 5).map((project: any) => (
                <View key={project.id} style={styles.listItem}>
                  <Ionicons name="folder" size={20} color={COLORS.primary} />
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{project.name}</Text>
                    <Text style={styles.listItemSub}>Status: {project.status}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Invoices */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hóa đơn ({invoices.length})</Text>
            {invoicesLoading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : invoicesError ? (
              <Text style={styles.errorText}>{invoicesError}</Text>
            ) : invoices.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có hóa đơn</Text>
            ) : (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tổng:</Text>
                  <Text style={styles.summaryValue}>{formatMoney(totalAmount)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Chưa thanh toán:</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.error }]}>{formatMoney(unpaidAmount)}</Text>
                </View>
                {invoices.slice(0, 5).map((invoice: any) => (
                  <View key={invoice.id} style={styles.listItem}>
                    <Ionicons name="receipt" size={20} color="#E91E63" />
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>#{invoice.number || invoice.id}</Text>
                      <Text style={styles.listItemSub}>{formatMoney(parseFloat(invoice.total || '0'))}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Estimates */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Báo giá ({estimates.length})</Text>
            {estimatesLoading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : estimatesError ? (
              <Text style={styles.errorText}>{estimatesError}</Text>
            ) : estimates.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có báo giá</Text>
            ) : (
              estimates.slice(0, 5).map((estimate: any) => (
                <View key={estimate.id} style={styles.listItem}>
                  <Ionicons name="document-text" size={20} color="#9C27B0" />
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>#{estimate.number || estimate.id}</Text>
                    <Text style={styles.listItemSub}>{formatMoney(parseFloat(estimate.total || '0'))}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Perfex CRM Integration v1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.statBox, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textMuted,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 10,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusSuccess: {
    backgroundColor: '#E8F5E9',
  },
  statusError: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    width: 100,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  infoValue: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  statBox: {
    width: '30%',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    margin: 4,
    borderLeftWidth: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  listItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  listItemSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
