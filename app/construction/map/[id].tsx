/**
 * Construction Map - Project Detail Screen
 * Full-screen canvas with task/stage management
 */

import ConstructionMapCanvas from '@/components/construction/ConstructionMapCanvas';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ViewMode = 'map' | 'tasks' | 'stages' | 'both';

export default function ConstructionMapDetailScreen() {
  const params = useLocalSearchParams();
  const projectId = params.id as string;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const handleTaskSelect = (taskId: string) => {
    console.log('[ConstructionMapDetail] Task selected:', taskId);
    setSelectedTaskId(taskId);
    // TODO: Show task detail panel
  };

  const handleStageSelect = (stageId: string) => {
    console.log('[ConstructionMapDetail] Stage selected:', stageId);
    setSelectedStageId(stageId);
    // TODO: Show stage detail panel
  };

  const handleBack = () => {
    router.back();
  };

  const handleExport = () => {
    Alert.alert(
      'Xuất bản đồ',
      'Chọn định dạng xuất',
      [
        { text: 'PDF', onPress: () => console.log('Export PDF') },
        { text: 'PNG', onPress: () => console.log('Export PNG') },
        { text: 'JSON', onPress: () => console.log('Export JSON') },
        { text: 'Hủy', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleShare = () => {
    Alert.alert(
      'Chia sẻ',
      'Chia sẻ bản đồ với team members',
      [
        { text: 'Copy Link', onPress: () => console.log('Copy link') },
        { text: 'Send Email', onPress: () => console.log('Send email') },
        { text: 'Hủy', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const renderTopBar = () => (
    <View style={[styles.topBar, { borderBottomColor: borderColor }]}>
      {/* Left: Back button */}
      <TouchableOpacity style={styles.topBarButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={textColor} />
      </TouchableOpacity>

      {/* Center: Project info */}
      <View style={styles.topBarCenter}>
        <Text style={[styles.topBarTitle, { color: textColor }]} numberOfLines={1}>
          Construction Map
        </Text>
        <Text style={styles.topBarSubtitle} numberOfLines={1}>
          Project: {projectId}
        </Text>
      </View>

      {/* Right: Actions */}
      <View style={styles.topBarActions}>
        <TouchableOpacity style={styles.topBarButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topBarButton} onPress={handleExport}>
          <Ionicons name="download-outline" size={22} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topBarButton} onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-outline" size={22} color={textColor} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderViewModeToggle = () => (
    <View style={styles.viewModeContainer}>
      <TouchableOpacity
        style={[
          styles.viewModeButton,
          viewMode === 'map' && styles.viewModeButtonActive,
        ]}
        onPress={() => setViewMode('map')}
      >
        <Ionicons
          name="map"
          size={18}
          color={viewMode === 'map' ? '#2196F3' : '#666'}
        />
        <Text
          style={[
            styles.viewModeText,
            viewMode === 'map' && styles.viewModeTextActive,
          ]}
        >
          Map
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.viewModeButton,
          viewMode === 'tasks' && styles.viewModeButtonActive,
        ]}
        onPress={() => setViewMode('tasks')}
      >
        <Ionicons
          name="checkbox-outline"
          size={18}
          color={viewMode === 'tasks' ? '#2196F3' : '#666'}
        />
        <Text
          style={[
            styles.viewModeText,
            viewMode === 'tasks' && styles.viewModeTextActive,
          ]}
        >
          Tasks
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.viewModeButton,
          viewMode === 'stages' && styles.viewModeButtonActive,
        ]}
        onPress={() => setViewMode('stages')}
      >
        <Ionicons
          name="layers-outline"
          size={18}
          color={viewMode === 'stages' ? '#2196F3' : '#666'}
        />
        <Text
          style={[
            styles.viewModeText,
            viewMode === 'stages' && styles.viewModeTextActive,
          ]}
        >
          Stages
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.viewModeButton,
          viewMode === 'both' && styles.viewModeButtonActive,
        ]}
        onPress={() => setViewMode('both')}
      >
        <Ionicons
          name="grid-outline"
          size={18}
          color={viewMode === 'both' ? '#2196F3' : '#666'}
        />
        <Text
          style={[
            styles.viewModeText,
            viewMode === 'both' && styles.viewModeTextActive,
          ]}
        >
          Both
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSettings(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Cài đặt bản đồ
            </Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Auto-save setting */}
            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingLabel, { color: textColor }]}>
                  Tự động lưu
                </Text>
                <Text style={styles.settingDescription}>
                  Lưu thay đổi tự động mỗi 3 giây
                </Text>
              </View>
              <Ionicons name="toggle" size={32} color="#2196F3" />
            </View>

            {/* WebSocket setting */}
            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingLabel, { color: textColor }]}>
                  Real-time sync
                </Text>
                <Text style={styles.settingDescription}>
                  Đồng bộ thời gian thực với team
                </Text>
              </View>
              <Ionicons name="toggle" size={32} color="#2196F3" />
            </View>

            {/* Grid setting */}
            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingLabel, { color: textColor }]}>
                  Hiển thị lưới
                </Text>
                <Text style={styles.settingDescription}>
                  Hiển thị lưới hỗ trợ sắp xếp
                </Text>
              </View>
              <Ionicons name="toggle-outline" size={32} color="#999" />
            </View>

            {/* Snap to grid */}
            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingLabel, { color: textColor }]}>
                  Snap to grid
                </Text>
                <Text style={styles.settingDescription}>
                  Tự động căn chỉnh vào lưới
                </Text>
              </View>
              <Ionicons name="toggle-outline" size={32} color="#999" />
            </View>

            {/* Connection status */}
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Trạng thái kết nối</Text>
              <View style={styles.connectionStatus}>
                <View style={styles.connectionItem}>
                  <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.connectionText}>API: Connected</Text>
                </View>
                <View style={styles.connectionItem}>
                  <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.connectionText}>WebSocket: Connected</Text>
                </View>
                <View style={styles.connectionItem}>
                  <View style={[styles.statusDot, { backgroundColor: '#2196F3' }]} />
                  <Text style={styles.connectionText}>3 users online</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={styles.container}>
        {/* Top Bar */}
        {renderTopBar()}

        {/* View Mode Toggle */}
        {renderViewModeToggle()}

        {/* Main Canvas */}
        <View style={styles.canvasWrapper}>
          <ConstructionMapCanvas
            projectId={projectId}
            showControls={true}
            showTaskList={viewMode === 'tasks' || viewMode === 'both'}
            showStageList={viewMode === 'stages' || viewMode === 'both'}
            onTaskSelect={handleTaskSelect}
            onStageSelect={handleStageSelect}
            autoSaveInterval={3000}
          />
        </View>

        {/* Settings Modal */}
        {renderSettingsModal()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  topBarButton: {
    padding: 8,
  },
  topBarCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  topBarSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 4,
  },
  viewModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#f5f5f5',
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  viewModeButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  viewModeTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  canvasWrapper: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
  },
  settingSection: {
    marginTop: 24,
  },
  settingSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  connectionStatus: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionText: {
    fontSize: 13,
    color: '#666',
  },
});
