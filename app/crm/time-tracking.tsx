/**
 * Project Time Tracking Screen
 * =============================
 * 
 * Track billable and non-billable hours for projects
 * Log time entries, view timesheets, generate reports
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Local TimeEntry interface
interface TimeEntry {
  id: string;
  projectId: string;
  staffId: string;
  date: string;
  hours: number;
  note?: string;
  isBillable: boolean;
  hourlyRate?: number;
}

export default function TimeTrackingScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<{
    startTime: Date;
    note: string;
    isBillable: boolean;
  } | null>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  // Initialize with mock data (API integration pending)
  useEffect(() => {
    if (projectId) {
      setTimeEntries([
        {
          id: '1',
          projectId: projectId,
          staffId: '1',
          date: '2024-12-30',
          hours: 8.5,
          note: 'Thiết kế mặt bằng tầng 1',
          isBillable: true,
        },
        {
          id: '2',
          projectId: projectId,
          staffId: '1',
          date: '2024-12-29',
          hours: 6.0,
          note: 'Họp khách hàng và tư vấn',
          isBillable: true,
        },
      ]);
    }
  }, [projectId]);

  const startTimer = () => {
    setCurrentSession({
      startTime: new Date(),
      note: '',
      isBillable: true,
    });
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    if (!currentSession || !projectId) return;

    const endTime = new Date();
    const hours = (endTime.getTime() - currentSession.startTime.getTime()) / (1000 * 60 * 60);

    // Add new entry (mock implementation)
    const newEntry: TimeEntry = {
      id: String(Date.now()),
      projectId: projectId,
      staffId: '1',
      date: new Date().toISOString().split('T')[0],
      hours: Math.round(hours * 100) / 100,
      note: currentSession.note,
      isBillable: currentSession.isBillable,
    };

    setTimeEntries(prev => [newEntry, ...prev]);
    Alert.alert('Success', `Logged ${hours.toFixed(2)} hours`);
    setIsTimerRunning(false);
    setCurrentSession(null);
  };

  const handleManualLog = async (hours: number, note: string, isBillable: boolean) => {
    if (!projectId) return;

    // Add new entry (mock implementation)
    const newEntry: TimeEntry = {
      id: String(Date.now()),
      projectId: projectId,
      staffId: '1',
      date: new Date().toISOString().split('T')[0],
      hours: hours,
      note: note,
      isBillable: isBillable,
    };

    setTimeEntries(prev => [newEntry, ...prev]);
    Alert.alert('Success', 'Time logged successfully');
    setShowLogModal(false);
  };

  const getTotalHours = () => {
    return timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getBillableHours = () => {
    return timeEntries
      .filter(e => e.isBillable)
      .reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getTotalValue = () => {
    return timeEntries
      .filter(e => e.isBillable && e.hourlyRate)
      .reduce((sum, entry) => sum + (entry.hours * (entry.hourlyRate || 0)), 0);
  };

  const renderTimeEntry = ({ item }: { item: TimeEntry }) => (
    <View style={[styles.entryCard, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.entryHeader}>
        <View style={styles.entryInfo}>
          <Ionicons
            name={item.isBillable ? 'cash' : 'time'}
            size={20}
            color={item.isBillable ? '#22c55e' : '#6b7280'}
          />
          <Text style={[styles.entryHours, { color: textColor }]}>
            {item.hours.toFixed(2)}h
          </Text>
        </View>
        <Text style={[styles.entryDate, { color: textColor }]}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      
      {item.note && (
        <Text style={[styles.entryNote, { color: textColor }]} numberOfLines={2}>
          {item.note}
        </Text>
      )}
      
      {item.isBillable && item.hourlyRate && (
        <Text style={[styles.entryValue, { color: '#22c55e' }]}>
          {formatCurrency(item.hours * item.hourlyRate)}
        </Text>
      )}
    </View>
  );

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Time Tracking</Text>
        <TouchableOpacity onPress={() => setShowLogModal(true)}>
          <Ionicons name="add-circle" size={28} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Timer Card */}
        <View style={[styles.timerCard, { backgroundColor: cardBg }]}>
          {isTimerRunning && currentSession ? (
            <>
              <Text style={[styles.timerLabel, { color: textColor }]}>Session Running</Text>
              <Text style={[styles.timerDisplay, { color: primaryColor }]}>
                {formatTime(Date.now() - currentSession.startTime.getTime())}
              </Text>
              <TextInput
                style={[styles.timerNote, { color: textColor, borderColor }]}
                placeholder="What are you working on?"
                placeholderTextColor="#6b7280"
                value={currentSession.note}
                onChangeText={(text) =>
                  setCurrentSession({ ...currentSession, note: text })
                }
                multiline
              />
              <TouchableOpacity
                style={[styles.stopButton, { backgroundColor: '#ef4444' }]}
                onPress={stopTimer}
              >
                <Ionicons name="stop" size={24} color="#fff" />
                <Text style={styles.buttonText}>Stop & Log</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.timerLabel, { color: textColor }]}>
                Start tracking time
              </Text>
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: primaryColor }]}
                onPress={startTimer}
              >
                <Ionicons name="play" size={32} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: cardBg }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: primaryColor }]}>
              {getTotalHours().toFixed(1)}h
            </Text>
            <Text style={[styles.statLabel, { color: textColor }]}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#22c55e' }]}>
              {getBillableHours().toFixed(1)}h
            </Text>
            <Text style={[styles.statLabel, { color: textColor }]}>Billable</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#22c55e' }]}>
              {formatCurrency(getTotalValue())}
            </Text>
            <Text style={[styles.statLabel, { color: textColor }]}>Value</Text>
          </View>
        </View>

        {/* Time Entries */}
        <View style={styles.entriesSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Time Entries</Text>
          <FlatList
            data={timeEntries}
            renderItem={renderTimeEntry}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Ionicons name="time-outline" size={48} color="#6b7280" />
                <Text style={[styles.emptyText, { color: textColor }]}>
                  No time entries yet
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      {/* Log Time Modal */}
      <LogTimeModal
        visible={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSubmit={handleManualLog}
        backgroundColor={backgroundColor}
        cardBg={cardBg}
        textColor={textColor}
        primaryColor={primaryColor}
        borderColor={borderColor}
      />
    </SafeAreaView>
  );
}

