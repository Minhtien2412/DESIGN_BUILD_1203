import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Participant {
  id: string;
  name: string;
  selected: boolean;
}

export default function CreateMeetingScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');

  // State
  const [meetingName, setMeetingName] = useState('');
  const [meetingCode, setMeetingCode] = useState(generateMeetingCode());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 3600000)); // +1 hour
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Thợ Phương sơn', selected: true },
    { id: '2', name: 'Chị Mai Gỗ Vặp', selected: false },
    { id: '3', name: 'KTS Huy Thắng', selected: true },
  ]);

  function generateMeetingCode(): string {
    return 'DA' + Math.floor(10000 + Math.random() * 90000);
  }

  const toggleParticipant = (id: string) => {
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleCreateMeeting = () => {
    const selectedParticipants = participants.filter(p => p.selected);
    
    if (!meetingName.trim()) {
      alert('Vui lòng nhập tên phòng họp');
      return;
    }

    if (selectedParticipants.length === 0) {
      alert('Vui lòng chọn ít nhất một người tham gia');
      return;
    }

    // TODO: API call to create meeting
    console.log('Creating meeting:', {
      meetingName,
      meetingCode,
      selectedDate,
      startTime,
      endTime,
      isPrivate,
      participants: selectedParticipants,
    });

    // Navigate to meeting room or back
    router.back();
  };

  return (
    <Container style={{ backgroundColor }}>
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.title, { color: textColor }]}>
          Tạo phòng họp
        </Text>

        {/* Meeting Name */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>Tên phòng họp</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderColor: borderColor,
                backgroundColor: useThemeColor({}, 'card'),
              },
            ]}
            placeholder="Nhập tên phòng họp"
            placeholderTextColor="#999"
            value={meetingName}
            onChangeText={setMeetingName}
          />
        </View>

        {/* Meeting Code */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>Mã phòng họp</Text>
          <View style={styles.codeContainer}>
            <TextInput
              style={[
                styles.input,
                styles.codeInput,
                {
                  color: textColor,
                  borderColor: borderColor,
                  backgroundColor: '#F5F5F5',
                },
              ]}
              value={meetingCode}
              editable={false}
            />
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: textColor }]}>Ngày</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.input,
                styles.dateButton,
                { borderColor: borderColor, backgroundColor: useThemeColor({}, 'card') },
              ]}
            >
              <Text style={{ color: textColor }}>
                {selectedDate.toLocaleDateString('vi-VN')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Time Selection */}
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: textColor }]}>Giờ</Text>
            <View style={styles.timeRow}>
              <TouchableOpacity
                onPress={() => setShowStartTimePicker(true)}
                style={[
                  styles.timeButton,
                  { borderColor: borderColor, backgroundColor: useThemeColor({}, 'card') },
                ]}
              >
                <Text style={{ color: textColor, fontSize: 12 }}>
                  {startTime.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.timeSeparator, { color: textColor }]}>—</Text>
              <TouchableOpacity
                onPress={() => setShowEndTimePicker(true)}
                style={[
                  styles.timeButton,
                  { borderColor: borderColor, backgroundColor: useThemeColor({}, 'card') },
                ]}
              >
                <Text style={{ color: textColor, fontSize: 12 }}>
                  {endTime.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) setSelectedDate(date);
            }}
          />
        )}
        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="default"
            onChange={(event, time) => {
              setShowStartTimePicker(Platform.OS === 'ios');
              if (time) setStartTime(time);
            }}
          />
        )}
        {showEndTimePicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display="default"
            onChange={(event, time) => {
              setShowEndTimePicker(Platform.OS === 'ios');
              if (time) setEndTime(time);
            }}
          />
        )}

        {/* Participants */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>Người tham gia</Text>
          <View style={styles.participantsContainer}>
            {participants.map(participant => (
              <TouchableOpacity
                key={participant.id}
                style={[
                  styles.participantChip,
                  {
                    backgroundColor: participant.selected ? primaryColor : '#E0E0E0',
                    borderColor: participant.selected ? primaryColor : '#CCC',
                  },
                ]}
                onPress={() => toggleParticipant(participant.id)}
              >
                <Text
                  style={[
                    styles.participantText,
                    { color: participant.selected ? '#FFF' : '#666' },
                  ]}
                >
                  {participant.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.addButton, { borderColor: borderColor }]}
              onPress={() => {
                // TODO: Open participant selector
                alert('Thêm thành viên');
              }}
            >
              <Text style={{ color: primaryColor, fontSize: 16 }}>+ Thêm thành viên</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>Bảo mật</Text>
          <View style={styles.privacyRow}>
            <TouchableOpacity
              style={[
                styles.privacyButton,
                isPrivate && styles.privacyButtonActive,
                { borderColor: isPrivate ? primaryColor : borderColor },
              ]}
              onPress={() => setIsPrivate(true)}
            >
              <Text
                style={[
                  styles.privacyText,
                  { color: isPrivate ? primaryColor : textColor },
                ]}
              >
                Riêng tư
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.privacyButton,
                !isPrivate && styles.privacyButtonActive,
                { borderColor: !isPrivate ? primaryColor : borderColor },
              ]}
              onPress={() => setIsPrivate(false)}
            >
              <Text
                style={[
                  styles.privacyText,
                  { color: !isPrivate ? primaryColor : textColor },
                ]}
              >
                Công khai
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Button */}
        <Button
          onPress={handleCreateMeeting}
          style={[styles.createButton, { backgroundColor: primaryColor }]}
        >
          <Text style={styles.createButtonText}>Bắt đầu cuộc họp</Text>
        </Button>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  dateButton: {
    justifyContent: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  timeSeparator: {
    fontSize: 16,
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  participantText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  privacyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  privacyButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  privacyButtonActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  privacyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
