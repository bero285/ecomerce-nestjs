import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class OrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: '46545646sds-4584s68sd-4654684sd',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantity',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    example: 99.99,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'price must be a valid number' },
  )
  @Type(() => Number)
  @IsNotEmpty()
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shippingAddress: string;
}
