import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt } from 'class-validator';
import { ContentType } from '../../common/enum/content-type.enum';

export class GetCommentsDto {
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
