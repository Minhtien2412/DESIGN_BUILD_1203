/**
 * Recent Activity Tracking Service
 * Theo dõi sản phẩm/dịch vụ vừa xem, vừa quan tâm (như Shopee)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecentProduct {
  id: string;
  name: string;
  image: string;
  price: string;
  category: string;
  viewedAt: string;
}

export interface RecentService {
  id: string;
  name: string;
  icon: string;
  category: string;
  route: string;
  viewedAt: string;
}

export interface InterestItem {
  id: string;
  type: 'product' | 'service' | 'contractor';
  name: string;
  image?: string;
  interactedAt: string;
  interactions: number; // Số lần tương tác
}

const STORAGE_KEYS = {
  RECENT_PRODUCTS: 'recent_products',
  RECENT_SERVICES: 'recent_services',
  INTERESTS: 'user_interests',
};

const MAX_RECENT_ITEMS = 20;
const MAX_INTEREST_ITEMS = 50;

/**
 * Thêm sản phẩm vào lịch sử xem
 */
export async function addRecentProduct(product: Omit<RecentProduct, 'viewedAt'>): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_PRODUCTS);
    let recent: RecentProduct[] = stored ? JSON.parse(stored) : [];

    // Xóa sản phẩm cũ nếu đã tồn tại
    recent = recent.filter(p => p.id !== product.id);

    // Thêm sản phẩm mới lên đầu
    recent.unshift({
      ...product,
      viewedAt: new Date().toISOString(),
    });

    // Giới hạn số lượng
    if (recent.length > MAX_RECENT_ITEMS) {
      recent = recent.slice(0, MAX_RECENT_ITEMS);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_PRODUCTS, JSON.stringify(recent));
  } catch (error) {
    console.error('Error adding recent product:', error);
  }
}

/**
 * Lấy danh sách sản phẩm vừa xem
 */
export async function getRecentProducts(limit: number = 10): Promise<RecentProduct[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_PRODUCTS);
    const recent: RecentProduct[] = stored ? JSON.parse(stored) : [];
    return recent.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent products:', error);
    return [];
  }
}

/**
 * Thêm dịch vụ vào lịch sử xem
 */
export async function addRecentService(service: Omit<RecentService, 'viewedAt'>): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SERVICES);
    let recent: RecentService[] = stored ? JSON.parse(stored) : [];

    // Xóa dịch vụ cũ nếu đã tồn tại
    recent = recent.filter(s => s.id !== service.id);

    // Thêm dịch vụ mới lên đầu
    recent.unshift({
      ...service,
      viewedAt: new Date().toISOString(),
    });

    // Giới hạn số lượng
    if (recent.length > MAX_RECENT_ITEMS) {
      recent = recent.slice(0, MAX_RECENT_ITEMS);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SERVICES, JSON.stringify(recent));
  } catch (error) {
    console.error('Error adding recent service:', error);
  }
}

/**
 * Lấy danh sách dịch vụ vừa xem
 */
export async function getRecentServices(limit: number = 10): Promise<RecentService[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SERVICES);
    const recent: RecentService[] = stored ? JSON.parse(stored) : [];
    return recent.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent services:', error);
    return [];
  }
}

/**
 * Thêm item vào danh sách quan tâm
 */
export async function addInterest(
  item: Omit<InterestItem, 'interactedAt' | 'interactions'>
): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.INTERESTS);
    let interests: InterestItem[] = stored ? JSON.parse(stored) : [];

    // Tìm item đã tồn tại
    const existingIndex = interests.findIndex(i => i.id === item.id && i.type === item.type);

    if (existingIndex >= 0) {
      // Tăng số lần tương tác
      interests[existingIndex].interactions += 1;
      interests[existingIndex].interactedAt = new Date().toISOString();
    } else {
      // Thêm mới
      interests.push({
        ...item,
        interactedAt: new Date().toISOString(),
        interactions: 1,
      });
    }

    // Sắp xếp theo interactions và thời gian
    interests.sort((a, b) => {
      if (b.interactions !== a.interactions) {
        return b.interactions - a.interactions;
      }
      return new Date(b.interactedAt).getTime() - new Date(a.interactedAt).getTime();
    });

    // Giới hạn số lượng
    if (interests.length > MAX_INTEREST_ITEMS) {
      interests = interests.slice(0, MAX_INTEREST_ITEMS);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.INTERESTS, JSON.stringify(interests));
  } catch (error) {
    console.error('Error adding interest:', error);
  }
}

/**
 * Lấy danh sách quan tâm (gợi ý)
 */
export async function getInterests(limit: number = 10): Promise<InterestItem[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.INTERESTS);
    const interests: InterestItem[] = stored ? JSON.parse(stored) : [];
    return interests.slice(0, limit);
  } catch (error) {
    console.error('Error getting interests:', error);
    return [];
  }
}

/**
 * Xóa lịch sử xem sản phẩm
 */
export async function clearRecentProducts(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_PRODUCTS);
}

/**
 * Xóa lịch sử xem dịch vụ
 */
export async function clearRecentServices(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SERVICES);
}

/**
 * Xóa danh sách quan tâm
 */
export async function clearInterests(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.INTERESTS);
}

/**
 * Xóa toàn bộ lịch sử
 */
export async function clearAllActivity(): Promise<void> {
  await Promise.all([
    clearRecentProducts(),
    clearRecentServices(),
    clearInterests(),
  ]);
}
