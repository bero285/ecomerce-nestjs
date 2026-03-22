import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class loginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john@gmail.clom',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Strong@123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
