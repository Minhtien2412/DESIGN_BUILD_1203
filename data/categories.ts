import type MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

export type Category = {
  slug: string;
  title: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  color: string;
  description?: string;
};

export const CATEGORIES: readonly Category[] = [
  { slug: 'mau-nha', title: 'Mẫu Nhà', icon: 'home', color: '#FFD700', description: 'Tham khảo mẫu nhà đẹp, hiện đại.' },
  { slug: 'mau-noi-that', title: 'Mẫu Nội Thất', icon: 'weekend', color: '#FADADD', description: 'Ý tưởng nội thất, trang trí phòng.' },
  { slug: 'san-vuon', title: 'Sân Vườn', icon: 'park', color: '#90EE90', description: 'Thiết kế cảnh quan, tiểu cảnh, sân vườn.' },
  { slug: 'thiet-bi', title: 'Thiết Bị', icon: 'settings', color: '#87CEFA', description: 'Thiết bị, vật tư xây dựng, nội thất.' },
  { slug: 'store', title: 'Store', icon: 'store', color: '#DDA0DD', description: 'Cửa hàng tổng hợp.' },
  { slug: 'phong-thuy', title: 'Phong Thủy', icon: 'star-rate', color: '#FFB6C1', description: 'Tư vấn phong thủy ứng dụng.' },
  { slug: 'bang-mau', title: 'Bảng Màu KTS', icon: 'palette', color: '#FFE4B5', description: 'Bảng màu tham khảo cho thiết kế.' },
  { slug: 'tai-lieu', title: 'Tài Liệu', icon: 'article', color: '#E6E6FA', description: 'Tài liệu kỹ thuật, quy chuẩn, biểu mẫu.' },
  { slug: 'dich-vu', title: 'Dịch Vụ', icon: 'miscellaneous-services', color: '#F0E68C', description: 'Dịch vụ thi công, bảo trì, tư vấn.' },
  { slug: 'timeline', title: 'Dòng thời gian', icon: 'timeline', color: '#B0E0E6', description: 'Bài đăng tổng hợp theo thời gian của tài khoản.' },
  { slug: 'reels', title: 'Reels', icon: 'smartphone', color: '#98FB98', description: 'Video ngắn dạng Reels.' },
] as const;

export const categoryPath = (slug: string) => `/category/${slug}` as const;
