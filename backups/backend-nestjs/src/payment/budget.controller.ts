import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetItemDto } from './dto/create-budget-item.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  async create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetService.create(createBudgetDto);
  }

  @Get('project/:projectId')
  async findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.budgetService.findByProject(projectId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.budgetService.findOne(id);
  }

  @Post('items')
  async addItem(@Body() createItemDto: CreateBudgetItemDto) {
    return this.budgetService.addItem(createItemDto);
  }

  @Patch('items/:id/spent')
  async updateItemSpent(
    @Param('id', ParseIntPipe) id: number,
    @Body('spentAmount') spentAmount: number,
  ) {
    return this.budgetService.updateItemSpent(id, spentAmount);
  }

  @Get(':id/report')
  async getReport(@Param('id', ParseIntPipe) id: number) {
    return this.budgetService.getReport(id);
  }
}
