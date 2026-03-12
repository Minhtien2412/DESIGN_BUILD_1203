/**
 * Progress Report Screen
 * Màn hình báo cáo tiến độ thi công dự án
 * @route /(tabs)/progress
 */

import { CONSTRUCTION_TASKS, ProgressDetail, ProgressOverview, Task } from '@/features/progress-report';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ViewMode = 'overview' | 'detail';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ taskId?: string }>();
  
  const [viewMode, setViewMode] = useState<ViewMode>(params.taskId ? 'detail' : 'overview');
  const [selectedTask, setSelectedTask] = useState<Task | null>(
    params.taskId ? CONSTRUCTION_TASKS.find(t => t.id === params.taskId) || null : null
  );

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setViewMode('detail');
  };

  const handleBack = () => {
    if (viewMode === 'detail') {
      setViewMode('overview');
      setSelectedTask(null);
    } else {
      router.back();
    }
  };

  const headerTitle = viewMode === 'overview' 
    ? 'Tiến độ thi công' 
    : selectedTask?.title || 'Chi tiết công việc';

  const headerSubtitle = viewMode === 'overview'
    ? 'Dự án: Biệt thự phố - Q2'
    : `Hạng mục ${selectedTask?.index || ''}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle} numberOfLines={1}>{headerTitle}</Text>
            <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="search" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="notifications" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {viewMode === 'overview' ? (
        <ProgressOverview onTaskPress={handleTaskPress} />
      ) : (
        <ProgressDetail task={selectedTask || undefined} onBack={handleBack} />
      )}

      {/* Hide default header */}
      <Stack.Screen options={{ headerShown: false }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    padding: 8,
  },
});
