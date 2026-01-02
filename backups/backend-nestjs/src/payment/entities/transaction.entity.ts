import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  REFUND = 'refund',
}

@Entity('transactions')
@Index(['projectId'])
@Index(['budgetId'])
@Index(['type'])
@Index(['createdAt'])
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectId: number;

  @Column({ nullable: true })
  budgetId: number;

  @Column({ nullable: true })
  budgetItemId: number;

  @Column({ nullable: true })
  paymentId: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  userId: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    invoice?: string;
    receipt?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;
}
