/**
 * ImageUploadButton Component
 * Reusable component for uploading images with preview and progress
 */

import { useFileUpload, type UploadOptions, type UploadedFile } from '@/hooks/useFileUpload';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface ImageUploadButtonProps {
  /**
   * Current image URL (if any)
   */
  imageUrl?: string;

  /**
   * Category for upload (default: 'general')
   */
  category?: 'general' | 'projects' | 'profiles' | 'documents';

  /**
   * Description for the uploaded file
   */
  description?: string;

  /**
   * Tags for the uploaded file
   */
  tags?: string[];

  /**
   * Callback when upload succeeds
   */
  onUploadSuccess?: (file: UploadedFile) => void;

  /**
   * Callback when upload fails
   */
  onUploadError?: (error: string) => void;

  /**
   * Size of the image preview (default: 120)
   */
  size?: number;

  /**
   * Border radius (default: 60 for circular)
   */
  borderRadius?: number;

  /**
   * Show camera option
   */
  showCamera?: boolean;

  /**
   * Placeholder icon
   */
  placeholderIcon?: string;

  /**
   * Button style
   */
  style?: any;
}

export function ImageUploadButton({
  imageUrl,
  category = 'general',
  description,
  tags,
  onUploadSuccess,
  onUploadError,
  size = 120,
  borderRadius,
  showCamera = true,
  placeholderIcon = 'person',
  style,
}: ImageUploadButtonProps) {
  const {
    uploading,
    progress,
    error,
    pickImage,
    takePhoto,
    uploadFile,
    clearError,
  } = useFileUpload();

  const [localImageUri, setLocalImageUri] = useState<string | undefined>(imageUrl);

  const actualBorderRadius = borderRadius ?? size / 2; // Default to circular

  /**
   * Show upload options
   */
  const handlePress = () => {
    const buttons: any[] = [
      {
        text: 'Chọn từ thư viện',
        onPress: handlePickImage,
      },
    ];

    if (showCamera) {
      buttons.unshift({
        text: 'Chụp ảnh',
        onPress: handleTakePhoto,
      });
    }

    buttons.push({
      text: 'Hủy',
      style: 'cancel',
    });

    Alert.alert('Chọn ảnh', 'Chọn nguồn ảnh của bạn', buttons);
  };

  /**
   * Pick image from gallery
   */
  const handlePickImage = async () => {
    clearError();
    const uri = await pickImage();
    if (uri) {
      setLocalImageUri(uri);
      await handleUpload(uri);
    }
  };

  /**
   * Take photo with camera
   */
  const handleTakePhoto = async () => {
    clearError();
    const uri = await takePhoto();
    if (uri) {
      setLocalImageUri(uri);
      await handleUpload(uri);
    }
  };

  /**
   * Upload the selected image
   */
  const handleUpload = async (uri: string) => {
    const options: UploadOptions = {
      category,
      description,
      tags,
    };

    const result = await uploadFile(uri, options);

    if (result) {
      onUploadSuccess?.(result);
    } else if (error) {
      onUploadError?.(error);
      setLocalImageUri(imageUrl); // Revert on error
    }
  };

  /**
   * Render upload progress
   */
  const renderProgress = () => {
    if (!uploading) return null;

    return (
      <View style={styles.progressOverlay}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>
    );
  };

  /**
   * Render error message
   */
  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  };

  const displayImageUri = localImageUri || imageUrl;

  return (
    <View style={[styles.container, style]}>
      <Pressable
        onPress={handlePress}
        disabled={uploading}
        style={[
          styles.imageButton,
          {
            width: size,
            height: size,
            borderRadius: actualBorderRadius,
          },
          uploading && styles.imageButtonDisabled,
        ]}
      >
        {displayImageUri ? (
          <Image
            source={{ uri: displayImageUri }}
            style={[
              styles.image,
              {
                width: size,
                height: size,
                borderRadius: actualBorderRadius,
              },
            ]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              {
                width: size,
                height: size,
                borderRadius: actualBorderRadius,
              },
            ]}
          >
            <Ionicons name={placeholderIcon as any} size={size * 0.4} color="#666666" />
          </View>
        )}

        {/* Upload button overlay */}
        <View style={styles.uploadOverlay}>
          <View style={styles.uploadButton}>
            <Ionicons name="camera" size={20} color="#FFFFFF" />
          </View>
        </View>

        {/* Progress overlay */}
        {renderProgress()}
      </Pressable>

      {/* Error message */}
      {renderError()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageButton: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#333333',
  },
  imageButtonDisabled: {
    opacity: 0.6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  uploadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0A6847',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderWidth: 2,
    borderColor: '#000000',
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  errorContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
});
