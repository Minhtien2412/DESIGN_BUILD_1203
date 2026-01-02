/**
 * Media Upload Service
 * Handle image, video, audio, and file uploads for messages
 */

import { ENV } from '@/config/env';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

// Get upload URL from config
const getUploadUrl = () => {
  const baseUrl = ENV.API_BASE_URL.replace('/api/v1', '');
  return `${baseUrl}/api/v1/upload/single`;
};

export interface UploadedMedia {
  url: string;
  thumbnailUrl?: string;
  size: number;
  duration?: number;
  type: 'image' | 'video' | 'audio' | 'file';
}

/**
 * Upload image from camera or gallery
 */
export async function uploadImage(uri: string): Promise<UploadedMedia> {
  try {
    // Create form data
    const formData = new FormData();
    
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: filename,
      type,
    } as any);

    formData.append('type', 'image');

    // Upload to backend
    const response = await fetch(getUploadUrl(), {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();

    return {
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      size: data.size,
      type: 'image',
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

/**
 * Upload video from gallery
 */
export async function uploadVideo(uri: string): Promise<UploadedMedia> {
  try {
    const formData = new FormData();
    
    const filename = uri.split('/').pop() || 'video.mp4';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `video/${match[1]}` : 'video/mp4';

    formData.append('file', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: filename,
      type,
    } as any);

    formData.append('type', 'video');

    const response = await fetch(getUploadUrl(), {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();

    return {
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      size: data.size,
      duration: data.duration,
      type: 'video',
    };
  } catch (error) {
    console.error('Video upload error:', error);
    throw error;
  }
}

/**
 * Upload audio file
 */
export async function uploadAudio(uri: string): Promise<UploadedMedia> {
  try {
    const formData = new FormData();
    
    const filename = uri.split('/').pop() || 'audio.m4a';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `audio/${match[1]}` : 'audio/m4a';

    formData.append('file', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: filename,
      type,
    } as any);

    formData.append('type', 'audio');

    const response = await fetch(getUploadUrl(), {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();

    return {
      url: data.url,
      size: data.size,
      duration: data.duration,
      type: 'audio',
    };
  } catch (error) {
    console.error('Audio upload error:', error);
    throw error;
  }
}

/**
 * Upload generic file
 */
export async function uploadFile(uri: string, fileName: string): Promise<UploadedMedia> {
  try {
    const formData = new FormData();
    
    formData.append('file', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: fileName,
      type: 'application/octet-stream',
    } as any);

    formData.append('type', 'file');

    const response = await fetch(getUploadUrl(), {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();

    return {
      url: data.url,
      size: data.size,
      type: 'file',
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

/**
 * Pick and upload image
 */
export async function pickAndUploadImage(): Promise<UploadedMedia | null> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permission denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    return await uploadImage(result.assets[0].uri);
  } catch (error) {
    console.error('Pick and upload image error:', error);
    throw error;
  }
}

/**
 * Pick and upload video
 */
export async function pickAndUploadVideo(): Promise<UploadedMedia | null> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permission denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    return await uploadVideo(result.assets[0].uri);
  } catch (error) {
    console.error('Pick and upload video error:', error);
    throw error;
  }
}

/**
 * Take photo and upload
 */
export async function takePhotoAndUpload(): Promise<UploadedMedia | null> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Camera permission denied');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    return await uploadImage(result.assets[0].uri);
  } catch (error) {
    console.error('Take photo and upload error:', error);
    throw error;
  }
}

/**
 * Pick and upload document
 */
export async function pickAndUploadDocument(): Promise<UploadedMedia | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    return await uploadFile(asset.uri, asset.name);
  } catch (error) {
    console.error('Pick and upload document error:', error);
    throw error;
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration (seconds to mm:ss)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
