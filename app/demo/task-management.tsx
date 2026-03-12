import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AlertProvider } from '@/components/ui/alert';
import { Container } from '@/components/ui/container';
import TaskManagement, { type Task } from '@/components/ui/task-management';
import { SpacingSemantic } from '@/constants/spacing';

// Sample tasks data demonstrating all features
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Fix critical payment gateway bug',
    description: 'Payment processing fails for international cards',
    status: 'in-progress',
    priority: 'urgent',
    dueDate: '2025-02-15',
    assignees: [
      { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=12' },
      { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=45' },
    ],
    tags: ['bug', 'payment', 'backend'],
    subtasks: [
      { id: 's1', title: 'Identify error in payment logs', completed: true },
      { id: 's2', title: 'Write unit tests', completed: true },
      { id: 's3', title: 'Fix card validation logic', completed: true },
      { id: 's4', title: 'Test with international cards', completed: false },
      { id: 's5', title: 'Deploy to production', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Implement user authentication',
    description: 'Add OAuth 2.0 with Google and Facebook providers',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2025-02-20',
    assignees: [
      { id: '3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=33' },
    ],
    tags: ['feature', 'auth', 'security'],
    subtasks: [
      { id: 's6', title: 'Setup OAuth providers', completed: true },
      { id: 's7', title: 'Implement login flow', completed: true },
      { id: 's8', title: 'Add session management', completed: false },
      { id: 's9', title: 'Write tests', completed: false },
      { id: 's10', title: 'Update documentation', completed: false },
      { id: 's11', title: 'Security audit', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Design new landing page',
    description: 'Create mockups for the revamped homepage',
    status: 'todo',
    priority: 'high',
    dueDate: '2025-02-18',
    assignees: [
      { id: '4', name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?img=47' },
      { id: '5', name: 'Tom Brown', avatar: 'https://i.pravatar.cc/150?img=56' },
    ],
    tags: ['design', 'ui/ux', 'landing'],
  },
  {
    id: '4',
    title: 'Optimize database queries',
    description: 'Improve performance for product search and filtering',
    status: 'todo',
    priority: 'medium',
    dueDate: '2025-02-25',
    assignees: [
      { id: '6', name: 'Chris Lee', avatar: 'https://i.pravatar.cc/150?img=68' },
    ],
    tags: ['performance', 'database', 'backend'],
    subtasks: [
      { id: 's12', title: 'Profile slow queries', completed: false },
      { id: 's13', title: 'Add database indexes', completed: false },
      { id: 's14', title: 'Optimize joins', completed: false },
      { id: 's15', title: 'Test performance', completed: false },
    ],
  },
  {
    id: '5',
    title: 'Write API documentation',
    description: 'Document all REST endpoints with examples',
    status: 'todo',
    priority: 'low',
    dueDate: '2025-03-01',
    assignees: [
      { id: '7', name: 'Alex Chen', avatar: 'https://i.pravatar.cc/150?img=29' },
    ],
    tags: ['documentation', 'api'],
    subtasks: [
      { id: 's16', title: 'Setup OpenAPI spec', completed: true },
      { id: 's17', title: 'Document auth endpoints', completed: false },
      { id: 's18', title: 'Document product endpoints', completed: false },
      { id: 's19', title: 'Document user endpoints', completed: false },
      { id: 's20', title: 'Document order endpoints', completed: false },
      { id: 's21', title: 'Add code examples', completed: false },
      { id: 's22', title: 'Review with team', completed: false },
      { id: 's23', title: 'Publish docs', completed: false },
      { id: 's24', title: 'Add changelog', completed: false },
      { id: 's25', title: 'Setup versioning', completed: false },
    ],
  },
  {
    id: '6',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment',
    status: 'completed',
    priority: 'high',
    dueDate: '2025-02-10',
    assignees: [
      { id: '8', name: 'Lisa Garcia', avatar: 'https://i.pravatar.cc/150?img=38' },
      { id: '9', name: 'David Kim', avatar: 'https://i.pravatar.cc/150?img=51' },
    ],
    tags: ['devops', 'automation', 'ci/cd'],
    subtasks: [
      { id: 's26', title: 'Setup GitHub Actions', completed: true },
      { id: 's27', title: 'Configure test pipeline', completed: true },
      { id: 's28', title: 'Setup staging deployment', completed: true },
      { id: 's29', title: 'Setup production deployment', completed: true },
      { id: 's30', title: 'Add notifications', completed: true },
      { id: 's31', title: 'Write documentation', completed: true },
      { id: 's32', title: 'Train team', completed: true },
      { id: 's33', title: 'Monitor first deployment', completed: true },
    ],
  },
  {
    id: '7',
    title: 'Refactor authentication module',
    description: 'Clean up legacy code and improve security',
    status: 'completed',
    priority: 'medium',
    dueDate: '2025-02-08',
    assignees: [
      { id: '3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=33' },
    ],
    tags: ['refactor', 'auth', 'security'],
    subtasks: [
      { id: 's34', title: 'Audit current code', completed: true },
      { id: 's35', title: 'Identify security issues', completed: true },
      { id: 's36', title: 'Refactor core logic', completed: true },
      { id: 's37', title: 'Update tests', completed: true },
      { id: 's38', title: 'Code review', completed: true },
    ],
  },
  {
    id: '8',
    title: 'Investigate server crashes',
    description: 'Memory leak causing server restarts every 6 hours',
    status: 'blocked',
    priority: 'urgent',
    dueDate: '2025-02-16',
    assignees: [
      { id: '10', name: 'Emma Davis', avatar: 'https://i.pravatar.cc/150?img=44' },
      { id: '6', name: 'Chris Lee', avatar: 'https://i.pravatar.cc/150?img=68' },
      { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=12' },
    ],
    tags: ['bug', 'urgent', 'backend', 'infrastructure'],
  },
  {
    id: '9',
    title: 'Update dependencies',
    description: 'Waiting for React 19 stable release',
    status: 'blocked',
    priority: 'low',
    dueDate: '2025-02-28',
    assignees: [
      { id: '7', name: 'Alex Chen', avatar: 'https://i.pravatar.cc/150?img=29' },
    ],
    tags: ['maintenance', 'dependencies'],
  },
];export default function TaskManagementDemoScreen() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'none'>('status');

  const handleTaskToggle = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          // Toggle between completed and in-progress
          const newStatus = task.status === 'completed' ? 'in-progress' : 'completed';
          console.log(`Task "${task.title}" toggled to: ${newStatus}`);
          return { ...task, status: newStatus };
        }
        return task;
      })
    );
  };

  const handleTaskPress = (task: Task) => {
    console.log('Task pressed:', task.title);
    // In a real app, navigate to task detail screen
  };

  const handleAddTask = () => {
    console.log('Add task button pressed');
    // In a real app, open task creation modal/screen
  };

  const handleGroupByChange = () => {
    // Cycle through grouping modes
    const modes: ('status' | 'priority' | 'none')[] = ['status', 'priority', 'none'];
    const currentIndex = modes.indexOf(groupBy);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setGroupBy(nextMode);
    console.log('Group by changed to:', nextMode);
  };

  return (
    <AlertProvider>
      <Stack.Screen
        options={{
          title: 'Task Management Demo',
          headerShown: true,
        }}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: SpacingSemantic.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Container>
          <View style={{ marginBottom: SpacingSemantic.md }}>
            {/* Info section could go here */}
          </View>

          <TaskManagement
            tasks={tasks}
            onTaskToggle={handleTaskToggle}
            onTaskPress={handleTaskPress}
            onAddTask={handleAddTask}
            groupBy={groupBy}
            showFilters={true}
          />

          {/* Debug button to cycle through grouping modes */}
          <View style={{ marginTop: SpacingSemantic.lg, alignItems: 'center' }}>
            {/* Note: In production, add a proper button to toggle groupBy */}
          </View>
        </Container>
      </ScrollView>
    </AlertProvider>
  );
}
