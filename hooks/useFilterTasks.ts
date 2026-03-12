/**
 * useFilterTasks.ts
 * Custom hook for filtering tasks based on multiple criteria
 * 
 * Features:
 * - Apply all filter criteria simultaneously
 * - Filter by status, priority, assignee, date range, search text
 * - Handle overdue and unassigned filters
 * - Memoized filtering for performance
 * - Return filtered count and percentage
 */

import { FilterCriteria } from '@/components/construction/FilterPanel';
import { Task } from '@/types/construction-map';
import { useMemo } from 'react';

interface UseFilterTasksResult {
  filteredTasks: Task[];
  totalCount: number;
  filteredCount: number;
  filterPercentage: number;
  isFiltering: boolean;
}

export const useFilterTasks = (
  tasks: Task[],
  filters: FilterCriteria
): UseFilterTasksResult => {
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by status
    if (filters.statuses.length > 0) {
      result = result.filter((task) => filters.statuses.includes(task.status));
    }

    // Filter by priority
    if (filters.priorities.length > 0) {
      result = result.filter((task) => filters.priorities.includes(task.priority));
    }

    // Filter by assignee
    if (filters.assigneeIds.length > 0) {
      result = result.filter((task) =>
        task.assignedTo ? filters.assigneeIds.includes(task.assignedTo) : false
      );
    }

    // Filter by start date range
    if (filters.startDateFrom || filters.startDateTo) {
      result = result.filter((task) => {
        if (!task.startDate) return false;
        const taskStartDate = new Date(task.startDate);
        
        if (filters.startDateFrom && taskStartDate < filters.startDateFrom) {
          return false;
        }
        if (filters.startDateTo && taskStartDate > filters.startDateTo) {
          return false;
        }
        return true;
      });
    }

    // Filter by end date range
    if (filters.endDateFrom || filters.endDateTo) {
      result = result.filter((task) => {
        if (!task.endDate) return false;
        const taskEndDate = new Date(task.endDate);
        
        if (filters.endDateFrom && taskEndDate < filters.endDateFrom) {
          return false;
        }
        if (filters.endDateTo && taskEndDate > filters.endDateTo) {
          return false;
        }
        return true;
      });
    }

    // Filter by search text (name and description)
    if (filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter((task) => {
        const nameMatch = task.name.toLowerCase().includes(searchLower);
        const descMatch = task.description?.toLowerCase().includes(searchLower);
        return nameMatch || descMatch;
      });
    }

    // Filter only overdue tasks
    if (filters.onlyOverdue) {
      const now = new Date();
      result = result.filter((task) => {
        if (!task.endDate || task.status === 'completed') return false;
        return new Date(task.endDate) < now;
      });
    }

    // Filter only unassigned tasks
    if (filters.onlyUnassigned) {
      result = result.filter((task) => !task.assignedTo);
    }

    return result;
  }, [tasks, filters]);

  const totalCount = tasks.length;
  const filteredCount = filteredTasks.length;
  const filterPercentage = totalCount > 0 ? (filteredCount / totalCount) * 100 : 0;

  // Check if any filter is active
  const isFiltering =
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assigneeIds.length > 0 ||
    !!filters.startDateFrom ||
    !!filters.startDateTo ||
    !!filters.endDateFrom ||
    !!filters.endDateTo ||
    filters.searchText.trim().length > 0 ||
    filters.onlyOverdue ||
    filters.onlyUnassigned;

  return {
    filteredTasks,
    totalCount,
    filteredCount,
    filterPercentage,
    isFiltering,
  };
};

/**
 * Helper function to check if a task matches specific criteria
 * Useful for real-time filtering during typing or individual checks
 */
export const matchesFilter = (
  task: Task,
  filters: FilterCriteria
): boolean => {
  // Status check
  if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) {
    return false;
  }

  // Priority check
  if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
    return false;
  }

  // Assignee check
  if (filters.assigneeIds.length > 0) {
    if (!task.assignedTo || !filters.assigneeIds.includes(task.assignedTo)) {
      return false;
    }
  }

  // Start date range check
  if (filters.startDateFrom || filters.startDateTo) {
    if (!task.startDate) return false;
    const taskStartDate = new Date(task.startDate);
    
    if (filters.startDateFrom && taskStartDate < filters.startDateFrom) {
      return false;
    }
    if (filters.startDateTo && taskStartDate > filters.startDateTo) {
      return false;
    }
  }

  // End date range check
  if (filters.endDateFrom || filters.endDateTo) {
    if (!task.endDate) return false;
    const taskEndDate = new Date(task.endDate);
    
    if (filters.endDateFrom && taskEndDate < filters.endDateFrom) {
      return false;
    }
    if (filters.endDateTo && taskEndDate > filters.endDateTo) {
      return false;
    }
  }

  // Search text check
  if (filters.searchText.trim()) {
    const searchLower = filters.searchText.toLowerCase();
    const nameMatch = task.name.toLowerCase().includes(searchLower);
    const descMatch = task.description?.toLowerCase().includes(searchLower);
    if (!nameMatch && !descMatch) {
      return false;
    }
  }

  // Overdue check
  if (filters.onlyOverdue) {
    if (!task.endDate || task.status === 'completed') return false;
    if (new Date(task.endDate) >= new Date()) return false;
  }

  // Unassigned check
  if (filters.onlyUnassigned && task.assignedTo) {
    return false;
  }

  return true;
};

/**
 * Get filter summary text for display
 */
export const getFilterSummary = (filters: FilterCriteria): string => {
  const parts: string[] = [];

  if (filters.statuses.length > 0) {
    parts.push(`${filters.statuses.length} trạng thái`);
  }
  if (filters.priorities.length > 0) {
    parts.push(`${filters.priorities.length} mức ưu tiên`);
  }
  if (filters.assigneeIds.length > 0) {
    parts.push(`${filters.assigneeIds.length} người thực hiện`);
  }
  if (filters.startDateFrom || filters.startDateTo) {
    parts.push('ngày bắt đầu');
  }
  if (filters.endDateFrom || filters.endDateTo) {
    parts.push('ngày kết thúc');
  }
  if (filters.searchText.trim()) {
    parts.push(`"${filters.searchText}"`);
  }
  if (filters.onlyOverdue) {
    parts.push('quá hạn');
  }
  if (filters.onlyUnassigned) {
    parts.push('chưa giao');
  }

  return parts.length > 0 ? parts.join(', ') : 'Không có bộ lọc';
};
