/**
 * Mock task data for projects
 * Replace with real API data in production
 */

import { Task } from '@/components/ui/task-management';

export interface ProjectTasks {
  projectId: string;
  tasks: Task[];
}

export const PROJECT_TASKS: Record<string, ProjectTasks> = {
  '1': {
    projectId: '1',
    tasks: [
      {
        id: 'task-1',
        title: 'Hoàn thiện đổ bê tông móng',
        description: 'Đổ bê tông móng tầng hầm và kiểm tra chất lượng',
        status: 'in-progress',
        priority: 'urgent',
        dueDate: '2024-04-05',
        assignees: [
          { id: '1', name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?img=12' },
          { id: '3', name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?img=33' },
        ],
        tags: ['móng', 'bê tông', 'cấp bách'],
        subtasks: [
          { id: 's1', title: 'Chuẩn bị ván khuôn', completed: true },
          { id: 's2', title: 'Đổ bê tông', completed: true },
          { id: 's3', title: 'Kiểm tra chất lượng', completed: false },
          { id: 's4', title: 'Tháo ván khuôn', completed: false },
        ],
      },
      {
        id: 'task-2',
        title: 'Lắp đặt cốt thép cột',
        description: 'Lắp đặt cốt thép cho cột tầng 1',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2024-04-10',
        assignees: [
          { id: '2', name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?img=45' },
        ],
        tags: ['cốt thép', 'cột', 'kết cấu'],
        subtasks: [
          { id: 's5', title: 'Cắt cốt thép', completed: true },
          { id: 's6', title: 'Lắp đặt cốt thép', completed: false },
          { id: 's7', title: 'Kiểm tra kỹ thuật', completed: false },
        ],
      },
      {
        id: 'task-3',
        title: 'Nghiệm thu móng',
        description: 'Nghiệm thu phần móng với giám sát và chủ đầu tư',
        status: 'todo',
        priority: 'high',
        dueDate: '2024-04-08',
        assignees: [
          { id: '1', name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?img=12' },
          { id: '2', name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?img=45' },
          { id: '4', name: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?img=47' },
        ],
        tags: ['nghiệm thu', 'móng'],
      },
      {
        id: 'task-4',
        title: 'Cập nhật bản vẽ thi công',
        description: 'Cập nhật bản vẽ theo thay đổi thiết kế',
        status: 'todo',
        priority: 'medium',
        dueDate: '2024-04-12',
        assignees: [
          { id: '2', name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?img=45' },
        ],
        tags: ['bản vẽ', 'thiết kế'],
        subtasks: [
          { id: 's8', title: 'Họp với kiến trúc sư', completed: false },
          { id: 's9', title: 'Chỉnh sửa bản vẽ', completed: false },
          { id: 's10', title: 'Gửi duyệt', completed: false },
        ],
      },
      {
        id: 'task-5',
        title: 'Đặt hàng vật liệu tháng 4',
        description: 'Đặt hàng xi măng, cát, sắt thép cho tháng 4',
        status: 'todo',
        priority: 'medium',
        dueDate: '2024-04-03',
        assignees: [
          { id: '4', name: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?img=47' },
        ],
        tags: ['vật tư', 'đặt hàng'],
      },
      {
        id: 'task-6',
        title: 'Chuẩn bị mặt bằng tầng 1',
        description: 'Dọn dẹp và chuẩn bị mặt bằng để đổ sàn tầng 1',
        status: 'completed',
        priority: 'high',
        dueDate: '2024-03-28',
        assignees: [
          { id: '3', name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?img=33' },
        ],
        tags: ['chuẩn bị', 'mặt bằng'],
        subtasks: [
          { id: 's11', title: 'Vệ sinh hiện trường', completed: true },
          { id: 's12', title: 'Kiểm tra độ phẳng', completed: true },
        ],
      },
      {
        id: 'task-7',
        title: 'Báo cáo tiến độ tháng 3',
        description: 'Lập báo cáo tiến độ gửi chủ đầu tư',
        status: 'completed',
        priority: 'medium',
        dueDate: '2024-03-31',
        assignees: [
          { id: '1', name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?img=12' },
        ],
        tags: ['báo cáo', 'tiến độ'],
        subtasks: [
          { id: 's13', title: 'Thu thập dữ liệu', completed: true },
          { id: 's14', title: 'Viết báo cáo', completed: true },
          { id: 's15', title: 'Gửi chủ đầu tư', completed: true },
        ],
      },
      {
        id: 'task-8',
        title: 'Xin phép thi công ban đêm',
        description: 'Chờ phê duyệt giấy phép thi công ban đêm từ chính quyền địa phương',
        status: 'blocked',
        priority: 'high',
        dueDate: '2024-04-01',
        assignees: [
          { id: '1', name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?img=12' },
        ],
        tags: ['giấy phép', 'hành chính'],
      },
      {
        id: 'task-9',
        title: 'Bảo trì máy trộn bê tông',
        description: 'Máy trộn cần sửa chữa trước khi tiếp tục sử dụng',
        status: 'blocked',
        priority: 'medium',
        dueDate: '2024-04-04',
        assignees: [
          { id: '3', name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?img=33' },
        ],
        tags: ['thiết bị', 'bảo trì'],
      },
    ],
  },
  '2': {
    projectId: '2',
    tasks: [
      {
        id: 'task-10',
        title: 'Khảo sát hiện trường',
        description: 'Khảo sát địa hình và hiện trạng công trình',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2024-04-02',
        assignees: [
          { id: '2', name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?img=45' },
        ],
        tags: ['khảo sát', 'địa hình'],
      },
      {
        id: 'task-11',
        title: 'Thiết kế sơ bộ',
        description: 'Hoàn thành thiết kế sơ bộ để trình chủ đầu tư',
        status: 'todo',
        priority: 'high',
        dueDate: '2024-04-15',
        assignees: [
          { id: '2', name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?img=45' },
        ],
        tags: ['thiết kế'],
        subtasks: [
          { id: 's16', title: 'Vẽ mặt bằng', completed: false },
          { id: 's17', title: 'Vẽ mặt đứng', completed: false },
          { id: 's18', title: 'Render 3D', completed: false },
        ],
      },
    ],
  },
  '3': {
    projectId: '3',
    tasks: [
      {
        id: 'task-12',
        title: 'Lắp đặt hệ thống điện',
        description: 'Lắp đặt hệ thống điện cho tòa nhà',
        status: 'in-progress',
        priority: 'urgent',
        dueDate: '2024-04-20',
        assignees: [
          { id: '3', name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?img=33' },
        ],
        tags: ['điện', 'lắp đặt'],
        subtasks: [
          { id: 's19', title: 'Lắp tủ điện', completed: true },
          { id: 's20', title: 'Kéo dây điện', completed: true },
          { id: 's21', title: 'Lắp công tắc ổ cắm', completed: false },
          { id: 's22', title: 'Kiểm tra an toàn', completed: false },
        ],
      },
      {
        id: 'task-13',
        title: 'Hoàn thiện nội thất tầng 1',
        description: 'Hoàn thiện sơn, ốp lát, trần thạch cao tầng 1',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2024-05-01',
        assignees: [
          { id: '4', name: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?img=47' },
        ],
        tags: ['nội thất', 'hoàn thiện'],
      },
    ],
  },
};

export function getProjectTasks(projectId: string): Task[] {
  return PROJECT_TASKS[projectId]?.tasks || [];
}
