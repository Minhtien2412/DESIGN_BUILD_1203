import { useFolders } from '@/hooks/useDocument';
import { AccessLevel } from '@/types/document';
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

const ACCESS_LEVEL_OPTIONS: {
  value: AccessLevel;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}[] = [
  {
    value: AccessLevel.PRIVATE,
    label: 'Riêng tư',
    icon: 'lock-closed',
    description: 'Chỉ bạn có thể truy cập',
  },
  {
    value: AccessLevel.TEAM,
    label: 'Nhóm',
    icon: 'people',
    description: 'Thành viên nhóm có thể truy cập',
  },
  {
    value: AccessLevel.PROJECT,
    label: 'Dự án',
    icon: 'business',
    description: 'Tất cả thành viên dự án',
  },
  {
    value: AccessLevel.PUBLIC,
    label: 'Công khai',
    icon: 'globe',
    description: 'Bất kỳ ai có link đều truy cập được',
  },
];

export default function CreateFolderScreen() {
  const { projectId, parentFolderId } = useLocalSearchParams<{
    projectId: string;
    parentFolderId?: string;
  }>();

  const { folders, createFolder } = useFolders(projectId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(AccessLevel.PROJECT);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(
    parentFolderId || null
  );
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên thư mục');
      return;
    }

    try {
      setLoading(true);

      await createFolder({
        projectId,
        name: name.trim(),
        description: description.trim() || undefined,
        parentFolderId: selectedParentId || undefined,
        accessLevel,
      });

      Alert.alert('Thành công', 'Đã tạo thư mục', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo thư mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Tên thư mục <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên thư mục..."
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả về thư mục..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Parent Folder */}
        {folders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thư mục cha</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.folderScroll}
            >
              <TouchableOpacity
                style={[
                  styles.folderChip,
                  !selectedParentId && styles.folderChipActive,
                ]}
                onPress={() => setSelectedParentId(null)}
              >
                <Ionicons
                  name="home"
                  size={16}
                  color={!selectedParentId ? '#0066CC' : '#666'}
                />
                <Text
                  style={[
                    styles.folderChipText,
                    !selectedParentId && styles.folderChipTextActive,
                  ]}
                >
                  Gốc
                </Text>
              </TouchableOpacity>

              {folders.map((folder) => (
                <TouchableOpacity
                  key={folder.id}
                  style={[
                    styles.folderChip,
                    selectedParentId === folder.id && styles.folderChipActive,
                  ]}
                  onPress={() => setSelectedParentId(folder.id)}
                >
                  <Ionicons
                    name="folder"
                    size={16}
                    color={selectedParentId === folder.id ? '#0066CC' : '#666'}
                  />
                  <Text
                    style={[
                      styles.folderChipText,
                      selectedParentId === folder.id && styles.folderChipTextActive,
                    ]}
                  >
                    {folder.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Access Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Quyền truy cập <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.accessLevelList}>
            {ACCESS_LEVEL_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.accessLevelCard,
                  accessLevel === option.value && styles.accessLevelCardActive,
                ]}
                onPress={() => setAccessLevel(option.value)}
              >
                <View style={styles.accessLevelLeft}>
                  <Ionicons
                    name={option.icon}
                    size={22}
                    color={accessLevel === option.value ? '#0066CC' : '#666'}
                  />
                  <View style={styles.accessLevelInfo}>
                    <Text
                      style={[
                        styles.accessLevelLabel,
                        accessLevel === option.value && styles.accessLevelLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.accessLevelDescription}>
                      {option.description}
                    </Text>
                  </View>
                </View>
                {accessLevel === option.value && (
                  <Ionicons name="checkmark-circle" size={22} color="#0066CC" />
                )}
              </TouchableOpacity>
            ))}
          </View>
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
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Đang tạo...' : 'Tạo thư mục'}
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  required: {
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
  },
  folderScroll: {
    flexGrow: 0,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  folderChipActive: {
    backgroundColor: '#E8F4FF',
    borderColor: '#0066CC',
  },
  folderChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  folderChipTextActive: {
    color: '#0066CC',
    fontWeight: '600',
  },
  accessLevelList: {
    gap: 10,
  },
  accessLevelCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  accessLevelCardActive: {
    borderColor: '#0066CC',
    backgroundColor: '#E8F4FF',
  },
  accessLevelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  accessLevelInfo: {
    flex: 1,
    gap: 4,
  },
  accessLevelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  accessLevelLabelActive: {
    color: '#0066CC',
  },
  accessLevelDescription: {
    fontSize: 12,
    color: '#666',
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
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#0066CC',
    borderRadius: 6,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
