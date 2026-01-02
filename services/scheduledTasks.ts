/**
 * Scheduled Tasks Service - Sử dụng @nestjs/schedule
 * Quản lý công việc định kỳ, nhắc nhở, báo cáo tự động
 */

import { apiFetch } from './api';

export type ScheduleType = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  scheduleType: ScheduleType;
  cronExpression?: string; // For custom schedule
  nextRun?: string;
  lastRun?: string;
  isActive: boolean;
  action: TaskAction;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAction {
  type: 'notification' | 'report' | 'backup' | 'reminder' | 'custom';
  data: any;
}

/**
 * Tạo task định kỳ mới
 */
export async function createScheduledTask(
  name: string,
  scheduleType: ScheduleType,
  action: TaskAction,
  options?: {
    cronExpression?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<ScheduledTask | null> {
  try {
    const response = await apiFetch('/scheduled-tasks', {
      method: 'POST',
      body: JSON.stringify({
        name,
        scheduleType,
        action,
        ...options,
      }),
    });
    
    return response.data;
  } catch (error) {
    console.error('[ScheduledTasks] Create task failed:', error);
    return null;
  }
}

/**
 * Lấy danh sách tasks đã schedule
 */
export async function getScheduledTasks(
  filters?: {
    isActive?: boolean;
    type?: ScheduleType;
  }
): Promise<ScheduledTask[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.type) params.append('type', filters.type);

    const response = await apiFetch(`/scheduled-tasks?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('[ScheduledTasks] Get tasks failed:', error);
    return [];
  }
}

/**
 * Cập nhật scheduled task
 */
export async function updateScheduledTask(
  taskId: string,
  updates: Partial<ScheduledTask>
): Promise<boolean> {
  try {
    await apiFetch(`/scheduled-tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return true;
  } catch (error) {
    console.error('[ScheduledTasks] Update task failed:', error);
    return false;
  }
}

/**
 * Xóa scheduled task
 */
export async function deleteScheduledTask(taskId: string): Promise<boolean> {
  try {
    await apiFetch(`/scheduled-tasks/${taskId}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('[ScheduledTasks] Delete task failed:', error);
    return false;
  }
}

/**
 * Bật/tắt task
 */
export async function toggleScheduledTask(
  taskId: string,
  isActive: boolean
): Promise<boolean> {
  try {
    await apiFetch(`/scheduled-tasks/${taskId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ isActive }),
    });
    return true;
  } catch (error) {
    console.error('[ScheduledTasks] Toggle task failed:', error);
    return false;
  }
}

/**
 * Chạy task ngay lập tức (manual trigger)
 */
export async function runTaskNow(taskId: string): Promise<boolean> {
  try {
    await apiFetch(`/scheduled-tasks/${taskId}/run`, {
      method: 'POST',
    });
    return true;
  } catch (error) {
    console.error('[ScheduledTasks] Run task failed:', error);
    return false;
  }
}

/**
 * Helper: Tạo task nhắc nhở hàng ngày
 */
export async function createDailyReminder(
  title: string,
  message: string,
  timeOfDay: string // HH:mm format
): Promise<ScheduledTask | null> {
  const [hour, minute] = timeOfDay.split(':');
  const cronExpression = `${minute} ${hour} * * *`; // Every day at specified time

  return createScheduledTask(
    title,
    'daily',
    {
      type: 'reminder',
      data: {
        title,
        message,
        sound: 'default',
      },
    },
    { cronExpression }
  );
}

/**
 * Helper: Tạo báo cáo tuần tự động
 */
export async function createWeeklyReport(
  reportType: string,
  recipients: string[],
  dayOfWeek: number = 1 // Monday
): Promise<ScheduledTask | null> {
  const cronExpression = `0 9 * * ${dayOfWeek}`; // Every week at 9 AM

  return createScheduledTask(
    `Weekly ${reportType} Report`,
    'weekly',
    {
      type: 'report',
      data: {
        reportType,
        recipients,
        format: 'pdf',
      },
    },
    { cronExpression }
  );
}

/**
 * Helper: Tạo backup tự động hàng ngày
 */
export async function createDailyBackup(
  backupTargets: string[],
  timeOfDay: string = '02:00' // 2 AM default
): Promise<ScheduledTask | null> {
  const [hour, minute] = timeOfDay.split(':');
  const cronExpression = `${minute} ${hour} * * *`;

  return createScheduledTask(
    'Daily Backup',
    'daily',
    {
      type: 'backup',
      data: {
        targets: backupTargets,
        compress: true,
        encrypt: true,
      },
    },
    { cronExpression }
  );
}

/**
 * Helper: Tạo nhắc nhở deadline dự án
 */
export async function createProjectDeadlineReminder(
  projectId: string,
  projectName: string,
  deadlineDate: string,
  daysBeforeToRemind: number = 7
): Promise<ScheduledTask | null> {
  const reminderDate = new Date(deadlineDate);
  reminderDate.setDate(reminderDate.getDate() - daysBeforeToRemind);

  return createScheduledTask(
    `Deadline reminder: ${projectName}`,
    'once',
    {
      type: 'reminder',
      data: {
        title: 'Sắp đến hạn!',
        message: `Dự án "${projectName}" sẽ đến deadline trong ${daysBeforeToRemind} ngày`,
        projectId,
        priority: 'high',
      },
    },
    {
      startDate: reminderDate.toISOString(),
    }
  );
}

export default {
  createScheduledTask,
  getScheduledTasks,
  updateScheduledTask,
  deleteScheduledTask,
  toggleScheduledTask,
  runTaskNow,
  createDailyReminder,
  createWeeklyReport,
  createDailyBackup,
  createProjectDeadlineReminder,
};
