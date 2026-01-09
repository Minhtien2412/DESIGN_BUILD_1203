/**
 * File Upload Screen - Quản lý File
 * Upload avatar, documents, ảnh công trường với GPS
 */

import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FileUploadScreen() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUploadAvatar = async () => {
    setUploading(true);
    try {
      // Demo implementation
      Alert.alert(
        'Upload Avatar',
        'Chức năng upload avatar sẽ được kích hoạt khi backend endpoint sẵn sàng.\n\n' +
        'Endpoint cần: POST /api/v1/profile/avatar',
        [{ text: 'OK' }]
      );
    } finally {
      setUploading(false);
    }
  };

  const handleUploadDocument = async () => {
    setUploading(true);
    try {
      Alert.alert(
        'Upload Document',
        'Chức năng upload tài liệu (PDF, DOC, Excel) sẽ được kích hoạt.\n\n' +
        'Endpoint cần: POST /api/v1/documents/upload',
        [{ text: 'OK' }]
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCapturePhoto = async () => {
    setUploading(true);
    try {
      Alert.alert(
        'Chụp ảnh công trường',
        'Chức năng chụp ảnh với GPS metadata.\n\n' +
        'Endpoint cần: POST /api/v1/projects/photos/upload',
        [{ text: 'OK' }]
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#3b82f6', '#0066CC']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Ionicons name="cloud-upload-outline" size={60} color="#fff" />
          <Text style={styles.headerTitle}>Quản lý File</Text>
          <Text style={styles.headerSubtitle}>Upload avatar, documents, ảnh công trường</Text>
        </LinearGradient>

        <Section title="Upload Options">
          <TouchableOpacity
            style={[styles.uploadCard, { backgroundColor: '#3b82f6' }]}
            onPress={handleUploadAvatar}
            disabled={uploading}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="person-circle-outline" size={32} color="#3b82f6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Upload Avatar</Text>
              <Text style={styles.cardDescription}>
                Tải lên ảnh đại diện (5MB max, JPG/PNG/WEBP)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadCard, { backgroundColor: '#0066CC' }]}
            onPress={handleUploadDocument}
            disabled={uploading}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="document-text-outline" size={32} color="#0066CC" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Upload Document</Text>
              <Text style={styles.cardDescription}>
                Tải lên tài liệu (PDF, DOC, Excel)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadCard, { backgroundColor: '#0066CC' }]}
            onPress={handleCapturePhoto}
            disabled={uploading}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="camera-outline" size={32} color="#0066CC" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Chụp ảnh công trường</Text>
              <Text style={styles.cardDescription}>
                Chụp ảnh với GPS metadata tự động
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </Section>

        <Section title="Tính năng">
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
            <Text style={styles.featureText}>Auto-resize ảnh avatar (512x512)</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
            <Text style={styles.featureText}>Tạo thumbnail tự động (120x120)</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
            <Text style={styles.featureText}>Lưu trữ trên AWS S3</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
            <Text style={styles.featureText}>Lưu GPS location cho ảnh công trường</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
            <Text style={styles.featureText}>Upload progress tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
            <Text style={styles.featureText}>Batch upload multiple files</Text>
          </View>
        </Section>

        <Section title="Backend Status">
          <View style={styles.statusCard}>
            <Ionicons name="construct-outline" size={32} color="#0066CC" />
            <Text style={styles.statusTitle}>Backend đang được phát triển</Text>
            <Text style={styles.statusDescription}>
              Cần implement các endpoints sau:{'\n\n'}
              • POST /api/v1/profile/avatar{'\n'}
              • DELETE /api/v1/profile/avatar{'\n'}
              • POST /api/v1/documents/upload{'\n'}
              • POST /api/v1/projects/photos/upload{'\n'}
              • POST /api/v1/files/upload{'\n'}
              • DELETE /api/v1/files/:id
            </Text>
          </View>
        </Section>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  statusCard: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginTop: 12,
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 13,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
});
