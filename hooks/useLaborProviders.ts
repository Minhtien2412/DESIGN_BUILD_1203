/**
 * useLaborProviders Hook
 * Custom hook for fetching and managing labor providers data
 */

import { LaborProvider, LaborQuery, laborService } from '@/services/api/labor.service';
import { useCallback, useEffect, useState } from 'react';

// Mock data fallback
const MOCK_PROVIDERS: Record<string, LaborProvider[]> = {
  coffa: [
    {
      id: '1',
      name: 'Đội Coffa Minh Khôi',
      type: 'coffa',
      avatar: 'https://i.pravatar.cc/150?img=15',
      coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
      phone: '090 555 6666',
      email: 'coffaminhkhoi@gmail.com',
      address: '123 Nguyễn Văn Linh, Q.7',
      city: 'TP.HCM',
      rating: 4.9,
      reviewCount: 176,
      projectCount: 289,
      yearExperience: 18,
      priceRange: { min: 550000, max: 120000, unit: 'ngày' },
      description: 'Đội Coffa Minh Khôi với 18 năm kinh nghiệm trong lĩnh vực ván khuôn xây dựng.',
      services: ['Cột', 'Dầm', 'Sàn', 'Móng'],
      certifications: ['Chứng chỉ ATLĐ', 'Bảo hiểm công trình'],
      gallery: [],
      availability: 'available',
      verified: true,
      featured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Coffa Chuyên Nghiệp Hà Thành',
      type: 'coffa',
      avatar: 'https://i.pravatar.cc/150?img=34',
      phone: '091 666 7777',
      email: 'coffahathanh@gmail.com',
      address: '456 Nguyễn Trãi, Thanh Xuân',
      city: 'Hà Nội',
      rating: 4.8,
      reviewCount: 154,
      projectCount: 234,
      yearExperience: 15,
      priceRange: { min: 520000, max: 110000, unit: 'ngày' },
      description: 'Đội coffa chuyên nghiệp tại Hà Nội.',
      services: ['Cột', 'Dầm', 'Tường', 'Cầu thang'],
      availability: 'available',
      verified: true,
      featured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  xay: [
    {
      id: '3',
      name: 'Đội Thợ Xây Tâm An',
      type: 'xay',
      avatar: 'https://i.pravatar.cc/150?img=20',
      phone: '090 111 2222',
      email: 'thoxaytaman@gmail.com',
      address: '789 Lê Văn Việt, Q.9',
      city: 'TP.HCM',
      rating: 4.7,
      reviewCount: 142,
      projectCount: 198,
      yearExperience: 12,
      priceRange: { min: 450000, max: 500000, unit: 'ngày' },
      description: 'Đội thợ xây chuyên nghiệp, tận tâm.',
      services: ['Xây tường', 'Trát tường', 'Xây móng', 'Xây cột'],
      availability: 'available',
      verified: true,
      featured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  'dien-nuoc': [
    {
      id: '4',
      name: 'Điện Nước Hoàng Gia',
      type: 'dien-nuoc',
      avatar: 'https://i.pravatar.cc/150?img=25',
      phone: '090 333 4444',
      email: 'diennuochoanggia@gmail.com',
      address: '321 Điện Biên Phủ, Q.3',
      city: 'TP.HCM',
      rating: 4.8,
      reviewCount: 203,
      projectCount: 312,
      yearExperience: 20,
      priceRange: { min: 400000, max: 600000, unit: 'ngày' },
      description: 'Chuyên thi công điện nước dân dụng và công nghiệp.',
      services: ['Lắp điện', 'Lắp nước', 'Sửa chữa', 'Bảo trì'],
      availability: 'available',
      verified: true,
      featured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  'be-tong': [
    {
      id: '5',
      name: 'Bê Tông Tươi Sài Gòn',
      type: 'be-tong',
      avatar: 'https://i.pravatar.cc/150?img=30',
      phone: '090 555 6666',
      email: 'betongtuoisaigon@gmail.com',
      address: '555 Quốc lộ 1A, Q.12',
      city: 'TP.HCM',
      rating: 4.9,
      reviewCount: 287,
      projectCount: 456,
      yearExperience: 25,
      priceRange: { min: 1200000, max: 1500000, unit: 'm³' },
      description: 'Cung cấp bê tông tươi các loại.',
      services: ['Bê tông móng', 'Bê tông cột', 'Bê tông sàn', 'Bê tông đường'],
      availability: 'available',
      verified: true,
      featured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  'dao-dat': [
    {
      id: '6',
      name: 'Đào Đất Miền Nam',
      type: 'dao-dat',
      avatar: 'https://i.pravatar.cc/150?img=35',
      phone: '090 777 8888',
      email: 'daodatmiennam@gmail.com',
      address: '888 Xa lộ Hà Nội, Q.9',
      city: 'TP.HCM',
      rating: 4.6,
      reviewCount: 156,
      projectCount: 234,
      yearExperience: 15,
      priceRange: { min: 150000, max: 200000, unit: 'm³' },
      description: 'Dịch vụ đào đất, san lấp mặt bằng.',
      services: ['Đào móng', 'San lấp', 'Vận chuyển đất', 'Đầm nền'],
      availability: 'available',
      verified: true,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  'vat-lieu': [
    {
      id: '7',
      name: 'Vật Liệu Xây Dựng Phú Mỹ',
      type: 'vat-lieu',
      avatar: 'https://i.pravatar.cc/150?img=40',
      phone: '090 999 0000',
      email: 'vatlieuphumy@gmail.com',
      address: '999 Nguyễn Hữu Thọ, Q.7',
      city: 'TP.HCM',
      rating: 4.7,
      reviewCount: 312,
      projectCount: 567,
      yearExperience: 18,
      priceRange: { min: 0, max: 0, unit: 'giá sỉ' },
      description: 'Cung cấp vật liệu xây dựng các loại.',
      services: ['Cát', 'Đá', 'Xi măng', 'Sắt thép', 'Gạch'],
      availability: 'available',
      verified: true,
      featured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  'nhan-cong': [
    {
      id: '8',
      name: 'Nhân Công Xây Dựng 24h',
      type: 'nhan-cong',
      avatar: 'https://i.pravatar.cc/150?img=45',
      phone: '090 123 4567',
      email: 'nhancong24h@gmail.com',
      address: '123 Cách Mạng Tháng 8, Q.3',
      city: 'TP.HCM',
      rating: 4.5,
      reviewCount: 189,
      projectCount: 345,
      yearExperience: 10,
      priceRange: { min: 350000, max: 450000, unit: 'ngày' },
      description: 'Cung cấp nhân công xây dựng các loại.',
      services: ['Phụ hồ', 'Dọn dẹp', 'Vận chuyển', 'Hỗ trợ'],
      availability: 'available',
      verified: true,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  'ep-coc': [
    {
      id: '9',
      name: 'Ép Cọc Bê Tông Sài Gòn',
      type: 'ep-coc',
      avatar: 'https://i.pravatar.cc/150?img=50',
      phone: '090 234 5678',
      email: 'epcocsaigon@gmail.com',
      address: '456 Phạm Văn Đồng, Thủ Đức',
      city: 'TP.HCM',
      rating: 4.8,
      reviewCount: 234,
      projectCount: 456,
      yearExperience: 20,
      priceRange: { min: 80000, max: 120000, unit: 'm dài' },
      description: 'Chuyên ép cọc bê tông các loại.',
      services: ['Ép cọc vuông', 'Ép cọc tròn', 'Ép cọc ly tâm', 'Khoan nhồi'],
      availability: 'available',
      verified: true,
      featured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

export interface UseLaborProvidersOptions {
  type?: LaborProvider['type'];
  autoFetch?: boolean;
}

export interface UseLaborProvidersReturn {
  providers: LaborProvider[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  fetchProviders: (query?: LaborQuery) => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  searchProviders: (keyword: string) => Promise<void>;
}

export function useLaborProviders(options: UseLaborProvidersOptions = {}): UseLaborProvidersReturn {
  const { type, autoFetch = true } = options;

  const [providers, setProviders] = useState<LaborProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProviders = useCallback(async (query?: LaborQuery) => {
    try {
      setError(null);
      const response = await laborService.getProviders({ ...query, type });
      setProviders(response.data);
      setTotalCount(response.meta.total);
      setCurrentPage(response.meta.page);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      console.log('API error, using mock data:', err);
      // Fallback to mock data
      const mockData = type ? MOCK_PROVIDERS[type] || [] : Object.values(MOCK_PROVIDERS).flat();
      setProviders(mockData);
      setTotalCount(mockData.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [type]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchProviders({ page: 1 });
  }, [fetchProviders]);

  const loadMore = useCallback(async () => {
    if (currentPage >= totalPages || loading) return;
    
    const nextPage = currentPage + 1;
    try {
      const response = await laborService.getProviders({ type, page: nextPage });
      setProviders(prev => [...prev, ...response.data]);
      setCurrentPage(nextPage);
    } catch (err) {
      console.log('Load more error:', err);
    }
  }, [currentPage, totalPages, loading, type]);

  const searchProviders = useCallback(async (keyword: string) => {
    setLoading(true);
    try {
      const response = await laborService.searchProviders(keyword, type);
      setProviders(response.data);
      setTotalCount(response.meta.total);
    } catch (err) {
      console.log('Search error, filtering mock data:', err);
      const mockData = type ? MOCK_PROVIDERS[type] || [] : Object.values(MOCK_PROVIDERS).flat();
      const filtered = mockData.filter(p => 
        p.name.toLowerCase().includes(keyword.toLowerCase()) ||
        p.address.toLowerCase().includes(keyword.toLowerCase())
      );
      setProviders(filtered);
      setTotalCount(filtered.length);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    if (autoFetch) {
      fetchProviders();
    }
  }, [autoFetch, fetchProviders]);

  return {
    providers,
    loading,
    refreshing,
    error,
    totalCount,
    currentPage,
    totalPages,
    fetchProviders,
    refresh,
    loadMore,
    searchProviders,
  };
}

export default useLaborProviders;
