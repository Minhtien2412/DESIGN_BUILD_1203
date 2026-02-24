import { useMaterials, useSuppliers } from '@/hooks/useInventory';
import { MaterialCategory, MaterialUnit } from '@/types/inventory';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CATEGORY_OPTIONS: { value: MaterialCategory; label: string; icon: string }[] = [
  { value: MaterialCategory.CEMENT, label: 'Xi măng', icon: 'cube' },
  { value: MaterialCategory.STEEL, label: 'Thép', icon: 'git-network' },
  { value: MaterialCategory.SAND, label: 'Cát', icon: 'water' },
  { value: MaterialCategory.GRAVEL, label: 'Đá', icon: 'shapes' },
  { value: MaterialCategory.BRICK, label: 'Gạch', icon: 'grid' },
  { value: MaterialCategory.TILE, label: 'Gạch lát', icon: 'apps' },
  { value: MaterialCategory.PAINT, label: 'Sơn', icon: 'color-palette' },
  { value: MaterialCategory.WOOD, label: 'Gỗ', icon: 'file-tray-stacked' },
  { value: MaterialCategory.ELECTRICAL, label: 'Điện', icon: 'flash' },
  { value: MaterialCategory.PLUMBING, label: 'Nước', icon: 'water-outline' },
  { value: MaterialCategory.TOOLS, label: 'Dụng cụ', icon: 'construct' },
  { value: MaterialCategory.SAFETY_EQUIPMENT, label: 'An toàn', icon: 'shield-checkmark' },
  { value: MaterialCategory.OTHER, label: 'Khác', icon: 'ellipsis-horizontal' },
];

const UNIT_OPTIONS: { value: MaterialUnit; label: string }[] = [
  { value: MaterialUnit.KG, label: 'Kilogram (kg)' },
  { value: MaterialUnit.TON, label: 'Tấn' },
  { value: MaterialUnit.M, label: 'Mét (m)' },
  { value: MaterialUnit.M2, label: 'Mét vuông (m²)' },
  { value: MaterialUnit.M3, label: 'Mét khối (m³)' },
  { value: MaterialUnit.PIECE, label: 'Cái' },
  { value: MaterialUnit.BOX, label: 'Thùng' },
  { value: MaterialUnit.BAG, label: 'Bao' },
  { value: MaterialUnit.LITER, label: 'Lít' },
  { value: MaterialUnit.SET, label: 'Bộ' },
];

export default function CreateMaterialScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { createMaterial } = useMaterials(projectId!);
  const { suppliers } = useSuppliers(projectId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MaterialCategory | null>(null);
  const [unit, setUnit] = useState<MaterialUnit | null>(null);
  const [currentStock, setCurrentStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [warehouseLocation, setWarehouseLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên vật liệu');
      return;
    }

    if (!category) {
      Alert.alert('Lỗi', 'Vui lòng chọn loại vật liệu');
      return;
    }

    if (!unit) {
      Alert.alert('Lỗi', 'Vui lòng chọn đơn vị');
      return;
    }

    const currentStockNum = parseFloat(currentStock);
    if (!currentStock || isNaN(currentStockNum) || currentStockNum < 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số lượng tồn kho hợp lệ');
      return;
    }

    const minStockNum = parseFloat(minStock);
    if (!minStock || isNaN(minStockNum) || minStockNum < 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số lượng tối thiểu hợp lệ');
      return;
    }

    const unitPriceNum = parseFloat(unitPrice);
    if (!unitPrice || isNaN(unitPriceNum) || unitPriceNum <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập đơn giá hợp lệ');
      return;
    }

    setLoading(true);
    try {
      await createMaterial({
        projectId: projectId!,
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        unit,
        currentStock: currentStockNum,
        minStock: minStockNum,
        maxStock: maxStock ? parseFloat(maxStock) : undefined,
        unitPrice: unitPriceNum,
        supplierId: supplierId || undefined,
        warehouseLocation: warehouseLocation.trim() || undefined,
      });

      Alert.alert('Thành công', 'Đã thêm vật liệu', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm vật liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              Tên vật liệu <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Xi măng PC40, Thép D10..."
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Thêm mô tả chi tiết..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Loại vật liệu <Text style={styles.required}>*</Text>
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
                  size={18}
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

        {/* Unit */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Đơn vị <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.unitGrid}>
            {UNIT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.unitCard,
                  unit === option.value && styles.unitCardActive,
                ]}
                onPress={() => setUnit(option.value)}
              >
                <Text
                  style={[
                    styles.unitText,
                    unit === option.value && styles.unitTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stock Quantities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số lượng</Text>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>
                Tồn kho hiện tại <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={currentStock}
                onChangeText={setCurrentStock}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>
                Tồn kho tối thiểu <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={minStock}
                onChangeText={setMinStock}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tồn kho tối đa (tùy chọn)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={maxStock}
              onChangeText={setMaxStock}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={16} color="#0D9488" />
            <Text style={styles.infoText}>
              Khi tồn kho giảm xuống dưới mức tối thiểu, hệ thống sẽ tự động tạo
              cảnh báo.
            </Text>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Đơn giá (VND) <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="cash-outline" size={20} color="#666" />
            <TextInput
              style={[styles.input, styles.inputInRow]}
              placeholder="0"
              value={unitPrice}
              onChangeText={setUnitPrice}
              keyboardType="numeric"
            />
            <Text style={styles.currencyLabel}>VND</Text>
          </View>
        </View>

        {/* Supplier */}
        <View style={styles.section}>
          <Text style={styles.label}>Nhà cung cấp (tùy chọn)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.supplierScroll}
          >
            <TouchableOpacity
              style={[
                styles.supplierChip,
                supplierId === null && styles.supplierChipActive,
              ]}
              onPress={() => setSupplierId(null)}
            >
              <Text
                style={[
                  styles.supplierChipText,
                  supplierId === null && styles.supplierChipTextActive,
                ]}
              >
                Không chọn
              </Text>
            </TouchableOpacity>

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

        {/* Warehouse Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Vị trí kho (tùy chọn)</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Kho A - Kệ 3 - Tầng 2"
            value={warehouseLocation}
            onChangeText={setWarehouseLocation}
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
            {loading ? 'Đang lưu...' : 'Lưu vật liệu'}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfField: {
    flex: 1,
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
    minHeight: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
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
  unitGrid: {
    gap: 8,
  },
  unitCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  unitCardActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  unitText: {
    fontSize: 14,
    color: '#666',
  },
  unitTextActive: {
    color: '#0D9488',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0FDFA',
    padding: 10,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1565C0',
  },
  supplierScroll: {
    flexGrow: 0,
  },
  supplierChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  supplierChipActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  supplierChipText: {
    fontSize: 13,
    color: '#666',
  },
  supplierChipTextActive: {
    color: '#0D9488',
    fontWeight: '600',
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
