import { useMaterialOrders, useMaterials, useSuppliers } from '@/hooks/useInventory';
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

interface OrderItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  unit: string;
}

export default function CreateOrderScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { createOrder } = useMaterialOrders(projectId);
  const { suppliers } = useSuppliers(projectId);
  const { materials } = useMaterials(projectId);

  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [orderDate, setOrderDate] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showOrderDatePicker, setShowOrderDatePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [taxRate, setTaxRate] = useState('10');
  const [shippingCost, setShippingCost] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    if (materials.length === 0) {
      Alert.alert('Lỗi', 'Chưa có vật tư nào. Vui lòng tạo vật tư trước.');
      return;
    }

    const newItem: OrderItem = {
      materialId: materials[0].id,
      materialName: materials[0].name,
      quantity: 1,
      unitPrice: materials[0].unitPrice || 0,
      amount: materials[0].unitPrice || 0,
      unit: materials[0].unit,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === 'materialId') {
      const material = materials.find((m) => m.id === value);
      if (material) {
        item.materialId = material.id;
        item.materialName = material.name;
        item.unitPrice = material.unitPrice || 0;
        item.unit = material.unit;
        item.amount = item.quantity * (material.unitPrice || 0);
      }
    } else if (field === 'quantity') {
      const qty = parseFloat(value as string) || 0;
      item.quantity = qty;
      item.amount = qty * item.unitPrice;
    } else if (field === 'unitPrice') {
      const price = parseFloat(value as string) || 0;
      item.unitPrice = price;
      item.amount = item.quantity * price;
    }

    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (parseFloat(taxRate) || 0) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + (parseFloat(shippingCost) || 0);
  };

  const handleSave = async () => {
    if (!supplierId) {
      Alert.alert('Lỗi', 'Vui lòng chọn nhà cung cấp');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một vật tư');
      return;
    }

    for (const item of items) {
      if (item.quantity <= 0) {
        Alert.alert('Lỗi', 'Số lượng phải lớn hơn 0');
        return;
      }
      if (item.unitPrice <= 0) {
        Alert.alert('Lỗi', 'Đơn giá phải lớn hơn 0');
        return;
      }
    }

    setLoading(true);
    try {
      await createOrder({
        projectId: projectId || '',
        supplierId,
        orderDate: orderDate.toISOString(),
        deliveryDate: deliveryDate.toISOString(),
        expectedDeliveryDate: deliveryDate.toISOString(),
        items: items.map((item) => ({
          materialId: item.materialId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        subtotal: calculateSubtotal(),
        taxRate: parseFloat(taxRate) || 0,
        taxAmount: calculateTax(),
        shippingCost: parseFloat(shippingCost) || 0,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Thành công', 'Đã tạo đơn hàng', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Supplier Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Nhà cung cấp <Text style={styles.required}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {suppliers.map((supplier) => (
              <TouchableOpacity
                key={supplier.id}
                style={[
                  styles.supplierChip,
                  supplierId === supplier.id && styles.supplierChipActive,
                ]}
                onPress={() => setSupplierId(supplier.id)}
              >
                <Text
                  style={[
                    styles.supplierChipText,
                    supplierId === supplier.id && styles.supplierChipTextActive,
                  ]}
                >
                  {supplier.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ngày đặt hàng</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowOrderDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateText}>
              {orderDate.toLocaleDateString('vi-VN')}
            </Text>
          </TouchableOpacity>

          {showOrderDatePicker && (
            <DateTimePicker
              value={orderDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowOrderDatePicker(Platform.OS === 'ios');
                if (date) setOrderDate(date);
              }}
            />
          )}

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Ngày giao hàng dự kiến</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDeliveryDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateText}>
              {deliveryDate.toLocaleDateString('vi-VN')}
            </Text>
          </TouchableOpacity>

          {showDeliveryDatePicker && (
            <DateTimePicker
              value={deliveryDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowDeliveryDatePicker(Platform.OS === 'ios');
                if (date) setDeliveryDate(date);
              }}
            />
          )}
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Vật tư <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Ionicons name="add-circle-outline" size={20} color="#0D9488" />
              <Text style={styles.addButtonText}>Thêm vật tư</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemNumber}>Vật tư {index + 1}</Text>
                <TouchableOpacity onPress={() => removeItem(index)}>
                  <Ionicons name="trash-outline" size={20} color="#000000" />
                </TouchableOpacity>
              </View>

              {/* Material Selector */}
              <View style={styles.field}>
                <Text style={styles.label}>Tên vật tư</Text>
                <View style={styles.pickerContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {materials.map((material) => (
                      <TouchableOpacity
                        key={material.id}
                        style={[
                          styles.materialChip,
                          item.materialId === material.id && styles.materialChipActive,
                        ]}
                        onPress={() => updateItem(index, 'materialId', material.id)}
                      >
                        <Text
                          style={[
                            styles.materialChipText,
                            item.materialId === material.id &&
                              styles.materialChipTextActive,
                          ]}
                        >
                          {material.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Quantity and Price */}
              <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Số lượng</Text>
                  <TextInput
                    style={styles.input}
                    value={item.quantity.toString()}
                    onChangeText={(value) => updateItem(index, 'quantity', value)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <Text style={styles.unitLabel}>{item.unit}</Text>
                </View>

                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Đơn giá</Text>
                  <TextInput
                    style={styles.input}
                    value={item.unitPrice.toString()}
                    onChangeText={(value) => updateItem(index, 'unitPrice', value)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <Text style={styles.unitLabel}>VND</Text>
                </View>
              </View>

              {/* Amount */}
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Thành tiền:</Text>
                <Text style={styles.amountValue}>{formatCurrency(item.amount)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tax & Shipping */}
        {items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi phí bổ sung</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Thuế VAT (%)</Text>
              <TextInput
                style={styles.input}
                value={taxRate}
                onChangeText={setTaxRate}
                keyboardType="numeric"
                placeholder="10"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phí vận chuyển (VND)</Text>
              <TextInput
                style={styles.input}
                value={shippingCost}
                onChangeText={setShippingCost}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>
        )}

        {/* Calculations */}
        {items.length > 0 && (
          <View style={styles.section}>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Tạm tính:</Text>
              <Text style={styles.calcValue}>{formatCurrency(calculateSubtotal())}</Text>
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Thuế VAT ({taxRate}%):</Text>
              <Text style={styles.calcValue}>{formatCurrency(calculateTax())}</Text>
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Phí vận chuyển:</Text>
              <Text style={styles.calcValue}>
                {formatCurrency(parseFloat(shippingCost) || 0)}
              </Text>
            </View>

            <View style={[styles.calcRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
            </View>
          </View>
        )}

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
            {loading ? 'Đang lưu...' : 'Tạo đơn hàng'}
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
  required: {
    color: '#000000',
  },
  chipContainer: {
    flexGrow: 0,
  },
  supplierChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  supplierChipActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  supplierChipText: {
    fontSize: 14,
    color: '#666',
  },
  supplierChipTextActive: {
    color: '#0D9488',
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 15,
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    color: '#0D9488',
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  field: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  pickerContainer: {
    flexGrow: 0,
  },
  materialChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  materialChipActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  materialChipText: {
    fontSize: 13,
    color: '#666',
  },
  materialChipTextActive: {
    color: '#0D9488',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 60,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  unitLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  calcLabel: {
    fontSize: 14,
    color: '#666',
  },
  calcValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
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
