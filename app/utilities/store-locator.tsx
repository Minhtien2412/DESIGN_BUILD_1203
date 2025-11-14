import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  isOpen: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string;
}

const STORES: Store[] = [
  {
    id: '1',
    name: 'Chi nhánh Quận 1',
    address: '123 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM',
    phone: '028 3822 1234',
    distance: '1.2 km',
    isOpen: true,
    coordinates: {
      latitude: 10.7759,
      longitude: 106.7005,
    },
    openingHours: '8:00 - 18:00',
  },
  {
    id: '2',
    name: 'Chi nhánh Quận 3',
    address: '456 Võ Văn Tần, P.5, Q.3, TP.HCM',
    phone: '028 3933 4567',
    distance: '2.5 km',
    isOpen: true,
    coordinates: {
      latitude: 10.7819,
      longitude: 106.6918,
    },
    openingHours: '8:00 - 18:00',
  },
  {
    id: '3',
    name: 'Chi nhánh Thủ Đức',
    address: '789 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức, TP.HCM',
    phone: '028 3897 7890',
    distance: '8.3 km',
    isOpen: false,
    coordinates: {
      latitude: 10.8505,
      longitude: 106.7719,
    },
    openingHours: '8:00 - 17:00 (T2-T6)',
  },
];

export default function StoreLocatorScreen() {
  // Open directions in Maps app
  const handleDirections = (store: Store) => {
    const { latitude, longitude } = store.coordinates;
    const label = encodeURIComponent(store.name);
    
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ');
        }
      })
      .catch((err) => {
        console.error('Error opening maps:', err);
        Alert.alert('Lỗi', 'Không thể mở chỉ đường');
      });
  };

  // Make phone call
  const handleCall = (phone: string) => {
    const phoneNumber = phone.replace(/\s/g, '');
    const url = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi');
        }
      })
      .catch((err) => {
        console.error('Error making call:', err);
        Alert.alert('Lỗi', 'Không thể gọi điện');
      });
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
            Tìm cửa hàng
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20 }}>
          Tìm chi nhánh gần bạn nhất
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16, gap: 12 }}>
          {STORES.map((store) => (
            <View
              key={store.id}
              style={{
                backgroundColor: '#FFF',
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 4 }}>
                    {store.name}
                  </Text>
                  <View style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: store.isOpen ? '#DCFCE7' : '#FEE2E2',
                    alignSelf: 'flex-start'
                  }}>
                    <Text style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: store.isOpen ? '#15803D' : '#991B1B'
                    }}>
                      {store.isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}
                    </Text>
                  </View>
                </View>
                <View style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: Colors.light.primary + '15'
                }}>
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: Colors.light.primary
                  }}>
                    {store.distance}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 8, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Ionicons name="location" size={16} color={Colors.light.textMuted} />
                  <Text style={{ fontSize: 13, color: Colors.light.textMuted, flex: 1, lineHeight: 18 }}>
                    {store.address}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Ionicons name="call" size={16} color={Colors.light.textMuted} />
                  <Text style={{ fontSize: 13, color: Colors.light.textMuted, lineHeight: 18 }}>
                    {store.phone}
                  </Text>
                </View>
                {store.openingHours && (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Ionicons name="time" size={16} color={Colors.light.textMuted} />
                    <Text style={{ fontSize: 13, color: Colors.light.textMuted, lineHeight: 18 }}>
                      {store.openingHours}
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => handleDirections(store)}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor: Colors.light.primary,
                    paddingVertical: 12,
                    borderRadius: 12,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Ionicons name="navigate" size={18} color="#FFF" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFF' }}>
                    Chỉ đường
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleCall(store.phone)}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFF',
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: Colors.light.border,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Ionicons name="call-outline" size={18} color={Colors.light.primary} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.primary }}>
                    Gọi ngay
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
