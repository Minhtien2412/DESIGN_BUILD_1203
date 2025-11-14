import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type IconName = 'hammer' | 'grid' | 'color-palette';

const FLASH_SALE_PRODUCTS = [
  {
    id: '1',
    name: 'Xi măng INSEE',
    originalPrice: 100000,
    salePrice: 50000,
    discount: 50,
    icon: 'hammer' as IconName,
    iconColor: '#795548',
    stock: 45,
    sold: 155,
  },
  {
    id: '2',
    name: 'Gạch men cao cấp',
    originalPrice: 150000,
    salePrice: 75000,
    discount: 50,
    icon: 'grid' as IconName,
    iconColor: '#FF9800',
    stock: 32,
    sold: 168,
  },
  {
    id: '3',
    name: 'Sơn nước Dulux',
    originalPrice: 800000,
    salePrice: 400000,
    discount: 50,
    icon: 'color-palette' as IconName,
    iconColor: '#2196F3',
    stock: 28,
    sold: 92,
  },
];

export default function FlashSaleScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#FF5722',
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
              <Ionicons name="flash" size={24} color="#FFF" />
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF' }}>
                Flash Sale
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
              Kết thúc sau: 02:45:32
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16, gap: 12 }}>
          {FLASH_SALE_PRODUCTS.map((product) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => router.push(`/shopping/product/${product.id}`)}
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
                width: 100,
                height: 100,
                borderRadius: 12,
                backgroundColor: Colors.light.background,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}>
                <Ionicons name={product.icon} size={48} color={product.iconColor} />
                <View style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  backgroundColor: '#FF5722',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6
                }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFF' }}>
                    -{product.discount}%
                  </Text>
                </View>
              </View>

              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.light.text, marginBottom: 6 }}>
                    {product.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#FF5722' }}>
                      {product.salePrice.toLocaleString('vi-VN')}₫
                    </Text>
                    <Text style={{
                      fontSize: 13,
                      color: Colors.light.textMuted,
                      textDecorationLine: 'line-through'
                    }}>
                      {product.originalPrice.toLocaleString('vi-VN')}₫
                    </Text>
                  </View>
                </View>

                <View style={{ gap: 6 }}>
                  <View style={{
                    backgroundColor: Colors.light.background,
                    borderRadius: 8,
                    height: 8,
                    overflow: 'hidden'
                  }}>
                    <View style={{
                      width: `${(product.sold / (product.sold + product.stock)) * 100}%`,
                      height: '100%',
                      backgroundColor: '#FF5722'
                    }} />
                  </View>
                  <Text style={{ fontSize: 11, color: Colors.light.textMuted }}>
                    Đã bán {product.sold} | Còn {product.stock}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
