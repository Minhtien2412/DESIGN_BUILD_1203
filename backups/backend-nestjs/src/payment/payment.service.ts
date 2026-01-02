import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create(createPaymentDto);
    const savedPayment = await this.paymentRepository.save(payment);

    // Create transaction record
    await this.createTransaction({
      projectId: savedPayment.projectId,
      paymentId: savedPayment.id,
      type: TransactionType.EXPENSE,
      amount: savedPayment.amount,
      currency: savedPayment.currency,
      description: savedPayment.description || 'Payment',
      userId: savedPayment.userId,
    });

    return savedPayment;
  }

  async findAll(projectId?: number): Promise<Payment[]> {
    const where = projectId ? { projectId } : {};
    return this.paymentRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async updateStatus(id: number, status: PaymentStatus): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.status = status;

    if (status === PaymentStatus.COMPLETED && !payment.paidAt) {
      payment.paidAt = new Date();
    }

    if (status === PaymentStatus.REFUNDED && !payment.refundedAt) {
      payment.refundedAt = new Date();

      // Create refund transaction
      await this.createTransaction({
        projectId: payment.projectId,
        paymentId: payment.id,
        type: TransactionType.REFUND,
        amount: payment.amount,
        currency: payment.currency,
        description: `Refund for payment #${payment.id}`,
        userId: payment.userId,
      });
    }

    return this.paymentRepository.save(payment);
  }

  async processWebhook(data: any): Promise<Payment> {
    // This is a simplified webhook handler
    // In production, verify signature and handle specific gateway logic
    const { transactionId, status, amount } = data;

    const payment = await this.paymentRepository.findOne({
      where: { transactionId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = status;
    payment.gatewayResponse = JSON.stringify(data);

    if (status === PaymentStatus.COMPLETED) {
      payment.paidAt = new Date();
    }

    return this.paymentRepository.save(payment);
  }

  async getTransactionHistory(projectId: number): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  private async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactionRepository.create(data);
    return this.transactionRepository.save(transaction);
  }
}
