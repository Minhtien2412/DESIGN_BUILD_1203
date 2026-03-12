import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'villa_progress_state_v1';

export interface Task {
  id: string;
  stageId: string;
  label: string;
  status: 'pending' | 'in_progress' | 'done' | 'late';
  notes: string;
}

interface ProgressData {
  tasks: Task[];
}

const statusProgressMap = {
  pending: 0,
  in_progress: 0.5,
  done: 1,
  late: 0.3,
};

/**
 * Hook để quản lý và theo dõi tiến độ thi công
 * Tự động tính toán % hoàn thành dựa trên trạng thái các task
 */
export function useConstructionProgress() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: ProgressData = JSON.parse(data);
        setTasks(parsed.tasks || []);
      }
    } catch (error) {
      console.warn('Failed to load construction progress:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  
  // Tính progress dựa trên trọng số của từng status
  const progress = totalTasks > 0
    ? tasks.reduce((acc, task) => acc + statusProgressMap[task.status], 0) / totalTasks
    : 0;

  const progressPercent = Math.round(progress * 100);

  return {
    tasks,
    loading,
    totalTasks,
    completedTasks,
    progress: progressPercent,
    refresh: loadProgress,
  };
}
