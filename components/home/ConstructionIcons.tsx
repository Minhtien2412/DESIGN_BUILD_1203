/**
 * Construction Icons - Unified Icon Set for Construction App
 * Based on Figma design mockup
 * @created 2026-01-14
 */

import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ============================================================================
// ICON MAPPINGS - Unified Icons
// ============================================================================
export const UNIFIED_ICONS = {
  // DỊCH VỤ
  houseDesign: 'home-outline' as const,
  interiorDesign: 'bed-outline' as const,
  constructionLookup: 'search-outline' as const,
  permit: 'document-text-outline' as const,
  sampleDocs: 'folder-outline' as const,
  fengShui: 'compass-outline' as const,
  colorPalette: 'color-palette-outline' as const,
  qualityConsulting: 'shield-checkmark-outline' as const,
  constructionCompany: 'business-outline' as const,
  interiorCompany: 'storefront-outline' as const,
  qualitySupervision: 'eye-outline' as const,
  more: 'ellipsis-horizontal-circle-outline' as const,
  
  // THỢ XÂY DỰNG
  pileDriving: 'arrow-down-circle-outline' as const,
  excavation: 'layers-outline' as const,
  materials: 'cube-outline' as const,
  labor: 'people-outline' as const,
  mason: 'hammer-outline' as const,
  ironworker: 'git-network-outline' as const,
  formworker: 'albums-outline' as const,
  mechanic: 'settings-outline' as const,
  plasterer: 'brush-outline' as const,
  electrician: 'flash-outline' as const,
  concrete: 'cube-outline' as const,
  
  // HOÀN THIỆN
  tiler: 'grid-outline' as const,
  drywall: 'square-outline' as const,
  painter: 'color-fill-outline' as const,
  stoneMason: 'diamond-outline' as const,
  doorMaker: 'browsers-outline' as const,
  railingMaker: 'expand-outline' as const,
  gateMaker: 'enter-outline' as const,
  cameraTech: 'videocam-outline' as const,
  
  // TRANG THIẾT BỊ
  kitchen: 'restaurant-outline' as const,
  sanitary: 'water-outline' as const,
  electrical: 'flash-outline' as const,
  plumbing: 'water-outline' as const,
  fireSafety: 'flame-outline' as const,
  diningTable: 'restaurant-outline' as const,
  studyDesk: 'book-outline' as const,
  sofa: 'tv-outline' as const,
  
  // THƯ VIỆN
  office: 'business-outline' as const,
  townhouse: 'home-outline' as const,
  villa: 'home-outline' as const,
  classicVilla: 'business-outline' as const,
  hotel: 'bed-outline' as const,
  factory: 'cube-outline' as const,
  serviceApartment: 'business-outline' as const,
  
  // THIẾT KẾ
  architect: 'person-outline' as const,
  engineer: 'construct-outline' as const,
  structural: 'cube-outline' as const,
  electricalDesign: 'flash-outline' as const,
  waterDesign: 'water-outline' as const,
  estimator: 'calculator-outline' as const,
  interiorDesigner: 'bed-outline' as const,
  aiTools: 'sparkles-outline' as const,
  
  // VIDEO
  play: 'play-circle-outline' as const,
  live: 'radio-outline' as const,
  
  // THỜI TIẾT
  weather: 'partly-sunny-outline' as const,
  sunny: 'sunny-outline' as const,
  cloudy: 'cloudy-outline' as const,
  rainy: 'rainy-outline' as const,
  thunderstorm: 'thunderstorm-outline' as const,
  
  // GENERAL
  search: 'search-outline' as const,
  camera: 'camera-outline' as const,
  notifications: 'notifications-outline' as const,
  profile: 'person-circle-outline' as const,
  settings: 'settings-outline' as const,
  info: 'information-circle-outline' as const,
  help: 'help-circle-outline' as const,
  back: 'arrow-back-outline' as const,
  forward: 'arrow-forward-outline' as const,
  close: 'close-outline' as const,
  menu: 'menu-outline' as const,
  filter: 'filter-outline' as const,
  sort: 'swap-vertical-outline' as const,
  location: 'location-outline' as const,
  call: 'call-outline' as const,
  chat: 'chatbubble-outline' as const,
  share: 'share-social-outline' as const,
  bookmark: 'bookmark-outline' as const,
  heart: 'heart-outline' as const,
  star: 'star-outline' as const,
  cart: 'cart-outline' as const,
  wallet: 'wallet-outline' as const,
};

