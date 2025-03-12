import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class InsertWordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => value.trim())
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => value.trim())
  meaning: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => value.trim())
  englishMeaning: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  languageId: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Transform(({ value }) => value.trim())
  description?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Transform(({ value }) => value.trim())
  tags?: string;
}
