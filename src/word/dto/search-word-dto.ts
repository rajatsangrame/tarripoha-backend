import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class SearchWordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => value.trim())
  query: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  languageId: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @ApiPropertyOptional({ default: 1 })
  pageNo: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @ApiPropertyOptional({ default: 10 })
  pageSize: number = 10;
}
