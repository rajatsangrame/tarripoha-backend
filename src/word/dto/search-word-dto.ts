import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { PAGING_SIZE } from 'src/common/constants/postgres.constants';

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
  @ApiPropertyOptional({ default: PAGING_SIZE })
  pageSize: number = PAGING_SIZE;
}
