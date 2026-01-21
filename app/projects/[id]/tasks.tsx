import TasksKanbanBoard from '@/features/tasks/TasksKanbanBoard';
import { useLocalSearchParams } from 'expo-router';

export default function ProjectTasksScreen() {
  const params = useLocalSearchParams();
  const projectId = Number(params.id);

  return <TasksKanbanBoard projectId={projectId} />;
}
