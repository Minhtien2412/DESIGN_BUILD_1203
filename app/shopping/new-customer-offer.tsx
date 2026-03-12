import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const BENEFITS = [
  {
    icon: 'gift' as const,
    title: 'Tặng voucher 200K',
    description: 'Cho đơn hàng đầu tiên từ 500K',
  },
  {
    icon: 'pricetag' as const,
    title: 'Giảm 10% đơn thứ 2',
    description: 'Áp dụng cho đơn hàng tiếp theo',
  },
  {
    icon: 'car' as const,
    title: 'Miễn phí vận chuyển',
    description: 'Cho đơn đầu tiên từ 300K',
  },
  {
    icon: 'shield-checkmark' as const,
    title: 'Ưu tiên bảo hành',
    description: 'Hỗ trợ 24/7 cho khách mới',
  },
];

export default function NewCustomerOfferScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#0D9488',
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
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="gift" size={24} color="#FFF" />
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF' }}>
                Ưu đãi khách mới
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
              Quà tặng đặc biệt cho khách hàng mới
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Hero Banner */}
        <View style={{
          backgroundColor: '#0D9488',
          marginHorizontal: 16,
          marginTop: 16,
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          shadowColor: '#0D9488',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4
        }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <Ionicons name="gift" size={40} color="#FFF" />
          </View>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 8 }}>
            200.000₫
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.95)', textAlign: 'center' }}>
            Voucher chào mừng
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 8 }}>
            Dành cho đơn đầu tiên từ 500.000₫
          </Text>
        </View>

        {/* Benefits */}
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.light.text, marginBottom: 16 }}>
            Đặc quyền khách hàng mới
          </Text>
          <View style={{ gap: 12 }}>
            {BENEFITS.map((benefit, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  gap: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#E8F5E9',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Ionicons name={benefit.icon} size={24} color="#0D9488" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.light.text, marginBottom: 4 }}>
                    {benefit.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: Colors.light.textMuted, lineHeight: 18 }}>
                    {benefit.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={{ padding: 16, paddingTop: 8 }}>
          <TouchableOpacity
            onPress={() => router.push('/projects')}
            style={{
              backgroundColor: '#0D9488',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 16
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>
              Mua sắm ngay
            </Text>
          </TouchableOpacity>

          <View style={{
            backgroundColor: '#FFF9E6',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            gap: 12,
            marginBottom: 24
          }}>
            <Ionicons name="information-circle" size={24} color="#0D9488" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: '#92400E', lineHeight: 18 }}>
                Ưu đãi chỉ áp dụng một lần cho mỗi tài khoản mới. Voucher có hiệu lực trong 30 ngày kể từ ngày đăng ký.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
