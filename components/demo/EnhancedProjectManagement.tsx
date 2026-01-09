import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { enhancedProjectApiService } from '../../services/enhancedProjectApi';
import { ConstructionProject } from '../../types/construction';
import { Button } from '../ui/button';
import { Container } from '../ui/container';
import { Loader } from '../ui/loader';
import { Section } from '../ui/section';

/**
 * Enhanced Construction Project Management Screen
 * Demonstrates integration with the Enhanced Project API Service
 */

export default function EnhancedProjectManagement() {
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setError(null);
      const result = await enhancedProjectApiService.getProjects();
      setProjects(result.projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Không thể tải danh sách dự án. Đang sử dụng dữ liệu mẫu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
  };

  const handleCreateSampleProject = async () => {
    try {
      setLoading(true);
      const newProject = await enhancedProjectApiService.createProject({
        project_name: `Dự án mẫu ${Date.now()}`,
        project_type: 'biet_thu',
        description: 'Dự án được tạo từ ứng dụng mobile',
        owner_name: 'Khách hàng mẫu',
        location: 'Hà Nội, Việt Nam',
        budget: 3000000000,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      Alert.alert('Thành công', `Đã tạo dự án "${newProject.project_name}"`);
      await loadProjects(); // Refresh the list
    } catch (err) {
      console.error('Failed to create project:', err);
      Alert.alert('Lỗi', 'Không thể tạo dự án mới');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = async (project: ConstructionProject) => {
    try {
      const fullProject = await enhancedProjectApiService.getProject(project.id);
      if (fullProject) {
        Alert.alert(
          `Dự án: ${fullProject.project_name}`,
          `Mã dự án: ${fullProject.project_code}\nTrạng thái: ${fullProject.status}\nNgân sách: ${fullProject.budget.total_budget.toLocaleString('vi-VN')} ${fullProject.budget.currency}`,
          [{ text: 'Đóng', style: 'default' }]
        );
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
      Alert.alert('Lỗi', 'Không thể tải chi tiết dự án');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return '#3498db';
      case 'in_progress': return '#f39c12';
      case 'completed': return '#27ae60';
      case 'on_hold': return '#000000';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return 'Đang lập kế hoạch';
      case 'in_progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'on_hold': return 'Tạm dừng';
      default: return 'Không xác định';
    }
  };

  if (loading && projects.length === 0) {
    return (
      <Container>
        <Loader />
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Đang tải dự án...
        </Text>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView>
        <Section>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            marginBottom: 20,
            textAlign: 'center'
          }}>
            🏗️ Quản lý Dự án Xây dựng
          </Text>
          
          {error && (
            <View style={{
              backgroundColor: '#fff3cd',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              borderColor: '#ffeaa7',
              borderWidth: 1
            }}>
              <Text style={{ color: '#856404' }}>⚠️ {error}</Text>
            </View>
          )}

          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            marginBottom: 20 
          }}>
            <Button
              title="🔄 Làm mới"
              onPress={handleRefresh}
              loading={refreshing}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="➕ Tạo dự án mẫu"
              onPress={handleCreateSampleProject}
              loading={loading}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </Section>

        <Section>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            marginBottom: 16 
          }}>
            📋 Danh sách dự án ({projects.length})
          </Text>

          {projects.length === 0 ? (
            <View style={{
              padding: 40,
              alignItems: 'center',
              backgroundColor: '#f8f9fa',
              borderRadius: 8
            }}>
              <Text style={{ 
                fontSize: 48, 
                marginBottom: 12 
              }}>🏗️</Text>
              <Text style={{ 
                fontSize: 16, 
                color: '#6c757d',
                textAlign: 'center'
              }}>
                Chưa có dự án nào{'\n'}Tạo dự án mẫu để bắt đầu
              </Text>
            </View>
          ) : (
            projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={{
                  backgroundColor: '#ffffff',
                  padding: 16,
                  marginBottom: 12,
                  borderRadius: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  borderLeftWidth: 4,
                  borderLeftColor: getStatusColor(project.status)
                }}
                onPress={() => handleViewProject(project)}
              >
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8
                }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600',
                    color: '#2c3e50',
                    flex: 1
                  }}>
                    {project.project_name}
                  </Text>
                  <View style={{
                    backgroundColor: getStatusColor(project.status),
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12
                  }}>
                    <Text style={{ 
                      color: '#ffffff', 
                      fontSize: 12,
                      fontWeight: '500'
                    }}>
                      {getStatusText(project.status)}
                    </Text>
                  </View>
                </View>

                <Text style={{ 
                  fontSize: 14, 
                  color: '#7f8c8d',
                  marginBottom: 8
                }}>
                  📍 {project.location.address}
                </Text>

                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#27ae60',
                    fontWeight: '600'
                  }}>
                    💰 {formatCurrency(project.budget.total_budget)}
                  </Text>
                  <Text style={{ 
                    fontSize: 12, 
                    color: '#95a5a6' 
                  }}>
                    #{project.project_code}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </Section>

        <Section>
          <Text style={{ 
            fontSize: 16, 
            color: '#7f8c8d',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            🚀 Powered by Enhanced Project API Service{'\n'}
            Kết nối với API: https://api.thietkeresort.com.vn
          </Text>
        </Section>
      </ScrollView>
    </Container>
  );
}
