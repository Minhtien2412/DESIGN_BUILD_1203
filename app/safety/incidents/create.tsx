import { Container } from '@/components/ui/container';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type SeverityType = 'low' | 'medium' | 'high' | 'critical';
type IncidentType = 'injury' | 'near-miss' | 'property-damage' | 'environmental' | 'security' | 'other';

interface Witness {
  id: string;
  name: string;
  phone: string;
}

export default function CreateIncidentScreen() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<SeverityType>('medium');
  const [incidentType, setIncidentType] = useState<IncidentType>('near-miss');
  const [injuredPersons, setInjuredPersons] = useState('');
  const [immediateActions, setImmediateActions] = useState('');
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [newWitnessName, setNewWitnessName] = useState('');
  const [newWitnessPhone, setNewWitnessPhone] = useState('');

  const severityOptions: { value: SeverityType; label: string; color: string }[] = [
    { value: 'low', label: 'Thấp', color: '#0D9488' },
    { value: 'medium', label: 'Trung bình', color: '#14B8A6' },
    { value: 'high', label: 'Cao', color: '#0D9488' },
    { value: 'critical', label: 'Nghiêm trọng', color: '#000000' },
  ];

  const incidentTypes: { value: IncidentType; label: string; icon: string }[] = [
    { value: 'injury', label: 'Chấn thương', icon: 'medical' },
    { value: 'near-miss', label: 'Suýt xảy ra', icon: 'warning' },
    { value: 'property-damage', label: 'Hư hại tài sản', icon: 'construct' },
    { value: 'environmental', label: 'Môi trường', icon: 'leaf' },
    { value: 'security', label: 'An ninh', icon: 'shield' },
    { value: 'other', label: 'Khác', icon: 'ellipsis-horizontal' },
  ];

  const addWitness = () => {
    if (!newWitnessName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên nhân chứng');
      return;
    }
    setWitnesses([
      ...witnesses,
      {
        id: Date.now().toString(),
        name: newWitnessName.trim(),
        phone: newWitnessPhone.trim(),
      },
    ]);
    setNewWitnessName('');
    setNewWitnessPhone('');
  };

  const removeWitness = (id: string) => {
    setWitnesses(witnesses.filter((w) => w.id !== id));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề sự cố');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng mô tả chi tiết sự cố');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập vị trí xảy ra sự cố');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert(
        'Báo cáo thành công',
        'Sự cố đã được ghi nhận và sẽ được xử lý trong thời gian sớm nhất.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi báo cáo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fullWidth>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Báo cáo sự cố</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Alert Banner */}
          <View style={styles.alertBanner}>
            <Ionicons name="alert-circle" size={24} color="#B91C1C" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Báo cáo sự cố an toàn</Text>
              <Text style={styles.alertText}>
                Vui lòng cung cấp đầy đủ thông tin để xử lý sự cố nhanh chóng
              </Text>
            </View>
          </View>

          {/* Incident Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loại sự cố</Text>
            <View style={styles.typeGrid}>
              {incidentTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeCard,
                    incidentType === type.value && styles.typeCardActive,
                  ]}
                  onPress={() => setIncidentType(type.value)}
                >
                  <View
                    style={[
                      styles.typeIcon,
                      incidentType === type.value && styles.typeIconActive,
                    ]}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={24}
                      color={incidentType === type.value ? '#fff' : '#64748B'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.typeLabel,
                      incidentType === type.value && styles.typeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Severity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mức độ nghiêm trọng</Text>
            <View style={styles.severityRow}>
              {severityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.severityButton,
                    { borderColor: option.color },
                    severity === option.value && { backgroundColor: option.color },
                  ]}
                  onPress={() => setSeverity(option.value)}
                >
                  <Text
                    style={[
                      styles.severityLabel,
                      { color: option.color },
                      severity === option.value && { color: '#fff' },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title & Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết sự cố</Text>
            
            <Text style={styles.inputLabel}>Tiêu đề *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="VD: Tai nạn lao động tại tầng 5"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Mô tả chi tiết *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Mô tả diễn biến sự cố, nguyên nhân dự đoán..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Vị trí *</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="location-outline" size={20} color="#94A3B8" />
              <TextInput
                style={styles.inputInner}
                value={location}
                onChangeText={setLocation}
                placeholder="VD: Tầng 5, khu vực đổ bê tông"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <Text style={styles.inputLabel}>Người bị thương (nếu có)</Text>
            <TextInput
              style={styles.input}
              value={injuredPersons}
              onChangeText={setInjuredPersons}
              placeholder="Tên, số lượng người bị thương..."
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Hành động ứng phó ngay</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={immediateActions}
              onChangeText={setImmediateActions}
              placeholder="Các biện pháp đã thực hiện ngay sau sự cố..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Witnesses */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nhân chứng</Text>
            
            {witnesses.map((witness) => (
              <View key={witness.id} style={styles.witnessCard}>
                <View style={styles.witnessInfo}>
                  <Text style={styles.witnessName}>{witness.name}</Text>
                  {witness.phone && (
                    <Text style={styles.witnessPhone}>{witness.phone}</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => removeWitness(witness.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={22} color="#000000" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addWitnessForm}>
              <TextInput
                style={styles.witnessInput}
                value={newWitnessName}
                onChangeText={setNewWitnessName}
                placeholder="Tên nhân chứng"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={styles.witnessInput}
                value={newWitnessPhone}
                onChangeText={setNewWitnessPhone}
                placeholder="Số điện thoại"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={styles.addWitnessButton} onPress={addWitness}>
                <Ionicons name="add" size={20} color={Colors.light.primary} />
                <Text style={styles.addWitnessText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Attachments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hình ảnh / Video</Text>
            <TouchableOpacity style={styles.uploadButton}>
              <Ionicons name="camera-outline" size={32} color="#94A3B8" />
              <Text style={styles.uploadText}>Chụp ảnh hoặc quay video</Text>
              <Text style={styles.uploadHint}>Tối đa 10 tệp, mỗi tệp 20MB</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.draftButton}
            onPress={() => {
              Alert.alert('Đã lưu', 'Báo cáo đã được lưu nháp');
            }}
          >
            <Text style={styles.draftButtonText}>Lưu nháp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B91C1C',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    color: '#000000',
    lineHeight: 18,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 14,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeCard: {
    width: '31%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardActive: {
    backgroundColor: `${Colors.light.primary}10`,
    borderColor: Colors.light.primary,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  typeIconActive: {
    backgroundColor: Colors.light.primary,
  },
  typeLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  typeLabelActive: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  severityLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  textArea: {
    minHeight: 100,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 10,
  },
  inputInner: {
    flex: 1,
    padding: 14,
    paddingLeft: 0,
    fontSize: 15,
    color: '#333',
  },
  witnessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  witnessInfo: {
    flex: 1,
  },
  witnessName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  witnessPhone: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  addWitnessForm: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  witnessInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  addWitnessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.light.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  addWitnessText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  uploadText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  uploadHint: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  draftButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  draftButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
