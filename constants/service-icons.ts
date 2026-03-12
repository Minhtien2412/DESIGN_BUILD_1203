import type MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

export const SERVICE_ICON_MAP = {
  'nha-pho': 'home',
  'biet-thu': 'villa',
  'noi-that': 'chair',
  'nha-xuong': 'factory',
  'dien': 'bolt',
  'nuoc': 'opacity',
  'giam-sat': 'engineering',
  'ho-so': 'folder',
  'khach-san': 'apartment',
  'do-dac': 'straighten',
  'pccc': 'local-fire-department',
  'sofa': 'weekend',
  'cong-viec': 'business-center',
  'tb-bep': 'kitchen',
  'tb-vs': 'bathtub',
  'tk-noi-that': 'design-services',
  'tk-nha': 'architecture',
  'tra-cuu-xd': 'search',
  'van-phong': 'business',
  'ban-an': 'table-restaurant',
  'ban-hoc': 'school',
  'bang-mau': 'palette',
  'cty-xd': 'domain',
  'cty-noi-that': 'weekend',
} as const;

export type ServiceIconKey = keyof typeof SERVICE_ICON_MAP;
export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export const serviceIconToMaterial = (key: ServiceIconKey): MaterialIconName => SERVICE_ICON_MAP[key];
