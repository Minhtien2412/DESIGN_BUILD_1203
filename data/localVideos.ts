/**
 * Local Video Assets
 * Fallback videos when server is unavailable
 */

export interface LocalVideo {
  id: string;
  title: string;
  description: string;
  asset?: any; // require() result (optional if using remote url)
  url?: string; // optional remote URL alternative to avoid bundling large assets
  thumbnail?: any;
  category: 'design' | 'construction' | 'tutorial' | 'showcase';
  views: number;
  likes: number;
  duration?: number;
  author?: {
    name: string;
    avatar?: string;
  };
}

/**
 * Local video assets stored in assets/videos/
 * These serve as fallback when API is unavailable
 */
export const LOCAL_VIDEOS: LocalVideo[] = [
  {
    id: 'local_1',
    title: 'Cảm nhận khách hàng - Biệt thự hiện đại Anh Thanh',
    description: 'Chia sẻ của khách hàng sau khi hoàn thành thi công biệt thự hiện đại',
    url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    category: 'showcase',
    views: 1250,
    likes: 89,
    duration: 120,
    author: {
      name: 'Khách hàng Anh Thanh',
    }
  },
  // EXCLUDED: Video file too large for bundling (73 MB)
  // {
  //   id: 'local_2',
  //   title: 'Thi công biệt thú hiện đại - Phần 1',
  //   description: 'Quy trình thi công biệt thự từ móng đến hoàn thiện',
  //   asset: require('@/assets/videos/cam-nhan-khach-hang-sau-thi-cong-biet-thu-hien-dai-anh-thanh_1.mp4'),
  //   category: 'construction',
  //   views: 2340,
  //   likes: 156,
  //   duration: 180,
  //   author: {
  //     name: 'Đội ngũ thi công',
  //   }
  // },
  // EXCLUDED: Video file too large for bundling (40 MB - keeping under 50MB limit)
  // {
  //   id: 'local_3',
  //   title: 'Thi công biệt thú hiện đại - Phần 2',
  //   description: 'Hoàn thiện nội thất và sân vườn',
  //   asset: require('@/assets/videos/cam-nhan-khach-hang-sau-thi-cong-biet-thu-hien-dai-anh-thanh_2.mp4'),
  //   category: 'construction',
  //   views: 1890,
  //   likes: 134,
  //   duration: 150,
  //   author: {
  //     name: 'Đội ngũ thi công',
  //   }
  // },
  {
    id: 'local_4',
    title: 'Carbon - Vật liệu xây dựng hiện đại',
    description: 'Giới thiệu ứng dụng carbon trong xây dựng',
    url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    category: 'tutorial',
    views: 3450,
    likes: 234,
    duration: 90,
    author: {
      name: 'Chuyên gia vật liệu',
    }
  },
  {
    id: 'local_5',
    title: 'Hệ thống đèn thông tầng',
    description: 'Thiết kế và lắp đặt hệ thống đèn thông tầng hiện đại',
    url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    category: 'design',
    views: 1670,
    likes: 98,
    duration: 100,
    author: {
      name: 'KTS Minh',
    }
  },
  // EXCLUDED: Video file too large for bundling (197 MB)
  // {
  //   id: 'local_6',
  //   title: 'Kiểm tra độ sức bê tông',
  //   description: 'Quy trình kiểm tra chất lượng bê tông tại công trình',
  //   asset: require('@/assets/videos/kiem-tra-do-suc-be-tong.mp4'),
  //   category: 'construction',
  //   views: 2120,
  //   likes: 167,
  //   duration: 120,
  //   author: {
  //     name: 'KS Tuấn',
  //   }
  // },
  // EXCLUDED: Video file too large for bundling (141 MB)
  // {
  //   id: 'local_7',
  //   title: 'Dự án Maika - Căn hộ cao cấp',
  //   description: 'Thiết kế nội thất căn hộ cao cấp Maika',
  //   asset: require('@/assets/videos/maika.mp4'),
  //   category: 'design',
  //   views: 4560,
  //   likes: 312,
  //   duration: 180,
  //   author: {
  //     name: 'Designer Lan',
  //   }
  // },
  {
    id: 'local_8',
    title: 'Phòng con gái nhỏ - Anh Thanh',
    description: 'Thiết kế phòng ngủ cho bé gái đáng yêu',
    url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    category: 'design',
    views: 3780,
    likes: 289,
    duration: 90,
    author: {
      name: 'KTS Phương',
    }
  },
  // EXCLUDED: Video file too large for bundling (>100MB)
  // {
  //   id: 'local_9',
  //   title: 'Phòng bếp đẹp TikTok',
  //   description: 'Xu hướng thiết kế phòng bếp hot nhất hiện nay',
  //   asset: require('@/assets/videos/phong-bep-dep-tiktok.mp4'),
  //   category: 'design',
  //   views: 5670,
  //   likes: 456,
  //   duration: 60,
  //   author: {
  //     name: 'Nội thất đẹp',
  //   }
  // },
  {
    id: 'local_10',
    title: 'Tiến độ thi công - Ngày 20/09/2025',
    description: 'Cập nhật tiến độ công trình mới nhất',
    url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    category: 'construction',
    views: 1234,
    likes: 87,
    duration: 150,
    author: {
      name: 'Giám sát công trình',
    }
  },
  {
    id: 'local_11',
    title: 'Tiến độ thi công - Ngày 21/09/2025',
    description: 'Kiểm tra chất lượng và tiến độ thi công',
    url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    category: 'construction',
    views: 1456,
    likes: 102,
    duration: 180,
    author: {
      name: 'Giám sát công trình',
    }
  },
];

/**
 * Get local videos by category
 */
export function getLocalVideosByCategory(category?: string): LocalVideo[] {
  if (!category) return LOCAL_VIDEOS;
  return LOCAL_VIDEOS.filter(v => v.category === category);
}

/**
 * Get random local videos
 */
export function getRandomLocalVideos(count: number = 6): LocalVideo[] {
  const shuffled = [...LOCAL_VIDEOS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get local video by ID
 */
export function getLocalVideoById(id: string): LocalVideo | undefined {
  return LOCAL_VIDEOS.find(v => v.id === id);
}
