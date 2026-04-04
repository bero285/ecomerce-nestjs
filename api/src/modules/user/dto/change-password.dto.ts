import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'new password',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'New password must not be empty' })
  currentPassword: string;

  @ApiProperty({
    description: 'new password',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'New password must not be empty' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    },
  )
  newPassword: string;
}
