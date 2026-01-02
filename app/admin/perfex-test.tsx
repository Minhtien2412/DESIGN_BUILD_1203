/**
 * Perfex CRM Connection Test Screen
 * Màn hình test kết nối với Perfex CRM
 */

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

import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

import { Container } from '@/components/ui/container';
import ENV from '@/config/env';
import { MODERN_COLORS } from '@/constants/modern-theme';

export default function PerfexTestScreen() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    test?: { success: boolean; message: string; data?: unknown };
    customers?: { success: boolean; count?: number; error?: string };
    projects?: { success: boolean; count?: number; error?: string };
  }>({});

  const perfexUrl = ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm';
  const apiToken = ENV.PERFEX_API_TOKEN || 'thietkeresort-perfex-api-2024';

  const testConnection = async () => {
    setLoading(true);
    setResults({});

    try {
      // Test 1: Basic connection
      console.log('[Test] Testing connection to:', perfexUrl);
      
      const testUrl = `${perfexUrl}/custom_api/test`;
      const testResponse = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const testData = await testResponse.json();
      setResults(prev => ({
        ...prev,
        test: {
          success: testData.status === true,
          message: testData.message || 'Connected',
          data: testData,
        },
      }));

      // Test 2: Customers endpoint (with auth)
      console.log('[Test] Testing customers endpoint...');
      const customersUrl = `${perfexUrl}/custom_api/customers?limit=5`;
      const customersResponse = await fetch(customersUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-API-Key': apiToken,
        },
      });
      
      const customersData = await customersResponse.json();
      setResults(prev => ({
        ...prev,
        customers: {
          success: customersData.status === true,
          count: customersData.total || customersData.data?.length || 0,
          error: customersData.error,
        },
      }));

      // Test 3: Projects endpoint
      console.log('[Test] Testing projects endpoint...');
      const projectsUrl = `${perfexUrl}/custom_api/projects?limit=5`;
      const projectsResponse = await fetch(projectsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-API-Key': apiToken,
        },
      });
      
      const projectsData = await projectsResponse.json();
      setResults(prev => ({
        ...prev,
        projects: {
          success: projectsData.status === true,
          count: projectsData.total || projectsData.data?.length || 0,
          error: projectsData.error,
        },
      }));

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Test] Error:', error);
      Alert.alert('Lỗi kết nối', errorMessage);
      setResults(prev => ({
        ...prev,
        test: {
          success: false,
          message: errorMessage,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const renderStatusIcon = (success: boolean | undefined) => {
    if (success === undefined) return <Ionicons name="help-circle" size={24} color={MODERN_COLORS.gray400} />;
    if (success) return <Ionicons name="checkmark-circle" size={24} color={MODERN_COLORS.success} />;
    return <Ionicons name="close-circle" size={24} color={MODERN_COLORS.error} />;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Test Perfex CRM',
          headerStyle: { backgroundColor: MODERN_COLORS.primary },
          headerTintColor: '#fff',
        }}
      />
      
      <Container fullWidth style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Config Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cấu hình</Text>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>URL:</Text>
              <Text style={styles.configValue} numberOfLines={1}>{perfexUrl}</Text>
            </View>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>API Key:</Text>
              <Text style={styles.configValue}>
                {apiToken ? `${apiToken.substring(0, 10)}...` : 'Chưa cấu hình'}
              </Text>
            </View>
          </View>

          {/* Test Button */}
          <TouchableOpacity
            style={[styles.testButton, loading && styles.testButtonDisabled]}
            onPress={testConnection}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="flask" size={20} color="#fff" />
                <Text style={styles.testButtonText}>Kiểm tra kết nối</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Results */}
          {(results.test || results.customers || results.projects) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Kết quả</Text>
              
              {/* Connection Test */}
              <View style={styles.resultRow}>
                {renderStatusIcon(results.test?.success)}
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>Kết nối cơ bản</Text>
                  <Text style={styles.resultValue}>
                    {results.test?.message || 'Chưa test'}
                  </Text>
                </View>
              </View>

              {/* Customers Test */}
              <View style={styles.resultRow}>
                {renderStatusIcon(results.customers?.success)}
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>Khách hàng</Text>
                  <Text style={styles.resultValue}>
                    {results.customers?.success
                      ? `${results.customers.count} khách hàng`
                      : results.customers?.error || 'Chưa test'}
                  </Text>
                </View>
              </View>

              {/* Projects Test */}
              <View style={styles.resultRow}>
                {renderStatusIcon(results.projects?.success)}
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>Dự án</Text>
                  <Text style={styles.resultValue}>
                    {results.projects?.success
                      ? `${results.projects.count} dự án`
                      : results.projects?.error || 'Chưa test'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hướng dẫn</Text>
            <Text style={styles.instruction}>
              1. Upload file <Text style={styles.code}>Custom_api.php</Text> lên server Perfex
            </Text>
            <Text style={styles.instruction}>
              2. Đường dẫn: <Text style={styles.code}>/application/controllers/</Text>
            </Text>
            <Text style={styles.instruction}>
              3. Đổi API_SECRET_KEY trong file PHP
            </Text>
            <Text style={styles.instruction}>
              4. Cấu hình .env trong app
            </Text>
            <Text style={[styles.instruction, styles.note]}>
              📁 File PHP: docs/perfex-custom-api/Custom_api.php
            </Text>
          </View>
        </ScrollView>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.gray100,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MODERN_COLORS.text,
    marginBottom: 12,
  },
  configRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  configLabel: {
    width: 70,
    color: MODERN_COLORS.textSecondary,
    fontSize: 14,
  },
  configValue: {
    flex: 1,
    color: MODERN_COLORS.text,
    fontSize: 14,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MODERN_COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  testButtonDisabled: {
    opacity: 0.7,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
    gap: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: MODERN_COLORS.text,
  },
  resultValue: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  instruction: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: MODERN_COLORS.gray100,
    paddingHorizontal: 4,
    borderRadius: 4,
    color: MODERN_COLORS.primary,
  },
  note: {
    marginTop: 8,
    color: MODERN_COLORS.primary,
    fontStyle: 'italic',
  },
});
