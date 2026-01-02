/**
 * Quick Test Script - Construction Progress Feature
 * Run this in the app to seed initial data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'villa_progress_state_v1';

const testData = {
  tasks: [
    { id: 'T1', stageId: 'S1', label: 'Chuẩn bị mặt bằng', status: 'done', notes: 'Đã hoàn tất khảo sát và giải phóng mặt bằng' },
    { id: 'T2', stageId: 'S1', label: 'Đào móng – ép cọc', status: 'in_progress', notes: 'Đang tiến hành ép cọc móng' },
    { id: 'T3', stageId: 'S2', label: 'Đổ sàn tầng 1', status: 'in_progress', notes: 'Chuẩn bị đổ bê tông sàn tầng 1' },
    { id: 'T4', stageId: 'S2', label: 'Đổ sàn mái', status: 'pending', notes: '' },
    { id: 'T5', stageId: 'S3', label: 'Xây tường – tô trát', status: 'pending', notes: '' },
    { id: 'T6', stageId: 'S3', label: 'MEP, trần thạch cao', status: 'pending', notes: 'Đợi hoàn thành phần thô' },
    { id: 'T7', stageId: 'S4', label: 'Hoàn thiện nội thất', status: 'pending', notes: '' },
    { id: 'T8', stageId: 'S4', label: 'Vệ sinh & bàn giao', status: 'pending', notes: '' },
  ]
};

// Paste this code into Expo DevTools console or use React Native Debugger

export async function seedTestData() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(testData));
    console.log('✅ Test data seeded successfully!');
    console.log('📊 Progress: ~35%');
    console.log('📝 Tasks: 8 total, 1 done, 2 in progress');
    return true;
  } catch (error) {
    console.error('❌ Failed to seed data:', error);
    return false;
  }
}

export async function clearTestData() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('✅ Test data cleared!');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear data:', error);
    return false;
  }
}

export async function viewCurrentData() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      console.log('📊 Current data:', parsed);
      
      const total = parsed.tasks.length;
      const done = parsed.tasks.filter((t: any) => t.status === 'done').length;
      const inProgress = parsed.tasks.filter((t: any) => t.status === 'in_progress').length;
      const pending = parsed.tasks.filter((t: any) => t.status === 'pending').length;
      
      console.log(`\n📈 Statistics:`);
      console.log(`   Total: ${total} tasks`);
      console.log(`   ✅ Done: ${done}`);
      console.log(`   🔄 In Progress: ${inProgress}`);
      console.log(`   ⏸️  Pending: ${pending}`);
      
      return parsed;
    } else {
      console.log('ℹ️  No data found. Run seedTestData() first.');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to get data:', error);
    return null;
  }
}

// Auto-run on import (comment out if not needed)
// seedTestData();

console.log('🎯 Quick Test Commands:');
console.log('  seedTestData()    - Load sample data');
console.log('  clearTestData()   - Clear all data');
console.log('  viewCurrentData() - View current data');
