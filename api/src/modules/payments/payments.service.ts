import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentStatus, Prisma } from '@prisma/client';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  private stripe: InstanceType<typeof Stripe>;
  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    });
  }

  async createPaymentIntent(
    userId: string,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<{
    success: boolean;
    data: { clientSecret: string; paymentId: string };
    message: string;
  }> {
    const { orderId, amount, currency, description } = createPaymentIntentDto;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const existingPayment = await this.prisma.payment.findFirst({
      where: { orderId },
    });

    if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('payment already completed for this order');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      description,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId,
      },
    });

    if (!paymentIntent.client_secret) {
      throw new BadRequestException(
        'Stripe did not return a client secret for this payment intent',
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        userId,
        amount,
        currency,
        status: PaymentStatus.PENDING,
        paymentMethod: 'STRIPE',
        transactionId: paymentIntent.id,
      },
    });
    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
      },
      message: 'payment intent created succesfully',
    };
  }

  async confirmPayment(
    userId: string,
    confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<{
    sucess: boolean;
    data: PaymentResponseDto;
    message: string;
  }> {
    const { paymentIntentId, orderId } = confirmPaymentDto;

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentIntentId, userId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('payment already completed');
    }
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not successfull');
    }
    const [updatedPayment] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.COMPLETED },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
      }),
    ]);

    const order = await this.prisma.order.findFirst({
      where: { id: orderId },
    });
    if (order?.cartId) {
      await this.prisma.cart.update({
        where: { id: order.cartId },
        data: { checkedOut: true },
      });
    }

    return {
      sucess: true,
      data: this.mapToPaymentResponse(updatedPayment),
      message: 'payment confirmed',
    };
  }

  async findAll(userId: string): Promise<{
    success: boolean;
    data: PaymentResponseDto[];
    message: string;
  }> {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: payments.map((payment) => this.mapToPaymentResponse(payment)),
      message: 'payments fetched successfully',
    };
  }

  async findOne(
    userId: string,
    id: string,
  ): Promise<{
    success: boolean;
    data: PaymentResponseDto;
    message: string;
  }> {
    const payment = await this.prisma.payment.findUnique({
      where: { id, userId },
    });

    if (!payment) {
      throw new NotFoundException('payment not found');
    }

    return {
      success: true,
      data: this.mapToPaymentResponse(payment),
      message: 'payments fetched successfully',
    };
  }

  async findByOrder(
    userId: string,
    orderId: string,
  ): Promise<{
    success: boolean;
    data: PaymentResponseDto | null;
    message: string;
  }> {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId, userId },
    });

    return {
      success: true,
      data: payment ? this.mapToPaymentResponse(payment) : null,
      message: 'payments fetched successfully',
    };
  }

  private mapToPaymentResponse(payment: {
    id: string;
    orderId: string;
    userId: string;
    amount: Prisma.Decimal;
    currency: string;
    status: PaymentStatus;
    paymentMethod: string | null;
    transactionId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): PaymentResponseDto {
    return {
      id: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      amount: payment.amount.toNumber(),
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
