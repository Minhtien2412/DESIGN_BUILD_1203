import type MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

export type Company = {
  slug: string;
  name: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  description?: string;
  cities?: string[];     // e.g. ['hcm','hn']
  categories?: string[]; // e.g. ['thau','hoan-thien','thiet-ke','noi-that']
};

export const COMPANIES: readonly Company[] = [
  { slug: 'xay-dung-abc', name: 'Xây Dựng ABC', icon: 'domain', description: 'Nhà thầu tổng hợp, thi công trọn gói.', cities: ['hcm','hn'], categories: ['thau','hoan-thien'] },
  { slug: 'noi-that-xyz', name: 'Nội Thất XYZ', icon: 'weekend', description: 'Thiết kế & thi công nội thất.', cities: ['hcm'], categories: ['thiet-ke','noi-that'] },
];

export const companyPath = (slug: string) => `/company/${slug}` as const;
