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
import { CategoryService } from './category.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'create new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.create(createCategoryDto);
  }

  // get all categories
  @Get()
  @ApiOperation({ summary: 'get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories fetched successfully.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/CategoryResponseDto' },
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
  async findAll(@Query() queryDto: QueryCategoryDto) {
    return this.categoryService.findAll(queryDto);
  }

  //get categor by id
  @Get(':id')
  @ApiOperation({
    summary: 'get category by id',
  })
  @ApiResponse({
    status: 200,
    description: 'Category fetched successfully.',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findById(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoryService.findOne(id);
  }

  // get category by slug
  @Get('slug/slug:id')
  @ApiOperation({
    summary: 'get category by slug',
  })
  @ApiResponse({
    status: 200,
    description: 'Category fetched successfully.',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findBySlug(@Param('slug') slug: string): Promise<CategoryResponseDto> {
    return this.categoryService.findBySlug(slug);
  }

  // update category
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'update category' })
  @ApiBody({
    type: UpdateCategoryDto,
  })
  @ApiResponse({
    status: 200,
    description: 'updated category',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Category does not exists',
  })
  @ApiResponse({
    status: 409,
    description: 'Category slug already exists',
  })
  async updateOne(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete('id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'delete category' })
  @ApiResponse({
    status: 400,
    description: 'category with products can not be deleted',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.categoryService.remove(id);
  }
}