// ============================================================================
// COLOR PALETTE - Unified Colors
// ============================================================================
export const ICON_COLORS = {
  primary: '#4AA14A',
  primaryDark: '#3D8B3D',
  primaryLight: '#E8F5E9',
  secondary: '#4894FE',
  secondaryLight: '#E3F2FD',
  accent: '#F97316',
  accentLight: '#FFF7ED',
  purple: '#8B5CF6',
  purpleLight: '#F3E8FF',
  pink: '#EC4899',
  pinkLight: '#FCE7F3',
  cyan: '#06B6D4',
  cyanLight: '#ECFEFF',
  red: '#DC2626',
  redLight: '#FEE2E2',
  yellow: '#EAB308',
  yellowLight: '#FEF9C3',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  text: '#161616',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  live: '#FF0000',
};

// ============================================================================
// ICON COMPONENT
// ============================================================================
interface ConstructionIconProps {
  name: keyof typeof UNIFIED_ICONS;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: any;
  onPress?: () => void;
}

export const ConstructionIcon = memo(function ConstructionIcon({
  name,
  size = 24,
  color = ICON_COLORS.text,
  backgroundColor,
  style,
  onPress,
}: ConstructionIconProps) {
  const iconName = UNIFIED_ICONS[name];
  
  const IconContent = (
    <View style={[
      styles.iconContainer,
      backgroundColor && { backgroundColor },
      style,
    ]}>
      <Ionicons name={iconName} size={size} color={color} />
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {IconContent}
      </TouchableOpacity>
    );
  }
  
  return IconContent;
});

// ============================================================================
// SERVICE ICON BUTTON
// ============================================================================
interface ServiceIconButtonProps {
  icon: keyof typeof UNIFIED_ICONS;
  label: string;
  color?: string;
  backgroundColor?: string;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  badge?: string;
  isNew?: boolean;
  isHot?: boolean;
}