// Log Time Modal Component
interface LogTimeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (hours: number, note: string, isBillable: boolean) => void;
  backgroundColor: string;
  cardBg: string;
  textColor: string;
  primaryColor: string;
  borderColor: string;
}

function LogTimeModal({
  visible,
  onClose,
  onSubmit,
  backgroundColor,
  cardBg,
  textColor,
  primaryColor,
  borderColor,
}: LogTimeModalProps) {
  const [hours, setHours] = useState('');
  const [note, setNote] = useState('');
  const [isBillable, setIsBillable] = useState(true);

  const handleSubmit = () => {
    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      Alert.alert('Error', 'Please enter valid hours');
      return;
    }
    onSubmit(hoursNum, note, isBillable);
    setHours('');
    setNote('');
    setIsBillable(true);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Log Time</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Hours (e.g., 2.5)"
            placeholderTextColor="#6b7280"
            keyboardType="decimal-pad"
            value={hours}
            onChangeText={setHours}
          />

          <TextInput
            style={[styles.input, styles.textArea, { color: textColor, borderColor }]}
            placeholder="Description of work done..."
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={setNote}
          />

          <TouchableOpacity
            style={[styles.checkboxRow, { borderColor }]}
            onPress={() => setIsBillable(!isBillable)}
          >
            <Ionicons
              name={isBillable ? 'checkbox' : 'square-outline'}
              size={24}
              color={isBillable ? primaryColor : '#6b7280'}
            />
            <Text style={[styles.checkboxLabel, { color: textColor }]}>
              Billable hours
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: primaryColor }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Log Time</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timerCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  timerNote: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
    minHeight: 60,
  },
  startButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  entriesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  entryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryHours: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  entryDate: {
    fontSize: 12,
  },
  entryNote: {
    fontSize: 14,
    marginBottom: 8,
  },
  entryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
