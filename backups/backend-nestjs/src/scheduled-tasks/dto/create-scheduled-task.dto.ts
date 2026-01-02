import {
    IsDateString,
    IsEnum,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';
import { TaskScheduleType } from '../entities/scheduled-task.entity';

export class CreateScheduledTaskDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TaskScheduleType)
  scheduleType: TaskScheduleType;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  cronExpression?: string;

  @IsString()
  action: string;

  @IsOptional()
  @IsObject()
  parameters?: any;
}
