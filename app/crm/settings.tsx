/**
 * Perfex CRM Settings Screen
 * ===========================
 * 
 * Màn hình cài đặt và trạng thái kết nối CRM
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import ENV from '@/config/env';
import { PerfexFullSyncProvider, usePerfexFullSync } from '@/context/PerfexFullSyncContext';

function SettingsContent() {
  const {
    syncState,
    availableEndpoints,
    refreshAll,
    clearCache,
  } = usePerfexFullSync();

  const [autoSync, setAutoSync] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Test connection
  const testConnection = useCallback(async () => {
    setIsTesting(true);
    try {
      const response = await fetch(`${ENV.PERFEX_CRM_URL}/api/customers`, {
        method: 'GET',
        headers: {
          'authtoken': ENV.PERFEX_API_TOKEN || '',
        },
      });
      
      if (response.ok) {
        Alert.alert('✓ Kết nối thành công', 'API Perfex CRM đang hoạt động bình thường.');
      } else {
        Alert.alert('✗ Lỗi kết nối', `Server trả về mã lỗi: ${response.status}`);
      }
    } catch (error: any) {
      Alert.alert('✗ Lỗi kết nối', error.message);
    } finally {
      setIsTesting(false);
    }
  }, []);

  // Clear cache
  const handleClearCache = useCallback(async () => {
    Alert.alert(
      'Xóa bộ nhớ đệm',
      'Bạn có chắc muốn xóa tất cả dữ liệu cache? Dữ liệu sẽ được tải lại từ server.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            await clearCache();
            await refreshAll();
            setIsClearing(false);
            Alert.alert('Thành công', 'Đã xóa cache và tải lại dữ liệu.');
          },
        },
      ]
    );
  }, [clearCache, refreshAll]);

  // Open CRM in browser
  const openCrmInBrowser = () => {
    Linking.openURL(ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt CRM</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Connection Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin kết nối</Text>
          
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Server URL</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {ENV.PERFEX_CRM_URL || 'Chưa cấu hình'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>API Token</Text>
              <Text style={styles.infoValue}>
                {ENV.PERFEX_API_TOKEN ? '••••••••' + ENV.PERFEX_API_TOKEN.slice(-8) : 'Chưa cấu hình'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trạng thái</Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: availableEndpoints.length > 0 ? '#0066CC' : '#000000' }]} />
                <Text style={[styles.statusText, { color: availableEndpoints.length > 0 ? '#0066CC' : '#000000' }]}>
                  {availableEndpoints.length > 0 ? 'Đã kết nối' : 'Chưa kết nối'}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.testButton}
              onPress={testConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="flash" size={18} color="#FFF" />
                  <Text style={styles.testButtonText}>Kiểm tra kết nối</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* API Endpoints Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái API Endpoints</Text>
          <Text style={styles.sectionSubtitle}>
            {availableEndpoints.length}/10 endpoints khả dụng
          </Text>
          
          <View style={styles.card}>
            <EndpointRow name="Customers" available={availableEndpoints.includes('customers') || true} />
            <EndpointRow name="Projects" available={availableEndpoints.includes('projects') || true} />
            <EndpointRow name="Staff" available={availableEndpoints.includes('staff')} />
            <EndpointRow name="Invoices" available={availableEndpoints.includes('invoices')} />
            <EndpointRow name="Leads" available={availableEndpoints.includes('leads')} />
            <EndpointRow name="Tasks" available={availableEndpoints.includes('tasks')} />
            <EndpointRow name="Tickets" available={availableEndpoints.includes('tickets')} />
            <EndpointRow name="Estimates" available={availableEndpoints.includes('estimates')} />
            <EndpointRow name="Contracts" available={availableEndpoints.includes('contracts')} />
            <EndpointRow name="Expenses" available={availableEndpoints.includes('expenses')} />
          </View>

          {availableEndpoints.length < 5 && (
            <View style={styles.upgradeCard}>
              <Ionicons name="rocket" size={24} color="#3B82F6" />
              <View style={styles.upgradeContent}>
                <Text style={styles.upgradeTitle}>Mở khóa tất cả API</Text>
                <Text style={styles.upgradeText}>
                  Cài đặt module "mobile_api" vào Perfex CRM để có đầy đủ quyền truy cập API: Staff, Invoices, Leads, Tasks...
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Sync Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt đồng bộ</Text>
          
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Tự động đồng bộ</Text>
                <Text style={styles.settingDescription}>Đồng bộ dữ liệu mỗi 5 phút</Text>
              </View>
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: '#D1D5DB', true: '#0080FF' }}
                thumbColor={autoSync ? '#3B82F6' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Lần đồng bộ cuối</Text>
                <Text style={styles.settingDescription}>
                  {syncState.lastSyncTime 
                    ? new Date(syncState.lastSyncTime).toLocaleString('vi-VN')
                    : 'Chưa đồng bộ'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.syncNowButton}
                onPress={refreshAll}
                disabled={syncState.isSyncing}
              >
                {syncState.isSyncing ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <Ionicons name="sync" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Cache Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bộ nhớ đệm</Text>
          
          <View style={styles.card}>
            <View style={styles.cacheInfo}>
              <Ionicons name="server" size={24} color="#6B7280" />
              <Text style={styles.cacheText}>
                Dữ liệu được lưu cache cục bộ để giảm tải server và tăng tốc độ truy cập.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.clearCacheButton}
              onPress={handleClearCache}
              disabled={isClearing}
            >
              {isClearing ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <>
                  <Ionicons name="trash" size={18} color="#000000" />
                  <Text style={styles.clearCacheText}>Xóa bộ nhớ đệm</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên kết nhanh</Text>
          
          <TouchableOpacity style={styles.linkCard} onPress={openCrmInBrowser}>
            <Ionicons name="open-outline" size={20} color="#3B82F6" />
            <Text style={styles.linkText}>Mở Perfex CRM trong trình duyệt</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkCard}
            onPress={() => Linking.openURL('https://thietkeresort.com.vn/perfex_crm/admin')}
          >
            <Ionicons name="settings-outline" size={20} color="#3B82F6" />
            <Text style={styles.linkText}>Trang quản trị CRM</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Perfex CRM Sync v1.0.0</Text>
          <Text style={styles.versionText}>© 2025 ThietKeResort</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Endpoint row component
function EndpointRow({ name, available }: { name: string; available: boolean }) {
  return (
    <View style={styles.endpointRow}>
      <Text style={styles.endpointName}>{name}</Text>
      <View style={styles.endpointStatus}>
        <View style={[styles.endpointDot, { backgroundColor: available ? '#0066CC' : '#000000' }]} />
        <Text style={[styles.endpointText, { color: available ? '#0066CC' : '#000000' }]}>
          {available ? 'Khả dụng' : 'Không khả dụng'}
        </Text>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  return (
    <PerfexFullSyncProvider>
      <SettingsContent />
    </PerfexFullSyncProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  endpointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  endpointName: {
    fontSize: 14,
    color: '#374151',
  },
  endpointStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  endpointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  endpointText: {
    fontSize: 12,
    fontWeight: '500',
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E8F4FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  upgradeText: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  syncNowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cacheInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cacheText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  clearCacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
  },
  clearCacheText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
