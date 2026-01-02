/**
 * Perfex CRM - Customers Screen
 * ==============================
 * 
 * Màn hình quản lý khách hàng từ Perfex CRM
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Linking,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { PerfexFullSyncProvider, usePerfexCustomers, usePerfexFullSync } from '@/context/PerfexFullSyncContext';
import { Customer, formatDate } from '@/services/perfexFullSync';

function CustomersContent() {
  const { customers, isLoading, refresh } = usePerfexCustomers();
  const { getProjectsByCustomer } = usePerfexFullSync();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    
    const q = searchQuery.toLowerCase();
    return customers.filter(c =>
      c.company.toLowerCase().includes(q) ||
      c.phonenumber?.includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Handle call
  const handleCall = (phone: string) => {
    if (!phone) return;
    const url = `tel:${phone}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi');
      }
    });
  };

  // Stats
  const stats = useMemo(() => ({
    total: customers.length,
    active: customers.filter(c => c.active === '1').length,
  }), [customers]);

  const renderCustomer = ({ item }: { item: Customer }) => {
    const projectCount = getProjectsByCustomer(item.userid).length;
    
    return (
      <TouchableOpacity style={styles.customerCard} activeOpacity={0.7}>
        <View style={styles.customerHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.company.charAt(0).toUpperCase()}
              </Text>
            </View>
            {item.active === '1' && <View style={styles.activeIndicator} />}
          </View>
          
          <View style={styles.customerInfo}>
            <Text style={styles.customerName} numberOfLines={1}>{item.company}</Text>
            <Text style={styles.customerCity}>{item.city || 'Chưa có địa chỉ'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.callButton}
            onPress={() => handleCall(item.phonenumber)}
          >
            <Ionicons name="call" size={18} color="#10B981" />
          </TouchableOpacity>
        </View>

        <View style={styles.customerDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{item.phonenumber || 'N/A'}</Text>
          </View>
          
          {item.website && (
            <View style={styles.detailRow}>
              <Ionicons name="globe-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText} numberOfLines={1}>{item.website}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.address?.replace(/<br \/>/g, ', ') || 'Chưa có địa chỉ'}
            </Text>
          </View>
        </View>

        <View style={styles.customerFooter}>
          <View style={styles.footerLeft}>
            <View style={styles.projectBadge}>
              <Ionicons name="folder" size={12} color="#3B82F6" />
              <Text style={styles.projectCount}>{projectCount} dự án</Text>
            </View>
          </View>
          <Text style={styles.dateCreated}>Tạo: {formatDate(item.datecreated)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khách hàng</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={22} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.active}</Text>
          <Text style={styles.statLabel}>Hoạt động</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#6B7280' }]}>{stats.total - stats.active}</Text>
          <Text style={styles.statLabel}>Không hoạt động</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm khách hàng..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={item => item.userid}
        renderItem={renderCustomer}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

export default function CustomersScreen() {
  return (
    <PerfexFullSyncProvider>
      <CustomersContent />
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
  refreshButton: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  customerCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  customerCity: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerDetails: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  customerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  projectCount: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  dateCreated: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});
