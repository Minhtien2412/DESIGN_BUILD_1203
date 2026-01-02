/**
 * Construction Diary Service - Mock Data
 * Mock data for construction diary until backend ready
 */

export interface DiaryEntry {
  id: string;
  projectId: string;
  date: string; // ISO date
  weather: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'windy';
    temperature?: number; // Celsius
    notes?: string;
  };
  workforce: {
    laborers: number;
    engineers: number;
    contractors: number;
    total: number;
  };
  workCompleted: {
    description: string;
    location?: string;
    progress?: number; // 0-100
  }[];
  materials: {
    name: string;
    quantity: number;
    unit: string;
    delivered?: boolean;
  }[];
  equipment: {
    name: string;
    hours: number;
    issues?: string;
  }[];
  incidents: {
    type: 'safety' | 'quality' | 'delay' | 'other';
    description: string;
    severity: 'low' | 'medium' | 'high';
    resolved: boolean;
  }[];
  photos: {
    id: string;
    uri: string;
    caption?: string;
    location?: string;
  }[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

// Mock data generator
export const MOCK_DIARY_ENTRIES: DiaryEntry[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const dayNum = 30 - i;

  return {
    id: `diary-${dayNum}`,
    projectId: 'project-1',
    date: date.toISOString().split('T')[0],
    weather: {
      condition: ['sunny', 'cloudy', 'rainy', 'windy'][Math.floor(Math.random() * 4)] as any,
      temperature: Math.floor(Math.random() * 10) + 25,
      notes: i % 5 === 0 ? 'Mưa nhẹ buổi chiều' : undefined,
    },
    workforce: {
      laborers: Math.floor(Math.random() * 20) + 30,
      engineers: Math.floor(Math.random() * 3) + 2,
      contractors: Math.floor(Math.random() * 5) + 3,
      total: 0,
    },
    workCompleted: [
      {
        description: `Hoàn thành đổ bê tông tầng ${Math.floor(dayNum / 5) + 1}`,
        location: `Khu A - Tầng ${Math.floor(dayNum / 5) + 1}`,
        progress: Math.min(100, dayNum * 3),
      },
      {
        description: 'Lắp đặt cốt thép cột',
        location: 'Khu B',
        progress: Math.min(100, dayNum * 2.5),
      },
    ],
    materials: [
      {
        name: 'Bê tông M250',
        quantity: Math.floor(Math.random() * 50) + 20,
        unit: 'm³',
        delivered: true,
      },
      {
        name: 'Thép D16',
        quantity: Math.floor(Math.random() * 500) + 200,
        unit: 'kg',
        delivered: i % 3 !== 0,
      },
    ],
    equipment: [
      {
        name: 'Máy trộn bê tông',
        hours: Math.floor(Math.random() * 6) + 2,
        issues: i % 10 === 0 ? 'Cần bảo dưỡng định kỳ' : undefined,
      },
      {
        name: 'Cần trục tháp',
        hours: Math.floor(Math.random() * 8) + 4,
      },
    ],
    incidents: i % 7 === 0 ? [
      {
        type: (['safety', 'quality', 'delay'][Math.floor(Math.random() * 3)] as 'safety' | 'quality' | 'delay'),
        description: 'Phát hiện vết nứt nhỏ trên cột C3',
        severity: 'medium' as const,
        resolved: i % 14 !== 0,
      },
    ] : [],
    photos: Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, j) => ({
      id: `photo-${dayNum}-${j}`,
      uri: `https://picsum.photos/400/300?random=${dayNum * 10 + j}`,
      caption: `Tiến độ thi công ngày ${date.toLocaleDateString('vi-VN')}`,
      location: `Khu ${['A', 'B', 'C'][j % 3]}`,
    })),
    notes: i % 4 === 0 ? `Ghi chú quan trọng: ${['Cần tăng cường giám sát', 'Tiến độ đúng kế hoạch', 'Thời tiết thuận lợi'][i % 3]}` : undefined,
    createdBy: 'engineer-1',
    createdAt: date.toISOString(),
    updatedAt: i % 5 === 0 ? new Date(date.getTime() + 3600000).toISOString() : undefined,
  };
}).map(entry => ({
  ...entry,
  workforce: {
    ...entry.workforce,
    total: entry.workforce.laborers + entry.workforce.engineers + entry.workforce.contractors,
  },
}));

// Mock API functions
export class DiaryService {
  private static entries = [...MOCK_DIARY_ENTRIES];

  static async getEntriesByProject(projectId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DiaryEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

    let filtered = this.entries.filter(e => e.projectId === projectId);

    if (filters?.startDate) {
      filtered = filtered.filter(e => e.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      filtered = filtered.filter(e => e.date <= filters.endDate!);
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }

  static async getEntry(id: string): Promise<DiaryEntry | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.entries.find(e => e.id === id) || null;
  }

  static async createEntry(data: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiaryEntry> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const newEntry: DiaryEntry = {
      ...data,
      id: `diary-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.entries.unshift(newEntry);
    return newEntry;
  }

  static async updateEntry(id: string, data: Partial<DiaryEntry>): Promise<DiaryEntry> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.entries.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Entry not found');

    this.entries[index] = {
      ...this.entries[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return this.entries[index];
  }

  static async deleteEntry(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.entries.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Entry not found');

    this.entries.splice(index, 1);
  }

  static async getStats(projectId: string, period?: 'week' | 'month' | 'all'): Promise<{
    totalEntries: number;
    totalWorkforce: number;
    avgDailyWorkforce: number;
    totalIncidents: number;
    resolvedIncidents: number;
    totalPhotos: number;
    weatherBreakdown: Record<string, number>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const entries = await this.getEntriesByProject(projectId);
    
    // Filter by period
    let filtered = entries;
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = entries.filter(e => new Date(e.date) >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = entries.filter(e => new Date(e.date) >= monthAgo);
    }

    const totalWorkforce = filtered.reduce((sum, e) => sum + e.workforce.total, 0);
    const totalIncidents = filtered.reduce((sum, e) => sum + e.incidents.length, 0);
    const resolvedIncidents = filtered.reduce(
      (sum, e) => sum + e.incidents.filter(i => i.resolved).length,
      0
    );
    const totalPhotos = filtered.reduce((sum, e) => sum + e.photos.length, 0);

    const weatherBreakdown = filtered.reduce((acc, e) => {
      acc[e.weather.condition] = (acc[e.weather.condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEntries: filtered.length,
      totalWorkforce,
      avgDailyWorkforce: filtered.length > 0 ? Math.round(totalWorkforce / filtered.length) : 0,
      totalIncidents,
      resolvedIncidents,
      totalPhotos,
      weatherBreakdown,
    };
  }
}
