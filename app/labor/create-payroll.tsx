import { usePayrolls, useWorkers } from '@/hooks/useLabor';
import { PaymentMethod } from '@/types/labor';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const PAYMENT_METHOD_OPTIONS: Array<{
  value: PaymentMethod;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { value: PaymentMethod.CASH, label: 'Tiền mặt', icon: 'cash' },
  { value: PaymentMethod.BANK_TRANSFER, label: 'Chuyển khoản', icon: 'card' },
  { value: PaymentMethod.CHECK, label: 'Séc', icon: 'document-text' },
  { value: PaymentMethod.MOBILE_PAYMENT, label: 'Ví điện tử', icon: 'phone-portrait' },
];

export default function CreatePayrollScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { workers } = useWorkers(projectId);
  const { createPayroll } = usePayrolls(projectId);

  const [workerId, setWorkerId] = useState<string | null>(null);

  const [periodStart, setPeriodStart] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);

  const [periodEnd, setPeriodEnd] = useState(new Date());
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [regularHours, setRegularHours] = useState('');
  const [overtimeHours, setOvertimeHours] = useState('');
  const [bonuses, setBonuses] = useState('');
  const [allowances, setAllowances] = useState('');

  const [taxes, setTaxes] = useState('');
  const [insurance, setInsurance] = useState('');
  const [advances, setAdvances] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.BANK_TRANSFER
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedWorker = workers.find((w) => w.id === workerId);

  const calculatePay = () => {
    if (!selectedWorker) {
      return {
        regularPay: 0,
        overtimePay: 0,
        grossPay: 0,
        totalDeductions: 0,
        netPay: 0,
      };
    }

    const regHours = parseFloat(regularHours) || 0;
    const overtHours = parseFloat(overtimeHours) || 0;
    const bonusAmt = parseFloat(bonuses) || 0;
    const allowAmt = parseFloat(allowances) || 0;

    const taxAmt = parseFloat(taxes) || 0;
    const insAmt = parseFloat(insurance) || 0;
    const advAmt = parseFloat(advances) || 0;
    const otherDedAmt = parseFloat(otherDeductions) || 0;

    const regularPay = regHours * (selectedWorker.hourlyRate || 0);
    const overtimePay = overtHours * (selectedWorker.overtimeRate || 0);
    const grossPay = regularPay + overtimePay + bonusAmt + allowAmt;
    const totalDeductions = taxAmt + insAmt + advAmt + otherDedAmt;
    const netPay = grossPay - totalDeductions;

    return {
      regularPay,
      overtimePay,
      grossPay,
      totalDeductions,
      netPay,
    };
  };

  const pay = calculatePay();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleSave = async () => {
    if (!workerId) {
      Alert.alert('Lỗi', 'Vui lòng chọn nhân công');
      return;
    }

    const regHours = parseFloat(regularHours) || 0;
    if (regHours <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số giờ làm việc');
      return;
    }

    if (periodStart > periodEnd) {
      Alert.alert('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setLoading(true);
      await createPayroll({
        workerId,
        periodStart: periodStart.toISOString().split('T')[0],
        periodEnd: periodEnd.toISOString().split('T')[0],
        regularHours: regHours,
        overtimeHours: parseFloat(overtimeHours) || 0,
        overtimePay: pay.overtimePay,
        bonuses: parseFloat(bonuses) || 0,
        allowances: parseFloat(allowances) || 0,
        grossPay: pay.grossPay,
        taxes: parseFloat(taxes) || 0,
        insurance: parseFloat(insurance) || 0,
        advances: parseFloat(advances) || 0,
        otherDeductions: parseFloat(otherDeductions) || 0,
        totalDeductions: pay.totalDeductions,
        netPay: pay.netPay,
        paymentMethod,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Thành công', 'Đã tạo bảng lương', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo bảng lương');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Worker Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Nhân công <Text style={styles.required}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {workers.map((worker) => (
              <TouchableOpacity
                key={worker.id}
                style={[styles.workerChip, workerId === worker.id && styles.workerChipActive]}
                onPress={() => setWorkerId(worker.id)}
              >
                <Text
                  style={[
                    styles.workerChipName,
                    workerId === worker.id && styles.workerChipNameActive,
                  ]}
                >
                  {worker.fullName}
                </Text>
                <Text
                  style={[
                    styles.workerChipId,
                    workerId === worker.id && styles.workerChipIdActive,
                  ]}
                >
                  {worker.employeeId}
                </Text>
                {selectedWorker?.id === worker.id && (
                  <View style={styles.rateInfo}>
                    <Text style={styles.rateText}>
                      {formatCurrency(worker.hourlyRate || 0)}/h
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Period */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Kỳ lương <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Từ ngày:</Text>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => setShowStartPicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={styles.dateText}>{formatDate(periodStart)}</Text>
              </TouchableOpacity>

              {showStartPicker && (
                <DateTimePicker
                  value={periodStart}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowStartPicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setPeriodStart(selectedDate);
                      if (selectedDate > periodEnd) {
                        setPeriodEnd(selectedDate);
                      }
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Đến ngày:</Text>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => setShowEndPicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={styles.dateText}>{formatDate(periodEnd)}</Text>
              </TouchableOpacity>

              {showEndPicker && (
                <DateTimePicker
                  value={periodEnd}
                  mode="date"
                  minimumDate={periodStart}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowEndPicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setPeriodEnd(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          </View>
        </View>

        {/* Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Giờ làm việc <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Giờ thường:</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={regularHours}
                onChangeText={setRegularHours}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Tăng ca:</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={overtimeHours}
                onChangeText={setOvertimeHours}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Earnings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thu nhập</Text>

          <View style={styles.calculatedRow}>
            <Text style={styles.calculatedLabel}>Lương cơ bản:</Text>
            <Text style={styles.calculatedValue}>{formatCurrency(pay.regularPay)}</Text>
          </View>

          <View style={styles.calculatedRow}>
            <Text style={styles.calculatedLabel}>Lương tăng ca:</Text>
            <Text style={styles.calculatedValue}>{formatCurrency(pay.overtimePay)}</Text>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Thưởng:</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={bonuses}
                onChangeText={setBonuses}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Phụ cấp:</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={allowances}
                onChangeText={setAllowances}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[styles.calculatedRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng thu nhập:</Text>
            <Text style={[styles.totalValue, { color: '#0066CC' }]}>
              {formatCurrency(pay.grossPay)}
            </Text>
          </View>
        </View>

        {/* Deductions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khấu trừ</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Thuế:</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={taxes}
                onChangeText={setTaxes}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Bảo hiểm:</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={insurance}
                onChangeText={setInsurance}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Ứng trước:</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={advances}
                onChangeText={setAdvances}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Khác:</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={otherDeductions}
                onChangeText={setOtherDeductions}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[styles.calculatedRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng khấu trừ:</Text>
            <Text style={[styles.totalValue, { color: '#000000' }]}>
              {formatCurrency(pay.totalDeductions)}
            </Text>
          </View>
        </View>

        {/* Net Pay */}
        <View style={styles.netPaySection}>
          <Text style={styles.netPayLabel}>Thực lãnh</Text>
          <Text style={styles.netPayValue}>{formatCurrency(pay.netPay)}</Text>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Phương thức thanh toán <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.methodGrid}>
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.methodChip,
                  paymentMethod === option.value && styles.methodChipActive,
                ]}
                onPress={() => setPaymentMethod(option.value)}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={paymentMethod === option.value ? '#0066CC' : '#666'}
                />
                <Text
                  style={[
                    styles.methodLabel,
                    paymentMethod === option.value && styles.methodLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Ghi chú thêm..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Đang lưu...' : 'Lưu'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  required: {
    color: '#000000',
  },
  chipScroll: {
    flexGrow: 0,
  },
  workerChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    minWidth: 120,
  },
  workerChipActive: {
    backgroundColor: '#E8F4FF',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  workerChipName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  workerChipNameActive: {
    color: '#0066CC',
  },
  workerChipId: {
    fontSize: 11,
    color: '#666',
  },
  workerChipIdActive: {
    color: '#0066CC',
  },
  rateInfo: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E8F4FF',
  },
  rateText: {
    fontSize: 11,
    color: '#0066CC',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputField: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
  },
  calculatedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  calculatedLabel: {
    fontSize: 13,
    color: '#666',
  },
  calculatedValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  netPaySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderTopWidth: 3,
    borderTopColor: '#0066CC',
  },
  netPayLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1976D2',
  },
  netPayValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1976D2',
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  methodChipActive: {
    backgroundColor: '#E8F4FF',
    borderColor: '#0066CC',
  },
  methodLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  methodLabelActive: {
    color: '#0066CC',
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    backgroundColor: '#fff',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#0066CC',
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
