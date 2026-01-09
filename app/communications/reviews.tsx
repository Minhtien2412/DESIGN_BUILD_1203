import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const REVIEWS = [
  {
    id: '1',
    userName: 'Nguyễn Văn A',
    userInitial: 'N',
    userColor: '#E8F4FF',
    textColor: Colors.light.primary,
    rating: 5,
    date: '2 ngày trước',
    service: 'Thợ xây',
    comment: 'Thợ xây rất tận tâm, làm việc chuyên nghiệp. Hoàn thành công trình đúng tiến độ và chất lượng tốt. Tôi rất hài lòng với dịch vụ.',
  },
  {
    id: '2',
    userName: 'Trần Thị B',
    userInitial: 'T',
    userColor: '#FCE4EC',
    textColor: '#0066CC',
    rating: 5,
    date: '3 ngày trước',
    service: 'Vật liệu xây dựng',
    comment: 'Vật liệu chất lượng tốt, giá cả hợp lý. Giao hàng nhanh chóng, đóng gói cẩn thận. Rất hài lòng và sẽ tiếp tục ủng hộ!',
  },
  {
    id: '3',
    userName: 'Lê Văn C',
    userInitial: 'L',
    userColor: '#E8F5E9',
    textColor: '#0066CC',
    rating: 4,
    date: '1 tuần trước',
    service: 'Thiết kế',
    comment: 'Dịch vụ thiết kế tốt, nhân viên tư vấn nhiệt tình. Bản vẽ chi tiết, dễ hiểu. Sẽ quay lại khi có nhu cầu.',
  },
  {
    id: '4',
    userName: 'Phạm Thị D',
    userInitial: 'P',
    userColor: '#E8F4FF',
    textColor: '#0066CC',
    rating: 5,
    date: '1 tuần trước',
    service: 'Thợ điện',
    comment: 'Thợ điện làm việc nhanh gọn, am hiểu chuyên môn. Giải quyết vấn đề điện trong nhà rất hiệu quả. Giá cả phải chăng.',
  },
  {
    id: '5',
    userName: 'Hoàng Văn E',
    userInitial: 'H',
    userColor: '#F3E5F5',
    textColor: '#999999',
    rating: 5,
    date: '2 tuần trước',
    service: 'Vật liệu hoàn thiện',
    comment: 'Gạch men và thiết bị vệ sinh chất lượng cao. Nhân viên tư vấn chi tiết, nhiệt tình. Giao hàng đúng hẹn.',
  },
  {
    id: '6',
    userName: 'Vũ Thị F',
    userInitial: 'V',
    userColor: '#E0F2F1',
    textColor: '#00897B',
    rating: 4,
    date: '2 tuần trước',
    service: 'Thợ sơn',
    comment: 'Thợ sơn làm việc cẩn thận, tỉ mỉ. Bề mặt tường được xử lý kỹ trước khi sơn. Màu sắc đẹp, đều màu.',
  },
];

export default function ReviewsScreen() {
  const [filter, setFilter] = useState<'all' | number>('all');

  const filteredReviews = filter === 'all' 
    ? REVIEWS 
    : REVIEWS.filter(r => r.rating === filter);

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
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF' }}>
              Đánh giá khách hàng
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
              {REVIEWS.length} đánh giá
            </Text>
          </View>
        </View>
      </View>

      {/* Filter */}
      <View style={{ backgroundColor: '#FFF', padding: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => setFilter('all')}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: filter === 'all' ? Colors.light.primary : Colors.light.background,
              borderWidth: 1,
              borderColor: filter === 'all' ? Colors.light.primary : Colors.light.border,
            }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: filter === 'all' ? '#FFF' : Colors.light.text
            }}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {[5, 4, 3, 2, 1].map((rating) => (
            <TouchableOpacity
              key={rating}
              onPress={() => setFilter(rating)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: filter === rating ? Colors.light.primary : Colors.light.background,
                borderWidth: 1,
                borderColor: filter === rating ? Colors.light.primary : Colors.light.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: filter === rating ? '#FFF' : Colors.light.text
              }}>
                {rating}
              </Text>
              <Ionicons 
                name="star" 
                size={14} 
                color={filter === rating ? '#FFF' : '#0066CC'} 
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reviews List */}
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16, gap: 12 }}>
          {filteredReviews.map((review) => (
            <View
              key={review.id}
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
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: review.userColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: review.textColor }}>
                    {review.userInitial}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.light.text, marginBottom: 4 }}>
                    {review.userName}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < review.rating ? 'star' : 'star-outline'}
                        size={14}
                        color="#0066CC"
                        style={{ marginRight: 2 }}
                      />
                    ))}
                    <Text style={{ fontSize: 12, color: Colors.light.textMuted, marginLeft: 6 }}>
                      {review.date}
                    </Text>
                  </View>
                  <View style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: Colors.light.background,
                    alignSelf: 'flex-start'
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.light.textMuted }}>
                      {review.service}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={{
                fontSize: 14,
                color: Colors.light.text,
                lineHeight: 20
              }}>
                {review.comment}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
