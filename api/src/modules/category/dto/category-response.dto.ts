import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'the unique identifier of the category',
  })
  id: string;

  @ApiProperty({
    example: 'Electronics',
    description: 'the name of the category',
  })
  name: string;

  @ApiProperty({
    example: 'Devices and gadgets including phones,laptops and accessories ',
    description: 'the description of the category',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: 'electronics',
    description: 'the slug of the category',
    nullable: true,
  })
  slug: string | null;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'the image url of the category',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    example: true,
    description: 'the status of the category',
  })
  isActive: boolean;

  @ApiProperty({
    example: 150,
    description: 'the number of products in the category',
  })
  productCount: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'the date and time when the category was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'the date and time when the category was updated',
  })
  updatedAt: Date;
}
