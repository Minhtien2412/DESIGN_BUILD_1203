import { useThemeColor } from '@/hooks/use-theme-color';
import { useHealthCheck } from '@/hooks/usePayment';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentHomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');
  
  const { healthCheck, isHealthy, loading } = useHealthCheck();

  React.useEffect(() => {
    healthCheck();
  }, [healthCheck]);

  const navigateToCreate = () => {
    router.push('/payments/create' as any);
  };

  const navigateToList = () => {
    router.push('/payments/list' as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Thanh toán</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={[styles.welcomeCard, { backgroundColor: tintColor }]}>
          <Ionicons name="wallet-outline" size={48} color="white" />
          <Text style={styles.welcomeTitle}>Quản lý thanh toán</Text>
          <Text style={styles.welcomeSubtitle}>
            Tạo và theo dõi các giao dịch thanh toán của bạn
          </Text>
        </View>

        {/* API Status */}
        <View style={[styles.statusCard, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusTitle, { color: textColor }]}>Trạng thái hệ thống</Text>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: loading ? '#FF9800' : isHealthy ? '#4CAF50' : '#F44336' }
            ]}>
              <Ionicons 
                name={loading ? 'time-outline' : isHealthy ? 'checkmark-circle' : 'alert-circle'} 
                size={14} 
                color="white" 
              />
              <Text style={styles.statusText}>
                {loading ? 'Kiểm tra' : isHealthy ? 'Hoạt động' : 'Lỗi'}
              </Text>
            </View>
          </View>
          <Text style={[styles.statusDescription, { color: textColor }]}>
            {loading
              ? 'Đang kiểm tra kết nối API...'
              : isHealthy
              ? 'Hệ thống thanh toán hoạt động bình thường'
              : 'Không thể kết nối đến hệ thống thanh toán'
            }
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Thao tác nhanh</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: cardColor, borderColor }]}
              onPress={navigateToCreate}
            >
              <View style={[styles.actionIcon, { backgroundColor: tintColor + '20' }]}>
                <Ionicons name="add-circle-outline" size={32} color={tintColor} />
              </View>
              <Text style={[styles.actionTitle, { color: textColor }]}>Tạo giao dịch</Text>
              <Text style={[styles.actionSubtitle, { color: textColor }]}>
                Tạo giao dịch thanh toán mới
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: cardColor, borderColor }]}
              onPress={navigateToList}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#22c55e20' }]}>
                <Ionicons name="list-outline" size={32} color="#22c55e" />
              </View>
              <Text style={[styles.actionTitle, { color: textColor }]}>Lịch sử</Text>
              <Text style={[styles.actionSubtitle, { color: textColor }]}>
                Xem danh sách giao dịch
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Section */}
        <View style={[styles.featuresCard, { backgroundColor: cardColor, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Tính năng hỗ trợ</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#4CAF5020' }]}>
                <Ionicons name="card-outline" size={20} color="#4CAF50" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: textColor }]}>
                  Thanh toán VND
                </Text>
                <Text style={[styles.featureDescription, { color: textColor }]}>
                  Hỗ trợ đầy đủ tiền tệ Việt Nam
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#2196F320' }]}>
                <Ionicons name="flash-outline" size={20} color="#2196F3" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: textColor }]}>
                  Xác nhận tức thì
                </Text>
                <Text style={[styles.featureDescription, { color: textColor }]}>
                  Giao dịch được xử lý ngay lập tức
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#FF980020' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#FF9800" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: textColor }]}>
                  Bảo mật cao
                </Text>
                <Text style={[styles.featureDescription, { color: textColor }]}>
                  Dữ liệu được mã hóa và bảo vệ
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="analytics-outline" size={20} color="#0A6847" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: textColor }]}>
                  Theo dõi chi tiết
                </Text>
                <Text style={[styles.featureDescription, { color: textColor }]}>
                  Lưu trữ metadata và lịch sử đầy đủ
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  welcomeCard: {
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  statusCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  actionsContainer: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 16,
  },
  featuresCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
});
