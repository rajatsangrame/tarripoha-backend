import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ContentType } from '../../common/enum/content-type.enum';
import { PAGING_SIZE } from 'src/common/constants/postgres.constants';

export class GetSavedWordDto {

  @IsNumber()
  @IsOptional()
  @Min(1)
  @ApiPropertyOptional({ default: 1 })
  pageNo?: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @ApiPropertyOptional({ default: PAGING_SIZE })
  pageSize?: number = PAGING_SIZE;
}
