import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt } from 'class-validator';
import { ContentType } from '../../common/enum/content-type.enum';

export class GetSavedDto {
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
