/**
 * useProjectImages Hook
 * =====================
 * 
 * Hook để quản lý hình ảnh dự án với auto-fallback
 * 
 * @author AI Assistant
 * @date 14/01/2026
 */

import {
    ConstructionImageService,
    DEFAULT_PROJECT_IMAGES,
    getImageWithFallback,
    isValidImageUrl,
    ProjectType,
} from '@/services/constructionImageService';
import { useCallback, useEffect, useState } from 'react';

// ==================== TYPES ====================

export interface UseProjectImageOptions {
  /** Loại dự án */
  projectType?: ProjectType;
  /** URL hình ảnh gốc (có thể null/undefined) */
  originalUrl?: string | null;
  /** Index để lấy hình consistent */
  index?: number;
  /** Tự động fetch từ Pexels nếu không có hình */
  autoFetch?: boolean;
}

export interface UseProjectImageReturn {
  /** URL hình ảnh cuối cùng (đã có fallback) */
  imageUrl: string;
  /** Đang loading hình từ API */
  loading: boolean;
  /** Hình có phải là fallback không */
  isFallback: boolean;
  /** Refresh hình mới */
  refresh: () => void;
}

export interface UseProjectImagesOptions {
  /** Loại dự án */
  projectType?: ProjectType;
  /** Số lượng hình cần lấy */
  count?: number;
  /** Tự động fetch từ Pexels */
  autoFetch?: boolean;
}

export interface UseProjectImagesReturn {
  /** Danh sách URL hình ảnh */
  images: string[];
  /** Đang loading */
  loading: boolean;
  /** Refresh danh sách */
  refresh: () => void;
}

// ==================== SINGLE IMAGE HOOK ====================

/**
 * Hook để lấy một hình ảnh dự án với fallback
 */
