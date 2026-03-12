import { useBudgets, useExpenses } from '@/hooks/useBudget';
import { BudgetCategory, PaymentMethod } from '@/types/budget';
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

const CATEGORY_OPTIONS: { value: BudgetCategory; label: string; icon: string }[] = [
  { value: BudgetCategory.LABOR, label: 'Nhân công', icon: 'people' },
  { value: BudgetCategory.MATERIALS, label: 'Vật liệu', icon: 'cube' },
  { value: BudgetCategory.EQUIPMENT, label: 'Thiết bị', icon: 'construct' },
  { value: BudgetCategory.SUBCONTRACTOR, label: 'Thầu phụ', icon: 'business' },
  { value: BudgetCategory.PERMITS, label: 'Giấy phép', icon: 'document-text' },
  { value: BudgetCategory.UTILITIES, label: 'Tiện ích', icon: 'flash' },
  { value: BudgetCategory.INSURANCE, label: 'Bảo hiểm', icon: 'shield-checkmark' },
  { value: BudgetCategory.OVERHEAD, label: 'Chi phí chung', icon: 'ellipsis-horizontal' },
  { value: BudgetCategory.CONTINGENCY, label: 'Dự phòng', icon: 'warning' },
  { value: BudgetCategory.OTHER, label: 'Khác', icon: 'apps' },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: PaymentMethod.CASH, label: 'Tiền mặt', icon: 'cash' },
  { value: PaymentMethod.BANK_TRANSFER, label: 'Chuyển khoản', icon: 'swap-horizontal' },
  { value: PaymentMethod.CHECK, label: 'Séc', icon: 'card' },
  { value: PaymentMethod.CREDIT_CARD, label: 'Thẻ tín dụng', icon: 'card-outline' },
  { value: PaymentMethod.MOBILE_PAYMENT, label: 'Ví điện tử', icon: 'phone-portrait' },
];

export default function CreateExpenseScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { budgets } = useBudgets(projectId!);
  const { createExpense } = useExpenses(projectId!);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState<BudgetCategory | null>(null);
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [vendor, setVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả chi tiêu');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (!category) {
      Alert.alert('Lỗi', 'Vui lòng chọn hạng mục chi tiêu');
      return;
    }

    setLoading(true);
    try {
      await createExpense({
        projectId: projectId!,
        description: description.trim(),
        amount: amountNum,
        date: date,
        category,
        budgetId: budgetId || undefined,
        vendor: vendor.trim() || undefined,
        paymentMethod: paymentMethod as any,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Thành công', 'Đã tạo chi tiêu', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo chi tiêu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Mô tả chi tiêu <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Mua xi măng, trả lương công nhân..."
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Số tiền <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="cash-outline" size={20} color="#666" />
            <TextInput
              style={[styles.input, styles.inputInRow]}
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <Text style={styles.currencyLabel}>VND</Text>
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Ngày chi</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateText}>
              {date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Hạng mục <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.optionsGrid}>
            {CATEGORY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  category === option.value && styles.optionCardActive,
                ]}
                onPress={() => setCategory(option.value)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={category === option.value ? '#0D9488' : '#666'}
                />
                <Text
                  style={[
                    styles.optionText,
                    category === option.value && styles.optionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Budget Assignment */}
        <View style={styles.section}>
          <Text style={styles.label}>Gán vào ngân sách (tùy chọn)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.budgetScroll}
          >
            <TouchableOpacity
              style={[
                styles.budgetChip,
                budgetId === null && styles.budgetChipActive,
              ]}
              onPress={() => setBudgetId(null)}
            >
              <Text
                style={[
                  styles.budgetChipText,
                  budgetId === null && styles.budgetChipTextActive,
                ]}
              >
                Không gán
              </Text>
            </TouchableOpacity>

            {budgets.map((budget) => (
              <TouchableOpacity
                key={budget.id}
                style={[
                  styles.budgetChip,
                  budgetId === budget.id && styles.budgetChipActive,
                ]}
                onPress={() => setBudgetId(budget.id)}
              >
                <Text
                  style={[
                    styles.budgetChipText,
                    budgetId === budget.id && styles.budgetChipTextActive,
                  ]}
                >
                  {budget.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Vendor */}
        <View style={styles.section}>
          <Text style={styles.label}>Nhà cung cấp / Người nhận (tùy chọn)</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Công ty TNHH ABC"
            value={vendor}
            onChangeText={setVendor}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.label}>Phương thức thanh toán</Text>
          <View style={styles.paymentGrid}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.paymentCard,
                  paymentMethod === method.value && styles.paymentCardActive,
                ]}
                onPress={() => setPaymentMethod(method.value)}
              >
                <Ionicons
                  name={method.icon as any}
                  size={22}
                  color={paymentMethod === method.value ? '#0D9488' : '#666'}
                />
                <Text
                  style={[
                    styles.paymentText,
                    paymentMethod === method.value && styles.paymentTextActive,
                  ]}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Thêm ghi chú..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Receipt Upload Placeholder */}
        <View style={styles.section}>
          <Text style={styles.label}>Hóa đơn đính kèm</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="cloud-upload-outline" size={24} color="#0D9488" />
            <Text style={styles.uploadText}>Tải lên hóa đơn</Text>
            <Text style={styles.uploadHint}>(Tính năng sắp ra mắt)</Text>
          </TouchableOpacity>
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
          <Text style={styles.saveButtonText}>
            {loading ? 'Đang lưu...' : 'Lưu chi tiêu'}
          </Text>
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
    marginBottom: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputInRow: {
    flex: 1,
    borderWidth: 0,
    padding: 12,
  },
  currencyLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  optionCardActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  optionText: {
    fontSize: 13,
    color: '#666',
  },
  optionTextActive: {
    color: '#0D9488',
    fontWeight: '600',
  },
  budgetScroll: {
    flexGrow: 0,
  },
  budgetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  budgetChipActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  budgetChipText: {
    fontSize: 13,
    color: '#666',
  },
  budgetChipTextActive: {
    color: '#0D9488',
    fontWeight: '600',
  },
  paymentGrid: {
    gap: 10,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  paymentCardActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  paymentText: {
    fontSize: 14,
    color: '#666',
  },
  paymentTextActive: {
    color: '#0D9488',
    fontWeight: '600',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#0D9488',
    fontWeight: '500',
  },
  uploadHint: {
    fontSize: 12,
    color: '#999',
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
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#0D9488',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
