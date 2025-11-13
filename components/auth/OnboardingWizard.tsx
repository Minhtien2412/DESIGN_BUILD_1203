import { useThemeColor } from '@/hooks/use-theme-color';
import { apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface OnboardingData {
  // Step 1: Basic Info
  fullName: string;
  phone: string;
  
  // Step 2: Location & Role
  address: string;
  city: string;
  country: string;
  userRole: 'client' | 'contractor' | 'admin';
  
  // Step 3: Profile Details
  bio: string;
  avatar: string | null;
  
  // Step 4: Preferences (for contractors)
  skills: string[];
  experience: string;
  hourlyRate?: number;
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
  initialData?: Partial<OnboardingData>;
}

const ROLES = [
  { key: 'client', label: 'Khách hàng', description: 'Tôi cần thuê dịch vụ thiết kế/xây dựng', icon: 'person-outline' },
  { key: 'contractor', label: 'Nhà thầu', description: 'Tôi cung cấp dịch vụ thiết kế/xây dựng', icon: 'construct-outline' },
] as const;

const SKILL_OPTIONS = [
  'Thiết kế kiến trúc', 'Thiết kế nội thất', 'Xây dựng nhà ở',
  'Xây dựng thương mại', 'Điện nước', 'Cảnh quan',
  'Thi công hoàn thiện', 'Giám sát công trình', 'Tư vấn kỹ thuật'
];

export function OnboardingWizard({ onComplete, onSkip, initialData }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    country: 'Vietnam',
    userRole: 'client',
    bio: '',
    avatar: null,
    skills: [],
    experience: '',
    ...initialData,
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');

  const totalSteps = data.userRole === 'contractor' ? 4 : 3;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return data.fullName.trim().length >= 2 && data.phone.trim().length >= 10;
      case 2:
        return data.address.trim().length >= 5 && data.city.trim().length >= 2;
      case 3:
        return data.bio.trim().length >= 10;
      case 4:
        return data.skills.length > 0 && data.experience.trim().length > 0;
      default:
        return true;
    }
  };

  const handleComplete = async () => {
    try {
      // Save profile data to backend
      await apiFetch('/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      onComplete(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể hoàn thành thiết lập. Vui lòng thử lại.');
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Cần cấp quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh để chọn ảnh đại diện.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateData({ avatar: result.assets[0].uri });
    }
  };

  const toggleSkill = (skill: string) => {
    const skills = data.skills.includes(skill)
      ? data.skills.filter(s => s !== skill)
      : [...data.skills, skill];
    updateData({ skills });
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { 
              width: `${(currentStep / totalSteps) * 100}%`,
              backgroundColor: primaryColor
            }
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: textColor }]}>
        Bước {currentStep} / {totalSteps}
      </Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: textColor }]}>Thông tin cơ bản</Text>
      <Text style={[styles.stepSubtitle, { color: textColor }]}>
        Cho chúng tôi biết về bạn
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#666" />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Họ và tên *"
          value={data.fullName}
          onChangeText={(text) => updateData({ fullName: text })}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color="#666" />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Số điện thoại *"
          value={data.phone}
          onChangeText={(text) => updateData({ phone: text })}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: textColor }]}>Vai trò và địa chỉ</Text>
      <Text style={[styles.stepSubtitle, { color: textColor }]}>
        Bạn là ai và đang ở đâu?
      </Text>

      <Text style={[styles.sectionTitle, { color: textColor }]}>Vai trò của bạn:</Text>
      {ROLES.map((role) => (
        <TouchableOpacity
          key={role.key}
          style={[
            styles.roleOption,
            data.userRole === role.key && { borderColor: primaryColor, backgroundColor: `${primaryColor}15` }
          ]}
          onPress={() => updateData({ userRole: role.key })}
        >
          <Ionicons name={role.icon as any} size={24} color={data.userRole === role.key ? primaryColor : '#666'} />
          <View style={styles.roleText}>
            <Text style={[styles.roleLabel, { color: data.userRole === role.key ? primaryColor : textColor }]}>
              {role.label}
            </Text>
            <Text style={[styles.roleDescription, { color: textColor }]}>
              {role.description}
            </Text>
          </View>
          <Ionicons 
            name={data.userRole === role.key ? 'radio-button-on' : 'radio-button-off'} 
            size={20} 
            color={data.userRole === role.key ? primaryColor : '#666'} 
          />
        </TouchableOpacity>
      ))}

      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={20} color="#666" />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Địa chỉ *"
          value={data.address}
          onChangeText={(text) => updateData({ address: text })}
          multiline
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Ionicons name="business-outline" size={20} color="#666" />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Thành phố *"
            value={data.city}
            onChangeText={(text) => updateData({ city: text })}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Ionicons name="flag-outline" size={20} color="#666" />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Quốc gia"
            value={data.country}
            onChangeText={(text) => updateData({ country: text })}
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: textColor }]}>Hồ sơ cá nhân</Text>
      <Text style={[styles.stepSubtitle, { color: textColor }]}>
        Tạo ấn tượng tốt với hồ sơ của bạn
      </Text>

      <View style={styles.avatarSection}>
        <TouchableOpacity style={styles.avatarButton} onPress={pickImage}>
          {data.avatar ? (
            <Image source={{ uri: data.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { borderColor: primaryColor }]}>
              <Ionicons name="camera-outline" size={32} color={primaryColor} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={[styles.avatarText, { color: textColor }]}>
          Thêm ảnh đại diện
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="document-text-outline" size={20} color="#666" />
        <TextInput
          style={[styles.input, styles.textArea, { color: textColor }]}
          placeholder="Giới thiệu về bản thân (tối thiểu 10 ký tự) *"
          value={data.bio}
          onChangeText={(text) => updateData({ bio: text })}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: textColor }]}>Kỹ năng chuyên môn</Text>
      <Text style={[styles.stepSubtitle, { color: textColor }]}>
        Cho khách hàng biết bạn giỏi về gì
      </Text>

      <Text style={[styles.sectionTitle, { color: textColor }]}>Chọn kỹ năng:</Text>
      <View style={styles.skillsContainer}>
        {SKILL_OPTIONS.map((skill) => (
          <TouchableOpacity
            key={skill}
            style={[
              styles.skillChip,
              data.skills.includes(skill) && { backgroundColor: primaryColor }
            ]}
            onPress={() => toggleSkill(skill)}
          >
            <Text style={[
              styles.skillText,
              data.skills.includes(skill) && { color: 'white' }
            ]}>
              {skill}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="time-outline" size={20} color="#666" />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Kinh nghiệm (VD: 5 năm trong lĩnh vực thiết kế) *"
          value={data.experience}
          onChangeText={(text) => updateData({ experience: text })}
          multiline
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="cash-outline" size={20} color="#666" />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Giá dịch vụ theo giờ (VND)"
          value={data.hourlyRate?.toString() || ''}
          onChangeText={(text) => updateData({ hourlyRate: parseInt(text) || undefined })}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderProgressBar()}

      <ScrollView ref={scrollViewRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={prevStep}>
            <Text style={[styles.buttonText, { color: primaryColor }]}>Quay lại</Text>
          </TouchableOpacity>
        )}
        
        {onSkip && currentStep === 1 && (
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onSkip}>
            <Text style={[styles.buttonText, { color: textColor }]}>Bỏ qua</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            { backgroundColor: primaryColor },
            !validateStep() && styles.disabledButton
          ]}
          onPress={nextStep}
          disabled={!validateStep()}
        >
          <Text style={styles.primaryButtonText}>
            {currentStep === totalSteps ? 'Hoàn thành' : 'Tiếp theo'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  roleText: {
    flex: 1,
    marginLeft: 12,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarButton: {
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  avatarText: {
    fontSize: 14,
    opacity: 0.7,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 14,
    color: '#374151',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});