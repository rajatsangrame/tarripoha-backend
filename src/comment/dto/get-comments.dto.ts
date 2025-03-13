import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, IsNumber, Min } from 'class-validator';
import { ContentType } from '../../common/enum/content-type.enum';
import { PAGING_SIZE } from 'src/common/constants/postgres.constants';

export class GetCommentsDto {
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

  @IsInt({ message: 'contentId must be an integer' })
  @ApiProperty()
  contentId: number;

  @IsEnum(ContentType, {
    message: 'contentType must be a valid value',
  })
  @ApiProperty({
    enum: ContentType,
  })
  contentType: ContentType;

  @IsInt({ message: 'userId must be an integer' })
  @IsOptional()
  @ApiPropertyOptional()
  userId: number;
}
