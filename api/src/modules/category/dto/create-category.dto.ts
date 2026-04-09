import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Electronics',
    description: 'the name of the category',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Devices and gadgets including phones,laptops and accessories ',
    description: 'the description of the category',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: 'electronics ',
    description: 'the slug of the category',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  slug?: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'the image url of the category',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  imageUrl?: string;

  @ApiProperty({
    example: true,
    description: 'the status of the category',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
