import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { OrdersService } from './orders.service';
import {
  ModerateThrottler,
  RelaxedThrottler,
} from 'src/common/decorators/custom-throttler.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderApiResponseDto,
  OrderResponseDto,
  PaginatedOrderResponseDto,
} from './dto/order-response.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post()
  @ModerateThrottler()
  @ApiOperation({
    summary: 'create order',
  })
  @ApiBody({
    type: CreateOrderDto,
  })
  @ApiCreatedResponse({
    description: 'order created successfully',
    type: OrderApiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data or insufficent stock',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests, please try again later',
  })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser('id') userId: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    return await this.orderService.create(userId, createOrderDto);
  }

  @Get('admin/all')
  @Roles(Role.ADMIN)
  @RelaxedThrottler()
  @ApiOperation({
    summary: '[ADMIN] get all orders (paginated)',
  })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'list of orders',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(OrderResponseDto) },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Admin role required',
  })
  async findAllForAdmin(@Query() queryOrderDto: QueryOrderDto): Promise<{
    data: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.orderService.findAllForAdmin(queryOrderDto);
  }

  @Get()
  @RelaxedThrottler()
  @ApiOperation({
    summary: 'get all orders for current user',
  })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiOkResponse({
    description: 'List of user orders',
    type: PaginatedOrderResponseDto,
  })
  async findAll(@Query() query: QueryOrderDto, @GetUser('id') userId: string) {
    return await this.orderService.findAll(userId, query);
  }

  // ADMIN: Get order by id

  @Get('admin/:id')
  @Roles(Role.ADMIN)
  @RelaxedThrottler()
  @ApiOperation({ summary: '[ADMIN]: get order by id' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiOkResponse({
    description: 'Order details',
    type: OrderApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  async findOneAdmin(
    @Param('id') id: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    return this.orderService.findOne(id);
  }

  @Get(':id')
  @RelaxedThrottler()
  @ApiOperation({
    summary: 'Get an order by id for current user',
  })
  @ApiParam({
    name: 'id',
    description: 'Order Id',
  })
  @ApiOkResponse({
    description: 'Order details',
    type: OrderApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.orderService.findOne(id, userId);
  }

  @Patch('admin/:id')
  @Roles(Role.ADMIN)
  @ModerateThrottler()
  @ApiOperation({
    summary: '[ADMIN]: update order status',
  })
  @ApiParam({
    name: 'id',
    description: 'Order id',
  })
  @ApiBody({
    type: UpdateOrderDto,
  })
  @ApiOkResponse({
    description: 'order updated successfully',
    type: OrderApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'order not found',
  })
  @ApiForbiddenResponse({
    description: 'Admin access required',
  })
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.orderService.update(id, updateOrderDto);
  }

  //user update own order
  @Patch(':id')
  @ModerateThrottler()
  @ApiOperation({ summary: 'update your own order' })
  @ApiParam({
    name: 'id',
    description: 'order id',
  })
  @ApiBody({
    type: UpdateOrderDto,
  })
  @ApiOkResponse({
    description: 'order updated successfully',
    type: OrderApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'order not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return await this.orderService.update(id, updateOrderDto, userId);
  }

  // admin cacel order
  @Delete('admin/:id')
  @Roles(Role.ADMIN)
  @ModerateThrottler()
  @ApiOperation({
    summary: 'delete order',
  })
  @ApiParam({
    name: 'id',
    description: 'order id',
  })
  @ApiOkResponse({
    description: 'order deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'order not found' })
  async cancelAdmin(@Param('id') id: string) {
    return await this.orderService.cancel(id);
  }

  // delete all orders
  @Delete('admin/:id')
  @Roles(Role.ADMIN)
  @ModerateThrottler()
  @ApiOperation({
    summary: 'delete order',
  })
  @ApiParam({
    name: 'id',
    description: 'order id',
  })
  @ApiOkResponse({
    description: 'order deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'order not found' })
  async cancelAll(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.orderService.cancel(id, userId);
  }
}
