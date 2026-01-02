import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '../entities/scheduled-task.entity';
import { CreateScheduledTaskDto } from './create-scheduled-task.dto';

export class UpdateScheduledTaskDto extends PartialType(CreateScheduledTaskDto) {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
