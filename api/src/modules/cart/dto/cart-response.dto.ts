import { ApiProperty } from '@nestjs/swagger';
import { CartItemResponseDto } from './cart-item-response.dto';

export class CartResponseDto {
  @ApiProperty({
    description: 'cart id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'user id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'cart items',
    type: [CartItemResponseDto],
  })
  cartItems: CartItemResponseDto[];

  @ApiProperty({
    description: 'total price',
    example: 299.97,
  })
  totalPrice: number;

  @ApiProperty({
    description: 'total items quantity',
    example: 1,
  })
  totalItems: number;

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
