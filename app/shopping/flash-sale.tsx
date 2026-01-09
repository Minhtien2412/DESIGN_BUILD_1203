import { Colors } from '@/constants/theme';
import { getFlashSaleProducts, type Product } from '@/services/api/products.service';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function FlashSaleScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const data = await getFlashSaleProducts(20);
      setProducts(data);
    } catch (error) {
      console.error('[FlashSale] Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return Math.round(price * (1 - discount / 100));
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#0066CC',
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
          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
            <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>{products.length} SP</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={{ marginTop: 12, color: Colors.light.textMuted }}>Đang tải Flash Sale...</Text>
        </View>
      ) : (
        <ScrollView 
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadProducts(true)} colors={['#0066CC']} />
          }
        >
          <View style={{ padding: 16, gap: 12 }}>
            {products.map((product) => {
              const originalPrice = product.price;
              const salePrice = getDiscountedPrice(originalPrice, product.discountPercent);
              const stock = product.stock || 50;
              const sold = product.soldCount || Math.floor(Math.random() * 200) + 50;

              return (
                <TouchableOpacity
                  key={product.id}
                  onPress={() => router.push(`/product/${product.id}`)}
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
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {product.image?.uri ? (
                      <Image source={{ uri: product.image.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <Ionicons name="cube-outline" size={48} color="#0066CC" />
                    )}
                    {product.discountPercent && (
                      <View style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: '#FF3B30',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6
                      }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFF' }}>
                          -{product.discountPercent}%
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.light.text, marginBottom: 6 }} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: '#0066CC' }}>
                          {formatPrice(salePrice)}
                        </Text>
                        {product.discountPercent && (
                          <Text style={{
                            fontSize: 13,
                            color: Colors.light.textMuted,
                            textDecorationLine: 'line-through'
                          }}>
                            {formatPrice(originalPrice)}
                          </Text>
                        )}
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
                          width: `${Math.min((sold / (sold + stock)) * 100, 100)}%`,
                          height: '100%',
                          backgroundColor: '#0066CC'
                        }} />
                      </View>
                      <Text style={{ fontSize: 11, color: Colors.light.textMuted }}>
                        Đã bán {sold} | Còn {stock}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {products.length === 0 && !loading && (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <Ionicons name="flash-off-outline" size={64} color={Colors.light.textMuted} />
                <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '600', color: Colors.light.text }}>
                  Chưa có sản phẩm Flash Sale
                </Text>
                <Text style={{ marginTop: 8, color: Colors.light.textMuted, textAlign: 'center' }}>
                  Quay lại sau để xem các ưu đãi hấp dẫn
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
