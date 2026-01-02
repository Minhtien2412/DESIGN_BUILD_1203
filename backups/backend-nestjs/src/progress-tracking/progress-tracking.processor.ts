import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ProgressTrackingService } from './progress-tracking.service';

@Processor('progress-tracking')
export class ProgressTrackingProcessor {
  constructor(private progressService: ProgressTrackingService) {}

  @Process('report_generation')
  async handleReportGeneration(job: Job) {
    const { taskId, parameters } = job.data;

    try {
      await this.progressService.updateTaskProgress(taskId, 10, null);
      
      // Simulate report generation steps
      await this.sleep(1000);
      await this.progressService.updateTaskProgress(taskId, 30, null);
      
      await this.sleep(1000);
      await this.progressService.updateTaskProgress(taskId, 60, null);
      
      await this.sleep(1000);
      await this.progressService.updateTaskProgress(taskId, 90, null);
      
      // Complete
      const result = {
        reportUrl: `/reports/${taskId}.pdf`,
        generatedAt: new Date().toISOString(),
      };
      
      await this.progressService.completeTask(taskId, result);
    } catch (error) {
      await this.progressService.failTask(taskId, error.message);
      throw error;
    }
  }

  @Process('data_export')
  async handleDataExport(job: Job) {
    const { taskId, parameters } = job.data;

    try {
      await this.progressService.updateTaskProgress(taskId, 20, null);
      
      // Simulate export process
      await this.sleep(2000);
      await this.progressService.updateTaskProgress(taskId, 70, null);
      
      await this.sleep(1000);
      
      const result = {
        exportUrl: `/exports/${taskId}.csv`,
        rows: parameters.rowCount || 0,
      };
      
      await this.progressService.completeTask(taskId, result);
    } catch (error) {
      await this.progressService.failTask(taskId, error.message);
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
