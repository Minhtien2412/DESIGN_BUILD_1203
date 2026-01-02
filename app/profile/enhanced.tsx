/**
 * Enhanced Profile Screen
 * Complete profile management with modern UI
 */

import { ThemedView } from '@/components/themed-view';
import ENV from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import * as React from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  address: string;
  city: string;
  country: string;
  company?: string;
  position?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export default function EnhancedProfileScreen() {
  const { user, refreshUser } = useAuth();
  
  const [profileData, setProfileData] = React.useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
    address: '',
    city: '',
    country: 'Vietnam',
    company: '',
    position: '',
    website: '',
    socialLinks: {
      facebook: '',
      linkedin: '',
      twitter: '',
    },
  });

  const [avatarUri, setAvatarUri] = React.useState<string>(
    user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=200&background=0891B2&color=fff`
  );
  
  const [coverUri, setCoverUri] = React.useState<string>(
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=300&fit=crop'
  );

  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'info' | 'work' | 'social'>('info');
  
  // Settings
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [publicProfile, setPublicProfile] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const pickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        setIsEditing(true);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const pickCover = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCoverUri(result.assets[0].uri);
        setIsEditing(true);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      
      // Add profile data
      Object.entries(profileData).forEach(([key, value]) => {
        if (value && key !== 'socialLinks') {
          formData.append(key, value.toString());
        }
      });

      // Add social links
      if (profileData.socialLinks) {
        formData.append('socialLinks', JSON.stringify(profileData.socialLinks));
      }

      // Add avatar if changed
      if (avatarUri && avatarUri.startsWith('file://')) {
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('avatar', {
          uri: avatarUri,
          name: filename,
          type,
        } as any);
      }

      // Add cover if changed
      if (coverUri && coverUri.startsWith('file://')) {
        const filename = coverUri.split('/').pop() || 'cover.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('cover', {
          uri: coverUri,
          name: filename,
          type,
        } as any);
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/profile/update`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await refreshUser();
      setIsEditing(false);
      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Cover Photo */}
      <TouchableOpacity onPress={pickCover} activeOpacity={0.9}>
        <Image source={{ uri: coverUri }} style={styles.coverImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.coverGradient}
        />
        <View style={styles.coverEditButton}>
          <Ionicons name="camera" size={20} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickAvatar} activeOpacity={0.9}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <View style={styles.avatarEditBadge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{profileData.name || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{profileData.email}</Text>
          {profileData.position && (
            <Text style={styles.userPosition}>{profileData.position}</Text>
          )}
        </View>

        {/* Edit/Save Button */}
        <TouchableOpacity
          style={[styles.actionButton, isEditing && styles.saveButton]}
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons 
                name={isEditing ? "checkmark" : "create-outline"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.actionButtonText}>
                {isEditing ? 'Lưu' : 'Chỉnh sửa'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>247</Text>
          <Text style={styles.statLabel}>Dự án</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>1.2K</Text>
          <Text style={styles.statLabel}>Theo dõi</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>892</Text>
          <Text style={styles.statLabel}>Đang theo dõi</Text>
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'info' && styles.activeTab]}
        onPress={() => setActiveTab('info')}
      >
        <Ionicons 
          name="information-circle-outline" 
          size={20} 
          color={activeTab === 'info' ? '#0891B2' : '#6B7280'} 
        />
        <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
          Thông tin
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'work' && styles.activeTab]}
        onPress={() => setActiveTab('work')}
      >
        <Ionicons 
          name="briefcase-outline" 
          size={20} 
          color={activeTab === 'work' ? '#0891B2' : '#6B7280'} 
        />
        <Text style={[styles.tabText, activeTab === 'work' && styles.activeTabText]}>
          Công việc
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'social' && styles.activeTab]}
        onPress={() => setActiveTab('social')}
      >
        <Ionicons 
          name="share-social-outline" 
          size={20} 
          color={activeTab === 'social' ? '#0891B2' : '#6B7280'} 
        />
        <Text style={[styles.tabText, activeTab === 'social' && styles.activeTabText]}>
          Mạng xã hội
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderInfoTab = () => (
    <View style={styles.tabContent}>
      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Giới thiệu</Text>
        <TextInput
          style={[styles.textArea, !isEditing && styles.disabledInput]}
          value={profileData.bio}
          onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
          placeholder="Viết vài dòng giới thiệu về bạn..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          editable={isEditing}
        />
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
        
        <View style={styles.fieldRow}>
          <Ionicons name="call-outline" size={20} color="#0891B2" />
          <TextInput
            style={[styles.fieldInput, !isEditing && styles.disabledInput]}
            value={profileData.phone}
            onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
            placeholder="Số điện thoại"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            editable={isEditing}
          />
        </View>

        <View style={styles.fieldRow}>
          <Ionicons name="mail-outline" size={20} color="#0891B2" />
          <TextInput
            style={[styles.fieldInput, styles.disabledInput]}
            value={profileData.email}
            editable={false}
          />
        </View>
      </View>

      {/* Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Địa chỉ</Text>
        
        <TextInput
          style={[styles.input, !isEditing && styles.disabledInput]}
          value={profileData.address}
          onChangeText={(text) => setProfileData({ ...profileData, address: text })}
          placeholder="Địa chỉ"
          placeholderTextColor="#9CA3AF"
          editable={isEditing}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.halfInput, !isEditing && styles.disabledInput]}
            value={profileData.city}
            onChangeText={(text) => setProfileData({ ...profileData, city: text })}
            placeholder="Thành phố"
            placeholderTextColor="#9CA3AF"
            editable={isEditing}
          />
          <View style={{ width: 12 }} />
          <TextInput
            style={[styles.halfInput, !isEditing && styles.disabledInput]}
            value={profileData.country}
            onChangeText={(text) => setProfileData({ ...profileData, country: text })}
            placeholder="Quốc gia"
            placeholderTextColor="#9CA3AF"
            editable={isEditing}
          />
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={24} color="#0891B2" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Thông báo</Text>
              <Text style={styles.settingDescription}>Nhận thông báo về hoạt động</Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#D1D5DB', true: '#0891B2' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="eye-outline" size={24} color="#0891B2" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Hồ sơ công khai</Text>
              <Text style={styles.settingDescription}>Cho phép mọi người xem hồ sơ</Text>
            </View>
          </View>
          <Switch
            value={publicProfile}
            onValueChange={setPublicProfile}
            trackColor={{ false: '#D1D5DB', true: '#0891B2' }}
            thumbColor="#fff"
          />
        </View>
      </View>
    </View>
  );

  const renderWorkTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin công việc</Text>
        
        <View style={styles.fieldRow}>
          <Ionicons name="business-outline" size={20} color="#0891B2" />
          <TextInput
            style={[styles.fieldInput, !isEditing && styles.disabledInput]}
            value={profileData.company}
            onChangeText={(text) => setProfileData({ ...profileData, company: text })}
            placeholder="Công ty"
            placeholderTextColor="#9CA3AF"
            editable={isEditing}
          />
        </View>

        <View style={styles.fieldRow}>
          <Ionicons name="briefcase-outline" size={20} color="#0891B2" />
          <TextInput
            style={[styles.fieldInput, !isEditing && styles.disabledInput]}
            value={profileData.position}
            onChangeText={(text) => setProfileData({ ...profileData, position: text })}
            placeholder="Chức vụ"
            placeholderTextColor="#9CA3AF"
            editable={isEditing}
          />
        </View>

        <View style={styles.fieldRow}>
          <Ionicons name="globe-outline" size={20} color="#0891B2" />
          <TextInput
            style={[styles.fieldInput, !isEditing && styles.disabledInput]}
            value={profileData.website}
            onChangeText={(text) => setProfileData({ ...profileData, website: text })}
            placeholder="Website"
            placeholderTextColor="#9CA3AF"
            keyboardType="url"
            editable={isEditing}
          />
        </View>
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kỹ năng</Text>
        <View style={styles.skillsContainer}>
          {['React Native', 'TypeScript', 'UI/UX Design', 'Project Management', 'Figma', 'Node.js'].map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
              {isEditing && (
                <TouchableOpacity onPress={() => {}}>
                  <Ionicons name="close-circle" size={16} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {isEditing && (
            <TouchableOpacity style={styles.addSkillChip}>
              <Ionicons name="add-circle-outline" size={20} color="#0891B2" />
              <Text style={styles.addSkillText}>Thêm kỹ năng</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Experience */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kinh nghiệm</Text>
          {isEditing && (
            <TouchableOpacity>
              <Ionicons name="add-circle-outline" size={24} color="#0891B2" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.experienceItem}>
          <View style={styles.experienceDot} />
          <View style={styles.experienceContent}>
            <Text style={styles.experienceTitle}>Senior Developer</Text>
            <Text style={styles.experienceCompany}>Tech Corp</Text>
            <Text style={styles.experienceDuration}>2020 - Hiện tại · 3 năm</Text>
            <Text style={styles.experienceDescription}>
              Phát triển và duy trì các ứng dụng mobile sử dụng React Native...
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSocialTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Liên kết mạng xã hội</Text>
        
        <View style={styles.socialRow}>
          <View style={styles.socialIcon}>
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </View>
          <TextInput
            style={[styles.socialInput, !isEditing && styles.disabledInput]}
            value={profileData.socialLinks?.facebook}
            onChangeText={(text) => setProfileData({ 
              ...profileData, 
              socialLinks: { ...profileData.socialLinks, facebook: text }
            })}
            placeholder="facebook.com/username"
            placeholderTextColor="#9CA3AF"
            editable={isEditing}
          />
        </View>

        <View style={styles.socialRow}>
          <View style={styles.socialIcon}>
            <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
          </View>
          <TextInput
            style={[styles.socialInput, !isEditing && styles.disabledInput]}
            value={profileData.socialLinks?.linkedin}
            onChangeText={(text) => setProfileData({ 
              ...profileData, 
              socialLinks: { ...profileData.socialLinks, linkedin: text }
            })}
            placeholder="linkedin.com/in/username"
            placeholderTextColor="#9CA3AF"
            editable={isEditing}
          />
        </View>

        <View style={styles.socialRow}>
          <View style={styles.socialIcon}>
            <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
          </View>
          <TextInput
            style={[styles.socialInput, !isEditing && styles.disabledInput]}
            value={profileData.socialLinks?.twitter}
            onChangeText={(text) => setProfileData({ 
              ...profileData, 
              socialLinks: { ...profileData.socialLinks, twitter: text }
            })}
            placeholder="twitter.com/username"
            placeholderTextColor="#9CA3AF"
            editable={isEditing}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hành động nhanh</Text>
        
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/profile/security' as Href)}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#0891B2" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Bảo mật tài khoản</Text>
            <Text style={styles.actionDescription}>Mật khẩu, xác thực 2 bước</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/profile/privacy' as Href)}>
          <Ionicons name="eye-off-outline" size={24} color="#0891B2" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Quyền riêng tư</Text>
            <Text style={styles.actionDescription}>Quản lý thông tin riêng tư</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow}>
          <Ionicons name="download-outline" size={24} color="#0891B2" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Tải dữ liệu của bạn</Text>
            <Text style={styles.actionDescription}>Xuất thông tin tài khoản</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionRow, styles.dangerAction]}>
          <Ionicons name="trash-outline" size={24} color="#EF4444" />
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, styles.dangerText]}>Xóa tài khoản</Text>
            <Text style={styles.actionDescription}>Xóa vĩnh viễn tài khoản của bạn</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {renderHeader()}
        {renderTabs()}
        
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'work' && renderWorkTab()}
        {activeTab === 'social' && renderSocialTab()}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  coverImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  coverEditButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    marginTop: -40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#E5E7EB',
  },
  avatarEditBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#0891B2',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfo: {
    marginTop: 12,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userPosition: {
    fontSize: 14,
    color: '#0891B2',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0891B2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0891B2',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#0891B2',
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
  },
  halfInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  disabledInput: {
    opacity: 0.6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0891B2',
  },
  addSkillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    gap: 4,
  },
  addSkillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0891B2',
  },
  experienceItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  experienceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0891B2',
    marginTop: 4,
  },
  experienceContent: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  experienceCompany: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  experienceDuration: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  experienceDescription: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  dangerAction: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#EF4444',
  },
});
