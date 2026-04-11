import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { Category, Prisma, Product } from '@prisma/client';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const exists = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });
    if (exists) {
      throw new ConflictException(
        `Product with this sku - ${createProductDto.sku} - already exists`,
      );
    }

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        price: new Prisma.Decimal(createProductDto.price),
      },
      include: {
        category: true,
      },
    });

    return this.formatProduct(product);
  }

  async findAll(queryDto: QueryProductDto): Promise<{
    data: ProductResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPage: number;
    };
  }> {
    const { category, isActive, search, page = 1, limit = 10 } = queryDto;
    const where: Prisma.ProductWhereInput = {};
    if (category) {
      where.categoryId = category;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.product.count({ where });

    const products = await this.prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    return {
      data: products.map((item) => {
        return this.formatProduct(item);
      }),
      meta: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException('product not found');
    }
    return this.formatProduct(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const exists = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!exists) throw new NotFoundException('product not found');

    if (updateProductDto.sku && updateProductDto.sku !== exists.sku) {
      const skuTaken = await this.prisma.product.findUnique({
        where: { sku: updateProductDto.sku },
      });
      if (skuTaken) {
        throw new ConflictException(
          `product sku ${updateProductDto.sku} already taken`,
        );
      }
    }

    const updatedData: any = { ...updateProductDto };
    if (updateProductDto.price !== undefined) {
      updatedData.price = new Prisma.Decimal(updateProductDto.price);
    }

    const updateProduct = await this.prisma.product.update({
      where: { id },
      data: updatedData,
      include: { category: true },
    });

    return this.formatProduct(updateProduct);
  }

  async updateStock(id: string, quantity: number): Promise<ProductResponseDto> {
    const exists = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException('product not found');
    const newStock = exists.stock + quantity;
    if (newStock < 0) {
      throw new BadRequestException('insufficient stock');
    }

    const updateStock = await this.prisma.product.update({
      where: { id },
      data: { stock: newStock },
      include: { category: true },
    });
    return this.formatProduct(updateStock);
  }

  async remove(id: string): Promise<{ message: string }> {
    const exists = await this.prisma.product.findUnique({
      where: { id },
      include: { orderItems: true, cartItems: true },
    });
    if (!exists) throw new NotFoundException('product not found');

    if (exists.orderItems.length > 0) {
      throw new BadRequestException('can not delete product in active orders');
    }

    if (exists.cartItems.length > 0) {
      throw new BadRequestException('can not delete product in active cart');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'product deleted succesfully' };
  }

  private formatProduct(
    product: Product & { category: Category },
  ): ProductResponseDto {
    return {
      ...product,
      price: Number(product.price),
      category: product.category.name,
    };
  }
}
