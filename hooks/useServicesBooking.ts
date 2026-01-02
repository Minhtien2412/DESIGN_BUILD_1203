/**
 * useServicesBooking Hook
 * 
 * Custom hook for services and booking management:
 * - Browse services
 * - Create bookings
 * - View booking history
 * - Cancel bookings
 * 
 * Backend: https://baotienweb.cloud/api/v1/services
 * Created: Dec 22, 2025
 */

import {
    cancelBooking,
    createBooking,
    formatPrice,
    getBookingStatusColor,
    getBookingStatusText,
    getServiceCategories,
    getServiceDetails,
    getServices,
    getUserBookings,
    type BookingStatus,
    type CreateBookingData,
    type Service,
    type ServiceBooking,
    type ServiceCategory,
    type ServiceDetails,
    type ServiceFilters
} from '@/services/servicesApi';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface UseServicesReturn {
  // Services state
  services: Service[];
  categories: ServiceCategory[];
  currentService: ServiceDetails | null;
  loadingServices: boolean;
  
  // Bookings state
  bookings: ServiceBooking[];
  loadingBookings: boolean;
  
  // Common
  error: string | null;
  
  // Actions
  loadServices: (filters?: ServiceFilters) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadServiceDetails: (id: number) => Promise<void>;
  loadBookings: (status?: BookingStatus) => Promise<void>;
  createServiceBooking: (data: CreateBookingData) => Promise<boolean>;
  cancelServiceBooking: (bookingId: number) => Promise<boolean>;
  
  // Helpers
  formatServicePrice: (price: number) => string;
  getStatusText: (status: BookingStatus) => string;
  getStatusColor: (status: BookingStatus) => string;
}

interface UseServicesPagination {
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export function useServicesBooking(): UseServicesReturn {
  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [currentService, setCurrentService] = useState<ServiceDetails | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesPagination, setServicesPagination] = useState<UseServicesPagination>({
    total: 0,
    page: 1,
    totalPages: 0,
    hasMore: false,
  });
  
  // Bookings state
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  // Common state
  const [error, setError] = useState<string | null>(null);

  /**
   * Load services with filters
   */
  const loadServices = useCallback(async (filters?: ServiceFilters) => {
    setLoadingServices(true);
    setError(null);
    
    try {
      const response = await getServices(filters);
      
      if (response.success) {
        // If loading next page, append to existing
        if (filters?.page && filters.page > 1) {
          setServices(prev => [...prev, ...response.data]);
        } else {
          setServices(response.data);
        }
        
        setServicesPagination({
          total: response.meta.total,
          page: response.meta.page,
          totalPages: response.meta.totalPages,
          hasMore: response.meta.page < response.meta.totalPages,
        });
      }
    } catch (e: any) {
      setError(e.message || 'Không thể tải danh sách dịch vụ');
      console.error('[useServicesBooking] Error loading services:', e);
    } finally {
      setLoadingServices(false);
    }
  }, []);

  /**
   * Load service categories
   */
  const loadCategories = useCallback(async () => {
    try {
      const response = await getServiceCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (e: any) {
      console.error('[useServicesBooking] Error loading categories:', e);
    }
  }, []);

  /**
   * Load service details by ID
   */
  const loadServiceDetails = useCallback(async (id: number) => {
    setLoadingServices(true);
    setError(null);
    
    try {
      const response = await getServiceDetails(id);
      if (response.success) {
        setCurrentService(response.data);
      }
    } catch (e: any) {
      setError(e.message || 'Không thể tải chi tiết dịch vụ');
      console.error('[useServicesBooking] Error loading service details:', e);
    } finally {
      setLoadingServices(false);
    }
  }, []);

  /**
   * Load user's bookings
   */
  const loadBookings = useCallback(async (status?: BookingStatus) => {
    setLoadingBookings(true);
    setError(null);
    
    try {
      const response = await getUserBookings({ status, limit: 50 });
      if (response.success) {
        setBookings(response.data);
      }
    } catch (e: any) {
      setError(e.message || 'Không thể tải lịch sử đặt dịch vụ');
      console.error('[useServicesBooking] Error loading bookings:', e);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  /**
   * Create a new service booking
   */
  const createServiceBooking = useCallback(async (data: CreateBookingData): Promise<boolean> => {
    setLoadingBookings(true);
    setError(null);
    
    try {
      const response = await createBooking(data);
      
      if (response.success) {
        // Add new booking to list
        setBookings(prev => [response.data, ...prev]);
        
        Alert.alert(
          'Đặt dịch vụ thành công',
          `Đơn đặt #${response.data.id} đã được tạo.\nTổng giá: ${formatPrice(response.data.totalPrice || 0)}`,
          [{ text: 'OK' }]
        );
        return true;
      } else {
        Alert.alert('Lỗi', response.message || 'Đặt dịch vụ thất bại');
        return false;
      }
    } catch (e: any) {
      setError(e.message);
      Alert.alert('Lỗi', e.message || 'Đặt dịch vụ thất bại');
      return false;
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  /**
   * Cancel a booking
   */
  const cancelServiceBooking = useCallback(async (bookingId: number): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Xác nhận hủy',
        'Bạn có chắc muốn hủy đơn đặt dịch vụ này?',
        [
          { text: 'Không', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Hủy đơn',
            style: 'destructive',
            onPress: async () => {
              setLoadingBookings(true);
              
              try {
                const response = await cancelBooking(bookingId);
                
                if (response.success) {
                  // Update booking in list
                  setBookings(prev =>
                    prev.map(b =>
                      b.id === bookingId ? { ...b, status: 'CANCELLED' as BookingStatus } : b
                    )
                  );
                  
                  Alert.alert('Thành công', 'Đã hủy đơn đặt dịch vụ');
                  resolve(true);
                } else {
                  Alert.alert('Lỗi', response.message || 'Không thể hủy đơn');
                  resolve(false);
                }
              } catch (e: any) {
                Alert.alert('Lỗi', e.message || 'Không thể hủy đơn');
                resolve(false);
              } finally {
                setLoadingBookings(false);
              }
            },
          },
        ]
      );
    });
  }, []);

  return {
    // Services state
    services,
    categories,
    currentService,
    loadingServices,
    
    // Bookings state
    bookings,
    loadingBookings,
    
    // Common
    error,
    
    // Actions
    loadServices,
    loadCategories,
    loadServiceDetails,
    loadBookings,
    createServiceBooking,
    cancelServiceBooking,
    
    // Helpers
    formatServicePrice: formatPrice,
    getStatusText: getBookingStatusText,
    getStatusColor: getBookingStatusColor,
  };
}

/**
 * Hook for single service detail page
 */
export function useServiceDetail(serviceId: number) {
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadService = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getServiceDetails(serviceId);
      if (response.success) {
        setService(response.data);
      }
    } catch (e: any) {
      setError(e.message || 'Không thể tải chi tiết dịch vụ');
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    if (serviceId) {
      loadService();
    }
  }, [serviceId, loadService]);

  return { service, loading, error, refresh: loadService };
}
