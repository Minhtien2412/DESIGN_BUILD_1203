/**
 * useCRMLeads Hook
 * Fetch leads từ Perfex CRM
 * 
 * Features:
 * - Fetch all leads with filters
 * - Lead pipeline management
 * - Convert lead to customer
 * - Support fallback to mock data
 * 
 * @author Auto-generated
 * @updated 2026-01-03
 */

import {
    PerfexLead,
    PerfexLeadsService,
} from '@/services/perfexCRM';
import { useCallback, useEffect, useState } from 'react';

// ==================== TYPES ====================

export interface CRMLead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost' | 'junk';
  assignedTo?: string;
  dateAdded: string;
  lastContact?: string;
  isPublic: boolean;
}

export interface LeadsStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  won: number;
  lost: number;
}

export interface UseCRMLeadsReturn {
  leads: CRMLead[];
  stats: LeadsStats;
  loading: boolean;
  error: string | null;
  dataSource: 'crm' | 'mock';
  refresh: () => Promise<void>;
  createLead: (data: Partial<CRMLead>) => Promise<CRMLead | null>;
  updateLead: (id: string, data: Partial<CRMLead>) => Promise<boolean>;
  convertToCustomer: (id: string) => Promise<string | null>;
}

// ==================== MOCK DATA (Real data structure from Perfex CRM) ====================

/**
 * Dữ liệu mẫu theo cấu trúc thực tế Perfex CRM
 * Customers: Anh Khương Q9, NHÀ XINH, Anh Tiến, Lê Nguyên Thảo
 * Projects: Nhà Anh Khương Q9 (15 tỷ), Biệt Thự 3 Tầng Anh Tiến Q7 (10 tỷ)
 */

const MOCK_LEADS: CRMLead[] = [
  {
    id: '1',
    name: 'Chị Hương Phú Nhuận',
    email: 'huong.pn@email.com',
    phone: '0918765432',
    title: 'Thiết kế nhà phố 4 tầng',
    description: 'Khách hàng quan tâm đến dịch vụ thiết kế nhà phố hiện đại',
    city: 'Hồ Chí Minh',
    source: 'Website nhaxinhdesign.com',
    status: 'qualified',
    dateAdded: '2024-12-28',
    isPublic: false,
  },
  {
    id: '2',
    name: 'Anh Nam Thủ Đức',
    email: 'nam.td@email.com', 
    phone: '0909888777',
    title: 'Thiết kế biệt thự sân vườn',
    description: 'Cần thiết kế biệt thự 500m2 có sân vườn rộng',
    city: 'Hồ Chí Minh',
    source: 'Facebook',
    status: 'new',
    dateAdded: '2024-12-30',
    isPublic: true,
  },
  {
    id: '3',
    name: 'Công ty Đầu tư BĐS Hải Phòng',
    email: 'contact@bdshp.com',
    phone: '0225123456',
    company: 'BĐS Hải Phòng',
    title: 'Dự án khu nghỉ dưỡng resort',
    description: 'Thiết kế khu nghỉ dưỡng 20 căn villa ven biển',
    city: 'Hải Phòng',
    source: 'Giới thiệu từ NHÀ XINH',
    status: 'proposal',
    dateAdded: '2024-12-25',
    lastContact: '2024-12-29',
    isPublic: false,
  },
  {
    id: '4',
    name: 'Anh Bảo Bình Dương',
    email: 'bao.bd@email.com',
    phone: '0974123456',
    title: 'Xây nhà cấp 4 hiện đại',
    description: 'Thiết kế nhà cấp 4 200m2 phong cách tối giản',
    city: 'Bình Dương',
    source: 'Zalo',
    status: 'contacted',
    dateAdded: '2024-12-29',
    isPublic: false,
  },
];

// ==================== HELPERS ====================

// Map lead status based on Perfex status + lost/junk flags
function mapLeadStatus(lead: PerfexLead): CRMLead['status'] {
  if (lead.junk === 1) return 'junk';
  if (lead.lost === 1) return 'lost';
  if (lead.client_id) return 'won'; // Converted to customer
  
  // Map status number (depends on Perfex configuration)
  // Default: 1=New, 2=Contacted, 3=Qualified, 4=Proposal
  switch (lead.status) {
    case 1: return 'new';
    case 2: return 'contacted';
    case 3: return 'qualified';
    case 4: return 'proposal';
    default: return 'new';
  }
}

