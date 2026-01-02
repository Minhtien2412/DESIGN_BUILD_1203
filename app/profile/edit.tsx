/**
 * Account Settings Screen (Enhanced)
 * 
 * Features:
 * - Profile editing (name, phone, avatar)
 * - Password change form
 * - Avatar upload from gallery/camera
 * - Form validation
 * - Integration with userApi.ts
 * 
 * API: updateUser(), changePassword()
 * Updated: Nov 24, 2025
 */

import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { changePassword, updateUser } from '@/services/userApi';
import { requestCameraPermission, requestMediaLibraryPermission } from '@/utils/device-permissions';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function EditProfileScreen() {
  const { user, editProfile } = useAuth();
  const primary = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(user?.avatar);
  const [profileDirty, setProfileDirty] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const pickImage = async () => {
    const perm = await requestMediaLibraryPermission();
    if (!perm.granted) {
      Alert.alert('Cần quyền', 'Hãy cấp quyền Thư viện để chọn ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      setProfileDirty(true);
    }
  };

  const takePhoto = async () => {
    const perm = await requestCameraPermission();
    if (!perm.granted) {
      Alert.alert('Cần quyền', 'Hãy cấp quyền Camera để chụp ảnh');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      setProfileDirty(true);
    }
  };

  const validateProfile = () => {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Lỗi', 'Họ tên tối thiểu 2 ký tự');
      return false;
    }
    if (phone && !/^\d{10,11}$/.test(phone.replace(/\s/g, ''))) {
      Alert.alert('Lỗi', 'Số điện thoại phải có 10-11 chữ số');
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (!oldPassword || oldPassword.length < 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại');
      return false;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới tối thiểu 6 ký tự');
      return false;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }
    if (newPassword === oldPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải khác mật khẩu cũ');
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!profileDirty || !user) return;
    if (!validateProfile()) return;
    
    setProfileLoading(true);
    try {
      console.log('📝 Updating user profile...');
      
      const updatedUser = await updateUser(Number(user.id), {
        name: name.trim(),
        phone: phone.trim() || undefined,
        avatar: avatarUri,
      });

      // Update auth context with new user data
      await editProfile({
        name: updatedUser.name,
        phone: updatedUser.phone || undefined,
        avatar: updatedUser.avatar || undefined,
      });
      
      setProfileDirty(false);
      Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân');
    } catch (e: any) {
      console.error('❌ Profile update error:', e);
      Alert.alert('Lỗi', e?.message || 'Không thể cập nhật thông tin');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (!validatePassword()) return;

    setPasswordLoading(true);
    try {
      console.log('🔒 Changing password...');
      
      await changePassword(Number(user.id), oldPassword, newPassword);
      
      // Clear password fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      
      Alert.alert(
        'Thành công', 
        'Đã đổi mật khẩu. Vui lòng đăng nhập lại.',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } catch (e: any) {
      console.error('❌ Password change error:', e);
      Alert.alert('Lỗi', e?.message || 'Không thể đổi mật khẩu. Kiểm tra mật khẩu cũ.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Cài đặt tài khoản', headerBackTitle: 'Quay lại' }} />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Thông tin cá nhân</Text>
          
          {/* Avatar */}
          <View style={styles.avatarRow}>
            <TouchableOpacity 
              style={[styles.avatarCircle, { borderColor: border }]} 
              onPress={pickImage} 
              disabled={profileLoading}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person-outline" size={32} color={textColor} />
              )}
            </TouchableOpacity>
            <View style={styles.avatarActions}>
              <TouchableOpacity 
                style={[styles.smallBtn, { backgroundColor: primary }]} 
                onPress={pickImage} 
                disabled={profileLoading}
              >
                <Ionicons name="images-outline" size={16} color="#fff" />
                <Text style={styles.smallBtnText}>Chọn ảnh</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.smallBtn, { backgroundColor: primary }]} 
                onPress={takePhoto} 
                disabled={profileLoading}
              >
                <Ionicons name="camera-outline" size={16} color="#fff" />
                <Text style={styles.smallBtnText}>Chụp ảnh</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Name Field */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: textColor }]}>Họ và tên *</Text>
            <TextInput
              style={[styles.input, { borderColor: border, color: textColor, backgroundColor: background }]}
              value={name}
              onChangeText={(t) => { setName(t); setProfileDirty(true); }}
              placeholder="Nhập họ tên đầy đủ"
              placeholderTextColor="#999"
              editable={!profileLoading}
            />
          </View>

          {/* Phone Field */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: textColor }]}>Số điện thoại</Text>
            <TextInput
              style={[styles.input, { borderColor: border, color: textColor, backgroundColor: background }]}
              value={phone}
              onChangeText={(t) => { setPhone(t); setProfileDirty(true); }}
              placeholder="0901234567"
              keyboardType="phone-pad"
              maxLength={11}
              placeholderTextColor="#999"
              editable={!profileLoading}
            />
          </View>

          {/* Email (Read-only) */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: textColor }]}>Email</Text>
            <View style={[styles.input, styles.readOnlyInput, { borderColor: border, backgroundColor: '#f5f5f5' }]}>
              <Text style={{ color: '#666' }}>{user?.email || 'N/A'}</Text>
            </View>
            <Text style={styles.hint}>Email không thể thay đổi</Text>
          </View>

          {/* Role (Read-only) */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: textColor }]}>Vai trò</Text>
            <View style={[styles.input, styles.readOnlyInput, { borderColor: border, backgroundColor: '#f5f5f5' }]}>
              <Text style={{ color: '#666' }}>
                {user?.role === 'ADMIN' ? 'Quản trị viên' : 
                 user?.role === 'ENGINEER' ? 'Kỹ sư' : 
                 user?.role === 'CLIENT' ? 'Khách hàng' : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Save Profile Button */}
          <TouchableOpacity
            style={[
              styles.saveBtn, 
              { backgroundColor: profileDirty ? primary : '#ccc' }
            ]}
            onPress={handleSaveProfile}
            disabled={!profileDirty || profileLoading}
          >
            {profileLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.saveText}>Lưu thay đổi</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Password Section */}
        <View style={[styles.section, { marginTop: 24 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Mật khẩu</Text>
            <TouchableOpacity onPress={() => setShowPasswordForm(!showPasswordForm)}>
              <Ionicons 
                name={showPasswordForm ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color={primary} 
              />
            </TouchableOpacity>
          </View>

          {showPasswordForm && (
            <View style={styles.passwordForm}>
              {/* Old Password */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: textColor }]}>Mật khẩu hiện tại *</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, { borderColor: border, color: textColor, backgroundColor: background }]}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    placeholder="Nhập mật khẩu hiện tại"
                    placeholderTextColor="#999"
                    secureTextEntry={!showOldPassword}
                    editable={!passwordLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowOldPassword(!showOldPassword)}
                  >
                    <Ionicons 
                      name={showOldPassword ? 'eye-outline' : 'eye-off-outline'} 
                      size={20} 
                      color="#999" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: textColor }]}>Mật khẩu mới *</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, { borderColor: border, color: textColor, backgroundColor: background }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Tối thiểu 6 ký tự"
                    placeholderTextColor="#999"
                    secureTextEntry={!showNewPassword}
                    editable={!passwordLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons 
                      name={showNewPassword ? 'eye-outline' : 'eye-off-outline'} 
                      size={20} 
                      color="#999" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: textColor }]}>Xác nhận mật khẩu *</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, { borderColor: border, color: textColor, backgroundColor: background }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor="#999"
                    secureTextEntry={!showConfirmPassword}
                    editable={!passwordLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                      size={20} 
                      color="#999" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Change Password Button */}
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: primary, marginTop: 8 }]}
                onPress={handleChangePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="lock-closed-outline" size={20} color="#fff" />
                    <Text style={styles.saveText}>Đổi mật khẩu</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={[styles.infoCard, { backgroundColor: '#f0f9ff', marginTop: 24 }]}>
          <Ionicons name="information-circle-outline" size={20} color="#0284c7" />
          <Text style={styles.infoText}>
            Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại.
          </Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: -4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  readOnlyInput: {
    justifyContent: 'center',
  },
  passwordForm: {
    gap: 16,
    marginTop: 12,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingRight: 48,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  saveBtn: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarActions: {
    gap: 8,
  },
  smallBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#0284c7',
    lineHeight: 20,
  },
});
