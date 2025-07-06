import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => value.trim())
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => value.trim())
  password: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsOptional()
  @IsNotEmpty()
  @ApiPropertyOptional()
  @Transform(({ value }) => value.trim())
  email?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiPropertyOptional()
  @Transform(({ value }) => value.trim())
  firstName?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiPropertyOptional()
  @Transform(({ value }) => value.trim())
  lastName?: string;
}
