/**
 * useImageViewer Hook - Simplified image viewing hook
 * Provides easy access to full media viewer functionality
 * @author AI Assistant
 * @date 13/01/2026
 */

import { useFullMediaViewer, type FullMediaViewerOptions, type MediaFile } from '@/components/ui/full-media-viewer';
import { useCallback } from 'react';

export interface ImageViewerOptions extends Omit<FullMediaViewerOptions, 'onDelete' | 'onEdit'> {
  onDelete?: (id: string) => void;
  onEdit?: (id: string, newUri: string) => void;
}

/**
 * Hook để mở ảnh/video trong full-screen viewer
 * 
 * @example
 * ```tsx
 * const { openImage, openGallery } = useImageViewer();
 * 
 * // Mở 1 ảnh
 * <TouchableOpacity onPress={() => openImage(imageUri, { title: 'Ảnh dự án' })}>
 *   <Image source={{ uri: imageUri }} />
 * </TouchableOpacity>
 * 
 * // Mở gallery nhiều ảnh
 * <TouchableOpacity onPress={() => openGallery(images, 0)}>
 *   <Image source={{ uri: images[0].uri }} />
 * </TouchableOpacity>
 * ```
 */
export function useImageViewer() {
  const viewer = useFullMediaViewer();

  /**
   * Mở 1 ảnh đơn
   */
  const openImage = useCallback((
    uri: string,
    options?: ImageViewerOptions & {
      id?: string;
      title?: string;
      description?: string;
    }
  ) => {
    const file: MediaFile = {
      id: options?.id || `img_${Date.now()}`,
      uri,
      type: 'image',
      title: options?.title,
      description: options?.description,
    };
    
    viewer.open([file], 0, {
      allowDelete: options?.allowDelete ?? false,
      allowEdit: options?.allowEdit ?? true,
      allowShare: options?.allowShare ?? true,
      allowDownload: options?.allowDownload ?? true,
      showInfo: options?.showInfo ?? !!options?.title,
      headerTitle: options?.headerTitle,
      onDelete: options?.onDelete,
      onEdit: options?.onEdit,
    });
  }, [viewer]);

  /**
   * Mở 1 video đơn
   */
  const openVideo = useCallback((
    uri: string,
    options?: ImageViewerOptions & {
      id?: string;
      title?: string;
      thumbnail?: string;
    }
  ) => {
    const file: MediaFile = {
      id: options?.id || `video_${Date.now()}`,
      uri,
      type: 'video',
      title: options?.title,
      thumbnail: options?.thumbnail,
    };
    
    viewer.open([file], 0, {
      allowDelete: options?.allowDelete ?? false,
      allowEdit: false, // Videos không hỗ trợ edit trong app
      allowShare: options?.allowShare ?? true,
      allowDownload: options?.allowDownload ?? true,
      showInfo: options?.showInfo ?? !!options?.title,
      headerTitle: options?.headerTitle,
      onDelete: options?.onDelete,
    });
  }, [viewer]);

  /**
   * Mở gallery nhiều ảnh/video
   */
  const openGallery = useCallback((
    items: {
      id?: string;
      uri: string;
      type?: 'image' | 'video';
      title?: string;
      description?: string;
      thumbnail?: string;
    }[],
    initialIndex = 0,
    options?: ImageViewerOptions
  ) => {
    const files: MediaFile[] = items.map((item, index) => ({
      id: item.id || `gallery_${index}`,
      uri: item.uri,
      type: item.type || 'image',
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail,
    }));
    
    viewer.open(files, initialIndex, {
      allowDelete: options?.allowDelete ?? false,
      allowEdit: options?.allowEdit ?? true,
      allowShare: options?.allowShare ?? true,
      allowDownload: options?.allowDownload ?? true,
      showInfo: options?.showInfo ?? true,
      headerTitle: options?.headerTitle,
      onDelete: options?.onDelete,
      onEdit: options?.onEdit,
    });
  }, [viewer]);

  /**
   * Đóng viewer
   */
  const close = viewer.close;

  /**
   * Check xem viewer có đang mở không
   */
  const isOpen = viewer.isOpen;

  return {
    openImage,
    openVideo,
    openGallery,
    close,
    isOpen,
  };
}

export default useImageViewer;
