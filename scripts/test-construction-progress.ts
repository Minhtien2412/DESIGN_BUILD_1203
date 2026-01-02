// Test script to verify Construction Progress functionality
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'villa_progress_state_v1';

const testData = {
  tasks: [
    { id: 'T1', stageId: 'S1', label: 'Chuẩn bị mặt bằng', status: 'done', notes: '' },
    { id: 'T2', stageId: 'S1', label: 'Đào móng – ép cọc', status: 'in_progress', notes: '' },
    { id: 'T3', stageId: 'S2', label: 'Đổ sàn tầng 1', status: 'in_progress', notes: '' },
    { id: 'T4', stageId: 'S2', label: 'Đổ sàn mái', status: 'pending', notes: '' },
    { id: 'T5', stageId: 'S3', label: 'Xây tường – tô trát', status: 'pending', notes: '' },
    { id: 'T6', stageId: 'S3', label: 'MEP, trần thạch cao', status: 'pending', notes: '' },
    { id: 'T7', stageId: 'S4', label: 'Hoàn thiện nội thất', status: 'pending', notes: '' },
    { id: 'T8', stageId: 'S4', label: 'Vệ sinh & bàn giao', status: 'pending', notes: '' },
  ]
};

// Seed default data
export async function seedConstructionProgress() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(testData));
    console.log('✅ Seeded construction progress data');
    return true;
  } catch (error) {
    console.error('❌ Failed to seed data:', error);
    return false;
  }
}

// Clear all data
export async function clearConstructionProgress() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('✅ Cleared construction progress data');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear data:', error);
    return false;
  }
}

// Get current data
export async function getConstructionProgress() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      console.log('📊 Current progress:', parsed);
      return parsed;
    }
    console.log('📊 No data found');
    return null;
  } catch (error) {
    console.error('❌ Failed to get data:', error);
    return null;
  }
}

// Calculate stats
export function calculateStats(tasks: any[]) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const late = tasks.filter(t => t.status === 'late').length;

  const statusProgressMap: Record<string, number> = {
    pending: 0,
    in_progress: 0.5,
    done: 1,
    late: 0.3,
  };

  const progress = tasks.reduce((acc, t) => acc + (statusProgressMap[t.status] || 0), 0) / total;

  return {
    total,
    completed,
    inProgress,
    pending,
    late,
    progress: Math.round(progress * 100),
  };
}

// Usage in React Native:
/*
import { seedConstructionProgress, getConstructionProgress } from './test-construction-progress';

// In your component or App.tsx
useEffect(() => {
  seedConstructionProgress(); // Run once to init data
}, []);

// Check data
const data = await getConstructionProgress();
console.log(calculateStats(data.tasks));
*/
