import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from 'src/modules/products/dto/product-response.dto';

export class CartItemResponseDto {
  @ApiProperty({
    description: 'cart item id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'cart id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  cartId: string;

  @ApiProperty({
    description: 'product id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @ApiProperty({
    description: 'product details',
    type: ProductResponseDto,
  })
  product: ProductResponseDto;

  @ApiProperty({
    description: 'item amount',
    example: 1,
  })
  quantity: number;

  @ApiProperty({
    description: 'created at',
    example: '2022-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'updated at',
    example: '2022-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
