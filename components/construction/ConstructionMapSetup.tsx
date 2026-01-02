/**
 * ConstructionMapSetup.tsx
 * Initial setup wizard for Construction Map after project creation/selection
 * 
 * Features:
 * - Welcome screen with project info
 * - Grid size configuration
 * - Initial map size setup
 * - Team member invitation (optional)
 * - Quick tour option
 * - Skip to canvas
 */

import { ProjectData } from '@/types/construction-map';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ConstructionMapSetupProps {
  visible: boolean;
  project: ProjectData;
  onComplete: (config: MapConfig) => void;
  onSkip: () => void;
}

export interface MapConfig {
  gridSize: number;
  mapWidth: number;
  mapHeight: number;
  showGrid: boolean;
  snapToGrid: boolean;
  inviteTeam: boolean;
  teamEmails?: string[];
}

const defaultConfig: MapConfig = {
  gridSize: 20,
  mapWidth: 2000,
  mapHeight: 1500,
  showGrid: true,
  snapToGrid: true,
  inviteTeam: false,
  teamEmails: [],
};

export const ConstructionMapSetup: React.FC<ConstructionMapSetupProps> = ({
  visible,
  project,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<MapConfig>(defaultConfig);
  const [teamEmail, setTeamEmail] = useState('');

  const steps = [
    {
      title: 'Chào Mừng! 🎉',
      description: 'Thiết lập Construction Map cho dự án của bạn',
    },
    {
      title: 'Cấu Hình Lưới',
      description: 'Chọn kích thước lưới và canvas',
    },
    {
      title: 'Mời Thành Viên',
      description: 'Thêm đồng nghiệp vào dự án (tùy chọn)',
    },
    {
      title: 'Hoàn Thành',
      description: 'Sẵn sàng bắt đầu!',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(config);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddTeamMember = () => {
    if (teamEmail.trim() && isValidEmail(teamEmail)) {
      setConfig((prev) => ({
        ...prev,
        teamEmails: [...(prev.teamEmails || []), teamEmail.trim()],
      }));
      setTeamEmail('');
    }
  };

  const handleRemoveTeamMember = (email: string) => {
    setConfig((prev) => ({
      ...prev,
      teamEmails: prev.teamEmails?.filter((e) => e !== email) || [],
    }));
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="map" size={64} color="#3B82F6" />
            </View>
            <Text style={styles.projectName}>{project.projectId}</Text>
            <Text style={styles.projectDescription}>
              {'Dự án xây dựng'}
            </Text>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.featureText}>
                  Kéo thả công việc trực quan
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.featureText}>
                  Theo dõi tiến độ real-time
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.featureText}>
                  Cộng tác nhóm dễ dàng
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.featureText}>
                  Lọc và tìm kiếm thông minh
                </Text>
              </View>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.sectionLabel}>Kích thước lưới (px)</Text>
            <Text style={styles.sectionHint}>
              Công việc sẽ tự động căn chỉnh vào lưới
            </Text>
            <View style={styles.gridSizeOptions}>
              {[10, 20, 30, 40].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.gridSizeOption,
                    config.gridSize === size && styles.gridSizeOptionActive,
                  ]}
                  onPress={() => setConfig((prev) => ({ ...prev, gridSize: size }))}
                >
                  <Text
                    style={[
                      styles.gridSizeText,
                      config.gridSize === size && styles.gridSizeTextActive,
                    ]}
                  >
                    {size}px
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
              Kích thước Canvas
            </Text>
            <Text style={styles.sectionHint}>
              Diện tích làm việc của bạn (có thể zoom)
            </Text>
            <View style={styles.canvasSizeOptions}>
              {[
                { label: 'Nhỏ', width: 1500, height: 1000 },
                { label: 'Trung bình', width: 2000, height: 1500 },
                { label: 'Lớn', width: 3000, height: 2000 },
                { label: 'Rất lớn', width: 4000, height: 3000 },
              ].map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.canvasSizeOption,
                    config.mapWidth === option.width &&
                      styles.canvasSizeOptionActive,
                  ]}
                  onPress={() =>
                    setConfig((prev) => ({
                      ...prev,
                      mapWidth: option.width,
                      mapHeight: option.height,
                    }))
                  }
                >
                  <Text style={styles.canvasSizeLabel}>{option.label}</Text>
                  <Text style={styles.canvasSizeValue}>
                    {option.width} × {option.height}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.toggleSection}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Hiển thị lưới</Text>
                  <Text style={styles.toggleHint}>
                    Hiện đường lưới trên canvas
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    config.showGrid && styles.toggleActive,
                  ]}
                  onPress={() =>
                    setConfig((prev) => ({ ...prev, showGrid: !prev.showGrid }))
                  }
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      config.showGrid && styles.toggleThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Snap-to-grid</Text>
                  <Text style={styles.toggleHint}>
                    Tự động căn chỉnh vào lưới khi kéo thả
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    config.snapToGrid && styles.toggleActive,
                  ]}
                  onPress={() =>
                    setConfig((prev) => ({ ...prev, snapToGrid: !prev.snapToGrid }))
                  }
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      config.snapToGrid && styles.toggleThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.sectionLabel}>Mời thành viên tham gia</Text>
            <Text style={styles.sectionHint}>
              Gửi lời mời qua email (có thể bỏ qua)
            </Text>

            <View style={styles.emailInput}>
              <TextInput
                style={styles.emailTextInput}
                placeholder="Email đồng nghiệp..."
                value={teamEmail}
                onChangeText={setTeamEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  !isValidEmail(teamEmail) && styles.addButtonDisabled,
                ]}
                onPress={handleAddTeamMember}
                disabled={!isValidEmail(teamEmail)}
              >
                <Ionicons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {config.teamEmails && config.teamEmails.length > 0 && (
              <View style={styles.teamList}>
                <Text style={styles.teamListTitle}>
                  Sẽ mời ({config.teamEmails.length}):
                </Text>
                {config.teamEmails.map((email) => (
                  <View key={email} style={styles.teamItem}>
                    <Ionicons name="mail-outline" size={20} color="#3B82F6" />
                    <Text style={styles.teamEmail}>{email}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveTeamMember(email)}
                    >
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Sẵn sàng!</Text>
            <Text style={styles.successDescription}>
              Construction Map của bạn đã được thiết lập
            </Text>

            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Kích thước lưới:</Text>
                <Text style={styles.summaryValue}>{config.gridSize}px</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Canvas:</Text>
                <Text style={styles.summaryValue}>
                  {config.mapWidth} × {config.mapHeight}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Hiển thị lưới:</Text>
                <Text style={styles.summaryValue}>
                  {config.showGrid ? 'Có' : 'Không'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Snap-to-grid:</Text>
                <Text style={styles.summaryValue}>
                  {config.snapToGrid ? 'Có' : 'Không'}
                </Text>
              </View>
              {config.teamEmails && config.teamEmails.length > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Lời mời:</Text>
                  <Text style={styles.summaryValue}>
                    {config.teamEmails.length} người
                  </Text>
                </View>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onSkip}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onSkip}
            style={styles.skipButton}
            disabled={currentStep === steps.length - 1}
          >
            {currentStep < steps.length - 1 && (
              <Text style={styles.skipButtonText}>Bỏ qua</Text>
            )}
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.stepCounter}>
              {currentStep + 1}/{steps.length}
            </Text>
          </View>
          <View style={{ width: 60 }} />
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
          <Text style={styles.stepDescription}>
            {steps[currentStep].description}
          </Text>

          {renderStepContent()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color="#3B82F6" />
              <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextButton, currentStep === 0 && { flex: 1 }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Bắt Đầu' : 'Tiếp Theo'}
            </Text>
            {currentStep < steps.length - 1 && (
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  skipButton: {
    padding: 8,
    minWidth: 60,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerCenter: {
    alignItems: 'center',
  },
  stepCounter: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  progressDotActive: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  stepContent: {
    flex: 1,
  },
  welcomeIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  gridSizeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  gridSizeOption: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  gridSizeOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  gridSizeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  gridSizeTextActive: {
    color: '#3B82F6',
  },
  canvasSizeOptions: {
    gap: 12,
  },
  canvasSizeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  canvasSizeOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  canvasSizeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  canvasSizeValue: {
    fontSize: 13,
    color: '#6B7280',
  },
  toggleSection: {
    marginTop: 24,
    gap: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  toggleHint: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#3B82F6',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  emailInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  emailTextInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    fontSize: 14,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  teamList: {
    gap: 8,
  },
  teamListTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  teamEmail: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  summaryBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});
