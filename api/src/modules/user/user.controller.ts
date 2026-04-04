import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { updateUserDto } from './dto/update-user.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({
    description: 'Get user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'the current user profile',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProfile(@Req() req: RequestWithUser): Promise<UserResponseDto> {
    return await this.userService.findOne(req.user.id);
  }

  // get all user for admin
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    description: 'Get all users',
  })
  @ApiResponse({
    status: 200,
    description: 'the list of all users',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(): Promise<UserResponseDto[]> {
    return await this.userService.findAll();
  }

  // get all user for admin
  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    description: 'Get user by id',
  })
  @ApiResponse({
    status: 200,
    description: 'the user by id',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.userService.findOne(id);
  }

  // get all user for admin
  @Patch('me')
  @ApiOperation({
    description: 'update user profile',
  })
  @ApiBody({
    type: updateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'updated user profile',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already in use',
  })
  async updateProfile(
    userId: string,
    @Body() updatedUserDto: updateUserDto,
  ): Promise<UserResponseDto> {
    return await this.userService.update(userId, updatedUserDto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'update user password',
  })
  @ApiResponse({
    status: 200,
    description: 'updated user password',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async changePassword(
    @GetUser('id') userId: string,
    @Body() ChangePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return await this.userService.changePassword(userId, ChangePasswordDto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'delete account',
  })
  @ApiResponse({
    status: 200,
    description: 'deleted account',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async deleteAccount(
    @GetUser('id') userId: string,
  ): Promise<{ message: string }> {
    return await this.userService.remove(userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'delete user by id',
  })
  @ApiResponse({
    status: 200,
    description: 'user with specific id was deleted',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async deleteUserById(@Param('id') id: string): Promise<{ message: string }> {
    return await this.userService.remove(id);
  }
}
