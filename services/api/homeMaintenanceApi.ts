/**
 * Home Maintenance Services API
 * API cho dịch vụ bảo trì nhà
 * 
 * @author AI Assistant  
 * @date 05/01/2026
 */

import ENV from '@/config/env';
import { getItem } from '@/utils/storage';

const BASE_URL = `${ENV.API_BASE_URL}/home-maintenance`;

// ==================== TYPES ====================

export interface ServiceCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
  isHot?: boolean;
  description?: string;
}

export interface ServiceWorker {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  avatar: string;
  isVerified: boolean;
  phone?: string;
  address?: string;
  services?: string[];
  price?: {
    min: number;
    max: number;
    unit: string;
  };
}

export interface ServiceBooking {
  id: string;
  categoryId: string;
  workerId: string;
  userId: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
}

// ==================== MOCK DATA ====================

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: '1',
    name: 'Bảo dưỡng\nKhông gian',
    iconName: 'home-outline',
    color: '#06b6d4', // cyan-500
    description: 'Bảo trì, sửa chữa nhà cửa tổng quát'
  },
  {
    id: '2',
    name: 'Sửa chữa\nBếp & Lò',
    iconName: 'flame-outline',
    color: '#f97316', // orange-500
    isHot: true,
    description: 'Sửa bếp gas, bếp điện, lò nướng'
  },
  {
    id: '3',
    name: 'Khóa &\nChuông cửa',
    iconName: 'lock-closed-outline',
    color: '#f59e0b', // amber-500
    description: 'Thay khóa, sửa chuông cửa, khóa thông minh'
  },
  {
    id: '4',
    name: 'Hệ thống\nCamera',
    iconName: 'videocam-outline',
    color: '#6366f1', // indigo-500
    description: 'Lắp đặt, sửa chữa camera an ninh'
  },
  {
    id: '5',
    name: 'Mạng &\nWiFi',
    iconName: 'wifi-outline',
    color: '#3b82f6', // blue-500
    description: 'Cài đặt, sửa mạng internet, WiFi'
  },
  {
    id: '6',
    name: 'Điện lạnh &\nMáy lạnh',
    iconName: 'snow-outline',
    color: '#38bdf8', // sky-400
    description: 'Bảo trì, sửa máy lạnh, tủ lạnh'
  },
  {
    id: '7',
    name: 'Máy lọc\nNước',
    iconName: 'water-outline',
    color: '#2563eb', // blue-600
    description: 'Lắp đặt, bảo trì máy lọc nước'
  },
  {
    id: '8',
    name: 'Thông gió &\nHút mùi',
    iconName: 'leaf-outline',
    color: '#14b8a6', // teal-500
    description: 'Quạt thông gió, máy hút mùi'
  },
  {
    id: '9',
    name: 'Chăm sóc\nSân vườn',
    iconName: 'flower-outline',
    color: '#22c55e', // green-500
    description: 'Cắt cỏ, tỉa cây, làm vườn'
  },
];

export const SERVICE_WORKERS: ServiceWorker[] = [
  {
    id: 'w1',
    name: 'Nguyễn Văn An',
    specialty: 'Chuyên gia điện lạnh (5 năm KN)',
    experience: '5 năm',
    rating: 4.9,
    reviews: 120,
    avatar: 'https://nhaxinhdesign.com/wp-content/uploads/2025/06/KS_Hieu-scaled.png',
    isVerified: true,
    phone: '0901234567',
    services: ['Điện lạnh', 'Máy lạnh', 'Tủ lạnh'],
    price: { min: 150000, max: 500000, unit: 'lần' }
  },
  {
    id: 'w2',
    name: 'Trần Minh Đức',
    specialty: 'Kỹ thuật Camera & Mạng',
    experience: '3 năm',
    rating: 5.0,
    reviews: 85,
    avatar: 'https://nhaxinhdesign.com/wp-content/uploads/2025/06/MKT_TIEN-scaled.png',
    isVerified: true,
    phone: '0912345678',
    services: ['Camera', 'Mạng WiFi', 'Khóa thông minh'],
    price: { min: 200000, max: 800000, unit: 'lần' }
  },
  {
    id: 'w3',
    name: 'Lê Hoàng Nam',
    specialty: 'Thợ điện nước (7 năm KN)',
    experience: '7 năm',
    rating: 4.8,
    reviews: 200,
    avatar: 'https://i.pravatar.cc/150?img=3',
    isVerified: true,
    phone: '0923456789',
    services: ['Điện', 'Nước', 'Bảo dưỡng tổng quát'],
    price: { min: 100000, max: 400000, unit: 'lần' }
  },
  {
    id: 'w4',
    name: 'Phạm Thị Hoa',
    specialty: 'Chuyên gia vệ sinh công nghiệp',
    experience: '4 năm',
    rating: 4.7,
    reviews: 95,
    avatar: 'https://i.pravatar.cc/150?img=5',
    isVerified: true,
    phone: '0934567890',
    services: ['Vệ sinh', 'Khử khuẩn', 'Giặt thảm'],
    price: { min: 300000, max: 1000000, unit: 'buổi' }
  },
];

// ==================== AUTH HELPER ====================

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// ==================== API METHODS ====================

/**
 * Get all service categories
 */
export async function getCategories(): Promise<ServiceCategory[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/categories`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.log('[homeMaintenanceApi] Using mock categories');
    return SERVICE_CATEGORIES;
  }
}

/**
 * Get all workers
 */
export async function getWorkers(categoryId?: string): Promise<ServiceWorker[]> {
  try {
    const headers = await getAuthHeaders();
    const url = categoryId 
      ? `${BASE_URL}/workers?category=${categoryId}`
      : `${BASE_URL}/workers`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workers: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.log('[homeMaintenanceApi] Using mock workers');
    return SERVICE_WORKERS;
  }
}

/**
 * Get worker by ID
 */
export async function getWorkerById(workerId: string): Promise<ServiceWorker | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/workers/${workerId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch worker: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.log('[homeMaintenanceApi] Using mock worker');
    return SERVICE_WORKERS.find(w => w.id === workerId) || null;
  }
}

/**
 * Create a booking
 */
export async function createBooking(booking: Omit<ServiceBooking, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ServiceBooking> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(booking)
    });

    if (!response.ok) {
      throw new Error(`Failed to create booking: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.log('[homeMaintenanceApi] Mock booking created');
    // Return mock booking
    return {
      ...booking,
      id: `booking-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

/**
 * Get user's bookings
 */
export async function getMyBookings(): Promise<ServiceBooking[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/bookings/my`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.log('[homeMaintenanceApi] No bookings found');
    return [];
  }
}

// ==================== EXPORTS ====================

export const homeMaintenanceApi = {
  getCategories,
  getWorkers,
  getWorkerById,
  createBooking,
  getMyBookings,
  SERVICE_CATEGORIES,
  SERVICE_WORKERS
};

export default homeMaintenanceApi;
