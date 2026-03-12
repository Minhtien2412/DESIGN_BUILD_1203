import { Container } from '@/components/ui/container';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Project {
  id: number;
  name: string;
  currentPhase: string;
  progress: number;
}

interface PredictionResult {
  estimatedCompletionDate: string;
  daysRemaining: number;
  confidenceLevel: number;
  riskFactors: string[];
  recommendations: string[];
  milestones: {
    name: string;
    expectedDate: string;
    status: 'completed' | 'in-progress' | 'upcoming';
  }[];
}

export default function ProgressPredictionScreen() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  // Mock projects list
  const projects: Project[] = [
    { id: 1, name: 'Tòa nhà Sunrise Tower', currentPhase: 'Xây thô', progress: 45 },
    { id: 2, name: 'Biệt thự Phú Mỹ Hưng', currentPhase: 'Hoàn thiện', progress: 78 },
    { id: 3, name: 'Chung cư The Manor', currentPhase: 'Móng', progress: 15 },
    { id: 4, name: 'Nhà phố Quận 2', currentPhase: 'Lắp đặt M&E', progress: 62 },
  ];

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    setPrediction(null);
  };

  const runPrediction = async () => {
    if (!selectedProject) return;

    setPredicting(true);
    try {
      // Simulate API call - in production, this would call aiService
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock prediction result
      const mockPrediction: PredictionResult = {
        estimatedCompletionDate: '2025-06-15',
        daysRemaining: 120,
        confidenceLevel: 85,
        riskFactors: [
          'Thời tiết mưa nhiều trong tháng 3-4',
          'Thiếu nhân công thợ hàn chuyên nghiệp',
          'Vật liệu xi măng có thể tăng giá',
        ],
        recommendations: [
          'Tăng cường nhân sự cho giai đoạn hoàn thiện',
          'Đặt hàng vật liệu trước để tránh biến động giá',
          'Chuẩn bị phương án thi công khi mưa',
          'Kiểm tra chất lượng định kỳ 2 tuần/lần',
        ],
        milestones: [
          { name: 'Hoàn thành móng', expectedDate: '2025-02-20', status: 'completed' },
          { name: 'Hoàn thành xây thô', expectedDate: '2025-04-10', status: 'in-progress' },
          { name: 'Hoàn thành M&E', expectedDate: '2025-05-15', status: 'upcoming' },
          { name: 'Hoàn thiện nội thất', expectedDate: '2025-06-10', status: 'upcoming' },
          { name: 'Bàn giao', expectedDate: '2025-06-15', status: 'upcoming' },
        ],
      };
      
      setPrediction(mockPrediction);
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Có lỗi xảy ra khi dự đoán tiến độ');
    } finally {
      setPredicting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#0D9488';
      case 'in-progress': return '#0D9488';
      case 'upcoming': return '#94A3B8';
      default: return '#94A3B8';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in-progress': return 'Đang thực hiện';
      case 'upcoming': return 'Sắp tới';
      default: return status;
    }
  };

  return (
    <Container fullWidth>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dự đoán tiến độ</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Description */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="analytics" size={24} color={Colors.light.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>AI Progress Prediction</Text>
            <Text style={styles.infoDesc}>
              Sử dụng AI để phân tích dữ liệu tiến độ, thời tiết, nguồn lực và đưa ra dự đoán 
              thời gian hoàn thành công trình với độ chính xác cao.
            </Text>
          </View>
        </View>

        {/* Project Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn dự án</Text>
          <View style={styles.projectList}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[
                  styles.projectCard,
                  selectedProject?.id === project.id && styles.projectCardSelected,
                ]}
                onPress={() => selectProject(project)}
              >
                <View style={styles.projectHeader}>
                  <Text style={[
                    styles.projectName,
                    selectedProject?.id === project.id && styles.projectNameSelected,
                  ]}>
                    {project.name}
                  </Text>
                  {selectedProject?.id === project.id && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.light.primary} />
                  )}
                </View>
                <Text style={styles.projectPhase}>{project.currentPhase}</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{project.progress}%</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Predict Button */}
        {selectedProject && (
          <TouchableOpacity
            style={[styles.predictButton, predicting && styles.predictButtonDisabled]}
            onPress={runPrediction}
            disabled={predicting}
          >
            {predicting ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.predictButtonText}>Đang phân tích...</Text>
              </>
            ) : (
              <>
                <Ionicons name="flash" size={20} color="#fff" />
                <Text style={styles.predictButtonText}>Dự đoán tiến độ</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Prediction Results */}
        {prediction && (
          <View style={styles.resultSection}>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Ngày hoàn thành dự kiến</Text>
                  <Text style={styles.summaryValue}>
                    {new Date(prediction.estimatedCompletionDate).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Còn lại</Text>
                  <Text style={styles.summaryValue}>{prediction.daysRemaining} ngày</Text>
                </View>
              </View>
              <View style={styles.confidenceRow}>
                <Text style={styles.confidenceLabel}>Độ tin cậy</Text>
                <View style={styles.confidenceBar}>
                  <View style={[styles.confidenceFill, { width: `${prediction.confidenceLevel}%` }]} />
                </View>
                <Text style={styles.confidenceValue}>{prediction.confidenceLevel}%</Text>
              </View>
            </View>

            {/* Milestones */}
            <View style={styles.milestonesCard}>
              <Text style={styles.cardTitle}>Các mốc quan trọng</Text>
              {prediction.milestones.map((milestone, index) => (
                <View key={index} style={styles.milestoneItem}>
                  <View style={[styles.milestoneDot, { backgroundColor: getStatusColor(milestone.status) }]} />
                  <View style={styles.milestoneContent}>
                    <Text style={styles.milestoneName}>{milestone.name}</Text>
                    <Text style={styles.milestoneDate}>
                      {new Date(milestone.expectedDate).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(milestone.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(milestone.status) }]}>
                      {getStatusText(milestone.status)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Risk Factors */}
            <View style={styles.riskCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="warning" size={20} color="#0D9488" />
                <Text style={[styles.cardTitle, { color: '#0D9488' }]}>Yếu tố rủi ro</Text>
              </View>
              {prediction.riskFactors.map((risk, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listBullet}>•</Text>
                  <Text style={styles.listText}>{risk}</Text>
                </View>
              ))}
            </View>

            {/* Recommendations */}
            <View style={styles.recommendCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="bulb" size={20} color="#0D9488" />
                <Text style={[styles.cardTitle, { color: '#0D9488' }]}>Khuyến nghị</Text>
              </View>
              {prediction.recommendations.map((rec, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listBullet}>✓</Text>
                  <Text style={styles.listText}>{rec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  projectList: {
    gap: 12,
  },
  projectCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
  },
  projectCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}05`,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  projectNameSelected: {
    color: Colors.light.primary,
  },
  projectPhase: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e5e5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 40,
    textAlign: 'right',
  },
  predictButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  predictButtonDisabled: {
    opacity: 0.7,
  },
  predictButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 13,
    color: '#666',
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
    width: 45,
    textAlign: 'right',
  },
  milestonesCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  milestoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  milestoneDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  riskCard: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  recommendCard: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  listItem: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  listBullet: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    width: 16,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});
