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
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { ModerateThrottler } from 'src/common/decorators/custom-throttler.decorator';
import { CartResponseDto } from './dto/cart-response.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';

@ApiTags('cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ModerateThrottler()
  @ApiOperation({
    summary: 'get user cart',
  })
  @ApiResponse({
    status: 200,
    description: 'User cart with items',
    type: CartResponseDto,
  })
  async getCart(@GetUser('id') userId: string): Promise<CartResponseDto> {
    return await this.cartService.getOrCreateCart(userId);
  }

  @Post('items')
  @ModerateThrottler()
  @ApiOperation({
    summary: 'add item to cart',
  })
  @ApiOkResponse({
    type: AddToCartDto,
  })
  async AddToCartDto(
    @GetUser('id') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(userId, addToCartDto);
  }

  // update items by id
  @Patch('items/:id')
  @ModerateThrottler()
  @ApiOperation({
    summary: 'update cartitem',
  })
  @ApiBody({
    type: UpdateCartItemDto,
  })
  @ApiResponse({
    status: 200,
    description: 'item updated succesfully',
  })
  @ApiResponse({
    status: 400,
    description: 'inssufficent stock',
  })
  @ApiResponse({
    status: 200,
    description: 'cart item not found',
  })
  async updateItem(
    @GetUser('id') userId: string,
    @Param('id') cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(
      userId,
      cartItemId,
      updateCartItemDto,
    );
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'delete cartItem from cart',
  })
  @ApiResponse({
    status: 200,
    description: 'cartItem deleted successfully',
    type: CartResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'cartItem not found',
  })
  async removeFromCart(
    @GetUser('id') userId: string,
    @Param('id') cartItemId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeFromCart(userId, cartItemId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'clear cart',
  })
  @ApiResponse({
    status: 200,
    description: 'cart cleared succesfully',
    type: CartResponseDto,
  })
  async clearCart(@GetUser('id') userId: string): Promise<CartResponseDto> {
    return this.cartService.clearCart(userId);
  }

  @Post('merge')
  @ApiOperation({
    summary: 'merge guest cart to user cart',
  })
  @ApiBody({
    type: MergeCartDto,
  })
  @ApiResponse({
    status: 200,
    description: 'carts merged succesfully',
    type: CartResponseDto,
  })
  async mergeCart(
    @GetUser('id') userId: string,
    @Body() mergeCartDto: MergeCartDto,
  ) {
    return this.cartService.mergeCart(userId, mergeCartDto.items);
  }
}
