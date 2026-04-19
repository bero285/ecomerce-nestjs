import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import {
  CreatePaymentIntentApiResponseDto,
  PaymentApiResponseDto,
  PaymentResponseDto,
} from './dto/payment-response.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiTags('payments')
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Post('create-intent')
  @ApiOperation({
    summary: 'create payment intent',
  })
  @ApiCreatedResponse({
    description: 'payment intent created succesfully',
    type: CreatePaymentIntentApiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'invalid data or order not founds',
  })
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @GetUser() userId: string,
  ): Promise<CreatePaymentIntentApiResponseDto> {
    return this.paymentService.createPaymentIntent(
      userId,
      createPaymentIntentDto,
    );
  }

  @Post('confirm')
  @ApiOperation({
    summary: 'Confirm payment',
    description: 'confirm a payment intent for an order',
  })
  @ApiResponse({
    status: 200,
    description: 'payment confirmed successfully',
    type: PaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'payment not found or already completed',
  })
  async confirmPayment(
    @Body() confirmPaymentDto: ConfirmPaymentDto,
    @GetUser() userId: string,
  ) {
    return this.paymentService.confirmPayment(userId, confirmPaymentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'get all payments',
    description: 'get all payments for current user',
  })
  @ApiOkResponse({
    description: 'payments fetched succefully',
  })
  async findAll(@GetUser('id') userId: string) {
    return this.paymentService.findAll(userId);
  }

  @Get('id')
  @ApiParam({
    name: 'id',
    description: 'payment id',
    example: 'pay_1234567890',
  })
  @ApiOperation({
    summary: 'get payment by id',
    description: 'get payment by id for current user',
  })
  @ApiOkResponse({
    description: 'payment fetched succefully',
    type: PaymentApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'payment not found',
  })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.paymentService.findOne(userId, id);
  }

  @Get('order/:orderId')
  @ApiParam({
    name: 'orderId',
    description: 'orderId',
    example: 'orderId-123',
  })
  @ApiOperation({
    summary: 'get payment by orderId',
    description: 'get payment by orderId for current user',
  })
  @ApiOkResponse({
    description: 'payment fetched succefully',
    type: PaymentApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'payment not found',
  })
  async findByOrder(
    @GetUser('id') userId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentService.findByOrder(userId, orderId);
  }
}
