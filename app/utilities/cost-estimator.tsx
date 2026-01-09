import { Colors } from '@/constants/theme';
import { useUtilities } from '@/context/UtilitiesContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CostEstimatorScreen() {
  const { addCostEstimate, costEstimates } = useUtilities();
  const [area, setArea] = useState('');
  const [floors, setFloors] = useState('1');
  const [category, setCategory] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [projectName, setProjectName] = useState('');
  const [saving, setSaving] = useState(false);

  const calculateCost = () => {
    const areaNum = parseFloat(area);
    const floorsNum = parseInt(floors);
    
    if (isNaN(areaNum) || isNaN(floorsNum) || areaNum <= 0 || floorsNum <= 0) {
      return 0;
    }

    const pricePerSqm = {
      basic: 3500000,      // 3.5M VND/m²
      standard: 5000000,   // 5M VND/m²
      premium: 8000000,    // 8M VND/m²
    };

    return areaNum * floorsNum * pricePerSqm[category];
  };

  const handleSaveEstimate = async () => {
    const areaNum = parseFloat(area);
    const floorsNum = parseInt(floors);

    if (isNaN(areaNum) || isNaN(floorsNum) || areaNum <= 0 || floorsNum <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập diện tích và số tầng hợp lệ');
      return;
    }

    setSaving(true);
    try {
      await addCostEstimate({
        area: areaNum,
        floors: floorsNum,
        category,
        projectName: projectName.trim() || undefined,
      });

      Alert.alert(
        'Thành công',
        'Dự toán đã được lưu vào lịch sử',
        [
          { text: 'Xem lịch sử', onPress: () => router.push('/utilities/history') },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu dự toán. Vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  const estimatedCost = calculateCost();

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
            Dự toán chi phí
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20 }}>
          Ước tính chi phí xây dựng cho công trình của bạn
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Input Section */}
        <View style={{ backgroundColor: '#FFF', marginTop: 16, marginHorizontal: 16, borderRadius: 16, padding: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 16 }}>
            Thông tin công trình
          </Text>

          {/* Project Name */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text, marginBottom: 8 }}>
              Tên công trình (tùy chọn)
            </Text>
            <TextInput
              value={projectName}
              onChangeText={setProjectName}
              placeholder="VD: Nhà phố 3 tầng"
              style={{
                borderWidth: 1,
                borderColor: Colors.light.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 15,
                color: Colors.light.text
              }}
            />
          </View>

          {/* Area Input */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text, marginBottom: 8 }}>
              Diện tích (m²)
            </Text>
            <TextInput
              value={area}
              onChangeText={setArea}
              placeholder="Nhập diện tích"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: Colors.light.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 15,
                color: Colors.light.text
              }}
            />
          </View>

          {/* Floors Input */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text, marginBottom: 8 }}>
              Số tầng
            </Text>
            <TextInput
              value={floors}
              onChangeText={setFloors}
              placeholder="Nhập số tầng"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: Colors.light.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 15,
                color: Colors.light.text
              }}
            />
          </View>

          {/* Category Selection */}
          <View style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text, marginBottom: 8 }}>
              Hạng mục
            </Text>
            <View style={{ gap: 8 }}>
              {[
                { key: 'basic' as const, label: 'Cơ bản', price: '3.5 triệu/m²' },
                { key: 'standard' as const, label: 'Tiêu chuẩn', price: '5 triệu/m²' },
                { key: 'premium' as const, label: 'Cao cấp', price: '8 triệu/m²' },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setCategory(cat.key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: category === cat.key ? Colors.light.primary : Colors.light.border,
                    backgroundColor: category === cat.key ? Colors.light.primary + '10' : '#FFF'
                  }}
                >
                  <View>
                    <Text style={{
                      fontSize: 15,
                      fontWeight: '600',
                      color: category === cat.key ? Colors.light.primary : Colors.light.text
                    }}>
                      {cat.label}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: Colors.light.textMuted,
                      marginTop: 2
                    }}>
                      {cat.price}
                    </Text>
                  </View>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: category === cat.key ? Colors.light.primary : Colors.light.border,
                    backgroundColor: category === cat.key ? Colors.light.primary : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {category === cat.key && (
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Result Section */}
        {estimatedCost > 0 && (
          <>
            <View style={{
              backgroundColor: Colors.light.primary,
              marginTop: 16,
              marginHorizontal: 16,
              borderRadius: 16,
              padding: 20,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginBottom: 8 }}>
                Dự toán ước tính
              </Text>
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 4 }}>
                {estimatedCost.toLocaleString('vi-VN')} ₫
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                * Chỉ mang tính chất tham khảo
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={{
                backgroundColor: Colors.light.primary,
                marginHorizontal: 16,
                marginTop: 12,
                borderRadius: 12,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: saving ? 0.6 : 1
              }}
              activeOpacity={0.7}
              onPress={handleSaveEstimate}
              disabled={saving}
            >
              <Ionicons name={saving ? "hourglass" : "save"} size={20} color="#FFF" />
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFF' }}>
                {saving ? 'Đang lưu...' : 'Lưu dự toán'}
              </Text>
            </TouchableOpacity>

            {/* View History Button */}
            {costEstimates.length > 0 && (
              <TouchableOpacity
                style={{
                  backgroundColor: '#F3F4F6',
                  marginHorizontal: 16,
                  marginTop: 8,
                  borderRadius: 12,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
                activeOpacity={0.7}
                onPress={() => router.push('/utilities/history')}
              >
                <Ionicons name="time" size={20} color={Colors.light.primary} />
                <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.light.primary }}>
                  Xem lịch sử ({costEstimates.length})
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Info */}
        <View style={{
          backgroundColor: '#FFF9E6',
          marginHorizontal: 16,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          flexDirection: 'row',
          gap: 12
        }}>
          <Ionicons name="information-circle" size={24} color="#0066CC" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: '#92400E', lineHeight: 18 }}>
              Giá trên chưa bao gồm chi phí thiết kế, giám sát và các chi phí phát sinh khác. Để có báo giá chính xác, vui lòng liên hệ với chúng tôi.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
