import { Coordinates, DeliveryTracking, Meeting, Participant } from '@/types/meeting';

/**
 * Meeting Tracking Types & Helpers
 * Dữ liệu thực tế từ API/CRM - không còn mock data
 */

// Tọa độ một số địa điểm ở Hồ Chí Minh (reference)
export const LOCATIONS = {
  AEON_TAN_PHU: {
    latitude: 10.8058,
    longitude: 106.6169,
    address: '30 Bờ Bao Tân Thắng, Sơn Kỳ, Tân Phú, TP.HCM',
    name: 'AEON MALL Tân Phú'
  },
  TAN_SON_NHAT: {
    latitude: 10.8184,
    longitude: 106.6585,
    address: 'Cảng hàng không quốc tế Tân Sơn Nhất',
    name: 'Sân bay Tân Sơn Nhất'
  },
  LANG_HOA_GO_VAP: {
    latitude: 10.8411,
    longitude: 106.6868,
    address: 'Công viên Làng hoa Gò Vấp',
    name: 'Làng hoa Gò Vấp'
  },
  DISTRICT_1: {
    latitude: 10.7769,
    longitude: 106.7009,
    address: 'Quận 1, TP. Hồ Chí Minh',
    name: 'Trung tâm Quận 1'
  },
  DISTRICT_7: {
    latitude: 10.7306,
    longitude: 106.7197,
    address: 'Phú Mỹ Hưng, Quận 7, TP.HCM',
    name: 'Phú Mỹ Hưng'
  }
};

// Sample route coordinates (for reference, actual routes from API)
export const SAMPLE_ROUTE: Coordinates[] = [];

// Empty arrays - data from API/CRM only
export const MOCK_PARTICIPANTS: Participant[] = [];
export const MOCK_MEETINGS: Meeting[] = [];
export const MOCK_DELIVERY: DeliveryTracking | null = null;

/**
 * Helper: Tính khoảng cách giữa 2 tọa độ (Haversine formula)
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Helper: Tạo route đơn giản giữa 2 điểm (interpolate)
 */
export function generateSimpleRoute(
  start: Coordinates,
  end: Coordinates,
  points: number = 5
): Coordinates[] {
  const route: Coordinates[] = [start];
  
  for (let i = 1; i < points - 1; i++) {
    const ratio = i / (points - 1);
    route.push({
      latitude: start.latitude + (end.latitude - start.latitude) * ratio,
      longitude: start.longitude + (end.longitude - start.longitude) * ratio
    });
  }
  
  route.push(end);
  return route;
}
