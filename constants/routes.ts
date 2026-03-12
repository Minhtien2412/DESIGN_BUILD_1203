import type { ImageSourcePropType } from 'react-native';
import { HOME_UTILITY_ICONS } from './home-icons';

export type RouteInfo = {
  href: `/${string}`;
  label: string;
  iconKey: keyof typeof HOME_UTILITY_ICONS;
  iconSource: ImageSourcePropType;
};

// Central registry for navigation links, especially for icon grids
export const SITE_MAP = {
  // Construction Utilities
  'ep-coc': {
    href: '/ep-coc',
    label: 'Ép cọc',
    iconKey: 'ep-coc',
    iconSource: HOME_UTILITY_ICONS['ep-coc'],
  },
  'dao-dat': {
    href: '/dao-dat',
    label: 'Đào đất',
    iconKey: 'dao-dat',
    iconSource: HOME_UTILITY_ICONS['dao-dat'],
  },
  'vat-lieu': {
    href: '/vat-lieu',
    label: 'Vật liệu',
    iconKey: 'vat-lieu',
    iconSource: HOME_UTILITY_ICONS['vat-lieu'],
  },
  'be-tong': {
    href: '/be-tong',
    label: 'Bê tông',
    iconKey: 'be-tong',
    iconSource: HOME_UTILITY_ICONS['be-tong'],
  },
  'nhan-cong': {
    href: '/nhan-cong',
    label: 'Nhân công',
    iconKey: 'nhan-cong',
    iconSource: HOME_UTILITY_ICONS['nhan-cong'],
  },
  'tho-xay': {
    href: '/tho-xay',
    label: 'Thợ xây',
    iconKey: 'tho-xay',
    iconSource: HOME_UTILITY_ICONS['tho-xay'],
  },
  'tho-sat': {
    href: '/tho-sat',
    label: 'Thợ sắt',
    iconKey: 'tho-sat',
    iconSource: HOME_UTILITY_ICONS['tho-sat'],
  },
  'tho-coffa': {
    href: '/tho-coffa',
    label: 'Thợ coffa',
    iconKey: 'tho-coffa',
    iconSource: HOME_UTILITY_ICONS['tho-coffa'],
  },
  'tho-co-khi': {
    href: '/tho-co-khi',
    label: 'Cơ khí',
    iconKey: 'tho-co-khi',
    iconSource: HOME_UTILITY_ICONS['tho-co-khi'],
  },
  'tho-to-tuong': {
    href: '/tho-to-tuong',
    label: 'Tô tường',
    iconKey: 'tho-to-tuong',
    iconSource: HOME_UTILITY_ICONS['tho-to-tuong'],
  },
  'tho-dien-nuoc': {
    href: '/tho-dien-nuoc',
    label: 'Điện nước',
    iconKey: 'tho-dien-nuoc',
    iconSource: HOME_UTILITY_ICONS['tho-dien-nuoc'],
  },

  // Finishing Utilities
  'lat-gach': {
    href: '/lat-gach',
    label: 'Lát gạch',
    iconKey: 'lat-gach',
    iconSource: HOME_UTILITY_ICONS['lat-gach'],
  },
  'thach-cao': {
    href: '/thach-cao',
    label: 'Thạch cao',
    iconKey: 'thach-cao',
    iconSource: HOME_UTILITY_ICONS['thach-cao'],
  },
  'tho-son': {
    href: '/tho-son',
    label: 'Thợ sơn',
    iconKey: 'tho-son',
    iconSource: HOME_UTILITY_ICONS['tho-son'],
  },
  'tho-da': {
    href: '/tho-da',
    label: 'Thợ đá',
    iconKey: 'tho-da',
    iconSource: HOME_UTILITY_ICONS['tho-da'],
  },
  'lam-cua': {
    href: '/lam-cua',
    label: 'Làm cửa',
    iconKey: 'lam-cua',
    iconSource: HOME_UTILITY_ICONS['lam-cua'],
  },
  'lan-can': {
    href: '/lan-can',
    label: 'Lan can',
    iconKey: 'lan-can',
    iconSource: HOME_UTILITY_ICONS['lan-can'],
  },
  'tho-cong': {
    href: '/tho-cong',
    label: 'Thợ chung',
    iconKey: 'tho-cong',
    iconSource: HOME_UTILITY_ICONS['tho-cong'],
  },
  'camera': {
    href: '/camera',
    label: 'Camera',
    iconKey: 'camera',
    iconSource: HOME_UTILITY_ICONS['camera'],
  },
} as const;

export type AppRoute = keyof typeof SITE_MAP;
