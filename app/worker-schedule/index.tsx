import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const scheduleData = [
  {
    date: '08/01/2026',
    dayName: 'Thứ Tư',
    isToday: true,
    tasks: [
      { id: '1', time: '09:00 - 12:00', title: 'Sửa điện nhà ông Hùng', address: '123 Nguyễn Văn Linh', status: 'in-progress' },
      { id: '2', time: '14:00 - 17:00', title: 'Lắp đặt bảng điện', address: '456 Lê Văn Việt', status: 'upcoming' },
    ],
  },
  {
    date: '09/01/2026',
    dayName: 'Thứ Năm',
    isToday: false,
    tasks: [
      { id: '3', time: '08:00 - 11:00', title: 'Kiểm tra hệ thống điện', address: '789 Võ Văn Ngân', status: 'upcoming' },
    ],
  },
  {
    date: '10/01/2026',
    dayName: 'Thứ Sáu',
    isToday: false,
    tasks: [
      { id: '4', time: '09:00 - 12:00', title: 'Sửa chập điện', address: '321 Phan Văn Trị', status: 'upcoming' },
      { id: '5', time: '13:00 - 15:00', title: 'Lắp đèn LED', address: '654 Quang Trung', status: 'upcoming' },
      { id: '6', time: '16:00 - 18:00', title: 'Bảo trì điện định kỳ', address: '987 Nguyễn Oanh', status: 'upcoming' },
    ],
  },
];

const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function WorkerScheduleScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const [selectedDate, setSelectedDate] = useState(8);

  // Generate calendar days for current week
  const generateWeekDays = () => {
    const days = [];
    for (let i = 5; i <= 11; i++) {
      days.push({
        date: i,
        day: weekDays[(i + 2) % 7], // Adjust for starting from Monday
        hasTask: [8, 9, 10].includes(i),
      });
    }
    return days;
  };

  const calendarDays = generateWeekDays();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'in-progress':
        return { bg: '#E8F5E9', color: '#4CAF50', label: 'Đang làm' };
      case 'upcoming':
        return { bg: '#E3F2FD', color: '#2196F3', label: 'Sắp tới' };
      case 'completed':
        return { bg: '#F5F5F5', color: '#666', label: 'Hoàn thành' };
      default:
        return { bg: '#f0f0f0', color: '#666', label: status };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Lịch làm việc', headerShown: true }} />
      
      {/* Calendar Strip */}
      <View style={[styles.calendarStrip, { backgroundColor: cardBg }]}>
        <View style={styles.monthRow}>
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: textColor }]}>Tháng 1, 2026</Text>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
          {calendarDays.map((day) => (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.dayItem,
                selectedDate === day.date && styles.dayItemActive,
              ]}
              onPress={() => setSelectedDate(day.date)}
            >
              <Text style={[
                styles.dayName,
                selectedDate === day.date && styles.dayTextActive,
              ]}>
                {day.day}
              </Text>
              <Text style={[
                styles.dayDate,
                { color: textColor },
                selectedDate === day.date && styles.dayTextActive,
              ]}>
                {day.date}
              </Text>
              {day.hasTask && (
                <View style={[
                  styles.taskDot,
                  selectedDate === day.date && styles.taskDotActive,
                ]} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Schedule List */}
      <ScrollView style={styles.scheduleList} showsVerticalScrollIndicator={false}>
        {scheduleData.map((day) => (
          <View key={day.date} style={styles.daySection}>
            <View style={styles.daySectionHeader}>
              <Text style={[styles.daySectionTitle, { color: textColor }]}>
                {day.dayName}, {day.date}
              </Text>
              {day.isToday && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayText}>Hôm nay</Text>
                </View>
              )}
            </View>

            {day.tasks.map((task) => {
              const statusStyle = getStatusStyle(task.status);
              return (
                <TouchableOpacity 
                  key={task.id} 
                  style={[styles.taskCard, { backgroundColor: cardBg }]}
                >
                  <View style={[styles.taskTimeLine, { backgroundColor: statusStyle.color }]} />
                  <View style={styles.taskContent}>
                    <View style={styles.taskHeader}>
                      <Text style={styles.taskTime}>{task.time}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                          {statusStyle.label}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.taskTitle, { color: textColor }]}>{task.title}</Text>
                    <View style={styles.taskAddress}>
                      <Ionicons name="location-outline" size={14} color="#666" />
                      <Text style={styles.addressText}>{task.address}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.summaryTitle, { color: textColor }]}>Tổng kết tuần</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>6</Text>
              <Text style={styles.summaryLabel}>Công việc</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>24h</Text>
              <Text style={styles.summaryLabel}>Giờ làm</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#4CAF50' }]}>4.8M</Text>
              <Text style={styles.summaryLabel}>Thu nhập</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  calendarStrip: { paddingVertical: 16 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  monthText: { fontSize: 18, fontWeight: '600' },
  daysRow: { paddingHorizontal: 12 },
  dayItem: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 4, borderRadius: 12 },
  dayItemActive: { backgroundColor: '#14B8A6' },
  dayName: { color: '#666', fontSize: 12, marginBottom: 4 },
  dayDate: { fontSize: 18, fontWeight: '600' },
  dayTextActive: { color: '#fff' },
  taskDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#14B8A6', marginTop: 4 },
  taskDotActive: { backgroundColor: '#fff' },
  scheduleList: { flex: 1, padding: 16 },
  daySection: { marginBottom: 24 },
  daySectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  daySectionTitle: { fontSize: 16, fontWeight: '600' },
  todayBadge: { marginLeft: 8, backgroundColor: '#14B8A6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  todayText: { color: '#fff', fontSize: 11, fontWeight: '500' },
  taskCard: { flexDirection: 'row', borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  taskTimeLine: { width: 4 },
  taskContent: { flex: 1, padding: 12 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  taskTime: { color: '#666', fontSize: 13, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '500' },
  taskTitle: { fontSize: 15, fontWeight: '500', marginBottom: 6 },
  taskAddress: { flexDirection: 'row', alignItems: 'center' },
  addressText: { color: '#666', fontSize: 13, marginLeft: 4 },
  summaryCard: { borderRadius: 12, padding: 16, marginBottom: 24 },
  summaryTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryNumber: { fontSize: 24, fontWeight: 'bold', color: '#14B8A6' },
  summaryLabel: { color: '#666', fontSize: 13, marginTop: 4 },
});
