import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'create new products',
  })
  @ApiBody({
    type: CreateProductDto,
  })
  @ApiResponse({
    status: 201,
    description: 'product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'product already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'get all products',
  })
  @ApiResponse({
    status: 200,
    description: 'products fetched successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  async findAll(@Query() queryDto: QueryProductDto): Promise<{
    data: ProductResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPage: number;
    };
  }> {
    return this.productsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse({
    status: 200,
    description: 'product fetched successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'product not found',
  })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'update product' })
  @ApiBody({
    type: UpdateProductDto,
  })
  @ApiResponse({
    status: 200,
    description: 'product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'product sku already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'update product stock' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description: 'stock adjustment',
          example: 10,
        },
      },
      required: ['quantity'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'product stock updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'incuficent stock',
  })
  @ApiResponse({
    status: 404,
    description: 'product not found',
  })
  async updateStock(
    @Param() id: string,
    @Body() quantity: number,
  ): Promise<ProductResponseDto> {
    return this.productsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'delete product' })
  @ApiResponse({
    status: 200,
    description: 'product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'product not found',
  })
  @ApiResponse({
    status: 400,
    description: 'can not delete product in active orders',
  })
  async deletee(@Param() id: string): Promise<{ message: string }> {
    return this.productsService.remove(id);
  }
}
