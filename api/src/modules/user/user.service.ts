import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';
import { updateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;
  constructor(private prisma: PrismaService) {}
  async findOne(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,

        password: false,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(): Promise<UserResponseDto[]> {
    const allUsers = await this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
      orderBy: { createdAt: 'desc' },
    });
    return allUsers;
  }
  async update(
    userId: string,
    updateUserDto: updateUserDto,
  ): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existingUser) throw new NotFoundException('User not found');

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailTaken) throw new NotFoundException('Email already in use');
    }

    const updateUser = await this.prisma.user.update({
      where: { email: updateUserDto.email },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,

        password: false,
      },
    });

    return updateUser;
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) throw new NotFoundException('user not found');

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      existingUser?.password,
    );

    if (!isPasswordValid) throw new NotFoundException('Invalid password');
    const isSamePassword = await bcrypt.compare(currentPassword, newPassword);
    if (isSamePassword)
      throw new NotFoundException(
        'new password must be different from current password',
      );

    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'password changed sccesfully' };
  }

  async remove(userId: string): Promise<{ message: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) throw new NotFoundException('user not found');
    await this.prisma.user.delete({
      where: { id: userId },
    });
    return { message: 'account deleted successfully' };
  }
}
