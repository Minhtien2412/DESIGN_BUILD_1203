import { useInvoices } from '@/hooks/useBudget';
import type { InvoiceItem } from '@/types/budget';
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

export default function CreateInvoiceScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { createInvoice } = useInvoices(projectId!);

  // Client info
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Invoice details
  const [issueDate, setIssueDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // Line items
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { description: '', quantity: 1, unit: '', unitPrice: 0, amount: 0 },
  ]);

  // Calculations
  const [taxRate, setTaxRate] = useState('10');
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);

  const handleIssueDateChange = (_event: any, selectedDate?: Date) => {
    setShowIssueDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setIssueDate(selectedDate);
      // Auto-adjust due date if before issue date
      if (dueDate < selectedDate) {
        setDueDate(new Date(selectedDate.getTime() + 30 * 24 * 60 * 60 * 1000));
      }
    }
  };

  const handleDueDateChange = (_event: any, selectedDate?: Date) => {
    setShowDueDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (selectedDate < issueDate) {
        Alert.alert('Lỗi', 'Ngày đến hạn phải sau ngày lập hóa đơn');
        return;
      }
      setDueDate(selectedDate);
    }
  };

  const updateItemAmount = (index: number, item: Partial<InvoiceItem>) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const amount = quantity * unitPrice;

    const newItems = [...items];
    newItems[index] = { ...item, amount };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { description: '', quantity: 1, unit: '', unitPrice: 0, amount: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      Alert.alert('Lỗi', 'Hóa đơn phải có ít nhất 1 mục hàng');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxRateNum = parseFloat(taxRate) || 0;
    const discountNum = parseFloat(discount) || 0;
    const taxAmount = (subtotal * taxRateNum) / 100;
    const total = subtotal + taxAmount - discountNum;

    return { subtotal, taxAmount, total };
  };

  const handleSave = async () => {
    // Validation
    if (!clientName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên khách hàng');
      return;
    }

    if (!clientEmail.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email khách hàng');
      return;
    }

    const validItems = items.filter(
      (item) => item.description && item.description.trim()
    );

    if (validItems.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất 1 mục hàng');
      return;
    }

    const hasInvalidItems = validItems.some(
      (item) => !item.quantity || item.quantity <= 0 || !item.unitPrice || item.unitPrice <= 0
    );

    if (hasInvalidItems) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin cho tất cả mục hàng');
      return;
    }

    const { subtotal, taxAmount, total } = calculateTotals();

    setLoading(true);
    try {
      await createInvoice({
        projectId: projectId!,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientAddress: clientAddress.trim() || '',
        issueDate: issueDate,
        dueDate: dueDate,
        items: validItems.map((item, index) => ({
          id: `temp-${index}`,
          description: item.description!,
          quantity: item.quantity!,
          unit: item.unit || '',
          unitPrice: item.unitPrice!,
          amount: item.amount!,
        })),
        subtotal,
        taxRate: parseFloat(taxRate) || 0,
        taxAmount,
        discount: parseFloat(discount) || 0,
        total,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Thành công', 'Đã tạo hóa đơn', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo hóa đơn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              Tên khách hàng <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Công ty TNHH ABC"
              value={clientName}
              onChangeText={setClientName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              value={clientEmail}
              onChangeText={setClientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập địa chỉ..."
              value={clientAddress}
              onChangeText={setClientAddress}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Invoice Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ngày tháng</Text>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.label}>Ngày lập</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowIssueDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={styles.dateText}>
                  {issueDate.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateField}>
              <Text style={styles.label}>Ngày đến hạn</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDueDatePicker(true)}
              >
                <Ionicons name="time-outline" size={18} color="#666" />
                <Text style={styles.dateText}>
                  {dueDate.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showIssueDatePicker && (
            <DateTimePicker
              value={issueDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleIssueDateChange}
            />
          )}

          {showDueDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDueDateChange}
              minimumDate={issueDate}
            />
          )}
        </View>

        {/* Line Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mục hàng hóa / dịch vụ</Text>
            <TouchableOpacity onPress={addItem}>
              <Ionicons name="add-circle" size={24} color="#0D9488" />
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemNumber}>#{index + 1}</Text>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Ionicons name="trash-outline" size={20} color="#000000" />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Mô tả hàng hóa / dịch vụ"
                value={item.description}
                onChangeText={(text) =>
                  updateItemAmount(index, { ...item, description: text })
                }
              />

              <View style={styles.itemRow}>
                <View style={styles.itemFieldSmall}>
                  <Text style={styles.smallLabel}>Số lượng</Text>
                  <TextInput
                    style={styles.smallInput}
                    placeholder="0"
                    value={item.quantity?.toString()}
                    onChangeText={(text) =>
                      updateItemAmount(index, {
                        ...item,
                        quantity: parseFloat(text) || 0,
                      })
                    }
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.itemFieldSmall}>
                  <Text style={styles.smallLabel}>Đơn vị</Text>
                  <TextInput
                    style={styles.smallInput}
                    placeholder="m², kg..."
                    value={item.unit}
                    onChangeText={(text) =>
                      updateItemAmount(index, { ...item, unit: text })
                    }
                  />
                </View>

                <View style={styles.itemFieldLarge}>
                  <Text style={styles.smallLabel}>Đơn giá</Text>
                  <TextInput
                    style={styles.smallInput}
                    placeholder="0"
                    value={item.unitPrice?.toString()}
                    onChangeText={(text) =>
                      updateItemAmount(index, {
                        ...item,
                        unitPrice: parseFloat(text) || 0,
                      })
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.itemTotal}>
                <Text style={styles.itemTotalLabel}>Thành tiền:</Text>
                <Text style={styles.itemTotalValue}>
                  {formatCurrency(item.amount || 0)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Calculations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tính toán</Text>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Tạm tính:</Text>
            <Text style={styles.calcValue}>{formatCurrency(subtotal)}</Text>
          </View>

          <View style={styles.calcInputRow}>
            <Text style={styles.calcLabel}>Thuế VAT (%):</Text>
            <TextInput
              style={styles.calcInput}
              value={taxRate}
              onChangeText={setTaxRate}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Tiền thuế:</Text>
            <Text style={styles.calcValue}>{formatCurrency(taxAmount)}</Text>
          </View>

          <View style={styles.calcInputRow}>
            <Text style={styles.calcLabel}>Giảm giá (VND):</Text>
            <TextInput
              style={styles.calcInput}
              value={discount}
              onChangeText={setDiscount}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Thêm ghi chú cho hóa đơn..."
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
          <Text style={styles.saveButtonText}>
            {loading ? 'Đang lưu...' : 'Lưu hóa đơn'}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
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
  textArea: {
    minHeight: 60,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
  },
  itemRow: {
    flexDirection: 'row',
    gap: 8,
  },
  itemFieldSmall: {
    flex: 1,
  },
  itemFieldLarge: {
    flex: 1.5,
  },
  smallLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: '#333',
  },
  itemTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  itemTotalLabel: {
    fontSize: 13,
    color: '#666',
  },
  itemTotalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  calcInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  calcLabel: {
    fontSize: 14,
    color: '#666',
  },
  calcValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  calcInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: '#333',
    width: 100,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#0D9488',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D9488',
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
