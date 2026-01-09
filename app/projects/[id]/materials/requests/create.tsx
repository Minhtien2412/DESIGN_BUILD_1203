/**
 * Materials Management - Create Request
 * Form tạo yêu cầu vật liệu
 */

import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Material, MaterialsService } from '@/services/api/materials.mock';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CreateRequestScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [quantity, setQuantity] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await MaterialsService.getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Failed to load materials:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMaterial) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn vật liệu');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số lượng hợp lệ');
      return;
    }

    try {
      setSaving(true);

      await MaterialsService.createRequest({
        projectId,
        materialId: selectedMaterial.id,
        materialName: selectedMaterial.name,
        quantity: parseFloat(quantity),
        unit: selectedMaterial.unit,
        requestedBy: 'Current User',
        status: 'pending',
        urgency,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Thành công', 'Đã tạo yêu cầu vật liệu', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo yêu cầu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fullWidth>
      <StatusBar style="dark" />

      {/* Header */}
      <Section>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Yêu cầu vật liệu</Text>
          <View style={{ width: 40 }} />
        </View>
      </Section>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Material Selection */}
        <Section>
          <Text style={styles.sectionTitle}>Chọn vật liệu</Text>

          {!showMaterialPicker && !selectedMaterial && (
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowMaterialPicker(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
              <Text style={styles.selectButtonText}>Chọn vật liệu</Text>
            </TouchableOpacity>
          )}

          {selectedMaterial && (
            <View style={styles.selectedMaterial}>
              <View style={styles.selectedMaterialInfo}>
                <Text style={styles.selectedMaterialName}>{selectedMaterial.name}</Text>
                <Text style={styles.selectedMaterialUnit}>
                  Tồn kho: {selectedMaterial.currentStock} {selectedMaterial.unit}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedMaterial(null)}>
                <Ionicons name="close-circle" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
          )}

          {showMaterialPicker && !selectedMaterial && (
            <View style={styles.materialList}>
              {materials.map(material => (
                <TouchableOpacity
                  key={material.id}
                  style={styles.materialItem}
                  onPress={() => {
                    setSelectedMaterial(material);
                    setShowMaterialPicker(false);
                  }}
                >
                  <View style={styles.materialItemInfo}>
                    <Text style={styles.materialItemName}>{material.name}</Text>
                    <Text style={styles.materialItemStock}>
                      Tồn: {material.currentStock} {material.unit}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Section>

        {/* Quantity */}
        {selectedMaterial && (
          <Section>
            <Text style={styles.sectionTitle}>Số lượng</Text>
            <View style={styles.quantityContainer}>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="0"
              />
              <Text style={styles.unitText}>{selectedMaterial.unit}</Text>
            </View>
          </Section>
        )}

        {/* Urgency */}
        <Section>
          <Text style={styles.sectionTitle}>Mức độ khẩn cấp</Text>
          <View style={styles.urgencyButtons}>
            {[
              { value: 'low', label: 'Thấp', color: '#0066CC' },
              { value: 'medium', label: 'Trung bình', color: '#0066CC' },
              { value: 'high', label: 'Cao', color: '#000000' },
            ].map(({ value, label, color }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.urgencyButton,
                  urgency === value && { backgroundColor: color + '15', borderColor: color },
                ]}
                onPress={() => setUrgency(value as any)}
              >
                <Text
                  style={[
                    styles.urgencyButtonText,
                    urgency === value && { color, fontWeight: '700' },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Notes */}
        <Section>
          <Text style={styles.sectionTitle}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Mục đích sử dụng, yêu cầu đặc biệt..."
            multiline
            numberOfLines={4}
          />
        </Section>

        {/* Actions */}
        <Section>
          <Button
            title="Tạo yêu cầu"
            onPress={handleSubmit}
            loading={saving}
            disabled={saving || !selectedMaterial}
          />

          <Button
            title="Hủy"
            variant="outline"
            onPress={() => router.back()}
            style={{ marginTop: 12 }}
            disabled={saving}
          />
        </Section>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
  },
  selectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3b82f6',
  },
  selectedMaterial: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F4FF',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
  },
  selectedMaterialInfo: {
    flex: 1,
  },
  selectedMaterialName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  selectedMaterialUnit: {
    fontSize: 13,
    color: '#6b7280',
  },
  materialList: {
    maxHeight: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  materialItemInfo: {
    flex: 1,
  },
  materialItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  materialItemStock: {
    fontSize: 12,
    color: '#9ca3af',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  urgencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  urgencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
