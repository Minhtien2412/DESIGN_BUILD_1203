import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { CreateScheduledTaskDto } from './dto/create-scheduled-task.dto';
import { UpdateScheduledTaskDto } from './dto/update-scheduled-task.dto';
import { ScheduledTasksService } from './scheduled-tasks.service';

@Controller('scheduled-tasks')
export class ScheduledTasksController {
  constructor(private readonly scheduledTasksService: ScheduledTasksService) {}

  @Post()
  create(@Body() createDto: CreateScheduledTaskDto) {
    return this.scheduledTasksService.create(createDto);
  }

  @Get()
  findAll() {
    return this.scheduledTasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduledTasksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateScheduledTaskDto,
  ) {
    return this.scheduledTasksService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.scheduledTasksService.remove(id);
  }

  @Post(':id/toggle')
  toggle(@Param('id', ParseIntPipe) id: number) {
    return this.scheduledTasksService.toggle(id);
  }

  @Post(':id/run-now')
  runNow(@Param('id', ParseIntPipe) id: number) {
    return this.scheduledTasksService.runNow(id);
  }
}
