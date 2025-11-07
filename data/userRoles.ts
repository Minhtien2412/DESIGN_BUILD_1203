import type MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

export type UserRole = {
  role: string; // slug
  title: string;
  description?: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
};

export const USER_ROLES: readonly UserRole[] = [
  { role: 'khach-hang', title: 'Khách hàng', icon: 'person', description: 'Người mua hàng / sử dụng dịch vụ.' },
  { role: 'admin', title: 'Admin', icon: 'shield', description: 'Quản trị hệ thống, cấu hình và kiểm duyệt.' },
  { role: 'nha-thau', title: 'Nhà thầu', icon: 'engineering', description: 'Đơn vị thi công, nhận dự án.' },
  { role: 'cong-ty', title: 'Công ty', icon: 'business', description: 'Tài khoản cấp công ty/doanh nghiệp.' },
  { role: 'tho-son', title: 'Thợ sơn', icon: 'format-paint', description: 'Thợ chuyên môn, ví dụ: thợ sơn.' },
];

export const rolePath = (role: string) => `/user/${role}` as const;
