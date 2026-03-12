/**
 * API Status Dashboard Screen
 * Hiển thị trạng thái tất cả API đã tích hợp
 */

import { APIStatus, apiStatusChecker, exchangeRateService } from '@/services/externalAPIs';
import { geminiAI } from '@/services/geminiAI';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ExtendedAPIStatus extends APIStatus {
  icon: string;
  color: string;
  description: string;
}

const API_INFO: Record<string, { icon: string; description: string }> = {
  'Gemini AI': {
    icon: 'sparkles',
    description: 'AI Assistant, Chat, Code review',
  },
  'Backend API': {
    icon: 'server',
    description: 'Auth, Projects, Tasks, Notifications',
  },
  'ExchangeRate API': {
    icon: 'cash',
    description: 'Tỷ giá tiền tệ real-time',
  },
  'Pinecone Vector DB': {
    icon: 'search',
    description: 'Vector search, AI embeddings',
  },
  'GetOTP SMS': {
    icon: 'chatbubble-ellipses',
    description: 'Xác thực OTP qua SMS',
  },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case 'working':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const getText = () => {
    switch (status) {
      case 'working':
        return 'Hoạt động';
      case 'error':
        return 'Lỗi';
      default:
        return 'Chưa cấu hình';
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getColor() + '20' }]}>
      <View style={[styles.badgeDot, { backgroundColor: getColor() }]} />
      <Text style={[styles.badgeText, { color: getColor() }]}>{getText()}</Text>
    </View>
  );
};

const APICard: React.FC<{ api: ExtendedAPIStatus }> = ({ api }) => {
  return (
    <View style={styles.apiCard}>
      <View style={styles.apiHeader}>
        <View style={[styles.apiIcon, { backgroundColor: api.color + '20' }]}>
          <Ionicons name={api.icon as any} size={24} color={api.color} />
        </View>
        <View style={styles.apiInfo}>
          <Text style={styles.apiName}>{api.name}</Text>
          <Text style={styles.apiDescription}>{api.description}</Text>
        </View>
        <StatusBadge status={api.status} />
      </View>
      
      <View style={styles.apiDetails}>
        {api.message && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thông tin:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {api.message}
            </Text>
          </View>
        )}
        {api.latency !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Độ trễ:</Text>
            <Text style={[
              styles.detailValue,
              { color: api.latency < 500 ? '#10B981' : api.latency < 1000 ? '#F59E0B' : '#EF4444' }
            ]}>
              {api.latency}ms
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default function APIStatusScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiStatuses, setApiStatuses] = useState<ExtendedAPIStatus[]>([]);
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [geminiStatus, setGeminiStatus] = useState<{ connected: boolean; message: string } | null>(null);

  const checkAllAPIs = useCallback(async () => {
    try {
      // Check basic APIs
      const statuses = await apiStatusChecker.checkAll();
      
      // Enhance with additional info
      const enhanced: ExtendedAPIStatus[] = statuses.map(status => ({
        ...status,
        icon: API_INFO[status.name]?.icon || 'help-circle',
        description: API_INFO[status.name]?.description || '',
        color: status.status === 'working' ? '#10B981' : 
               status.status === 'error' ? '#EF4444' : '#F59E0B',
      }));

      setApiStatuses(enhanced);

      // Get USD rate
      try {
        const rate = await exchangeRateService.getVNDRate();
        setUsdRate(rate);
      } catch (e) {
        console.error('Failed to get USD rate:', e);
      }

      // Check Gemini
      try {
        const gemini = await geminiAI.checkStatus();
        setGeminiStatus({ connected: gemini.connected, message: gemini.message });
      } catch (e) {
        setGeminiStatus({ connected: false, message: 'Connection failed' });
      }
    } catch (error) {
      console.error('API check error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    checkAllAPIs();
  }, [checkAllAPIs]);

  const handleRefresh = () => {
    setRefreshing(true);
    checkAllAPIs();
  };

  const workingCount = apiStatuses.filter(a => a.status === 'working').length;
  const totalCount = apiStatuses.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔌 API Status</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="pulse" size={28} color="#10B981" />
            <Text style={styles.summaryTitle}>Tổng quan hệ thống</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workingCount}/{totalCount}</Text>
              <Text style={styles.statLabel}>API hoạt động</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {usdRate ? exchangeRateService.formatVND(usdRate).replace('₫', '') : '...'}
              </Text>
              <Text style={styles.statLabel}>1 USD = VND</Text>
            </View>
          </View>

          {geminiStatus && (
            <View style={styles.geminiStatus}>
              <Ionicons 
                name={geminiStatus.connected ? 'checkmark-circle' : 'close-circle'} 
                size={16} 
                color={geminiStatus.connected ? '#10B981' : '#EF4444'} 
              />
              <Text style={styles.geminiText}>
                Gemini AI: {geminiStatus.connected ? 'Sẵn sàng' : 'Không kết nối'}
              </Text>
            </View>
          )}
        </View>

        {/* API List */}
        <Text style={styles.sectionTitle}>Chi tiết các API</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Đang kiểm tra APIs...</Text>
          </View>
        ) : (
          <View style={styles.apiList}>
            {apiStatuses.map((api, index) => (
              <APICard key={index} api={api} />
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Hành động nhanh</Text>
          
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push('/(tabs)/ai-assistant')}
          >
            <Ionicons name="sparkles" size={20} color="#8B5CF6" />
            <Text style={styles.actionText}>Mở AI Assistant</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={handleRefresh}
          >
            <Ionicons name="refresh-circle" size={20} color="#10B981" />
            <Text style={styles.actionText}>Kiểm tra lại tất cả</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Info Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Cập nhật: {new Date().toLocaleString('vi-VN')}
          </Text>
          <Text style={styles.footerNote}>
            Xem chi tiết tại API_STATUS_GUIDE.md
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  refreshBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
  },
  geminiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    justifyContent: 'center',
  },
  geminiText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
  },
  apiList: {
    gap: 12,
    marginBottom: 24,
  },
  apiCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
  },
  apiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  apiIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  apiInfo: {
    flex: 1,
  },
  apiName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  apiDescription: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  apiDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 13,
    color: '#e2e8f0',
    flex: 1,
    textAlign: 'right',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
  footerNote: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
  },
});
