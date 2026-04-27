import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

class CartItemDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class MergeCartDto {
  @ApiProperty({ type: [CartItemDto] })
  @IsArray()
  items: CartItemDto[];
}
