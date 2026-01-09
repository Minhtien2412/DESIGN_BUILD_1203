/**
 * Utilities History Screen
 * View all saved cost estimates, appointments, and quotes
 */
import { Colors } from '@/constants/theme';
import { useUtilities } from '@/context/UtilitiesContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type Tab = 'estimates' | 'appointments' | 'quotes';

export default function HistoryScreen() {
  const {
    costEstimates,
    appointments,
    quotes,
    deleteCostEstimate,
    deleteAppointment,
    deleteQuote,
  } = useUtilities();

  const [activeTab, setActiveTab] = useState<Tab>('estimates');

  const handleDelete = (type: Tab, id: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa mục này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              if (type === 'estimates') await deleteCostEstimate(id);
              else if (type === 'appointments') await deleteAppointment(id);
              else if (type === 'quotes') await deleteQuote(id);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa mục này');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#0066CC',
      confirmed: '#0066CC',
      cancelled: '#000000',
      completed: '#6B7280',
      'in-review': '#3B82F6',
      quoted: '#666666',
      accepted: '#0066CC',
      rejected: '#000000',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      cancelled: 'Đã hủy',
      completed: 'Hoàn thành',
      'in-review': 'Đang xem xét',
      quoted: 'Đã báo giá',
      accepted: 'Đã chấp nhận',
      rejected: 'Từ chối',
    };
    return labels[status] || status;
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: Colors.light.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 16,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF', flex: 1 }}>
            Lịch sử & Quản lý
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20 }}>
          Xem và quản lý dự toán, lịch hẹn, yêu cầu báo giá
        </Text>
      </View>

      {/* Tabs */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 8
      }}>
        <TouchableOpacity
          onPress={() => setActiveTab('estimates')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderBottomWidth: 3,
            borderBottomColor: activeTab === 'estimates' ? Colors.light.primary : 'transparent',
            alignItems: 'center'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons
              name="calculator"
              size={18}
              color={activeTab === 'estimates' ? Colors.light.primary : '#9CA3AF'}
            />
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: activeTab === 'estimates' ? Colors.light.primary : '#9CA3AF'
            }}>
              Dự toán ({costEstimates.length})
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('appointments')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderBottomWidth: 3,
            borderBottomColor: activeTab === 'appointments' ? Colors.light.primary : 'transparent',
            alignItems: 'center'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons
              name="calendar"
              size={18}
              color={activeTab === 'appointments' ? Colors.light.primary : '#9CA3AF'}
            />
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: activeTab === 'appointments' ? Colors.light.primary : '#9CA3AF'
            }}>
              Lịch hẹn ({appointments.length})
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('quotes')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderBottomWidth: 3,
            borderBottomColor: activeTab === 'quotes' ? Colors.light.primary : 'transparent',
            alignItems: 'center'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons
              name="document-text"
              size={18}
              color={activeTab === 'quotes' ? Colors.light.primary : '#9CA3AF'}
            />
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: activeTab === 'quotes' ? Colors.light.primary : '#9CA3AF'
            }}>
              Báo giá ({quotes.length})
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1, backgroundColor: '#FFF' }}>
        <View style={{ padding: 16, gap: 12 }}>
          {/* Cost Estimates */}
          {activeTab === 'estimates' && (
            <>
              {costEstimates.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="calculator-outline" size={64} color="#D1D5DB" />
                  <Text style={{ fontSize: 16, color: '#9CA3AF', marginTop: 16 }}>
                    Chưa có dự toán nào
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/utilities/cost-estimator')}
                    style={{
                      backgroundColor: Colors.light.primary,
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 12,
                      marginTop: 16
                    }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '600' }}>Tạo dự toán</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                costEstimates.map((estimate) => (
                  <View
                    key={estimate.id}
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: '#E5E7EB'
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 4 }}>
                          {estimate.projectName || 'Dự toán công trình'}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>
                          {formatDate(estimate.createdAt)}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete('estimates', estimate.id)}>
                        <Ionicons name="trash-outline" size={20} color="#000000" />
                      </TouchableOpacity>
                    </View>

                    <View style={{ gap: 8 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, color: '#6B7280' }}>Diện tích:</Text>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text }}>
                          {estimate.area} m²
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, color: '#6B7280' }}>Số tầng:</Text>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text }}>
                          {estimate.floors}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, color: '#6B7280' }}>Hạng mục:</Text>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text }}>
                          {estimate.category === 'basic' ? 'Cơ bản' : estimate.category === 'standard' ? 'Tiêu chuẩn' : 'Cao cấp'}
                        </Text>
                      </View>
                      <View style={{
                        marginTop: 8,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: '#E5E7EB',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280' }}>Tổng dự toán:</Text>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.light.primary }}>
                          {estimate.estimatedCost.toLocaleString('vi-VN')} ₫
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* Appointments */}
          {activeTab === 'appointments' && (
            <>
              {appointments.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
                  <Text style={{ fontSize: 16, color: '#9CA3AF', marginTop: 16 }}>
                    Chưa có lịch hẹn nào
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/utilities/schedule')}
                    style={{
                      backgroundColor: Colors.light.primary,
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 12,
                      marginTop: 16
                    }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '600' }}>Đặt lịch hẹn</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                appointments.map((appointment) => (
                  <View
                    key={appointment.id}
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: '#E5E7EB'
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 4 }}>
                          {appointment.name}
                        </Text>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          marginTop: 4
                        }}>
                          <View style={{
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 6,
                            backgroundColor: getStatusColor(appointment.status) + '20'
                          }}>
                            <Text style={{
                              fontSize: 11,
                              fontWeight: '600',
                              color: getStatusColor(appointment.status)
                            }}>
                              {getStatusLabel(appointment.status)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete('appointments', appointment.id)}>
                        <Ionicons name="trash-outline" size={20} color="#000000" />
                      </TouchableOpacity>
                    </View>

                    <View style={{ gap: 8 }}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Ionicons name="call" size={16} color="#6B7280" />
                        <Text style={{ fontSize: 14, color: '#6B7280' }}>{appointment.phone}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Ionicons name="calendar" size={16} color="#6B7280" />
                        <Text style={{ fontSize: 14, color: '#6B7280' }}>
                          {formatDate(appointment.date)}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Ionicons name="time" size={16} color="#6B7280" />
                        <Text style={{ fontSize: 14, color: '#6B7280' }}>
                          {appointment.timeSlot}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* Quotes */}
          {activeTab === 'quotes' && (
            <>
              {quotes.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
                  <Text style={{ fontSize: 16, color: '#9CA3AF', marginTop: 16 }}>
                    Chưa có yêu cầu báo giá nào
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/utilities/quote-request')}
                    style={{
                      backgroundColor: Colors.light.primary,
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 12,
                      marginTop: 16
                    }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '600' }}>Yêu cầu báo giá</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                quotes.map((quote) => (
                  <View
                    key={quote.id}
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: '#E5E7EB'
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 4 }}>
                          {quote.name}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
                          {quote.selectedService}
                        </Text>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          marginTop: 4
                        }}>
                          <View style={{
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 6,
                            backgroundColor: getStatusColor(quote.status) + '20'
                          }}>
                            <Text style={{
                              fontSize: 11,
                              fontWeight: '600',
                              color: getStatusColor(quote.status)
                            }}>
                              {getStatusLabel(quote.status)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete('quotes', quote.id)}>
                        <Ionicons name="trash-outline" size={20} color="#000000" />
                      </TouchableOpacity>
                    </View>

                    <View style={{ gap: 8 }}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Ionicons name="call" size={16} color="#6B7280" />
                        <Text style={{ fontSize: 14, color: '#6B7280' }}>{quote.phone}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Ionicons name="calendar" size={16} color="#6B7280" />
                        <Text style={{ fontSize: 14, color: '#6B7280' }}>
                          {formatDate(quote.createdAt)}
                        </Text>
                      </View>
                      {quote.description && (
                        <View style={{
                          marginTop: 8,
                          paddingTop: 8,
                          borderTopWidth: 1,
                          borderTopColor: '#E5E7EB'
                        }}>
                          <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 18 }}>
                            {quote.description}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
