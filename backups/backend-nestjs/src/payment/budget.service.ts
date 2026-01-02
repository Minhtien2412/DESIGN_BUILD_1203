import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBudgetItemDto } from './dto/create-budget-item.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { BudgetItem } from './entities/budget-item.entity';
import { Budget, BudgetStatus } from './entities/budget.entity';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(BudgetItem)
    private readonly budgetItemRepository: Repository<BudgetItem>,
  ) {}

  async create(createBudgetDto: CreateBudgetDto): Promise<Budget> {
    const budget = this.budgetRepository.create({
      ...createBudgetDto,
      totalRemaining: createBudgetDto.totalBudget,
    });
    return this.budgetRepository.save(budget);
  }

  async findByProject(projectId: number): Promise<Budget[]> {
    return this.budgetRepository.find({
      where: { projectId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }
    return budget;
  }

  async addItem(createItemDto: CreateBudgetItemDto): Promise<BudgetItem> {
    const budget = await this.findOne(createItemDto.budgetId);

    const item = this.budgetItemRepository.create({
      ...createItemDto,
      remainingAmount: createItemDto.allocatedAmount,
    });

    const savedItem = await this.budgetItemRepository.save(item);

    // Recalculate budget totals
    await this.recalculateBudget(budget.id);

    return savedItem;
  }

  async updateItemSpent(itemId: number, spentAmount: number): Promise<BudgetItem> {
    const item = await this.budgetItemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException(`Budget item with ID ${itemId} not found`);
    }

    item.spentAmount = spentAmount;
    item.remainingAmount = item.allocatedAmount - spentAmount;

    const savedItem = await this.budgetItemRepository.save(item);

    // Recalculate budget totals
    await this.recalculateBudget(item.budgetId);

    return savedItem;
  }

  async getReport(budgetId: number): Promise<any> {
    const budget = await this.findOne(budgetId);

    const totalAllocated = budget.items.reduce(
      (sum, item) => sum + Number(item.allocatedAmount),
      0,
    );
    const totalSpent = budget.items.reduce((sum, item) => sum + Number(item.spentAmount), 0);
    const totalRemaining = totalAllocated - totalSpent;
    const percentageUsed = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    const categoryBreakdown = budget.items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          allocated: 0,
          spent: 0,
          remaining: 0,
          items: [],
        };
      }
      acc[item.category].allocated += Number(item.allocatedAmount);
      acc[item.category].spent += Number(item.spentAmount);
      acc[item.category].remaining += Number(item.remainingAmount);
      acc[item.category].items.push(item);
      return acc;
    }, {});

    return {
      budget,
      summary: {
        totalAllocated,
        totalSpent,
        totalRemaining,
        percentageUsed: Math.round(percentageUsed * 100) / 100,
      },
      categoryBreakdown,
    };
  }

  private async recalculateBudget(budgetId: number): Promise<void> {
    const budget = await this.findOne(budgetId);

    const totalSpent = budget.items.reduce((sum, item) => sum + Number(item.spentAmount), 0);
    const totalRemaining = Number(budget.totalBudget) - totalSpent;

    budget.totalSpent = totalSpent;
    budget.totalRemaining = totalRemaining;

    // Update status based on spending
    if (totalSpent > Number(budget.totalBudget)) {
      budget.status = BudgetStatus.EXCEEDED;
    } else if (totalRemaining <= 0 && budget.status === BudgetStatus.ACTIVE) {
      budget.status = BudgetStatus.COMPLETED;
    }

    await this.budgetRepository.save(budget);
  }
}
