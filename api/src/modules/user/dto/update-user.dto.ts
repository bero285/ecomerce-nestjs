// DTO

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class updateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsOptional()
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    nullable: true,
  })
  @IsOptional()
  firstName: string | null;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    nullable: true,
  })
  @IsOptional()
  lastName: string | null;
}
