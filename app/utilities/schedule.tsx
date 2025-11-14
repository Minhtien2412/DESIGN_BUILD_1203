import { Colors } from '@/constants/theme';
import { useUtilities } from '@/context/UtilitiesContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
];

export default function ScheduleScreen() {
  const { createAppointment, appointments } = useUtilities();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !name || !phone) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmitting(true);
    try {
      await createAppointment({
        name,
        phone,
        date: selectedDate,
        timeSlot: selectedTime,
      });

      Alert.alert(
        'Thành công',
        'Đặt lịch hẹn thành công! Chúng tôi sẽ liên hệ lại với bạn sớm.',
        [
          { text: 'Xem lịch hẹn', onPress: () => router.push('/utilities/history') },
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đặt lịch. Vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
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
            Đặt lịch hẹn
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20 }}>
          Đặt lịch tư vấn miễn phí với chuyên gia
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          {/* Personal Info */}
          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 16 }}>
              Thông tin của bạn
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text, marginBottom: 8 }}>
                Họ và tên
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nhập họ tên"
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

            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text, marginBottom: 8 }}>
                Số điện thoại
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
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
          </View>

          {/* Date Selection */}
          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 16 }}>
              Chọn ngày
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedDate(dateStr)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: selectedDate === dateStr ? Colors.light.primary : Colors.light.border,
                      backgroundColor: selectedDate === dateStr ? Colors.light.primary + '10' : '#FFF'
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: selectedDate === dateStr ? Colors.light.primary : Colors.light.text
                    }}>
                      {dateStr}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Time Selection */}
          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 16 }}>
              Chọn giờ
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => setSelectedTime(slot)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selectedTime === slot ? Colors.light.primary : Colors.light.border,
                    backgroundColor: selectedTime === slot ? Colors.light.primary + '10' : '#FFF'
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: selectedTime === slot ? Colors.light.primary : Colors.light.text
                  }}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: Colors.light.primary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 12,
              opacity: submitting ? 0.6 : 1
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>
              {submitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
            </Text>
          </TouchableOpacity>

          {/* View Appointments */}
          {appointments.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push('/utilities/history')}
              style={{
                backgroundColor: '#F3F4F6',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 24,
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Ionicons name="calendar" size={20} color={Colors.light.primary} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.light.primary }}>
                Xem lịch hẹn đã đặt ({appointments.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
