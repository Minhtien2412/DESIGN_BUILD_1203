/**
 * Meeting Tracking Types
 * Các kiểu dữ liệu cho tính năng theo dõi cuộc họp/công trình
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location extends Coordinates {
  address: string;
  name?: string;
}

export type ParticipantStatus = 'not-started' | 'on-the-way' | 'arrived' | 'cancelled';
export type MeetingStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: string; // 'client' | 'contractor' | 'engineer' | 'worker'
  status: ParticipantStatus;
  currentLocation?: Coordinates;
  estimatedArrival?: string; // ISO date string
  distance?: number; // in kilometers
  phone?: string;
}

export interface RouteInfo {
  distance: number; // kilometers
  duration: number; // minutes
  polyline: Coordinates[]; // array of coordinates for route visualization
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  type: 'meeting' | 'site-inspection' | 'delivery' | 'construction';
  status: MeetingStatus;
  location: Location;
  scheduledTime: string; // ISO date string
  estimatedEndTime?: string;
  participants: Participant[];
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  checkInRequired: boolean;
  checkInRadius?: number; // meters - bán kính check-in
  createdAt: string;
  updatedAt: string;
}

export interface MeetingWithRoute extends Meeting {
  routes: Map<string, RouteInfo>; // participantId -> route info
}

/**
 * Thông tin vận chuyển/giao hàng (tương tự Shopee)
 */
export interface DeliveryTracking {
  id: string;
  trackingNumber: string;
  carrier: {
    name: string;
    logo?: string;
  };
  origin: Location;
  destination: Location;
  currentLocation?: Coordinates;
  status: 'preparing' | 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered';
  estimatedDelivery: string; // ISO date string
  route: Coordinates[];
  updates: {
    timestamp: string;
    status: string;
    location: string;
    description: string;
  }[];
}
