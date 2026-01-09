/**
 * Project Workflow Map - Metro/Subway Style Progress Visualization
 * Displays project phases as connected stations on a metro line
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

export type WorkflowPhase = {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'pending' | 'blocked';
  progress: number; // 0-100
  startDate?: string;
  endDate?: string;
  tasks?: number;
  completedTasks?: number;
};

type WorkflowMapProps = {
  phases: WorkflowPhase[];
  orientation?: 'horizontal' | 'vertical';
};

const STATUS_CONFIG = {
  completed: {
    color: '#0066CC',
    icon: 'checkmark-circle',
    bg: '#E8F5E9',
  },
  active: {
    color: '#0066CC',
    icon: 'radio-button-on',
    bg: '#E8F4FF',
  },
  pending: {
    color: '#999999',
    icon: 'radio-button-off-outline',
    bg: '#F5F5F5',
  },
  blocked: {
    color: '#000000',
    icon: 'close-circle',
    bg: '#FFEBEE',
  },
};

export default function WorkflowMap({ phases, orientation = 'horizontal' }: WorkflowMapProps) {
  if (orientation === 'vertical') {
    return <VerticalWorkflowMap phases={phases} />;
  }
  return <HorizontalWorkflowMap phases={phases} />;
}

// Horizontal Metro Map (like the image you sent)
function HorizontalWorkflowMap({ phases }: { phases: WorkflowPhase[] }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quy trình thi công</Text>
      <Text style={styles.subtitle}>Sơ đồ tiến độ dự án</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {phases.map((phase, index) => (
          <React.Fragment key={phase.id}>
            {/* Station Node */}
            <View style={styles.stationContainer}>
              {/* Station Circle */}
              <View style={styles.stationWrapper}>
                <View 
                  style={[
                    styles.stationCircle,
                    { 
                      backgroundColor: STATUS_CONFIG[phase.status].bg,
                      borderColor: STATUS_CONFIG[phase.status].color,
                    }
                  ]}
                >
                  <Ionicons 
                    name={STATUS_CONFIG[phase.status].icon as any}
                    size={24}
                    color={STATUS_CONFIG[phase.status].color}
                  />
                </View>
                
                {/* Station Number Badge */}
                <View 
                  style={[
                    styles.stationNumber,
                    { backgroundColor: STATUS_CONFIG[phase.status].color }
                  ]}
                >
                  <Text style={styles.stationNumberText}>{String(index + 1).padStart(2, '0')}</Text>
                </View>
              </View>

              {/* Station Info */}
              <View style={styles.stationInfo}>
                <Text 
                  style={[
                    styles.stationName,
                    phase.status === 'active' && styles.stationNameActive
                  ]}
                  numberOfLines={2}
                >
                  {phase.name}
                </Text>
                
                {/* Progress Bar */}
                {phase.status !== 'pending' && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                      <View 
                        style={[
                          styles.progressBarFill,
                          { 
                            width: `${phase.progress}%`,
                            backgroundColor: STATUS_CONFIG[phase.status].color
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>{phase.progress}%</Text>
                  </View>
                )}

                {/* Tasks Count */}
                {phase.tasks && (
                  <View style={styles.tasksInfo}>
                    <Ionicons name="list" size={12} color="#666" />
                    <Text style={styles.tasksText}>
                      {phase.completedTasks || 0}/{phase.tasks} công việc
                    </Text>
                  </View>
                )}

                {/* Timeline */}
                {phase.startDate && (
                  <View style={styles.timeline}>
                    <Ionicons name="time-outline" size={12} color="#999" />
                    <Text style={styles.timelineText}>
                      {formatDate(phase.startDate)}
                      {phase.endDate && ` - ${formatDate(phase.endDate)}`}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Connection Line */}
            {index < phases.length - 1 && (
              <View style={styles.connectionLine}>
                <View 
                  style={[
                    styles.line,
                    { 
                      backgroundColor: phases[index + 1].status === 'pending' 
                        ? '#E0E0E0' 
                        : STATUS_CONFIG[phase.status].color
                    }
                  ]}
                />
                {/* Arrow */}
                <View 
                  style={[
                    styles.arrow,
                    { 
                      borderLeftColor: phases[index + 1].status === 'pending' 
                        ? '#E0E0E0' 
                        : STATUS_CONFIG[phase.status].color
                    }
                  ]}
                />
              </View>
            )}
          </React.Fragment>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#0066CC' }]} />
          <Text style={styles.legendText}>Hoàn thành</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#0066CC' }]} />
          <Text style={styles.legendText}>Đang thực hiện</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#999999' }]} />
          <Text style={styles.legendText}>Chưa bắt đầu</Text>
        </View>
      </View>
    </View>
  );
}

// Vertical Metro Map (alternative layout)
function VerticalWorkflowMap({ phases }: { phases: WorkflowPhase[] }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quy trình thi công</Text>
      
      <View style={styles.verticalContainer}>
        {phases.map((phase, index) => (
          <React.Fragment key={phase.id}>
            <View style={styles.verticalStation}>
              {/* Timeline line on left */}
              <View style={styles.timelineColumn}>
                <View 
                  style={[
                    styles.verticalCircle,
                    { 
                      backgroundColor: STATUS_CONFIG[phase.status].bg,
                      borderColor: STATUS_CONFIG[phase.status].color,
                    }
                  ]}
                >
                  <Ionicons 
                    name={STATUS_CONFIG[phase.status].icon as any}
                    size={20}
                    color={STATUS_CONFIG[phase.status].color}
                  />
                </View>
                
                {index < phases.length - 1 && (
                  <View 
                    style={[
                      styles.verticalLine,
                      { 
                        backgroundColor: phases[index + 1].status === 'pending' 
                          ? '#E0E0E0' 
                          : STATUS_CONFIG[phase.status].color
                      }
                    ]}
                  />
                )}
              </View>

              {/* Content on right */}
              <View style={styles.verticalContent}>
                <View style={styles.verticalCard}>
                  <View style={styles.verticalHeader}>
                    <Text style={styles.verticalNumber}>Giai đoạn {index + 1}</Text>
                    <Text style={styles.verticalName}>{phase.name}</Text>
                  </View>

                  {phase.status !== 'pending' && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBarBg}>
                        <View 
                          style={[
                            styles.progressBarFill,
                            { 
                              width: `${phase.progress}%`,
                              backgroundColor: STATUS_CONFIG[phase.status].color
                            }
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>{phase.progress}%</Text>
                    </View>
                  )}

                  <View style={styles.verticalMeta}>
                    {phase.tasks && (
                      <View style={styles.tasksInfo}>
                        <Ionicons name="list" size={14} color="#666" />
                        <Text style={styles.tasksText}>
                          {phase.completedTasks || 0}/{phase.tasks}
                        </Text>
                      </View>
                    )}
                    {phase.startDate && (
                      <View style={styles.timeline}>
                        <Ionicons name="calendar-outline" size={14} color="#999" />
                        <Text style={styles.timelineText}>
                          {formatDate(phase.startDate)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

// Utility
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },

  // Horizontal Layout
  horizontalScroll: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  stationContainer: {
    alignItems: 'center',
    minWidth: 140,
    maxWidth: 160,
  },
  stationWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  stationCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  stationNumber: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  stationNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  stationInfo: {
    alignItems: 'center',
    width: '100%',
  },
  stationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  stationNameActive: {
    color: '#0066CC',
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    marginBottom: 6,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    minWidth: 32,
  },
  tasksInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  tasksText: {
    fontSize: 11,
    color: '#666',
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timelineText: {
    fontSize: 10,
    color: '#999',
  },

  // Connection Line
  connectionLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -80,
  },
  line: {
    width: 40,
    height: 4,
    backgroundColor: '#0066CC',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderLeftColor: '#0066CC',
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
  },

  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },

  // Vertical Layout
  verticalContainer: {
    paddingVertical: 10,
  },
  verticalStation: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineColumn: {
    width: 60,
    alignItems: 'center',
    paddingTop: 4,
  },
  verticalCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  verticalLine: {
    width: 3,
    flex: 1,
    minHeight: 80,
    backgroundColor: '#0066CC',
    marginTop: -4,
  },
  verticalContent: {
    flex: 1,
    paddingBottom: 20,
  },
  verticalCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#0066CC',
  },
  verticalHeader: {
    marginBottom: 12,
  },
  verticalNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0066CC',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  verticalName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  verticalMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
});
