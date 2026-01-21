/**
 * Test Login All Roles Screen
 * Quick test all backend accounts for baotienweb.cloud/api/v1
 */

import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

// Test credentials từ backend baotienweb.cloud
const TEST_ACCOUNTS = [
  {
    id: 'admin-main',
    label: 'ADMIN (Chính)',
    email: 'admin2026@baotienweb.cloud',
    password: 'Admin@2026!',
    role: 'ADMIN',
    color: '#dc2626',
    icon: '👑',
  },
  {
    id: 'admin-demo',
    label: 'ADMIN (Demo)',
    email: 'admin.test@demo.com',
    password: 'Test123456',
    role: 'ADMIN',
    color: '#ea580c',
    icon: '🔑',
  },
  {
    id: 'client',
    label: 'CLIENT (Khách hàng)',
    email: 'client.test@demo.com',
    password: 'Test123456',
    role: 'CLIENT',
    color: '#0ea5e9',
    icon: '👤',
  },
  {
    id: 'engineer',
    label: 'ENGINEER (Kỹ sư)',
    email: 'engineer.test@demo.com',
    password: 'Test123456',
    role: 'ENGINEER',
    color: '#8b5cf6',
    icon: '👷',
  },
  {
    id: 'staff-perfex',
    label: 'STAFF (Perfex)',
    email: 'staff@thietkeresort.com',
    password: 'demo123456',
    role: 'STAFF',
    color: '#10b981',
    icon: '👔',
  },
  {
    id: 'customer-perfex',
    label: 'CUSTOMER (Perfex)',
    email: 'customer@company.com',
    password: 'demo123456',
    role: 'CUSTOMER',
    color: '#f59e0b',
    icon: '🏢',
  },
];

export default function TestLoginAllRolesScreen() {
  const { signIn, user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const testLogin = async (account: typeof TEST_ACCOUNTS[0]) => {
    try {
      setLoading(account.id);
      console.log(`[TEST] Testing login: ${account.label}`);
      
      await signIn(account.email, account.password);
      
      setResults(prev => ({ ...prev, [account.id]: true }));
      
      Alert.alert(
        '✅ Đăng nhập thành công!',
        `${account.label}\n${account.email}`,
        [
          {
            text: 'Tiếp tục test',
            style: 'cancel',
          },
          {
            text: 'Vào Dashboard',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      console.error(`[TEST] Login failed for ${account.label}:`, error);
      setResults(prev => ({ ...prev, [account.id]: false }));
      
      Alert.alert(
        '❌ Đăng nhập thất bại',
        `${account.label}\n${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(null);
    }
  };

  const testAllAccounts = async () => {
    Alert.alert(
      '🧪 Test tất cả tài khoản',
      'Bạn muốn test lần lượt tất cả tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Test All',
          onPress: async () => {
            for (const account of TEST_ACCOUNTS) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              await testLogin(account);
            }
          },
        },
      ]
    );
  };

  const renderAccountCard = (account: typeof TEST_ACCOUNTS[0]) => {
    const isLoading = loading === account.id;
    const testResult = results[account.id];
    
    return (
      <TouchableOpacity
        key={account.id}
        style={[styles.card, { borderLeftColor: account.color }]}
        onPress={() => testLogin(account)}
        disabled={isLoading}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.icon}>{account.icon}</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.label}>{account.label}</Text>
            <Text style={styles.role}>{account.role}</Text>
          </View>
          {isLoading && <ActivityIndicator size="small" color={account.color} />}
          {!isLoading && testResult === true && (
            <Text style={styles.successIcon}>✅</Text>
          )}
          {!isLoading && testResult === false && (
            <Text style={styles.errorIcon}>❌</Text>
          )}
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.email}>{account.email}</Text>
          <Text style={styles.password}>🔒 {account.password}</Text>
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.tapHint}>
            {isLoading ? 'Đang đăng nhập...' : 'Tap để test đăng nhập'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Test Login All Roles</Text>
        <Text style={styles.subtitle}>
          Backend: baotienweb.cloud/api/v1
        </Text>
        {user && (
          <View style={styles.currentUser}>
            <Text style={styles.currentUserLabel}>Đang đăng nhập:</Text>
            <Text style={styles.currentUserEmail}>{user.email}</Text>
            <Text style={styles.currentUserRole}>{user.role}</Text>
          </View>
        )}
      </View>

      {/* Test All Button */}
      <TouchableOpacity
        style={styles.testAllButton}
        onPress={testAllAccounts}
        disabled={loading !== null}
      >
        <Text style={styles.testAllButtonText}>
          🚀 Test All Accounts
        </Text>
      </TouchableOpacity>

      {/* Account Cards */}
      <View style={styles.accountsContainer}>
        {TEST_ACCOUNTS.map(renderAccountCard)}
      </View>

      {/* API Info */}
      <View style={styles.apiInfo}>
        <Text style={styles.apiInfoTitle}>📡 API Endpoints:</Text>
        <Text style={styles.apiInfoItem}>• POST /auth/login</Text>
        <Text style={styles.apiInfoItem}>• POST /auth/register</Text>
        <Text style={styles.apiInfoItem}>• POST /auth/logout</Text>
        <Text style={styles.apiInfoItem}>• POST /auth/refresh</Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Quay lại</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  currentUser: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  currentUserLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  currentUserEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  currentUserRole: {
    fontSize: 12,
    color: '#0ea5e9',
    fontWeight: '600',
    marginTop: 2,
  },
  testAllButton: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  testAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountsContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  role: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  successIcon: {
    fontSize: 24,
  },
  errorIcon: {
    fontSize: 24,
  },
  cardBody: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  password: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  cardFooter: {
    alignItems: 'center',
  },
  tapHint: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  apiInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  apiInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  apiInfoItem: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  backButton: {
    backgroundColor: '#64748b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
