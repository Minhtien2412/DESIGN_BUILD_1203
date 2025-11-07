import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionHeader } from '@/components/ui/list-item';
import Modal from '@/components/ui/modal';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as React from 'react';
import {
    Alert as RNAlert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type FileItem = {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'image' | 'video' | 'other';
  size: string;
  date: string;
  icon: string;
  color: string;
};

const MOCK_FILES: FileItem[] = [
  {
    id: '1',
    name: 'Dự án nhà phố 2024',
    type: 'folder',
    size: '125 MB',
    date: '20/10/2024',
    icon: 'folder',
    color: '#3B82F6',
  },
  {
    id: '2',
    name: 'Bản vẽ thiết kế.pdf',
    type: 'document',
    size: '12.5 MB',
    date: '18/10/2024',
    icon: 'file-pdf-box',
    color: '#EF4444',
  },
  {
    id: '3',
    name: 'BOQ Tóm tắt.xlsx',
    type: 'document',
    size: '3.2 MB',
    date: '15/10/2024',
    icon: 'file-excel',
    color: '#10B981',
  },
  {
    id: '4',
    name: 'Hình ảnh công trình',
    type: 'folder',
    size: '85 MB',
    date: '12/10/2024',
    icon: 'folder',
    color: '#F59E0B',
  },
  {
    id: '5',
    name: 'Tiến độ thi công.docx',
    type: 'document',
    size: '1.8 MB',
    date: '10/10/2024',
    icon: 'file-word',
    color: '#3B82F6',
  },
  {
    id: '6',
    name: '3D Render - Phòng khách.jpg',
    type: 'image',
    size: '5.4 MB',
    date: '08/10/2024',
    icon: 'image',
    color: '#8B5CF6',
  },
];

export default function CloudStorageScreen() {
  const [files, setFiles] = React.useState<FileItem[]>(MOCK_FILES);
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [uploadFileName, setUploadFileName] = React.useState('');

  const handleFilePress = (file: FileItem) => {
    if (file.type === 'folder') {
      RNAlert.alert('Mở thư mục', `Mở thư mục: ${file.name}`);
    } else {
      RNAlert.alert('Mở file', `Mở file: ${file.name}`);
    }
  };

  const handleUpload = () => {
    if (!uploadFileName.trim()) {
      RNAlert.alert('Lỗi', 'Vui lòng nhập tên file');
      return;
    }
    
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: uploadFileName,
      type: 'document',
      size: '0 KB',
      date: new Date().toLocaleDateString('vi-VN'),
      icon: 'file-document',
      color: '#6B7280',
    };
    
    setFiles([newFile, ...files]);
    setUploadFileName('');
    setShowUploadModal(false);
    RNAlert.alert('Thành công', 'Tải file lên thành công');
  };

  const getFileIcon = (file: FileItem) => {
    return (
      <MaterialCommunityIcons
        name={file.icon as any}
        size={32}
        color={file.color}
      />
    );
  };

  const storageUsed = 235; // MB
  const storageTotal = 500; // MB
  const storagePercent = (storageUsed / storageTotal) * 100;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Lưu trữ đám mây',
          headerBackTitle: 'Quay lại',
        }}
      />
      
      <ScrollView style={styles.container}>
        {/* Storage Usage Card */}
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <View style={styles.cloudIconContainer}>
              <Ionicons name="cloud-outline" size={32} color="#3B82F6" />
            </View>
            <View style={styles.storageInfo}>
              <Text style={styles.storageTitle}>Dung lượng đã dùng</Text>
              <Text style={styles.storageText}>
                {storageUsed} MB / {storageTotal} MB
              </Text>
            </View>
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${storagePercent}%` }]} />
          </View>
          
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeText}>Nâng cấp dung lượng</Text>
            <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => setShowUploadModal(true)}
        >
          <Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" />
          <Text style={styles.uploadBtnText}>Tải file lên</Text>
        </TouchableOpacity>

        {/* Files List */}
        <SectionHeader title={`Tất cả file (${files.length})`} />
        
        <View style={styles.filesList}>
          {files.map((file) => (
            <TouchableOpacity
              key={file.id}
              style={styles.fileItem}
              onPress={() => handleFilePress(file)}
            >
              <View style={styles.fileIcon}>{getFileIcon(file)}</View>
              
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.fileDetails}>
                  {file.size} • {file.date}
                </Text>
              </View>
              
              <TouchableOpacity style={styles.fileMoreBtn}>
                <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Tải file lên"
      >
        <View style={styles.modalContent}>
          <Input
            label="Tên file"
            value={uploadFileName}
            onChangeText={setUploadFileName}
            placeholder="Nhập tên file..."
          />
          
          <View style={styles.modalButtons}>
            <Button
              title="Hủy"
              onPress={() => setShowUploadModal(false)}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <Button
              title="Tải lên"
              onPress={handleUpload}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  storageCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cloudIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  storageInfo: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  storageText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 4,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  filesList: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 13,
    color: '#6B7280',
  },
  fileMoreBtn: {
    padding: 8,
  },
  modalContent: {
    gap: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
