import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsOptional()
  @IsNotEmpty()
  @ApiPropertyOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiPropertyOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiPropertyOptional()
  lastName?: string;
}
