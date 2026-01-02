import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Budget } from './budget.entity';

@Entity('budget_items')
@Index(['budgetId'])
@Index(['category'])
export class BudgetItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  budgetId: number;

  @ManyToOne(() => Budget, (budget) => budget.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'budgetId' })
  budget: Budget;

  @Column()
  category: string; // e.g., 'materials', 'labor', 'equipment'

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  allocatedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spentAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  remainingAmount: number;

  @Column({ nullable: true })
  unit: string; // e.g., 'kg', 'm2', 'hours'

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  unitPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
