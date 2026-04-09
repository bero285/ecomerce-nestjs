import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { Prisma } from '@prisma/client';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(readonly prisma: PrismaService) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const { name, slug, ...rest } = createCategoryDto;

    const categorySlug =
      slug ??
      name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');

    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (existingCategory) {
      throw new Error('Category Already Exists' + categorySlug);
    }

    const category = await this.prisma.category.create({
      data: {
        name,
        slug: categorySlug,
        ...rest,
      },
    });
    return this.formatCategory(category, 0);
  }

  private formatCategory(
    category: any,
    productCount: number,
  ): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      productCount,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async findAll(query: QueryCategoryDto): Promise<{
    data: CategoryResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { isActive, search, page, limit } = query;
    const where: Prisma.CategoryWhereInput = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        {
          name: { contains: search, mode: 'insensitive' },
        },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    const total = await this.prisma.category.count({ where });

    const categories = await this.prisma.category.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return {
      data: categories.map((category) =>
        this.formatCategory(category, category._count.products),
      ),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('category not found');
    }

    return this.formatCategory(category, Number(category._count.products));
  }

  async findBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { slug: slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('category not found');
    }

    return this.formatCategory(category, Number(category._count.products));
  }

  async update(
    id: string,
    UpdateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const categoryExists = await this.prisma.category.findUnique({
      where: { id: id },
    });
    if (!categoryExists) {
      throw new NotFoundException('category not found');
    }

    if (
      UpdateCategoryDto.slug &&
      UpdateCategoryDto.slug !== categoryExists.slug
    ) {
      const slugTaken = await this.prisma.category.findUnique({
        where: { slug: UpdateCategoryDto.slug },
      });
      if (slugTaken) {
        throw new ConflictException(
          `category with this slug already exists ${UpdateCategoryDto.slug}`,
        );
      }
    }

    const updateCategory = await this.prisma.category.update({
      where: { id },
      data: UpdateCategoryDto,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return this.formatCategory(
      updateCategory,
      Number(updateCategory._count.products),
    );
  }

  async remove(id: string): Promise<{ message: string }> {
    const categoryExists = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    if (!categoryExists) {
      throw new NotFoundException('category not found');
    }
    if (categoryExists._count.products > 0) {
      throw new BadRequestException(
        'category with products can not be deleted',
      );
    }
    const deleteCategory = await this.prisma.category.delete({
      where: {
        id,
      },
    });
    return { message: 'category deleted successfully' };
  }
}
