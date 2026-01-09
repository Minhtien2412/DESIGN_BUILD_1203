/**
 * Mock budget data for projects
 * Replace with real API data in production
 */

import { BudgetCategory, CostItem } from '@/components/ui/cost-tracker';

export interface ProjectBudget {
  projectId: string;
  totalBudget: number;
  totalSpent: number;
  categories: BudgetCategory[];
  recentTransactions: CostItem[];
}

export const PROJECT_BUDGETS: Record<string, ProjectBudget> = {
  '1': {
    projectId: '1',
    totalBudget: 5000000000, // 5 tỷ VND
    totalSpent: 3250000000, // 3.25 tỷ VND
    categories: [
      {
        id: 'materials',
        name: 'Vật liệu xây dựng',
        budgeted: 2000000000,
        spent: 1650000000,
        color: '#3b82f6',
        icon: 'cube-outline',
      },
      {
        id: 'labor',
        name: 'Nhân công',
        budgeted: 1500000000,
        spent: 980000000,
        color: '#666666',
        icon: 'people-outline',
      },
      {
        id: 'equipment',
        name: 'Thiết bị & Máy móc',
        budgeted: 800000000,
        spent: 420000000,
        color: '#f59e0b',
        icon: 'construct-outline',
      },
      {
        id: 'permits',
        name: 'Giấy phép & Phí',
        budgeted: 400000000,
        spent: 150000000,
        color: '#10b981',
        icon: 'document-text-outline',
      },
      {
        id: 'other',
        name: 'Chi phí khác',
        budgeted: 300000000,
        spent: 50000000,
        color: '#6b7280',
        icon: 'ellipsis-horizontal-outline',
      },
    ],
    recentTransactions: [
      {
        id: 't1',
        description: 'Xi măng Holcim 500 bao',
        amount: 85000000,
        date: '2024-03-15',
        category: 'materials',
        type: 'expense',
        status: 'paid',
      },
      {
        id: 't2',
        description: 'Lương công nhân tháng 3',
        amount: 120000000,
        date: '2024-03-31',
        category: 'labor',
        type: 'expense',
        status: 'paid',
      },
      {
        id: 't3',
        description: 'Thuê cần trục tháng 3',
        amount: 35000000,
        date: '2024-03-25',
        category: 'equipment',
        type: 'expense',
        status: 'paid',
      },
      {
        id: 't4',
        description: 'Sắt thép Hòa Phát 50 tấn',
        amount: 650000000,
        date: '2024-03-20',
        category: 'materials',
        type: 'expense',
        status: 'approved',
      },
      {
        id: 't5',
        description: 'Phí kiểm định chất lượng',
        amount: 15000000,
        date: '2024-03-18',
        category: 'permits',
        type: 'expense',
        status: 'paid',
      },
      {
        id: 't6',
        description: 'Tạm ứng đợt 2 từ chủ đầu tư',
        amount: 1500000000,
        date: '2024-03-10',
        category: 'other',
        type: 'income',
        status: 'paid',
      },
      {
        id: 't7',
        description: 'Gạch ốp lát Đồng Tâm',
        amount: 180000000,
        date: '2024-03-12',
        category: 'materials',
        type: 'expense',
        status: 'pending',
      },
    ],
  },
  '2': {
    projectId: '2',
    totalBudget: 3500000000, // 3.5 tỷ VND
    totalSpent: 1850000000, // 1.85 tỷ VND
    categories: [
      {
        id: 'materials',
        name: 'Vật liệu',
        budgeted: 1400000000,
        spent: 780000000,
        color: '#3b82f6',
        icon: 'cube-outline',
      },
      {
        id: 'labor',
        name: 'Nhân công',
        budgeted: 1000000000,
        spent: 620000000,
        color: '#666666',
        icon: 'people-outline',
      },
      {
        id: 'equipment',
        name: 'Thiết bị',
        budgeted: 600000000,
        spent: 320000000,
        color: '#f59e0b',
        icon: 'construct-outline',
      },
      {
        id: 'permits',
        name: 'Giấy phép',
        budgeted: 300000000,
        spent: 100000000,
        color: '#10b981',
        icon: 'document-text-outline',
      },
      {
        id: 'other',
        name: 'Khác',
        budgeted: 200000000,
        spent: 30000000,
        color: '#6b7280',
        icon: 'ellipsis-horizontal-outline',
      },
    ],
    recentTransactions: [
      {
        id: 't8',
        description: 'Cát xây dựng 100 khối',
        amount: 45000000,
        date: '2024-03-28',
        category: 'materials',
        type: 'expense',
        status: 'paid',
      },
      {
        id: 't9',
        description: 'Lương tháng 3',
        amount: 95000000,
        date: '2024-03-31',
        category: 'labor',
        type: 'expense',
        status: 'approved',
      },
    ],
  },
  '3': {
    projectId: '3',
    totalBudget: 8000000000, // 8 tỷ VND
    totalSpent: 5600000000, // 5.6 tỷ VND
    categories: [
      {
        id: 'materials',
        name: 'Vật liệu',
        budgeted: 3200000000,
        spent: 2400000000,
        color: '#3b82f6',
        icon: 'cube-outline',
      },
      {
        id: 'labor',
        name: 'Nhân công',
        budgeted: 2400000000,
        spent: 1800000000,
        color: '#666666',
        icon: 'people-outline',
      },
      {
        id: 'equipment',
        name: 'Thiết bị',
        budgeted: 1600000000,
        spent: 1100000000,
        color: '#f59e0b',
        icon: 'construct-outline',
      },
      {
        id: 'permits',
        name: 'Giấy phép',
        budgeted: 600000000,
        spent: 250000000,
        color: '#10b981',
        icon: 'document-text-outline',
      },
      {
        id: 'other',
        name: 'Khác',
        budgeted: 200000000,
        spent: 50000000,
        color: '#6b7280',
        icon: 'ellipsis-horizontal-outline',
      },
    ],
    recentTransactions: [
      {
        id: 't10',
        description: 'Xi măng và cát xây',
        amount: 125000000,
        date: '2024-03-29',
        category: 'materials',
        type: 'expense',
        status: 'paid',
      },
    ],
  },
};

export function getProjectBudget(projectId: string): ProjectBudget | undefined {
  return PROJECT_BUDGETS[projectId];
}
