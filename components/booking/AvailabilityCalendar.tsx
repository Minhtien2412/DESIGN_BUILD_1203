import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookingId?: string;
  clientName?: string;
  service?: string;
  notes?: string;
}

export interface DayAvailability {
  date: string;
  timeSlots: TimeSlot[];
  isAvailable: boolean;
}

interface AvailabilityCalendarProps {
  availability: DayAvailability[];
  editable?: boolean;
  onUpdateAvailability?: (date: string, timeSlots: TimeSlot[]) => void;
  onBookSlot?: (date: string, slotId: string, bookingDetails: any) => void;
  onCancelBooking?: (date: string, slotId: string) => void;
  contractorName?: string;
  services?: string[];
}

const DEFAULT_TIME_SLOTS = [
  { start: '08:00', end: '10:00', label: 'Sáng sớm' },
  { start: '10:00', end: '12:00', label: 'Sáng muộn' },
  { start: '13:00', end: '15:00', label: 'Chiều sớm' },
  { start: '15:00', end: '17:00', label: 'Chiều muộn' },
  { start: '17:00', end: '19:00', label: 'Tối' },
];

export function AvailabilityCalendar({
  availability,
  editable = false,
  onUpdateAvailability,
  onBookSlot,
  onCancelBooking,
  contractorName = 'Nhà thầu',
  services = [],
}: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingForm, setBookingForm] = useState({
    clientName: '',
    phone: '',
    email: '',
    service: '',
    notes: '',
  });
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');

  // Get availability for a specific date
  const getDateAvailability = (date: string): DayAvailability | null => {
    return availability.find(day => day.date === date) || null;
  };

  // Create marked dates for calendar
  const getMarkedDates = () => {
    const markedDates: any = {};
    
    availability.forEach(day => {
      const hasAvailableSlots = day.timeSlots.some(slot => slot.isAvailable && !slot.isBooked);
      const hasBookedSlots = day.timeSlots.some(slot => slot.isBooked);
      
      let color = '#E5E7EB'; // Default gray
      if (hasBookedSlots && hasAvailableSlots) {
        color = '#0D9488'; // Orange for partially booked
      } else if (hasBookedSlots) {
        color = '#000000'; // Red for fully booked
      } else if (hasAvailableSlots) {
        color = '#0D9488'; // Green for available
      }

      markedDates[day.date] = {
        marked: true,
        dotColor: color,
        selectedColor: day.date === selectedDate ? primaryColor : undefined,
      };
    });

    // Mark selected date
    if (selectedDate && !markedDates[selectedDate]) {
      markedDates[selectedDate] = {
        selected: true,
        selectedColor: primaryColor,
      };
    }

    return markedDates;
  };

  // Handle date selection
  const onDatePress = (date: any) => {
    setSelectedDate(date.dateString);
    setShowTimeSlotModal(true);
  };

  // Handle time slot booking
  const handleBookSlot = () => {
    if (!selectedSlot || !selectedDate) return;

    if (!bookingForm.clientName.trim() || !bookingForm.phone.trim()) {
      Alert.alert(
        'Thông tin chưa đầy đủ', 
        'Vui lòng điền đầy đủ họ tên và số điện thoại',
        [{ text: 'Đã hiểu' }]
      );
      return;
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(bookingForm.phone.replace(/\s/g, ''))) {
      Alert.alert(
        'Số điện thoại không hợp lệ',
        'Vui lòng nhập đúng định dạng số điện thoại (10-11 số)',
        [{ text: 'Đã hiểu' }]
      );
      return;
    }

    Alert.alert(
      'Xác nhận đặt lịch',
      `Bạn muốn đặt lịch vào ${new Date(selectedDate).toLocaleDateString('vi-VN')} lúc ${selectedSlot.startTime} - ${selectedSlot.endTime}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            onBookSlot?.(selectedDate, selectedSlot.id, {
              ...bookingForm,
              date: selectedDate,
              timeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
            });

            setBookingForm({
              clientName: '',
              phone: '',
              email: '',
              service: '',
              notes: '',
            });
            setShowBookingModal(false);
            setShowTimeSlotModal(false);
            
            Alert.alert(
              '✅ Đặt lịch thành công',
              'Bạn sẽ nhận được xác nhận qua SMS/Email',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  // Handle booking cancellation
  const handleCancelBooking = (slot: TimeSlot) => {
    Alert.alert(
      'Hủy lịch hẹn',
      `Bạn có chắc chắn muốn hủy lịch hẹn với ${slot.clientName}?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy',
          style: 'destructive',
          onPress: () => {
            onCancelBooking?.(selectedDate, slot.id);
            setShowTimeSlotModal(false);
          },
        },
      ]
    );
  };

  // Toggle slot availability
  const toggleSlotAvailability = (slotId: string) => {
    const dayAvailability = getDateAvailability(selectedDate);
    if (!dayAvailability) return;

    const updatedSlots = dayAvailability.timeSlots.map(slot =>
      slot.id === slotId
        ? { ...slot, isAvailable: !slot.isAvailable }
        : slot
    );

    onUpdateAvailability?.(selectedDate, updatedSlots);
  };

  const renderTimeSlotModal = () => {
    const dayAvailability = getDateAvailability(selectedDate);
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const isPast = dateObj < today;

    return (
      <Modal
        visible={showTimeSlotModal}
        animationType="slide"
        onRequestClose={() => setShowTimeSlotModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTimeSlotModal(false)}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              {dateObj.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.timeSlotsContainer}>
            {isPast ? (
              <View style={styles.pastDateNotice}>
                <Ionicons name="time-outline" size={24} color="#9CA3AF" />
                <Text style={[styles.pastDateText, { color: textColor }]}>
                  Không thể đặt lịch cho ngày đã qua
                </Text>
              </View>
            ) : dayAvailability ? (
              dayAvailability.timeSlots.map((slot) => (
                <View key={slot.id} style={[styles.timeSlotCard, { backgroundColor }]}>
                  <View style={styles.timeSlotHeader}>
                    <Text style={[styles.timeSlotTime, { color: textColor }]}>
                      {slot.startTime} - {slot.endTime}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      {
                        backgroundColor: slot.isBooked
                          ? '#000000'
                          : slot.isAvailable
                          ? '#0D9488'
                          : '#9CA3AF',
                      },
                    ]}>
                      <Text style={styles.statusText}>
                        {slot.isBooked
                          ? 'Đã đặt'
                          : slot.isAvailable
                          ? 'Trống'
                          : 'Không có'}
                      </Text>
                    </View>
                  </View>

                  {slot.isBooked && (
                    <View style={styles.bookingInfo}>
                      <Text style={[styles.clientName, { color: textColor }]}>
                        👤 {slot.clientName}
                      </Text>
                      {slot.service && (
                        <Text style={[styles.serviceInfo, { color: textColor }]}>
                          🔧 {slot.service}
                        </Text>
                      )}
                      {slot.notes && (
                        <Text style={[styles.notesInfo, { color: textColor }]}>
                          📝 {slot.notes}
                        </Text>
                      )}
                      {editable && (
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => handleCancelBooking(slot)}
                        >
                          <Ionicons name="close-circle-outline" size={16} color="white" />
                          <Text style={styles.cancelButtonText}>Hủy lịch</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  <View style={styles.slotActions}>
                    {editable && (
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          { backgroundColor: slot.isAvailable ? '#000000' : '#0D9488' },
                        ]}
                        onPress={() => toggleSlotAvailability(slot.id)}
                      >
                        <Text style={styles.toggleButtonText}>
                          {slot.isAvailable ? 'Tắt' : 'Bật'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {!editable && slot.isAvailable && !slot.isBooked && (
                      <TouchableOpacity
                        style={[styles.bookButton, { backgroundColor: primaryColor }]}
                        onPress={() => {
                          setSelectedSlot(slot);
                          setShowBookingModal(true);
                        }}
                      >
                        <Ionicons name="calendar-outline" size={16} color="white" />
                        <Text style={styles.bookButtonText}>Đặt lịch</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noSlotsContainer}>
                <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                <Text style={[styles.noSlotsText, { color: textColor }]}>
                  Chưa có lịch trống cho ngày này
                </Text>
                {editable && (
                  <TouchableOpacity
                    style={[styles.createSlotsButton, { backgroundColor: primaryColor }]}
                    onPress={() => {
                      const newSlots = DEFAULT_TIME_SLOTS.map((slot, index) => ({
                        id: `${selectedDate}-${index}`,
                        startTime: slot.start,
                        endTime: slot.end,
                        isAvailable: true,
                        isBooked: false,
                      }));
                      onUpdateAvailability?.(selectedDate, newSlots);
                    }}
                  >
                    <Text style={styles.createSlotsButtonText}>Tạo lịch trống</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderBookingModal = () => (
    <Modal
      visible={showBookingModal}
      animationType="slide"
      onRequestClose={() => setShowBookingModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowBookingModal(false)}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            Đặt lịch với {contractorName}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.bookingForm}>
          {selectedSlot && (
            <View style={styles.bookingDetails}>
              <Text style={[styles.bookingDetailText, { color: textColor }]}>
                📅 {new Date(selectedDate).toLocaleDateString('vi-VN')}
              </Text>
              <Text style={[styles.bookingDetailText, { color: textColor }]}>
                ⏰ {selectedSlot.startTime} - {selectedSlot.endTime}
              </Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>
              Họ tên khách hàng *
            </Text>
            <TextInput
              style={[styles.input, { borderColor: '#E5E7EB', color: textColor }]}
              value={bookingForm.clientName}
              onChangeText={(text) => setBookingForm(prev => ({ ...prev, clientName: text }))}
              placeholder="Nhập họ tên"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>
              Số điện thoại *
            </Text>
            <TextInput
              style={[styles.input, { borderColor: '#E5E7EB', color: textColor }]}
              value={bookingForm.phone}
              onChangeText={(text) => setBookingForm(prev => ({ ...prev, phone: text }))}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Email</Text>
            <TextInput
              style={[styles.input, { borderColor: '#E5E7EB', color: textColor }]}
              value={bookingForm.email}
              onChangeText={(text) => setBookingForm(prev => ({ ...prev, email: text }))}
              placeholder="Nhập email (tuỳ chọn)"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
            />
          </View>

          {services.length > 0 && (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: textColor }]}>Dịch vụ</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.serviceChips}>
                  {services.map((service, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.serviceChip,
                        {
                          backgroundColor: bookingForm.service === service
                            ? primaryColor
                            : '#F3F4F6',
                        },
                      ]}
                      onPress={() => setBookingForm(prev => ({ 
                        ...prev, 
                        service: prev.service === service ? '' : service 
                      }))}
                    >
                      <Text style={[
                        styles.serviceChipText,
                        { 
                          color: bookingForm.service === service ? 'white' : textColor 
                        },
                      ]}>
                        {service}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Ghi chú</Text>
            <TextInput
              style={[styles.textArea, { borderColor: '#E5E7EB', color: textColor }]}
              value={bookingForm.notes}
              onChangeText={(text) => setBookingForm(prev => ({ ...prev, notes: text }))}
              placeholder="Mô tả công việc cần thực hiện..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: primaryColor }]}
            onPress={handleBookSlot}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            <Text style={styles.submitButtonText}>Đặt lịch</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          {editable ? 'Quản lý lịch trống' : `Lịch của ${contractorName}`}
        </Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0D9488' }]} />
            <Text style={[styles.legendText, { color: textColor }]}>Trống</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0D9488' }]} />
            <Text style={[styles.legendText, { color: textColor }]}>Một phần</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#000000' }]} />
            <Text style={[styles.legendText, { color: textColor }]}>Đầy</Text>
          </View>
        </View>
      </View>

      {/* Calendar */}
      <Calendar
        onDayPress={onDatePress}
        markedDates={getMarkedDates()}
        theme={{
          backgroundColor: backgroundColor,
          calendarBackground: backgroundColor,
          textSectionTitleColor: textColor,
          selectedDayBackgroundColor: primaryColor,
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: primaryColor,
          dayTextColor: textColor,
          textDisabledColor: '#9CA3AF',
          monthTextColor: textColor,
          arrowColor: primaryColor,
        }}
        enableSwipeMonths
        onMonthChange={(month: any) => setCurrentMonth(`${month.year}-${month.month.toString().padStart(2, '0')}`)}
      />

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor }]}>
          <Text style={[styles.statNumber, { color: primaryColor }]}>
            {availability.filter(day => 
              day.timeSlots.some(slot => slot.isAvailable && !slot.isBooked)
            ).length}
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Ngày có lịch</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor }]}>
          <Text style={[styles.statNumber, { color: '#0D9488' }]}>
            {availability.reduce((count, day) => 
              count + day.timeSlots.filter(slot => slot.isBooked).length, 0
            )}
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Lịch đã đặt</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor }]}>
          <Text style={[styles.statNumber, { color: '#0D9488' }]}>
            {availability.reduce((count, day) => 
              count + day.timeSlots.filter(slot => slot.isAvailable && !slot.isBooked).length, 0
            )}
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Slot trống</Text>
        </View>
      </View>

      {/* Modals */}
      {renderTimeSlotModal()}
      {renderBookingModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  timeSlotsContainer: {
    flex: 1,
    padding: 20,
  },
  timeSlotCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeSlotTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  bookingInfo: {
    marginBottom: 12,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  serviceInfo: {
    fontSize: 13,
    opacity: 0.8,
    marginBottom: 2,
  },
  notesInfo: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 8,
  },
  slotActions: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  noSlotsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noSlotsText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
    opacity: 0.7,
  },
  createSlotsButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createSlotsButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  pastDateNotice: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  pastDateText: {
    fontSize: 16,
    marginTop: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  bookingForm: {
    flex: 1,
    padding: 20,
  },
  bookingDetails: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  bookingDetailText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  serviceChips: {
    flexDirection: 'row',
    gap: 8,
  },
  serviceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  serviceChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
