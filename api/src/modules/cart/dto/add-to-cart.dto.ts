import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({
    description: 'product id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'quantity of product',
    example: 2,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity: number;
}