export function useProjectImage(options: UseProjectImageOptions = {}): UseProjectImageReturn {
  const {
    projectType = 'construction',
    originalUrl,
    index = 0,
    autoFetch = true,
  } = options;

  const [imageUrl, setImageUrl] = useState<string>(() => 
    getImageWithFallback(originalUrl, projectType, index)
  );
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(!isValidImageUrl(originalUrl));

  useEffect(() => {
    // Nếu có URL hợp lệ, sử dụng luôn
    if (isValidImageUrl(originalUrl)) {
      setImageUrl(originalUrl!);
      setIsFallback(false);
      return;
    }

    // Nếu không có URL và autoFetch enabled
    if (autoFetch) {
      setLoading(true);
      ConstructionImageService.getProjectImage(projectType, index)
        .then((url) => {
          setImageUrl(url);
          setIsFallback(true);
        })
        .catch(() => {
          // Fallback về default
          const defaults = DEFAULT_PROJECT_IMAGES[projectType] || DEFAULT_PROJECT_IMAGES.construction;
          setImageUrl(defaults[index % defaults.length]);
          setIsFallback(true);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Không fetch, dùng default
      const defaults = DEFAULT_PROJECT_IMAGES[projectType] || DEFAULT_PROJECT_IMAGES.construction;
      setImageUrl(defaults[index % defaults.length]);
      setIsFallback(true);
    }
  }, [originalUrl, projectType, index, autoFetch]);

  const refresh = useCallback(() => {
    setLoading(true);
    ConstructionImageService.getProjectImage(projectType, Math.floor(Math.random() * 100))
      .then((url) => {
        setImageUrl(url);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectType]);

  return {
    imageUrl,
    loading,
    isFallback,
    refresh,
  };
}

// ==================== MULTIPLE IMAGES HOOK ====================

/**
 * Hook để lấy nhiều hình ảnh dự án
 */
export function useProjectImages(options: UseProjectImagesOptions = {}): UseProjectImagesReturn {
  const {
    projectType = 'construction',
    count = 4,
    autoFetch = true,
  } = options;

  const [images, setImages] = useState<string[]>(() => {
    const defaults = DEFAULT_PROJECT_IMAGES[projectType] || DEFAULT_PROJECT_IMAGES.construction;
    return defaults.slice(0, count);
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (autoFetch) {
      setLoading(true);
      ConstructionImageService.getProjectImages(projectType, count)
        .then((urls) => {
          if (urls.length > 0) {
            setImages(urls);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [projectType, count, autoFetch]);

  const refresh = useCallback(() => {
    setLoading(true);
    ConstructionImageService.fetchProjectImages(projectType, count)
      .then((urls) => {
        if (urls.length > 0) {
          setImages(urls);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectType, count]);

  return {
    images,
    loading,
    refresh,
  };
}

// ==================== FEATURED PROJECTS DATA ====================

export interface FeaturedProject {
  id: number | string;
  title: string;
  image: string;
  area: string;
  price: string;
  status: string;
  progress: number;
  type?: ProjectType;
}

/**
 * Hook để lấy dự án nổi bật với hình ảnh đầy đủ
 */
export function useFeaturedProjects(initialProjects?: FeaturedProject[]): {
  projects: FeaturedProject[];
  loading: boolean;
  refresh: () => void;
} {
  const [projects, setProjects] = useState<FeaturedProject[]>(
    initialProjects || getDefaultFeaturedProjects()
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Đảm bảo tất cả projects đều có hình
    const projectsWithImages = projects.map((project, index) => ({
      ...project,
      image: isValidImageUrl(project.image) 
        ? project.image 
        : getImageWithFallback(project.image, project.type || 'villa', index),
    }));
    setProjects(projectsWithImages);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const newProjects = await Promise.all(
        projects.map(async (project, index) => {
          const image = await ConstructionImageService.getProjectImage(
            project.type || 'villa',
            index
          );
          return { ...project, image };
        })
      );
      setProjects(newProjects);
    } finally {
      setLoading(false);
    }
  }, [projects]);

  return { projects, loading, refresh };
}

/**
 * Lấy danh sách dự án nổi bật mặc định
 */
export function getDefaultFeaturedProjects(): FeaturedProject[] {
  return [
    { 
      id: 1, 
      title: 'Biệt thự Đà Lạt', 
      image: DEFAULT_PROJECT_IMAGES.villa[0], 
      area: '450m²', 
      price: '12 tỷ', 
      status: 'Đang thi công', 
      progress: 65,
      type: 'villa',
    },
    { 
      id: 2, 
      title: 'Resort Phú Quốc', 
      image: DEFAULT_PROJECT_IMAGES.resort[0], 
      area: '2,000m²', 
      price: '85 tỷ', 
      status: 'Thiết kế', 
      progress: 30,
      type: 'resort',
    },
    { 
      id: 3, 
      title: 'Nhà phố Quận 7', 
      image: DEFAULT_PROJECT_IMAGES.townhouse[0], 
      area: '120m²', 
      price: '3.5 tỷ', 
      status: 'Hoàn thành', 
      progress: 100,
      type: 'townhouse',
    },
    { 
      id: 4, 
      title: 'Căn hộ Thảo Điền', 
      image: DEFAULT_PROJECT_IMAGES.apartment[0], 
      area: '180m²', 
      price: '8 tỷ', 
      status: 'Đang thi công', 
      progress: 80,
      type: 'apartment',
    },
    { 
      id: 5, 
      title: 'Văn phòng Quận 1', 
      image: DEFAULT_PROJECT_IMAGES.office[0], 
      area: '500m²', 
      price: '25 tỷ', 
      status: 'Thiết kế', 
      progress: 45,
      type: 'office',
    },
    { 
      id: 6, 
      title: 'Biệt thự Vũng Tàu', 
      image: DEFAULT_PROJECT_IMAGES.villa[1], 
      area: '380m²', 
      price: '15 tỷ', 
      status: 'Đang thi công', 
      progress: 72,
      type: 'villa',
    },
  ];
}

// ==================== QUICK STATS DATA ====================

export interface QuickStat {
  id: number;
  label: string;
  value: string;
  icon: string;
  color: string;
  bgColor: string;
}

/**
 * Lấy thống kê nhanh với dữ liệu mặc định
 */
export function getDefaultQuickStats(): QuickStat[] {
  return [
    { id: 1, label: 'Dự án', value: '2,500+', icon: 'briefcase', color: '#4894FE', bgColor: '#E3F2FD' },
    { id: 2, label: 'KTS/Kỹ sư', value: '1,200+', icon: 'people', color: '#4AA14A', bgColor: '#E8F5E9' },
    { id: 3, label: 'Đánh giá', value: '4.9★', icon: 'star', color: '#F97316', bgColor: '#FFF7ED' },
    { id: 4, label: 'Hỗ trợ', value: '24/7', icon: 'headset', color: '#8B5CF6', bgColor: '#F3E8FF' },
  ];
}

// ==================== BANNER DATA ====================

export interface AdBanner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  route: string;
}

/**
 * Lấy banners quảng cáo với hình ảnh đầy đủ
 */
export function getDefaultAdBanners(): AdBanner[] {
  return [
    { 
      id: 1, 
      image: DEFAULT_PROJECT_IMAGES.villa[2], 
      title: 'Thiết kế biệt thự cao cấp', 
      subtitle: 'Giảm 20% phí thiết kế', 
      route: '/services/house-design' 
    },
    { 
      id: 2, 
      image: DEFAULT_PROJECT_IMAGES.interior[0], 
      title: 'Nội thất hiện đại', 
      subtitle: 'Miễn phí tư vấn 3D', 
      route: '/services/interior-design' 
    },
    { 
      id: 3, 
      image: DEFAULT_PROJECT_IMAGES.construction[0], 
      title: 'Xây dựng trọn gói', 
      subtitle: 'Cam kết tiến độ', 
      route: '/services/construction-company' 
    },
    { 
      id: 4, 
      image: DEFAULT_PROJECT_IMAGES.resort[1], 
      title: 'Resort & Khách sạn', 
      subtitle: 'Thiết kế chuyên nghiệp', 
      route: '/services/quality-consulting' 
    },
  ];
}

// ==================== EXPORT ====================

export default {
  useProjectImage,
  useProjectImages,
  useFeaturedProjects,
  getDefaultFeaturedProjects,
  getDefaultQuickStats,
  getDefaultAdBanners,
};
