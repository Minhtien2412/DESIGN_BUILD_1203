import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { BudgetItem } from './entities/budget-item.entity';
import { Budget } from './entities/budget.entity';
import { Payment } from './entities/payment.entity';
import { Transaction } from './entities/transaction.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Budget, BudgetItem, Transaction])],
  controllers: [PaymentController, BudgetController],
  providers: [PaymentService, BudgetService],
  exports: [PaymentService, BudgetService],
})
export class PaymentModule {}