export const ServiceIconButton = memo(function ServiceIconButton({
  icon,
  label,
  color = ICON_COLORS.secondary,
  backgroundColor,
  onPress,
  size = 'medium',
  badge,
  isNew,
  isHot,
}: ServiceIconButtonProps) {
  const iconSizes = {
    small: { container: 32, icon: 18 },
    medium: { container: 40, icon: 22 },
    large: { container: 48, icon: 26 },
  };
  
  const sizeConfig = iconSizes[size];
  
  return (
    <TouchableOpacity 
      style={styles.serviceButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.serviceIconCircle,
        { 
          width: sizeConfig.container, 
          height: sizeConfig.container,
          borderRadius: sizeConfig.container / 2,
          backgroundColor: backgroundColor || color,
        }
      ]}>
        <Ionicons 
          name={UNIFIED_ICONS[icon]} 
          size={sizeConfig.icon} 
          color={ICON_COLORS.white} 
        />
      </View>
      <Text style={styles.serviceLabel} numberOfLines={2}>{label}</Text>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {isNew && (
        <View style={[styles.badge, { backgroundColor: '#22c55e' }]}>
          <Text style={styles.badgeText}>NEW</Text>
        </View>
      )}
      {isHot && (
        <View style={[styles.badge, { backgroundColor: '#ef4444' }]}>
          <Text style={styles.badgeText}>HOT</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

// ============================================================================
// WORKER CARD ICON
// ============================================================================
interface WorkerCardIconProps {
  icon: keyof typeof UNIFIED_ICONS;
  label: string;
  location: string;
  count: number;
  onPress?: () => void;
  color?: string;
}

export const WorkerCardIcon = memo(function WorkerCardIcon({
  icon,
  label,
  location,
  count,
  onPress,
  color = ICON_COLORS.secondary,
}: WorkerCardIconProps) {
  return (
    <TouchableOpacity 
      style={styles.workerCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.workerIconContainer, { backgroundColor: color }]}>
        <Ionicons name={UNIFIED_ICONS[icon]} size={22} color={ICON_COLORS.white} />
      </View>
      <Text style={styles.workerLabel} numberOfLines={2}>{label}</Text>
      <View style={styles.workerBadge}>
        <Text style={styles.workerBadgeText}>{location}</Text>
        <View style={styles.workerDivider} />
        <Text style={styles.workerCountText}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
});

// ============================================================================
// DESIGN SERVICE CARD
// ============================================================================
interface DesignServiceCardProps {
  icon: keyof typeof UNIFIED_ICONS;
  label: string;
  price: string;
  location: string;
  count: number;
  onPress?: () => void;
  color?: string;
}

export const DesignServiceCard = memo(function DesignServiceCard({
  icon,
  label,
  price,
  location,
  count,
  onPress,
  color = ICON_COLORS.secondary,
}: DesignServiceCardProps) {
  return (
    <TouchableOpacity 
      style={styles.designCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.designIconContainer, { backgroundColor: color }]}>
        <Ionicons name={UNIFIED_ICONS[icon]} size={20} color={ICON_COLORS.white} />
      </View>
      <Text style={styles.designLabel} numberOfLines={1}>{label}</Text>
      <View style={styles.designPriceBox}>
        <View style={styles.designPriceRow}>
          <Text style={styles.designPriceLabel}>Đơn giá</Text>
          <Text style={styles.designPrice}>{price}</Text>
        </View>
        <View style={styles.designPriceRow}>
          <Text style={styles.designPriceLabel}>{location}</Text>
          <Text style={styles.designCount}>{count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Service Button
  serviceButton: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  serviceIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  serviceLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: ICON_COLORS.text,
    textAlign: 'center',
    maxWidth: 75,
    lineHeight: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: 8,
    backgroundColor: ICON_COLORS.accent,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 7,
    fontWeight: '700',
    color: ICON_COLORS.white,
  },
  
  // Worker Card
  workerCard: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  workerIconContainer: {
    width: 38,
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  workerLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: ICON_COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
    maxWidth: 75,
    lineHeight: 11,
  },
  workerBadge: {
    flexDirection: 'row',
    backgroundColor: ICON_COLORS.white,
    borderWidth: 0.5,
    borderColor: ICON_COLORS.text,
    paddingHorizontal: 4,
    paddingVertical: 3,
    minWidth: 55,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workerBadgeText: {
    fontSize: 7,
    color: ICON_COLORS.text,
  },
  workerDivider: {
    width: 0.5,
    height: 10,
    backgroundColor: ICON_COLORS.text,
    marginHorizontal: 2,
  },
  workerCountText: {
    fontSize: 7,
    color: ICON_COLORS.text,
    fontWeight: '600',
  },
  
  // Design Card
  designCard: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  designIconContainer: {
    width: 38,
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  designLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: ICON_COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  designPriceBox: {
    width: '100%',
  },
  designPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: ICON_COLORS.white,
    borderWidth: 0.5,
    borderColor: ICON_COLORS.text,
    paddingHorizontal: 4,
    paddingVertical: 3,
    marginBottom: 1,
  },
  designPriceLabel: {
    fontSize: 7,
    color: ICON_COLORS.text,
  },
  designPrice: {
    fontSize: 7,
    color: ICON_COLORS.text,
    fontWeight: '500',
  },
  designCount: {
    fontSize: 7,
    color: ICON_COLORS.text,
    fontWeight: '600',
  },
});

export default {
  UNIFIED_ICONS,
  ICON_COLORS,
  ConstructionIcon,
  ServiceIconButton,
  WorkerCardIcon,
  DesignServiceCard,
};
