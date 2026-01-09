import { useWorkers } from '@/hooks/useLabor';
import { WorkerRole } from '@/types/labor';
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

const ROLE_OPTIONS = [
  { value: WorkerRole.FOREMAN, label: 'Đốc công', icon: 'person-outline' },
  { value: WorkerRole.SKILLED_WORKER, label: 'Thợ chính', icon: 'build-outline' },
  { value: WorkerRole.UNSKILLED_WORKER, label: 'Phụ hồ', icon: 'hammer-outline' },
  { value: WorkerRole.EQUIPMENT_OPERATOR, label: 'Vận hành máy', icon: 'construct-outline' },
  { value: WorkerRole.ELECTRICIAN, label: 'Thợ điện', icon: 'flash-outline' },
  { value: WorkerRole.PLUMBER, label: 'Thợ nước', icon: 'water-outline' },
  { value: WorkerRole.CARPENTER, label: 'Thợ mộc', icon: 'cut-outline' },
  { value: WorkerRole.MASON, label: 'Thợ nề', icon: 'cube-outline' },
  { value: WorkerRole.PAINTER, label: 'Thợ sơn', icon: 'brush-outline' },
  { value: WorkerRole.WELDER, label: 'Thợ hàn', icon: 'flame-outline' },
  { value: WorkerRole.SAFETY_OFFICER, label: 'An toàn', icon: 'shield-checkmark-outline' },
  { value: WorkerRole.ENGINEER, label: 'Kỹ sư', icon: 'calculator-outline' },
  { value: WorkerRole.SUPERVISOR, label: 'Giám sát', icon: 'people-outline' },
  { value: WorkerRole.OTHER, label: 'Khác', icon: 'ellipsis-horizontal-outline' },
];

const COMMON_SKILLS = [
  'Xây dựng',
  'Điện lạnh',
  'Hàn',
  'Mộc',
  'Sơn',
  'Nề',
  'Lái xe',
  'Vận hành máy',
  'An toàn lao động',
  'Quản lý công trình',
];

export default function CreateWorkerScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { createWorker } = useWorkers(projectId);

  const [employeeId, setEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkerRole | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [address, setAddress] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [hireDate, setHireDate] = useState(new Date());
  const [showHireDatePicker, setShowHireDatePicker] = useState(false);
  const [hourlyRate, setHourlyRate] = useState('');
  const [overtimeRate, setOvertimeRate] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleSave = async () => {
    if (!employeeId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã nhân viên');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    if (!role) {
      Alert.alert('Lỗi', 'Vui lòng chọn chuyên môn');
      return;
    }

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập lương theo giờ hợp lệ');
      return;
    }

    setLoading(true);
    try {
      await createWorker({
        projectId: projectId || undefined,
        employeeId: employeeId.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim() || undefined,
        role,
        dateOfBirth: dateOfBirth?.toISOString() || undefined,
        address: address.trim() || undefined,
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
        hireDate: hireDate.toISOString(),
        hourlyRate: rate,
        overtimeRate: overtimeRate ? parseFloat(overtimeRate) : undefined,
        bankAccountNumber: bankAccountNumber.trim() || undefined,
        bankName: bankName.trim() || undefined,
        skills: skills.length > 0 ? skills : undefined,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Thành công', 'Đã thêm nhân công', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm nhân công. Vui lòng thử lại.');
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
              Mã nhân viên <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="VD: NV001"
              value={employeeId}
              onChangeText={setEmployeeId}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>
                Họ <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nguyễn"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>
                Tên <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Văn A"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Số điện thoại <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="0123456789"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.dateText}>
                {dateOfBirth ? dateOfBirth.toLocaleDateString('vi-VN') : 'Chọn ngày sinh'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) setDateOfBirth(date);
                }}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập địa chỉ đầy đủ..."
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Role */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Chuyên môn <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.rolesGrid}>
            {ROLE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.roleCard, role === option.value && styles.roleCardActive]}
                onPress={() => setRole(option.value)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={role === option.value ? '#0066CC' : '#666'}
                />
                <Text
                  style={[styles.roleLabel, role === option.value && styles.roleLabelActive]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ khẩn cấp</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Tên người liên hệ</Text>
            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              value={emergencyContactName}
              onChangeText={setEmergencyContactName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="0123456789"
              value={emergencyContactPhone}
              onChangeText={setEmergencyContactPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Employment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin tuyển dụng</Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              Ngày vào làm <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowHireDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.dateText}>{hireDate.toLocaleDateString('vi-VN')}</Text>
            </TouchableOpacity>

            {showHireDatePicker && (
              <DateTimePicker
                value={hireDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowHireDatePicker(Platform.OS === 'ios');
                  if (date) setHireDate(date);
                }}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>
                Lương theo giờ <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="numeric"
              />
              <Text style={styles.unitLabel}>VND/giờ</Text>
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Lương tăng ca</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={overtimeRate}
                onChangeText={setOvertimeRate}
                keyboardType="numeric"
              />
              <Text style={styles.unitLabel}>VND/giờ</Text>
            </View>
          </View>
        </View>

        {/* Bank Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin ngân hàng</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Tên ngân hàng</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Vietcombank"
              value={bankName}
              onChangeText={setBankName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Số tài khoản</Text>
            <TextInput
              style={styles.input}
              placeholder="0123456789"
              value={bankAccountNumber}
              onChangeText={setBankAccountNumber}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kỹ năng</Text>

          <View style={styles.skillsGrid}>
            {COMMON_SKILLS.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.skillChip,
                  skills.includes(skill) && styles.skillChipActive,
                ]}
                onPress={() => toggleSkill(skill)}
              >
                <Text
                  style={[
                    styles.skillChipText,
                    skills.includes(skill) && styles.skillChipTextActive,
                  ]}
                >
                  {skill}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customSkillRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Thêm kỹ năng khác..."
              value={customSkill}
              onChangeText={setCustomSkill}
            />
            <TouchableOpacity style={styles.addSkillButton} onPress={addCustomSkill}>
              <Ionicons name="add-circle-outline" size={24} color="#0066CC" />
            </TouchableOpacity>
          </View>

          {skills.filter((s) => !COMMON_SKILLS.includes(s)).length > 0 && (
            <View style={styles.customSkillsList}>
              {skills
                .filter((s) => !COMMON_SKILLS.includes(s))
                .map((skill, idx) => (
                  <View key={idx} style={styles.customSkillItem}>
                    <Text style={styles.customSkillText}>{skill}</Text>
                    <TouchableOpacity onPress={() => toggleSkill(skill)}>
                      <Ionicons name="close-circle" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          )}
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
            {loading ? 'Đang lưu...' : 'Lưu nhân công'}
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
  row: {
    flexDirection: 'row',
    gap: 10,
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
  unitLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleCard: {
    width: '30%',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardActive: {
    backgroundColor: '#E8F4FF',
    borderColor: '#0066CC',
  },
  roleLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  roleLabelActive: {
    color: '#0066CC',
    fontWeight: '600',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  skillChipActive: {
    backgroundColor: '#E8F4FF',
    borderColor: '#0066CC',
  },
  skillChipText: {
    fontSize: 13,
    color: '#666',
  },
  skillChipTextActive: {
    color: '#0066CC',
    fontWeight: '600',
  },
  customSkillRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  addSkillButton: {
    padding: 10,
  },
  customSkillsList: {
    marginTop: 12,
    gap: 8,
  },
  customSkillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  customSkillText: {
    fontSize: 13,
    color: '#333',
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
    backgroundColor: '#0066CC',
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