function mapPerfexLead(lead: PerfexLead): CRMLead {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phonenumber,
    company: lead.company,
    title: lead.title,
    description: lead.description,
    address: lead.address,
    city: lead.city,
    country: lead.country,
    source: String(lead.source), // In real app, map source ID to name
    status: mapLeadStatus(lead),
    assignedTo: String(lead.assigned),
    dateAdded: lead.dateadded,
    lastContact: lead.lastcontact,
    isPublic: lead.is_public === 1,
  };
}

// ==================== HOOK ====================

export function useCRMLeads(options?: {
  status?: number;
  source?: number;
}): UseCRMLeadsReturn {
  const [leads, setLeads] = useState<CRMLead[]>(MOCK_LEADS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'crm' | 'mock'>('mock');

  const calculateStats = useCallback((leadList: CRMLead[]): LeadsStats => {
    return {
      total: leadList.length,
      new: leadList.filter(l => l.status === 'new').length,
      contacted: leadList.filter(l => l.status === 'contacted').length,
      qualified: leadList.filter(l => l.status === 'qualified').length,
      won: leadList.filter(l => l.status === 'won').length,
      lost: leadList.filter(l => l.status === 'lost' || l.status === 'junk').length,
    };
  }, []);

  const [stats, setStats] = useState<LeadsStats>(calculateStats(MOCK_LEADS));

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = { limit: 100 };
      if (options?.status) params.status = options.status;
      if (options?.source) params.source = options.source;

      const response = await PerfexLeadsService.getAll(params);
      
      if (response?.data && response.data.length > 0) {
        const mappedLeads = response.data.map(mapPerfexLead);
        setLeads(mappedLeads);
        setStats(calculateStats(mappedLeads));
        setDataSource('crm');
        console.log('[useCRMLeads] Loaded from CRM:', mappedLeads.length);
      } else {
        setLeads(MOCK_LEADS);
        setStats(calculateStats(MOCK_LEADS));
        setDataSource('mock');
      }
    } catch (err) {
      console.error('[useCRMLeads] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leads');
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  }, [options?.status, options?.source, calculateStats]);

  const createLead = useCallback(async (data: Partial<CRMLead>): Promise<CRMLead | null> => {
    try {
      const perfexData: Partial<PerfexLead> = {
        name: data.name || '',
        email: data.email,
        phonenumber: data.phone,
        company: data.company,
        title: data.title,
        description: data.description,
        address: data.address,
        city: data.city,
        country: data.country,
        source: 1, // Default source - Website
        status: 1, // New
        is_public: data.isPublic ? 1 : 0,
      };

      const result = await PerfexLeadsService.create(perfexData);
      const newLead = mapPerfexLead(result);
      
      setLeads(prev => [newLead, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        new: prev.new + 1,
      }));
      
      return newLead;
    } catch (err) {
      console.error('[useCRMLeads] Create error:', err);
      return null;
    }
  }, []);

  const updateLead = useCallback(async (id: string, data: Partial<CRMLead>): Promise<boolean> => {
    try {
      const statusMap = { new: 1, contacted: 2, qualified: 3, proposal: 4, won: 5, lost: 0, junk: 0 };
      
      const perfexData: Partial<PerfexLead> = {};
      if (data.name) perfexData.name = data.name;
      if (data.email) perfexData.email = data.email;
      if (data.phone) perfexData.phonenumber = data.phone;
      if (data.company) perfexData.company = data.company;
      if (data.title) perfexData.title = data.title;
      if (data.description) perfexData.description = data.description;
      if (data.status && statusMap[data.status]) {
        perfexData.status = statusMap[data.status];
      }
      if (data.status === 'lost') perfexData.lost = 1;
      if (data.status === 'junk') perfexData.junk = 1;

      await PerfexLeadsService.update(id, perfexData);
      
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
      return true;
    } catch (err) {
      console.error('[useCRMLeads] Update error:', err);
      return false;
    }
  }, []);

  const convertToCustomer = useCallback(async (id: string): Promise<string | null> => {
    try {
      const result = await PerfexLeadsService.convertToCustomer(id);
      
      // Update lead status to won
      setLeads(prev => prev.map(l => 
        l.id === id ? { ...l, status: 'won' as const } : l
      ));
      
      setStats(prev => ({
        ...prev,
        won: prev.won + 1,
        qualified: Math.max(0, prev.qualified - 1),
      }));
      
      return result.customer_id;
    } catch (err) {
      console.error('[useCRMLeads] Convert error:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    stats,
    loading,
    error,
    dataSource,
    refresh: fetchLeads,
    createLead,
    updateLead,
    convertToCustomer,
  };
}

export default useCRMLeads;
